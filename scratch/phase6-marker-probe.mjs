#!/usr/bin/env node
/**
 * Probe: after clicking a stop marker, which card ends up active?
 * Runs the marker->carousel check for stops 3 and 5 at 1440 and 390.
 */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();

async function probe(vp, stopN) {
  const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(9000);
  const marker = page.locator(`button[aria-label^="Stop ${stopN}"]`).first();
  await marker.waitFor({ state: "visible", timeout: 20000 });
  const markerLabel = await marker.getAttribute("aria-label");
  await marker.click({ timeout: 8000 });
  await page.locator('[role="region"][aria-label="Stop cards"]').waitFor({ state: "visible", timeout: 8000 });
  await page.waitForTimeout(7000); // let everything settle
  const state = await page.evaluate(() => {
    const active = document.querySelector('[role="button"][aria-label^="Enter Chapter"]');
    const url = new URL(location.href);
    return {
      activeCard: active ? active.getAttribute("aria-label") : "(none)",
      urlStop: url.searchParams.get("stop"),
    };
  });
  console.log(
    `vp=${vp.width} marker="${markerLabel}" -> active="${state.activeCard}" url stop=${state.urlStop}`,
  );
  await context.close();
  return { markerLabel, ...state };
}

await probe({ width: 1440, height: 900 }, 3);
await probe({ width: 1440, height: 900 }, 5);
await probe({ width: 390, height: 844 }, 3);
await browser.close();
