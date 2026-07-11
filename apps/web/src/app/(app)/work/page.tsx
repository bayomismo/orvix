import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { Badge, EmptyState } from "@orvix/ui";
import { BUILT_IN_WORK_ITEM_TYPES } from "@orvix/schemas";

import { getSession } from "@/server/auth";
import { db, type WorkItemStatus } from "@/server/store";
import { CreateWorkItemButton } from "./CreateWorkItemButton";

export const dynamic = "force-dynamic";

type SearchParams = { type?: string };

const STATUS_LABEL: Record<WorkItemStatus, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  done: "Done",
  archived: "Archived",
};

const STATUS_TONE: Record<WorkItemStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  backlog: "neutral",
  in_progress: "info",
  blocked: "danger",
  in_review: "warning",
  done: "success",
  archived: "neutral",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_TONE: Record<string, "neutral" | "info" | "warning" | "danger"> = {
  low: "neutral",
  normal: "neutral",
  high: "warning",
  urgent: "danger",
};

const TYPE_LABEL: Record<string, string> = {
  customer: "Customer",
  deal: "Deal",
  project: "Project",
  task: "Task",
  conversation: "Conversation",
  document: "Document",
  request: "Request",
};

const TYPE_ICON: Record<string, string> = {
  customer: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  deal: "M3 7h18M3 12h18M3 17h12",
  project: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z",
  task: "M5 13l4 4L19 7",
  conversation: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  document: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  request: "M3 8l9 6 9-6 M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8",
};

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const s = await getSession();
  if (!s) return null;
  const sp = await searchParams;
  const filterType = (sp.type ?? "all") as string;

  const all = [...db.workItems.values()].filter(
    (w) => w.workspaceId === s.workspace.id,
  );
  const items =
    filterType === "all" ? all : all.filter((w) => w.typeKey === filterType);
  items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const counts = new Map<string, number>();
  for (const t of BUILT_IN_WORK_ITEM_TYPES) counts.set(t, 0);
  for (const w of all) counts.set(w.typeKey, (counts.get(w.typeKey) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Work"
        title="Work"
        subtitle="Every Work Item, one engine. 7 built-in types + custom."
        actions={<CreateWorkItemButton />}
      />

      <nav
        aria-label="Work item type"
        className="flex items-center gap-1 overflow-x-auto border-b border-surface-divider"
      >
        <TypeTab href="/work" type="all" label="All" count={all.length} active={filterType === "all"} />
        {BUILT_IN_WORK_ITEM_TYPES.map((t) => (
          <TypeTab
            key={t}
            href={`/work?type=${t}`}
            type={t}
            label={TYPE_LABEL[t] ?? t}
            count={counts.get(t) ?? 0}
            active={filterType === t}
          />
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          shape="firstTime"
          title={filterType === "all" ? "No work yet." : `No ${TYPE_LABEL[filterType]?.toLowerCase() ?? filterType} yet.`}
          description="Create your first work item to get the engine running. Customers, deals, projects, tasks, conversations, documents, and requests all live here."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-surface-divider">
            {items.map((w) => {
              const icon = TYPE_ICON[w.typeKey];
              return (
                <li key={w.id}>
                  <Link
                    href={`/work/${w.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-fast ease-snappy hover:bg-surface-inset"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-inset text-text-secondary transition-colors duration-fast ease-snappy group-hover:bg-surface-elevated group-hover:text-text-primary"
                    >
                      {icon ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d={icon} />
                        </svg>
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text-primary">
                        {w.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-text-muted">
                        <span className="capitalize">{w.typeKey}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">#{w.id.slice(0, 6)}</span>
                        <span aria-hidden="true">·</span>
                        <span>updated {timeAgo(w.updatedAt)}</span>
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[w.status]} size="sm">
                      {STATUS_LABEL[w.status]}
                    </Badge>
                    {w.priority === "high" || w.priority === "urgent" ? (
                      <Badge tone={PRIORITY_TONE[w.priority]} size="sm">
                        {PRIORITY_LABEL[w.priority]}
                      </Badge>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="text-text-muted transition-transform duration-fast ease-snappy group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function TypeTab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  type: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "group/tab relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors duration-fast ease-snappy " +
        (active ? "text-text-primary" : "text-text-muted hover:text-text-secondary")
      }
    >
      {label}
      <span
        className={
          "rounded-md px-1.5 text-2xs font-medium tabular-nums " +
          (active
            ? "bg-surface-inset text-text-primary"
            : "text-text-muted")
        }
      >
        {count}
      </span>
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-surface-divider bg-surface-elevated shadow-1">
      {children}
    </div>
  );
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.round((now - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
