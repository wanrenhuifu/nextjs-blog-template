export default function RadarLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-skeleton rounded" />
              <div className="h-8 w-20 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* LMArena skeleton */}
        <div className="mb-16 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-skeleton" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-skeleton rounded" />
              <div className="h-4 w-56 bg-skeleton rounded" />
            </div>
          </div>
          <div className="bg-card border border-borderline rounded-2xl overflow-hidden">
            <div className="space-y-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-borderline last:border-b-0">
                  <div className="w-7 h-7 rounded-full bg-skeleton" />
                  <div className="h-4 w-32 bg-skeleton rounded" />
                  <div className="h-4 w-20 bg-skeleton rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weather skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-skeleton" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-skeleton rounded" />
              <div className="h-4 w-48 bg-skeleton rounded" />
            </div>
          </div>
          <div className="bg-card border border-borderline rounded-2xl p-8">
            <div className="h-4 w-48 bg-skeleton rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
