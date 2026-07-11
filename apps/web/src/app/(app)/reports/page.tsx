import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, EmptyState, Badge } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";

export const dynamic = "force-dynamic";

const KPIS = [
  { key: "active_work",  label: "Active work",   unit: "" },
  { key: "pipeline",     label: "Pipeline",      unit: "$" },
  { key: "ai_runs",      label: "AI runs",       unit: "" },
  { key: "automations",  label: "Automations",   unit: "" },
] as const;

export default async function ReportsPage() {
  const s = await getSession();
  if (!s) return null;

  const w = [...db.workItems.values()].filter((w) => w.workspaceId === s.workspace.id);
  const aiRuns = [...db.aiRuns.values()].filter((r) => r.workspaceId === s.workspace.id);
  const automations = [...db.automations.values()].filter((a) => a.workspaceId === s.workspace.id);

  const stats: Record<string, number> = {
    active_work: w.filter((wi) => wi.status === "in_progress" || wi.status === "in_review").length,
    pipeline: w.filter((wi) => wi.typeKey === "customer" && (wi.status === "in_progress" || wi.status === "in_review"))
                .reduce((sum, wi) => sum + Number(wi.customFields?.["dealValue"] ?? 0), 0),
    ai_runs: aiRuns.length,
    automations: automations.length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Insight"
        title="Reports"
        subtitle="Phase 0 ships at-a-glance. Phase 1 wires dashboards, custom queries, and saved views."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.key}>
            <CardBody className="flex flex-col gap-1 p-5">
              <span className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
                {k.label}
              </span>
              <span className="orvix-numeric mt-1 text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
                {k.unit === "$"
                  ? formatUSD(stats[k.key] ?? 0)
                  : (stats[k.key] ?? 0).toLocaleString()}
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4 p-6">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight text-text-primary">
              Work item mix
            </h3>
            <Badge tone="ai" size="sm" dot>Phase 1</Badge>
          </header>
          <EmptyState
            shape="empty"
            title="Charts come in Phase 1."
            description="Bivariate analysis, time-series, and saved queries ship with the analytics engine."
          />
        </CardBody>
      </Card>
    </div>
  );
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
