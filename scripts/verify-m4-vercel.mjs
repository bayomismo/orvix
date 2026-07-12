/**
 * Verify M4 on Vercel — capture all 4 public surfaces
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const BASE = process.env.ORVIX_BASE_URL ?? "https://orvix-two.vercel.app";
const OUT = "/workspace/orvix/docs/screenshots/v1.0";
const ROUTES = [
  { url: "/", name: "vercel-landing" },
  { url: "/onboarding", name: "vercel-onboarding" },
  { url: "/signin", name: "vercel-signin" },
  { url: "/pricing", name: "vercel-pricing" },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();

for (const r of ROUTES) {
  await page.goto(`${BASE}${r.url}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${r.name}.png`, fullPage: false });
  console.log(`Captured ${r.name}`);
}
await browser.close();
