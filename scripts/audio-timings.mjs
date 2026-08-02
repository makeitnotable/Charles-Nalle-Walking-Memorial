/**
 * Generates approximate per-paragraph narration timings: ffprobe reads each
 * scene's audio duration, which is distributed across paragraphs proportional
 * to word count (with a small lead-in). Written into each chapter JSON as
 * `scenes[].audio.timings: [{start, end}]`.
 *
 * These are estimates good enough for follow-along highlighting. When Wil
 * delivers re-recorded audio, re-run this script — or replace a scene's
 * timings with exact values — and the UI needs no changes.
 *
 * Run: node scripts/audio-timings.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHAPTERS = fileURLToPath(new URL("../src/content/chapters/", import.meta.url));
const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
const LEAD_IN = 1.2; // seconds of narrator breath before paragraph one

function duration(file) {
  return parseFloat(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ])
      .toString()
      .trim(),
  );
}

for (const name of readdirSync(CHAPTERS).filter((f) => f.endsWith(".json"))) {
  const path = join(CHAPTERS, name);
  const data = JSON.parse(readFileSync(path, "utf8"));
  let touched = false;

  for (const scene of data.scenes ?? []) {
    if (!scene.audio?.file) continue;
    const total = duration(join(PUBLIC, scene.audio.file));
    const paras = scene.paragraphs.filter((p) => !p.startsWith("@media:"));
    const words = paras.map((p) => p.replaceAll("**", "").split(/\s+/).length);
    const totalWords = words.reduce((a, b) => a + b, 0);
    const usable = total - LEAD_IN;

    let cursor = LEAD_IN;
    const timings = [];
    for (const w of words) {
      const span = (w / totalWords) * usable;
      timings.push({
        start: Math.round(cursor * 10) / 10,
        end: Math.round((cursor + span) * 10) / 10,
      });
      cursor += span;
    }
    scene.audio.timings = timings;
    scene.audio.duration = Math.round(total);
    touched = true;
    console.log(
      `${name} · ${scene.audio.label}: ${total.toFixed(1)}s across ${paras.length} paragraphs`,
    );
  }

  if (touched) writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}
console.log("DONE");
