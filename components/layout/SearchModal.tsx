"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, FileText, CornerDownLeft, Tag } from "lucide-react";
import Link from "next/link";
import type { SearchItem } from "@/lib/types";
import { publicUrl } from "@/lib/site";

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
    return results.slice(0, 8);
  }, [query, items]);

  useEffect(() => {
    if (!open) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    // 裸 fetch 不会被 basePath 改写：子路径部署下漏了 publicUrl 会静默 404，
    // 表现是「搜索永远是空的」而控制台只有一条 404
    fetch(publicUrl("/search-index.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [open]);

  // Focus trap: keep Tab / Shift+Tab inside the modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) =>
          Math.min(i + 1, Math.max(filtered.length - 1, 0))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item) {
          onClose();
          router.push(`/blog/${item.slug}`);
        }
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab") {
        // Focus trap
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll<HTMLElement>(
          'input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [open, filtered, selectedIndex, onClose, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    // 延迟重置，避免在 effect body 中同步 setState
    const t = setTimeout(() => {
      setQuery("");
      setSelectedIndex(0);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const hasQuery = query.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            data-print-hide
            className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-md"
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            data-print-hide
            role="dialog"
            aria-modal="true"
            aria-label="搜索文章"
            className="fixed inset-x-4 top-[12vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[101]"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden rounded-2xl border border-borderline/80 bg-app/95 shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-borderline/60">
                <Search className="w-5 h-5 text-muted shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="搜索文章、标签..."
                  className="flex-1 bg-transparent text-base text-title placeholder:text-muted outline-none"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[50vh] overflow-y-auto py-2"
              >
                {loading && (
                  <div className="px-5 py-10 text-center text-base text-muted">
                    加载中...
                  </div>
                )}

                {!loading && hasQuery && filtered.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <FileText className="w-8 h-8 text-muted mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-base text-muted">未找到相关文章</p>
                  </div>
                )}

                {!loading && !hasQuery && (
                  <div className="px-5 py-10 text-center text-base text-muted">
                    输入关键词开始搜索
                  </div>
                )}

                {filtered.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    onClick={onClose}
                    className={`flex items-start gap-3 px-4 py-3 mx-2 rounded-xl transition-colors duration-150 ${
                      i === selectedIndex
                        ? "bg-hover"
                        : "hover:bg-hover/50"
                    }`}
                  >
                    <FileText className="w-5 h-5 text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-title truncate">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-muted bg-hover border border-borderline"
                            >
                              <Tag className="w-3 h-3" strokeWidth={1.5} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {i === selectedIndex && (
                      <CornerDownLeft className="w-5 h-5 text-primary mt-1 shrink-0" strokeWidth={1.5} />
                    )}
                  </Link>
                ))}
              </div>

              {/* Footer */}
              {filtered.length > 0 && (
                <div className="px-5 py-2.5 border-t border-borderline/60 bg-hover/30 flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded-md border border-borderline bg-card text-[11px]">↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded-md border border-borderline bg-card text-[11px]">↓</kbd>
                      <span>选择</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1.5 py-0.5 rounded-md border border-borderline bg-card text-[11px]">↵</kbd>
                      <span>打开</span>
                    </span>
                  </div>
                  <span>{filtered.length} 条结果</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
