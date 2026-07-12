/**
 * M8 screenshots — loading states and not-found pages.
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

// First screenshot: app loading state (slow throttle so we see skeletons)
const ctxLoading = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  storageState: {
    cookies: [{ name: "orvix_session", value: COOKIE, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" }],
    origins: [],
  },
});
const loadingPage = await ctxLoading.newPage();
const cdp = await ctxLoading.newCDPSession(loadingPage);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  downloadThroughput: 50 * 1024,
  uploadThroughput: 50 * 1024,
  latency: 500,
});
// Marketing loading state
await loadingPage.goto(`${BASE}/onboarding`, { waitUntil: "domcontentloaded" });
await loadingPage.waitForTimeout(400);
await loadingPage.screenshot({ path: `${OUT}/m8-loading.png`, fullPage: false });
console.log("Captured m8-loading");
await ctxLoading.close();

// Not found states
const ctxNotFound = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
  storageState: {
    cookies: [{ name: "orvix_session", value: COOKIE, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" }],
    origins: [],
  },
});
const notFoundPage = await ctxNotFound.newPage();
await notFoundPage.goto(`${BASE}/this-does-not-exist`, { waitUntil: "domcontentloaded" });
await notFoundPage.waitForTimeout(1500);
await notFoundPage.screenshot({ path: `${OUT}/m8-not-found-app.png`, fullPage: false });
console.log("Captured m8-not-found-app");

// Marketing 404
await notFoundPage.goto(`${BASE}/signin/this-does-not-exist`, { waitUntil: "domcontentloaded" });
await notFoundPage.waitForTimeout(1500);
await notFoundPage.screenshot({ path: `${OUT}/m8-not-found-public.png`, fullPage: false });
console.log("Captured m8-not-found-public");
await ctxNotFound.close();
await browser.close();
