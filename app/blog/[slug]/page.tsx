import { notFound } from "next/navigation";
import { site, absoluteUrl } from "@/lib/site";
import {
  getAllPosts,
  getPostBySlug,
  getAdjacentPosts,
} from "@/lib/content";
import { CATEGORY_UI } from "@/lib/constants";
import { PageShell } from "@/components/layout/PageShell";
import { MdxContent } from "@/components/blog/MdxContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { JsonLd } from "@/components/layout/JsonLd";

import { PageTitle } from "@/components/layout/PageTitle";
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BackLink } from "@/components/layout/BackLink";
import { WalineComments } from "@/components/blog/WalineComments";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  const url = absoluteUrl(`/blog/${slug}/`);

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article" as const,
      publishedTime: post.pubDate,
      modifiedTime: post.updatedDate,
      images: ["/og-default.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-default.png"],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = await getAdjacentPosts(slug);
  const CategoryIcon = post.category ? CATEGORY_UI[post.category].icon : null;

  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": absoluteUrl(`/blog/${slug}/#article`),
          headline: post.title,
          description: post.description,
          articleBody: post.content.slice(0, 5000),
          wordCount: post.wordCount,
          inLanguage: site.lang,
          datePublished: post.pubDate,
          dateModified: post.updatedDate || post.pubDate,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": absoluteUrl(`/blog/${slug}/`),
          },
          author: {
            "@type": "Person",
            name: site.author,
            url: absoluteUrl("/"),
            // github 未配置时不写 sameAs，避免出现空数组或指向 /undefined 的链接
            ...(site.githubUrl ? { sameAs: [site.githubUrl] } : {}),
          },
          publisher: {
            "@type": "Person",
            name: site.author,
          },
          image: absoluteUrl("/og-default.png"),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "首页",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "文章",
              item: absoluteUrl("/blog/"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
            },
          ],
        }}
      />
      <article className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
          <BackLink href="/blog">返回文章列表</BackLink>

          <div className="flex flex-col lg:flex-row lg:gap-12">
            <div className="flex-1 min-w-0 max-w-3xl mx-auto w-full lg:mx-0 lg:max-w-none xl:max-w-3xl">
              {/* Post header */}
              <header className="mb-10">
                <div className="flex flex-wrap items-center gap-3 text-caption text-muted mb-4">
                  {post.category && CategoryIcon && (
                    <Link
                      href={`/types#cat-${post.category}`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium transition-opacity duration-200 hover:opacity-75 ${CATEGORY_UI[post.category].chip}`}
                    >
                      <CategoryIcon className="w-3 h-3" strokeWidth={1.5} />
                      {post.category}
                    </Link>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.pubDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime} 分钟阅读
                  </span>
                  {post.updatedDate && (
                    <span className="flex items-center gap-1 text-muted/70">
                      <span className="w-1 h-1 rounded-full bg-muted/40" />
                      更新于 {post.updatedDate}
                    </span>
                  )}
                </div>

                <PageTitle size="lg" className="mb-4">
                  {post.title}
                </PageTitle>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-muted" />
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-hover text-muted border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* Divider */}
              <div className="divider-dots mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              </div>

              {/* MDX Content */}
              <MdxContent source={post.content} imageSizes={post.imageSizes} />

              {/* Divider */}
              <div className="divider-dots mt-16 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-title-sm text-title mb-3">相关标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-hover text-body border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next Navigation */}
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col gap-1 p-4 rounded-xl bg-card border border-borderline hover:border-primary/30 hover:bg-hover transition-all duration-200"
                  >
                    <span className="text-caption text-muted flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      上一篇
                    </span>
                    <span className="text-body-sm text-title group-hover:text-primary transition-colors line-clamp-1">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col gap-1 p-4 rounded-xl bg-card border border-borderline hover:border-primary/30 hover:bg-hover transition-all duration-200 sm:text-right sm:items-end"
                  >
                    <span className="text-caption text-muted flex items-center gap-1 sm:flex-row-reverse">
                      下一篇
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-body-sm text-title group-hover:text-primary transition-colors line-clamp-1">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </nav>

              <WalineComments key={slug} />
            </div>

            <TableOfContents toc={post.toc} />
          </div>
        </div>
      </article>
    </PageShell>
  );
}
