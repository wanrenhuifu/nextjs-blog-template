import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { BackLink } from "@/components/layout/BackLink";
import {
  CloudRain,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { getWeatherData } from "@/lib/data";
import type { WeatherAlert } from "@/lib/types";

export const metadata: Metadata = {
  title: "天气预警",
  description: "中国 31 省会城市极端天气预警监测，颜色分级展示红色/橙色/黄色/蓝色预警，每日更新。",
  alternates: {
    canonical: absoluteUrl("/radar/weather/"),
  },
};

interface CityMap {
  name: string;
  left: number;
  top: number;
  region: string;
}

const CITIES: CityMap[] = [
  // 东北
  { name: "哈尔滨", left: 82, top: 8, region: "东北" },
  { name: "长春", left: 82, top: 15, region: "东北" },
  { name: "沈阳", left: 80, top: 20, region: "东北" },
  // 华北
  { name: "呼和浩特", left: 58, top: 22, region: "华北" },
  { name: "北京", left: 72, top: 25, region: "华北" },
  { name: "天津", left: 74, top: 27, region: "华北" },
  { name: "石家庄", left: 68, top: 30, region: "华北" },
  { name: "太原", left: 60, top: 30, region: "华北" },
  // 华东
  { name: "济南", left: 72, top: 35, region: "华东" },
  { name: "南京", left: 75, top: 42, region: "华东" },
  { name: "合肥", left: 72, top: 45, region: "华东" },
  { name: "上海", left: 80, top: 43, region: "华东" },
  { name: "杭州", left: 78, top: 45, region: "华东" },
  { name: "福州", left: 78, top: 58, region: "华东" },
  { name: "南昌", left: 68, top: 52, region: "华东" },
  // 华中
  { name: "郑州", left: 62, top: 38, region: "华中" },
  { name: "武汉", left: 64, top: 48, region: "华中" },
  { name: "长沙", left: 60, top: 52, region: "华中" },
  // 华南
  { name: "广州", left: 65, top: 65, region: "华南" },
  { name: "南宁", left: 55, top: 68, region: "华南" },
  { name: "海口", left: 62, top: 78, region: "华南" },
  // 西南
  { name: "重庆", left: 48, top: 48, region: "西南" },
  { name: "成都", left: 42, top: 50, region: "西南" },
  { name: "贵阳", left: 45, top: 58, region: "西南" },
  { name: "昆明", left: 38, top: 62, region: "西南" },
  { name: "拉萨", left: 25, top: 48, region: "西南" },
  // 西北
  { name: "西安", left: 52, top: 40, region: "西北" },
  { name: "兰州", left: 40, top: 38, region: "西北" },
  { name: "西宁", left: 35, top: 36, region: "西北" },
  { name: "银川", left: 45, top: 28, region: "西北" },
  { name: "乌鲁木齐", left: 15, top: 14, region: "西北" },
  // 港澳台
  { name: "台北", left: 88, top: 62, region: "港澳台" },
  { name: "香港", left: 70, top: 69, region: "港澳台" },
  { name: "澳门", left: 67, top: 69, region: "港澳台" },
];

const REGION_ORDER = ["华北", "东北", "华东", "华中", "华南", "西南", "西北", "港澳台"];

const ALERT_CARD_CLASSES: Record<string, string> = {
  red: "bg-danger/5 border-danger/30",
  orange: "bg-warning/5 border-warning/30",
  yellow: "bg-caution/5 border-caution/30",
  blue: "bg-info/5 border-info/30",
};

const ALERT_BADGE_CLASSES: Record<string, string> = {
  red: "bg-danger/10 text-danger",
  orange: "bg-warning/10 text-warning",
  yellow: "bg-caution/10 text-caution",
  blue: "bg-info/10 text-info",
};

const ALERT_LABEL_MAP: Record<string, string> = {
  red: "红色",
  orange: "橙色",
  yellow: "黄色",
  blue: "蓝色",
};

function getTopAlertColor(alerts: WeatherAlert[]): string {
  if (alerts.length === 0) return "";
  const order = { red: 0, orange: 1, yellow: 2, blue: 3 };
  return alerts.reduce((top, a) => {
    if ((order[a.colorCode as keyof typeof order] ?? 99) < (order[top as keyof typeof order] ?? 99)) {
      return a.colorCode;
    }
    return top;
  }, alerts[0].colorCode);
}

export default async function WeatherPage() {
  const data = await getWeatherData();

  // Build city -> alert map
  const alertMap = new Map<string, WeatherAlert[]>();
  for (const alert of data.alerts) {
    const list = alertMap.get(alert.city) || [];
    list.push(alert);
    alertMap.set(alert.city, list);
  }

  // Group cities by region
  const regionGroups = new Map<string, CityMap[]>();
  for (const city of CITIES) {
    const list = regionGroups.get(city.region) || [];
    list.push(city);
    regionGroups.set(city.region, list);
  }

  const redCount = data.alerts.filter((a) => a.colorCode === "red").length;
  const orangeCount = data.alerts.filter((a) => a.colorCode === "orange").length;
  const yellowCount = data.alerts.filter((a) => a.colorCode === "yellow").length;
  const blueCount = data.alerts.filter((a) => a.colorCode === "blue").length;

  return (
    <PageShell>
      <section className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <BackLink href="/radar">返回雷达</BackLink>

          {/* Header */}
          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 rounded-full bg-primary/60" />
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">
                  Weather
                </span>
                <PageTitle className="mt-1">天气预警</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              中国城市天气预警监测，展示全部级别预警
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="w-3.5 h-3.5" />
                更新于 {data.updatedAt.slice(0, 10)}
              </span>
              {redCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-danger">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  红色预警 {redCount} 条
                </span>
              )}
              {orangeCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  橙色预警 {orangeCount} 条
                </span>
              )}
              {yellowCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-caution">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  黄色预警 {yellowCount} 条
                </span>
              )}
              {blueCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-info">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  蓝色预警 {blueCount} 条
                </span>
              )}
              {data.alerts.length === 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-success">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  当前无预警
                </span>
              )}
            </div>
          </div>

          {/* China Map Scatter */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-title mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              全国预警分布
            </h2>
            <div className="concept-card bg-card border border-borderline rounded-2xl p-4 md:p-6 overflow-hidden">
              <div
                className="relative w-full mx-auto"
                style={{ maxWidth: 720, aspectRatio: "4 / 3" }}
              >
                {/* Background grid lines */}
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute top-0 bottom-0 border-l border-dashed border-borderline"
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute left-0 right-0 border-t border-dashed border-borderline"
                      style={{ top: `${(i + 1) * 10}%` }}
                    />
                  ))}
                </div>

                {/* China outline approximation (simple border box) */}
                <div className="absolute inset-[4%] border border-borderline/40 rounded-lg opacity-50" />

                {/* City dots */}
                {CITIES.map((city) => {
                  const alerts = alertMap.get(city.name) || [];
                  const topColor = getTopAlertColor(alerts);
                  const isNoData = city.name === "台北" || city.name === "香港" || city.name === "澳门";

                  let dotClass = "bg-muted/40";
                  let ringClass = "";
                  let size = 8;
                  if (isNoData) {
                    dotClass = "bg-gray-500/50";
                  } else {
                    switch (topColor) {
                      case "red":
                        dotClass = "bg-danger";
                        ringClass = "ring-2 ring-danger/30";
                        size = 12;
                        break;
                      case "orange":
                        dotClass = "bg-warning";
                        ringClass = "ring-2 ring-warning/30";
                        size = 10;
                        break;
                      case "yellow":
                        dotClass = "bg-caution";
                        ringClass = "ring-2 ring-caution/30";
                        size = 10;
                        break;
                      case "blue":
                        dotClass = "bg-info";
                        ringClass = "ring-2 ring-info/30";
                        size = 9;
                        break;
                    }
                  }

                  return (
                    <div
                      key={city.name}
                      className="absolute group"
                      style={{
                        left: `${city.left}%`,
                        top: `${city.top}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`rounded-full ${dotClass} ${ringClass} transition-all duration-300 group-hover:scale-150 cursor-pointer`}
                        style={{ width: size, height: size }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-card border border-borderline shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div className="text-xs font-medium text-title">
                          {city.name}
                        </div>
                        {isNoData ? (
                          <div className="text-[10px] text-muted mt-0.5">
                            暂无数据
                          </div>
                        ) : alerts.length > 0 ? (
                          <div className="text-[10px] text-muted mt-0.5">
                            {alerts[0].eventTypeName}
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted mt-0.5">
                            暂无预警
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-muted/70 whitespace-nowrap hidden md:block">
                        {city.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-danger ring-2 ring-danger/30" />
                  <span className="text-xs text-muted">红色预警</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning ring-2 ring-warning/30" />
                  <span className="text-xs text-muted">橙色预警</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-caution ring-2 ring-caution/30" />
                  <span className="text-xs text-muted">黄色预警</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-info ring-2 ring-info/30" />
                  <span className="text-xs text-muted">蓝色预警</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-muted/40" />
                  <span className="text-xs text-muted">暂无预警</span>
                </div>
              </div>
            </div>
          </div>

          {/* City List by Region */}
          <div>
            <h2 className="text-lg font-bold text-title mb-4 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-primary" />
              31 城市详情
            </h2>
            <div className="space-y-6">
              {REGION_ORDER.map((region) => {
                const cities = regionGroups.get(region) || [];
                return (
                  <div key={region}>
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-1">
                      {region}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cities.map((city) => {
                        const alerts = alertMap.get(city.name) || [];
                        const hasAlert = alerts.length > 0;
                        const topAlert = alerts[0];
                        const isNoData = city.name === "台北" || city.name === "香港" || city.name === "澳门";

                        return (
                          <div
                            key={city.name}
                            className={`concept-card rounded-xl p-4 border transition-all duration-200 ${
                              isNoData
                                ? "bg-card border-borderline/60"
                                : hasAlert
                                  ? ALERT_CARD_CLASSES[topAlert.colorCode] || "bg-card border-borderline"
                                  : "bg-card border-borderline"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted" />
                                <span className="text-sm font-medium text-title">
                                  {city.name}
                                </span>
                              </div>
                              {isNoData ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-muted">
                                  暂无数据
                                </span>
                              ) : hasAlert ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                    ALERT_BADGE_CLASSES[topAlert.colorCode] || "bg-muted/10 text-muted"
                                  }`}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {ALERT_LABEL_MAP[topAlert.colorCode] || topAlert.colorCode}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">
                                  <ShieldCheck className="w-3 h-3" />
                                  正常
                                </span>
                              )}
                            </div>
                            {hasAlert && (
                              <div className="mt-2 text-xs text-body leading-relaxed">
                                {topAlert.headline || topAlert.eventTypeName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
