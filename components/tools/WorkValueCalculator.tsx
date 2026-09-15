"use client";

import { useId, useState, useCallback, useRef } from "react";
import { DollarSign, Calculator, RotateCcw, ChevronDown } from "lucide-react";
import { smoothScrollIntoView, prefersReducedMotion } from "@/lib/a11y";

interface ResultConfig {
  tag: string;
  tagClass: string;
  comment: string;
}

function getResultConfig(score: number): ResultConfig {
  if (score < 0.4)
    return {
      tag: "快跑！神仙难救",
      tagClass: "bg-danger/10 text-danger border-danger/20",
      comment:
        "这份工作的性价比极低，付出的时间与精力远大于回报。除非有特殊的成长性或隐性收益，否则建议尽早谋划出路。",
    };
  if (score < 0.6)
    return {
      tag: "比较惨，建议骑驴找马",
      tagClass: "bg-warning/10 text-warning border-warning/20",
      comment:
        "性价比偏低，工作占用了你大量有效时间，但回报并不理想。可以考虑在稳定当前工作的同时，寻找更好的机会。",
    };
  if (score < 0.8)
    return {
      tag: "一般般，温饱线挣扎",
      tagClass: "bg-info/10 text-info border-info/20",
      comment:
        "工作性价比处于平均水平，不好不坏。能养活自己，但想过得更滋润还需要更努力的积累或跳槽。",
    };
  if (score < 1.0)
    return {
      tag: "还不错，可以考虑苟住",
      tagClass: "bg-primary/10 text-primary border-primary/20",
      comment:
        "这份工作处于温饱线以上，虽然不算神仙工作，但也能维持体面的生活。如果时间投入不算太高，建议先做着，同时看看有没有更好的机会。",
    };
  if (score < 1.5)
    return {
      tag: "挺爽，建议长做长有",
      tagClass: "bg-success/10 text-success border-success/20",
      comment:
        "工作性价比很高！你花的时间换来了不错的回报，环境也可能还不错。珍惜这份工作，努力做出成绩。",
    };
  return {
    tag: "神仙工作，建议干到退休",
    tagClass: "bg-success/10 text-success border-success/20",
    comment: "这是什么神仙工作！高回报、低消耗、环境好。请务必稳住，这可能是很多人梦寐以求的机会。",
  };
}

