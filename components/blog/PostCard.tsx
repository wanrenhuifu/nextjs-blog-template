import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";

interface PostCardProps {
  slug: string;
  title: string;
  pubDate: string;
  description?: string;
  tags: string[];
  readingTime: number;
}

export function PostCard({
  slug,
  title,
  pubDate,
  description,
  tags,
  readingTime,
}: PostCardProps) {
  return (
    <article className="concept-card group bg-card border border-borderline rounded-2xl p-6 md:p-8 h-full">
      <Link href={`/blog/${slug}`} className="block">
        <div className="flex flex-wrap items-center gap-3 text-caption text-muted mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {pubDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} 分钟
          </span>
        </div>

        <h2
          className="text-title-md text-title font-serif group-hover:text-primary transition-colors duration-200 mb-2"
        >
          {title}
        </h2>

        {description && (
          <p className="text-body-sm text-body line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-hover text-muted border border-borderline"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
