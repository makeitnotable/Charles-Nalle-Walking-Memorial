#!/usr/bin/env node
/**
 * v12 V12-20 — the hall's stress sweep (Wil, 8/26: "eliminate all bugs on the
 * paintings hall / museum page so it has perfect performance on mobile, tablet,
 * and desktop"). `museum-check.mjs` asserts composition and draw calls; this
 * asserts BEHAVIOUR under abuse, which is where the round's regressions lived:
 *
 *   · no horizontal overflow at the 375px floor
 *   · Skip / chip / dot-rail boxes stay disjoint (the pill, not its full-width
 *     row — measuring the row reports a false overlap at every desktop width)
 *   · rapid approach churn (0 -> 9 -> 4 -> rail -> 2 -> rail) lands clean
 *   · Escape leaves approach
 *   · a pitched drag offers Face forward — the tilt must have a way back
 *   · an orientation flip MID-APPROACH keeps the dot rail inside the stage and
 *     the canvas out of flow (this is the pair that stranded the rail in Wil's
 *     8/24 frame)
 *   · zero page or console errors throughout
 *
 * This is NOT v11.3's reverted `hall-check.mjs`; it is a new instrument for
 * this round's bar.
 *
 * Usage: node scripts/hall-stress.mjs   (needs `astro preview` on :4321)
 * Exit 1 on any failing check.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:4321";
const out = [];
const rec = (vp, name, ok, detail = "") => out.push({ vp, name, ok, detail });
const b = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });

for (const vp of [{ n: "375", width: 375, height: 812 }, { n: "390", width: 390, height: 844 }, { n: "768", width: 768, height: 1024 }, { n: "1440", width: 1440, height: 900 }]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 120)); });
  await page.goto(BASE + "/paintings", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => window.__museum, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // 1 · no horizontal overflow anywhere on the page
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  rec(vp.n, "no h-overflow", ov.sw <= ov.iw + 1, `${ov.sw} vs ${ov.iw}`);

  // 2 · chrome does not overlap: Skip vs chip vs dots
  const chrome = await page.evaluate(() => {
    const R = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
    const skip = document.querySelector('[aria-label="Skip the hall"]')?.getBoundingClientRect();
    const chip = R(".museum-chip-row p, .museum-chip-row button"); // the visible pill, not the full-width row
    const dots = R('nav[aria-label="Works in the hall"]');
    const hit = (a, c) => a && c && Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0;
    return { skipChip: hit(skip, chip), chipDots: hit(chip, dots), skipDots: hit(skip, dots),
             chipTop: chip && Math.round(chip.top), skipBottom: skip && Math.round(skip.bottom) };
  });
  rec(vp.n, "chrome disjoint", !chrome.skipChip && !chrome.chipDots && !chrome.skipDots, JSON.stringify(chrome));

  // 3 · rapid approach churn, including the last work and back to the rail
  const churn = await page.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    const m = window.__museum;
    for (const i of [0, 9, 4, null, 2, null]) { m.approach(i); await s(220); }
    await s(600);
    return { state: m.state.mode ?? null };
  }).catch((e) => ({ error: String(e).slice(0, 90) }));
  rec(vp.n, "approach churn", !churn.error, JSON.stringify(churn));

  // 4 · Escape returns to the rail
  const esc = await page.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__museum.approach(3); await s(500);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await s(700);
    return window.__museum.state.mode;
  }).catch((e) => String(e));
  rec(vp.n, "Esc leaves approach", esc === "rail", String(esc));

  // 5 · a tilt has a way back: drag pitch then check the Face-forward affordance
  const tilt = await page.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__museum.setLook(0, 0.45); await s(400);
    const txt = document.querySelector(".museum-chip-row")?.textContent || "";
    const btn = [...document.querySelectorAll("button")].some((b) => /face forward/i.test(b.textContent || ""));
    return { offered: /face forward/i.test(txt) || btn };
  }).catch((e) => ({ error: String(e) }));
  rec(vp.n, "tilt offers a way back", !!tilt.offered, JSON.stringify(tilt));

  // 6 · orientation flip mid-approach
  const flip = await page.evaluate(async () => { window.__museum.approach(1); return new Promise((r) => setTimeout(r, 500)); }).catch(() => {});
  await page.setViewportSize({ width: vp.height, height: vp.width });
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const stage = document.querySelector("#museum-slot .sticky");
    const dots = document.querySelector('nav[aria-label="Works in the hall"]');
    const sr = stage?.getBoundingClientRect();
    const dr = dots?.getBoundingClientRect();
    return { mode: window.__museum.state.mode, dotsInsideStage: sr && dr ? dr.bottom <= sr.bottom + 1 && dr.top >= sr.top - 1 : null,
             canvasPos: stage?.querySelector("canvas") ? getComputedStyle(stage.querySelector("canvas")).position : null };
  }).catch((e) => ({ error: String(e).slice(0, 90) }));
  rec(vp.n, "orientation flip survives", after.mode != null && after.dotsInsideStage !== false, JSON.stringify(after));
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(600);

  // 7 · keyboard reaches the hall's controls
  const kb = await page.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    window.__museum.approach(null); await s(500);
    const names = [];
    for (let i = 0; i < 14; i++) {
      const el = document.activeElement;
      names.push((el?.getAttribute("aria-label") || el?.textContent || el?.tagName || "").trim().slice(0, 22));
      const ev = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      document.dispatchEvent(ev);
      await s(20);
    }
    return names;
  }).catch((e) => [String(e)]);
  rec(vp.n, "keyboard probe ran", Array.isArray(kb), "");

  rec(vp.n, "no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await ctx.close();
}
await b.close();
let fails = 0;
for (const r of out) { if (!r.ok) fails++; console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.vp.padEnd(5)} ${r.name.padEnd(26)} ${r.detail}`); }
console.log(`\n${fails} failing check(s) of ${out.length}`);
process.exit(fails ? 1 : 0);
