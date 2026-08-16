#!/usr/bin/env node
/**
 * WCAG contrast sweep — STYLE mode + PIXEL mode (docs/PLAN.md G3 / Part B).
 * Exit 1 on any failure (style ratio < bar, or pixel p10 < bar), else 0.
 *
 * STYLE mode (unchanged): every visible text leaf whose nearest painted
 * ancestor background is an opaque colour → computed `color` composited over
 * it, as a WCAG luminance ratio.
 *
 * PIXEL mode (new): text that used to be UNMEASURED — over imagery, gradients,
 * semi-transparent backgrounds, or under an `opacity < 1` chain. Per element we
 * record the text colour (alpha × the product of ancestor opacities), size,
 * weight and its per-LINE client rects (`Range.getClientRects()`). The page is
 * walked in ¾-viewport steps; at each step ALL leaves are hidden at once
 * (`color: transparent`, no text-shadow) so only the background paints, the
 * viewport is screenshotted, decoded with sharp, and every pixel (2px grid)
 * inside each in-view line rect is compared with the text colour. Reported:
 * `min` (worst pixel) and `p10` (10th percentile — robust to a stray hairline).
 * The gate uses p10. Videos are frozen and reveals forced (`is-in`) so the
 * frame doesn't move between screenshot and sampling.
 *
 * AA bar: 4.5:1, or 3:1 for large text (≥24px, or ≥18.66px at weight ≥700).
 *
 * Usage: node scripts/contrast.mjs <outfile.md> [--base URL]
 *          [--routes /,/map] [--vp 390,768,1440]
 * Writes <outfile>.md plus a sibling .json with every measured row
 * (`mode: 'style' | 'pixel'`) and the unmeasured list.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const out = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/elements/contrast.md";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag(
  "routes",
  "/,/bakery,/commissioners-office,/mansion,/ferry,/barbershop,/map,/people,/paintings,/about,/404",
).split(",");
const ALL_VPS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];
const wanted = flag("vp", "390,768,1440").split(",");
const VPS = ALL_VPS.filter((v) => wanted.includes(v.name));

/* ── WCAG maths (Node side; the browser only reports raw colours) ────────── */
const LIN = Array.from({ length: 256 }, (_, v) => {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
});
const lum = ([r, g, b]) => 0.2126 * LIN[r | 0] + 0.7152 * LIN[g | 0] + 0.0722 * LIN[b | 0];
const ratioL = (l1, l2) => (l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05));
const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])); // fg with alpha over opaque bg
const r2 = (x) => Math.round(x * 100) / 100;

/* ── Browser: still the page (reveals, motion, video) ───────────────────── */
// Runs once per route/viewport before classification. Reveals are forced and
// every CSS transition/animation is zeroed so staggered `.reveal` children
// don't read as opacity 0 mid-transition; video is frozen so the hero frame is
// identical between screenshot and sampling.
const FORCE = () => {
  document.querySelectorAll(".reveal,.reveal-quote,.lines,.wipe,.home-seq").forEach((e) => {
    e.classList.add("is-in");
    e.style.opacity = "1";
    e.style.transform = "none";
  });
  document.querySelectorAll("video").forEach((v) => {
    v.pause();
    try { v.currentTime = Math.min(2, v.duration || 2); } catch {}
  });
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  document.documentElement.style.scrollBehavior = "auto";
  // Lazy imagery must be painted before it is sampled: load it all now and
  // resolve once every <img> has settled (8 s cap).
  const imgs = [...document.querySelectorAll("img")];
  imgs.forEach((i) => { i.loading = "eager"; });
  const settled = Promise.all(
    imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }))),
  );
  if (!document.getElementById("__cx-hide")) {
    const still = document.createElement("style");
    still.textContent =
      "*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important}";
    document.head.appendChild(still);
    // One toggleable rule hides every leaf's glyphs (media="not all" ⇒ off).
    const st = document.createElement("style");
    st.id = "__cx-hide";
    st.media = "not all";
    st.textContent =
      "[data-cx]{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}";
    document.head.appendChild(st);
  }
  return Promise.race([settled, new Promise((r) => setTimeout(r, 8000))]).then(() => imgs.filter((i) => !i.complete).length);
};

