#!/usr/bin/env node
/**
 * The map/walk behaviour tests (docs/PLAN.md Part B item 4; acceptance for
 * M2 / M4 / M5 / M9), driven through the `window.__troyMap` debug hook that
 * `TroyMap.tsx` exposes ({ map, slider(), state, stops }).
 *
 * Per viewport (default: the eight the plan names):
 *   · overview camera (pitch / zoom / bearing) and whether every marker LABEL
 *     rect sits inside the safe box (viewport minus --ui-inset, minus the top
 *     row and the bottom doors) — the M2 projected-label check;
 *   · marker-vs-marker centre separation (phone chips need ≥ 22px);
 *   · control census: which floating controls exist, their rects, tap height;
 *   · walk mode: press "Take the walk", wait one step, read state.
 * At 390 (hasTouch) additionally:
 *   · M4 — drag during the walk: does the walk pause immediately? is there a
 *     snap-back (keen `track.details.position` sampled every 16ms for 400ms —
 *     any reversal > 0.03 fails)? what does the button read?
 *   · M9 — swipe follows the map: after each 120px swipe, is the map centre
 *     within 40 m of the active stop? does a slow 20px drag return to the same
 *     card without moving the map?
 *   · M6 — card title line counts (`getClientRects().length`) and whether any
 *     title's bottom crosses the arrow row.
 * Console errors are captured throughout.
 *
 * Usage: node scripts/walk-check.mjs <outdir> [--base URL] [--vp 360,390,...]
 * Output: <outdir>/walk.json + walk.md. Exit 1 when an assertion fails.
 * Phase 0 runs it as a BASELINE (failures expected and recorded).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v7/qa/walk";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ALL_VP = {
  360: { width: 360, height: 800 },
  390: { width: 390, height: 844 },
  430: { width: 430, height: 932 },
  land: { width: 844, height: 390 },
  768: { width: 768, height: 1024 },
  1024: { width: 1024, height: 768 },
  1440: { width: 1440, height: 900 },
  1920: { width: 1920, height: 1080 },
};
const VPS = flag("vp", "360,390,430,land,768,1024,1440,1920")
  .split(",")
  .map((n) => ({ name: n, ...ALL_VP[n] }));
mkdirSync(outdir, { recursive: true });

/** Haversine metres between two [lng, lat]. */
const metres = ([aLng, aLat], [bLng, bLat]) => {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(bLat - aLat);
  const dLng = toR(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(aLat)) * Math.cos(toR(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/* Everything measured inside the page in one evaluate. */
const SNAPSHOT = () => {
  const h = window.__troyMap;
  if (!h || !h.map) return { missing: true };
  const map = h.map;
  const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20;
  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 4 && r.height > 4 && cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0.05;
  };
  // Marker labels: the visible skin inside each .mapboxgl-marker
  const markers = [...document.querySelectorAll(".mapboxgl-marker")].map((m) => {
    const skin = [...m.querySelectorAll("*")].filter(vis).sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    })[0] || m;
    const r = rectOf(skin);
    return { text: (m.innerText || "").trim().replace(/\s+/g, " ").slice(0, 30), rect: r, cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
  });
  // Floating controls (buttons/links positioned inside the map shell)
  const controls = [...document.querySelectorAll("button, a, [role='button']")]
    .filter(vis)
    .filter((el) => {
      let n = el;
      while (n && n !== document.body) {
        const cs = getComputedStyle(n);
        if (cs.position === "fixed" || cs.position === "absolute") return true;
        n = n.parentElement;
      }
      return false;
    })
    .map((el) => ({
      text: (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40),
      cls: (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join("."),
      rect: rectOf(el),
    }))
    .filter((c) => c.rect.x > -500); // drop the off-screen a11y skip link
  // Safe box for labels: inside the insets, below the top row (~inset+56), above the bottom doors (~inset+88)
  const safe = { x0: inset, y0: inset + 56, x1: innerWidth - inset, y1: innerHeight - inset - 88 };
  const outside = markers.filter((m) => m.rect.x < safe.x0 || m.rect.y < safe.y0 || m.rect.x + m.rect.w > safe.x1 || m.rect.y + m.rect.h > safe.y1);
  let minSep = Infinity;
  for (let i = 0; i < markers.length; i++)
    for (let j = i + 1; j < markers.length; j++)
      minSep = Math.min(minSep, Math.hypot(markers[i].cx - markers[j].cx, markers[i].cy - markers[j].cy));
  // Card titles
  const titles = [...document.querySelectorAll(".keen-slider__slide")].map((s) => {
    const p = s.querySelector("p.text-left, p[class*='text-left']") || [...s.querySelectorAll("p")].sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize))[0];
    if (!p) return null;
    const range = document.createRange();
    range.selectNodeContents(p);
    const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top / 3)));
    const arrow = s.querySelector("[aria-hidden='true'] svg")?.parentElement;
    const pr = p.getBoundingClientRect();
    const ar = arrow ? arrow.getBoundingClientRect() : null;
    return { text: p.innerText.trim().replace(/\s+/g, " "), lines: lines.size, width: Math.round(pr.width), crossesArrow: ar ? pr.bottom > ar.top + 1 : null };
  }).filter(Boolean);
  const geolocate = Boolean(document.querySelector(".mapboxgl-ctrl-geolocate"));
  return {
    state: h.state,
    camera: { pitch: +map.getPitch().toFixed(1), zoom: +map.getZoom().toFixed(2), bearing: +map.getBearing().toFixed(1), center: map.getCenter().toArray() },
    inset,
    safe,
    markers,
    labelsOutsideSafe: outside.map((m) => m.text),
    minMarkerSep: Math.round(minSep),
    controls,
    titles,
    geolocate,
    fillExtrusion: (map.getStyle()?.layers || []).filter((l) => l.type === "fill-extrusion").map((l) => ({ id: l.id, minzoom: l.minzoom ?? null })),
  };
};

