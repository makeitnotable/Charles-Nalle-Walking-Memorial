// Phone peek-sheet drag on /paintings approach
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const k = process.argv[2] || "p390"; const vp = VPS[k];
async function touchDrag(page, x0, y0, x1, y1, steps = 16, ms = 420) { const cdp = await page.context().newCDPSession(page); const t = (x, y) => [{ x, y, id: 1 }]; await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: t(x0, y0) }); for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: t(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps) }); await sleep(ms / steps); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
async function tap(page, x, y) { const cdp = await page.context().newCDPSession(page); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] }); await sleep(50); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await cdp.detach(); }
const S = (page) => page.evaluate(() => { const m = window.__museum; const s = typeof m?.state === "function" ? m.state() : m?.state; return s && { mode: s.mode, approached: s.approached, alive: s.alive, sheet: s.sheet }; });
const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" }); await sleep(2000);
const geo = await page.evaluate(() => { const s = document.getElementById("museum-slot"); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
await page.evaluate((y) => scrollTo(0, y), geo.top + (geo.h - vp.height) * 0.4); await sleep(1500);
await page.locator('button[aria-label^="Approach"]').nth(9).click(); await sleep(2600); // portrait work
await shot(page, `mus3-${k}-01-approach-portrait`);
const rec = { s0: await S(page) };
rec.els = await page.evaluate(() => [...document.querySelectorAll("#museum-slot [aria-label], #museum-slot button, #museum-slot [role]")].map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName} role=${e.getAttribute("role")} "${e.getAttribute("aria-label") || e.textContent.trim().slice(0, 30)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} ta=${getComputedStyle(e).touchAction}`; }).filter((s) => !/Approach/.test(s)));
// find sheet header: element containing "Mark Priest" text at the bottom
const hdrEl = () => document.querySelector('[aria-label*="plaque" i]');
const hdr = await page.evaluate(() => { const el = document.querySelector('[aria-label*="plaque" i]'); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 30, top: r.y, label: el.getAttribute("aria-label") }; });
rec.hdr = hdr;
await touchDrag(page, hdr.x, hdr.y, hdr.x, hdr.y - 420, 16, 450); await sleep(1400);
rec.afterUp = { ...(await S(page)), pr: await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i]'); const r = b?.getBoundingClientRect(); return r && [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }), hdrTop: await page.evaluate(() => { const el = document.querySelector('[aria-label*="plaque" i]'); return Math.round(el.getBoundingClientRect().y); }) };
await shot(page, `mus3-${k}-02-sheet-up`);
const y2 = rec.afterUp.hdrTop + 30;
await touchDrag(page, hdr.x, y2, hdr.x, y2 + 420, 16, 450); await sleep(1400);
rec.afterDown = { ...(await S(page)), hdrTop: await page.evaluate(() => { const el = document.querySelector('[aria-label*="plaque" i]'); return Math.round(el.getBoundingClientRect().y); }) };
await shot(page, `mus3-${k}-03-sheet-down`);
// tap header
await tap(page, hdr.x, rec.afterDown.hdrTop + 30); await sleep(1300);
rec.afterTapHdr = { ...(await S(page)), hdrTop: await page.evaluate(() => { const el = document.querySelector('[aria-label*="plaque" i]'); return Math.round(el.getBoundingClientRect().y); }) };
await shot(page, `mus3-${k}-04-sheet-tap`);
// tap the painting while sheet expanded → alive
const pr = await page.evaluate(() => { const b = document.querySelector('button[aria-label*="to life" i]'); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
await tap(page, pr.x, pr.y); await sleep(2200); rec.afterTapPainting = await S(page); await shot(page, `mus3-${k}-05-alive-portrait`);
// landscape phone quick look
rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
save(`museum3-${k}.json`, rec); console.log(JSON.stringify(rec, null, 1));
await browser.close();
