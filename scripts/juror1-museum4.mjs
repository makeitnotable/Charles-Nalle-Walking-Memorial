// Approach the portrait work (index 9) on desktop + tablet; measure the projected painting rect aspect.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const out = {};
for (const k of (process.argv[2] || "d1440,t768").split(",")) {
  const vp = VPS[k]; const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
  const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
  await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.9); await sleep(1500);
  await page.locator('button[aria-label^="Approach"]').nth(9).click(); await sleep(2800);
  const r = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i]'); const rr = b.getBoundingClientRect(); const pr = window.__museum.paintingRect(9); return { btn: [Math.round(rr.x), Math.round(rr.y), Math.round(rr.width), Math.round(rr.height)], ratio: +(rr.width / rr.height).toFixed(2), proj: pr && [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right - pr.left), Math.round(pr.bottom - pr.top)], placements: (() => { try { const p = window.__museum.placements; const q = typeof p === "function" ? p() : p; return JSON.stringify(q?.[9]).slice(0, 200); } catch (e) { return String(e); } })() }; });
  await shot(page, `mus4-${k}-portrait-approach`);
  // also index 8 (narrative I, 1.5) for comparison
  await page.keyboard.press("ArrowLeft"); await sleep(2000);
  const r8 = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i]'); const rr = b.getBoundingClientRect(); return { btn: [Math.round(rr.x), Math.round(rr.y), Math.round(rr.width), Math.round(rr.height)], ratio: +(rr.width / rr.height).toFixed(2) }; });
  await shot(page, `mus4-${k}-narrative1-approach`);
  out[k] = { portrait: r, narrative1: r8, log: log.filter((l) => !/ERR_ABORTED/.test(l)) };
  await c.close();
}
save("museum4.json", out); console.log(JSON.stringify(out, null, 1));
await browser.close();
