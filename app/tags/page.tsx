import { getAllTags } from "@/lib/content";
import { site, absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { Hash } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "标签",
  description: `${site.name}的博客标签云`,
  alternates: { canonical: absoluteUrl("/tags/") },
};

export default async function TagsPage() {
  const tags = await getAllTags();

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
                  Tags
                </span>
                <PageTitle className="mt-1">标签</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              按主题浏览文章
            </p>
          </div>

          {/* Tag Count */}
          <div className="flex items-center gap-2 text-body-sm text-muted mb-8">
            <Hash className="w-4 h-4" />
            <span>共 {tags.length} 个标签</span>
          </div>

          {/* Tags Grid — 整块淡入；逐枚包裹会破坏 flex-wrap 流式布局 */}
          <FadeUp>
          <div className="flex flex-wrap gap-3">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-borderline text-body hover:bg-hover hover:border-primary/30 hover:text-primary transition-all duration-200"
              >
                <span className="text-sm font-medium">{tag}</span>
                <span className="text-caption text-muted">{count}</span>
              </Link>
            ))}
          </div>
          </FadeUp>
        </div>
      </section>
    </PageShell>
  );
}
