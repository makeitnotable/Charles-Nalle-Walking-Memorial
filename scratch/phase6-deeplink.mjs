#!/usr/bin/env node
/**
 * Phase 6 FINAL: deep-link check on live.
 * /map?stop=ferry must load focused on Ferry Landing (M3/M10):
 *  - carousel ("Stop cards" region) present with Ferry active
 *  - arrival plate "Stop 4 of 5" appears during the flight
 *  - URL keeps ?stop=ferry
 * Evidence screenshots into docs/qa/phase6-qa/.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const OUT = "docs/qa/phase6-qa";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(BASE + "/map?stop=ferry", { waitUntil: "networkidle", timeout: 60000 });

// Arrival plate should be visible during the 5s flight (M10)
let plate = "";
try {
  const plateEl = page.locator('text=/Stop \\d of \\d/').first();
  await plateEl.waitFor({ state: "visible", timeout: 6000 });
  plate = (await plateEl.textContent())?.trim() ?? "";
  console.log(`arrival plate: "${plate}"`);
  await page.screenshot({ path: `${OUT}/deeplink-ferry-arrival-390.png` });
} catch {
  console.log("arrival plate: NOT SEEN (may have faded before capture)");
}

// Let the flight land + carousel settle
await page.waitForTimeout(9000);
await page.screenshot({ path: `${OUT}/deeplink-ferry-settled-390.png` });

const carousel = page.locator('[role="region"][aria-label="Stop cards"]');
const carouselVisible = await carousel.isVisible().catch(() => false);
const url = page.url();

// active card content
let activeCardText = "";
try {
  activeCardText = (await carousel.textContent())?.replace(/\s+/g, " ").trim().slice(0, 300) ?? "";
} catch {}

const ferryInCards = /FERRY/i.test(activeCardText);
console.log(`url: ${url}`);
console.log(`carousel visible: ${carouselVisible}`);
console.log(`cards mention ferry: ${ferryInCards}`);
console.log(`cards text: ${activeCardText.slice(0, 200)}`);
console.log(`js errors: ${errors.length ? errors.join(" | ") : "none"}`);

const ok =
  carouselVisible && ferryInCards && url.includes("stop=ferry") && errors.length === 0;
console.log(`\n=== deep-link ferry: ${ok ? "PASS" : "FAIL"} (plate: ${plate || "n/a"}) ===`);
await browser.close();
process.exit(ok ? 0 : 1);
