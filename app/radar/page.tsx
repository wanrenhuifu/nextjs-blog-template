import { PageShell } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { PageTitle } from "@/components/layout/PageTitle";
import { Trophy, CloudRain, ExternalLink, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLmArenaData, getWeatherData } from "@/lib/data";
import type { LmArenaData, WeatherData } from "@/lib/types";
import { LmArenaTable } from "@/components/radar/LmArenaTable";
import { VISIBLE_LMARENA_SLUGS } from "@/lib/constants";

export const metadata = {
  title: "雷达",
  description: "前沿信息自动播报",
  alternates: { canonical: absoluteUrl("/radar/") },
};

export default async function RadarPage() {
  const lmarena: LmArenaData = await getLmArenaData();
  const visibleBoards = lmarena.leaderboards
    .filter((l) => VISIBLE_LMARENA_SLUGS.includes(l.slug))
    .sort(
      (a, b) =>
        VISIBLE_LMARENA_SLUGS.indexOf(a.slug) - VISIBLE_LMARENA_SLUGS.indexOf(b.slug)
    );
  const previewBoard = visibleBoards[0];

  const weather: WeatherData = await getWeatherData();
  const severeAlerts = weather.alerts.filter(
    (a) => a.colorCode === "red" || a.colorCode === "orange"
  );

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
                  Radar
                </span>
                <PageTitle className="mt-1">雷达</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              追踪前沿趋势的信息播报
            </p>
          </div>

          {/* LLM Arena */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-title-md text-title">
                  大语言模型排行榜
                </h2>
                <p className="text-body-sm text-muted">
                  {previewBoard?.description || lmarena.description}
                </p>
              </div>
            </div>

            <div className="concept-card bg-card border border-borderline rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="px-6 py-3.5 border-b border-borderline bg-hover/20 flex items-center gap-3">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-title">
                  {previewBoard?.category || "文本总榜"}
                </span>
              </div>

              <LmArenaTable items={previewBoard?.items ?? []} />

              <div className="flex items-center justify-between px-6 py-3 border-t border-borderline bg-hover/10">
                <div className="flex items-center gap-2 text-caption text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>更新于 {lmarena.updatedAt}</span>
                </div>
                <a
                  href={lmarena.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-caption text-link hover:text-link-hover transition-colors"
                >
                  {lmarena.source}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="px-6 py-3 border-t border-borderline bg-hover/5">
                <Link
                  href="/radar/lmarena"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors font-medium"
                >
                  查看全部 {visibleBoards.length} 种排行
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Weather Alerts */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <CloudRain className="w-5 h-5 text-decor" />
              </div>
              <div>
                <h2 className="text-title-md text-title">天气预警</h2>
                <p className="text-body-sm text-muted">
                  中国城市极端天气监测，仅展示橙色及以上预警
                </p>
              </div>
            </div>

            {severeAlerts.length > 0 ? (
              <div className="concept-card bg-card border border-borderline rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  {severeAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-hover/30 border border-borderline/60 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
                          <CloudRain className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-title-sm text-title mb-1">
                            {alert.headline}
                          </h3>
                          <span className="inline-block px-2 py-0.5 rounded text-caption bg-warning/10 text-warning mb-2">
                            {alert.eventTypeName}
                          </span>
                          <p className="text-body-sm text-body">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-borderline bg-hover/20">
                  <Link
                    href="/radar/weather"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors font-medium"
                  >
                    查看 31 城市地图详情
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="concept-card bg-card border border-borderline rounded-2xl p-8 text-center">
                <CloudRain className="w-10 h-10 text-muted opacity-40 mx-auto mb-3" />
                <p className="text-body text-muted">当前暂无天气预警</p>
                <p className="text-caption text-muted mt-1">
                  数据来自 {weather.source} · {weather.updatedAt.slice(0, 10)}
                </p>
                <Link
                  href="/radar/weather"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors font-medium mt-4"
                >
                  查看 31 城市地图详情
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
