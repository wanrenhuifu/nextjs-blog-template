/**
 * 竹苗彩蛋：成长阶段纯逻辑
 *
 * 阶段由累计访问次数驱动，阈值见 BAMBOO_STAGES。
 * 组件层负责 localStorage 读写与动画，这里只保留可单测的计算。
 */

export interface BambooStage {
  /** 阶段名（tooltip 展示） */
  name: string;
  /** 进入该阶段所需的最低访问次数 */
  minVisits: number;
  /** 悬停提示语 */
  hint: string;
}

export const BAMBOO_STAGES: BambooStage[] = [
  { name: "竹笋", minVisits: 1, hint: "破土而出，初次见面" },
  { name: "幼苗", minVisits: 3, hint: "常来看看，我就长大一点" },
  { name: "小节竹", minVisits: 7, hint: "已经能随风摇摆了" },
  { name: "青竹", minVisits: 15, hint: "亭亭玉立，感谢陪伴" },
  { name: "开花竹", minVisits: 30, hint: "竹生百年，方得一花" },
];

/**
 * 按访问次数返回阶段下标（0 起）。
 * visits 小于 1 时视为第 0 阶段（组件尚未计数的保底态）。
 */
export function getBambooStageIndex(visits: number): number {
  let index = 0;
  for (let i = 0; i < BAMBOO_STAGES.length; i++) {
    if (visits >= BAMBOO_STAGES[i].minVisits) index = i;
  }
  return index;
}

/**
 * localStorage / sessionStorage 键名。
 *
 * 前缀取 `blog.` 而非站点名：这些键存在**访客浏览器**里，同一台机器上的多个
 * 静态站点（github.io 下的不同项目页共享同源）若用同一前缀会互相覆盖计数。
 * 换站点名时不必改这里；但若你同时部署了多个本站副本，请给它们各自不同的前缀。
 */
export const BAMBOO_VISITS_KEY = "blog.bamboo.visits";
export const BAMBOO_SESSION_KEY = "blog.bamboo.session";
export const BAMBOO_LAST_STAGE_KEY = "blog.bamboo.lastStage";
