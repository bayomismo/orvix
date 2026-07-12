/**
 * M7 screenshots — AI Assistant, Settings, Admin.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";
import fs from "node:fs";

const BASE = "http://localhost:3301";
const OUT = "/workspace/orvix/docs/screenshots/v1.0";
const COOKIE = fs.readFileSync("/tmp/orvix-cookie.txt", "utf8").trim();

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  storageState: {
    cookies: [
      { name: "orvix_session", value: COOKIE, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" },
    ],
    origins: [],
  },
});
const page = await ctx.newPage();

const SHOTS = [
  { url: "/ai", name: "m7-ai" },
  { url: "/ai?tab=Activity", name: "m7-ai-activity" },
  { url: "/ai?tab=Approvals", name: "m7-ai-approvals" },
  { url: "/ai?tab=Memory", name: "m7-ai-memory" },
  { url: "/settings", name: "m7-settings" },
  { url: "/settings?tab=Engine", name: "m7-settings-engine" },
  { url: "/settings?tab=Notifications", name: "m7-settings-notifications" },
  { url: "/settings?tab=Theme", name: "m7-settings-theme" },
  { url: "/admin", name: "m7-admin" },
];

for (const s of SHOTS) {
  await page.goto(`${BASE}${s.url}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  console.log("Captured", s.name);
}
await browser.close();
