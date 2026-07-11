import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@orvix/ui";

import { getSession } from "@/server/auth";
import { db, type WorkItem } from "@/server/store";

import { CreateCustomerButton } from "./CreateCustomerButton";
import { STAGES, STAGE_LABEL, getStage } from "./stages";

export const dynamic = "force-dynamic";

/**
 * Customers — destination 3 of 7 (v0.3).
 *
 * Premium Kanban. Each column is a stage; cards are interactive
 * Work Items with type=customer. Pipeline value is the headline.
 */
export default async function CustomersPage() {
  const s = await getSession();
  if (!s) return null;

  const customers = [...db.workItems.values()].filter(
    (w) => w.workspaceId === s.workspace.id && w.typeKey === "customer",
  );

  const byStage = new Map<string, WorkItem[]>();
  for (const stage of STAGES) byStage.set(stage, []);
  for (const c of customers) {
    byStage.get(getStage(c))?.push(c);
  }

  const pipelineValue = customers
    .filter((c) => {
      const stage = getStage(c);
      return stage === "qualified" || stage === "proposal";
    })
    .reduce((s, c) => s + Number(c.customFields?.["dealValue"] ?? 0), 0);
  const wonValue = customers
    .filter((c) => getStage(c) === "won")
    .reduce((s, c) => s + Number(c.customFields?.["dealValue"] ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Sales"
        title="Customers"
        subtitle="The pipeline, by stage. Click a customer to see every interaction."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-2xs uppercase tracking-[0.06em] text-text-muted">
                Pipeline
              </span>
              <span className="orvix-numeric text-base font-semibold tabular-nums text-text-primary">
                {formatUSD(pipelineValue)}
              </span>
            </div>
            <div aria-hidden="true" className="h-8 w-px bg-surface-divider" />
            <div className="flex flex-col items-end text-right">
              <span className="text-2xs uppercase tracking-[0.06em] text-text-muted">
                Won
              </span>
              <span className="orvix-numeric text-base font-semibold tabular-nums text-status-success">
                {formatUSD(wonValue)}
              </span>
            </div>
            <CreateCustomerButton />
          </div>
        }
      />

      {customers.length === 0 ? (
        <EmptyState
          shape="firstTime"
          title="No customers yet."
          description="Add your first customer to start the pipeline. Every customer becomes a Work Item, so every other surface works the same."
        />
      ) : (
        <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
          {STAGES.map((stage) => {
            const list = byStage.get(stage) ?? [];
            const value = list.reduce(
              (s, c) => s + Number(c.customFields?.["dealValue"] ?? 0),
              0,
            );
            return (
              <div
                key={stage}
                className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-surface-inset/60 p-2.5"
              >
                <header className="flex items-center justify-between px-1.5 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      {STAGE_LABEL[stage]}
                    </span>
                    <span className="rounded-md bg-surface-elevated px-1.5 text-2xs font-medium tabular-nums text-text-muted">
                      {list.length}
                    </span>
                  </div>
                  <span className="orvix-numeric text-2xs tabular-nums text-text-muted">
                    {value > 0 ? formatUSD(value) : "—"}
                  </span>
                </header>
                <div className="flex flex-col gap-2">
                  {list.length === 0 ? (
                    <EmptyColumn stage={stage} />
                  ) : (
                    list.map((c) => <CustomerCard key={c.id} c={c} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyColumn({ stage }: { stage: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-surface-divider text-2xs text-text-muted">
      Drag a customer to {stage}
    </div>
  );
}

function CustomerCard({ c }: { c: WorkItem }) {
  const company = String(c.customFields?.["company"] ?? "");
  const value = Number(c.customFields?.["dealValue"] ?? 0);
  return (
    <Link
      href={`/work/${c.id}`}
      className="group/card block rounded-lg border border-surface-divider bg-surface-elevated p-3 shadow-1 transition-all duration-base ease-snappy hover:-translate-y-px hover:border-surface-divider-strong hover:shadow-2"
    >
      <div className="text-sm font-medium text-text-primary tracking-tight">
        {c.title}
      </div>
      {company ? (
        <div className="mt-0.5 text-xs text-text-secondary">{company}</div>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        {value > 0 ? (
          <span className="orvix-numeric text-xs font-semibold tabular-nums text-text-primary">
            {formatUSD(value)}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <span
          aria-hidden="true"
          className="text-text-muted transition-transform duration-base ease-snappy group-hover/card:translate-x-0.5"
        >
          →
        </span>
      </div>
    </Link>
  );
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
