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
