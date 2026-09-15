"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function WeatherError({
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
      title="天气数据加载失败"
      description="无法加载天气预警数据，请稍后重试。"
    />
  );
}
