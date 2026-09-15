/**
 * lib/bamboo.ts 行为级测试
 *
 * 覆盖竹苗彩蛋的阶段计算：各阈值边界、单调性与阶段表完整性。
 */
import { describe, expect, it } from "vitest";
import { BAMBOO_STAGES, getBambooStageIndex } from "@/lib/bamboo";

describe("getBambooStageIndex — 阶段阈值边界", () => {
  it("未计数或不足 1 次时落在第 0 阶段", () => {
    expect(getBambooStageIndex(0)).toBe(0);
    expect(getBambooStageIndex(-5)).toBe(0);
  });

  it("每个阈值下界进入对应阶段，上界停留在前一阶段", () => {
    // 竹笋(1) / 幼苗(3) / 小节竹(7) / 青竹(15) / 开花竹(30)
    expect(getBambooStageIndex(1)).toBe(0);
    expect(getBambooStageIndex(2)).toBe(0);
    expect(getBambooStageIndex(3)).toBe(1);
    expect(getBambooStageIndex(6)).toBe(1);
    expect(getBambooStageIndex(7)).toBe(2);
    expect(getBambooStageIndex(14)).toBe(2);
    expect(getBambooStageIndex(15)).toBe(3);
    expect(getBambooStageIndex(29)).toBe(3);
    expect(getBambooStageIndex(30)).toBe(4);
    expect(getBambooStageIndex(1000)).toBe(4);
  });
});

describe("BAMBOO_STAGES — 阶段表完整性", () => {
  it("共 5 个阶段，阈值严格递增且名称/提示语非空", () => {
    expect(BAMBOO_STAGES).toHaveLength(5);
    for (let i = 0; i < BAMBOO_STAGES.length; i++) {
      const stage = BAMBOO_STAGES[i];
      expect(stage.name.length).toBeGreaterThan(0);
      expect(stage.hint.length).toBeGreaterThan(0);
      if (i > 0) {
        expect(stage.minVisits).toBeGreaterThan(BAMBOO_STAGES[i - 1].minVisits);
      }
    }
  });
});
