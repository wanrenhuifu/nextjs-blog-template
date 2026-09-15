"use client";

import { useState, useCallback, useRef } from "react";
import { Lightbulb, CheckCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { smoothScrollIntoView } from "@/lib/a11y";

const questions = [
  { id: "q1", part: "A", text: "很难对细节或粗心错误保持专注" },
  { id: "q2", part: "A", text: "很难在阅读或对话中保持注意力" },
  { id: "q3", part: "A", text: "很难按计划组织任务和活动" },
  { id: "q4", part: "B", text: "当需要静坐时感到坐立不安" },
  { id: "q5", part: "B", text: "很难从事休闲活动或安静地待着" },
  { id: "q6", part: "B", text: "感觉好像被马达驱动、无法停下" },
];

const options = [
  { value: 0, label: "从不" },
  { value: 1, label: "很少" },
  { value: 2, label: "有时" },
  { value: 3, label: "经常" },
  { value: 4, label: "非常频繁" },
];

interface ResultData {
  partAPositive: number;
  partBPositive: number;
  totalScore: number;
  isPositive: boolean;
}

export function ADHDTest() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultData | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / 6) * 100;

  const selectOption = useCallback((qid: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const calculate = useCallback(() => {
    const values = Object.values(answers);
    const totalScore = values.reduce((s, v) => s + v, 0);

    const partAIds = ["q1", "q2", "q3"];
    const partAPositive = partAIds.filter((id) => (answers[id] ?? -1) >= 2).length;

    const partBIds = ["q4", "q5", "q6"];
    const partBPositive = partBIds.filter((id) => (answers[id] ?? -1) >= 3).length;

    const isPositive = partAPositive >= 2 || partBPositive >= 2;

    setResult({ partAPositive, partBPositive, totalScore, isPositive });

    setTimeout(() => {
      smoothScrollIntoView(resultRef.current, { block: "nearest" });
    }, 50);
  }, [answers]);

  const reset = useCallback(() => {
    setAnswers({});
    setResult(null);
  }, []);

  return (
    <div className="adhd-test">
      {/* Intro */}
      <div className="flex items-start gap-3.5 pb-1">
        <div className="w-10 h-10 rounded-[0.875rem] bg-info/10 text-info flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3
            className="text-[1.125rem] font-bold text-title font-serif leading-tight"
          >
            ASRS-5 成人 ADHD 自评量表
          </h3>
          <p className="text-[0.8125rem] text-muted mt-1 leading-relaxed">
            世界卫生组织（WHO）推荐的 6 题简化筛查工具。请根据过去 6 个月的情况如实回答。
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">答题进度</span>
          <span className="text-xs font-bold text-primary tabular-nums">{answeredCount} / 6</span>
        </div>
        <div className="h-1.5 bg-app rounded-full overflow-hidden border border-borderline">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          return (
            <fieldset
              key={q.id}
              className={`border rounded-2xl p-5 m-0 bg-app transition-colors duration-200 ${
                selected !== undefined
                  ? "border-[color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-borderline))] shadow-[0_2px_8px_color-mix(in_srgb,var(--theme-primary)_5%,transparent)]"
                  : "border-borderline"
              }`}
            >
              <legend className="flex items-center gap-2 mb-3 p-0 text-[0.9375rem] font-semibold text-title leading-relaxed">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 min-w-0">{q.text}</span>
                <span className="text-[0.6875rem] font-semibold text-muted bg-card px-2 py-0.5 rounded-md border border-borderline shrink-0">
                  Part {q.part}
                </span>
              </legend>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {options.map((opt) => {
                  const isSelected = selected === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="relative cursor-pointer select-none"
                    >
                      {/*
                        原生 radio 用 sr-only 藏起来，键盘焦点必须由这层可见的 span 表达出来 ——
                        否则键盘用户按 Tab 走过 6 道题时，屏幕上没有任何位置提示
                        （视觉上只有「已选中」态，而焦点与选中是两回事）。
                        peer-focus-visible 让焦点环只在键盘操作时出现，鼠标点击不闪。
                      */}
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => selectOption(q.id, opt.value)}
                        className="peer sr-only"
                      />
                      <span
                        className={`flex items-center justify-center gap-1 min-h-11 px-3 py-2 text-[0.8125rem] font-medium rounded-[0.625rem] border-[1.5px] text-center transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-app ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : "bg-card border-borderline text-body hover:border-[color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-borderline))] hover:bg-[color-mix(in_srgb,var(--theme-primary)_5%,var(--theme-card))]"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={calculate}
          disabled={answeredCount < 6}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[0.625rem] text-sm font-semibold bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active transition-all duration-150 min-h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          查看结果
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
      {result && (
        <div ref={resultRef} className="animate-[fade-in_0.4s_ease_both]">
          <div className="bg-app border border-borderline rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
            {/* Verdict */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-[0.875rem] flex items-center justify-center shrink-0 ${
                  result.isPositive
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                }`}
              >
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider">筛查结论</div>
                <div
                  className={`text-xl font-bold mt-0.5 font-serif ${
                    result.isPositive ? "text-warning" : "text-success"
                  }`}
                >
                  {result.isPositive ? "筛查阳性" : "筛查阴性"}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Part A 阳性题数"
                value={result.partAPositive}
                unit="/ 3"
                fillWidth={(result.partAPositive / 3) * 100}
                fillColor="bg-info"
              />
              <StatCard
                label="Part B 阳性题数"
                value={result.partBPositive}
                unit="/ 3"
                fillWidth={(result.partBPositive / 3) * 100}
                fillColor="bg-warning"
              />
              <StatCard
                label="总分"
                value={result.totalScore}
                unit="/ 24"
                fillWidth={(result.totalScore / 24) * 100}
                fillColor="bg-primary"
              />
            </div>

            {/* Interpretation */}
            <div className="p-5 rounded-xl bg-[color-mix(in_srgb,var(--theme-primary)_4%,var(--theme-card))] border border-dashed border-[color-mix(in_srgb,var(--theme-primary)_20%,var(--theme-borderline))]">
              <h4
                className="text-[0.9375rem] font-bold text-title font-serif mb-2"
              >
                结果解读
              </h4>
              <p className="text-[0.8125rem] text-body leading-relaxed">
                {result.isPositive
                  ? "您的筛查结果为阳性，意味着您报告的症状模式与成人 ADHD 的常见表现有一定重合。这并不代表确诊——ADHD 的诊断需要专业医生结合病史、行为观察及排除其他疾病后综合判断。建议您：1）记录日常生活中具体的注意力或冲动相关困扰；2）前往医院精神科或心理科进一步评估。"
                  : "您的筛查结果为阴性，意味着您在 ASRS-5 的核心症状维度上未达到筛查阈值。如果您的日常生活确实存在明显的注意力涣散、冲动或过度活跃等困扰，建议进一步关注具体场景（如工作、学习、社交）中的表现，必要时仍可寻求专业评估。"}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2 items-center p-3 rounded-xl bg-warning/5 border border-warning/15 text-muted">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <p className="text-xs leading-relaxed">
                本工具仅为筛查参考，不能替代专业医学诊断。如您对自己的状况有疑虑，建议前往医院精神科或心理科进行系统评估。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  fillWidth,
  fillColor,
}: {
  label: string;
  value: number;
  unit: string;
  fillWidth: number;
  fillColor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 sm:p-4 bg-card rounded-xl border border-borderline">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="flex items-baseline gap-1 text-xl font-bold text-title tabular-nums">
        {value}
        <span className="text-sm font-medium text-muted">{unit}</span>
      </div>
      <div className="h-1.5 bg-app rounded-full overflow-hidden mt-1">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${fillColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  );
}
