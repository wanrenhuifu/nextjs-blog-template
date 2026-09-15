import { Shuffle, Lightbulb, DollarSign, Code } from "lucide-react";
import type { ToolItem } from "./types";

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
  {
    href: "/tools/base64",
    name: "Base64 编解码",
    desc: "支持中文的文本与 Base64 双向转换",
    icon: Code,
    color: "from-info/10 to-info/[0.02]",
    iconColor: "text-info",
    borderColor: "border-info/20",
    category: "quick",
  },
  {
    href: "/tools/adhd",
    name: "ADHD 自测",
    desc: "基于 ASRS-5 标准的成人 ADHD 筛查量表，6 道问题快速自评",
    icon: Lightbulb,
    color: "from-warning/10 to-warning/[0.02]",
    iconColor: "text-warning",
    borderColor: "border-warning/20",
    category: "more",
  },
  {
    href: "/tools/work-value",
    name: "工作性价比计算器",
    desc: "用公式量化这份工作到底值不值，薪资、时间、环境综合评估",
    icon: DollarSign,
    color: "from-success/10 to-success/[0.02]",
    iconColor: "text-success",
    borderColor: "border-success/20",
    category: "more",
  },
  // ── 项目（category: "projects"）────────────────────────────────────────
  // 这里是收录**外部开源项目**的入口，指向站外链接（`external: true` 时会渲染成
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
