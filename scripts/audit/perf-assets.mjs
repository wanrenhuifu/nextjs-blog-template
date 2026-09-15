#!/usr/bin/env node
/** 一次性诊断：列出某个页面实际加载的全部资源，按体积排序。 */
import { chromium } from "playwright-chromium";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const OUT_DIR = path.resolve("out");
const PORT = 4322;
const TARGET = process.argv[2] ?? "/";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const COMPRESSIBLE = /\.(html|js|css|json|svg|xml|txt)$/;

const server = createServer(async (req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(OUT_DIR, rel);
  const info = await stat(file).catch(() => null);
  if (!info || info.isDirectory()) file = path.join(file, "index.html");
  const body = await readFile(file).catch(() => Buffer.from(""));
  const ext = path.extname(file);
  res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
  if (COMPRESSIBLE.test(ext) && req.headers["accept-encoding"]?.includes("gzip")) {
    const gz = gzipSync(body);
    res.setHeader("Content-Encoding", "gzip");
    res.end(gz);
  } else res.end(body);
});
await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  try {
    localStorage.setItem("theme", "light");
    localStorage.setItem("theme-mode", "pinned");
  } catch {}
});
const page = await context.newPage();
await page.goto(`http://127.0.0.1:${PORT}${TARGET}`, { waitUntil: "load" });
await page.waitForTimeout(2500);

const rows = await page.evaluate(() =>
  performance.getEntriesByType("resource").map((r) => ({
    name: r.name.replace(location.origin, ""),
    type: r.initiatorType,
    enc: r.encodedBodySize,
    dec: r.decodedBodySize,
  })),
);

const kb = (b) => (b / 1024).toFixed(1).padStart(8);
console.log(`\n${TARGET} —— 共 ${rows.length} 个资源\n`);
console.log("     压缩前      传输       类型      资源");
for (const r of rows.sort((a, b) => b.enc - a.enc)) {
  console.log(`${kb(r.enc)}KB ${kb(r.dec)}KB  ${r.type.padEnd(8)}  ${r.name}`);
}

const sum = (f) => rows.filter(f).reduce((s, r) => s + r.enc, 0);
console.log(`\n按类型：`);
for (const t of [...new Set(rows.map((r) => r.type))]) {
  const list = rows.filter((r) => r.type === t);
  console.log(`  ${t.padEnd(9)} ${list.length} 个  ${(sum((r) => r.type === t) / 1024).toFixed(1)}KB`);
}
console.log(`  合计       ${rows.length} 个  ${(sum(() => true) / 1024).toFixed(1)}KB`);

/* LCP 元素是谁 */
const lcpEl = await page.evaluate(async () => {
  const entries = [];
  await new Promise((res) => {
    new PerformanceObserver((l) => {
      entries.push(...l.getEntries());
    }).observe({ type: "largest-contentful-paint", buffered: true });
    setTimeout(res, 300);
  });
  const last = entries[entries.length - 1];
  if (!last) return null;
  const el = last.element;
  return {
    time: Math.round(last.startTime),
    size: `${Math.round(last.size)}px²`,
    tag: el?.tagName,
    cls: typeof el?.className === "string" ? el.className.slice(0, 90) : "",
    text: (el?.textContent ?? "").trim().slice(0, 30),
  };
});
console.log(`\nLCP 元素：`, lcpEl);

await browser.close();
server.close();
