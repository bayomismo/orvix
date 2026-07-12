import Link from "next/link";

import { Badge, Button, Field, FieldDescription, FieldLabel, Input } from "@orvix/ui";

/**
 * Sign in — magic-link card.
 *
 * v1.0 design (Part 10.4 of DESIGN-SPRINT-V2). Centered card, glass
 * surface, single email field, two OAuth options. Phase 0 shows
 * the surface; the actual magic-link request is wired in Phase 1
 * alongside Auth.js v5.
 */
export default function SignInPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-stretch px-6 pb-24 pt-20">
        <div className="orvix-glass rounded-2xl border border-white/[0.06] p-7 shadow-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent via-brand-ai to-brand-ai/60 text-text-on-accent shadow-2"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="6" y1="20" x2="18" y2="4" />
                <circle cx="18" cy="4" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Sign in to your workspace.
              </p>
            </div>
          </div>

          <form className="mt-7 flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldDescription>
                We&apos;ll email you a magic link to sign in.
              </FieldDescription>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@yourcompany.com"
              />
            </Field>
            <Button className="w-full" type="submit">
              Send magic link
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-2xs uppercase tracking-wider text-text-muted">
            <span className="h-px flex-1 bg-surface-divider" />
            <span className="font-mono">or</span>
            <span className="h-px flex-1 bg-surface-divider" />
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full">
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-white text-[10px] font-bold text-surface-canvas">
                G
              </span>
              Continue with Google
            </Button>
            <Button variant="secondary" className="w-full">
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#0078D4] text-[10px] font-bold text-text-on-accent">
                M
              </span>
              Continue with Microsoft
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/onboarding"
            className="text-text-primary underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-2xs text-text-muted">
          <Badge tone="neutral" size="sm">
            Phase 0
          </Badge>
          <span>Magic link is mocked until Phase 1.</span>
        </div>
      </section>
);
}
