/**
 * lib/random.ts 行为级测试
 *
 * 覆盖随机数工具的输入解析与两种采样分支。重点是把「大区间不得构造整段池子」
 * 这条锁住 —— 见 sampleNumbers 的注释，那是会直接卡死浏览器的坑。
 */
import { describe, expect, it } from "vitest";
import {
  MAX_ABS,
  parseDecimal,
  parseInt10,
  roundTo,
  sampleByRequest,
  sampleNormal,
  sampleNumbers,
  sampleUniformDecimals,
} from "@/lib/random";

describe("parseInt10 — 严格整数解析", () => {
  it("接受合法的十进制整数，并容忍首尾空白", () => {
    expect(parseInt10("42")).toBe(42);
    expect(parseInt10(" 42 ")).toBe(42);
    expect(parseInt10("-7")).toBe(-7);
    expect(parseInt10("+7")).toBe(null); // 显式正号不常见，不纵容
    expect(parseInt10("007")).toBe(7);
    expect(parseInt10("0")).toBe(0);
  });

  it("拒绝空串、小数与非数字", () => {
    expect(parseInt10("")).toBe(null);
    expect(parseInt10("   ")).toBe(null);
    expect(parseInt10("1.5")).toBe(null);
    expect(parseInt10("1e3")).toBe(null);
    expect(parseInt10("abc")).toBe(null);
    expect(parseInt10("12abc")).toBe(null);
    expect(parseInt10("--1")).toBe(null);
  });

  it("拒绝超出安全整数范围的值", () => {
    expect(parseInt10("9007199254740993")).toBe(null);
    expect(parseInt10(String(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("sampleNumbers — 不重复模式", () => {
  it("返回值个数正确、落在区间内、且互不相同、升序", () => {
    const out = sampleNumbers(1, 100, 10, true);
    expect(out).toHaveLength(10);
    expect(new Set(out).size).toBe(10);
    expect(out.every((n) => n >= 1 && n <= 100)).toBe(true);
    expect([...out].sort((a, b) => a - b)).toEqual(out);
  });

  it("密集分支：区间与数量相等时，结果是整个区间的排列", () => {
    expect(sampleNumbers(1, 5, 5, true)).toEqual([1, 2, 3, 4, 5]);
    expect(sampleNumbers(-2, 2, 5, true)).toEqual([-2, -1, 0, 1, 2]);
  });

  it("单个数的区间", () => {
    expect(sampleNumbers(7, 7, 1, true)).toEqual([7]);
  });

  it("大区间取少量数：不得构造整段池子", () => {
    // 这是回归护栏。旧实现无条件构造 [min, max] 的完整数组，
    // 此处会尝试分配十亿个元素而拖垮进程 —— 新实现走 Set 拒绝采样，瞬间返回。
    const out = sampleNumbers(0, MAX_ABS, 2, true);
    expect(out).toHaveLength(2);
    expect(new Set(out).size).toBe(2);
    expect(out.every((n) => n >= 0 && n <= MAX_ABS)).toBe(true);
  });

  it("负区间同样成立", () => {
    const out = sampleNumbers(-MAX_ABS, -MAX_ABS + 10, 3, true);
    expect(out).toHaveLength(3);
    expect(out.every((n) => n >= -MAX_ABS)).toBe(true);
  });

  it("重复调用能得到不同结果（随机性烟测）", () => {
    const runs = new Set(Array.from({ length: 20 }, () => sampleNumbers(1, 1000, 3, true).join(",")));
    expect(runs.size).toBeGreaterThan(1);
  });
});

describe("sampleNumbers — 允许重复模式", () => {
  it("个数正确、落在区间内、升序", () => {
    const out = sampleNumbers(1, 6, 20, false);
    expect(out).toHaveLength(20);
    expect(out.every((n) => n >= 1 && n <= 6)).toBe(true);
    expect([...out].sort((a, b) => a - b)).toEqual(out);
  });

  it("数量可以超过区间大小（这正是该模式的意义）", () => {
    const out = sampleNumbers(1, 3, 50, false);
    expect(out).toHaveLength(50);
    expect(out.every((n) => n >= 1 && n <= 3)).toBe(true);
  });

  it("大区间取大量值同样是常数级开销", () => {
    const out = sampleNumbers(0, MAX_ABS, 100, false);
    expect(out).toHaveLength(100);
  });
});

describe("roundTo — 小数位与 -0 归一", () => {
  it("按位数四舍五入", () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
    expect(roundTo(3.14159, 0)).toBe(3);
    expect(roundTo(2.5, 0)).toBe(3); // toFixed 的银行家舍入边界，锁定当前行为
    expect(roundTo(-1.005, 2)).toBe(-1.0);
  });

  it("把 -0 归一为 0，避免结果里出现 \"-0.00\"", () => {
    expect(Object.is(roundTo(-0.001, 2), -0)).toBe(false);
    expect(roundTo(-0.001, 2)).toBe(0);
  });
});

describe("sampleUniformDecimals — 区间内均匀取小数", () => {
  it("个数正确、落在区间内、升序、且不超过指定小数位", () => {
    const out = sampleUniformDecimals(3.2, 4.8, 30, 2);
    expect(out).toHaveLength(30);
    expect(out.every((n) => n >= 3.2 && n <= 4.8)).toBe(true);
    expect([...out].sort((a, b) => a - b)).toEqual(out);
    expect(out.every((n) => Number(n.toFixed(2)) === n)).toBe(true);
  });

  it("支持负数区间", () => {
    const out = sampleUniformDecimals(-2.5, -1.5, 10, 3);
    expect(out.every((n) => n >= -2.5 && n <= -1.5)).toBe(true);
  });

  it("区间为零时全部等于该值", () => {
    expect(sampleUniformDecimals(1.234, 1.234, 3, 2)).toEqual([1.23, 1.23, 1.23]);
  });
});

describe("sampleNormal — 正态分布取数", () => {
  it("个数正确、升序、不含 NaN", () => {
    const out = sampleNormal(5, 1.2, 50, 1);
    expect(out).toHaveLength(50);
    expect(out.every((n) => Number.isFinite(n))).toBe(true);
    expect([...out].sort((a, b) => a - b)).toEqual(out);
  });

  it("大样本的均值与标准差接近设定值", () => {
    const mean = 10;
    const sd = 2;
    const out = sampleNormal(mean, sd, 20000, 3);
    const avg = out.reduce((s, n) => s + n, 0) / out.length;
    const variance = out.reduce((s, n) => s + (n - avg) ** 2, 0) / out.length;
    expect(Math.abs(avg - mean)).toBeLessThan(0.1);
    expect(Math.abs(Math.sqrt(variance) - sd)).toBeLessThan(0.1);
  });

  it("全部取值为 0 的极端随机源不会产生 NaN（Box–Muller 的 log(0) 陷阱）", () => {
    const original = Math.random;
    Math.random = () => 0;
    try {
      const out = sampleNormal(0, 1, 5, 2);
      expect(out.every((n) => Number.isFinite(n))).toBe(true);
    } finally {
      Math.random = original;
    }
  });
});

describe("sampleByRequest — 分发", () => {
  it("正态走正态分支", () => {
    const out = sampleByRequest({ distribution: "normal", mean: 0, sd: 1, count: 4, decimals: 2 });
    expect(out).toHaveLength(4);
  });

  it("均匀且小数位为 0 时走整数分支（保留去重语义）", () => {
    const out = sampleByRequest({
      distribution: "uniform",
      min: 1,
      max: 5,
      count: 5,
      decimals: 0,
      unique: true,
    });
    expect(out).toEqual([1, 2, 3, 4, 5]);
  });

  it("均匀且小数位大于 0 时走小数分支", () => {
    const out = sampleByRequest({
      distribution: "uniform",
      min: 0,
      max: 1,
      count: 5,
      decimals: 3,
      unique: false,
    });
    expect(out.every((n) => Number(n.toFixed(3)) === n)).toBe(true);
  });
});

describe("parseDecimal — 严格小数解析", () => {
  it("接受整数与小数，容忍首尾空白", () => {
    expect(parseDecimal("1.5")).toBe(1.5);
    expect(parseDecimal(" 1.5 ")).toBe(1.5);
    expect(parseDecimal("10")).toBe(10);
    expect(parseDecimal("-0.25")).toBe(-0.25);
    expect(parseDecimal("0.0")).toBe(0);
  });

  it("拒绝空串、残留小数点与科学计数法", () => {
    expect(parseDecimal("")).toBe(null);
    expect(parseDecimal(".")).toBe(null);
    expect(parseDecimal("1.")).toBe(null);
    expect(parseDecimal(".5")).toBe(null);
    expect(parseDecimal("1e3")).toBe(null);
    expect(parseDecimal("abc")).toBe(null);
    expect(parseDecimal("1.2.3")).toBe(null);
  });
});
