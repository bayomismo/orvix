"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Card, CardBody, Field, FieldLabel, Input, OptionCard, Select, Textarea } from "@orvix/ui";

import { createAutomation, toggleAutomation, deleteAutomation } from "./actions";
import type { Automation, AutomationActionKind, AutomationTrigger } from "./actions";

const TRIGGERS: { key: AutomationTrigger; label: string; description: string }[] = [
  { key: "work_item_created", label: "Work item created", description: "Fires when a new work item is added" },
  { key: "status_changed",    label: "Status changed",   description: "Fires when a work item moves" },
  { key: "ai_run_completed",  label: "AI run completed", description: "Fires after every AI Assistant run" },
  { key: "schedule:daily",    label: "Daily schedule",   description: "Fires once per day at 09:00 UTC" },
];

const ACTION_KINDS: { key: AutomationActionKind; label: string; description: string }[] = [
  { key: "set_status",    label: "Set status",     description: "Change a work item's status" },
  { key: "add_comment",   label: "Add comment",    description: "Post a comment" },
  { key: "send_to_inbox", label: "Send to inbox",  description: "Surface an inbox item" },
  { key: "ai_summarize",  label: "AI summarize",   description: "Trigger an AI summary" },
];

const STATUSES = ["backlog","in_progress","in_review","done","blocked"];

