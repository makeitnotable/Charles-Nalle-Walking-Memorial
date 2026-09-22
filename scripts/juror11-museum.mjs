import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep, cdp, touchDrag, touchTap } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "d1440";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `museum-${vpKey}`);
const tag = `museum-${vpKey}`;
const session = await cdp(page);
await goto(page, "/paintings", 5000);

const ui = async () => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const els = [...document.querySelectorAll("button, a, [role=status], p, h2, h3, span")].filter((e) => vis(e) && (e.matches("button, a, [role=status]") || (e.children.length === 0 && e.closest("[class*=museum], [class*=stage], [class*=plaque], [class*=sheet], [class*=card]")))).map((e) => { const r = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight) || 16; return { tag: e.tagName, t: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], lines: Math.round(r.height / lh), focus: e === document.activeElement, ring: e === document.activeElement ? getComputedStyle(e).outlineStyle + " " + getComputedStyle(e).outlineWidth + " " + getComputedStyle(e).boxShadow.slice(0, 40) : null }; });
  const m = window.__museum; const st = m?.state ? (typeof m.state === "function" ? m.state() : m.state) : null;
  const q = st && st.approached != null && m.paintingRect ? m.paintingRect(st.approached) : null; const pr = q && { x: q.left, y: q.top, w: q.right - q.left, h: q.bottom - q.top, behind: q.behind };
  const menu = document.querySelector(".cnwm-menu"); const mr = menu?.getBoundingClientRect(); const mcs = menu && getComputedStyle(menu);
  return { y: Math.round(scrollY), mode: st?.mode, approached: st?.approached, zoom: st?.zoom, alive: st?.alive, look: st?.look && [+st.look.yaw.toFixed(2), +st.look.pitch.toFixed(2)], sheet: st?.sheet, pr: pr && Object.fromEntries(Object.entries(pr).map(([k, v]) => [k, typeof v === "number" ? Math.round(v) : v])), menu: mr && { r: [Math.round(mr.x), Math.round(mr.y), Math.round(mr.width), Math.round(mr.height)], op: mcs.opacity, vis: mcs.visibility, tf: mcs.transform }, els: els.filter((e) => e.tag !== "SPAN" || e.t.length > 3) };
});
let s = await ui();
log("TOP rest:", JSON.stringify(s));
await shot(page, `${tag}-01-top`);
// From the page top, click the visible painting (right wall) if any painting projects into view
const rects = await page.evaluate(() => { const m = window.__museum; const n = (typeof m.state==="function"?m.state():m.state).works; const out = []; for (let i = 0; i < n; i++) { const q = m.paintingRect(i); const r = q && { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.right - q.left), h: Math.round(q.bottom - q.top), behind: q.behind }; out.push({ i, r }); } return out; });
log("painting rects at top:", JSON.stringify(rects.filter((r) => r.r && r.r.w > 0 && r.r.x < vp.width)));
const canvasTop = await page.evaluate(() => document.querySelector("canvas").getBoundingClientRect().top);
const visibleFromTop = rects.filter((r) => r.r && !r.r.behind && r.r.w > 40 && r.r.x + r.r.w > 0 && r.r.x < vp.width && r.r.y < vp.height && r.r.y + r.r.h > 0);
log("visible painting rects (canvas-relative, canvasTop=" + Math.round(canvasTop) + "):", JSON.stringify(visibleFromTop));
if (visibleFromTop.length && !vp.mobile) {
  const r0 = visibleFromTop[0].r;
  // click centre of the visible portion in page coords
  const cx = Math.min(Math.max(r0.x + r0.w / 2, 10), vp.width - 10);
  const cy = Math.min(Math.max(r0.y + r0.h / 2, canvasTop + 10), vp.height - 10);
  log("clicking painting", visibleFromTop[0].i, "at", Math.round(cx), Math.round(cy));
  await page.mouse.click(cx, cy);
  await sleep(2600);
  s = await ui();
  log("after top-click:", JSON.stringify(s));
  await shot(page, `${tag}-02-top-click-inspect`);
  // Is the Back button visible + focus ring after mouse click on it
  const back = page.locator("button:visible", { hasText: /Back to the hall/i }).first();
  if (await back.count()) {
    const bb = await back.boundingBox();
    log("Back to the hall box:", JSON.stringify(bb), "in viewport:", bb.y >= 0 && bb.y + bb.height <= vp.height);
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await sleep(300);
    const ring = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { tag: a.tagName, t: (a.textContent || "").trim().slice(0, 30), fv: a.matches(":focus-visible"), outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor, shadow: cs.boxShadow.slice(0, 60) }; });
    log("after mouse-click Back: activeElement", JSON.stringify(ring));
    await shot(page, `${tag}-03-after-back-click`);
    await sleep(1800);
    s = await ui();
    log("back in rail:", s.mode, s.y);
  } else log("NO Back to the hall button visible after top click");
}
// Scroll a good way down the hall, then click a painting
await page.evaluate(() => scrollTo({ top: innerHeight * 3.2, behavior: "instant" }));
await sleep(2500);
s = await ui();
log("deep rail:", JSON.stringify({ y: s.y, mode: s.mode, menu: s.menu, els: s.els.map((e) => e.t + "@" + e.r.join(",")) }));
await shot(page, `${tag}-04-deep-rail`);
// find a painting rect in view and click it
const rects2 = await page.evaluate(() => { const m = window.__museum; const n = (typeof m.state==="function"?m.state():m.state).works; const c = document.querySelector("canvas").getBoundingClientRect(); const out = []; for (let i = 0; i < n; i++) { const q = m.paintingRect(i); const r = q && { x: q.left, y: q.top, w: q.right - q.left, h: q.bottom - q.top }; if (r && !q.behind && r.w > 60 && r.x > 0 && r.x + r.w < innerWidth && r.y > 0 && r.y + r.h < c.height) out.push({ i, r: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) } }); } return { out, canvasTop: c.top }; });
log("in-view paintings deep:", JSON.stringify(rects2));
if (rects2.out.length) {
  const p = rects2.out[0];
  const cx = p.r.x + p.r.w / 2, cy = p.r.y + p.r.h / 2;
  if (vp.mobile) await touchTap(session, cx, cy); else await page.mouse.click(cx, cy);
  await sleep(2600);
  s = await ui();
  log("deep approach:", JSON.stringify(s));
  await shot(page, `${tag}-05-deep-approach`);
  // tap the painting to bring it to life
  const pr = s.pr;
  if (pr) {
    const canvasTop2 = await page.evaluate(() => document.querySelector("canvas").getBoundingClientRect().top);
    const px = pr.x + pr.w / 2, py = pr.y + pr.h / 2;
    if (vp.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py);
    await sleep(2500);
    s = await ui();
    log("after tap painting: alive", s.alive, "zoom", s.zoom);
    await shot(page, `${tag}-06-alive`);
    // tap again to rest
    if (vp.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py);
    await sleep(800);
    log("after 2nd tap: alive", (await ui()).alive);
  }
  // Esc
  await page.keyboard.press("Escape");
  await sleep(1800);
  s = await ui();
  log("after Esc:", s.mode, s.approached);
}
// approach the LAST work via the hook (portrait)
await page.evaluate(() => window.__museum.approach(9));
await sleep(3000);
s = await ui();
log("last work approach:", JSON.stringify(s));
await shot(page, `${tag}-07-last-portrait`);
// frame clear of Back / menu / dot rail?
const clash = await page.evaluate(() => {
  const m = window.__museum; const q = m.paintingRect(9); const c = document.querySelector("canvas").getBoundingClientRect();
  const P = { x: q.left, y: q.top, w: q.right - q.left, h: q.bottom - q.top };
  const els = [...document.querySelectorAll("button, nav, [role=tablist], .cnwm-menu")].filter((e) => !/Bring the painting/.test(e.getAttribute("aria-label") || "")).filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; });
  const hits = els.map((e) => { const r = e.getBoundingClientRect(); const ov = !(P.x + P.w < r.left || r.right < P.x || P.y + P.h < r.top || r.bottom < P.y); return ov ? (e.getAttribute("aria-label") || e.textContent || e.className).toString().trim().slice(0, 40) : null; }).filter(Boolean);
  return { P: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, Math.round(v)])), hits, aspect: +(P.w / P.h).toFixed(3) };
});
log("portrait clash:", JSON.stringify(clash));
// desktop: plaque wrapping for works 6/7/9/10 at this vp
for (const i of [5, 6, 8, 9]) {
  await page.evaluate((i) => window.__museum.approach(i), i);
  await sleep(2200);
  const plaque = await page.evaluate(() => { const els = [...document.querySelectorAll("p, h2, h3, span")].filter((e) => { const r = e.getBoundingClientRect(); return e.children.length === 0 && r.width > 0 && r.top >= 0 && r.top < innerHeight && getComputedStyle(e).visibility !== "hidden" && /Priest|Chapter|Narrative|Nalle Series|Part/i.test(e.textContent); }); return els.map((e) => { const r = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight) || 16; return e.textContent.trim().replace(/\s+/g, " ").slice(0, 60) + " [" + Math.round(r.height / lh) + "L @" + Math.round(r.x) + "," + Math.round(r.y) + " w" + Math.round(r.width) + "]"; }); });
  log("work", i + 1, "plaque:", JSON.stringify(plaque));
  await shot(page, `${tag}-08-work${i + 1}`);
}
// Back to the hall via button
const back2 = page.locator("button:visible", { hasText: /Back to the hall/i }).first();
if (await back2.count()) { const bb = await back2.boundingBox(); if (vp.mobile) await touchTap(session, bb.x + bb.width / 2, bb.y + bb.height / 2); else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(1800); log("after Back button:", (await ui()).mode); }
// look-around: drag on the canvas in rail mode
const cv = await page.evaluate(() => document.querySelector("canvas").getBoundingClientRect().toJSON());
const ly = Math.max(cv.top, 0) + Math.min(cv.height, vp.height - Math.max(cv.top, 0)) * 0.4;
if (vp.mobile) await touchDrag(session, { x: vp.width * 0.7, y: ly }, { x: vp.width * 0.2, y: ly }, 14, 16);
else { await page.mouse.move(vp.width * 0.7, ly); await page.mouse.down(); for (let i = 1; i <= 14; i++) { await page.mouse.move(vp.width * 0.7 - i * (vp.width * 0.5 / 14), ly); await sleep(16); } await page.mouse.up(); }
await sleep(1200);
s = await ui();
log("after look drag:", JSON.stringify({ look: s.look, els: s.els.filter((e) => /face|forward|recent/i.test(e.t)) }));
await shot(page, `${tag}-09-looked-away`);
const ff = page.locator("button:visible", { hasText: /Face forward|Recenter/i }).first();
if (await ff.count()) { const fb = await ff.boundingBox(); if (vp.mobile) await touchTap(session, fb.x + fb.width / 2, fb.y + fb.height / 2); else await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2); await sleep(1200); log("after Face forward look:", JSON.stringify((await ui()).look)); }
// keyboard: Tab to a painting/dot then Enter, arrows, Esc
await page.keyboard.press("Tab");
let f = await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 40));
log("Tab1:", f);
// press Tab several times to reach a dot
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); f = await page.evaluate(() => (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 40)); log("Tab" + (i + 2) + ":", f); if (/Approach/i.test(f)) break; }
if (/Approach/i.test(f)) {
  await page.keyboard.press("Enter"); await sleep(2400);
  s = await ui(); log("Enter → approach:", s.mode, s.approached);
  await page.keyboard.press("ArrowRight"); await sleep(2000); log("ArrowRight →", (await ui()).approached);
  await page.keyboard.press("Escape"); await sleep(1500); log("Esc →", (await ui()).mode);
}
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");
log("console errors:", errs.length ? errs : "none");
await browser.close();
