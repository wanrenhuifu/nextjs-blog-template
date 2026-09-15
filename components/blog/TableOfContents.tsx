"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TocItem } from "@/lib/types";
import { List, ChevronDown } from "lucide-react";

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const tocContainerRef = useRef<HTMLDivElement>(null);

  /* ---------- 用 IntersectionObserver 计算当前高亮 ---------- */
  useEffect(() => {
    if (toc.length === 0) return;

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  /* ---------- 高亮项变化时，让 TOC 容器滚动到对应位置 ---------- */
  useEffect(() => {
    if (!tocContainerRef.current || !activeId) return;

    const container = tocContainerRef.current;
    const activeBtn = container.querySelector<HTMLElement>(
      `[data-toc-id="${CSS.escape(activeId)}"]`
    );
    if (!activeBtn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    if (btnRect.top < containerRect.top + 8) {
      container.scrollTop -= containerRect.top - btnRect.top + 8;
    } else if (btnRect.bottom > containerRect.bottom - 8) {
      container.scrollTop += btnRect.bottom - containerRect.bottom + 8;
    }
  }, [activeId]);

  if (toc.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: shouldReduceMotion ? "auto" : "smooth" });
      setExpanded(false);
    }
  };

  return (
    <>
      {/* 移动端折叠 TOC（order-first 使其在竖排布局中位于正文之前） */}
      <div className="order-first lg:hidden mb-8">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-card border border-borderline text-body hover:border-primary/30 transition-colors"
        >
          <List className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">目录</span>
          <ChevronDown
            className={`w-4 h-4 text-muted ml-auto transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        {expanded && (
          <motion.nav
            initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 px-4 py-3 rounded-xl bg-card border border-borderline"
          >
            <TocList toc={toc} activeId={activeId} onClick={handleClick} />
          </motion.nav>
        )}
      </div>

      {/* 桌面端侧边 TOC（宽屏下贴容器右缘，避免悬浮在大片留白左侧） */}
      <aside className="hidden lg:block w-56 shrink-0 xl:ml-auto">
        <div
          ref={tocContainerRef}
          className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-borderline/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-borderline"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <List className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-title">目录</span>
          </div>
          <TocList toc={toc} activeId={activeId} onClick={handleClick} />
        </div>
      </aside>
    </>
  );
}

function TocList({
  toc,
  activeId,
  onClick,
}: {
  toc: TocItem[];
  activeId: string;
  onClick: (id: string) => void;
}) {
  /* 缩进按绝对层级映射：h2 不缩进，h3 缩一档，h4 缩两档。
     不用「相对最浅层级」计算 —— 全为 h3 的目录会因最浅即 h3 而失去缩进，
     且存在层级跳空（如 h2 + h4）时相对值会错位。 */
  const indentForLevel: Record<number, string> = {
    2: "",
    3: "ml-3",
    4: "ml-6",
  };

  return (
    <ul className="space-y-1">
      {toc.map((item) => (
        <li
          key={item.id}
          className={indentForLevel[item.level] ?? ""}
        >
          <button
            data-toc-id={item.id}
            onClick={() => onClick(item.id)}
            className={`block w-full text-left text-sm leading-relaxed px-2 py-1 rounded-md transition-colors duration-150 ${
              activeId === item.id
                ? "text-primary bg-primary/10 font-medium"
                : "text-muted hover:text-body hover:bg-hover"
            }`}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  );
}
