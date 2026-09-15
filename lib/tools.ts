import { Shuffle } from "lucide-react";
import type { ToolItem } from "./types";

/**
 * 工坊的工具清单。
 *
 * 模板只带一个**通用**工具（随机数生成器）作为示例与占位 —— 它演示了这个栏目
 * 需要什么：一条配置、一个纯前端组件、一份路由。你自己的工具照下面这个形状加即可：
 *
 * ```ts
 * {
 *   href: "/tools/<你的路由>",
 *   name: "工具名",
 *   desc: "一句话说明它做什么",
 *   icon: SomeIcon,        // 从 "lucide-react" 引入
 *   color: "from-info/10 to-info/[0.02]",        // 卡片渐变底
 *   iconColor: "text-info",                       // 图标色
 *   borderColor: "border-info/20",                // 悬停边框
 *   category: "quick",     // quick = 快捷工具区 / more = 更多工具区
 * }
 * ```
 *
 * 可用的配色 token：`primary` / `info` / `success` / `warning` / `accent-2` / `accent-3`，
 * 三者（color / iconColor / borderColor）取同一组，视觉上才是一套。
 */
export const tools: ToolItem[] = [
  {
    href: "/tools/random-number",
    name: "随机数生成器",
    desc: "生成指定区间或正态分布的随机数，可设小数精度",
    icon: Shuffle,
    color: "from-primary/10 to-primary/[0.02]",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
    category: "quick",
  },
  // ── 项目（category: "projects"）────────────────────────────────────────
  // 这是收录**外部开源项目**的入口，指向站外链接（`external: true` 时渲染成
  // 新窗口打开的 <a>，而不是内部路由 <Link>）。
  //
  // 模板默认留空 —— 该栏目标题在数组里没有 projects 条目时不会渲染（见
  // app/tools/ToolsPageClient.tsx 的 `projects.length > 0`），所以留空是安全的。
  // 要收录自己的项目，照下面这个形状加一条即可：
  //
  // {
  //   href: "https://github.com/<你的用户名>/<仓库名>",
  //   name: "项目名",
  //   desc: "一句话说明它解决什么问题",
  //   icon: FolderGit2,   // 记得从 "lucide-react" 引入
  //   color: "from-accent-2/10 to-accent-2/[0.02]",
  //   iconColor: "text-accent-2",
  //   borderColor: "border-accent-2/20",
  //   category: "projects",
  //   external: true,
  // },
];
