#!/usr/bin/env node
/**
 * v11.2 — the full-bleed gate (Wil, 8/24: "the browser tool bar, and address
 * bar allow the website to be full bleed… Every page on the site should be
 * full bleed").
 *
 * A phone browser paints two strips of chrome — one at each end of the
 * viewport — and it paints them ONE colour. So "full bleed" on a phone is three
 * measurable claims, and this asserts all three:
 *
 *   1 TINT       every screen's two bar faces take the ground the page is
 *                actually showing there, so the strip reads as the page rather
 *                than as a bar.
 *   2 RETRACTION the root document is the scroller and has runway, which is
 *                the precondition for a browser to slide its chrome away.
 *   3 LANE       --ui-inset still resolves to a LENGTH (four islands parseFloat
 *                it) and still grows to clear a safe area.
 *
 * MUST run against `astro preview`, never `astro dev`: `astro-dev-toolbar` is a
 * fixed element across the bottom of the viewport and every bottom sample in
 * dev is the toolbar, not the page.
 *
 *   npm run build && npm run preview -- --port 4331
 *   node scripts/bleed-check.mjs --base http://localhost:4331
 *
 * What it cannot do: watch the chrome actually retract, or see its tint.
 * Chromium headless has no address bar. Those go to a phone.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/ferry,/mansion,/barbershop,/map,/paintings,/about,/people,/404",
).split(",");
const VPS = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "414x896", width: 414, height: 896 },
];
/* Δ in plain sRGB distance (0–441). Cream against brown measures 382, which is
   the failure this round was about; 40 is comfortably below any real ground
   change and above the noise a gradient's last stop leaves. */
const TOL = 40;
const GUTTERS = [
  { width: 360, height: 800, gutter: 20 },
  { width: 390, height: 844, gutter: 20 },
  { width: 768, height: 1024, gutter: 40 },
  { width: 1024, height: 768, gutter: 40 },
  { width: 1440, height: 900, gutter: 56 },
  { width: 1920, height: 1080, gutter: 56 },
];

/* The MODE of a band of pixels, never its mean: a browser tints from the ground
   it sees, and a row of body text or a hairline must not drag the answer.
   `cols` limits the read to those x-columns (the walk rail's gaps — see TINT). */
