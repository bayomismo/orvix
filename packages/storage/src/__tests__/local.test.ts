/**
 * Local storage adapter tests.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { LocalStorageAdapter } from "../local";

describe("LocalStorageAdapter", () => {
  let root: string;
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "orvix-storage-"));
    storage = new LocalStorageAdapter({ root });
  });

  afterEach(() => {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      // best-effort
    }
  });

  it("round-trips a Buffer", async () => {
    const { key, etag } = await storage.put("a/b.txt", Buffer.from("hello"));
    expect(key).toBe("a/b.txt");
    expect(etag).toBeDefined();
    const got = await storage.get("a/b.txt");
    expect(got.contentLength).toBe(5);
    const text = await new Response(got.body).text();
    expect(text).toBe("hello");
  });

  it("round-trips a string with a custom content-type", async () => {
    await storage.put("a/c.json", "{\"k\":1}", { contentType: "application/json" });
    const got = await storage.get("a/c.json");
    expect(got.contentType).toBe("application/json");
    const text = await new Response(got.body).text();
    expect(text).toBe("{\"k\":1}");
  });

  it("head returns null for a missing key", async () => {
    const h = await storage.head("nope");
    expect(h).toBeNull();
  });

  it("delete is idempotent and returns true", async () => {
    await storage.put("a/d.txt", "x");
    expect(await storage.delete("a/d.txt")).toBe(true);
    expect(await storage.delete("a/d.txt")).toBe(true);
  });

  it("rejects keys with NUL bytes", async () => {
    await expect(storage.put("a/bad\0.txt", "x")).rejects.toThrow();
  });

  it("rejects traversal keys", async () => {
    await expect(storage.put("../escape.txt", "x")).rejects.toThrow();
  });

  it("getSignedUrl throws unless allowFileUrl", async () => {
    await expect(storage.getSignedUrl("a/b.txt")).rejects.toThrow();
  });
});
