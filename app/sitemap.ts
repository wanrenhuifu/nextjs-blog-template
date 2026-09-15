import { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;

  // 静态页面（尾斜杠与 trailingSlash: true 保持一致）
  // 删掉某个路由时记得同步删掉这里的条目，否则 sitemap 会指向 404
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/about/`, lastModified: new Date() },
    { url: `${baseUrl}/archive/`, lastModified: new Date() },
    { url: `${baseUrl}/blog/`, lastModified: new Date() },
    { url: `${baseUrl}/friends/`, lastModified: new Date() },
    { url: `${baseUrl}/guestbook/`, lastModified: new Date() },
    { url: `${baseUrl}/tags/`, lastModified: new Date() },
    { url: `${baseUrl}/tools/`, lastModified: new Date() },
    { url: `${baseUrl}/tools/random-number/`, lastModified: new Date() },
    { url: `${baseUrl}/types/`, lastModified: new Date() },
  ];

  // 文章页面
  const posts = await getAllPosts();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.pubDate),
  }));

  // 标签页面
  const tags = await getAllTags();
  const tagRoutes = tags.map(({ tag }) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}/`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
