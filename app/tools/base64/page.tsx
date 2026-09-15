import { Base64Tool } from "@/components/tools/Base64Tool";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { BackLink } from "@/components/layout/BackLink";

export const metadata = {
  title: "Base64 编解码",
  description: "支持中文的文本与 Base64 双向转换，纯本地计算，实时自动识别",
  alternates: { canonical: absoluteUrl("/tools/base64/") },
};

export default function Base64Page() {
  return (
    <PageShell>
      <section className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <BackLink href="/tools">返回工坊</BackLink>

          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <PageTitle>Base64 编解码</PageTitle>
            <p className="text-muted max-w-2xl">
              支持中文的文本与 Base64 双向转换，纯本地计算，实时自动识别
            </p>
          </div>

          <Base64Tool />
        </div>
      </section>
    </PageShell>
  );
}
