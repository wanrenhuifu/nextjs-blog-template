import { ADHDTest } from "@/components/tools/ADHDTest";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { BackLink } from "@/components/layout/BackLink";

export const metadata = {
  title: "ADHD 自评量表",
  description: "世界卫生组织推荐的 ASRS-5 成人 ADHD 简化筛查工具",
  alternates: { canonical: absoluteUrl("/tools/adhd/") },
};

export default function ADHDPage() {
  return (
    <PageShell>
      <section className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <BackLink href="/tools">返回工坊</BackLink>

          <ADHDTest />
        </div>
      </section>
    </PageShell>
  );
}
