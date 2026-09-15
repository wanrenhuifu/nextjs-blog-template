import fs from "fs/promises";
import path from "path";
import type { Friend } from "./types";
import { friendsSchema } from "./schemas";

const DATA_DIR = path.join(process.cwd(), "data");

function handleDataError<T>(context: string, error: unknown, fallback: T): T {
  if (error instanceof Error && "issues" in error) {
    console.error(`[data] ${context} 数据校验失败:`, error);
  } else {
    console.error(`[data] ${context} 数据读取失败:`, error);
  }
  return fallback;
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
