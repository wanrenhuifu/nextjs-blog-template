import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { ToolsPageClient } from "./ToolsPageClient";

export const metadata: Metadata = {
  title: "工坊",
  description: "无需安装、即开即用的本地小工具，全部在浏览器内计算，不上传任何数据。",
  alternates: {
    canonical: absoluteUrl("/tools/"),
  },
};

export default function ToolsPage() {
  return <ToolsPageClient />;
}
