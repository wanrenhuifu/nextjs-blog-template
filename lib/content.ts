import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import sharp from "sharp";
import { calculateReadingTime } from "@/lib/readingTime";
import { postFrontmatterSchema } from "@/lib/schemas";
import { POST_CATEGORIES, type PostCategory } from "@/lib/constants";
import { publicUrl } from "@/lib/site";
import type { ImageSizeMap, Post, PostMeta, TocItem } from "@/lib/types";

export type { Post, PostMeta, TocItem };

/**
 * 文章根目录。
 *
 * 默认是 `content/blog`；测试通过 `BLOG_CONTENT_DIR` 指向 `test/fixtures/blog/`。
 *
 * 为什么要留这个口子：测试若直接读 `content/`，就会依赖**随仓库发布的演示文章** ——
 * forker 删掉示例写自己的第一篇，`npm test` 立刻失败；而 CI 里 test 跑在 build 之前，
 * 整个部署会被卡住。夹具与演示内容分离后，两边可以各自演进。
 */
const CONTENT_DIR = process.env.BLOG_CONTENT_DIR
  ? path.resolve(process.env.BLOG_CONTENT_DIR)
  : path.join(process.cwd(), "content", "blog");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** 匹配 markdown 图片与原始 <img> 标签，取到 src */
const IMAGE_SRC_RE = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)|<img\b[^>]*?\bsrc=["']([^"']+)["']/gi;

/**
 * 已报告过的缺失图片，用于抑制同一进程内的重复告警。
 *
 * 说明：Next 的静态生成会开多个 worker 进程，各自持有独立的模块实例，所以同一处
 * 缺失在一次构建里仍可能打印 2–4 条（实测 4+ → 3）。跨进程去重要写临时文件做协调，
 * 为一条警告引入竞争条件与清理负担不划算，故到此为止。
 */
const reportedMissingImages = new Set<string>();

/** 安全 decode：src 里可能有孤立 % 号，失败时原样返回 */
function safeDecode(src: string): string {
  try {
    return decodeURIComponent(src);
  } catch {
    return src;
  }
}

/** 按 src 查尺寸，两种编码形态都试（MDX 会把 src 做 URL 编码） */
function sizeOf(src: string, sizes: ImageSizeMap) {
  return sizes[src] ?? sizes[safeDecode(src)];
}

/**
 * 给**手写的** `<img>` 标签补上懒加载、尺寸属性与 basePath 前缀。
 *
 * 为什么不能交给 MDX 的 components 映射表：MDX 只把 Markdown 语法生成的元素
 * 交给映射表，小写 HTML 标签（`<img>`）原样透传、不参与组件解析。所以这一路
 * 只能在构建期对内容字符串做注入。
 *
 * 已有同名属性的不覆盖 —— 作者显式写的优先（src 除外：它是根绝对路径，
 * 必须补前缀，见 lib/site.ts 的 publicUrl）。
 */
export function enhanceRawImages(content: string, sizes: ImageSizeMap): string {
  return content.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
    const src = srcMatch?.[1];
    // 尺寸表的键是**未加前缀**的原始 src（collectImageSizes 记录的就是原文），
    // 所以查表用 src，补前缀只作用于输出的标签
    const size = src ? sizeOf(src, sizes) : undefined;

    let out = tag;
    if (srcMatch) {
      const resolved = publicUrl(srcMatch[1]);
      if (resolved !== srcMatch[1]) {
        out = out.replace(srcMatch[0], `src="${resolved}"`);
      }
    }
    if (!/\bloading=/i.test(out)) out = out.replace(/^<img/i, `<img loading="lazy"`);
    if (!/\bdecoding=/i.test(out)) out = out.replace(/^<img/i, `<img decoding="async"`);
    if (size && !/\bwidth=/i.test(out)) {
      out = out.replace(
        /^<img/i,
        `<img width="${size.width}" height="${size.height}"`,
      );
    }
    return out;
  });
}

