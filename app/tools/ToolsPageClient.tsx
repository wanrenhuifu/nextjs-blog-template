"use client";

import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import type { ToolItem } from "@/lib/types";

const CARD_CLASS =
  "concept-card group flex items-start gap-4 p-6 rounded-2xl bg-card border border-borderline hover:border-primary transition-all duration-300 h-full";

/** 单个卡片：外链渲染为 <a target="_blank">，站内路由用 <Link> */
function ToolCard({ tool }: { tool: ToolItem }) {
  const Icon = tool.icon;
  const body = (
    <>
      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-title group-hover:text-primary transition-colors duration-300">
          {tool.name}
        </h3>
        <p className="text-sm text-muted mt-1">{tool.desc}</p>
      </div>
      {tool.external ? (
        <ExternalLink className="shrink-0 w-4 h-4 text-muted group-hover:text-primary transition-colors duration-300 mt-1" />
      ) : (
        <ArrowRight className="shrink-0 w-4 h-4 text-muted group-hover:text-primary transition-colors duration-300 mt-1" />
      )}
    </>
  );
  return tool.external ? (
    <a href={tool.href} target="_blank" rel="noopener noreferrer" className={CARD_CLASS}>
      {body}
    </a>
  ) : (
    <Link href={tool.href} className={CARD_CLASS}>
      {body}
    </Link>
  );
}

/**
 * 栏目区块：统一的标题样式 + 卡片网格。
 *
 * **空分组直接不渲染** —— 否则删掉某个分类里的最后一条工具后，页面上会留下一个
 * 光秃秃的标题（「更多工具」下面什么都没有）。空判断放在这里而不是各个调用点，
 * 是为了让人加新分类时不可能忘掉。
 */
function ToolSection({ title, items }: { title: string; items: ToolItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="w-1 h-5 rounded-full bg-primary/60" />
        <h2 className="text-lg font-bold text-title">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {items.map((tool, i) => (
          <FadeUp key={tool.href} delay={Math.min(i * 80, 400)} className="h-full">
            <ToolCard tool={tool} />
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

export function ToolsPageClient() {
  const quickTools = tools.filter((t) => t.category === "quick");
  const moreTools = tools.filter((t) => t.category === "more");
  const projects = tools.filter((t) => t.category === "projects");
  return (
    <PageShell>
      <section className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 rounded-full bg-primary/60" />
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">
                  Tools
                </span>
                <PageTitle className="mt-1">工坊</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              无需安装、即开即用的本地小工具，全部在浏览器里跑，不上传任何数据
            </p>
          </div>

          <div className="space-y-12">
            {/* 三个分组都交给 ToolSection 自己判断空 —— 某一类没有任何条目时整块消失 */}
            <ToolSection title="即开即用" items={quickTools} />
            <ToolSection title="更多工具" items={moreTools} />
            <ToolSection title="项目" items={projects} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
