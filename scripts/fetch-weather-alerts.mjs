#!/usr/bin/env node
/**
 * 抓取全国省会城市天气预警（全部级别）
 * 用法：QWEATHER_KEY=xxx QWEATHER_HOST=xxx node scripts/fetch-weather-alerts.mjs
 * 输出：data/radar/weather-alerts.json
 *
 * 使用和风天气实时天气预警 API v1 (/weatheralert/v1/current)
 * 旧 API (/v7/warning/now) 已于 2026-10-01 弃用，此处保留 fallback
 *
 * 两个环境变量都来自和风天气控制台：
 *   QWEATHER_KEY   —— API Key
 *   QWEATHER_HOST  —— 你的专属 API Host（形如 xxxxxx.re.qweatherapi.com）
 * 和风为每个账号分配独立 Host，**不能复用别人的**，所以这里没有默认值。
 *
 * 未配置时本脚本**跳过抓取并以 0 退出**，不阻断构建 —— 它是 `npm run build`
 * 链条的第一环，缺 KEY 就让整个构建失败会让 fork 后的首次构建无法进行。
 * 此时若 data/radar/weather-alerts.json 已存在则原样保留，天气页照常渲染旧数据。
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'radar');
const OUT_FILE = join(OUT_DIR, 'weather-alerts.json');

const HOST = process.env.QWEATHER_HOST || '';
const KEY = process.env.QWEATHER_KEY || '';

const CITIES = [
  // 华北
  { name: '北京', lat: '39.92', lon: '116.41' },
  { name: '天津', lat: '39.08', lon: '117.20' },
  { name: '石家庄', lat: '38.03', lon: '114.48' },
  { name: '太原', lat: '37.87', lon: '112.55' },
  { name: '呼和浩特', lat: '40.83', lon: '111.73' },
  // 东北
  { name: '沈阳', lat: '41.80', lon: '123.43' },
  { name: '长春', lat: '43.88', lon: '125.32' },
  { name: '哈尔滨', lat: '45.80', lon: '126.53' },
  // 华东
  { name: '上海', lat: '31.23', lon: '121.47' },
  { name: '南京', lat: '32.07', lon: '118.78' },
  { name: '杭州', lat: '30.28', lon: '120.15' },
  { name: '合肥', lat: '31.87', lon: '117.28' },
  { name: '福州', lat: '26.08', lon: '119.30' },
  { name: '南昌', lat: '28.68', lon: '115.85' },
  { name: '济南', lat: '36.67', lon: '117.02' },
  // 华中
  { name: '郑州', lat: '34.75', lon: '113.62' },
  { name: '武汉', lat: '30.59', lon: '114.30' },
  { name: '长沙', lat: '28.23', lon: '112.98' },
  // 华南
  { name: '广州', lat: '23.13', lon: '113.28' },
  { name: '南宁', lat: '22.82', lon: '108.37' },
  { name: '海口', lat: '20.03', lon: '110.33' },
  // 西南
  { name: '重庆', lat: '29.56', lon: '106.55' },
  { name: '成都', lat: '30.67', lon: '104.07' },
  { name: '贵阳', lat: '26.65', lon: '106.63' },
  { name: '昆明', lat: '25.04', lon: '102.73' },
  { name: '拉萨', lat: '29.65', lon: '91.12' },
  // 西北
  { name: '西安', lat: '34.27', lon: '108.93' },
  { name: '兰州', lat: '36.06', lon: '103.82' },
  { name: '西宁', lat: '36.62', lon: '101.78' },
  { name: '银川', lat: '38.49', lon: '106.23' },
  { name: '乌鲁木齐', lat: '43.83', lon: '87.62' },
];

const COLOR_ORDER = { red: 0, orange: 1, yellow: 2, blue: 3 };

/**
 * 当 color.code 为空时，根据 severity 推断颜色
 */
function inferColorCode(alert) {
  const code = alert.color?.code?.toLowerCase();
  if (code) return code;

  const severityMap = {
    extreme: 'red',
    severe: 'orange',
    moderate: 'yellow',
    minor: 'blue',
  };
  return severityMap[alert.severity?.toLowerCase()] || '';
}

