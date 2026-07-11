import Link from "next/link";

import { Badge, Button, Card, CardBody } from "@orvix/ui";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-surface-canvas">
      <Backdrop />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight text-text-primary">Orvix</span>
            <Badge tone="ai" size="sm" dot>Phase 0</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/inbox" className="text-xs font-medium text-text-secondary transition-colors hover:text-text-primary">
              Demo
            </Link>
            <Link href="/onboarding">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="max-w-2xl">
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-surface-divider bg-surface-elevated px-3 py-1 text-2xs font-medium text-text-secondary shadow-1">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
              <span>Adaptive Business Operating System</span>
            </div>
            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-text-primary sm:text-6xl">
              <span className="block">Less UI.</span>
              <span className="block text-text-secondary">More clarity.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-balance text-sm leading-relaxed text-text-secondary">
              A work surface that adapts. The Assistant writes, summarizes, and proposes — but never acts without you. The runtime guards every move.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2">
              <Link href="/onboarding">
                <Button>Get started →</Button>
              </Link>
              <Link href="/inbox">
                <Button variant="secondary">Open demo</Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <Pillar
              title="One engine"
              body="7 built-in Work Item types + custom. Every shape, same surface."
            />
            <Pillar
              title="AI in the runtime"
              body="Planner → Verifier → Approver. The Assistant is bounded by policy."
            />
            <Pillar
              title="Tenant-isolated"
              body="Two layers. One boundary. You see your work; nothing else."
            />
          </div>
        </main>

        <footer className="flex items-center justify-between text-2xs text-text-muted">
          <span>© Orvix</span>
          <span>v0.3 — Phase 0 complete</span>
        </footer>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-accent to-brand-ai text-text-on-accent shadow-1"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
      </svg>
    </span>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-2 p-5 text-left">
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          {title}
        </span>
        <p className="text-xs leading-relaxed text-text-secondary">{body}</p>
      </CardBody>
    </Card>
  );
}

function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(800px 400px at 20% -10%, rgb(238 242 255 / 0.8), transparent 70%), radial-gradient(700px 500px at 90% 100%, rgb(245 243 255 / 0.7), transparent 60%)",
      }}
    />
  );
}
