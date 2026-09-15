import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxCompileOptions } from "@/lib/mdx";
import { CopyCodeButton } from "@/components/ui/CopyCodeButton";
import type { ImageSizeMap } from "@/lib/types";
import { publicUrl } from "@/lib/site";

function Pre({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  // 从 children 中提取代码文本
  let code = "";
  const extractText = (node: unknown): void => {
    if (typeof node === "string") {
      code += node;
    } else if (typeof node === "number") {
      code += String(node);
    } else if (Array.isArray(node)) {
      node.forEach(extractText);
    } else if (node && typeof node === "object" && "props" in node) {
      const propsNode = node as { props?: { children?: unknown } };
      extractText(propsNode.props?.children);
    }
  };

  if (children) {
    extractText(children);
  }

  return (
    <div className="code-block-wrapper relative">
      {code && <CopyCodeButton code={code} />}
      <pre {...props}>{children}</pre>
    </div>
  );
}

export function MdxContent({
  source,
  imageSizes = {},
}: {
  source: string;
  /** 构建期读出的图片尺寸，key 为 src —— 见 lib/content.ts 的 collectImageSizes */
  imageSizes?: ImageSizeMap;
}) {
  /**
   * 正文图片（仅 Markdown 语法 `![]()` 生成的会走到这里）：
   * - `loading="lazy"` —— 文章图片几乎总在首屏之下（实测某文图片在 2745px 处，
   *   视口仅 900px）。懒加载的实际生效范围随连接质量变化：带宽紧张时才会真正推迟。
   * - `decoding="async"` —— 解码不阻塞主线程。
   * - `width`/`height` —— **懒加载必须与尺寸预留成对出现**。缺了它，图片恰好在
   *   即将进入视野时才开始下载，读者会正好看到下方内容往下跳一大截。
   *
   * 手写的 `<img>` 标签不会经过这里 —— MDX 只把 Markdown 语法生成的元素交给
   * components 映射表，小写 HTML 标签原样透传。那一路由构建期的
   * enhanceRawImages（lib/content.ts）直接往标签里补属性。
   */
  function Image({
    src,
    alt,
    width,
    height,
    ...props
  }: React.ComponentPropsWithoutRef<"img">) {
    // MDX 会对 src 做 URL 编码（中文文件名会变成 %xx），尺寸表的键是原文，
    // 所以两种形态都要试。
    let size;
    if (typeof src === "string") {
      size = imageSizes[src];
      if (!size) {
        try {
          size = imageSizes[decodeURIComponent(src)];
        } catch {
          // src 含非法转义序列，当作没有尺寸
        }
      }
    }
    // MDX 里显式写的宽高优先于构建期读到的
    const w = width ?? size?.width;
    const h = height ?? size?.height;

    // 这里刻意不用 next/image：本项目为静态导出必须开 images.unoptimized，
    // 该配置下 next/image 不做任何优化，却强制要求宽高 —— 正文里的外部图片往往
    // 拿不到宽高，会让构建直接失败。它唯一还有价值的部分（懒加载 + 尺寸预留）
    // 此处已手工完成，故按普通 img 渲染。
    //
    // src 要补 basePath：正文图片是根绝对路径（见 public/AGENTS.md），子路径部署
    // 下不补前缀会全部 404。注意尺寸查表用的是**未加前缀**的 src（collectImageSizes
    // 记录的就是原文），所以先查表、后补前缀。外部 URL 经 publicUrl 原样返回。
    const resolvedSrc = typeof src === "string" ? publicUrl(src) : src;

    return (
      // eslint-disable-next-line @next/next/no-img-element -- 理由见上：静态导出下 next/image 无优化收益且有构建失败风险
      <img
        loading="lazy"
        decoding="async"
        src={resolvedSrc}
        alt={alt ?? ""}
        {...(w && h ? { width: w, height: h } : {})}
        {...props}
      />
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote
        source={source}
        options={{
          ...mdxCompileOptions,
          blockJS: false,
        }}
        components={{ pre: Pre, img: Image }}
      />
    </div>
  );
}
