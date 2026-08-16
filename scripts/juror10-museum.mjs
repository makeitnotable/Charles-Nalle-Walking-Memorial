// Museum visitor pass
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, overflow, touchDrag, touchTap } from "./juror10-lib.mjs";
const ALL = { ...VIEWPORTS, z720: { width: 720, height: 450, mobile: false } };
const which = process.argv[2] ? process.argv[2].split(",") : Object.keys(ALL);
const errs = [];

const st = (page) => page.evaluate(() => { const s = window.__museum?.state; return s && { mode: s.mode, railIdx: s.railIdx, approached: s.approached, zoom: +s.zoom.toFixed(2), alive: s.alive, sheet: s.sheet, yaw: +s.look.yaw.toFixed(2), dragYaw: +s.look.dragYaw.toFixed(2), fov: s.fov, railT: +s.railT.toFixed(2) }; });
const rectOf = (page, i) => page.evaluate((i) => { const r = window.__museum?.paintingRect?.(i); return r && { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), behind: r.behind }; }, i);
const ui = (page) => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false; let a = e; while (a && a !== document.body) { const s = getComputedStyle(a); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none") return false; a = a.parentElement; } return true; };
  const q = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 45), l: Math.round(r.left), tp: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), lines: e.getClientRects().length }; });
  const chip = [...document.querySelectorAll("#museum-slot div, #museum-slot p, #museum-slot span, #museum-slot button")].filter((e) => /The Museum|Scroll to walk|Face forward/i.test(e.textContent) && e.children.length <= 2 && vis(e)).map((e) => { const r = e.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(e); return { t: e.textContent.trim().slice(0, 60), l: Math.round(r.left), tp: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), lines: range.getClientRects().length, fs: getComputedStyle(e).fontSize }; });
  const burger = document.querySelector(".cnwm-menu-burger"); const br = burger.getBoundingClientRect();
  return {
    chip,
    skip: q('button[aria-label="Skip the hall"]'),
    back: q("#museum-slot button").filter((b) => /back to the hall/i.test(b.t)),
    burger: { l: Math.round(br.left), tp: Math.round(br.top), r: Math.round(br.right), b: Math.round(br.bottom), vis: vis(burger) },
    dots: (() => { const n = document.querySelector("#museum-slot nav"); if (!n || !vis(n)) return null; const r = n.getBoundingClientRect(); return { l: Math.round(r.left), tp: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), text: n.textContent.trim().slice(0, 20) }; })(),
    faceForward: q("#museum-slot button").filter((b) => /face forward|recenter/i.test(b.t)),
    plaque: (() => { const card = [...document.querySelectorAll("#museum-slot h2, #museum-slot h3")].filter(vis)[0]; if (!card) return null; const box = card.closest("div"); const els = [...box.parentElement.querySelectorAll("p, h2, h3, span")].filter(vis).filter((e) => e.children.length === 0 || e.tagName !== "SPAN").map((e) => { const r = e.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(e); return { tag: e.tagName, t: e.textContent.trim().slice(0, 60), l: Math.round(r.left), tp: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), lines: range.getClientRects().length }; }); const pr = box.parentElement.getBoundingClientRect(); return { box: [Math.round(pr.left), Math.round(pr.top), Math.round(pr.right), Math.round(pr.bottom)], els: els.slice(0, 8) }; })(),
    sheetHeader: q('button[aria-label*="plaque"]'),
    aliveBtn: q('button[aria-label*="to life"], button[aria-label*="rest"]'),
    video: [...document.querySelectorAll("#museum-slot video")].map((v) => ({ paused: v.paused, t: +v.currentTime.toFixed(1), src: (v.currentSrc || "").split("/").pop() })),
    focus: document.activeElement && { tag: document.activeElement.tagName, t: (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 40), outline: getComputedStyle(document.activeElement).outlineStyle + " " + getComputedStyle(document.activeElement).outlineWidth + " " + getComputedStyle(document.activeElement).boxShadow.slice(0, 40), fv: document.activeElement.matches(":focus-visible") },
  };
});
const overlap = (a, b) => a && b && a.l < b.r && a.r > b.l && a.tp < b.b && a.b > b.tp;

