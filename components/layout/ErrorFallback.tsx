"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = "出了点问题",
  description = "页面加载时遇到了错误。您可以尝试刷新，或返回首页。",
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1
        className="text-title font-serif mb-4"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
        }}
      >
        {title}
      </h1>
      <p className="text-muted mb-8 max-w-md">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary-hover transition-colors"
        >
          重试
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-card border border-borderline text-body hover:border-primary/30 hover:text-primary transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
