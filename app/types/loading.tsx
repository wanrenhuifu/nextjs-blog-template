export default function TypesLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div>
              <div className="h-3 w-16 bg-skeleton rounded mb-2" />
              <div className="h-8 w-20 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Chips skeleton */}
        <div className="flex flex-wrap gap-3 mb-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 bg-skeleton rounded-full"
              style={{ width: `${72 + ((i * 29) % 48)}px` }}
            />
          ))}
        </div>

        {/* Group skeleton */}
        {Array.from({ length: 2 }).map((_, g) => (
          <div key={g} className="mb-12">
            <div className="flex items-center gap-3 py-3 mb-4 border-b border-borderline/40">
              <div className="w-8 h-8 bg-skeleton rounded-lg" />
              <div className="h-6 w-16 bg-skeleton rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3">
                <div className="h-3 w-[76px] bg-skeleton rounded" />
                <div
                  className="h-4 bg-skeleton rounded flex-1"
                  style={{ maxWidth: `${55 + ((i * 23) % 35)}%` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
