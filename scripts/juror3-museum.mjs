import { launch, newPage, shot, goto, sleep, report, cdp, touchDrag, touchTap, VIEWPORTS } from "./juror3-lib.mjs";

const vp = process.argv[2] || "d1440";
const V = VIEWPORTS[vp];
const tag = `museum-${vp}`;
const browser = await launch();
const page = await newPage(browser, vp);
const session = await cdp(page);

const state = () => page.evaluate(() => { const m = window.__museum; if (!m) return null; const s = typeof m.state === "function" ? m.state() : m.state; return s && JSON.parse(JSON.stringify(s, (k, v) => typeof v === "number" ? +v.toFixed(3) : v)); });
const prect = (i) => page.evaluate((i) => { const m = window.__museum; if (!m?.paintingRect) return null; const r = m.paintingRect(i); if (!r) return null; return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), behind: r.behind }; }, i);
const controls = () => page.evaluate(() => [...document.querySelectorAll("button,a,[role=button]")].filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0 && !el.closest("footer") && !el.closest("section"); }).map((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return `"${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34)}" @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)} op=${cs.opacity}`; }));
const chip = () => page.evaluate(() => [...document.querySelectorAll("#museum-slot *")].filter((el) => el.children.length === 0 && el.textContent.trim().length > 3 && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden").map((el) => { const r = el.getBoundingClientRect(); return `${el.textContent.trim().slice(0, 60)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)} op=${getComputedStyle(el).opacity}`; }).slice(0, 25));
const canvasRect = () => page.evaluate(() => { const c = document.querySelector("#museum-slot canvas"); const r = c?.getBoundingClientRect(); return r && { x: r.x, y: r.y, w: r.width, h: r.height }; });
const slotTop = () => page.evaluate(() => document.querySelector("#museum-slot").getBoundingClientRect().top + scrollY);
const slotH = () => page.evaluate(() => document.querySelector("#museum-slot").getBoundingClientRect().height);
const scrollTo = async (y) => { await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y); };

await goto(page, "/paintings");
await sleep(2500);
await shot(page, `${tag}-01-top`);
const st = await slotTop(); const sh = await slotH();
console.log("slot top", st, "h", sh, "vh", V.height);
// scroll to the stage
await scrollTo(st + 2);
await sleep(2500);
await shot(page, `${tag}-02-rail-rest`);
console.log("state rail rest:", await state());
console.log("chip/text:", await chip());
console.log("controls:", await controls());
// walk the rail: smooth-ish scroll in steps
const stops = [0.15, 0.35, 0.55, 0.8, 0.97];
for (const f of stops) {
  const target = st + (sh - V.height) * f;
  const cur = await page.evaluate(() => scrollY);
  const n = 20; for (let i = 1; i <= n; i++) { await scrollTo(cur + ((target - cur) * i) / n); await sleep(40); }
  await sleep(1800);
  await shot(page, `${tag}-03-rail-${Math.round(f * 100)}`);
}
console.log("state rail end:", await state());
await sleep(500);
// back to mid-rail for look test
await scrollTo(st + (sh - V.height) * 0.4); await sleep(1500);
// drag to look
const c = await canvasRect();
const cy = c.y + c.h * 0.45; const cx0 = c.x + c.w * 0.65; const cx1 = c.x + c.w * 0.25;
if (V.mobile) await touchDrag(session, { x: cx0, y: cy }, { x: cx1, y: cy }, 20);
else { await page.mouse.move(cx0, cy); await page.mouse.down(); for (let i = 1; i <= 20; i++) { await page.mouse.move(cx0 + ((cx1 - cx0) * i) / 20, cy); await sleep(16); } await page.mouse.up(); }
await sleep(1500);
await shot(page, `${tag}-04-looked-away`);
console.log("state looked away:", await state());
console.log("controls looked away:", await controls());
const face = await page.$('button:has-text("Face forward"), button:has-text("Recenter")');
if (face) { await face.click(); await sleep(1500); await shot(page, `${tag}-05-face-forward`); console.log("state after face forward:", await state()); } else console.log("NO Face forward button found");
// scroll y after look — did the page rail move (should not)?
console.log("scrollY after look:", await page.evaluate(() => scrollY), "expected ~", st + (sh - V.height) * 0.4);

// approach painting 1 by clicking/tapping the painting on the canvas
await scrollTo(st + (sh - V.height) * 0.05); await sleep(1500);
let r0 = null; let idx0 = 0;
for (let i = 0; i < 4; i++) { const r = await prect(i); if (r && !r.behind && r.x >= 0 && r.y >= 0 && r.x + r.w <= V.width && r.y + r.h <= V.height) { r0 = r; idx0 = i; break; } }
console.log("painting", idx0, "rect (rail):", r0);
if (r0) {
  const px = (r0.x ?? r0.left) + (r0.w ?? r0.width) / 2, py = (r0.y ?? r0.top) + (r0.h ?? r0.height) / 2;
  if (V.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py);
} else {
  await (await page.$('button[aria-label^="Approach"]')).click();
}
await sleep(2500);
await shot(page, `${tag}-06-approach`);
const s6 = await state(); console.log("state approach:", s6);
const r6 = await prect(idx0); console.log("painting", idx0, "rect (approach):", r6);
console.log("controls approach:", await controls());
console.log("texts approach:", await chip());
if (r6) { const cxp = ((r6.x ?? r6.left) + (r6.w ?? r6.width) / 2) / V.width; const cyp = ((r6.y ?? r6.top) + (r6.h ?? r6.height) / 2) / V.height; console.log(`painting centre ${(cxp * 100).toFixed(1)}% , ${(cyp * 100).toFixed(1)}%  aspect ${((r6.w ?? r6.width) / (r6.h ?? r6.height)).toFixed(3)}`); }
// tap the painting → alive
if (r6) { const px = (r6.x ?? r6.left) + (r6.w ?? r6.width) / 2, py = (r6.y ?? r6.top) + (r6.h ?? r6.height) / 2; if (V.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py); }
await sleep(2500);
await shot(page, `${tag}-07-alive`);
console.log("state alive:", await state());
console.log("video:", await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ src: (v.currentSrc || v.src).split("/").pop(), paused: v.paused, t: +v.currentTime.toFixed(2) }))));
// tap again → rest
if (r6) { const px = (r6.x ?? r6.left) + (r6.w ?? r6.width) / 2, py = (r6.y ?? r6.top) + (r6.h ?? r6.height) / 2; if (V.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py); }
await sleep(1200);
console.log("state after 2nd tap:", await state());

