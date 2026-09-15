import { WorkValueCalculator } from "@/components/tools/WorkValueCalculator";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { BackLink } from "@/components/layout/BackLink";

export const metadata = {
  title: "工作性价比计算器",
  description: "用公式量化你这份工作到底值不值",
  alternates: { canonical: absoluteUrl("/tools/work-value/") },
};

export default function WorkValuePage() {
  return (
    <PageShell>
      <section className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <BackLink href="/tools">返回工坊</BackLink>

          <WorkValueCalculator />
        </div>
      </section>
    </PageShell>
  );
}