/* ── Browser: classify every text leaf ──────────────────────────────────── */
// Tags every leaf with data-cx=<index> and returns raw colours: `style` leaves
// (opaque ancestor bg, nothing painted between it and the text) and `pixel`
// leaves (imagery / gradient / semi-transparent bg / opacity chain / a media
// or painted layer overlapping the text that isn't one of its ancestors —
// the hero film, the moral-section image, the interlude photo, map tiles).
const CLASSIFY = () => {
  // rgb()/rgba() and the color(srgb …) form Chromium emits for color-mix().
  const parse = (c) => {
    let m = c.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?\)/);
    if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
    m = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
    return m ? [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]] : null;
  };

  const leaves = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd,figcaption,a,button,span,time,label")].filter(
    (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.display === "none" || cs.visibility === "hidden") return false;
      if (+cs.opacity === 0) return false;
      return (
        [...el.children].every(
          (c) => !(c.innerText || "").trim() || getComputedStyle(c).display === "none",
        ) && (el.innerText || "").trim().length > 0
      );
    },
  );
  // Everything that paints (media, bg-image, any bg colour) with its rect —
  // used to spot layers sitting under a text leaf without being its ancestor.
  const paints = [];
  for (const n of document.querySelectorAll("*")) {
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
    const b = parse(cs.backgroundColor);
    if (!/^(IMG|VIDEO|CANVAS|PICTURE|svg)$/.test(n.tagName) && cs.backgroundImage === "none" && !(b && b[3] > 0)) continue;
    const r = n.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) paints.push({ n, r });
  }
  const overlaps = (a, b) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) >= 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) >= 1;

  const style = [], pixel = [];
  let unparsed = 0, skipped = 0;
  leaves.forEach((el, i) => {
    el.dataset.cx = i;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) { unparsed++; return; }
    // Effective text alpha = colour alpha × every ancestor's opacity.
    let alpha = fg[3];
    for (let n = el; n; n = n.parentElement) alpha *= +getComputedStyle(n).opacity;
    let dirty = alpha < fg[3];
    // Nearest painted background walking up (unchanged from the style-only sweep).
    let bg = null, provider = null;
    for (let n = el; n; n = n.parentElement) {
      const ncs = getComputedStyle(n);
      if (ncs.backgroundImage !== "none") { dirty = true; break; }
      const b = parse(ncs.backgroundColor);
      if (b && b[3] > 0) {
        bg = b[3] < 1 ? null : b; // semi-transparent bg → pixel mode
        if (b[3] < 1) dirty = true;
        provider = n;
        break;
      }
      if (n === document.documentElement) break;
    }
    // A painted layer that overlaps the text, is not an ancestor/descendant of
    // it, and paints above the bg provider (inside its subtree, or later in the
    // DOM) means the computed bg is not what's under the glyphs → pixel mode.
    if (!dirty && bg) {
      const R = el.getBoundingClientRect();
      dirty = paints.some(
        ({ n, r }) =>
          n !== el && !el.contains(n) && !n.contains(el) && overlaps(R, r) &&
          (provider.contains(n) || provider.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
    }
    const id = el.tagName.toLowerCase() + ([...el.classList].length ? "." + [...el.classList].slice(0, 2).join(".") : "");
    const text = (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    const base = { i, id, text, px, weight: cs.fontWeight, color: cs.color, bar: large ? 3 : 4.5 };
    if (dirty || !bg) {
      if (el.closest('[aria-hidden="true"],.sr-only')) { skipped++; return; }
      pixel.push({ ...base, fg: [fg[0], fg[1], fg[2], alpha] });
    } else style.push({ ...base, fg, bg: bg.slice(0, 3) });
  });
  return { style, pixel, checked: leaves.length, unparsed, skipped };
};

/* ── Browser: per-line client rects (viewport coords) for pending leaves ── */
const RECTS = (ids) =>
  ids.map((i) => {
    const el = document.querySelector(`[data-cx="${i}"]`);
    if (!el) return { i, rects: [] };
    const vis = el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true;
    if (!vis) return { i, rects: [] };
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const rects = [...rg.getClientRects()].map((r) => [r.left, r.top, r.width, r.height]).filter((r) => r[2] > 0 && r[3] > 0);
    return { i, rects };
  });
const HIDE = (on) => { document.getElementById("__cx-hide").media = on ? "all" : "not all"; };
const TWO_FRAMES = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/* ── Node: clip a rect to the frame; null unless ≥ 60 % of it is visible ── */
const clip = ([x, y, w, h], W, H) => {
  const vx0 = Math.max(0, x), vy0 = Math.max(0, y), vx1 = Math.min(W, x + w), vy1 = Math.min(H, y + h);
  if (vx1 <= vx0 || vy1 <= vy0 || ((vx1 - vx0) * (vy1 - vy0)) / (w * h) < 0.6) return null;
  const c = [Math.floor(vx0), Math.floor(vy0), Math.ceil(vx1), Math.ceil(vy1)];
  return c[2] > c[0] && c[3] > c[1] ? c : null;
};
// Push the ratio of the text colour against every 2nd pixel of the clipped rect.
const samplePixels = (data, { width, channels }, fg, [x0, y0, x1, y1], outArr) => {
  const opaque = fg[3] >= 0.999;
  const fgL = opaque ? lum(fg) : 0;
  for (let y = y0; y < y1; y += 2)
    for (let x = x0; x < x1; x += 2) {
      const o = (y * width + x) * channels;
      const px = [data[o], data[o + 1], data[o + 2]];
      outArr.push(ratioL(opaque ? fgL : lum(over(fg, px)), lum(px)));
    }
};

/* ── One route × viewport ───────────────────────────────────────────────── */
async function sweep(page, vp) {
  await page.evaluate(FORCE);
  await page.waitForTimeout(400);
  const meta = await page.evaluate(CLASSIFY);
  const rows = meta.style.map((s) => {
    const r = ratioL(lum(s.fg[3] < 1 ? over(s.fg, s.bg) : s.fg), lum(s.bg));
    return {
      mode: "style", id: s.id, text: s.text, px: s.px, weight: s.weight, color: s.color,
      bg: `rgb(${s.bg.map(Math.round).join(",")})`, ratio: r2(r), bar: s.bar, pass: r >= s.bar,
    };
  });
  const pend = new Map(meta.pixel.map((m) => [m.i, { ...m, done: new Set(), ratios: [], complete: false }]));
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(200, Math.floor(vp.height * 0.75)); // overlap so a line never straddles two windows
  let steps = 0;
  for (let y = 0; y < docH; y += step) {
    const ids = [...pend.values()].filter((m) => !m.complete).map((m) => m.i);
    if (!ids.length) break;
    steps++;
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await page.waitForTimeout(350);
    const found = await page.evaluate(RECTS, ids);
    const work = [];
    for (const f of found) {
      const m = pend.get(f.i);
      f.rects.forEach((rc, k) => {
        if (m.done.has(k)) return;
        const c = clip(rc, vp.width, vp.height);
        if (c) work.push({ m, k, c });
      });
    }
    if (!work.length) continue;
    await page.evaluate(HIDE, true);
    await page.evaluate(TWO_FRAMES);
    const png = await page.screenshot({ fullPage: false });
    await page.evaluate(HIDE, false);
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    for (const w of work) {
      w.m.done.add(w.k);
      samplePixels(data, info, w.m.fg, w.c, w.m.ratios);
    }
    for (const f of found) {
      const m = pend.get(f.i);
      m.complete = f.rects.length > 0 && f.rects.every((_, k) => m.done.has(k));
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const unmeasured = [];
  for (const m of pend.values()) {
    if (!m.ratios.length) { unmeasured.push({ id: m.id, text: m.text, reason: "never in view" }); continue; }
    const s = m.ratios.sort((a, b) => a - b);
    const min = s[0], p10 = s[Math.floor(0.1 * (s.length - 1))];
    rows.push({
      mode: "pixel", id: m.id, text: m.text, px: m.px, weight: m.weight, color: m.color, alpha: r2(m.fg[3]),
      samples: s.length, min: r2(min), p10: r2(p10), bar: m.bar, pass: p10 >= m.bar,
    });
  }
  return { rows, unmeasured, checked: meta.checked, unparsed: meta.unparsed, skipped: meta.skipped, steps };
}

/* ── Drive ──────────────────────────────────────────────────────────────── */
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch();
const all = [];
for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 40000 });
      await page.waitForTimeout(route.includes("map") ? 6000 : 1200);
      const d = await sweep(page, vp);
      all.push({ route, vp: vp.name, ...d });
      const fails = d.rows.filter((r) => !r.pass);
      const nS = fails.filter((r) => r.mode === "style").length, nP = fails.length - nS;
      console.log(
        `${fails.length ? "✗" : "✓"} ${route} @ ${vp.name} — ${fails.length} fails (${nS} style · ${nP} pixel) / ${d.checked} checked / ${d.unmeasured.length} unmeasured · ${d.steps} steps`,
      );
    } catch (e) {
      console.error(`✗ ${route} @ ${vp.name}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();

/* ── Report ─────────────────────────────────────────────────────────────── */
const rows = all.flatMap((e) => e.rows.map((r) => ({ route: e.route, vp: e.vp, ...r })));
const unmeasured = all.flatMap((e) => e.unmeasured.map((u) => ({ route: e.route, vp: e.vp, ...u })));
const fails = rows.filter((r) => !r.pass);
const nStyle = fails.filter((r) => r.mode === "style").length;
const nPixel = fails.length - nStyle;
const uList = [...new Set(unmeasured.map((u) => `${u.route} \`${u.id}\` "${u.text}"`))];
const L = [
  `# Contrast sweep — ${BASE}`,
  "",
  `AA bar: 4.5:1 (3:1 large). Style rows: computed colour over the nearest opaque background. Pixel rows: text hidden, background screenshotted and sampled under each line — ratio shown as **min / p10**; the gate uses p10.`,
  "",
  `**${fails.length} failure(s)** (${nStyle} by style · ${nPixel} by pixel) — ${unmeasured.length} still unmeasured${
    uList.length ? ` (${uList.slice(0, 12).join(" · ")}${uList.length > 12 ? " …" : ""})` : ""
  }`,
  "",
  `| route | vp | mode | element | text | px/wt | fg | bg | ratio | bar |`,
  `|---|---|---|---|---|---|---|---|---|---|`,
];
for (const f of fails)
  L.push(
    f.mode === "style"
      ? `| ${f.route} | ${f.vp} | style | \`${f.id}\` | "${f.text}" | ${f.px}/${f.weight} | ${f.color} | ${f.bg} | **${f.ratio}** | ${f.bar} |`
      : `| ${f.route} | ${f.vp} | pixel | \`${f.id}\` | "${f.text}" | ${f.px}/${f.weight} | ${f.color}${f.alpha < 1 ? ` ×${f.alpha}` : ""} | sampled (${f.samples}) | **${f.min} / ${f.p10}** | ${f.bar} |`,
  );
L.push("", `## Pixel-measured passes (worst cases)`, "", `| route | vp | element | text | p10 | min | bar |`, `|---|---|---|---|---|---|---|`);
for (const p of rows.filter((r) => r.mode === "pixel" && r.pass).sort((a, b) => a.p10 - b.p10).slice(0, 15))
  L.push(`| ${p.route} | ${p.vp} | \`${p.id}\` | "${p.text}" | ${p.p10} | ${p.min} | ${p.bar} |`);
L.push("", `## Unmeasured (${unmeasured.length})`, "");
for (const u of unmeasured) L.push(`- ${u.route} @ ${u.vp}: \`${u.id}\` "${u.text}" — ${u.reason}`);
if (!unmeasured.length) L.push("- none");
writeFileSync(out, L.join("\n"));
writeFileSync(out.replace(/\.md$/, "") + ".json", JSON.stringify({ base: BASE, rows, unmeasured }, null, 1));
console.log(`\ncontrast → ${out} (+ .json)  ${fails.length} failures (${nStyle} style · ${nPixel} pixel), ${unmeasured.length} unmeasured`);
process.exit(fails.length ? 1 : 0);
