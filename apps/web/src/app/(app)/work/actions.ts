"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { withIdempotency } from "@/server/idempotency";
import { requireSession } from "@/server/auth";
import { repository } from "@orvix/db";
import type {
  WorkItemPriority,
  WorkItemStatus,
  WorkItemTypeKey,
} from "@orvix/db";

/**
 * Work Engine — Server Actions (v0.2 + Milestone 1 production repo).
 *
 * Every side-effecting action requires `clientRequestId` and is wrapped
 * in `withIdempotency`. Tenant scope is bound via the session, never
 * the client.
 */

const VALID_TYPES: WorkItemTypeKey[] = [
  "customer",
  "deal",
  "project",
  "task",
  "conversation",
  "document",
  "request",
];

const VALID_STATUS: WorkItemStatus[] = [
  "backlog",
  "in_progress",
  "blocked",
  "in_review",
  "done",
  "archived",
];

const VALID_PRIORITY: WorkItemPriority[] = ["low", "normal", "high", "urgent"];

export type CreateWorkItemInput = {
  clientRequestId: string;
  typeKey: string;
  title: string;
  description?: string;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assigneeId?: string;
  customFields?: Record<string, unknown>;
};

export type WorkItemResult =
  | { ok: true; workItemId: string }
  | { ok: false; error: string };

export async function createWorkItem(
  input: CreateWorkItemInput,
): Promise<WorkItemResult> {
  const s = await requireSession();

  const title = input.title?.trim();
  if (!title || title.length < 2)
    return { ok: false, error: "Title is too short." };
  if (title.length > 240)
    return { ok: false, error: "Title is too long (max 240)." };
  if (!VALID_TYPES.includes(input.typeKey as WorkItemTypeKey))
    return { ok: false, error: "Unknown work item type." };
  if (input.status && !VALID_STATUS.includes(input.status))
    return { ok: false, error: "Unknown status." };
  if (input.priority && !VALID_PRIORITY.includes(input.priority))
    return { ok: false, error: "Unknown priority." };
  if (input.assigneeId) {
    const u = await repository.getUser(input.assigneeId);
    if (!u || u.workspaceId !== s.workspace.id)
      return { ok: false, error: "Assignee is not in this workspace." };
  }

  const result = await withIdempotency(input.clientRequestId, async () => {
    const w = await repository.createWorkItem({
      workspaceId: s.workspace.id,
      typeKey: input.typeKey,
      title,
      status: input.status ?? "backlog",
      priority: input.priority ?? "normal",
      createdById: s.user.id,
      customFields: input.customFields ?? {},
      ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
      ...(input.description ? { description: input.description } : {}),
    });
    await repository.createActivity({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      actorId: s.user.id,
      kind: "created",
      payload: { title, typeKey: input.typeKey },
    });
    // Fire automations
    const { runAutomations } = await import("@/app/(app)/admin/automations/actions");
    await runAutomations(s.workspace.id, "work_item_created", {
      workItemId: w.id,
      typeKey: w.typeKey,
      priority: w.priority,
      status: w.status,
      title,
    });
    return { workItemId: w.id };
  });

  revalidatePath("/work");
  return { ok: true, workItemId: result.workItemId };
}

export type UpdateWorkItemInput = {
  clientRequestId: string;
  workItemId: string;
  title?: string;
  description?: string;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assigneeId?: string | null;
};

