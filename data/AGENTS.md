<!-- BEGIN:data-rules -->
# Data 规则

## 目录用途

存放应用运行所需的结构化数据文件（JSON）。部分文件由 `scripts/` 中的抓取脚本自动生成，部分为人工维护。

## 文件说明

| 文件 | 维护方式 | 用途 |
|------|----------|------|
| `friends.json` | 人工维护 | 友链数据：名称、URL、描述、头像路径、GitHub |
| `radar/lmarena.json` | 脚本自动生成 (`scripts/fetch-lmarena.mjs`) | LMArena 大模型排行榜数据 |
| `radar/weather-alerts.json` | 脚本自动生成 (`scripts/fetch-weather-alerts.mjs`) | 全国省会城市极端天气预警数据 |

## 编码规范

1. **JSON 格式** —— 使用 2 空格缩进，末尾保留换行。
2. **字段稳定** —— 修改 `friends.json` 等人工维护文件时，保持字段名和类型不变；新增字段需同步更新类型定义 (`lib/types.ts`) 和消费组件。
3. **头像路径** —— `friends.json` 中的 `avatar` 使用以 `/friends/avatars/` 开头的绝对路径，对应 `public/friends/avatars/` 下的实际文件。
   **留空（`""`）时头像位回退为名称首字母**，页面不会出现破图 —— 因此新加友链时可以先留空，之后填 `github` 字段并跑 `npm run avatars` 自动补上（不填 `github` 就保持留空）。注意 `avatar` 指向不存在的文件会渲染成坏图，因为那时走的是图片分支而非回退分支。
4. **时区与日期** —— 脚本生成的数据中的 `updatedAt` 使用 ISO 8601 格式 (`YYYY-MM-DDTHH:mm:ssZ`)，便于页面端 `toLocaleDateString` 本地化展示。
5. **数据源标注** —— 自动生成的 JSON 应包含 `source` 和 `sourceUrl` 字段，标明数据来源与原始链接。

## 缺失文件的后果

**不会导致构建失败。** 所有读取都经 `lib/data.ts`，异常由 `handleDataError` 兜住：
打印一条 `[data] … 数据读取失败` 错误日志，然后返回一份空数据兜底
（空数组 / `count: 0` / `description: "数据暂时不可用"`）。页面照常构建，只是那一块显示空态。

换言之，缺失是**静默降级**而非硬失败 —— 所以在 CI 日志里看到那行 `[data]` 错误时
要当回事：构建会成功，但线上页面是空的。

> 这条规则原先写作「缺失会导致构建失败」，与代码实际行为不符（实测删除 radar JSON
> 后构建通过、页面转空态）。此处按实际行为更正。

## 禁止事项

- 禁止在本目录存放大型二进制文件（图片、视频应放 `public/`）。
- 禁止手动修改脚本自动生成的数据文件（会被下次运行覆盖）。
<!-- END:data-rules -->
