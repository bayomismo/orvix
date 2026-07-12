import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Card,
  CardBody,
  EmptyState,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Users,
  Briefcase,
  Bell,
  Settings as SettingsIcon,
  CheckCircle,
  XCircle,
} from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type AIRun } from "@/server/store";

import { AIConsole } from "./AIConsole";

export const dynamic = "force-dynamic";

/**
 * AI — destination 4 of 7 (v1.0).
 *
 * One AI Assistant per workspace. The page is the AI's workspace:
 *   - Console (the prompt area)
 *   - Activity (live run stream)
 *   - Approvals (queue)
 *   - Memory (the 3 memory tiers)
 *   - Automations (shortcut to /admin/automations)
 *
 * v1.0 refresh: M2 Tabs (animated underline), M2 Card throughout,
 * M2 icons, M2 EmptyState.
 */

const TABS = ["Console", "Activity", "Approvals", "Memory", "Automations"] as const;
type Tab = (typeof TABS)[number];

export default async function AIPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const s = await getSession();
  if (!s) return null;
  const sp = await searchParams;
  const tab = (TABS.includes(sp.tab as Tab) ? sp.tab : "Console") as Tab;

  const allRuns = [...db.aiRuns.values()]
    .filter((r) => r.workspaceId === s.workspace.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const approvals = allRuns.filter((r) => r.decision === "queue_for_approval");
  const executed = allRuns.filter((r) => r.decision === "execute");
  const blocked = allRuns.filter((r) => r.decision === "block");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="AI"
        title="Your AI Assistant"
        subtitle="Suggests by default. Asks before acting. One workspace, eight routing profiles."
        actions={
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-ai/10 text-brand-ai"
            >
              <Sparkles size={12} />
            </span>
            <Badge tone="ai" dot>
              suggest_only
            </Badge>
          </div>
        }
      />

      {/* Quick stats strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Runs"
          value={allRuns.length}
          tone="info"
          icon={Sparkles}
          hint="Lifetime"
        />
        <Stat
          label="Executed"
          value={executed.length}
          tone="success"
          icon={CheckCircle}
          hint="Auto-approved"
        />
        <Stat
          label="Awaiting you"
          value={approvals.length}
          tone="warning"
          icon={Bell}
          hint="Pending approval"
        />
        <Stat
          label="Blocked"
          value={blocked.length}
          tone="danger"
          icon={XCircle}
          hint="Held by policy"
        />
      </section>

      <Tabs defaultValue={tab} className="flex flex-col gap-5">
        <TabsList aria-label="AI sections" className="w-full overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} asChild>
              <Link
                href={`/ai?tab=${t}`}
                className="relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-fast ease-out-quint data-[state=active]:text-text-primary after:absolute after:left-2 after:right-2 after:-bottom-px after:h-px after:bg-brand-accent after:scale-x-0 after:origin-center after:transition-transform after:duration-default after:ease-out-quint data-[state=active]:after:scale-x-100"
              >
                {t}
                {t === "Approvals" && approvals.length > 0 ? (
                  <span className="rounded-md bg-status-warning-soft px-1.5 text-2xs font-medium tabular-nums text-status-warning">
                    {approvals.length}
                  </span>
                ) : null}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-0 focus-visible:outline-none">
          {tab === "Console" ? (
            <AIConsole />
          ) : tab === "Activity" ? (
            <ActivityStream runs={allRuns} />
          ) : tab === "Approvals" ? (
            <ApprovalsQueue runs={approvals} />
          ) : tab === "Memory" ? (
            <MemoryView />
          ) : (
            <AutomationsShortcuts />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "warning" | "danger";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hint: string;
}) {
  const colorClass =
    tone === "success" ? "text-status-success"
    : tone === "warning" ? "text-status-warning"
    : tone === "danger" ? "text-status-danger"
    : "text-status-info";
  return (
    <Card interactive elevation="floating" className="orvix-card-hover">
      <CardBody className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
            {label}
          </span>
          <span
            aria-hidden="true"
            className={
              "flex h-6 w-6 items-center justify-center rounded-md " +
              (tone === "success" ? "bg-status-success-soft text-status-success" :
               tone === "warning" ? "bg-status-warning-soft text-status-warning" :
               tone === "danger" ? "bg-status-danger-soft text-status-danger" :
               "bg-status-info-soft text-status-info")
            }
          >
            <Icon size={12} />
          </span>
        </div>
        <span className={"orvix-numeric text-2xl font-semibold tracking-tight tabular-nums " + colorClass}>
          {value}
        </span>
        <span className="text-2xs text-text-muted">{hint}</span>
      </CardBody>
    </Card>
  );
}

function ActivityStream({ runs }: { runs: AIRun[] }) {
  if (runs.length === 0) {
    return (
      <EmptyState
        shape="empty"
        title="No runs yet."
        description="The Assistant will surface its work here as it runs."
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-ai/10 text-brand-ai">
            <Sparkles size={16} />
          </span>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {runs.map((r) => (
        <ActivityRow key={r.id} r={r} />
      ))}
    </div>
  );
}

function ActivityRow({ r }: { r: AIRun }) {
  return (
    <Card interactive elevation="flat" className="orvix-card-hover overflow-hidden">
      <CardBody className="flex items-start gap-3 p-4">
        <span
          aria-hidden="true"
          className={
            "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
            decisionDotColor(r.decision)
          }
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-text-primary capitalize">{r.kind}</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">{r.routingProfile}</span>
            <span className="ml-auto text-2xs text-text-muted tabular-nums">
              {new Date(r.createdAt).toLocaleString()}
            </span>
          </div>
          {r.rationale ? (
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">{r.rationale}</p>
          ) : null}
        </div>
        <Badge tone={decisionTone(r.decision)} size="sm">
          {decisionLabel(r.decision)}
        </Badge>
      </CardBody>
    </Card>
  );
}

function ApprovalsQueue({ runs }: { runs: AIRun[] }) {
  if (runs.length === 0) {
    return (
      <EmptyState
        shape="empty"
        title="No pending approvals."
        description={`When the Assistant wants to act under suggest_only, it shows up here.`}
        icon={
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-status-success-soft text-status-success">
            <Check size={16} />
          </span>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {runs.map((r) => (
        <Card
          key={r.id}
          elevation="flat"
          className="overflow-hidden border-status-warning/30"
        >
          <CardBody className="flex items-start gap-3 p-4">
            <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-warning" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-text-primary capitalize">{r.kind}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-secondary">{r.routingProfile}</span>
              </div>
              {r.rationale ? (
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">{r.rationale}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-status-danger/30 bg-status-danger-soft px-3 text-xs font-medium text-status-danger transition-all duration-fast ease-out-quint hover:bg-status-danger-soft/70"
              >
                <X size={12} aria-hidden="true" />
                Block
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-status-success px-3 text-xs font-medium text-text-on-accent transition-all duration-fast ease-out-quint hover:bg-status-success/90 shadow-1"
              >
                <Check size={12} aria-hidden="true" />
                Approve
              </button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function MemoryView() {
  const cards = [
    {
      key: "user",
      title: "User memory",
      body: "Remembers your preferences, your stage, your tone. Tied to your user id.",
      state: "default-on" as const,
      icon: Users,
    },
    {
      key: "workspace",
      title: "Workspace memory",
      body: "Shared across the team. Customer context, prior decisions, recurring asks.",
      state: "default-on" as const,
      icon: Briefcase,
    },
    {
      key: "cross_tenant",
      title: "Cross-tenant (opt-in)",
      body: "Default OFF. Helps the Assistant learn from patterns across similar workspaces, with explicit onboarding consent.",
      state: "opt-in" as const,
      icon: SettingsIcon,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.key} interactive elevation="floating" className="orvix-card-hover overflow-hidden">
            <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-ai/10 text-brand-ai"
                >
                  <Icon size={12} />
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  {m.title}
                </h3>
              </div>
              <Badge tone={m.state === "opt-in" ? "warning" : "success"} size="sm">
                {m.state === "opt-in" ? "Opt-in" : "On"}
              </Badge>
            </header>
            <CardBody className="p-5">
              <p className="text-sm text-text-secondary leading-relaxed">{m.body}</p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function AutomationsShortcuts() {
  return (
    <Card elevation="raised">
      <CardBody className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
        >
          <Sparkles size={20} />
        </span>
        <div>
          <p className="text-sm font-medium text-text-primary">Automations live under Admin.</p>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">
            Trigger → condition → action rules. The Assistant runs them when events fire.
          </p>
        </div>
        <Link
          href="/admin/automations"
          className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-md border border-surface-divider bg-surface-elevated px-3.5 text-xs font-medium text-text-primary transition-colors duration-fast ease-out-quint hover:border-surface-divider-strong"
        >
          Open Automations
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </CardBody>
    </Card>
  );
}

function decisionDotColor(d: string): string {
  return d === "execute" ? "bg-status-success"
    : d === "block" ? "bg-status-danger"
    : d === "cooldown" ? "bg-status-warning"
    : "bg-status-info";
}

function decisionTone(d: string): "success" | "warning" | "danger" | "info" {
  return d === "execute" ? "success" : d === "block" ? "danger" : d === "cooldown" ? "warning" : "info";
}
function decisionLabel(d: string): string {
  return d === "execute" ? "Executed" : d === "block" ? "Blocked" : d === "cooldown" ? "Cooldown" : "Queued";
}