// phone: peek sheet
if (V.mobile && V.width < 700) {
  const hdr = await page.$('[aria-label="Expand the plaque"], button:has-text("Expand")');
  const hb = hdr && await hdr.boundingBox();
  console.log("sheet header:", hb);
  if (hb) {
    await touchTap(session, hb.x + hb.width / 2, hb.y + hb.height / 2);
    await sleep(1500);
    await shot(page, `${tag}-08-sheet-tap-open`);
    console.log("state sheet after tap:", await state());
    console.log("controls sheet:", await controls());
    const r8 = await prect(idx0); console.log("painting rect with sheet:", r8);
    // drag it down
    const hdr2 = await page.$('[aria-label="Collapse the plaque"], [aria-label="Expand the plaque"], button:has-text("plaque")');
    const hb2 = hdr2 && await hdr2.boundingBox();
    if (hb2) { await touchDrag(session, { x: hb2.x + hb2.width / 2, y: hb2.y + hb2.height / 2 }, { x: hb2.x + hb2.width / 2, y: V.height - 40 }, 16); await sleep(1500); await shot(page, `${tag}-09-sheet-dragged-down`); console.log("state after drag down:", await state()); }
    // drag it up
    const hdr3 = await page.$('[aria-label="Expand the plaque"], [aria-label="Collapse the plaque"], button:has-text("plaque")');
    const hb3 = hdr3 && await hdr3.boundingBox();
    if (hb3) { await touchDrag(session, { x: hb3.x + hb3.width / 2, y: hb3.y + hb3.height / 2 }, { x: hb3.x + hb3.width / 2, y: V.height * 0.3 }, 16); await sleep(1500); await shot(page, `${tag}-10-sheet-dragged-up`); console.log("state after drag up:", await state()); console.log("painting rect sheet up:", await prect(idx0)); }
  }
}
// Back to the hall
const back = await page.$('button:has-text("Back to the hall")');
if (back) { const bb = await back.boundingBox(); console.log("Back to the hall at", bb); await back.click(); await sleep(2000); await shot(page, `${tag}-11-back-hall`); console.log("state after back:", await state()); }

// LAST painting (index 9, portrait)
await scrollTo(st + (sh - V.height) * 0.86); await sleep(1800);
const r9 = await prect(9); console.log("painting 9 rect (rail):", r9);
await shot(page, `${tag}-12a-last-from-rail`);
if (r9 && !r9.behind && r9.x >= 0 && r9.y >= 0 && r9.x + r9.w <= V.width && r9.y + r9.h <= V.height) { const px = r9.x + r9.w / 2, py = r9.y + r9.h / 2; if (V.mobile) await touchTap(session, px, py); else await page.mouse.click(px, py); }
else { console.log("last painting not fully in view from rail 0.86 → using the dot"); await (await page.$$('button[aria-label^="Approach"]'))[9].click(); }
await sleep(2500);
await shot(page, `${tag}-12-last-approach`);
const r9a = await prect(9); console.log("painting 9 approach rect:", r9a, r9a && `aspect ${((r9a.w ?? r9a.width) / (r9a.h ?? r9a.height)).toFixed(3)} centre ${((((r9a.x ?? r9a.left) + (r9a.w ?? r9a.width) / 2) / V.width) * 100).toFixed(1)}%`);
console.log("texts last:", await chip());
// Esc back
await page.keyboard.press("Escape"); await sleep(1800);
console.log("state after Esc:", await state());
await shot(page, `${tag}-13-after-esc`);

