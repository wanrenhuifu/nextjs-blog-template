<!-- BEGIN:public-rules -->
# Public 规则

## 目录用途

Next.js 静态文件服务根目录。`public/` 下的所有文件在构建后会被原样复制到输出目录根路径，可通过 `/<path>` 直接访问。

## 目录结构

```
public/
├── favicon.svg              # 站点图标（宣纸底墨竹：竿淡墨、节叶浓墨，由 scripts/generate-icons.mjs 生成）
├── apple-touch-icon.png     # iOS 主屏图标（同一份几何，同脚本生成）
├── og-default.png           # 默认分享图（scripts/generate-og.mjs 生成）
├── search-index.json        # 构建时生成的搜索索引
├── blog/
│   └── <slug>/              # 文章配图，目录名 = 文章 slug
├── cursors/                 # 自定义光标（日间竹叶 / 夜间星星）
└── friends/
    └── avatars/             # 友链头像（运行 scripts/fetch-avatars.mjs 后生成，非随仓库发布）
```

> `favicon.svg`、`apple-touch-icon.png`、`og-default.png` 目前是模板自带的默认品牌。改成自己的名称与配色后，重跑 `scripts/generate-icons.mjs` 与 `scripts/generate-og.mjs` 覆盖它们——站名是烧进 PNG 像素的，改代码不会自动更新这两张图。

## 文章配图

文章正文的图片**只放这里**，路径为 `public/blog/<slug>/`（目录名即文章 URL 的 slug），正文中用绝对路径引用：

```mdx
![示意图](/blog/syntax-test/diagram.webp)
```

为什么是这里而不是跟文章放一起：站点为静态导出，**只有 `public/` 下的文件会被服务**（`content/` 不在其中），且 `lib/content.ts` 的相对路径重写规则会生成 `/blog/<slug>/...` 这个 URL —— 它反向决定了文件的落点。早期文档曾写「图片放文章同级目录并复制到 public」，但构建链里从来没有这个复制步骤，那份说明已废弃。

示例：`public/blog/syntax-test/example.webp`，正文里写 `<img src="/blog/syntax-test/example.webp" />`。

## 编码规范

1. **路径引用** —— 代码中引用 public 资源时，使用以 `/` 开头的绝对路径，如 `/blog/hello-world/diagram.webp`。
   > 站点若部署在子路径（GitHub Pages 项目页），这些根绝对路径需要加 `basePath` 前缀，不能直接拼字符串。见 `README.md` 的部署章节。
2. **文件命名** —— 使用 kebab-case 或英文小写，避免空格与特殊字符。中文文件名需确保 URL 编码兼容性。
3. **图片优化** ——
   - 优先使用 WebP 格式。
   - 图标使用 SVG。
   - 由于 `images.unoptimized: true`，Next.js `<Image>` 不会自动优化，请在上传前自行压缩。
4. **搜索索引** —— `search-index.json` 由 `scripts/generate-search-index.mjs` 在构建时生成，**不应手动编辑**。
5. **友链头像** —— 目录不随仓库发布。在 `data/friends.json` 里给条目填 `github` 并让 `avatar` 保持空字符串，再运行 `scripts/fetch-avatars.mjs`，头像会下载到 `friends/avatars/<username>.webp` 并转换为 WebP；`avatar` 留空时页面回退为名称首字母，不会出现破图。

## 禁止事项

- 禁止在 `public/` 下存放源代码、配置文件、敏感信息。
- 禁止存放未经压缩的大体积图片（单张建议 < 500KB）。
- 禁止将 `node_modules` 中的包直接复制到 `public/`（应通过 import 使用）。
<!-- END:public-rules -->
