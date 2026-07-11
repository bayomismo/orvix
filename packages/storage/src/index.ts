/**
 * @orvix/storage — public entry.
 *
 * Re-exports the Storage interface, the two adapters, and the
 * process-wide storage instance.
 */

export type {
  Storage,
  BlobLike,
  PutOptions,
  GetResult,
  HeadResult,
  SignedUrlOptions,
  SignedUrlResult,
} from "./types";
export { keySchema, validateKey } from "./types";
export { storage } from "./factory";
export { LocalStorageAdapter } from "./local";
export { S3StorageAdapter } from "./s3";
