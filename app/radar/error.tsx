"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function RadarError({
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
      title="雷达数据加载失败"
      description="无法加载排行榜或天气数据，可能是数据源暂时不可用。"
    />
  );
}
