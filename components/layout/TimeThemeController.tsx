"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  THEME_MODE_KEY,
  THEME_MODE_PINNED,
  LIGHT_THEME_COLOR,
  DARK_THEME_COLOR,
  themeForDate,
  msUntilNextBoundary,
} from "@/lib/timeTheme";

/**
 * TimeThemeController —— 按本地时间自动同步日/夜主题的隐形组件（无 UI，渲染 null）。
 *
 * - 用户未手动锁定（theme-mode !== "pinned"）时：挂载即按当前时间设定主题，
 *   并在下一个日/夜边界（06:00 / 18:00）准点翻转；页面从后台切回或窗口重新
 *   获得焦点时重新校准（覆盖时区/系统时钟变化与后台节流的定时器）。
 * - 用户一旦手动切换（ThemeToggle 写入 "pinned"），本组件停止自动同步：
 *   边界定时器触发时检测到锁定即退出，不再排定下一轮。
 * - 浏览器主题色 meta[name="theme-color"] 始终跟随 resolvedTheme（含手动切换），
 *   与正文主题保持一致。
 *
 * 必须挂载在 <ThemeProvider> 内部（消费 useTheme）。
 */
/** localStorage 不可用（隐私模式等）时视为已锁定，避免反复尝试写入 */
function isPinned(): boolean {
  try {
    return localStorage.getItem(THEME_MODE_KEY) === THEME_MODE_PINNED;
  } catch {
    return true;
  }
}

export function TimeThemeController() {
  const { setTheme, resolvedTheme } = useTheme();

  // 自动同步：定时到下一个日/夜边界翻转主题
  useEffect(() => {
    if (isPinned()) return; // 已手动锁定：不启动自动同步

    let timeoutId = 0;
    const loop = () => {
      if (isPinned()) return; // 边界定时器触发时已锁定 → 停止，不排定下一轮
      clearTimeout(timeoutId);
      const next = themeForDate();
      // 仅在实际需要翻转时 setTheme：预绘种子脚本已应用正确主题时，
      // 不触发 setTheme，避免每次加载都注入 transition:none 并重复写盘。
      if (document.documentElement.getAttribute("data-theme") !== next) {
        setTheme(next);
      }
      timeoutId = window.setTimeout(loop, msUntilNextBoundary());
    };

    const onWake = () => {
      // 后台节流/时区/系统时钟变化后重新评估，并重新锚定定时器
      if (document.visibilityState === "visible") loop();
    };

    loop();
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [setTheme]); // setTheme 引用随主题状态变化：手动切换后本 effect 重跑并因 pinned 停止

  // 主题色 meta 跟随当前主题（自动翻转与手动切换都会触发）
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (meta && resolvedTheme) {
      meta.content =
        resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
    }
  }, [resolvedTheme]);

  return null;
}
