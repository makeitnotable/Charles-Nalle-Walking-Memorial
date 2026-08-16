#!/usr/bin/env node
/**
 * Curtain frame capture — the X1 acceptance instrument (docs/PLAN.md Part B §3).
 *
 * The curtain is an MPA transition split in two: page A slides the #100A06
 * panel up and navigates once covered (src/lib/curtain.ts `playCover`), page B
 * (flagged via sessionStorage `cnwm-curtain`) is supposed to START covered,
 * hold ~0.45s, then exit upward (`playExit`). Suspected defect (X1): the exit
 * half runs from a deferred module script at the end of <body>, so page B
 * paints UNCOVERED for a frame or more before the curtain snaps over it.
 *
 * X1 acceptance criterion this script measures:
 *   "no uncovered frame of page B before the hold, no wordmark reflow,
 *    one continuous reveal"
 *
 * Three navigations, each at 390×844 and 1440×900 under 4× CPU throttling:
 *   map-card   /map    → first chapter card (two-tap: marker focuses, card navigates)
 *   continue   /bakery → "Continue" CTA near #onward → next chapter
 *   home-door  /       → first a[data-curtain-label] (today: the unlabelled /map CTA)
 *
 * Two independent probes run in parallel from ~100ms before the click until
 * ~2200ms after:
 *   1. CDP Page.startScreencast JPEG frames → <outdir>/frames/<case>-<vp>/
 *      f<NNN>-<tMs>.jpg (tMs relative to the click; negative written as mNN),
 *      plus per-frame mean/stddev luminance via sharp (downscaled greyscale)
 *      and a pixel diff against a known-covered frame — a page-B frame that
 *      is not the curtain differs from it even when page B is dark.
 *   2. A ~30ms page.evaluate poll (rAF-tied, so each sample describes a frame
 *      that is about to be composited) recording pathname, readyState, panel
 *      geometry/transform → `covered`, wordmark opacity and content-box width.
 *      The poll survives the navigation (evaluate throws while the context is
 *      torn down; we retry). The first sample seen on page B tells us whether
 *      page B rendered before the curtain was over it.
 *
 * Output: <outdir>/frames.json (samples, frame stats, findings, timing per
 * case × vp) and <outdir>/frames.md (summary table). Verdict CLEAN when there
 * is no uncovered page-B sample/frame and no wordmark reflow. Exit 1 otherwise.
 *
 * Usage: node scripts/frames.mjs <outdir> [--base URL] [--vp 390,1440] [--throttle 4]
 * Needs the dev server running (default http://localhost:4321).
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v7/qa/frames";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const THROTTLE = Number(flag("throttle", "4"));
const ALL_VP = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } };
const VPS = flag("vp", "390,1440")
  .split(",")
  .map((n) => ({ name: n, ...ALL_VP[n] }))
  .filter((v) => v.width);
const PRE_MS = 100; // capture lead before the click
const POST_MS = 2200; // capture tail after the click
const SAMPLE_MS = 30;

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("sharp unavailable — frame luminance stats skipped");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (p) => (p || "/").replace(/\/+$/, "") || "/";

/* ─── The three navigations. `prep` gets the page ready and returns the
   viewport point to click; the click itself is issued by runCase so t0 is
   stamped as close to the mouse event as possible. ─── */
