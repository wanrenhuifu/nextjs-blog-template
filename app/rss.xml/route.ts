import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = site.url;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${site.lang}</language>
    <lastBuildDate>${posts.length > 0 ? new Date(posts[0].pubDate).toUTCString() : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}/</link>
      <guid>${siteUrl}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(post.description || "")}</description>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
