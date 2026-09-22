#!/usr/bin/env node
/**
 * Round 25 — the /paintings lead painting's cover, measured where this
 * container can measure it (docs/rounds/2026-09-22-round-25-plan.md).
 *
 * The slot is server-rendered with one full-bleed painting for readers whose
 * hall never mounts; on a capable phone it flashed for the second before the
 * island mounted. The cover (paintings.astro + global.css) is the page ground
 * over the painting: it leaves after 2.4s on its own, at once when the island
 * marks the slot `data-hall="off"`, and never exists under reduced motion or
 * without JS. Sessions at 390×645, plus 1440×900:
 *   · REDUCED (prefers-reduced-motion: reduce), first: the cover is
 *     display:none from the first check and the painting is the page — its
 *     average colour is read here as the reference — and the hall never
 *     mounts.
 *   · HALL, the island's chunk held back 1.5s (a slow phone): early and at
 *     1.05s the cover is up and the slot region reads as the page ground,
 *     never the painting; then the hall mounts and the lead is hidden by
 *     the island.
 *   · BLOCKED (the island's chunk aborted, so it never runs): early, the cover
 *     is up and the region is the page ground; after the wait the cover is at
 *     opacity 0 and the region is the painting; the slot carries no
 *     `data-hall`.
 *   · NO-GL (Chromium launched without WebGL): the island runs, finds no
 *     hall, marks the slot `data-hall="off"` and the cover is display:none
 *     well before its wait; the painting shows.
 *   · no page errors anywhere.
 * The region check is a screenshot of the lead's box (its middle half, clear
 * of the caption) averaged with sharp: the page ground is #1d1411; the
 * painting's average is far from it.
 *
 *   node scripts/museum-lead.mjs [--base http://localhost:4331]
 *        [--out node_modules/.cache/museum-lead]
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const OUT = flag("out", "node_modules/.cache/museum-lead");
mkdirSync(OUT, { recursive: true });
const GROUND = [29, 20, 17];
const results = [];
let failures = 0;
const check = (session, pos, name, ok, detail = "") => {
  results.push({ session, pos, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const r1 = (v) => Math.round(v * 10) / 10;

const STATE = () => {
  const slot = document.getElementById("museum-slot");
  const lead = slot && slot.querySelector(".museum-lead");
  const cover = slot && slot.querySelector(".museum-lead-cover");
  const cs = cover ? getComputedStyle(cover) : null;
  const r = lead ? lead.getBoundingClientRect() : null;
  return {
    js: document.documentElement.classList.contains("js"),
    hallAttr: slot ? slot.getAttribute("data-hall") : null,
    hall: !!window.__museum,
    stage: !!document.querySelector(".museum-stage"),
    leadHidden: lead ? getComputedStyle(lead).visibility === "hidden" : null,
    cover: cs ? { display: cs.display, opacity: +cs.opacity, animation: cs.animationName } : null,
    lead: r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null,
  };
};
async function region(page, lead, vp) {
  /* the middle half of the lead's box, inside the viewport, clear of the caption */
  const y0 = Math.max(0, lead.y + lead.h * 0.25);
  const y1 = Math.min(vp.h, lead.y + lead.h * 0.75);
  if (y1 - y0 < 20) return null;
  const buf = await page.screenshot({ clip: { x: 0, y: y0, width: vp.w, height: y1 - y0 } });
  const st = await sharp(buf).stats();
  const mean = st.channels.slice(0, 3).map((c) => c.mean);
  const dist = Math.max(...mean.map((m, i) => Math.abs(m - GROUND[i])));
  return { mean: mean.map(r1), dist: r1(dist) };
}
const ISLAND = /\/_astro\/Museum\.[^/?]+\.js(\?|$)/;
async function open(browser, vp, { motion = "no-preference", block = false, delay = 0 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, reducedMotion: motion });
  /* Astro retries a failed island import once with `?astro-retry=…`, so the
     pattern takes the query too */
  if (block) await ctx.route(ISLAND, (route) => route.abort());
  else if (delay > 0)
    await ctx.route(ISLAND, async (route) => {
      await new Promise((r) => setTimeout(r, delay));
      await route.continue();
    });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Museum\.|net::ERR_FAILED|Failed to fetch dynamically imported/.test(m.text())) errs.push("console: " + m.text().slice(0, 160));
  });
  const t0 = Date.now();
  await page.goto(`${BASE}/paintings`, { waitUntil: "domcontentloaded", timeout: 90000 });
  return { ctx, page, errs, t0 };
}

