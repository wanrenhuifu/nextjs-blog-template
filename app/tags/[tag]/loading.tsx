import { PostCardSkeleton } from "@/components/blog/PostCardSkeleton";

export default function TagLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back link skeleton */}
        <div className="h-5 w-24 bg-skeleton rounded mb-8" />

        {/* Title skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1 h-6 rounded-full bg-primary/60" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-skeleton rounded" />
            <div className="h-8 w-32 bg-skeleton rounded" />
            <div className="h-5 w-16 bg-skeleton rounded" />
          </div>
        </div>

        {/* Post grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
