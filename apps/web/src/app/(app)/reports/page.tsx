import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Card,
  CardBody,
  EmptyState,
  Inbox,
  Briefcase,
  Sparkles,
  BarChart,
  Users,
} from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type WorkItem } from "@/server/store";

export const dynamic = "force-dynamic";

type Tone = "info" | "warning" | "success" | "danger" | "neutral" | "ai";

interface KPIDef {
  key: string;
  label: string;
  unit: "" | "$";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: Tone;
  /** If set, KPI gets a non-default accent color. */
  accentClass: string;
}

const ICON_INBOX = Inbox;
const ICON_BRIEFCASE = Briefcase;
const ICON_AI = Sparkles;

const KPIS: KPIDef[] = [
  { key: "active_work",  label: "Active work",  unit: "",  icon: ICON_INBOX,     tone: "info",    accentClass: "text-status-info" },
  { key: "pipeline",     label: "Pipeline",     unit: "$", icon: ICON_BRIEFCASE, tone: "success", accentClass: "text-status-success" },
  { key: "won",          label: "Closed won",   unit: "$", icon: ICON_BRIEFCASE, tone: "success", accentClass: "text-status-success" },
  { key: "ai_runs",      label: "AI runs",      unit: "",  icon: ICON_AI,        tone: "ai",      accentClass: "text-brand-ai" },
];