function animateNumber(
  el: HTMLElement | null,
  target: number,
  duration = 600
) {
  if (!el) return;
  const element = el;
  if (prefersReducedMotion()) {
    element.textContent = target.toFixed(2);
    return;
  }
  const start = parseFloat(element.textContent || "0") || 0;
  const startTime = performance.now();
  function update(currentTime: number) {
    if (!element) return;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = start + (target - start) * ease;
    element.textContent = current.toFixed(2);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

export function WorkValueCalculator() {
  const [salary, setSalary] = useState(15000);
  const [workdays, setWorkdays] = useState(22);
  const [workhours, setWorkhours] = useState(8);
  const [commute, setCommute] = useState(1);
  const [slacking, setSlacking] = useState(2);
  const [env, setEnv] = useState("1.2");
  const [looks, setLooks] = useState("1.1");
  const [coworkers, setCoworkers] = useState("1.0");
  const [education, setEducation] = useState("1.0");
  const [score, setScore] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const dailySalary = workdays > 0 ? salary / workdays : 0;
  const envTotal = parseFloat(env) * parseFloat(looks) * parseFloat(coworkers);

  const calculate = useCallback(() => {
    const envVal = parseFloat(env);
    const looksVal = parseFloat(looks);
    const coworkersVal = parseFloat(coworkers);
    const eduVal = parseFloat(education);

    const ds = workdays > 0 ? salary / workdays : 0;
    const et = envVal * looksVal * coworkersVal;
    const timeNet = workhours + commute - 0.5 * slacking;
    const denominator = 35 * Math.max(timeNet, 0.1) * eduVal;
    const numerator = ds * et;
    const s = denominator > 0 ? numerator / denominator : 0;

    setScore(s);
    setTimeout(() => {
      animateNumber(scoreRef.current, s);
      smoothScrollIntoView(resultRef.current, { block: "nearest" });
    }, 50);
  }, [salary, workdays, workhours, commute, slacking, env, looks, coworkers, education]);

  const reset = useCallback(() => {
    setSalary(15000);
    setWorkdays(22);
    setWorkhours(8);
    setCommute(1);
    setSlacking(2);
    setEnv("1.2");
    setLooks("1.1");
    setCoworkers("1.0");
    setEducation("1.0");
    setScore(null);
    setDetailOpen(false);
  }, []);

  const resultConfig = score !== null ? getResultConfig(score) : null;
  const gaugeRatio = score !== null ? Math.min(Math.max(score / 2, 0), 1) : 0;

  return (
    <div className="wv-calculator">
      {/* Header */}
      <div className="flex items-center gap-3.5 pb-2">
        <div className="w-10 h-10 rounded-[0.875rem] bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-[1.125rem] font-bold text-title leading-tight">工作性价比计算器</h3>
          <p className="text-[0.8125rem] text-muted">用公式量化你这份工作到底值不值</p>
        </div>
      </div>

      {/* Formula */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-app border border-borderline rounded-[0.875rem] p-3.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider shrink-0">
          <Calculator className="w-3.5 h-3.5" />
          计算公式
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[0.8125rem] font-mono">
          <span className="text-primary font-bold">日薪 × 环境系数</span>
          <span className="text-muted">÷</span>
          <span className="text-body">35 × (工作+通勤-0.5×摸鱼) × 学历系数</span>
        </div>
      </div>

      {/* Salary Card */}
      <WvCard icon={<DollarSign className="w-4 h-4" />} iconClass="wv-icon-salary" title="薪资信息" badge={null}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WvField label="月薪（税前，元）" htmlFor="wv-salary">
            <input
              id="wv-salary"
              type="number"
              value={salary}
              min={0}
              step={100}
              onChange={(e) => setSalary(Number(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="wv-input"
            />
          </WvField>
          <WvField label="每月工作天数" htmlFor="wv-workdays">
            <input
              id="wv-workdays"
              type="number"
              value={workdays}
              min={1}
              max={31}
              onChange={(e) => setWorkdays(Number(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              className="wv-input"
            />
          </WvField>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[color-mix(in_srgb,var(--theme-primary)_5%,var(--theme-app))] rounded-lg border border-dashed border-[color-mix(in_srgb,var(--theme-primary)_20%,var(--theme-borderline))]">
          <span className="text-xs text-muted font-medium">平均日薪</span>
          <span className="flex items-baseline gap-1">
            <span className="text-base font-bold text-title">{dailySalary.toFixed(2)}</span>
            <span className="text-sm text-muted">元</span>
          </span>
        </div>
      </WvCard>

      {/* Time Card */}
      <WvCard icon={<ClockIcon />} iconClass="wv-icon-info" title="时间投入（小时/天）" badge={null}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StepField
            label="工作时长"
            value={workhours}
            onChange={setWorkhours}
            min={0}
            max={24}
            step={0.5}
            onEnter={calculate}
          />
          <StepField
            label="通勤时长"
            value={commute}
            onChange={setCommute}
            min={0}
            max={24}
            step={0.5}
            onEnter={calculate}
          />
          <StepField
            label="摸鱼时长"
            value={slacking}
            onChange={setSlacking}
            min={0}
            max={24}
            step={0.5}
            onEnter={calculate}
          />
        </div>
      </WvCard>

      {/* Environment Card */}
      <WvCard icon={<BuildingIcon />} iconClass="wv-icon-warning" title="综合环境系数" badge={envTotal.toFixed(2)}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <WvSelectField label="工作环境" value={env} onChange={setEnv}>
            <option value="1.0">工厂/偏远地区 (1.0)</option>
            <option value="1.1">普通写字楼 (1.1)</option>
            <option value="1.2">市中心写字楼 (1.2)</option>
            <option value="1.3">CBD/高档写字楼 (1.3)</option>
            <option value="1.4">外企/顶级环境 (1.4)</option>
          </WvSelectField>
          <WvSelectField label="异性颜值" value={looks} onChange={setLooks}>
            <option value="1.0">周围没有异性 (1.0)</option>
            <option value="1.05">少量异性 (1.05)</option>
            <option value="1.1">有一些好看的 (1.1)</option>
            <option value="1.15">很多帅哥美女 (1.15)</option>
            <option value="1.2">遍地都是 (1.2)</option>
          </WvSelectField>
          <WvSelectField label="同事关系" value={coworkers} onChange={setCoworkers}>
            <option value="0.9">勾心斗角 (0.9)</option>
            <option value="1.0">关系一般 (1.0)</option>
            <option value="1.05">比较融洽 (1.05)</option>
            <option value="1.1">亲如一家 (1.1)</option>
          </WvSelectField>
        </div>
      </WvCard>

      {/* Education Card */}
      <WvCard icon={<GraduationIcon />} iconClass="wv-icon-accent" title="学历系数" badge={null}>
        <WvSelectField label="最高学历" value={education} onChange={setEducation}>
          <option value="0.8">大专及以下 (0.8)</option>
          <option value="1.0">本科 (1.0)</option>
          <option value="1.2">硕士 (1.2)</option>
          <option value="1.4">博士 (1.4)</option>
        </WvSelectField>
      </WvCard>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={calculate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] text-sm font-semibold bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active transition-all duration-150 min-h-11"
        >
          <Calculator className="w-4 h-4" />
          计算性价比
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] text-sm font-semibold bg-transparent text-body border-[1.5px] border-borderline hover:bg-[color-mix(in_srgb,var(--theme-primary)_5%,transparent)] hover:border-[color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-borderline))] hover:text-primary transition-all duration-150 min-h-11"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* Result */}
      {score !== null && resultConfig && (
        <div ref={resultRef} className="animate-[fade-in_0.4s_ease_both]">
          <div className="bg-card border border-borderline rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
            {/* Gauge */}
            <div className="relative">
              <svg viewBox="0 0 200 110" className="w-full max-w-[280px] mx-auto">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--theme-borderline)" strokeWidth="12" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--theme-danger)" />
                    <stop offset="35%" stopColor="var(--theme-warning)" />
                    <stop offset="65%" stopColor="var(--theme-primary)" />
                    <stop offset="100%" stopColor="var(--theme-success)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - gaugeRatio * 251.2}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <GaugeNeedle ratio={gaugeRatio} />
                <circle cx="100" cy="100" r="4" fill="var(--theme-title)" />
              </svg>
              <div className="flex justify-between text-xs text-muted px-8 -mt-1">
                <span>低</span>
                <span>中</span>
                <span>高</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-xs text-muted mb-1">你的工作性价比</div>
              <div className="text-4xl font-bold text-title tabular-nums">
                <span ref={scoreRef}>{score.toFixed(2)}</span>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-2 border ${resultConfig.tagClass}`}>
                {resultConfig.tag}
              </div>
            </div>

            {/* Level Bar */}
            <div className="relative pt-4">
              <div className="h-2 bg-app rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-danger via-warning to-success transition-[width] duration-700"
                  style={{ width: `${gaugeRatio * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>0</span>
                <span>0.5</span>
                <span>1.0</span>
                <span>1.5</span>
                <span>2.0+</span>
              </div>
            </div>

            {/* Comment */}
            <p className="text-sm text-body leading-relaxed text-center">{resultConfig.comment}</p>

            {/* Detail */}
            <div>
              <button
                onClick={() => setDetailOpen(!detailOpen)}
                className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mx-auto"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${detailOpen ? "rotate-180" : ""}`} />
                <span>查看计算详情</span>
              </button>
              {detailOpen && (
                <div className="mt-3 p-4 bg-app rounded-xl border border-borderline space-y-2 text-sm">
                  <DetailLine label="日薪" formula={`${salary} ÷ ${workdays} = ${dailySalary.toFixed(2)}`} />
                  <DetailLine
                    label="环境系数"
                    formula={`${parseFloat(env).toFixed(2)} × ${parseFloat(looks).toFixed(2)} × ${parseFloat(coworkers).toFixed(2)} = ${envTotal.toFixed(2)}`}
                  />
                  <DetailLine
                    label="分母"
                    formula={`35 × (${workhours} + ${commute} - 0.5×${slacking}) × ${parseFloat(education).toFixed(1)} = ${(
                      35 * Math.max(workhours + commute - 0.5 * slacking, 0.1) * parseFloat(education)
                    ).toFixed(2)}`}
                  />
                  <DetailLine
                    label="分子"
                    formula={`${dailySalary.toFixed(2)} × ${envTotal.toFixed(2)} = ${(dailySalary * envTotal).toFixed(2)}`}
                  />
                  <div className="flex items-center gap-2 pt-2 border-t border-borderline font-semibold text-title">
                    <span className="text-muted w-12 shrink-0">结果</span>
                    <span>=</span>
                    <span className="text-primary">
                      {(dailySalary * envTotal).toFixed(2)} ÷{" "}
                      {(35 * Math.max(workhours + commute - 0.5 * slacking, 0.1) * parseFloat(education)).toFixed(2)} ={" "}
                      {score.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Sub-components ===== */

function WvCard({
  icon,
  iconClass,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  badge: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-app border border-borderline rounded-2xl overflow-hidden transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--theme-primary)_25%,var(--theme-borderline))]">
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-borderline bg-[color-mix(in_srgb,var(--theme-primary)_3%,var(--theme-app))]">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>{icon}</div>
        <span className="text-sm font-bold text-title flex-1">{title}</span>
        {badge !== null && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md tabular-nums">{badge}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

/**
 * 带标签的表单行。
 *
 * `htmlFor` 是必填的：先前这里是 `<label>` 与控件互为兄弟、却没有 `for`，
 * 于是每个输入框都没有可访问名称（读屏软件只会念「编辑框」）。
 * 不用「把控件包进 label」的隐式关联写法，是因为「按天/按月」那几个字段的
 * children 里还有 +/− 按钮，按钮落在 label 内会让点击被转义到输入框上。
 */
function WvField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-body">
        {label}
      </label>
      {children}
    </div>
  );
}

function WvSelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <WvField label={label} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-[1.5px] border-borderline bg-card text-title text-sm py-2.5 pl-3.5 pr-9 rounded-[0.625rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--theme-primary)_18%,transparent)] transition-colors cursor-pointer"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
      </div>
    </WvField>
  );
}

function StepField({
  label,
  value,
  onChange,
  min,
  max,
  step: stepVal,
  onEnter,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  onEnter: () => void;
}) {
  const id = useId();
  return (
    <WvField label={label} htmlFor={id}>
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          aria-label={`减少${label}`}
          onClick={() => onChange(Math.min(Math.max(Math.round((value - stepVal) / stepVal) * stepVal, min), max))}
          className="w-9 flex items-center justify-center border-[1.5px] border-borderline bg-card text-muted font-semibold rounded-l-[0.625rem] border-r-0 hover:bg-[color-mix(in_srgb,var(--theme-primary)_8%,var(--theme-card))] hover:text-primary hover:border-[color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-borderline))] transition-colors"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={stepVal}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
          className="flex-1 min-w-0 text-center border-y-[1.5px] border-borderline bg-card text-title text-sm py-2.5 outline-none focus:border-primary"
        />
        <button
          type="button"
          aria-label={`增加${label}`}
          onClick={() => onChange(Math.min(Math.max(Math.round((value + stepVal) / stepVal) * stepVal, min), max))}
          className="w-9 flex items-center justify-center border-[1.5px] border-borderline bg-card text-muted font-semibold rounded-r-[0.625rem] border-l-0 hover:bg-[color-mix(in_srgb,var(--theme-primary)_8%,var(--theme-card))] hover:text-primary hover:border-[color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-borderline))] transition-colors"
        >
          +
        </button>
      </div>
    </WvField>
  );
}

function DetailLine({ label, formula }: { label: string; formula: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-body">
      <span className="text-muted w-12 shrink-0">{label}</span>
      <span>=</span>
      <span className="font-mono text-primary font-semibold">{formula}</span>
    </div>
  );
}

function GaugeNeedle({ ratio }: { ratio: number }) {
  const angle = 180 - ratio * 180;
  const rad = (angle * Math.PI) / 180;
  const r = 72;
  const x2 = 100 + r * Math.cos(rad);
  const y2 = 100 - r * Math.sin(rad);
  return (
    <line
      x1="100"
      y1="100"
      x2={x2}
      y2={y2}
      stroke="var(--theme-title)"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transition: "all 0.8s ease" }}
    />
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}
