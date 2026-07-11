"use client";

import Link from "next/link";

import { Badge, Card, CardBody, EmptyState } from "@orvix/ui";
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

const TYPE_ICON: Record<string, string> = {
  customer: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  deal: "M3 7h18M3 12h18M3 17h12",
  project: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z",
  task: "M5 13l4 4L19 7",
  conversation: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  document: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  request: "M3 8l9 6 9-6 M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8",
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
    <Card>
      <CardBody className="p-0">
        <ul className="divide-y divide-surface-divider">
          {items.map((w) => {
            const icon = TYPE_ICON[w.typeKey];
            return (
              <li key={w.id}>
                <Link
                  href={`/work/${w.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-fast ease-snappy hover:bg-surface-inset"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-inset text-text-secondary"
                  >
                    {icon ? (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                    ) : (
                      <span>?</span>
                    )}
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
                    className="text-text-muted transition-transform duration-fast ease-snappy group-hover:translate-x-0.5"
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
