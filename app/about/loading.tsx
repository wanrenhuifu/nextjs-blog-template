export default function AboutLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div>
              <div className="h-3 w-16 bg-skeleton rounded mb-2" />
              <div className="h-8 w-28 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Profile card skeleton */}
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 p-6 md:p-8 rounded-2xl bg-card border border-borderline mb-14">
          <div className="w-24 h-24 rounded-2xl bg-skeleton shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 bg-skeleton rounded" />
            <div className="h-4 w-3/4 bg-skeleton rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-skeleton rounded-full"
                  style={{ width: `${64 + ((i * 23) % 40)}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text section skeleton */}
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s} className="mb-16">
            <div className="h-6 w-24 bg-skeleton rounded mb-5" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-skeleton rounded mb-3"
                style={{ width: `${72 + ((i * 17) % 26)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
