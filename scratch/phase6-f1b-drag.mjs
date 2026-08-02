// Phase 6 FINAL — F1b: drag clearly MID-FLIGHT (after hint card appears = load fired)
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));

await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
// Wait for the hint card — it is set open inside map.on("load"), same tick the
// cut listeners are armed and the 3.5s prologue easeTo starts.
await p.getByText("Drag to explore", { exact: false }).waitFor({ timeout: 15000 });
const tLoad = Date.now();
await p.waitForTimeout(600); // clearly inside the 3.5s flight
const scale0 = await p.evaluate(() => document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim());
await p.mouse.move(350, 620);
await p.mouse.down();
await p.mouse.move(380, 635, { steps: 5 });
await p.mouse.up();
await p.waitForTimeout(300);
const scale1 = await p.evaluate(() => document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim());
const hintGone = await p.evaluate(() => !document.body.innerText.match(/Drag to explore/i));
await p.screenshot({ path: `${OUT}/f1-prologue-dragmid-plus300ms.png` });
await p.waitForTimeout(5000);
const scale2 = await p.evaluate(() => document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim());
await p.screenshot({ path: `${OUT}/f1-prologue-dragmid-final.png` });
console.log(JSON.stringify({ scaleAtDrag: scale0, scalePlus300: scale1, hintDismissed: hintGone, scaleFinal: scale2, msAfterLoadEvent: 600 }));
console.log("pageerrors:", errs.length ? errs : "none");
await browser.close();
