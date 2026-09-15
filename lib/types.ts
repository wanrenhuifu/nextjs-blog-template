import type { ComponentType } from "react";
import type { PostCategory } from "@/lib/constants";

/** 文章内本地图片的原始尺寸，key 为图片的访问路径（如 `/claude梗图.webp`） */
export type ImageSizeMap = Record<string, { width: number; height: number }>;

export interface Post {
  slug: string;
  title: string;
  pubDate: string;
  updatedDate?: string;
  description?: string;
  tags: string[];
  category?: PostCategory;
  content: string;
  /** 构建期读出的图片尺寸，用于渲染时预留空间 —— 见 lib/content.ts 的 collectImageSizes */
  imageSizes: ImageSizeMap;
  wordCount: number;
  readingTime: number;
  toc: TocItem[];
}

export interface PostMeta {
  slug: string;
  title: string;
  pubDate: string;
  updatedDate?: string;
  description?: string;
  tags: string[];
  category?: PostCategory;
  wordCount: number;
  readingTime: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Friend {
  name: string;
  url: string;
  description: string;
  avatar: string;
  github: string;
}

export interface NavItem {
  href: string;
  label: string;
  children?: NavItem[];
}

export interface SearchItem {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  tags: string[];
}

export interface ToolItem {
  href: string;
  name: string;
  desc: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  iconColor: string;
  borderColor: string;
  category: "quick" | "more" | "projects";
  /** 外部链接（新窗口打开，渲染为 <a> 而非 <Link>） */
  external?: boolean;
}

/* ========== 雷达数据类型 ========== */

export interface LmArenaItem {
  rank: number;
  model: string;
  org: string;
}

export interface Leaderboard {
  slug: string;
  category: string;
  arenaSlug: string;
  description: string;
  items: LmArenaItem[];
}

export interface LmArenaData {
  source: string;
  sourceUrl: string;
  updatedAt: string;
  description: string;
  leaderboards: Leaderboard[];
}

export interface WeatherAlert {
  city: string;
  headline: string;
  eventTypeName: string;
  colorCode: string;
  issuedTime: string;
  senderName: string;
  description: string;
}

export interface WeatherData {
  updatedAt: string;
  source: string;
  count: number;
  alerts: WeatherAlert[];
}
