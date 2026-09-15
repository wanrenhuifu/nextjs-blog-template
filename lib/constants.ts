import {
  Coffee,
  Cpu,
  Feather,
  FlaskConical,
  Gamepad2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/** 排行榜展示分类（按此顺序），不在列表中的分类会被过滤 */
export const VISIBLE_LMARENA_SLUGS = [
  "text",
  "agent",
  "code/webdev",
  "text/coding",
  "text-to-image",
  "text-to-video",
];

/** 文章类型（category）枚举，同时也是 /types 页的展示顺序 */
export const POST_CATEGORIES = [
  "技术",
  "生活",
  "观点",
  "随笔",
  "游戏",
  "测试",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

/**
 * 类型展示配置：图标、一句话描述与配色。
 * 颜色全部使用已登记的设计 token（info/success/accent-2/accent-3/primary/warning），
 * 双主题自动适配；类名为完整字面量，供 Tailwind 静态扫描。
 */
export const CATEGORY_UI: Record<
  PostCategory,
  {
    icon: LucideIcon;
    desc: string;
    /** 图标方块 / 标记条的着色 */
    mark: string;
    /** 小型徽章（chip）配色：边框 + 底色 + 文字 */
    chip: string;
  }
> = {
  技术: {
    icon: Cpu,
    desc: "代码、工具与折腾实录",
    mark: "bg-info/15 text-info",
    chip: "border-info/25 bg-info/10 text-info",
  },
  生活: {
    icon: Coffee,
    desc: "日常切片与碎碎念",
    mark: "bg-success/15 text-success",
    chip: "border-success/25 bg-success/10 text-success",
  },
  观点: {
    icon: Lightbulb,
    desc: "对技术与世界的看法",
    mark: "bg-accent-2/15 text-accent-2",
    chip: "border-accent-2/25 bg-accent-2/10 text-accent-2",
  },
  随笔: {
    icon: Feather,
    desc: "不成系统的随手记录",
    mark: "bg-primary/15 text-primary-strong",
    chip: "border-primary/25 bg-primary/10 text-primary-strong",
  },
  游戏: {
    icon: Gamepad2,
    desc: "游玩记录与感想",
    mark: "bg-accent-3/15 text-accent-3",
    chip: "border-accent-3/25 bg-accent-3/10 text-accent-3",
  },
  测试: {
    icon: FlaskConical,
    desc: "功能验证与语法沙盒",
    mark: "bg-warning/15 text-warning",
    chip: "border-warning/30 bg-warning/10 text-warning",
  },
};