// keyboard: Tab to the first Approach dot, Enter, Esc; arrows in rail
await scrollTo(st + (sh - V.height) * 0.3); await sleep(800);
await page.keyboard.press("ArrowRight"); await sleep(600); await page.keyboard.press("ArrowRight"); await sleep(900);
console.log("state after ArrowRight ×2 (rail):", await state());
await shot(page, `${tag}-14-arrow-look`);
await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await sleep(600);
const dot = await page.$('button[aria-label^="Approach “Uri"]');
await dot.focus(); await sleep(300);
await shot(page, `${tag}-15-dot-focus`);
await page.keyboard.press("Enter"); await sleep(2500);
console.log("state after Enter on dot:", await state());
await shot(page, `${tag}-16-kbd-approach`);
console.log("focused el:", await page.evaluate(() => { const a = document.activeElement; return a && `${a.tagName} "${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 40)}"`; }));
await page.keyboard.press("Shift+Tab"); await sleep(200);
console.log("Shift+Tab from Back →", await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return `${a.tagName} "${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 40)}" outline=${cs.outlineStyle}/${cs.outlineWidth} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`; }));
await shot(page, `${tag}-16b-shift-tab`);
await page.keyboard.press("Enter"); await sleep(1500);
console.log("after Enter on the invisible button (alive?):", (await state())?.alive);
await page.keyboard.press("Enter"); await sleep(600);
await page.keyboard.press("Tab"); await sleep(200);
await page.keyboard.press("ArrowRight"); await sleep(2000);
console.log("state after ArrowRight in approach:", await state());
// Tab through approach controls
const seq = [];
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); await sleep(150); seq.push(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return `${a.tagName} "${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 30)}" outline=${cs.outlineStyle}/${cs.outlineWidth} box=${cs.boxShadow !== "none"} @${Math.round(r.x)},${Math.round(r.y)}`; })); }
console.log("tab seq in approach:", seq);
await shot(page, `${tag}-17-tab-approach`);
await page.keyboard.press("Escape"); await sleep(1500);
console.log("state after Esc (kbd):", await state());

// menu on /paintings + scroll hide
const menuOp = () => page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); const w = b.closest(".cnwm-menu") || b.parentElement; const r = b.getBoundingClientRect(); return { op: getComputedStyle(w).opacity, x: Math.round(r.x), y: Math.round(r.y) }; });
console.log("menu mid rail:", await menuOp());
await scrollTo(st + (sh - V.height) * 0.6); await sleep(500); await scrollTo(st + (sh - V.height) * 0.6 - 60); await sleep(700);
console.log("menu after scroll up:", await menuOp());
await (await page.$('button[aria-label="Open menu"]')).click(); await sleep(900);
await shot(page, `${tag}-18-menu-open`);
await page.keyboard.press("Escape"); await sleep(600);
// grid below
await page.evaluate(() => { const s = [...document.querySelectorAll("main section")].find((x) => x.querySelector('button[aria-label^="View"]')); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 20); }); await sleep(1500);
await shot(page, `${tag}-19-grid`);
await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label^="View"]')].pop(); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - Math.round(innerHeight * 0.1)); }); await sleep(1200);
await shot(page, `${tag}-20-grid-last`);
const lastTile = await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label^="View"]')].pop(); const r = b.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), aspect: +(r.width / r.height).toFixed(3) }; });
console.log("last grid tile:", lastTile);
await (await page.$$('button[aria-label^="View"]')).at(-1).click(); await sleep(2000);
await shot(page, `${tag}-21-dialog`);
console.log("dialog video:", await page.evaluate(() => { const v = document.querySelector("#painting-dialog-video"); const r = v?.getBoundingClientRect(); return v && { src: (v.currentSrc || v.src).split("/").pop(), paused: v.paused, w: Math.round(r.width), h: Math.round(r.height), vw: v.videoWidth, vh: v.videoHeight }; }));
await page.keyboard.press("Escape"); await sleep(600);
console.log("focus after dialog close:", await page.evaluate(() => { const a = document.activeElement; return a && `${a.tagName} "${(a.getAttribute("aria-label") || "").slice(0, 40)}"`; }));
console.log("renderer info:", await page.evaluate(() => { const m = window.__museum; const ri = m?.renderer?.info || (typeof m?.info === "function" ? m.info() : m?.info); return ri && JSON.stringify(ri.render || ri).slice(0, 200); }));
report(page, tag);
await browser.close();
