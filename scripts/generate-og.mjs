/**
 * 生成默认分享图 public/og-default.png（1200×630）
 *
 * 站名、标语、域名都从根目录的 site.config.mjs 读取 —— 它们是**烧进 PNG 像素**的，
 * 改了 site.config.mjs 之后必须重跑本脚本，否则分享图上的还是旧站名。
 * 这一点容易忘：页面上其他地方的站名会自动更新，只有图片不会。
 *
 * 用法：node scripts/generate-og.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { siteConfig, normalizeSiteUrl } from "../site.config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "public", "og-default.png");

const WIDTH = 1200;
const HEIGHT = 630;

const title = siteConfig.name;
const tagline = siteConfig.ogTagline;

/**
 * 主标题字号随站名长度收缩：4 字时用设计值 72，更长的站名按可用宽度反推，
 * 避免长站名溢出画布或被裁切。1040 是左右各留 80 边距后的可用宽度。
 */
const LETTER_SPACING = 8;
const titleSize = Math.max(
  28,
  Math.min(72, Math.floor(1040 / Math.max(Array.from(title).length, 1)) - LETTER_SPACING),
);

/** 底部展示的域名（去掉协议前缀）。仍是占位域名时会照实显示，提醒你还没换 */
const displayHost = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL).replace(
  /^https?:\/\//,
  "",
);

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF"/>
      <stop offset="100%" style="stop-color:#F4F4F1"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#C43A1B" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- 顶部装饰线 -->
  <rect x="80" y="80" width="1040" height="3" rx="1.5" fill="#C43A1B" opacity="0.3"/>
  <rect x="80" y="80" width="180" height="3" rx="1.5" fill="#C43A1B"/>

  <!-- 主标题 -->
  <text
    x="600" y="320"
    font-family="'Songti SC', 'Source Han Serif SC', 'Noto Serif CJK SC', 'SimSun', serif"
    font-size="${titleSize}"
    font-weight="700"
    fill="#0A0A0B"
    text-anchor="middle"
    letter-spacing="${LETTER_SPACING}"
  >${escapeXml(title)}</text>

  <!-- 副标题 -->
  <text
    x="600" y="390"
    font-family="'Songti SC', 'Source Han Serif SC', 'Noto Serif CJK SC', 'SimSun', serif"
    font-size="28"
    font-weight="400"
    fill="#6E6E76"
    text-anchor="middle"
    letter-spacing="2"
  >${escapeXml(tagline)}</text>

  <!-- 底部品牌色块 -->
  <rect x="80" y="520" width="1040" height="2" rx="1" fill="#E5E5DF"/>
  <text
    x="1120" y="560"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="18"
    font-weight="500"
    fill="#C43A1B"
    text-anchor="end"
  >${escapeXml(displayHost)}</text>

  <!-- 右下角竹叶装饰（墨竹） -->
  <path d="M 1100 480 Q 1120 460 1140 470 Q 1125 485 1100 480Z" fill="#3A453C" opacity="0.20"/>
  <path d="M 1080 500 Q 1105 475 1130 490 Q 1110 510 1080 500Z" fill="#3A453C" opacity="0.14"/>
</svg>
`;

/** XML 转义：站名里出现 & 或 < 时会让整张 SVG 解析失败 */
function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(OUTPUT_PATH);

  console.log(`✓ OG image generated → ${OUTPUT_PATH}`);
  console.log(`  站名「${title}」（字号 ${titleSize}） / 域名 ${displayHost}`);
}

main().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
