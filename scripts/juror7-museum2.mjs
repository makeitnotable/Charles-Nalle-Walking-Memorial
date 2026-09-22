// Museum focused: tap-to-life (touch / mouse), keyboard path, Skip the hall, wheel zoom
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchTap, VIEWPORTS } from "./juror7-lib.mjs";
const vp = process.argv[2] || "390";
const V = VIEWPORTS[vp];
const tag = "museum-" + vp;
const errs = []; const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
const session = await cdp(page);
const W = V.width, H = V.height;
const st = () => page.evaluate(() => { const s = window.__museum?.state; return s ? { mode: s.mode, approached: s.approached, alive: s.alive, zoom: s.zoom, running: s.running, yaw: Math.round(s.look.yaw * 100) / 100, sheet: s.sheet } : null; });
const rect = (i) => page.evaluate((i) => window.__museum?.paintingRect?.(i), i);
const aliveBtn = () => page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /life|rest/i.test(b.getAttribute("aria-label") || "")).map((b) => { const r = b.getBoundingClientRect(); return { l: b.getAttribute("aria-label"), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], pe: getComputedStyle(b).pointerEvents, op: getComputedStyle(b).opacity }; }));
const vids = () => page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ paused: v.paused, t: Math.round(v.currentTime * 10) / 10, w: v.videoWidth, src: (v.currentSrc || v.src || "").split("/").pop(), rs: v.readyState })));

await goto(page, "/paintings"); await sleep(4000);
await page.evaluate(() => { const cv = document.querySelector("canvas"); scrollTo({ top: cv.getBoundingClientRect().top + scrollY + 200, behavior: "instant" }); }); await sleep(1500);
// approach painting 0 via dot
const dot = page.locator('button[aria-label^="Approach"]').first(); let b = await dot.boundingBox();
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2500);
log.s0 = await st(); log.r0 = await rect(0); log.btn0 = await aliveBtn();
const r = log.r0; const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
// 1) CDP touch tap (phones) or mouse click (desktop)
if (V.mobile) await touchTap(session, cx, cy); else await page.mouse.click(cx, cy);
await sleep(2500);
log.after1 = { st: await st(), btn: await aliveBtn(), vids: await vids() };
await shot(page, `${tag}-20-after-tap1`);
// 2) if not alive, try Playwright touchscreen tap / mouse click again
if (log.after1.st && log.after1.st.alive === -1) {
  if (V.mobile) await page.touchscreen.tap(cx, cy); else await page.mouse.click(cx, cy);
  await sleep(2500);
  log.after2 = { st: await st(), btn: await aliveBtn(), vids: await vids() };
  await shot(page, `${tag}-21-after-tap2`);
}
// 3) if still not, click the invisible button via DOM
if ((log.after2 || log.after1).st.alive === -1) {
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /life/i.test(b.getAttribute("aria-label") || ""))?.click());
  await sleep(2500);
  log.after3 = { st: await st(), btn: await aliveBtn(), vids: await vids() };
  await shot(page, `${tag}-22-after-domclick`);
}
// wait more for the video
await sleep(3000);
log.afterWait = { st: await st(), vids: await vids() };
await shot(page, `${tag}-23-alive-late`);
// tap again to let it rest
if (V.mobile) await touchTap(session, cx, cy); else await page.mouse.click(cx, cy);
await sleep(1500);
log.afterRest = { st: await st(), btn: await aliveBtn() };
// wheel zoom (desktop): zoom past threshold turns it on
if (!V.mobile) { await page.mouse.move(cx, cy); for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -120); await sleep(80); } await sleep(1500); log.afterWheelZoom = { st: await st(), vids: await vids() }; await shot(page, `${tag}-24-wheel-zoom`); for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 120); await sleep(80); } await sleep(1200); log.afterWheelOut = { st: await st() }; }
// Esc → rail
await page.keyboard.press("Escape"); await sleep(1500); log.afterEsc = await st();
// keyboard path from rail: Tab through the stage controls
await page.evaluate(() => { const cv = document.querySelector("canvas"); scrollTo({ top: cv.getBoundingClientRect().top + scrollY + 200, behavior: "instant" }); }); await sleep(800);
await page.evaluate(() => document.querySelector('button[aria-label="Skip the hall"]')?.focus());
await page.keyboard.press("Tab");
const seq = [];
for (let i = 0; i < 16; i++) { seq.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 36) + "@" + Math.round(r.y); })); const cur = seq[seq.length - 1]; if (/Approach “Holeur/.test(cur)) break; await page.keyboard.press("Tab"); }
log.tabSeq = seq;
log.focusRing = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 60) }; });
await shot(page, `${tag}-25-kb-focus-dot`);
await page.keyboard.press("Enter"); await sleep(2200); log.kbEnter = await st();
await shot(page, `${tag}-26-kb-approach`);
await page.keyboard.press("ArrowRight"); await sleep(2200); log.kbRight = await st();
await page.keyboard.press("ArrowLeft"); await sleep(2200); log.kbLeft = await st();
// Tab to the alive button and press Enter
for (let i = 0; i < 12; i++) { const l = await page.evaluate(() => document.activeElement.getAttribute("aria-label") || ""); if (/life|rest/i.test(l)) break; await page.keyboard.press("Tab"); }
log.kbFocusAlive = await page.evaluate(() => document.activeElement.getAttribute("aria-label"));
await page.keyboard.press("Enter"); await sleep(2500); log.kbAlive = { st: await st(), vids: await vids() };
await page.keyboard.press("Escape"); await sleep(1500); log.kbEsc = await st();
// arrows in rail = look
await page.keyboard.press("ArrowRight"); await sleep(900); log.railArrow = await st();
await page.keyboard.press("ArrowLeft"); await sleep(900);
// Skip the hall
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(1000);
const skip = page.locator('button[aria-label="Skip the hall"], button:has-text("Skip")').locator("visible=true").first();
log.skipCount = await skip.count();
if (log.skipCount) { const sb = await skip.boundingBox(); log.skipBox = sb; await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(3000); log.afterSkipScroll = await page.evaluate(() => Math.round(scrollY)); await shot(page, `${tag}-27-after-skip`); }
// menu on /paintings in rail mode
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(1000);
const mb = await page.locator('button[aria-label="Open menu"]').boundingBox();
log.menuBtn = mb;
if (mb) { await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await sleep(900); await shot(page, `${tag}-28-menu-open`); log.menuOpen = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); return b ? b.getBoundingClientRect().toJSON() : null; }); await page.keyboard.press("Escape"); await sleep(600); }
writeJson(`museum2-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
