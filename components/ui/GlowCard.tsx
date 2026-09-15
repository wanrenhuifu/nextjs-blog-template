"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * 光斑跟随卡片容器：pointermove 时将坐标写入 --glow-x / --glow-y，
 * 由 .glow-card::after 的径向渐变消费。显隐由 CSS :hover 控制，
 * reduced-motion / 触摸设备下 CSS 直接禁用光斑，JS 也随之一并跳过。
 */
export function GlowCard({ children, className = "" }: GlowCardProps) {
  const rafRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    // 仅在精确指针 + 允许动画的环境下启用，避免触摸端的无效计算
    const mq = window.matchMedia("(pointer: fine), (prefers-reduced-motion: no-preference)");
    const update = () => {
      enabledRef.current =
        window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current) return;
    const el = e.currentTarget;
    const x = e.clientX;
    const y = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--glow-x", `${x - rect.left}px`);
      el.style.setProperty("--glow-y", `${y - rect.top}px`);
    });
  };

  return (
    <div className={`glow-card ${className}`} onPointerMove={onPointerMove}>
      {children}
    </div>
  );
}
