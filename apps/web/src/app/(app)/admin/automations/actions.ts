"use server";

import { revalidatePath } from "next/cache";

import { withIdempotency } from "@/server/idempotency";
import { requireSession } from "@/server/auth";
import { db } from "@/server/store";

/**
 * Automations — Server Actions.
 *
 * v0.2: a small set of trigger → condition → action rules. The
 * runtime is a simple, deterministic executor. Phase 1 wires more
 * trigger types and conditions.
 *
 * A rule shape:
 *   {
 *     name: string
 *     trigger: "work_item_created" | "status_changed" | "schedule:daily" | "ai_run_completed"
 *     condition?: { kind: "equals", field: string, value: string | number }
 *     action: { kind: "set_status" | "add_comment" | "ai_summarize" | "send_to_inbox",
 *               payload: Record<string, unknown> }
 *     enabled: boolean
 *   }
 *
 * Execution: when the trigger fires, the rule runs synchronously in
 * the same request. Errors are logged to the activity stream.
 */

const VALID_TRIGGERS = [
  "work_item_created",
  "status_changed",
  "schedule:daily",
  "ai_run_completed",
] as const;
const VALID_ACTION_KINDS = [
  "set_status",
  "add_comment",
  "ai_summarize",
  "send_to_inbox",
] as const;

export type AutomationTrigger = (typeof VALID_TRIGGERS)[number];
export type AutomationActionKind = (typeof VALID_ACTION_KINDS)[number];

export type Automation = {
  id: string;
  workspaceId: string;
  name: string;
  trigger: AutomationTrigger;
  condition?: { kind: "equals"; field: string; value: string | number };
  action: { kind: AutomationActionKind; payload: Record<string, unknown> };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  /** How many times this rule has fired. */
  runs: number;
  /** Last run timestamp. */
  lastRunAt?: string;
};

export async function listAutomations(): Promise<Automation[]> {
  const s = await requireSession();
  return [...db.automations.values()].filter((a) => a.workspaceId === s.workspace.id);
}

export async function createAutomation(
  clientRequestId: string,
  input: {
    name: string;
    trigger: AutomationTrigger;
    action: { kind: AutomationActionKind; payload?: Record<string, unknown> };
    condition?: Automation["condition"];
  },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const s = await requireSession();
  const name = input.name?.trim();
  if (!name || name.length < 2) return { ok: false, error: "Name is too short." };
  if (!VALID_TRIGGERS.includes(input.trigger))
    return { ok: false, error: "Unknown trigger." };
  if (!VALID_ACTION_KINDS.includes(input.action.kind))
    return { ok: false, error: "Unknown action." };

  const id = cuid();
  const now = new Date().toISOString();
  const result = await withIdempotency(clientRequestId, async () => {
    const rule: Automation = {
      id,
      workspaceId: s.workspace.id,
      name,
      trigger: input.trigger,
      ...(input.condition ? { condition: input.condition } : {}),
      action: { kind: input.action.kind, payload: input.action.payload ?? {} },
      enabled: true,
      createdAt: now,
      updatedAt: now,
      runs: 0,
    };
    db.automations.set(id, rule);
    return { id };
  });
  revalidatePath("/admin/automations");
  return { ok: true, id: result.id };
}

export async function toggleAutomation(
  clientRequestId: string,
  id: string,
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const s = await requireSession();
  const r = db.automations.get(id);
  if (!r || r.workspaceId !== s.workspace.id)
    return { ok: false, error: "Automation not found." };
  return withIdempotency(clientRequestId, async () => {
    r.enabled = enabled;
    r.updatedAt = new Date().toISOString();
    return { ok: true };
  });
}

export async function deleteAutomation(
  clientRequestId: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const s = await requireSession();
  const r = db.automations.get(id);
  if (!r || r.workspaceId !== s.workspace.id)
    return { ok: false, error: "Automation not found." };
  return withIdempotency(clientRequestId, async () => {
    db.automations.delete(id);
    return { ok: true };
  });
}

/**
 * runAutomations — internal: called from Server Actions (e.g.
 * createWorkItem) when a relevant trigger fires. Walks every
 * enabled rule in the workspace whose trigger matches.
 */
export async function runAutomations(
  workspaceId: string,
  trigger: AutomationTrigger,
  ctx: Record<string, unknown>,
): Promise<void> {
  const rules = [...db.automations.values()].filter(
    (r) => r.workspaceId === workspaceId && r.enabled && r.trigger === trigger,
  );
  for (const r of rules) {
    // Check condition
    if (r.condition) {
      const fieldVal = ctx[r.condition.field];
      if (fieldVal !== r.condition.value) continue;
    }
    try {
      await executeAction(workspaceId, r.action, ctx);
      r.runs += 1;
      r.lastRunAt = new Date().toISOString();
    } catch (e) {
      // Log to activity
      db.activities.set(cuid(), {
        id: cuid(),
        workspaceId,
        workItemId: (ctx["workItemId"] as string) ?? "none",
        actorId: "automation",
        kind: "automation_failed",
        payload: { ruleId: r.id, error: String(e) },
        createdAt: new Date().toISOString(),
      });
    }
  }
}

async function executeAction(
  workspaceId: string,
  action: { kind: AutomationActionKind; payload: Record<string, unknown> },
  ctx: Record<string, unknown>,
): Promise<void> {
  if (action.kind === "set_status") {
    const w = db.workItems.get(ctx["workItemId"] as string);
    if (!w) return;
    w.status = String(action.payload["status"] ?? w.status) as typeof w.status;
    w.updatedAt = new Date().toISOString();
  } else if (action.kind === "add_comment") {
    const w = db.workItems.get(ctx["workItemId"] as string);
    if (!w) return;
    db.comments.set(cuid(), {
      id: cuid(),
      workspaceId,
      workItemId: w.id,
      authorId: "automation",
      body: String(action.payload["body"] ?? "(automated)"),
      createdAt: new Date().toISOString(),
    });
  } else if (action.kind === "send_to_inbox") {
    db.inbox.set(cuid(), {
      id: cuid(),
      workspaceId,
      surface: "automations",
      title: String(action.payload["title"] ?? "Automation fired"),
      ...(action.payload["body"] ? { body: String(action.payload["body"]) } : {}),
      href: (action.payload["href"] as string) ?? "/inbox",
      createdAt: new Date().toISOString(),
      read: false,
    });
  } else if (action.kind === "ai_summarize") {
    // The real AI run is async and a network call; for Phase 0 we
    // record an intent into the AI runs stream so the user can see
    // the rule fired and trigger the real run from the AI surface.
    db.aiRuns.set(cuid(), {
      id: cuid(),
      workspaceId,
      routingProfile: "general",
      kind: "summary",
      decision: "queue_for_approval",
      rationale: `Automation requested: ${action.payload["prompt"] ?? "summarize"}.`,
      createdAt: new Date().toISOString(),
    });
  }
}

function cuid(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
