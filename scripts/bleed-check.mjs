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
 *   1 TINT       the site paints no band of its own at either viewport edge
 *                (v14.3: no `.chrome-tint` strip, no fixed hairline, no 2px
 *                row that differs from the page under it), and the theme-color
 *                meta carries the ground the page is actually showing at an
 *                edge — the fill Chrome for Android paints its toolbar with.
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
  let best = null, total = 0;
  for (const e of tally.values()) { total += e.n; if (!best || e.n > best.n) best = e; }
  const hx = (v) => Math.round(v / best.n).toString(16).padStart(2, "0");
  /* v14.3: `share` is the mode's fraction of the read — a flat strip is ≥ 0.95,
     artwork or text under the edge far lower. */
  return { mode: "#" + hx(best.r) + hx(best.g) + hx(best.b), share: best.n / total };
}
const dist = (a, b) => {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y, z] = p(a), [u, v, w] = p(b);
  return Math.round(Math.sqrt((x - u) ** 2 + (y - v) ** 2 + (z - w) ** 2));
};

const browser = await chromium.launch();
let failures = 0;

/* ── 1 · TINT ─────────────────────────────────────────────────────────────── */
/* v14.3 (Wil, 9/16: "remove any custom styling that adds a border and/or solid
   background fill behind the browser address bar / toolbar area … no stray 1px
   divider line"). The two fixed 2px `.chrome-tint` strips v12 pinned to the
   edges (v14.2 painted them the resolved edge colour) read as a thin coloured
   line on his iPhone, so they are gone and the claim inverts: the site paints
   NOTHING of its own at an edge. Each bar face is checked three ways:
     · the DOM: no `.chrome-tint` element, no `--chrome-tint-*` property, and
       nothing fixed/sticky, full-width and ≤ 8px tall with a paint of its own
       under the edge point — the walk rail excepted (a 3px progress hairline:
       UI, not a ground);
     · the pixels: rows 0–1 and h−2..h−1 of the shot are not a uniform band
       (≥ 95% one colour) that differs from the rows 4px in. On chapter pages
       the top rows are read only in the rail's four 2px gaps, located from the
       DOM;
     · the meta: theme-color carries the colour the sampler in Base.astro
       RESOLVES for one of the two edges — the nearest `data-edge-top` /
       `data-edge-bottom` (`-wide` from 768px) declared by whatever sits at the
       edge, else the first flat ground in paint order, else <html>; a section
       that declares `transparent` leaves the meta alone. That is the fill
       Chrome for Android paints its toolbar with; Safari 26 ignores it.
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
        /* v14.3: anything fixed/sticky, full-width and ≤ 8px tall with a paint
           of its own under the edge point is a band of the site's making. The
           walk rail (a 3px progress hairline) is UI and is excepted. */
        const hairline = (yy) => {
          const found = [];
          for (const el of document.elementsFromPoint((innerWidth / 2) | 0, yy)) {
            if (el === document.documentElement || el === document.body || el.closest(".walk-rail")) continue;
            const cs = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const paints = hex(cs.backgroundColor) || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
            if ((cs.position === "fixed" || cs.position === "sticky") && r.width >= innerWidth - 2 && r.height <= 8 && paints)
              found.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`);
          }
          return found;
        };
        /* The rail's stripe covers the top rows on a chapter page; its gaps show the page. */
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
          strips: document.querySelectorAll(".chrome-tint").length,
          vars: (root.getPropertyValue("--chrome-tint-top") + root.getPropertyValue("--chrome-tint-bottom")).trim(),
          hairline: { top: hairline(1), bottom: hairline(innerHeight - 2) },
          theme: document.querySelector('meta[name="theme-color"]').content,
          gaps,
        };
      });
      /* The edge rows against the rows 4px in — the depth the sampler reads at. */
      const painted = {
        top: await band(buf, vp.width, 0, 2, dom.gaps),
        topIn: await band(buf, vp.width, 4, 2, dom.gaps),
        bottom: await band(buf, vp.width, vp.height - 2, 2),
        bottomIn: await band(buf, vp.width, vp.height - 6, 2),
      };
      for (const side of ["top", "bottom"]) {
        const want = dom[side].c;
        const clear = want === "transparent";
        const edge = painted[side], inner = painted[side + "In"];
        const domOk = dom.strips === 0 && dom.vars === "" && dom.hairline[side].length === 0;
        /* A band is two FLAT colours meeting within 4px of the edge. A flat
           edge over rows that are not flat is content scrolled to the edge —
           measured: /commissioners-office at 390×844, y=2696, the cream gap
           between two lines of body text at rows 0–1 over the glyph ink at
           rows 4–5. A strip over artwork is caught structurally (`domOk`). */
        const paintOk = !(edge.share >= 0.95 && inner.share >= 0.95 && dist(edge.mode, inner.mode) > TOL);
        const metaOk = !clear && dist(dom.theme, want) <= TOL;
        faces.push({ vp: vp.name, route, y, side, want, hook: dom[side].hook, clear, strips: dom.strips, vars: dom.vars, hairline: dom.hairline[side], painted: edge, inner, theme: dom.theme, domOk, paintOk, metaOk });
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
    if (f.domOk && f.paintOk && f.clear) clear++;                                  // a section asked for no colour; the meta is left alone
    else if (f.domOk && f.paintOk && f.metaOk) { seamless++; if (f.hook) hooked++; }
    else if (f.domOk && f.paintOk && other && other.metaOk) split++;              // two colours, the meta took the other
    else {
      bar++;
      bars.push(`  ${f.vp} ${f.route} y=${f.y} ${f.side}: resolved ${f.want}${f.hook ? " (declared)" : ""} · strips ${f.strips} · var ${f.vars || "unset"} · fixed hairline ${f.hairline.join(",") || "none"} · edge rows ${f.painted.mode} (${f.painted.share.toFixed(2)} uniform) vs 4px in ${f.inner.mode} · meta ${f.theme}`);
    }
  }
console.log(`TINT — ${screens.size} screens × 2 bar faces = ${faces.length}`);
console.log(`  seamless (nothing of the site's own at the edge; meta = resolved edge) ${seamless}  (${hooked} from a declared edge colour)`);
console.log(`  see-through (a section declared transparent)                          ${clear}`);
console.log(`  forced split (two colours; meta took the other)                       ${split}`);
console.log(`  A VISIBLE BAR                                                         ${bar}`);
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
