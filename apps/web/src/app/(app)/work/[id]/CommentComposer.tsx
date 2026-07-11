"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, Textarea } from "@orvix/ui";

import { addComment } from "../actions";

export function CommentComposer({ workItemId }: { workItemId: string }) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    await addComment({
      clientRequestId: crypto.randomUUID(),
      workItemId,
      body: body.trim(),
    });
    setBody("");
    setBusy(false);
    router.refresh();
  };

  return (
    <div
      className={
        "rounded-lg border bg-surface-elevated transition-all duration-fast ease-snappy " +
        (focused ? "border-brand-accent ring-4 ring-brand-accent/10" : "border-surface-divider")
      }
    >
      <Textarea
        placeholder="Write a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
        }}
        disabled={busy}
        rows={3}
        className="border-0 focus:ring-0"
      />
      <div className="flex items-center justify-between border-t border-surface-divider px-3 py-2">
        <span className="text-2xs text-text-muted">
          <kbd className="rounded border border-surface-divider bg-surface-canvas px-1 py-0 font-mono text-[10px]">⌘↩</kbd> to send
        </span>
        <Button onClick={submit} disabled={busy || !body.trim()} size="sm">
          {busy ? "Sending…" : "Comment"}
        </Button>
      </div>
    </div>
  );
}
