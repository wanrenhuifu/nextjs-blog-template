export default function LmArenaLoading() {
  return (
    <div className="py-12 md:py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back link skeleton */}
        <div className="h-4 w-20 bg-skeleton rounded mb-8" />

        {/* Header skeleton */}
        <div className="space-y-4 border-b border-borderline pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-skeleton rounded" />
              <div className="h-8 w-56 bg-skeleton rounded" />
            </div>
          </div>
          <div className="h-4 w-full max-w-lg bg-skeleton rounded" />
        </div>

        {/* Tab bar skeleton */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-skeleton rounded-lg" />
          ))}
        </div>

        {/* Table card skeleton */}
        <div className="bg-card border border-borderline rounded-2xl overflow-hidden mb-6">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-borderline bg-hover/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-skeleton" />
            <div className="space-y-1">
              <div className="h-4 w-32 bg-skeleton rounded" />
              <div className="h-3 w-48 bg-skeleton rounded" />
            </div>
          </div>
          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 border-b border-borderline/40 last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-skeleton flex-shrink-0" />
              <div className="h-4 w-40 bg-skeleton rounded" />
              <div className="h-4 w-24 bg-skeleton rounded ml-auto" />
            </div>
          ))}
          {/* Card footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-borderline bg-hover/10">
            <div className="h-3 w-28 bg-skeleton rounded" />
            <div className="h-3 w-36 bg-skeleton rounded" />
          </div>
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`bg-card border border-borderline rounded-xl p-4 ${
                i === 2 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <div className="h-3 w-16 bg-skeleton rounded" />
              <div className="h-7 w-12 bg-skeleton rounded mt-1.5" />
            </div>
          ))}
        </div>

        {/* Org distribution skeleton */}
        <div className="bg-card border border-borderline rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-skeleton" />
            <div className="h-4 w-20 bg-skeleton rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5">
              <div className="h-4 w-20 bg-skeleton rounded" />
              <div className="flex-1 h-6 rounded-md bg-skeleton" />
              <div className="h-4 w-6 bg-skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
