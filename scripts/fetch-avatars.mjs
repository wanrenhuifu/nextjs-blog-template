#!/usr/bin/env node
/**
 * 下载友链 GitHub 头像到本地，并自动转换为 WebP
 * 用法：node scripts/fetch-avatars.mjs
 * 输出：public/friends/avatars/{username}.webp
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRIENDS_PATH = join(__dirname, '..', 'data', 'friends.json');
const OUT_DIR = join(__dirname, '..', 'public', 'friends', 'avatars');

async function fetchAvatars() {
  const friends = JSON.parse(readFileSync(FRIENDS_PATH, 'utf-8'));
  const githubUsers = friends
    .filter((f) => f.github && !f.avatar)
    .map((f) => f.github);

  if (githubUsers.length === 0) {
    console.log('没有需要下载的 GitHub 头像。');
    return;
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const username of githubUsers) {
    const url = `https://github.com/${username}.png`;
    const tempPath = join(OUT_DIR, `${username}.png`);
    const outPath = join(OUT_DIR, `${username}.webp`);

    if (existsSync(outPath)) {
      console.log(`跳过已存在: ${username}.webp`);
      continue;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!res.ok) {
        console.warn(`下载失败 ${username}: HTTP ${res.status}`);
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      writeFileSync(tempPath, buffer);

      // 转换为 WebP
      await sharp(tempPath).webp({ quality: 85 }).toFile(outPath);
      unlinkSync(tempPath);

      const outSize = (await import('node:fs')).statSync(outPath).size;
      console.log(`已下载: ${username}.webp (${outSize} bytes)`);
    } catch (err) {
      console.warn(`下载失败 ${username}: ${err.message}`);
    }
  }
}

fetchAvatars().catch((err) => {
  console.error('脚本出错:', err.message);
  // 不要用 process.exit()：fetch 的句柄可能仍在关闭中，Windows 上会在 libuv 里
  // 断言崩溃（UV_HANDLE_CLOSING）。设退出码后正常返回即可。
  process.exitCode = 1;
});
