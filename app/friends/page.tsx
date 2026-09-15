import { Users, ExternalLink } from "lucide-react";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { GlowCard } from "@/components/ui/GlowCard";
import { getFriends } from "@/lib/data";
import { site, absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "友链",
  description: `${site.name}的友链页面`,
  alternates: { canonical: absoluteUrl("/friends/") },
};

export default async function FriendsPage() {
  const friends = await getFriends();

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
                  Friends
                </span>
                <PageTitle className="mt-1">友链</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              交换友链，共同进步。
            </p>
          </div>

          {/* Friend Count */}
          <div className="flex items-center gap-2 text-body-sm text-muted mb-8">
            <Users className="w-4 h-4" />
            <span>共 {friends.length} 位友人</span>
          </div>

          {/* Friends Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((friend, i) => (
              <FadeUp key={friend.name} delay={Math.min(i * 80, 400)}>
                <GlowCard className="rounded-2xl h-full">
                <a
                  href={friend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`访问 ${friend.name} 的博客（新标签页）`}
                  className="concept-card group flex items-start gap-4 bg-card border border-borderline rounded-2xl p-5 hover:border-primary/40 transition-all duration-200 h-full"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {friend.avatar ? (
                      <Image
                        src={friend.avatar}
                        alt={friend.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg text-muted">
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-title-sm text-title font-semibold group-hover:text-primary transition-colors duration-200 truncate">
                      {friend.name}
                    </h2>
                    <p className="text-body-sm text-muted mt-1 line-clamp-2">
                      {friend.description}
                    </p>
                  </div>

                  {/* External Link Icon */}
                  <ExternalLink className="w-4 h-4 text-muted group-hover:text-primary transition-colors duration-200 shrink-0 mt-1" />
                </a>
                </GlowCard>
              </FadeUp>
            ))}
          </div>

          {/* 申请友链 */}
          <FadeUp>
          <div className="mt-16 space-y-5 rounded-2xl bg-card border border-borderline p-6 md:p-8">
            <h2 className="text-xl font-bold text-title">申请友链</h2>
            <p className="text-muted text-sm">
              欢迎交换友链！请先在您的站点添加本站信息，然后通过任意方式联系我。
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-body">本站信息</h3>
              <div className="space-y-2 text-sm text-muted bg-app/50 rounded-xl p-4 border border-borderline">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong className="text-body">名称：</strong>{site.name}</span>
                  <span><strong className="text-body">地址：</strong><a href={site.url} className="text-primary hover:underline">{site.url}</a></span>
                </div>
                <p><strong className="text-body">描述：</strong>{site.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-body">申请要求</h3>
              <ul className="list-disc list-inside text-sm text-muted space-y-1">
                <li>站点内容健康，无违法违规信息</li>
                <li>博客类、技术类、个人站点优先</li>
                <li>站点能正常访问，更新频率不限</li>
                <li>请先在贵站添加本站链接后再申请</li>
              </ul>
            </div>
          </div>
          </FadeUp>
        </div>
      </section>
    </PageShell>
  );
}
