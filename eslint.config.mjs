import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const dataLayerMessage =
  "数据访问必须经过统一数据层 @/lib/data（CLAUDE.md 规范 8）：禁止在页面/组件中直接 fs 或导入 data/*.json，请扩展 lib/data.ts。";
const staticExportMessage =
  "静态导出约束（CLAUDE.md 规范 7）：禁止使用 next/headers 的动态 API（headers()/cookies()/draftMode()）。";
const aliasMessage =
  "路径别名约束（CLAUDE.md 规范 2）：请使用 @/ 路径别名，禁止 ../../ 形式的跨层相对导入。";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // CLAUDE.md 机械可判定规则的自动化检查（页面与组件层）
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "fs", message: dataLayerMessage },
            { name: "fs/promises", message: dataLayerMessage },
            { name: "node:fs", message: dataLayerMessage },
            { name: "node:fs/promises", message: dataLayerMessage },
            { name: "next/headers", message: staticExportMessage },
          ],
          patterns: [
            { group: ["@/data/**", "../data/**/*.json", "../../data/**/*.json"], message: dataLayerMessage },
            { group: ["../..", "../../**"], message: aliasMessage },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Report artifacts:
    ".qoder/**",
    ".qoder-better-harness/**",
  ]),
]);

export default eslintConfig;
