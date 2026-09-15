export default function WeatherLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-skeleton rounded" />
              <div className="h-8 w-48 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Map skeleton */}
        <div className="h-96 bg-card border border-borderline rounded-2xl mb-8" />

        {/* List skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-borderline rounded-xl p-4 space-y-2">
              <div className="h-4 w-32 bg-skeleton rounded" />
              <div className="h-3 w-full bg-skeleton rounded" />
              <div className="h-3 w-5/6 bg-skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
