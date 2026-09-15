"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="工具加载失败"
      description="无法加载工坊页面，请稍后重试。"
    />
  );
}
