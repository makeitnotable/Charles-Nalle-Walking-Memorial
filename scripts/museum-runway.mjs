#!/usr/bin/env node
/**
 * Round 24 — the /paintings pin and runway, measured where this container
 * can measure them (docs/rounds/2026-09-21-round-24-plan.md, device pass 5).
 *
 * Why this exists: no instrument here can see Safari's bars, so the build is
 * proved on the things Chromium CAN show — that the pin (the sticky wrapper
 * Safari's edge probe must ignore) is a whole viewport taller than the
 * viewport while the stage at its foot does not move by a pixel, that the
 * framing the reader sees is unchanged, and that the runway strips carry the
 * corridor's own rows, placed where the bars would be.
 *
 * The bars' height is stood in through an init-script <style>
 * (`--museum-b: 110px` and `--museum-pin: 100svh` on .museum-wrap with
 * !important — the @supports (-webkit-touch-callout) gate never matches in
 * Chromium, so both tokens would otherwise be 0), exactly as map-framing.mjs
 * stands T and E in. Without the stand-in nothing may change — the desktop
 * guarantee.
 *
 * Per phone viewport (390×645 = the iOS layout viewport with the bars
 * expanded; 430×720 as a second size), sessions OFF (no stand-in), ON
 * (stand-in), BLEED (`?runway=off`) and READPIXELS (`?runway=readpixels`),
 * positions rest / stuck (40% of the slot) / past the hall / just stuck /
 * +150 / back at scroll 0. Asserted:
 *   · OFF: no strip in the DOM, canvas == stage, pin == stage, runway.b == 0.
 *   · ON, every position: the stage box identical to OFF; the pin's box
 *     stage + 100svh tall, ending at the stage's foot, so ≥ 1.5× the
 *     viewport; canvas = stage + 2B, starting B above it; `--cnwm-chip-y`
 *     identical to OFF; the projected rect of the painting under the walk
 *     identical to OFF (±0.5px) — the framing invariant.
 *   · ON at rest: the bottom strip visible at svh − 48 (48 + B + 48 tall),
 *     the top strip hidden; stuck: both visible, the top one from
 *     −(48 + B) to +48; past: both hidden; just stuck: the top strip at
 *     opacity 0, fully in 150px later; back at rest: the bottom strip only.
 *   · Every visible strip: its sampled rows equal the same frame's canvas
 *     rows (mean abs diff ≤ 1 level) and are not a flat fill (luminance σ > 1;
 *     a fill measures 0, the dark floor near the camera about 3).
 *   · A scripted walk (120 frames, rail 0.1 → 0.9) records median and p95
 *     frame intervals OFF and ON — reported, not asserted: this GL is not
 *     the phone's.
 *   · BLEED: the pin and the taller render target with no strip.
 *   · READPIXELS: the readback copy path, the fallback the strips switch to
 *     when drawImage leaves them blank; the same strip checks.
 * At 1440×900 with no stand-in: no strip, canvas == stage, pin == stage.
 *
 *   node scripts/museum-runway.mjs [--base http://localhost:4331] [--b 110]
 *        [--vp 390x645,430x720] [--out node_modules/.cache/museum-runway]
 *
 * Output: <out>/runway.json + runway.md. Exit 1 on any failed assertion.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
if (args.includes("--help") || args.includes("-h")) {
  console.log("usage: node scripts/museum-runway.mjs [--base URL] [--b px] [--vp WxH,...] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const B = Number(flag("b", "110"));
const OUT = flag("out", "node_modules/.cache/museum-runway");
const VPS = flag("vp", "390x645,430x720")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [w, h] = s.split("x").map(Number);
    return { w, h };
  });
mkdirSync(OUT, { recursive: true });

const RUN_IN = 48;
const RUN_OUT = 48;
const results = [];
let failures = 0;
const check = (vp, session, pos, name, ok, detail = "") => {
  results.push({ vp, session, pos, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;
const r1 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : v);

/* What the page reports, in one evaluate. */
const SNAPSHOT = () => {
  const h = window.__museum;
  if (!h) return { missing: true };
  const stage = document.querySelector(".museum-stage");
  const canvas = stage && stage.querySelector("canvas");
  const pin = stage && stage.parentElement;
  const wrap = stage && stage.closest(".museum-wrap");
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height };
  };
  const st = h.state;
  const idx = st.railIdx;
  const pr = h.paintingRect(idx);
  /* The framing invariant, free of the dolly's timing: painting 0 projected
     through the live camera posed at one canonical rail pose, then restored
     (the frame loop re-poses it anyway). */
  const cam = h.camera;
  const savedPos = cam.position.clone();
  const savedRot = cam.rotation.clone();
  cam.position.set(0, cam.position.y, 0.4);
  cam.rotation.set(-0.17, 0, 0, "YXZ");
  cam.updateMatrixWorld(true);
  const cr = h.paintingRect(0);
  cam.position.copy(savedPos);
  cam.rotation.copy(savedRot);
  cam.updateMatrixWorld(true);
  const strips = [...document.querySelectorAll(".museum-runway")].map((c) => ({
    name: c.dataset.runway,
    display: getComputedStyle(c).display,
    opacity: +getComputedStyle(c).opacity,
    rect: rect(c),
    height: c.height,
    width: c.width,
  }));
  return {
    scrollY: window.scrollY,
    inner: { w: innerWidth, h: innerHeight },
    railT: st.railT,
    railIdx: idx,
    cur: st.cur,
    runway: st.runway,
    stage: rect(stage),
    pin: rect(pin),
    canvas: rect(canvas),
    wrap: rect(wrap),
    chipY: stage ? getComputedStyle(stage).getPropertyValue("--cnwm-chip-y").trim() : null,
    painting: pr ? { left: pr.left, right: pr.right, top: pr.top, bottom: pr.bottom, behind: pr.behind } : null,
    canonical: cr ? { left: cr.left, right: cr.right, top: cr.top, bottom: cr.bottom } : null,
    strips,
    probe: h.runwayProbe ? h.runwayProbe() : null,
  };
};

