/**
 * M4 screenshots — the public surface.
 *
 *   - landing (root, /)
 *   - signin (/signin)
 *   - pricing (/pricing)
 *   - onboarding (/onboarding, authed users are redirected to /inbox)
 *
 * PublicShell wraps all of them. The same tokens, the same fonts,
 * the same motion as the AppShell.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";

const OUT = "/workspace/orvix/docs/screenshots/v1.0";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.ORVIX_BASE_URL ?? "http://localhost:3301";
const SESSION = process.env.ORVIX_SESSION_COOKIE;

const PAGES = [
  { id: "landing",    path: "/",             scrollTo: 0 },
  { id: "landing-2",  path: "/",             scrollTo: 900, name: "landing-2" },
  { id: "signin",     path: "/signin" },
  { id: "pricing",    path: "/pricing" },
  { id: "onboarding", path: "/onboarding" },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});
if (SESSION) {
  await ctx.addCookies([
    { name: "orvix_session", value: SESSION, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
}
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 200)); });

for (const p of PAGES) {
  console.log(`→ ${p.id} (${p.path})`);
  await page.goto(`${BASE}${p.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);
  if (p.scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), p.scrollTo);
    await page.waitForTimeout(400);
  }
  const name = p.name ?? p.id;
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

console.log("Errors:", errors);
await browser.close();
console.log("Done.");
