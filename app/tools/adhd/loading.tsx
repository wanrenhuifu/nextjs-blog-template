export default function ADHDLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-14 bg-skeleton rounded" />
              <div className="h-8 w-48 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Tool skeleton */}
        <div className="bg-card border border-borderline rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-skeleton" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-skeleton rounded" />
              <div className="h-4 w-64 bg-skeleton rounded" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-borderline rounded-2xl p-5 space-y-3">
              <div className="h-4 w-3/4 bg-skeleton rounded" />
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-11 bg-skeleton rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
