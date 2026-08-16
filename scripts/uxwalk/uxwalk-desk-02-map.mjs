#!/usr/bin/env node
/**
 * UX walk (tablet + desktop) — script 02: /map overview · walk · drag · lens.
 * READ-ONLY on the site. Output: docs/v7/qa/uxwalk-desk/map-<vp>-<step>.png + 02-map.json
 * Usage: node scripts/uxwalk-desk-02-map.mjs [--vp 768,1024,1280,1440,1920]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = "http://localhost:4321";
const OUT = "docs/v7/qa/uxwalk-desk";
mkdirSync(OUT, { recursive: true });
const ALL_VP = {
  768: { width: 768, height: 1024 },
  1024: { width: 1024, height: 768 },
  1280: { width: 1280, height: 800 },
  1440: { width: 1440, height: 900 },
  1920: { width: 1920, height: 1080 },
};
const VPS = flag("vp", "768,1024,1280,1440,1920").split(",").map((n) => ({ name: n, ...ALL_VP[n] }));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const report = {};

const CONTROLS = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 4 && r.height > 4 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
  };
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const controls = [...document.querySelectorAll("button, a, [role='button'], .mapboxgl-ctrl, .mapboxgl-ctrl-group button, .mapboxgl-marker")]
    .filter(vis)
    .map((el) => ({ tag: el.tagName, text: (el.getAttribute("aria-label") || el.innerText || el.className.toString()).trim().replace(/\s+/g, " ").slice(0, 50), rect: rect(el) }));
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => ({ label: m.querySelector("[aria-label]")?.getAttribute("aria-label") || m.innerText.slice(0, 30), rect: rect(m), text: m.innerText.replace(/\s+/g, " ").slice(0, 40) }));
  const chips = [...document.querySelectorAll("p")].filter(vis).filter((p) => p.closest("[class*='absolute'],[class*='fixed']")).map((p) => ({ text: p.innerText.replace(/\s+/g, " ").slice(0, 60), rect: rect(p) }));
  const cam = window.__troyMap?.map ? { pitch: window.__troyMap.map.getPitch(), zoom: window.__troyMap.map.getZoom(), bearing: window.__troyMap.map.getBearing(), center: window.__troyMap.map.getCenter() } : null;
  const state = window.__troyMap?.state ?? null;
  const cards = [...document.querySelectorAll(".keen-slider__slide")].map((s) => {
    const t = s.querySelector("p.text-left, p[class*='text-left']");
    const arrow = s.querySelector("[aria-hidden='true'].flex-row, .flex-row[aria-hidden]");
    return { title: t?.innerText, titleLines: t ? t.getClientRects().length : null, titleRect: t ? rect(t) : null, arrowRect: arrow ? rect(arrow) : null, cardRect: rect(s), titleWords: t ? [...t.getClientRects()].length : null };
  });
  // per-line title text
  const cardTitleLines = [...document.querySelectorAll(".keen-slider__slide p.text-left")].map((t) => {
    const range = document.createRange();
    const lines = [];
    const tn = t.firstChild;
    if (!tn) return null;
    const txt = tn.textContent;
    let prevTop = null; let cur = "";
    for (let i = 0; i < txt.length; i++) {
      range.setStart(tn, i); range.setEnd(tn, i + 1);
      const r = range.getBoundingClientRect();
      if (prevTop !== null && Math.abs(r.top - prevTop) > 4) { lines.push(cur); cur = ""; }
      cur += txt[i]; prevTop = r.top;
    }
    lines.push(cur);
    return lines.map((l) => l.trim());
  });
  return { controls, markers, chips, cam, state, cards, cardTitleLines, vp: [innerWidth, innerHeight] };
};

for (const vp of VPS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, permissions: [] });
  const page = await context.newPage();
  const consoleErrs = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") consoleErrs.push({ type: m.type(), text: m.text().slice(0, 300) }); });
  page.on("pageerror", (e) => consoleErrs.push({ type: "pageerror", text: String(e).slice(0, 300) }));
  const rep = (report[vp.name] = { shots: [] });
  const shot = async (step) => { const f = `map-${vp.name}-${step}.png`; await page.screenshot({ path: join(OUT, f) }); rep.shots.push(f); return f; };

  await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none !important}" }).catch(() => {});
  await page.waitForFunction(() => window.__troyMap?.map && window.__troyMap.map.loaded(), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);
  rep.title = await page.title();
  await shot("00-overview");
  rep.overview = await page.evaluate(CONTROLS);
  // hint gone?
  await page.waitForTimeout(4000);
  await shot("01-overview-later");
  rep.overviewLater = await page.evaluate(CONTROLS);

  // Menu over map
  const burger = page.locator(".cnwm-menu-burger");
  if (await burger.count()) {
    await burger.first().click();
    await page.waitForTimeout(700);
    await shot("02-menu-open");
    rep.menu = await page.evaluate(() => ({ panel: document.querySelector(".cnwm-menu-panel")?.getBoundingClientRect().toJSON(), close: document.querySelector(".cnwm-menu-close")?.getBoundingClientRect().toJSON(), scrimHidden: document.querySelector(".cnwm-menu-scrim")?.hidden }));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // Click a marker (marker 3) → focused card view
  const markerCount = await page.locator(".mapboxgl-marker").count();
  rep.markerCount = markerCount;
  if (markerCount) {
    await page.locator(".mapboxgl-marker").nth(2).click({ force: true }).catch(() => {});
    await page.waitForTimeout(3500);
    await shot("03-marker-focused");
    rep.focused = await page.evaluate(CONTROLS);
    // Back to map
    const back = page.getByRole("button", { name: /back to map/i });
    if (await back.count()) {
      rep.backToMapRect = await back.first().boundingBox();
      await back.first().click();
      await page.waitForTimeout(3000);
    }
  }

  // Take the walk
  const take = page.getByRole("button", { name: /take the walk/i });
  if (await take.count()) {
    await take.first().click();
    await page.waitForTimeout(1500);
    await shot("04-walk-t1.5s");
    rep.walk1 = await page.evaluate(CONTROLS);
    await page.waitForTimeout(3400);
    await shot("05-walk-stop2");
    rep.walk2 = await page.evaluate(CONTROLS);
    // Drag the carousel mid-walk with the mouse: small drag (30px)
    const slider = page.locator(".keen-slider").first();
    const sb = await slider.boundingBox();
    if (sb) {
      const cx = sb.x + sb.width / 2, cy = sb.y + sb.height / 2;
      const before = await page.evaluate(() => ({ state: window.__troyMap.state, pos: window.__troyMap.slider()?.track.details.position, abs: window.__troyMap.slider()?.track.details.abs }));
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      for (let i = 1; i <= 6; i++) { await page.mouse.move(cx - i * 5, cy, { steps: 2 }); await page.waitForTimeout(16); }
      const mid = await page.evaluate(() => ({ state: window.__troyMap.state, pos: window.__troyMap.slider()?.track.details.position }));
      await page.mouse.up();
      // sample positions for 600ms
      const samples = await page.evaluate(async () => {
        const out = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 700) {
          out.push({ t: Math.round(performance.now() - t0), pos: +window.__troyMap.slider().track.details.position.toFixed(3), abs: window.__troyMap.slider().track.details.abs, touring: window.__troyMap.state.touring, active: window.__troyMap.state.activeIdx });
          await new Promise((r) => setTimeout(r, 33));
        }
        return out;
      });
      rep.smallDrag = { before, mid, samples: samples.filter((_, i) => i % 3 === 0), after: samples[samples.length - 1] };
      await shot("06-after-small-drag");
      // Bigger drag: 160px
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      for (let i = 1; i <= 8; i++) { await page.mouse.move(cx - i * 20, cy, { steps: 2 }); await page.waitForTimeout(16); }
      await page.mouse.up();
      await page.waitForTimeout(800);
      rep.bigDrag = await page.evaluate(() => ({ state: window.__troyMap.state, abs: window.__troyMap.slider()?.track.details.abs, cam: { c: window.__troyMap.map.getCenter(), z: window.__troyMap.map.getZoom() } }));
      await shot("07-after-big-drag");
      rep.afterDrags = await page.evaluate(CONTROLS);
    }
    // Stop the walk if still touring
    const stop = page.getByRole("button", { name: /stop the walk/i });
    if (await stop.count()) { rep.stopBtnRect = await stop.first().boundingBox(); await stop.first().click(); await page.waitForTimeout(800); }
    // Back to map
    const back = page.getByRole("button", { name: /back to map/i });
    if (await back.count()) { rep.backToMapRect2 = await back.first().boundingBox(); await back.first().click(); await page.waitForTimeout(3000); }
  }

  // Walk again and let it complete to see the end state (only at 1440 to save time)
  if (vp.name === "1440" || vp.name === "768") {
    const take2 = page.getByRole("button", { name: /take the walk/i });
    if (await take2.count()) {
      await take2.first().click();
      await page.waitForTimeout(3400 * 5 + 1500);
      await shot("08-walk-end");
      rep.walkEnd = await page.evaluate(CONTROLS);
      const back = page.getByRole("button", { name: /back to map/i });
      if (await back.count()) { await back.first().click(); await page.waitForTimeout(3000); }
    }
  }

  // Lens
  const lensBtn = page.getByRole("button", { name: /see troy in 1858/i });
  if (await lensBtn.count()) {
    await lensBtn.first().click();
    await page.waitForTimeout(2500);
    await shot("09-lens");
    rep.lens = await page.evaluate(() => {
      const box = document.querySelector("[role='application']");
      const img = box?.querySelector("img");
      const cap = document.querySelector("figure figcaption");
      const rect = (el) => el ? el.getBoundingClientRect().toJSON() : null;
      const btns = [...document.querySelectorAll("button, a")].filter((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return r.width > 4 && cs.visibility !== "hidden" && +cs.opacity > 0.05; }).map((b) => ({ text: (b.getAttribute("aria-label") || b.innerText).trim().slice(0, 40), rect: rect(b), z: getComputedStyle(b.closest("[class*='z-']") || b).zIndex }));
      return { box: rect(box), img: img ? { rect: rect(img), transform: img.style.transform, natural: [img.naturalWidth, img.naturalHeight], src: img.currentSrc.split("/").pop() } : null, cap: cap ? { text: cap.innerText, rect: rect(cap), lines: cap.getClientRects().length } : null, btns, vp: [innerWidth, innerHeight], state: window.__troyMap?.state };
    });
    // Zoom in on lens
    await page.getByRole("button", { name: /zoom in/i }).first().click().catch(() => {});
    await page.waitForTimeout(600);
    await shot("10-lens-zoomed");
    // Escape closes?
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);
    rep.lensAfterEsc = await page.evaluate(() => window.__troyMap?.state);
    const backToday = page.getByRole("button", { name: /back to today/i });
    if (await backToday.count()) { await backToday.first().click(); await page.waitForTimeout(1800); }
  }
  await shot("11-overview-final");
  rep.console = consoleErrs;
  console.log(vp.name, "done", rep.shots.length, "shots", consoleErrs.length, "console");
  await context.close();
}
writeFileSync(join(OUT, "02-map.json"), JSON.stringify(report, null, 1));
await browser.close();