export async function updateWorkItem(
  input: UpdateWorkItemInput,
): Promise<WorkItemResult> {
  const s = await requireSession();
  const w = await repository.getWorkItem(s.workspace.id, input.workItemId);
  if (!w || w.workspaceId !== s.workspace.id)
    return { ok: false, error: "Work item not found." };

  if (input.status && !VALID_STATUS.includes(input.status))
    return { ok: false, error: "Unknown status." };
  if (input.priority && !VALID_PRIORITY.includes(input.priority))
    return { ok: false, error: "Unknown priority." };

  const result = await withIdempotency(input.clientRequestId, async () => {
    const patch: import("@orvix/db").UpdateWorkItemPatch = {};
    if (input.title !== undefined) {
      const t = input.title.trim();
      if (!t || t.length < 2) throw new Error("Title is too short.");
      if (t.length > 240) throw new Error("Title is too long (max 240).");
      patch.title = t;
    }
    if (input.description !== undefined) {
      patch.description = input.description === "" ? null : input.description;
    }
    if (input.status) {
      patch.status = input.status;
    }
    if (input.priority) {
      patch.priority = input.priority;
    }
    if (input.assigneeId !== undefined) {
      if (input.assigneeId === null) {
        // Use the dedicated unassign API; this drops the field cleanly.
        const updated = await repository.unassignWorkItem(s.workspace.id, w.id);
        const { runAutomations } = await import("@/app/(app)/admin/automations/actions");
        await runAutomations(s.workspace.id, "status_changed", {
          workItemId: updated.id,
          typeKey: updated.typeKey,
          priority: updated.priority,
          status: updated.status,
        });
        revalidatePath("/work");
        revalidatePath(`/work/${updated.id}`);
        return { ok: true, workItemId: updated.id };
      } else {
        const u = await repository.getUser(input.assigneeId);
        if (!u || u.workspaceId !== s.workspace.id)
          throw new Error("Assignee is not in this workspace.");
        patch.assigneeId = input.assigneeId;
      }
    }
    const prev = w;
    const updated = await repository.updateWorkItem({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      patch,
    });
    if (input.status && prev.status !== updated.status) {
      await repository.createActivity({
        workspaceId: s.workspace.id,
        workItemId: updated.id,
        actorId: s.user.id,
        kind: "status_changed",
        payload: { from: prev.status, to: updated.status },
      });
    }
    const { runAutomations } = await import("@/app/(app)/admin/automations/actions");
    await runAutomations(s.workspace.id, "status_changed", {
      workItemId: updated.id,
      typeKey: updated.typeKey,
      priority: updated.priority,
      status: updated.status,
    });
    return { workItemId: updated.id };
  });

  revalidatePath("/work");
  revalidatePath(`/work/${w.id}`);
  return { ok: true, workItemId: result.workItemId };
}

export async function deleteWorkItem(
  clientRequestId: string,
  workItemId: string,
): Promise<WorkItemResult> {
  const s = await requireSession();
  const w = await repository.getWorkItem(s.workspace.id, workItemId);
  if (!w || w.workspaceId !== s.workspace.id)
    return { ok: false, error: "Work item not found." };

  const result = await withIdempotency(clientRequestId, async () => {
    await repository.deleteWorkItem(s.workspace.id, workItemId);
    return { workItemId };
  });

  revalidatePath("/work");
  return { ok: true, workItemId: result.workItemId };
}

export type AddCommentInput = {
  clientRequestId: string;
  workItemId: string;
  body: string;
};

export async function addComment(
  input: AddCommentInput,
): Promise<WorkItemResult> {
  const s = await requireSession();
  const w = await repository.getWorkItem(s.workspace.id, input.workItemId);
  if (!w || w.workspaceId !== s.workspace.id)
    return { ok: false, error: "Work item not found." };

  const body = input.body?.trim();
  if (!body) return { ok: false, error: "Comment cannot be empty." };
  if (body.length > 4000)
    return { ok: false, error: "Comment is too long (max 4000)." };

  const result = await withIdempotency(input.clientRequestId, async () => {
    await repository.createComment({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      authorId: s.user.id,
      body,
    });
    await repository.createActivity({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      actorId: s.user.id,
      kind: "commented",
      payload: { length: body.length },
    });
    return { workItemId: w.id };
  });

  revalidatePath(`/work/${w.id}`);
  return { ok: true, workItemId: result.workItemId };
}

export type AddAttachmentInput = {
  clientRequestId: string;
  workItemId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
};

export async function addAttachment(
  input: AddAttachmentInput,
): Promise<WorkItemResult> {
  const s = await requireSession();
  const w = await repository.getWorkItem(s.workspace.id, input.workItemId);
  if (!w || w.workspaceId !== s.workspace.id)
    return { ok: false, error: "Work item not found." };

  if (!input.fileName) return { ok: false, error: "File name required." };
  if (!input.mimeType) return { ok: false, error: "Mime type required." };
  if (input.sizeBytes <= 0)
    return { ok: false, error: "File size must be > 0." };

  const result = await withIdempotency(input.clientRequestId, async () => {
    await repository.createAttachment({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      uploaderId: s.user.id,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
    });
    await repository.createActivity({
      workspaceId: s.workspace.id,
      workItemId: w.id,
      actorId: s.user.id,
      kind: "attachment_added",
      payload: { fileName: input.fileName },
    });
    return { workItemId: w.id };
  });

  revalidatePath(`/work/${w.id}`);
  return { ok: true, workItemId: result.workItemId };
}

export async function setAssignee(
  clientRequestId: string,
  workItemId: string,
  assigneeId: string | null,
): Promise<WorkItemResult> {
  return updateWorkItem({ clientRequestId, workItemId, assigneeId });
}

export async function goToWorkItem(workItemId: string): Promise<never> {
  redirect(`/work/${workItemId}`);
}
