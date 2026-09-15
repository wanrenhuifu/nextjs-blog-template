import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { ToolsPageClient } from "./ToolsPageClient";

export const metadata: Metadata = {
  title: "工坊",
  description: "无需安装、即开即用的本地小工具：随机数生成、Base64 编解码、ADHD 自测、工作性价比计算器。",
  alternates: {
    canonical: absoluteUrl("/tools/"),
  },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
