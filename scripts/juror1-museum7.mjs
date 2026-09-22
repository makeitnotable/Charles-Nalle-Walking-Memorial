import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "p390"; const vp = VPS[k];
const S = (page) => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; const el = document.querySelector('[aria-label*="plaque" i]'); const sh = el?.closest("[class*=sheet]:not(.museum-sheet-head)") || el?.parentElement; const r = el?.getBoundingClientRect(); return { sheet: s.sheet, hdrTop: r && Math.round(r.y), sheetTf: sh && getComputedStyle(sh).transform, sheetCls: sh && sh.className.toString().slice(0, 80), sheetTop: sh && Math.round(sh.getBoundingClientRect().y), sheetH: sh && Math.round(sh.getBoundingClientRect().height) }; });
const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
await page.locator('button[aria-label^="Approach"]').nth(4).click(); await sleep(2600);
const out = { start: await S(page) };
const hb = await page.evaluate(() => { const r = document.querySelector('[aria-label*="plaque" i]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 30 }; }); const X0 = hb.x, Y0 = hb.y; out.hb = hb;
const cdp = await page.context().newCDPSession(page);
const dragUp = async (dir) => {
  const mid = [];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: X0, y: Y0, id: 1 }] }); await sleep(100);
  for (let i = 1; i <= 20; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: X0, y: Y0 - dir * i * 15, id: 1 }] }); await sleep(30); if (i % 5 === 0) mid.push(await S(page)); }
  await sleep(50);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(1200);
  return { mid, end: await S(page) };
};
out.up = await dragUp(1); await shot(page, `mus7-${k}-01-after-up`);
out.down = await dragUp(-1); await shot(page, `mus7-${k}-02-after-down`);
// tap
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: X0, y: Y0, id: 1 }] }); await sleep(60); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(1200);
out.tap = await S(page);
// keyboard for comparison
await page.evaluate(() => document.querySelector('[aria-label*="plaque" i]').focus()); await page.keyboard.press("Enter"); await sleep(1200); out.kbd = await S(page); await shot(page, `mus7-${k}-03-kbd-full`);
// now drag down from full
out.downFromFull = await dragUp(-1); await shot(page, `mus7-${k}-04-drag-down-from-full`);
save(`museum7-${k}.json`, out); console.log(JSON.stringify(out, null, 1));
await browser.close();
