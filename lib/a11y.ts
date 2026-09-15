/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 根据用户动画偏好执行平滑滚动
 */
export function smoothScrollIntoView(
  element: HTMLElement | null,
  options: ScrollIntoViewOptions = { block: "nearest" }
) {
  if (!element) return;
  element.scrollIntoView({
    ...options,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}
