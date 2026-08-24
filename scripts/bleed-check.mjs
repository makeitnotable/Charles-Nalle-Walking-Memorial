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

/* The MODE of an 8px band, never its mean: a browser tints from the ground it
   sees, and a row of body text or a hairline must not drag the answer. */
async function band(buf, w, top) {
  const { data } = await sharp(buf)
    .extract({ left: 0, top, width: w, height: 8 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = w * 8;
  const tally = new Map();
  for (let i = 0; i < n; i++) {
    const k = ((data[i * 3] >> 2) << 12) | ((data[i * 3 + 1] >> 2) << 6) | (data[i * 3 + 2] >> 2);
    const e = tally.get(k);
    if (e) { e.n++; e.r += data[i * 3]; e.g += data[i * 3 + 1]; e.b += data[i * 3 + 2]; }
    else tally.set(k, { n: 1, r: data[i * 3], g: data[i * 3 + 1], b: data[i * 3 + 2] });
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
      const buf = await page.screenshot({ type: "png" });
      /* 4px in: the walk rail is a 3px hairline pinned to the top of every
         chapter page and it is not the page's ground. */
      const painted = { top: await band(buf, vp.width, 4), bottom: await band(buf, vp.width, vp.height - 12) };
      const dom = await page.evaluate(() => {
        const ART = /^(img|video|canvas|svg|picture)$/;
        const at = (yy) => {
          let el = document.elementFromPoint((innerWidth / 2) | 0, yy), art = false;
          while (el && el !== document.documentElement) {
            const cs = getComputedStyle(el);
            if (ART.test(el.tagName.toLowerCase()) || cs.backgroundImage !== "none") art = true;
            const m = cs.backgroundColor.match(/[\d.]+/g);
            if (m && (m.length < 4 || Number(m[3]) >= 0.999)) return { art };
            el = el.parentElement;
          }
          return { art };
        };
        return { top: at(4), bottom: at(innerHeight - 5), theme: document.querySelector('meta[name="theme-color"]').content };
      });
      for (const side of ["top", "bottom"])
        faces.push({ vp: vp.name, route, y, side, painted: painted[side], art: dom[side].art, theme: dom.theme, d: dist(dom.theme, painted[side]) });
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
let seamless = 0, artwork = 0, split = 0, bar = 0;
const bars = [];
for (const pair of screens.values())
  for (const f of pair) {
    const other = pair.find((o) => o !== f);
    if (f.d <= TOL) seamless++;
    else if (f.art) artwork++;                       // a painting owns the edge
    else if (other && other.d <= TOL) split++;       // two grounds, one colour
    else { bar++; bars.push(`  ${f.vp} ${f.route} y=${f.y} ${f.side}: page ${f.painted} vs chrome ${f.theme} — Δ${f.d}`); }
  }
console.log(`TINT — ${screens.size} screens × 2 bar faces = ${faces.length}`);
console.log(`  seamless (the chrome IS the page)  ${seamless}`);
console.log(`  over artwork (no flat colour can)  ${artwork}`);
console.log(`  forced split (other edge seamless) ${split}`);
console.log(`  A VISIBLE BAR                      ${bar}`);
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
