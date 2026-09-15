/**
 * lib/content.ts 行为级测试
 *
 * 覆盖 churn 最高的内容解析路径：frontmatter 校验/归一化、
 * TOC 提取（围栏跳过、行内语法剥离、深度过滤）、标签聚合与排序。
 *
 * 读取的是 **`test/fixtures/blog/` 下的夹具**，不是 `content/blog/` 的发布内容
 * （目录由 vitest.config.ts 通过 BLOG_CONTENT_DIR 注入）。因此删改演示文章
 * 不会影响本文件 —— 这是刻意的：CI 里 test 跑在 build 之前，测试若依赖
 * 演示内容，forker 删掉示例文章就会让整个部署失败。
 */
import { describe, expect, it } from "vitest";
import {
  getAllPosts,
  enhanceRawImages,
  extractToc,
  getAllTags,
  getPostBySlug,
  getPostsByTag,
} from "@/lib/content";

/** 夹具目录下的三篇文章，按发布日期降序 */
const EXPECTED_SLUGS = ["alpha", "gamma", "beta"];

describe("getPostBySlug — frontmatter 解析与归一化", () => {
  it("解析标题、日期归一化为 ISO 日期、标签与分类透传", async () => {
    const post = await getPostBySlug("alpha");
    expect(post).not.toBeNull();
    expect(post!.title).toBe("夹具文章 Alpha");
    expect(post!.pubDate).toBe("2026-03-02");
    expect(post!.tags).toEqual(["Alpha", "公共"]);
    expect(post!.category).toBe("技术");
  });

  it("产出正数阅读时间与字数，且 content 已剥离 frontmatter", async () => {
    const post = await getPostBySlug("alpha");
    expect(post!.readingTime).toBeGreaterThan(0);
    expect(post!.wordCount).toBeGreaterThan(0);
    expect(post!.content).not.toContain('title: "夹具文章 Alpha"');
  });

  it("对不存在的 slug 返回 null 而非抛错", async () => {
    await expect(getPostBySlug("no-such-post")).resolves.toBeNull();
  });
});

describe("TOC 提取（extractToc 行为，经 getPostBySlug 观测）", () => {
  it("提取二级/三级标题", async () => {
    const post = await getPostBySlug("beta");
    const toc = post!.toc;
    expect(toc.length).toBeGreaterThan(0);

    const h2 = toc.find((t) => t.text === "一、二级标题");
    expect(h2).toBeDefined();
    expect(h2!.level).toBe(2);

    const h3 = toc.find((t) => t.text === "1.1 三级标题");
    expect(h3).toBeDefined();
    expect(h3!.level).toBe(3);
  });

  it("未声明 tocDepth 时默认取 2，四级标题不进目录", async () => {
    const post = await getPostBySlug("beta");
    expect(post!.toc.every((t) => t.level <= 3)).toBe(true);
    expect(post!.toc.find((t) => t.text.includes("四级标题"))).toBeUndefined();
  });

  it("声明 tocDepth: 3 时四级标题进目录", async () => {
    const post = await getPostBySlug("alpha");
    const h4 = post!.toc.find((t) => t.level === 4);
    expect(h4).toBeDefined();
    expect(h4!.text).toContain("四级标题");
  });

  it("代码围栏内的 # 注释不被当作标题", async () => {
    const post = await getPostBySlug("alpha");
    // bash 围栏内含 `# 围栏里的假标题不该进目录`
    expect(post!.toc.find((t) => t.text.includes("假标题"))).toBeUndefined();
  });

  it("每个 TOC 条目都带有非空锚点 id", async () => {
    const post = await getPostBySlug("alpha");
    for (const item of post!.toc) {
      expect(item.id.length).toBeGreaterThan(0);
    }
  });
});

