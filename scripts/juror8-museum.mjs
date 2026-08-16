// Museum as a visitor. usage: node scripts/juror8-museum.mjs d1440
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating, touchDrag, touchTap } from "./juror8-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VPS[key];
const tag = `mus-${key}`;
const out = { steps: {} };
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const M = (expr) => page.evaluate(expr);
const st = () => page.evaluate(() => { const s = window.__museum?.state; return s ? { mode: s.mode, railIdx: s.railIdx, railT: +s.railT.toFixed(2), approached: s.approached, zoom: s.zoom, yaw: +s.cur.yaw.toFixed(2), alive: s.alive, sheet: s.sheet } : null; });
const ui = () => page.evaluate(() => {
  const q = (sel) => [...document.querySelectorAll(sel)];
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false; let n = e; while (n) { const cs = getComputedStyle(n); if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") return false; n = n.parentElement; } return true; };
  const rect = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) }; };
  const chip = q("div, p, span, button").filter((e) => e.children.length <= 2 && /scroll to walk|Face forward|The Museum/i.test(e.textContent) && vis(e));
  const chipInfo = chip.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const lines = new Set([...rg.getClientRects()].map((r) => Math.round(r.top))).size; return { txt: e.textContent.trim().replace(/\s+/g, " "), lines, ...rect(e) }; });
  const skip = q("button[aria-label='Skip the hall']").filter(vis).map(rect);
  const burger = q(".cnwm-menu-burger").map((e) => ({ ...rect(e), vis: vis(e) }));
  const back = q("button, a").filter((e) => /Back to the hall/i.test(e.textContent) && vis(e)).map(rect);
  const alive = q("button[aria-label*='to life'], button[aria-label*='rest']").filter(vis).map((e) => ({ aria: e.getAttribute("aria-label"), ...rect(e) }));
  const dots = q("button[aria-label^='Approach']").filter(vis).map(rect);
  const card = q("[class*=plaque], aside, [class*=card], [class*=sheet]").filter((e) => /Mark Priest|Nalle Series/.test(e.textContent) && vis(e)).map((e) => ({ ...rect(e), txt: e.textContent.trim().replace(/\s+/g, " ").slice(0, 60) }));
  const expand = q("button[aria-label*='plaque'], button[aria-label*='sheet']").filter(vis).map((e) => ({ aria: e.getAttribute("aria-label"), ...rect(e) }));
  return { chip: chipInfo, skip, burger, back, alive, dotsN: dots.length, dots: dots.length ? { x: dots[0].x, y: dots[0].y, r: dots[dots.length - 1].r } : null, card, expand, scrollY: Math.round(scrollY), stageTop: Math.round(document.querySelector("canvas")?.getBoundingClientRect().top ?? -1) };
});
const pr = (i) => page.evaluate((i) => { const r = window.__museum?.paintingRect?.(i); if (!r) return null; const c = document.querySelector("canvas").getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), behind: r.behind, canvasTop: Math.round(c.top), cx: Math.round((r.left + r.right) / 2), cy: Math.round((r.top + r.bottom) / 2) }; }, i);
const clickAt = async (x, y) => { if (vp.mobile) await touchTap(page, x, y); else await page.mouse.click(x, y); };
const clickLoc = async (loc) => { const b = await loc.boundingBox(); await clickAt(b.x + b.width / 2, b.y + b.height / 2); };

