/**
 * M5 screenshots — Inbox (with BlockedPanel), Work (with M2 Tabs),
 * Customers (with M2 Card).
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";

import fs from "node:fs";

const BASE = process.env.ORVIX_BASE_URL ?? "http://localhost:3301";
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
      {
        name: "orvix_session",
        value: COOKIE,
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  },
});
const page = await ctx.newPage();

const SHOTS = [
  { url: "/inbox", name: "m5-inbox" },
  { url: "/work", name: "m5-work" },
  { url: "/work?type=task", name: "m5-work-tasks" },
  { url: "/customers", name: "m5-customers" },
];

for (const s of SHOTS) {
  await page.goto(`${BASE}${s.url}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  console.log(`Captured ${s.name}`);
}
await browser.close();
