#!/usr/bin/env node
/**
 * Round 36 — Skip holds still while the reader pans the hall
 * (docs/rounds/2026-09-22-round-36-plan.md).
 *
 * Why this exists: Wil, 2026-09-22 — "the skip button in the hall now moves
 * its position when panning around the paintings hall … it should never
 * happen." Skip sat on `--ui-inset`, the lane every corner shares, which
 * takes the deepest of the four safe areas; `env(safe-area-inset-bottom)`
 * is 0 with Safari's bars expanded and 34px once they collapse (playbook §1),
 * and a pan on the hall with any vertical drift is a page scroll (the canvas
 * keeps `touch-action: pan-y` — the walk), which moves the bars. So Skip
 * jumped 14px right and 14px down on every pan. It now reads `--skip-inset`
 * (the gutter, the top inset and the left inset — round 23's rule for the
 * top-right menu, mirrored), and this instrument proves the corner holds
 * under everything a pan can do, where Chromium can do it:
 *
 * At 390×645 (the iOS layout viewport with the bars expanded; touch, mobile)
 * with the bars stood in (`--museum-b: 110px`, `--museum-pin: 100svh`, as
 * museum-runway.mjs does) and without, the stage pinned at rail 0.4:
 *   · Skip's box at rest is the gutter square (20/20), the same with and
 *     without the stand-in, and equal to `--ui-inset` — the no-bars
 *     guarantee: nothing changes where no safe area is set.
 *   · A horizontal touch drag on the canvas (240px, the look): Skip's box is
 *     identical mid-drag, just after, and after the coast; Face forward
 *     appears (the drag reached the look controller).
 *   · A vertical touch drag (160px, pan-y — the walk): the page scrolled
 *     (railT moved) and Skip's box is identical.
 *   · A diagonal drag; a scripted 120px page scroll; the viewport at 753
 *     (the bars minimized): identical.
 *   · The collapsed bars' safe area (CDP Emulation.setSafeAreaInsetsOverride,
 *     bottom 34): Skip identical — the fix — while the bottom-centre column
 *     (the dot rail, on the bottom lane `--ui-inset-b` by design — round 33:
 *     `--ui-inset` on iOS, the gutter above the bar elsewhere) rises by the
 *     lane's growth and the top-right menu (round 23) holds; cleared,
 *     everything is back at rest.
 *   · No page errors.
 * At 1440×900 and 768×1024 with no stand-in: Skip at rest sits on the
 * gutter and equals `--ui-inset` (56 / 40).
 *
 *   node scripts/museum-skip.mjs [--base http://localhost:4331] [--out node_modules/.cache/museum-skip]
 *
 * Output: <out>/skip.json + skip.md. Exit 1 on any failed assertion.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
if (args.includes("--help") || args.includes("-h")) {
  console.log("usage: node scripts/museum-skip.mjs [--base URL] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const OUT = flag("out", "node_modules/.cache/museum-skip");
const B = 110;
mkdirSync(OUT, { recursive: true });

const results = [];
let failures = 0;
const check = (session, pos, name, ok, detail = "") => {
  results.push({ session, pos, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;
const r1 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : v);
const same = (a, b) => !!a && !!b && near(a.top, b.top, 0.5) && near(a.left, b.left, 0.5) && near(a.width, b.width, 0.5) && near(a.height, b.height, 0.5);
const box = (r) => (r ? `${r1(r.left)}/${r1(r.top)} ${r1(r.width)}×${r1(r.height)}` : "absent");

/* What the page reports, in one evaluate. */
const STATE = () => {
  const h = window.__museum;
  if (!h) return { missing: true };
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom };
  };
  const skip = document.querySelector('[aria-label="Skip the hall"]');
  const stage = document.querySelector(".museum-stage");
  const cs = getComputedStyle(document.documentElement);
  return {
    scrollY: window.scrollY,
    innerH: innerHeight,
    uiInset: parseFloat(cs.getPropertyValue("--ui-inset")) || 0,
    uiInsetB: parseFloat(cs.getPropertyValue("--ui-inset-b")) || 0,
    /* the token itself is unregistered (a token stream to getPropertyValue,
       like --menu-inset); Skip's computed offsets are the resolved value */
    skipLeft: skip ? parseFloat(getComputedStyle(skip.parentElement).left) : NaN,
    skipTop: skip ? parseFloat(getComputedStyle(skip.parentElement).top) : NaN,
    skip: rect(skip && skip.parentElement),
    stage: rect(stage),
    menu: rect(document.querySelector(".cnwm-menu")),
    dots: rect(stage && stage.querySelector("nav")),
    faceForward: [...document.querySelectorAll(".museum-stage button")].some((b) => b.textContent.trim() === "Face forward"),
    railT: h.state ? h.state.railT : null,
    mode: h.state ? h.state.mode : null,
  };
};
const SCROLL_TO_RAIL = (t) => {
  const stage = document.querySelector(".museum-stage");
  const wrap = stage.closest(".museum-wrap");
  const r = wrap.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const total = r.height - stage.clientHeight;
  window.scrollTo({ top: Math.round(top + t * total), behavior: "instant" });
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });

