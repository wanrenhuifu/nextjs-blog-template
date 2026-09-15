#!/usr/bin/env node
/**
 * 生产性能测量：直接跑静态导出产物 out/，自带 gzip 静态服务器模拟 GitHub Pages。
 *
 * 用法：
 *   node scripts/audit/perf-audit.mjs                    # 首页 + 文章页，正常网速与 Slow 4G
 *   node scripts/audit/perf-audit.mjs --paths=/blog/     # 指定路径
 *
 * 不用 next dev 测 —— 开发模式未压缩、未优化，数字没有参考价值。
 */
import { chromium } from "playwright-chromium";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const OUT_DIR = path.resolve("out");
const PORT = 4321;

const argv = process.argv.slice(2);
const pathsArg = argv.find((a) => a.startsWith("--paths="));
const PATHS = pathsArg
  ? pathsArg.split("=")[1].split(",")
  : ["/", "/blog/", "/blog/syntax-test/"];
/** --no-fonts：拦截 woff2，用来量化「不要网络字体」能省多少、快多少 */
const NO_FONTS = argv.includes("--no-fonts");

/* ---------- 带 gzip 的静态服务器 ---------- */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};
const COMPRESSIBLE = /\.(html|js|css|json|svg|xml|txt)$/;

const server = createServer(async (req, res) => {
  try {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(OUT_DIR, rel);
    const info = await stat(file).catch(() => null);
    if (!info || info.isDirectory()) file = path.join(file, "index.html");

    const body = await readFile(file);
    const ext = path.extname(file);
    res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");

    if (COMPRESSIBLE.test(ext) && req.headers["accept-encoding"]?.includes("gzip")) {
      const gz = gzipSync(body);
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Content-Length", gz.length);
      res.end(gz);
    } else {
      res.setHeader("Content-Length", body.length);
      res.end(body);
    }
  } catch {
    res.statusCode = 404;
    res.end("not found");
  }
});

await new Promise((r) => server.listen(PORT, r));
const BASE = `http://127.0.0.1:${PORT}`;

/* ---------- 网络档位（CDP） ---------- */

const PROFILES = [
  { key: "正常", cdp: null },
  {
    key: "Slow 4G",
    cdp: {
      offline: false,
      // 1.6 Mbps 下行 / 750 Kbps 上行 / 150ms RTT —— Chrome DevTools 的 Slow 4G 档
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    },
  },
];

/* ---------- 采集 ---------- */

const browser = await chromium.launch();

for (const profile of PROFILES) {
  console.log(`\n========== ${profile.key} ==========`);
  for (const p of PATHS) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      window.__perf = { lcp: 0, cls: 0 };
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__perf.lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            if (!e.hadRecentInput) window.__perf.cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}
    });

    const page = await context.newPage();
    if (NO_FONTS) await page.route("**/*.woff2", (route) => route.abort());
    if (profile.cdp) {
      const client = await page.context().newCDPSession(page);
      await client.send("Network.emulateNetworkConditions", profile.cdp);
    }
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
        localStorage.setItem("theme-mode", "pinned");
      } catch {}
    });

    await page.goto(BASE + p, { waitUntil: "load", timeout: 120000 });
    // 给 LCP / CLS 一点沉降时间
    await page.waitForTimeout(profile.cdp ? 4000 : 1500);

    const data = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const res = performance.getEntriesByType("resource");
      const by = (t) => {
        const list = res.filter((r) => r.initiatorType === t);
        return {
          n: list.length,
          bytes: list.reduce((s, r) => s + (r.encodedBodySize || 0), 0),
        };
      };
      const woff = res.filter((r) => r.name.endsWith(".woff2"));
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      return {
        ttfb: nav?.responseStart ?? 0,
        fcp,
        lcp: window.__perf?.lcp ?? 0,
        cls: window.__perf?.cls ?? 0,
        dcl: nav?.domContentLoadedEventEnd ?? 0,
        load: nav?.loadEventEnd ?? 0,
        htmlBytes: nav?.encodedBodySize ?? 0,
        js: by("script"),
        css: by("link"),
        img: by("img"),
        allBytes: res.reduce((s, r) => s + (r.encodedBodySize || 0), 0),
        fontCount: woff.length,
        fontBytes: woff.reduce((s, r) => s + (r.encodedBodySize || 0), 0),
        domNodes: document.getElementsByTagName("*").length,
      };
    });

    const kb = (b) => `${(b / 1024).toFixed(1)}KB`;
    const s = (ms) => `${Math.round(ms)}ms`;
    console.log(`\n── ${p}`);
    console.log(`   FCP ${s(data.fcp)}   LCP ${s(data.lcp)}   CLS ${data.cls.toFixed(4)}   load ${s(data.load)}`);
    console.log(`   传输合计 ${kb(data.allBytes)}   其中 JS ${kb(data.js.bytes)}/${data.js.n} 个   CSS ${kb(data.css.bytes)}/${data.css.n} 个   图片 ${kb(data.img.bytes)}`);
    console.log(`   HTML 压缩后 ${kb(data.htmlBytes)}   字体 ${data.fontCount} 个 / ${kb(data.fontBytes)}`);
    console.log(`   DOM 节点 ${data.domNodes}`);

    await context.close();
  }
}

await browser.close();
server.close();
