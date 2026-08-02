#!/usr/bin/env node
/**
 * Responsive posters for the animated-painting heroes.
 *
 * The chapter hero is an mp4 loop whose FIRST PAINT is its poster — so the
 * poster is the page's LCP element. Only full-size `.jpg` posters existed
 * (125–156KB each), which cost /bakery about 1.3s of LCP on throttled 4G.
 * This emits AVIF + WebP at 800/1440 under NEW names (`<key>-poster-<w>.<ext>`)
 * — GitHub Pages caches aggressively, so reusing a name would serve stale bytes.
 *
 * Usage: node scripts/build-posters.mjs
 */
import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = "public/media";
const WIDTHS = [800, 1440];
let made = 0;

for (const slug of readdirSync(ROOT)) {
  const dir = join(ROOT, slug);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith("-poster.jpg")) continue;
    const key = file.replace("-poster.jpg", "");
    const src = join(dir, file);
    const meta = await sharp(src).metadata();
    for (const w of WIDTHS) {
      if (w > (meta.width ?? 0) && WIDTHS.some((x) => x < w && x <= (meta.width ?? 0))) continue;
      const base = join(dir, `${key}-poster-${w}`);
      if (!existsSync(`${base}.avif`)) {
        await sharp(src).resize({ width: w, withoutEnlargement: true }).avif({ quality: 52 }).toFile(`${base}.avif`);
        made++;
      }
      if (!existsSync(`${base}.webp`)) {
        await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${base}.webp`);
        made++;
      }
    }
  }
}
console.log(`build-posters: ${made} file(s) written`);
