<!-- BEGIN:components-rules -->
# Components 规则

## 目录用途

本目录存放所有 React 组件，按功能域分组。所有组件均为 TypeScript + TSX。

## 子目录划分

| 子目录 | 用途 | 示例 |
|--------|------|------|
| `blog/` | 博客阅读相关组件 | `PostCard`, `PostCardSkeleton`, `MdxContent`, `TableOfContents`, `WalineComments` |
| `home/` | 首页专属组件 | `HeroSection`（构图与时序）、`HeroScenery`（场景绘制：竹、远山、星河、月轮、云气、光柱、萤火、落叶） |
| `layout/` | 全局布局与导航 | `Header`, `Footer`, `PageShell`, `DesktopNav`, `MobileDrawer`, `SearchModal`, `ThemeToggle`, `TimeThemeController`, `BackLink`, `GlobalUI`, `PageTitle`, `ErrorFallback`, `FarewellTitle` |
| `tools/` | 工具页面交互组件 | `RandomNumber`, `Base64Tool`, `ADHDTest`, `WorkValueCalculator` |
| `ui/` | 通用 UI 原子组件 | `FadeUp`, `GlowCard`, `BambooSprout`, `CopyCodeButton`, `BackToTop`, `ScrollProgress` |

## 编码规范

1. **命名** —— 组件文件使用 PascalCase (`HeroSection.tsx`)；导出使用命名导出 `export function ComponentName()`。
2. **Props 接口** —— 每个组件定义独立的 Props interface，不使用 `any`。
3. **Client 组件标记** —— 若组件使用 `useState` / `useEffect` / `useRouter` / `framer-motion`，文件首行必须写 `"use client"`。
4. **样式规范** ——
   - 使用 Tailwind 工具类编写样式，禁止内联 `style`（动画相关的 `transform`/`perspective` 等除外）。
   - 优先使用语义化颜色 token：`bg-app`, `text-title`, `border-borderline`, `hover:bg-hover`。
   - 圆角推荐档位（**Tailwind v4 默认值**，早期文档误标为 v3 数值）：`rounded-sm` 4px、`rounded-md` 6px、`rounded-lg` 8px、`rounded-xl` 12px、`rounded-2xl` 16px、`rounded-full` 药丸。卡片用 `rounded-2xl`，控件用 `rounded-xl`。尽量避免 `rounded-[10px]` 这类游离值。
5. **中文排版** ——
   - 标题文字使用 `font-serif`（中文衬线体栈）。
   - 正文使用 `font-sans`（系统无衬线体栈）。
   - 代码使用 `font-mono`。
6. **动画规范** ——
   - 入场动画使用 `FadeUp` 组件或 framer-motion。
   - 持续时间控制在 200–400ms（hover）或 600–850ms（入场）。
   - 必须检测 `prefers-reduced-motion` 并在需要时禁用动画。
7. **Lucide 图标** —— 统一使用 `lucide-react`，`strokeWidth` 默认 1.5（细线风格）。

## 组件依赖方向

```
ui/ (原子) ← blog/ / home/ / tools/ (页面级)
     ↑
layout/ (全局)
```

- `ui/` 不依赖其他子目录。
- `layout/` 可依赖 `ui/`。
- `blog/` / `home/` / `tools/` 可依赖 `ui/` 和 `layout/`。
- 避免循环依赖。
<!-- END:components-rules -->
