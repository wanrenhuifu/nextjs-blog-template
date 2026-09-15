/**
 * 构建后清理：把「只服务于开发、不该对外发布」的文件从 `out/` 里删掉。
 *
 * 为什么需要这一步：`public/` 下的所有东西都会被静态导出**原样复制**到站点根目录，
 * 包括写给人看的工程文档。`public/AGENTS.md` 就这么被发布到了
 * `https://<站点>/AGENTS.md` —— 一份内部规范对访客可见，而且它自己写着
 * 「禁止在 public/ 下存放配置文件」，颇有点讽刺。
 *
 * 为什么用排除法而不是把文档挪出 `public/`：那份文档讲的就是 `public/` 目录的约定，
 * 放在别处会破坏「每个目录一个 AGENTS.md」的约定（`CLAUDE.md` 里也有对它的引用）。
 * 保留位置、构建时剔除，是两边都不牺牲的做法。
 *
 * 新增需要剔除的文件时，加进 DEV_ONLY 即可。
 */
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "out");

/** 相对于 out/ 的路径，逐条列出而不是用通配符 —— 删东西的地方，明确比简洁重要 */
const DEV_ONLY = ["AGENTS.md"];

if (!existsSync(OUT_DIR)) {
  // 没跑过 next build 就调用本脚本：不是错误，安静退出
  process.exit(0);
}

let removed = 0;
for (const rel of DEV_ONLY) {
  const target = join(OUT_DIR, rel);
  if (!existsSync(target)) continue;
  rmSync(target, { recursive: true, force: true });
  console.log(`✓ Pruned from output: ${rel}`);
  removed += 1;
}

if (removed === 0) {
  console.log("✓ Nothing to prune from output");
}
