/**
 * M6 screenshots — Work Details, Customer Profile, Reports.
 */
import { chromium } from "/workspace/orvix/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs";
import fs from "node:fs";

const BASE = "http://localhost:3301";
const OUT = "/workspace/orvix/docs/screenshots/v1.0";
const COOKIE = fs.readFileSync("/tmp/orvix-cookie.txt", "utf8").trim();
const WORK_ID = fs.readFileSync("/tmp/orvix-workid.txt", "utf8").trim();

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

// Find a customer work item id from the customers page
const customersHtml = await page.request.get(`${BASE}/customers`, {
  headers: { Cookie: `orvix_session=${COOKIE}` },
});
const customerHtml = await customersHtml.text();
const customerIdMatch = customerHtml.match(/href="\/work\/([^"]+)"/);
const customerId = customerIdMatch?.[1] ?? WORK_ID;
console.log("Customer id:", customerId);

const SHOTS = [
  { url: `/work/${WORK_ID}`, name: "m6-work-details" },
  { url: `/work/${customerId}`, name: "m6-customer-profile" },
  { url: `/reports`, name: "m6-reports" },
];

for (const s of SHOTS) {
  await page.goto(`${BASE}${s.url}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  console.log("Captured", s.name);
}
await browser.close();
