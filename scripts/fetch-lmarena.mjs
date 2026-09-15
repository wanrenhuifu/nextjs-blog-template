#!/usr/bin/env node
/**
 * 抓取 LMArena 榜单数据
 * 用法：node scripts/fetch-lmarena.mjs
 * 输出：data/radar/lmarena.json
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'data', 'radar', 'lmarena.json');

function extractJsonArray(str, startIdx) {
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = startIdx; i < str.length; i++) {
    const c = str[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"' && !inStr) { inStr = true; }
    else if (c === '"' && inStr) { inStr = false; }
    else if (!inStr) {
      if (c === '[') depth++;
      else if (c === ']') {
        depth--;
        if (depth === 0) return str.slice(startIdx, i + 1);
      }
    }
  }
  return null;
}

function extractJsonObject(str, startIdx) {
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = startIdx; i < str.length; i++) {
    const c = str[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"' && !inStr) { inStr = true; }
    else if (c === '"' && inStr) { inStr = false; }
    else if (!inStr) {
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return str.slice(startIdx, i + 1);
      }
    }
  }
  return null;
}

async function fetchLeaderboard() {
  const url = 'https://arena.ai/leaderboard';
  console.log(`正在抓取 ${url} ...`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const html = await res.text();

  // Extract all self.__next_f.push payloads
  // NOTE: 依赖 Next.js RSC 序列化格式 (self.__next_f.push)，非稳定公开 API。
  // 若 arena.ai 升级 Next.js 大版本，此解析逻辑可能失效，需同步更新正则。
  // 失效时脚本将回退到本地缓存数据（不会阻断构建）。
  const regex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/gs;
  let m;
  let leaderboardsData = null;

  while ((m = regex.exec(html)) !== null) {
    const payload = m[1];
    // Unescape quotes
    const cleaned = payload.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    if (cleaned.includes('"leaderboards"') && cleaned.includes('"entries"')) {
      // Try to extract the leaderboards array
      const lbIdx = cleaned.indexOf('"leaderboards"');
      const arrStart = cleaned.indexOf('[', lbIdx + '"leaderboards"'.length);
      if (arrStart !== -1) {
        const arrStr = extractJsonArray(cleaned, arrStart);
        if (arrStr) {
          try {
            leaderboardsData = JSON.parse(arrStr);
            console.log(`找到 leaderboards 数据，包含 ${leaderboardsData.length} 个榜单`);
            break;
          } catch {
            // Continue to next payload
          }
        }
      }
    }
  }

  if (!leaderboardsData || leaderboardsData.length === 0) {
    throw new Error('未能从页面解析到 leaderboard 数据。');
  }

  // Arena slug to Chinese category mapping
  const categoryMap = {
    text: '文本总榜',
    agent: 'Agent',
    code: '代码',
    'code/webdev': 'WebDev',
    math: '数学',
    vision: '视觉',
    document: '文档',
    'text-to-image': '文生图总榜',
    'image-edit': '图像编辑',
    'image-to-code': '图生代码',
    'code/image-to-webdev': 'Image-to-WebDev',
    'text/coding': '文本·编码',
    search: '搜索',
    'text-to-video': '文生视频总榜',
    'image-to-video': '图生视频',
    'video-to-video': '总体',
    'video-edit': '视频编辑',
  };

  // Transform to our format
  const seenSlugs = new Set();
  const leaderboards = [];

  for (const lb of leaderboardsData) {
    const entries = lb.entries || [];
    const items = entries.slice(0, 10).map(entry => ({
      rank: entry.rank,
      model: String(entry.modelDisplayName || ''),
      org: String(entry.modelOrganization || ''),
    }));
    // 过滤掉 model 或 org 为空的条目
    const validItems = items.filter(item => item.model && item.org);

    if (validItems.length === 0) continue;

    const arenaSlug = lb.arenaSlug || 'unknown';
    const slug = arenaSlug;

    // 主页面 "code" 与 "code/webdev" 数据重复，由 text/coding 子页面替代
    if (slug === 'code') continue;

    // Skip duplicates
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    const category = categoryMap[arenaSlug] || lb.category?.title || arenaSlug;

    leaderboards.push({
      slug,
      category,
      arenaSlug,
      description: `${category}排行榜，展示当前领域表现最优的 AI 模型。`,
      items: validItems,
    });
  }

  if (leaderboards.length === 0) {
    throw new Error('解析到的榜单数据为空。');
  }

  // 主页面未覆盖的分类，尝试抓取独立子页面
  const extraSlugs = ['agent', 'code/webdev', 'text/coding'];
  for (const extraSlug of extraSlugs) {
    if (seenSlugs.has(extraSlug)) continue;

    const subUrl = `https://arena.ai/leaderboard/${extraSlug}`;
    console.log(`正在抓取补充页面 ${subUrl} ...`);
    try {
      const subRes = await fetch(subUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(30000),
      });
      if (!subRes.ok) {
        console.warn(`  跳过 (HTTP ${subRes.status})`);
        continue;
      }
      const subHtml = await subRes.text();
      const subRegex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/gs;
      let subM;
      while ((subM = subRegex.exec(subHtml)) !== null) {
        const subPayload = subM[1];
        const subCleaned = subPayload.replace(/\\"/g, '"').replace(/\\n/g, '\n');

        // 格式 A：主页面格式 {"leaderboards": [{ "entries": [...] }]}
        if (subCleaned.includes('"leaderboards"') && subCleaned.includes('"entries"')) {
          const lbIdx = subCleaned.indexOf('"leaderboards"');
          const arrStart = subCleaned.indexOf('[', lbIdx + '"leaderboards"'.length);
          if (arrStart !== -1) {
            const arrStr = extractJsonArray(subCleaned, arrStart);
            if (arrStr) {
              try {
                const subData = JSON.parse(arrStr);
                for (const lb of subData) {
                  const entries = lb.entries || [];
                  const items = entries.slice(0, 10).map(entry => ({
                    rank: entry.rank,
                    model: String(entry.modelDisplayName || ''),
                    org: String(entry.modelOrganization || ''),
                  }));
                  const validItems = items.filter(item => item.model && item.org);
                  if (validItems.length === 0) continue;
                  const arenaSlug = lb.arenaSlug || extraSlug;
                  if (seenSlugs.has(arenaSlug)) continue;
                  seenSlugs.add(arenaSlug);
                  const category = categoryMap[arenaSlug] || lb.category?.title || arenaSlug;
                  leaderboards.push({
                    slug: arenaSlug,
                    category,
                    arenaSlug,
                    description: `${category}排行榜，展示当前领域表现最优的 AI 模型。`,
                    items: validItems,
                  });
                  console.log(`  获取到 ${category} (${validItems.length} 条)`);
                }
              } catch { /* 忽略解析错误 */ }
            }
          }
        }

        // 格式 C：WebDev 等子页面，{"entries": [...]} 直接在顶层
        if (subCleaned.includes('"entries"') && !subCleaned.includes('"leaderboards"')) {
          try {
            const entriesIdx = subCleaned.indexOf('"entries"');
            const arrStart = subCleaned.indexOf('[', entriesIdx);
            if (arrStart !== -1) {
              const arrStr = extractJsonArray(subCleaned, arrStart);
              if (arrStr) {
                const items = JSON.parse(arrStr).slice(0, 10).map(entry => ({
                  rank: entry.rank,
                  model: String(entry.modelDisplayName || ''),
                  org: String(entry.modelOrganization || ''),
                }));
                const validItems = items.filter(item => item.model && item.org);
                if (validItems.length > 0 && !seenSlugs.has(extraSlug)) {
                  seenSlugs.add(extraSlug);
                  const category = categoryMap[extraSlug] || extraSlug;
                  leaderboards.push({
                    slug: extraSlug,
                    category,
                    arenaSlug: extraSlug,
                    description: `${category}排行榜，展示当前领域表现最优的 AI 模型。`,
                    items: validItems,
                  });
                  console.log(`  获取到 ${category} (${validItems.length} 条)`);
                }
              }
            }
          } catch { /* 忽略解析错误 */ }
        }

        // 格式 B：Agent 等子页面 {"snapshot": { "rows": [...]}, "arena": {...}}
        if (subCleaned.includes('"snapshot"') && subCleaned.includes('"rows"')) {
          try {
            // 提取 arena 对象获取 slug 和 title
            let slug = extraSlug;
            let category = categoryMap[extraSlug] || extraSlug;
            const arenaIdx = subCleaned.indexOf('"arena"');
            if (arenaIdx !== -1) {
              const arenaObj = extractJsonObject(subCleaned, subCleaned.indexOf('{', arenaIdx));
              if (arenaObj) {
                const arena = JSON.parse(arenaObj);
                slug = arena.slug || slug;
                category = categoryMap[slug] || arena.title || category;
              }
            }

            // 提取 snapshot.rows
            const snapIdx = subCleaned.indexOf('"snapshot"');
            const snapObj = extractJsonObject(subCleaned, subCleaned.indexOf('{', snapIdx));
            if (snapObj) {
              const snapshot = JSON.parse(snapObj);
              const rows = snapshot.rows || [];
              const items = rows.slice(0, 10).map(row => ({
                rank: row.rank,
                model: String(row.modelDisplayName || row.model || ''),
                org: String(row.modelOrganization || ''),
              }));
              // 过滤掉 model 或 org 为空的条目
              const validItems = items.filter(item => item.model && item.org);
              if (validItems.length > 0 && !seenSlugs.has(slug)) {
                seenSlugs.add(slug);
                leaderboards.push({
                  slug,
                  category,
                  arenaSlug: slug,
                  description: `${category}排行榜，展示当前领域表现最优的 AI 模型。`,
                  items: validItems,
                });
                console.log(`  获取到 ${category} (${validItems.length} 条)`);
              }
            }
          } catch { /* 忽略解析错误 */ }
        }
      }
    } catch (e) {
      console.warn(`  抓取失败: ${e.message}`);
    }
  }

  const data = {
    source: 'LMArena (Chatbot Arena)',
    sourceUrl: 'https://arena.ai/leaderboard',
    updatedAt: new Date().toISOString().split('T')[0],
    description:
      '基于匿名人类偏好的大语言模型对战排行榜，数据来源为 LMArena 官方榜单。',
    leaderboards,
  };

  writeFileSync(OUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`已保存 ${leaderboards.length} 个榜单到 ${OUT_PATH}`);
  leaderboards.forEach(lb => {
    console.log(`  - ${lb.category} (${lb.items.length} 条)`);
  });
}

fetchLeaderboard().catch((err) => {
  console.error('抓取失败:', err.message);
  // 尝试回退到本地缓存数据
  if (existsSync(OUT_PATH)) {
    try {
      const cached = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
      if (cached.leaderboards && cached.leaderboards.length > 0) {
        console.warn(`⚠ 使用缓存数据 (${cached.leaderboards.length} 个榜单，更新于 ${cached.updatedAt})`);
        process.exit(0);
      }
    } catch {
      // 缓存损坏，继续退出
    }
  }
  console.error('无可用缓存，构建终止。');
  process.exit(1);
});
