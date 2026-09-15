import { RandomNumber } from "@/components/tools/RandomNumber";
import { absoluteUrl } from "@/lib/site";
import { PageShell } from "@/components/layout/PageShell";
import { PageTitle } from "@/components/layout/PageTitle";
import { BackLink } from "@/components/layout/BackLink";

export const metadata = {
  title: "随机数生成器",
  description: "生成指定区间或正态分布的随机数，可设小数精度与是否去重，支持历史记录与一键复制",
  alternates: { canonical: absoluteUrl("/tools/random-number/") },
};

export default function RandomNumberPage() {
  return (
    <PageShell>
      <section className="py-12 md:py-20 px-4">
        <div className="mx-auto max-w-3xl">
          <BackLink href="/tools">返回工坊</BackLink>

          <div className="space-y-3 border-b border-borderline pb-8 mb-10">
            <PageTitle>随机数生成器</PageTitle>
            <p className="text-muted max-w-2xl">
              生成指定区间或正态分布的随机数，可设小数精度与是否去重
            </p>
          </div>

          {/* 卡片由组件自身提供，本页不再另加容器 —— 否则会套出双层边框 */}
          <RandomNumber />
        </div>
      </section>
    </PageShell>
  );
}
