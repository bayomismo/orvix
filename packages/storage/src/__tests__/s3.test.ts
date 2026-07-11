/**
 * S3 storage adapter tests.
 *
 * Uses a fetch mock to verify request signing + path-style behavior.
 * No network calls.
 */

import { describe, it, expect } from "vitest";

import { S3StorageAdapter } from "../s3";

function createMockFetch(responses: Array<{ status: number; headers?: Record<string, string>; body?: string }>) {
  let i = 0;
  const calls: Array<{ url: string; method: string; headers: Record<string, string> }> = [];
  const fn = (async (url: string | URL, init?: RequestInit) => {
    const u = typeof url === "string" ? url : url.toString();
    calls.push({
      url: u,
      method: (init?.method ?? "GET").toString(),
      headers: (init?.headers as Record<string, string>) ?? {},
    });
    const r = responses[i++] ?? { status: 200, body: "" };
    return new Response(r.body ?? "", {
      status: r.status,
      headers: r.headers ?? {},
    });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

describe("S3StorageAdapter (signed URL generation)", () => {
  const opts = {
    endpoint: "https://s3.example.com",
    bucket: "test-bucket",
    region: "us-east-1",
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  };

  it("signs a presigned URL with the right shape", async () => {
    const { fn } = createMockFetch([]);
    const s3 = new S3StorageAdapter({ ...opts, fetchImpl: fn });
    const res = await s3.getSignedUrl("a/b.txt", { expiresInSeconds: 60 });
    expect(res.url).toContain("test-bucket.s3.example.com");
    expect(res.url).toContain("/a%2Fb.txt");
    expect(res.url).toContain("X-Amz-Algorithm=AWS4-HMAC-SHA256");
    expect(res.url).toContain("X-Amz-Credential=AKIAIOSFODNN7EXAMPLE");
    expect(res.url).toContain("X-Amz-Expires=60");
    expect(res.url).toContain("X-Amz-SignedHeaders=host");
    expect(res.url).toContain("X-Amz-Signature=");
  });

  it("uses path-style when forcePathStyle", async () => {
    const { fn } = createMockFetch([]);
    const s3 = new S3StorageAdapter({ ...opts, forcePathStyle: true, fetchImpl: fn });
    const res = await s3.getSignedUrl("a/b.txt", { expiresInSeconds: 60 });
    // S3 path-style addresses percent-encode the embedded `/` in
    // the key. The host is the bare endpoint (no bucket subdomain).
    expect(res.url).toContain("s3.example.com/test-bucket/a%2Fb.txt");
  });

  it("PUT signs the body hash and posts to S3", async () => {
    const { fn, calls } = createMockFetch([
      { status: 200, headers: { ETag: '"abc"' } },
    ]);
    const s3 = new S3StorageAdapter({ ...opts, fetchImpl: fn });
    const { etag } = await s3.put("a/b.txt", Buffer.from("hi"), {
      contentType: "text/plain",
    });
    expect(etag).toBe('"abc"');
    expect(calls[0]?.method).toBe("PUT");
    expect(calls[0]?.url).toContain("test-bucket.s3.example.com");
    expect(calls[0]?.headers["Authorization"]).toMatch(/^AWS4-HMAC-SHA256 /);
    expect(calls[0]?.headers["x-amz-content-sha256"]).toBeDefined();
  });

  it("GET parses headers + body", async () => {
    const { fn } = createMockFetch([
      { status: 200, headers: { "Content-Type": "text/plain", ETag: '"xyz"' }, body: "hello" },
    ]);
    const s3 = new S3StorageAdapter({ ...opts, fetchImpl: fn });
    const got = await s3.get("a/b.txt");
    expect(got.contentType).toBe("text/plain");
    expect(got.etag).toBe('"xyz"');
    const text = await new Response(got.body).text();
    expect(text).toBe("hello");
  });
});
