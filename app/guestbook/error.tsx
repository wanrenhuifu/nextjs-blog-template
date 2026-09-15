"use client";

import { ErrorFallback } from "@/components/layout/ErrorFallback";

export default function GuestbookError({
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
      title="留言加载失败"
      description="留言暂时无法加载，请稍后重试。"
    />
  );
}
