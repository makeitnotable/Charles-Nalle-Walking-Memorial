#!/usr/bin/env node
/**
 * v11 item 12 (Wil, 8/22): "The final images have been uploaded to GitHub…
 * Review and use the images where they are needed, remove anything we no longer
 * need, and update accordingly with the final images." Plus, asked how far to
 * take it: "Only replace / update what we have discussed replacing."
 *
 * `build-media.mjs` still points at Wil's Mac (`/Users/thebayniac/…`), so it has
 * never been runnable anywhere else. The masters are in the repo now, so this
 * refreshes site assets FROM `masters/` — with one rule that keeps it honest:
 *
 *   a key is refreshed only when the master's aspect matches what the site is
 *   already serving (within 1%) and the master is larger.
 *
 * That is the difference between a resolution upgrade and a re-crop. Every
 * delivered painting is 2400×1600 or 1600×2400 (3:2 / 2:3) while the site
 * serves 16:9 and 9:16 — an earlier, deliberate art-direction pass cropped the
 * artwork to screen aspects. Re-deriving those would silently re-frame every
 * painting on the site, which is a decision for Wil, not for this script; they
 * are reported as SKIPPED with both aspects so he can see the list.
 *
 * Output recipe is build-media.mjs's, exactly: avif q55 + webp q78 at 800 and
 * 1440, plus a mozjpeg q80 at 1440. Outputs are committed; CI never processes
 * media.
 *
 * Run: node scripts/refresh-from-masters.mjs [--apply]   (default is a dry run)
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MASTERS = join(ROOT, "masters/Stills");
const OUT = join(ROOT, "public/media");
const WIDTHS = [800, 1440];
const APPLY = process.argv.includes("--apply");

/** slug → key → master file, measured rather than inferred: the delivered
 *  names do not follow one rule (chapter 2's LANDSCAPE pt1 is the file without
 *  "The" in it, and 5.2 is a portrait where 4.1/4.2/5.1 are landscape). */
const MAP = {
  bakery: {
    horizontal: "Paintings/1. Holeurs Fashionable Bakery-1.png",
    vertical: "Paintings/1. Holeurs Fashionable Bakery.png",
    historical: "Historical/1. Holeur’s Fashionable Bakery.png",
  },
  "commissioners-office": {
    horizontal: "Paintings/2. Commissioner's Office pt1.png",
    vertical: "Paintings/2. The Commissioner's Office pt1.png",
    "horizontal-pt2": "Paintings/2.2 The Commissioner's Office pt2-1.png",
    "vertical-pt2": "Paintings/2.2 The Commissioner's Office pt2.png",
    historical: "Historical/2. The Commissioners Office.png",
    "troy-1858": "Historical/6. 1858 Map of Troy New York.jp2",
  },
  mansion: {
    horizontal: "Paintings/3. Uri Gilberts Mansion-1.png",
    vertical: "Paintings/3. Uri Gilberts Mansion.png",
    historical: "Historical/3. Uri Gilbert Mansion.png",
  },
  ferry: {
    horizontal: "Paintings/4. Washington Street Ferry Landing-1.png",
    vertical: "Paintings/4. Washington Street Ferry Landing.png",
    narrative1: "Paintings/4.1 Washington Street Ferry Landing.png",
    narrative2: "Paintings/4.2 Washington Street Ferry Landing.png",
    historical: "Historical/4. Washington Street Ferry Landing.png",
  },
  barbershop: {
    horizontal: "Paintings/5. Peter Baltimores’s Barbershop-1.png",
    vertical: "Paintings/5. Peter Baltimores’s Barbershop.png",
    narrative1: "Paintings/5.1 Peter Baltimores’s Barbershop.png",
    narrative2: "Paintings/5.2 Peter Baltimores’s Barbershop.png",
    historical: "Historical/5. Peter Baltimores Barbershop.png",
  },
};

const dim = async (p) => {
  try {
    const m = await sharp(p, { limitInputPixels: false }).metadata();
    if (!m.width || !m.height) return null;
    return { w: m.width, h: m.height, a: m.width / m.height };
  } catch {
    return null; // e.g. the 1858 JP2: this sharp build has no JPEG 2000 codec
  }
};

let refreshed = 0,
  skipped = 0,
  missing = 0;
const skips = [];

for (const [slug, keys] of Object.entries(MAP)) {
  for (const [key, rel] of Object.entries(keys)) {
    const src = join(MASTERS, rel);
    if (!existsSync(src)) {
      console.error(`MISSING master  ${slug}/${key}  ${rel}`);
      missing++;
      continue;
    }
    const current = join(OUT, slug, `${key}-1440.jpg`);
    if (!existsSync(current)) {
      skips.push(`${slug}/${key} — no current 1440 to compare against`);
      skipped++;
      continue;
    }
    const [m, c] = [await dim(src), await dim(current)];
    if (!m) {
      skips.push(`${slug}/${key} — master unreadable here (${rel.split("/").pop()}); needs a codec this build lacks`);
      skipped++;
      continue;
    }
    if (!c) {
      skips.push(`${slug}/${key} — current asset unreadable`);
      skipped++;
      continue;
    }
    const sameAspect = Math.abs(m.a - c.a) / c.a <= 0.01;
    /* "bigger" means the OUTPUT would gain pixels, not that the master has
       more — a 2400×1600 master still yields the same 1440×960 tier that is
       already on disk, and rewriting it would only churn the repo. */
    const outW = Math.min(1440, m.w);
    const outH = Math.round(outW / m.a);
    const bigger = outW > c.w || outH > c.h;

    if (!sameAspect) {
      skips.push(
        `${slug}/${key} — FRAMING differs: master ${m.w}×${m.h} (a=${m.a.toFixed(3)}) vs site ${c.w}×${c.h} (a=${c.a.toFixed(3)})`,
      );
      skipped++;
      continue;
    }
    if (!bigger) {
      skipped++;
      continue;
    }

    console.log(
      `refresh ${slug}/${key}  ${c.w}×${c.h} → ${outW}×${outH}  (a=${m.a.toFixed(3)}, unchanged)`,
    );
    refreshed++;
    if (!APPLY) continue;

    const img = sharp(src, { limitInputPixels: false }).rotate();
    const dir = join(OUT, slug);
    for (const w of WIDTHS) {
      const width = Math.min(w, m.w);
      await img.clone().resize({ width }).avif({ quality: 55 }).toFile(join(dir, `${key}-${w}.avif`));
      await img.clone().resize({ width }).webp({ quality: 78 }).toFile(join(dir, `${key}-${w}.webp`));
    }
    await img
      .clone()
      .resize({ width: Math.min(1440, m.w) })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(join(dir, `${key}-1440.jpg`));
  }
}

if (skips.length) {
  console.log(`\nSKIPPED — not a like-for-like upgrade (${skips.length}):`);
  for (const s of skips) console.log(`  ${s}`);
}
console.log(
  `\n${APPLY ? "APPLIED" : "DRY RUN"} — ${refreshed} refreshed, ${skipped} skipped, ${missing} missing masters`,
);
process.exit(missing ? 1 : 0);
