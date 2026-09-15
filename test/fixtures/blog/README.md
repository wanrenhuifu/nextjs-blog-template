# 测试夹具

`lib/content.test.ts` 读取的文章夹具，**不是**站点的发布内容。

- 发布内容在仓库根目录的 `content/blog/`（见 `content/AGENTS.md`）。
- 测试通过环境变量 `BLOG_CONTENT_DIR` 指向本目录（在 `vitest.config.ts` 里设置），
  因此删改 `content/` 下的演示文章**不会**影响测试结果。

这样分离的原因：测试若直接读 `content/`，forker 删掉示例文章写自己的第一篇时
`npm test` 会失败，而 CI 中 test 跑在 build 之前，整个部署会被卡住。

夹具文章的 frontmatter 是有意设计的，各自覆盖一条断言：

| 目录 | 覆盖点 |
|------|--------|
| `alpha/` | 完整 frontmatter、`tocDepth: 3`（四级标题进目录）、围栏内 `#` 不进目录 |
| `beta/` | 缺省 `tocDepth`（默认 2，四级标题不进目录） |
| `gamma/` | 日期排序、标签计数 |

修改夹具前请先看 `lib/content.test.ts` 的断言 —— 夹具与断言是成对的。
