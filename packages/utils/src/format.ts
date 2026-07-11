/**
 * Tiny formatters used across the app.
 *
 * Phase 0 ships:
 *   - formatUSD — money formatting
 *   - formatRelativeTime — "2 hours ago" style
 *   - formatCount
 *
 * Heavy formatters (i18n, locale selection) land in Phase 1.
 */

export function formatUSD(cents: number | bigint | string, locale = "en-US"): string {
  const n = typeof cents === "bigint" ? Number(cents) : Number(cents);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n / 100);
}

export function formatNumber(n: number | bigint, locale = "en-US"): string {
  const v = typeof n === "bigint" ? Number(n) : n;
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat(locale).format(v);
}

export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toISOString().slice(0, 10);
}

/** Compact "1.2k" / "3.4M" style. */
export function formatCompact(n: number, locale = "en-US"): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
