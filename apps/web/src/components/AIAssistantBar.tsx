"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * AI Assistant Bar — v0.3.
 *
 * Pinned, blurred, gradient-bordered input. Suggests suggestions.
 * Submits to the AI service via /api/ai/run.
 */

const SUGGESTIONS = [
  { label: "Summarize today", payload: { kind: "summary" as const, prompt: "Summarize the activity and work items from today." } },
  { label: "Draft a follow-up", payload: { kind: "draft" as const, prompt: "Draft a follow-up email to a lead who went quiet last week." } },
  { label: "Triage the inbox", payload: { kind: "briefing" as const, prompt: "Triage the inbox and group by urgency." } },
  { label: "Plan the week", payload: { kind: "inference" as const, prompt: "Read the active work items and propose a weekly plan." } },
];

export function AIAssistantBar({ workspaceId: _workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState(false);

  const submit = async (override?: { kind: "summary" | "draft" | "briefing" | "inference" | "action" | "suggestion"; prompt: string }) => {
    const t = (override?.prompt ?? text).trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: override?.kind ?? "draft",
          payload: { prompt: t },
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      }
      setText("");
      setFocused(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI unreachable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-sticky px-4 pb-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <div
          className={
            "relative rounded-2xl border bg-surface-elevated/95 shadow-3 backdrop-blur-xl transition-all duration-base ease-snappy " +
            (focused
              ? "border-brand-accent/40 ring-4 ring-brand-accent/10"
              : "border-surface-divider")
          }
        >
          {focused && SUGGESTIONS.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-surface-divider px-3 py-2.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => submit(s.payload)}
                  className="rounded-md border border-surface-divider bg-surface-canvas px-2.5 py-1 text-2xs font-medium text-text-secondary transition-all hover:border-surface-divider-strong hover:bg-surface-elevated hover:text-text-primary"
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex items-center gap-3 px-3 py-3"
          >
            <div
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-ai-soft text-brand-ai"
            >
              {busy ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z M5 12a7 7 0 0114 0v3a3 3 0 01-3 3H8a3 3 0 01-3-3v-3z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Ask the AI Assistant — try ‘Summarize today’"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              aria-label="Ask the AI Assistant"
            />
            <kbd className="hidden rounded border border-surface-divider bg-surface-canvas px-1.5 py-0.5 text-[10px] font-mono text-text-muted sm:inline-block">
              ⌘↩
            </kbd>
            <button
              type="submit"
              disabled={!text.trim() || busy}
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-text-primary px-2.5 text-xs font-medium text-text-on-accent transition-all duration-fast ease-snappy hover:bg-text-primary/90 disabled:opacity-40"
            >
              {busy ? "Running…" : "Run"}
            </button>
          </form>
          {error ? (
            <div role="alert" className="border-t border-status-danger/30 bg-status-danger-soft px-3 py-2 text-xs text-status-danger">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
