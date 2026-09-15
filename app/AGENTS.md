<!-- BEGIN:app-router-rules -->
# App Router 规则

## 目录用途

本目录为 Next.js App Router 路由根。每个子目录对应一个 URL 路径段。
项目使用**静态导出** (`output: "export"`)，所有页面必须在构建时生成。

## 路由映射

| 路径 | 说明 |
|------|------|
| `app/page.tsx` | 首页（Hero 3D 场景 + 纯文字文章目录，无卡片；结构说明见 `DESIGN.md`「页面结构」） |
| `app/blog/page.tsx` | 文章列表页 |
| `app/blog/[slug]/page.tsx` | 单篇文章详情页 (SSG) |
| `app/archive/page.tsx` | 文章归档页（按年份分组） |
| `app/about/page.tsx` | 个人简介页（About） |
| `app/tags/page.tsx` | 标签云页 |
| `app/tags/[tag]/page.tsx` | 单标签文章聚合页 |
| `app/types/page.tsx` | 文章类型聚合页（按 category 分组） |
| `app/friends/page.tsx` | 友链页 |
| `app/guestbook/page.tsx` | 留言 (Waline) |
| `app/tools/page.tsx` | 工坊工具列表页 |
| `app/tools/ToolsPageClient.tsx` | 工坊列表（Client Component，与路由同目录就地放置）。按 quick / more / projects 分组渲染，**没有筛选交互** |
| `app/tools/random-number/page.tsx` | 随机数生成器 |
| `app/tools/base64/page.tsx` | Base64 编解码工具 |
| `app/tools/adhd/page.tsx` | ADHD 自测工具页 |
| `app/tools/work-value/page.tsx` | 工作性价比计算器 |
| `app/rss.xml/route.ts` | RSS Feed 路由 |
| `app/robots.ts` | robots.txt 站点地图入口 |
| `app/sitemap.ts` | 站点地图 |
| `app/error.tsx` | 全局错误边界 |
| `app/not-found.tsx` | 全局 404 |
| `app/layout.tsx` | 根布局（元数据、主题种子脚本、无 JS 兜底样式、Header/GlobalUI）。**不含字体加载**（字体全走系统栈，见 `CLAUDE.md`），Footer 由 `components/layout/PageShell.tsx` 渲染 |
| `app/providers.tsx` | Client Provider (ThemeProvider) |
| `app/globals.css` | 全局样式入口（导入 Tailwind + theme/animations/**hero-scene**/components/print；`waline.css` 由 `WalineComments` 单独导入） |
| `components/layout/ErrorFallback.tsx` | 通用错误回退 UI 组件 |
| `app/blog/error.tsx` | 文章列表页错误边界 |
| `app/blog/[slug]/error.tsx` | 文章详情页错误边界 |
| `app/friends/error.tsx` | 友链页错误边界 |
| `app/guestbook/error.tsx` | 留言错误边界 |
| `app/about/error.tsx` | 个人简介页错误边界 |
| `app/tags/error.tsx` | 标签页错误边界 |
| `app/types/error.tsx` | 类型聚合页错误边界 |
| `app/tools/error.tsx` | 工具列表页错误边界 |
| `app/tools/random-number/error.tsx` | 随机数工具错误边界 |
| `app/tools/base64/error.tsx` | Base64 工具错误边界 |
| `app/tools/adhd/error.tsx` | ADHD 自测错误边界 |
| `app/tools/work-value/error.tsx` | 工作性价比计算错误边界 |
| `app/blog/loading.tsx` | 文章列表页加载骨架 |
| `app/blog/[slug]/loading.tsx` | 文章详情页加载骨架 |
| `app/tags/loading.tsx` | 标签云页加载骨架 |
| `app/tags/[tag]/loading.tsx` | 单标签聚合页加载骨架 |
| `app/friends/loading.tsx` | 友链页加载骨架 |
| `app/about/loading.tsx` | 个人简介页加载骨架 |
| `app/types/loading.tsx` | 类型聚合页加载骨架 |
| `app/tools/loading.tsx` | 工具列表页加载骨架 |
| `app/tools/random-number/loading.tsx` | 随机数工具加载骨架 |
| `app/tools/base64/loading.tsx` | Base64 工具加载骨架 |
| `app/tools/adhd/loading.tsx` | ADHD 自测加载骨架 |
| `app/tools/work-value/loading.tsx` | 工作性价比计算加载骨架 |

## 编码规范

1. **页面组件默认导出** —— 每个 `page.tsx` 必须默认导出页面组件；使用 `async` 函数获取数据。
2. **generateStaticParams** —— 所有动态路由 (`[slug]`, `[tag]`) 必须提供 `generateStaticParams`，否则静态导出会失败。
3. **generateMetadata** —— 每个页面通过 `generateMetadata` 或导出的 `metadata` 对象设置标题与描述，标题模板为 `%s | <站点名>`（站点名取自 `lib/site.ts`，数据源是根目录的 `site.config.mjs`）。
4. **布局嵌套** —— 页面内容必须包裹在 `<PageShell>` 组件内（已在 `layout.tsx` 中通过 Header 处理，页面只需引入 `PageShell` 包裹 `<main>` 内容）。
5. **Client / Server 分界** ——
   - 数据获取、文件系统读取、元数据生成在 Server Component 完成。
   - 交互逻辑、状态、事件监听、动画在 Client Component（文件首行 `"use client"`）完成。
6. **CSS 导入** —— 项目全局样式集中在 `app/globals.css` 中通过 `@import` 导入。第三方库 CSS（如 KaTeX、Waline）和对应的组件级覆盖样式可在使用时按需导入。
7. **内容读取路径** —— 服务端读取本地数据时使用 `path.join(process.cwd(), "data", ...)` 或 `path.join(process.cwd(), "content", ...)`。
8. **generateStaticParams 值保持原始** —— 返回的参数字段值应当是原始字符串（如中文标签 `"测试"`），Next.js 会自动处理 URL 编码/解码。
   在**返回值里**禁止手动 `encodeURIComponent`，否则会导致客户端导航路由不匹配。
   同理，读到的 `params.tag` / `params.slug` **已经是原始值，不要再 `decodeURIComponent`** ——
   标签含裸 `%`（如「100%增长」）时它会抛 `URIError` 让整个构建失败（见 `app/tags/[tag]/page.tsx` 的注释）。
   需要编码的只有一处：写进 HTML 的 canonical / sitemap 链接，那里要用 `encodeURIComponent`，
   与 `app/sitemap.ts` 的标签 URL 保持同一形态。

## 禁止事项

- 不要使用 `useRouter` 做服务端导航（Server Component 中直接用 `<Link>` 或 `redirect()`）。
- 不要在 `page.tsx` 中使用 `headers()` / `cookies()` / `revalidatePath()` 等动态 API（静态导出不支持）。
- `loading.tsx` / `template.tsx` 仅在确实需要时使用（如数据加载有明确等待体验需求）。已创建的 `loading.tsx` 保持不动。
<!-- END:app-router-rules -->
