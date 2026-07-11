"use server";

import { revalidatePath } from "next/cache";

import { withIdempotency } from "@/server/idempotency";
import { requireSession } from "@/server/auth";
import { db, type WorkItem } from "@/server/store";

import { STAGES, statusForStage, type Stage } from "./stages";

/**
 * Customers pipeline — Server Actions.
 *
 * v0.2: every customer IS a work item with typeKey="customer" + a
 * stage custom field. Stages map to status:
 *   lead      → backlog
 *   qualified → in_progress
 *   proposal  → in_review
 *   won       → done
 *   lost      → archived
 */

export async function createCustomer(
  clientRequestId: string,
  input: { name: string; company?: string; dealValue?: number; stage?: Stage },
): Promise<{ ok: true; workItemId: string } | { ok: false; error: string }> {
  const s = await requireSession();
  const name = input.name?.trim();
  if (!name || name.length < 2) return { ok: false, error: "Name is too short." };
  const stage = (input.stage ?? "lead") as Stage;
  if (!STAGES.includes(stage)) return { ok: false, error: "Unknown stage." };
  const status = statusForStage(stage);

  const id = cuid();
  const now = new Date().toISOString();
  const result = await withIdempotency(clientRequestId, async () => {
    const w: WorkItem = {
      id,
      workspaceId: s.workspace.id,
      typeKey: "customer",
      title: name,
      status,
      priority: "normal",
      createdById: s.user.id,
      customFields: {
        ...(input.company ? { company: input.company } : {}),
        ...(input.dealValue !== undefined ? { dealValue: input.dealValue } : {}),
        stage,
      },
      createdAt: now,
      updatedAt: now,
    };
    db.workItems.set(id, w);
    db.activities.set(cuid(), {
      id: cuid(),
      workspaceId: s.workspace.id,
      workItemId: id,
      actorId: s.user.id,
      kind: "created",
      payload: { title: name, typeKey: "customer" },
      createdAt: now,
    });
    const { runAutomations } = await import("@/app/(app)/admin/automations/actions");
    await runAutomations(s.workspace.id, "work_item_created", {
      workItemId: id,
      typeKey: "customer",
      priority: w.priority,
      status: w.status,
      title: name,
    });
    return { workItemId: id };
  });
  revalidatePath("/customers");
  return { ok: true, workItemId: result.workItemId };
}

export async function moveCustomerStage(
  clientRequestId: string,
  workItemId: string,
  stage: Stage,
): Promise<{ ok: boolean; error?: string }> {
  const s = await requireSession();
  const w = db.workItems.get(workItemId);
  if (!w || w.workspaceId !== s.workspace.id || w.typeKey !== "customer") {
    return { ok: false, error: "Customer not found." };
  }
  if (!STAGES.includes(stage)) return { ok: false, error: "Unknown stage." };
  const newStatus = statusForStage(stage);
  const result = await withIdempotency(clientRequestId, async () => {
    if (w.status !== newStatus) {
      db.activities.set(cuid(), {
        id: cuid(),
        workspaceId: s.workspace.id,
        workItemId: w.id,
        actorId: s.user.id,
        kind: "status_changed",
        payload: { from: w.status, to: newStatus },
        createdAt: new Date().toISOString(),
      });
      w.status = newStatus;
    }
    w.customFields = { ...(w.customFields ?? {}), stage };
    w.updatedAt = new Date().toISOString();
    return { ok: true };
  });
  revalidatePath("/customers");
  return result;
}

function cuid(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
