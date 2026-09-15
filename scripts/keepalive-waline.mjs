#!/usr/bin/env node
/**
 * Waline 后端保活 ping
 * 用法：node scripts/keepalive-waline.mjs
 *
 * Waline 评论后端（Vercel serverless）使用 Supabase 免费层数据库，
 * 约 7 天无活动会被自动暂停，导致评论 API 全站 500。
 * 本脚本发一个轻量只读请求保持数据库活跃，由 deploy.yml 的
 * cron（每 12 小时重新构建）顺带驱动，无需额外 workflow。
 *
 * 永不阻断构建：
 * - 未设置 NEXT_PUBLIC_WALINE_SERVER_URL（如本地裸跑 node）→ 静默跳过；
 * - 请求超时 / HTTP 非 200 / errno 非 0 → 仅打印警告，退出码仍为 0。
 */

import "./load-env.mjs";

const serverUrl = process.env.NEXT_PUBLIC_WALINE_SERVER_URL;

if (!serverUrl) {
  console.log('未设置 NEXT_PUBLIC_WALINE_SERVER_URL，跳过 Waline 保活 ping');
  process.exit(0);
}

const pingUrl = `${serverUrl.replace(/\/+$/, '')}/api/comment?type=recent&count=1`;

console.log(`Waline 保活：${pingUrl}`);

try {
  const res = await fetch(pingUrl, {
    // 通用 UA：原先带站点品牌名，fork 后既无意义，也会把上游来源暴露在请求里
    headers: { 'User-Agent': 'static-blog-keepalive/1.0' },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const body = await res.json().catch(() => null);
  if (body && body.errno === 0) {
    console.log('Waline 后端存活（errno=0），保活成功');
  } else {
    const preview = JSON.stringify(body ?? '').slice(0, 200);
    console.warn(`⚠ Waline 后端响应异常（不阻断构建）：${preview}`);
  }
} catch (err) {
  console.warn(`⚠ Waline 保活 ping 失败（不阻断构建）：${err.message}`);
}
