#!/usr/bin/env node
/** UX walk (phone) — part 3: targeted verifications of suspected findings. */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-phone";
mkdirSync(OUT, { recursive: true });
const results = {};
const log = (k, v) => { results[k] = v; console.log(k, String(JSON.stringify(v)).slice(0, 900)); };
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 844 }, deviceScaleFactor: opts.dpr || 2, isMobile: true, hasTouch: true, userAgent: devices["Pixel 5"].userAgent, reducedMotion: opts.reducedMotion || "no-preference" });
  const page = await ctx.newPage();
  const errors = []; const failed = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${m.type()}] ${m.text().slice(0, 1200)}`); });
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message.slice(0, 300)}`));
  page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  page.__errors = errors; page.__failed = failed;
  await ctx.addInitScript(() => { const st = document.createElement("style"); st.textContent = "astro-dev-toolbar{display:none !important}"; document.addEventListener("DOMContentLoaded", () => document.head.appendChild(st)); });
  return { ctx, page };
}
async function touchDrag(page, x1, y1, x2, y2, steps = 12, ms = 250) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x1, y: y1, id: 1 }] });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x1 + ((x2 - x1) * i) / steps, y: y1 + ((y2 - y1) * i) / steps, id: 1 }] }); await page.waitForTimeout(ms / steps); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/* 1. Deep link #scene-1 on ch2 (repeat, longer wait), + hydration message + 404 resources */
{
  const { ctx, page } = await newPage();
  for (const route of ["commissioners-office#scene-1", "commissioners-office#history", "mansion#scene-0", "ferry#moral"]) {
    await page.goto(`${BASE}/${route}`, { waitUntil: "load" });
    const samples = [];
    for (let t = 0; t < 8; t++) { samples.push(await page.evaluate(() => Math.round(scrollY))); await page.waitForTimeout(500); }
    const info = await page.evaluate(() => { const id = location.hash.slice(1); const el = document.getElementById(id); return { top: el ? Math.round(el.getBoundingClientRect().top + scrollY) : null, scrollH: document.documentElement.scrollHeight }; });
    log(`deep2-${route}`, { samples, ...info });
    await page.screenshot({ path: join(OUT, `deep2-${route.replace(/[#/]/g, "-")}-390.png`) });
  }
  log("hydration-msgs", page.__errors.filter((e) => /hydrat/i.test(e)).slice(0, 2));
  log("failed-requests-chapters", page.__failed);
  await ctx.close();
}
/* 1b. which resource 404s on /about */
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  log("about-404s", page.__failed);
  await page.goto(`${BASE}/people`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  log("people-404s", page.__failed);
  await ctx.close();
}