const browser = await chromium.launch();
const report = [];
for (const vp of VPS) {
  const phone = vp.width < 640;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: phone, isMobile: phone });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).split("\n")[0]));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  const rec = { vp: vp.name, width: vp.width, height: vp.height, findings: [], errors };
  try {
    await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForFunction(() => window.__troyMap && window.__troyMap.map && window.__troyMap.map.loaded(), null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(8000); // prologue camera + route self-draw
    await page.screenshot({ path: join(outdir, `overview-${vp.name}.png`) });
    rec.overview = await page.evaluate(SNAPSHOT);
    if (rec.overview.missing) throw new Error("hook missing (no token or island not mounted)");
    /* Landscape phones (h < 560) cannot hold five stops in a 222px safe band at
       any legible zoom — the camera holds the floor and the visitor pans (v6
       decision, kept in v7); recorded, not failed. */
    if (rec.overview.labelsOutsideSafe.length && vp.height >= 560) rec.findings.push(`M2 labels outside safe box: ${rec.overview.labelsOutsideSafe.join(", ")}`);
    else if (rec.overview.labelsOutsideSafe.length) rec.note = `landscape: labels outside safe (accepted pan): ${rec.overview.labelsOutsideSafe.join(", ")}`;
    if (phone && rec.overview.minMarkerSep < 22) rec.findings.push(`M2 marker centres too close: ${rec.overview.minMarkerSep}px`);
    if (rec.overview.geolocate) rec.findings.push("M1 GeolocateControl present");
    /* v12 item 1: the wide branch is offered 60/58/56/54 before v8's 52 and
       lands 60 at 768-1920 with every label still inside the safe box. The
       gate moves up with it — below 52 means the search has fallen back
       toward the blind OVERVIEW constant, which is the failure worth
       catching, not a shallow-but-fitted camera. */
    if (vp.width >= 1024 && rec.overview.camera.pitch < 52) rec.findings.push(`M2 overview pitch ${rec.overview.camera.pitch} < 52 on desktop`);
    for (const c of rec.overview.controls) if (c.rect.h < 44 && /walk|1858|today|back|stop|continue/i.test(c.text)) rec.findings.push(`control "${c.text}" only ${c.rect.h}px tall`);

    // ——— Walk mode ———
    const walkBtn = page.getByRole("button", { name: /take the walk/i }).first();
    if (await walkBtn.count()) {
      await walkBtn.click({ timeout: 5000 });
      await page.waitForTimeout(3800); // one step in
      await page.screenshot({ path: join(outdir, `walk-${vp.name}.png`) });
      rec.walk = await page.evaluate(SNAPSHOT);
      for (const t of rec.walk.titles) {
        if (t.crossesArrow) rec.findings.push(`M6 card title "${t.text}" crosses the arrow`);
        if (/Fashionable|Commissioner/.test(t.text) && t.lines !== 2) rec.findings.push(`M6 "${t.text}" renders on ${t.lines} line(s) (want 2)`);
      }
      const stopBtn = rec.walk.controls.find((c) => /stop the walk|continue/i.test(c.text));
      if (stopBtn) {
        const inset = rec.walk.inset;
        rec.walk.stopBtnAtTopRight = stopBtn.rect.y <= inset + 4 && stopBtn.rect.x + stopBtn.rect.w >= vp.width - inset - 4;
        if (!rec.walk.stopBtnAtTopRight) rec.findings.push(`M3 "${stopBtn.text}" not at top-right --ui-inset (rect ${JSON.stringify(stopBtn.rect)})`);
      }

      if (phone) {
        // ——— M4: a drag during the walk must pause it, with no snap-back ———
        // Real touch input via CDP (synthetic PointerEvents don't drive keen);
        // state + keen position sampled between every 16ms move.
        const strip = page.locator(".keen-slider").first();
        const box = await strip.boundingBox();
        if (box) {
          const y = box.y + box.height / 2;
          const x0 = box.x + box.width * 0.7;
          const cdp = await ctx.newCDPSession(page);
          const sample = () => page.evaluate(() => {
            const h = window.__troyMap;
            const s = h.slider();
            return { walking: h.state.touring === true || h.state.walk === "walking", pos: s ? +s.track.details.position.toFixed(3) : null, idx: h.state.activeIdx, moving: h.map.isMoving() };
          });
          const samples = { before: await sample(), during: [], after: [], pos: [] };
          // M5: long tasks (> 50ms) during the drag + settle = jank
          await page.evaluate(() => {
            window.__lt = [];
            try {
              new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(Math.round(e.duration)))).observe({ type: "longtask" });
            } catch {}
          });
          await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y }] });
          for (let i = 1; i <= 12; i++) {
            await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 - i * 10, y }] });
            await page.waitForTimeout(16);
            const sm = await sample();
            samples.during.push(sm);
            samples.pos.push(sm.pos);
          }
          await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          for (let i = 0; i < 25; i++) {
            await page.waitForTimeout(16);
            const sm = await sample();
            samples.after.push(sm);
            samples.pos.push(sm.pos);
          }
          await cdp.detach();
          rec.dragTest = samples;
          const pausedDuring = samples.during.some((d) => !d.walking);
          const stillWalking = samples.after[samples.after.length - 1].walking;
          if (!pausedDuring) rec.findings.push("M4 walk did NOT pause immediately on drag");
          if (stillWalking) rec.findings.push("M4 walk still running after the drag");
          // reversal detection: direction change > 0.03 after release
          let rev = 0;
          const pos = samples.pos.filter((v) => v !== null);
          for (let i = 2; i < pos.length; i++) {
            const d1 = pos[i - 1] - pos[i - 2];
            const d2 = pos[i] - pos[i - 1];
            if (d1 * d2 < 0 && Math.abs(d2) > 0.03) rev = Math.max(rev, Math.abs(d2));
          }
          rec.dragTest.longTasks = await page.evaluate(() => window.__lt || []);
          if (rec.dragTest.longTasks.length) rec.findings.push(`M5 ${rec.dragTest.longTasks.length} long task(s) during the drag: ${rec.dragTest.longTasks.join(",")}ms`);
          rec.dragTest.maxReversal = rev;
          rec.dragTest.moved = pos.length ? +(Math.max(...pos) - Math.min(...pos)).toFixed(3) : 0;
          if (rev > 0.03) rec.findings.push(`M4/M5 snap-back after drag: reversal ${rev.toFixed(3)}`);
          await page.waitForTimeout(1500);
          const btn = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.innerText.trim()).find((t) => /stop the walk|continue|walk again/i.test(t)) || null);
          rec.dragTest.buttonAfter = btn;
          if (btn && !/continue/i.test(btn)) rec.findings.push(`M4 button reads "${btn}" after a drag (want Continue)`);
        }
        // ——— M9: swipe follows the map ———
        // Use Playwright touchscreen for realism: three 120px swipes
        const box2 = await strip.boundingBox();
        if (box2) {
          rec.swipes = [];
          for (let k = 0; k < 3; k++) {
            const cy = box2.y + box2.height / 2;
            const sx = box2.x + box2.width * 0.75;
            const cdp = await ctx.newCDPSession(page);
            const pts = [];
            for (let i = 0; i <= 8; i++) pts.push({ x: sx - i * 15, y: cy });
            await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pts[0]] });
            for (const p of pts.slice(1)) {
              await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
              await page.waitForTimeout(16);
            }
            await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            await cdp.detach();
            await page.waitForTimeout(2200);
            const r = await page.evaluate(() => {
              const h = window.__troyMap;
              const st = h.state;
              const stop = h.stops[st.activeIdx];
              const pt = stop ? h.map.project(stop.coordinates) : null;
              /* The followed stop is LIFTED above the card strip (offset), so
                 the test is screen-space: the stop's projected point sits on
                 the vertical centre line, above the strip. */
              return { activeIdx: st.activeIdx, center: h.map.getCenter().toArray(), stopCoords: stop?.coordinates ?? null, moving: h.map.isMoving(), pt: pt ? { x: Math.round(pt.x), y: Math.round(pt.y) } : null };
            });
            r.distM = r.stopCoords ? Math.round(metres(r.center, r.stopCoords)) : null;
            rec.swipes.push(r);
            const strip = await page.locator(".keen-slider").first().boundingBox().catch(() => null);
            const okX = r.pt && Math.abs(r.pt.x - vp.width / 2) <= 40;
            const okY = r.pt && r.pt.y > 40 && (!strip || r.pt.y < strip.y - 8) && r.pt.y <= vp.height / 2 + 40;
            if (!(okX && okY)) rec.findings.push(`M9 after swipe ${k + 1} stop ${r.activeIdx + 1} projects at ${JSON.stringify(r.pt)} (want centred above the cards)`);
          }
        }
        await page.screenshot({ path: join(outdir, `walk-after-swipes-${vp.name}.png`) });
      }
    } else rec.findings.push("no 'Take the walk' button found");
  } catch (e) {
    rec.findings.push(`ERROR: ${e.message.split("\n")[0]}`);
  }
  if (errors.length) rec.findings.push(`console errors: ${errors.length}`);
  report.push(rec);
  console.log(`${rec.findings.length ? "✗" : "✓"} ${vp.name} — pitch ${rec.overview?.camera?.pitch} zoom ${rec.overview?.camera?.zoom} · ${rec.findings.length} finding(s)${rec.findings.length ? ": " + rec.findings.slice(0, 4).join(" | ") : ""}`);
  await ctx.close();
}
await browser.close();

