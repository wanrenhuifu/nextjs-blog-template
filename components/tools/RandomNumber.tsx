"use client";

import { useState, useRef, useCallback } from "react";
import { RotateCcw, Copy, Check } from "lucide-react";
import { smoothScrollIntoView } from "@/lib/a11y";
import {
  MAX_ABS,
  MAX_COUNT,
  MAX_DECIMALS,
  parseDecimal,
  parseInt10,
  sampleByRequest,
  type Distribution,
} from "@/lib/random";

interface HistoryItem {
  /** 参数摘要，如 `[1, 100] · 2 位小数` 或 `正态 μ=10 σ=1.5` */
  summary: string;
  result: number[];
  time: string;
}

const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg bg-app border border-borderline text-body placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

const GHOST_BUTTON_CLASS =
  "text-sm text-muted hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 px-2 py-1.5 rounded-md focus-ring";

/** 分段选择器，用于「分布」与「取样方式」两处 */
function Segmented<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-body">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-full border border-borderline p-0.5"
      >
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 focus-ring ${
              value === opt.value ? "bg-primary text-on-primary" : "text-muted hover:text-title"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RandomNumber() {
  // 输入一律以字符串持有：数字态会把「清空输入框」塌成 0，没法删掉旧值重打
  const [distribution, setDistribution] = useState<Distribution>("uniform");
  const [minRaw, setMinRaw] = useState("1");
  const [maxRaw, setMaxRaw] = useState("100");
  const [meanRaw, setMeanRaw] = useState("10");
  const [sdRaw, setSdRaw] = useState("1.5");
  const [decimalsRaw, setDecimalsRaw] = useState("0");
  const [countRaw, setCountRaw] = useState("1");
  const [unique, setUnique] = useState(true);
  const [result, setResult] = useState<number[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  /**
   * 出错字段的 id。用于把 aria-invalid 只标在真正有问题的那一个控件上 ——
   * 先前所有输入框共用一个表单级错误，读屏软件会把 6 个框全报成「无效」，
   * 反而定位不到问题。
   */
  const [errorField, setErrorField] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedHistory, setCopiedHistory] = useState<number | null>(null);
  // 每次生成递增，用作结果徽章的 key —— 否则连续两次结果相同时不会重播动画
  const [genId, setGenId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // 去重只对「均匀分布的整数」有意义：连续取值不存在重复的概念
  const decimalsPreview = parseInt10(decimalsRaw) ?? 0;
  const uniqueApplicable = distribution === "uniform" && decimalsPreview === 0;

  /** 报错并记录归属字段：`field` 对应控件的 id */
  const fail = useCallback((message: string, field: string) => {
    setError(message);
    setErrorField(field);
  }, []);

  const generate = useCallback(() => {
    setError("");
    setErrorField("");

    const count = parseInt10(countRaw);
    const decimals = parseInt10(decimalsRaw);

    if (count === null || decimals === null) {
      fail("请填写有效的整数", "rn-count");
      return;
    }
    if (decimals < 0 || decimals > MAX_DECIMALS) {
      fail(`小数位数请在 0–${MAX_DECIMALS} 之间`, "rn-decimals");
      return;
    }
    if (count < 1) {
      fail("生成数量至少为 1", "rn-count");
      return;
    }
    if (count > MAX_COUNT) {
      fail(`生成数量不能超过 ${MAX_COUNT}`, "rn-count");
      return;
    }

    let generated: number[];
    let nextSummary: string;

    if (distribution === "normal") {
      const mean = parseDecimal(meanRaw);
      const sd = parseDecimal(sdRaw);

      if (mean === null || sd === null) {
        fail("请填写有效的均值与标准差", "rn-mean");
        return;
      }
      if (Math.abs(mean) > MAX_ABS || Math.abs(sd) > MAX_ABS) {
        fail(`数值请控制在 ±${MAX_ABS.toLocaleString("en-US")} 以内`, "rn-min");
        return;
      }
      if (sd <= 0) {
        fail("标准差必须大于 0", "rn-sd");
        return;
      }

      generated = sampleByRequest({ distribution: "normal", mean, sd, count, decimals });
      nextSummary = `正态 μ=${mean} σ=${sd}${decimals > 0 ? ` · ${decimals} 位小数` : ""}`;
    } else {
      const min = parseDecimal(minRaw);
      const max = parseDecimal(maxRaw);

      if (min === null || max === null) {
        fail("请填写有效的最小值与最大值", "rn-min");
        return;
      }
      if (Math.abs(min) > MAX_ABS || Math.abs(max) > MAX_ABS) {
        fail(`数值请控制在 ±${MAX_ABS.toLocaleString("en-US")} 以内`, "rn-min");
        return;
      }
      if (min > max) {
        fail("最小值不能大于最大值", "rn-min");
        return;
      }

      const rangeSize = max - min + 1;
      const useUnique = uniqueApplicable && unique;
      if (useUnique && count > rangeSize) {
        setError(`区间 [${min}, ${max}] 内只有 ${rangeSize} 个整数，无法取 ${count} 个不重复的数`);
        return;
      }

      generated = sampleByRequest({
        distribution: "uniform",
        min,
        max,
        count,
        decimals,
        unique: useUnique,
      });
      nextSummary =
        `[${min}, ${max}]` +
        (decimals > 0 ? ` · ${decimals} 位小数` : useUnique ? " · 不重复" : " · 允许重复");
    }

    setResult(generated);
    setSummary(nextSummary);
    setGenId((n) => n + 1);

    const time = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setHistory((prev) => [{ summary: nextSummary, result: generated, time }, ...prev].slice(0, 5));

    setTimeout(() => {
      smoothScrollIntoView(resultRef.current, { block: "nearest" });
    }, 50);
  }, [
    countRaw,
    decimalsRaw,
    distribution,
    maxRaw,
    meanRaw,
    minRaw,
    sdRaw,
    unique,
    uniqueApplicable,
    fail,
  ]);

  const reset = useCallback(() => {
    setDistribution("uniform");
    setMinRaw("1");
    setMaxRaw("100");
    setMeanRaw("10");
    setSdRaw("1.5");
    setDecimalsRaw("0");
    setCountRaw("1");
    setUnique(true);
    setResult([]);
    setSummary("");
    setError("");
    setHistory([]);
  }, []);

  const copyResult = useCallback(async () => {
    if (result.length === 0) return;
    try {
      await navigator.clipboard.writeText(result.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用（非 HTTPS / 未授权）：静默失败即可
    }
  }, [result]);

  const copyHistoryItem = useCallback(async (items: number[], index: number) => {
    try {
      await navigator.clipboard.writeText(items.join(", "));
      setCopiedHistory(index);
      setTimeout(() => setCopiedHistory(null), 2000);
    } catch {
      // 同上
    }
  }, []);

  return (
    <div className="bg-card border border-borderline rounded-2xl p-6 space-y-6">
      {/* 分布 / 取样方式 / 重置 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          label="分布"
          value={distribution}
          onChange={setDistribution}
          options={[
            { label: "均匀", value: "uniform" },
            { label: "正态", value: "normal" },
          ]}
        />

        {/* 去重只对均匀整数有意义，其余情形不展示以免误导 */}
        {uniqueApplicable && (
          <Segmented
            label="取样方式"
            value={unique}
            onChange={setUnique}
            options={[
              { label: "不重复", value: true },
              { label: "允许重复", value: false },
            ]}
          />
        )}

        <button onClick={reset} className={`${GHOST_BUTTON_CLASS} sm:ml-auto`} title="恢复默认值">
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          重置
        </button>
      </div>

      {/* 参数 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {distribution === "uniform" ? (
          <>
            <div className="space-y-2">
              <label htmlFor="rn-min" className="block text-sm font-medium text-body">
                最小值
              </label>
              <input
                id="rn-min"
                type="text"
                inputMode="decimal"
                value={minRaw}
                onChange={(e) => setMinRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                aria-invalid={error ? errorField === "rn-min" : undefined}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rn-max" className="block text-sm font-medium text-body">
                最大值
              </label>
              <input
                id="rn-max"
                type="text"
                inputMode="decimal"
                value={maxRaw}
                onChange={(e) => setMaxRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                aria-invalid={error ? errorField === "rn-max" : undefined}
                className={INPUT_CLASS}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="rn-mean" className="block text-sm font-medium text-body">
                均值 μ
              </label>
              <input
                id="rn-mean"
                type="text"
                inputMode="decimal"
                value={meanRaw}
                onChange={(e) => setMeanRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                aria-invalid={error ? errorField === "rn-mean" : undefined}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="rn-sd" className="block text-sm font-medium text-body">
                标准差 σ
              </label>
              <input
                id="rn-sd"
                type="text"
                inputMode="decimal"
                value={sdRaw}
                onChange={(e) => setSdRaw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                aria-invalid={error ? errorField === "rn-sd" : undefined}
                className={INPUT_CLASS}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label htmlFor="rn-decimals" className="block text-sm font-medium text-body">
            小数位数
          </label>
          <input
            id="rn-decimals"
            type="text"
            inputMode="numeric"
            value={decimalsRaw}
            onChange={(e) => setDecimalsRaw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            aria-invalid={error ? errorField === "rn-decimals" : undefined}
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="rn-count" className="block text-sm font-medium text-body">
            生成数量
          </label>
          <input
            id="rn-count"
            type="text"
            inputMode="numeric"
            value={countRaw}
            onChange={(e) => setCountRaw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            aria-invalid={error ? errorField === "rn-count" : undefined}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <button
        onClick={generate}
        className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-medium transition-all duration-300 hover:bg-primary-hover active:scale-[0.98] focus-ring"
      >
        生成随机数
      </button>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {/* 结果 */}
      {result.length > 0 && (
        <div ref={resultRef}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted">
              生成结果
              <span className="ml-2 font-normal">
                {result.length} 个 · {summary}
              </span>
            </div>
            <button onClick={copyResult} className={GHOST_BUTTON_CLASS}>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{copied ? "已复制" : "复制"}</span>
            </button>
          </div>
          <div className="min-h-[3rem] p-4 rounded-xl bg-app border border-borderline text-title font-mono text-lg tracking-wide flex flex-wrap gap-2 items-center">
            {result.map((n, i) => (
              <span
                key={`${genId}-${i}`}
                className="rn-badge inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-base border border-primary/20"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 历史 */}
      {history.length > 0 && (
        <div>
          <div className="text-sm font-medium text-muted mb-2">最近生成</div>
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div
                key={`${h.time}-${idx}`}
                className="flex items-center gap-2 text-sm text-muted bg-app border border-borderline rounded-lg px-3 py-2 group"
              >
                <span className="text-xs tabular-nums shrink-0">{h.time}</span>
                <span className="text-xs shrink-0">{h.summary}</span>
                <span className="flex flex-wrap gap-1.5">
                  {h.result.map((n, i) => (
                    <span
                      key={`${i}-${n}`}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-semibold"
                    >
                      {n}
                    </span>
                  ))}
                </span>
                <button
                  onClick={() => copyHistoryItem(h.result, idx)}
                  className="ml-auto text-muted hover:text-primary transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 focus-ring"
                  title="复制该结果"
                  aria-label={`复制 ${h.time} 的结果`}
                >
                  {copiedHistory === idx ? (
                    <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
