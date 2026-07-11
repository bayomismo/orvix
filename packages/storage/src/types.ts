/**
 * @orvix/storage — Storage interface (Milestone 1).
 *
 * A backend-agnostic interface for putting and getting binary blobs.
 * Two adapters ship out of the box:
 *
 *   - {@link LocalStorageAdapter} (default in dev / test)
 *   - {@link S3StorageAdapter}     (default when S3 env is present)
 *
 * The interface is intentionally narrow: put / get / delete / head /
 * getSignedUrl. Higher-level features (multipart, presigned POSTs,
 * lifecycle rules) are exposed via per-adapter extensions.
 *
 * The `key` parameter is a forward-slash-delimited path. Adapters
 * enforce their own key-naming rules (e.g. S3 buckets disallow `..`
 * segments); key normalization is the caller's responsibility.
 */

import { z } from "zod";

/** A blob the storage layer can put. */
export type BlobLike = Buffer | Uint8Array | string | ReadableStream<Uint8Array>;

export interface PutOptions {
  /** MIME type. Defaults to application/octet-stream. */
  contentType?: string;
  /** Cache-Control header (only relevant for HTTP-serving adapters). */
  cacheControl?: string;
  /** Arbitrary user-defined metadata. */
  metadata?: Record<string, string>;
}

export interface GetResult {
  body: ReadableStream<Uint8Array>;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface HeadResult {
  contentType?: string;
  contentLength?: number;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface SignedUrlOptions {
  /** Seconds the URL is valid. Defaults to 5 minutes. */
  expiresInSeconds?: number;
  /** Override the response Content-Type. */
  contentType?: string;
  /** Override the response Content-Disposition (force download). */
  contentDisposition?: string;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: string;
}

export interface Storage {
  /** Whether the adapter supports signed URLs (S3 / GCS / R2 yes; local no). */
  readonly supportsSignedUrls: boolean;
  /** Stable identifier for the adapter (e.g. "local", "s3", "r2"). */
  readonly kind: string;

  /** Persist a blob. Returns the storage key. */
  put(key: string, body: BlobLike, opts?: PutOptions): Promise<{ key: string; etag?: string }>;
  /** Read a blob. The caller must consume the body stream. */
  get(key: string): Promise<GetResult>;
  /** Check existence / fetch metadata without downloading. */
  head(key: string): Promise<HeadResult | null>;
  /** Delete a blob. Idempotent: returns true if the blob was removed
   * (or never existed), false otherwise. */
  delete(key: string): Promise<boolean>;
  /** Generate a time-limited URL for reading. */
  getSignedUrl(key: string, opts?: SignedUrlOptions): Promise<SignedUrlResult>;
}

// ---------------------------------------------------------------------------
// Common validation
// ---------------------------------------------------------------------------

export const keySchema = z
  .string()
  .min(1)
  .max(512)
  .refine((k) => !k.includes("\0"), { message: "key must not contain NUL" });

export function validateKey(key: string): string {
  const parsed = keySchema.safeParse(key);
  if (!parsed.success) {
    throw new Error(`Invalid storage key: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
  }
  return parsed.data;
}
