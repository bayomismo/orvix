import { Skeleton } from "@orvix/ui";

/**
 * Marketing surface loading state — matches the hero + sections
 * of the landing page so the perceived swap is a 1:1 fade.
 */
export default function MarketingLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col items-center gap-6 text-center">
        <Skeleton className="h-6 w-40" rounded />
        <Skeleton className="h-12 w-3/4" rounded />
        <Skeleton className="h-12 w-2/3" rounded />
        <Skeleton className="mt-2 h-5 w-2/3 max-w-2xl" />
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-10 w-40" rounded />
          <Skeleton className="h-10 w-40" rounded />
        </div>
        <Skeleton className="mt-4 h-3 w-72" />
      </header>

      <section className="rounded-2xl border border-surface-divider bg-surface-elevated p-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24" rounded />
            <Skeleton className="h-24" rounded />
            <Skeleton className="h-24" rounded />
            <Skeleton className="h-24" rounded />
            <Skeleton className="h-24" rounded />
            <Skeleton className="h-24" rounded />
          </div>
        </div>
      </section>
    </main>
  );
}
