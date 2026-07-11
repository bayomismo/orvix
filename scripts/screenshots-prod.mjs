/**
 * Screenshot the PRODUCTION build of the v1.0 AppShell.
 * Output: docs/screenshots/v1.0/{dashboard,work,customer,ai,reports,command-palette}.png
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const SESSION = process.env.SESSION;
if (!SESSION) { console.error("set SESSION"); process.exit(1); }
const BASE = process.env.BASE ?? "http://localhost:3301";
const OUT = "/workspace/orvix/docs/screenshots/v1.0";

const PAGES = [
  { id: "dashboard", path: "/inbox", wait: 1500 },
  { id: "work", path: "/work", wait: 1500 },
  { id: "customer", path: "/customers", wait: 1500 },
  { id: "ai", path: "/ai", wait: 1500 },
  { id: "reports", path: "/reports", wait: 1500 },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await ctx.addCookies([{ name: "orvix_session", value: SESSION, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
const page = await ctx.newPage();

for (const p of PAGES) {
  console.log(`→ ${p.id} (${p.path})`);
  await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(p.wait);
  await page.screenshot({ path: `${OUT}/${p.id}.png`, fullPage: false });
}

console.log("→ command-palette");
await page.goto(`${BASE}/inbox`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.keyboard.press("Meta+k");
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/command-palette.png`, fullPage: false });

await browser.close();
console.log("Done.");
