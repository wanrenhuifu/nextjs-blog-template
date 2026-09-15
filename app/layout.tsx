import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { GlobalUI } from "@/components/layout/GlobalUI";
import { buildTimeThemeScript, LIGHT_THEME_COLOR } from "@/lib/timeTheme";
import { site, publicUrl, basePath } from "@/lib/site";

// 标题字体不再走网络字体，直接用 --font-serif 的宋体系系统栈（theme.css）。
//
// 曾用 next/font 自托管 Noto Serif SC + display: "optional"。移除的原因是实测数据：
// 思源宋体按 unicode-range 切成约 120 个子集，首页的中文正好跨到 10 个，合计 745KB，
// 占整页 1061KB 的 70%。而 display: "optional" 意味着慢速网络下这批字体根本等不到、
// 首屏永远用回退栈渲染 —— 「下载了但不会用」，纯粹是占用带宽（Slow 4G 下 3.7 秒）
// 拖累 CSS/JS 的到达。实测拦截字体请求后首页 LCP 从 5516ms 降到 1856ms、体积降 72%。
//
// 敢直接删的底气来自：回退栈本来就是按「与 Noto 同风格」挑的宋体系
// （Songti SC / 思源宋体 / Noto Serif CJK / SimSun，历史上移除楷体就是为了避免风格跳变），
// 大字号下系统宋体的观感与思源宋体基本无差。这一支 CSS（含 102 条 @font-face，
// gzip 33KB 且阻塞渲染）也随之消失。

/** 预绘种子脚本：常量与逻辑见 lib/timeTheme.ts 的 buildTimeThemeScript()（单一来源） */
const themeBootstrapScript = buildTimeThemeScript();

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.author }],
  creator: site.author,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    locale: site.ogLocale,
    siteName: site.name,
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={site.lang} className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* 以下三处是裸 href，Next 不会自动补 basePath（见 lib/site.ts 的 publicUrl） */}
        {/* ?v= 是给图标用的缓存失效参数：换了图标就要提升，否则已访问过的浏览器会一直用旧图 */}
        <link rel="icon" type="image/svg+xml" href={`${publicUrl("/favicon.svg")}?v=3`} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${site.name} RSS Feed`}
          href={publicUrl("/rss.xml")}
        />
        <link rel="apple-touch-icon" href={publicUrl("/apple-touch-icon.png")} />
        <meta name="apple-mobile-web-app-title" content={site.name} />
        {/* 浏览器主题色：日间兜底，实际值由下方种子脚本与 TimeThemeController 按主题更新 */}
        <meta name="theme-color" content={LIGHT_THEME_COLOR} />
        {/*
          无 JS 时的兜底：Hero 的首屏文字（标题/标语/两个入口）与 FadeUp 包裹的列表
          初态都是 opacity: 0，靠 JS 揭幕 —— 脚本被禁用或加载失败时整块内容不会出现。
          这里用 !important 强制显示（压过内联样式的正是 !important）。
          选择器清单与 styles/animations.css 里 prefers-reduced-motion 那份保持一致：
          那份管「减少动态效果」，这份管「JS 不可用」。
        */}
        <noscript>
          <style>{`.fade-up,.hero-entrance,.hero-title-char,.hero-brush{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}`}</style>
        </noscript>
        {/*
          子路径部署时修正自定义光标的地址。theme.css 用的是 url("/cursors/*.svg")，
          而 CSS 里的根绝对路径不会被 Next 的 basePath 改写，CSS 也无法调用 publicUrl()。
          放在 <head> 内联、先于首帧执行，是为了避免「先按 fallback 请求一次错误地址、
          JS 起来后再纠正」——那会在控制台留下两条无意义的 404，还会闪一下默认光标。
          根路径部署时 basePath 为空，整段不渲染，光标完全由 CSS 提供（无 JS 也有）。
        */}
        {basePath ? (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){var r=document.documentElement;" +
                `r.style.setProperty("--cursor-leaf-url",'url("${publicUrl("/cursors/bamboo-leaf.svg")}")');` +
                `r.style.setProperty("--cursor-star-url",'url("${publicUrl("/cursors/star.svg")}")');` +
                "})();",
            }}
          />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {/* 置于 <body> 最前：先于 next-themes 的防闪脚本按本地时间写入主题，避免首帧闪白 */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-on-primary focus:text-sm focus:font-medium"
        >
          跳转到主内容
        </a>
        <Providers>
          <Header />
          <GlobalUI />
          {children}
        </Providers>
      </body>
    </html>
  );
}
