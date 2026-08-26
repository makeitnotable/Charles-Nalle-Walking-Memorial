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
const argBase = (() => { const i = process.argv.indexOf("--base"); return i > -1 ? process.argv[i + 1] : null; })();
const BASE = argBase || process.env.QA_BASE || "http://localhost:4321";
const out = [];
const rec = (vp, name, ok, detail = "") => out.push({ vp, name, ok, detail });
/* v13: the round's new acceptance, kept separate from the 32 checks this
   instrument shipped with so a regression in either set is legible on its
   own. Every original check must still pass, unchanged. */
const recV = (vp, name, ok, detail = "") => out.push({ vp, name, ok, detail, v13: true });
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

  // ——————————————————————————————————————————————————————————————————
  // v13 acceptance
  // ——————————————————————————————————————————————————————————————————
  const mobile = vp.width < 640;
  const portraitUI = vp.width < 1024 && vp.height > vp.width;

  // v13-10e · the works hang centred on the wall the visitor can see
  const hang = await page.evaluate(() => {
    const st = window.__museum.state;
    const ceil = st.ceilY;
    const p = window.__museum.placements;
    // the portrait work is the one whose canvas is taller than it is wide
    const i = p.findIndex((q) => q.h > q.w);
    if (i < 0 || !ceil) return { error: "no portrait work / no ceilY" };
    const q = p[i];
    return { i, ceil, yC: +q.pos.y.toFixed(3), frameTop: +(q.pos.y + q.h / 2 + 0.17).toFixed(3),
             frameBot: +(q.pos.y - q.h / 2 - 0.17).toFixed(3), d: +Math.abs(q.pos.y - ceil / 2).toFixed(4),
             orient: st.portrait ? "portrait" : "landscape" };
  }).catch((e) => ({ error: String(e).slice(0, 90) }));
  recV(vp.n, "portrait work centred", !hang.error && hang.d < 0.01 && hang.frameTop <= hang.ceil && hang.frameBot >= 0, JSON.stringify(hang));

  // v13-10d · the counter sits on the dot rail's own centre line
  const nav = await page.evaluate(() => {
    const n = document.querySelector('nav[aria-label="Works in the hall"]');
    const p = n?.querySelector("p"), ol = n?.querySelector("ol");
    if (!p || !ol) return { error: "no nav" };
    const pr = p.getBoundingClientRect(), orr = ol.getBoundingClientRect();
    const cx = (r) => (r.left + r.right) / 2;
    return { visible: pr.height > 0, dcx: +(cx(pr) - cx(orr)).toFixed(2), above: pr.bottom <= orr.top + 0.5 };
  }).catch((e) => ({ error: String(e).slice(0, 90) }));
  recV(vp.n, "counter above + on dot centre", !nav.error && nav.visible && Math.abs(nav.dcx) < 1 && nav.above, JSON.stringify(nav));

  // v13-10b · Face forward is right-aligned on Skip's axis (<=767)
  if (vp.width <= 767) {
    const ff = await page.evaluate(async () => {
      const s = (ms) => new Promise((r) => setTimeout(r, ms));
      window.__museum.approach(null); await s(300);
      window.__museum.setLook(0.6, 0); await s(600);
      const btns = [...document.querySelectorAll("button")].filter((b) => /face forward/i.test(b.textContent || "") && b.getBoundingClientRect().height > 0);
      const skip = document.querySelector('[aria-label="Skip the hall"]')?.getBoundingClientRect();
      const stage = document.querySelector("#museum-slot .sticky") || document.querySelector(".sticky");
      const sr = stage.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20;
      if (btns.length !== 1 || !skip) return { error: `instances=${btns.length}` };
      const r = btns[0].getBoundingClientRect();
      return { instances: btns.length, rightGap: +(sr.right - r.right).toFixed(1), inset,
               dcy: +(((r.top + r.bottom) / 2) - ((skip.top + skip.bottom) / 2)).toFixed(2) };
    }).catch((e) => ({ error: String(e).slice(0, 90) }));
    recV(vp.n, "Face forward top-right on Skip", !ff.error && Math.abs(ff.rightGap - ff.inset) < 1.5 && Math.abs(ff.dcy) < 1, JSON.stringify(ff));
    await page.evaluate(() => window.__museum.recenter());
    await page.waitForTimeout(400);
  }

  // v13-10a · the chip stands at railT 0 and is gone once the walk starts (phones)
  const chip = await page.evaluate(async () => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    const st = document.querySelector("#museum-slot .sticky") || document.querySelector(".sticky");
    const wrap = st.parentElement;
    const seen = async (t) => {
      const r = wrap.getBoundingClientRect();
      const total = r.height - st.clientHeight;
      window.scrollTo({ top: window.scrollY + r.top + total * t, behavior: "instant" });
      await s(500);
      const pill = document.querySelector(".museum-chip-pill");
      return { railT: +window.__museum.state.railT.toFixed(4),
               vis: !!pill && getComputedStyle(pill).display !== "none" && pill.getBoundingClientRect().height > 0 };
    };
    const at0 = await seen(0);
    const at5 = await seen(0.05);
    window.scrollTo({ top: window.scrollY - 1e6, behavior: "instant" });
    await s(400);
    return { at0, at5 };
  }).catch((e) => ({ error: String(e).slice(0, 90) }));
  recV(vp.n, "chip at railT 0, gone after", !chip.error && chip.at0.vis && chip.at0.railT === 0 && (mobile ? !chip.at5.vis : chip.at5.vis) && chip.at5.railT > 0.02, JSON.stringify(chip));

  // v13-10c · the drawer's top padding equals its left padding, in peek
  if (portraitUI) {
    const pad = await page.evaluate(async () => {
      const s = (ms) => new Promise((r) => setTimeout(r, ms));
      window.__museum.approach(2); await s(1200);
      const head = document.querySelector(".museum-sheet-head");
      const body = document.querySelector(".museum-sheet-body");
      const sheet = document.querySelector(".museum-sheet");
      if (!head) return { error: "no sheet" };
      const cs = getComputedStyle(head);
      const headH = head.getBoundingClientRect().height;
      const sheetMax = parseFloat(getComputedStyle(sheet).maxHeight);
      const bodyMax = parseFloat(getComputedStyle(body).maxHeight);
      const out = { state: window.__museum.state.sheet, pt: cs.paddingTop, pl: cs.paddingLeft,
                    headH: +headH.toFixed(1), fits: +(headH + bodyMax - sheetMax).toFixed(1) };
      window.__museum.approach(null); await s(600);
      return out;
    }).catch((e) => ({ error: String(e).slice(0, 90) }));
    recV(vp.n, "drawer pad-top === pad-left", !pad.error && pad.pt === pad.pl && pad.fits <= 0.5, JSON.stringify(pad));
  }

  // v13-10f · rushing the room: every work, one flick, no stuck drawer
  if (vp.width === 390 || vp.width === 768) {
    const rush = await page.evaluate(async () => {
      const s = (ms) => new Promise((r) => setTimeout(r, ms));
      const st = document.querySelector("#museum-slot .sticky") || document.querySelector(".sticky");
      const wrap = st.parentElement;
      const bad = [];
      for (let i = 0; i < window.__museum.state.works; i++) {
        const w0 = wrap.getBoundingClientRect();
        const total = w0.height - st.clientHeight;
        window.scrollTo({ top: window.scrollY + w0.top + total * (i / 9) * 0.9, behavior: "instant" });
        await s(350);
        window.__museum.approach(i); await s(1300);
        const opened = window.__museum.state.mode === "approach" && !!document.querySelector(".museum-sheet, .museum-card");
        const wr = wrap.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + wr.bottom + 200, behavior: "instant" });
        await s(700);
        const left = window.__museum.state.approached === null && !document.querySelector(".museum-sheet") && !document.querySelector(".museum-card");
        // the page has left the wrap — assert nothing came with it
        const past = wrap.getBoundingClientRect().bottom < 1;
        if (!opened || !left || !past) bad.push({ i, opened, left, past });
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await s(300);
      return { bad };
    }).catch((e) => ({ error: String(e).slice(0, 90) }));
    recV(vp.n, "rush: 10 works exit approach", !rush.error && rush.bad.length === 0, JSON.stringify(rush).slice(0, 160));
  }

  rec(vp.n, "no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await ctx.close();
}
await b.close();
let fails = 0;
for (const r of out) { if (!r.ok) fails++; console.log(`${r.ok ? "PASS" : "FAIL"} ${r.v13 ? "v13" : "   "} ${r.vp.padEnd(5)} ${r.name.padEnd(30)} ${r.detail}`); }
const base = out.filter((r) => !r.v13);
const v13 = out.filter((r) => r.v13);
const bf = base.filter((r) => !r.ok).length;
const vf = v13.filter((r) => !r.ok).length;
console.log(`\noriginal: ${bf} failing of ${base.length}   ·   v13: ${vf} failing of ${v13.length}`);
console.log(`${fails} failing check(s) of ${out.length}`);
process.exit(fails ? 1 : 0);