describe("数据聚合 — 列表、标签与排序", () => {
  it("getAllPosts 按发布日期降序返回全部夹具文章", async () => {
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(EXPECTED_SLUGS);
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1].pubDate).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i].pubDate).getTime()
      );
    }
  });

  it("getAllTags 聚合标签计数并按数量降序", async () => {
    const tags = await getAllTags();
    // alpha 与 beta 都带「公共」→ 2；alpha 与 gamma 都带「Alpha」→ 2
    expect(tags.find((t) => t.tag === "公共")!.count).toBe(2);
    expect(tags.find((t) => t.tag === "Beta")!.count).toBe(1);
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1].count).toBeGreaterThanOrEqual(tags[i].count);
    }
  });

  it("getPostsByTag 大小写不敏感地匹配标签", async () => {
    const posts = await getPostsByTag("alpha");
    expect(posts.map((p) => p.slug).sort()).toEqual(["alpha", "gamma"]);
    await expect(getPostsByTag("不存在的标签")).resolves.toEqual([]);
  });
});

describe("enhanceRawImages — 给手写 <img> 补懒加载与尺寸", () => {
  const sizes = { "/a.webp": { width: 1080, height: 1085 } };

  it("补上 loading / decoding，并在有尺寸时补 width/height", () => {
    const out = enhanceRawImages('<img src="/a.webp" alt="x" />', sizes);
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('decoding="async"');
    expect(out).toContain('width="1080"');
    expect(out).toContain('height="1085"');
  });

  it("作者显式写的属性不被覆盖", () => {
    const out = enhanceRawImages(
      '<img src="/a.webp" loading="eager" decoding="sync" width="10" height="20" />',
      sizes,
    );
    expect(out).toContain('loading="eager"');
    expect(out).toContain('decoding="sync"');
    expect(out).toContain('width="10"');
    expect(out).not.toContain('width="1080"');
  });

  it("尺寸表里没有的图（外部图 / 路径不符）只补懒加载，不编造尺寸", () => {
    const out = enhanceRawImages('<img src="https://cdn.example.com/b.png" />', sizes);
    expect(out).toContain('loading="lazy"');
    expect(out).not.toContain("width=");
    // 外部 URL 不该被 basePath 前缀污染
    expect(out).toContain('src="https://cdn.example.com/b.png"');
  });

  it("src 被 URL 编码时也能查到尺寸", () => {
    const out = enhanceRawImages('<img src="/%E7%A4%BA%E4%BE%8B.webp" />', {
      "/示例.webp": { width: 800, height: 500 },
    });
    expect(out).toContain('width="800"');
  });

  it("非 img 的 HTML 与其他内容原样保留", () => {
    const src = '<div class="x">文字</div>\n\n<p>段落</p>';
    expect(enhanceRawImages(src, sizes)).toBe(src);
  });
});

describe("extractToc — 行尾兼容（CRLF 回归护栏）", () => {
  // 仓库声明了 .gitattributes（* text=auto eol=lf），但若文件在别处被转成 CRLF，
  // 只按 "\n" 切分会让每行残留结尾 \r；而 JS 的 `.` 不匹配行终止符，
  // /^(#{1,6})\s+(.+)$/ 于是整体失配、目录静默变空（正文仍正常渲染）。
  const src = "## 一、标题\r\n\n正文\n\n### 子标题\n\n## 二、标题二\n\n```bash\n# 围栏里的假标题\r\n```\n";

  it("CRLF 内容仍能提取目录，且围栏内的假标题被跳过", () => {
    const toc = extractToc(src, 1);
    expect(toc.map((t) => t.text)).toEqual(["一、标题", "二、标题二"]);
  });

  it("LF 与 CRLF 得到完全一致的结果", () => {
    expect(extractToc(src.replace(/\r\n/g, "\n"), 1)).toEqual(extractToc(src, 1));
  });

  it("tocDepth 仍按层级过滤（3 时才收 ###）", () => {
    expect(extractToc(src, 3).map((t) => t.level)).toContain(3);
    expect(extractToc(src, 1).map((t) => t.level)).not.toContain(3);
  });
});
