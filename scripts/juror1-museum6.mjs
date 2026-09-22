import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "p390"; const vp = VPS[k];
const S = (page) => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; const el = document.querySelector('[aria-label*="plaque" i]'); const r = el?.getBoundingClientRect(); return { sheet: s.sheet, hdrTop: r && Math.round(r.y) }; });
const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
await page.locator('button[aria-label^="Approach"]').nth(4).click(); await sleep(2600);
const out = { start: await S(page) };
out.efp = await page.evaluate(() => [[195, 733], [195, 745], [195, 790], [60, 800]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return `${x},${y}: ${e?.tagName}.${(e?.className || "").toString().slice(0, 40)} aria=${e?.getAttribute("aria-label")} ta=${getComputedStyle(e).touchAction} pe=${getComputedStyle(e).pointerEvents}`; }));
await page.evaluate(() => { window.__evs = []; ["pointerdown", "pointermove", "pointerup", "pointercancel", "gotpointercapture", "lostpointercapture", "click"].forEach((t) => window.addEventListener(t, (e) => { if (window.__evs.length < 40) window.__evs.push(`${t}:${e.pointerType || ""}@${e.target?.tagName}${e.target?.getAttribute?.("aria-label") ? "[" + e.target.getAttribute("aria-label").slice(0, 14) + "]" : ""}${e.defaultPrevented ? "!" : ""}`); }, { capture: true })); });
const cdp = await page.context().newCDPSession(page);
// slow drag with a hold first
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 745, id: 1, force: 1 }] });
await sleep(120);
for (let i = 1; i <= 20; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 745 - i * 20, id: 1, force: 1 }] }); await sleep(30); }
await sleep(80);
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await sleep(1200);
out.afterSlowDrag = { ...(await S(page)), evs: await page.evaluate(() => window.__evs) };
await shot(page, `mus6-${k}-01-after-slow-drag`);
// tap on the handle bar via CDP with force
await page.evaluate(() => { window.__evs = []; });
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 733, id: 1, force: 1 }] }); await sleep(60);
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(1200);
out.afterTapHandle = { ...(await S(page)), evs: await page.evaluate(() => window.__evs) };
// mouse-type via CDP mouse events (pointerType mouse) drag
await page.evaluate(() => { window.__evs = []; });
const y0 = out.afterTapHandle.hdrTop + 30;
await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 195, y: y0, button: "left", clickCount: 1 });
for (let i = 1; i <= 20; i++) { await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 195, y: y0 - i * 20, button: "left", buttons: 1 }); await sleep(25); }
await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 195, y: y0 - 400, button: "left", clickCount: 1 });
await sleep(1200);
out.afterMouse = { ...(await S(page)), evs: await page.evaluate(() => window.__evs) };
await shot(page, `mus6-${k}-02-after-mouse`);
save(`museum6-${k}.json`, out); console.log(JSON.stringify(out, null, 1));
await browser.close();
