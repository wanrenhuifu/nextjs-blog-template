"use client";

import { useState, useSyncExternalStore } from "react";
import {
  BAMBOO_LAST_STAGE_KEY,
  BAMBOO_SESSION_KEY,
  BAMBOO_STAGES,
  BAMBOO_VISITS_KEY,
  getBambooStageIndex,
} from "@/lib/bamboo";

/** 读取整数存储值，非法或缺失时回退 */
function readInt(storage: Storage, key: string, fallback: number): number {
  const raw = storage.getItem(key);
  const n = raw === null ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

interface BambooData {
  stage: number;
  leveledUp: boolean;
}

/**
 * 惰性计算当前阶段：同一会话只计 1 次访问（sessionStorage 去重，
 * StrictMode 双渲染下也不会重复累加）。服务端返回 null。
 */
function computeBambooData(): BambooData | null {
  if (typeof window === "undefined") return null;

  let visits = readInt(localStorage, BAMBOO_VISITS_KEY, 0);
  if (!sessionStorage.getItem(BAMBOO_SESSION_KEY)) {
    visits += 1;
    try {
      localStorage.setItem(BAMBOO_VISITS_KEY, String(visits));
      sessionStorage.setItem(BAMBOO_SESSION_KEY, "1");
    } catch {
      /* 隐私模式等存储不可用场景：本次静默降级 */
    }
  }

  const next = getBambooStageIndex(visits);
  const prev = readInt(localStorage, BAMBOO_LAST_STAGE_KEY, 0);
  try {
    localStorage.setItem(BAMBOO_LAST_STAGE_KEY, String(next));
  } catch {
    /* 同上 */
  }

  // 本次访问跨入新阶段（visits > 1 排除首次落地误判）
  return { stage: next, leveledUp: next > prev && visits > 1 };
}

const subscribeNoop = () => () => {};

/* ------------------------------------------------------------------ */
/*  各阶段手绘 SVG（viewBox 统一 0 0 40 56，颜色走双主题 token）        */
/* ------------------------------------------------------------------ */
function BambooArt({ stage }: { stage: number }) {
  const common = {
    viewBox: "0 0 40 56",
    className: "bamboo-svg",
    "aria-hidden": true as const,
    focusable: "false" as const,
  };
  const soil = (
    <ellipse cx="20" cy="52.5" rx="10.5" ry="2.8" fill="var(--theme-decor)" opacity="0.35" />
  );

  switch (stage) {
    case 0:
      // 竹笋
      return (
        <svg {...common}>
          {soil}
          <path d="M20 31c-4 7.5-5.4 14.5-5 21.5h10c.4-7-1-14-5-21.5Z" fill="var(--theme-primary)" />
          <path d="M20 34c-1.4 6-1.9 12-1.7 18.5" stroke="var(--theme-app)" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M20.5 36c-3.6-3.4-7-4.3-10.4-3 2.3 3.4 6 4.7 10.4 3Z" fill="var(--theme-primary)" opacity="0.7" />
          <path d="M19.8 41c3.6-3.4 7-4.3 10.4-3-2.3 3.4-6 4.7-10.4 3Z" fill="var(--theme-primary)" opacity="0.7" />
        </svg>
      );
    case 1:
      // 幼苗
      return (
        <svg {...common}>
          {soil}
          <path d="M18.9 52.5c-.3-9 .3-18 1.1-26.5l1.6.4c-.9 8.3-1.4 17-1.1 26.1Z" fill="var(--theme-primary)" />
          <path d="M20.3 27c-2.4-4.6-6-6.6-10.6-6.2 1.7 4.4 5.6 6.8 10.6 6.2Z" fill="var(--theme-primary)" opacity="0.8" />
          <path d="M20.6 24.5c2.2-4.2 5.6-6 9.9-5.6-1.5 4.1-5.1 6.3-9.9 5.6Z" fill="var(--theme-primary)" opacity="0.8" />
        </svg>
      );
    case 2:
      // 小节竹
      return (
        <svg {...common}>
          {soil}
          <path d="M18.7 52.5c-.2-11 .1-23 .9-34l1.8.3c-.9 10.8-1.2 22-1 33.7Z" fill="var(--theme-primary)" />
          <path d="M18.8 36h3.4" stroke="var(--theme-app)" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
          <path d="M20.4 20c-2.6-4.4-6.4-6.2-11-5.7 1.9 4.3 6 6.5 11 5.7Z" fill="var(--theme-primary)" opacity="0.85" />
          <path d="M20.7 17.5c2.3-4 5.7-5.6 9.8-5.2-1.6 4-5.2 6-9.8 5.2Z" fill="var(--theme-primary)" opacity="0.85" />
          <path d="M20.2 34.5c3.3-3 6.4-3.8 9.5-2.7-2.1 3.1-5.5 4.3-9.5 2.7Z" fill="var(--theme-primary)" opacity="0.7" />
        </svg>
      );
    case 3:
      // 青竹
      return (
        <svg {...common}>
          {soil}
          <path d="M18.6 52.5c-.2-14 .1-28 1-41.5l1.9.3c-1 13.3-1.3 27.2-1.1 41.2Z" fill="var(--theme-primary)" />
          <path d="M18.8 41h3.3" stroke="var(--theme-app)" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
          <path d="M18.9 27h3.3" stroke="var(--theme-app)" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
          <path d="M20.3 12.5c-2.7-4.5-6.6-6.3-11.3-5.8 2 4.4 6.2 6.6 11.3 5.8Z" fill="var(--theme-primary)" opacity="0.9" />
          <path d="M20.7 10c2.4-4.1 5.9-5.8 10.1-5.3-1.7 4.1-5.4 6.2-10.1 5.3Z" fill="var(--theme-primary)" opacity="0.9" />
          <path d="M20.5 24.5c-3.2-3.1-6.9-4-10.5-2.9 2.2 3.4 5.9 4.6 10.5 2.9Z" fill="var(--theme-primary)" opacity="0.75" />
          <path d="M20.2 38.5c3.3-3 6.4-3.8 9.5-2.7-2.1 3.1-5.5 4.3-9.5 2.7Z" fill="var(--theme-primary)" opacity="0.75" />
        </svg>
      );
    default:
      // 开花竹
      return (
        <svg {...common}>
          {soil}
          <path d="M18.6 52.5c-.2-15.5 .1-31 1-45.5l1.9.3c-1 14.3-1.3 29.7-1.1 45.2Z" fill="var(--theme-primary)" />
          <path d="M18.8 43h3.3" stroke="var(--theme-app)" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
          <path d="M18.9 29h3.3" stroke="var(--theme-app)" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
          <path d="M20.3 10.5c-2.7-4.5-6.6-6.3-11.3-5.8 2 4.4 6.2 6.6 11.3 5.8Z" fill="var(--theme-primary)" opacity="0.9" />
          <path d="M20.7 8c2.4-4.1 5.9-5.8 10.1-5.3-1.7 4.1-5.4 6.2-10.1 5.3Z" fill="var(--theme-primary)" opacity="0.9" />
          <path d="M20.5 22.5c-3.2-3.1-6.9-4-10.5-2.9 2.2 3.4 5.9 4.6 10.5 2.9Z" fill="var(--theme-primary)" opacity="0.75" />
          <path d="M20.2 36.5c3.3-3 6.4-3.8 9.5-2.7-2.1 3.1-5.5 4.3-9.5 2.7Z" fill="var(--theme-primary)" opacity="0.75" />
          {/* 竹花 — 百年一开的隐藏奖励 */}
          <circle cx="20.5" cy="4.2" r="1.6" fill="var(--theme-accent-2)" />
          <circle cx="17.2" cy="6.8" r="1.2" fill="var(--theme-accent-2)" opacity="0.85" />
          <circle cx="23.8" cy="6.6" r="1.2" fill="var(--theme-accent-2)" opacity="0.85" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  主组件                                                             */
/* ------------------------------------------------------------------ */
export function BambooSprout() {
  // 客户端挂载门控：服务端 false / 客户端 true，无 hydration 不匹配
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [data] = useState(computeBambooData);
  const [hidden, setHidden] = useState(false);

  if (!mounted || !data || hidden) return null;

  const meta = BAMBOO_STAGES[data.stage];

  return (
    <div className="bamboo-sprout" aria-hidden="true">
      {/* 纯装饰彩蛋：tabIndex -1 不进入键盘导航，点击仅临时隐藏 */}
      <button
        type="button"
        tabIndex={-1}
        className="bamboo-sprout-btn"
        onClick={() => setHidden(true)}
      >
        <span className={data.leveledUp ? "bamboo-grow" : "bamboo-pop"}>
          <BambooArt stage={data.stage} />
        </span>
        <span className="bamboo-tooltip">
          {meta.name} · {meta.hint}
        </span>
      </button>
    </div>
  );
}
