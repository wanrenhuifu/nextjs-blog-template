import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next", "out", "test/fixtures"],
    env: {
      // 让 lib/content.ts 读测试夹具而非 content/blog 下的发布内容，
      // 这样删改演示文章不会影响测试结果。详见 lib/content.ts 的 CONTENT_DIR 注释。
      BLOG_CONTENT_DIR: path.join(projectRoot, "test", "fixtures", "blog"),
    },
  },
});
