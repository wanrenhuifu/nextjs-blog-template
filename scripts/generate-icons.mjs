#!/usr/bin/env node
/**
 * 生成站点图标：public/favicon.svg 与 public/apple-touch-icon.png
 *
 * 为什么两个图标由同一个脚本产出：它们曾经不一致 —— favicon 是一片绿色竹林小图，
 * apple 图标是绿底白字「万」。根源是两者各自手工维护、没有共同的形状定义。
 * 现在墨竹几何只在这里写一次，两个产物由它派生，结构上不可能再漂移。
 *
 * 画法（几轮栅格化对比后的结论）：
 * - **竿用淡墨、节与叶用浓墨**。这是墨竹的真实画法，也是节点能被看见的前提 ——
 *   同色画节则节完全隐没。
 * - **节线只跨竿宽，不凸出竿外**。早先让节左右探出竿外，结果「竖杆 + 横杠」
 *   直接被读成梯子 / 铁轨（实测三版都栽在这里）。
 * - **叶子要放大**。最初用 0.32–0.42 的短叶，缩到 16px 变成几个小勾，
 *   完全不像叶；放大到 0.48 并加宽后才有垂叶的形。
 * - **单竿优于双竿**。16px 下两根竿会挤在一起糊成一块。
 * - 16px 下**竹节是认不出的**（1px 的横线会被抗锯齿抹掉），所以"是竹子"这件事
 *   由粗竿身 + 顶部垂叶的剪影承担，节线只在 32px 以上起补充作用。
 *
 * 不用 `<text>` 字符：一是会被系统字体差异左右，二是文字紧贴站点名容易被读成署姓。
 * 全部用 path 绘制。竹叶 path 与 HeroScenery / 日间自定义光标同源。
 *
 * 图标不含站点名，因此 fork 之后**不需要**重新生成 —— 除非你想换掉这株墨竹。
 *
 * 用法：node scripts/generate-icons.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

/** 宣纸底：与日间 --theme-app 同值 */
const PAPER = "#FAFAF8";
/** 淡墨 —— 竿（介于 --theme-stalk-far 与 --theme-stalk-near 之间，为小尺寸识读略作加深） */
const INK_PALE = "#5A655C";
/** 浓墨 —— 节与叶（与 --theme-stalk-near 同源） */
const INK_DARK = "#232A25";

/** 竹叶：叶柄在 (0,11)，向 +x 伸展 */
const LEAF = "M0 11 C22 3 60 -1 100 14 C60 20 22 18 0 11 Z";
/** 竹竿：底宽 16、顶宽 14，向上略偏右 */
const CULM = "M32 96 L36 16 L50 16 L48 96 Z";

/** 一道竹节：只跨竿宽，略带下凹的弧 */
const node = (x1, x2, y) =>
  `<path d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + 4} ${x2} ${y}" fill="none" stroke="${INK_DARK}" stroke-width="3.6" stroke-linecap="round"/>`;

/** 一片垂叶：叶柄落于 (bx,by)，按角度伸展 */
const leaf = (bx, by, angle, scale) =>
  `<path d="${LEAF}" fill="${INK_DARK}" transform="translate(${bx} ${by}) rotate(${angle}) scale(${scale} ${scale * 1.55}) translate(0 -11)"/>`;

const mark = `
    <path d="${CULM}" fill="${INK_PALE}"/>
    ${node(33.5, 49.5, 34)}
    ${node(34, 49, 56)}
    ${node(34.5, 48.5, 78)}
    ${leaf(49, 27, -30, 0.34)}
    ${leaf(48, 32, 24, 0.48)}
    ${leaf(38, 40, 152, 0.36)}`;

/** favicon：自带圆角，因为浏览器不会给图标套遮罩 */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="${PAPER}"/>
  <g>${mark}
  </g>
</svg>
`;

/** apple 图标：画满整块方形，圆角交给 iOS 自己的遮罩，避免出现双层圆角 */
const appleSize = 180;
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${appleSize}" height="${appleSize}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${PAPER}"/>
  <g>${mark}
  </g>
</svg>
`;

const faviconPath = path.join(PUBLIC_DIR, "favicon.svg");
const applePath = path.join(PUBLIC_DIR, "apple-touch-icon.png");

writeFileSync(faviconPath, faviconSvg, "utf-8");
console.log(`✓ favicon → ${faviconPath}`);

await sharp(Buffer.from(appleSvg)).resize(appleSize, appleSize).png().toFile(applePath);
console.log(`✓ apple icon → ${applePath}`);
