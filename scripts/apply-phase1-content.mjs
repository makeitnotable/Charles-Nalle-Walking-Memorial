/**
 * Phase 1 content migration (run once, kept for the record):
 * - media block → lists of available optimized keys in public/media/<slug>/
 * - scene.reveal → sketch/video keys for the press-and-hold interaction
 * - map.coordinates → Brian's exact plaque pins (resolved 2026-08-02 from his
 *   5/13/26 Google Maps links)
 * - palette → per-chapter palettes derived from the design sprint's emotions
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHAPTERS = fileURLToPath(new URL("../src/content/chapters/", import.meta.url));
const MEDIA = fileURLToPath(new URL("../public/media/", import.meta.url));

const PINS = {
  bakery: [-73.691526, 42.726108],
  "commissioners-office": [-73.6926623, 42.7304335],
  mansion: [-73.6933753, 42.7243182],
  ferry: [-73.698778, 42.719271],
  barbershop: [-73.692893, 42.730818],
};

/** Emotions → palette. Ink stays parchment for cohesion; accents carry mood. */
const PALETTES = {
  bakery: { surface: "#191009", ink: "#f2e7d5", accent: "#c2542b" }, // unjust, suspense, fear — ember on scorched umber
  "commissioners-office": { surface: "#16121c", ink: "#efe6dc", accent: "#b03a45" }, // desperation → righteous anger — crimson on ink-violet
  mansion: { surface: "#1a1410", ink: "#f3ead8", accent: "#c9973a" }, // hope, peace — gilded dusk
  ferry: { surface: "#0e1517", ink: "#e8ecdf", accent: "#4f8f8b" }, // anticipation, liberation — cold river teal
  barbershop: { surface: "#141710", ink: "#f0ead9", accent: "#7d9161" }, // community, motivation — barber-green warmth
};

const REVEALS = {
  bakery: [{ sketch: "sketch", video: "reveal-horizontal", videoVertical: "reveal-vertical", painting: "horizontal" }],
  "commissioners-office": [
    { sketch: "sketch", video: "reveal-horizontal", videoVertical: "reveal-vertical", painting: "horizontal" },
    { sketch: "sketch-pt2", video: "reveal-horizontal-pt2", videoVertical: "reveal-vertical-pt2", painting: "horizontal-pt2" },
  ],
  mansion: [{ sketch: "sketch", video: "reveal-horizontal", videoVertical: "reveal-vertical", painting: "horizontal" }],
  ferry: [{ sketch: "sketch", video: "reveal-horizontal", videoVertical: "reveal-vertical", painting: "horizontal" }],
  barbershop: [{ sketch: "sketch", video: "reveal-horizontal", videoVertical: "reveal-vertical", painting: "horizontal" }],
};

for (const name of readdirSync(CHAPTERS).filter((f) => f.endsWith(".json"))) {
  const slug = name.replace(".json", "");
  const path = join(CHAPTERS, name);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const dir = join(MEDIA, slug);

  const images = [];
  const videos = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      const img = f.match(/^(.+)-1440\.jpg$/);
      if (img) images.push(img[1]);
      const vid = f.match(/^(.+)\.mp4$/);
      if (vid) videos.push(vid[1]);
    }
  }
  data.media = { images: images.sort(), videos: videos.sort() };
  data.map.coordinates = PINS[slug];
  data.palette = PALETTES[slug];
  (data.scenes ?? []).forEach((scene, i) => {
    scene.reveal = REVEALS[slug]?.[i] ?? REVEALS[slug]?.[0] ?? null;
  });

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`${slug}: ${images.length} images, ${videos.length} videos, pin [${PINS[slug]}]`);
}
console.log("DONE");
