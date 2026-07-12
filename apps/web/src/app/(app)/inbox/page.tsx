import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Clock,
} from "@orvix/ui";
import { getSession } from "@/server/auth";
import { db } from "@/server/store";

import { BlockedPanel } from "./BlockedPanel";
import { QuickActions } from "./QuickActions";
import { TodayFeed } from "./TodayFeed";
import { ActivityRail } from "./ActivityRail";

export const dynamic = "force-dynamic";

/**
 * Inbox — destination 1 of 7 (v1.0).
 *
 * Three-region layout (Linear / Stripe convention):
 *   - Top: greeting + meta
 *   - Center: BlockedPanel → metric strip → Today feed → AI briefing → Quick actions
 *   - Right rail: status, activity, inbox
 *
 * v1.0 refresh: M2 Card with proper elevation, M2 icons throughout,
 * BlockedPanel that surfaces items needing human decision.
 */
export default async function InboxPage() {
  const s = await getSession();
  if (!s) return null;

  const allItems = [...db.workItems.values()].filter(
    (w) => w.workspaceId === s.workspace.id,
  );
  const open = allItems.filter((w) => w.status !== "done" && w.status !== "archived");
  const inProgress = open.filter((w) => w.status === "in_progress");
  const blocked = open.filter((w) => w.status === "blocked");
  const review = open.filter((w) => w.status === "in_review");
  const highPriority = open.filter((w) => w.priority === "high" || w.priority === "urgent");

  const aiRuns = [...db.aiRuns.values()]
    .filter((r) => r.workspaceId === s.workspace.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  const inbox = [...db.inbox.values()]
    .filter((i) => i.workspaceId === s.workspace.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const urgentAction = blocked[0] ?? highPriority[0] ?? null;
  const decisionItems = [...blocked, ...highPriority].slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-8 min-w-0">
        <PageHeader
          kicker="Today"
          title={greeting(s.user.displayName.split(" ")[0] ?? "there")}
          subtitle={focusSummary({ blocked: blocked.length, inReview: review.length, urgent: highPriority.length, inProgress: inProgress.length })}
          actions={
            urgentAction ? (
              <Link href={`/work/${urgentAction.id}`}>
                <Button>
                  Resolve “{urgentAction.title.slice(0, 22)}{urgentAction.title.length > 22 ? "…" : ""}”
                </Button>
              </Link>
            ) : (
              <Link href="/work">
                <Button variant="secondary">Open Work →</Button>
              </Link>
            )
          }
        />

        {/* Blocked / needs-decision panel */}
        {decisionItems.length > 0 ? (
          <BlockedPanel
            items={decisionItems}
            rationale={
              blocked.length > 0
                ? `${blocked.length} item${blocked.length === 1 ? "" : "s"} ${blocked.length === 1 ? "is" : "are"} blocked and ${highPriority.length > 0 ? `${highPriority.length} ${highPriority.length === 1 ? "is" : "are"} high-priority. ` : ""}The Assistant can't proceed without you.`
                : `${highPriority.length} high-priority item${highPriority.length === 1 ? "" : "s"} on your plate. The Assistant is waiting on a decision.`
            }
          />
        ) : null}

        {/* Headline metrics — answer the most important question first */}
        <section aria-label="Headline metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Needs attention"
            value={blocked.length + highPriority.length}
            tone={blocked.length > 0 ? "danger" : "warning"}
            hint="Blocked or urgent"
          />
          <MetricCard
            label="In progress"
            value={inProgress.length}
            tone="accent"
            hint="Active work"
          />
          <MetricCard
            label="In review"
            value={review.length}
            tone="info"
            hint="Awaiting sign-off"
          />
          <MetricCard
            label="AI runs"
            value={aiRuns.length}
            tone="ai"
            hint="Last 24h"
            dot
          />
        </section>

        {/* Today feed — the action surface */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-text-primary">
              Today
            </h2>
            <Link
              href="/work?status=open"
              className="text-2xs font-medium text-brand-accent hover:underline"
            >
              See all work →
            </Link>
          </div>
          <TodayFeed
            items={[
              ...inProgress,
              ...highPriority,
            ].slice(0, 8)}
            empty={open.length === 0}
          />
        </section>

        {/* AI briefing */}
        {aiRuns.length > 0 ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-text-primary">
                AI briefing
              </h2>
              <Badge tone="ai" size="sm" dot>
                Live
              </Badge>
            </div>
            <Card elevation="flat" className="overflow-hidden">
              <CardBody className="p-0">
                <ul className="divide-y divide-surface-divider">
                  {aiRuns.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-start gap-3 px-5 py-3.5"
                    >
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
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium text-text-primary capitalize">
                            {r.kind}
                          </span>
                          <span className="text-text-muted">·</span>
                          <span className="text-text-muted">{r.routingProfile}</span>
                          <span className="text-text-muted">·</span>
                          <span className="text-text-muted inline-flex items-center gap-1 tabular-nums">
                            <Clock size={10} aria-hidden="true" />
                            {timeAgo(r.createdAt)}
                          </span>
                        </div>
                        {r.rationale ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                            {r.rationale}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone={decisionTone(r.decision)} size="sm">
                        {decisionLabel(r.decision)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </section>
        ) : null}

        {/* Quick actions */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">
            Quick actions
          </h2>
          <QuickActions />
        </section>
      </div>

      {/* Right rail */}
      <ActivityRail inbox={inbox.slice(0, 5)} unread={inbox.filter((i) => !i.read).length} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  hint,
  dot,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "info" | "accent" | "ai";
  hint: string;
  dot?: boolean;
}) {
  const colorClass =
    tone === "danger"
      ? "text-status-danger"
      : tone === "warning"
        ? "text-status-warning"
        : tone === "info"
          ? "text-status-info"
          : tone === "ai"
            ? "text-brand-ai"
            : "text-brand-accent";
  return (
    <Card interactive elevation="floating" className="orvix-card-hover">
      <CardBody className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
            {label}
          </span>
          {dot ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-ai animate-pulse" /> : null}
        </div>
        <span className={"orvix-numeric text-3xl font-semibold tracking-tight " + colorClass}>
          {value}
        </span>
        <span className="text-xs text-text-muted">{hint}</span>
      </CardBody>
    </Card>
  );
}

function greeting(name: string): string {
  const h = new Date().getHours();
  if (h < 5) return `Late night, ${name}`;
  if (h < 12) return `Good morning, ${name}`;
  if (h < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function focusSummary(c: { blocked: number; inReview: number; urgent: number; inProgress: number }): string {
  if (c.blocked > 0) {
    return `${c.blocked} blocked work item${c.blocked === 1 ? "" : "s"} need your decision.`;
  }
  if (c.urgent > 0) {
    return `${c.urgent} urgent item${c.urgent === 1 ? "" : "s"} on your plate.`;
  }
  if (c.inReview > 0) {
    return `${c.inReview} item${c.inReview === 1 ? "" : "s"} waiting on review.`;
  }
  if (c.inProgress > 0) {
    return `${c.inProgress} in motion — keep the momentum going.`;
  }
  return "Nothing blocking. A good moment to start something new.";
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

function decisionTone(d: string): "success" | "warning" | "danger" | "info" {
  return d === "execute" ? "success" : d === "block" ? "danger" : d === "cooldown" ? "warning" : "info";
}
function decisionLabel(d: string): string {
  return d === "execute" ? "Executed" : d === "block" ? "Blocked" : d === "cooldown" ? "Cooldown" : "Queued";
}
