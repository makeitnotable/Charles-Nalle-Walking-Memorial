#!/usr/bin/env node
/**
 * Client round 3 — the visual gate (docs/rounds/2026-09-16-round-3-plan.md,
 * "The regression guarantee").
 *
 * Why this exists: no instrument in this container can see a phone's browser
 * chrome, so a round's regressions must be caught where they CAN be seen — on
 * every page it was not allowed to touch. This captures the site at rest and
 * compares it, pixel by pixel, against baselines committed in docs/qa/baseline/.
 * Drift on a route the round manifest does not list fails the run and writes
 * a diff image; drift on an allowed route is reported, not failed.
 *
 *   node scripts/snap.mjs [--base http://localhost:4331] [--update] [--force]
 *        [--baseline docs/qa/baseline] [--out node_modules/.cache/snap]
 *        [--routes /,/map] [--vp 390,768,1440] [--allow /map,/paintings]
 *        [--manifest docs/rounds/<date>-round-N.json] [--threshold 0.001]
 *   npm run qa:snap            — compare against the baselines (exit 1 on drift)
 *   npm run qa:snap:update     — write/refresh baselines (see the rules below)
 *
 * MUST run against `astro preview --port 4331` when baselines are captured:
 * `astro dev` injects its own client and toolbar, and the two never match.
 *
 * THE MATRIX — 11 routes × 390×844 / 768×1024 / 1440×900, deviceScaleFactor 1,
 * in a `prefers-reduced-motion: reduce` context, viewport-only, at scroll 0:
 * `<route-slug>--<vp>.png` (`/` → home, `/404` → 404). "At rest" = networkidle,
 * `document.fonts.ready`, every `document.getAnimations()` finished (bounded),
 * then a settle wait (2 s; the map 9 s once loaded, as shots.mjs).
 *
 * THE NAMED STATES — the plan asks for the map overview, the museum rail, a
 * chapter hero and the splash. Three are the rest shot of their route by
 * construction — `/map` under reduced motion jumps straight to the overview
 * camera, `/bakery` at scroll 0 IS the hero, `/` at scroll 0 IS the splash —
 * so they are aliases, not duplicate files: the table prints
 * `map--390 (map-overview)`. The museum rail is NOT the rest shot: under
 * reduced motion the hall never mounts (Museum.tsx's capability gate), so
 * `/paintings` at rest is the incapable fallback (lead painting + note).
 * `museum-rail--<vp>.png` is therefore a separate capture in a
 * `no-preference` context (browser launched like hall-stress.mjs:
 * `--use-gl=angle --autoplay-policy=no-user-gesture-required`), taken once
 * `window.__museum` exists, or after the bounded wait passes. 36 files.
 *
 * DETERMINISM — injected before every capture: `scroll-behavior: auto`; every
 * animation/transition duration and delay zeroed (zero DURATION rather than
 * `animation: none`, so `forwards` fills land on their end state instead of
 * leaving reveal text at its opacity-0 start); `<video>` hidden; every
 * `<canvas>` masked flat — `filter: contrast(0)` collapses whatever the GL
 * surface drew to one grey and a `#808080` background fills what it left
 * transparent — while the DOM controls over it (pins, card strip, dot rail,
 * chip, Skip) stay visible, so THEIR positions are compared. Screenshots are
 * taken with Playwright's `animations: "disabled"` and the caret hidden; the
 * context pins locale and time zone. Rest is then PROVED: two consecutive
 * captures 400 ms apart must be byte-identical (retried up to four times —
 * a late font swap on /people was caught this way), and the still-CSS is
 * installed by an init script so a document reload cannot drop it. Two runs
 * over an unchanged site are byte-identical (0 differing pixels), which is
 * how a run proves itself.
 *
 * EVERY WAIT IS BOUNDED. Readiness waits (`window.__troyMap.map.loaded()`,
 * `window.__museum`) time out and the shot is taken with whatever is there;
 * the table's `ready` column says which. In this container api.mapbox.com is
 * blocked by the egress policy (CONNECT 403), so on `/map` the style never
 * loads: baselines captured here show the masked canvas on the shell ground
 * plus the DOM controls only (card strip, Mapbox controls; no pins), and a
 * run from a network that CAN reach Mapbox will drift on the map shots.
 * Baselines are also tied to Playwright's Chromium build (text rasterisation
 * changes between builds) — a Playwright upgrade is a deliberate `--update
 * --force` of every route, recorded in the round report.
 *
 * ENCODING — every capture, baseline and current alike, goes through the same
 * sharp pipeline before comparison: the two low bits of every channel are
 * dropped (6 bits/channel, error ≤ 3 levels — invisible, and a tenth of the
 * gate's tolerance), then a lossless PNG (compression 9, adaptive filtering).
 * Measured on this site's 36 shots: 16.5 MB lossless → 9.4 MB. Identical
 * captures stay byte-identical, and the reduction is per-pixel, so a change in
 * one region can never move a pixel anywhere else. The obvious alternative,
 * a 256-colour palette PNG, was measured and rejected: the quantisation alone
 * leaves up to 0.15% of a hero's pixels more than 24 levels off (above the
 * gate's own threshold), and two independently quantised captures of a page
 * that differs in one small block disagree on ~4% of the rest. A pixel differs
 * when any RGB channel differs by more than 24; a shot drifts when
 * differing/total > --threshold (default 0.001 = 0.1%).
 *
 * --update: a missing baseline is written; an existing one is refreshed only
 * for routes in the manifest's `snap.allowedRoutes` (or --allow, or --force).
 * A non-allowed route that drifts is REFUSED and fails the run — that drift
 * is a defect to investigate, never a new baseline. Without --update a
 * missing baseline is a failure. Failing and drifting shots write
 * `<name>.diff.png` (differing pixels in red over the dimmed baseline) and
 * `<name>.current.png` to --out, which defaults to the gitignored
 * node_modules/.cache/snap/. Exit 1 with the table on failure, 0 otherwise.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const has = (n) => args.includes(`--${n}`);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
if (has("help") || args.includes("-h")) {
  console.log(
    [
      "usage: node scripts/snap.mjs [--base http://localhost:4331] [--update] [--force]",
      "         [--baseline docs/qa/baseline] [--out node_modules/.cache/snap]",
      "         [--routes /,/map] [--vp 390,768,1440] [--allow /map,/paintings]",
      "         [--manifest docs/rounds/<date>-round-N.json] [--threshold 0.001]",
      "",
      "  compare (default)  every shot vs docs/qa/baseline/; exit 1 on drift outside the allowed routes",
      "  --update           write missing baselines; refresh existing ones for allowed routes only",
      "  --force            with --update: refresh every route (a deliberate re-base, e.g. a Playwright upgrade)",
    ].join("\n"),
  );
  process.exit(0);
}
const die = (msg) => {
  console.error(msg);
  process.exit(2);
};

const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const UPDATE = has("update");
const FORCE = has("force");
const BASELINE_DIR = resolve(ROOT, flag("baseline", "docs/qa/baseline"));
const OUT_DIR = resolve(ROOT, flag("out", "node_modules/.cache/snap"));
const THRESHOLD = Number(flag("threshold", "0.001"));
if (!(THRESHOLD >= 0 && THRESHOLD <= 1)) die("snap: --threshold must be a ratio between 0 and 1");
const TOL = 24; // per-channel distance below which two pixels are "the same"
const ALL_ROUTES = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404"];
const ROUTES = flag("routes", ALL_ROUTES.join(","))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const VP_TABLE = { 390: [390, 844], 768: [768, 1024], 1440: [1440, 900] };
const VPS = flag("vp", "390,768,1440")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((n) => {
    const t = VP_TABLE[n];
    return { name: n, width: t ? t[0] : Number(n), height: t ? t[1] : 900 };
  });
if (VPS.some((v) => !(v.width > 0))) die(`snap: --vp takes viewport names/widths (${Object.keys(VP_TABLE).join(",")})`);
/* The deterministic reduction (see ENCODING above): both sides drop the two low
   bits of every channel, then a lossless PNG. Content-independent, so a change
   in one region can never move a pixel anywhere else. */
