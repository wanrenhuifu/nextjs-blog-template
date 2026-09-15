"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { DesktopNav } from "./DesktopNav";
import { MobileDrawer } from "./MobileDrawer";
import { site } from "@/lib/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("replay-hero"));
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[var(--header-h)] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-app/80 backdrop-blur-xl border-b border-borderline/60"
            : "bg-app/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-5xl h-full px-5 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            onClick={handleBrandClick}
            className="inline-flex items-center h-full text-title text-lg font-semibold tracking-wide hover:opacity-70 transition-opacity duration-200 shrink-0 leading-none focus-ring"
          >
            {site.name}
          </Link>

          <DesktopNav />

          {/* Right side */}
          <div className="flex items-center gap-0.5">
            {/* 用 min-w-11 min-h-11 确保 44px+ 触摸目标，视觉上保持 32px 图标 */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center min-w-11 min-h-11 text-muted hover:text-title transition-colors duration-200 focus-ring"
              aria-label="搜索"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <ThemeToggle />

            <button
              className="md:hidden flex items-center justify-center min-w-11 min-h-11 text-title transition-colors duration-200 focus-ring"
              onClick={() => setMobileOpen(true)}
              aria-label="打开菜单"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Spacer */}
      <div className="h-[var(--header-h)]" />
    </>
  );
}
