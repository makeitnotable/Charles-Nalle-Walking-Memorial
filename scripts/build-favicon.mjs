#!/usr/bin/env node
/**
 * The mark: a "CN" monogram set in Libre Caslon — the CHARLES/NALLE wordmark
 * reduced to its two initials — converted to PATHS (no font dependency) on the
 * site's dark ground, then rastered into the full icon set. Three compositions
 * are rendered as candidates (`public/favicon-candidates/`), previewed on
 * /styleguide; the shipped mark is `--pick a|b|c` (default c, Wil's choice
 * on 23 September 2026).
 *
 *   node scripts/build-favicon.mjs [--pick a|b|c]
 *
 *   a · LIGATURE — the C's two vertical terminals ARE the N's left
 *       stem: one shared hairline joins the letters. All cream, no frame.
 *   b · CAMEO — a large C carries a smaller N in its aperture, inside a fine
 *       ring in the artifact-frame bronze: a seal.
 *   c · STEP (ships) — C high-left, N low-right (the wordmark's own CHARLES/NALLE
 *       stagger), cream over orange; the C's lower terminal crosses the N's
 *       diagonal with a ground-colour knock-out gap.
 *
 * Optical sizes, like a type family: 180/192/512 are drawn from Libre Caslon
 * Display; 48 and 32 from Libre Caslon Text; 16 (and favicon.svg, which the
 * browsers that support it scale to the tab) from Libre Caslon Text Bold.
 * The small rasters are pixel-fitted — the mark is nudged by sub-pixel
 * amounts until its stems land on whole pixels (least anti-aliasing grey) —
 * and their coverage is then pushed toward ground/letter so the hairlines
 * read as lines rather than smears.
 *
 * Outputs (committed): public/favicon.svg, favicon-16.png, favicon-32.png,
 * favicon-48.png, favicon.ico (16+32+48, real ICO), apple-touch-icon.png
 * (180, opaque, full-bleed: iOS applies its own mask), icon-192.png and
 * icon-512.png (rounded tile, "any"), icon-192-maskable.png and
 * icon-512-maskable.png (full-bleed, the mark inside the central 80% safe
 * zone), site.webmanifest (RELATIVE urls, so the GH Pages base path just
 * works), plus public/favicon-candidates/{a,b,c}{.svg,-16,-32,-180}.png and a
 * contact sheet.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const args = process.argv.slice(2);
const pick = (() => {
  const i = args.indexOf("--pick");
  return i !== -1 && args[i + 1] ? args[i + 1] : "c";
})();

// ---------------------------------------------------------------- fonts
const load = (p) => opentype.parse(readFileSync(`node_modules/@fontsource/${p}`).buffer.slice(0));
const FACE = {
  display: { font: load("libre-caslon-display/files/libre-caslon-display-latin-400-normal.woff"), cap: 0.69 },
  text: { font: load("libre-caslon-text/files/libre-caslon-text-latin-400-normal.woff"), cap: 0.77 },
  bold: { font: load("libre-caslon-text/files/libre-caslon-text-latin-700-normal.woff"), cap: 0.77 },
};

// Tokens (global.css) — the mark is on-system by construction.
const GROUND = "#1d1411"; // --color-primary-2
const FRAME = "#80412b"; // --color-primary-7, THE artifact frame
const CREAM = "#f6f3ee"; // --color-neutral-12
const ORANGE = "#f26835"; // --color-primary-9

const G = 128; // grid
const RX = 22; // tile corner radius (17%): a plaque's softened corner, not iOS's 22%
const n2 = (v) => (Math.round(v * 100) / 100).toString();

// ---------------------------------------------------------------- geometry
/** opentype commands for `ch` at cap height `cap`, baseline at (x, y). */
function cmds(face, ch, x, y, cap) {
  const f = FACE[face];
  return f.font.getPath(ch, x, y, cap / f.cap).commands.map((c) => ({ ...c }));
}
function translate(cs, dx, dy) {
  return cs.map((c) => {
    const o = { ...c };
    for (const k of ["x", "x1", "x2"]) if (o[k] !== undefined) o[k] += dx;
    for (const k of ["y", "y1", "y2"]) if (o[k] !== undefined) o[k] += dy;
    return o;
  });
}
function toD(cs) {
  let d = "";
  for (const c of cs) {
    if (c.type === "M") d += `M${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "L") d += `L${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "Q") d += `Q${n2(c.x1)} ${n2(c.y1)} ${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "C") d += `C${n2(c.x1)} ${n2(c.y1)} ${n2(c.x2)} ${n2(c.y2)} ${n2(c.x)} ${n2(c.y)}`;
    else if (c.type === "Z") d += "Z";
  }
  return d;
}
/** Flatten to polygons (one per contour); curves become `seg` chords. */
function flatten(cs, seg = 16) {
  const polys = [];
  let cur = null, px = 0, py = 0;
  for (const c of cs) {
    if (c.type === "M") { cur = [[c.x, c.y]]; polys.push(cur); px = c.x; py = c.y; }
    else if (c.type === "L") { cur.push([c.x, c.y]); px = c.x; py = c.y; }
    else if (c.type === "Q") {
      for (let i = 1; i <= seg; i++) { const t = i / seg, u = 1 - t;
        cur.push([u * u * px + 2 * u * t * c.x1 + t * t * c.x, u * u * py + 2 * u * t * c.y1 + t * t * c.y]); }
      px = c.x; py = c.y;
    } else if (c.type === "C") {
      for (let i = 1; i <= seg; i++) { const t = i / seg, u = 1 - t;
        cur.push([u*u*u*px + 3*u*u*t*c.x1 + 3*u*t*t*c.x2 + t*t*t*c.x, u*u*u*py + 3*u*u*t*c.y1 + 3*u*t*t*c.y2 + t*t*t*c.y]); }
      px = c.x; py = c.y;
    }
  }
  return polys.filter((p) => p.length > 2);
}
/** Sutherland–Hodgman against one half-plane: keep where fn(x, y) >= 0. */
function clipHalf(poly, fn) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = fn(a[0], a[1]), db = fn(b[0], b[1]);
    if (da >= 0) out.push(a);
    if (da >= 0 !== db >= 0) { const t = da / (da - db); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
  }
  return out;
}
const polyToD = (polys) => polys.map((p) => "M" + p.map(([x, y]) => `${n2(x)} ${n2(y)}`).join("L") + "Z").join("");
function bbox(cs) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const p of flatten(cs)) for (const [x, y] of p) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
}
/** x-intervals of the filled shape along the horizontal line y (even-odd). */
function spansAt(polys, y) {
  const xs = [];
  for (const p of polys) for (let i = 0; i < p.length; i++) {
    const [ax, ay] = p[i], [bx, by] = p[(i + 1) % p.length];
    if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
  }
  xs.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
/** The two letters at cap height `cap` with the features the compositions key on. */
function anatomy(face, cap) {
  const C = cmds(face, "C", 0, 0, cap), N = cmds(face, "N", 0, 0, cap);
  const cb = bbox(C), nb = bbox(N);
  const mid = spansAt(flatten(N), -0.5 * cap);
  // Caslon's N: thin left stem, thick diagonal, thin right stem
  return { C, N, cb, nb, stem: mid[0], rstem: mid[mid.length - 1] };
}
/** The C's beak overshoots the cap height by this much (Display: 0.6%). */
function beakTop(face, cap) {
  const C = cmds(face, "C", 0, 0, cap);
  const polys = flatten(C);
  // the beak is the rightmost 8% of the C; find its highest point
  const cb = bbox(C);
  let top = 0;
  for (const p of polys) for (const [x, y] of p) if (x > cb.x2 - 0.08 * cb.w) top = Math.min(top, y);
  return -top;
}

// ---------------------------------------------------------------- compositions
const stroked = (col, w) => (w ? ` stroke="${col}" stroke-width="${n2(w)}" stroke-linejoin="round" paint-order="stroke"` : "");
const haloed = (w) => ` stroke="${GROUND}" stroke-width="${n2(w)}" stroke-linejoin="miter" stroke-miterlimit="8" paint-order="stroke"`;

/**
 * a · LIGATURE. The N's stem is trimmed to a straight edge (its top-left serif
 * and foot go) and placed so its right edge is flush with the C's right edge:
 * the C's beak and lower terminal — both vertical hairlines in Caslon — become
 * the stem. The N is scaled a hair so its top meets the beak's overshoot.
 */
function ligature({ face = "display", cap = 58, fill = CREAM, dx = 0, dy = 0, stroke = 0, fillN = fill } = {}) {
  const a = anatomy(face, cap);
  const capN = beakTop(face, cap);
  const b = anatomy(face, capN);
  const w = a.cb.w + (b.nb.x2 - b.stem[1]);
  const x0 = G / 2 - w / 2 - a.cb.x1 + dx;
  const yb = G / 2 + cap / 2 + dy;
  const nx = x0 + a.cb.x2 - b.stem[1];
  const N = flatten(b.N).map((p) => clipHalf(p, (px) => px - b.stem[0])).map((p) => p.map(([x, y]) => [x + nx, y + yb]));
  return {
    layers: [
      `<path d="${toD(translate(a.C, x0, yb))}" fill="${fill}"${stroked(fill, stroke)}/>`,
      `<path d="${polyToD(N)}" fill="${fillN}"${stroked(fillN, stroke)}/>`,
    ],
    bb: { x1: x0 + a.cb.x1, x2: x0 + a.cb.x1 + w, y1: yb - capN, y2: yb },
    key: { x: nx + b.stem[0], y: yb }, // the shared stem's left edge + the baseline: what the pixel fit snaps
  };
}

/** b · CAMEO. The C carries a smaller N centred in its aperture; a fine ring. */
function cameo({ face = "display", cap = 66, capN = 31, nx = 0.57, ny = 0.5, ring = 53, ringW = 1.25, fill = CREAM, dx = 0, dy = 0, stroke = 0 } = {}) {
  const a = anatomy(face, cap), b = anatomy(face, capN);
  const x0 = G / 2 - a.cb.w / 2 - a.cb.x1 + dx;
  const yb = G / 2 + cap / 2 + dy;
  const nxc = x0 + a.cb.x1 + nx * a.cb.w;
  const nyc = yb - cap / 2 + (ny - 0.5) * cap;
  const N = translate(b.N, nxc - (b.nb.x1 + b.nb.w / 2), nyc + capN / 2);
  const layers = [];
  // the ring stays dead-centred; only the letters take the optical nudge
  if (ring) layers.push(`<circle cx="${G / 2}" cy="${G / 2}" r="${n2(ring)}" fill="none" stroke="${FRAME}" stroke-width="${n2(ringW)}"/>`);
  layers.push(`<path d="${toD(translate(a.C, x0, yb))}" fill="${fill}"${stroked(fill, stroke)}/>`, `<path d="${toD(N)}" fill="${fill}"${stroked(fill, stroke)}/>`);
  const r = ring ? ring + ringW / 2 : 0;
  return {
    layers,
    bb: { x1: Math.min(x0 + a.cb.x1, G / 2 - r), x2: Math.max(x0 + a.cb.x2, G / 2 + r), y1: Math.min(yb - cap, G / 2 - r), y2: Math.max(yb, G / 2 + r) },
    key: { x: x0 + a.cb.x1, y: yb },
  };
}

/**
 * c · STEP. C high-left, N low-right; the N's stem stands in the C's mouth
 * (`f` of the C's width in) so the C's lower terminal crosses the N's diagonal.
 * The C is in front: a ground-colour halo on it cuts the gap.
 */
function step({ face = "display", cap = 54, rise = 0.14, f = 0.84, gap = 1.6, fillC = CREAM, fillN = ORANGE, dx = 0, dy = 0, stroke = 0 } = {}) {
  const a = anatomy(face, cap);
  const nx0 = a.cb.x1 + f * a.cb.w - a.stem[0];
  const left = Math.min(a.cb.x1, nx0 + a.nb.x1);
  const w = Math.max(a.cb.x2, nx0 + a.nb.x2) - left;
  const x0 = G / 2 - w / 2 - left + dx;
  const ybC = G / 2 + cap / 2 - rise * cap + dy;
  const ybN = G / 2 + cap / 2 + rise * cap + dy;
  const C = toD(translate(a.C, x0, ybC)), N = toD(translate(a.N, x0 + nx0, ybN));
  const layers = [`<path d="${N}" fill="${fillN}"${stroked(fillN, stroke)}/>`];
  if (gap) layers.push(`<path d="${C}" fill="${fillC}"${haloed(2 * gap + stroke)}/>`);
  if (!gap || stroke) layers.push(`<path d="${C}" fill="${fillC}"${stroked(fillC, stroke)}/>`);
  return { layers, bb: { x1: x0 + left, x2: x0 + left + w, y1: ybC - cap, y2: ybN }, key: { x: x0 + nx0 + a.stem[0], y: ybN } };
}

/** c at 16 px: the stagger has no room, so the two letters share the stem (the
 *  ligature's geometry) and keep their two colours — the same mark, simplified. */
const stepSmall = (o) => ligature({ ...o, fill: CREAM, fillN: ORANGE });

const COMPOSE = { a: ligature, b: cameo, c: step };

// Per-size masters: face, cap in px, same-colour stroke in px (hairlines → 1 px),
// and the coverage curve (lo/hi) that cleans the anti-aliasing at that size.
const MASTER = {
  a: {
    16: { fn: ligature, face: "bold", cap: 8, stroke: 0.35, sx: 0.93, curve: [0.25, 0.75] },
    32: { fn: ligature, face: "text", cap: 16, stroke: 0.2, curve: [0.12, 0.88] },
    48: { fn: ligature, face: "text", cap: 24, stroke: 0.15 },
  },
  b: {
    16: { fn: cameo, face: "text", cap: 12, capN: 6.5, nx: 0.63, ny: 0.52, ring: 0, stroke: 0.5, curve: [0.25, 0.75] },
    32: { fn: cameo, face: "text", cap: 18, capN: 9, nx: 0.6, ring: 13.75, ringW: 1, stroke: 0.2, curve: [0.12, 0.88] },
    48: { fn: cameo, face: "text", cap: 26, capN: 13, nx: 0.6, ring: 21.5, ringW: 1, stroke: 0.15 },
  },
  c: {
    16: { fn: stepSmall, face: "bold", cap: 8, stroke: 0.35, sx: 0.93, curve: [0.25, 0.75] },
    32: { fn: step, face: "text", cap: 14.5, gap: 0.8, stroke: 0.2, curve: [0.12, 0.88] },
    48: { fn: step, face: "text", cap: 20, gap: 1, stroke: 0.15 },
  },
};

// ---------------------------------------------------------------- svg + raster
/** mode: any (rounded tile, transparent corners) | full (opaque square) */
function svg(layers, { mode = "any", scale = 1 } = {}) {
  const tile = mode === "any"
    ? `<rect width="${G}" height="${G}" rx="${RX}" fill="${GROUND}"/>`
    : `<rect width="${G}" height="${G}" fill="${GROUND}"/>`;
  const inner = scale === 1 ? layers.join("\n  ") : `<g transform="translate(64 64) scale(${n2(scale)}) translate(-64 -64)">\n  ${layers.join("\n  ")}\n  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" width="${G}" height="${G}">
  <!-- Charles Nalle Walking Memorial — the CN mark. Libre Caslon outlines (paths, no font). -->
  ${tile}
  ${inner}
</svg>
`;
}
const png = (svgText, size) => sharp(Buffer.from(svgText), { density: (72 * size) / G }).resize(size, size).png().toBuffer();

/** Scale that fits the mark's box inside the maskable safe circle (r = 40%). */
function maskableScale(bb) {
  const hx = Math.max(G / 2 - bb.x1, bb.x2 - G / 2), hy = Math.max(G / 2 - bb.y1, bb.y2 - G / 2);
  return Math.min(1, (0.4 * G - 2) / Math.hypot(hx, hy));
}

/** How much anti-aliasing grey a small raster carries (lower = crisper). */
async function greyness(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let grey = 0, cov = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (info.channels === 4 && data[i + 3] < 128) continue;
    const c = Math.min(1, Math.max(0, (data[i] - 29) / (246 - 29)));
    grey += c * (1 - c); cov += c;
  }
  return grey / Math.max(cov, 1);
}
/** Push coverage toward ground or letter colour (per pixel, cream or orange). */
async function crisp(buf, [lo, hi]) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const GR = [0x1d, 0x14, 0x11], CR = [0xf6, 0xf3, 0xee], OR = [0xf2, 0x68, 0x35];
  for (let i = 0; i < data.length; i += ch) {
    if (ch === 4 && data[i + 3] < 8) continue;
    const c = Math.min(1, Math.max(0, (data[i] - GR[0]) / (CR[0] - GR[0])));
    if (c <= 0) continue;
    const lg = GR[1] + (data[i + 1] - GR[1]) / c; // the letter's green → how orange it is
    const t = Math.min(1, Math.max(0, (CR[1] - lg) / (CR[1] - OR[1])));
    const c2 = Math.min(1, Math.max(0, (c - lo) / (hi - lo)));
    for (let k = 0; k < 3; k++) data[i + k] = Math.round(GR[k] + c2 * (CR[k] + t * (OR[k] - CR[k]) - GR[k]));
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } }).png().toBuffer();
}
/**
 * A small raster: compose at `size` px from its master, try sub-pixel offsets
 * (8 × 8) and keep the crispest, then apply the master's coverage curve.
 * Returns { buf, svg } — the svg is the fitted geometry (for favicon.svg).
 */
async function small(kind, size) {
  const m = MASTER[kind][size];
  const u = G / size; // grid units per px
  const make = (dx, dy) => {
    const o = { ...m, cap: m.cap * u, stroke: (m.stroke || 0) * u, dx: dx * u, dy: dy * u };
    if (m.capN) o.capN = m.capN * u;
    if (m.gap) o.gap = m.gap * u;
    if (m.ring !== undefined) { o.ring = m.ring ? m.ring * u : 0; o.ringW = (m.ringW || 1) * u; }
    const layers = m.fn(o).layers;
    // `sx` condenses the mark about the tile's centre — at 16 px a few percent
    // is invisible in the letterforms and buys the side margins back
    return svg(m.sx ? [`<g transform="translate(${G / 2} 0) scale(${m.sx} 1) translate(${-G / 2} 0)">`, ...layers, "</g>"] : layers);
  };
  let best = null;
  const steps = size <= 32 ? 8 : 6;
  for (let i = 0; i < steps; i++) for (let j = 0; j < steps; j++) {
    const s = make(i / steps, j / steps);
    const buf = await png(s, size);
    const g = await greyness(buf);
    if (!best || g < best.g) best = { g, buf, svg: s };
  }
  return { buf: m.curve ? await crisp(best.buf, m.curve) : best.buf, svg: best.svg };
}

/** The whole family for one composition. */
async function family(kind) {
  const L = COMPOSE[kind]({ dx: kind === "b" ? 0 : 1, dy: -0.75 }); // optical: a hair right (hairline right edges read light), a hair up
  const any = svg(L.layers);
  const full = svg(L.layers, { mode: "full" });
  const mask = svg(L.layers, { mode: "full", scale: maskableScale(L.bb) });
  const s16 = await small(kind, 16), s32 = await small(kind, 32), s48 = await small(kind, 48);
  return {
    svg: s16.svg, // favicon.svg: the tab-size master; browsers scale it to 16/32
    large: any,
    p16: s16.buf, p32: s32.buf, p48: s48.buf,
    p180: await sharp(await png(full, 180)).removeAlpha().png().toBuffer(), // iOS wants opaque
    p192: await png(any, 192), p512: await png(any, 512),
    m192: await sharp(await png(mask, 192)).removeAlpha().png().toBuffer(),
    m512: await sharp(await png(mask, 512)).removeAlpha().png().toBuffer(),
    c180: await png(any, 180), // candidate tile for /styleguide
  };
}

// ---------------------------------------------------------------- write
mkdirSync("public/favicon-candidates", { recursive: true });
const fams = {};
for (const k of ["a", "b", "c"]) {
  const F = (fams[k] = await family(k));
  writeFileSync(`public/favicon-candidates/${k}.svg`, F.large);
  writeFileSync(`public/favicon-candidates/${k}-16.png`, F.p16);
  writeFileSync(`public/favicon-candidates/${k}-32.png`, F.p32);
  writeFileSync(`public/favicon-candidates/${k}-180.png`, F.c180);
}

const F = fams[pick];
writeFileSync("public/favicon.svg", F.svg);
writeFileSync("public/favicon-16.png", F.p16);
writeFileSync("public/favicon-32.png", F.p32);
writeFileSync("public/favicon-48.png", F.p48);
writeFileSync("public/favicon.ico", await pngToIco([F.p16, F.p32, F.p48]));
writeFileSync("public/apple-touch-icon.png", F.p180);
writeFileSync("public/icon-192.png", F.p192);
writeFileSync("public/icon-512.png", F.p512);
writeFileSync("public/icon-192-maskable.png", F.m192);
writeFileSync("public/icon-512-maskable.png", F.m512);

// Manifest — RELATIVE URLs resolve against the manifest's own location, so the
// same file is correct at "/" locally and under /Charles-Nalle-Walking-Memorial/
// on GitHub Pages. start_url "./" = the base.
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
        { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      ],
    },
    null,
    2,
  ) + "\n",
);

// A contact sheet for eyeballing: candidates × 16 (8× nearest) / 32 (4×) / 180
const comps = [];
for (const [row, k] of ["a", "b", "c"].entries()) {
  const F = fams[k];
  comps.push({ input: await sharp(F.p16).resize(128, 128, { kernel: "nearest" }).toBuffer(), left: 20, top: 20 + row * 200 + 26 });
  comps.push({ input: await sharp(F.p32).resize(128, 128, { kernel: "nearest" }).toBuffer(), left: 220, top: 20 + row * 200 + 26 });
  comps.push({ input: F.c180, left: 420, top: 20 + row * 200 });
}
await sharp({ create: { width: 3 * 200 + 40, height: 3 * 200 + 40, channels: 3, background: CREAM } })
  .composite(comps).png().toFile("public/favicon-candidates/sheet.png");
console.log(`build-favicon: shipped candidate "${pick}"; set + manifest + candidates written`);
