import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  HeartHandshake,
  MessageSquare,
  Rss,
  Wrench,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { site, absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "关于本站",
  description: `关于${site.name}：这个站点有什么，以及它是怎么搭起来的。`,
  alternates: { canonical: absoluteUrl("/about/") },
};

/**
 * 这是模板自带的「关于」页。文案刻意写成通用描述（介绍站点本身而非某个人），
 * 所以 fork 之后不改也能看。**建议改成你自己的介绍** —— 改下面这几段文字即可。
 */

/** 「这里有什么」模块导览。删掉某个路由时记得同步删掉对应条目 */
const SITE_MODULES = [
  {
    href: "/blog",
    icon: BookOpen,
    name: "文章",
    desc: "技术记录与生活随想，按类型与标签归档。",
  },
  {
    href: "/tools",
    icon: Wrench,
    name: "工坊",
    desc: "手搓的小工具合集，打开即用。",
  },
  {
    href: "/friends",
    icon: HeartHandshake,
    name: "友链",
    desc: "互联网邻居们，欢迎串门。",
  },
  {
    href: "/guestbook",
    icon: MessageSquare,
    name: "留言",
    desc: "一块留言板，路过请留个脚印。",
  },
] as const;

/** 「站点构成」事实清单 */
const SITE_FACTS = [
  { label: "形态", value: "纯静态站点 · 可部署到任意静态托管" },
  { label: "框架", value: "Next.js · React · Tailwind CSS" },
  { label: "主题", value: "日间「竹林风」/ 夜间「星月夜」" },
  { label: "内容", value: "MDX · 代码高亮 · KaTeX 公式" },
  { label: "许可", value: "MIT License" },
];

export default function AboutPage() {
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
                  About
                </span>
                <PageTitle className="mt-1">关于本站</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              这个站点有什么，以及它是怎么搭起来的。
            </p>
          </div>

          {/* 站名卡片 */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-borderline mb-14">
            <div className="space-y-3 min-w-0">
              <h2 className="text-title text-2xl font-bold font-serif">
                {site.name}
              </h2>
              <p className="text-body text-muted">{site.description}</p>
              <div className="flex flex-wrap gap-2">
                {["独立站点", "代码与文字", "持续更新"].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-hover text-muted border border-borderline"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                {/* github 未配置时隐藏入口，避免出现指向 /undefined 的坏链 */}
                {site.githubUrl && (
                  <a
                    href={site.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-hover text-body border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                    GitHub
                  </a>
                )}
                <Link
                  href="/guestbook"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-hover text-body border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                  给我留言
                </Link>
                <Link
                  href="/rss.xml"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-hover text-body border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                >
                  <Rss className="w-4 h-4" strokeWidth={1.5} />
                  RSS
                </Link>
              </div>
            </div>
          </div>

          {/* 关于本站 */}
          <section className="mb-16">
            <h2 className="flex items-center gap-3 text-title text-xl font-bold font-serif mb-5">
              <span className="w-1 h-5 rounded-full bg-primary/60" />
              关于本站
            </h2>
            <div className="space-y-4 text-body leading-relaxed max-w-2xl">
              <p>
                这是一个纯静态的个人站点：写作在本地完成，构建时把每篇文章渲染成 HTML，
                部署后不需要服务器与数据库。
              </p>
              <p>
                写完的东西按<span className="text-primary-strong font-medium">类型</span>和
                <span className="text-primary-strong font-medium">标签</span>归置好，
                方便日后翻找，也方便路过的你。
              </p>
              <p>
                除了文章，这里还有一些点开就能用的小东西 —— 工坊里是各类计算器与转换工具，
                全部在浏览器本地运行，不上传任何数据。
              </p>
              <p>
                站点有两副面孔——日间「竹林风」，夜间「星月夜」，会按你的本地时间自动切换，
                右上角也能手动改。无论你是循着搜索来的，还是从友链串门来的，
                都欢迎坐下歇歇脚。
              </p>
            </div>
          </section>

          {/* 这里有什么 */}
          <section className="mb-16">
            <h2 className="flex items-center gap-3 text-title text-xl font-bold font-serif mb-5">
              <span className="w-1 h-5 rounded-full bg-primary/60" />
              这里有什么
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SITE_MODULES.map(({ href, icon: Icon, name, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-4 p-5 rounded-xl bg-card border border-borderline hover:border-primary/30 hover:bg-hover transition-all duration-200"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary-strong shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-title font-medium font-serif">
                      {name}
                      <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </span>
                    <span className="block mt-1 text-body-sm text-muted">
                      {desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 站点构成 */}
          <section className="mb-16">
            <h2 className="flex items-center gap-3 text-title text-xl font-bold font-serif mb-5">
              <span className="w-1 h-5 rounded-full bg-primary/60" />
              站点构成
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 p-5 rounded-xl bg-card border border-borderline max-w-2xl">
              {SITE_FACTS.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-3">
                  <dt className="text-caption text-muted shrink-0 w-10">
                    {label}
                  </dt>
                  <dd className="text-body-sm text-body font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 联系我 */}
          <section>
            <h2 className="flex items-center gap-3 text-title text-xl font-bold font-serif mb-5">
              <span className="w-1 h-5 rounded-full bg-primary/60" />
              联系我
            </h2>
            <p className="text-body text-muted max-w-2xl mb-5">
              想交换友链、发现了 bug，或者只是想打个招呼——留言板的门一直敞开。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guestbook"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-on-primary hover:bg-primary-hover transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                去留言板
              </Link>
              {site.githubUrl && (
                <a
                  href={site.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-hover text-body border border-borderline hover:border-primary/30 hover:text-primary transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                  GitHub
                </a>
              )}
            </div>
          </section>
        </div>
      </section>
    </PageShell>
  );
}
