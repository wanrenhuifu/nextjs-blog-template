"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function AboutError({
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
      title="页面加载失败"
      description="无法加载个人简介页面，请稍后重试。"
    />
  );
}
