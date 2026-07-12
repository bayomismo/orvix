import Link from "next/link";

import { Button, Card, CardBody, ArrowRight, InboxTray } from "@orvix/ui";

/**
 * (app) 404 — page not found in the workspace.
 *
 * Next.js renders this for unmatched paths inside the (app) group.
 * It's a safety net: the root not-found.tsx handles most cases.
 * This variant is self-contained (no AppShell dependency) so it
 * works regardless of the layout's dynamic features.
 */
export default function AppNotFound() {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 py-16">
      <Card elevation="raised" className="max-w-lg overflow-hidden">
        <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
            >
              <InboxTray size={12} />
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-text-primary">
              Page not found
            </h1>
          </div>
          <span className="rounded-md bg-surface-inset px-1.5 text-2xs font-medium tabular-nums text-text-muted">
            404
          </span>
        </header>
        <CardBody className="flex flex-col gap-4 p-6">
          <p className="text-sm text-text-secondary leading-relaxed">
            The page you&rsquo;re looking for doesn&rsquo;t exist, or it was moved. Your workspace is still here.
          </p>
          <div className="flex items-center gap-2">
            <Link href="/inbox">
              <Button>
                Back to inbox
                <ArrowRight size={12} aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/work">
              <Button variant="secondary">Open Work</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
