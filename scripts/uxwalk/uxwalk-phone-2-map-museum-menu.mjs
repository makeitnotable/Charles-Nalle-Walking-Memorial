#!/usr/bin/env node
/**
 * UX walk (phone) — part 2: /map (overview, walk, lens), /paintings museum,
 * menu, /about footer, deep links, landscape, reduced motion, 320px overflow.
 * Usage: node scripts/uxwalk-phone-2-map-museum-menu.mjs [--only map,museum,menu,about,deep,land,rm,320]
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-phone";
mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const only = (() => { const i = args.indexOf("--only"); return i !== -1 ? args[i + 1].split(",") : null; })();
const want = (k) => !only || only.includes(k);

const results = {};
const log = (k, v) => { results[k] = v; console.log(k, String(JSON.stringify(v)).slice(0, 700)); };
const HIDE_TOOLBAR = "astro-dev-toolbar{display:none !important}";

const RECT = `(el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, vis: cs.visibility, op: cs.opacity, fs: cs.fontSize, txt: (el.textContent || "").trim().slice(0, 80), aria: el.getAttribute && el.getAttribute("aria-label") }; }`;

const CONTROLS = `(() => { const rect = ${RECT}; return [...document.querySelectorAll("button, a, [role=button], input, .mapboxgl-ctrl, .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo")]
  .map((e) => ({ tag: e.tagName, cls: e.className.toString().slice(0, 50), ...rect(e) }))
  .filter((c) => c.w > 0 && c.h > 0 && c.display !== "none" && c.vis !== "hidden" && +c.op > 0.05 && c.y < innerHeight + 5 && c.y + c.h > -5); })()`;

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });

async function newPage(opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["Pixel 5"].userAgent,
    reducedMotion: opts.reducedMotion || "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`); });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message.slice(0, 300)}`));
  page.__errors = errors;
  await ctx.addInitScript(() => {
    const st = document.createElement("style");
    st.textContent = "astro-dev-toolbar{display:none !important}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(st));
  });
  return { ctx, page };
}

/** Touch drag via CDP */
async function touchDrag(page, x1, y1, x2, y2, steps = 12, ms = 250) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1, id: 1 }] });
  for (let i = 1; i <= steps; i++) {
    const x = x1 + ((x2 - x1) * i) / steps;
    const y = y1 + ((y2 - y1) * i) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y, id: 1 }] });
    await page.waitForTimeout(ms / steps);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/* ------------------------------------------------------------------ MAP */
