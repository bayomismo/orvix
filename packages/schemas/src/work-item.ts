/**
 * Work Item schemas — v0.2 polymorphic engine.
 *
 * 7 built-in types are recognized. Custom types are workspace-defined at
 * runtime via `WorkItemType` rows; their `customFields` are validated
 * against the type's compiled Zod schema (see `compiledCustomFieldSchemaFor`).
 *
 * Note on ids: the polymorphic engine stores `work_items.id` as a UUIDv7.
 * The `displayId` is human-readable (e.g., "WS-1042") and unique per workspace.
 */

import { z } from "zod";

/** Canonical list of the 7 v0.2 built-in Work Item types.
 * Adding a built-in type requires schema + DB migration; do not extend
 * this enum casually. */
export const BUILT_IN_WORK_ITEM_TYPES = [
  "customer",
  "deal",
  "project",
  "task",
  "conversation",
  "document",
  "request",
] as const;

export type BuiltInWorkItemType = (typeof BUILT_IN_WORK_ITEM_TYPES)[number];

/** Any Work Item type key, built-in or custom. */
export const workItemTypeKeySchema = z.string().min(1).max(64);

/** Work Item priority. Custom priorities are not allowed at v1. */
export const workItemPrioritySchema = z.enum(["p0", "p1", "p2", "p3"]);

/** A polymorphic Work Item. Stored shape depends on `typeKey`. */
export const workItemCoreSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  typeId: z.string().uuid(),
  typeKey: workItemTypeKeySchema,
  displayId: z.string().min(1).max(64),
  title: z.string().min(1).max(280),
  summary: z.string().max(2_000).nullable().optional(),
  status: z.string().min(1).max(64),
  priority: workItemPrioritySchema.nullable().optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  ownerAiRole: z
    .enum(["ceo", "sales", "support", "finance", "hr", "operations", "marketing", "legal"])
    .nullable()
    .optional(),
  parentId: z.string().uuid().nullable().optional(),
  source: z.string().max(120).nullable().optional(),
  properties: z.record(z.unknown()).default({}),
  customFields: z.record(z.unknown()).default({}),
  permissions: z.record(z.unknown()).default({}),
  aiSummary: z.string().nullable().optional(),
  aiSuggestion: z.record(z.unknown()).nullable().optional(),
  smartProperties: z.record(z.unknown()).default({}),
  createdByUserId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type WorkItemCore = z.infer<typeof workItemCoreSchema>;

/** Generic create input. Type-specific fields are validated by the type
 * schema. */
export const workItemCreateInputSchema = z.object({
  typeKey: workItemTypeKeySchema,
  title: z.string().min(1).max(280),
  status: z.string().min(1).max(64),
  priority: workItemPrioritySchema.optional(),
  ownerUserId: z.string().uuid().optional(),
  ownerAiRole: z
    .enum(["ceo", "sales", "support", "finance", "hr", "operations", "marketing", "legal"])
    .optional(),
  parentId: z.string().uuid().optional(),
  customFields: z.record(z.unknown()).default({}),
  properties: z.record(z.unknown()).default({}),
  /** Optional clientRequestId (v0.2 idempotency). */
  clientRequestId: z.string().uuid().optional(),
});

export type WorkItemCreateInput = z.infer<typeof workItemCreateInputSchema>;

/** Per-built-in-type extension-table schemas. These are indexable fields
 * kept out of JSONB so they can be filtered + sorted efficiently.
 * Custom types have no extension table by design. */

export const customerExtensionSchema = z.object({
  legalName: z.string().min(1).max(280),
  domain: z.string().max(280).optional(),
  arrUSD: z.number().nonnegative().optional(),
  stage: z.string().max(64).optional(),
  industry: z.string().max(120).optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  source: z.string().max(64).optional(),
  enrichedAt: z.date().optional(),
});
export type CustomerExtension = z.infer<typeof customerExtensionSchema>;

export const dealExtensionSchema = z.object({
  amountUSD: z.number().nonnegative().optional(),
  stage: z.string().max(64).optional(),
  probability: z.number().min(0).max(1).optional(),
  closedAt: z.date().optional(),
});
export type DealExtension = z.infer<typeof dealExtensionSchema>;

export const projectExtensionSchema = z.object({
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  budgetUSD: z.number().nonnegative().optional(),
  health: z.enum(["on_track", "at_risk", "off_track"]).optional(),
});
export type ProjectExtension = z.infer<typeof projectExtensionSchema>;

export const taskExtensionSchema = z.object({
  dueDate: z.date().optional(),
  estimateMin: z.number().int().nonnegative().optional(),
  blockedBy: z.array(z.string().uuid()).default([]),
});
export type TaskExtension = z.infer<typeof taskExtensionSchema>;

export const conversationExtensionSchema = z.object({
  channel: z.enum(["email", "meeting", "phone", "chat", "other"]).optional(),
  subject: z.string().max(280).optional(),
  participants: z.array(z.string().uuid()).default([]),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
});
export type ConversationExtension = z.infer<typeof conversationExtensionSchema>;

export const documentExtensionSchema = z.object({
  state: z.enum(["draft", "sent", "signed", "archived"]).optional(),
  expiresAt: z.date().optional(),
});
export type DocumentExtension = z.infer<typeof documentExtensionSchema>;

export const requestExtensionSchema = z.object({
  category: z.enum(["ticket", "approval", "vacation", "bug", "feature_request", "other"]).optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  assignedUserId: z.string().uuid().optional(),
});
export type RequestExtension = z.infer<typeof requestExtensionSchema>;

/** Resolver for which extension schema applies to which built-in type. */
export const extensionForType = (typeKey: string) => {
  switch (typeKey) {
    case "customer":
      return customerExtensionSchema;
    case "deal":
      return dealExtensionSchema;
    case "project":
      return projectExtensionSchema;
    case "task":
      return taskExtensionSchema;
    case "conversation":
      return conversationExtensionSchema;
    case "document":
      return documentExtensionSchema;
    case "request":
      return requestExtensionSchema;
    default:
      return null;
  }
};

/** Relations. A `parent_of` cycle would be rejected at the DB level by
 * the `orvix_assert_no_parent_of_cycle` trigger. */
export const workItemRelationSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  relation: z.enum(["blocks", "duplicates", "relates_to", "parent_of"]),
});

export const workItemRelationCreateInput = workItemRelationSchema.refine(
  (v) => v.sourceId !== v.targetId,
  { message: "A relation cannot link a Work Item to itself." },
);

export type WorkItemRelationCreateInput = z.infer<typeof workItemRelationCreateInput>;

/** Custom Work Item type definition. Phase 0 keeps this minimal; the
 * typed-form UI surface lands in M1. */
export const workItemTypeDefinitionSchema = z.object({
  key: z.string().min(1).max(64).regex(/^[a-z][a-z0-9_]*$/, {
    message: "Type keys must be lowercase identifiers (a-z, 0-9, _)",
  }),
  name: z.string().min(1).max(120),
  icon: z.string().max(64).optional(),
  /** JSON Schema (draft 2020-12) describing customFields validation. */
  customFieldSchema: z.record(z.unknown()).default({}),
});
export type WorkItemTypeDefinition = z.infer<typeof workItemTypeDefinitionSchema>;
