# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 完整发布路由：`keepalive-waline → generate-search-index → next build`，静态输出至 `out/`。链上步骤**缺配置时自行跳过，不阻断构建**，因此本地无密钥也能跑通 |
| `npm run build:verify` | 构建验证路由：`generate-search-index → next build`，跳过 Waline 保活。本地验证编译用，比完整 `build` 快 |
| `npm run lint` | ESLint 9 扁平配置（`eslint-config-next` core-web-vitals + TS） |
| `npx tsc --noEmit` | 类型检查（未注册 npm script） |
| `npm test` | 运行测试（`vitest run`，单次执行），测试文件如 `lib/content.test.ts`，配置见 `vitest.config.ts` |
| `npm run test:watch` | 以 watch 模式运行 vitest |
| `npm start` | 本地预览构建产物（`npx serve out`）。**不能用 `next start`** —— 静态导出（`output: "export"`）下该命令会直接报错 |

- **测试** —— 单元测试走 vitest（`npm test` / `npm run test:watch`）。`playwright-chromium` 已被 `scripts/audit/` 下的视觉与性能校验脚本使用（逐页截图、FCP/LCP 测量），但**没有接入任何 E2E 测试框架**，不要假设存在端到端测试。
- 单独运行脚本：`node scripts/<name>.mjs`（如 `node scripts/generate-search-index.mjs`）。
- **构建链上的步骤永不阻断构建** —— 这是刻意设计，因为 fork 后首次构建必须能跑通。`keepalive-waline.mjs` 缺 `NEXT_PUBLIC_WALINE_SERVER_URL` 时静默跳过，后端不可达也只打印警告。CI 中由 GitHub Actions secrets 注入。
- **`.mjs` 脚本通过 `scripts/load-env.mjs` 读 `.env.local`** —— 用 Node 内置的 `process.loadEnvFile()`，无额外依赖；已存在的进程环境变量优先（CI secrets 不会被本地文件覆盖）。新增脚本若需要环境变量，在 import 区加一行 `import "./load-env.mjs";` 即可。
- **`next build` 与 `next dev` 共用 `.next` 目录，不要同时跑。** 在 dev server 运行期间执行 `npm run build:verify` 会覆盖 dev 的增量编译状态，此后**部分路由会永久挂起、不再响应**（实测 `/tools/random-number/` 卡死 90s 无响应，首页却正常，极易误判成代码 bug）。遇到这种症状先停掉 dev、`rm -rf .next`、再重启即可恢复。

## 架构总览：三条数据管线

站点为纯静态导出（`output: "export"`），所有数据在构建时凝固，运行时零后端。理解这三条管线即可理解全站：

1. **博客内容**：`content/blog/<slug>/index.mdx` → `lib/content.ts`（gray-matter 解析 frontmatter、Zod 校验、阅读时间/目录/标签聚合）→ 各 `page.tsx` 在构建时通过 `generateStaticParams` 枚举生成 → `lib/mdx.ts` 的插件链（remark-gfm → remarkMath → rehypeSlug → rehypePrettyCode → rehypeKatex）编译 MDX。搜索走旁路：`scripts/generate-search-index.mjs` 产出 `public/search-index.json`，由客户端 `SearchModal` fetch 加载。
2. **结构化数据**：`data/*.json`（人工维护）→ `lib/data.ts` 统一读取（Zod 校验 + 失败降级 fallback，保证数据异常不白屏）→ 友链页。读取失败是**降级而非中断**：返回空数组兜底并打印 `[data] ... 数据读取失败` 日志，构建仍然成功。
3. **Client / Server 分界**：数据获取、fs 读取、metadata 全在 Server Component；交互、动画、主题切换（next-themes）、评论（Waline）、搜索在 Client Component。

**部署**：GitHub Pages（`.github/workflows/deploy.yml`）——push 到 `main` 自动部署。站点地址与 basePath 由工作流按「用户站点 / 项目页」自动推导，无需配置。`trailingSlash: true` 是为 GH Pages 目录级 URL 设置的，不要移除。

构建期可注入的 secret 只有 `NEXT_PUBLIC_WALINE_SERVER_URL`（可选，用于评论）。注意 `deploy.yml` 里读取的 secret 名是 `WALINE_SERVER_URL`，它被赋给环境变量 `NEXT_PUBLIC_WALINE_SERVER_URL` —— 在仓库 Secrets 里要按 **`WALINE_SERVER_URL`** 这个名字创建。

> `deploy.yml` 里的 `cron: '0 0,12 * * *'` 是**默认注释掉的**：模板本身已无需要定时刷新的数据，且它会占用你的 Actions 额度。若你之后加了抓取类脚本，取消注释即可（每 12 小时重建一次）。

## 核心前提

这是 Next.js 16.x + React 19 + Tailwind CSS v4 项目，使用 App Router 与静态导出 (`output: "export"`)。
API、约定和文件结构与训练数据中的常规 Next.js 项目可能不同。
修改任何代码前，请先阅读 `node_modules/next/dist/docs/` 中的相关指南并留意弃用通知。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16.2.6 (App Router, Static Export) |
| 运行时 | React 19.2.4 |
| 样式 | Tailwind CSS v4 + `@tailwindcss/typography` |
| 字体 | 全部走系统字体，**不加载网络字体**：正文为系统无衬线栈，标题为宋体系系统栈（Songti SC / 思源宋体 / Noto Serif CJK / SimSun），代码为 JetBrains Mono 栈。曾自托管 Noto Serif SC，因 CJK 子集体积（745KB，占首页 70%）与 `display: optional` 下「下载了却不使用」的双重损失而移除，实测 LCP 5516ms → 1684ms（详见 `app/layout.tsx` 顶部） |
| 主题 | `next-themes` 双主题：日间「竹林风」/ 夜间「星月夜」，默认按访客本地时间自动切换日/夜（06:00–17:59 日间，常量见 `lib/timeTheme.ts`），手动切换后锁定、不跟随操作系统 |
| MDX | `next-mdx-remote` + remark-gfm + remark-math + rehype-katex + rehype-pretty-code |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 评论 | Waline (`@waline/client`) |
| 构建脚本 | Node.js ESM (.mjs) |
| 数据层 | `lib/data.ts` 统一封装 JSON 读取（Zod 校验 + 降级兜底） |

