import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type AIRun } from "@/server/store";

import { AIConsole } from "./AIConsole";

export const dynamic = "force-dynamic";

/**
 * AI — destination 4 of 7 (v0.3).
 *
 * One AI Assistant per workspace. The page is the AI's workspace:
 *   - Console (the prompt area, a Slack-style composer)
 *   - Recent runs (live stream)
 *   - Approvals queue
 *   - Memory
 *   - Automations
 *
 * The whole page is the AI. The sidebar just routes to the lens.
 */

type Tab = "Console" | "Activity" | "Approvals" | "Memory" | "Automations";
const TABS: Tab[] = ["Console", "Activity", "Approvals", "Memory", "Automations"];

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="AI"
        title="Your AI Assistant"
        subtitle="Suggests by default. Asks before acting. One workspace, eight routing profiles."
        actions={
          <Badge tone="ai" dot>
            suggest_only
          </Badge>
        }
      />

      <nav
        aria-label="AI sections"
        className="flex items-center gap-1 border-b border-surface-divider"
      >
        {TABS.map((t) => (
          <TabLink
            key={t}
            tab={t}
            active={tab === t}
            badge={t === "Approvals" ? approvals.length : 0}
          />
        ))}
      </nav>

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
    </div>
  );
}

function TabLink({
  tab,
  active,
  badge,
}: {
  tab: Tab;
  active: boolean;
  badge: number;
}) {
  return (
    <Link
      href={`/ai?tab=${tab}`}
      className={
        "group/tab relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors duration-fast ease-snappy " +
        (active
          ? "text-text-primary"
          : "text-text-muted hover:text-text-secondary")
      }
    >
      {tab}
      {badge > 0 ? (
        <span
          className={
            "rounded-full px-1.5 text-[10px] font-medium tabular-nums " +
            (active
              ? "bg-brand-accent-soft text-brand-accent"
              : "bg-status-warning-soft text-status-warning")
          }
        >
          {badge}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className={
          "absolute inset-x-0 -bottom-px h-0.5 transition-colors duration-fast ease-snappy " +
          (active ? "bg-text-primary" : "bg-transparent")
        }
      />
    </Link>
  );
}

function ActivityStream({ runs }: { runs: AIRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-surface-divider bg-surface-canvas/50 p-10 text-center">
        <p className="text-sm font-medium text-text-primary">No runs yet.</p>
        <p className="mt-1 text-xs text-text-secondary">
          The Assistant will surface its work here as it runs.
        </p>
      </div>
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
    <div className="group/row flex items-start gap-3 rounded-lg border border-surface-divider bg-surface-elevated p-4 transition-colors duration-fast ease-snappy hover:border-surface-divider-strong">
      <span
        aria-hidden="true"
        className={
          "mt-1.5 h-2 w-2 shrink-0 rounded-full " +
          (r.decision === "execute"
            ? "bg-status-success"
            : r.decision === "block"
              ? "bg-status-danger"
              : r.decision === "cooldown"
                ? "bg-status-warning"
                : "bg-status-info")
        }
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
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
    </div>
  );
}

function ApprovalsQueue({ runs }: { runs: AIRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-surface-divider bg-surface-canvas/50 p-10 text-center">
        <p className="text-sm font-medium text-text-primary">No pending approvals.</p>
        <p className="mt-1 text-xs text-text-secondary">
          When the Assistant wants to act under <code className="font-mono text-2xs">suggest_only</code>, it shows up here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {runs.map((r) => (
        <div
          key={r.id}
          className="flex items-start gap-3 rounded-lg border border-status-warning/30 bg-status-warning-soft/40 p-4"
        >
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-warning" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
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
              className="h-8 rounded-md bg-status-danger-soft px-3 text-xs font-medium text-status-danger transition-colors hover:bg-status-danger-soft/70"
            >
              Block
            </button>
            <button
              type="button"
              className="h-8 rounded-md bg-status-success px-3 text-xs font-medium text-text-on-accent transition-all hover:bg-status-success/90 shadow-1"
            >
              Approve
            </button>
          </div>
        </div>
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
      state: "default-on",
    },
    {
      key: "workspace",
      title: "Workspace memory",
      body: "Shared across the team. Customer context, prior decisions, recurring asks.",
      state: "default-on",
    },
    {
      key: "cross_tenant",
      title: "Cross-tenant (opt-in)",
      body: "Default OFF. Helps the Assistant learn from patterns across similar workspaces, with explicit onboarding consent.",
      state: "opt-in",
    },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map((m) => (
        <div
          key={m.key}
          className="flex flex-col gap-3 rounded-lg border border-surface-divider bg-surface-elevated p-5"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              {m.title}
            </h3>
            <Badge tone={m.state === "opt-in" ? "warning" : "neutral"} size="sm">
              {m.state === "opt-in" ? "Opt-in" : "On"}
            </Badge>
          </header>
          <p className="text-sm text-text-secondary leading-relaxed">{m.body}</p>
        </div>
      ))}
    </div>
  );
}

function AutomationsShortcuts() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-divider bg-surface-canvas/50 p-10 text-center">
      <p className="text-sm font-medium text-text-primary">Automations live under Admin.</p>
      <p className="mt-1 text-xs text-text-secondary max-w-sm">
        Trigger → condition → action rules. The Assistant runs them when
        events fire.
      </p>
      <Link
        href="/admin/automations"
        className="mt-4 inline-flex h-8 items-center rounded-md bg-surface-elevated border border-surface-divider px-3 text-xs font-medium text-text-primary transition-colors hover:border-surface-divider-strong"
      >
        Open Automations →
      </Link>
    </div>
  );
}

function decisionTone(d: string): "success" | "warning" | "danger" | "info" {
  return d === "execute" ? "success" : d === "block" ? "danger" : d === "cooldown" ? "warning" : "info";
}
function decisionLabel(d: string): string {
  return d === "execute" ? "Executed" : d === "block" ? "Blocked" : d === "cooldown" ? "Cooldown" : "Queued";
}
