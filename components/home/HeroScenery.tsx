"use client";

/**
 * HeroScenery —— 首屏场景的全部绘制
 *
 * 从 HeroSection 拆出来：HeroSection 负责构图与动效，本文件负责把画画出来。
 * 全部为内联 SVG / 纯 CSS，无位图素材。颜色一律走 --theme-* 变量。
 *
 * 空间结构（配合 styles/hero-scene.css，改动前先读那边的「三个扁平化陷阱」）：
 *   .hero-perspective → .hero-space(preserve-3d) → .hero-layer(--far/--mid/--near/--deep)
 *
 * 画面分层（由远及近）：
 *   日间  柔光斑 → 远山(墨) → 云气 → 远景竹 → 中景竹 → 云气 → 近景竹 → 光柱 → 浮尘 → 飘落竹叶
 *   夜间  夜空辉光 → 星河 → 月轮与光环 → 月光远山 → 远景竹影 → 云气 → 近景竹影 → 萤火
 */

import { motion, type MotionValue } from "framer-motion";

/* ------------------------------------------------------------------ */
/* 确定性伪随机：星河星点用                                             */
/* 必须在模块作用域算好 —— 渲染期调 Math.random() 会让 SSR 与客户端不一致 */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 星河带内的星点：沿一条斜带分布，越靠近带心越亮。
    y 收在 viewBox 的 0–400 内 —— 越界的星点会被 SVG 裁掉，白算。 */
const GALAXY_STARS = (() => {
  const rnd = mulberry32(20490701);
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 170; i++) {
    const t = rnd(); // 沿带方向 0..1
    // 垂直带心的偏移，用三次方让分布向带心收拢
    const spread = (rnd() * 2 - 1) ** 3;
    stars.push({
      x: 40 + t * 1360,
      y: 62 + t * 258 + spread * 62,
      r: 0.5 + rnd() * 1.3,
      o: 0.18 + (1 - Math.abs(spread)) * 0.62,
    });
  }
  return stars;
})();

/* ------------------------------------------------------------------ */
/* 竹                                                                    */
/* ------------------------------------------------------------------ */

/** 竹节在 viewBox 高度 1000 内的分布 */
const NODE_Y = [126, 268, 412, 554, 698, 842];

/** 竹叶的摆放参数（相对所属竹竿定位） */
export type LeafSpec = { top: string; rotate: number; scale?: number };

/**
 * 墨色分级 —— 墨竹靠「墨色浓淡」拉纵深，不靠数量堆叠。
 * 近景浓墨、中景淡墨、远景几近于无；每级一支渐变（sprite 里定义一次）。
 * `night` 用于夜间：竹影退为剪影，墨色改为偏冷的暗色，不抢月轮。
 */
export type Tone = "near" | "mid" | "far";

const TONE = {
  day: {
    near: { fill: "url(#hz-culm-near)", ink: "var(--theme-stalk-near)", node: 0.5, ring: 0.2, leaf: 0.5, vein: 0.44 },
    mid: { fill: "url(#hz-culm-mid)", ink: "var(--theme-stalk-far)", node: 0.32, ring: 0.12, leaf: 0.3, vein: 0.26 },
    far: { fill: "url(#hz-culm-far)", ink: "var(--theme-stalk-far)", node: 0.16, ring: 0.06, leaf: 0.16, vein: 0.14 },
  },
  night: {
    near: { fill: "url(#hz-culm-night-near)", ink: "var(--theme-star)", node: 0.2, ring: 0.05, leaf: 0.2, vein: 0.16 },
    mid: { fill: "url(#hz-culm-night-mid)", ink: "var(--theme-star)", node: 0.12, ring: 0.03, leaf: 0.12, vein: 0.1 },
    far: { fill: "url(#hz-culm-night-far)", ink: "var(--theme-star)", node: 0.07, ring: 0.02, leaf: 0.07, vein: 0.06 },
  },
} as const;