const KEEP_BITS = 0xfc;
const PNG_OPTS = { compressionLevel: 9, adaptiveFiltering: true, palette: false };
async function reduce(rawPng) {
  const { data, info } = await sharp(rawPng).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i++) data[i] &= KEEP_BITS;
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png(PNG_OPTS).toBuffer();
}
const rel = (p) => {
  const r = relative(ROOT, p);
  return r && !r.startsWith("..") ? r : p; // outside the repo: say where, plainly
};

/* ── the round manifest: which routes may drift ───────────────────────────── */
function latestManifest() {
  const dir = join(ROOT, "docs", "rounds");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => /-round-\d+\.json$/.test(f))
    .sort();
  return files.length ? join("docs", "rounds", files[files.length - 1]) : null;
}
const manifestArg = flag("manifest", latestManifest());
let manifest = null;
if (manifestArg) {
  const p = resolve(ROOT, manifestArg);
  if (existsSync(p)) manifest = JSON.parse(readFileSync(p, "utf8"));
  else if (flag("manifest", null)) die(`snap: no manifest at ${rel(p)}`);
}
const ALLOWED = new Set([
  ...(manifest?.snap?.allowedRoutes ?? []),
  ...flag("allow", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
]);

/* ── the shots ────────────────────────────────────────────────────────────── */
const slugOf = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "-"));
const ALIAS = { "/": "splash", "/bakery": "chapter-hero", "/map": "map-overview" };
const MAP_SETTLE = { ready: 9000, timeout: 2000 }; // tiles + route self-draw after load; nothing to wait for when blocked
const SHOTS = ROUTES.map((route) => ({
  name: slugOf(route),
  route,
  alias: ALIAS[route],
  motion: "reduce",
  ready: route === "/map" ? "map" : null,
  settle: (ready) => (route === "/map" ? MAP_SETTLE[ready] ?? MAP_SETTLE.timeout : 2000),
}));
if (ROUTES.includes("/paintings")) {
  SHOTS.push({ name: "museum-rail", route: "/paintings", motion: "no-preference", ready: "museum", settle: () => 3000 });
}
/* Readiness probes run inside the page (Playwright serialises them), each
   bounded — the shot is taken either way and the table records which. */
