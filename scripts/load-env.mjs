/**
 * 让 scripts/ 下的脚本也能读到 `.env.local` / `.env`。
 *
 * 为什么需要：本项目按惯例把配置写进 `.env.local`，但**只有 Next CLI 会加载它** ——
 * 用 `node scripts/xxx.mjs` 直接跑的脚本读不到，于是 `npm run og` 会把 example.com
 * 烧进分享图、Waline 保活永远被静默跳过。这里显式补上这个缺口。
 *
 * 实现用 Node 内置的 `process.loadEnvFile()`（Node ≥ 20.12，见 package.json 的 engines），
 * 因此**不需要引入 dotenv 之类的依赖**。它的优先级语义正是我们要的：
 * 已存在的进程环境变量优先，文件只填补缺失项 —— CI 里的 secrets 不会被仓库里的
 * 本地文件意外覆盖。
 *
 * 用法：在脚本的 import 区**加上这一行**即可，无需调用任何函数。
 * ESM 保证被导入模块先于导入方求值，所以脚本顶层的 `process.env.X` 已经能看到结果。
 *
 * ```js
 * import "./load-env.mjs";   // 必须是第一个 import
 * ```
 *
 * 注意 `.env.local` 已被 gitignore，`.env.example` 是要提交的示例（见 .gitignore）。
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 与 Next 的查找顺序一致：`.env.local` 覆盖 `.env` */
const CANDIDATES = [".env.local", ".env"];

for (const file of CANDIDATES) {
  const filePath = join(ROOT, file);
  if (!existsSync(filePath)) continue;
  try {
    process.loadEnvFile(filePath);
    console.log(`[env] 已加载 ${file}`);
  } catch (error) {
    // 文件存在但读不动（权限、编码）——不阻断构建，但要说清楚
    console.warn(`[env] 加载 ${file} 失败，将使用进程环境变量：${error.message}`);
  }
}
