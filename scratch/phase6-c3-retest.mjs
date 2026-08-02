#!/usr/bin/env node
/** C3 retest: paragraph-tap seek on the last existing transcript paragraph, /mansion. */
import { chromium } from "playwright";

const BASE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(BASE + "/mansion", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
const play = page.locator('button[aria-label^="Play narration"]').first();
await play.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await play.click();
await page.waitForTimeout(3500);
const info = await page.evaluate(() => ({
  n: document.querySelectorAll("p[data-timing]").length,
  t: document.querySelector("audio")?.currentTime ?? -1,
  wash: Boolean(document.querySelector("p.narration-active")),
  scrub: Boolean(document.querySelector("input.cnwm-scrub")),
}));
const last = page.locator("p[data-timing]").last();
await last.scrollIntoViewIfNeeded();
await last.click();
await page.waitForTimeout(1000);
const after = await page.evaluate(() => ({
  t: document.querySelector("audio")?.currentTime ?? -1,
  activeTiming: document.querySelector("p.narration-active")?.getAttribute("data-timing") ?? "none",
}));
console.log(
  `paras=${info.n} playing at ${info.t.toFixed(1)}s wash=${info.wash} scrub=${info.scrub}; ` +
  `after tapping last para: t=${after.t.toFixed(1)}s activePara data-timing=${after.activeTiming}`,
);
const ok = info.t > 0 && info.wash && info.scrub && after.t > info.t + 5;
console.log(`C3 synced player: ${ok ? "PASS" : "FAIL"}`);
await browser.close();
process.exit(ok ? 0 : 1);
