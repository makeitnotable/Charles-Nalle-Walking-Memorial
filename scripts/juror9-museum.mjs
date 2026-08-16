// juror9: /paintings museum as a visitor
import { launch, goto, shot, sleep, byText, floating, VIEWPORTS, log, saveJson, touchDrag, touchTap } from "./juror9-lib.mjs";

const key = process.argv[2] || "d1440";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp);
const notes = {};
const N = (k, v) => { notes[k] = v; log(k, JSON.stringify(v)); };

const ui = () => page.evaluate(() => {
  const vis = (b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight; };
  const list = [...document.querySelectorAll("button, a, [role=button], .t-meta, [class*=chip], [class*=pill]")].filter(vis).map((b) => {
    const r = b.getBoundingClientRect();
    return { t: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), lines: b.getClientRects().length, tag: b.tagName.toLowerCase() };
  });
  return list.filter((b) => b.y < innerHeight && b.y + b.h > 0).slice(0, 40);
});
const st = () => page.evaluate(() => { const m = window.__museum; if (!m) return null; const s = JSON.parse(JSON.stringify(m.state)); return { mode: s.mode, railIdx: s.railIdx, railT: s.railT, approached: s.approached, zoom: s.zoom, alive: s.alive, look: s.look, sheet: s.sheet, fov: s.fov, portrait: s.portrait }; });
const prect = (i) => page.evaluate((i) => { const r = window.__museum?.paintingRect(i); return r && { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), behind: r.behind }; }, i);
const focusInfo = () => page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); return { t: (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 40), tag: a.tagName, outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 80), fv: a.matches(":focus-visible") }; });
const clickAt = async (x, y) => { if (vp.mobile) await touchTap(page, x, y); else await page.mouse.click(x, y); };
const stageTop = () => page.evaluate(() => { const c = document.querySelector("canvas"); const r = c?.getBoundingClientRect(); return r ? { top: Math.round(r.top), h: Math.round(r.height), scrollY: Math.round(scrollY) } : null; });