if (want("map")) {
  for (const vp of [{ name: "390", width: 390, height: 844 }, { name: "360", width: 360, height: 800 }, { name: "430", width: 430, height: 932 }]) {
    const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE}/map`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__troyMap && window.__troyMap.map && window.__troyMap.map.loaded && window.__troyMap.map.loaded(), null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await page.screenshot({ path: join(OUT, `map-${vp.name}-01-overview.png`) });
    const ov = await page.evaluate(CONTROLS);
    log(`map-${vp.name}-overview-controls`, ov);
    const state0 = await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, center: h.map.getCenter(), zoom: h.map.getZoom(), pitch: h.map.getPitch(), bearing: h.map.getBearing() } : null; });
    log(`map-${vp.name}-state0`, state0);
    // markers
    const markers = await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), aria: m.querySelector("[aria-label]")?.getAttribute("aria-label"), txt: m.innerText?.slice(0, 40) }; }));
    log(`map-${vp.name}-markers`, markers);
    // Tap "Take the walk"
    const walkBtn = page.getByRole("button", { name: "Take the walk" });
    await walkBtn.tap();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(OUT, `map-${vp.name}-02-walk-start.png`) });
    const walkCtrls = await page.evaluate(CONTROLS);
    log(`map-${vp.name}-walk-controls`, walkCtrls);
    const cards = await page.evaluate(() => { const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(el).opacity, tf: getComputedStyle(el).transform }; };
      return [...document.querySelectorAll(".keen-slider__slide")].map((s) => ({ ...rect(s), inner: rect(s.firstElementChild), card: rect(s.querySelector("[role=button]")), aria: s.querySelector("[role=button]")?.getAttribute("aria-label"), filter: getComputedStyle(s.querySelector("[role=button]")).filter, innerOp: getComputedStyle(s.firstElementChild).opacity })); });
    log(`map-${vp.name}-walk-cards`, cards);
    const state1 = await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, center: h.map.getCenter(), zoom: h.map.getZoom() } : null; });
    log(`map-${vp.name}-state-walk`, state1);
    // wait for auto-advance
    await page.waitForTimeout(6000);
    await page.screenshot({ path: join(OUT, `map-${vp.name}-03-walk-auto.png`) });
    const state2 = await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, center: h.map.getCenter(), zoom: h.map.getZoom() } : null; });
    log(`map-${vp.name}-state-walk2`, state2);
    // Drag the carousel by touch (swipe left)
    const cardEl = cards.find((c) => c.card && c.card.x < vp.width && c.card.x + c.card.w > 0);
    const cy = cardEl ? cardEl.card.y + cardEl.card.h / 2 : vp.height - 120;
    await touchDrag(page, vp.width * 0.8, cy, vp.width * 0.2, cy, 14, 260);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, `map-${vp.name}-04-walk-after-drag.png`) });
    const state3 = await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, center: h.map.getCenter(), zoom: h.map.getZoom(), btn: [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter(Boolean) } : null; });
    log(`map-${vp.name}-state-after-drag`, state3);
    await page.waitForTimeout(7000);
    const state4 = await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, center: h.map.getCenter(), zoom: h.map.getZoom() } : null; });
    log(`map-${vp.name}-state-after-drag+7s`, state4);
    await page.screenshot({ path: join(OUT, `map-${vp.name}-05-walk-after-drag-7s.png`) });
    // Stop the walk / back to map
    const stop = page.getByRole("button", { name: /Stop the walk|Back to map/ }).first();
    if (await stop.count()) { await stop.tap(); await page.waitForTimeout(2500); }
    await page.screenshot({ path: join(OUT, `map-${vp.name}-06-after-stop.png`) });
    log(`map-${vp.name}-after-stop-controls`, await page.evaluate(CONTROLS));
    // Lens
    const lensBtn = page.getByRole("button", { name: "See Troy in 1858" });
    if (await lensBtn.count()) {
      await lensBtn.tap();
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `map-${vp.name}-07-lens.png`) });
      const lens = await page.evaluate(() => { const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
        const viewer = document.querySelector('[aria-label^="Map of Troy in 1858"]');
        const texts = [...document.querySelectorAll("p, span, figcaption, h2, h3")].filter((e) => e.children.length === 0 && e.innerText?.trim() && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().y < innerHeight).map((e) => ({ tag: e.tagName, ...rect(e), fs: getComputedStyle(e).fontSize, lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16)), txt: e.innerText.slice(0, 120) }));
        return { viewer: rect(viewer), viewerAria: viewer?.getAttribute("aria-label"), texts }; });
      log(`map-${vp.name}-lens`, lens);
      log(`map-${vp.name}-lens-controls`, await page.evaluate(CONTROLS));
      // pan the lens by touch
      if (lens.viewer) {
        const v = lens.viewer;
        await touchDrag(page, v.x + v.w * 0.7, v.y + v.h * 0.5, v.x + v.w * 0.3, v.y + v.h * 0.5, 12, 300);
        await page.waitForTimeout(800);
        await page.screenshot({ path: join(OUT, `map-${vp.name}-08-lens-panned.png`) });
      }
      const back = page.getByRole("button", { name: "Back to today" });
      if (await back.count()) { await back.tap(); await page.waitForTimeout(1500); }
    }
    // Tap a marker directly (overview)
    const mk = markers.find((m) => m.aria);
    if (mk) {
      await page.touchscreen.tap(mk.x + mk.w / 2, mk.y + mk.h / 2);
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `map-${vp.name}-09-marker-tap.png`) });
      log(`map-${vp.name}-marker-tap-state`, await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state } : null; }));
      log(`map-${vp.name}-marker-tap-controls`, await page.evaluate(CONTROLS));
    }
    log(`map-${vp.name}-errors`, page.__errors);
    await ctx.close();
  }
}

/* --------------------------------------------------------------- MUSEUM */
if (want("museum")) {
  for (const vp of [{ name: "390", width: 390, height: 844 }, { name: "360", width: 360, height: 800 }]) {
    const { ctx, page } = await newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${BASE}/paintings`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await page.screenshot({ path: join(OUT, `paintings-${vp.name}-01-first.png`) });
    log(`paintings-${vp.name}-first-controls`, await page.evaluate(CONTROLS));
    log(`paintings-${vp.name}-hint`, await page.evaluate(() => [...document.querySelectorAll("p, button, span")].filter((e) => e.children.length === 0 && e.innerText?.trim() && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().y < innerHeight).slice(0, 12).map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), txt: e.innerText.slice(0, 60) }; })));
    log(`paintings-${vp.name}-state0`, await page.evaluate(() => { const m = window.__museum; return m ? { works: m.works ?? m.state?.works, state: m.state } : null; }));
    // scroll the rail
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    log(`paintings-${vp.name}-scrollH`, H);
    for (const f of [0.15, 0.35, 0.55]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(H * f));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(OUT, `paintings-${vp.name}-02-scroll-${Math.round(f * 100)}.png`) });
    }
    log(`paintings-${vp.name}-state-scrolled`, await page.evaluate(() => { const m = window.__museum; return m ? { state: m.state } : null; }));
    // tap a painting: use the hook to find its rect
    const pr = await page.evaluate(() => { const m = window.__museum; if (!m || !m.paintingRect) return null; const out = []; for (let i = 0; i < 12; i++) { try { const r = m.paintingRect(i); if (r) out.push({ i, r }); } catch (e) { out.push({ i, err: String(e).slice(0, 60) }); } } return out; });
    log(`paintings-${vp.name}-paintingRects`, pr);
    const target = (pr || []).find((p) => p.r && p.r.x + p.r.w / 2 > 0 && p.r.x + p.r.w / 2 < vp.width && p.r.y + p.r.h / 2 > 60 && p.r.y + p.r.h / 2 < vp.height - 60);
    if (target) {
      await page.touchscreen.tap(target.r.x + target.r.w / 2, target.r.y + target.r.h / 2);
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `paintings-${vp.name}-03-approach-tap.png`) });
      log(`paintings-${vp.name}-approach-controls`, await page.evaluate(CONTROLS));
      log(`paintings-${vp.name}-approach-plaque`, await page.evaluate(() => { const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }; const m = window.__museum; const st = m?.state; const idx = st?.approached ?? st?.approachedIdx; let prect = null; try { prect = m.paintingRect(typeof idx === "number" ? idx : 0); } catch {} const plaque = [...document.querySelectorAll("div")].find((d) => d.className.toString().includes("max-w-[46ch]")); return { state: st, paintingRect: prect, plaque: rect(plaque), plaqueTxt: plaque?.innerText.slice(0, 200) }; }));
    } else {
      // fallback: use hook approach()
      await page.evaluate(() => window.__museum?.approach?.(2));
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `paintings-${vp.name}-03-approach-hook.png`) });
      log(`paintings-${vp.name}-approach-controls`, await page.evaluate(CONTROLS));
      log(`paintings-${vp.name}-approach-plaque`, await page.evaluate(() => { const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }; const m = window.__museum; const st = m?.state; let prect = null; try { prect = m.paintingRect(2); } catch {} const plaque = [...document.querySelectorAll("div")].find((d) => d.className.toString().includes("max-w-[46ch]")); return { state: st, paintingRect: prect, plaque: rect(plaque), plaqueTxt: plaque?.innerText.slice(0, 200) }; }));
    }
    // back
    const backBtn = page.getByRole("button", { name: /Back|hall/i }).first();
    if (await backBtn.count()) { await backBtn.tap().catch(() => {}); await page.waitForTimeout(2000); }
    // approach the last (portrait) painting via hook
    await page.evaluate(() => window.__museum?.approach?.(9));
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(OUT, `paintings-${vp.name}-04-approach-9.png`) });
    log(`paintings-${vp.name}-approach9`, await page.evaluate(() => { const m = window.__museum; let r = null; try { r = m.paintingRect(9); } catch {} return { r, state: m?.state, placement: m?.placements?.[9] }; }));
    // back and scroll to grid
    await page.evaluate(() => window.__museum?.turnOff?.());
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.75, behavior: "instant" }));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, `paintings-${vp.name}-05-grid.png`) });
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `paintings-${vp.name}-06-bottom.png`) });
    log(`paintings-${vp.name}-grid`, await page.evaluate(() => { const list = document.querySelector('[aria-label="Works in the hall"]'); if (!list) return null; return [...list.querySelectorAll("button, a")].slice(0, 12).map((b) => { const r = b.getBoundingClientRect(); const img = b.querySelector("img"); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), aria: b.getAttribute("aria-label"), img: img ? { w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height), nat: [img.naturalWidth, img.naturalHeight], fit: getComputedStyle(img).objectFit } : null }; }); }));
    log(`paintings-${vp.name}-errors`, page.__errors);
    await ctx.close();
  }
}