async function centre(page, sel) {
  const loc = page.locator(sel).first();
  await loc.waitFor({ state: "attached", timeout: 8000 });
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no box for ${sel}`);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, sel };
}
const CASES = [
  {
    id: "map-card",
    path: "/map",
    prep: async (page) => {
      await page.waitForTimeout(9000);
      const card = '.keen-slider__slide [role="button"][aria-label^="Enter Chapter"]';
      // The carousel is opacity-0 until a stop is focused (TroyMap.tsx: the
      // marker click → focusStop → carousel visible with that card active).
      const visible = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const wrap = el?.closest(".keen-slider")?.parentElement;
        return !!el && (!wrap || getComputedStyle(wrap).opacity !== "0");
      }, card);
      if (!visible) {
        const marker = page.locator('button[aria-label^="Spot 1"]').first();
        await marker.click({ force: true, timeout: 4000 }).catch(() => marker.evaluate((el) => el.click()));
        await page.waitForTimeout(1500);
      }
      return centre(page, card);
    },
  },
  {
    id: "continue",
    path: "/bakery",
    prep: async (page) => {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1500);
      const cta = (await page.locator("#onward a", { hasText: /^\s*Continue/ }).count())
        ? "#onward a:has-text('Continue')"
        : "a.btn-solid:has-text('Continue')";
      return centre(page, cta);
    },
  },
  {
    id: "home-door",
    path: "/",
    prep: async (page) => {
      await page.waitForTimeout(1500);
      // The home door is the CTA to /map; it carries no label today (falls back
      // to the wordmark), so accept any curtain-eligible internal link in main.
      const labelled = await page.locator("a[data-curtain-label]").count();
      return centre(page, labelled ? "a[data-curtain-label]" : "main a[href^='/']:not([data-no-curtain]):not([href^='/#'])");
    },
  },
];

/* In-page probe: resolves on the next animation frame (or after 120ms if rAF
   is starved) with the curtain's state as it is about to be painted. */
const SAMPLE = () =>
  new Promise((res) => {
    const read = (raf) => {
      const p = document.getElementById("curtain-panel");
      const t = document.getElementById("curtain-text");
      const c = document.getElementById("curtain-text-content");
      const o = { now: Date.now(), href: location.pathname, readyState: document.readyState, raf, panel: !!p, vh: innerHeight };
      if (p) {
        const r = p.getBoundingClientRect();
        const cs = getComputedStyle(p);
        const identity = cs.transform === "none" || cs.transform === "matrix(1, 0, 0, 1, 0, 0)";
        o.top = Math.round(r.top);
        o.bottom = Math.round(r.bottom);
        o.opacity = +cs.opacity;
        o.covered = (identity || (r.top <= 0 && r.bottom >= innerHeight)) && +cs.opacity > 0.9;
      } else o.covered = false;
      if (t) o.textOpacity = +getComputedStyle(t).opacity;
      if (c) {
        const cr = c.getBoundingClientRect();
        o.textW = +cr.width.toFixed(1);
        o.textH = +cr.height.toFixed(1);
      }
      res(o);
    };
    const to = setTimeout(() => read(false), 120);
    requestAnimationFrame(() => {
      clearTimeout(to);
      read(true);
    });
  });

/* Cheap pixel stats on a 120px-wide greyscale thumbnail: mean/std luminance,
   plus the raw pixels so a frame can be diffed against a known-covered frame. */
async function lumaStats(buf) {
  if (!sharp) return null;
  const { data } = await sharp(buf).resize({ width: 120 }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let s = 0, s2 = 0;
  for (const v of data) { s += v; s2 += v * v; }
  const mean = s / data.length;
  return { mean: +mean.toFixed(1), std: +Math.sqrt(Math.max(0, s2 / data.length - mean * mean)).toFixed(1), px: data };
}
const meanAbsDiff = (a, b) => {
  if (!a || !b || a.length !== b.length) return null;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return +(s / a.length).toFixed(1);
};
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);

/* ─── One case × viewport: capture, then analyse ─── */
async function runCase(browser, vp, c) {
  const tag = `${c.id}-${vp.name}`;
  console.log(`▶ ${tag}`);
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  await page.goto(BASE + c.path, { waitUntil: "load", timeout: 60000 });
  const point = await c.prep(page);

  // Probe 1: screencast (frames are only emitted when the compositor changes)
  const raw = [];
  cdp.on("Page.screencastFrame", (ev) => {
    raw.push({ arrived: Date.now(), ts: ev.metadata?.timestamp ? ev.metadata.timestamp * 1000 : null, data: ev.data });
    cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: vp.width, maxHeight: vp.height, everyNthFrame: 1 });

  // Probe 2: rAF-tied state poll, tolerant of the navigation tearing down the context
  const samples = [];
  let stop = false, errors = 0;
  const poller = (async () => {
    while (!stop) {
      try {
        const s = await Promise.race([page.evaluate(SAMPLE), sleep(600).then(() => null)]);
        if (s) samples.push(s);
      } catch { errors++; await sleep(10); }
      await sleep(SAMPLE_MS);
    }
  })();

  await sleep(PRE_MS);
  const t0 = Date.now();
  await page.mouse.click(point.x, point.y);
  const clickDone = Date.now() - t0;
  await sleep(POST_MS);
  stop = true;
  await poller;
  await cdp.send("Page.stopScreencast").catch(() => {});
  const finalPath = norm(new URL(page.url()).pathname);
  await context.close();

  // ── Frames to disk + luminance ──
  const dir = join(outdir, "frames", tag);
  mkdirSync(dir, { recursive: true });
  const frames = [];
  for (let i = 0; i < raw.length; i++) {
    const f = raw[i];
    const abs = f.ts && Math.abs(f.ts - f.arrived) < 5000 ? f.ts : f.arrived; // prefer compositor timestamp
    const t = Math.round(abs - t0);
    const buf = Buffer.from(f.data, "base64");
    const name = `f${String(i).padStart(3, "0")}-${t < 0 ? "m" + -t : t}.jpg`;
    writeFileSync(join(dir, name), buf);
    frames.push({ i, t, file: name, ...(await lumaStats(buf).catch(() => null)) });
  }

  // ── Timeline from the samples ──
  for (const s of samples) s.t = s.now - t0;
  samples.sort((a, b) => a.t - b.t);
  const pageA = norm(c.path);
  const navIdx = samples.findIndex((s) => norm(s.href) !== pageA);
  const nav = navIdx >= 0 ? samples[navIdx] : null;
  const A = navIdx >= 0 ? samples.slice(0, navIdx) : samples;
  const B = navIdx >= 0 ? samples.slice(navIdx) : [];
  const first = (arr, fn) => arr.find(fn) ?? null;
  const clickToCovered = first(samples, (s) => s.t >= 0 && s.covered)?.t ?? null;
  const bCoveredIdx = B.findIndex((s) => s.covered);
  const bCovered = bCoveredIdx >= 0 ? B[bCoveredIdx] : null;
  // reveal starts when the panel, having covered page B, moves off the top
  const revealStart = bCovered ? first(B.slice(bCoveredIdx), (s) => s.panel && s.top < -1) : null;
  const revealEnd = revealStart ? first(B.slice(B.indexOf(revealStart)), (s) => s.panel && (s.bottom <= 1 || s.top >= s.vh - 1)) : null;
  const holdMs = bCovered && revealStart ? revealStart.t - bCovered.t : null;
  const revealMs = revealStart && revealEnd ? revealEnd.t - revealStart.t : null;
  // page-B samples rendered before the curtain covered them
  const uncoveredB = bCoveredIdx >= 0 ? B.slice(0, bCoveredIdx) : B;
  const uncoveredBRaf = uncoveredB.filter((s) => s.raf);
  // wordmark reflow: content box width drift while covered + text visible, per page
  const drift = (arr) => {
    const w = arr.filter((s) => s.covered && s.textOpacity > 0.5 && s.textW > 0).map((s) => s.textW);
    return w.length > 1 ? +(Math.max(...w) - Math.min(...w)).toFixed(1) : 0;
  };
  const reflowB = drift(B), reflowA = drift(A);
  const gaps = samples.slice(1).map((s, i) => s.t - samples[i].t);

  // ── Frame classification against a covered reference frame ──
  // Reference = the last screencast frame whose nearest sample is a covered,
  // stationary page-A curtain (same panel + same wordmark as page B's hold).
  // Every frame gets `diff` = mean |px − ref px| on the thumbnail; covered
  // frames differ only by JPEG noise (~0–2), an uncovered page B differs by
  // far more even when it is dark (the /map loader scores ~9 vs curtain-hold
  // frames at ~0.5). mean/std luminance are kept as supporting numbers.
  const nearest = (t) => samples.reduce((best, s) => (Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best), samples[0]);
  let frameFinding = { count: 0, ts: [], ref: null, threshold: null };
  if (sharp && frames.length && samples.length && nav) {
    const isHold = (f) => f.mean != null && nearest(f.t).covered && !(nearest(f.t).top < -1);
    const refA = frames.filter((f) => isHold(f) && f.t < nav.t);
    const ref = refA.length ? refA[refA.length - 1] : frames.find(isHold);
    if (ref) {
      for (const f of frames) f.diff = meanAbsDiff(f.px, ref.px);
      const holdDiffs = frames.filter((f) => isHold(f) && f !== ref).map((f) => f.diff).filter((d) => d != null);
      const thr = +Math.max(6, 3 * (median(holdDiffs) ?? 0)).toFixed(1);
      // Window: from the last page-A sample (page A is covered by then and its
      // panel never moves again — the poll is blind for 100–300ms across the
      // navigation, so page-B frames may land before the first B sample) up to
      // the last stationary covered B sample before the reveal onset.
      const lastA = A.length ? A[A.length - 1] : null;
      const winStart = lastA && lastA.covered ? lastA.t : nav.t;
      const bRevealIdx = revealStart ? B.indexOf(revealStart) : -1;
      const winEnd = bRevealIdx > 0 ? B[bRevealIdx - 1].t : nav.t + 2000;
      const bad = frames.filter((f) => f.t > winStart && f.t <= winEnd && f.diff != null && f.diff > thr);
      for (const f of bad) f.uncovered = true;
      const after = bad.length ? frames.find((f) => f.t > bad[bad.length - 1].t && f.diff != null && f.diff <= thr) : null;
      frameFinding = {
        count: bad.length,
        ts: bad.map((f) => f.t),
        diffs: bad.map((f) => f.diff),
        spanMs: bad.length ? (after ? after.t : bad[bad.length - 1].t) - bad[0].t : 0, // first foreign frame → first curtain frame after
        window: [winStart, winEnd],
        ref: { file: ref.file, t: ref.t, mean: ref.mean, std: ref.std, holdDiffMedian: median(holdDiffs), holdFrames: holdDiffs.length },
        threshold: thr,
      };
    }
  }
  for (const f of frames) delete f.px; // keep frames.json small

  const findings = {
    navigated: !!nav,
    finalPath,
    firstPageBSample: nav ? { t: nav.t, covered: !!nav.covered, panel: nav.panel, readyState: nav.readyState, raf: nav.raf } : null,
    uncoveredPageBSamples: { count: uncoveredB.length, rafCount: uncoveredBRaf.length, ts: uncoveredB.map((s) => s.t) },
    uncoveredPageBFrames: frameFinding,
    textReflowPx: { pageB: reflowB, pageA: reflowA },
    revealFinished: !!revealEnd,
  };
  const clean = !!nav && uncoveredB.length === 0 && frameFinding.count === 0 && reflowB <= 2 && reflowA <= 2;
  const verdict = !nav ? "NO-NAV" : clean ? "CLEAN" : "DEFECT";
  const timing = { clickDoneMs: clickDone, clickToCoveredMs: clickToCovered, navCommitMs: nav?.t ?? null, pageBCoveredMs: bCovered?.t ?? null, holdMs, revealStartMs: revealStart?.t ?? null, revealMs, sampleCount: samples.length, sampleErrors: errors, maxSampleGapMs: gaps.length ? Math.max(...gaps) : null, frameCount: frames.length };
  console.log(`  ${verdict}  click→covered ${clickToCovered}ms · nav ${nav?.t ?? "-"}ms · B covered ${bCovered?.t ?? "-"}ms · hold ${holdMs}ms · reveal ${revealMs}ms · uncovered B samples ${uncoveredB.length} (rAF ${uncoveredBRaf.length}) · frames ${frames.length} (flagged ${frameFinding.count}) · reflow B ${reflowB}px`);
  return { case: c.id, vp: vp.name, path: c.path, click: point, verdict, timing, findings, samples, frames };
}

/* ─── Main ─── */
mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const vp of VPS) {
  for (const c of CASES) {
    try {
      results.push(await runCase(browser, vp, c));
    } catch (e) {
      console.error(`  ✖ ${c.id}-${vp.name}: ${e.message}`);
      results.push({ case: c.id, vp: vp.name, path: c.path, verdict: "ERROR", error: String(e.message), timing: {}, findings: {}, samples: [], frames: [] });
    }
  }
}
await browser.close();

writeFileSync(join(outdir, "frames.json"), JSON.stringify({ base: BASE, throttle: THROTTLE, generatedAt: new Date().toISOString(), results }, null, 1));
const fmt = (v) => (v == null ? "—" : `${v}`);
const rows = results.map((r) => {
  const f = r.findings, t = r.timing;
  const unc = f.uncoveredPageBSamples
    ? `js ${f.uncoveredPageBSamples.count} (${f.uncoveredPageBSamples.ts.slice(0, 6).join(",")}${f.uncoveredPageBSamples.count > 6 ? "…" : ""}) · img ${f.uncoveredPageBFrames?.count ?? "—"} (${(f.uncoveredPageBFrames?.ts ?? []).slice(0, 6).join(",")})${f.uncoveredPageBFrames?.spanMs ? ` ≈${f.uncoveredPageBFrames.spanMs}ms` : ""}`
    : (r.error ?? "—").split("\n")[0];
  const reflow = f.textReflowPx ? `${f.textReflowPx.pageB}px${f.textReflowPx.pageB > 2 ? " REFLOW" : ""}` : "—";
  return `| ${r.case} | ${r.vp} | ${fmt(t.clickToCoveredMs)} | ${fmt(t.holdMs)} | ${fmt(t.revealMs)}${t.revealMs != null && !f.revealFinished ? "?" : ""} | ${unc} | ${reflow} | ${r.verdict} |`;
});
const md = `# Curtain frame capture — X1 acceptance

Base ${BASE} · CPU throttle ${THROTTLE}× · ${new Date().toISOString()}
Criterion: no uncovered frame of page B before the hold, no wordmark reflow, one continuous reveal.
Times are ms relative to the click. "js" = rAF-tied page samples on page B before the panel covered it; "img" = screencast frames between the last covered page-A sample and the reveal onset whose thumbnail differs from a covered reference frame (mean |Δpx| > threshold, see frames.json).

| case | vp | click→covered ms | hold ms | reveal ms | uncovered page-B frames | text reflow | verdict |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

Frames: \`frames/<case>-<vp>/f<NNN>-<tMs>.jpg\` (mNN = negative t). Full samples and per-frame luminance in frames.json.
`;
writeFileSync(join(outdir, "frames.md"), md);
console.log(md);
process.exit(results.every((r) => r.verdict === "CLEAN") ? 0 : 1);
