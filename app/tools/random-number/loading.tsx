export default function RandomNumberLoading() {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-borderline pb-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 rounded-full bg-primary/60" />
            <div className="space-y-2">
              <div className="h-3 w-14 bg-skeleton rounded" />
              <div className="h-8 w-40 bg-skeleton rounded" />
            </div>
          </div>
        </div>

        {/* Tool skeleton */}
        <div className="bg-card border border-borderline rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-skeleton" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-skeleton rounded" />
              <div className="h-4 w-48 bg-skeleton rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-10 bg-skeleton rounded-lg" />
            <div className="h-10 bg-skeleton rounded-lg" />
            <div className="h-10 bg-skeleton rounded-lg" />
          </div>
          <div className="h-10 bg-skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
