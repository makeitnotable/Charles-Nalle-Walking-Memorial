#!/usr/bin/env node
/**
 * Probe 2: consequences + recovery of the marker->carousel desync.
 * a) After marker Stop 3 click, tap the big centered card -> where do we land?
 * b) Fresh page: marker Stop 3, tap the correct (inactive) card 3 to focus,
 *    then tap it again -> do we land on /mansion?
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();

async function setup() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const marker = page.locator('button[aria-label^="Stop 3"]').first();
  await marker.waitFor({ state: "visible", timeout: 20000 });
  await marker.click({ timeout: 8000 });
  await page.locator('[role="region"][aria-label="Stop cards"]').waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(7000);
  return { context, page };
}

// a) tap the (wrong) active card
{
  const { context, page } = await setup();
  const active = page.locator('[role="button"][aria-label^="Enter Chapter"]').first();
  const label = await active.getAttribute("aria-label");
  await active.click();
  try {
    await page.waitForURL((u) => !u.pathname.endsWith("/map"), { timeout: 15000 });
    console.log(`a) tapped active card ("${label}") after marker Stop 3 -> landed on ${page.url()}`);
  } catch {
    console.log(`a) tapped active card ("${label}") -> no navigation within 15s`);
  }
  await context.close();
}

// b) recovery: tap correct card to focus, tap again to enter
{
  const { context, page } = await setup();
  const card3 = page.locator('[role="button"][aria-label="Focus stop 3: Uri Gilbert Mansion"]');
  await card3.click();
  await page.waitForTimeout(2500);
  const nowActive = await page
    .locator('[role="button"][aria-label="Enter Chapter 3: Uri Gilbert Mansion"]')
    .count();
  if (nowActive) {
    await page.locator('[role="button"][aria-label="Enter Chapter 3: Uri Gilbert Mansion"]').click();
    try {
      await page.waitForURL("**/mansion**", { timeout: 15000 });
      console.log(`b) recovery works: focus card 3 -> enter -> ${page.url()}`);
    } catch {
      console.log("b) recovery: card 3 became active but second tap did not navigate");
    }
  } else {
    console.log("b) recovery FAILED: tapping card 3 did not make it active");
  }
  await context.close();
}

await browser.close();
