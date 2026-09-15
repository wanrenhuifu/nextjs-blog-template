import { getPostsGroupedByYear } from "@/lib/content";
import { site, absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { BackLink } from "@/components/layout/BackLink";
import { FadeUp } from "@/components/ui/FadeUp";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "归档",
  description: `${site.name}的博客文章归档，按年份整理`,
  alternates: { canonical: absoluteUrl("/archive/") },
};

export default async function ArchivePage() {
  const years = await getPostsGroupedByYear();
  const totalPosts = years.reduce((sum, y) => sum + y.posts.length, 0);

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
                  Archive
                </span>
                <PageTitle className="mt-1">归档</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              按年份整理所有文章，方便回溯。
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-body-sm text-muted mb-10">
            <CalendarDays className="w-4 h-4" />
            <span>
              共 {totalPosts} 篇文章，{years.length} 个年份
            </span>
          </div>

          {/* Year Groups */}
          {years.length > 0 ? (
            <div className="space-y-12">
              {years.map(({ year, posts }) => (
                <section key={year}>
                  {/* Sticky Year Heading */}
                  <h2
                    className="text-2xl font-bold text-title font-serif sticky top-[var(--header-h)] bg-app/80 backdrop-blur-sm py-3 mb-4 z-[5] border-b border-borderline/40"
                  >
                    {year}
                    <span className="ml-3 text-body-sm text-muted font-sans font-normal">
                      {posts.length} 篇
                    </span>
                  </h2>

                  {/* Post list — FadeUp 只包列表不包年份标题，
                      避免 transform 破坏 sticky 吸顶 */}
                  <FadeUp>
                  <div>
                    {posts.map((post) => {
                      const d = new Date(post.pubDate);
                      const monthDay = `${d.getMonth() + 1}月${d.getDate()}日`;

                      return (
                        <div
                          key={post.slug}
                          className="flex items-center gap-3 py-2.5 border-b border-borderline/30 hover:bg-hover/40 transition-colors rounded-lg px-3 -mx-3 group"
                        >
                          <time className="text-caption text-muted shrink-0 w-14">
                            {monthDay}
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
                      );
                    })}
                  </div>
                  </FadeUp>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted">暂无文章</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
