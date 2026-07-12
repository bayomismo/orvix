import Link from "next/link";

import { Badge, Button } from "@orvix/ui";

/**
 * Pricing — the standalone pricing page.
 *
 * v1.0 design (Part 10.2 of DESIGN-SPRINT-V2). Three tiers in a row,
 * the middle one highlighted. Companion to the pricing teaser on
 * the landing page.
 */
export default function PricingPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-6 pb-12 pt-20">
        <div className="text-center">
          <Badge tone="ai" size="sm" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Three tiers. Same engine.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">
            Start free. Add a team when you outgrow it. Move to Scale when
            you need SOC 2, SSO, and audit.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PricingCard
            tier="Solo"
            price="$0"
            cadence="/ month"
            description="For the founder running everything themselves."
            features={[
              "1 workspace",
              "7 work item types",
              "ORVIX AI (suggest-only)",
              "Community support",
            ]}
            cta={
              <Link href="/onboarding">
                <Button variant="secondary" className="w-full">
                  Start free
                </Button>
              </Link>
            }
          />
          <PricingCard
            tier="Team"
            price="$24"
            cadence="/ seat / month"
            description="The pod that needs roles, departments, and shared context."
            features={[
              "Unlimited workspaces",
              "Roles & RBAC (18 permissions)",
              "ORVIX AI (propose + verify)",
              "Automations",
              "Email support",
            ]}
            cta={
              <Link href="/onboarding">
                <Button className="w-full">Start 14-day trial</Button>
              </Link>
            }
            highlighted
          />
          <PricingCard
            tier="Scale"
            price="Custom"
            cadence=""
            description="Soc 2, audit, SSO, and the runtime you build into."
            features={[
              "SSO / SAML",
              "Audit log + DLP",
              "Dedicated runtime",
              "Custom data residency",
              "Priority support",
            ]}
            cta={
              <Link href="mailto:sales@orvix.app">
                <Button variant="secondary" className="w-full">
                  Talk to us
                </Button>
              </Link>
            }
          />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-2xs text-text-muted">
          Prices in USD. Volume discounts for teams over 50 seats. Annual
          contracts available — contact sales.
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <h2 className="text-2xs font-mono uppercase tracking-[0.12em] text-text-muted">
          Frequently asked
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Faq
            q="What does ORVIX AI actually do?"
            a="It reads your inbox, drafts replies, suggests the next work item, and routes tasks. It can also summarize the day, draft briefings, and propose weekly plans. Every action is verified by the runtime before it touches your data."
          />
          <Faq
            q="Is my data isolated?"
            a="Yes. Two layers of isolation: a Postgres row-level security policy AND a repository-level workspaceId guard on every read and write. Two apps in the same database see two completely different worlds."
          />
          <Faq
            q="Can I host it myself?"
            a="Yes — the entire stack is open source. Self-host on your own Postgres, your own S3, and your own AI provider keys. The Team and Scale plans add the managed runtime, SSO, and DLP."
          />
          <Faq
            q="What happens after the pilot?"
            a="We open the Pro tier in Q4. Existing pilot customers get a 6-month credit applied to any plan."
          />
        </div>
      </section>
    </>
  );
}

function PricingCard({
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
    <div
      className={
        highlighted
          ? "orvix-glass relative rounded-2xl border border-brand-accent/50 p-6 shadow-3"
          : "orvix-glass rounded-2xl border border-white/[0.06] p-6 shadow-2"
      }
    >
      {highlighted ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-text-on-accent">
          Most popular
        </span>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight text-text-primary">
        {tier}
      </h3>
      <div className="mt-3">
        <span className="font-mono text-4xl font-semibold tracking-tight text-text-primary">
          {price}
        </span>
        {cadence ? (
          <span className="ml-1 text-2xs text-text-muted">{cadence}</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-text-secondary">{description}</p>
      <ul className="mt-5 flex flex-col gap-2">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent"
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
      <div className="mt-6">{cta}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-surface-divider bg-surface-elevated/30 p-4">
      <h3 className="text-sm font-semibold text-text-primary">{q}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{a}</p>
    </div>
  );
}
