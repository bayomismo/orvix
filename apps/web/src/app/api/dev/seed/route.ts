import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSession } from "@/server/auth";
import { repository } from "@orvix/db";
import type { WorkItem, WorkItemStatus } from "@orvix/db";

/**
 * POST /api/dev/seed — Phase 0 only.
 *
 * Adds a curated set of sample work items, customers, and activity to
 * the current workspace so screenshots and demo flows have content.
 * Idempotent: if the workspace already has customers/work items, the
 * request is a no-op.
 */

const Body = z.object({}).optional();

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env["ORVIX_ALLOW_DEV_BOOTSTRAP"] !== "1") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  await Body.parseAsync((await req.json().catch(() => ({}))) ?? {});
  const s = await requireSession();
  const w = s.workspace;

  // Don't double-seed.
  const existing = await repository.listWorkItems(w.id);
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, seeded: false, workItems: existing.length });
  }

  const ownerUser = s.user;

  const sample: Array<Omit<WorkItem, "id" | "workspaceId" | "createdAt" | "updatedAt">> = [
    {
      typeKey: "customer",
      title: "Casey Rivera",
      status: "in_progress" as WorkItemStatus,
      priority: "high",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Hot lead from the May product launch. Wants a custom enterprise quote by Friday.",
      customFields: { company: "Northwind Studio", dealValue: 24000, stage: "qualified" },
    },
    {
      typeKey: "customer",
      title: "Jordan Lee",
      status: "in_review" as WorkItemStatus,
      priority: "high",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Mid-market deal. Sent proposal on Tuesday. Awaiting legal review.",
      customFields: { company: "Acme Holdings", dealValue: 78000, stage: "proposal" },
    },
    {
      typeKey: "customer",
      title: "Sam Patel",
      status: "backlog" as WorkItemStatus,
      priority: "normal",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Inbound from the website. Asked for a 14-day trial.",
      customFields: { company: "Pinewood Labs", dealValue: 8500, stage: "lead" },
    },
    {
      typeKey: "task",
      title: "Q3 launch landing page",
      status: "in_progress" as WorkItemStatus,
      priority: "high",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Coordinate with marketing. Hero is done; awaiting final copy from the comms team.",
      customFields: {},
    },
    {
      typeKey: "task",
      title: "Approve the new pricing matrix",
      status: "blocked" as WorkItemStatus,
      priority: "urgent",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Blocker: legal review still pending on the new ToS. Friday deadline.",
      customFields: {},
    },
    {
      typeKey: "task",
      title: "Review Q2 customer interviews",
      status: "in_review" as WorkItemStatus,
      priority: "normal",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "12 interviews recorded. Highlights ready to share with the product team.",
      customFields: {},
    },
    {
      typeKey: "project",
      title: "Onboarding revamp",
      status: "in_progress" as WorkItemStatus,
      priority: "normal",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Goal: cut time-to-first-value from 3 days to 1. Currently in design review.",
      customFields: {},
    },
    {
      typeKey: "conversation",
      title: "Email: Casey — pricing",
      status: "in_progress" as WorkItemStatus,
      priority: "high",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Reply thread awaiting final numbers from the platform team.",
      customFields: {},
    },
    {
      typeKey: "document",
      title: "Q3 product brief",
      status: "done" as WorkItemStatus,
      priority: "normal",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "Approved on 7/9. Shared with all departments.",
      customFields: {},
    },
    {
      typeKey: "request",
      title: "Procurement: vendor onboarding",
      status: "in_progress" as WorkItemStatus,
      priority: "normal",
      ...(ownerUser.id ? { assigneeId: ownerUser.id } : {}),
      createdById: ownerUser.id ?? "system",
      description: "From finance. Need three quotes and a vendor comparison sheet.",
      customFields: {},
    },
  ];

  const ids: string[] = [];
  for (const item of sample) {
    const created = await repository.createWorkItem({
      workspaceId: w.id,
      typeKey: item.typeKey,
      title: item.title,
      status: item.status,
      priority: item.priority,
      createdById: item.createdById,
      ...(item.assigneeId !== undefined ? { assigneeId: item.assigneeId } : {}),
      ...(item.description !== undefined ? { description: item.description } : {}),
      customFields: item.customFields,
    });
    ids.push(created.id);
  }
  // Add a comment + activity to make the detail page richer
  const firstCustomer = (await repository.listWorkItems(w.id)).find(
    (wi) => wi.typeKey === "customer",
  );
  if (firstCustomer) {
    await repository.createComment({
      workspaceId: w.id,
      workItemId: firstCustomer.id,
      authorId: ownerUser.id ?? "automation",
      body: "Sent the proposal on Tuesday. Casey said she'd review with her COO.",
    });
    await repository.createActivity({
      workspaceId: w.id,
      workItemId: firstCustomer.id,
      actorId: ownerUser.id ?? "automation",
      kind: "status_changed",
      payload: { from: "backlog", to: "in_progress" },
    });
  }

  return NextResponse.json({ ok: true, seeded: true, workItems: ids.length });
}