const gl = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
const VP = { w: 390, h: 645 };
let PAINTING = null;
const isGround = (px) => !!px && px.dist <= 6;
const isPainting = (px) => !!px && !!PAINTING && Math.max(...px.mean.map((m, i) => Math.abs(m - PAINTING[i]))) <= 10;
{
  /* ── REDUCED: the painting is the page, so this is where its average is read ── */
  const s = await open(gl, VP, { motion: "reduce" });
  await s.page.waitForTimeout(250);
  const early = await s.page.evaluate(STATE);
  const earlyPx = early.lead ? await region(s.page, early.lead, VP) : null;
  check("reduced", "early", "no cover (display none)", early.cover && early.cover.display === "none", JSON.stringify(early.cover));
  check("reduced", "early", "region is not the page ground (the painting)", earlyPx && earlyPx.dist > 40, earlyPx ? `mean ${earlyPx.mean.join(",")} · dist ${earlyPx.dist}` : "no region");
  if (earlyPx && earlyPx.dist > 40) PAINTING = earlyPx.mean;
  await s.page.waitForTimeout(2500);
  const late = await s.page.evaluate(STATE);
  check("reduced", "2.75s", "hall never mounts, slot marked off", !late.hall && late.hallAttr === "off", JSON.stringify({ hall: late.hall, attr: late.hallAttr }));
  check("reduced", "-", "no page errors", s.errs.length === 0, s.errs.join(" | "));
  await s.ctx.close();
}
{
  /* ── HALL, the island's chunk held back 1.5s (a slow phone): brown, then the hall, never the painting ── */
  const s = await open(gl, VP, { delay: 1500 });
  await s.page.waitForTimeout(250);
  const early = await s.page.evaluate(STATE);
  const earlyPx = early.lead ? await region(s.page, early.lead, VP) : null;
  check("hall", "early", "js class on <html>", early.js, "");
  check("hall", "early", "cover up (display block, opacity 1)", early.cover && early.cover.display === "block" && early.cover.opacity === 1, JSON.stringify(early.cover));
  check("hall", "early", "island not yet mounted", !early.hall && !early.stage, JSON.stringify({ hall: early.hall, stage: early.stage }));
  check("hall", "early", "region is the page ground, not the painting", isGround(earlyPx), earlyPx ? `mean ${earlyPx.mean.join(",")} · dist ${earlyPx.dist}` : "no region");
  await s.page.waitForTimeout(800);
  const mid = await s.page.evaluate(STATE);
  const midPx = mid.lead ? await region(s.page, mid.lead, VP) : null;
  check("hall", "1.05s", "still before the mount, region still the page ground", !mid.hall && isGround(midPx), midPx ? `hall ${mid.hall} · mean ${midPx.mean.join(",")} · dist ${midPx.dist}` : "no region");
  await s.page.waitForFunction(() => window.__museum, null, { timeout: 45000 }).catch(() => {});
  await s.page.waitForTimeout(500);
  const late = await s.page.evaluate(STATE);
  check("hall", "late", "hall mounted, lead hidden by the island", late.hall && late.stage && late.leadHidden === true, JSON.stringify({ hall: late.hall, stage: late.stage, leadHidden: late.leadHidden }));
  check("hall", "late", "slot not marked off", late.hallAttr === null, `data-hall ${late.hallAttr}`);
  check("hall", "-", "no page errors", s.errs.length === 0, s.errs.join(" | "));
  await s.ctx.close();
}
{
  /* ── BLOCKED ── */
  const s = await open(gl, VP, { block: true });
  await s.page.waitForTimeout(250);
  const early = await s.page.evaluate(STATE);
  const earlyPx = early.lead ? await region(s.page, early.lead, VP) : null;
  check("blocked", "early", "cover up (display block, opacity 1)", early.cover && early.cover.display === "block" && early.cover.opacity === 1, JSON.stringify(early.cover));
  check("blocked", "early", "region is the page ground", isGround(earlyPx), earlyPx ? `mean ${earlyPx.mean.join(",")} · dist ${earlyPx.dist}` : "no region");
  await s.page.waitForTimeout(1500);
  const mid = await s.page.evaluate(STATE);
  check("blocked", "1.75s", "cover still up", mid.cover && mid.cover.display === "block" && mid.cover.opacity === 1, JSON.stringify(mid.cover));
  await s.page.waitForTimeout(1600);
  const late = await s.page.evaluate(STATE);
  const latePx = late.lead ? await region(s.page, late.lead, VP) : null;
  check("blocked", "3.35s", "island never ran", !late.hall && !late.stage && late.hallAttr === null, JSON.stringify({ hall: late.hall, stage: late.stage, attr: late.hallAttr }));
  check("blocked", "3.35s", "cover gone (opacity 0)", late.cover && late.cover.display === "block" && late.cover.opacity === 0, JSON.stringify(late.cover));
  check("blocked", "3.35s", "region is the painting", isPainting(latePx), latePx ? `mean ${latePx.mean.join(",")} vs painting ${PAINTING && PAINTING.join(",")}` : "no region");
  check("blocked", "-", "no page errors", s.errs.length === 0, s.errs.join(" | "));
  await s.ctx.close();
}
{
  /* ── desktop HALL ── */
  const vp = { w: 1440, h: 900 };
  const s = await open(gl, vp);
  await s.page.waitForTimeout(250);
  const early = await s.page.evaluate(STATE);
  check("1440 hall", "early", "cover up", early.cover && early.cover.display === "block" && early.cover.opacity === 1, JSON.stringify(early.cover));
  await s.page.waitForFunction(() => window.__museum, null, { timeout: 45000 }).catch(() => {});
  await s.page.waitForTimeout(500);
  const late = await s.page.evaluate(STATE);
  check("1440 hall", "late", "hall mounted, lead hidden", late.hall && late.leadHidden === true, JSON.stringify({ hall: late.hall, leadHidden: late.leadHidden }));
  check("1440 hall", "-", "no page errors", s.errs.length === 0, s.errs.join(" | "));
  await s.ctx.close();
}
await gl.close();
{
  /* ── NO-GL: a browser without WebGL, so the island runs and finds no hall ── */
  const nogl = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] });
  const s = await open(nogl, VP);
  await s.page.waitForFunction(() => document.getElementById("museum-slot")?.getAttribute("data-hall") === "off", null, { timeout: 8000 }).catch(() => {});
  const t = Date.now() - s.t0;
  const st = await s.page.evaluate(STATE);
  const px = st.lead ? await region(s.page, st.lead, VP) : null;
  check("no-gl", `${r1(t / 1000)}s`, "slot marked off before the wait", st.hallAttr === "off" && t < 2400, `data-hall ${st.hallAttr} at ${t}ms`);
  check("no-gl", `${r1(t / 1000)}s`, "cover gone (display none)", st.cover && st.cover.display === "none", JSON.stringify(st.cover));
  check("no-gl", `${r1(t / 1000)}s`, "no hall", !st.hall && !st.stage, JSON.stringify({ hall: st.hall, stage: st.stage }));
  await s.page.waitForTimeout(300);
  const px2 = st.lead ? await region(s.page, st.lead, VP) : px;
  check("no-gl", "+0.3s", "region is the painting", isPainting(px2), px2 ? `mean ${px2.mean.join(",")} vs painting ${PAINTING && PAINTING.join(",")}` : "no region");
  check("no-gl", "-", "no page errors", s.errs.length === 0, s.errs.join(" | "));
  await s.ctx.close();
  await nogl.close();
}

const lines = ["# /paintings lead cover — measured", "", `base ${BASE} · ${new Date().toISOString()}`, "", "| session | when | check | ok | detail |", "|---|---|---|---|---|"];
for (const r of results) lines.push(`| ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`);
writeFileSync(join(OUT, "lead.json"), JSON.stringify({ base: BASE, results }, null, 2));
writeFileSync(join(OUT, "lead.md"), lines.join("\n") + "\n");
for (const r of results) if (!r.ok) console.error(`  ✗ ${r.session} · ${r.pos} · ${r.name} — ${r.detail}`);
console.log(`museum-lead: ${results.length} check(s), ${failures} failed · ${join(OUT, "lead.md")}`);
process.exit(failures ? 1 : 0);