/* 2. Map: does marker 4 ever come on-screen; drag sampling; attribution + geolocate; POI icon */
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/map`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__troyMap && window.__troyMap.map && window.__troyMap.map.loaded && window.__troyMap.map.loaded(), null, { timeout: 30000 }).catch(() => {});
  const mk = async () => page.evaluate(() => [...document.querySelectorAll(".mapboxgl-marker")].map((m) => { const r = m.getBoundingClientRect(); return [m.innerText.trim(), Math.round(r.x), Math.round(r.y)]; }));
  const t0 = await mk();
  await page.waitForTimeout(12000);
  const t1 = await mk();
  log("map-markers-4s-vs-16s", { t0, t1, vp: await page.evaluate(() => [innerWidth, innerHeight]), zoom: await page.evaluate(() => window.__troyMap.map.getZoom()) });
  await page.screenshot({ path: join(OUT, `map-390-10-overview-16s.png`) });
  // controls
  log("map-controls-detail", await page.evaluate(() => [...document.querySelectorAll(".mapboxgl-ctrl, .mapboxgl-ctrl button, .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib-button, button, [role=button]")].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className.toString().slice(0, 45), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), aria: e.getAttribute("aria-label"), txt: e.innerText?.trim().slice(0, 25), op: getComputedStyle(e).opacity }; }).filter((c) => c.w > 0)));
  // route line color / contrast
  log("map-route-layers", await page.evaluate(() => { const m = window.__troyMap.map; return m.getStyle().layers.filter((l) => /route|walk|line|path/i.test(l.id) && l.type === "line").map((l) => ({ id: l.id, paint: l.paint })); }));
  // Zoom on top-right POI glyph
  await page.screenshot({ path: join(OUT, `map-390-11-topright-zoom.png`), clip: { x: 300, y: 0, width: 90, height: 90 } });
  // Walk + drag sampling
  await page.getByRole("button", { name: "Take the walk" }).tap();
  await page.waitForTimeout(3000);
  const before = await page.evaluate(() => ({ ...window.__troyMap.state, t: performance.now() }));
  const cardY = await page.evaluate(() => { const c = [...document.querySelectorAll('.keen-slider__slide [role=button]')].find((e) => { const r = e.getBoundingClientRect(); return r.x >= 0 && r.x < innerWidth; }); const r = c.getBoundingClientRect(); return r.y + r.height / 2; });
  await touchDrag(page, 320, cardY, 60, cardY, 14, 260);
  const samples = [];
  for (let i = 0; i < 20; i++) { samples.push(await page.evaluate(() => { const h = window.__troyMap; const c = h.map.getCenter(); return { touring: h.state.touring, idx: h.state.activeIdx, lng: +c.lng.toFixed(5), lat: +c.lat.toFixed(5), z: +h.map.getZoom().toFixed(2), btn: !!document.querySelector("button") && [...document.querySelectorAll("button")].some((b) => /Stop the walk/.test(b.textContent)) }; })); await page.waitForTimeout(500); }
  log("map-drag-samples", { before: { touring: before.touring, idx: before.activeIdx }, samples });
  log("map-stops", await page.evaluate(() => window.__troyMap.stops.map((s) => ({ order: s.order, slug: s.slug, cardTitle: s.cardTitle, label: s.label, coord: s.coord || s.lngLat || s.coordinates }))));
  // Cards visual state: active vs inactive
  log("map-cards-visual", await page.evaluate(() => [...document.querySelectorAll(".keen-slider__slide")].map((s) => { const inner = s.firstElementChild; const card = s.querySelector("[role=button]"); const r = card.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), scale: getComputedStyle(inner).transform, op: getComputedStyle(inner).opacity, filter: getComputedStyle(card).filter, aria: card.getAttribute("aria-label").slice(0, 30) }; })));
  log("map-slider-mask", await page.evaluate(() => { const s = document.querySelector(".location-cards-slider"); const cs = getComputedStyle(s); return { mask: cs.maskImage || cs.webkitMaskImage, w: s.getBoundingClientRect().width }; }));
  await page.screenshot({ path: join(OUT, `map-390-12-walk-drag-sampled.png`) });
  await ctx.close();
}

/* 3. Embed map attribution + tap-target census on a chapter, hi-res J */
{
  const { ctx, page } = await newPage({ dpr: 3 });
  await page.goto(`${BASE}/commissioners-office`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("moral-0")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1500);
  const hr = await page.evaluate(() => { const h = document.querySelector("#moral-0 h2"); const r = h.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.screenshot({ path: join(OUT, `co-390-moral-heading-3x.png`), clip: { x: hr.x - 4, y: hr.y - 4, width: Math.min(hr.w + 8, 380), height: hr.h + 12 } });
  log("co-moral-lineboxes", await page.evaluate(() => [...document.querySelectorAll("#moral-0 h2 .line-box")].map((b) => { const r = b.getBoundingClientRect(); const inner = b.firstElementChild; const ir = inner.getBoundingClientRect(); return { txt: b.textContent.trim(), boxH: +r.height.toFixed(1), innerH: +ir.height.toFixed(1), fs: getComputedStyle(b).fontSize, lh: getComputedStyle(b).lineHeight, overflow: getComputedStyle(b).overflow, pb: getComputedStyle(b).paddingBottom }; })));
  // Barbershop heading too
  await page.goto(`${BASE}/barbershop`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById("moral")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1500);
  const hr2 = await page.evaluate(() => { const h = document.querySelector("#moral h2"); const r = h.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.screenshot({ path: join(OUT, `barbershop-390-moral-heading-3x.png`), clip: { x: hr2.x - 4, y: hr2.y - 4, width: Math.min(hr2.w + 8, 380), height: hr2.h + 12 } });
  log("barbershop-moral-wordspace", await page.evaluate(() => { const h = document.querySelector("#moral h2"); const cs = getComputedStyle(h); return { ls: cs.letterSpacing, ws: cs.wordSpacing, fs: cs.fontSize, ff: cs.fontFamily.slice(0, 40) }; }));
  // Embed map attribution
  await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(3000);
  log("embed-map-ctrls", await page.evaluate(() => { const s = document.getElementById("onward"); return [...s.querySelectorAll(".mapboxgl-ctrl, .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo, a, canvas")].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className.toString().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), href: e.getAttribute("href"), display: getComputedStyle(e).display }; }); }));
  log("embed-map-interactive", await page.evaluate(() => { const s = document.getElementById("onward"); const c = s.querySelector(".mapboxgl-canvas"); return c ? { touchAction: getComputedStyle(c.closest(".mapboxgl-map")).touchAction, cursor: getComputedStyle(c).cursor, pe: getComputedStyle(c.closest(".mapboxgl-map")).pointerEvents } : null; }));
  // Tap-target census on this chapter page (all interactive)
  log("tap-census-barbershop", await page.evaluate(() => [...document.querySelectorAll("a, button, input, [role=button], [role=slider]")].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, w: Math.round(r.width), h: Math.round(r.height), txt: (e.innerText || e.getAttribute("aria-label") || "").trim().slice(0, 30), cls: e.className.toString().slice(0, 30) }; }).filter((c) => c.w > 0 && (c.w < 44 || c.h < 44))));
  // Archival credit label contrast: sample computed color + bg image presence
  log("archival-credit", await page.evaluate(() => { const els = [...document.querySelectorAll("figcaption, p, span")].filter((e) => /archival record|library of congress/i.test(e.textContent) && e.children.length === 0); return els.map((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { txt: e.textContent.trim().slice(0, 60), color: cs.color, fs: cs.fontSize, ts: cs.textShadow, x: Math.round(r.x), w: Math.round(r.width), lines: Math.round(r.height / parseFloat(cs.lineHeight)), parentBg: getComputedStyle(e.parentElement).backgroundImage.slice(0, 60), align: cs.textAlign }; }); }));
  await ctx.close();
}

/* 4. Home hero: what is the visible media element and its object-position; face location */
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  log("home-media", await page.evaluate(() => [...document.querySelectorAll("main img, main video, main picture source, main [style*=background]")].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(e).display, objPos: getComputedStyle(e).objectPosition, src: (e.currentSrc || e.src || e.srcset || "").slice(-50), bg: getComputedStyle(e).backgroundImage.slice(0, 80), bgPos: getComputedStyle(e).backgroundPosition }; })));
  log("home-lockup", await page.evaluate(() => { const els = [...document.querySelectorAll("main p, main h1, main a")]; return els.map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, y: Math.round(r.y), h: Math.round(r.height), txt: e.innerText.slice(0, 30) }; }); }));
  // Frame border element
  log("home-frame", await page.evaluate(() => { const d = document.querySelector("main > div"); const inner = d.firstElementChild; const cs = getComputedStyle(inner); return { pad: getComputedStyle(d).padding, border: cs.border, radius: cs.borderRadius, cls: inner.className.slice(0, 80) }; }));
  // Menu burger visibility on home
  log("home-burger", await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); return b ? b.getBoundingClientRect().toJSON() : "none"; }));
  await ctx.close();
}

/* 5. Burger hide/show with real touch scrolls on a chapter */
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/bakery`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const b = () => page.evaluate(() => { const el = document.querySelector('button[aria-label="Open menu"]'); const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height), op: cs.opacity, tf: cs.transform, vis: cs.visibility, cls: [...el.classList].filter((c) => /hid|is-|scroll|away|shrink|compact/.test(c)), sy: Math.round(scrollY) }; });
  const seq = [];
  seq.push(await b());
  await touchDrag(page, 200, 700, 200, 200, 10, 200); await page.waitForTimeout(800); seq.push(await b());
  await touchDrag(page, 200, 700, 200, 200, 10, 200); await page.waitForTimeout(800); seq.push(await b());
  await page.screenshot({ path: join(OUT, `menu-390-07-touch-scrolled-down.png`) });
  await touchDrag(page, 200, 300, 200, 600, 10, 200); await page.waitForTimeout(800); seq.push(await b());
  await page.screenshot({ path: join(OUT, `menu-390-08-touch-scrolled-up.png`) });
  log("burger-touch-scroll", seq);
  // Menu close icon: any transform/animation on the X while closing?
  await page.locator('button[aria-label="Open menu"]').tap();
  await page.waitForTimeout(600);
  log("menu-open-anim", await page.evaluate(() => { const p = document.querySelector(".cnwm-menu-panel"); const cs = getComputedStyle(p); const bars = [...document.querySelectorAll(".cnwm-bar")].map((b) => getComputedStyle(b).transform); return { panelTransition: cs.transition, panelAnim: cs.animation, bars, closeIcon: getComputedStyle(document.querySelector(".cnwm-menu-close svg") || document.querySelector(".cnwm-menu-close")).transform, focus: document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName }; }));
  await ctx.close();
}