/* Scroll the document so the walk sits at rail fraction `t`. */
const SCROLL_TO_RAIL = (t) => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.closest(".museum-wrap");
  const r = wrap.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const total = r.height - stage.clientHeight;
  window.scrollTo({ top: Math.round(top + t * total), behavior: "instant" });
};
const SCROLL_PAST = () => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.closest(".museum-wrap");
  const r = wrap.getBoundingClientRect();
  window.scrollTo({ top: Math.round(r.bottom + window.scrollY + 200), behavior: "instant" });
};
/* 120 frames from rail 0.1 to 0.9, one scrollTo per animation frame; the
   intervals between frames are the cost the walk pays. */
const WALK = () =>
  new Promise((resolve) => {
    const stage = document.querySelector(".museum-stage");
    const wrap = stage.closest(".museum-wrap");
    const r = wrap.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const total = r.height - stage.clientHeight;
    const N = 120;
    const samples = [];
    let i = 0;
    let last = performance.now();
    const step = () => {
      const now = performance.now();
      if (i > 0) samples.push(now - last);
      last = now;
      const t = 0.1 + (0.8 * i) / N;
      window.scrollTo({ top: Math.round(top + t * total), behavior: "instant" });
      if (++i <= N) requestAnimationFrame(step);
      else {
        samples.sort((a, b) => a - b);
        const q = (p) => samples[Math.min(samples.length - 1, Math.floor(p * samples.length))];
        resolve({ n: samples.length, median: q(0.5), p95: q(0.95), max: samples[samples.length - 1] });
      }
    };
    requestAnimationFrame(step);
  });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });

