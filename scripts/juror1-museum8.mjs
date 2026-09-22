import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const vp = VPS.p390; const c = await ctx(browser, vp); const page = await c.newPage();
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
await page.locator('button[aria-label^="Approach"]').nth(4).click(); await sleep(3000);
const S = () => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; const el = document.querySelector('[aria-label*="plaque" i]'); const sh = el.parentElement; return { sheet: s.sheet, hdrTop: Math.round(el.getBoundingClientRect().y), sheetTf: getComputedStyle(sh).transform, sheetStyle: sh.getAttribute("style"), hdrStyle: el.getAttribute("style") }; });
const handle = await page.evaluate(() => { const sp = document.querySelector('[aria-label*="plaque" i] span'); const r = sp.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
const cdp = await page.context().newCDPSession(page);
const out = { start: await S(), handle };
// slow drag from the handle with a hold, 1.5 s, sampling
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: handle.x, y: handle.y, id: 1 }] }); await sleep(250);
const mid = [];
for (let i = 1; i <= 30; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: handle.x, y: handle.y - i * 12, id: 1 }] }); await sleep(50); if (i % 10 === 0) mid.push(await S()); }
await sleep(100);
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(1500);
out.slowHandleDrag = { mid, end: await S() };
await shot(page, "mus8-p390-slow-handle-drag");
// mouse via playwright, from handle
await page.mouse.move(handle.x, handle.y); await page.mouse.down(); await sleep(150);
for (let i = 1; i <= 30; i++) { await page.mouse.move(handle.x, handle.y - i * 12); await sleep(40); }
await page.mouse.up(); await sleep(1500);
out.mouseHandleDrag = await S();
console.log(JSON.stringify(out, null, 1));
await browser.close();
