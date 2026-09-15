/**
 * 站点身份的唯一来源。
 *
 * 站名、作者、标语、简介只在这里定义一次 —— 页面标题、SEO meta、RSS、sitemap、
 * 分享图与图标生成脚本、首页逐字标题动画、页头页脚品牌名，全部从这里取值。
 *
 * 为什么是 .mjs 而不是 .ts：`scripts/*.mjs`（Node 直接运行）与 `lib/site.ts`
 * （走 TypeScript 的类型推断）都要读同一份数据。用纯 JS + JSDoc 类型标注，
 * 两边都能直接 import，不需要任何构建或转译步骤。
 *
 * fork 之后至少要改：name、author、tagline、description、github，
 * 以及域名（域名走环境变量 NEXT_PUBLIC_SITE_URL，见下方 normalizeSiteUrl）。
 *
 * ── 关于环境变量：本文件只提供**纯函数**做归一化，不自己读 process.env ──
 * 环境变量必须在调用处以字面量 `process.env.NEXT_PUBLIC_xxx` 的形式读取。
 * 原因见 normalizeBasePath 的注释：写成 `env.NEXT_PUBLIC_xxx`（含参数默认值
 * `env = process.env`）时，Next 的编译期替换不会命中，浏览器端会静默拿到空值。
 */

/**
 * fork 后没设 NEXT_PUBLIC_SITE_URL 时的兜底域名。
 *
 * 这个值会被写进 canonical、sitemap、RSS、分享图 —— 上线前务必改掉，
 * 否则搜索引擎收录的是 example.com。构建期会就此打印警告（见 lib/site.ts）。
 */
export const PLACEHOLDER_URL = "https://example.com";

/**
 * 归一化站点根 URL。
 *
 * 走环境变量而非写死常量，是因为同一个仓库在不同环境下地址不同：
 * 本地预览、GitHub Pages 用户站点（`https://<user>.github.io`）、
 * 项目页（`https://<user>.github.io/<repo>`）三者都不一样。
 *
 * 若部署在子路径（项目页），这里的结果必须**包含子路径**，且要与 next.config.ts
 * 的 basePath 保持一致，否则 canonical 与 sitemap 里的链接会指向错误位置。
 *
 * @param {string | undefined} raw 环境变量原文
 * @returns {string} 不含结尾斜杠的根 URL
 */
export function normalizeSiteUrl(raw) {
  const value = raw?.trim();
  if (!value) return PLACEHOLDER_URL;
  // 去掉结尾斜杠，避免与调用处拼接时出现 `//blog/`
  return value.replace(/\/+$/, "");
}

/**
 * 归一化子路径前缀（`basePath`）。
 *
 * 部署在域名根目录时为空字符串；部署在子路径下时形如 `/my-blog`。
 *
 * **调用处必须以字面量形式读环境变量**：
 *
 * ```ts
 * normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)   // ✅ 编译期会被替换成实际值
 * normalizeBasePath()                                    // ❌ 浏览器端拿到空值
 * ```
 *
 * 原因：Next 只在源码中出现字面量 `process.env.NEXT_PUBLIC_xxx` 时才做编译期替换。
 * 若把 `process.env` 作为函数参数默认值（`function f(env = process.env)`）再访问
 * `env.NEXT_PUBLIC_xxx`，替换不命中，客户端 bundle 里就会保留属性访问 —— 而浏览器
 * 端的 process.env 是空壳，结果是 basePath 静默变成 ""，子路径部署下
 * `fetch(publicUrl("/search-index.json"))` 变成 `/search-index.json` 并 404。
 * 这个坑已实测踩过（搜索框永远为空，控制台只有一条 404）。
 *
 * @param {string | undefined} raw 环境变量原文
 * @returns {string} 形如 `/my-blog` 的前缀，或空字符串
 */
export function normalizeBasePath(raw) {
  const value = raw?.trim();
  if (!value) return "";

  const normalized = "/" + value.replace(/^\/+/, "").replace(/\/+$/, "");

  // 含冒号或反斜杠的值不是合法 URL 路径。最常见的来源是 Git Bash 的 MSYS 路径转换：
  // `NEXT_PUBLIC_BASE_PATH=/my-blog npm run build` 会被改写成
  // `D:/Program Files/Git/my-blog`。此时 Next 内部路由解析会抛出
  // 「Missing parameter name at N」—— 那句话完全指不出真正的原因，所以在这里拦下。
  if (normalized.includes(":") || value.includes("\\")) {
    throw new Error(
      `[site] NEXT_PUBLIC_BASE_PATH 的值不合法：${JSON.stringify(value)}\n` +
        `      它应当形如 "/my-blog"。\n` +
        `      若你在 Git Bash 里用 \`VAR=/path npm run build\` 这种写法，MSYS 会把以 / 开头的值\n` +
        `      转换成 Windows 路径（本机为 D:/Program Files/Git/...）。两种解法：\n` +
        `        1. 写进 .env.local（不受 shell 转换影响）—— 推荐\n` +
        `        2. 前缀 MSYS_NO_PATHCONV=1 关闭转换\n` +
        `      注意 Vercel / GitHub Actions / 其它 shell 上没有这个问题。`,
    );
  }

  return normalized;
}

/**
 * @typedef {object} SiteConfig
 * @property {string} name        站点名。出现在页头、页脚、首页标题、RSS 标题、og:site_name
 * @property {string} tagline     首页副标题，一句短文案
 * @property {string} description 默认 meta description，也用于 RSS 描述与友链页的「本站信息」
 * @property {string} author      作者名，用于文章页作者署名与 about 页
 * @property {string} github      GitHub 用户名。**留空则页脚、about 页的 GitHub 链接自动隐藏**
 * @property {string} lang        HTML lang 属性，如 `zh-CN`
 * @property {string} ogLocale    Open Graph locale，用下划线形式，如 `zh_CN`
 * @property {string[]} keywords  默认 meta keywords
 * @property {string} ogTagline   分享图（og-default.png）上的那行小字
 *
 * 注意这里**没有** `url` —— 它来自环境变量，由 lib/site.ts 合并进来，
 * 以便编译期替换能正常命中（见 normalizeBasePath 的说明）。
 */

/** @type {SiteConfig} */
export const siteConfig = {
  name: "示例博客",
  tagline: "记录技术、思考与生活",
  description: "一个记录技术、思考与生活的个人博客。",
  author: "示例博主",
  github: "",
  lang: "zh-CN",
  ogLocale: "zh_CN",
  keywords: ["博客", "技术", "前端", "Next.js", "Tailwind CSS"],
  ogTagline: "竹影扫阶尘不动，月穿潭底水无痕",
};
