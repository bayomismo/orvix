/**
 * AI Assistant — Memory (v0.2).
 *
 * Three layers:
 *   - short_term  (per session / per work item, TTL bound)
 *   - long_term   (per workspace / per user / per work item, persistent)
 *   - organizational (cross-tenant, opt-in only)
 *
 * v0.2 governance: workspace-level UI is read-only browse. Delete
 * happens via Admin AI Memory Actions. Edit is v1.x.
 *
 * This file is the *contract*; the actual persistence implementation
 * lands in Phase 1 with @orvix/db and pgvector.
 */

import { aiMemoryEntrySchema, type AIMemoryEntry } from "@orvix/schemas";
import type { z } from "zod";

export type MemoryLayer = "short_term" | "long_term" | "organizational";
export type MemoryScope =
  | `work_item:${string}`
  | `user:${string}`
  | "workspace"
  | (string & {});

export interface MemoryStore {
  list(args: {
    workspaceId: string;
    aiAssistantId: string;
    layer?: MemoryLayer;
    scope?: MemoryScope;
  }): Promise<readonly MemoryRecord[]>;

  /** v0.2: governance is read-only at the workspace UI layer.
   * The runtime writes here, but the workspace UI does not. */
  put(args: {
    workspaceId: string;
    aiAssistantId: string;
    layer: MemoryLayer;
    scope: MemoryScope;
    key: string;
    value: unknown;
    ttlSeconds?: number;
  }): Promise<MemoryRecord>;

  /** Admin / Owner can request deletion. */
  forget(args: {
    workspaceId: string;
    aiAssistantId: string;
    scope: MemoryScope;
    key: string;
  }): Promise<{ deleted: number }>;
}

export interface MemoryRecord extends z.infer<typeof aiMemoryEntrySchema> {
  id: string;
  workspaceId: string;
  createdAt: Date;
}

/**
 * Phase 0 in-memory implementation, used for tests and as the runtime's
 * default when persistence isn't yet wired. The real implementation
 * lives in @orvix/db (AIMemoryEntry + pgvector) in Phase 1.
 */
export class InMemoryMemoryStore implements MemoryStore {
  private rows = new Map<string, MemoryRecord>();

  private key(args: {
    aiAssistantId: string;
    scope: MemoryScope;
    key: string;
  }): string {
    return `${args.aiAssistantId}:${args.scope}:${args.key}`;
  }

  async list(args: {
    workspaceId: string;
    aiAssistantId: string;
    layer?: MemoryLayer;
    scope?: MemoryScope;
  }): Promise<readonly MemoryRecord[]> {
    return [...this.rows.values()].filter((r) => {
      if (r.workspaceId !== undefined && r.workspaceId !== args.workspaceId) {
        return false;
      }
      if (r.layer !== args.layer) return false;
      if (args.scope && r.scope !== args.scope) return false;
      return true;
    });
  }

  async put(args: {
    workspaceId: string;
    aiAssistantId: string;
    layer: MemoryLayer;
    scope: MemoryScope;
    key: string;
    value: unknown;
    ttlSeconds?: number;
  }): Promise<MemoryRecord> {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: AIMemoryEntry = {
      layer: args.layer,
      scope: args.scope,
      key: args.key,
      value: args.value,
      ...(args.ttlSeconds !== undefined && { ttlSeconds: args.ttlSeconds }),
    };
    const record: MemoryRecord = {
      id,
      workspaceId: args.workspaceId,
      ...entry,
      createdAt: new Date(),
    };
    this.rows.set(
      this.key({ aiAssistantId: args.aiAssistantId, scope: args.scope, key: args.key }),
      record,
    );
    return record;
  }

  async forget(args: {
    workspaceId: string;
    aiAssistantId: string;
    scope: MemoryScope;
    key: string;
  }): Promise<{ deleted: number }> {
    const k = this.key({ aiAssistantId: args.aiAssistantId, scope: args.scope, key: args.key });
    const had = this.rows.has(k);
    if (had) this.rows.delete(k);
    return { deleted: had ? 1 : 0 };
  }
}
