import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "p390"; const vp = VPS[k];
const S = (page) => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; const el = document.querySelector('[aria-label*="plaque" i]'); const r = el?.getBoundingClientRect(); return { sheet: s.sheet, hdrTop: r && Math.round(r.y), hdrH: r && Math.round(r.height), label: el?.getAttribute("aria-label") }; });
const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
await page.locator('button[aria-label^="Approach"]').nth(4).click(); await sleep(2600);
const out = { start: await S(page) };
// 1) Playwright touchscreen tap on header
await page.touchscreen.tap(195, 745); await sleep(1200); out.afterPwTap = await S(page); await shot(page, `mus5-${k}-01-after-tap`);
// 2) keyboard on the sheet: focus + Enter
await page.evaluate(() => document.querySelector('[aria-label*="plaque" i]')?.focus()); await page.keyboard.press("Enter"); await sleep(1200); out.afterEnter = await S(page); await shot(page, `mus5-${k}-02-after-enter`);
await page.keyboard.press("Enter"); await sleep(1200); out.afterEnter2 = await S(page);
// 3) mouse drag (pointer events, mouse) on the header
const y0 = out.afterEnter2.hdrTop + 30;
await page.mouse.move(195, y0); await page.mouse.down(); for (let i = 1; i <= 16; i++) { await page.mouse.move(195, y0 - i * 25); await sleep(25); } await page.mouse.up(); await sleep(1300);
out.afterMouseDrag = await S(page); await shot(page, `mus5-${k}-03-after-mouse-drag`);
// 4) CDP touch drag with pointer capture check — log pointer events on the header
await page.evaluate(() => { window.__evs = []; const el = document.querySelector('[aria-label*="plaque" i]'); ["pointerdown", "pointermove", "pointerup", "pointercancel", "touchstart", "touchmove", "touchend", "click"].forEach((t) => el.addEventListener(t, (e) => window.__evs.push(t + (e.pointerType ? ":" + e.pointerType : "")), { capture: true })); });
const cdp = await page.context().newCDPSession(page);
const y1 = out.afterMouseDrag.hdrTop + 30;
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: y1, id: 1 }] });
for (let i = 1; i <= 16; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: y1 - i * 25, id: 1 }] }); await sleep(25); }
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await sleep(1300);
out.afterCdpDrag = { ...(await S(page)), evs: await page.evaluate(() => window.__evs.slice(0, 12).join(",") + " … n=" + window.__evs.length) };
await shot(page, `mus5-${k}-04-after-cdp-drag`);
out.log = log.filter((l) => !/ERR_ABORTED/.test(l));
save(`museum5-${k}.json`, out); console.log(JSON.stringify(out, null, 1));
await browser.close();
