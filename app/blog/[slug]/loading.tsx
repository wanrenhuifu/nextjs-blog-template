export default function PostLoading() {
  return (
    <div className="py-12 md:py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Back link skeleton */}
        <div className="h-5 w-28 bg-skeleton rounded mb-8" />

        <div className="max-w-3xl mx-auto lg:flex lg:max-w-6xl lg:gap-12">
          <div className="flex-1 min-w-0">
            {/* Post header skeleton */}
            <header className="mb-10 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-4 w-24 bg-skeleton rounded" />
                <div className="h-4 w-20 bg-skeleton rounded" />
              </div>
              <div className="h-10 w-3/4 bg-skeleton rounded" />
              <div className="h-5 w-40 bg-skeleton rounded" />
            </header>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-full bg-skeleton rounded" />
              <div className="h-4 w-full bg-skeleton rounded" />
              <div className="h-4 w-5/6 bg-skeleton rounded" />
              <div className="h-4 w-full bg-skeleton rounded" />
              <div className="h-4 w-4/5 bg-skeleton rounded" />
              <div className="h-32 w-full bg-skeleton rounded mt-6" />
              <div className="h-4 w-full bg-skeleton rounded" />
              <div className="h-4 w-3/4 bg-skeleton rounded" />
            </div>
          </div>

          {/* TOC skeleton */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-3">
              <div className="h-4 w-20 bg-skeleton rounded" />
              <div className="h-3 w-full bg-skeleton rounded" />
              <div className="h-3 w-5/6 bg-skeleton rounded" />
              <div className="h-3 w-4/5 bg-skeleton rounded" />
              <div className="h-3 w-3/4 bg-skeleton rounded" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
