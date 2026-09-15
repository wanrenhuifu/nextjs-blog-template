"use client";

import { useState } from "react";
import {
  Trophy,
  ExternalLink,
  Calendar,
  BarChart3,
  Code,
  Image,
  Video,
  FileText,
  Search,
  Hash,
  Sigma,
  Globe,
} from "lucide-react";
import type { LmArenaData } from "@/lib/types";
import { BackLink } from "@/components/layout/BackLink";
import { LmArenaTable } from "@/components/radar/LmArenaTable";
import { VISIBLE_LMARENA_SLUGS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  agent: Trophy,
  text: BarChart3,
  code: Code,
  math: Sigma,
  "code/webdev": Globe,
  "text/coding": Code,
  vision: Image,
  document: FileText,
  "text-to-image": Image,
  "image-edit": Image,
  "image-to-code": Code,
  search: Search,
  "text-to-video": Video,
  "image-to-video": Video,
  "video-to-video": Video,
};

export default function LmArenaClient({ data }: { data: LmArenaData }) {
  // 按 VISIBLE_LMARENA_SLUGS 顺序过滤 + 排序
  const filtered = data.leaderboards
    .filter((l) => VISIBLE_LMARENA_SLUGS.includes(l.slug))
    .sort(
      (a, b) =>
        VISIBLE_LMARENA_SLUGS.indexOf(a.slug) - VISIBLE_LMARENA_SLUGS.indexOf(b.slug)
    );

  const [active, setActive] = useState(0);

  // 防止 filtered 缩小后 active 越界：渲染期派生，无需 effect
  const safeActive =
    filtered.length > 0 && active < filtered.length ? active : 0;

  const lb = filtered[safeActive];
  const ActiveIcon = iconMap[lb?.slug] || BarChart3;

  // Compute org distribution for bar chart
  const orgCounts = (() => {
    if (!lb) return [];
    const counts = new Map<string, number>();
    for (const item of lb.items) {
      counts.set(item.org, (counts.get(item.org) || 0) + 1);
    }
    if (counts.size === 0) return [];
    const max = Math.max(...counts.values());
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([org, count]) => ({ org, count, pct: max > 0 ? count / max : 0 }));
  })();

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="mx-auto max-w-4xl">
        <BackLink href="/radar">返回雷达</BackLink>

        {/* Header */}
        <div className="space-y-4 border-b border-borderline pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div>
              <span className="text-caption text-muted uppercase tracking-wider">
                LMArena
              </span>
              <h1
                className="text-title"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                }}
              >
                大语言模型排行榜
              </h1>
            </div>
          </div>
          <p className="text-muted max-w-2xl">{data.description}</p>
        </div>

        {/* Empty state: no matching leaderboards */}
        {filtered.length === 0 && (
          <div className="bg-card border border-borderline rounded-2xl p-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <p className="text-body text-muted">暂无排行数据</p>
            <p className="text-caption text-muted mt-1">
              当前无可展示的排行榜分类，请稍后重试。
            </p>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {filtered.map((l, idx) => {
              const Icon = iconMap[l.slug] || BarChart3;
              const isActive = idx === safeActive;
              return (
                <button
                  key={l.slug}
                  onClick={() => setActive(idx)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                    isActive
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "text-muted border-transparent hover:text-body hover:bg-hover hover:border-borderline"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-primary" : "text-muted/60"
                    }`}
                  />
                  {l.category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Leaderboard */}
        {lb && (
          <>
            {/* Table card */}
            <div className="bg-card border border-borderline rounded-2xl overflow-hidden mb-6">
              {/* Card header */}
              <div className="px-6 py-4 border-b border-borderline bg-hover/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ActiveIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-title">
                      {lb.category}
                    </h2>
                    <p className="text-xs text-muted">{lb.description}</p>
                  </div>
                </div>
              </div>

              <LmArenaTable items={lb.items} />

              {/* Card footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-borderline bg-hover/10">
                <div className="flex items-center gap-2 text-caption text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>更新于 {data.updatedAt}</span>
                </div>
                <a
                  href={data.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-caption text-link hover:text-link-hover transition-colors"
                >
                  {data.source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-card border border-borderline rounded-xl p-4">
                <span className="text-caption text-muted">收录模型</span>
                <p className="text-title-md text-title font-bold mt-0.5 tabular-nums">
                  {lb.items.length}
                </p>
              </div>
              <div className="bg-card border border-borderline rounded-xl p-4">
                <span className="text-caption text-muted">参与厂商</span>
                <p className="text-title-md text-title font-bold mt-0.5 tabular-nums">
                  {new Set(lb.items.map((i) => i.org)).size}
                </p>
              </div>
              <div className="bg-card border border-borderline rounded-xl p-4 col-span-2 sm:col-span-1">
                <span className="text-caption text-muted">排行类别</span>
                <p className="text-title-md text-title font-bold mt-0.5 tabular-nums">
                  {filtered.length}
                </p>
              </div>
            </div>

            {/* Org Distribution */}
            <div className="bg-card border border-borderline rounded-2xl p-6">
              <h3 className="text-sm font-bold text-title mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                厂商分布
              </h3>
              <div className="space-y-2.5">
                {orgCounts.map(({ org, count, pct }) => (
                  <div
                    key={org}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-20 text-right text-body truncate flex-shrink-0">
                      {org}
                    </span>
                    <div className="flex-1 h-6 bg-hover rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md bg-primary/20 border-r border-primary/40 transition-all duration-500"
                        style={{ width: `${Math.max(pct * 100, 4)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-muted tabular-nums flex-shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
