"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-hover/80 hover:bg-hover border border-borderline text-caption text-muted hover:text-body transition-all duration-200 backdrop-blur-sm"
      aria-label={copied ? "已复制" : "复制代码"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-success" />
          <span className="text-success">已复制</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>复制</span>
        </>
      )}
    </button>
  );
}