/* ----------------------------------------------------------------- MENU */
if (want("menu")) {
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/bakery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const burger = page.locator('button[aria-label="Open menu"]');
  log("menu-burger-rect", await burger.evaluate((b) => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  await burger.tap();
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(OUT, `menu-390-01-open.png`) });
  log("menu-open", await page.evaluate(() => { const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: cs.opacity, tf: cs.transform, transition: cs.transitionProperty + " " + cs.transitionDuration, anim: cs.animationName }; }; const panel = document.querySelector(".cnwm-menu-panel"); const closes = [...document.querySelectorAll(".cnwm-menu-close")].map((c) => ({ ...rect(c), icon: rect(c.querySelector("svg, span, i")) })); const links = [...panel.querySelectorAll("a")].map((a) => ({ ...rect(a), txt: a.innerText.trim().slice(0, 30) })); const scrim = rect(document.querySelector(".cnwm-menu-scrim")); const focused = document.activeElement?.outerHTML.slice(0, 80); return { panel: rect(panel), closes, links, scrim, focused, burger: rect(document.querySelector('button[aria-label="Open menu"]')), bodyOverflow: getComputedStyle(document.body).overflow }; }));
  // close animation frames
  const close = page.locator(".cnwm-menu-close").first();
  await close.tap();
  await page.screenshot({ path: join(OUT, `menu-390-02-closing-0ms.png`) });
  await page.waitForTimeout(150);
  await page.screenshot({ path: join(OUT, `menu-390-03-closing-150ms.png`) });
  await page.waitForTimeout(700);
  await page.screenshot({ path: join(OUT, `menu-390-04-closed.png`) });
  log("menu-closed", await page.evaluate(() => { const p = document.querySelector(".cnwm-menu-panel"); return { hidden: p.hidden, cls: p.className, display: getComputedStyle(p).display }; }));
  // burger hide/show on scroll
  await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo({ top: 1900, behavior: "instant" }));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo({ top: 2200, behavior: "instant" }));
  await page.waitForTimeout(900);
  const b1 = await burger.evaluate((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { y: r.y, op: cs.opacity, tf: cs.transform, vis: cs.visibility, cls: b.className.slice(0, 120) }; });
  await page.screenshot({ path: join(OUT, `menu-390-05-scrolled-down.png`) });
  await page.evaluate(() => window.scrollTo({ top: 1900, behavior: "instant" }));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo({ top: 1700, behavior: "instant" }));
  await page.waitForTimeout(900);
  const b2 = await burger.evaluate((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { y: r.y, op: cs.opacity, tf: cs.transform, vis: cs.visibility, cls: b.className.slice(0, 120) }; });
  await page.screenshot({ path: join(OUT, `menu-390-06-scrolled-up.png`) });
  log("menu-burger-scroll", { down: b1, up: b2 });
  // hover-only affordances: elements with :hover rules but no focus/active equivalents — census of stylesheet
  log("hover-rules", await page.evaluate(() => { const out = new Set(); for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch { continue; } for (const r of rules) { if (r.selectorText && /:hover/.test(r.selectorText) && !/@media/.test(r.parentRule?.cssText || "")) out.add(r.selectorText.slice(0, 80)); } } return [...out].slice(0, 40); }));
  log("menu-errors", page.__errors);
  await ctx.close();
}

