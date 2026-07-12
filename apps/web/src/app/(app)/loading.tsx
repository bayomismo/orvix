import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, Skeleton } from "@orvix/ui";

/**
 * App shell loading state.
 *
 * Per ORVIX Design System v1.0, skeletons are the only loading
 * state. No spinners. This page mirrors the typical (app) layout
 * so the perceived page swap is a 1:1 fade.
 */
export default function AppLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-8 min-w-0">
        <PageHeader
          kicker="—"
          title={
            <span className="block h-9 w-72">
              <Skeleton className="h-full w-full" />
            </span>
          }
          subtitle={
            <span className="block h-4 w-96 max-w-full">
              <Skeleton className="h-full w-full" />
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} elevation="floating">
              <CardBody className="flex flex-col gap-1 p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </CardBody>
            </Card>
          ))}
        </div>
        <Card elevation="flat" className="overflow-hidden">
          <CardBody className="p-0">
            <ul className="divide-y divide-surface-divider">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <Skeleton circle className="h-8 w-8" />
                  <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
      <aside className="flex flex-col gap-4">
        <Card>
          <CardBody className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3.5 w-24" />
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
