/**
 * 计算文章预计阅读时间
 *
 * 算法：
 * 1. 清理 Markdown 语法标记（代码块、链接 URL、图片、格式符号等）
 * 2. 分别统计有效中文字符和英文单词数
 * 3. 中文按 400 字/分钟，英文按 200 词/分钟计算
 * 4. 结果向上取整，最少 1 分钟
 */
export function calculateReadingTime(body: string): number {
  // 去掉代码块
  let text = body.replace(/```[\s\S]*?```/g, '');

  // 去掉行内代码
  text = text.replace(/`[^`]+`/g, '');

  // 去掉 frontmatter（Astro 通常已处理，保留以防万一）
  text = text.replace(/^---[\s\S]*?---/, '');

  // 去掉 HTML 标签
  text = text.replace(/<[^>]+>/g, '');

  // 处理 Markdown 链接和图片：保留描述文本，去掉 URL
  text = text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1');

  // 去掉 Markdown 格式符号
  text = text
    .replace(/^(#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+)/gm, '')
    .replace(/(\*{1,2}|_{1,2}|~{2})/g, '')
    .replace(/---+/g, '');

  // 压缩多余空白
  text = text.replace(/\s+/g, ' ').trim();

  // 统计中文字符（CJK 统一表意文字基本区 + 扩展 A 区）
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;

  // 统计英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  // 计算阅读时间
  const minutes = chineseChars / 400 + englishWords / 200;

  return Math.max(1, Math.ceil(minutes));
}
