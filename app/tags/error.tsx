"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function TagsError({
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
      title="标签加载失败"
      description="无法加载标签数据，请稍后重试。"
    />
  );
}
