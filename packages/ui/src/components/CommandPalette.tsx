"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

import { cn } from "../lib/cn";
import { Search, Sparkles, X } from "./icons";

/**
 * CommandPalette — ORVIX Design System v1.0.
 *
 * The universal command surface. Opens with ⌘K / Ctrl-K from
 * anywhere in the workspace.
 *
 * Three result categories:
 *   - navigate: jump to a destination
 *   - action: run a quick action
 *   - ai: ask ORVIX (routed to /ai with prefilled query)
 *
 * Fuzzy search by default; arrow keys navigate, Enter selects,
 * Esc closes.
 */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: "navigate" | "action" | "ai" | "settings";
  href?: string;
  run?: () => void;
  keywords?: string[];
  icon?: React.ReactNode;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

function score(query: string, haystack: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const h = haystack.toLowerCase();
  if (h === q) return 1000;
  if (h.startsWith(q)) return 500;
  const idx = h.indexOf(q);
  if (idx === -1) return 0;
  // Earlier match = better; word boundary bonus.
  const isWordStart = idx === 0 || /\s/.test(h[idx - 1] ?? "");
  return 100 - idx + (isWordStart ? 50 : 0);
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = "Search or ask ORVIX…",
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state on open/close.
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Focus the input after the dialog animates in.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Filter + score.
  const filtered = React.useMemo(() => {
    if (!query.trim()) return items.slice(0, 20);
    const ranked = items
      .map((item) => {
        const haystack = [
          item.label,
          item.description ?? "",
          ...(item.keywords ?? []),
        ].join(" ");
        return { item, score: score(query, haystack) };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((r) => r.item);
    return ranked;
  }, [items, query]);

  // Keep activeIndex in range.
  React.useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, activeIndex]);

  // Scroll active item into view.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-cmd-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const run = React.useCallback(
    (item: CommandItem) => {
      if (item.run) {
        item.run();
      } else if (item.href) {
        router.push(item.href);
      }
      onOpenChange(false);
    },
    [router, onOpenChange],
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) run(item);
    }
  };

  // Group by category for visual hierarchy.
  const groups = React.useMemo(() => {
    const map = new Map<CommandItem["category"], CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  const categoryOrder: CommandItem["category"][] = [
    "navigate",
    "ai",
    "action",
    "settings",
  ];
  const categoryLabels: Record<CommandItem["category"], string> = {
    navigate: "Go to",
    ai: "Ask ORVIX",
    action: "Actions",
    settings: "Settings",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="orvix-command-overlay fixed inset-0 z-modal bg-black/60 backdrop-blur-sm data-[state=open]:animate-[orvix-fade-in_180ms_ease-out]"
        />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className={cn(
            "orvix-command fixed left-1/2 top-[20vh] z-modal w-[min(640px,92vw)] -translate-x-1/2",
            "rounded-lg border border-surface-divider-strong bg-surface-elevated/95 backdrop-blur-glass",
            "shadow-4 overflow-hidden",
            "data-[state=open]:animate-[orvix-cmd-in_220ms_var(--motion-ease-out-quint)]",
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-surface-divider px-4 py-3">
            <Search
              size={16}
              className="text-text-muted shrink-0"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className={cn(
                "flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted",
                "focus:outline-none",
              )}
              autoComplete="off"
              spellCheck={false}
              aria-label="Command search"
            />
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-sm p-1 text-text-muted transition-colors hover:bg-surface-canvas hover:text-text-primary"
            >
              <X size={14} />
            </DialogPrimitive.Close>
          </div>
          <div
            ref={listRef}
            role="listbox"
            className="max-h-[60vh] overflow-y-auto px-2 py-2"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-text-muted">
                No results. Press Enter to ask ORVIX instead.
              </div>
            ) : (
              categoryOrder.map((cat) => {
                const items = groups.get(cat);
                if (!items || items.length === 0) return null;
                return (
                  <div key={cat} className="mb-1">
                    <div className="px-3 py-1.5 text-2xs uppercase tracking-wider text-text-muted">
                      {categoryLabels[cat]}
                    </div>
                    {items.map((item) => {
                      // Compute flat index across categories for activeIndex.
                      const flatIndex = filtered.indexOf(item);
                      const isActive = flatIndex === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-cmd-index={flatIndex}
                          onClick={() => run(item)}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm",
                            "transition-colors duration-fast ease-out-quint",
                            isActive
                              ? "bg-surface-raised text-text-primary"
                              : "text-text-secondary hover:bg-surface-raised",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm",
                              cat === "ai"
                                ? "bg-brand-ai/15 text-brand-ai"
                                : "bg-surface-canvas text-text-muted",
                            )}
                          >
                            {item.icon ??
                              (cat === "ai" ? (
                                <Sparkles size={12} />
                              ) : (
                                <Search size={12} />
                              ))}
                          </span>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.description && (
                            <span className="truncate text-xs text-text-muted">
                              {item.description}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between border-t border-surface-divider bg-surface-canvas/40 px-4 py-2 text-2xs text-text-muted">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Kbd>↑↓</Kbd> navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>↵</Kbd> select
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>esc</Kbd> close
              </span>
            </div>
            <span className="inline-flex items-center gap-1">
              <span className="orvix-ai-dot h-1.5 w-1.5 rounded-full bg-brand-ai" />
              <span>powered by ORVIX AI</span>
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-surface-divider bg-surface-canvas px-1 font-mono text-[10px] text-text-secondary">
      {children}
    </kbd>
  );
}