/** 渐变与滤镜定义，全场景只此一份（SVG sprite 手法），各处按 id 引用 */
export function HeroDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        {/* 日间竹竿：三级同构，只是整体浓度不同。两侧淡、中偏左最浓，做出圆柱体积感 */}
        <linearGradient id="hz-culm-near" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-stalk-near)" stopOpacity="0.12" />
          <stop offset="30%" stopColor="var(--theme-stalk-near)" stopOpacity="0.56" />
          <stop offset="55%" stopColor="var(--theme-stalk-near)" stopOpacity="0.78" />
          <stop offset="80%" stopColor="var(--theme-stalk-near)" stopOpacity="0.36" />
          <stop offset="100%" stopColor="var(--theme-stalk-near)" stopOpacity="0.09" />
        </linearGradient>
        <linearGradient id="hz-culm-mid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-stalk-far)" stopOpacity="0.05" />
          <stop offset="30%" stopColor="var(--theme-stalk-far)" stopOpacity="0.22" />
          <stop offset="55%" stopColor="var(--theme-stalk-far)" stopOpacity="0.32" />
          <stop offset="80%" stopColor="var(--theme-stalk-far)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--theme-stalk-far)" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="hz-culm-far" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-stalk-far)" stopOpacity="0.03" />
          <stop offset="30%" stopColor="var(--theme-stalk-far)" stopOpacity="0.11" />
          <stop offset="55%" stopColor="var(--theme-stalk-far)" stopOpacity="0.16" />
          <stop offset="80%" stopColor="var(--theme-stalk-far)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--theme-stalk-far)" stopOpacity="0.02" />
        </linearGradient>

        {/* 夜间竹影：极淡的月光边缘，只作为远山的近景注释 */}
        <linearGradient id="hz-culm-night-near" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-star)" stopOpacity="0.03" />
          <stop offset="30%" stopColor="var(--theme-star)" stopOpacity="0.16" />
          <stop offset="55%" stopColor="var(--theme-star)" stopOpacity="0.24" />
          <stop offset="80%" stopColor="var(--theme-star)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--theme-star)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="hz-culm-night-mid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-star)" stopOpacity="0.02" />
          <stop offset="30%" stopColor="var(--theme-star)" stopOpacity="0.1" />
          <stop offset="55%" stopColor="var(--theme-star)" stopOpacity="0.15" />
          <stop offset="80%" stopColor="var(--theme-star)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--theme-star)" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="hz-culm-night-far" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-star)" stopOpacity="0.01" />
          <stop offset="30%" stopColor="var(--theme-star)" stopOpacity="0.06" />
          <stop offset="55%" stopColor="var(--theme-star)" stopOpacity="0.09" />
          <stop offset="80%" stopColor="var(--theme-star)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--theme-star)" stopOpacity="0.01" />
        </linearGradient>

        {/* 远山：自山脊向下渐隐，上浓下淡，像宣纸上的淡墨晕开 */}
        <linearGradient id="hz-ridge-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--theme-stalk-near)" stopOpacity="0.5" />
          <stop offset="55%" stopColor="var(--theme-stalk-near)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--theme-stalk-near)" stopOpacity="0" />
        </linearGradient>
        {/* 夜间远山：几乎融进夜色，只靠山脊的一道月光勾边被看见 */}
        <linearGradient id="hz-ridge-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** 竹叶：两头尖的披针形，带中脉 */
