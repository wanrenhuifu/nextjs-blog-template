import { PostCardSkeleton } from "@/components/blog/PostCardSkeleton";

export default function BlogLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div>
              <div className="h-3 w-16 bg-skeleton rounded mb-2" />
              <div className="h-8 w-32 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Post grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
