/**
 * Audit log writer (v0.2 — externally notarized).
 *
 * Every side-effecting Server Action + every AI run MUST call
 * `writeAuditLog(...)` at decision time. The DB role is configured to
 * revoke UPDATE/DELETE on `AuditLog`; the chain rootHash is computed
 * from the previous row by an external batcher in Phase 1.
 *
 * Phase 0 ships the function signature + an in-memory recorder used
 * by tests. Phase 1 wires to the @orvix/db AuditLog table.
 */

import { randomUUID } from "node:crypto";

export interface AuditLogInput {
  workspaceId: string;
  /** Either a user-id or an AI routing profile, never both. */
  actorUserId?: string;
  actorAiRole?: string;
  ip?: string;
  userAgent?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  /** v0.2: idempotency linkage. */
  requestId?: string;
}

export interface AuditLogRecord extends AuditLogInput {
  id: string;
  createdAt: Date;
}

class InMemoryAuditRecorder {
  private readonly rows: AuditLogRecord[] = [];
  /** Mock of the last emitted root hash — Phase 1 wires the real
   * Merkle-style chain to S3 Object Lock. */
  private lastRootHash: string | null = null;

  record(input: AuditLogInput): AuditLogRecord {
    const row: AuditLogRecord = {
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.rows.push(row);
    this.lastRootHash = computeMockChainHash(this.lastRootHash, row);
    return row;
  }

  list(): readonly AuditLogRecord[] {
    return [...this.rows];
  }

  clear(): void {
    this.rows.length = 0;
    this.lastRootHash = null;
  }
}

/** Mock Merkle hash. Phase 1: real chain via SHA-256 in
 * `@orvix/db`. */
function computeMockChainHash(prev: string | null, row: AuditLogRecord): string {
  // Phase 0: simple hash-of-payload, deterministic.
  const payload = JSON.stringify(row);
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  }
  return `${prev ?? ""}|${h.toString(16)}`;
}

const recorder = new InMemoryAuditRecorder();

export function writeAuditLog(input: AuditLogInput): AuditLogRecord {
  return recorder.record(input);
}

export function listAuditLogs(): readonly AuditLogRecord[] {
  return recorder.list();
}

export function clearAuditLogsForTests(): void {
  recorder.clear();
}
