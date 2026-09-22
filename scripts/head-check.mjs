#!/usr/bin/env node
/**
 * v13 V13-06 — lock the head so it cannot regress (Wil's stated intent).
 *
 * The audit at HEAD found his six "black bars are the viewport meta" claims
 * false on every count: every built route already carries exactly one
 * identical viewport meta with `viewport-fit=cover`, and the five
 * mobile-web-app metas are byte-identical across every document (`/map`
 * included). `Base.astro`'s only `<slot />` is inside `<main>`, so no page or
 * component can inject a second head tag — the consolidation he asked for is
 * already the architecture. This script asserts that stays true.
 *
 * Fails the build if any dist/*.html:
 *   - does not have EXACTLY ONE <meta name="viewport"> tag
 *   - has a viewport content string that isn't `viewport-fit=cover`, or that
 *     differs from any other document's
 *   - is missing any of the five mobile-web-app-capable metas, or has one
 *     whose content differs from any other document's
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));

const files = readdirSync(DIST)
  .filter((f) => f.endsWith(".html"))
  .map((f) => join(DIST, f));

if (files.length === 0) {
  console.error("head-check: no HTML files found in dist/ — build is broken");
  process.exit(1);
}

// The five metas that must be byte-identical across every document, plus the
// viewport meta (checked separately for its own "exactly one" rule).
const MOBILE_WEB_APP = [
  "theme-color",
  "mobile-web-app-capable",
  "apple-mobile-web-app-capable",
  "apple-mobile-web-app-status-bar-style",
  "apple-mobile-web-app-title",
];

const errors = [];
const viewportContents = new Set();
const mobileWebAppByName = Object.fromEntries(MOBILE_WEB_APP.map((n) => [n, new Set()]));

for (const file of files) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");

  const viewportTags = html.match(/<meta\s+name="viewport"[^>]*>/g) || [];
  if (viewportTags.length !== 1) {
    errors.push(`${rel}: ${viewportTags.length} viewport meta(s) (expected exactly 1)`);
  } else {
    const content = (viewportTags[0].match(/content="([^"]*)"/) || [])[1] || "";
    if (!/viewport-fit=cover/.test(content)) {
      errors.push(`${rel}: viewport meta missing viewport-fit=cover (got "${content}")`);
    }
    viewportContents.add(content);
  }

  for (const name of MOBILE_WEB_APP) {
    const tags = html.match(new RegExp(`<meta\\s+name="${name}"[^>]*>`, "g")) || [];
    if (tags.length !== 1) {
      errors.push(`${rel}: ${tags.length} "${name}" meta(s) (expected exactly 1)`);
      continue;
    }
    const content = (tags[0].match(/content="([^"]*)"/) || [])[1] || "";
    mobileWebAppByName[name].add(content);
  }
}

if (viewportContents.size > 1) {
  errors.push(`viewport meta content is not identical across documents: ${[...viewportContents].map((c) => `"${c}"`).join(", ")}`);
}
for (const name of MOBILE_WEB_APP) {
  const set = mobileWebAppByName[name];
  if (set.size > 1) {
    errors.push(`"${name}" meta content is not identical across documents: ${[...set].map((c) => `"${c}"`).join(", ")}`);
  }
}

if (errors.length) {
  console.error(`head-check: ${errors.length} problem(s) across ${files.length} document(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `head-check: ${files.length} document(s), 1 identical viewport meta (viewport-fit=cover) + 5 identical mobile-web-app metas ✓`,
);
