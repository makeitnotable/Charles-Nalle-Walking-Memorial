import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep, cdp, touchDrag, touchTap } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `museum-${vpKey}`);
const tag = `museum-${vpKey}`;
const session = await cdp(page);
await goto(page, "/paintings", 5000);
const st = () => page.evaluate(() => { const m = window.__museum; const s = typeof m.state === "function" ? m.state() : m.state; return { mode: s.mode, approached: s.approached, alive: s.alive, zoom: s.zoom, sheet: s.sheet, railT: +s.railT.toFixed(2), look: [+s.look.yaw.toFixed(2), +s.look.pitch.toFixed(2)] }; });
const ui = () => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const els = [...document.querySelectorAll("button, a, [role=status], h2, h3, p")].filter((e) => vis(e) && !/Approach “|Skip to content/.test(e.getAttribute("aria-label") || e.textContent)).map((e) => { const r = e.getBoundingClientRect(); return `${(e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 45)}@${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}`; });
  const menu = document.querySelector(".cnwm-menu"); const mcs = getComputedStyle(menu); const mr = menu.getBoundingClientRect();
  const q = window.__museum.paintingRect((typeof window.__museum.state === "function" ? window.__museum.state() : window.__museum.state).approached ?? 0);
  return { els, menu: `${Math.round(mr.x)},${Math.round(mr.y)} op=${mcs.opacity}`, painting: q && [Math.round(q.left), Math.round(q.top), Math.round(q.right - q.left), Math.round(q.bottom - q.top)], y: Math.round(scrollY) };
});
// scroll into the hall
const cTop = await page.evaluate(() => document.querySelector("canvas").getBoundingClientRect().top + scrollY);
await page.evaluate((y) => scrollTo({ top: y + innerHeight * 1.5, behavior: "instant" }), cTop);
await sleep(2000);
log("rail:", JSON.stringify(await st()), JSON.stringify(await ui()));
await shot(page, `${tag}-01-rail`);
// tap a painting in view
const target = await page.evaluate(() => { const m = window.__museum; const n = (typeof m.state === "function" ? m.state() : m.state).works; for (let i = 0; i < n; i++) { const q = m.paintingRect(i); if (q && !q.behind && q.right - q.left > 50 && q.left > 0 && q.right < innerWidth && q.top > 0 && q.bottom < innerHeight) return { i, x: (q.left + q.right) / 2, y: (q.top + q.bottom) / 2 }; } return null; });
log("tap target:", JSON.stringify(target));
if (target) await touchTap(session, target.x, target.y); else await page.evaluate(() => window.__museum.approach(2));
await sleep(2800);
let s = await st(); let u = await ui();
log("approach (peek):", JSON.stringify(s), JSON.stringify(u));
await shot(page, `${tag}-02-approach-peek`);
// sheet header: find "Expand the plaque" button or the sheet header
const header = await page.evaluate(() => { const b = [...document.querySelectorAll("*")].find((b) => /plaque|sheet/i.test(b.getAttribute("aria-label") || "") && b.getBoundingClientRect().width > 100); if (!b) { const eb = [...document.querySelectorAll("p, span")].find((e) => /Mark Priest/.test(e.textContent) && e.getBoundingClientRect().width > 0); if (!eb) return null; const r = eb.getBoundingClientRect(); return { x: innerWidth / 2, y: r.y - 14, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], via: "eyebrow" }; } const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], tag: b.tagName, label: b.getAttribute("aria-label") }; });
log("sheet header:", JSON.stringify(header));
if (header) {
  // drag the header up
  await touchDrag(session, { x: header.x, y: header.y }, { x: header.x, y: header.y - vp.height * 0.4 }, 14, 16);
  await sleep(1200);
  s = await st(); u = await ui();
  log("after drag up:", JSON.stringify(s), JSON.stringify(u));
  await shot(page, `${tag}-03-sheet-up`);
  // painting still visible above the sheet?
  const sheetTop = await page.evaluate(() => { const eb = [...document.querySelectorAll("p, span")].find((e) => /Mark Priest/.test(e.textContent) && e.getBoundingClientRect().width > 0); return eb ? Math.round(eb.getBoundingClientRect().top) - 40 : null; });
  log("sheet top:", sheetTop, "painting bottom:", u.painting && u.painting[1] + u.painting[3]);
  // drag back down
  const h2 = await page.evaluate(() => { const b = [...document.querySelectorAll("*")].find((b) => /plaque|sheet/i.test(b.getAttribute("aria-label") || "") && b.getBoundingClientRect().width > 100); if (b) { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; } const eb = [...document.querySelectorAll("p, span")].find((e) => /Mark Priest/.test(e.textContent) && e.getBoundingClientRect().width > 0); const r = eb.getBoundingClientRect(); return { x: innerWidth / 2, y: r.y - 14 }; });
  await touchDrag(session, { x: h2.x, y: h2.y }, { x: h2.x, y: h2.y + vp.height * 0.4 }, 14, 16);
  await sleep(1200);
  s = await st();
  log("after drag down:", JSON.stringify(s));
  await shot(page, `${tag}-04-sheet-down`);
  // tap the header (should toggle)
  const h3 = await page.evaluate(() => { const b = [...document.querySelectorAll("*")].find((b) => /plaque|sheet/i.test(b.getAttribute("aria-label") || "") && b.getBoundingClientRect().width > 100); if (b) { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; } const eb = [...document.querySelectorAll("p, span")].find((e) => /Mark Priest/.test(e.textContent) && e.getBoundingClientRect().width > 0); const r = eb.getBoundingClientRect(); return { x: innerWidth / 2, y: r.y - 14 }; });
  await touchTap(session, h3.x, h3.y);
  await sleep(1000);
  log("after header tap:", JSON.stringify(await st()));
  await shot(page, `${tag}-05-sheet-tap`);
  await touchTap(session, h3.x, h3.y);
  await sleep(800);
  log("after 2nd header tap:", JSON.stringify(await st()));
}
// tap the painting to bring alive
u = await ui();
if (u.painting) { await touchTap(session, u.painting[0] + u.painting[2] / 2, u.painting[1] + u.painting[3] / 2); await sleep(2500); log("after painting tap:", JSON.stringify(await st())); await shot(page, `${tag}-06-alive`); }
// Back to the hall
const back = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((b) => /Back to the hall/i.test(b.textContent) && b.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
log("Back btn:", JSON.stringify(back));
if (back) { await touchTap(session, back.x, back.y); await sleep(1800); log("after Back:", JSON.stringify(await st())); }
// last portrait on phone
await page.evaluate(() => window.__museum.approach(9));
await sleep(3000);
u = await ui();
log("portrait phone:", JSON.stringify(await st()), JSON.stringify(u));
await shot(page, `${tag}-07-portrait`);
await page.keyboard.press("Escape");
await sleep(1500);
log("after Esc:", JSON.stringify(await st()));
// look drag on canvas in rail
await touchDrag(session, { x: vp.width * 0.8, y: vp.height * 0.45 }, { x: vp.width * 0.2, y: vp.height * 0.45 }, 14, 16);
await sleep(1200);
log("after look drag:", JSON.stringify(await st()), JSON.stringify((await ui()).els.filter((e) => /Face|forward/i.test(e))));
await shot(page, `${tag}-08-looked`);
// scroll to end of hall
await page.evaluate(() => scrollTo({ top: document.querySelector("canvas").getBoundingClientRect().top + scrollY + innerHeight * 9.5, behavior: "instant" }));
await sleep(2000);
await shot(page, `${tag}-09-hall-end`);
await page.evaluate(() => scrollTo({ top: document.body.scrollHeight - innerHeight * 2.5, behavior: "instant" }));
await sleep(1500);
await shot(page, `${tag}-10-grid`);
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");
log("console errors:", errs.length ? errs : "none");
await browser.close();