await go(page, "/paintings", 5000);
await shot(page, `${tag}-01-top`);
out.steps.top = { ui: await ui(), st: await st() };
// From the page top WITHOUT scrolling: click the visible painting (first work rect projected)
const p0 = await pr(0);
out.steps.p0FromTop = p0;
if (p0 && p0.y + p0.h > 0 && p0.y < vp.height) {
  await clickAt(p0.x + p0.w / 2, Math.min(vp.height - 10, p0.y + p0.h / 2));
  await sleep(2500);
  await shot(page, `${tag}-02-approach-from-top`);
  out.steps.approachFromTop = { ui: await ui(), st: await st(), rect: await pr(0) };
  // get out
  const back = page.locator("button:visible:has-text('Back to the hall')").first();
  if (await back.count()) { await clickLoc(back); await sleep(1500); }
  else { await page.keyboard.press("Escape"); await sleep(1500); }
  out.steps.afterBackFromTop = { ui: await ui(), st: await st() };
  await shot(page, `${tag}-03-back-from-top`);
} else out.steps.approachFromTop = "painting not visible from page top";
// scroll the stage flush and walk the rail
await page.evaluate(() => { const c = document.querySelector("canvas"); window.scrollTo(0, c.getBoundingClientRect().top + scrollY); });
await sleep(1200);
await shot(page, `${tag}-04-rail-flush`);
out.steps.railFlush = { ui: await ui(), st: await st() };
// walk: scroll down in steps
for (let i = 0; i < 6; i++) { if (vp.mobile) await touchDrag(page, vp.width / 2, vp.height * 0.7, vp.width / 2, vp.height * 0.3, 8, 16); else await page.mouse.wheel(0, 500); await sleep(400); }
await sleep(1200);
await shot(page, `${tag}-05-rail-mid`);
out.steps.railMid = { ui: await ui(), st: await st() };
// drag to look (horizontal drag on the canvas)
if (vp.mobile) await touchDrag(page, vp.width * 0.7, vp.height * 0.5, vp.width * 0.2, vp.height * 0.5, 12, 16);
else { await page.mouse.move(vp.width * 0.7, vp.height * 0.5); await page.mouse.down(); for (let i = 1; i <= 12; i++) { await page.mouse.move(vp.width * 0.7 - i * 40, vp.height * 0.5); await sleep(16); } await page.mouse.up(); }
await sleep(1200);
await shot(page, `${tag}-06-looked-away`);
out.steps.lookedAway = { ui: await ui(), st: await st() };
// Face forward
const ff = page.locator("button:visible:has-text('Face forward')").first();
if (await ff.count()) { await clickLoc(ff); await sleep(1200); out.steps.faceForward = { ui: await ui(), st: await st() }; await shot(page, `${tag}-07-face-forward`); } else out.steps.faceForward = "no Face forward button";
// click the nearest painting (railIdx)
const s1 = await st();
let idx = s1.railIdx, pi = null;
{ const cands = []; for (let i = 0; i < 10; i++) { const r = await pr(i); if (r && !r.behind && r.w > 40 && r.w < vp.width && r.h < vp.height && r.x >= 0 && r.x + r.w <= vp.width && r.y >= 0 && r.y + r.h <= vp.height) cands.push({ i, r, a: r.w * r.h }); } cands.sort((a, b) => b.a - a.a); if (cands[0]) { idx = cands[0].i; pi = cands[0].r; } }
out.steps.railIdxRect = { idx, pi };
if (pi) { await clickAt(pi.x + pi.w / 2, pi.y + pi.h / 2); await sleep(2500); }
await shot(page, `${tag}-08-approach`);
out.steps.approach = { ui: await ui(), st: await st(), rect: await pr(idx), vw: vp.width, vh: vp.height };
// tap the painting → alive
const pa = await pr(idx);
if (pa) { await clickAt(pa.x + pa.w / 2, pa.y + pa.h / 2); await sleep(2000); }
await shot(page, `${tag}-09-alive`);
out.steps.alive = { st: await st(), ui: await ui() };
// tap again → rest
if (pa) { await clickAt(pa.x + pa.w / 2, pa.y + pa.h / 2); await sleep(1000); }
out.steps.rest = { st: await st() };
// phone: sheet drag
if (vp.mobile && vp.width < 700) {
  const ex = out.steps.approach.ui.expand[0];
  if (ex) { await touchDrag(page, ex.x + ex.w / 2, ex.y + 20, ex.x + ex.w / 2, ex.y - 300, 12, 16); await sleep(1200); await shot(page, `${tag}-10-sheet-up`); out.steps.sheetUp = { st: await st(), ui: await ui(), rect: await pr(idx) }; await touchDrag(page, ex.x + ex.w / 2, 200, ex.x + ex.w / 2, vp.height - 60, 12, 16); await sleep(1200); await shot(page, `${tag}-11-sheet-down`); out.steps.sheetDown = { st: await st(), ui: await ui() }; }
}
// Esc back
await page.keyboard.press("Escape"); await sleep(1500);
out.steps.escBack = { st: await st(), ui: await ui() };
await shot(page, `${tag}-12-esc-back`);
// the LAST painting via dot rail
const lastDot = page.locator("button[aria-label^='Approach']").last();
await clickLoc(lastDot); await sleep(3000);
await shot(page, `${tag}-13-last`);
out.steps.last = { st: await st(), ui: await ui(), rect: await pr(9) };
// keyboard: arrows prev/next in approach
await page.keyboard.press("ArrowLeft"); await sleep(1500);
out.steps.arrowLeft = { st: await st() };
await shot(page, `${tag}-14-arrow-left`);
await page.keyboard.press("Escape"); await sleep(1200);
// keyboard walk: Tab to a dot and Enter
await page.keyboard.press("ArrowDown"); await sleep(600);
out.steps.arrowDownRail = { st: await st() };
// Back to the hall via button check on last painting again
await clickLoc(lastDot); await sleep(2500);
const backBtn = page.locator("button:visible:has-text('Back to the hall')").first();
out.steps.lastBackVisible = await backBtn.count();
if (await backBtn.count()) { await clickLoc(backBtn); await sleep(1200); }
out.steps.afterBackLast = { st: await st() };
// menu open on paintings (in rail mode)
out.steps.burgerBeforeUp = await ui().then((u) => u.burger);
if (vp.mobile) await touchDrag(page, vp.width / 2, vp.height * 0.4, vp.width / 2, vp.height * 0.55, 6, 16); else await page.mouse.wheel(0, -120);
await sleep(900);
out.steps.burgerAfterUp = await ui().then((u) => u.burger);
try { const bb = await page.locator(".cnwm-menu-burger").boundingBox(); await clickAt(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(800); await shot(page, `${tag}-15-menu`); out.steps.menuOpen = await page.evaluate(() => document.querySelector(".cnwm-menu-burger")?.getAttribute("aria-expanded")); const cb = await page.locator(".cnwm-menu-close").boundingBox(); if (cb) { await clickAt(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(700); } } catch (e) { out.steps.menuErr = String(e).slice(0, 200); }
// skip the hall
const skip = page.locator("button[aria-label='Skip the hall']");
if (await skip.count()) { await clickLoc(skip); await sleep(2000); await shot(page, `${tag}-16-skipped`); out.steps.skipped = { scrollY: await page.evaluate(() => scrollY) }; }
// grid tile aspect check + dialog
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight - innerHeight * 2.2)); await sleep(1000);
await shot(page, `${tag}-17-grid`);
out.steps.grid = await page.evaluate(() => [...document.querySelectorAll("button.painting-open")].map((b) => { const r = b.getBoundingClientRect(); return { aria: b.getAttribute("aria-label").slice(6, 40), ar: +(r.width / r.height).toFixed(2) }; }));
out.log = log;
save(`${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await c.close(); await browser.close();
