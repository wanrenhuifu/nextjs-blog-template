import type { NextConfig } from "next";
import { normalizeBasePath } from "./site.config.mjs";

/**
 * 子路径部署支持。
 *
 * 站点部署在域名根目录时（用户站点 `<user>.github.io`、自有域名）留空即可。
 * 部署在**子路径**下时必须设置，典型场景是 GitHub Pages 的**项目页**
 * （`https://<user>.github.io/<repo>/`）—— 不设置的话页面里的 CSS/JS
 * 仍会去根路径加载，整站白屏。
 *
 * 两个变量必须同时给出，且语义不同：
 *   NEXT_PUBLIC_BASE_PATH  —— 不带协议与域名，如 `/my-blog`
 *   NEXT_PUBLIC_SITE_URL   —— 完整地址**含子路径**，如 `https://user.github.io/my-blog`
 *
 * 两者不一致会导致 canonical / sitemap / RSS 里的链接与真实地址错位。
 *
 * 归一化（补前导斜杠、去尾斜杠）在 site.config.mjs 的 normalizeBasePath 里做，
 * 与 lib/site.ts 的 basePath 共用同一个函数，避免两处各自处理斜杠而不一致。
 * 这里同样以字面量读环境变量（Next 只认这一种形式，见该函数注释）。
 */
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath
    ? {
        basePath,
        // 静态导出下 assetPrefix 与 basePath 同值即可；
        // 若把静态资源放到 CDN，可单独把 assetPrefix 指向 CDN 域名
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