try {
  await goto(page, "/paintings", 6000);
  await shot(page, `${key}-mus-00-top`);
  N("top.ui", await ui());
  N("top.stage", await stageTop());
  N("top.state", await st());
  const r0 = await prect(0);
  N("top.rect0", r0);

  // FROM THE PAGE TOP WITHOUT SCROLLING click the visible painting
  if (r0 && !r0.behind) {
    const cx = Math.min(Math.max((r0.l + r0.r) / 2, 10), vp.width - 10);
    const cy = Math.min(Math.max((r0.t + r0.b) / 2, 10), vp.height - 10);
    N("top.clickAt", [cx, cy]);
    await clickAt(cx, cy);
    await sleep(2500);
    await shot(page, `${key}-mus-01-approach-from-top`);
    N("fromtop.state", await st());
    N("fromtop.stage", await stageTop());
    N("fromtop.ui", await ui());
    N("fromtop.rect", await prect(0));
    // Back to the hall via mouse: focus ring?
    const back = await byText(page, /Back to the hall/i);
    N("fromtop.back", back ? await back.boundingBox() : null);
    if (back) {
      const b = await back.boundingBox();
      await clickAt(b.x + b.width / 2, b.y + b.height / 2);
      await sleep(300);
      N("fromtop.focusAfterBackClick", await focusInfo());
      await shot(page, `${key}-mus-02-after-back-click`);
      await sleep(1500);
      N("fromtop.stateAfterBack", await st());
    }
  }

  // scroll the rail
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await sleep(500);
  const total = await page.evaluate(() => document.body.scrollHeight);
  N("rail.total", total);
  for (const f of [0.12, 0.3]) {
    await page.evaluate((f) => scrollTo({ top: document.body.scrollHeight * f, behavior: "instant" }), f);
    await sleep(2200);
    await shot(page, `${key}-mus-03-rail-${Math.round(f * 100)}`);
    N(`rail.${f}.state`, await st());
    N(`rail.${f}.ui`, await ui());
  }
  // drag to look
  const c = await stageTop();
  const cy = (c ? c.top : 0) + vp.height / 2;
  if (vp.mobile) await touchDrag(page, vp.width * 0.7, cy, vp.width * 0.2, cy, 12, 0, 16); else { await page.mouse.move(vp.width * 0.7, cy); await page.mouse.down(); await page.mouse.move(vp.width * 0.2, cy, { steps: 12 }); await page.mouse.up(); }
  await sleep(1500);
  await shot(page, `${key}-mus-04-looked-away`);
  N("look.state", await st());
  N("look.ui", await ui());
  const ff = await byText(page, /Face forward/i);
  N("look.faceForward", ff ? await ff.boundingBox() : null);
  if (ff) { const b = await ff.boundingBox(); await clickAt(b.x + b.width / 2, b.y + b.height / 2); await sleep(1500); N("look.afterFF", await st()); await shot(page, `${key}-mus-05-face-forward`); }

  // approach a painting by clicking it (rail idx)
  const s1 = await st();
  // pick a painting ahead that is fully inside the viewport
  let idx = -1, pr = null;
  for (let i = (s1?.railIdx ?? 0); i < 10; i++) { const r = await prect(i); if (r && !r.behind && r.l >= 0 && r.r <= vp.width && r.t >= 0 && r.b <= vp.height && r.w > 40) { idx = i; pr = r; break; } }
  if (idx < 0) { idx = Math.min((s1?.railIdx ?? 0) + 1, 9); pr = await prect(idx); }
  N("approach.idx", idx); N("approach.rectBefore", pr);
  if (pr && !pr.behind) { await clickAt(Math.min(Math.max((pr.l + pr.r) / 2, 10), vp.width - 10), Math.min(Math.max((pr.t + pr.b) / 2, 10), vp.height - 10)); }
  await sleep(2500);
  await shot(page, `${key}-mus-06-approach`);
  N("approach.state", await st());
  N("approach.rect", await prect(idx));
  N("approach.ui", await ui());
  N("approach.plaque", await page.evaluate(() => {
    const hs = [...document.querySelectorAll("h2, h3, p")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05; });
    return hs.map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 80), lines: e.getClientRects().length, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }).slice(0, 12);
  }));
  // tap the painting to bring it to life
  pr = await prect(idx);
  if (pr) { await clickAt((pr.l + pr.r) / 2, (pr.t + pr.b) / 2); await sleep(2500); N("alive.state", await st()); await shot(page, `${key}-mus-07-alive`); N("alive.video", await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => ({ paused: v.paused, t: v.currentTime, w: v.videoWidth, h: v.videoHeight })))); await clickAt((pr.l + pr.r) / 2, (pr.t + pr.b) / 2); await sleep(800); N("alive.afterSecondTap", await st()); }

  // phone: peek sheet drag
  if (vp.mobile && vp.width < 640) {
    const sh = page.locator("[aria-label*='plaque' i]").first();
    N("sheet.handle", (await sh.count()) ? await sh.boundingBox() : null);
    if (await sh.count()) {
      const b = await sh.boundingBox();
      await touchDrag(page, b.x + b.width / 2, b.y + 20, b.x + b.width / 2, b.y - 260, 14, 0, 16);
      await sleep(1200);
      N("sheet.afterDrag", await st());
      N("sheet.rect", await prect(idx));
      await shot(page, `${key}-mus-08-sheet-full`);
      await touchTap(page, b.x + b.width / 2, b.y + 20 - 260);
      await sleep(1000);
      N("sheet.afterTap", await st());
      await shot(page, `${key}-mus-09-sheet-after-tap`);
    }
  }
  // Back to the hall
  let back = await byText(page, /Back to the hall/i);
  N("back.btn", back ? await back.boundingBox() : null);
  if (back) { const b = await back.boundingBox(); await clickAt(b.x + b.width / 2, b.y + b.height / 2); await sleep(1800); N("back.state", await st()); await shot(page, `${key}-mus-10-back`); }

  // last painting (index 9)
  await page.evaluate(() => window.__museum.approach(9));
  await sleep(3000);
  await shot(page, `${key}-mus-11-last`);
  N("last.state", await st());
  N("last.rect", await prect(9));
  N("last.ui", await ui());
  N("last.plaque", await page.evaluate(() => [...document.querySelectorAll("h2, h3")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().top < innerHeight).map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 80), lines: e.getClientRects().length }))));
  // Esc
  await page.keyboard.press("Escape"); await sleep(1500);
  N("esc.state", await st());
  await shot(page, `${key}-mus-12-esc`);

  // plaque titles for works 6/7/9/10 (indices 5,6,8,9)
  const titles = {};
  for (const i of [5, 6, 8, 9]) {
    await page.evaluate((i) => window.__museum.approach(i), i);
    await sleep(2200);
    titles[i] = await page.evaluate(() => [...document.querySelectorAll("h2, h3")].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top < innerHeight && r.bottom > 0; }).map((e) => ({ t: e.textContent.trim().replace(/\s+/g, " ").slice(0, 80), lines: e.getClientRects().length, w: Math.round(e.getBoundingClientRect().width) })));
    await shot(page, `${key}-mus-13-approach-${i}`);
    N(`title.${i}.rect`, await prect(i));
    await page.keyboard.press("Escape"); await sleep(1200);
  }
  N("titles", titles);

  // keyboard: fresh load, Tab from the top, Enter on a dot, Esc, arrows
  await goto(page, "/paintings", 5000);
  const kb = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); await sleep(200); kb.push(await focusInfo()); }
  await shot(page, `${key}-mus-14a-kb-tab`);
  // Tab until a dot ("Approach") is focused
  for (let i = 0; i < 6; i++) { const f = await focusInfo(); if (/Approach/.test(f?.t || "")) break; await page.keyboard.press("Tab"); await sleep(150); }
  N("kb.focusBeforeEnter", await focusInfo());
  N("kb.tabs", kb);
  await page.keyboard.press("Enter"); await sleep(2200);
  N("kb.afterEnter", await st());
  await shot(page, `${key}-mus-14-kb-enter`);
  await page.keyboard.press("ArrowRight"); await sleep(1500);
  N("kb.afterRight", await st());
  await page.keyboard.press("Escape"); await sleep(1500);
  N("kb.afterEsc", await st());
  N("kb.focusAfterEsc", await focusInfo());
  await page.keyboard.press("ArrowLeft"); await sleep(1200);
  N("kb.afterLeftInRail", await st());

  // menu open/close on paintings + scroll hide
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(600);
  const burger = page.locator("button[aria-label='Open menu']").first();
  await burger.click(); await sleep(900); await shot(page, `${key}-mus-15-menu-open`);
  N("menu.open", await ui());
  const close = page.locator("button[aria-label*='Close' i]").first();
  if (await close.count()) { await close.click(); await sleep(700); }
  N("menu.closed", await page.evaluate(() => document.querySelector("button[aria-label='Open menu']")?.getAttribute("aria-expanded")));
  // scroll down: burger hides? then up: returns?
  await page.mouse.move(vp.width / 2, vp.height / 2);
  await page.mouse.wheel(0, 500); await sleep(400); await page.mouse.wheel(0, 500); await sleep(800);
  N("menu.afterDown", await page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu']"); const w = b?.closest(".cnwm-menu") || b; const r = w.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), op: getComputedStyle(w).opacity, vis: getComputedStyle(w).visibility, tr: getComputedStyle(w).transform }; }));
  await page.mouse.wheel(0, -120); await sleep(800);
  N("menu.afterUp", await page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu']"); const w = b?.closest(".cnwm-menu") || b; const r = w.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), op: getComputedStyle(w).opacity, vis: getComputedStyle(w).visibility, tr: getComputedStyle(w).transform }; }));

  // 2-D grid at the foot
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight - innerHeight * 2.2, behavior: "instant" })); await sleep(1500);
  await shot(page, `${key}-mus-16-grid`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" })); await sleep(1000);
  await shot(page, `${key}-mus-17-foot`);
} catch (e) { log("ERR", e); notes.error = String(e); }
notes.consoleErrors = errors;
saveJson(`${key}-museum-notes`, notes);
log("console errors:", JSON.stringify(errors, null, 1));
await browser.close();
