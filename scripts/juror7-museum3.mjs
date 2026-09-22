// Approach from the initial scroll position (stage partly under the header): where does the composition land?
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchTap, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "1440";
const V = VIEWPORTS[vp];
const tag = "museum-" + vp;
const errs = []; const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
const session = await cdp(page);
const st = () => page.evaluate(() => { const s = window.__museum?.state; return s ? { mode: s.mode, approached: s.approached, alive: s.alive, zoom: s.zoom, running: s.running } : null; });
const rect = (i) => page.evaluate((i) => { const r = window.__museum?.paintingRect?.(i); return r ? { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) } : null; }, i);
const vis = () => page.evaluate(() => { const q = (sel, re) => [...document.querySelectorAll(sel)].filter((b) => re.test(b.getAttribute("aria-label") || b.textContent || "")).map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }); return { back: q("button", /Back to the hall/i), stage: (() => { const cv = document.querySelector("canvas"); const r = cv.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; })(), scrollY: Math.round(scrollY), vh: innerHeight }; });
await goto(page, "/paintings"); await sleep(4000);
log.rest = { st: await st(), r0: await rect(0), r1: await rect(1), vis: await vis() };
await shot(page, `${tag}-40-rest-top`);
// click the first painting that is visible in the viewport
const r0 = log.rest.r0;
const cy = Math.min(V.height - 20, (r0.t + Math.min(r0.b, V.height)) / 2);
const cx = (r0.l + r0.r) / 2;
log.clickAt = [cx, cy];
if (V.mobile) await touchTap(session, cx, cy); else await page.mouse.click(cx, cy);
await sleep(600); log.t600 = { st: await st(), r0: await rect(0), vis: await vis() };
await sleep(2400); log.t3000 = { st: await st(), r0: await rect(0), vis: await vis() };
await shot(page, `${tag}-41-approach-from-top`);
await sleep(3000); log.t6000 = { st: await st(), r0: await rect(0), vis: await vis() };
// can the visitor scroll now? wheel / touch swipe on the stage
if (V.mobile) { const s = await session; await import("./juror7-lib.mjs").then((m) => m.touchDrag(s, { x: V.width / 2, y: V.height * 0.7 }, { x: V.width / 2, y: V.height * 0.3 }, 12, 16)); }
else { await page.mouse.move(V.width / 2, V.height * 0.7); await page.mouse.wheel(0, 500); }
await sleep(1200); log.afterScrollAttempt = { st: await st(), r0: await rect(0), vis: await vis() };
await shot(page, `${tag}-42-after-scroll-attempt`);
// wheel UP (zoom in) then wheel down: does the page scroll once zoom is back at 1?
if (!V.mobile) { await page.mouse.wheel(0, -300); await sleep(800); log.afterWheelUp = { st: await st(), vis: await vis() }; await page.mouse.wheel(0, 300); await sleep(800); await page.mouse.wheel(0, 500); await sleep(800); log.afterWheelDownAgain = { st: await st(), vis: await vis() }; }
// click on the wall (visible band, away from painting/card): does it exit approach?
{ const y = 430 + 30; const x = V.width - 60; if (V.mobile) await touchTap(session, V.width / 2, Math.min(V.height - 30, (await vis()).stage[1] + 40)); else await page.mouse.click(x, Math.min(V.height - 30, (await vis()).stage[1] + 40)); await sleep(1500); log.afterWallClick = { st: await st(), vis: await vis() }; }
// keyboard: PageDown / space
await page.keyboard.press("PageDown"); await sleep(1000); log.afterPageDown = { vis: await vis(), st: await st() };
// Esc
await page.keyboard.press("Escape"); await sleep(1500); log.afterEsc = { st: await st(), vis: await vis() };
await shot(page, `${tag}-43-after-esc`);
// Now the proper path: scroll so the stage is fully in view, then click a painting
await page.evaluate(() => { const cv = document.querySelector("canvas"); scrollTo({ top: cv.getBoundingClientRect().top + scrollY, behavior: "instant" }); }); await sleep(1500);
log.stageInView = { vis: await vis(), r0: await rect(0), st: await st() };
const rr = log.stageInView.r0;
if (rr && rr.b > rr.t) { const x = (rr.l + rr.r) / 2, y = (rr.t + rr.b) / 2; if (V.mobile) await touchTap(session, x, y); else await page.mouse.click(x, y); await sleep(2500); log.approachProper = { st: await st(), r0: await rect(0), vis: await vis() }; await shot(page, `${tag}-44-approach-proper`); }
writeJson(`museum3-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
await browser.close();
