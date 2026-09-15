import Link from "next/link";
import { site, absoluteUrl } from "@/lib/site";
import { Hourglass, Layers } from "lucide-react";
import { getPostsGroupedByCategory } from "@/lib/content";
import { CATEGORY_UI, POST_CATEGORIES } from "@/lib/constants";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { BackLink } from "@/components/layout/BackLink";

export const metadata = {
  title: "类型",
  description: `按类型浏览${site.name}的博客文章：技术、生活、观点、随笔、游戏、测试`,
  alternates: { canonical: absoluteUrl("/types/") },
};

export default async function TypesPage() {
  const groups = await getPostsGroupedByCategory();
  const totalPosts = groups.reduce((sum, g) => sum + g.posts.length, 0);
  const usedCategories = new Set(groups.map((g) => g.category));
  const pendingCategories = POST_CATEGORIES.filter(
    (c) => !usedCategories.has(c)
  );
  const countOf = (category: (typeof POST_CATEGORIES)[number]) =>
    groups.find((g) => g.category === category)?.posts.length ?? 0;

  return (
    <PageShell>
      <section className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <BackLink href="/blog">返回文章列表</BackLink>

          {/* Section Header */}
          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 rounded-full bg-primary/60" />
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">
                  Types
                </span>
                <PageTitle className="mt-1">类型</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              文章各有脾性，按类型各归其位。点选下方类型可直接跳转。
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-body-sm text-muted mb-8">
            <Layers className="w-4 h-4" />
            <span>
              共 {totalPosts} 篇文章，{groups.length} 个类型在更
            </span>
          </div>

          {/* Category Overview Chips */}
          <div className="flex flex-wrap gap-3 mb-14">
            {POST_CATEGORIES.map((category) => {
              const ui = CATEGORY_UI[category];
              const Icon = ui.icon;
              const count = countOf(category);

              if (count === 0) {
                return (
                  <span
                    key={category}
                    title="该类型暂无文章"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-dashed border-borderline text-muted/70 cursor-not-allowed"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">{category}</span>
                    <span className="text-caption">待更新</span>
                  </span>
                );
              }

              return (
                <a
                  key={category}
                  href={`#cat-${category}`}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${ui.chip}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-caption opacity-80">{count}</span>
                </a>
              );
            })}
          </div>

          {/* Category Groups */}
          {groups.length > 0 ? (
            <div className="space-y-12">
              {groups.map(({ category, posts }) => {
                const ui = CATEGORY_UI[category];
                const Icon = ui.icon;

                return (
                  <section key={category} id={`cat-${category}`} className="scroll-mt-20">
                    {/* Sticky Category Heading */}
                    <h2 className="flex items-center gap-3 sticky top-[var(--header-h)] bg-app/80 backdrop-blur-sm py-3 mb-4 z-[5] border-b border-borderline/40">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${ui.mark}`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                      <span className="text-2xl font-bold text-title font-serif">
                        {category}
                      </span>
                      <span className="hidden sm:inline text-body-sm text-muted font-sans font-normal">
                        {ui.desc}
                      </span>
                      <span className="ml-auto text-body-sm text-muted font-sans font-normal shrink-0">
                        {posts.length} 篇
                      </span>
                    </h2>

                    {/* Post list */}
                    <div>
                      {posts.map((post) => (
                        <div
                          key={post.slug}
                          className="flex items-center gap-3 py-2.5 border-b border-borderline/30 hover:bg-hover/40 transition-colors rounded-lg px-3 -mx-3 group"
                        >
                          <time className="text-caption text-muted shrink-0 w-[76px]">
                            {post.pubDate}
                          </time>

                          <Link
                            href={`/blog/${post.slug}`}
                            className="font-medium text-body group-hover:text-primary transition-colors min-w-0 flex-1 truncate"
                          >
                            {post.title}
                          </Link>

                          {/* Tags: visible on md+ */}
                          <div className="hidden md:flex items-center gap-1.5 shrink-0 max-w-[160px] overflow-hidden">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-caption px-1.5 py-0.5 bg-hover border border-borderline rounded-full text-muted whitespace-nowrap"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 2 && (
                              <span className="text-caption text-muted">
                                +{post.tags.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Reading time: visible on sm+ */}
                          <span className="hidden sm:inline text-caption text-muted shrink-0">
                            {post.readingTime} 分钟
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted">暂无文章</p>
            </div>
          )}

          {/* Pending Categories */}
          {pendingCategories.length > 0 && (
            <div className="mt-16 pt-8 border-t border-borderline/60">
              <div className="flex items-center gap-2 text-body-sm text-muted mb-4">
                <Hourglass className="w-4 h-4" />
                <span>尚在酝酿 · 这些类型还没有文章</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {pendingCategories.map((category) => {
                  const ui = CATEGORY_UI[category];
                  const Icon = ui.icon;
                  return (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-dashed border-borderline text-muted"
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm">{category}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
