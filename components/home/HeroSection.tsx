"use client";

/**
 * HeroSection —— 首页首屏
 *
 * 画面构成与绘制在 components/home/HeroScenery.tsx，本文件负责构图、时序与动效。
 *
 * 关键设计决策：
 * - 场景为**内联 SVG + CSS 3D 纵深**（无位图素材）。3D 层级与「三个扁平化陷阱」
 *   见 styles/hero-scene.css 顶部注释 —— 改动 3D 前必读；
 * - 同一套场景标记同时服务「挂载前」与「挂载后」两条路径：传 y=null 即退化为
 *   普通 div（无内联 transform），避免 SSR 首帧序列化出内联 opacity 覆盖
 *   [data-theme] 规则，导致暗色用户首帧看到白天场景；
 * - 入场时序用**显式 delay 编排**而非嵌套 variant stagger —— 标题逐字落墨、
 *   笔锋自绘、文案与入口依次浮现，整段约 1.8s，这样做的好处是
 *   时序一眼可读，不必在脑子里推演变体传播；
 * - 降级三路：① 无 JS / 挂载前 —— 静态 translateZ 仍在，只是没有视角与视差；
 *   ② 触屏 / 无精确指针 —— 不启用视角跟随；③ prefers-reduced-motion ——
 *   全部循环动画在 CSS 中关闭，入场与时序编排跳过，内容直出；
 * - 重播机制：Header 品牌名点击派发 "replay-hero"（见 components/layout/Header.tsx），
 *   本组件以 Fragment key 重挂载内容，整段入场动画重播。
 */

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  BambooScene,
  HeroDefs,
  StarryScene,
  type Parallax,
} from "./HeroScenery";
import { site } from "@/lib/site";

// useSyncExternalStore 的挂载门控：服务端 / hydration 首帧返回 false，挂载后返回 true。
// 与 ThemeToggle 同套路 —— 不能用 resolvedTheme === undefined 做门控
// （next-themes 客户端首帧已同步解析出主题，SSR 占位与客户端首帧会不一致）。
const subscribeMounted = () => () => {};
const getMounted = () => true;
const getServerNotMounted = () => false;

/* ------------------------------------------------------------------ */
/* 入场时序（秒）。改这里就能整体调节开幕节奏                              */
/* ------------------------------------------------------------------ */
const T = {
  firstChar: 0.15, // 第一个字落墨
  charStep: 0.17, // 逐字间隔
  brush: 1.2, // 笔锋自绘
  tagline: 1.42,
  cta: 1.62,
  hint: 2.0,
} as const;

/** 标题字符来自 site.name（site.config.mjs），不再写死 —— 站名字数任意 */
const TITLE = site.nameChars;

/** 指针位移 → 视角旋转上限（度）。克制为好：这是「看进去」，不是「转起来」 */
const TILT_Y = 3.6;
const TILT_X = 2.4;
/** 低刚度 + 较高阻尼：得到有重量感的跟随，不会抖 */
const TILT_SPRING = { stiffness: 55, damping: 20, mass: 0.7 };
/** 滚动视差幅度（px）：越近的层位移越多，纵深在滚动中被读出来 */
const PARALLAX = { far: -55, mid: -110, near: -180, deep: -30 } as const;