async function open(vp, query, standIn) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  if (standIn) {
    await ctx.addInitScript((b) => {
      /* the init script runs before <html> exists — attach once it does */
      const add = () => {
        const st = document.createElement("style");
        st.textContent = `.museum-wrap{--museum-b:${b}px !important;--museum-pin:100svh !important}`;
        (document.head || document.documentElement).appendChild(st);
      };
      if (document.documentElement) add();
      else
        new MutationObserver((_, o) => {
          if (!document.documentElement) return;
          o.disconnect();
          add();
        }).observe(document, { childList: true });
    }, B);
  }
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160));
  });
  await page.goto(`${BASE}/paintings${query}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => window.__museum, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1800);
  return { ctx, page, errs };
}

const stripAsserts = (vp, session, pos, snap, wantTop, wantBottom) => {
  const strip = (n) => snap.strips.find((s) => s.name === n) || null;
  const probe = snap.probe || {};
  const svh = probe.svh;
  const top = strip("top");
  const bottom = strip("bottom");
  const shown = (s) => !!s && s.display !== "none";
  check(vp, session, pos, "top strip " + (wantTop ? "visible" : "hidden"), shown(top) === wantTop, top ? `${top.display} ${r1(top.rect?.top)}→${r1(top.rect?.bottom)}` : "absent");
  check(vp, session, pos, "bottom strip " + (wantBottom ? "visible" : "hidden"), shown(bottom) === wantBottom, bottom ? `${bottom.display} ${r1(bottom.rect?.top)}→${r1(bottom.rect?.bottom)}` : "absent");
  if (wantTop && shown(top)) {
    check(vp, session, pos, "top strip placed −(48+B) → +48", near(top.rect.top, -(RUN_OUT + B), 1) && near(top.rect.bottom, RUN_IN, 1), `${r1(top.rect.top)}→${r1(top.rect.bottom)}`);
    check(vp, session, pos, "top strip rows match the canvas", probe.top && probe.top.rowsCompared > 0 && probe.top.meanAbsDiff <= 1, probe.top ? `rows ${probe.top.rowsCompared} · diff ${r1(probe.top.meanAbsDiff)}` : "no probe");
    check(vp, session, pos, "top strip not flat", probe.top && probe.top.stddev > 1, probe.top ? `σ ${r1(probe.top.stddev)} · mean ${r1(probe.top.mean)}` : "no probe");
  }
  if (wantBottom && shown(bottom)) {
    check(vp, session, pos, "bottom strip placed svh−48 → svh+B+48", near(bottom.rect.top, svh - RUN_IN, 1) && near(bottom.rect.bottom, svh + B + RUN_OUT, 1), `${r1(bottom.rect.top)}→${r1(bottom.rect.bottom)} (svh ${svh})`);
    check(vp, session, pos, "bottom strip rows match the canvas", probe.bottom && probe.bottom.rowsCompared > 0 && probe.bottom.meanAbsDiff <= 1, probe.bottom ? `rows ${probe.bottom.rowsCompared} · diff ${r1(probe.bottom.meanAbsDiff)}` : "no probe");
    check(vp, session, pos, "bottom strip not flat", probe.bottom && probe.bottom.stddev > 1, probe.bottom ? `σ ${r1(probe.bottom.stddev)} · mean ${r1(probe.bottom.mean)}` : "no probe");
  }
};

const framingAsserts = (vp, session, pos, off, on) => {
  check(vp, session, pos, "stage box unchanged", near(on.stage.height, off.stage.height, 0.5) && near(on.stage.top, off.stage.top, 0.5), `${r1(on.stage.top)}/${r1(on.stage.height)} vs ${r1(off.stage.top)}/${r1(off.stage.height)}`);
  /* the pin: a whole viewport (svh) taller than the stage, ending at the
     stage's foot — the box Safari's probe measures and must ignore */
  check(vp, session, pos, "pin = stage + svh, ending at the stage's foot", near(on.pin.height, on.stage.height + on.inner.h, 0.5) && near(on.pin.bottom, on.stage.bottom, 0.5) && near(on.pin.top, on.stage.top - on.inner.h, 0.5), `pin ${r1(on.pin.top)}→${r1(on.pin.bottom)} (${r1(on.pin.height)}) · stage ${r1(on.stage.top)}→${r1(on.stage.bottom)}`);
  check(vp, session, pos, "pin ≥ 1.5× the viewport", on.pin.height >= 1.5 * on.inner.h, `${r1(on.pin.height / on.inner.h)}×`);
  check(vp, session, pos, "canvas = stage + 2B, B above", near(on.canvas.height, on.stage.height + 2 * B, 0.5) && near(on.canvas.top, on.stage.top - B, 0.5), `canvas ${r1(on.canvas.top)}/${r1(on.canvas.height)} · stage ${r1(on.stage.top)}/${r1(on.stage.height)}`);
  check(vp, session, pos, "chip band unchanged", on.chipY === off.chipY, `${on.chipY} vs ${off.chipY}`);
  const canon = on.canonical && off.canonical && ["left", "right", "top", "bottom"].every((k) => near(on.canonical[k], off.canonical[k], 0.5));
  check(
    vp,
    session,
    pos,
    "canonical projection unchanged",
    canon,
    on.canonical && off.canonical
      ? `${[on.canonical.left, on.canonical.top, on.canonical.right, on.canonical.bottom].map(r1).join(",")} vs ${[off.canonical.left, off.canonical.top, off.canonical.right, off.canonical.bottom].map(r1).join(",")}`
      : "no rect",
  );
  /* the live rect too, at a tolerance that allows the dolly's last
     millimetres of settle between two sessions */
  const same =
    on.painting && off.painting && on.railIdx === off.railIdx && ["left", "right", "top", "bottom"].every((k) => near(on.painting[k], off.painting[k], 1.5));
  check(
    vp,
    session,
    pos,
    "live painting projection unchanged (±1.5)",
    same,
    on.painting && off.painting
      ? `#${on.railIdx} ${[on.painting.left, on.painting.top, on.painting.right, on.painting.bottom].map(r1).join(",")} vs #${off.railIdx} ${[off.painting.left, off.painting.top, off.painting.right, off.painting.bottom].map(r1).join(",")}`
      : "no rect",
  );
};

