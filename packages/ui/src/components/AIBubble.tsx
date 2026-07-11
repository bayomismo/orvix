"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

import { cn } from "../lib/cn";
import { Orb } from "./Orb";
import { Sparkles, X } from "./icons";

/**
 * AIBubble — ORVIX Design System v1.0.
 *
 * The floating AI entry point. Sits at the bottom-right of the
 * viewport, drag-aware, and opens a focused chat sheet.
 *
 * Behavior:
 *   - Click → opens a sheet (right slide-in) with quick prompts
 *     and a text input.
 *   - ⌘. or Esc closes the sheet.
 *   - The bubble itself can be hidden with hideBubble().
 */
export interface QuickPrompt {
  id: string;
  label: string;
  description?: string;
  prompt: string;
  icon?: React.ReactNode;
}

export interface AIBubbleProps {
  quickPrompts?: QuickPrompt[];
  onAsk?: (prompt: string) => void;
  hideBubble?: boolean;
}

const DEFAULT_PROMPTS: QuickPrompt[] = [
  {
    id: "summary",
    label: "Summarize today",
    description: "Get a TL;DR of what changed",
    prompt: "Give me a quick summary of what's happened in this workspace today.",
  },
  {
    id: "work",
    label: "What's blocked?",
    description: "Find work items waiting on someone",
    prompt: "Show me work items that are blocked or waiting on someone else.",
  },
  {
    id: "customers",
    label: "Top customers",
    description: "Ranked by recent activity",
    prompt: "Who are my most active customers this week?",
  },
  {
    id: "draft",
    label: "Draft a reply",
    description: "Write a customer message",
    prompt: "Draft a friendly reply to a customer who asked for a refund.",
  },
];

export function AIBubble({
  quickPrompts = DEFAULT_PROMPTS,
  onAsk,
  hideBubble,
}: AIBubbleProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  if (hideBubble) return null;

  const handleAsk = (prompt: string) => {
    if (onAsk) {
      onAsk(prompt);
    } else {
      const encoded = encodeURIComponent(prompt);
      router.push(`/ai?q=${encoded}`);
    }
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {/* Floating bubble — bottom-right */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-popover",
          "transition-transform duration-default ease-out-quint",
          open ? "scale-95 opacity-0 pointer-events-none" : "scale-100 opacity-100",
        )}
      >
        <DialogPrimitive.Trigger asChild>
          <Orb size="lg" state="idle" ariaLabel="Open AI Assistant" />
        </DialogPrimitive.Trigger>
      </div>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-modal bg-black/40 backdrop-blur-sm data-[state=open]:animate-[orvix-fade-in_180ms_ease-out]"
        />
        <DialogPrimitive.Content
          aria-label="AI Assistant"
          className={cn(
            "orvix-glass fixed right-3 top-3 bottom-3 z-modal w-[min(440px,92vw)]",
            "rounded-2xl border border-white/[0.06]",
            "shadow-4 p-0 flex flex-col",
            "data-[state=open]:animate-[orvix-sheet-in_240ms_var(--motion-ease-out-quint)]",
          )}
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-surface-divider">
            <div className="flex items-center gap-2.5">
              <Orb size="sm" state="idle" />
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  ORVIX AI
                </h2>
                <p className="text-2xs text-text-muted">Always here to help</p>
              </div>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-sm p-1 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            >
              <X size={14} />
            </DialogPrimitive.Close>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs text-text-secondary mb-3">
              Quick prompts:
            </p>
            <ul role="list" className="grid grid-cols-1 gap-2">
              {quickPrompts.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleAsk(p.prompt)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-md border border-surface-divider",
                      "bg-surface-elevated/40 p-3 text-left",
                      "hover:border-brand-ai/30 hover:bg-brand-ai/[0.06]",
                      "transition-all duration-fast ease-out-quint",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-brand-ai/15 text-brand-ai"
                    >
                      <Sparkles size={12} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-text-primary">
                        {p.label}
                      </span>
                      {p.description && (
                        <span className="block text-2xs text-text-muted mt-0.5">
                          {p.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) handleAsk(query.trim());
            }}
            className="border-t border-surface-divider p-3"
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-md",
                "border border-surface-divider bg-surface-canvas/60",
                "px-2.5 py-1.5",
                "focus-within:border-brand-ai/40",
                "transition-colors duration-fast",
              )}
            >
              <Sparkles size={13} className="text-brand-ai shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask ORVIX anything…"
                aria-label="Ask ORVIX"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className={cn(
                  "rounded-sm px-2 py-1 text-2xs font-medium",
                  "bg-brand-ai/20 text-brand-ai",
                  "hover:bg-brand-ai/30",
                  "disabled:opacity-40 disabled:pointer-events-none",
                  "transition-colors duration-fast",
                )}
              >
                Ask
              </button>
            </div>
            <p className="text-2xs text-text-muted mt-2 px-1">
              Answers are generated by AI. Verify important details.
            </p>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