export default async function ReportsPage() {
  const s = await getSession();
  if (!s) return null;

  const w: WorkItem[] = [...db.workItems.values()].filter((wi) => wi.workspaceId === s.workspace.id);
  const aiRuns = [...db.aiRuns.values()].filter((r) => r.workspaceId === s.workspace.id);
  const automations = [...db.automations.values()].filter((a) => a.workspaceId === s.workspace.id);
  const customers = w.filter((wi) => wi.typeKey === "customer");

  const stats: Record<string, number> = {
    active_work: w.filter((wi) => wi.status === "in_progress" || wi.status === "in_review").length,
    pipeline: customers
                .filter((wi) => wi.status === "in_progress" || wi.status === "in_review")
                .reduce((sum, wi) => sum + Number(wi.customFields?.["dealValue"] ?? 0), 0),
    won: customers
          .filter((wi) => wi.status === "done")
          .reduce((sum, wi) => sum + Number(wi.customFields?.["dealValue"] ?? 0), 0),
    ai_runs: aiRuns.length,
  };

  // Work item mix by type
  const mix = new Map<string, number>();
  for (const wi of w) {
    mix.set(wi.typeKey, (mix.get(wi.typeKey) ?? 0) + 1);
  }
  const mixTotal = w.length || 1;

  // Recent AI runs (last 5)
  const recentRuns = [...aiRuns]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Insight"
        title="Reports"
        subtitle="Phase 0 ships at-a-glance. Phase 1 wires dashboards, custom queries, and saved views."
      />

      {/* KPI strip — M2 Card with floating elevation */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.key} interactive elevation="floating" className="orvix-card-hover">
              <CardBody className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
                    {k.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-md " +
                      (k.tone === "ai" ? "bg-brand-ai/10 text-brand-ai" :
                       k.tone === "success" ? "bg-status-success-soft text-status-success" :
                       k.tone === "info" ? "bg-status-info-soft text-status-info" :
                       k.tone === "warning" ? "bg-status-warning-soft text-status-warning" :
                       k.tone === "danger" ? "bg-status-danger-soft text-status-danger" :
                       "bg-surface-inset text-text-muted")
                    }
                  >
                    <Icon size={12} />
                  </span>
                </div>
                <span className={"orvix-numeric text-3xl font-semibold tracking-tight tabular-nums " + k.accentClass}>
                  {k.unit === "$"
                    ? formatUSD(stats[k.key] ?? 0)
                    : (stats[k.key] ?? 0).toLocaleString()}
                </span>
              </CardBody>
            </Card>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Work item mix — simple visual bar */}
          <Card elevation="raised">
            <CardBody className="flex flex-col gap-4 p-6">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
                  >
                    <BarChart size={12} />
                  </span>
                  <h3 className="text-base font-semibold tracking-tight text-text-primary">
                    Work item mix
                  </h3>
                </div>
                <Badge tone="ai" size="sm" dot>Live</Badge>
              </header>

              {w.length === 0 ? (
                <p className="text-sm text-text-muted">No work items yet.</p>
              ) : (
                <>
                  <div
                    role="img"
                    aria-label={`Work item mix: ${[...mix.entries()].map(([k, v]) => `${k} ${v}`).join(", ")}`}
                    className="flex h-2 w-full overflow-hidden rounded-full bg-surface-inset"
                  >
                    {[...mix.entries()].map(([typeKey, count]) => {
                      const pct = (count / mixTotal) * 100;
                      return (
                        <span
                          key={typeKey}
                          className={typeBarColor(typeKey)}
                          style={{ width: `${pct}%` }}
                          title={`${typeKey}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[...mix.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([typeKey, count]) => {
                        const pct = Math.round((count / mixTotal) * 100);
                        return (
                          <li
                            key={typeKey}
                            className="flex items-center gap-2 rounded-md border border-surface-divider bg-surface-canvas/40 px-3 py-2"
                          >
                            <span
                              aria-hidden="true"
                              className={"h-2 w-2 rounded-full " + typeDotColor(typeKey)}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-2xs uppercase tracking-wider text-text-muted">
                                {typeKey}
                              </div>
                              <div className="text-sm font-semibold tabular-nums text-text-primary">
                                {count} <span className="text-2xs font-normal text-text-muted">· {pct}%</span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </>
              )}
            </CardBody>
          </Card>

          {/* Stage breakdown (for customer items) */}
          {customers.length > 0 ? <StageBreakdown customers={customers} /> : null}

          <Card elevation="raised">
            <CardBody className="flex flex-col gap-4 p-6">
              <header className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight text-text-primary">
                  Charts come in Phase 1
                </h3>
              </header>
              <EmptyState
                shape="empty"
                title="Bivariate analysis lands in Phase 1."
                description="Time-series, custom queries, and saved views will plug into the analytics engine."
              />
            </CardBody>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card elevation="raised" className="overflow-hidden">
            <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-ai" aria-hidden="true" />
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  Recent AI runs
                </h3>
              </div>
              <Badge tone="ai" size="sm">{aiRuns.length}</Badge>
            </header>
            {recentRuns.length === 0 ? (
              <CardBody className="p-5">
                <p className="text-xs text-text-muted">No AI runs yet.</p>
              </CardBody>
            ) : (
              <CardBody className="p-0">
                <ul className="divide-y divide-surface-divider">
                  {recentRuns.map((r) => (
                    <li key={r.id} className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-2xs">
                        <span className="font-medium text-text-primary capitalize">{r.kind}</span>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-muted">{r.routingProfile}</span>
                      </div>
                      {r.rationale ? (
                        <p className="mt-1 line-clamp-2 text-xs text-text-secondary leading-relaxed">
                          {r.rationale}
                        </p>
                      ) : null}
                      <div className="mt-1.5 flex items-center gap-1.5 text-2xs text-text-muted tabular-nums">
                        {r.decision === "execute" ? (
                          <Badge tone="success" size="sm">Executed</Badge>
                        ) : r.decision === "block" ? (
                          <Badge tone="danger" size="sm">Blocked</Badge>
                        ) : r.decision === "cooldown" ? (
                          <Badge tone="warning" size="sm">Cooldown</Badge>
                        ) : (
                          <Badge tone="info" size="sm">Queued</Badge>
                        )}
                        <span>{timeAgo(r.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            )}
          </Card>

          <Card elevation="raised">
            <CardBody className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-status-warning/10 text-status-warning"
                >
                  <Users size={12} />
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-text-primary">
                  People
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Stat label="Owners" value={[...db.users.values()].filter((u) => u.workspaceId === s.workspace.id).length} />
                <Stat label="Automations" value={automations.length} />
                <Stat label="Inboxes" value={[...db.inbox.values()].filter((i) => i.workspaceId === s.workspace.id).length} />
                <Stat label="Comments" value={[...db.comments.values()].filter((c) => c.workspaceId === s.workspace.id).length} />
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-surface-divider bg-surface-canvas/40 px-3 py-2">
      <div className="text-2xs uppercase tracking-wider text-text-muted">{label}</div>
      <div className="orvix-numeric text-lg font-semibold tabular-nums text-text-primary">{value.toLocaleString()}</div>
    </div>
  );
}

function StageBreakdown({ customers }: { customers: WorkItem[] }) {
  // Compute stage totals
  const stages: { key: string; label: string; tone: Tone; dot: string }[] = [
    { key: "lead",      label: "Lead",      tone: "info",    dot: "bg-status-info" },
    { key: "qualified", label: "Qualified", tone: "info",    dot: "bg-brand-accent" },
    { key: "proposal",  label: "Proposal",  tone: "warning", dot: "bg-status-warning" },
    { key: "won",       label: "Won",       tone: "success", dot: "bg-status-success" },
  ];
  const byStage: Record<string, { count: number; value: number }> = {
    lead: { count: 0, value: 0 },
    qualified: { count: 0, value: 0 },
    proposal: { count: 0, value: 0 },
    won: { count: 0, value: 0 },
  };
  const statusToStage: Record<string, string> = {
    backlog: "lead",
    in_progress: "qualified",
    in_review: "proposal",
    done: "won",
    archived: "won",
  };
  for (const c of customers) {
    const stage = statusToStage[c.status] ?? "lead";
    if (byStage[stage]) {
      byStage[stage].count += 1;
      byStage[stage].value += Number(c.customFields?.["dealValue"] ?? 0);
    }
  }
  const maxCount = Math.max(...Object.values(byStage).map((s) => s.count), 1);

  return (
    <Card elevation="raised">
      <CardBody className="flex flex-col gap-4 p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
            >
              <Users size={12} />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-text-primary">
              Pipeline by stage
            </h3>
          </div>
        </header>
        <ul className="flex flex-col gap-2.5">
          {stages.map((s) => {
            const data = byStage[s.key] ?? { count: 0, value: 0 };
            const pct = (data.count / maxCount) * 100;
            return (
              <li key={s.key}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className={"h-1.5 w-1.5 rounded-full " + s.dot} />
                    <span className="font-medium text-text-primary">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted tabular-nums">
                    <span>{data.count}</span>
                    <span className="text-text-secondary font-semibold text-text-primary">
                      {formatUSD(data.value)}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-inset">
                  <div
                    className={"h-full rounded-full " + s.dot}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}

function typeBarColor(t: string): string {
  return t === "customer" ? "bg-status-info"
    : t === "deal" ? "bg-brand-accent"
    : t === "project" ? "bg-status-warning"
    : t === "task" ? "bg-brand-ai"
    : t === "conversation" ? "bg-status-success"
    : t === "document" ? "bg-text-muted"
    : t === "request" ? "bg-status-danger"
    : "bg-text-muted";
}

function typeDotColor(t: string): string {
  return typeBarColor(t);
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
