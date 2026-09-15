import { Heart, Rss, ExternalLink } from "lucide-react";
import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-borderline bg-app">
      {/* 宽度与内边距必须与 Header 外层容器一致（max-w-5xl / px-5），
          否则页头页脚的左右边线会错开 64px */}
      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-muted">
            <span>© {currentYear}</span>
            <Heart className="w-3 h-3 text-danger fill-danger" />
            <span>{site.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/rss.xml"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors duration-200"
              title="RSS 订阅"
            >
              <Rss className="w-4 h-4" />
              <span>RSS</span>
            </Link>
            {/* github 未配置时不渲染该入口，避免出现指向 /undefined 的坏链 */}
            {site.githubUrl && (
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors duration-200"
                title="GitHub"
              >
                <ExternalLink className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
