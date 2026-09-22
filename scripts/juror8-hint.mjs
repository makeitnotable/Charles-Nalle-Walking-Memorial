import { launch, ctx, VPS, sleep, go } from "./juror8-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.p390); const page = await c.newPage();
await go(page, "/map", 3000);
for (const t of [3, 6, 9, 12, 16, 20]) { await sleep(t === 3 ? 0 : 3000 + (t > 12 ? 1000 : 0)); const v = await page.evaluate(() => { const e = [...document.querySelectorAll("div, p, span")].find((e) => e.children.length === 0 && /Drag to explore · tap a stop/i.test(e.textContent)); if (!e) return null; let n = e, op = 1; while (n) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } const r = e.getBoundingClientRect(); return { op: +op.toFixed(2), y: Math.round(r.y) }; }); console.log(t + "s", JSON.stringify(v)); }
// marker 4 rect vs chip
console.log(await page.evaluate(() => { const m = [...document.querySelectorAll(".mapboxgl-marker")][3]; const b = m.querySelector("button") || m; const r = b.getBoundingClientRect(); const e = [...document.querySelectorAll("div, p, span")].find((e) => e.children.length === 0 && /Drag to explore/i.test(e.textContent)); const cr = e ? e.closest("div").getBoundingClientRect() : null; return { marker4: [Math.round(r.x), Math.round(r.y), Math.round(r.right), Math.round(r.bottom)], chip: cr && [Math.round(cr.x), Math.round(cr.y), Math.round(cr.right), Math.round(cr.bottom)] }; }));
await c.close(); await browser.close();
