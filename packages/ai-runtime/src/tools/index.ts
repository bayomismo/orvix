/**
 * AI Assistant — Tool registry (v0.2).
 *
 * Tools are typed functions exposed to the planner. Phase 0 ships the
 * registry shape and a small set of no-op tool stubs that the runtime
 * can exercise. Phase 1 implements each tool's body against the
 * appropriate feature module's Server Actions.
 *
 * Tools are bound to a routing profile (role) by `ai_routing_profiles.
 * toolAllowList`. The runtime rejects any tool call whose name is not
 * on the active profile's list.
 */

import { z } from "zod";

export interface ToolContext {
  workspaceId: string;
  userId?: string;
  aiAssistantId: string;
  routingProfile: string;
  clientRequestId?: string;
}

// ToolDefinition's TArgs is a generic Zod schema type. To allow
// `register` to accept concrete ZodObject schemas as well as
// `ZodTypeAny` fallbacks, we use a wide generic with `any` for the
// schema's inferred args. The runtime contract — `input.parse(args)`
// at the call site — is what enforces type safety.
export interface ToolDefinition<TOut = unknown> {
  /** Tool name; unique within the registry. */
  name: string;
  /** Human-readable description. */
  description: string;
  /** Routing profiles allowed to use this tool. Empty = not bound. */
  allowList: readonly string[];
  /** Zod schema for arguments. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: z.ZodType<any, any, any>;
  /** The implementation. Pure: returns the result. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call: (args: any, ctx: ToolContext) => Promise<TOut>;
}

export class ToolRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private byName = new Map<string, ToolDefinition<any>>();

  register(def: ToolDefinition): void {
    if (this.byName.has(def.name)) {
      throw new Error(`Tool "${def.name}" already registered`);
    }
    this.byName.set(def.name, def);
  }

  get(name: string): ToolDefinition | undefined {
    return this.byName.get(name);
  }

  list(): readonly string[] {
    return [...this.byName.keys()];
  }

  /**
   * Throws if the calling profile isn't allowed to use `name`. Used by
   * the runtime before invoking a tool.
   */
  assertAuthorized(name: string, routingProfile: string): void {
    const def = this.byName.get(name);
    if (!def) {
      throw new Error(`Unknown tool: ${name}`);
    }
    if (def.allowList.length === 0) {
      throw new Error(`Tool "${name}" is not bound to any routing profile.`);
    }
    if (!def.allowList.includes(routingProfile)) {
      throw new Error(
        `Routing profile "${routingProfile}" is not authorized to call tool "${name}".`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Phase 0 tool stubs. These are no-op implementations that validate the
// runtime contract. Phase 1 wires each to a feature Server Action.
// ---------------------------------------------------------------------------

export const searchWorkItemsTool: ToolDefinition = {
  name: "search.work_items",
  description: "Search Work Items by full-text query, scoped to the workspace.",
  allowList: ["sales", "support", "finance", "hr", "operations", "marketing", "legal"],
  input: z.object({
    q: z.string().min(1).max(280),
    types: z.array(z.string().max(64)).optional(),
  }),
  call: async () => {
    // Phase 0 stub. Phase 1 wires to @orvix/db search via a Server Action.
    return { items: [] };
  },
};

export const lookupCustomerTool: ToolDefinition = {
  name: "lookup.customer",
  description: "Look up a Customer by id (workspace-scoped).",
  allowList: ["sales", "support", "finance", "operations", "legal"],
  input: z.object({ id: z.string().uuid() }),
  call: async () => {
    return { customer: null };
  },
};

export const createWorkItemTool: ToolDefinition = {
  name: "create.work_item",
  description: "Create a Work Item. v0.2: requires clientRequestId for idempotency.",
  allowList: ["sales", "support", "finance", "hr", "operations", "marketing", "legal"],
  input: z.object({
    typeKey: z.string().min(1).max(64),
    title: z.string().min(1).max(280),
    status: z.string().min(1).max(64),
    clientRequestId: z.string().uuid(),
  }),
  call: async () => {
    return { ok: true, id: null };
  },
};

export const summarizeWorkItemTool: ToolDefinition = {
  name: "summarize.work_item",
  description: "Generate a one-paragraph summary of a Work Item.",
  allowList: [
    "ceo",
    "sales",
    "support",
    "finance",
    "hr",
    "operations",
    "marketing",
    "legal",
  ],
  input: z.object({ id: z.string().uuid() }),
  call: async () => {
    return { summary: "" };
  },
};

/** Default registry with the v0.2 tool stubs. */
export function defaultToolRegistry(): ToolRegistry {
  const r = new ToolRegistry();
  r.register(searchWorkItemsTool);
  r.register(lookupCustomerTool);
  r.register(createWorkItemTool);
  r.register(summarizeWorkItemTool);
  return r;
}
