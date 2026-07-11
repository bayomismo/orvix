/**
 * @orvix/storage — S3-compatible adapter (Milestone 1).
 *
 * Implements the {@link Storage} interface against any S3-compatible
 * endpoint. We deliberately avoid pulling in the AWS SDK (it's a
 * multi-megabyte dependency); this adapter talks to S3 via the
 * REST API directly using the runtime's `fetch`. The v5 runtime
 * provides `fetch` with full streaming support.
 *
 * Config (env):
 *   - `ORVIX_S3_ENDPOINT`        — e.g. `https://s3.amazonaws.com`
 *   - `ORVIX_S3_BUCKET`          — e.g. `orvix-prod`
 *   - `ORVIX_S3_REGION`          — e.g. `us-east-1`
 *   - `ORVIX_S3_ACCESS_KEY_ID`
 *   - `ORVIX_S3_SECRET_ACCESS_KEY`
 *   - `ORVIX_S3_FORCE_PATH_STYLE` — `1` for MinIO / R2
 *
 * Signed URLs use AWS Signature V4. The implementation is
 * deliberately tight: only the verbs we use (PUT, GET, DELETE, HEAD).
 */

import { createHash, createHmac } from "node:crypto";

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

export interface S3StorageOptions {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Path-style addressing for MinIO / R2 / LocalStack. */
  forcePathStyle?: boolean;
  /** Override for tests; defaults to process.env["FETCH"] || globalThis.fetch. */
  fetchImpl?: typeof fetch;
}

function toUint8(body: BlobLike): Uint8Array {
  if (typeof body === "string") return new TextEncoder().encode(body);
  if (body instanceof Uint8Array) return body;
  if (body instanceof Buffer) return new Uint8Array(body);
  throw new Error("S3StorageAdapter does not accept ReadableStream; pass Buffer / string / Uint8Array");
}

