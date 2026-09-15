"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { init } from "@waline/client";
import "@waline/client/style";
import "@/styles/waline.css";

const WALINE_SERVER_URL = process.env.NEXT_PUBLIC_WALINE_SERVER_URL || "";

export function WalineComments({ title = "评论" }: { title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const walineRef = useRef<ReturnType<typeof init> | null>(null);
  const { resolvedTheme } = useTheme();

  // 初始化 Waline（延迟至主题解析完成，避免暗色模式闪烁）
  useEffect(() => {
    if (!containerRef.current || walineRef.current) return;
    if (!WALINE_SERVER_URL) return;
    if (resolvedTheme === undefined) return;

    walineRef.current = init({
      el: containerRef.current,
      serverURL: WALINE_SERVER_URL,
      path: window.location.pathname,
      lang: "zh-CN",
      dark: resolvedTheme === "dark",
      emoji: [
        "https://unpkg.com/@waline/emojis@1.3.0/tieba",
        "https://unpkg.com/@waline/emojis@1.3.0/bmoji",
      ],
      imageUploader: false,
      search: false,
      // 不开启 pageview：Waline 的浏览量自增请求是「发后即忘」且内部未 .catch，
      // 一旦评论服务返回 errno（如服务/数据库不可用）就会变成未捕获的 rejection，
      // 在 dev 触发红色错误遮罩、在生产成为访客侧的 unhandledrejection。
      // 本站模板并未放置 .waline-pageview-count 元素，该计数本就无可视收益，故关闭。
      // 评论列表的读取由 Waline 内部捕获并在挂件内降级展示，不会抛出未捕获错误。
    });
  }, [resolvedTheme]);

  // 组件卸载时销毁 Waline
  useEffect(() => {
    return () => {
      walineRef.current?.destroy();
      walineRef.current = null;
    };
  }, []);

  // 主题切换时更新暗色模式
  useEffect(() => {
    if (!walineRef.current) return;
    walineRef.current.update({
      dark: resolvedTheme === "dark",
    });
  }, [resolvedTheme]);

  if (!WALINE_SERVER_URL) {
    return (
      <div className="mt-16 pt-10 border-t border-borderline">
        <h3 className="text-title-sm text-title mb-6">{title}</h3>
        <p className="text-sm text-muted">
          评论系统未配置。请设置 <code className="text-xs bg-hover px-1.5 py-0.5 rounded border border-borderline">NEXT_PUBLIC_WALINE_SERVER_URL</code> 环境变量。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-10 border-t border-borderline">
      <h3 className="text-title-sm text-title mb-6">{title}</h3>
      <div ref={containerRef} />
    </div>
  );
}
