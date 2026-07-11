"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { createWorkItem } from "../work/actions";

/**
 * QuickActions — three one-click creates. The cards feel tactile
 * (lift on hover, icon rotates), and each one routes to the new
 * work item.
 */
export function QuickActions() {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  const quick = async (
    typeKey: "task" | "deal" | "customer",
    title: string,
  ) => {
    setBusy(typeKey);
    const r = await createWorkItem({
      clientRequestId: crypto.randomUUID(),
      typeKey,
      title,
      priority: "normal",
      status: "in_progress",
    });
    setBusy(null);
    if (r.ok) router.push(`/work/${r.workItemId}`);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <QuickCard
        label="New task"
        hint="A unit of work"
        onClick={() => quick("task", "Untitled task")}
        busy={busy === "task"}
        gradient="from-status-info/10 to-transparent"
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        }
      />
      <QuickCard
        label="New deal"
        hint="A sales opportunity"
        onClick={() => quick("deal", "Untitled deal")}
        busy={busy === "deal"}
        gradient="from-status-success/10 to-transparent"
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18M3 12h18M3 17h12" />
          </svg>
        }
      />
      <QuickCard
        label="New customer"
        hint="A person or company"
        onClick={() => quick("customer", "Untitled customer")}
        busy={busy === "customer"}
        gradient="from-status-warning/10 to-transparent"
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />
    </div>
  );
}

function QuickCard({
  label,
  hint,
  onClick,
  busy,
  gradient,
  icon,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  busy: boolean;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group/qa relative flex flex-col items-start gap-2 overflow-hidden rounded-lg border border-surface-divider bg-surface-elevated p-4 text-left transition-all duration-base ease-snappy hover:-translate-y-px hover:border-surface-divider-strong hover:shadow-2 disabled:opacity-50"
    >
      <div
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-base ease-snappy group-hover/qa:opacity-100 " +
          gradient
        }
      />
      <div
        aria-hidden="true"
        className="relative flex h-9 w-9 items-center justify-center rounded-md bg-surface-inset text-text-secondary transition-all duration-base ease-snappy group-hover/qa:bg-surface-elevated group-hover/qa:text-text-primary group-hover/qa:shadow-1"
      >
        {icon}
      </div>
      <div className="relative">
        <div className="text-sm font-medium text-text-primary tracking-tight">
          {busy ? "Creating…" : label}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">{hint}</div>
      </div>
      <span
        aria-hidden="true"
        className="absolute right-3 top-3 text-text-muted transition-all duration-base ease-snappy group-hover/qa:translate-x-0.5 group-hover/qa:text-text-primary"
      >
        →
      </span>
    </button>
  );
}
