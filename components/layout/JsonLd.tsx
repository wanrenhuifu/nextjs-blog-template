/**
 * JSON-LD 结构化数据注入组件。
 * 将 Schema.org 对象序列化为 `<script type="application/ld+json">`，
 * 帮助搜索引擎生成富文本搜索结果。
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
