"use client";

import { useEffect, type RefObject } from "react";

/** 容器内可聚焦元素的匹配式（与 SearchModal 里原本内联的那份一致） */
const FOCUSABLE =
  'input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 把键盘焦点限制在浮层（模态框、抽屉）内部，并在关闭时归还给打开它的元素。
 *
 * 为什么需要：
 * - **不限制**：按 Tab 会走到浮层背后被遮住的页面上（视觉上看不见焦点在哪），
 *   键盘用户直接迷路。`Header` 已经锁了 `body { overflow: hidden }`，
 *   背后明明「看着是死的、实际还能 Tab 进去」，更糟；
 * - **不归还**：关闭后焦点落到 `<body>`，用户得从头 Tab 一遍才能回到原来的位置。
 *
 * 触发时机用 `delayMs` 留一点余量：开合动画期间元素还在位移，立刻聚焦会与
 * framer-motion 的 transform 打架（也可能聚焦到还在屏幕外的元素上）。
 *
 * @param active       浮层是否打开
 * @param containerRef 浮层根节点
 * @param delayMs      聚焦初次的延迟，默认 50ms
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  delayMs = 50,
) {
  // 焦点进入：记录打开者 → 聚焦容器内第一个可聚焦元素 → 拦截 Tab
  useEffect(() => {
    if (!active) return;

    const opener = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable[0] ?? container).focus?.();
    }, delayMs);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      // 焦点归还：仅在打开者仍在文档里时（它可能已随路由切换被卸载）
      if (opener?.isConnected) opener.focus();
    };
  }, [active, containerRef, delayMs]);
}
