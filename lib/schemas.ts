import { z } from "zod";
import { POST_CATEGORIES } from "@/lib/constants";

/* ========== 友链 ========== */

export const friendSchema = z.object({
  name: z.string().min(1, "name 不能为空"),
  url: z.string().url("url 必须是合法 URL"),
  description: z.string(),
  avatar: z.string(),
  github: z.string(),
});

export const friendsSchema = z.array(friendSchema);

/* ========== LMArena ========== */

export const lmArenaItemSchema = z.object({
  rank: z.number().int().positive("rank 必须是正整数"),
  model: z.string().min(1, "model 不能为空"),
  org: z.string().min(1, "org 不能为空"),
});

export const leaderboardSchema = z.object({
  slug: z.string(),
  category: z.string(),
  arenaSlug: z.string(),
  description: z.string(),
  items: z.array(lmArenaItemSchema),
});

export const lmArenaDataSchema = z.object({
  source: z.string(),
  sourceUrl: z.string().url(),
  updatedAt: z.string(),
  description: z.string(),
  leaderboards: z.array(leaderboardSchema),
});

/* ========== 天气预警 ========== */

export const weatherAlertSchema = z.object({
  city: z.string(),
  headline: z.string(),
  eventTypeName: z.string(),
  colorCode: z.string(),
  issuedTime: z.string(),
  senderName: z.string(),
  description: z.string(),
});

export const weatherDataSchema = z.object({
  updatedAt: z.string(),
  source: z.string(),
  count: z.number().int().nonnegative("count 不能为负数"),
  alerts: z.array(weatherAlertSchema),
});

/* ========== 文章 Frontmatter ========== */

export const postFrontmatterSchema = z.object({
  title: z.string().min(1).optional(),
  pubDate: z.string().or(z.date()).optional(),
  updatedDate: z.string().or(z.date()).optional(),
  description: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  category: z.enum(POST_CATEGORIES).optional(),
  tocDepth: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});
