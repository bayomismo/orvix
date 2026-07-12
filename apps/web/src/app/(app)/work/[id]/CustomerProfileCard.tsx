import { Card, CardBody, Users, Briefcase, Badge } from "@orvix/ui";

import { STAGES, STAGE_LABEL, getStage, type Stage } from "../../customers/stages";
import type { WorkItem } from "@/server/store";

/**
 * CustomerProfileCard — the customer-specific block shown on
 * `/work/[id]` for work items of type=customer.
 *
 * Surfaces the company, deal value, current pipeline stage, and a
 * one-row stage progress indicator. Lives in the right rail above
 * the generic Details card so the customer context reads first.
 */
export function CustomerProfileCard({ w }: { w: WorkItem }) {
  const company = String(w.customFields?.["company"] ?? "—");
  const dealValue = Number(w.customFields?.["dealValue"] ?? 0);
  const stage = getStage(w);
  const currentIdx = STAGES.indexOf(stage);

  return (
    <Card elevation="raised" className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent"
          >
            <Users size={12} />
          </span>
          <h3 className="text-sm font-semibold tracking-tight text-text-primary">
            Customer
          </h3>
        </div>
        <Badge tone={stageTone(stage)} size="sm">
          {STAGE_LABEL[stage]}
        </Badge>
      </header>
      <CardBody className="flex flex-col gap-4 p-5">
        <div>
          <div className="text-2xs uppercase tracking-[0.06em] text-text-muted">
            Company
          </div>
          <div className="mt-1 text-md font-semibold tracking-tight text-text-primary">
            {company}
          </div>
        </div>

        <div>
          <div className="text-2xs uppercase tracking-[0.06em] text-text-muted">
            Deal value
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="orvix-numeric text-lg font-semibold tabular-nums text-text-primary">
              {formatUSD(dealValue)}
            </span>
            {stage === "won" ? (
              <Badge tone="success" size="sm">
                Won
              </Badge>
            ) : stage === "lost" ? (
              <Badge tone="danger" size="sm">
                Lost
              </Badge>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-2xs">
            <span className="uppercase tracking-[0.06em] text-text-muted">Stage</span>
            <span className="text-text-secondary tabular-nums">
              {currentIdx + 1} / {STAGES.length}
            </span>
          </div>
          <div className="flex gap-1" role="list" aria-label="Pipeline stage progress">
            {STAGES.map((s, i) => {
              const reached = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <span
                  key={s}
                  role="listitem"
                  aria-label={STAGE_LABEL[s]}
                  className={
                    "h-1 flex-1 rounded-full transition-colors duration-base ease-out-quint " +
                    (current
                      ? "bg-brand-accent"
                      : reached
                        ? stageBarTone(s)
                        : "bg-surface-inset")
                  }
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-2xs text-text-muted">
            {STAGES.map((s) => (
              <span
                key={s}
                className={s === stage ? "font-medium text-text-primary" : ""}
              >
                {STAGE_LABEL[s]}
              </span>
            ))}
          </div>
        </div>

        {dealValue > 0 && (stage === "qualified" || stage === "proposal") ? (
          <div className="rounded-md border border-surface-divider bg-surface-inset/40 p-3 text-xs leading-relaxed text-text-secondary">
            <Briefcase size={12} className="mb-1 inline-block text-text-muted" />
            <span className="ml-1.5">
              {formatUSD(dealValue)} in the pipeline. Move to <span className="font-medium text-text-primary">Proposal</span> to start redlining.
            </span>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function stageTone(s: Stage): "info" | "warning" | "success" | "neutral" {
  return s === "won"
    ? "success"
    : s === "proposal"
      ? "warning"
      : s === "lost"
        ? "neutral"
        : "info";
}

function stageBarTone(s: Stage): string {
  return s === "won"
    ? "bg-status-success"
    : s === "proposal"
      ? "bg-status-warning"
      : s === "lost"
        ? "bg-surface-divider-strong"
        : "bg-status-info";
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}