const READY = {
  map: {
    fn: () => {
      const h = window.__troyMap;
      return Boolean(h && h.map && h.map.loaded());
    },
    timeout: 15000,
  },
  museum: { fn: () => Boolean(window.__museum), timeout: 30000 },
};
const STILL_CSS = [
  "html{scroll-behavior:auto !important}",
  "*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important}",
  "video{visibility:hidden !important}",
  "canvas{filter:contrast(0) !important;background:#808080 !important}",
].join("\n");
/* Installed by an init script on EVERY document the page loads, and again
   after load: a dev-server HMR reload during the map's wait once dropped the
   post-load <style> and an unmasked canvas leaked into a baseline. Idempotent
   by id. A reload mid-capture is also counted and reported in the row. */
const INSTALL_STILL = `(() => {
  const put = () => {
    if (document.getElementById("snap-still")) return;
    const el = document.createElement("style");
    el.id = "snap-still";
    el.textContent = ${JSON.stringify(STILL_CSS)};
    (document.head || document.documentElement).appendChild(el);
  };
  if (document.documentElement) put();
  else document.addEventListener("DOMContentLoaded", put, { once: true });
})();`;

async function capture(page, shot) {
  const t0 = performance.now();
  let navs = 0;
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) navs++;
  });
  await page.addInitScript(INSTALL_STILL);
  await page.goto(BASE + shot.route, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(INSTALL_STILL);
  await page.evaluate(() => document.querySelector("astro-dev-toolbar")?.remove());
  let ready = "-";
  if (shot.ready) {
    const probe = READY[shot.ready];
    ready = await page.waitForFunction(probe.fn, null, { timeout: probe.timeout }).then(
      () => "ready",
      () => "timeout",
    );
  }
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.race([
      Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
      new Promise((r) => setTimeout(r, 4000)),
    ]),
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(shot.settle(ready));
  const reloads = navs - 1;
  if (reloads > 0) {
    /* The document changed under us; give the new one the same rest. */
    await page.evaluate(INSTALL_STILL);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(shot.settle(ready));
  }
  /* Fonts are checked AFTER the rest, not before: a face used by one element
     (the italic on /people) can start loading after fonts.ready first resolved. */
  const fonts = await page.evaluate(async () => {
    for (let i = 0; i < 5 && document.fonts.status !== "loaded"; i++) await document.fonts.ready;
    return document.fonts.status;
  });
  const t1 = performance.now();
  /* Rest is proved, not assumed: two consecutive captures 400 ms apart must be
     byte-identical before the shot counts (Playwright's own toHaveScreenshot
     does the same). A font swap or a dev-server style hot-swap between them
     is retried, up to four captures; the last one is used regardless and the
     row says so. */
  const SHOT = { type: "png", animations: "disabled", caret: "hide" };
  let raw = await page.screenshot(SHOT);
  let captures = 1;
  for (; captures < 4; captures++) {
    await page.waitForTimeout(400);
    const again = await page.screenshot(SHOT);
    const stable = again.equals(raw);
    raw = again;
    if (stable) break;
  }
  const png = await reduce(raw);
  const t2 = performance.now();
  return { png, ready, fonts, reloads, captures, navMs: Math.round(t1 - t0), capMs: Math.round(t2 - t1) };
}

