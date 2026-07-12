import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import {
  Badge,
  EmptyState,
  Card,
  CardBody,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Filter,
  Users,
  Briefcase,
  Folder,
  CheckSquare,
  Message,
  File,
  InboxTray,
} from "@orvix/ui";
import { BUILT_IN_WORK_ITEM_TYPES } from "@orvix/schemas";
import type { WorkItemStatus, WorkItem } from "@/server/store";

import { getSession } from "@/server/auth";
import { db } from "@/server/store";
import { CreateWorkItemButton } from "./CreateWorkItemButton";

export const dynamic = "force-dynamic";

type SearchParams = {
  type?: string;
  status?: string;
};

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

/**
 * Work — destination 2 of 7 (v1.0).
 *
 * v1.0 refresh: M2 Tabs for the type filter (animated underline,
 * keyboard nav), M2 Card with elevation for the work list, M2
 * icons for type glyphs, status filter chip row.
 */
export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const s = await getSession();
  if (!s) return null;
  const sp = await searchParams;
  const filterType = sp.type ?? "all";
  const filterStatus = sp.status ?? "open";

  const all = [...db.workItems.values()].filter(
    (w) => w.workspaceId === s.workspace.id,
  );

  // Status filter
  const statusFiltered = all.filter((w) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "open") return w.status !== "done" && w.status !== "archived";
    if (filterStatus === "done") return w.status === "done";
    return w.status === filterStatus;
  });

  // Type filter
  const items =
    filterType === "all"
      ? statusFiltered
      : statusFiltered.filter((w) => w.typeKey === filterType);
  items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  // Counts (over the unfiltered set, scoped by status for "open" view)
  const typeScope = filterStatus === "all" ? all : statusFiltered;
  const typeCounts = new Map<string, number>();
  for (const t of BUILT_IN_WORK_ITEM_TYPES) typeCounts.set(t, 0);
  for (const w of typeScope) typeCounts.set(w.typeKey, (typeCounts.get(w.typeKey) ?? 0) + 1);

  // Status counts
  const statusCounts: Record<string, number> = {
    all: all.length,
    open: all.filter((w) => w.status !== "done" && w.status !== "archived").length,
    done: all.filter((w) => w.status === "done").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Work"
        title="Work"
        subtitle="Every Work Item, one engine. 7 built-in types + custom."
        actions={<CreateWorkItemButton />}
      />

      <Tabs
        defaultValue={filterType}
        key={`${filterType}-${filterStatus}`}
        className="flex flex-col gap-5"
      >
        <TabsList aria-label="Work item type" className="w-full overflow-x-auto">
          <TypeTabTrigger value="all" label="All" count={typeScope.length} href={`/work?status=${filterStatus}`} />
          {BUILT_IN_WORK_ITEM_TYPES.map((t) => (
            <TypeTabTrigger
              key={t}
              value={t}
              label={TYPE_LABEL[t] ?? t}
              count={typeCounts.get(t) ?? 0}
              href={`/work?type=${t}&status=${filterStatus}`}
            />
          ))}
        </TabsList>

        <div className="flex items-center justify-between gap-3">
          <p className="text-2xs text-text-muted">
            Showing <span className="orvix-numeric font-medium text-text-secondary">{items.length}</span>{" "}
            {items.length === 1 ? "item" : "items"}
            {filterType !== "all" ? <> in <span className="text-text-secondary">{TYPE_LABEL[filterType]}</span></> : null}
          </p>
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-text-muted" aria-hidden="true" />
            <span className="text-2xs uppercase tracking-wider text-text-muted">Status</span>
            <div className="flex items-center gap-1">
              {[
                { key: "open", label: "Open" },
                { key: "done", label: "Done" },
                { key: "all", label: "All" },
              ].map((opt) => {
                const active = filterStatus === opt.key;
                return (
                  <Link
                    key={opt.key}
                    href={
                      filterType === "all"
                        ? `/work?status=${opt.key}`
                        : `/work?type=${filterType}&status=${opt.key}`
                    }
                    className={
                      "rounded-md px-2 py-0.5 text-2xs font-medium transition-colors duration-fast ease-out-quint " +
                      (active
                        ? "bg-surface-inset text-text-primary"
                        : "text-text-muted hover:text-text-secondary")
                    }
                  >
                    {opt.label}
                    <span className="ml-1 tabular-nums text-text-muted">{statusCounts[opt.key] ?? 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <TabsContent value={filterType} className="mt-0 focus-visible:outline-none">
          {items.length === 0 ? (
            <EmptyState
              shape="firstTime"
              title={filterType === "all" ? "No work yet." : `No ${TYPE_LABEL[filterType]?.toLowerCase() ?? filterType} yet.`}
              description="Create your first work item to get the engine running. Customers, deals, projects, tasks, conversations, documents, and requests all live here."
            />
          ) : (
            <Card elevation="flat" className="overflow-hidden">
              <CardBody className="p-0">
                <ul className="divide-y divide-surface-divider">
                  {items.map((w) => (
                    <WorkRow key={w.id} w={w} />
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** One work-item row, used inside the list. */
function WorkRow({ w }: { w: WorkItem }) {
  const Icon = TYPE_ICON[w.typeKey] ?? Users;
  return (
    <li>
      <Link
        href={`/work/${w.id}`}
        className="group/row flex items-center gap-4 px-5 py-3.5 transition-colors duration-fast ease-out-quint hover:bg-surface-inset"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-inset text-text-secondary transition-colors duration-fast ease-out-quint group-hover/row:bg-surface-elevated group-hover/row:text-text-primary"
        >
          <Icon size={14} />
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
          className="text-text-muted transition-transform duration-fast ease-out-quint group-hover/row:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </li>
  );
}

/**
 * TabsTrigger that renders as a Next Link (so the URL is the source
 * of truth and there's a real page transition). We get the animated
 * underline from Radix Tabs by using the `data-state` attribute on
 * the child via clone.
 */
function TypeTabTrigger({
  value,
  label,
  count,
  href,
}: {
  value: string;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <TabsTrigger value={value} asChild>
      <Link
        href={href}
        className="relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-fast ease-out-quint data-[state=active]:text-text-primary after:absolute after:left-2 after:right-2 after:-bottom-px after:h-px after:bg-brand-accent after:scale-x-0 after:origin-center after:transition-transform after:duration-default after:ease-out-quint data-[state=active]:after:scale-x-100"
      >
        {label}
        <span className="rounded-md bg-surface-inset px-1.5 text-2xs font-medium tabular-nums text-text-muted">
          {count}
        </span>
      </Link>
    </TabsTrigger>
  );
}

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  customer: Users,
  deal: Briefcase,
  project: Folder,
  task: CheckSquare,
  conversation: Message,
  document: File,
  request: InboxTray,
};

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