async function band(buf, w, top, height = 8, cols = null) {
  const { data, info } = await sharp(buf)
    .extract({ left: 0, top, width: w, height })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const use = cols && cols.length ? new Set(cols) : null;
  const tally = new Map();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < w; x++) {
      if (use && !use.has(x)) continue;
      const i = (y * w + x) * ch;
      const k = ((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2);
      const e = tally.get(k);
      if (e) { e.n++; e.r += data[i]; e.g += data[i + 1]; e.b += data[i + 2]; }
      else tally.set(k, { n: 1, r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  let best = null;
  for (const e of tally.values()) if (!best || e.n > best.n) best = e;
  const hx = (v) => Math.round(v / best.n).toString(16).padStart(2, "0");
  return "#" + hx(best.r) + hx(best.g) + hx(best.b);
}
const dist = (a, b) => {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y, z] = p(a), [u, v, w] = p(b);
  return Math.round(Math.sqrt((x - u) ** 2 + (y - v) ** 2 + (z - w) ** 2));
};

const browser = await chromium.launch();
let failures = 0;

/* ── 1 · TINT ─────────────────────────────────────────────────────────────── */
/* v14.2 (Wil, 9/16: "continue the artwork"). What a bar face must read is no
   longer "the flat ground, or nothing over a painting" — it is the colour the
   sampler in Base.astro RESOLVES for that edge: the nearest `data-edge-top` /
   `data-edge-bottom` (`-wide` from 768px) declared by whatever sits at the
   edge, else the first flat ground in paint order, else <html>. Over a hero or
   the map that is a declared colour, and a strip is never transparent unless a
   section says `transparent` outright. So each face is checked three ways:
     · the custom property carries the resolved colour and the strip's computed
       background took it;
     · the 2px strip actually PAINTS it — rows 0–1 and h−2..h−1 of the shot. On
       chapter pages the walk rail's 3px stripe lies over the top strip, so
       those rows are read only in the rail's four 2px gaps, located from the
       DOM;
     · the theme-color meta carries one of the two strip colours (Chrome for
       Android reads the meta; Safari reads the strips).
   The resolver below mirrors the sampler on purpose: it is the contract the
   hooks in [chapter].astro and map.astro are written against, re-derived here
   so a hook that stops resolving fails the instrument rather than the phone. */
const faces = [];
for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
    await page.waitForTimeout(450);
    const max = await page.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
    const depths = max > 0 ? [0, 0.2, 0.4, 0.6, 0.8, 0.98].map((f) => Math.round(max * f)) : [0];
    for (const y of depths) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(320);
      /* v14.2: measure the SETTLED screen. A scroll-reveal rising into an edge
         takes 1.6s and the sampler re-reads the edge on transitionend, so wait
         for the finite animations the scroll started (looping ones excluded;
         1.8s cap) before the shot. */
      await page.evaluate(() =>
        Promise.race([
          Promise.all(
            document
              .getAnimations()
              .filter((a) => a.playState === "running" && isFinite(a.effect.getComputedTiming().endTime))
              .map((a) => a.finished.catch(() => {})),
          ),
          new Promise((r) => setTimeout(r, 1800)),
        ]),
      );
      await page.waitForTimeout(60);
      const buf = await page.screenshot({ type: "png" });
      const dom = await page.evaluate(() => {
        const ART = /^(img|video|canvas|svg|picture)$/;
        const hex = (c) => {
          const m = String(c).match(/[\d.]+/g);
          if (!m || m.length < 3) return null;
          if (m.length > 3 && Number(m[3]) < 0.999) return null;
          return "#" + m.slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("");
        };
        const value = (v) => {
          if (!v) return null;
          v = String(v).trim().toLowerCase();
          return v === "transparent" || /^#[0-9a-f]{6}$/.test(v) ? v : null;
        };
        const wide = matchMedia("(min-width: 768px)").matches;
        const declared = (el, side) => {
          const host = el.closest && el.closest(`[data-edge-${side}]`);
          if (!host) return null;
          return (wide && value(host.getAttribute(`data-edge-${side}-wide`))) || value(host.getAttribute(`data-edge-${side}`));
        };
        /* 4px in: the walk rail is a 3px hairline pinned to the top of every
           chapter page and it is not the page's ground. */
        const resolve = (yy, side) => {
          let art = false;
          for (const el of document.elementsFromPoint((innerWidth / 2) | 0, yy)) {
            if (el === document.documentElement) break;
            const d = declared(el, side);
            if (d) return { c: d, hook: true, art: false };
            const cs = getComputedStyle(el);
            if (ART.test(el.tagName.toLowerCase()) || cs.backgroundImage !== "none") art = true;
            const c = hex(cs.backgroundColor);
            if (c) return { c, hook: false, art };
          }
          return { c: hex(getComputedStyle(document.documentElement).backgroundColor), hook: false, art };
        };
        const root = getComputedStyle(document.documentElement);
        const strip = (sel) => hex(getComputedStyle(document.querySelector(sel)).backgroundColor);
        /* The rail's stripe covers the top strip; its gaps are where the strip shows. */
        let gaps = null;
        const rail = document.querySelector(".walk-rail");
        if (rail && rail.getBoundingClientRect().top < 2) {
          const segs = [...rail.querySelectorAll(".walk-seg")].map((s) => s.getBoundingClientRect()).sort((a, b) => a.left - b.left);
          gaps = [];
          for (let i = 1; i < segs.length; i++)
            for (let x = Math.ceil(segs[i - 1].right); x < Math.floor(segs[i].left); x++) gaps.push(x);
        }
        return {
          top: resolve(4, "top"),
          bottom: resolve(innerHeight - 5, "bottom"),
          tint: { top: root.getPropertyValue("--chrome-tint-top").trim(), bottom: root.getPropertyValue("--chrome-tint-bottom").trim() },
          css: { top: strip(".chrome-tint-top"), bottom: strip(".chrome-tint-bottom") },
          theme: document.querySelector('meta[name="theme-color"]').content,
          gaps,
        };
      });
      const painted = {
        top: await band(buf, vp.width, 0, 2, dom.gaps),
        bottom: await band(buf, vp.width, vp.height - 2, 2),
      };
      for (const side of ["top", "bottom"]) {
        const want = dom[side].c;
        const clear = want === "transparent";
        const varOk = dom.tint[side] === want && (clear ? dom.css[side] === null : dom.css[side] === want);
        const paintOk = clear || dist(want, painted[side]) <= TOL;
        const metaOk = !clear && dist(dom.theme, want) <= TOL;
        faces.push({ vp: vp.name, route, y, side, want, hook: dom[side].hook, clear, tint: dom.tint[side], painted: painted[side], theme: dom.theme, varOk, paintOk, metaOk });
      }
    }
  }
  await ctx.close();
}
const screens = new Map();
for (const f of faces) {
  const k = `${f.vp}|${f.route}|${f.y}`;
  if (!screens.has(k)) screens.set(k, []);
  screens.get(k).push(f);
}
let seamless = 0, hooked = 0, clear = 0, split = 0, bar = 0;
const bars = [];
for (const pair of screens.values())
  for (const f of pair) {
    const other = pair.find((o) => o !== f);
    if (f.clear && f.varOk) clear++;                                   // a section asked for no colour
    else if (f.varOk && f.paintOk && f.metaOk) { seamless++; if (f.hook) hooked++; }
    else if (f.varOk && f.paintOk && other && other.metaOk) split++;   // two colours, the meta took the other
    else {
      bar++;
      bars.push(`  ${f.vp} ${f.route} y=${f.y} ${f.side}: resolved ${f.want}${f.hook ? " (declared)" : ""} · strip var ${f.tint || "unset"} · painted ${f.painted} · meta ${f.theme}`);
    }
  }
