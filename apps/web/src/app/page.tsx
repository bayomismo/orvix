import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  CardBody,
  PublicShell,
} from "@orvix/ui";

/**
 * Landing — the public face of ORVIX.
 *
 * v1.0 design system (Direction A: Conductor). Single continuous
 * scroll. Hero → 3 product surfaces → pricing card → footer.
 *
 * Same tokens as the AppShell, same fonts, same motion. The Pulse
 * signature line is visible at the very top (handled by the
 * PublicShell).
 */
export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <PublicShell>
      <Hero />
      <Section1 />
      <Section2 />
      <Section3 />
      <PricingTeaser />
    </PublicShell>
  );
}

/* ----------------------------- Hero ----------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Backdrop />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-24 text-center sm:pt-32">
        <Badge tone="ai" size="sm" dot className="mb-6">
          Adaptive Business OS
        </Badge>
        <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.03em] text-text-primary sm:text-6xl md:text-7xl">
          The conductor for{" "}
          <span className="bg-gradient-to-br from-brand-accent via-brand-ai to-brand-ai/60 bg-clip-text text-transparent">
            your business.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-text-secondary sm:text-lg">
          One workspace. One Assistant. Roles, departments, work, and AI
          — all shaped to how you actually operate.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
          <Link href="/onboarding">
            <Button>
              <span>Set up your workspace</span>
              <span className="ml-1.5" aria-hidden="true">→</span>
            </Button>
          </Link>
          <Link href="/inbox">
            <Button variant="secondary">Open the demo</Button>
          </Link>
        </div>
        <p className="mt-5 text-2xs uppercase tracking-[0.16em] text-text-muted">
          Free during the v0.3 pilot · No credit card
        </p>

        <HeroMock />
      </div>
    </section>
  );
}

function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(700px 360px at 20% 0%, rgba(80, 70, 229, 0.10), transparent 70%), radial-gradient(600px 400px at 90% 30%, rgba(139, 133, 240, 0.10), transparent 60%)",
      }}
    />
  );
}

function HeroMock() {
  return (
    <div className="mt-16 w-full max-w-4xl">
      <div className="orvix-glass rounded-2xl border border-white/[0.06] p-3 shadow-4">
        <div className="flex gap-3">
          {/* Sidebar mock */}
          <aside className="hidden w-44 shrink-0 rounded-xl bg-surface-elevated/40 p-2.5 sm:block">
            <div className="mb-2 flex items-center gap-2 rounded-md bg-surface-canvas/40 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-brand-accent to-brand-ai text-2xs font-bold text-text-on-accent">
                A
              </span>
              <span className="truncate text-2xs font-semibold text-text-primary">
                Acme Studio
              </span>
            </div>
            <ul className="flex flex-col gap-0.5">
              {[
                ["Inbox", false, "4"],
                ["Work", true, "12"],
                ["Customers", false, ""],
                ["AI", false, "•"],
                ["Reports", false, ""],
              ].map(([label, active, badge]) => (
                <li
                  key={String(label)}
                  className={`flex items-center justify-between rounded-md px-2 py-1.5 text-2xs ${
                    active
                      ? "bg-brand-accent/15 font-medium text-text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  <span>{String(label)}</span>
                  {badge ? (
                    <span className="rounded-full bg-surface-canvas/60 px-1.5 text-2xs text-text-secondary">
                      {String(badge)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main mock */}
          <div className="flex-1 rounded-xl bg-surface-canvas/40 p-4 text-left">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase tracking-[0.12em] text-text-muted">
                  Today
                </div>
                <div className="text-base font-semibold text-text-primary">
                  Good evening, Casey
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-surface-divider bg-surface-elevated/60 px-2 py-1 text-2xs text-text-muted">
                  ⌘K
                </span>
                <span className="rounded-md border border-brand-ai/30 bg-brand-ai/10 px-2 py-1 text-2xs text-brand-ai">
                  Ask AI
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: "6", l: "Needs attention", tone: "danger" },
                { v: "5", l: "In progress", tone: "accent" },
                { v: "2", l: "In review", tone: "info" },
                { v: "0", l: "AI runs", tone: "ai" },
              ].map((m) => (
                <div
                  key={m.l}
                  className="rounded-md border border-surface-divider bg-surface-elevated/40 p-2.5"
                >
                  <div className="text-2xs text-text-muted">{m.l}</div>
                  <div
                    className={`mt-1 font-mono text-2xl font-semibold ${
                      m.tone === "danger"
                        ? "text-status-danger"
                        : m.tone === "accent"
                        ? "text-brand-accent"
                        : m.tone === "info"
                        ? "text-status-info"
                        : "text-brand-ai"
                    }`}
                  >
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { t: "Casey Rivera", s: "Customer", b: "In progress", dot: "high" },
                { t: "Q3 launch landing page", s: "Task", b: "In progress", dot: "high" },
                { t: "Onboarding revamp", s: "Project", b: "In progress", dot: "" },
              ].map((r) => (
                <div
                  key={r.t}
                  className="flex items-center justify-between rounded-md border border-surface-divider bg-surface-elevated/30 px-2.5 py-1.5"
                >
                  <div>
                    <div className="text-2xs font-medium text-text-primary">
                      {r.t}
                    </div>
                    <div className="font-mono text-2xs text-text-muted">{r.s}</div>
                  </div>
                  <span className="rounded-full bg-status-info/20 px-1.5 py-0.5 text-2xs text-status-info">
                    {r.b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Section 1 --------------------------- */

function Section1() {
  return (
    <Section
      eyebrow="The inbox that gets you"
      title={
        <>
          Stop triaging.
          <br />
          <span className="text-text-secondary">Start deciding.</span>
        </>
      }
      body="Your inbox reads every item, classifies it, and shows you the 3 that need a human. The rest are batched, summarized, and queued for review. The Assistant drafts replies you can ship in one click."
      visual={<SectionVisual kind="inbox" />}
    />
  );
}

/* --------------------------- Section 2 --------------------------- */

function Section2() {
  return (
    <Section
      eyebrow="Work, but it flows"
      title={
        <>
          7 work item types.
          <br />
          <span className="text-text-secondary">One engine.</span>
        </>
      }
      body="Customers, deals, projects, tasks, conversations, documents, requests. Every shape your business takes, in one place, with one set of rules. Custom types when you need them."
      visual={<SectionVisual kind="work" />}
      reverse
    />
  );
}

/* --------------------------- Section 3 --------------------------- */

function Section3() {
  return (
    <Section
      eyebrow="The AI, in the system"
      title={
        <>
          Bounded.
          <br />
          <span className="text-text-secondary">Not bolted on.</span>
        </>
      }
      body="The Assistant is a planner that produces a verifiable intent. The runtime checks every move. You approve. Three roles, three lines of accountability, every interaction."
      visual={<SectionVisual kind="ai" />}
    />
  );
}

/* ----------------------------- Pricing teaser ----------------------------- */

function PricingTeaser() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24">
      <div className="mb-10 text-center">
        <Badge tone="neutral" size="sm" className="mb-4">
          Pricing
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Three tiers. Same engine. Different controls.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">
          Start free. Add a team when you outgrow it. The runtime scales with you.
        </p>
      </div>
      <PricingTeaserGrid />
    </section>
  );
}

function PricingTeaserGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <PricingTeaserCard
        tier="Solo"
        price="$0"
        cadence="/month"
        description="For the founder running everything themselves."
        features={["1 workspace", "7 work item types", "ORVIX AI (suggest-only)"]}
        cta={<Link href="/onboarding"><Button variant="secondary" className="w-full">Start free</Button></Link>}
      />
      <PricingTeaserCard
        tier="Team"
        price="$24"
        cadence="/seat / month"
        description="The pod that needs roles, departments, and shared context."
        features={["Unlimited workspaces", "Roles & RBAC", "ORVIX AI (propose + verify)"]}
        cta={<Link href="/onboarding"><Button className="w-full">Start trial</Button></Link>}
        highlighted
      />
      <PricingTeaserCard
        tier="Scale"
        price="Custom"
        cadence=""
        description="Soc 2, audit, SSO, and the runtime you build into."
        features={["SSO / SAML", "Audit log + DLP", "Dedicated runtime"]}
        cta={<Link href="mailto:sales@orvix.app"><Button variant="secondary" className="w-full">Talk to us</Button></Link>}
      />
    </div>
  );
}

function PricingTeaserCard({
  tier,
  price,
  cadence,
  description,
  features,
  cta,
  highlighted,
}: {
  tier: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        highlighted
          ? "relative border-brand-accent/50 shadow-3"
          : undefined
      }
    >
      {highlighted ? (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-text-on-accent">
          Most popular
        </span>
      ) : null}
      <CardBody className="flex flex-col gap-4 p-6">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {tier}
        </h3>
        <div>
          <span className="font-mono text-4xl font-semibold tracking-tight text-text-primary">
            {price}
          </span>
          {cadence ? (
            <span className="ml-1 text-2xs text-text-muted">{cadence}</span>
          ) : null}
        </div>
        <p className="text-sm text-text-secondary">{description}</p>
        <ul className="flex flex-col gap-1.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <span
                aria-hidden="true"
                className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent"
              >
                <svg
                  viewBox="0 0 12 12"
                  width="10"
                  height="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2 6 5 9 10 3" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2">{cta}</div>
      </CardBody>
    </Card>
  );
}

/* --------------------------- Section primitive --------------------------- */

function Section({
  eyebrow,
  title,
  body,
  visual,
  reverse,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
      <div
        className={`flex flex-col justify-center ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <Badge tone="ai" size="sm" className="mb-4 w-fit">
          {eyebrow}
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary">
          {body}
        </p>
      </div>
      <div className={`flex items-center ${reverse ? "md:order-1" : ""}`}>
        {visual}
      </div>
    </section>
  );
}

function SectionVisual({ kind }: { kind: "inbox" | "work" | "ai" }) {
  return (
    <div className="orvix-glass w-full rounded-2xl border border-white/[0.06] p-4 shadow-3">
      <div className="rounded-xl bg-surface-canvas/40 p-4">
        {kind === "inbox" ? (
          <ul className="flex flex-col gap-2">
            {[
              { t: "Approve the new pricing matrix", u: "You", s: "high", b: "blocked" },
              { t: "Reply: re-scoping the Q3 plan", u: "Maya", s: "normal", b: "needs reply" },
              { t: "Draft: customer win-back", u: "AI", s: "low", b: "drafted" },
            ].map((r) => (
              <li
                key={r.t}
                className="flex items-center justify-between rounded-md border border-surface-divider bg-surface-elevated/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      r.s === "high"
                        ? "bg-status-danger"
                        : r.s === "normal"
                        ? "bg-status-warning"
                        : "bg-status-success"
                    }`}
                  />
                  <div>
                    <div className="text-sm text-text-primary">{r.t}</div>
                    <div className="text-2xs text-text-muted">
                      {r.b} · {r.u}
                    </div>
                  </div>
                </div>
                <span className="rounded-md border border-surface-divider px-2 py-0.5 text-2xs text-text-secondary">
                  open
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {kind === "work" ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { t: "Lead", c: 3, tone: "accent" },
              { t: "Qualified", c: 2, tone: "info" },
              { t: "Won", c: 1, tone: "success" },
            ].map((col) => (
              <div
                key={col.t}
                className="rounded-md border border-surface-divider bg-surface-elevated/30 p-2"
              >
                <div className="mb-1.5 flex items-center justify-between text-2xs uppercase tracking-wider text-text-muted">
                  <span>{col.t}</span>
                  <span>{col.c}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: col.c }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded bg-surface-canvas/40 px-2 py-1.5 text-2xs text-text-secondary"
                    >
                      <div className="text-text-primary">Casey Rivera</div>
                      <div className="font-mono text-text-muted">$24,000</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {kind === "ai" ? (
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-surface-divider bg-surface-elevated/30 px-3 py-2">
              <div className="text-2xs uppercase tracking-wider text-text-muted">
                Planner
              </div>
              <div className="mt-0.5 font-mono text-2xs text-text-secondary">
                intent = move <span className="text-brand-accent">casey@acme.co</span> to stage <span className="text-brand-accent">qualified</span>
              </div>
            </div>
            <div className="rounded-md border border-surface-divider bg-surface-elevated/30 px-3 py-2">
              <div className="text-2xs uppercase tracking-wider text-text-muted">
                Verifier
              </div>
              <div className="mt-0.5 font-mono text-2xs text-text-secondary">
                policy: ok · schema: ok · tenancy: ok
              </div>
            </div>
            <div className="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-3 py-2">
              <div className="text-2xs uppercase tracking-wider text-brand-accent">
                Approver · you
              </div>
              <div className="mt-0.5 font-mono text-2xs text-text-secondary">
                approve to execute
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
