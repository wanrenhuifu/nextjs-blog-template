<!-- BEGIN:styles-rules -->
# Styles 规则

## 目录用途

全局 CSS 与主题变量定义。样式系统以 Tailwind CSS v4 为核心，辅以少量自定义 CSS 处理特殊场景。

## 文件说明

| 文件 | 用途 |
|------|------|
| `theme.css` | **核心主题文件**：CSS 自定义属性（日间/夜间双主题色值）、Tailwind `@theme` 令牌映射、基础排版样式、代码块/表格/选区/CJK 优化 |
| `animations.css` | 关键帧动画与工具类（fade-up、粒子漂浮、骨架屏 shimmer 等） |
| `hero-scene.css` | 首页 Hero 背景场景：日间墨竹（竹竿/竹叶的内联 SVG 绘制、斑驳光影、浮尘）与夜间星月（月轮/光环/星野）。含 CSS 3D 纵深分层、五组循环关键帧与 reduced-motion 降级，消费方为 `components/home/HeroSection.tsx`。**改动前务必先读文件顶部的「三个扁平化陷阱」注释** |
| `components.css` | 组件级通用样式（概念卡片、分割线、打印隐藏等） |
| `print.css` | `@media print` 打印样式（隐藏导航、展开链接 URL、深色代码背景转浅色） |
| `waline.css` | Waline 评论组件双主题配色覆盖（`--waline-*` → `--theme-*` 映射） |

## 编码规范

1. **Tailwind v4 语法** —— 使用 `@theme` 和 `@plugin`，不再使用 `tailwind.config.js`。所有自定义颜色通过 CSS 变量映射到 Tailwind token。
2. **CSS 变量命名** —— 原始变量 `--theme-*`（如 `--theme-primary`），Tailwind token `--color-*`（如 `--color-primary: var(--theme-primary)`）。
3. **双主题定义** —— 日间在 `:root` 中定义；夜间在 `:root[data-theme="dark"], .dark` 中覆盖。**禁止只定义单侧主题**。
4. **颜色值来源** —— 推荐复用 `DESIGN.md` 中的令牌。新增色值不必先改文档，但**改完全站配色后要回头同步 `DESIGN.md`**（文档滞后于代码是可接受的，代码与文档矛盾不可接受）。
5. **使用 `color-mix`** —— 需要透明变体时优先用 `color-mix(in srgb, var(--theme-primary) 10%, transparent)`，比裸 rgba 更容易跟随主题；硬编码 rgba 也可以，`color-mix` 只是更省心的选择。
6. **移动端优先** —— 媒体查询使用 `@media (max-width: 768px)` 处理移动端降级。
7. **禁止在组件中写 CSS** —— 通用样式应集中在本目录；组件特有且无法 Tailwind 实现的极小样式，才考虑在组件内联 `style`。

## 修改流程

1. 若修改颜色/字体/间距等设计令牌 → 同步更新 `DESIGN.md`。
2. 若新增全局动画 → 写入 `animations.css`，并在 `DESIGN.md` 中补充动画规范。
3. 若新增打印相关样式 → 写入 `print.css`。

## 禁止事项

- 禁止引入第三方 CSS 框架（已用 Tailwind + 自定义变量足够）。
- 禁止写死 `!important`（特殊情况如覆盖第三方库样式除外，需注释说明）。

> **关于 `@apply`**：早期文档写「Tailwind v4 已移除该支持」是错的，v4 支持 `@apply`，`theme.css` 的 base 层一直在用。它可用，但在 `.css` 文件里优先写原生属性更易读、也少一层编译依赖。
<!-- END:styles-rules -->
