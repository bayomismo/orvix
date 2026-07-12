"use client";

import Link from "next/link";

import { Badge, Card, CardBody, Sparkles, Users, Briefcase, Folder, CheckSquare, Message, File, InboxTray } from "@orvix/ui";
import type { WorkItem } from "@/server/store";

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  customer: Users,
  deal: Briefcase,
  project: Folder,
  task: CheckSquare,
  conversation: Message,
  document: File,
  request: InboxTray,
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
 * BlockedPanel — items that need a human decision right now.
 *
 * The Assistant pre-classifies work into this set; the user opens
 * one and decides. Each row has the AI's reasoning on the right.
 */
export function BlockedPanel({ items, rationale }: { items: WorkItem[]; rationale?: string }) {
  if (items.length === 0) return null;
  return (
    <Card elevation="raised" className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-surface-divider bg-surface-canvas/40 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-ai" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">
            Needs your decision
          </h2>
          <Badge tone="ai" size="sm">
            {items.length}
          </Badge>
        </div>
        <Link href="/work?status=open" className="text-2xs font-medium text-brand-accent hover:underline">
          Open all →
        </Link>
      </header>
      {rationale ? (
        <p className="px-5 pt-3 text-xs text-text-secondary leading-relaxed">
          {rationale}
        </p>
      ) : null}
      <CardBody className="p-0">
        <ul className="divide-y divide-surface-divider">
          {items.slice(0, 4).map((w) => {
            const Icon = TYPE_ICON[w.typeKey] ?? Users;
            return (
              <li key={w.id}>
                <Link
                  href={`/work/${w.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-fast ease-out-quint hover:bg-surface-inset"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-status-danger-soft text-status-danger"
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {w.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-text-muted">
                      <span>{TYPE_LABEL[w.typeKey] ?? w.typeKey}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{w.status.replace("_", " ")}</span>
                      {w.priority === "urgent" || w.priority === "high" ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-status-warning">{w.priority === "urgent" ? "Urgent" : "High"} priority</span>
                        </>
                      ) : null}
                    </div>
                  </div>
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
