"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

/**
 * 页面离开时切换标签页标题
 *
 * 当用户切换到其他标签页或最小化窗口时，标题变为「等你回来哦」；
 * 切回时恢复为 Next.js 当前路由的真实标题。
 *
 * 用 MutationObserver 追踪 <title> 的变化（Next.js 在客户端导航时
 * 会更新 <title>），确保切回时恢复的是最新标题，而不是挂载时的快照。
 */
export function FarewellTitle() {
  const currentTitleRef = useRef<string>("");
  const isAwayRef = useRef(false);

  useEffect(() => {
    const titleEl = document.querySelector("title");
    if (!titleEl) return;

    // 初始化：记录当前标题
    currentTitleRef.current = document.title;

    // 监听 <title> 元素内容变化（Next.js 路由切换时更新）
    const observer = new MutationObserver(() => {
      if (!isAwayRef.current) {
        currentTitleRef.current = document.title;
      }
    });
    observer.observe(titleEl, { childList: true, characterData: true, subtree: true });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        isAwayRef.current = true;
        currentTitleRef.current = document.title; // 暂存当前标题
        document.title = `💭 等你回来哦 · ${site.name}`;
      } else {
        isAwayRef.current = false;
        document.title = currentTitleRef.current; // 恢复
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
