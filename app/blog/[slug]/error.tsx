"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function PostError({
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
      title="文章加载失败"
      description="无法加载该文章内容，可能是文章数据出现了问题。您可以尝试刷新，或返回文章列表。"
    />
  );
}
