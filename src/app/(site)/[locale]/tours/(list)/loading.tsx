import { CatalogGridSkeleton } from "@/components/site/skeletons";

export default function ToursLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-10 w-56 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-full bg-muted" />
      </div>
      <CatalogGridSkeleton count={8} />
    </section>
  );
}