async function open(vp, standIn, touch) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
  if (standIn) {
    await ctx.addInitScript((b) => {
      const add = () => {
        const st = document.createElement("style");
        st.textContent = `.museum-wrap{--museum-b:${b}px !important;--museum-pin:100svh !important}`;
        (document.head || document.documentElement).appendChild(st);
      };
      if (document.documentElement) add();
      else
        new MutationObserver((_, o) => {
          if (!document.documentElement) return;
          o.disconnect();
          add();
        }).observe(document, { childList: true });
    }, B);
  }
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160));
  });
  await page.goto(`${BASE}/paintings`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => window.__museum, { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await page.evaluate(SCROLL_TO_RAIL, 0.4);
  await page.waitForFunction(() => !!document.querySelector('[aria-label="Skip the hall"]'), null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(700);
  return { ctx, page, errs };
}

/* A touch drag on the canvas through CDP, sampled mid-drag, just after, and
   after the look's coast. */
async function drag(cdp, page, from, to, steps = 14, ms = 220) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
  let mid = null;
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }] });
    await page.waitForTimeout(ms / steps);
    if (i === Math.floor(steps / 2)) mid = await page.evaluate(STATE);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(150);
  const after = await page.evaluate(STATE);
  await page.waitForTimeout(900);
  const coast = await page.evaluate(STATE);
  return { mid, after, coast };
}

