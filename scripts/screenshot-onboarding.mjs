/**
 * Screenshot the actual onboarding wizard (not the AppShell).
 * Clears the session cookie so the user is unauthed.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const BASE = process.env.ORVIX_BASE_URL ?? "http://localhost:3301";
const OUT = "/workspace/orvix/docs/screenshots/v1.0/onboarding.png";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

await page.goto(`${BASE}/onboarding`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT, fullPage: false });
console.log("Captured:", OUT);
await browser.close();