for (const k of which) {
  const vp = ALL[k];
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `museum-${k}`, errs);
  console.log("\n########", k);
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle" });
  await sleep(4000);
  const s0 = await st(page);
  console.log("state0:", JSON.stringify(s0));
  if (!s0) { console.log("NO MUSEUM (grid fallback?)"); await shot(page, `museum-top-${k}`); await c.close(); await browser.close(); continue; }
  await shot(page, `museum-top-${k}`);
  let u = await ui(page);
  console.log("chip:", JSON.stringify(u.chip), "skip:", JSON.stringify(u.skip), "burger:", JSON.stringify(u.burger), "dots:", JSON.stringify(u.dots));
  if (u.chip[0]) console.log("chip vs skip overlap:", overlap(u.chip[0], u.skip[0]), "chip vs burger:", overlap(u.chip[0], u.burger), "chip lines:", u.chip[0].lines);
  console.log("overflow", JSON.stringify(await overflow(page)));
  // FROM PAGE TOP WITHOUT SCROLLING: click the visible painting (desktop / tablet landscape)
  const r0 = await rectOf(page, 0);
  console.log("painting0 rect at top:", JSON.stringify(r0));
  if (r0 && !r0.behind && r0.l < vp.width && r0.b > 0) {
    const cx = Math.min(vp.width - 20, (Math.max(r0.l, 0) + Math.min(r0.r, vp.width)) / 2), cy = Math.min(vp.height - 20, (Math.max(r0.t, 0) + Math.min(r0.b, vp.height)) / 2);
    console.log("clicking painting0 at", cx, cy);
    if (vp.mobile) await touchTap(page, cx, cy); else await page.mouse.click(cx, cy);
    await sleep(2500);
    const s1 = await st(page); u = await ui(page);
    const r0b = await rectOf(page, 0);
    console.log("after click from top: state", JSON.stringify(s1), "scrollY", await page.evaluate(() => scrollY), "rect", JSON.stringify(r0b), "back:", JSON.stringify(u.back), "burger:", JSON.stringify(u.burger), "focus:", JSON.stringify(u.focus));
    await shot(page, `museum-approach-fromtop-${k}`);
    if (s1?.mode === "approach") {
      // get out via Back
      const bb = u.back[0];
      if (bb) { await page.mouse.click((bb.l + bb.r) / 2, (bb.tp + bb.b) / 2); await sleep(1500); const uu = await ui(page); console.log("after Back click: state", JSON.stringify(await st(page)), "focus:", JSON.stringify(uu.focus)); await shot(page, `museum-back-focus-${k}`); }
      else console.log("NO BACK BUTTON VISIBLE");
    }
  }
  // scroll the rail
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(300);
  for (let i = 0; i < 6; i++) { await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, 500); await sleep(250); }
  await sleep(1500);
  console.log("after rail scroll: state", JSON.stringify(await st(page)), "scrollY", await page.evaluate(() => scrollY));
  u = await ui(page);
  console.log("rail UI: chip", JSON.stringify(u.chip), "dots", JSON.stringify(u.dots), "burger", JSON.stringify(u.burger));
  await shot(page, `museum-rail-mid-${k}`);
  // drag to look
  const stage = await page.evaluate(() => { const cv = document.querySelector("#museum-slot canvas"); const r = cv.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
  if (vp.mobile) await touchDrag(page, stage.x + 100, stage.y, stage.x - 120, stage.y, 16, 250);
  else { await page.mouse.move(stage.x + 100, stage.y); await page.mouse.down(); for (let i = 1; i <= 16; i++) { await page.mouse.move(stage.x + 100 - (220 * i) / 16, stage.y); await sleep(15); } await page.mouse.up(); }
  await sleep(1200);
  u = await ui(page);
  console.log("after look drag: state", JSON.stringify(await st(page)), "chip", JSON.stringify(u.chip), "faceForward", JSON.stringify(u.faceForward));
  await shot(page, `museum-looked-${k}`);
  const ff = u.faceForward[0] || u.chip.find((c) => /face forward/i.test(c.t));
  if (ff) { await page.mouse.click((ff.l + ff.r) / 2, (ff.tp + ff.b) / 2); await sleep(1200); console.log("after Face forward: state", JSON.stringify(await st(page))); }
  // approach a painting by clicking it: use painting near railIdx
  const sNow = await st(page);
  const target = Math.max(1, sNow.railIdx);
  let rt = await rectOf(page, target);
  console.log(`painting${target} rect:`, JSON.stringify(rt));
  if (rt && !rt.behind && rt.l < vp.width && rt.r > 0 && rt.b > 0 && rt.t < vp.height) {
    const cx = (Math.max(rt.l, 0) + Math.min(rt.r, vp.width)) / 2, cy = (Math.max(rt.t, 0) + Math.min(rt.b, vp.height)) / 2;
    if (vp.mobile) await touchTap(page, cx, cy); else await page.mouse.click(cx, cy);
  } else { await page.evaluate((i) => window.__museum.approach(i), target); }
  await sleep(2500);
  let sA = await st(page); u = await ui(page);
  rt = await rectOf(page, sA.approached ?? target);
  console.log("approach: state", JSON.stringify(sA), "rect", JSON.stringify(rt), "centre x%", rt && ((rt.l + rt.r) / 2 / vp.width).toFixed(3), "y%", rt && ((rt.t + rt.b) / 2 / vp.height).toFixed(3));
  console.log("approach UI: back", JSON.stringify(u.back), "burger", JSON.stringify(u.burger), "dots", JSON.stringify(u.dots), "sheet", JSON.stringify(u.sheetHeader), "plaque", JSON.stringify(u.plaque));
  console.log("painting vs plaque overlap:", u.plaque && overlap(rt, { l: u.plaque.box[0], tp: u.plaque.box[1], r: u.plaque.box[2], b: u.plaque.box[3] }), "vs back:", overlap(rt, u.back[0]), "vs burger:", overlap(rt, u.burger), "vs dots:", overlap(rt, u.dots));
  await shot(page, `museum-approach-${k}`);
  // tap the painting to bring it to life
  if (rt) { const cx = (rt.l + rt.r) / 2, cy = (rt.t + rt.b) / 2; if (vp.mobile) await touchTap(page, cx, cy); else await page.mouse.click(cx, cy); }
  await sleep(2500);
  u = await ui(page);
  console.log("after tap: state", JSON.stringify(await st(page)), "video", JSON.stringify(u.video), "aliveBtn", JSON.stringify(u.aliveBtn));
  await shot(page, `museum-alive-${k}`);
  // tap again to rest
  if (rt) { const cx = (rt.l + rt.r) / 2, cy = (rt.t + rt.b) / 2; if (vp.mobile) await touchTap(page, cx, cy); else await page.mouse.click(cx, cy); }
  await sleep(800);
  console.log("after 2nd tap: state", JSON.stringify(await st(page)));
  // phone: sheet drag
  if (vp.mobile && u.sheetHeader[0]) {
    const h = u.sheetHeader[0];
    await touchDrag(page, (h.l + h.r) / 2, (h.tp + h.b) / 2, (h.l + h.r) / 2, (h.tp + h.b) / 2 - 300, 16, 300);
    await sleep(1200);
    let uu = await ui(page); const sS = await st(page); const rr = await rectOf(page, sS.approached);
    console.log("sheet dragged up: state", JSON.stringify(sS), "sheet header", JSON.stringify(uu.sheetHeader), "rect", JSON.stringify(rr), "plaque", JSON.stringify(uu.plaque?.box), "back", JSON.stringify(uu.back));
    await shot(page, `museum-sheet-full-${k}`);
    // tap header to collapse
    if (uu.sheetHeader[0]) { const hh = uu.sheetHeader[0]; await touchTap(page, (hh.l + hh.r) / 2, (hh.tp + hh.b) / 2); await sleep(1200); console.log("after header tap: state", JSON.stringify(await st(page))); await shot(page, `museum-sheet-peek-${k}`); }
  }
  // Esc → back to hall
  await page.keyboard.press("Escape"); await sleep(1500);
  console.log("after Esc: state", JSON.stringify(await st(page)));
  // approach the LAST painting (portrait)
  await page.evaluate(() => window.__museum.approach(9)); await sleep(3000);
  sA = await st(page); u = await ui(page); rt = await rectOf(page, 9);
  console.log("LAST painting: state", JSON.stringify(sA), "rect", JSON.stringify(rt), "aspect w/h", rt && (rt.w / rt.h).toFixed(3), "back", JSON.stringify(u.back), "burger", JSON.stringify(u.burger), "dots", JSON.stringify(u.dots), "plaque", JSON.stringify(u.plaque));
  // frame ~ painting rect grown by ~10% margin
  const fr = rt && { l: rt.l - rt.w * 0.09, tp: rt.t - rt.h * 0.09, r: rt.r + rt.w * 0.09, b: rt.b + rt.h * 0.09 };
  console.log("last frame(+9%) vs back:", overlap(fr, u.back[0]), "vs burger:", overlap(fr, u.burger), "vs dots:", overlap(fr, u.dots), "vs plaque:", u.plaque && overlap(fr, { l: u.plaque.box[0], tp: u.plaque.box[1], r: u.plaque.box[2], b: u.plaque.box[3] }));
  await shot(page, `museum-last-${k}`);
  // works 6/7/9/10 plaques (indices 5,6,8,9) — capture eyebrow/title wraps
  for (const i of [5, 6, 8]) { await page.evaluate((i) => window.__museum.approach(i), i); await sleep(2000); const uu = await ui(page); console.log(`plaque work ${i + 1}:`, JSON.stringify(uu.plaque?.els.map((e) => `${e.tag}"${e.t}" ${e.lines}L [${e.l}-${e.r}]`))); await shot(page, `museum-plaque-w${i + 1}-${k}`); }
  // Back to the hall via button
  u = await ui(page);
  if (u.back[0]) { const bb = u.back[0]; await page.mouse.click((bb.l + bb.r) / 2, (bb.tp + bb.b) / 2); await sleep(1500); console.log("after Back to the hall: state", JSON.stringify(await st(page)), "focus", JSON.stringify((await ui(page)).focus)); }
  // keyboard: Tab to a dot / Enter / arrows / Esc
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  let f = (await ui(page)).focus; console.log("kbd focus after 3 tabs:", JSON.stringify(f));
  for (let i = 0; i < 6 && !/Approach|Skip/.test(f.t); i++) { await page.keyboard.press("Tab"); f = (await ui(page)).focus; }
  console.log("kbd focus:", JSON.stringify(f));
  if (/Approach/.test(f.t)) { await page.keyboard.press("Enter"); await sleep(2000); console.log("kbd Enter → state", JSON.stringify(await st(page))); await shot(page, `museum-kbd-approach-${k}`); await page.keyboard.press("ArrowRight"); await sleep(1500); console.log("kbd ArrowRight → state", JSON.stringify(await st(page))); await page.keyboard.press("Escape"); await sleep(1200); console.log("kbd Esc → state", JSON.stringify(await st(page)), "focus", JSON.stringify((await ui(page)).focus)); }
  // Skip the hall → 2-D grid
  const sk = (await ui(page)).skip[0];
  if (sk) { await page.mouse.click((sk.l + sk.r) / 2, (sk.tp + sk.b) / 2); await sleep(2000); console.log("after Skip: scrollY", await page.evaluate(() => scrollY)); await shot(page, `museum-grid-${k}`); }
  // grid: last tile aspect
  const tiles = await page.evaluate(() => [...document.querySelectorAll("button.painting-open")].map((b) => { const r = b.getBoundingClientRect(); return +(r.width / r.height).toFixed(2); }));
  console.log("grid tile aspects:", JSON.stringify(tiles));
  await c.close(); await browser.close();
}
console.log("CONSOLE", JSON.stringify(errs, null, 1));