/* 6. Museum: painting sizes on rail (portrait phone), tap target sizes of paintings; dots; skip pill; burger */
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/paintings`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__museum, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const out = [];
  for (const f of [0.1, 0.2, 0.3, 0.4, 0.5]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(H * f));
    await page.waitForTimeout(1200);
    out.push(await page.evaluate((f) => { const m = window.__museum; const rects = []; for (let i = 0; i < 10; i++) { const r = m.paintingRect(i); if (r && !r.behind && r.right > 0 && r.left < innerWidth) rects.push({ i, w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top), x: Math.round(r.left), y: Math.round(r.top) }); } return { f, railIdx: m.state.railIdx, rects, stage: (() => { const c = document.querySelector("canvas"); const r = c.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })() }; }, f));
  }
  log("museum-rail-rects", out);
  log("museum-overlay-controls", await page.evaluate(() => [...document.querySelectorAll("button, [role=button], a")].map((e) => { const r = e.getBoundingClientRect(); return { txt: (e.innerText || e.getAttribute("aria-label") || "").trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity }; }).filter((c) => c.w > 0 && c.y < innerHeight && c.y + c.h > 0)));
  log("museum-burger-visible", await page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); let el = b; const chain = []; while (el && el !== document.body) { const cs = getComputedStyle(el); chain.push({ tag: el.tagName, cls: el.className.toString().slice(0, 30), op: cs.opacity, vis: cs.visibility, display: cs.display }); el = el.parentElement; } return chain.slice(0, 4); }));
  await page.screenshot({ path: join(OUT, `paintings-390-07-rail-mid.png`) });
  await ctx.close();
}

/* 7. Text-size / long-word overflow: 320 home & bakery overflowers detail */
{
  const { ctx, page } = await newPage({ viewport: { width: 320, height: 568 } });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  log("w320-home-stack", await page.evaluate(() => { const s = document.querySelector(".home-stack"); const r = s.getBoundingClientRect(); const cta = document.querySelector("main a.btn, main a[href*=map]"); const cr = cta.getBoundingClientRect(); const frame = document.querySelector("main > div > *"); const fr = frame.getBoundingClientRect(); return { stack: [Math.round(r.x), Math.round(r.right)], cta: [Math.round(cr.x), Math.round(cr.right), Math.round(cr.width)], frame: [Math.round(fr.x), Math.round(fr.right)], padL: getComputedStyle(frame).paddingLeft }; }));
  await page.screenshot({ path: join(OUT, `w320-home-320x568-02-cta-zoom.png`), clip: { x: 0, y: 400, width: 320, height: 80 } });
  await ctx.close();
}

await browser.close();
writeFileSync(join(OUT, "part3.json"), JSON.stringify(results, null, 1));
