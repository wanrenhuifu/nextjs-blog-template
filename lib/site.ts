import {
  siteConfig,
  normalizeSiteUrl,
  normalizeBasePath,
  PLACEHOLDER_URL,
} from "@/site.config.mjs";

/**
 * 站点身份的**应用侧出口**。
 *
 * 数据本体在仓库根目录的 `site.config.mjs`（Node 脚本也要读它，故不能写成 TS）。
 * 本文件只做三件事：读环境变量、把 JSDoc 类型转成可用的 TS 值、派生出下游要用的形态。
 * 组件与页面一律从 `@/lib/site` 取值，不要直接写死站名或域名。
 *
 * ⚠️ 下面两处环境变量必须写成**字面量** `process.env.NEXT_PUBLIC_xxx` ——
 * 这是 Next 编译期替换唯一认得的形式，写成 `env.NEXT_PUBLIC_xxx` 会导致
 * 客户端 bundle 拿到空值。完整说明见 site.config.mjs 的 normalizeBasePath。
 */

/** 站点根 URL（不含结尾斜杠）。未配置时为占位域名 */
export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** 子路径前缀（`/my-blog`）或空字符串。与 next.config.ts 的 basePath 同源 */
export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

/** 站点名逐字数组：首页标题的「逐字落墨」动画按它驱动（见 components/home/HeroSection.tsx） */
const nameChars = Array.from(siteConfig.name);

/**
 * 是否仍在使用占位域名。
 *
 * 在构建期（Node，无 window）且 NODE_ENV=production 时告警：此时 canonical、
 * sitemap、RSS 里的链接都指向 example.com，是搜索引擎收录层面的静默错误。
 * 浏览器端不告警 —— 访客的 console 不该出现开发者才需要看的提示。
 *
 * 注：静态生成会开多个 worker 进程，每个进程各打印一次，故日志里可能出现多条。
 */
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  siteUrl === PLACEHOLDER_URL
) {
  console.warn(
    `[site] 未设置 NEXT_PUBLIC_SITE_URL，正在使用占位域名 ${PLACEHOLDER_URL}。\n` +
      "       canonical / sitemap / RSS / 分享图都会指向它。\n" +
      "       请在 .env.local 或部署环境中设置该变量（见 .env.example）。",
  );
}

export const site = {
  ...siteConfig,
  url: siteUrl,
  nameChars,
  /** GitHub 主页地址；`github` 为空时为 null，调用处据此隐藏入口 */
  githubUrl: siteConfig.github ? `https://github.com/${siteConfig.github}` : null,
} as const;

/** `site.url` 与路径拼接的辅助函数，统一处理结尾斜杠（与 trailingSlash: true 对齐） */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${normalized}`;
}

/**
 * 为 `public/` 下的资源路径补上 basePath 前缀。
 *
 * **为什么需要它**：Next.js 只会自动改写 `next/link` 的 href 与 `next/image` 的 src，
 * 对裸字符串一律不管 —— `<link href="/favicon.svg">`、`fetch("/search-index.json")`、
 * 正文里手写的 `<img src="/blog/...">` 都属于后者。部署在子路径下时，这些引用会
 * 静默 404（页面不报错，只是图标没了、搜索空了、图裂了）。
 *
 * 外部 URL 与协议相对路径（`//cdn...`）原样返回。
 */
export function publicUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
