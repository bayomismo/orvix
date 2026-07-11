/**
 * @orvix/storage — Storage factory (Milestone 1).
 *
 * Picks the right {@link Storage} backend based on the environment.
 *
 *   - `ORVIX_S3_BUCKET` set → {@link S3StorageAdapter}
 *   - Otherwise → {@link LocalStorageAdapter} (default; safe for dev,
 *     test, preview)
 *
 * The decision is cached on `globalThis` so HMR does not re-evaluate.
 */

import type { Storage } from "./types";
import { LocalStorageAdapter, type LocalStorageOptions } from "./local";
import { S3StorageAdapter, type S3StorageOptions } from "./s3";

declare global {
  // eslint-disable-next-line no-var
  var __orvixStorage: Storage | undefined;
}

function build(): Storage {
  const s3Bucket = process.env["ORVIX_S3_BUCKET"];
  if (s3Bucket) {
    const endpoint = process.env["ORVIX_S3_ENDPOINT"];
    const region = process.env["ORVIX_S3_REGION"];
    const accessKeyId = process.env["ORVIX_S3_ACCESS_KEY_ID"];
    const secretAccessKey = process.env["ORVIX_S3_SECRET_ACCESS_KEY"];
    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "ORVIX_S3_BUCKET is set but one of ORVIX_S3_{ENDPOINT,REGION,ACCESS_KEY_ID,SECRET_ACCESS_KEY} is missing",
      );
    }
    const opts: S3StorageOptions = {
      endpoint,
      bucket: s3Bucket,
      region,
      accessKeyId,
      secretAccessKey,
      ...(process.env["ORVIX_S3_FORCE_PATH_STYLE"] === "1" ? { forcePathStyle: true } : {}),
    };
    return new S3StorageAdapter(opts);
  }
  const root =
    process.env["ORVIX_STORAGE_ROOT"] ??
    `/tmp/orvix-storage-${process.env["NODE_ENV"] ?? "dev"}`;
  const opts: LocalStorageOptions = { root };
  return new LocalStorageAdapter(opts);
}

export const storage: Storage = globalThis.__orvixStorage ?? build();
if (!globalThis.__orvixStorage) {
  globalThis.__orvixStorage = storage;
}
