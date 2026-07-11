"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, Field, FieldDescription, FieldLabel, Input, Select } from "@orvix/ui";

import { createCustomer } from "./actions";
import { STAGES, STAGE_LABEL, type Stage } from "./stages";

const STAGES_PUBLIC = STAGES;

export function CreateCustomerButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [value, setValue] = React.useState("");
  const [stage, setStage] = React.useState<Stage>("lead");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => nameRef.current?.focus());
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const r = await createCustomer(crypto.randomUUID(), {
      name: name.trim(),
      ...(company.trim() ? { company: company.trim() } : {}),
      ...(value ? { dealValue: Number(value) } : {}),
      stage,
    });
    if (!r.ok) {
      setError(r.error);
      setBusy(false);
      return;
    }
    setName("");
    setCompany("");
    setValue("");
    setStage("lead");
    setOpen(false);
    setBusy(false);
    router.push(`/work/${r.workItemId}`);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New customer
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-surface-overlay p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create customer"
            className="w-full max-w-md rounded-xl border border-surface-divider bg-surface-elevated shadow-4"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-surface-divider px-6 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-text-primary">
                  New customer
                </h2>
                <p className="mt-0.5 text-2xs text-text-muted">Adds a Work Item to your pipeline.</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-text-muted transition-colors hover:bg-surface-inset hover:text-text-primary"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="flex flex-col gap-4 px-6 py-5">
              <Field>
                <FieldLabel htmlFor="cname">Name</FieldLabel>
                <Input
                  ref={nameRef}
                  id="cname"
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void submit();
                    }
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ccompany">Company</FieldLabel>
                <FieldDescription>Optional</FieldDescription>
                <Input
                  id="ccompany"
                  placeholder="e.g. Northwind"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="cvalue">Deal value</FieldLabel>
                  <Input
                    id="cvalue"
                    type="number"
                    inputMode="numeric"
                    leadingIcon={<span className="text-text-muted text-xs">$</span>}
                    placeholder="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cstage">Stage</FieldLabel>
                  <Select
                    id="cstage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Stage)}
                  >
                    {STAGES_PUBLIC.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABEL[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              {error ? (
                <div
                  role="alert"
                  className="rounded-md border border-status-danger/30 bg-status-danger-soft px-3 py-2 text-xs text-status-danger"
                >
                  {error}
                </div>
              ) : null}
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-surface-divider bg-surface-canvas/50 px-6 py-3">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={busy || !name.trim()}>
                {busy ? "Creating…" : "Create"}
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
