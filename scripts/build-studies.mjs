/**
 * v12 — the artist's studies, rebuilt from repo-local masters.
 *
 * `build-media.mjs` reads sources from Wil's own machine, so it cannot run in
 * CI or in a fresh clone. The v12 study canon (docs/v12/BRIEF.md §2, Wil's
 * 8/26 chapter → painting → drawing map) is therefore built by this script,
 * whose sources all live in `masters/` and are committed.
 *
 * Encoder settings are build-media's, exactly: avif q55, webp q78, jpeg q80
 * mozjpeg, widths 800 + 1440, and NEVER an upscale — a 1200px source emits a
 * 1200px file at the `-1440` name, and the pages read the real width at build
 * so the srcset descriptor stays honest.
 *
 * Run: node scripts/build-studies.mjs
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = join(ROOT, "public/media");
const WIL = join(ROOT, "masters/Nalle Drawings");
const PLATES = join(ROOT, "masters/Priest Series Page");

/* The three series-page plates carry the artist's burned-in caption as a black
   bar top and bottom. Two thresholds failed before this one, both measured:
   a row MEAN stops at the first line of white caption type (it left "Nalle on
   the Hudson" in frame), and a >90%-near-black test misses the same rows,
   because a caption line is ~13% bright pixels and so only ~86% dark. Profiled
   8/26: bar rows run 0.82-1.00 near-black even with type on them, artwork rows
   about 0.27. So the test is >0.70, with the trim capped at a fifth of the
   plate in case a future source has none. Inset 6px so no bar edge survives. */
const trimBars = async (src) => {
  const img = sharp(src, { limitInputPixels: false });
  const { data, info } = await img.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isBar = (y) => {
    let dark = 0;
    for (let x = 0; x < w; x++) if (data[y * w + x] < 32) dark++;
    return dark / w > 0.7;
  };
  const CAP = Math.floor(h * 0.2);
  let top = 0; while (top < CAP && isBar(top)) top++;
  let bot = h - 1; while (bot > h - 1 - CAP && isBar(bot)) bot--;
  const INSET = 6;
  const y = Math.min(top + INSET, h - 1);
  const height = Math.max(1, bot - INSET - y + 1);
  return img.extract({ left: 0, top: y, width: w, height });
};

/** media key → source. `plate: true` means strip the burned-in caption bars. */
const STUDIES = {
  /* 2 · Commissioner's Office → "1st and State Street Skirmish".
     Wil's own file, at his explicit direction (BRIEF §2) — it has been through
     an upscaler and reads softer than its neighbours; ship it as given, no
     sharpening. Replaces the drawing that was hanging here, which is #10. */
  "commissioners-office/sketch": { src: join(WIL, "2. Sketch of 1st and State Street Skirmish.jpg") },

  /* 5 · Ferry Landing → "Don't Let Them Have Him!". Wil's file: the drawing
     that was serving this key is a different one, and his map names this. */
  "ferry/sketch": { src: join(WIL, "5. Sketch of Don't Let Them Have Him!.jpg") },

  /* 6 · Ferry Narrative I → "Nalle on The Hudson". The series-page plate is
     the same drawing as Wil's #6 (dHash distance 0) at 2.6x his pixels. */
  "ferry/sketch-n1": { src: join(PLATES, "Nalle Crossing the Hudson (pen, 2007).jpg"), plate: true },

  /* 7 · Ferry Narrative II → "Escape to West Troy" (dHash 6 vs Wil's #7). */
  "ferry/sketch-n2": { src: join(PLATES, "Escape to West Troy (pen, 2007).jpg"), plate: true },

  /* 9 · Barbershop 1 → "Rushing the Room". The plate's FILE NAME is the series
     page's mis-caption; the artist's own burned-in label reads "Rushing the
     Room" and Wil's map agrees. Same drawing as his #9, uncropped. */
  "barbershop/sketch-n1": { src: join(PLATES, "Martin Struck by Deputy Sheriff Morrison (pen, 2008).jpg"), plate: true },

  /* 10 · Barbershop 2 → "Martin Felled by Axe". This is the drawing that hung
     on `commissioners-office/sketch` until this round (confirmed by eye + dHash
     11 against Wil's #10) — but it is built from Wil's own master, never from
     that tier: this script REPLACES `commissioners-office/sketch` above, so
     reading it here would silently hand the barbershop the wrong drawing.
     Hall-only key, served at 800w, so his 1200px crop costs nothing. */
  "barbershop/sketch-n2": { src: join(WIL, "10. Sketch of Martin Felled by Axe.jpg") },
};

const WIDTHS = [800, 1440];
let n = 0;
for (const [key, spec] of Object.entries(STUDIES)) {
  const [slug, name] = key.split("/");
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });
  const img = spec.plate ? await trimBars(spec.src) : sharp(spec.src, { limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  const srcW = spec.plate ? (await img.clone().toBuffer({ resolveWithObject: true })).info.width : meta.width;
  for (const w of WIDTHS) {
    const width = Math.min(w, srcW);
    await img.clone().resize({ width }).avif({ quality: 55 }).toFile(join(dir, `${name}-${w}.avif`));
    await img.clone().resize({ width }).webp({ quality: 78 }).toFile(join(dir, `${name}-${w}.webp`));
  }
  await img.clone().resize({ width: Math.min(1440, srcW) }).jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(dir, `${name}-1440.jpg`));
  const out = await sharp(join(dir, `${name}-1440.jpg`)).metadata();
  console.log(`study ${key.padEnd(28)} src ${srcW}px -> 1440 tier ${out.width}x${out.height}`);
  n++;
}
console.log(`${n} studies built`);
