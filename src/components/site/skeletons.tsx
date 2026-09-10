export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export function CatalogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="h-4 w-48 animate-pulse rounded-full bg-muted" />
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted sm:aspect-[16/9]" />
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-64 animate-pulse rounded-full bg-muted" />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-line px-4 py-3.5 last:border-0"
          >
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}