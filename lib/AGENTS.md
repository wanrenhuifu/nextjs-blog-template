<!-- BEGIN:lib-rules -->
# Lib 规则

## 目录用途

纯工具函数、类型定义与数据解析逻辑。本目录**不含 React 组件**，全部为纯 TypeScript 模块。

## 文件说明

| 文件 | 用途 |
|------|------|
| `constants.ts` | 全局共享常量（`POST_CATEGORIES` 文章类型枚举、`CATEGORY_UI` 类型展示配置：图标/描述/配色） |
| `types.ts` | 全局 TypeScript 类型/接口定义 (`Post`, `TocItem`, `Friend`) |
| `content.ts` | 博客内容核心 API：读取 `content/blog/` 目录、解析 frontmatter、计算阅读时间、提取目录、标签聚合、类型分组（`getPostsGroupedByCategory`）、相邻文章。另导出 `collectImageSizes`（构建期用 sharp 读正文图片原始尺寸）、`enhanceRawImages`（给手写 `<img>` 补懒加载与宽高）与 `extractToc`（目录提取，按 `/[
?
]/` 切分以兼容 CRLF，见下）—— 见下方「正文图片」条 |
| `content.test.ts` | `content.ts` 的 vitest 单元测试（`npm test` / `npm run test:watch`，配置见根目录 `vitest.config.ts`） |
| `data.ts` | JSON 数据统一读取封装 |
| `a11y.ts` | 无障碍工具函数（`prefersReducedMotion()` 媒体查询检测、平滑滚动至目标元素） |
| `mdx.ts` | MDX 编译配置（remark/rehype 插件组合） |
| `readingTime.ts` | 中文/英文混合阅读时间估算 |
| `schemas.ts` | Zod 数据校验 Schema（frontmatter、友链等） |
| `tools.ts` | 工具页面配置数据（`ToolItem[]` 数组） |
| `timeTheme.ts` | 按本地时间自动切换日/夜主题的纯工具：边界常量（06:00/18:00）、`themeForDate` / `msUntilNextBoundary`、`buildTimeThemeScript`（注入 layout 的预绘种子脚本）、`theme-mode` 锁定标记常量（缺席=自动，`"pinned"`=手动锁定） |
| `bamboo.ts` | 竹苗彩蛋纯逻辑：`BAMBOO_STAGES` 阶段表（竹笋/幼苗/小节竹/青竹/开花竹）与 `getBambooStageIndex` 阈值计算、存储键名常量，消费方为 `components/ui/BambooSprout.tsx` |
| `bamboo.test.ts` | `bamboo.ts` 的 vitest 单元测试（阶段阈值边界、阶段表完整性） |
| `random.ts` | 随机数工具的纯逻辑：`parseInt10` / `parseDecimal` 严格解析（整数与小数分开，避免 `parseFloat` 放过 `"1.2.3"` 这类输入）、`roundTo`（含 -0 归一）、`sampleByRequest` 按请求分发到 `sampleNumbers`（按取样密度二选一：Set 拒绝采样 / Fisher-Yates 洗牌）/ `sampleUniformDecimals` / `sampleNormal`（Box–Muller），以及 `MAX_ABS`、`MAX_COUNT`、`MAX_DECIMALS` 上限，消费方为 `components/tools/RandomNumber.tsx` |
| `random.test.ts` | `random.ts` 的 vitest 单元测试。**含回归护栏**：大区间取少量数不得构造整段池子（旧实现会在此分配十亿个元素、卡死页面）；另锁住 Box–Muller 的 `log(0)` 边界与正态分布的均值/标准差统计性质 |

## 编码规范

1. **纯函数优先** —— 所有导出函数应为纯函数或可安全在服务端执行的异步函数。不引入 React、DOM API。
2. **类型导出** —— `types.ts` 中定义的接口一律使用 `export interface`，供组件与页面共用。
3. **文件系统路径** —— 使用 `path.join(process.cwd(), "content", "blog")` 等绝对路径，禁止假设当前工作目录。
4. **错误处理** —— 读取文件时捕获异常并返回 `null` 或空数组，避免构建崩溃。
5. **frontmatter 解析** —— 统一使用 `gray-matter`；日期字段 `pubDate` 标准化为 `YYYY-MM-DD` 字符串。
6. **阅读时间算法** —— 中文按 400 字/分钟，英文按 200 词/分钟，混合内容加权计算。
7. **MDX 插件链** —— 修改 `mdx.ts` 时保持插件顺序：`remarkGfm → remarkMath → rehypeSlug → rehypePrettyCode → rehypeKatex`。
8. **标签聚合逻辑** —— `content.ts` 中的标签处理遵循以下约定：
   - 单篇文章内重复标签自动去重后计数。
   - 按标签筛选文章时大小写不敏感（如 `JavaScript` 与 `javascript` 视为同一标签）。
   - Schema 层面禁止空字符串标签（`z.string().min(1)`）。
9. **按行切分内容时必须兼容 CRLF** —— 本项目 `core.autocrlf=true` 且没有 `.gitattributes`，Windows 上任何一次重新检出都会把 `content/` 下的文章转成 CRLF。而 JS 的 `.` 不匹配行终止符、`
` 正是行终止符，所以 `/^(#{1,6})\s+(.+)$/` 这类正则一旦遇到残留的结尾 `
` 就会整体失配。真实后果：**文章的目录会静默变空**（正文照常渲染，只有目录消失，极难察觉）。凡按行处理内容，一律用 `split(/
?
/)`。`lib/content.test.ts` 有对应的 CRLF 回归护栏。
10. **正文图片（两条路径，别只改一条）** —— 文章内图片的懒加载与尺寸预留分两处实现，因为 MDX 对待两类图片的方式不同：
   - **Markdown 语法 `![]()`** 生成的 `<img>` 会经过 `components` 映射表 → 由 `components/blog/MdxContent.tsx` 的 `Image` 覆盖处理。注意 MDX 会对 `src` 做 URL 编码（中文文件名变 `%xx`），查尺寸表时要同时试原文与解码两种形态。
   - **手写的 `<img>` 标签**原样透传、**不经过映射表** → 由 `content.ts` 的 `enhanceRawImages` 在构建期直接往标签里注属性。这一路之所以存在，也是因为 `content/AGENTS.md` 禁止改动 `syntax-test/index.mdx`。
   - 尺寸由 `collectImageSizes` 用 `sharp` 从 `public/` 下读。读不到（外部图、路径不符）就跳过，不阻断构建。
   - **懒加载必须与宽高成对**：缺了宽高，图片恰好在即将进入视野时才下载，读者会看到下方内容往下跳。

## 禁止事项

- 禁止在本目录编写 JSX / React 代码。
- 禁止在本目录使用 `use client` 或浏览器 API。
- 禁止引入 `@/` 路径别名循环依赖。
<!-- END:lib-rules -->
