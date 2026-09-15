import { getAllTags, getPostsByTag } from "@/lib/content";
import { site, absoluteUrl } from "@/lib/site";
import { PostCard } from "@/components/blog/PostCard";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { Hash } from "lucide-react";
import { BackLink } from "@/components/layout/BackLink";

/**
 * 标签路由参数就是**原始标签字符串**，不要在这里再解码一次。
 *
 * 依据：`generateStaticParams` 直接返回标签原文，静态导出时落成的目录名就是它
 * （见 `out/tags/<标签>/`；`app/AGENTS.md` 也把「值保持原始、禁止手动编码」写成了规则）。
 * 先前这里调了 `decodeURIComponent`，带来两个后果：
 * - 标签含裸 `%`（如「100%增长」）→ 抛 `URIError: URI malformed`，**整个构建失败**；
 * - 标签含 `%20` 这类序列 → 被静默解码成另一个字符串，页面渲染成「该标签下暂无文章」。
 *
 * 需要编码的地方只有一处：写进 HTML 的 canonical 要用 `encodeURIComponent`，
 * 与 `app/sitemap.ts` 里标签 URL 的编码方式保持一致。
 */

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return {
    title: `标签：${tag}`,
    description: `${site.name}的博客中带有「${tag}」标签的文章`,
    alternates: {
      canonical: absoluteUrl(`/tags/${encodeURIComponent(tag)}/`),
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  return (
    <PageShell>
      <section className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <BackLink href="/tags">返回标签列表</BackLink>

          {/* Section Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-primary" />
              <PageTitle>{tag}</PageTitle>
              <span className="text-body-sm text-muted">
                {posts.length} 篇文章
              </span>
            </div>
          </div>

          {/* Post Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <FadeUp
                  key={post.slug}
                  delay={Math.min(i * 80, 400)}
                  className="h-full"
                >
                <PostCard
                  slug={post.slug}
                  title={post.title}
                  pubDate={post.pubDate}
                  description={post.description}
                  tags={post.tags}
                  readingTime={post.readingTime}
                />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted">该标签下暂无文章</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
