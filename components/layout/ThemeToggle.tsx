"use client";

import { useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { THEME_MODE_KEY, THEME_MODE_PINNED } from "@/lib/timeTheme";

/** 切换节流时长（ms）：与首页 Hero 日夜场景交叉淡出同长，淡出期间忽略重复点击，防止动画被打断重启。
 *  仅首页生效 —— 该淡出只存在于首页，其他页面无动画可保护，不做节流。 */
const TOGGLE_LOCK_MS = 900;

// useSyncExternalStore 的稳定回调：服务端 / hydration 首帧返回 false，挂载后返回 true。
// 用模块级常量保证引用稳定，避免每次渲染重建触发重订阅。
const subscribeMounted = () => () => {};
const getMounted = () => true;
const getServerNotMounted = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  // 节流只作用于首页：Hero 日夜场景 0.9s 交叉淡出只在首页存在（见 HeroSection.tsx）
  const isHome = usePathname() === "/";
  // next-themes 在客户端首帧就已同步解析出主题（读取防闪脚本设置的属性 / matchMedia），
  // 而服务端 resolvedTheme 为 undefined。若只用 `resolvedTheme === undefined` 做门控，
  // 服务端渲染占位 <div>、客户端首帧渲染 <button>，必然 hydration 不一致。
  // 故以「是否已挂载」做门控，让服务端与客户端首帧都渲染占位，挂载后再切换到真实按钮。
  // 这里用 useSyncExternalStore 而非 useEffect+setState 的 mounted 套路，
  // 以符合本仓 react-hooks/set-state-in-effect 规则（禁止在 effect 内同步 setState）。
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServerNotMounted);
  // 节流：记录上次切换时间戳。仅首页的交叉淡出（0.9s）进行中会忽略重复点击，
  // 避免动画被打断重启；其他页面无淡出，快速连续切换立即响应。
  // reduced-motion 下无淡出（瞬时切换），故不节流。
  const lastToggleRef = useRef(0);

  if (!mounted || resolvedTheme === undefined) {
    return <div className="min-w-11 min-h-11" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    // 手动切换即退出「按时间自动」：写入 pinned 标记，TimeThemeController 据此停止自动同步
    // （按用户要求不提供「回到自动」的按钮，清除站点数据即可恢复）。
    const pin = () => {
      try {
        localStorage.setItem(THEME_MODE_KEY, THEME_MODE_PINNED);
      } catch {
        // localStorage 不可用时忽略：手动切换仍于内存生效，只是不持久化
      }
    };
    if (shouldReduceMotion) {
      pin();
      setTheme(isDark ? "light" : "dark");
      return;
    }
    // 仅首页做节流（Hero 淡出进行中忽略重复点击）；非首页即时响应。
    if (isHome) {
      const now = Date.now();
      if (now - lastToggleRef.current < TOGGLE_LOCK_MS) return;
      lastToggleRef.current = now;
    }
    pin();
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      id="theme-toggle"
      onClick={handleToggle}
      className="flex items-center justify-center min-w-11 min-h-11 text-muted hover:text-title transition-colors duration-200 focus-ring"
      aria-label={isDark ? "切换到日间模式" : "切换到夜间模式"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={shouldReduceMotion ? {} : { rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? {} : { rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
          >
            <Moon className="w-5 h-5" strokeWidth={1.5} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={shouldReduceMotion ? {} : { rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? {} : { rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
          >
            <Sun className="w-5 h-5" strokeWidth={1.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
