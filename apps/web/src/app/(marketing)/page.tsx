/**
 * Marketing landing — public, unauthed.
 *
 * Phase 0 ships a minimal version. The marketing site is not the
 * product; most of our investment goes to (app). This page exists to
 * admit non-app routes into the build so we have a public route to
 * test CI, Lighthouse, and the build pipeline without being authed.
 */
import Link from "next/link";

import { Button } from "@orvix/ui";

export default function MarketingLanding() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="flex flex-col gap-6">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
          ORVIX
        </span>
        <h1 className="font-display text-4xl tracking-tight text-text-primary sm:text-5xl">
          The Adaptive Business Operating System.
        </h1>
        <p className="max-w-prose text-base text-text-secondary leading-relaxed">
          One workspace. Roles, departments, the work engine, the AI
          Assistant — set up in four questions.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/onboarding">
            <Button>Set up your workspace →</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