/**
 * 新 API: /weatheralert/v1/current/{lat}/{lon}
 * 返回 null 表示需要 fallback 到旧 API
 */
async function fetchCityNew(city) {
  try {
    const url = `https://${HOST}/weatheralert/v1/current/${city.lat}/${city.lon}?lang=zh`;
    const res = await fetch(url, {
      headers: { 'X-QW-Api-Key': KEY },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return null; // 认证问题，尝试旧 API
      }
      console.warn(`新 API HTTP 错误 (${city.name}): ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (!data.metadata) {
      console.warn(`新 API 响应异常 (${city.name}): 缺少 metadata`);
      return null;
    }

    if (data.metadata.zeroResult || !data.alerts || !Array.isArray(data.alerts)) {
      return [];
    }

    return data.alerts.map((a) => ({
      city: city.name,
      headline: a.headline || '',
      eventTypeName: a.eventType?.name || '',
      colorCode: inferColorCode(a),
      issuedTime: a.issuedTime || '',
      senderName: a.senderName || '',
      description: a.description || '',
    }));
  } catch (err) {
    console.warn(`新 API 请求失败 (${city.name}):`, err.message);
    return null;
  }
}

/**
 * 旧 API: /v7/warning/now (2026-10-01 停止服务)
 */
async function fetchCityOld(city) {
  try {
    const url = `https://${HOST}/v7/warning/now?location=${city.lon},${city.lat}&lang=zh`;
    const res = await fetch(url, {
      headers: { 'X-QW-Api-Key': KEY },
    });
    const data = await res.json();

    if (data.code !== '200') {
      if (data.code === '204') {
        return [];
      }
      console.warn(`旧 API 错误 (${city.name}):`, data.code, data.message || '');
      return [];
    }

    if (!data.warning || !Array.isArray(data.warning)) {
      return [];
    }

    return data.warning.map((a) => ({
      city: city.name,
      headline: a.title || '',
      eventTypeName: a.typeName || '',
      colorCode: a.severityColor?.toLowerCase() || '',
      issuedTime: a.pubTime || '',
      senderName: a.sender || '',
      description: a.text || '',
    }));
  } catch (err) {
    console.warn(`旧 API 请求失败 (${city.name}):`, err.message);
    return [];
  }
}

async function fetchCity(city) {
  const newAlerts = await fetchCityNew(city);
  if (newAlerts !== null) return newAlerts;
  return fetchCityOld(city);
}

function skip(reason) {
  console.log(`[weather] 跳过抓取：${reason}`);
  if (existsSync(OUT_FILE)) {
    console.log('[weather] 保留已有的 data/radar/weather-alerts.json，天气页将渲染这份数据');
  } else {
    console.log('[weather] 尚无本地数据，天气页会显示空态（不影响其他页面）');
  }
  console.log('[weather] 详见 .env.example 里的 QWEATHER_KEY / QWEATHER_HOST');
}

async function main() {
  // 缺配置时跳过而非失败：本脚本处于 `npm run build` 链条的第一环，
  // 若以非零退出会中断整个构建，导致 fork 后的首次构建直接失败。
  if (!KEY) return skip('未设置 QWEATHER_KEY 环境变量');
  if (!HOST) return skip('未设置 QWEATHER_HOST 环境变量（和风为每个账号分配专属 Host）');

  console.log('开始抓取天气预警数据...');

  const results = await Promise.all(CITIES.map(fetchCity));
  const alerts = results.flat();

  alerts.sort((a, b) => (COLOR_ORDER[a.colorCode] ?? 99) - (COLOR_ORDER[b.colorCode] ?? 99));

  const output = {
    updatedAt: new Date().toISOString(),
    source: '和风天气',
    count: alerts.length,
    alerts,
  };

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`已写入 ${OUT_FILE}`);
  console.log(`共 ${alerts.length} 条预警`);
  if (alerts.length > 0) {
    alerts.forEach((a) => console.log(`  - [${a.colorCode}] ${a.city}: ${a.headline}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
