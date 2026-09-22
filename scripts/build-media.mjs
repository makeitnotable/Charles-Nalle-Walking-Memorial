/**
 * One-time media pipeline: pulls source art from the legacy repo + Design
 * folders, emits optimized web assets into public/media/. Outputs are
 * committed — CI never re-processes media (deterministic, fast builds).
 *
 * Run: node scripts/build-media.mjs [--images-only|--videos-only]
 * Requires: sharp (npm), ffmpeg + ffprobe (homebrew).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PROJECT =
  "/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle";
const LEGACY = join(
  PROJECT,
  "Charles Nalle Walking Memorial Website/Charles-Nalle-Walking-Memorial/public",
);
const DESIGN = join(PROJECT, "Design");
const ANIM = join(LEGACY, "CNWM - Animated Images");
const SKETCHES = join(DESIGN, "Images/Final Images");
const OUT = fileURLToPath(new URL("../public/media/", import.meta.url));

const WIDTHS = [800, 1440];

/** slug → sources. Image keys become `media/<slug>/<key>-<w>.<ext>`. */
const MANIFEST = {
  bakery: {
    images: {
      horizontal: `${LEGACY}/holeurs-fashionable-bakery/horizontal.png`,
      vertical: `${LEGACY}/holeurs-fashionable-bakery/vertical.png`,
      square: `${LEGACY}/holeurs-fashionable-bakery/square.png`,
      historical: `${LEGACY}/holeurs-fashionable-bakery/historical.png`,
      moral: `${LEGACY}/holeurs-fashionable-bakery/moral1.png`,
      sketch: `${SKETCHES}/1. Sketch of Holeur’s Fashionable Baker.jpg`,
    },
    videos: {
      "reveal-horizontal": `${ANIM}/1. Bakery/1. Holeurs Fashionable Bakery-1_animation_horizontal.mp4`,
      "reveal-vertical": `${ANIM}/1. Bakery/1. Holeurs Fashionable Bakery_animation_vertical.mp4`,
      historical: `${ANIM}/1. Bakery/1. Holeurs Fashionable Bakery_animation_historical.mp4`,
    },
  },
  "commissioners-office": {
    images: {
      horizontal: `${LEGACY}/office-commissioner-pt1/horizontal.png`,
      vertical: `${LEGACY}/office-commissioner-pt1/vertical.png`,
      square: `${LEGACY}/office-commissioner-pt1/square.png`,
      historical: `${LEGACY}/office-commissioner-pt1/historical.png`,
      moral: `${LEGACY}/office-commissioner-pt1/moral.png`,
      "horizontal-pt2": `${LEGACY}/office-commissioner-pt2/horizontal.png`,
      "vertical-pt2": `${LEGACY}/office-commissioner-pt2/vertical.png`,
      "historical-pt2": `${LEGACY}/office-commissioner-pt2/historical.png`,
      "moral-pt2": `${LEGACY}/office-commissioner-pt2/moral.png`,
      sketch: `${SKETCHES}/2. Sketch of The Commissioner's Office pt1.jpg`,
      "sketch-pt2": `${SKETCHES}/2.2 Sketch of The Commissioner's Office pt2.jpg`,
    },
    videos: {
      "reveal-horizontal": `${ANIM}/2. Bank/2. Commissioner\`s Office pt1_animation_horizontal.mp4`,
      "reveal-vertical": `${ANIM}/2. Bank/2. The Commissioner\`s Office pt1_animation_vertical.mp4`,
      historical: `${ANIM}/2. Bank/2. The Commissioners Office_animation_historical.mp4`,
      "reveal-horizontal-pt2": `${ANIM}/2. Bank/2.2 The Commissioner\`s Office pt2-1_animation_horizontal.mp4`,
      "reveal-vertical-pt2": `${ANIM}/2. Bank/2.2 The Commissioner\`s Office pt2_animation_vertical.mp4`,
      "historical-pt2": `${ANIM}/2. Bank/6. Map of Troy New York_animation -The commissioner's Office pt2-1_animation_historical.mp4`,
    },
  },
  mansion: {
    images: {
      horizontal: `${LEGACY}/uri-gilbert-mansion/horizontal.png`,
      vertical: `${LEGACY}/uri-gilbert-mansion/vertical.png`,
      square: `${LEGACY}/uri-gilbert-mansion/square.png`,
      historical: `${LEGACY}/uri-gilbert-mansion/historical.png`,
      moral: `${LEGACY}/uri-gilbert-mansion/moral.png`,
      sketch: `${SKETCHES}/3. Sketch of Uri Gilberts Mansion.jpg`,
    },
    videos: {
      "reveal-horizontal": `${ANIM}/3. Mansion/3. Uri Gilberts Mansion-1_animation_horizontal.mp4`,
      "reveal-vertical": `${ANIM}/3. Mansion/3. Uri Gilberts Mansion_animation_vertical.mp4`,
      historical: `${ANIM}/3. Mansion/3. Uri Gilbert Mansion_animation_historical.mp4`,
    },
  },
  ferry: {
    images: {
      horizontal: `${LEGACY}/washington-ferry/horizontal.png`,
      vertical: `${LEGACY}/washington-ferry/vertical.png`,
      square: `${LEGACY}/washington-ferry/square.png`,
      historical: `${LEGACY}/washington-ferry/historical.png`,
      moral: `${LEGACY}/washington-ferry/moral.png`,
      narrative1: `${LEGACY}/washington-ferry/narrative1.png`,
      narrative2: `${LEGACY}/washington-ferry/narrative2.png`,
      sketch: `${SKETCHES}/4. Sketch of Washington Street Ferry Landing.jpg`,
    },
    videos: {
      "reveal-horizontal": `${ANIM}/4. Ferry/4. Washington Street Ferry Landing-1_animation_horizontal.mp4`,
      "reveal-vertical": `${ANIM}/4. Ferry/4. Washington Street Ferry Landing_animation_vertical.mp4`,
      historical: `${ANIM}/4. Ferry/4. Washington Street Ferry Landing_animation (1)_historical.mp4`,
      narrative1: `${ANIM}/4. Ferry/4.1 Washington Street Ferry Landing_animation_narrative_1.mp4`,
      narrative2: `${ANIM}/4. Ferry/4.2 Washington Street Ferry Landing_animation_narrative_2.mp4`,
    },
  },
  barbershop: {
    images: {
      horizontal: `${LEGACY}/peter-baltimores-barbershop/horizontal.png`,
      vertical: `${LEGACY}/peter-baltimores-barbershop/vertical.png`,
      square: `${LEGACY}/peter-baltimores-barbershop/square.png`,
      historical: `${LEGACY}/peter-baltimores-barbershop/historical.png`,
      moral: `${LEGACY}/peter-baltimores-barbershop/moral.png`,
      narrative1: `${LEGACY}/peter-baltimores-barbershop/narrative1.png`,
      narrative2: `${LEGACY}/peter-baltimores-barbershop/narrative2.png`,
      sketch: `${SKETCHES}/5. Sketch of Peter Baltimores’s Barbershop-sketch.jpg`,
    },
    videos: {
      "reveal-horizontal": `${ANIM}/5. Barbershop/5. Peter Baltimores Barbershop-1_animation_horizontal.mp4`,
      "reveal-vertical": `${ANIM}/5. Barbershop/5. Peter Baltimores Barbershop_animation_vertical.mp4`,
      historical: `${ANIM}/5. Barbershop/5. Peter Baltimores Barbershop_animation_historical.mp4`,
      narrative1: `${ANIM}/5. Barbershop/5.1 Peter Baltimores Barbershop_animation_narrative_1.mp4`,
      narrative2: `${ANIM}/5. Barbershop/5.2 Peter Baltimores Barbershop_animation_narrative_2.mp4`,
    },
  },
  site: {
    images: {
      "troy-1860": `${DESIGN}/Website/Chapter Images/Stills/6. Map of Troy New York.png`,
      "home-bg": `${LEGACY}/home-bg.png`,
      "home-bg-horizontal": `${LEGACY}/home-bg-horizontal.png`,
      "about-charles": `${LEGACY}/about-page/charles.png`,
      "about-mark": `${LEGACY}/about-page/mark.png`,
      "about-scott": `${LEGACY}/about-page/scott.png`,
      "about-barbershop": `${LEGACY}/about-page/barbershop.png`,
    },
    videos: {
      splash: `${ANIM}/Splash Page Image.mp4`,
    },
  },
};