const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const [replayKey, setReplayKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  // 命中 prefers-reduced-motion 时，入场、视差与视角跟随一并降级
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServerNotMounted);
  const isDark = resolvedTheme === "dark";

  /* 视角跟随：指针位置映射为整个 3D 空间的 rotateX / rotateY。
     监听挂在 window 而非 section —— 指针移到页头上方时场景也应继续跟随。 */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [TILT_Y, -TILT_Y]), TILT_SPRING);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [-TILT_X, TILT_X]), TILT_SPRING);

  useEffect(() => {
    // 触屏 / 无精确指针：没有「指针位置」可言，直接不启用
    if (reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, pointerX, pointerY]);

  /* 滚动视差：Hero 离场过程中各层以不同速度上移，配合透视强化纵深 */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const k = reduceMotion ? 0 : 1;
  const farY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.far * k]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.mid * k]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.near * k]);
  const deepY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.deep * k]);
  const parallax: NonNullable<Parallax> = { far: farY, mid: midY, near: nearY, deep: deepY };

  // 监听品牌名点击事件（Header.tsx 派发）：重播入场动画并回到顶部
  useEffect(() => {
    const handler = () => {
      setReplayKey((r) => r + 1);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    };
    window.addEventListener("replay-hero", handler);
    return () => window.removeEventListener("replay-hero", handler);
  }, [reduceMotion]);

  /**
   * 入场过渡：reduced-motion 下把时长与延迟都压到 0。
   *
   * **刻意不使用 `initial={reduceMotion ? false : state}` 这种写法** ——
   * `useReducedMotion()` 在服务端返回 null、在客户端首帧就同步取值（framer-motion 的
   * use-reduced-motion.mjs 在 render 阶段调用 initPrefersReducedMotion），于是服务端
   * 会序列化出 `style="opacity:0…"` 而客户端首帧不写任何样式，两端 HTML 不一致 →
   * 开启「减少动态效果」的用户每次进首页都会撞 hydration 报错。
   * 现在初态恒定，差异只体现在 transition 的数值上（不影响序列化结果）。
   */
  const enter = (duration: number, delay: number) => ({
    duration: reduceMotion ? 0 : duration,
    delay: reduceMotion ? 0 : delay,
    ease: ENTRANCE_EASE,
  });

  return (
    <section ref={sectionRef} className="relative min-h-svh overflow-hidden bg-app">
      {/* ============ 背景层：两层场景常驻，随主题交叉淡入淡出 ============
          挂载前渲染普通 div，显隐完全交给 hero-scene.css 的 [data-theme] 规则
          （暗色用户在首帧即见星空，无闪白）；挂载后交给 Framer Motion 以内联
          opacity 驱动，保证手动切换主题时仍有 0.9s 交叉淡出。 */}
      <div className="absolute inset-0" aria-hidden="true">
        {mounted ? (
          <>
            <motion.div
              className="scene scene-day"
              initial={false}
              animate={{ opacity: isDark ? 0 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeInOut" }}
            >
              <BambooScene y={parallax} rotateX={rotateX} rotateY={rotateY} />
            </motion.div>
            <motion.div
              className="scene scene-night"
              initial={false}
              animate={{ opacity: isDark ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeInOut" }}
            >
              <StarryScene y={parallax} rotateX={rotateX} rotateY={rotateY} />
            </motion.div>
          </>
        ) : (
          <>
            <div className="scene scene-day">
              <BambooScene y={null} />
            </div>
            <div className="scene scene-night">
              <StarryScene y={null} />
            </div>
          </>
        )}
        {/* 渐变贴片定义随日间场景常驻渲染（仅日间用得到三级竹竿渐变） */}
        <HeroDefs />
      </div>

      {/* 大气层：纸纹、渐晕、上下缘淡出。压在场景之上、文字之下，保证正文清晰 */}
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-fade hero-fade--top" aria-hidden="true" />
      <div className="hero-fade hero-fade--bottom" aria-hidden="true" />

      {/* ============ 内容层 ============ */}
      <Fragment key={replayKey}>
        <div className="relative z-10 mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-6 pb-[9vh] text-center">
          {/* 标题：逐字落墨 */}
          <h1 className="hero-title">
            {TITLE.map((char, i) => (
              <motion.span
                /* 用 索引 参与 key：站名含重复字时（如「哈哈」）纯字符 key 会重复 */
                key={`${char}-${i}`}
                className="hero-title-char"
                initial={{ opacity: 0, y: 34, filter: "blur(18px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={enter(1.25, T.firstChar + i * T.charStep)}
              >
                {char}
              </motion.span>
            ))}
          </h1>

          {/* 笔锋：一道自左向右写就的短横，替代原来的分隔细线 */}
          <motion.div
            className="hero-entrance mt-7 sm:mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : T.brush }}
          >
            <motion.div
              className="hero-brush"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={enter(1.05, T.brush)}
              style={{ transformOrigin: "left center" }}
            >
              <svg viewBox="0 0 150 8" width="148" height="6" aria-hidden="true">
                <path
                  d="M2 4 C48 1.2 108 0.8 148 3.4 C108 6.6 48 7 2 4 Z"
                  fill="var(--theme-primary)"
                />
              </svg>
            </motion.div>
          </motion.div>

          <motion.p
            className="hero-entrance mt-7 max-w-md text-base leading-relaxed text-body sm:mt-8 sm:text-lg"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.9, T.tagline)}
          >
            {site.tagline}
          </motion.p>

          {/* 入口：主次两级。填充自左向右扫入，箭头随之前移 */}
          <motion.nav
            className="hero-entrance mt-12 flex flex-wrap items-center justify-center gap-3 sm:mt-14 sm:gap-4"
            aria-label="快捷入口"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.9, T.cta)}
          >
            <Link href="/blog" className="hero-cta hero-cta--primary">
              <span>读文章</span>
              <ArrowRight className="hero-cta__arrow" aria-hidden="true" />
            </Link>
            <Link href="/tools" className="hero-cta hero-cta--ghost">
              <span>逛逛工坊</span>
              <ArrowRight className="hero-cta__arrow" aria-hidden="true" />
            </Link>
          </motion.nav>
        </div>

        {/* 滚动提示：一道反复向下生长的细线，比跳动箭头安静 */}
        <motion.div
          id="scroll-hint"
          className="hero-entrance absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : T.hint }}
        >
          <span className="scroll-hint">
            <span className="scroll-hint__label">向下滚动</span>
            <span className="scroll-hint__line" aria-hidden="true" />
          </span>
        </motion.div>
      </Fragment>
    </section>
  );
}
