"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, OptionCard, Field, FieldLabel, FieldDescription, Input, Textarea, Select, Badge } from "@orvix/ui";

import { createWorkItem } from "./actions";

const TYPES: { key: string; label: string; description: string; icon: string }[] = [
  { key: "customer",     label: "Customer",     description: "A person or company",        icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "deal",         label: "Deal",         description: "A sales opportunity",        icon: "M3 7h18M3 12h18M3 17h12" },
  { key: "project",      label: "Project",      description: "A multi-step engagement",   icon: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z" },
  { key: "task",         label: "Task",         description: "A unit of work to be done", icon: "M5 13l4 4L19 7" },
  { key: "conversation", label: "Conversation", description: "An email, call, or chat",    icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "document",     label: "Document",     description: "A spec or deliverable",    icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
  { key: "request",      label: "Request",      description: "Inbound ask",               icon: "M3 8l9 6 9-6 M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8" },
];

const STATUS = [
  { key: "backlog",     label: "Backlog" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked",     label: "Blocked" },
  { key: "in_review",   label: "In review" },
  { key: "done",        label: "Done" },
] as const;

const PRIORITY = [
  { key: "low",    label: "Low" },
  { key: "normal", label: "Normal" },
  { key: "high",   label: "High" },
  { key: "urgent", label: "Urgent" },
] as const;

interface Form {
  typeKey: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

const INITIAL: Form = {
  typeKey: "task",
  title: "",
  description: "",
  status: "backlog",
  priority: "normal",
};

export function CreateWorkItemButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<Form>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await createWorkItem({
      clientRequestId: crypto.randomUUID(),
      typeKey: form.typeKey,
      title: form.title.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      status: form.status as "backlog",
      priority: form.priority as "normal",
    });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    setOpen(false);
    setForm(INITIAL);
    router.push(`/work/${result.workItemId}`);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New work item
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-surface-overlay p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create work item"
            className="w-full max-w-2xl rounded-xl border border-surface-divider bg-surface-elevated shadow-4"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-surface-divider px-6 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-text-primary">
                  New work item
                </h2>
                <p className="mt-0.5 text-2xs text-text-muted">One engine, every shape.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-inset hover:text-text-primary"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="flex flex-col gap-5 px-6 py-5 max-h-[70vh] overflow-y-auto">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPES.map((t) => (
                    <OptionCard
                      key={t.key}
                      name="typeKey"
                      value={t.key}
                      label={t.label}
                      description={t.description}
                      checked={form.typeKey === t.key}
                      onChange={() => set("typeKey", t.key)}
                      icon={
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d={t.icon} />
                        </svg>
                      }
                    />
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  ref={titleRef}
                  id="title"
                  placeholder="e.g. Q3 launch landing page"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submit();
                    }
                  }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {STATUS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="priority">Priority</FieldLabel>
                  <Select
                    id="priority"
                    value={form.priority}
                    onChange={(e) => set("priority", e.target.value)}
                  >
                    {PRIORITY.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldDescription>Markdown supported in detail view.</FieldDescription>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="What does this work item need?"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>

              {error ? (
                <div
                  role="alert"
                  className="rounded-md border border-status-danger/30 bg-status-danger-soft px-3 py-2 text-xs text-status-danger"
                >
                  {error}
                </div>
              ) : null}
            </div>
            <footer className="flex items-center justify-between border-t border-surface-divider bg-surface-canvas/50 px-6 py-3">
              <span className="flex items-center gap-2 text-2xs text-text-muted">
                <Badge tone="ai" size="sm" dot>AI</Badge>
                The Assistant will offer next steps on save.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={submitting || !form.title.trim()}>
                  {submitting ? "Creating…" : "Create"}
                </Button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
