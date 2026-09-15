import fs from "fs/promises";
import path from "path";
import type { Friend, LmArenaData, WeatherData } from "./types";
import { friendsSchema, lmArenaDataSchema, weatherDataSchema } from "./schemas";

const DATA_DIR = path.join(process.cwd(), "data");

function handleDataError<T>(context: string, error: unknown, fallback: T): T {
  if (error instanceof Error && "issues" in error) {
    console.error(`[data] ${context} 数据校验失败:`, error);
  } else {
    console.error(`[data] ${context} 数据读取失败:`, error);
  }
  return fallback;
}

export async function getLmArenaData(): Promise<LmArenaData> {
  try {
    const filePath = path.join(DATA_DIR, "radar", "lmarena.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    // safeParse：校验失败不抛异常，返回 result object
    const result = lmArenaDataSchema.safeParse(parsed);

    if (result.success) {
      // 校验通过 → 二次清理（防御性：过滤 model/org 为空、移除空榜单）
      const data = result.data;
      const cleaned = {
        ...data,
        leaderboards: data.leaderboards
          .map((lb) => ({
            ...lb,
            items: lb.items.filter(
              (item) => item.model && item.model.trim() && item.org && item.org.trim()
            ),
          }))
          .filter((lb) => lb.items.length > 0),
      };
      return cleaned;
    }

    // 校验失败 → 尝试从原始 JSON 中抢救有效数据，避免全页降级
    console.error("[data] LMArena 数据校验失败，尝试恢复有效数据:", result.error.issues);
    const rawLbs = Array.isArray(parsed.leaderboards) ? parsed.leaderboards : [];
    const recovered = rawLbs
      .map((lb: Record<string, unknown>) => {
        const items = Array.isArray(lb.items) ? lb.items : [];
        const validItems = items
          .filter(
            (item: Record<string, unknown>) =>
              typeof item.rank === "number" &&
              typeof item.model === "string" && item.model.trim() &&
              typeof item.org === "string" && item.org.trim()
          )
          .slice(0, 10)
          .map((item: Record<string, unknown>) => ({
            rank: item.rank as number,
            model: item.model as string,
            org: item.org as string,
          }));
        return {
          slug: typeof lb.slug === "string" ? lb.slug : "",
          category: typeof lb.category === "string" ? lb.category : "",
          arenaSlug: typeof lb.arenaSlug === "string" ? lb.arenaSlug : "",
          description: typeof lb.description === "string" ? lb.description : "",
          items: validItems,
        };
      })
      .filter((lb: { slug: string; items: unknown[] }) => lb.slug && lb.items.length > 0);

    if (recovered.length > 0) {
      console.warn(`[data] 已恢复 ${recovered.length} 个榜单（部分数据可能缺失）`);
      return {
        source: String(parsed.source || "LMArena"),
        sourceUrl: String(parsed.sourceUrl || "https://arena.ai/leaderboard"),
        updatedAt: String(parsed.updatedAt || new Date().toISOString().split("T")[0]),
        description: String(parsed.description || "数据部分可用"),
        leaderboards: recovered,
      };
    }

    // 完全无法恢复 → fallback
    return {
      source: "LMArena",
      sourceUrl: "https://arena.ai/leaderboard",
      updatedAt: new Date().toISOString().split("T")[0],
      description: "数据暂时不可用",
      leaderboards: [],
    };
  } catch (error) {
    return handleDataError("LMArena", error, {
      source: "LMArena",
      sourceUrl: "https://arena.ai/leaderboard",
      updatedAt: new Date().toISOString().split("T")[0],
      description: "数据暂时不可用",
      leaderboards: [],
    });
  }
}

export async function getWeatherData(): Promise<WeatherData> {
  try {
    const filePath = path.join(DATA_DIR, "radar", "weather-alerts.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return weatherDataSchema.parse(parsed);
  } catch (error) {
    return handleDataError("Weather", error, {
      updatedAt: new Date().toISOString(),
      source: "和风天气",
      count: 0,
      alerts: [],
    });
  }
}

export async function getFriends(): Promise<Friend[]> {
  try {
    const filePath = path.join(DATA_DIR, "friends.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return friendsSchema.parse(parsed);
  } catch (error) {
    return handleDataError("Friends", error, []);
  }
}
