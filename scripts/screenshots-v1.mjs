/**
 * v1.0 AppShell screenshots.
 *
 * Captures the 5 key views of the v1.0 Conductor AppShell:
 *   - Dashboard (inbox)
 *   - Work
 *   - Customer (customers list)
 *   - AI
 *   - Reports
 *
 * Usage:
 *   1. dev server on :3300 with seeded session
 *   2. node scripts/screenshots-v1.mjs
 *
 * Outputs: docs/screenshots/v1.0/{dashboard,work,customer,ai,reports}.png
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs/screenshots/v1.0");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const SESSION_COOKIE = process.env.ORVIX_SESSION_COOKIE;
if (!SESSION_COOKIE) {
  console.error("ERROR: set ORVIX_SESSION_COOKIE to the orvix_session value");
  process.exit(1);
}

const BASE = process.env.ORVIX_BASE_URL ?? "http://localhost:3301";
const VIEWPORT = { width: 1440, height: 900 };

const PAGES = [
  { id: "dashboard", path: "/inbox", wait: 1500 },
  { id: "work", path: "/work", wait: 1500 },
  { id: "customer", path: "/customers", wait: 1500 },
  { id: "ai", path: "/ai", wait: 1500 },
  { id: "reports", path: "/reports", wait: 1500 },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
  });
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1.5,
  });
  await ctx.addCookies([
    {
      name: "orvix_session",
      value: SESSION_COOKIE,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const page = await ctx.newPage();

  for (const p of PAGES) {
    console.log(`→ ${p.id} (${p.path})`);
    const url = `${BASE}${p.path}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(p.wait);
    const outPath = join(OUT, `${p.id}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`   ${outPath}`);
  }

  // Also capture the command palette open.
  console.log("→ command-palette (inbox with ⌘K open)");
  await page.goto(`${BASE}/inbox`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.keyboard.press("Meta+k");
  await page.waitForTimeout(400);
  await page.screenshot({
    path: join(OUT, "command-palette.png"),
    fullPage: false,
  });
  console.log(`   ${join(OUT, "command-palette.png")}`);

  await browser.close();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
