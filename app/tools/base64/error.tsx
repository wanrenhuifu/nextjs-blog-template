"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function Base64Error({
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
      description="无法加载 Base64 编解码工具，请稍后重试。"
    />
  );
}
