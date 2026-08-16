import { launch, ctx, watch, shot, sleep, goto, VPS } from "./juror5-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
await goto(page, "/bakery"); await sleep(1200);
const play = page.getByRole("button", { name: /^play narration/i }).first(); await play.scrollIntoViewIfNeeded(); await play.click(); await sleep(1200);
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight })); await sleep(1200);
const out = await page.evaluate(() => { const pills = [...document.querySelectorAll("button")].filter((b) => /pause narration|play narration/i.test(b.getAttribute("aria-label") || "")).filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top > 0 && r.top < innerHeight; }); const pill = pills[pills.length - 1]; let el = pill; while (el && getComputedStyle(el).position !== "fixed") el = el.parentElement; const pr = (el || pill).getBoundingClientRect(); const disc = [...document.querySelectorAll("footer p, footer span")].find((e) => /Walking routes/.test(e.textContent)); const dr = disc.getBoundingClientRect(); const rects = [...disc.getClientRects()].map((r) => ({ y: Math.round(r.y), b: Math.round(r.bottom), x: Math.round(r.x), r: Math.round(r.right) })); return { pill: { x: Math.round(pr.x), y: Math.round(pr.y), r: Math.round(pr.right), b: Math.round(pr.bottom) }, disc: { y: Math.round(dr.y), b: Math.round(dr.bottom) }, lines: rects, gap: Math.round(pr.y - dr.bottom) }; });
console.log(JSON.stringify(out));
await shot(page, "footpill-d1440");
await c.close(); await browser.close();
