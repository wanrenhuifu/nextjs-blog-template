import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Compass, Home, BookOpen } from "lucide-react";

export const metadata = {
  title: "页面未找到",
};

export default function NotFound() {
  return (
    <PageShell>
      <div className="flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-primary" />
          </div>

          <h1
            className="text-title font-serif mb-4"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            竹径通幽处
          </h1>

          <p className="text-body text-lg leading-relaxed mb-2">
            此路不通，禅房花木深。
          </p>
          <p className="text-muted text-sm mb-10">
            你要找的页面已随风散去，不妨另寻他路。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-card text-body border border-borderline text-sm font-medium hover:bg-hover transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              浏览文章
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