export function AutomationsClient({ initial }: { initial: Automation[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [trigger, setTrigger] = React.useState<AutomationTrigger>("work_item_created");
  const [conditionField, setConditionField] = React.useState("");
  const [conditionValue, setConditionValue] = React.useState("");
  const [actionKind, setActionKind] = React.useState<AutomationActionKind>("add_comment");
  const [actionBody, setActionBody] = React.useState("");
  const [actionStatus, setActionStatus] = React.useState("in_progress");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const payload: Record<string, unknown> = {};
    if (actionKind === "add_comment") payload["body"] = actionBody.trim() || "(automated)";
    if (actionKind === "set_status") payload["status"] = actionStatus;
    if (actionKind === "send_to_inbox") {
      payload["title"] = name.trim();
      payload["body"] = actionBody.trim();
      payload["href"] = "/inbox";
    }
    if (actionKind === "ai_summarize") {
      payload["prompt"] = actionBody.trim() || "Summarize recent activity.";
    }
    const r = await createAutomation(crypto.randomUUID(), {
      name: name.trim(),
      trigger,
      action: { kind: actionKind, payload },
      ...(conditionField && conditionValue
        ? { condition: { kind: "equals" as const, field: conditionField, value: conditionValue } }
        : {}),
    });
    if (!r.ok) {
      setError(r.error);
      setBusy(false);
      return;
    }
    setName("");
    setActionBody("");
    setConditionField("");
    setConditionValue("");
    setOpen(false);
    setBusy(false);
    router.refresh();
  };

  const onToggle = async (id: string, enabled: boolean) => {
    await toggleAutomation(crypto.randomUUID(), id, enabled);
    router.refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    await deleteAutomation(crypto.randomUUID(), id);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      {initial.length === 0 ? (
        <Card>
          <CardBody className="p-8">
            <p className="text-sm text-text-muted">No automations yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {initial.map((r) => (
            <AutomationRow
              key={r.id}
              r={r}
              onToggle={(v) => onToggle(r.id, v)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </div>
      )}

      {open ? null : (
        <Button onClick={() => setOpen(true)} className="self-start">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New automation
        </Button>
      )}

      {open ? (
        <Card>
          <CardBody className="flex flex-col gap-5 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-text-primary">
                  New automation
                </h2>
                <p className="mt-0.5 text-2xs text-text-muted">Trigger → condition → action.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-inset hover:text-text-primary"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <Field>
              <FieldLabel htmlFor="rname">Rule name</FieldLabel>
              <Input
                id="rname"
                placeholder="e.g. Auto-greet new leads"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Trigger</FieldLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TRIGGERS.map((t) => (
                  <OptionCard
                    key={t.key}
                    name="trigger"
                    value={t.key}
                    label={t.label}
                    description={t.description}
                    checked={trigger === t.key}
                    onChange={() => setTrigger(t.key)}
                  />
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="cfield">Condition field (optional)</FieldLabel>
                <Input id="cfield" placeholder="e.g. priority" value={conditionField} onChange={(e) => setConditionField(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="cvalue">Condition value</FieldLabel>
                <Input id="cvalue" placeholder="e.g. urgent" value={conditionValue} onChange={(e) => setConditionValue(e.target.value)} />
              </Field>
            </div>

            <Field>
              <FieldLabel>Action</FieldLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ACTION_KINDS.map((a) => (
                  <OptionCard
                    key={a.key}
                    name="action"
                    value={a.key}
                    label={a.label}
                    description={a.description}
                    checked={actionKind === a.key}
                    onChange={() => setActionKind(a.key)}
                  />
                ))}
              </div>
            </Field>

            {actionKind === "set_status" ? (
              <Field>
                <FieldLabel htmlFor="astatus">New status</FieldLabel>
                <Select id="astatus" value={actionStatus} onChange={(e) => setActionStatus(e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="abody">
                  {actionKind === "ai_summarize" ? "Prompt" : actionKind === "send_to_inbox" ? "Body" : "Comment body"}
                </FieldLabel>
                <Textarea
                  id="abody"
                  rows={3}
                  placeholder={
                    actionKind === "ai_summarize"
                      ? "What should the AI summarize?"
                      : actionKind === "send_to_inbox"
                        ? "Short body for the inbox card…"
                        : "What should the comment say?"
                  }
                  value={actionBody}
                  onChange={(e) => setActionBody(e.target.value)}
                />
              </Field>
            )}

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-status-danger/30 bg-status-danger-soft px-3 py-2 text-xs text-status-danger"
              >
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={busy || !name.trim()}>
                {busy ? "Creating…" : "Create rule"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function AutomationRow({
  r,
  onToggle,
  onDelete,
}: {
  r: Automation;
  onToggle: (v: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardBody className="flex items-start gap-4 p-5">
        <Toggle checked={r.enabled} onChange={onToggle} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              {r.name}
            </h3>
            <Badge tone={r.enabled ? "success" : "neutral"} size="sm" dot={r.enabled}>
              {r.enabled ? "On" : "Off"}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-text-secondary">
            <span className="text-text-muted">When</span>
            <code className="rounded bg-surface-inset px-1.5 py-0.5 font-mono text-2xs text-text-primary">{r.trigger}</code>
            {r.condition ? (
              <>
                <span className="text-text-muted">where</span>
                <code className="rounded bg-surface-inset px-1.5 py-0.5 font-mono text-2xs text-text-primary">
                  {r.condition.field}
                </code>
                <span className="text-text-muted">=</span>
                <code className="rounded bg-surface-inset px-1.5 py-0.5 font-mono text-2xs text-text-primary">
                  {String(r.condition.value)}
                </code>
              </>
            ) : null}
            <span className="text-text-muted">→</span>
            <code className="rounded bg-brand-accent-soft px-1.5 py-0.5 font-mono text-2xs text-brand-accent">
              {r.action.kind}
            </code>
            {r.action.kind === "set_status" ? (
              <Badge tone="info" size="sm">→ {String(r.action.payload["status"])}</Badge>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-3 text-2xs text-text-muted tabular-nums">
            <span>Ran {r.runs} time{r.runs === 1 ? "" : "s"}</span>
            {r.lastRunAt ? (
              <>
                <span aria-hidden="true">·</span>
                <span>last {new Date(r.lastRunAt).toLocaleString()}</span>
              </>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-status-danger"
        >
          Delete
        </Button>
      </CardBody>
    </Card>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-fast ease-snappy " +
        (checked ? "bg-brand-accent" : "bg-surface-divider-strong")
      }
    >
      <span
        className={
          "absolute top-0.5 h-5 w-5 rounded-full bg-text-on-accent shadow-1 transition-transform duration-fast ease-snappy " +
          (checked ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}
