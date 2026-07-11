/**
 * Verify the production build matches the M3 screenshots.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

const SESSION = process.env.SESSION;
if (!SESSION) { console.error("set SESSION"); process.exit(1); }
const BASE = process.env.BASE ?? "http://localhost:3301";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await ctx.addCookies([{ name: "orvix_session", value: SESSION, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text()); });

await page.goto(`${BASE}/inbox`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);
const out = await page.evaluate(() => {
  // Verify M3 components are rendered
  const sidebar = document.querySelector("aside[aria-label='Primary']");
  const topbarText = document.body.innerText.includes("Search or ask ORVIX");
  const hasPulse = document.querySelector("[role='status']") !== null;
  const hasOrb = document.querySelector("[aria-label='Open AI Assistant']") !== null;
  const sidebarHasNewIndicators = sidebar ? sidebar.className.includes("rounded-2xl") : false;
  const sidebarText = sidebar ? sidebar.innerText.split("\n").slice(0, 20) : null;
  return { hasSidebar: !!sidebar, hasPulse, hasOrb, topbarText, sidebarHasNewIndicators, sidebarText };
});
console.log("DOM check:", JSON.stringify(out, null, 2));
console.log("Errors:", errors);

await page.screenshot({ path: "/workspace/orvix/docs/screenshots/v1.0/_verify-prod-dashboard.png", fullPage: false });
await browser.close();
