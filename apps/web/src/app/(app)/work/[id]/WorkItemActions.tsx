"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, Select } from "@orvix/ui";

import { updateWorkItem, deleteWorkItem } from "../actions";

const STATUS = [
  { key: "backlog",     label: "Backlog" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked",     label: "Blocked" },
  { key: "in_review",   label: "In review" },
  { key: "done",        label: "Done" },
  { key: "archived",    label: "Archived" },
] as const;

const PRIORITY = [
  { key: "low",    label: "Low" },
  { key: "normal", label: "Normal" },
  { key: "high",   label: "High" },
  { key: "urgent", label: "Urgent" },
] as const;

export function WorkItemActions({
  workItemId,
  currentStatus,
  currentPriority,
  currentAssigneeId: _currentAssigneeId,
}: {
  workItemId: string;
  currentStatus: string;
  currentPriority: string;
  currentAssigneeId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(currentStatus);
  const [priority, setPriority] = React.useState(currentPriority);
  const [busy, setBusy] = React.useState(false);

  const save = async (patch: Record<string, unknown>) => {
    setBusy(true);
    await updateWorkItem({ clientRequestId: crypto.randomUUID(), workItemId, ...patch });
    setBusy(false);
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm("Delete this work item? This cannot be undone.")) return;
    setBusy(true);
    await deleteWorkItem(crypto.randomUUID(), workItemId);
    setBusy(false);
    router.push("/work");
  };

  return (
    <div className="flex items-center gap-1.5">
      <Select
        aria-label="Status"
        value={status}
        onChange={(e) => {
          const v = e.target.value;
          setStatus(v);
          void save({ status: v });
        }}
        disabled={busy}
        className="text-xs"
      >
        {STATUS.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </Select>
      <Select
        aria-label="Priority"
        value={priority}
        onChange={(e) => {
          const v = e.target.value;
          setPriority(v);
          void save({ priority: v });
        }}
        disabled={busy}
        className="text-xs"
      >
        {PRIORITY.map((p) => (
          <option key={p.key} value={p.key}>{p.label}</option>
        ))}
      </Select>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={busy}
        className="text-status-danger"
      >
        Delete
      </Button>
    </div>
  );
}
