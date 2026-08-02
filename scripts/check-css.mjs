#!/usr/bin/env node
/**
 * Post-build guard against the island-CSS bug class: if Tailwind ever stops
 * scanning the React islands again, layout-critical rules vanish silently and
 * the map/reveal render 0-height. This fails the build instead.
 *
 * Checks the concatenated dist CSS for (a) island-only utilities and (b) the
 * plain-CSS structural fallbacks.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));

function findCss(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) findCss(p, out);
    else if (name.endsWith(".css")) out.push(p);
  }
  return out;
}

const cssFiles = findCss(DIST);
if (cssFiles.length === 0) {
  console.error("check-css: no CSS files found in dist/ — build is broken");
  process.exit(1);
}
const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");

// Each entry: [human label, regex the dist CSS must match]
const REQUIRED = [
  // Island-only utilities (proof Tailwind scanned the .tsx files)
  ["h-[100dvh] utility", /\.h-\\\[100dvh\\\]/],
  ["aspect-[3/2] utility", /aspect-ratio:\s*3\s*\/\s*2/],
  ["portrait: variant", /orientation:\s*portrait/],
  // Plain-CSS structural fallbacks (belt and braces)
  [".map-shell structural class", /\.map-shell\s*\{/],
  [".map-canvas structural class (beats mapbox-gl.css cascade)", /\.map-shell\s+\.map-canvas/],
  [".reveal-frame structural class", /\.reveal-frame\s*\{/],
];

const missing = REQUIRED.filter(([, re]) => !re.test(css));
if (missing.length) {
  console.error(
    `check-css: ${missing.length} required rule(s) missing from dist CSS (${cssFiles
      .map((f) => f.slice(DIST.length + 1))
      .join(", ")}):`,
  );
  for (const [label] of missing) console.error(`  ✗ ${label}`);
  console.error(
    "\nThe island-CSS bug is back: Tailwind is not scanning the React islands," +
      "\nor the structural classes were removed from global.css. See docs/PLAN.md Phase 0.",
  );
  process.exit(1);
}
console.log(`check-css: all ${REQUIRED.length} island-CSS guards present ✓`);
