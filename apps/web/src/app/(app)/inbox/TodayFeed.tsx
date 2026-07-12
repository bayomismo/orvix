"use client";

import Link from "next/link";

import { Badge, Card, CardBody, EmptyState, Users, Briefcase, Folder, CheckSquare, Message, File, InboxTray } from "@orvix/ui";
import type { WorkItem } from "@/server/store";

const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  backlog: "neutral",
  in_progress: "info",
  blocked: "danger",
  in_review: "warning",
  done: "success",
  archived: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  blocked: "Blocked",
  in_review: "In review",
  done: "Done",
  archived: "Archived",
};

const PRIORITY_TONE: Record<string, "neutral" | "info" | "warning" | "danger"> = {
  low: "neutral",
  normal: "neutral",
  high: "warning",
  urgent: "danger",
};

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  customer: Users,
  deal: Briefcase,
  project: Folder,
  task: CheckSquare,
  conversation: Message,
  document: File,
  request: InboxTray,
};

export function TodayFeed({ items, empty }: { items: WorkItem[]; empty: boolean }) {
  if (empty) {
    return (
      <EmptyState
        shape="firstTime"
        title="All clear."
        description="Nothing needs you right now. Create a new work item to get the engine running."
        ctaLabel="New work item"
        onCta={() => { window.location.href = "/work"; }}
      />
    );
  }
  if (items.length === 0) {
    return (
      <Card>
        <CardBody className="p-5">
          <p className="text-sm text-text-secondary">Nothing on your plate right now.</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card elevation="flat" className="overflow-hidden">
      <CardBody className="p-0">
        <ul className="divide-y divide-surface-divider">
          {items.map((w) => {
            const Icon = TYPE_ICON[w.typeKey] ?? Users;
            return (
              <li key={w.id}>
                <Link
                  href={`/work/${w.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-fast ease-out-quint hover:bg-surface-inset"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-inset text-text-secondary transition-colors duration-fast ease-out-quint group-hover:bg-surface-elevated group-hover:text-text-primary"
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
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[w.status]} size="sm">
                    {STATUS_LABEL[w.status]}
                  </Badge>
                  {w.priority === "high" || w.priority === "urgent" ? (
                    <Badge tone={PRIORITY_TONE[w.priority]} size="sm">
                      {w.priority === "urgent" ? "Urgent" : "High"}
                    </Badge>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="text-text-muted transition-transform duration-fast ease-out-quint group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