writeFileSync(join(outdir, "walk.json"), JSON.stringify(report, null, 1));
const L = [`# Walk check — ${BASE}`, ""];
const total = report.reduce((s, r) => s + r.findings.length, 0);
L.push(`**${total} finding(s) across ${report.length} viewport(s).**`, "");
L.push(`| vp | pitch | zoom | labels outside safe | min sep | geolocate | findings |`, `|---|---|---|---|---|---|---|`);
for (const r of report)
  L.push(`| ${r.vp} | ${r.overview?.camera?.pitch ?? "—"} | ${r.overview?.camera?.zoom ?? "—"} | ${r.overview?.labelsOutsideSafe?.length ?? "—"} | ${r.overview?.minMarkerSep ?? "—"} | ${r.overview?.geolocate ? "yes" : "no"} | ${r.findings.join("<br>") || "—"} |`);
L.push("", "## Card titles (walk mode)", "");
for (const r of report.filter((x) => x.walk))
  L.push(`- **${r.vp}**: ` + r.walk.titles.map((t) => `${t.text} → ${t.lines}L${t.crossesArrow ? " ✕arrow" : ""}`).join(" · "));
L.push("", "## Controls (walk mode)", "");
for (const r of report.filter((x) => x.walk))
  L.push(`- **${r.vp}**: ` + r.walk.controls.map((c) => `"${c.text}" ${c.rect.w}×${c.rect.h}@${c.rect.x},${c.rect.y}`).join(" · "));
writeFileSync(join(outdir, "walk.md"), L.join("\n"));
console.log(`\nwalk → ${join(outdir, "walk.md")} (${total} findings)`);
process.exit(total ? 1 : 0);
