"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { TimeThemeController } from "@/components/layout/TimeThemeController";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      // 主题不再跟随操作系统 prefers-color-scheme：首次主题由 app/layout.tsx 的
      // 预绘种子脚本按本地时间写入 localStorage（defaultTheme 仅作无存储/被禁用时的兜底）。
      defaultTheme="light"
      enableSystem={false}
      // 切换主题时临时禁用全站 CSS 过渡（约 1 帧），让所有颜色在同一帧内统一翻转。
      // 若保持过渡开启，只有带 transition 的元素（body / Header / 按钮）会渐变，
      // 其余卡片、边框瞬间变色 → 新旧色混杂产生「闪烁」。统一瞬时切换反而干净。
      // 注意：Hero 日夜场景的 0.9s 交叉淡出由 Framer Motion 以内联 opacity 驱动
      // （见 components/home/HeroSection.tsx），不受此处注入的 `transition: none` 影响，
      // 手动切换时淡出依然保留 —— 与本文件注释保持同步，勿再写成「淡出被牺牲」。
      disableTransitionOnChange
      enableColorScheme={false}
    >
      {children}
      <TimeThemeController />
    </ThemeProvider>
  );
}