/* ── the diff ─────────────────────────────────────────────────────────────── */
async function decode(png) {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, c: info.channels };
}
async function compare(basePng, curPng) {
  const [a, b] = await Promise.all([decode(basePng), decode(curPng)]);
  const total = a.w * a.h;
  if (a.w !== b.w || a.h !== b.h) return { differing: total, total, mismatch: `${a.w}×${a.h} → ${b.w}×${b.h}`, diff: null };
  const out = Buffer.alloc(total * 3);
  let differing = 0;
  for (let i = 0, j = 0, o = 0; i < total; i++, j += a.c, o += 3) {
    const d =
      Math.abs(a.data[j] - b.data[j]) > TOL ||
      Math.abs(a.data[j + 1] - b.data[j + 1]) > TOL ||
      Math.abs(a.data[j + 2] - b.data[j + 2]) > TOL;
    if (d) {
      differing++;
      out[o] = 255;
      out[o + 1] = 59;
      out[o + 2] = 48;
    } else {
      out[o] = (a.data[j] * 0.3) | 0;
      out[o + 1] = (a.data[j + 1] * 0.3) | 0;
      out[o + 2] = (a.data[j + 2] * 0.3) | 0;
    }
  }
  return { differing, total, mismatch: null, diff: differing ? { buf: out, w: a.w, h: a.h } : null };
}
const outPaths = (file) => {
  const stem = file.replace(/\.png$/, "");
  return { diff: join(OUT_DIR, `${stem}.diff.png`), current: join(OUT_DIR, `${stem}.current.png`) };
};
async function writeDiff(file, cmp, curPng) {
  mkdirSync(OUT_DIR, { recursive: true });
  const p = outPaths(file);
  writeFileSync(p.current, curPng);
  if (cmp.diff) await sharp(cmp.diff.buf, { raw: { width: cmp.diff.w, height: cmp.diff.h, channels: 3 } }).png({ compressionLevel: 9 }).toFile(p.diff);
}
function removeStale(file) {
  for (const p of Object.values(outPaths(file))) if (existsSync(p)) unlinkSync(p);
}

