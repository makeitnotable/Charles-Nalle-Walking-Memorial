import { launch, ctx, VIEWPORTS, BASE, sleep, shot } from "./juror10-lib.mjs";
const browser = await launch();
for (const k of ["d1440", "p390"]) {
const c = await ctx(browser, VIEWPORTS[k]); const page = await c.newPage();
const t0 = Date.now();
await page.goto(BASE + "/map", { waitUntil: "domcontentloaded" });
const probe = () => page.evaluate(() => { const el = [...document.querySelectorAll("main *")].find((e) => e.children.length === 0 && /tap a stop/i.test(e.textContent) && e.getBoundingClientRect().width > 0); if (!el) return null; let a = el, op = 1; while (a && a !== document.body) { op *= parseFloat(getComputedStyle(a).opacity); a = a.parentElement; } const r = el.getBoundingClientRect(); const m4 = document.querySelector('[aria-label^="Spot 4"]'); const kids = m4 ? [...m4.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 4) : []; let minL = 1e9, minT = 1e9, maxR = -1e9, maxB = -1e9; for (const kk of kids) { const rr = kk.getBoundingClientRect(); minL = Math.min(minL, rr.left); minT = Math.min(minT, rr.top); maxR = Math.max(maxR, rr.right); maxB = Math.max(maxB, rr.bottom); } const ov = r.left < maxR && r.right > minL && r.top < maxB && r.bottom > minT; return { op: +op.toFixed(2), chip: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], stop4: [Math.round(minL), Math.round(minT), Math.round(maxR), Math.round(maxB)], overlaps: ov }; });
for (const t of [1500, 3000, 5000, 8000, 12000, 16000]) { await sleep(t - (Date.now() - t0) > 0 ? t - (Date.now() - t0) : 0); console.log(k, t, "ms:", JSON.stringify(await probe())); }
// interaction: drag map
await page.mouse.move(VIEWPORTS[k].width / 2, VIEWPORTS[k].height / 2); await page.mouse.down(); await page.mouse.move(VIEWPORTS[k].width / 2 + 40, VIEWPORTS[k].height / 2 + 30, { steps: 5 }); await page.mouse.up(); await sleep(1500);
console.log(k, "after drag:", JSON.stringify(await probe()));
await c.close();
}
await browser.close();
