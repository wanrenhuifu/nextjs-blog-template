import type { Metadata } from "next";
import { site, absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { getAllPostMeta } from "@/lib/content";
import { HeroSection } from "@/components/home/HeroSection";
import { PageShell } from "@/components/layout/PageShell";
import { JsonLd } from "@/components/layout/JsonLd";
import { ArrowRight } from "lucide-react";

const shareTitle = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: {
    title: shareTitle,
    description: site.description,
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: site.description,
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

/** 首页文字目录一次列出的上限，超出的走「全部文章」 */
const INDEX_LIMIT = 8;

/** 底部纯文字入口 */
const ENTRIES = [
  { href: "/blog", label: "文章" },
  { href: "/tools", label: "工坊" },
  { href: "/about", label: "关于" },
];

/* ------------------------------------------------------------------ */
/*  主页面                                                             */
/*                                                                     */
/*  刻意保持「Hero（3D 场景）+ 纯文字目录」两段式：                     */
/*  - 首屏整个交给场景，一屏之下直接进入阅读；                            */
/*  - 目录不用卡片、不用入场动画 —— FadeUp 依赖 IntersectionObserver，   */
/*    JS 失败时内容会停在 opacity: 0，首页正文不能有这种依赖。            */
/* ------------------------------------------------------------------ */
export default async function Home() {
  const posts = await getAllPostMeta();
  const listed = posts.slice(0, INDEX_LIMIT);

  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />
      <div>
        <HeroSection />

        {/* ===================== 文章目录 ===================== */}
        <section className="px-6 py-20 md:py-28" aria-labelledby="index-heading">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-baseline justify-between gap-6 border-b border-borderline pb-4">
              <h2
                id="index-heading"
                className="font-serif text-2xl font-bold tracking-wide text-title md:text-3xl"
              >
                最近写的
              </h2>
              <Link
                href="/blog"
                className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-muted transition-colors duration-300 hover:text-primary focus-ring"
              >
                全部文章
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <ul>
              {listed.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 border-b border-borderline/60 py-5 transition-colors duration-300 focus-ring-inset sm:grid sm:grid-cols-[7.5rem_4.5rem_1fr_auto] sm:items-baseline sm:gap-6"
                  >
                    <time
                      dateTime={post.pubDate}
                      className="font-mono text-xs tracking-wider text-muted tabular-nums"
                    >
                      {new Date(post.pubDate).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }).replace(/\//g, ".")}
                    </time>
                    <span className="text-xs text-muted">{post.category || ""}</span>
                    <span className="font-serif text-base font-medium leading-snug text-title transition-colors duration-300 group-hover:text-primary sm:text-lg">
                      {post.title}
                    </span>
                    <ArrowRight
                      className="hidden h-4 w-4 shrink-0 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:block"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {/* 底部纯文字入口：不在导航菜单里重复的那些页面 */}
            <nav
              className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3"
              aria-label="站点导航"
            >
              {ENTRIES.map((entry) => (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-body transition-colors duration-300 hover:text-primary focus-ring"
                >
                  {entry.label}
                  <ArrowRight
                    className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
