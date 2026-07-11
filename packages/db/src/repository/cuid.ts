/**
 * @orvix/db — id generator (Milestone 1).
 *
 * Returns a UUIDv7-shaped string. The Postgres layer also installs
 * `uuid_generate_v7()` for `dbgenerated("...")` defaults; this helper
 * is used by the Repository's `create*` paths so the row can be
 * referenced in a single round-trip without an extra SELECT.
 *
 * Implementation: a pure-JS UUIDv7 (time-ordered) generator. Output
 * matches RFC 9562 §5.7, which the Postgres `@db.Uuid` columns accept.
 */
export function cuid(): string {
  // 48-bit unix time in milliseconds
  const ts = Date.now();
  const tsHex = ts.toString(16).padStart(12, "0");
  // 10 bytes of randomness
  const rand = new Uint8Array(10);
  for (let i = 0; i < 10; i++) rand[i] = Math.floor(Math.random() * 256);
  const randHex = Array.from(rand, (b) => b.toString(16).padStart(2, "0")).join("");
  // Compose 16-byte (32-hex) UUID
  const hex = tsHex + randHex;
  // Set version (7) in byte 6 and variant (RFC 4122) in byte 8
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bytes[6] as any) = (bytes[6]! & 0x0f) | 0x70; // version 7
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bytes[8] as any) = (bytes[8]! & 0x3f) | 0x80; // variant 10
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

