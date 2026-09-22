// Museum walk-through at one viewport
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, cdp, touchDrag, touchTap, VIEWPORTS } from "./juror7-lib.mjs";

const vp = process.argv[2] || "390";
const V = VIEWPORTS[vp];
const tag = "museum-" + vp;
const errs = [];
const log = {};
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
attachConsole(page, tag, errs);
const session = await cdp(page);
const W = V.width, H = V.height;

const floating = () =>
  page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button, a, [role=button], [class*='chip'], p, span, div")) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      let op = 1, e = el; while (e && e !== document.body) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
      if (op < 0.1) continue;
      const isFixedish = (() => { let x = el; while (x && x !== document.body) { const p = getComputedStyle(x).position; if (p === "fixed" || p === "absolute" || p === "sticky") return true; x = x.parentElement; } return false; })();
      const txt = (el.getAttribute("aria-label") || (el.children.length === 0 ? el.textContent : "") || "").trim().replace(/\s+/g, " ");
      if (!isFixedish) continue;
      if (!txt && !/button|a/i.test(el.tagName)) continue;
      if (r.width > innerWidth * 0.95 && r.height > innerHeight * 0.5) continue;
      out.push({ tag: el.tagName.toLowerCase(), t: txt.slice(0, 50), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], lines: el.children.length === 0 ? el.getClientRects().length : null });
    }
    return out.slice(0, 40);
  });
const state = () => page.evaluate(() => (window.__museum ? { state: window.__museum.state, calls: window.__museum.renderer?.info?.render?.calls } : null)).catch(() => null);
const chip = () =>
  page.evaluate(() => {
    const els = [...document.querySelectorAll("*")].filter((e) => e.children.length <= 3 && /Museum|Scroll to walk|drag to look|Face forward/i.test(e.textContent || "") && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 80);
    return els.slice(0, 3).map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 80), tag: e.tagName, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], lines: Math.round(r.height / (parseFloat(cs.lineHeight) || 16)), ws: cs.whiteSpace }; });
  });
const overlaps = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

