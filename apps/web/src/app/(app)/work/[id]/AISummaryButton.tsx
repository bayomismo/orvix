"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge, Button } from "@orvix/ui";

export function AISummaryButton({
  workItemId,
  title,
  description,
}: {
  workItemId: string;
  title: string;
  description?: string | undefined;
}) {
  const router = useRouter();
  const [summary, setSummary] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [verdict, setVerdict] = React.useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setSummary(null);
    setVerdict(null);
    try {
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "summary",
          workItemId,
          title,
          description,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        result?: { proposedPayload?: { text?: string }; verifier?: { verdict?: string } };
      };
      if (data.ok && data.result) {
        setSummary(data.result.proposedPayload?.text ?? "No summary returned.");
        setVerdict(data.result.verifier?.verdict ?? null);
        router.refresh();
      } else {
        setSummary("AI service is not reachable. Phase 1 wires the production path.");
      }
    } catch {
      setSummary("AI service is not reachable. Phase 1 wires the production path.");
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={run} disabled={busy} size="sm" variant="secondary" className="w-full justify-between">
        <span className="flex items-center gap-1.5">
          {busy ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2 4 4 .5-3 3 .5 4-3.5-2-3.5 2 .5-4-3-3 4-.5z" />
            </svg>
          )}
          {busy ? "Summarizing…" : "Generate summary"}
        </span>
        <span aria-hidden="true" className="text-text-muted">↵</span>
      </Button>
      {verdict ? (
        <div className="flex items-center gap-1.5 text-2xs">
          <Badge tone="ai" size="sm" dot>AI</Badge>
          <span className="text-text-muted">verifier {verdict}</span>
        </div>
      ) : null}
      {summary ? (
        <div className="rounded-md border border-surface-divider bg-surface-canvas p-3 text-xs text-text-primary leading-relaxed">
          {summary}
        </div>
      ) : null}
    </div>
  );
}