/**
 * 构建期读取文章内所有本地图片的原始尺寸，供渲染时注入 width/height。
 *
 * 为什么要读真实尺寸：正文图片是懒加载的（见 MdxContent），而懒加载**必须**配合
 * 尺寸预留 —— 否则图片恰好在即将进入视野时才开始下载，读者会正好看到下方内容
 * 往下跳一大截。有了宽高，浏览器在图片到达前就按原始比例占好位，位移为 0。
 *
 * 目录约定：图片放 `public/blog/<slug>/`（见 public/AGENTS.md）。尺寸从
 * `public/` 下读，因为那才是静态导出真正服务的位置。
 *
 * **缺失的图片会打印警告**：约定要求手工把文件放对位置，静默产出坏图是最糟的
 * 失败方式。这里只警告不抛错，避免一篇新文章写错路径就阻断整次构建。
 */
export async function collectImageSizes(
  content: string,
  slug: string,
): Promise<ImageSizeMap> {
  const srcs = new Set<string>();
  // 先剔除代码围栏：讲 Markdown / MDX 语法的文章里会出现 ![alt](/img.png) 这类
  // 代码示例，那不是真实引用，不该触发缺失警告（规则与 extractToc 一致）。
  for (const m of stripFencedLines(content).matchAll(IMAGE_SRC_RE)) {
    const src = m[1] ?? m[2];
    if (src?.startsWith("/")) {
      srcs.add(src);
      srcs.add(safeDecode(src));
    }
  }

  const sizes: ImageSizeMap = {};
  await Promise.all(
    [...srcs].map(async (src) => {
      try {
        const meta = await sharp(path.join(PUBLIC_DIR, src)).metadata();
        if (meta.width && meta.height) {
          sizes[src] = { width: meta.width, height: meta.height };
        }
      } catch {
        const key = `${slug}\u0000${src}`;
        if (!reportedMissingImages.has(key)) {
          reportedMissingImages.add(key);
          console.warn(
            `[content] 图片缺失：public${src}（文章「${slug}」引用，约定见 public/AGENTS.md 的「文章配图」）`,
          );
        }
      }
    }),
  );
  return sizes;
}

/**
 * 将 markdown 行内语法近似还原为渲染后的纯文本，供 slugger 生成锚点 id。
 * rehypeSlug 基于标题**渲染后的 textContent** 生成 id（链接 / 图片 / HTML 标签
 * / 行内代码 / 强调都会折叠成可见文字），这里对齐同一规则，
 * 避免「原始 md 语法串进 slug」导致 TOC 锚点与正文 id 失配（死链）。
 * 顺序：先图（![]()）后链（[]()），再剥 HTML 标签、行内代码与强调标记。
 */
function stripMarkdownInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 图片 → 替代文字
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接 → 链接文字
    .replace(/<[^>]+>/g, "") // HTML 标签（行内代码、字体、换行等）
    .replace(/`([^`]*)`/g, "$1") // 行内代码 → 内容
    .replace(/[*_~]/g, "") // 强调 / 斜体 / 删除线标记
    .trim();
}

/**
 * 剔除代码围栏覆盖的行（含围栏标记行自身），其余行原样保留。
 *
 * 围栏需记录开栏字符 —— ``` 与 ~~~ 各自独立开合，避免围栏内出现另一字符时
 * 误切换状态。`extractToc` 与图片扫描共用这一规则，抽出来免得两处各自演化。
 * 被剔除的行替换为空行而非删除，保持行号不变。
 *
 * **必须按 /\r?\n/ 切分，不能只按 "\n"**：仓库 core.autocrlf=true 且没有
 * .gitattributes，Windows 上重新检出会把 content/ 下的文章转成 CRLF。若只按 "\n"
 * 切分，每行会残留一个结尾 \r —— 而 JS 里 `.` 不匹配行终止符、`\r` 正是行终止符，
 * 于是 /^(#{1,6})\s+(.+)$/ 整体匹配失败，**目录会静默变空**（正文照常渲染，
 * 只有目录没了，极难察觉）。这里顺带把行尾归一为 \n 交给下游。
 */
function stripFencedLines(content: string): string {
  const out: string[] = [];
  let inFence = false;
  let fenceChar = "";

  for (const line of content.split(/\r?\n/)) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const char = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = char;
      } else if (char === fenceChar) {
        inFence = false;
        fenceChar = "";
      }
      out.push("");
      continue;
    }
    out.push(inFence ? "" : line);
  }

  return out.join("\n");
}