/* ---------------------------------------------------------------- ABOUT / PEOPLE / 404 */
if (want("about")) {
  const { ctx, page } = await newPage();
  for (const r of ["about", "people", "404-not-here"]) {
    await page.goto(`${BASE}/${r}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, `${r.replace(/[^a-z0-9]/g, "")}-390-01-top.png`) });
    log(`${r}-top`, await page.evaluate(() => ({ title: document.title, docW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, h1: document.querySelector("h1")?.innerText, ctas: [...document.querySelectorAll("a.btn, button.btn, .btn")].map((b) => { const r = b.getBoundingClientRect(); return { txt: b.innerText.trim(), h: Math.round(r.height), w: Math.round(r.width) }; }) })));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${r.replace(/[^a-z0-9]/g, "")}-390-02-footer.png`) });
    if (r === "about") {
      
      log("about-footer", await page.evaluate(() => { const f = document.querySelector("footer"); const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }; return { h: Math.round(f.getBoundingClientRect().height), items: [...f.querySelectorAll("a,p,span")].filter((e) => e.children.length === 0 && e.innerText.trim()).map((e) => ({ tag: e.tagName, ...rect(e), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16)), txt: e.innerText.slice(0, 60) })) }; }));
      log("about-text", await page.evaluate(() => { const heads = [...document.querySelectorAll("h1,h2,h3")].map((h) => ({ tag: h.tagName, txt: h.innerText.replace(/\n/g, "⏎").slice(0, 60), fs: getComputedStyle(h).fontSize })); const paras = [...document.querySelectorAll("main p")].filter((p) => p.getBoundingClientRect().height > 0); const orphans = []; for (const p of paras) { const tn = [...p.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) continue; const text = tn.textContent; const lastWord = text.trimEnd().split(/\s+/).pop(); const idx = text.lastIndexOf(lastWord); const range = document.createRange(); range.setStart(tn, idx); range.setEnd(tn, idx + lastWord.length); const rl = range.getBoundingClientRect(); const before = text.slice(0, idx).trimEnd(); const prevWord = before.split(/\s+/).pop(); if (!prevWord) continue; const pidx = before.lastIndexOf(prevWord); const r2 = document.createRange(); r2.setStart(tn, pidx); r2.setEnd(tn, pidx + prevWord.length); const rp = r2.getBoundingClientRect(); const lines = Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)); if (rl.top > rp.top + 2 && lines > 1) orphans.push({ lastWord, lines, txt: p.innerText.slice(0, 50) }); } return { heads, orphans }; }));
    }
  }
  log("about-errors", page.__errors);
  await ctx.close();
}

