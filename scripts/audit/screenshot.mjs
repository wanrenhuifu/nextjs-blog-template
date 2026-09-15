#!/usr/bin/env node
/**
 * 视觉审计截图：遍历全部路由 × 日/夜主题 × 桌面/移动视口，输出到 verify-shots/。
 *
 * 用法：
 *   node scripts/audit/screenshot.mjs                    # 全部路由
 *   node scripts/audit/screenshot.mjs home blog          # 只截指定路由（匹配键名）
 *   node scripts/audit/screenshot.mjs --theme=light      # 只截单侧主题
 *   node scripts/audit/screenshot.mjs --motion=full      # 保留动画（默认 reduce，见下）
 *
 * 默认用 reducedMotion: "reduce" 截图，原因有二：
 *   1. 避免抓到动画中间帧，让前后对比可信；
 *   2. 顺带验证 prefers-reduced-motion 降级路径不会渲染成空白页。
 * 需要看真实动效时用 --motion=full。
 */
import { chromium } from "playwright-chromium";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? "verify-shots";

/** 路由键名 → 路径。键名用于命令行筛选与文件名。 */
const ROUTES = [
  { key: "home", url: "/" },
  { key: "blog", url: "/blog/" },
  { key: "post", url: "/blog/syntax-test/" },
  { key: "post-hello", url: "/blog/hello-world/" },
  { key: "tags", url: "/tags/" },
  { key: "tag-single", url: "/tags/测试/" },
  { key: "types", url: "/types/" },
  { key: "archive", url: "/archive/" },
  { key: "about", url: "/about/" },
  { key: "friends", url: "/friends/" },
  { key: "guestbook", url: "/guestbook/" },
  { key: "tools", url: "/tools/" },
  { key: "tool-random", url: "/tools/random-number/" },
  { key: "notfound", url: "/definitely-not-a-real-page/" },
];

const VIEWPORTS = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "mobile", width: 390, height: 844 },
];

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith("--"));
const filters = argv.filter((a) => !a.startsWith("--"));
const themeFilter = flags.find((f) => f.startsWith("--theme="))?.split("=")[1];
const motion = flags.find((f) => f.startsWith("--motion="))?.split("=")[1] ?? "reduce";
/** --no-fonts：拦截 woff2，用于评估「只用系统衬线回退栈」的观感 */
const noFonts = flags.includes("--no-fonts");

const themes = themeFilter ? [themeFilter] : ["light", "dark"];
const routes = filters.length
  ? ROUTES.filter((r) => filters.includes(r.key))
  : ROUTES;

if (routes.length === 0) {
  console.error(`没有匹配的路由。可用键名：\n  ${ROUTES.map((r) => r.key).join(", ")}`);
  process.exit(1);
}

/**
 * 滚动到底再回顶，触发所有 IntersectionObserver。
 * 不做这一步的话，首屏以下的 FadeUp 元素会停在 opacity: 0，整页截图是一片空白。
 */
async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 250));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

/** 等字体就绪，避免截到回退字体。 */
async function waitForFonts(page) {
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
}

/**
 * 等入场动画走完。
 * 保留动画时（--motion=full）首页那段编排约 3s，不等就会截到半透明的中间帧，
 * 把「按钮还没浮现」误判成「按钮样式有问题」。
 */
async function waitForEntrance(page) {
  if (motion !== "reduce") await page.waitForTimeout(3000);
}

/** 隐藏 Next.js 开发指示器等非站点自身的浮层，避免混进审计结果。 */
async function hideDevOverlays(page) {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
}

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
let shot = 0;
let failed = 0;

for (const vp of VIEWPORTS) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: motion === "reduce" ? "reduce" : "no-preference",
      // 与站点默认一致：主题按访客本地时间自动切换，这里直接锁定目标主题
      locale: "zh-CN",
    });
    await context.addInitScript(
      ({ t }) => {
        try {
          localStorage.setItem("theme", t);
          localStorage.setItem("theme-mode", "pinned");
        } catch {}
      },
      { t: theme },
    );

    const page = await context.newPage();
    if (noFonts) await page.route("**/*.woff2", (route) => route.abort());
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    for (const route of routes) {
      const file = path.join(OUT, `${vp.key}-${theme}-${route.key}.png`);
      try {
        // 非 ASCII 参数（如中文标签）在 dev 下首次访问会撞上 generateStaticParams
        // 尚未解析完成的竞态而返回 5xx，重试一次即可；静态导出产物无此问题。
        let res = await page.goto(BASE + route.url, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        if ((res?.status() ?? 0) >= 500) {
          await page.waitForTimeout(800);
          res = await page.goto(BASE + route.url, {
            waitUntil: "networkidle",
            timeout: 30000,
          });
        }
        await waitForFonts(page);
        await hideDevOverlays(page);
        await settle(page);
        await waitForEntrance(page);

        // 确认主题真的落到了 <html data-theme> 上，否则截图没有可比性
        const applied = await page.getAttribute("html", "data-theme");
        if (applied && applied !== theme) {
          console.warn(`  ! ${route.key} 主题未生效（期望 ${theme}，实际 ${applied}）`);
        }

        await page.screenshot({ path: file, fullPage: true });
        shot++;
        const status = res?.status() ?? 0;
        const note = status >= 400 && route.key !== "notfound" ? ` [HTTP ${status}]` : "";
        console.log(`  ✓ ${path.basename(file)}${note}`);
      } catch (err) {
        failed++;
        console.error(`  ✗ ${path.basename(file)} — ${err.message}`);
      }
    }

    if (errors.length) {
      console.error(`  ! ${vp.key}/${theme} 控制台报错 ${errors.length} 条：`);
      for (const e of [...new Set(errors)].slice(0, 5)) console.error(`      ${e}`);
    }

    await context.close();
  }
}

await browser.close();
console.log(`\n完成：${shot} 张截图 → ${OUT}/`);
if (failed) console.error(`失败：${failed} 张`);
process.exit(failed ? 1 : 0);
