"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function TypesError({
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
      title="类型加载失败"
      description="无法加载文章类型数据，请稍后重试。"
    />
  );
}