/* ------------------------------------------------------------ DEEP LINKS */
if (want("deep")) {
  const { ctx, page } = await newPage();
  for (const [route, file] of [["bakery#scene-0", "deep-bakery-scene0"], ["commissioners-office#scene-1", "deep-co-scene1"], ["barbershop#moral", "deep-barbershop-moral"]]) {
    await page.goto(`${BASE}/${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(OUT, `${file}-390-01.png`) });
    log(`deep-${route}`, await page.evaluate(() => { const id = location.hash.slice(1); const el = document.getElementById(id); const r = el?.getBoundingClientRect(); const h = el?.querySelector("h2"); const hr = h?.getBoundingClientRect(); return { scrollY: Math.round(scrollY), target: r ? { top: Math.round(r.top), h: Math.round(r.height) } : null, heading: hr ? { top: Math.round(hr.top), txt: h.innerText.slice(0, 40), op: getComputedStyle(h).opacity, lineInnerTf: getComputedStyle(h.querySelector(".line-inner") || h).transform } : null, isIn: h?.classList.contains("is-in"), lockup: document.getElementById("hero-lockup") ? getComputedStyle(document.getElementById("hero-lockup")).opacity : null }; }));
    // then press back-like: navigate to next chapter and go back
  }
  // history back after in-page nav
  await page.goto(`${BASE}/bakery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1500);
  const cont = page.getByRole("link", { name: /Continue/ }).first();
  await cont.tap();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: join(OUT, `deep-continue-390-02-next.png`) });
  log("deep-continue-url", page.url());
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, `deep-back-390-03.png`) });
  log("deep-back", await page.evaluate(() => ({ url: location.href, scrollY: Math.round(scrollY), curtain: getComputedStyle(document.getElementById("curtain-panel")).transform, curtainRect: document.getElementById("curtain-panel").getBoundingClientRect().toJSON(), lockupOp: getComputedStyle(document.getElementById("hero-lockup") || document.body).opacity })));
  log("deep-errors", page.__errors);
  await ctx.close();
}

