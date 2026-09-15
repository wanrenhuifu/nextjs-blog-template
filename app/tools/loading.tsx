export default function ToolsLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-14 bg-skeleton rounded" />
              <div className="h-8 w-20 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Tools grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-borderline"
            >
              <div className="w-12 h-12 rounded-xl bg-skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-skeleton rounded" />
                <div className="h-4 w-full bg-skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
