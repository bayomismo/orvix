/**
 * @orvix/storage — Local filesystem adapter (Milestone 1).
 *
 * Default for dev / test / preview environments. Persists blobs to a
 * local directory; the signed-URL method returns a `file://` URL that
 * only the Orvix Server Components can read.
 *
 * For production we wire {@link S3StorageAdapter}.
 */

import { promises as fs } from "node:fs";
import { createReadStream, type ReadStream } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { Readable } from "node:stream";

import type {
  Storage,
  BlobLike,
  PutOptions,
  GetResult,
  HeadResult,
  SignedUrlOptions,
  SignedUrlResult,
} from "./types";
import { validateKey } from "./types";

export interface LocalStorageOptions {
  /** Absolute path to the root directory. Defaults to `$TMPDIR/orvix-storage/`. */
  root: string;
  /** Whether to allow `getSignedUrl` to emit `file://` URLs (no). Default false. */
  allowFileUrl?: boolean;
}

function toBuffer(body: BlobLike): Buffer {
  if (typeof body === "string") return Buffer.from(body, "utf-8");
  if (body instanceof Buffer) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  throw new Error("LocalStorageAdapter does not accept ReadableStream; pass Buffer / string / Uint8Array");
}

export class LocalStorageAdapter implements Storage {
  readonly kind = "local";
  readonly supportsSignedUrls = false;

  constructor(private readonly opts: LocalStorageOptions) {}

  private rootFor(key: string): string {
    return join(this.opts.root, key);
  }

  async put(key: string, body: BlobLike, options?: PutOptions): Promise<{ key: string; etag?: string }> {
    const k = validateKey(key);
    const fullPath = this.rootFor(k);
    if (!fullPath.startsWith(resolve(this.opts.root) + sep) && fullPath !== resolve(this.opts.root)) {
      throw new Error("Refusing to write outside storage root");
    }
    await fs.mkdir(dirname(fullPath), { recursive: true });
    const buf = toBuffer(body);
    await fs.writeFile(fullPath, buf);
    const meta: { contentType?: string; metadata?: Record<string, string> } = {};
    if (options?.contentType) meta.contentType = options.contentType;
    if (options?.metadata) meta.metadata = options.metadata;
    await fs.writeFile(
      fullPath + ".meta.json",
      JSON.stringify(meta, null, 0),
      "utf-8",
    ).catch(() => undefined);
    const etag = `"${buf.length.toString(16)}"`;
    return { key: k, etag };
  }

  async get(key: string): Promise<GetResult> {
    const k = validateKey(key);
    const fullPath = this.rootFor(k);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (!stat) throw new Error(`Not found: ${k}`);
    const meta = await readMeta(fullPath);
    const nodeStream: ReadStream = createReadStream(fullPath);
    const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
    return {
      body,
      contentLength: stat.size,
      ...(meta?.contentType ? { contentType: meta.contentType } : {}),
      ...(meta?.metadata ? { metadata: meta.metadata } : {}),
    };
  }

  async head(key: string): Promise<HeadResult | null> {
    const k = validateKey(key);
    const fullPath = this.rootFor(k);
    const stat = await fs.stat(fullPath).catch(() => null);
    if (!stat) return null;
    const meta = await readMeta(fullPath);
    return {
      contentLength: stat.size,
      ...(meta?.contentType ? { contentType: meta.contentType } : {}),
      ...(meta?.metadata ? { metadata: meta.metadata } : {}),
    };
  }

  async delete(key: string): Promise<boolean> {
    const k = validateKey(key);
    const fullPath = this.rootFor(k);
    try {
      await fs.unlink(fullPath);
      await fs.unlink(fullPath + ".meta.json").catch(() => undefined);
      return true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return true;
      return false;
    }
  }

  async getSignedUrl(key: string, opts?: SignedUrlOptions): Promise<SignedUrlResult> {
    if (!this.opts.allowFileUrl) {
      throw new Error(
        "LocalStorageAdapter cannot issue signed URLs. Use S3StorageAdapter, or set allowFileUrl: true.",
      );
    }
    const k = validateKey(key);
    const expiresIn = opts?.expiresInSeconds ?? 300;
    return {
      url: `file://${this.rootFor(k)}`,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}

async function readMeta(fullPath: string): Promise<{ contentType?: string; metadata?: Record<string, string> } | null> {
  try {
    const text = await fs.readFile(fullPath + ".meta.json", "utf-8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}
