// Museum phone approach + sheet. usage: node scripts/juror8-museum-phone.mjs p390
import { launch, ctx, VPS, watch, shot, sleep, go, save, touchDrag, touchTap } from "./juror8-lib.mjs";
const key = process.argv[2] || "p390";
const vp = VPS[key];
const tag = `musph-${key}`;
const out = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const st = () => page.evaluate(() => { const s = window.__museum?.state; return s ? { mode: s.mode, railIdx: s.railIdx, approached: s.approached, zoom: s.zoom, yaw: +s.cur.yaw.toFixed(2), alive: s.alive, sheet: s.sheet } : null; });
const pr = (i) => page.evaluate((i) => { const r = window.__museum?.paintingRect?.(i); if (!r) return null; return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), behind: r.behind, cx: Math.round((r.left + r.right) / 2), cy: Math.round((r.top + r.bottom) / 2) }; }, i);
const uiInfo = () => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false; let n = e; while (n) { const cs = getComputedStyle(n); if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") return false; n = n.parentElement; } return true; };
  const rect = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom) }; };
  const all = [...document.querySelectorAll("button, [role=button], aside, section, div")];
  const back = all.filter((e) => e.tagName === "BUTTON" && /Back to the hall/i.test(e.textContent) && vis(e)).map(rect);
  const sheetBtns = all.filter((e) => e.tagName === "BUTTON" && /plaque|sheet|expand|collapse/i.test(e.getAttribute("aria-label") || "") && vis(e)).map((e) => ({ aria: e.getAttribute("aria-label"), ...rect(e) }));
  const plaque = [...document.querySelectorAll(".museum-sheet-head, .museum-sheet")].filter(vis).map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 40), ...rect(e), txt: e.textContent.trim().replace(/\s+/g, " ").slice(0, 80) }));
  const dots = [...document.querySelectorAll("button[aria-label^='Approach']")].filter(vis).map(rect);
  return { back, sheetBtns, plaque, dots: dots.length ? { y: dots[0].y, x0: dots[0].x, x1: dots[dots.length - 1].x } : null, quote: all.filter((e) => e.tagName === "P" && /“/.test(e.textContent) && vis(e)).length };
});
await go(page, "/paintings", 5000);
await page.evaluate(() => { const c = document.querySelector("canvas"); window.scrollTo(0, c.getBoundingClientRect().top + scrollY); }); await sleep(1000);
// scroll a bit so a painting is near
for (let i = 0; i < 3; i++) { await touchDrag(page, vp.width / 2, vp.height * 0.7, vp.width / 2, vp.height * 0.3, 8, 16); await sleep(400); }
await sleep(1200);
await shot(page, `${tag}-01-rail`);
// find a tappable painting: not behind, centre inside viewport
let target = null;
for (let i = 0; i < 10; i++) { const r = await pr(i); if (r && !r.behind && r.cx > 10 && r.cx < vp.width - 10 && r.cy > 100 && r.cy < vp.height - 100 && r.w < vp.width * 2) { if (!target || r.w * r.h > target.r.w * target.r.h) target = { i, r }; } }
out.target = target;
if (!target) { // scroll one more and retry
  await touchDrag(page, vp.width / 2, vp.height * 0.7, vp.width / 2, vp.height * 0.4, 8, 16); await sleep(1200);
  for (let i = 0; i < 10; i++) { const r = await pr(i); if (r && !r.behind && r.cx > 10 && r.cx < vp.width - 10 && r.cy > 100 && r.cy < vp.height - 100 && r.w < vp.width * 2) { if (!target || r.w * r.h > target.r.w * target.r.h) target = { i, r }; } }
  out.target2 = target;
}
if (target) {
  await touchTap(page, target.r.cx, target.r.cy); await sleep(2500);
  await shot(page, `${tag}-02-approach-peek`);
  out.approach = { st: await st(), ui: await uiInfo(), rect: await pr(target.i), vw: vp.width, vh: vp.height };
  // drag the sheet header up
  const pl = out.approach.ui.plaque[0] || (out.approach.ui.sheetBtns[0]);
  if (pl) {
    const hx = pl.x + pl.w / 2, hy = pl.y + 30;
    await touchDrag(page, hx, hy, hx, hy - 320, 14, 16); await sleep(1300);
    await shot(page, `${tag}-03-sheet-up`);
    out.sheetUp = { st: await st(), ui: await uiInfo(), rect: await pr(target.i) };
    // tap the header to toggle? drag down instead
    const pl2 = out.sheetUp.ui.plaque[0];
    if (pl2) { await touchDrag(page, pl2.x + pl2.w / 2, pl2.y + 30, pl2.x + pl2.w / 2, pl2.y + 380, 14, 16); await sleep(1300); }
    await shot(page, `${tag}-04-sheet-down`);
    out.sheetDown = { st: await st(), ui: await uiInfo(), rect: await pr(target.i) };
    // tap the header (peek → full toggle?)
    const pl3 = out.sheetDown.ui.plaque[0];
    if (pl3) { await touchTap(page, pl3.x + pl3.w / 2, pl3.y + 30); await sleep(1200); }
    await shot(page, `${tag}-05-sheet-tap`);
    out.sheetTap = { st: await st(), ui: await uiInfo() };
  }
  // tap painting to bring to life
  const r2 = await pr(target.i);
  if (r2) { await touchTap(page, r2.cx, r2.cy); await sleep(2000); }
  await shot(page, `${tag}-06-alive`);
  out.alive = { st: await st() };
  // Back to the hall
  const bb = out.approach.ui.back[0];
  if (bb) { await touchTap(page, bb.x + bb.w / 2, bb.y + bb.h / 2); await sleep(1500); }
  out.afterBack = { st: await st() };
  await shot(page, `${tag}-07-back`);
}
// last painting via dot rail
const dots = page.locator("button[aria-label^='Approach']");
const lb = await dots.last().boundingBox();
if (lb) { await touchTap(page, lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(3000); await shot(page, `${tag}-08-last`); out.last = { st: await st(), ui: await uiInfo(), rect: await pr(9) }; }
await page.keyboard.press("Escape"); await sleep(1200);
out.esc = { st: await st() };
out.log = log;
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