/* ── run ──────────────────────────────────────────────────────────────────── */
console.log(
  `snap: ${UPDATE ? (FORCE ? "UPDATE (--force: every route)" : "UPDATE") : "compare"} · ${BASE} · ${VPS.map((v) => v.name).join("/")} · ` +
    `${SHOTS.length * VPS.length} shot(s) · threshold ${(THRESHOLD * 100).toFixed(2)}% · baselines ${rel(BASELINE_DIR)}` +
    (UPDATE ? "" : ` · diffs ${rel(OUT_DIR)}`),
);
console.log(
  `snap: allowed to drift — ${ALLOWED.size ? [...ALLOWED].join(" ") : "(none)"}` +
    (manifestArg && manifest ? `  [${rel(resolve(ROOT, manifestArg))}${flag("allow", null) ? " + --allow" : ""}]` : flag("allow", null) ? "  [--allow]" : "  [no manifest]"),
);
if (UPDATE) mkdirSync(BASELINE_DIR, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
/* The baselines belong to this build: text rasterisation moves between
   Chromium versions, so the round report records the pair. */
console.log(`snap: Chromium ${browser.version()} · Playwright ${JSON.parse(readFileSync(new URL("../node_modules/playwright/package.json", import.meta.url), "utf8")).version}`);
const rows = [];
const T0 = performance.now();
for (const vp of VPS) {
  const contexts = {};
  const contextFor = async (motion) =>
    (contexts[motion] ??= await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: motion,
      colorScheme: "light",
      locale: "en-US",
      timezoneId: "America/New_York",
    }));
  for (const shot of SHOTS) {
    const file = `${shot.name}--${vp.name}.png`;
    const row = { file, alias: shot.alias, allowed: ALLOWED.has(shot.route), status: "", fail: false, differing: 0, total: vp.width * vp.height, ready: "-", navMs: 0, capMs: 0, note: "" };
    rows.push(row);
    try {
      const ctx = await contextFor(shot.motion);
      const page = await ctx.newPage();
      let cap;
      try {
        cap = await capture(page, shot);
      } finally {
        await page.close();
      }
      Object.assign(row, { ready: cap.ready, navMs: cap.navMs, capMs: cap.capMs });
      if (cap.fonts !== "loaded") row.note = `fonts ${cap.fonts}`;
      if (cap.reloads > 0) row.note += `${row.note ? "; " : ""}page reloaded ×${cap.reloads} mid-capture (dev HMR?)`;
      if (cap.captures > 1) row.note += `${row.note ? "; " : ""}${cap.captures >= 4 ? "UNSTABLE after 4 captures" : `settled on capture ${cap.captures}`}`;
      const basePath = join(BASELINE_DIR, file);
      if (!existsSync(basePath)) {
        if (UPDATE) {
          writeFileSync(basePath, cap.png);
          row.status = "new baseline";
        } else {
          row.status = "MISSING";
          row.fail = true;
          row.note = "no baseline — run qa:snap:update";
        }
        continue;
      }
      const basePng = readFileSync(basePath);
      const identical = basePng.equals(cap.png);
      const cmp = identical ? { differing: 0, total: row.total, mismatch: null, diff: null } : await compare(basePng, cap.png);
      row.differing = cmp.differing;
      row.total = cmp.total;
      const drift = Boolean(cmp.mismatch) || cmp.differing / cmp.total > THRESHOLD;
      if (cmp.mismatch) row.note = `size ${cmp.mismatch}`;
      if (UPDATE) {
        if (identical) row.status = "unchanged";
        else if (row.allowed || FORCE) {
          writeFileSync(basePath, cap.png);
          row.status = drift ? "refreshed" : "refreshed (sub-threshold)";
        } else if (drift) {
          row.status = "REFUSED";
          row.fail = true;
          row.note = "route not in snap.allowedRoutes — investigate; --allow or --force to re-base";
          await writeDiff(file, cmp, cap.png);
        } else row.status = "kept (sub-threshold)";
      } else if (!drift) {
        row.status = "ok";
        removeStale(file);
      } else {
        await writeDiff(file, cmp, cap.png);
        if (row.allowed) row.status = "drift (allowed)";
        else {
          row.status = "FAIL";
          row.fail = true;
        }
      }
    } catch (e) {
      row.status = "ERROR";
      row.fail = true;
      row.note = String(e && e.message ? e.message : e)
        .split("\n")[0]
        .slice(0, 100);
    }
  }
  for (const ctx of Object.values(contexts)) await ctx.close();
}
await browser.close();

/* ── the table ────────────────────────────────────────────────────────────── */
const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);
const label = (r) => r.file + (r.alias ? ` (${r.alias})` : "");
const W = Math.max(28, ...rows.map((r) => label(r).length));
console.log("");
console.log(`${pad("shot", W)}  ${pad("status", 24)} ${num("diff px", 8)} ${num("%", 7)}  ${pad("ready", 7)} ${num("nav+settle", 10)} ${num("capture", 7)}  note`);
for (const r of rows) {
  const pct = r.total ? ((100 * r.differing) / r.total).toFixed(3) : "-";
  console.log(
    `${pad(label(r), W)}  ${pad(r.status, 24)} ${num(r.differing, 8)} ${num(pct, 7)}  ${pad(r.ready, 7)} ${num(r.navMs + "ms", 10)} ${num(r.capMs + "ms", 7)}  ${r.note}`,
  );
}

const fails = rows.filter((r) => r.fail).length;
const drifts = rows.filter((r) => r.status === "drift (allowed)").length;
const written = rows.filter((r) => /^(new baseline|refreshed)/.test(r.status)).length;
const files = existsSync(BASELINE_DIR) ? readdirSync(BASELINE_DIR).filter((f) => f.endsWith(".png")) : [];
const bytes = files.reduce((s, f) => s + statSync(join(BASELINE_DIR, f)).size, 0);
const secs = ((performance.now() - T0) / 1000).toFixed(1);
console.log("");
console.log(
  `snap: ${rows.length} shot(s) in ${secs}s — ` +
    (UPDATE ? `${written} written, ${rows.length - written - fails} kept, ${fails} failed` : `${rows.length - fails - drifts} ok, ${drifts} drift (allowed), ${fails} failed`) +
    ` · baseline set ${rel(BASELINE_DIR)}: ${files.length} file(s), ${(bytes / 1048576).toFixed(2)} MB`,
);
if (fails) {
  console.error(`snap: ${fails} FAILURE(S) — diff/current images in ${rel(OUT_DIR)}`);
  process.exit(1);
}
console.log(`snap: ${UPDATE ? "baselines up to date" : "no drift outside the round's allowed routes"} ✓`);
