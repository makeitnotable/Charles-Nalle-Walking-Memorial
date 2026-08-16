#!/usr/bin/env node
/**
 * The mark (v7 I1/I2): an interlocked "CN" monogram set in Libre Caslon
 * Display — the CHARLES/NALLE wordmark reduced to its two initials — converted
 * to PATHS (no font dependency) on the site's dark ground, then rastered into
 * the full icon set. Three compositions are rendered as candidates
 * (`public/favicon-candidates/`), previewed on /styleguide for the juror; the
 * shipped mark is `--pick a|b|c` (default a).
 *
 *   node scripts/build-favicon.mjs [--pick a|b|c]
 *
 * Outputs (committed): public/favicon.svg, favicon-16.png, favicon-32.png,
 * favicon-48.png, apple-touch-icon.png (180, opaque, larger safe area),
 * icon-192.png, icon-512.png, favicon.ico (16+32+48, real ICO),
 * site.webmanifest (RELATIVE urls, so the GH Pages base path just works),
 * plus public/favicon-candidates/{a,b,c}-{16,32,180}.png + .svg.
 *
 * Small sizes: Caslon Display's hairlines vanish at 16px, so the 16/32 rasters
 * are drawn from a variant whose paths carry a same-colour stroke (1.3 / 0.5
 * grid units) — the letters keep their weight without changing their shape.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const args = process.argv.slice(2);
const pick = (() => {
  const i = args.indexOf("--pick");
  return i !== -1 && args[i + 1] ? args[i + 1] : "a";
})();

const FONT = "node_modules/@fontsource/libre-caslon-display/files/libre-caslon-display-latin-400-normal.woff";
const font = opentype.parse(readFileSync(FONT).buffer.slice(0));

// Tokens (global.css) — the mark is on-system by construction.
const GROUND = "#1d1411"; // --color-primary-2
const HAIR = "#69311d"; // --color-primary-6
const CREAM = "#f6f3ee"; // --color-neutral-12
const ORANGE = "#f26835"; // --color-primary-9

const G = 128; // grid

/** Path data + bbox for one glyph at a cap size, baseline at y. */
function glyph(ch, x, y, size) {
  const p = font.getPath(ch, x, y, size);
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb, w: bb.x2 - bb.x1, h: bb.y2 - bb.y1 };
}
/** Caslon's cap height ≈ 0.68 em; size the em so the cap height is `cap`. */
const emFor = (cap) => cap / 0.68;

/**
 * Compositions. Each returns [{ ch, d, fill }] in paint order (C under N).
 *  a · INTERLOCK — equal caps; the N's left stem sits inside the C's aperture,
 *      both letters whole. The C's terminals hold the N like a bracket.
 *  b · CAMEO — a large C carries a smaller N nested low in its aperture.
 *  c · STEP — C high-left, N low-right, overlapping by a third (the wordmark's
 *      own stagger, CHARLES over NALLE, in two letters).
 */
function compose(kind) {
  if (kind === "a") {
    const cap = 62;
    const C = glyph("C", 0, 0, emFor(cap));
    const N = glyph("N", 0, 0, emFor(cap));
    // C's aperture opens right; place N so its stem is ~38% into the C's width
    const overlap = C.w * 0.40;
    const total = C.w + N.w - overlap;
    const x0 = (G - total) / 2 - C.bb.x1;
    const yb = (G + cap) / 2; // baseline centred on cap height
    const c = glyph("C", x0, yb, emFor(cap));
    const n = glyph("N", x0 + C.w - overlap, yb, emFor(cap));
    return [
      { ch: "C", d: c.d, fill: CREAM },
      { ch: "N", d: n.d, fill: ORANGE },
    ];
  }
  if (kind === "b") {
    const capC = 78, capN = 44;
    const C0 = glyph("C", 0, 0, emFor(capC));
    const N0 = glyph("N", 0, 0, emFor(capN));
    const x0 = (G - C0.w) / 2 - C0.bb.x1 - 4;
    const yb = (G + capC) / 2;
    const c = glyph("C", x0, yb, emFor(capC));
    // nest the N in the lower right of the aperture, slightly proud of the C
    const nx = c.bb.x1 + C0.w * 0.46;
    const n = glyph("N", nx, yb - 2, emFor(capN));
    return [
      { ch: "C", d: c.d, fill: CREAM },
      { ch: "N", d: n.d, fill: ORANGE },
    ];
  }
  // c · step
  const cap = 56;
  const C0 = glyph("C", 0, 0, emFor(cap));
  const N0 = glyph("N", 0, 0, emFor(cap));
  const overlap = C0.w * 0.34;
  const total = C0.w + N0.w - overlap;
  const x0 = (G - total) / 2 - C0.bb.x1;
  const rise = 12; // C sits higher, N lower
  const yC = (G + cap) / 2 - rise;
  const yN = (G + cap) / 2 + rise;
  const c = glyph("C", x0, yC, emFor(cap));
  const n = glyph("N", x0 + C0.w - overlap, yN, emFor(cap));
  return [
    { ch: "C", d: c.d, fill: CREAM },
    { ch: "N", d: n.d, fill: ORANGE },
  ];
}

