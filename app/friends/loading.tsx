export default function FriendsLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-1 h-6 rounded-full bg-primary/60" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-skeleton rounded" />
            <div className="h-8 w-20 bg-skeleton rounded" />
          </div>
        </div>

        {/* Count skeleton */}
        <div className="h-5 w-32 bg-skeleton rounded mb-8" />

        {/* Friends grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-card border border-borderline rounded-2xl p-5"
            >
              <div className="w-14 h-14 rounded-xl bg-skeleton shrink-0" />
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
