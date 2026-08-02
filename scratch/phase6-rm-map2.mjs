// Phase 6 FINAL — rm /map settled recapture, gated on marker mount (load fired)
import { chromium } from "playwright";
const OUT = "docs/qa/phase6-motion";
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
const t0 = Date.now();
await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
await p.locator('button[aria-label^="Stop 1"]').waitFor({ timeout: 20000 });
const tMarkers = Date.now() - t0;
await p.waitForTimeout(600); // one settle beat, jumpTo done (instant)
const state = await p.evaluate(() => ({
  scale: document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim(),
  markerCount: document.querySelectorAll('button[aria-label^="Stop"]').length,
}));
await p.screenshot({ path: `${OUT}/rm-map-settled-2.png` });
console.log(JSON.stringify({ msToMarkers: tMarkers, ...state }));
await browser.close();
