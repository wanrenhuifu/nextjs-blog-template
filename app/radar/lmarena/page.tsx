import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import LmArenaClient from "./LmArenaClient";
import { getLmArenaData } from "@/lib/data";

export const metadata: Metadata = {
  title: "大模型排行榜",
  description: "LMArena 大模型竞技排行榜，追踪 GPT、Claude、Gemini 等前沿 AI 模型的最新排名与趋势。",
  alternates: {
    canonical: absoluteUrl("/radar/lmarena/"),
  },
};

export default async function LmArenaPage() {
  const data = await getLmArenaData();

  return (
    <PageShell>
      <LmArenaClient data={data} />
    </PageShell>
  );
}