const mode = process.argv[2];
let missing = 0;

for (const [slug, group] of Object.entries(MANIFEST)) {
  const dir = join(OUT, slug);
  mkdirSync(dir, { recursive: true });

  if (mode !== "--videos-only") {
    for (const [key, src] of Object.entries(group.images ?? {})) {
      if (!existsSync(src)) {
        console.error(`MISSING image ${slug}/${key}: ${src}`);
        missing++;
        continue;
      }
      const img = sharp(src, { limitInputPixels: false }).rotate();
      const meta = await img.metadata();
      for (const w of WIDTHS) {
        if (w > meta.width && WIDTHS.some((x) => x < w && x <= meta.width))
          continue; // don't upscale when a smaller width already covers it
      }
      for (const w of WIDTHS) {
        const width = Math.min(w, meta.width);
        await img
          .clone()
          .resize({ width })
          .avif({ quality: 55 })
          .toFile(join(dir, `${key}-${w}.avif`));
        await img
          .clone()
          .resize({ width })
          .webp({ quality: 78 })
          .toFile(join(dir, `${key}-${w}.webp`));
      }
      await img
        .clone()
        .resize({ width: Math.min(1440, meta.width) })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(join(dir, `${key}-1440.jpg`));
      console.log(`img  ${slug}/${key} (${meta.width}×${meta.height})`);
    }
  }

  if (mode !== "--images-only") {
    for (const [key, src] of Object.entries(group.videos ?? {})) {
      if (!existsSync(src)) {
        console.error(`MISSING video ${slug}/${key}: ${src}`);
        missing++;
        continue;
      }
      const out = join(dir, `${key}.mp4`);
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-i", src,
        "-vf", "scale='min(1280,iw)':-2",
        "-c:v", "libx264", "-crf", "26", "-preset", "slow",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-an",
        out,
      ]);
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error",
        "-i", out, "-frames:v", "1", "-q:v", "4",
        join(dir, `${key}-poster.jpg`),
      ]);
      console.log(`vid  ${slug}/${key}`);
    }
  }
}

console.log(missing ? `DONE with ${missing} missing sources` : "DONE — all sources found");
process.exit(missing ? 1 : 0);
