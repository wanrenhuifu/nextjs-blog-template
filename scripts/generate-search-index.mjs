/**
 * 构建时生成文章搜索索引
 * 扫描 content/blog/ 目录，提取轻量元数据输出到 public/search-index.json
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content", "blog");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "search-index.json");

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

    const raw = await fs.readFile(filePath, "utf-8");
    const { data } = matter(raw);

    index.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      pubDate: data.pubDate ? new Date(data.pubDate).toISOString().split("T")[0] : "",
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
  console.error("Failed to generate search index:", err);
  process.exit(1);
});
