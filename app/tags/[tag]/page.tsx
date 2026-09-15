import { getAllTags, getPostsByTag } from "@/lib/content";
import { site, absoluteUrl } from "@/lib/site";
import { PostCard } from "@/components/blog/PostCard";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { Hash } from "lucide-react";
import { BackLink } from "@/components/layout/BackLink";

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
  const decoded = decodeURIComponent(tag);
  return {
    title: `标签：${decoded}`,
    description: `${site.name}的博客中带有「${decoded}」标签的文章`,
    alternates: {
      canonical: absoluteUrl(`/tags/${tag}/`),
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPostsByTag(decoded);

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
              <PageTitle>{decoded}</PageTitle>
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