const md = [];
for (const vp of VPS) {
  const V = `${vp.w}x${vp.h}`;
  /* ── OFF ── */
  const off = await open(vp, "", false);
  const offRest = await off.page.evaluate(SNAPSHOT);
  check(V, "off", "rest", "hall mounted", !offRest.missing, offRest.missing ? "no __museum" : "");
  if (offRest.missing) {
    await off.ctx.close();
    continue;
  }
  check(V, "off", "rest", "no strip in the DOM", offRest.strips.length === 0, `${offRest.strips.length} strip(s)`);
  check(V, "off", "rest", "canvas = stage", near(offRest.canvas.height, offRest.stage.height, 0.5) && near(offRest.canvas.top, offRest.stage.top, 0.5), `${r1(offRest.canvas.height)} vs ${r1(offRest.stage.height)}`);
  check(V, "off", "rest", "pin = stage", near(offRest.pin.height, offRest.stage.height, 0.5) && near(offRest.pin.top, offRest.stage.top, 0.5), `pin ${r1(offRest.pin.top)}/${r1(offRest.pin.height)} vs stage ${r1(offRest.stage.top)}/${r1(offRest.stage.height)}`);
  check(V, "off", "rest", "runway.b = 0", offRest.runway && offRest.runway.b === 0, JSON.stringify(offRest.runway));
  await off.page.evaluate(SCROLL_TO_RAIL, 0.4);
  await off.page.waitForTimeout(1800);
  const offStuck = await off.page.evaluate(SNAPSHOT);
  check(V, "off", "stuck", "stage stuck at 0", near(offStuck.stage.top, 0, 0.5), `${r1(offStuck.stage.top)}`);
  check(V, "off", "stuck", "pin = stage", near(offStuck.pin.height, offStuck.stage.height, 0.5) && near(offStuck.pin.top, 0, 0.5), `pin ${r1(offStuck.pin.top)}/${r1(offStuck.pin.height)}`);
  const offWalk = await off.page.evaluate(WALK);
  await off.page.waitForTimeout(600);
  check(V, "off", "walk", "no page errors", off.errs.length === 0, off.errs.join(" | "));
  await off.ctx.close();

  /* ── ON ── */
  const on = await open(vp, "", true);
  const onRest = await on.page.evaluate(SNAPSHOT);
  check(V, "on", "rest", "hall mounted", !onRest.missing, onRest.missing ? "no __museum" : "");
  if (!onRest.missing) {
    check(V, "on", "rest", `runway.b = ${B}`, onRest.runway && onRest.runway.b === B, JSON.stringify(onRest.runway && { b: onRest.runway.b, svh: onRest.runway.svh }));
    check(V, "on", "rest", "copy = drawImage, no error", onRest.probe && onRest.probe.copy === "drawImage" && !onRest.probe.error, onRest.probe ? `${onRest.probe.copy} · blits ${onRest.probe.blits} · ${onRest.probe.error || "no error"}` : "no probe");
    framingAsserts(V, "on", "rest", offRest, onRest);
    stripAsserts(V, "on", "rest", onRest, false, true);
    await on.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await on.page.waitForTimeout(1800);
    const onStuck = await on.page.evaluate(SNAPSHOT);
    check(V, "on", "stuck", "stage stuck at 0", near(onStuck.stage.top, 0, 0.5), `${r1(onStuck.stage.top)}`);
    framingAsserts(V, "on", "stuck", offStuck, onStuck);
    stripAsserts(V, "on", "stuck", onStuck, true, true);
    await on.page.evaluate(SCROLL_PAST);
    await on.page.waitForTimeout(800);
    const onPast = await on.page.evaluate(SNAPSHOT);
    stripAsserts(V, "on", "past", onPast, false, false);
    await on.page.evaluate(SCROLL_TO_RAIL, 0);
    await on.page.waitForTimeout(1200);
    const onEdge = await on.page.evaluate(SNAPSHOT);
    stripAsserts(V, "on", "just stuck", onEdge, true, true);
    const edgeTop = onEdge.strips.find((s) => s.name === "top");
    check(V, "on", "just stuck", "top strip faded out at the edge", edgeTop && edgeTop.opacity <= 0.05, edgeTop ? `opacity ${edgeTop.opacity}` : "absent");
    await on.page.evaluate(() => window.scrollBy({ top: 150, behavior: "instant" }));
    await on.page.waitForTimeout(600);
    const onIn = await on.page.evaluate(SNAPSHOT);
    const inTop = onIn.strips.find((s) => s.name === "top");
    check(V, "on", "stuck +150", "top strip fully in", inTop && inTop.opacity >= 0.99, inTop ? `opacity ${inTop.opacity}` : "absent");
    await on.page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await on.page.waitForTimeout(1200);
    const onBack = await on.page.evaluate(SNAPSHOT);
    stripAsserts(V, "on", "back at rest", onBack, false, true);
    const onWalk = await on.page.evaluate(WALK);
    await on.page.waitForTimeout(600);
    check(V, "on", "walk", "no page errors", on.errs.length === 0, on.errs.join(" | "));
    md.push(`| ${V} | walk frame ms (median / p95 / max) | OFF ${r1(offWalk.median)} / ${r1(offWalk.p95)} / ${r1(offWalk.max)} | ON ${r1(onWalk.median)} / ${r1(onWalk.p95)} / ${r1(onWalk.max)} |`);
    results.push({ vp: V, session: "walk", pos: "-", name: "frame intervals", ok: true, detail: `off ${JSON.stringify(offWalk)} on ${JSON.stringify(onWalk)}` });
  }
  await on.ctx.close();

  /* ── BLEED ONLY (?runway=off): the taller render target without the strips ── */
  const bl = await open(vp, "?runway=off", true);
  const blRest = await bl.page.evaluate(SNAPSHOT);
  check(V, "bleed", "rest", "hall mounted", !blRest.missing, blRest.missing ? "no __museum" : "");
  if (!blRest.missing) {
    check(V, "bleed", "rest", "no strip in the DOM", blRest.strips.length === 0, `${blRest.strips.length} strip(s)`);
    check(V, "bleed", "rest", "canvas = stage + 2B, B above", near(blRest.canvas.height, blRest.stage.height + 2 * B, 0.5) && near(blRest.canvas.top, blRest.stage.top - B, 0.5), `canvas ${r1(blRest.canvas.top)}/${r1(blRest.canvas.height)}`);
    check(V, "bleed", "rest", "pin = stage + svh", near(blRest.pin.height, blRest.stage.height + blRest.inner.h, 0.5) && near(blRest.pin.bottom, blRest.stage.bottom, 0.5), `pin ${r1(blRest.pin.top)}→${r1(blRest.pin.bottom)}`);
    await bl.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await bl.page.waitForTimeout(1200);
    const blWalk = await bl.page.evaluate(WALK);
    await bl.page.waitForTimeout(600);
    check(V, "bleed", "walk", "no page errors", bl.errs.length === 0, bl.errs.join(" | "));
    md.push(`| ${V} | walk frame ms, bleed only (median / p95 / max) | ${r1(blWalk.median)} / ${r1(blWalk.p95)} / ${r1(blWalk.max)} | |`);
    results.push({ vp: V, session: "walk", pos: "-", name: "frame intervals, bleed only", ok: true, detail: JSON.stringify(blWalk) });
  }
  await bl.ctx.close();

  /* ── READPIXELS (?runway=readpixels): the readback copy path ── */
  const rp = await open(vp, "?runway=readpixels", true);
  const rpRest = await rp.page.evaluate(SNAPSHOT);
  check(V, "readpixels", "rest", "hall mounted", !rpRest.missing, rpRest.missing ? "no __museum" : "");
  if (!rpRest.missing) {
    check(V, "readpixels", "rest", "copy = readPixels, no error", rpRest.probe && rpRest.probe.copy === "readPixels" && !rpRest.probe.error, rpRest.probe ? `${rpRest.probe.copy} · ${rpRest.probe.error || "no error"}` : "no probe");
    stripAsserts(V, "readpixels", "rest", rpRest, false, true);
    await rp.page.evaluate(SCROLL_TO_RAIL, 0.4);
    await rp.page.waitForTimeout(1800);
    const rpStuck = await rp.page.evaluate(SNAPSHOT);
    stripAsserts(V, "readpixels", "stuck", rpStuck, true, true);
    const rpWalk = await rp.page.evaluate(WALK);
    await rp.page.waitForTimeout(600);
    check(V, "readpixels", "walk", "no page errors", rp.errs.length === 0, rp.errs.join(" | "));
    md.push(`| ${V} | walk frame ms, readPixels copy (median / p95 / max) | ${r1(rpWalk.median)} / ${r1(rpWalk.p95)} / ${r1(rpWalk.max)} | |`);
  }
  await rp.ctx.close();

}