/**
 * 提取文章目录。
 * tocDepth 控制目录展开的层级深度（以 `##` 为第 1 级）：
 * 1 = 仅 `##`，2 = `##` + `###`（默认），3 = `##` + `###` + `####`。
 *
 * 注意：为与 rehypeSlug 的锚点编号保持一致，需按文档顺序对**所有层级**
 * 标题调用 slug()（rehypeSlug 覆盖 h1–h6），再按深度筛选；
 * 标题文本先经 stripMarkdownInline 还原为渲染后文字，再交给 slugger。
 * 代码围栏内的 `#` 注释不是标题，由 stripFencedLines 剔除。
 */
export function extractToc(content: string, tocDepth: 1 | 2 | 3 = 2): TocItem[] {
  const maxLevel = tocDepth + 1;
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  for (const line of stripFencedLines(content).split("\n")) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = stripMarkdownInline(match[2].trim());
    const id = slugger.slug(text);
    if (level < 2 || level > maxLevel) continue;
    toc.push({ id, text, level });
  }

  return toc;
}

function normalizeDate(raw: string | Date | undefined): string {
  if (!raw) return "1970-01-01";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  return isNaN(d.getTime()) ? "1970-01-01" : d.toISOString().split("T")[0];
}

function parseFrontmatter(data: Record<string, unknown>, slug: string) {
  const result = postFrontmatterSchema.safeParse(data);
  if (!result.success) {
    // 带上 slug：先前只打印校验细节，一篇文章被剔除时看不出是哪一篇
    console.error(
      `[content] frontmatter 校验失败，该文章已被跳过：${slug}`,
      result.error.flatten(),
    );
    return null;
  }
  return result.data;
}

/**
 * 读取文章源文件。
 *
 * 两种失败必须分开处理，否则会得到一个极难排查的现象（曾经就是这样）：
 * - **文件不存在**（ENOENT）→ 静默试下一个扩展名，这是正常控制流；
 * - **frontmatter 的 YAML 语法错误** → gray-matter 会抛异常。以前这里一个裸
 *   `catch {}` 把它和「文件不存在」一起吞掉，文章于是**无声无息地从站点上消失**：
 *   没有日志、没有警告，列表里只是少了一篇，往往只有作者本人会察觉。
 *
 * 现在 YAML 错误会打印带文件路径与原始报错的明确日志，然后跳过该文章 ——
 * 跳过而非中断构建，与「frontmatter 校验失败」的既有处理保持一致（见
 * data/AGENTS.md 的「缺失或损坏文件的后果」一节：内容问题一律降级 + 大声报错）。
 */
async function readPostFile(
  slug: string
): Promise<{ data: Record<string, unknown>; content: string } | null> {
  const dir = path.join(CONTENT_DIR, slug);

  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(dir, `index${ext}`);

    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      // 权限、占用等：不是「换一个扩展名就能解决」的问题，要说出来
      console.error(`[content] 读取失败：${filePath}`, error);
      continue;
    }

    try {
      const { data, content } = matter(raw);
      return { data, content };
    } catch (error) {
      console.error(
        `[content] frontmatter 解析失败，该文章已被跳过：${filePath}\n` +
          `          ${(error as Error).message}\n` +
          `          常见原因：引号未闭合、缩进有误、值里含未转义的冒号或 #。`,
      );
      return null;
    }
  }

  return null;
}