function toAmzDate(d: Date): string {
  return d.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function hash(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function trim(s: string): string {
  return s.replace(/^\/+/, "");
}

function percentEncode(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

export class S3StorageAdapter implements Storage {
  readonly kind = "s3";
  readonly supportsSignedUrls = true;

  private readonly fetchImpl: typeof fetch;

  constructor(private readonly opts: S3StorageOptions) {
    this.fetchImpl = opts.fetchImpl ?? (globalThis as { fetch?: typeof fetch }).fetch ?? fetch;
  }

  private endpointFor(key: string): string {
    const ep = trim(this.opts.endpoint);
    const enc = percentEncode(key);
    if (this.opts.forcePathStyle) {
      return `${ep}/${this.opts.bucket}/${enc}`;
    }
    return `${ep.replace("://", `://${this.opts.bucket}.`)}/${enc}`;
  }

  // -----------------------------------------------------------------------
  // Sign an S3 request using Signature V4.
  // -----------------------------------------------------------------------
  private signRequest(args: {
    method: string;
    key: string;
    headers: Record<string, string>;
    bodyHash: string;
  }): { url: string; headers: Record<string, string> } {
    const now = new Date();
    const amzDate = toAmzDate(now);
    const dateStamp = amzDate.slice(0, 8);

    const hostHeader = this.opts.forcePathStyle
      ? new URL(this.opts.endpoint).host
      : `${this.opts.bucket}.${new URL(this.opts.endpoint).host}`;

    const canonicalHeaders = Object.entries(args.headers)
      .map(([k, v]) => [k.toLowerCase(), v.trim()] as const)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${k}:${v}\n`)
      .join("");

    const signedHeaders = Object.keys(args.headers)
      .map((k) => k.toLowerCase())
      .sort()
      .join(";");

    const canonicalRequest = [
      args.method,
      `/${this.opts.bucket}/${percentEncode(args.key)}`,
      "",
      canonicalHeaders,
      signedHeaders,
      args.bodyHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.opts.region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      hash(canonicalRequest),
    ].join("\n");

    const kDate = hmac(`AWS4${this.opts.secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, this.opts.region);
    const kService = hmac(kRegion, "s3");
    const kSigning = hmac(kService, "aws4_request");
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authHeader =
      `AWS4-HMAC-SHA256 Credential=${this.opts.accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      url: this.endpointFor(args.key),
      headers: {
        ...args.headers,
        "x-amz-date": amzDate,
        Host: hostHeader,
        Authorization: authHeader,
      },
    };
  }

  // -----------------------------------------------------------------------
  // Storage interface
  // -----------------------------------------------------------------------

  async put(key: string, body: BlobLike, options?: PutOptions): Promise<{ key: string; etag?: string }> {
    const k = validateKey(key);
    const buf = toUint8(body);
    const bodyHash = hash(buf);
    const headers: Record<string, string> = {
      "content-type": options?.contentType ?? "application/octet-stream",
      "x-amz-content-sha256": bodyHash,
      "x-amz-storage-class": "STANDARD",
    };
    if (options?.cacheControl) headers["cache-control"] = options.cacheControl;
    if (options?.metadata) {
      for (const [mk, mv] of Object.entries(options.metadata)) {
        headers[`x-amz-meta-${mk.toLowerCase()}`] = mv;
      }
    }
    const { url, headers: signed } = this.signRequest({
      method: "PUT",
      key: k,
      headers,
      bodyHash,
    });
    const res = await this.fetchImpl(url, {
      method: "PUT",
      headers: signed,
      // Wrap in Blob for the runtime to treat as binary; raw
      // Uint8Array is not in the BodyInit union on some runtimes.
      body: new Blob([buf as Uint8Array<ArrayBuffer>]),
    });
    if (!res.ok) {
      throw new Error(`S3 PUT failed: ${res.status} ${await res.text()}`);
    }
    const etag = res.headers.get("ETag") ?? undefined;
    return { key: k, ...(etag ? { etag } : {}) };
  }

  async get(key: string): Promise<GetResult> {
    const k = validateKey(key);
    const { url, headers } = this.signRequest({
      method: "GET",
      key: k,
      headers: { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" },
      bodyHash: "UNSIGNED-PAYLOAD",
    });
    const res = await this.fetchImpl(url, { method: "GET", headers });
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Not found: ${k}`);
      throw new Error(`S3 GET failed: ${res.status}`);
    }
    return {
      body: res.body as ReadableStream<Uint8Array>,
      ...(res.headers.get("Content-Type")
        ? { contentType: res.headers.get("Content-Type") as string }
        : {}),
      ...(res.headers.get("Content-Length")
        ? { contentLength: Number(res.headers.get("Content-Length")) }
        : {}),
      ...(res.headers.get("ETag") ? { etag: res.headers.get("ETag") as string } : {}),
    };
  }

  async head(key: string): Promise<HeadResult | null> {
    const k = validateKey(key);
    const { url, headers } = this.signRequest({
      method: "HEAD",
      key: k,
      headers: { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" },
      bodyHash: "UNSIGNED-PAYLOAD",
    });
    const res = await this.fetchImpl(url, { method: "HEAD", headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`S3 HEAD failed: ${res.status}`);
    return {
      ...(res.headers.get("Content-Type")
        ? { contentType: res.headers.get("Content-Type") as string }
        : {}),
      ...(res.headers.get("Content-Length")
        ? { contentLength: Number(res.headers.get("Content-Length")) }
        : {}),
      ...(res.headers.get("ETag") ? { etag: res.headers.get("ETag") as string } : {}),
    };
  }

  async delete(key: string): Promise<boolean> {
    const k = validateKey(key);
    const { url, headers } = this.signRequest({
      method: "DELETE",
      key: k,
      headers: { "x-amz-content-sha256": hash("") },
      bodyHash: hash(""),
    });
    const res = await this.fetchImpl(url, { method: "DELETE", headers });
    return res.ok || res.status === 404;
  }

  async getSignedUrl(key: string, opts?: SignedUrlOptions): Promise<SignedUrlResult> {
    const k = validateKey(key);
    const expiresIn = opts?.expiresInSeconds ?? 300;
    const amzDate = toAmzDate(new Date());
    const dateStamp = amzDate.slice(0, 8);
    const hostHeader = this.opts.forcePathStyle
      ? new URL(this.opts.endpoint).host
      : `${this.opts.bucket}.${new URL(this.opts.endpoint).host}`;
    const credentialScope = `${dateStamp}/${this.opts.region}/s3/aws4_request`;
    const signedHeaders = "host";
    const algorithm = "AWS4-HMAC-SHA256";
    const credential = `${this.opts.accessKeyId}/${credentialScope}`;
    const params = new URLSearchParams({
      "X-Amz-Algorithm": algorithm,
      "X-Amz-Credential": credential,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expiresIn),
      "X-Amz-SignedHeaders": signedHeaders,
    });
    if (opts?.contentType) params.set("response-content-type", opts.contentType);
    if (opts?.contentDisposition) {
      params.set("response-content-disposition", opts.contentDisposition);
    }
    const canonicalUri = `/${this.opts.bucket}/${percentEncode(k)}`;
    const canonicalRequest = [
      "GET",
      canonicalUri,
      params.toString(),
      `host:${hostHeader}\n`,
      signedHeaders,
      "UNSIGNED-PAYLOAD",
    ].join("\n");
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      hash(canonicalRequest),
    ].join("\n");
    const kDate = hmac(`AWS4${this.opts.secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, this.opts.region);
    const kService = hmac(kRegion, "s3");
    const kSigning = hmac(kService, "aws4_request");
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const endpoint = this.opts.forcePathStyle
      ? `${trim(this.opts.endpoint)}/${this.opts.bucket}/${percentEncode(k)}?${params.toString()}&X-Amz-Signature=${signature}`
      : `${trim(this.opts.endpoint).replace("://", `://${this.opts.bucket}.`)}/${percentEncode(k)}?${params.toString()}&X-Amz-Signature=${signature}`;

    return {
      url: endpoint,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}
