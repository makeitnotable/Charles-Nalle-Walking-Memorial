#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
 * build-1858-tier.mjs — one zoom tier of the 1858 Troy plate, from the master
 *
 * v13 V13-07a (Wil, 8/26): "on mobile and tablet the 1858 map is super blurry
 * when you zoom in to explore it. Fix this, should be crystal clear at max
 * zoom." The <picture> split on `min-width: 768px` alone with no DPR term, so
 * a DPR-3 phone exhausted its 1:1 pixels at scale 3.9 of a ceiling of 6, and a
 * DPR-2 tablet at 4.07 — a 1.5× upscale at the ceiling on both. This builds
 * the tier that closes the tablet half of that arithmetic.
 *
 * THE MASTER IS THE ONLY SOURCE. RUN-STATE's build-order trap: "a build script
 * that both writes and reads the same media key will hand the second consumer
 * the first one's output — source every output from a master, never from a
 * sibling output." So this decodes the JP2 every time and never opens a
 * sibling tier, even though reading the 6144 would be far faster.
 *
 * QUALITY IS CALIBRATED, NOT CHOSEN. The shipped 6144 tier is 1.95 MB; at
 * 6144 this encoder reproduces that at q≈52 (q50 → 1.82 MB, q55 → 2.17 MB).
 * So q52 is this plate's house register and every tier is cut at it — a
 * higher number does not make the plate sharper, it only makes it heavier
 * than its own siblings. At 8192 that lands 3.25 MB against 4.69 MB at q62.
 *
 * AVIF ONLY above the 6144 tier. The 8192 WebP measured 8.31 MB — heavier
 * than every other asset on the site put together — for browsers that have
 * not existed since Safari 16.4 (2023). Above 6144, non-AVIF browsers fall
 * back to the 6144 WebP, which is exactly what they are served today, so the
 * fallback path is a no-op rather than a regression. REVERT: pass --webp.
 *
 * Usage:  node scripts/build-1858-tier.mjs [targetWidth] [--webp]
 * ════════════════════════════════════════════════════════════════════════ */

import sharp from "sharp";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

/* Scratch goes OUTSIDE the repo: the decode is ~157 MB and must never be a
   candidate for `git add`. Honour a caller-supplied dir, else the OS temp. */
const SCRATCH = process.env.SCRATCHPAD || path.join(os.tmpdir(), "cnwm-1858");

const JP2_MASTER = path.join(REPO, "masters/Stills/Historical/6. 1858 Map of Troy New York.jp2");
const OUT_DIR = path.join(REPO, "public/media/site");

/* height/width of the plate, from TroyMap.tsx's PLATE constant. The master is
   23000×19267 and the shipped tiers are 4096×3431 / 6144×5147 — all three
   agree on this ratio, so no crop is involved, only a resize. */
const PLATE_ASPECT = 3431 / 4096;

/* `opj_decompress -r N` halves N times. -r 1 gives 11500×9634, which is still
   above every tier we cut and decodes in a fraction of the time of -r 0. */
const DECODE_REDUCTION = 1;

/* Calibrated above. effort 6 was measured and REJECTED: it produced 4.88 MB
   against effort 4's 4.69 MB at the same quality, so it costs ~15 minutes of
   wall clock to make the file bigger. */
const AVIF = { quality: 52, effort: 4, chromaSubsampling: "4:4:4" };
const WEBP = { quality: 86, effort: 4 };

const args = process.argv.slice(2);
const wantWebp = args.includes("--webp");
const targetWidth = Number.parseInt(args.find((a) => /^\d+$/.test(a)) ?? "8192", 10);
const targetHeight = Math.round(targetWidth * PLATE_ASPECT);

const decodedPath = path.join(SCRATCH, `1858-decode-r${DECODE_REDUCTION}.png`);
const avifPath = path.join(OUT_DIR, `troy-1858-full-${targetWidth}.avif`);
const webpPath = path.join(OUT_DIR, `troy-1858-full-${targetWidth}.webp`);

const mb = (b) => (b / 1024 / 1024).toFixed(2) + " MB";

if (!fs.existsSync(JP2_MASTER)) {
  console.error(`build-1858-tier: master not found — ${JP2_MASTER}`);
  process.exit(1);
}
fs.mkdirSync(SCRATCH, { recursive: true });

/* The decode is deterministic, so a warm one is reused. It is the slowest
   step by far and rebuilding two tiers in a row should not pay it twice. */
if (!fs.existsSync(decodedPath)) {
  console.log(`build-1858-tier: decoding the master at -r ${DECODE_REDUCTION} …`);
  execSync(`opj_decompress -r ${DECODE_REDUCTION} -i "${JP2_MASTER}" -o "${decodedPath}"`, {
    stdio: ["ignore", "ignore", "inherit"],
  });
} else {
  console.log(`build-1858-tier: reusing the warm decode at ${decodedPath}`);
}

const src = await sharp(decodedPath, { limitInputPixels: false }).metadata();
if (src.width < targetWidth) {
  console.error(
    `build-1858-tier: decode is ${src.width}px wide — cannot cut a ${targetWidth}px tier ` +
      `without upscaling. Lower DECODE_REDUCTION and retry.`,
  );
  process.exit(1);
}
console.log(`build-1858-tier: decode ${src.width}×${src.height} → tier ${targetWidth}×${targetHeight}`);

const plate = () =>
  sharp(decodedPath, { limitInputPixels: false }).resize(targetWidth, targetHeight, {
    kernel: "lanczos3",
    fit: "fill",
  });

await plate().avif(AVIF).toFile(avifPath);
console.log(`build-1858-tier: ✓ ${path.basename(avifPath)}  ${mb(fs.statSync(avifPath).size)}  q${AVIF.quality}`);

if (wantWebp) {
  await plate().webp(WEBP).toFile(webpPath);
  console.log(`build-1858-tier: ✓ ${path.basename(webpPath)}  ${mb(fs.statSync(webpPath).size)}  q${WEBP.quality}`);
} else {
  console.log(`build-1858-tier: — WebP skipped (AVIF-only above 6144; pass --webp to cut one)`);
}

/* The decode stays: it is outside the repo, and the next tier build reuses
   it. Delete SCRATCH by hand when the session is done with it. */
console.log(`build-1858-tier: done. Warm decode kept at ${decodedPath}`);