/* -------------------------------------------------------------- LANDSCAPE */
if (want("land")) {
  const { ctx, page } = await newPage({ viewport: { width: 844, height: 390 } });
  for (const r of ["", "bakery", "map", "paintings"]) {
    await page.goto(`${BASE}/${r}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(OUT, `land-${r || "home"}-844x390-01.png`) });
    log(`land-${r || "home"}`, await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, innerW: innerWidth, scrollH: document.documentElement.scrollHeight, h1: document.querySelector("h1")?.getBoundingClientRect().toJSON(), ctas: [...document.querySelectorAll("a.btn, button.btn, .btn, button")].filter((b) => b.getBoundingClientRect().height > 0).map((b) => { const r = b.getBoundingClientRect(); return { txt: (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }) })));
    if (r === "bakery") {
      await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, `land-bakery-844x390-02-scene.png`) });
      await page.evaluate(() => document.getElementById("moral")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, `land-bakery-844x390-03-moral.png`) });
    }
    if (r === "map") {
      const walk = page.getByRole("button", { name: "Take the walk" });
      if (await walk.count()) { await walk.tap(); await page.waitForTimeout(3500); await page.screenshot({ path: join(OUT, `land-map-844x390-02-walk.png`) }); log("land-map-walk-controls", await page.evaluate(CONTROLS)); }
    }
    if (r === "paintings") {
      await page.evaluate(() => window.__museum?.approach?.(3));
      await page.waitForTimeout(3000);
      await page.screenshot({ path: join(OUT, `land-paintings-844x390-02-approach.png`) });
    }
  }
  log("land-errors", page.__errors);
  await ctx.close();
}

/* --------------------------------------------------------- REDUCED MOTION */
if (want("rm")) {
  const { ctx, page } = await newPage({ reducedMotion: "reduce" });
  for (const r of ["", "bakery", "map", "paintings"]) {
    await page.goto(`${BASE}/${r}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(OUT, `rm-${r || "home"}-390-01.png`) });
    if (r === "bakery") {
      const secs = ["scene-0", "history", "moral", "onward"];
      for (const s of secs) {
        await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }), s);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: join(OUT, `rm-bakery-390-${s}.png`) });
      }
      log("rm-bakery-invisible", await page.evaluate(() => { const bad = []; for (const el of document.querySelectorAll("h1,h2,h3,p,img,picture,.lines,.wipe,.wipe-clip")) { const r = el.getBoundingClientRect(); if (r.height === 0 && r.width === 0) continue; const cs = getComputedStyle(el); const inner = el.querySelector?.(".line-inner"); const tf = inner ? getComputedStyle(inner).transform : cs.transform; if (+cs.opacity < 0.1 || (cs.clipPath && /inset\(0(px)? 0(px)? 100%/.test(cs.clipPath)) || (tf && tf !== "none" && /matrix\(1, 0, 0, 1, 0, (\d{2,})/.test(tf))) bad.push({ tag: el.tagName, cls: el.className.toString().slice(0, 40), op: cs.opacity, clip: cs.clipPath, tf, txt: el.innerText?.slice(0, 30) }); } return bad.slice(0, 20); }));
      const heroVideo = await page.evaluate(() => { const v = document.querySelector("#hero video"); return v ? { paused: v.paused, autoplay: v.autoplay, src: v.currentSrc.slice(-40) } : "no-video"; });
      log("rm-hero-video", heroVideo);
    }
    if (r === "map") {
      const walk = page.getByRole("button", { name: "Take the walk" });
      if (await walk.count()) { await walk.tap(); await page.waitForTimeout(3500); await page.screenshot({ path: join(OUT, `rm-map-390-02-walk.png`) }); log("rm-map-walk-state", await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, zoom: h.map.getZoom(), center: h.map.getCenter() } : null; })); await page.waitForTimeout(6000); log("rm-map-walk-state2", await page.evaluate(() => { const h = window.__troyMap; return h ? { ...h.state, zoom: h.map.getZoom(), center: h.map.getCenter() } : null; })); }
    }
    if (r === "paintings") {
      log("rm-paintings-first", await page.evaluate(() => ({ hasCanvas: !!document.querySelector("canvas"), texts: [...document.querySelectorAll("p,button")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().y < innerHeight).map((e) => e.innerText.trim().slice(0, 50)).filter(Boolean).slice(0, 10) })));
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.3, behavior: "instant" }));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(OUT, `rm-paintings-390-02-scroll.png`) });
      await page.evaluate(() => window.__museum?.approach?.(3));
      await page.waitForTimeout(3000);
      await page.screenshot({ path: join(OUT, `rm-paintings-390-03-approach.png`) });
    }
  }
  log("rm-errors", page.__errors);
  await ctx.close();
}

