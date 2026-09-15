import type { NavItem } from "@/lib/types";

export const navItems: NavItem[] = [
  { href: "/", label: "首页" },
  {
    href: "/blog",
    label: "内容",
    children: [
      { href: "/blog", label: "文章" },
      { href: "/types", label: "类型" },
      { href: "/tags", label: "标签" },
      { href: "/archive", label: "归档" },
    ],
  },
  { href: "/tools", label: "工坊" },
  { href: "/radar", label: "雷达" },
  {
    href: "/about",
    label: "关于",
    children: [
      { href: "/guestbook", label: "留言" },
      { href: "/friends", label: "友链" },
      { href: "/about", label: "个人简介" },
    ],
  },
];
