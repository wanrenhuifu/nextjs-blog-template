/**
 * 随机数生成工具的纯逻辑（无 DOM、无 React，便于单测）。
 * 组件层只负责状态与呈现，见 components/tools/RandomNumber.tsx。
 */

/** 输入绝对值上限。避免「区间跨 10 亿」这类没有实际意义、还会拖垮采样的输入 */
export const MAX_ABS = 1_000_000_000;
/** 单次生成数量上限 */
export const MAX_COUNT = 100;

/** 严格解析十进制整数；空串、小数、非数字、超出安全整数范围都返回 null */
export function parseInt10(raw: string): number | null {
  const text = raw.trim();
  if (!/^-?\d+$/.test(text)) return null;
  const n = Number(text);
  return Number.isSafeInteger(n) ? n : null;
}

/** 小数位数上限 */
export const MAX_DECIMALS = 6;

/** 严格解析十进制小数（允许带小数部分）；空串、非数字、非有限值都返回 null */
export function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

/** 按指定小数位四舍五入，并把 -0 归一为 0（避免结果里出现 "-0.00" 这种噪声） */
export function roundTo(value: number, decimals: number): number {
  const fixed = Number(value.toFixed(decimals));
  return fixed === 0 ? 0 : fixed;
}

/**
 * 区间内均匀取小数。
 * 与整数版不同：连续取值不存在「重复」概念，故不涉及去重分支。
 */
export function sampleUniformDecimals(
  min: number,
  max: number,
  count: number,
  decimals: number,
): number[] {
  const span = max - min;
  return Array.from({ length: count }, () => roundTo(min + Math.random() * span, decimals)).sort(
    (a, b) => a - b,
  );
}

/**
 * 正态分布取数（Box–Muller 变换）。
 *
 * `1 - Math.random()` 而非 `Math.random()`：后者可能返回 0，取对数会得到 -Infinity，
 * 进而污染出 NaN。用 1-x 把取值压到 (0, 1]，杜绝这个边界。
 */
export function sampleNormal(
  mean: number,
  sd: number,
  count: number,
  decimals: number,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const u1 = 1 - Math.random();
    const u2 = 1 - Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    out.push(roundTo(mean + z * sd, decimals));
  }
  return out.sort((a, b) => a - b);
}

/** 采样分布 */
export type Distribution = "uniform" | "normal";

/** 一次生成请求的参数（已通过校验的数值形态） */
export type SampleRequest =
  | { distribution: "uniform"; min: number; max: number; count: number; decimals: number; unique: boolean }
  | { distribution: "normal"; mean: number; sd: number; count: number; decimals: number };

/** 按请求分发到对应的采样实现 */
export function sampleByRequest(req: SampleRequest): number[] {
  if (req.distribution === "normal") {
    return sampleNormal(req.mean, req.sd, req.count, req.decimals);
  }
  if (req.decimals > 0) {
    return sampleUniformDecimals(req.min, req.max, req.count, req.decimals);
  }
  return sampleNumbers(req.min, req.max, req.count, req.unique);
}

/**
 * 从 [min, max] 取 count 个整数，升序返回。
 *
 * 算法按**取样密度**二选一，这是为了避开一个会卡死浏览器的坑：
 * 直观写法是无条件构造整个区间的池子（`for (i = min; i <= max; i++) push(i)`），
 * 而「生成数量不超过区间大小」这个校验并不能拦住它 —— 于是
 * 「1 到 1000000000 之间取 1 个数」会当场构造十亿个元素的数组，页面失去响应。
 *
 * - 稀疏（count 占区间不到 1/10）：Set 拒绝采样，期望抽取约 1.1×count 次
 * - 密集（count 接近区间大小）：Fisher-Yates 洗牌整个池子
 *
 * 池子的上界于是自动成立：只有区间 ≤ 10×count 时才会走密集分支，
 * 而 count ≤ MAX_COUNT，故池子最多一千个元素。
 */
export function sampleNumbers(min: number, max: number, count: number, unique: boolean): number[] {
  const rangeSize = max - min + 1;

  if (!unique) {
    return Array.from({ length: count }, () => min + Math.floor(Math.random() * rangeSize)).sort(
      (a, b) => a - b,
    );
  }

  if (count * 10 < rangeSize) {
    const picked = new Set<number>();
    while (picked.size < count) {
      picked.add(min + Math.floor(Math.random() * rangeSize));
    }
    return [...picked].sort((a, b) => a - b);
  }

  const pool: number[] = [];
  for (let i = 0; i < rangeSize; i++) pool.push(min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}
