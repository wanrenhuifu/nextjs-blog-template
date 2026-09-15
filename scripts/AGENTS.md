<!-- BEGIN:scripts-rules -->
# Scripts 规则

## 目录用途

构建时与手动运维脚本，使用 Node.js ESM (`.mjs`) 编写。构建步骤在 `package.json` 的 `scripts.build` 中链式调用。

目录分两层，刻意分开是因为**性质不同**：根下的脚本可能被 `npm run build` 或 CI 执行（改动会影响部署），`audit/` 下的只在本地按需手动运行。

```
scripts/
├── *.mjs       构建链 + 手动资源生成器
└── audit/      开发期校验工具（只手动跑，不参与构建）
```

## 文件说明（scripts/）

| 文件 | 触发时机 | 用途 |
|------|----------|------|
| `generate-search-index.mjs` | `npm run build` | 扫描 `content/blog/` 生成 `public/search-index.json` 搜索索引 |
| `keepalive-waline.mjs` | `npm run build` | ping Waline 评论后端保活 Supabase 免费层数据库（防 7 天无活动自动暂停）。**永不阻断构建** |
| `generate-og.mjs` | 手动 | 使用 Sharp 生成 `public/og-default.png` 分享图。站名与域名是**烧进像素**的，改 `site.config.mjs` 后必须重跑 |
| `generate-icons.mjs` | 手动 | 生成 `public/favicon.svg` 与 `public/apple-touch-icon.png`。**两个图标由同一份墨竹几何定义派生**——它们曾经各自手工维护而变得不一致（一个竹林小图、一个单个汉字），合并到一处后结构上不可能再漂移。图标不含站名，fork 后通常不必重跑 |
| `fetch-avatars.mjs` | 手动 | 根据 `data/friends.json` 中的 GitHub 用户名抓取头像到 `public/friends/avatars/` |

> 除 `generate-search-index.mjs` 与 `keepalive-waline.mjs` 外，其余都是**手动按需运行**，
> 不会被 CI 触发（CI 只跑 `npm run build` 及其中的链式步骤）。

## 文件说明（scripts/audit/）

开发期校验工具，**不进构建链**。统一只依赖已装的 `playwright-chromium`，不引入新包；都跑在 `out/` 产物或 `next dev` 上。用法与背景见 `DESIGN.md` 的「性能」节与各脚本头部注释。

| 文件 | 用途 |
|------|------|
| `screenshot.mjs` | 视觉审计：遍历全部路由 × 日/夜主题 × 桌面/移动视口截图到 `verify-shots/`。支持按路由筛选、`--theme=`、`--motion=full`、`--no-fonts` |
| `perf-audit.mjs` | 性能测量：FCP / LCP / CLS + 分类型传输量，正常网速与 Slow 4G 两档。自带 gzip 静态服务器跑 `out/`（**不要用 `next dev` 测，数字没有参考价值**）。`--no-fonts` 可拦截字体做对照 |
| `perf-assets.mjs` | 单页资源清单：按体积排序列出某页全部资源，并报出 LCP 元素是谁。路径参数可省略，默认 `/` |

> 这三个脚本的路由表与默认目标路径是为演示内容写的 —— 删改文章后请同步
> `screenshot.mjs` 顶部的 `ROUTES` 与 `perf-audit.mjs` 的默认路径。

## 编码规范

1. **ESM 语法** —— 使用 `.mjs` 扩展名、`import`/`export`、`import.meta.url` 获取当前路径。
2. **路径处理** —— 使用 `path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "...")` 定位项目文件，禁止假设 `process.cwd()`。
3. **错误处理分两类** ——
   - **构建链上的脚本一律不得阻断构建**（缺配置、网络失败、后端不可达都只打印警告并退出 0），因为 fork 后的首次构建必须能跑通；
   - 若脚本的输入缺失会让后续步骤产出**错误结果**（如 `generate-search-index.mjs` 找不到 `content/blog/` 目录），则应当大声失败并 `process.exit(1)`，不要静默产出一个空索引。
4. **环境变量** —— 通过环境变量读取密钥，**禁止硬编码**。注意本目录的脚本**不会**自动加载 `.env.local`（只有 Next CLI 会），需要使用真实的进程环境变量。
5. **输出格式** —— JSON 数据文件使用 `JSON.stringify(data, null, 2)` 格式化输出，便于 diff 与人工审阅。
6. **不污染源码** —— 脚本写入的产物（如 `public/search-index.json`）应加进 `.gitignore` 由构建重新生成；若确实要提交（如抓取数据的缓存），需在 README 中说明更新频率。

## 添加新脚本流程

1. 新建 `.mjs` 文件，遵循上述规范。
2. 在 `package.json` 的 `scripts` 中注册（若为构建步骤，插入 `build` 命令链）。
3. 更新本文件（`scripts/AGENTS.md`）的「文件说明」表格。

## 禁止事项

- 禁止使用 CommonJS (`require`/`module.exports`)。
- 禁止在脚本中引入 React / JSX / 浏览器 API。
- 禁止脚本直接修改 `content/blog/` 中的文章源文件。
<!-- END:scripts-rules -->
