"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge, Button, Card, CardBody, OptionCard, Select } from "@orvix/ui";

/**
 * AIConsole — the AI's workspace.
 *
 * v0.3: a real working surface. Not a form, not a chat. Three regions:
 *   - Composer (the prompt)
 *   - Suggestions (chips)
 *   - Result (the latest run, big)
 */

const KINDS = [
  { key: "summary",   label: "Summarize",  description: "Compress text" },
  { key: "draft",     label: "Draft",      description: "Write or rewrite" },
  { key: "briefing",  label: "Briefing",   description: "Bullet summary" },
  { key: "inference", label: "Infer DNA",  description: "Read the signal" },
  { key: "action",    label: "Action",     description: "Propose + verify" },
] as const;

const PROFILES = [
  "general", "sales", "delivery", "operations", "finance", "support", "leadership", "people",
] as const;

const SUGGESTIONS = [
  "Summarize today’s activity",
  "Draft a follow-up email to a lead that went quiet last week",
  "Triage my inbox by urgency",
  "Plan the week from the active work items",
  "Identify work items that have been blocked the longest",
];

const SAMPLES = [
  {
    label: "Customer pipeline briefing",
    text: "Summarize the current pipeline: 12 active customers across Lead, Qualified, and Proposal stages. Highlight the top 3 by deal value and any that have been stuck in the same stage for over 7 days.",
  },
  {
    label: "Weekly exec briefing",
    text: "Generate a weekly briefing covering: top 3 wins, top 3 risks, what's blocked, AI runs that need review, and one recommendation for next week.",
  },
];

export function AIConsole() {
  const router = useRouter();
  const [kind, setKind] = React.useState<(typeof KINDS)[number]["key"]>("draft");
  const [profile, setProfile] = React.useState<(typeof PROFILES)[number]>("general");
  const [prompt, setPrompt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<null | {
    decision: string;
    rationale: string;
    confidence: number;
    verdict: string;
    text?: string | undefined;
  }>(null);
  const [error, setError] = React.useState<string | null>(null);

  const run = async (overrideText?: string) => {
    const t = (overrideText ?? prompt).trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          routingProfile: profile,
          payload: { prompt: t },
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        result?: {
          decision: string;
          rationale: string;
          verifier: { verdict: string; confidence: number };
          proposedPayload?: { text?: string };
        };
        error?: { message?: string };
      };
      if (!data.ok || !data.result) {
        throw new Error(data.error?.message ?? "AI service did not return a result.");
      }
      setResult({
        decision: data.result.decision,
        rationale: data.result.rationale,
        confidence: data.result.verifier.confidence,
        verdict: data.result.verifier.verdict,
        text: data.result.proposedPayload?.text,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4 min-w-0">
        <Card>
          <CardBody className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-text-primary">
                      Run the Assistant
                    </h2>
                    <Badge tone="ai" size="sm" dot>
                      Live
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Planners → Verifier → Approver. The Assistant will not bypass the runtime.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    aria-label="Routing profile"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value as (typeof PROFILES)[number])}
                    className="text-xs"
                  >
                    {PROFILES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {KINDS.map((k) => (
                  <OptionCard
                    key={k.key}
                    name="kind"
                    value={k.key}
                    label={k.label}
                    description={k.description}
                    checked={kind === k.key}
                    onChange={() => setKind(k.key)}
                  />
                ))}
              </div>

              <div>
                <label htmlFor="prompt" className="text-2xs font-medium uppercase tracking-[0.06em] text-text-muted">
                  Prompt
                </label>
                <div className="mt-2 overflow-hidden rounded-lg border border-surface-divider bg-surface-canvas focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20">
                  <textarea
                    id="prompt"
                    rows={5}
                    placeholder="Describe the task. Be specific — the Assistant is honest about its limits."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        void run();
                      }
                    }}
                    className="block w-full resize-y bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                  />
                  <div className="flex items-center justify-between border-t border-surface-divider bg-surface-elevated px-3 py-1.5">
                    <span className="text-2xs text-text-muted">⌘↩ to run</span>
                    <Button
                      size="sm"
                      onClick={() => run()}
                      disabled={busy || !prompt.trim()}
                    >
                      {busy ? "Running…" : "Run"}
                    </Button>
                  </div>
                </div>
              </div>

              {error ? (
                <div role="alert" className="rounded-md border border-status-danger/30 bg-status-danger-soft px-3 py-2 text-xs text-status-danger">
                  {error}
                </div>
              ) : null}
            </div>
          </CardBody>
        </Card>

        {result ? (
          <Card>
            <CardBody className="p-5">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold tracking-tight text-text-primary">
                    Result
                  </h3>
                  <Badge tone={decisionTone(result.decision)} size="sm">
                    {result.decision}
                  </Badge>
                </div>
                <span className="text-2xs text-text-muted tabular-nums">
                  verifier {result.verdict} · {result.confidence}%
                </span>
              </header>
              {result.text ? (
                <div className="mt-3 rounded-lg border border-surface-divider bg-surface-canvas p-4 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {result.text}
                </div>
              ) : null}
              <div className="mt-3 rounded-lg border border-surface-divider bg-surface-inset p-3 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">Rationale — </span>
                {result.rationale}
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>

      <aside className="flex flex-col gap-4">
        <Card>
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              Try a prompt
            </h3>
            <ul className="mt-3 flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt(s);
                      void run(s);
                    }}
                    className="group/chip w-full rounded-md border border-surface-divider bg-surface-canvas px-3 py-2 text-left text-xs text-text-secondary transition-all duration-fast ease-snappy hover:border-surface-divider-strong hover:bg-surface-elevated hover:text-text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-text-muted transition-transform group-hover/chip:translate-x-0.5">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                      <span className="truncate">{s}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold tracking-tight text-text-primary">
              Templates
            </h3>
            <ul className="mt-3 flex flex-col gap-1.5">
              {SAMPLES.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => setPrompt(s.text)}
                    className="group/tmpl w-full rounded-md border border-surface-divider bg-surface-canvas px-3 py-2 text-left transition-all duration-fast ease-snappy hover:border-surface-divider-strong hover:bg-surface-elevated"
                  >
                    <div className="text-xs font-medium text-text-primary">{s.label}</div>
                    <div className="mt-0.5 line-clamp-2 text-2xs text-text-muted">
                      {s.text}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function decisionTone(d: string): "success" | "warning" | "danger" | "info" {
  return d === "execute" ? "success" : d === "block" ? "danger" : d === "cooldown" ? "warning" : "info";
}