/* --------------------------------------------------------------- 320 px */
if (want("320")) {
  const { ctx, page } = await newPage({ viewport: { width: 320, height: 568 } });
  for (const r of ["", "bakery", "map", "paintings", "people", "about"]) {
    await page.goto(`${BASE}/${r}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const ov = await page.evaluate(() => { const bad = []; for (const e of document.querySelectorAll("body *")) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed") bad.push({ tag: e.tagName, cls: e.className.toString().slice(0, 50), right: Math.round(r.right), w: Math.round(r.width) }); } return { docW: document.documentElement.scrollWidth, innerW: innerWidth, bad: bad.slice(0, 12) }; });
    log(`w320-${r || "home"}`, ov);
    await page.screenshot({ path: join(OUT, `w320-${r || "home"}-320x568-01.png`) });
    if (r === "map") {
      const walk = page.getByRole("button", { name: "Take the walk" });
      if (await walk.count()) { await walk.tap(); await page.waitForTimeout(3500); await page.screenshot({ path: join(OUT, `w320-map-320x568-02-walk.png`) }); log("w320-map-walk-controls", await page.evaluate(CONTROLS)); }
    }
    if (r === "bakery") {
      await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ behavior: "instant" }));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(OUT, `w320-bakery-320x568-02-onward.png`) });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: join(OUT, `w320-bakery-320x568-03-footer.png`) });
    }
  }
  log("w320-errors", page.__errors);
  await ctx.close();
}

await browser.close();
writeFileSync(join(OUT, `part2${only ? "-" + only.join("-") : ""}.json`), JSON.stringify(results, null, 1));