/** SVG document. `stroke` thickens hairlines for tiny rasters; `apple` = no
 *  rounding (iOS masks) and a slightly larger safe area. */
function svg(kind, { stroke = 0, apple = false } = {}) {
  const parts = compose(kind);
  const inset = apple ? 6 : 0; // shrink the mark a touch for the home screen
  const scale = (G - inset * 2) / G;
  const rect = apple
    ? `<rect width="${G}" height="${G}" fill="${GROUND}"/>`
    : `<rect x="2" y="2" width="${G - 4}" height="${G - 4}" rx="26" fill="${GROUND}" stroke="${HAIR}" stroke-width="3"/>`;
  const paths = parts
    .map(
      (p) =>
        `<path d="${p.d}" fill="${p.fill}"${stroke ? ` stroke="${p.fill}" stroke-width="${stroke}" stroke-linejoin="round" paint-order="stroke"` : ""}/>`,
    )
    .join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" width="${G}" height="${G}">
  <!-- Charles Nalle Walking Memorial — the CN mark. Libre Caslon Display outlines (paths, no font). -->
  ${rect}
  <g transform="translate(${inset} ${inset}) scale(${scale})">
    ${paths}
  </g>
</svg>
`;
}

const png = (svgText, size) =>
  sharp(Buffer.from(svgText), { density: Math.max(72, (72 * size) / G) })
    .resize(size, size)
    .png()
    .toBuffer();

mkdirSync("public/favicon-candidates", { recursive: true });

// Candidates for /styleguide + the juror
for (const k of ["a", "b", "c"]) {
  writeFileSync(`public/favicon-candidates/${k}.svg`, svg(k));
  writeFileSync(`public/favicon-candidates/${k}-16.png`, await png(svg(k, { stroke: 1.3 }), 16));
  writeFileSync(`public/favicon-candidates/${k}-32.png`, await png(svg(k, { stroke: 0.5 }), 32));
  writeFileSync(`public/favicon-candidates/${k}-180.png`, await png(svg(k), 180));
}

// The shipped set
writeFileSync("public/favicon.svg", svg(pick));
const p16 = await png(svg(pick, { stroke: 1.3 }), 16);
const p32 = await png(svg(pick, { stroke: 0.5 }), 32);
const p48 = await png(svg(pick, { stroke: 0.3 }), 48);
writeFileSync("public/favicon-16.png", p16);
writeFileSync("public/favicon-32.png", p32);
writeFileSync("public/favicon-48.png", p48);
writeFileSync("public/apple-touch-icon.png", await png(svg(pick, { apple: true }), 180));
writeFileSync("public/icon-192.png", await png(svg(pick), 192));
writeFileSync("public/icon-512.png", await png(svg(pick), 512));
writeFileSync("public/favicon.ico", await pngToIco([p16, p32, p48]));

// Manifest — RELATIVE URLs resolve against the manifest's own location, so the
// same file is correct at "/" locally and under /Charles-Nalle-Walking-Memorial/
// on GitHub Pages (I2). start_url "./" = the base.
writeFileSync(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Charles Nalle Walking Memorial",
      short_name: "Charles Nalle",
      description: "One day, five spots: April 27, 1860, Troy, New York.",
      start_url: "./",
      scope: "./",
      display: "standalone",
      background_color: GROUND,
      theme_color: GROUND,
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "favicon.svg", sizes: "any", type: "image/svg+xml" },
      ],
    },
    null,
    2,
  ) + "\n",
);

// A contact sheet for eyeballing: candidates × 16 (8× nearest) / 32 (4×) / 180
const tiles = [];
for (const k of ["a", "b", "c"]) {
  const s16 = await sharp(readFileSync(`public/favicon-candidates/${k}-16.png`)).resize(128, 128, { kernel: "nearest" }).toBuffer();
  const s32 = await sharp(readFileSync(`public/favicon-candidates/${k}-32.png`)).resize(128, 128, { kernel: "nearest" }).toBuffer();
  const s180 = await sharp(readFileSync(`public/favicon-candidates/${k}-180.png`)).resize(180, 180).toBuffer();
  tiles.push({ k, s16, s32, s180 });
}
const sheet = sharp({ create: { width: 3 * 200 + 40, height: 3 * 200 + 40, channels: 3, background: "#f6f3ee" } });
const comps = [];
tiles.forEach((t, row) => {
  comps.push({ input: t.s16, left: 20, top: 20 + row * 200 + 26 });
  comps.push({ input: t.s32, left: 220, top: 20 + row * 200 + 26 });
  comps.push({ input: t.s180, left: 420, top: 20 + row * 200 });
});
await sheet.composite(comps).png().toFile("public/favicon-candidates/sheet.png");
console.log(`build-favicon: shipped candidate "${pick}"; set + manifest + candidates written`);
