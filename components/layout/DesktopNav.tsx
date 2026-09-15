"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { navItems } from "./nav-data";
import type { NavItem } from "@/lib/types";

/** 是否为无 hover 能力的触控设备（iPadOS Safari 默认上报 (hover: none) + (pointer: coarse)） */
function isCoarsePointer(): boolean {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/** 下拉面板的 DOM id，供开关按钮的 aria-controls 引用（`/blog` → `nav-panel-blog`） */
function panelId(href: string): string {
  return `nav-panel-${href.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function NavIndicator({
  navRef,
  pathname,
  reducedMotion,
}: {
  navRef: React.RefObject<HTMLElement | null>;
  pathname: string;
  reducedMotion: boolean;
}) {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const update = () => {
      const activeLink = nav.querySelector("[aria-current='page']") as HTMLElement | null;
      if (!activeLink) {
        indicator.style.opacity = "0";
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      indicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
      indicator.style.width = `${linkRect.width}px`;
      indicator.style.opacity = "1";
    };

    // 延迟到下一帧，确保 hydration 后 DOM 布局完全稳定
    const rafId = requestAnimationFrame(update);
    window.addEventListener("resize", update);

    // 监听 aria-current 变化（应对 hydration 后 React 修正 DOM）
    const observer = new MutationObserver(update);
    observer.observe(nav, {
      attributes: true,
      subtree: true,
      attributeFilter: ["aria-current"],
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [navRef, pathname]);

  return (
    <div
      ref={indicatorRef}
      className={`absolute bottom-0 h-0.5 bg-title/70 rounded-full pointer-events-none ${
        reducedMotion ? "" : "transition-all duration-300 ease-out"
      }`}
      style={{ opacity: 0, width: 0 }}
    />
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const desktopNavRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;
  // 当前展开的下拉分组 href。桌面 hover / 键盘 focus / 触控点按统一由这一个状态驱动：
  // 保证 aria-expanded 与实际可见性一致（修复「CSS 已展开但 aria-expanded 仍为 false」）。
  const [openHref, setOpenHref] = useState<string | null>(null);

  // 路由切换后收起下拉。
  // 采用渲染期调整状态（React 官方推荐写法，同 MobileDrawer），避免在 effect 中 setState。
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenHref(null);
  }

  // 点击导航外部或按 Esc 时收起（仅在确有展开项时挂监听）
  useEffect(() => {
    if (!openHref) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!desktopNavRef.current?.contains(e.target as Node)) {
        setOpenHref(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenHref(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openHref]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (item: NavItem): boolean => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return isActive(item.href);
  };

  return (
    <nav ref={desktopNavRef} className="hidden md:flex items-center h-full gap-1 relative">
      {navItems.map((item) => {
        const active = isGroupActive(item);

        // 有子项的导航：分组头是开合按钮，下拉可见性统一由 openHref 状态驱动
        // （桌面 hover / 键盘 Enter / 触控点按同一状态，aria-expanded 始终与实际可见性一致）。
        // 分组首页（如 /blog、/about）经由下拉内首项子链接（「文章」「个人简介」）可达。
        if (item.children) {
          const isOpen = openHref === item.href;

          return (
            <div
              key={item.href}
              className="relative h-full flex items-center group"
              onPointerEnter={(e) => {
                // 桌面 hover 展开：移入分组区（含下拉）即展开、移出即收起。
                // 触控无 hover，pointerenter/leave 忽略，开关交给 click。
                if (e.pointerType !== "touch") setOpenHref(item.href);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType !== "touch") setOpenHref(null);
              }}
              // 键盘：不随 focus 自动展开（避免与触控点按的开关语义冲突），
              // 由 Enter / Space 激活（按钮原生 click）展开；焦点完全离开分组区即收起。
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenHref(null);
              }}
            >
              {/*
                这个按钮是「开合开关」，不是指向当前页的链接 —— 所以不挂 aria-current
                （那是给一组链接里代表当前位置的那个用的，当前页信息由下拉内的子链接承担）。
                aria-controls 指向面板，读屏用户才知道开关控制的是什么。
              */}
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={panelId(item.href)}
                /* 刻意阻止默认行为：鼠标点按不夺焦点，避免点完留下焦点环。
                   键盘用户经 Tab 正常获得焦点，不受影响。 */
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  // 触控设备：点按即开合（开→收、收→开），再点按即收起，不会误跳转；
                  // 桌面：hover 已负责展开，点按仅确保展开，移出或 Esc 收起。
                  if (isCoarsePointer()) {
                    setOpenHref((prev) => (prev === item.href ? null : item.href));
                  } else {
                    setOpenHref(item.href);
                  }
                }}
                className={`relative flex items-center gap-1 h-full px-3 text-base tracking-wide transition-colors duration-200 z-10 cursor-pointer ${
                  active || isOpen ? "text-title" : "text-muted group-hover:text-title"
                }`}
              >
                {item.label}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : "group-hover:rotate-180"
                  }`}
                />
              </button>

              {/* 下拉面板：可见性由 openHref 状态统一驱动 */}
              <div
                id={panelId(item.href)}
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-1.5 z-20
                  ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
                  ${shouldReduceMotion ? "" : "transition-all duration-150"}
                `}
              >
                <div className="bg-card border border-borderline rounded-xl shadow-lg shadow-black/5 py-1.5 min-w-[112px]">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      className={`block px-4 py-2 text-sm transition-colors duration-150 whitespace-nowrap ${
                        isActive(child.href)
                          ? "text-primary bg-primary/5 font-medium"
                          : "text-body hover:text-primary hover:bg-hover/50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // 普通链接
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`relative flex items-center h-full px-3 text-base tracking-wide transition-colors duration-200 z-10 ${
              isActive(item.href) ? "text-title" : "text-muted hover:text-title"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <NavIndicator
        navRef={desktopNavRef}
        pathname={pathname}
        reducedMotion={shouldReduceMotion}
      />
    </nav>
  );
}
