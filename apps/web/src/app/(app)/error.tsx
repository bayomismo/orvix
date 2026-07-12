"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button, Card, CardBody, Sparkles } from "@orvix/ui";

/**
 * (app) error boundary. Next.js automatically wraps the app shell
 * segments in this, so any unhandled error in a Server Component or
 * client interaction lands here.
 *
 * The page replaces the (app) region with a self-contained error
 * card; the AppShell continues to render around it so the user
 * keeps their workspace context (notifications, profile, sidebar).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console in development; production
    // gets it via the Next.js error reporting pipeline.
    console.error("[orvix/app] Unhandled error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card elevation="raised" className="max-w-lg overflow-hidden">
        <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-status-danger-soft text-status-danger"
            >
              <Sparkles size={12} />
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-text-primary">
              Something didn&rsquo;t load
            </h1>
          </div>
          <span className="rounded-md bg-status-danger-soft px-1.5 text-2xs font-medium tabular-nums text-status-danger">
            error
          </span>
        </header>
        <CardBody className="flex flex-col gap-4 p-6">
          <p className="text-sm text-text-secondary leading-relaxed">
            The page hit an error while rendering. Your work is safe — the issue is in this view only.
          </p>
          <pre className="overflow-x-auto rounded-md border border-surface-divider bg-surface-canvas/40 p-3 text-2xs text-text-muted">
            {error.message}
            {error.digest ? `\ndigest: ${error.digest}` : ""}
          </pre>
          <div className="flex items-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <Link href="/inbox">
              <Button variant="secondary">Back to inbox</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
