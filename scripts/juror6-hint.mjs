import { launch, ctx, VPS, goto, shot, watch, sleep, touchDrag } from "./juror6-lib.mjs";
const browser = await launch(); const c = await ctx(browser, VPS.p390); const page = await c.newPage(); watch(page);
await goto(page, "/map");
const chip = () => page.evaluate(() => [...document.querySelectorAll("*")].filter(e => /drag to explore/i.test(e.textContent || "") && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().width < 340).map(e => { let op = 1, p = e; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; } const r = e.getBoundingClientRect(); return { tag: e.tagName, op: Math.round(op * 100) / 100, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }).slice(-1)[0] || null);
const m4 = () => page.evaluate(() => { const m = [...document.querySelectorAll("[aria-label^='Spot 4']")][0]; if (!m) return null; const b = m.querySelector("button, div, span") || m; const r = b.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
for (const t of [2000, 6000, 12000, 20000]) { await sleep(t === 2000 ? 2000 : t === 6000 ? 4000 : t === 12000 ? 6000 : 8000); console.log(`@${t}ms chip`, JSON.stringify(await chip()), "marker4", JSON.stringify(await m4())); }
await touchDrag(page, { x: 200, y: 400 }, { x: 240, y: 300 }, 10, 16); await sleep(1500);
console.log("after drag chip", JSON.stringify(await chip()));
await browser.close();
