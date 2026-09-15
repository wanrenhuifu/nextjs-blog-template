<!-- BEGIN:content-rules -->
# Content 规则

## 目录用途

存放博客文章的原始内容源文件。构建时由 `lib/content.ts` 读取并解析为页面数据。

## 目录结构

```
content/blog/
├── <slug>/
│   └── index.mdx          # 文章正文 + frontmatter
├── <slug>/
│   └── index.mdx
```

- 每篇文章一个独立目录，目录名即 URL slug（建议 kebab-case）。
- 每篇文章目录内只放 `index.mdx`（或 `index.md`）。**本地图片不放这里** —— 放 `public/blog/<slug>/`，理由见下方「内容编写规范」第 2 条。

## Frontmatter 规范

```yaml
---
title: "文章标题"
pubDate: 2026-05-04
description: "文章摘要或描述"
tags: ["标签1", "标签2"]
category: 技术
tocDepth: 2
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题，显示在列表页与详情页 |
| `pubDate` | 是 | 发布日期，`YYYY-MM-DD` 格式 |
| `updatedDate` | 否 | 最后更新日期，`YYYY-MM-DD` 格式。用于 SEO（dateModified）、文章头部显示「更新于」，未填时回退为 pubDate |
| `description` | 否 | 文章摘要，用于列表卡片与 SEO meta |
| `tags` | 否 | 字符串数组，用于标签聚合页 |
| `category` | 否 | 文章类型，取值限定为 `技术` / `生活` / `观点` / `随笔` / `游戏` / `测试`（见 `lib/constants.ts` 的 `POST_CATEGORIES`），用于「类型」聚合页（`/types`）按类型分组。类型与标签语义分离：类型是粗粒度的内容定位，标签是细粒度的主题词。填写非法值会导致该文章 frontmatter 校验失败并从构建中剔除 |
| `tocDepth` | 否 | 文章目录（TOC）展开的层级深度，以 `##` 为第 1 级，取值 `1` / `2` / `3`，默认 `2`。`1` = 仅 `##`，`2` = `##` + `###`，`3` = `##` + `###` + `####`。子标题繁多的长文可设为 `1` 保持目录简洁；填写其他值会导致 frontmatter 校验失败并从构建中剔除 |

## 内容编写规范

1. **MDX 支持** —— 可在 Markdown 中直接嵌入 JSX 组件（如条件渲染、变量插值）。参考 `content/blog/syntax-test/index.mdx`。
2. **本地图片引用** —— 图片文件放在 **`public/blog/<slug>/`** 下（不是本目录），正文里用绝对路径引用：
   ```mdx
   ![示意图](/blog/syntax-test/diagram.webp)
   ```
   也可写 URL 简写 `![示意图](./diagram.webp)`，构建期会重写为 `/blog/<slug>/diagram.webp` —— 但注意**这只是 URL 简写，文件仍需放在 `public/blog/<slug>/`**，`content/` 下不会被服务。
   依据：站点为静态导出，**只有 `public/` 下的文件会被服务**；而重写规则 `/blog/<slug>/` 已经反向指定了目录。详见 `public/AGENTS.md`。
   > 构建期会校验引用的本地图片是否存在，缺失时打印警告（不阻断构建）——见 `lib/content.ts` 的 `collectImageSizes`。
3. **代码块** —— 使用 fenced code block 并标注语言，rehype-pretty-code 会自动高亮。
4. **数学公式** —— 支持 `$E=mc^2$` 行内公式与 `$$...$$` 块级公式（KaTeX）。
5. **中文排版** ——
   - 正确使用中文标点。
   - 行内代码前后不加空格（已由样式自动处理）。
   - 长段落适当分段，保持阅读节奏。
6. **行尾一律用 LF** —— `.gitattributes` 已声明 `* text=auto eol=lf`，检出时会统一为 LF。管线本身也兼容 CRLF（见 `lib/AGENTS.md` 第 9 条），但仍请保持 LF：否则每次提交都会因行尾差异产生噪声 diff。
7. **标签命名** —— 使用中文或英文，保持已有标签的一致性，避免重复创建语义相近的标签。

## 添加新文章流程

1. 在 `content/blog/` 下新建 `<slug>/` 目录。
2. 编写 `index.mdx`，填写 frontmatter。
3. 运行 `npm run build` 验证搜索索引生成与页面渲染。
4. 确认新文章出现在首页「最新文章」与 `/blog` 列表页。

## 仓库自带的两篇内容

| 文章 | 用途 | 建议 |
|------|------|------|
| `hello-world/` | 占位示例，演示 frontmatter 与常用语法 | 可以删掉或改成你的第一篇 |
| `syntax-test/` | 语法兼容性基准，覆盖 MDX 扩展、KaTeX、代码高亮、表格、脚注等全部渲染路径 | 建议保留 |

## frontmatter 写错会怎样

不会中断构建，但会**跳过那一篇**并打印明确的错误（含文件路径与 YAML 原始报错）：

| 错误类型 | 行为 |
|----------|------|
| YAML 语法错误（引号未闭合、缩进有误、值里有未转义的 `:` 或 `#`） | 该文章不进站点，`lib/content.ts` 与 `generate-search-index.mjs` 各报一次错 |
| 字段值非法（如 `category` 不在枚举里、`tocDepth` 不是 1/2/3） | 该文章被剔除，打印 `frontmatter 校验失败` 与具体字段 |
| `pubDate` 无法解析（如 `2026-13-45`） | 不报错，日期归一化为 `1970-01-01`（搜索索引里则记为空） |

之所以「跳过而非中断」，与 `data/AGENTS.md` 的降级原则一致：内容问题不该让整个站点无法发布。
但**请把日志里的报错当回事** —— 构建成功不代表那篇文章在站点上。

## 禁止事项

- 不要在文章目录中放置非内容文件（如 `.DS_Store`、临时文档）。
- 不要在 frontmatter 中使用复杂嵌套对象（当前解析器只支持基本类型）。
- **不要整体删除 `syntax-test/index.mdx`** —— 它是唯一覆盖全部渲染路径的基准文章。升级 `next-mdx-remote`、remark/rehype 插件或 Shiki 之后，靠它一眼看出哪条渲染路径坏了。可以增补用例，但删掉里面的大段内容等于放弃了这份覆盖。
  > 该文中的作者名与配图引用曾在模板化时被一次性替换为通用占位（原为模板作者的个人信息）。
<!-- END:content-rules -->