async function getPostMetaBySlug(slug: string): Promise<PostMeta | null> {
  const file = await readPostFile(slug);
  if (!file) return null;

  const frontmatter = parseFrontmatter(file.data, slug);
  if (!frontmatter) return null;

  return {
    slug,
    title: frontmatter.title || slug,
    pubDate: normalizeDate(frontmatter.pubDate),
    updatedDate: frontmatter.updatedDate
      ? normalizeDate(frontmatter.updatedDate)
      : undefined,
    description: frontmatter.description,
    tags: frontmatter.tags ?? [],
    category: frontmatter.category,
    wordCount: file.content.length,
    readingTime: calculateReadingTime(file.content),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = await readPostFile(slug);
  if (!file) return null;

  const frontmatter = parseFrontmatter(file.data, slug);
  if (!frontmatter) return null;

  const meta: PostMeta = {
    slug,
    title: frontmatter.title || slug,
    pubDate: normalizeDate(frontmatter.pubDate),
    updatedDate: frontmatter.updatedDate
      ? normalizeDate(frontmatter.updatedDate)
      : undefined,
    description: frontmatter.description,
    tags: frontmatter.tags ?? [],
    category: frontmatter.category,
    wordCount: file.content.length,
    readingTime: calculateReadingTime(file.content),
  };

  // 处理文章内的相对图片路径 ./xxx -> /blog/{slug}/xxx
  const relativeFixed = file.content.replace(
    /!\[([^\]]*)\]\(\.\/([^)]+)\)/g,
    `![$1](/blog/${slug}/$2)`
  );

  // 尺寸基于路径修正后的内容收集，确保 key 与渲染时的 src 对得上
  const imageSizes = await collectImageSizes(relativeFixed, slug);
  // 手写的 <img> 不走 MDX 的 components 映射表，只能在这里补属性
  const processedContent = enhanceRawImages(relativeFixed, imageSizes);

  const toc = extractToc(file.content, frontmatter.tocDepth ?? 2);

  return {
    ...meta,
    content: processedContent,
    imageSizes,
    toc,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const posts = await Promise.all(
      entries
        .filter((e) => e.isDirectory())
        .map((e) => getPostBySlug(e.name))
    );
    return posts
      .filter((p): p is Post => p !== null)
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
  } catch (error) {
    console.error("[content] 读取文章目录失败:", error);
    return [];
  }
}

export async function getAllPostMeta(): Promise<PostMeta[]> {
  try {
    const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
    const metas = await Promise.all(
      entries
        .filter((e) => e.isDirectory())
        .map(async (e) => getPostMetaBySlug(e.name))
    );
    return metas
      .filter((m): m is PostMeta => m !== null)
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
  } catch (error) {
    console.error("[content] 读取文章目录失败:", error);
    return [];
  }
}

export async function getAllTags(): Promise<
  { tag: string; count: number }[]
> {
  const posts = await getAllPostMeta();
  const tagMap = new Map<string, number>();

  for (const post of posts) {
    for (const tag of new Set(post.tags)) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await getAllPostMeta();
  const normalizedTag = tag.toLowerCase();
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === normalizedTag)
  );
}

export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: PostMeta | null; next: PostMeta | null }> {
  const posts = await getAllPostMeta();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: posts[index + 1] || null,
    next: posts[index - 1] || null,
  };
}

/**
 * 按类型（category）分组文章。
 * 返回顺序固定为 POST_CATEGORIES 的声明顺序，仅包含有文章的类型；
 * 空类型不出现在结果中，消费方可用 POST_CATEGORIES 求差集得到「待更新」列表。
 */
export async function getPostsGroupedByCategory(): Promise<
  { category: PostCategory; posts: PostMeta[] }[]
> {
  const posts = await getAllPostMeta();
  return POST_CATEGORIES.map((category) => ({
    category,
    posts: posts.filter((post) => post.category === category),
  })).filter((group) => group.posts.length > 0);
}

export async function getPostsGroupedByYear(): Promise<
  { year: number; posts: PostMeta[] }[]
> {
  const posts = await getAllPostMeta();
  const yearMap = new Map<number, PostMeta[]>();

  for (const post of posts) {
    const year = new Date(post.pubDate).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)!.push(post);
  }

  return Array.from(yearMap.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year);
}
