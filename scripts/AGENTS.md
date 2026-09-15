<!-- BEGIN:scripts-rules -->
# Scripts 规则

## 目录用途

构建时与定时任务脚本，使用 Node.js ESM (`.mjs`) 编写。其中构建步骤在 `package.json` 的 `scripts.build` 中链式调用。

目录分两层，刻意分开是因为**性质不同**：根下的脚本会被 CI 执行（改动会影响部署），`audit/` 下的只在本地按需手动运行。

```
scripts/
├── *.mjs       构建链 + 手动资源生成器（CI 会跑）
└── audit/      开发期校验工具（只手动跑，不参与构建）
```

## 文件说明（scripts/）

| 文件 | 触发时机 | 用途 |
|------|----------|------|
| `generate-search-index.mjs` | `npm run build` | 扫描 `content/blog/` 生成 `public/search-index.json` 搜索索引 |
| `generate-og.mjs` | 手动 | 使用 Sharp 生成 `public/og-default.png` OpenGraph 默认图片 |
| `generate-icons.mjs` | 手动 | 生成 `public/favicon.svg` 与 `public/apple-touch-icon.png`。**两个图标由同一份墨竹几何定义派生**——它们曾经各自手工维护而变得不一致（favicon 是竹林、apple 是「万」字），合并到一处后结构上不可能再漂移 |
| `fetch-avatars.mjs` | 手动/定时 | 根据 `data/friends.json` 中的 GitHub 用户名抓取头像到 `public/friends/avatars/` |
| `fetch-lmarena.mjs` | `npm run build` | 抓取 arena.ai 排行榜数据写入 `data/radar/lmarena.json`，含超时与缓存回退 |
| `fetch-weather-alerts.mjs` | `npm run build` | 抓取天气预警数据写入 `data/radar/weather-alerts.json` |
| `keepalive-waline.mjs` | `npm run build` | ping Waline 评论后端保活 Supabase 免费层数据库（防 7 天无活动自动暂停），永不阻断构建 |

## 文件说明（scripts/audit/）

开发期校验工具，**不进构建链**。统一只依赖已装的 `playwright-chromium`，不引入新包；都跑在 `out/` 产物或 `next dev` 上。用法与背景见 `DESIGN.md` 的「性能」节与各脚本头部注释。

| 文件 | 用途 |
|------|------|
| `screenshot.mjs` | 视觉审计：遍历全部路由 × 日/夜主题 × 桌面/移动视口截图到 `verify-shots/`。支持按路由筛选、`--theme=`、`--motion=full`、`--no-fonts` |
| `perf-audit.mjs` | 性能测量：FCP / LCP / CLS + 分类型传输量，正常网速与 Slow 4G 两档。自带 gzip 静态服务器跑 `out/`（**不要用 `next dev` 测，数字没有参考价值**）。`--no-fonts` 可拦截字体做对照 |
| `perf-assets.mjs` | 单页资源清单：按体积排序列出某页全部资源，并报出 LCP 元素是谁。<路径> 为必填参数 |

## 编码规范

1. **ESM 语法** —— 使用 `.mjs` 扩展名、`import`/`export`、`import.meta.url` 获取当前路径。
2. **路径处理** —— 使用 `path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "...")` 定位项目文件，禁止假设 `process.cwd()`。
3. **错误处理** —— 网络请求/文件读取失败时打印清晰错误；`fetch-lmarena.mjs` 在抓取失败时回退到本地缓存（不阻断构建），其他脚本仍使用 `process.exit(1)`。
4. **输出格式** —— JSON 数据文件使用 `JSON.stringify(data, null, 2)` 格式化输出，便于 diff 与人工审阅。
5. **不污染源码** —— 脚本写入的数据文件（如 `data/radar/*.json`、`public/search-index.json`）应被 `.gitignore` 忽略或作为构建产物提交；若提交，需在 README 中说明更新频率。
6. **API 密钥** —— 若脚本需要外部 API Key，通过环境变量读取，**禁止硬编码密钥**。

## 添加新脚本流程

1. 新建 `.mjs` 文件，遵循上述规范。
2. 在 `package.json` 的 `scripts` 中注册（若为构建步骤，插入 `build` 命令链）。
3. 更新本文件（`scripts/AGENTS.md`）的「文件说明」表格。

## 禁止事项

- 禁止使用 CommonJS (`require`/`module.exports`)。
- 禁止在脚本中引入 React / JSX / 浏览器 API。
- 禁止脚本直接修改 `content/blog/` 中的文章源文件。
<!-- END:scripts-rules -->