function Leaf({ tone, night, spec }: { tone: Tone; night?: boolean; spec: LeafSpec }) {
  const t = TONE[night ? "night" : "day"][tone];
  const ink = night ? "var(--theme-star)" : tone === "near" ? "var(--theme-leaf)" : "var(--theme-stalk-far)";
  return (
    <svg
      className="bamboo-leaf"
      style={{
        top: spec.top,
        left: "50%",
        transform: `rotate(${spec.rotate}deg) scale(${spec.scale ?? 1})`,
      }}
      width="112"
      height="25"
      viewBox="0 0 100 22"
      aria-hidden="true"
    >
      <path d="M0 11 C22 3 60 -1 100 14 C60 20 22 18 0 11 Z" fill={ink} fillOpacity={t.leaf} />
      <path
        d="M3 11 C28 7.4 64 8 97 13.4"
        fill="none"
        stroke={ink}
        strokeOpacity={t.vein}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 竹竿：一根贯通的 culm，带竹节环与节下高光。叶片作为子元素随竿一起摇曳。 */
export function Stalk({
  tone,
  night,
  width,
  height,
  duration,
  position,
  leaves = [],
}: {
  tone: Tone;
  night?: boolean;
  width: number;
  height: string;
  duration: string;
  position: React.CSSProperties;
  leaves?: LeafSpec[];
}) {
  const t = TONE[night ? "night" : "day"][tone];
  return (
    <div
      className="bamboo-stalk"
      style={{ ...position, width, height, animationDuration: duration }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" viewBox="0 0 26 1000" preserveAspectRatio="none">
        <rect x="0" y="0" width="26" height="1000" fill={t.fill} />
        {NODE_Y.map((y) => (
          <g key={y}>
            {/* 节环：略下凹的弧，竹节最直接的辨识特征 */}
            <path
              d={`M0 ${y} Q13 ${y + 7} 26 ${y}`}
              fill="none"
              stroke={t.ink}
              strokeOpacity={t.node}
              strokeWidth="2.2"
            />
            {/* 节下高光，避免节环只是一条黑线。夜间改用月色描边 */}
            <path
              d={`M0 ${y + 5} Q13 ${y + 12} 26 ${y + 5}`}
              fill="none"
              stroke={night ? "var(--theme-star)" : "#FFFFFF"}
              strokeOpacity={t.ring}
              strokeWidth="1.6"
            />
          </g>
        ))}
      </svg>
      {leaves.map((spec, i) => (
        <Leaf key={i} tone={tone} night={night} spec={spec} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 远山                                                                  */
/* ------------------------------------------------------------------ */

/** 山脊上缘路径（viewBox 1440×400），三条由远及近。
    形态要点：主峰偏置、峰距不等、左右坡长不对称 —— 对称等距的圆弧会读成一排圆包，
    而不是山。远侧用更长的浅坡 + 陡的收顶，是国画里「远山」的典型笔势。 */
const RIDGES = [
  {
    // 远：主峰在右侧，起伏最平
    d: "M0 258 Q96 246 150 258 Q226 274 286 214 Q338 162 396 200 Q452 236 512 216 Q580 194 646 226 Q706 254 766 230 Q828 206 884 236 Q932 262 980 200 Q1026 142 1074 190 Q1124 240 1180 224 Q1248 204 1306 232 Q1368 262 1440 240",
    o: 0.4,
  },
  {
    // 中：主峰在中偏左，峰形更陡
    d: "M0 292 Q88 280 140 292 Q204 306 262 268 Q316 232 372 264 Q430 296 494 282 Q558 268 620 292 Q682 316 742 298 Q804 280 862 302 Q920 324 976 300 Q1030 278 1082 302 Q1140 328 1198 310 Q1264 290 1320 308 Q1382 326 1440 314",
    o: 0.66,
  },
  {
    // 近：缓丘，最实
    d: "M0 344 Q104 332 168 344 Q244 358 310 334 Q374 312 442 330 Q512 348 578 340 Q648 332 712 350 Q778 368 844 352 Q912 336 976 354 Q1044 372 1110 356 Q1180 340 1244 354 Q1312 368 1376 358 Q1412 352 1440 356",
    o: 1,
  },
] as const;

/** 远山：日间为淡墨晕染，夜间为夜色剪影 + 一道月光勾边 */
export function Mountains({ night }: { night?: boolean }) {
  return (
    <svg
      className="mountains"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {RIDGES.map((r, i) => (
        <g key={i}>
          <path
            d={`${r.d} L1440 400 L0 400 Z`}
            fill={night ? "url(#hz-ridge-night)" : "url(#hz-ridge-day)"}
            fillOpacity={night ? r.o * 1.1 : r.o * 0.13}
          />
          {/* 山脊勾边：夜里是一道月光，白天是一线淡墨 */}
          <path
            d={r.d}
            fill="none"
            stroke={night ? "var(--theme-star)" : "var(--theme-stalk-near)"}
            strokeOpacity={night ? r.o * 0.26 : r.o * 0.1}
            strokeWidth={night ? 1.3 : 1}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 夜                                                                    */
/* ------------------------------------------------------------------ */

/** 星河：一条斜向的星云带，含雾状底 + 确定性散布的细星 */
export function MilkyWay() {
  return (
    <svg className="galaxy" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hz-galaxy-band" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--theme-star)" stopOpacity="0" />
          <stop offset="35%" stopColor="var(--theme-star)" stopOpacity="0.05" />
          <stop offset="52%" stopColor="var(--theme-star)" stopOpacity="0.09" />
          <stop offset="72%" stopColor="var(--theme-star)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--theme-star)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 雾状带底 */}
      <rect width="1440" height="400" fill="url(#hz-galaxy-band)" />
      {/* 细星 */}
      {GALAXY_STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="var(--theme-star)"
          fillOpacity={s.o * 0.7}
        />
      ))}
    </svg>
  );
}

/** 月轮：径向渐变塑球面，三层光晕 + 两圈呼吸光环 + 月面浅斑 */
export function Moon() {
  return (
    <div className="moon">
      <div className="moon-halo" />
      <div className="moon-halo moon-halo--outer" />
    </div>
  );
}

/** 星野：两层 box-shadow 星点，各自以不同周期明灭 */
export function StarFields() {
  return (
    <>
      <div className="stars stars-a" />
      <div className="stars stars-b" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 空中细节                                                              */
/* ------------------------------------------------------------------ */

/** 飘落的竹叶（日间）：几片叶子脱枝缓缓旋落，各不相同的相位 */
const FALLING = [
  { left: "12%", dur: "19s", delay: "0s", scale: 0.9, drift: "5vw" },
  { left: "27%", dur: "25s", delay: "-6s", scale: 0.66, drift: "-4vw" },
  { left: "48%", dur: "22s", delay: "-13s", scale: 0.8, drift: "6vw" },
  { left: "68%", dur: "29s", delay: "-3s", scale: 0.6, drift: "-5vw" },
  { left: "86%", dur: "21s", delay: "-17s", scale: 0.86, drift: "4vw" },
] as const;

export function FallingLeaves() {
  return (
    <>
      {FALLING.map((f, i) => (
        <svg
          key={i}
          className="falling-leaf"
          viewBox="0 0 100 22"
          width="62"
          height="14"
          aria-hidden="true"
          style={{
            left: f.left,
            animationDuration: f.dur,
            animationDelay: f.delay,
            ["--drift" as string]: f.drift,
            ["--leaf-scale" as string]: f.scale,
          }}
        >
          <path
            d="M0 11 C22 3 60 -1 100 14 C60 20 22 18 0 11 Z"
            fill="var(--theme-leaf)"
            fillOpacity="0.3"
          />
        </svg>
      ))}
    </>
  );
}

/** 萤火（夜间）：暖金小点缓慢游移与明灭 */
const FIREFLIES = [
  { left: "9%", top: "62%", dur: "13s", delay: "0s" },
  { left: "18%", top: "78%", dur: "17s", delay: "-4s" },
  { left: "29%", top: "70%", dur: "15s", delay: "-9s" },
  { left: "41%", top: "84%", dur: "19s", delay: "-2s" },
  { left: "57%", top: "74%", dur: "14s", delay: "-11s" },
  { left: "68%", top: "86%", dur: "18s", delay: "-6s" },
  { left: "79%", top: "68%", dur: "16s", delay: "-13s" },
  { left: "91%", top: "80%", dur: "20s", delay: "-8s" },
] as const;

export function Fireflies() {
  return (
    <>
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          aria-hidden="true"
          style={{
            left: f.left,
            top: f.top,
            animationDuration: `${f.dur}, ${Number.parseFloat(f.dur) / 2.6}s`,
            animationDelay: `${f.delay}, ${f.delay}`,
          }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3D 空间与纵深层                                                       */
/* ------------------------------------------------------------------ */

export type Parallax = {
  far: MotionValue<number>;
  mid: MotionValue<number>;
  near: MotionValue<number>;
  deep: MotionValue<number>;
} | null;

/** 纵深层：CSS 负责静态 translateZ，内层交给 Framer 做滚动视差，两者不抢同一个 transform */
export function Layer({
  depth,
  y,
  children,
}: {
  depth: "far" | "mid" | "near" | "deep";
  y: MotionValue<number> | null;
  children: React.ReactNode;
}) {
  return (
    <div className={`hero-layer hero-layer--${depth}`}>
      {y ? (
        <motion.div className="absolute inset-0" style={{ y }}>
          {children}
        </motion.div>
      ) : (
        <div className="absolute inset-0">{children}</div>
      )}
    </div>
  );
}

/** 3D 空间外壳：建立透视；给了 rotate 值就启用视角跟随，否则退化为静态 3D */
export function Space({
  rotateX,
  rotateY,
  children,
}: {
  rotateX?: MotionValue<number>;
  rotateY?: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <div className="hero-perspective">
      {rotateX && rotateY ? (
        <motion.div className="hero-space" style={{ rotateX, rotateY }}>
          {children}
        </motion.div>
      ) : (
        <div className="hero-space">{children}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 两套场景                                                              */
/* ------------------------------------------------------------------ */

type SceneProps = {
  y: Parallax;
  rotateX?: MotionValue<number>;
  rotateY?: MotionValue<number>;
};

/** 日间「墨竹山水」：远山 → 云气 → 三层竹 → 光柱 → 浮尘与落叶 */
export function BambooScene({ y, rotateX, rotateY }: SceneProps) {
  return (
    <>
      {/* 柔焦光斑带 blur、浮尘是循环动画：都不进 3D 层，作为最底层的平面背景 */}
      <div className="dapple dapple-a" />
      <div className="dapple dapple-b" />

      <Space rotateX={rotateX} rotateY={rotateY}>
        {/* 极远：淡墨远山，越过竹梢望去的那一层 */}
        <Layer depth="deep" y={y?.deep ?? null}>
          <Mountains />
        </Layer>

        {/* 远景：淡墨细竿，数量最多，负责拉出纵深 */}
        <Layer depth="far" y={y?.far ?? null}>
          <div className="mist mist--far" />
          <Stalk tone="far" width={10} height="86%" duration="13.5s" position={{ left: "0.5%" }} leaves={[{ top: "19%", rotate: 20, scale: 0.75 }, { top: "31%", rotate: 212, scale: 0.66 }]} />
          <Stalk tone="far" width={9} height="78%" duration="12s" position={{ left: "14%" }} leaves={[{ top: "25%", rotate: -26, scale: 0.68 }, { top: "37%", rotate: 198, scale: 0.58 }]} />
          <Stalk tone="far" width={10} height="90%" duration="14.5s" position={{ right: "0.5%" }} leaves={[{ top: "17%", rotate: 158, scale: 0.75 }, { top: "29%", rotate: -18, scale: 0.66 }]} />
          <Stalk tone="far" width={9} height="82%" duration="11.5s" position={{ right: "14%" }} leaves={[{ top: "23%", rotate: 194, scale: 0.66 }, { top: "35%", rotate: 24, scale: 0.58 }]} />
        </Layer>

        {/* 中景：矮竿，顶端在画面内收头并挂叶 */}
        <Layer depth="mid" y={y?.mid ?? null}>
          <div className="mist mist--mid" />
          <Stalk tone="mid" width={13} height="58%" duration="10.5s" position={{ left: "10%" }} leaves={[
            { top: "3%", rotate: -34, scale: 0.9 },
            { top: "9%", rotate: 152, scale: 0.78 },
            { top: "16%", rotate: -12, scale: 0.64 },
          ]} />
          <Stalk tone="mid" width={13} height="62%" duration="12.5s" position={{ right: "10%" }} leaves={[
            { top: "4%", rotate: 210, scale: 0.9 },
            { top: "11%", rotate: 28, scale: 0.78 },
            { top: "18%", rotate: 168, scale: 0.64 },
          ]} />
        </Layer>

        {/* 近景：唯一的浓墨，丛生两根，压在画面最外侧做前景框 */}
        <Layer depth="near" y={y?.near ?? null}>
          <Stalk tone="near" width={24} height="116%" duration="9s" position={{ left: "1.2%" }} leaves={[
            { top: "8%", rotate: -22, scale: 1.05 },
            { top: "15%", rotate: 158, scale: 0.86 },
          ]} />
          <Stalk tone="near" width={15} height="74%" duration="11s" position={{ left: "5.5%" }} leaves={[
            { top: "2%", rotate: -30, scale: 0.85 },
            { top: "8%", rotate: 146, scale: 0.72 },
            { top: "15%", rotate: -6, scale: 0.6 },
          ]} />
          <Stalk tone="near" width={24} height="110%" duration="11.5s" position={{ right: "1.2%" }} leaves={[
            { top: "10%", rotate: 202, scale: 1.05 },
            { top: "17%", rotate: 30, scale: 0.86 },
          ]} />
          <Stalk tone="near" width={15} height="78%" duration="12.5s" position={{ right: "5.5%" }} leaves={[
            { top: "3%", rotate: 212, scale: 0.85 },
            { top: "10%", rotate: 34, scale: 0.72 },
            { top: "17%", rotate: 174, scale: 0.6 },
          ]} />
        </Layer>
      </Space>

      {/* 光柱与浮尘在 3D 之外：光柱是整片大气效果，不该随视角位移 */}
      <div className="rays" aria-hidden="true">
        <span className="ray ray-a" />
        <span className="ray ray-b" />
        <span className="ray ray-c" />
      </div>
      <div className="dust dust-a" />
      <div className="dust dust-b" />
      <div className="dust dust-c" />
      <FallingLeaves />
    </>
  );
}

/** 夜间「星月夜」：星河 → 月轮星野 → 月光远山 → 竹影 → 萤火 */
export function StarryScene({ y, rotateX, rotateY }: SceneProps) {
  return (
    <>
      <Space rotateX={rotateX} rotateY={rotateY}>
      <Layer depth="deep" y={y?.deep ?? null}>
        <MilkyWay />
        <StarFields />
        <Moon />
      </Layer>

      {/* 远山在月轮之前、竹影之后：给夜空一条地平线，夜色就不再是空无一物 */}
      <Layer depth="far" y={y?.far ?? null}>
        <Mountains night />
      </Layer>

      <Layer depth="near" y={y?.near ?? null}>
        <div className="mist mist--night" />
        <Stalk night tone="near" width={22} height="112%" duration="9.5s" position={{ left: "1.5%" }} leaves={[
          { top: "9%", rotate: -22, scale: 1 },
          { top: "16%", rotate: 158, scale: 0.82 },
        ]} />
        <Stalk night tone="near" width={14} height="72%" duration="11.5s" position={{ left: "6%" }} leaves={[
          { top: "3%", rotate: -30, scale: 0.8 },
          { top: "10%", rotate: 146, scale: 0.68 },
        ]} />
        <Stalk night tone="near" width={22} height="106%" duration="12s" position={{ right: "1.5%" }} leaves={[
          { top: "11%", rotate: 202, scale: 1 },
          { top: "18%", rotate: 30, scale: 0.82 },
        ]} />
      </Layer>
      </Space>

      {/* 萤火在 3D 之外：它们是近处漂浮的光点，不该跟着视角一起转 */}
      <Fireflies />
    </>
  );
}