/* ── the desktop guarantee: without bars nothing exists ── */
{
  const vp = { w: 1440, h: 900 };
  const V = "1440x900";
  const d = await open(vp, "", false);
  const snap = await d.page.evaluate(SNAPSHOT);
  check(V, "no bars", "rest", "hall mounted", !snap.missing, snap.missing ? "no __museum" : "");
  if (!snap.missing) {
    check(V, "no bars", "rest", "no strip in the DOM", snap.strips.length === 0, `${snap.strips.length} strip(s)`);
    check(V, "no bars", "rest", "canvas = stage", near(snap.canvas.height, snap.stage.height, 0.5) && near(snap.canvas.top, snap.stage.top, 0.5), `${r1(snap.canvas.height)} vs ${r1(snap.stage.height)}`);
    check(V, "no bars", "rest", "pin = stage", near(snap.pin.height, snap.stage.height, 0.5) && near(snap.pin.top, snap.stage.top, 0.5), `pin ${r1(snap.pin.top)}/${r1(snap.pin.height)}`);
    check(V, "no bars", "rest", "runway.b = 0", snap.runway && snap.runway.b === 0, JSON.stringify(snap.runway && { b: snap.runway.b }));
    check(V, "no bars", "rest", "no page errors", d.errs.length === 0, d.errs.join(" | "));
  }
  await d.ctx.close();
}
await browser.close();

/* ── report ── */
const lines = ["# /paintings pin and runway — measured", "", `base ${BASE} · B ${B} · ${new Date().toISOString()}`, "", "| viewport | session | position | check | ok | detail |", "|---|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.vp} | ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`);
if (md.length) lines.push("", "| viewport | measure | off | on |", "|---|---|---|---|", ...md);
writeFileSync(join(OUT, "runway.json"), JSON.stringify({ base: BASE, b: B, results }, null, 2));
writeFileSync(join(OUT, "runway.md"), lines.join("\n") + "\n");
for (const r of results) if (!r.ok) console.error(`  ✗ ${r.vp} · ${r.session} · ${r.pos} · ${r.name} — ${r.detail}`);
console.log(`museum-runway: ${results.length} check(s), ${failures} failed · ${join(OUT, "runway.md")}`);
process.exit(failures ? 1 : 0);
