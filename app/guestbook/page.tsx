import { PageShell } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { PageTitle } from "@/components/layout/PageTitle";
import { FadeUp } from "@/components/ui/FadeUp";
import { WalineComments } from "@/components/blog/WalineComments";

export const metadata = {
  title: "留言",
  description: "欢迎留下你的足迹",
  alternates: { canonical: absoluteUrl("/guestbook/") },
};

export default function GuestbookPage() {
  return (
    <PageShell>
      <section className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 rounded-full bg-primary/60" />
              <div>
                <span className="text-caption text-muted uppercase tracking-wider">
                  Guestbook
                </span>
                <PageTitle className="mt-1">留言</PageTitle>
              </div>
            </div>
            <p className="text-muted max-w-2xl">
              欢迎留下你的足迹。
            </p>
          </div>

          {/* Guestbook Comments */}
          <FadeUp>
            <WalineComments title="留言" />
          </FadeUp>
        </div>
      </section>
    </PageShell>
  );
}
