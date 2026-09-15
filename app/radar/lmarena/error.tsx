"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function LmArenaError({
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
      title="排行榜加载失败"
      description="无法加载 LMArena 排行榜数据，请稍后重试。"
    />
  );
}
