#!/usr/bin/env node
/**
 * The /map thumbnail tier — 400px.
 *
 * Two sets of thumbnails on that page were being served 800px sources:
 *   · the carousel cards (`square`) render at 128/160/192 CSS px
 *   · the typographic index (`historical`) renders at 80/112 CSS px
 * Together that is ~850 KB of image for ten thumbnails, all of it fetched
 * while the map engine is still loading. This emits the tier that fits — the
 * worst case is 192 CSS px @ DPR2 = 384 device px.
 *
 * Same codec settings as scripts/build-media.mjs (avif q55 / webp q78) so the
 * carousel matches every other image on the site.
 *
 * Usage: node scripts/build-carousel-tier.mjs
 */
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const MEDIA = "public/media";
const WIDTH = 400;
const KEYS = ["square", "historical"];

const dirs = readdirSync(MEDIA, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let made = 0;
for (const slug of dirs) {
  for (const key of KEYS) {
    const src = join(MEDIA, slug, `${key}-1440.jpg`);
    if (!existsSync(src)) continue;
    const dir = join(MEDIA, slug);
    await sharp(src).resize({ width: WIDTH }).avif({ quality: 55 }).toFile(join(dir, `${key}-${WIDTH}.avif`));
    await sharp(src).resize({ width: WIDTH }).webp({ quality: 78 }).toFile(join(dir, `${key}-${WIDTH}.webp`));
    console.log(`  ${slug}/${key}-${WIDTH}.{avif,webp}`);
    made++;
  }
}
console.log(`${made} tier(s) written.`);