## 通用代码规范

1. **TypeScript 严格模式开启** —— 不允许隐式 any，必须处理 null/undefined。
2. **路径别名** —— 始终使用 `@/` 代替相对路径 `../../`。
3. **双主题兼容** —— 日间与夜间都要有完整定义，不允许只定义单侧。色值本身不再受限：可以直接写 hex、可以用纯黑纯白、可以用高饱和色（早期版本曾禁止纯黑白与直接写 hex，该限制已解除）。仍推荐优先复用语义 token，因为 token 让主题翻转自动生效，但这是便利而非硬规定。
4. **语义化 Token 优先** —— 优先使用 `bg-app`, `text-title`, `border-borderline` 等 Tailwind token；需要突破 token 时直接写色值即可，改主题令牌时记得把这类点一并检查。
5. **中文字体栈** —— 标题必须走 `font-serif`（宋体系系统栈：Songti SC / 思源宋体 / Noto Serif CJK / SimSun，不得引入楷体等异风格字体）；正文走 `font-sans` (系统无衬线)。**不引入网络字体** —— 收益与代价的权衡见 `app/layout.tsx` 顶部注释，CJK 网络字体的体积代价远大于观感收益。
6. **尊重 `prefers-reduced-motion`** —— 动画组件需检测该媒体查询并提供降级。
7. **静态导出约束** —— 所有路由必须是 SSG 友好，不使用 `headers()`/`cookies()` 等动态 API；图片使用 `unoptimized: true`。
8. **数据层统一** —— JSON 数据读取必须通过 `lib/data.ts`，禁止在 page 组件中直接 `fs.readFile`。新增数据源时优先扩展 `lib/data.ts`。
9. **类型集中管理** —— 全局接口定义在 `lib/types.ts`，禁止在多文件中重复定义同一类型。
10. **入场动画必须有无 JS 兜底** —— Hero 的 `.hero-entrance` / `.hero-title-char` / `.hero-brush` 与列表用的 `.fade-up` 初态都是 `opacity: 0`，靠 JS 揭幕。新增这类「JS 才显示」的元素时，必须同时把它的选择器加进两处清单：`app/layout.tsx` 的 `<noscript>` 样式（管 JS 被禁用）与 `styles/animations.css` 的 `prefers-reduced-motion` 块（管减少动态效果）。两处用 `!important` 压过内联样式。
11. **reduced-motion 不要改变 `initial`** —— `framer-motion` 的 `useReducedMotion()` 在服务端返回 `null`、客户端首帧即取值，用它切换 `initial` 会让两端 HTML 不一致并触发 hydration 报错。降级只应体现在 `transition` 的时长/延迟上（见 `HeroSection.tsx` 的 `enter()`）。
12. **组件职责单一** —— Header 已拆分为 `DesktopNav` / `MobileDrawer` / `Header` 外壳。新增布局组件时遵循相同粒度。布局组件（`components/layout/`）只负责布局，业务组件按领域分目录（`blog/`, `tools/` 等）。
13. **禁止 dead code** —— 组件不应保留无调用方的 prop 分支（如已删除的 `standalone` 模式）。清理组件时同步删除对应的 CSS 样式。
14. **代码与文档同步** —— 每次修改代码后必须检查并同步对应的文档：
    - 新增/删除页面路由或 loading/error 边界 → 更新 `app/AGENTS.md` 路由映射表
    - 新增/删除组件 → 更新 `components/AGENTS.md` 子目录示例
    - 新增/删除 lib 工具函数 → 更新 `lib/AGENTS.md` 文件说明表
    - 新增/删除构建脚本或变更触发时机 → 更新 `scripts/AGENTS.md` 文件说明表
    - 新增/删除 CSS 样式文件 → 更新 `styles/AGENTS.md` 文件说明表
    - 修改设计令牌（颜色/字体/间距）→ 同步 `DESIGN.md` 与 `styles/theme.css`
    - 修改技术栈版本 → 同步 `README.md` 和 `CLAUDE.md` 技术栈表格
    - 修改数据文件结构 → 同步 `data/AGENTS.md` 字段说明
15. **useEffect 审计**（Code Review 必查） —— 审查 PR 时，必须检查每个 `useEffect` 的三个维度：
    - **依赖数组**：是否遗漏或多余？`resolvedTheme` 等异步解析值是否会导致多余的重跑？
    - **cleanup 时机**：cleanup 是否在依赖变化时意外销毁了本应保持的实例（如第三方库、订阅、定时器）？正确做法是将 destroy 放在独立 `useEffect(() => { return () => destroy(); }, [])` 中，仅组件卸载时执行。
    - **初始化守卫**：是否有 `ref.current` 或 flag 防止重复初始化？异步依赖就绪前是否有 `undefined` 守卫？

## 设计规范来源

- 完整设计令牌与视觉规范见 `DESIGN.md`

## 子目录规则

各子目录有独立的 `AGENTS.md` 描述更细粒度的编码约束：

@app/AGENTS.md
@components/AGENTS.md
@lib/AGENTS.md
@content/AGENTS.md
@data/AGENTS.md
@scripts/AGENTS.md
@styles/AGENTS.md
@public/AGENTS.md
