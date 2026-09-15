/**
 * 构建时生成文章搜索索引
 * 扫描 content/blog/ 目录，提取轻量元数据输出到 public/search-index.json
 *
 * 容错原则（与 lib/content.ts 的读取路径保持一致）：
 * **单篇文章的问题只跳过那一篇，不阻断构建。** 这里的 try/catch 不是摆设 ——
 * gray-matter 遇到 frontmatter 语法错误会抛异常，而本脚本处于 `npm run build`
 * 与 `npm run build:verify` 的第一环，不接住它就会让一次内容笔误变成整个构建失败。
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import "./load-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content", "blog");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "search-index.json");

/**
 * 安全日期归一化。
 *
 * 不能直接 `new Date(x).toISOString()`：无法解析的日期会得到 Invalid Date，
 * 而 `toISOString()` 对它会抛 `RangeError: Invalid time value` —— 又一个
 * 「一篇内容笔误炸掉整个构建」的来源（例如 pubDate 写成 2026-13-45）。
 * 解析失败时返回空串，与下方「空日期排最后」的排序约定一致。
 */
function safeDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

async function main() {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const index = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    let filePath = null;

    for (const ext of [".mdx", ".md"]) {
      const p = path.join(CONTENT_DIR, slug, `index${ext}`);
      try {
        await fs.access(p);
        filePath = p;
        break;
      } catch {
        // not found
      }
    }

    if (!filePath) continue;

    let raw;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.error(`[search-index] 读取失败，已跳过该文章：${filePath}\n          ${error.message}`);
      continue;
    }

    let data;
    try {
      ({ data } = matter(raw));
    } catch (error) {
      console.error(
        `[search-index] frontmatter 解析失败，该文章未进入搜索索引：${filePath}\n` +
          `          ${error.message}\n` +
          `          常见原因：引号未闭合、缩进有误、值里含未转义的冒号或 #。\n` +
          `          （页面渲染会再报一次同样的错；两处都报告是为了让你不必猜是哪一篇。）`,
      );
      continue;
    }

    index.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      pubDate: safeDate(data.pubDate),
      tags: Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === "string") : [],
    });
  }

  // 按日期降序（空日期排最后）
  index.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2), "utf-8");

  console.log(`✓ Search index generated: ${index.length} posts → public/search-index.json`);
}

main().catch((err) => {
  // 能走到这里的只剩「基础设施级」失败，最典型的是 content/blog 目录不存在。
  // 这一类**应该**大声失败：继续往下走只会产出一个空索引，让搜索静默失效。
  console.error(
    "[search-index] 生成失败，构建终止：",
    err.message,
    "\n         检查 content/blog/ 是否存在且可读（见 content/AGENTS.md）。",
  );
  process.exit(1);
});
