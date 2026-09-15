"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function FriendsError({
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
      title="友链加载失败"
      description="无法加载友链数据，请稍后重试。"
    />
  );
}
