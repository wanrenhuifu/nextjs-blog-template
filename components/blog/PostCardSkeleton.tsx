export function PostCardSkeleton() {
  return (
    <div className="bg-card border border-borderline rounded-2xl p-6 md:p-8 animate-pulse">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="h-4 w-24 bg-skeleton rounded" />
        <div className="h-4 w-16 bg-skeleton rounded" />
      </div>

      <div className="h-6 w-3/4 bg-skeleton rounded mb-2" />

      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-skeleton rounded" />
        <div className="h-4 w-2/3 bg-skeleton rounded" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="h-5 w-12 bg-skeleton rounded-full" />
        <div className="h-5 w-16 bg-skeleton rounded-full" />
      </div>
    </div>
  );
}
