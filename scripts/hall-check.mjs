#!/usr/bin/env node
/**
 * v11.3 — the hall's regression gate (Wil, 8/24, two phone screenshots).
 *
 * Three failures this guards against, each shipped once:
 *   TILT  a vertical drag tilted the camera up to ±0.5 rad permanently —
 *         dragPitch is reset only by recenter(), and the Face forward
 *         affordance watched yaw alone, so nothing ever offered the way back.
 *   RAIL  the dot rail's per-frame positioner cleared its inline bottom to ""
 *         with no CSS fallback; bottom resolved to auto and the rail fell into
 *         static flow after the canvas — a full viewport down, or onto the
 *         wayfinding chip mid-retraction.
 *   LEAD  the page title rides over the hall (chapter-hero idiom). It must
 *         leave the hall the whole first screen, collide with nothing, hand
 *         the bottom band back to the hall's chrome as it withdraws, and stay
 *         static under reduced motion.
 *
 * Run against `astro preview`, not `astro dev` (the dev toolbar pollutes edge
 * geometry — see docs/RUN-STATE.md):
 *   npm run build && npm run preview -- --port 4331
 *   node scripts/hall-check.mjs --base http://localhost:4331
 */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const browser = await chromium.launch();
let fails = 0;
const check = (ok, label) => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}`);
};

/* ── RAIL + TILT, at phone geometry with touch ─────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 430, height: 733 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(BASE + "/paintings", { waitUntil: "load" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  await page.waitForFunction(() => !!window.__museum, null, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2200);
  await page.evaluate(() => scrollTo(0, 500));
  await page.waitForTimeout(900);

  const rail = () => page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Works in the hall"]');
    const stage = document.querySelector("#museum-slot .sticky");
    const canvas = document.querySelector("#museum-slot canvas");
    const n = nav.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return {
      fromStageBottom: Math.round(s.bottom - n.bottom),
      inside: n.top >= s.top && n.bottom <= s.bottom,
      canvasAbsolute: getComputedStyle(canvas).position === "absolute",
    };
  });
  console.log("RAIL");
  let r = await rail();
  check(r.inside && r.fromStageBottom === 24 && r.canvasAbsolute, `at rest — 24px off the stage bottom, canvas out of flow (${JSON.stringify(r)})`);
  await page.evaluate(() => scrollTo(0, 2600));
  await page.waitForTimeout(900);
  r = await rail();
  check(r.inside && r.fromStageBottom === 24, `walking — holds (${JSON.stringify(r)})`);
  await page.setViewportSize({ width: 430, height: 830 });
  await page.waitForTimeout(1000);
  r = await rail();
  check(r.inside && r.fromStageBottom === 24, `across a mid-session viewport growth 733→830 — holds (${JSON.stringify(r)})`);
  const ra = await page.evaluate(async () => {
    window.__museum.approach(2);
    await new Promise((res) => setTimeout(res, 1800));
    const nav = document.querySelector('nav[aria-label="Works in the hall"]');
    const stage = document.querySelector("#museum-slot .sticky");
    const sheet = document.querySelector(".museum-sheet-head")?.parentElement;
    const n = nav.getBoundingClientRect(), s = stage.getBoundingClientRect();
    const sheetTop = sheet ? sheet.getBoundingClientRect().top : null;
    return { aboveSheet: sheetTop ? n.bottom <= sheetTop + 2 : null, inside: n.top >= s.top && n.bottom <= s.bottom };
  });
  check(ra.inside && (ra.aboveSheet ?? true), `in approach — rides above the sheet (${JSON.stringify(ra)})`);
  await page.evaluate(() => window.__museum.approach(null));
  await page.waitForTimeout(1500);

  console.log("TILT");
  const st = () => page.evaluate(() => {
    const s = window.__museum.state;
    const chip = document.querySelector(".museum-chip-row");
    return { dragPitch: +(s.look?.dragPitch ?? 0).toFixed(3), face: !!chip && /face forward/i.test(chip.innerText) };
  });
  const cv = await page.$("#museum-slot canvas");
  const b = await cv.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height * 0.35);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(b.x + b.width / 2, b.y + b.height * 0.35 + i * 22); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(1200);
  const tilted = await st();
  check(Math.abs(tilted.dragPitch) > 0.12 && tilted.face, `a vertical drag summons Face forward (dragPitch ${tilted.dragPitch})`);
  await page.click("text=Face forward");
  await page.waitForTimeout(1400);
  const righted = await st();
  check(Math.abs(righted.dragPitch) <= 0.01 && !righted.face, `pressing it rights the hall (dragPitch ${righted.dragPitch})`);
  await ctx.close();
}

/* ── LEAD, across sizes ────────────────────────────────────────────────── */
console.log("LEAD");
for (const vp of [{ w: 390, h: 645 }, { w: 430, h: 733 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/paintings", { waitUntil: "load" });
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  await page.waitForFunction(() => !!window.__museum, null, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const stage = document.querySelector("#museum-slot .sticky");
    const lead = document.getElementById("paintings-lead");
    const lockup = lead.querySelector(".paintings-lead-lockup");
    const chip = document.querySelector(".museum-chip-row");
    const dots = document.querySelector('nav[aria-label="Works in the hall"]');
    const skip = [...document.querySelectorAll("#museum-slot button")].find((b) => /skip/i.test(b.textContent));
    const box = (el) => { const b = el?.getBoundingClientRect(); return b ? { t: b.top, b: b.bottom, l: b.left, r: b.right } : null; };
    /* the lockup's clearance IS its padding; collisions are judged on its text */
    const kids = [...lockup.children].map(box);
    const lb = kids.reduce((a, b) => ({ t: Math.min(a.t, b.t), b: Math.max(a.b, b.b), l: Math.min(a.l, b.l), r: Math.max(a.r, b.r) }));
    const inter = (a, b) => {
      if (!a || !b) return 0;
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l), h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      return w > 0 && h > 0 ? 1 : 0;
    };
    const sb = box(stage);
    const hallVis = sb ? Math.max(0, Math.min(innerHeight, sb.b) - Math.max(0, sb.t)) : 0;
    return {
      hallPct: Math.round((hallVis / innerHeight) * 100),
      collides: inter(lb, box(chip)) + inter(lb, box(dots)) + inter(lb, box(skip)),
      h1s: document.querySelectorAll("h1").length,
      dotsOp: +getComputedStyle(dots).opacity,
      dotsPE: getComputedStyle(dots).pointerEvents,
      chipOp: +getComputedStyle(chip).opacity,
    };
  });
  const chromeYields = r.dotsOp === 0 && r.dotsPE === "none" && (vp.w >= 1024 ? r.chipOp === 1 : r.chipOp === 0);
  check(r.hallPct === 100 && !r.collides && r.h1s === 1 && chromeYields,
    `${vp.w}x${vp.h} — hall ${r.hallPct}%, 0 collisions, chrome yields (chip ${r.chipOp}, dots ${r.dotsOp}/${r.dotsPE})`);
  await page.evaluate(() => scrollTo(0, Math.round(innerHeight * 0.6)));
  await page.waitForTimeout(400);
  const gone = await page.evaluate(() => {
    const lead = document.getElementById("paintings-lead");
    const dots = document.querySelector('nav[aria-label="Works in the hall"]');
    return { op: getComputedStyle(lead).opacity, vis: getComputedStyle(lead).visibility, dotsOp: +getComputedStyle(dots).opacity, dotsPE: getComputedStyle(dots).pointerEvents };
  });
  check(gone.op === "0" && gone.vis === "hidden" && gone.dotsOp > 0.99 && gone.dotsPE !== "none",
    `${vp.w}x${vp.h} — withdrawn by 60%, rail handed back (${JSON.stringify(gone)})`);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/paintings", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({
    slotH: Math.round(document.getElementById("museum-slot").getBoundingClientRect().height),
    vh: innerHeight,
    transform: getComputedStyle(document.getElementById("paintings-lead")).transform,
    fallback: getComputedStyle(document.querySelector(".museum-fallback")).visibility,
  }));
  check(r.slotH === r.vh && r.transform === "none" && r.fallback === "visible",
    `reduced motion — static lead over the one-viewport fallback (${JSON.stringify(r)})`);
  await ctx.close();
}

await browser.close();
console.log(`\nhall-check: ${fails ? fails + " FAILURES" : "clean"}`);
process.exit(fails ? 1 : 0);
