import Link from "next/link";

import { Button, Card, CardBody, ArrowRight, InboxTray } from "@orvix/ui";

/**
 * Public 404 — used by the marketing surface (landing, signin,
 * pricing, onboarding). Self-contained; doesn't need the AppShell
 * or PublicShell, so it works whether the layout renders or not.
 */
export default function PublicNotFound() {
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
            The page you&rsquo;re looking for doesn&rsquo;t exist. It may have moved, or the link is wrong.
          </p>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button>
                Back to landing
                <ArrowRight size={12} aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary">See pricing</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
