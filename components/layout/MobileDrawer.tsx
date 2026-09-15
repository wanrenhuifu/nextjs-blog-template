"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { navItems } from "./nav-data";
import type { NavItem } from "@/lib/types";
import { site } from "@/lib/site";

/** 计算「包含当前路径」应自动展开的分组集合 */
function expandedGroupsFor(pathname: string): Set<string> {
  const expanded = new Set<string>();
  for (const item of navItems) {
    if (item.children) {
      const active = item.children.some(
        (child) =>
          pathname === child.href ||
          (child.href !== "/" && pathname.startsWith(`${child.href}/`))
      );
      if (active) expanded.add(item.href);
    }
  }
  return expanded;
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() =>
    expandedGroupsFor(pathname)
  );

  // 路由变化时同步展开「包含当前路径」的分组。
  // 采用渲染期调整状态（React 官方推荐写法），避免在 effect 中 setState。
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setExpandedGroups(expandedGroupsFor(pathname));
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  const renderNavItem = (item: NavItem, index: number) => {
    // 有子项的导航：渲染手风琴
    if (item.children) {
      const isExpanded = expandedGroups.has(item.href);
      const isGroupActive = item.children.some((child) => isActive(child.href));

      return (
        <div key={item.href}>
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : index * 0.04,
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <button
              onClick={() => toggleGroup(item.href)}
              aria-expanded={isExpanded}
              className={`flex items-center justify-between w-full py-3 text-[15px] border-b border-borderline/40 transition-colors duration-150 focus-ring bg-transparent ${
                isGroupActive ? "text-title font-medium" : "text-body hover:text-title"
              }`}
            >
              {item.label}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="pl-4 py-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      className={`block py-2.5 text-[14px] border-b border-borderline/20 transition-colors duration-150 ${
                        isActive(child.href)
                          ? "text-primary font-medium"
                          : "text-muted hover:text-title"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // 普通链接
    return (
      <motion.div
        key={item.href}
        initial={shouldReduceMotion ? {} : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay: shouldReduceMotion ? 0 : index * 0.04,
          duration: shouldReduceMotion ? 0 : 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Link
          href={item.href}
          onClick={onClose}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`block py-3 text-[15px] border-b border-borderline/40 transition-colors duration-150 ${
            isActive(item.href) ? "text-title font-medium" : "text-body hover:text-title"
          }`}
        >
          {item.label}
        </Link>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm"
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-[91] w-[300px] max-w-[85vw] bg-app border-l border-borderline/60 flex flex-col"
            initial={shouldReduceMotion ? {} : { x: "100%" }}
            animate={{ x: 0 }}
            exit={shouldReduceMotion ? {} : { x: "100%" }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 h-11 border-b border-borderline/60 shrink-0">
              <button
                onClick={() => { router.push("/"); onClose(); }}
                className="text-title text-[15px] font-semibold tracking-wide bg-transparent border-none cursor-pointer focus-ring"
              >
                {site.name}
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 text-title hover:opacity-70 transition-opacity focus-ring bg-transparent border-none"
                aria-label="关闭菜单"
              >
                <X className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </div>

            {/* Nav List */}
            <nav className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col">
                {navItems.map((item, index) => renderNavItem(item, index))}
              </div>
            </nav>

            {/* Drawer Footer */}
            <div className="px-5 py-4 border-t border-borderline/60 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">主题</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
