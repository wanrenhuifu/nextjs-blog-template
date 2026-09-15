/**
 * 按本地时间自动切换日/夜主题的纯工具模块（无 DOM、无 React，构建期可安全引入）。
 *
 * 设计要点：
 * - 站点不再跟随操作系统 prefers-color-scheme，默认按访客本地时间判定日/夜；
 * - 「自动」不是一个可见的模式：首次访问即按时间落地日/夜主题；用户一旦手动
 *   切换（ThemeToggle），会写入 THEME_MODE_KEY = "pinned" 标记并退出自动跟随
 *   （按用户要求，不提供「回到自动」的 UI，清除站点数据即可恢复）；
 * - 消费方：app/layout.tsx 的预绘种子脚本（内联进模板字符串）、
 *   components/layout/TimeThemeController.tsx、components/layout/ThemeToggle.tsx。
 */

/** 日间起始小时（含）：06:00 起视为日间 */
export const DAY_START_HOUR = 6;
/** 日间结束小时（不含）：18:00 起视为夜间（半开区间 [6, 18)） */
export const DAY_END_HOUR = 18;

/** 「主题模式」标记的 localStorage 键：缺席 = 自动（按时间），"pinned" = 用户手动锁定 */
export const THEME_MODE_KEY = "theme-mode";
/** 手动锁定标记值 */
export const THEME_MODE_PINNED = "pinned";

/** 浏览器主题色（meta[name="theme-color"]）：与 layout.tsx 原 viewport 色值一致 */
export const LIGHT_THEME_COLOR = "#FAFAF8";
export const DARK_THEME_COLOR = "#0A0A0D";

export type TimeTheme = "light" | "dark";

/** 按日期（默认当前本地时间）判定日/夜主题 */
export function themeForDate(date: Date = new Date()): TimeTheme {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? "light" : "dark";
}

/**
 * 距下一个日/夜边界（06:00 或 18:00）的毫秒数，用于调度「准点翻转」。
 * 若当前在日间 → 距今日 18:00；夜间 → 距今日 06:00（凌晨时段）或次日 06:00。
 */
export function msUntilNextBoundary(now: Date = new Date()): number {
  const msInHour = 3_600_000;
  const msInDay = 24 * msInHour;
  const msNow =
    now.getHours() * msInHour +
    now.getMinutes() * 60_000 +
    now.getSeconds() * 1_000 +
    now.getMilliseconds();

  if (now.getHours() < DAY_START_HOUR) {
    // 深夜：距今日 06:00
    return DAY_START_HOUR * msInHour - msNow;
  }
  if (now.getHours() < DAY_END_HOUR) {
    // 日间：距今日 18:00
    return DAY_END_HOUR * msInHour - msNow;
  }
  // 夜晚：距次日 06:00
  return DAY_START_HOUR * msInHour + msInDay - msNow;
}

/**
 * 预绘种子脚本字符串：由本模块常量生成，注入 app/layout.tsx 的 <body> 最前，
 * 先于 next-themes 的防闪脚本（渲染于 <body> 内 ThemeProvider 中）执行。
 * - 用户未手动锁定（theme-mode !== "pinned"）时：按本地时间把日/夜主题写入
 *   next-themes 的 localStorage 键 "theme"，让 next-themes 首帧即应用正确主题；
 * - 同步浏览器主题色 meta[name="theme-color"] 与实际主题一致。
 * 返回纯字符串，模块作用域内不触碰任何浏览器 API（符合 lib/AGENTS.md）。
 */
export function buildTimeThemeScript(): string {
  const key = JSON.stringify(THEME_MODE_KEY);
  const pinned = JSON.stringify(THEME_MODE_PINNED);
  const light = JSON.stringify(LIGHT_THEME_COLOR);
  const dark = JSON.stringify(DARK_THEME_COLOR);
  const script = `(function(){try{var k=${key};if(localStorage.getItem(k)===${pinned})return;var h=new Date().getHours();var t=(h>=${DAY_START_HOUR}&&h<${DAY_END_HOUR})?'light':'dark';localStorage.setItem('theme',t);var mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',t==='dark'?${dark}:${light});}catch(e){}})();`;
  // 安全网：任何常量未来若含 "</"，转义避免逃逸出 script 标签（HTML 解析层）
  return script.replace(/<\//g, "<\\/");
}
