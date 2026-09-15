export default function TagsLoading() {
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

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-9 bg-skeleton rounded-full"
              style={{ width: `${60 + ((i * 37) % 80)}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
