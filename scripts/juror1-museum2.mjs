// Museum: click a painting in the rail (approach), tap it (alive), tap again (rest), zoom, Esc, Back; phone sheet.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const ks = (process.argv[2] || "d1440,p390").split(",");
async function tap(page, x, y) { const cdp = await page.context().newCDPSession(page); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); await sleep(50); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
async function touchDrag(page, x0, y0, x1, y1, steps = 14, ms = 320) { const cdp = await page.context().newCDPSession(page); const t = (x, y) => [{ x, y, id: 1 }]; await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) }); for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps) }); await sleep(ms / steps); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
const S = (page) => page.evaluate(() => { const m = window.__museum; const s = typeof m?.state === "function" ? m.state() : m?.state; return s && { mode: s.mode, railIdx: s.railIdx, approached: s.approached, alive: s.alive, zoom: s.zoom, sheet: s.sheet, yaw: +s.look.yaw.toFixed(2) }; });
const R = {};
for (const k of ks) {
  const vp = VPS[k]; const click = vp.mobile ? tap : (p, x, y) => p.mouse.click(x, y);
  const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
  const rec = {};
  const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
  const railLen = geo.h - vp.height;
  await page.evaluate((y) => scrollTo(0, y), geo.top + railLen * 0.3); await sleep(2200);
  rec.probe = await page.evaluate(() => { const m = window.__museum; const out = []; for (let i = 0; i < 10; i++) { try { const r = m.paintingRect(i); out.push(r && JSON.stringify(r).slice(0, 120)); } catch (e) { out.push("ERR " + e); } } return out; });
  // pick a painting rect fully in view (scan rail positions until a large one is ahead)
  let target = null;
  for (let f = 0.28; f <= 0.7 && !target; f += 0.01) {
    await page.evaluate((y) => scrollTo(0, y), geo.top + railLen * f); await sleep(1300);
    target = await page.evaluate(() => { const m = window.__museum; let best = null; for (let i = 0; i < 10; i++) { const r = m.paintingRect(i); if (!r || r.behind) continue; const w = r.right - r.left, h = r.bottom - r.top; if (w >= (innerWidth < 800 ? 44 : 110) && r.left > 0 && r.right < innerWidth && r.top > 0 && r.bottom < innerHeight) { if (!best || w > best.w) best = { i, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, w, h }; } } return best; });
  }
  rec.target = target;
  if (target) {
    await click(page, target.x, target.y); await sleep(2600);
    rec.afterClick = await S(page);
    await shot(page, `mus2-${k}-01-approach-by-click`);
    // tap the painting → alive
    const pr = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i], button[aria-label*="rest" i]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, label: b.getAttribute("aria-label"), cx: (r.x + r.width / 2) / innerWidth, cy: (r.y + r.height / 2) / innerHeight }; });
    rec.paintingBtn = pr;
    if (pr) {
      await click(page, pr.x, pr.y); await sleep(2500);
      rec.afterTap = { ...(await S(page)), video: await page.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused && v.currentTime > 0).length), label: await page.evaluate(() => document.querySelector('button[aria-label*="to life" i], button[aria-label*="rest" i]')?.getAttribute("aria-label")) };
      await shot(page, `mus2-${k}-02-alive`);
      await sleep(1200); await shot(page, `mus2-${k}-03-alive-later`);
      await click(page, pr.x, pr.y); await sleep(1500);
      rec.afterTap2 = await S(page);
      await shot(page, `mus2-${k}-04-rest-again`);
      if (!vp.mobile) {
        // wheel zoom in → alive again? then out
        await page.mouse.move(pr.x, pr.y); await page.mouse.wheel(0, -600); await sleep(1500); rec.afterWheelIn = await S(page); await shot(page, `mus2-${k}-05-zoomed`);
        await page.mouse.wheel(0, 900); await sleep(1500); rec.afterWheelOut = await S(page);
      }
    }
    if (vp.mobile && vp.width < 800) {
      const sheet = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="plaque" i]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height, label: b.getAttribute("aria-label"), top: r.y }; });
      rec.sheet = sheet;
      if (sheet) {
        await touchDrag(page, sheet.x, sheet.y, sheet.x, sheet.y - 400, 16, 420); await sleep(1300);
        rec.sheetUp = { ...(await S(page)), pr: await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i], button[aria-label*="rest" i]'); const r = b?.getBoundingClientRect(); const sh = document.querySelector('button[aria-label*="plaque" i]')?.getBoundingClientRect(); return r && { painting: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], sheetTop: sh && Math.round(sh.y) }; }) };
        await shot(page, `mus2-${k}-06-sheet-up`);
        // tap sheet header toggles?
        const sh2 = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="plaque" i]'); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
        await touchDrag(page, sh2.x, sh2.y, sh2.x, sh2.y + 400, 16, 420); await sleep(1300);
        rec.sheetDown = await S(page);
        await shot(page, `mus2-${k}-07-sheet-down`);
        await click(page, sh2.x, sh2.y); await sleep(1300); rec.sheetTap = await S(page); await shot(page, `mus2-${k}-08-sheet-tap`);
      }
    }
    // Esc (desktop) / Back
    if (!vp.mobile) { await page.keyboard.press("Escape"); await sleep(1800); rec.afterEsc = await S(page); await shot(page, `mus2-${k}-09-esc`); }
    else { const b = page.getByRole("button", { name: /back to the hall/i }); if (await b.count()) { await b.first().click(); await sleep(1800); rec.afterBack = await S(page); await shot(page, `mus2-${k}-09-back`); } }
  }
  // double-tap on wall recentres? look away then double tap
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R[k] = rec; save(`museum2-${k}.json`, rec);
  await c.close();
}
console.log(JSON.stringify(R, null, 1));
await browser.close();
