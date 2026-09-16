#!/usr/bin/env node
/**
 * v14.2 (Wil, 9/16): the browser-bar colour of every hero painting.
 *
 * iOS Safari never draws page content behind its address bar or toolbar; it
 * extends ONE flat colour it reads at the page's top and bottom edges. Over a
 * painting there is no flat colour to read, so it falls back to black — the
 * dark bars in Wil's screenshots. His decision: continue the artwork. Each
 * hero carries a build-time colour sampled from the top of its own poster, the
 * page hands it to the sampler in `src/layouts/Base.astro` through a
 * `data-edge-top` attribute (contract below), and the sampler paints the fixed
 * strip Safari reads with it.
 *
 * WHAT IS SAMPLED. For every `public/media/<slug>/<key>-poster.jpg` (the
 * full-size poster the AVIF/WebP tiers are cut from — see build-posters.mjs):
 *
 *   rows      the top 6% of the image: `n = max(1, round(0.06 × height))` rows
 *   scrim     the hero's top scrim, `linear-gradient(to bottom,
 *             rgba(29,20,17,.55), transparent 18%)` in [chapter].astro — so at
 *             row y the scrim alpha is  a(y) = .55 × max(0, 1 − y / (.18 × height))
 *   composite each pixel is laid under that scrim, per channel:
 *             out = scrim × a(y) + pixel × (1 − a(y)),  scrim = (29, 20, 17)
 *   average   the per-pixel mean of every composited pixel in those rows,
 *             rounded per channel, in sRGB byte space (the same space the
 *             browser composites the gradient in), written as lowercase #rrggbb
 *
 * The result is the colour a viewer sees where the painting meets the top of
 * the viewport — a dark warm brown or grey for every canvas in the series — and
 * it is what the strip continues upward into Safari's chrome.
 *
 * OUTPUT. `src/data/edge-colors.json`, committed like `route.json`:
 *
 *   { "<slug>": { "<key>": "#rrggbb", … }, … }
 *
 *   <slug>  the `public/media/<slug>` folder (bakery, barbershop,
 *           commissioners-office, ferry, mansion, site)
 *   <key>   the stem before `-poster.jpg` (reveal-vertical, reveal-horizontal,
 *           reveal-horizontal-pt2, historical, narrative1, splash, …)
 *
 * Slugs and keys are sorted, 2-space indent, trailing newline. Deterministic
 * and idempotent: running it twice writes the same bytes. `[chapter].astro`
 * reads `edge[slug][vKey]` / `edge[slug][hKey]` for the chapter hero and the
 * Part-2 scene's `reveal.videoVertical` / `reveal.video` keys for its hero.
 *
 * Usage: node scripts/build-edge-colors.mjs        (from the repo root)
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = "public/media";
const OUT = "src/data/edge-colors.json";
/** Top band of the poster that is averaged, as a fraction of its height. */
const BAND = 0.06;
/** The hero's top scrim: rgba(29,20,17,.55) at the top edge, transparent at 18%. */
const SCRIM = { r: 29, g: 20, b: 17, alpha: 0.55, stop: 0.18 };

const hex = (v) => Math.round(v).toString(16).padStart(2, "0");

/** The composited average of the poster's top band — see the header. */
async function edgeColor(file) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`${file}: no dimensions`);
  const rows = Math.max(1, Math.round(BAND * height));
  const { data, info } = await image
    .extract({ left: 0, top: 0, width, height: rows })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels; // 3 for a JPEG
  let r = 0, g = 0, b = 0;
  for (let y = 0; y < rows; y++) {
    const a = SCRIM.alpha * Math.max(0, 1 - y / (SCRIM.stop * height));
    const keep = 1 - a;
    const row = y * width * ch;
    for (let x = 0; x < width; x++) {
      const i = row + x * ch;
      r += SCRIM.r * a + data[i] * keep;
      g += SCRIM.g * a + data[i + 1] * keep;
      b += SCRIM.b * a + data[i + 2] * keep;
    }
  }
  const n = rows * width;
  return { color: `#${hex(r / n)}${hex(g / n)}${hex(b / n)}`, width, height, rows };
}

const out = {};
let sampled = 0;
for (const slug of readdirSync(ROOT).sort()) {
  const dir = join(ROOT, slug);
  if (!statSync(dir).isDirectory()) continue;
  const posters = readdirSync(dir)
    .filter((f) => f.endsWith("-poster.jpg"))
    .sort();
  if (!posters.length) continue;
  out[slug] = {};
  for (const file of posters) {
    const key = file.replace("-poster.jpg", "");
    const { color, width, height, rows } = await edgeColor(join(dir, file));
    out[slug][key] = color;
    sampled++;
    console.log(`  ${slug}/${key}`.padEnd(46) + `${color}   (${width}×${height}, top ${rows} rows)`);
  }
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`build-edge-colors: ${sampled} poster(s) sampled → ${OUT}`);