await goto(page, "/paintings");
await sleep(5000);
await shot(page, `${tag}-01-rail-rest`);
log.rest = { chip: await chip(), floating: await floating(), state: await state() };
log.restCanvas = await page.evaluate(() => { const cv = document.querySelector("canvas"); const r = cv?.getBoundingClientRect(); return cv ? { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], w: cv.width, h: cv.height } : null; });
// scroll the rail a bit
if (V.mobile) await touchDrag(session, { x: W / 2, y: H * 0.7 }, { x: W / 2, y: H * 0.2 }, 16, 16);
else { await page.mouse.move(W / 2, H / 2); await page.mouse.wheel(0, 900); }
await sleep(1500);
await shot(page, `${tag}-02-rail-mid`);
log.mid = { chip: await chip(), state: await state(), scrollY: await page.evaluate(() => Math.round(scrollY)) };
// drag to look (horizontal)
if (V.mobile) await touchDrag(session, { x: W * 0.7, y: H * 0.45 }, { x: W * 0.15, y: H * 0.45 }, 14, 16);
else { await page.mouse.move(W * 0.7, H * 0.45); await page.mouse.down(); await page.mouse.move(W * 0.15, H * 0.45, { steps: 14 }); await page.mouse.up(); }
await sleep(1200);
await shot(page, `${tag}-03-looked-away`);
log.looked = { chip: await chip(), state: await state(), floating: await floating() };
const ff = page.locator("button", { hasText: /Face forward|Recenter/i }).locator("visible=true").first();
log.faceForwardCount = await ff.count();
if (log.faceForwardCount) { const b = await ff.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(1200); log.afterFF = { state: await state(), chip: await chip() }; }
// approach the first painting by clicking the painting itself (rail): use the projected rect if hook exists, else the dot
let pr = await page.evaluate(() => (window.__museum?.paintingRect ? window.__museum.paintingRect(0) : null)).catch(() => null);
log.paintingRect0 = pr;
if (pr && pr.width > 20) { if (V.mobile) await touchTap(session, pr.x + pr.width / 2, pr.y + pr.height / 2); else await page.mouse.click(pr.x + pr.width / 2, pr.y + pr.height / 2); }
else { const dot = page.locator('button[aria-label^="Approach"]').first(); const b = await dot.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); log.approachViaDot = true; }
await sleep(2500);
await shot(page, `${tag}-04-approach-1`);
log.approach1 = { state: await state(), floating: await floating(), rect: await page.evaluate(() => (window.__museum?.paintingRect ? window.__museum.paintingRect(0) : null)).catch(() => null) };
log.approach1.card = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Back to the hall/i.test(x.textContent || x.getAttribute("aria-label") || "")); const card = b?.closest("div, aside, section"); const q = [...document.querySelectorAll("blockquote, p, h2, h3")].filter((e) => e.getBoundingClientRect().height > 0 && /Priest|Nalle Series/.test(e.textContent || "")); return { back: b ? b.getBoundingClientRect().toJSON() : null, cardRect: card ? card.getBoundingClientRect().toJSON() : null, cardBorder: card ? getComputedStyle(card).border : null, plaque: q.map((e) => e.textContent.trim().slice(0, 50)) }; });
// tap the painting to bring it to life
const r1 = log.approach1.rect;
if (r1 && r1.right - r1.left > 20) { const x = (r1.left + r1.right) / 2, y = (r1.top + r1.bottom) / 2; if (V.mobile) await touchTap(session, x, y); else await page.mouse.click(x, y); }
await sleep(2500);
await shot(page, `${tag}-05-alive`);
await sleep(900);
await shot(page, `${tag}-05b-alive-later`);
log.alive = { state: await state(), videos: await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ paused: v.paused, t: Math.round(v.currentTime * 10) / 10, w: v.videoWidth, h: v.videoHeight, src: (v.currentSrc || "").split("/").pop() }))), aliveBtn: await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /life|rest/i.test(b.getAttribute("aria-label") || "")).map((b) => b.getAttribute("aria-label"))) };
// phone: the peek sheet — tap the header, drag it
if (W < 640) {
  const hdr = page.locator('button[aria-label*="plaque"], button[aria-label*="sheet"], [aria-label="Expand the plaque"]').first();
  log.sheetHdrCount = await hdr.count();
  if (log.sheetHdrCount) {
    const hb = await hdr.boundingBox();
    log.sheetHdrBox = hb;
    await touchTap(session, hb.x + hb.width / 2, hb.y + hb.height / 2);
    await sleep(1500);
    await shot(page, `${tag}-06-sheet-expanded`);
    log.sheetExpanded = { state: await state(), rect: await page.evaluate(() => (window.__museum?.paintingRect ? window.__museum.paintingRect(0) : null)).catch(() => null), floating: await floating() };
    // drag it back down
    const hdrBox = async () => page.evaluate(() => { const b = [...document.querySelectorAll("button,[role=button],div")].find((x) => /plaque|sheet/i.test(x.getAttribute("aria-label") || "") && x.getBoundingClientRect().height > 0); if (b) { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, label: b.getAttribute("aria-label") }; } const e = [...document.querySelectorAll("p,span,div")].find((x) => x.children.length === 0 && /Mark Priest/.test(x.textContent || "") && x.getBoundingClientRect().height > 0 && getComputedStyle(x).position !== "static"); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, label: "eyebrow" }; });
    const hb2 = await hdrBox();
    log.hdrAfterExpand = hb2;
    if (hb2) { await touchDrag(session, { x: hb2.x + hb2.width / 2, y: hb2.y + hb2.height / 2 }, { x: hb2.x + hb2.width / 2, y: H - 30 }, 14, 16); await sleep(1200); await shot(page, `${tag}-07-sheet-dragged-down`); log.sheetAfterDrag = { state: await state() }; }
    // drag up
    const hb3 = await hdrBox();
    log.hdrAfterDragDown = hb3;
    if (hb3) { await touchDrag(session, { x: hb3.x + hb3.width / 2, y: hb3.y + hb3.height / 2 }, { x: hb3.x + hb3.width / 2, y: H * 0.35 }, 14, 16); await sleep(1200); await shot(page, `${tag}-08-sheet-dragged-up`); log.sheetAfterDragUp = { state: await state(), rect: await page.evaluate(() => (window.__museum?.paintingRect ? window.__museum.paintingRect(0) : null)).catch(() => null) }; }
  }
}
// Back to the hall
const back = page.locator("button", { hasText: /Back to the hall/i }).locator("visible=true").first();
log.backCount = await back.count();
if (log.backCount) { const b = await back.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(2000); }
await shot(page, `${tag}-09-back-in-hall`);
log.afterBack = { state: await state(), chip: await chip() };
// approach the LAST painting (portrait) via its dot
const lastDot = page.locator('button[aria-label^="Approach"]').last();
log.lastDotLabel = await lastDot.getAttribute("aria-label");
const ldb = await lastDot.boundingBox();
if (ldb) { await page.mouse.click(ldb.x + ldb.width / 2, ldb.y + ldb.height / 2); await sleep(3500); }
await shot(page, `${tag}-10-last-portrait`);
log.last = { state: await state(), rect: await page.evaluate(() => (window.__museum?.paintingRect ? window.__museum.paintingRect(9) : null)).catch(() => null), floating: await floating() };
if (log.last.rect) {
  const pr9 = log.last.rect; const R = [pr9.x, pr9.y, pr9.width, pr9.height];
  log.last.aspect = pr9.width / pr9.height;
  log.last.collisions = log.last.floating.filter((f) => overlaps(R, f.rect) && !/life|rest/i.test(f.t)).map((f) => f.t + "@" + f.rect.join(","));
}
// keyboard: Esc back, Tab to controls
await page.keyboard.press("Escape"); await sleep(1500);
log.afterEsc = { state: await state() };
await shot(page, `${tag}-11-after-esc`);
// keyboard nav: Tab to the first dot then Enter, then arrows
await page.keyboard.press("Tab");
const seq = [];
for (let i = 0; i < 6; i++) { seq.push(await page.evaluate(() => { const a = document.activeElement; return (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 40); })); await page.keyboard.press("Tab"); }
log.tabSeq = seq;
// focus first Approach dot and press Enter
await page.locator('button[aria-label^="Approach"]').first().focus();
await page.keyboard.press("Enter"); await sleep(2000);
log.kbApproach = { state: await state() };
await page.keyboard.press("ArrowRight"); await sleep(1800);
log.kbArrowRight = { state: await state() };
await shot(page, `${tag}-12-kb-arrow`);
await page.keyboard.press("Escape"); await sleep(1200);
log.kbEsc = { state: await state() };
// menu on this page: open/close
await page.click('button[aria-label="Open menu"]').catch((e) => (log.menuErr = String(e).slice(0, 100)));
await sleep(900);
await shot(page, `${tag}-13-menu-open`);
log.menuOpen = await page.evaluate(() => !!document.querySelector('button[aria-label="Close menu"]'));
await page.keyboard.press("Escape"); await sleep(600);
// scroll to the end of the hall and past into the 2-D grid
await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.62, behavior: "instant" }));
await sleep(1500);
await shot(page, `${tag}-14-hall-end`);
log.hallEnd = { state: await state(), chip: await chip() };
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /View “/.test(x.getAttribute("aria-label") || "")); b?.scrollIntoView({ block: "start", behavior: "instant" }); scrollBy(0, -80); });
await sleep(1200);
await shot(page, `${tag}-15-grid`);
log.gridTiles = await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="View “"]')].map((b) => { const r = b.getBoundingClientRect(); return { t: b.getAttribute("aria-label").slice(6, 40), ar: Math.round((r.width / r.height) * 100) / 100 }; }));
// Skip the hall from top
await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(1500);
const skip = page.locator("button", { hasText: /Skip/ }).locator("visible=true").first();
if (await skip.count()) { const sb = await skip.boundingBox(); log.skipBox = sb; await page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2); await sleep(2500); log.afterSkipScroll = await page.evaluate(() => Math.round(scrollY)); await shot(page, `${tag}-16-after-skip`); }
writeJson(`museum-${vp}`, { log, errs });
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
await browser.close();
