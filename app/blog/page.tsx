import { getAllPosts } from "@/lib/content";
import { site, absoluteUrl } from "@/lib/site";
import { PostCard } from "@/components/blog/PostCard";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FileText } from "lucide-react";

export const metadata = {
  title: "文章",
  description: `${site.name}的博客文章列表`,
  alternates: { canonical: absoluteUrl("/blog/") },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

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
                  Blog
                </span>
                <PageTitle className="mt-1">文章</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              记录技术思考与学习心得，留下痕迹。
            </p>
          </div>

          {/* Post Count */}
          <div className="flex items-center gap-2 text-body-sm text-muted mb-8">
            <FileText className="w-4 h-4" />
            <span>共 {posts.length} 篇文章</span>
          </div>

          {/* Post Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  pubDate={post.pubDate}
                  description={post.description}
                  tags={post.tags}
                  readingTime={post.readingTime}
                />
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