const PHONE = { w: 390, h: 645 };
const phoneRest = {};
for (const session of ["off", "on"]) {
  const { ctx, page, errs } = await open(PHONE, session === "on", true);
  const rest = await page.evaluate(STATE);
  check(session, "rest", "hall mounted, stage pinned", !rest.missing && rest.stage && near(rest.stage.top, 0, 0.5), rest.missing ? "no __museum" : `stage top ${r1(rest.stage && rest.stage.top)}`);
  if (rest.missing || !rest.skip) {
    check(session, "rest", "Skip present", false, "absent");
    await ctx.close();
    continue;
  }
  phoneRest[session] = rest;
  check(session, "rest", "Skip on the gutter square, = --ui-inset", near(rest.skip.top, rest.uiInset, 0.5) && near(rest.skip.left, rest.uiInset, 0.5) && near(rest.skipLeft, rest.uiInset, 0.5) && near(rest.skipTop, rest.uiInset, 0.5), `${box(rest.skip)} · --ui-inset ${r1(rest.uiInset)} · computed top/left ${r1(rest.skipTop)}/${r1(rest.skipLeft)}`);
  if (session === "on") check(session, "rest", "identical to the no-stand-in box", same(rest.skip, phoneRest.off && phoneRest.off.skip), `${box(rest.skip)} vs ${box(phoneRest.off && phoneRest.off.skip)}`);

  const cdp = await ctx.newCDPSession(page);
  /* the look: a horizontal drag */
  const yaw = await drag(cdp, page, { x: 300, y: 380 }, { x: 60, y: 380 });
  check(session, "look", "Skip identical mid-drag, after, and after the coast", same(yaw.mid.skip, rest.skip) && same(yaw.after.skip, rest.skip) && same(yaw.coast.skip, rest.skip), `${box(yaw.mid.skip)} · ${box(yaw.after.skip)} · ${box(yaw.coast.skip)}`);
  check(session, "look", "the drag reached the look (Face forward shown)", yaw.coast.faceForward, `faceForward ${yaw.coast.faceForward}`);
  check(session, "look", "the page did not scroll", near(yaw.coast.scrollY, rest.scrollY, 0.5), `${r1(yaw.coast.scrollY)} vs ${r1(rest.scrollY)}`);
  await page.evaluate(() => window.__museum.recenter && window.__museum.recenter());
  await page.waitForTimeout(800);
  /* the walk: a vertical drag, pan-y */
  const walk = await drag(cdp, page, { x: 195, y: 300 }, { x: 195, y: 460 });
  check(session, "walk", "the vertical drag scrolled the page (pan-y)", !near(walk.coast.scrollY, rest.scrollY, 2) && walk.coast.railT !== rest.railT, `scrollY ${r1(rest.scrollY)} → ${r1(walk.coast.scrollY)} · railT ${r1(rest.railT)} → ${r1(walk.coast.railT)}`);
  check(session, "walk", "Skip identical mid-drag, after, and after the coast", same(walk.mid.skip, rest.skip) && same(walk.after.skip, rest.skip) && same(walk.coast.skip, rest.skip), `${box(walk.mid.skip)} · ${box(walk.after.skip)} · ${box(walk.coast.skip)}`);
  check(session, "walk", "stage still pinned", near(walk.coast.stage.top, 0, 0.5), `stage top ${r1(walk.coast.stage.top)}`);
  /* a diagonal drag */
  const diag = await drag(cdp, page, { x: 300, y: 300 }, { x: 100, y: 440 });
  check(session, "diagonal", "Skip identical mid-drag, after, and after the coast", same(diag.mid.skip, rest.skip) && same(diag.after.skip, rest.skip) && same(diag.coast.skip, rest.skip), `${box(diag.mid.skip)} · ${box(diag.after.skip)} · ${box(diag.coast.skip)}`);
  await page.evaluate(() => window.__museum.recenter && window.__museum.recenter());
  await page.evaluate(SCROLL_TO_RAIL, 0.4);
  await page.waitForTimeout(700);
  /* a scripted scroll */
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));
  await page.waitForTimeout(400);
  const scrolled = await page.evaluate(STATE);
  check(session, "scroll +120", "Skip identical", same(scrolled.skip, rest.skip), box(scrolled.skip));
  /* the bars minimized: the viewport grows to 753 */
  await page.setViewportSize({ width: 390, height: 753 });
  await page.waitForTimeout(600);
  const tall = await page.evaluate(STATE);
  check(session, "viewport 753", "Skip identical", same(tall.skip, rest.skip) && tall.innerH === 753, `${box(tall.skip)} · innerHeight ${tall.innerH}`);
  /* the collapsed bars' safe area */
  let overrode = true;
  try {
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { bottom: 34 } });
  } catch (e) {
    overrode = false;
    check(session, "inset 34", "CDP safe-area override available", false, String(e).slice(0, 120));
  }
  if (overrode) {
    await page.waitForTimeout(600);
    const inset = await page.evaluate(STATE);
    check(session, "inset 34", "--ui-inset took the bottom inset (34)", near(inset.uiInset, 34, 0.5), `--ui-inset ${r1(inset.uiInset)}`);
    check(session, "inset 34", "Skip identical (the fix)", same(inset.skip, rest.skip), `${box(inset.skip)} vs ${box(rest.skip)}`);
    check(session, "inset 34", "the dot rail rose with the bottom lane (--ui-inset-b, by design)", inset.dots && tall.dots && inset.uiInsetB > tall.uiInsetB && near(tall.dots.top - inset.dots.top, inset.uiInsetB - tall.uiInsetB, 0.5), `${r1(tall.dots && tall.dots.top)} → ${r1(inset.dots && inset.dots.top)} · lane ${r1(tall.uiInsetB)} → ${r1(inset.uiInsetB)}`);
    check(session, "inset 34", "the top-right menu holds (round 23)", same(inset.menu, tall.menu), `${box(inset.menu)} vs ${box(tall.menu)}`);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: {} }).catch(() => {});
  }
  await page.setViewportSize({ width: 390, height: 645 });
  await page.waitForTimeout(600);
  const back = await page.evaluate(STATE);
  check(session, "back at rest", "Skip identical", same(back.skip, rest.skip) && near(back.uiInset, rest.uiInset, 0.5), `${box(back.skip)} · --ui-inset ${r1(back.uiInset)}`);
  check(session, "-", "no page errors", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

/* No bars, no touch: the gutter is the inset, as before. */
for (const vp of [
  { w: 1440, h: 900, name: "desktop" },
  { w: 768, h: 1024, name: "tablet" },
]) {
  const { ctx, page, errs } = await open(vp, false, false);
  const rest = await page.evaluate(STATE);
  check(vp.name, "rest", "hall mounted", !rest.missing && !!rest.skip, rest.missing ? "no __museum" : rest.skip ? "" : "Skip absent");
  if (!rest.missing && rest.skip) {
    check(vp.name, "rest", "Skip on the gutter square, = --ui-inset", near(rest.skip.top, rest.uiInset, 0.5) && near(rest.skip.left, rest.uiInset, 0.5) && near(rest.skipLeft, rest.uiInset, 0.5) && near(rest.skipTop, rest.uiInset, 0.5), `${box(rest.skip)} · --ui-inset ${r1(rest.uiInset)} · computed top/left ${r1(rest.skipTop)}/${r1(rest.skipLeft)}`);
  }
  check(vp.name, "rest", "no page errors", errs.length === 0, errs.join(" | "));
  await ctx.close();
}

await browser.close();

const md = [
  "# museum-skip — Skip holds still while the reader pans the hall",
  "",
  `Base ${BASE} · stand-in B ${B}px · ${results.length} checks · ${failures} failed`,
  "",
  "| session | position | check | ok | detail |",
  "|---|---|---|---|---|",
  ...results.map((r) => `| ${r.session} | ${r.pos} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail.replace(/\|/g, "\\|")} |`),
  "",
].join("\n");
writeFileSync(join(OUT, "skip.json"), JSON.stringify({ base: BASE, b: B, results, failures }, null, 2));
writeFileSync(join(OUT, "skip.md"), md);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  [${r.session} · ${r.pos}] ${r.name}${r.detail ? " — " + r.detail : ""}`);
console.log(`\n${results.length - failures}/${results.length} passed → ${join(OUT, "skip.md")}`);
process.exit(failures ? 1 : 0);