console.log(`TINT — ${screens.size} screens × 2 bar faces = ${faces.length}`);
console.log(`  seamless (strip = resolved edge, meta agrees)   ${seamless}  (${hooked} from a declared edge colour)`);
console.log(`  see-through (a section declared transparent)    ${clear}`);
console.log(`  forced split (two colours; meta took the other) ${split}`);
console.log(`  A VISIBLE BAR                                   ${bar}`);
if (bar) { console.log(bars.join("\n")); failures += bar; }

/* ── 2 · RETRACTION PRECONDITIONS ─────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  console.log("\nRETRACTION — the root must be the scroller and must have runway");
  let blocked = 0;
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
    await page.waitForTimeout(500);
    const r = await page.evaluate(async () => {
      const se = document.scrollingElement;
      const runway = se.scrollHeight - innerHeight;
      scrollTo(0, 200);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const moved = se.scrollTop;
      scrollTo(0, 0);
      return { root: se === document.documentElement, runway, ho: getComputedStyle(document.documentElement).overflowY, moved };
    });
    const ok = r.root && (r.runway <= 0 || r.moved > 0);
    if (!ok) { blocked++; failures++; }
    console.log(`  ${route.padEnd(24)} runway ${String(r.runway).padStart(6)}  html.overflow-y ${r.ho.padEnd(8)} ${r.runway > 0 ? (r.moved > 0 ? "scrolls" : "BLOCKED") : "one screen — chrome cannot retract here"}`);
  }
  if (!blocked) console.log("  0 blocked");
  await ctx.close();
}

/* ── 3 · THE FLOATING LANE ────────────────────────────────────────────────── */
{
  console.log("\nLANE — --ui-inset must resolve to a length, and must clear a safe area");
  for (const g of GUTTERS) {
    const ctx = await browser.newContext({ viewport: { width: g.width, height: g.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(BASE + "/bakery", { waitUntil: "load" });
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const raw = cs.getPropertyValue("--ui-inset").trim();
      const m = document.querySelector(".cnwm-menu");
      return { raw, parsed: parseFloat(raw), top: m && getComputedStyle(m).top, right: m && getComputedStyle(m).right };
    });
    const ok = r.parsed === g.gutter && r.top === `${g.gutter}px` && r.right === `${g.gutter}px`;
    if (!ok) failures++;
    console.log(`  ${String(g.width).padStart(4)}  --ui-inset ${r.raw.padEnd(8)} parseFloat ${String(r.parsed).padEnd(5)} menu ${r.top} / ${r.right}  ${ok ? "ok" : `FAIL (expected ${g.gutter}px)`}`);
    await ctx.close();
  }
  /* Chromium reports no safe areas, so the growth half is proved by standing a
     47px inset (an iPhone's landscape notch) in env()'s place. */
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/bakery", { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.addStyleTag({ content: ":root{--ui-inset: max(var(--gutter), 0px, 47px, 21px, 47px)}" });
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const m = getComputedStyle(document.querySelector(".cnwm-menu"));
    return { parsed: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")), top: m.top, right: m.right };
  });
  const ok = r.parsed === 47 && r.top === "47px" && r.right === "47px";
  if (!ok) failures++;
  console.log(`  simulated 47px notch → --ui-inset ${r.parsed}px, menu ${r.top} / ${r.right}  ${ok ? "ok" : "FAIL"}`);
  await ctx.close();
}

await browser.close();
console.log(`\nbleed-check: ${failures ? failures + " FAILURES" : "clean"}`);
process.exit(failures ? 1 : 0);
