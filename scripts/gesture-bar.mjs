#!/usr/bin/env node
/**
 * Round 33 — the bottom lane under a gesture bar, measured where this
 * container can measure it (docs/rounds/2026-09-22-round-33-plan.md).
 *
 * Chrome for Android (135+, Android 15+, gesture navigation) draws the page
 * to the screen's bottom edge and reports the gesture bar — 24px on Wil's
 * Pixel 6 — as env(safe-area-inset-bottom). Chromium's DevTools protocol
 * emulates exactly that (`Emulation.setSafeAreaInsetsOverride`; measured:
 * env() reads the override, before and after a reload), so this stands a bar
 * in front of the site at the Pixel's own page box — 412 CSS px wide, 819
 * tall (his screenshots: 2400 device px minus the 249 above the toolbar's
 * foot, at 2.625) — and reads every consumer of the lane:
 *
 *   · the tokens: --gesture-bar is the bar; --ui-inset-b is max(--ui-inset,
 *     gutter + bar) — 44 with a 24px bar, 20 (= --ui-inset) without one;
 *   · /            the frame's box ends 10 + bar above the edge, the CTA keeps
 *                  its 28 inside the frame;
 *   · /map         the walk door's lane (inset − 4, as a computed style AND as
 *                  the door's box against the UI layer's), the card strip's
 *                  padding, the Mapbox controls' bottom padding, the 1858
 *                  lens's, the scroll handle's height, the hint chip's offset;
 *   · /bakery      the hero lockup's inset (gutter + bar) and the title's box
 *                  against the hero's; the mini-player's utility;
 *   · /paintings   the dot rail's offset once the hall mounts (computed and
 *                  as its box against the stage's), the plaque drawer's peek
 *                  header and body padding, the card's and the menu's caps;
 *   · every page   the corner menu's top offset (--menu-inset) does not move.
 *
 * Two passes, bar 0 and bar 24. At 0 every number must be today's — the
 * tokens collapse, which is the proof that nothing moved where no bar is
 * reported (what qa:snap then holds at 0 drift); at 24 every bottom number
 * must be the lane's. Each capture is saved with the bar and the pill drawn
 * on it at the Pixel's geometry (bar 24; pill 4 tall, 10 from the edge) so
 * the composition can be judged by eye in node_modules/.cache/gesture-bar/.
 *
 * What only a phone can show: the inset Chrome reports on other Android
 * devices, the bar's own paint, and iOS — Chromium cannot fake
 * `-webkit-touch-callout`, so the iOS branch is proved by the CSS itself (the
 * two :root defaults are the whole iOS story) and by his iPhone.
 *
 *   node scripts/gesture-bar.mjs [--base http://localhost:4331]
 *        [--out node_modules/.cache/gesture-bar] [--bars 0,24]
 *   npm run qa:gesture
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const OUT = flag("out", "node_modules/.cache/gesture-bar");
const BARS = flag("bars", "0,24").split(",").map(Number);
const VP = { width: 412, height: 819 };
mkdirSync(OUT, { recursive: true });

const rows = [];
let failures = 0;
const check = (route, bar, name, actual, expected, tol = 0.5) => {
  const a = typeof actual === "number" ? actual : NaN;
  const ok = Number.isFinite(a) && Math.abs(a - expected) <= tol;
  if (!ok) failures++;
  rows.push({ route, bar, name, actual: Number.isFinite(a) ? +a.toFixed(2) : String(actual), expected: +expected.toFixed(2), ok: ok ? "ok" : "FAIL" });
};
const note = (route, bar, name, actual) => rows.push({ route, bar, name, actual: typeof actual === "number" ? +actual.toFixed(2) : String(actual), expected: "", ok: "note" });

/* ── in-page readers ─────────────────────────────────────────────────────── */
const readTokens = () => {
  const cs = getComputedStyle(document.documentElement);
  const px = (p) => parseFloat(cs.getPropertyValue(p));
  const probe = (css) => {
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:0;top:0;${css}`;
    document.body.appendChild(d);
    const r = d.getBoundingClientRect();
    d.remove();
    return r;
  };
  return {
    gutter: probe("width:var(--gutter);height:1px").width,
    sab: probe("width:1px;height:env(safe-area-inset-bottom, 0px)").height,
    uiInset: px("--ui-inset"),
    uiInsetB: px("--ui-inset-b"),
    gestureBar: px("--gesture-bar"),
    menuTop: (() => {
      const m = document.querySelector(".cnwm-menu");
      return m ? parseFloat(getComputedStyle(m).top) : null;
    })(),
  };
};
/* installed on window before each reading — the measure functions below run
   in the page and reach these as globals */
const installHelpers = () => {
  /* a probe element wearing a class (or classes) — for rules whose element is
     not on screen at rest (the drawer, the card, the menu panel, a utility) */
  window.readProbe = (className, prop, attrs = {}, childClass = null) => {
    const d = document.createElement("div");
    d.className = className;
    for (const [k, v] of Object.entries(attrs)) d.setAttribute(k, v);
    let target = d;
    if (childClass) {
      target = document.createElement("div");
      target.className = childClass;
      d.appendChild(target);
    }
    document.body.appendChild(d);
    const v = parseFloat(getComputedStyle(target)[prop]);
    d.remove();
    return v;
  };
  window.cssPx = (sel, prop) => {
    const el = document.querySelector(sel);
    return el ? parseFloat(getComputedStyle(el)[prop]) : null;
  };
};

const ROUTES = [
  {
    route: "/",
    ready: async (page) => page.waitForSelector(".home-cta", { timeout: 10000 }),
    measure: (t) => {
      const frame = document.querySelector(".home-frame");
      const outer = frame?.parentElement?.parentElement;
      const cta = document.querySelector(".home-cta");
      const fr = frame?.getBoundingClientRect();
      const cr = cta?.getBoundingClientRect();
      return {
        "outer box padding-bottom": outer ? parseFloat(getComputedStyle(outer).paddingBottom) : null,
        "frame bottom → viewport edge": fr ? innerHeight - fr.bottom : null,
        "CTA bottom → frame bottom": fr && cr ? fr.bottom - cr.bottom : null,
        "CTA bottom → viewport edge": cr ? innerHeight - cr.bottom : null,
      };
    },
    expect: (t, bar) => ({
      "outer box padding-bottom": 10 + bar,
      "frame bottom → viewport edge": 10 + bar,
      "CTA bottom → frame bottom": Math.max(28, bar),
      "CTA bottom → viewport edge": 10 + bar + Math.max(28, bar),
    }),
  },
  {
    route: "/map",
    ready: async (page) => page.waitForSelector(".map-walk-door", { timeout: 15000 }),
    measure: (t) => {
      const root = document.querySelector(".troymap-root");
      const door = document.querySelector(".map-walk-door");
      const rr = root?.getBoundingClientRect();
      const dr = door?.getBoundingClientRect();
      /* the hint chip opens only once the style has loaded, which the egress
         policy blocks here — its offset is a static utility, so a probe wears it */
      const topLeft = Array.from(document.querySelectorAll(".troymap-root button")).find((b) => /See Troy in 1858/.test(b.textContent || ""));
      const topLeftBox = topLeft?.closest('[class*="top-["]') || topLeft;
      return {
        "walk door bottom (computed)": cssPx(".map-walk-door", "bottom"),
        "walk door box → UI layer bottom": rr && dr ? rr.bottom - dr.bottom : null,
        "card strip padding-bottom": cssPx(".map-cards", "paddingBottom"),
        "Mapbox bottom-right padding-bottom": cssPx(".mapboxgl-ctrl-bottom-right", "paddingBottom"),
        "Mapbox bottom-left padding-bottom": cssPx(".mapboxgl-ctrl-bottom-left", "paddingBottom"),
        "1858 lens shell padding-bottom": cssPx(".lens-shell", "paddingBottom"),
        "scroll handle height": cssPx(".map-scroll-handle", "height"),
        "hint chip utility bottom-[calc(var(--ui-inset-b)+156px)]": readProbe("absolute bottom-[calc(var(--ui-inset-b)+156px)]", "bottom"),
        "note: top-left door top (--ui-inset, unchanged by round 33)": topLeftBox ? parseFloat(getComputedStyle(topLeftBox).top) : "absent",
      };
    },
    expect: (t, bar) => ({
      "walk door bottom (computed)": t.uiInsetB - 4,
      "walk door box → UI layer bottom": t.uiInsetB - 4,
      "card strip padding-bottom": t.uiInsetB - 4,
      "Mapbox bottom-right padding-bottom": t.uiInsetB,
      "Mapbox bottom-left padding-bottom": t.uiInsetB,
      "1858 lens shell padding-bottom": t.uiInsetB,
      "scroll handle height": t.uiInsetB + 84,
      "hint chip utility bottom-[calc(var(--ui-inset-b)+156px)]": t.uiInsetB + 156,
    }),
  },
  {
    route: "/bakery",
    ready: async (page) => page.waitForSelector(".hero-lockup-shell", { timeout: 15000 }),
    measure: (t) => {
      const hero = document.getElementById("hero");
      const h1 = document.querySelector(".chapter-hero-h1");
      const hr = hero?.getBoundingClientRect();
      const tr = h1?.getBoundingClientRect();
      const fs = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
      return {
        "hero lockup padding-bottom": cssPx(".hero-lockup-shell", "paddingBottom"),
        "title box bottom → hero bottom": hr && tr ? hr.bottom - tr.bottom : null,
        "title slack (0.073em) used above": 0.073 * fs,
        "hero bottom → viewport edge": hr ? innerHeight - hr.bottom : null,
        "mini-player utility bottom-[var(--ui-inset-b)]": readProbe("fixed bottom-[var(--ui-inset-b)]", "bottom"),
      };
    },
    expect: (t, bar, m) => ({
      "hero lockup padding-bottom": t.gutter + bar,
      "title box bottom → hero bottom": t.gutter + bar - m["title slack (0.073em) used above"],
      "hero bottom → viewport edge": 0,
      "mini-player utility bottom-[var(--ui-inset-b)]": t.uiInsetB,
    }),
  },
  {
    route: "/paintings",
    ready: async (page) => {
      await page.waitForFunction(() => Boolean(window.__museum), null, { timeout: 30000 }).catch(() => {});
      await page.waitForSelector(".museum-stage nav", { timeout: 15000 }).catch(() => {});
    },
    measure: (t) => {
      const stage = document.querySelector(".museum-stage");
      const nav = document.querySelector(".museum-stage nav");
      const rail = nav?.parentElement;
      const sr = stage?.getBoundingClientRect();
      const rr = rail?.getBoundingClientRect();
      return {
        "dot rail bottom (computed)": rail ? parseFloat(getComputedStyle(rail).bottom) : "hall not mounted",
        "dot rail box → stage bottom": sr && rr ? sr.bottom - rr.bottom : "hall not mounted",
        "drawer peek header padding-bottom": readProbe("museum-sheet", "paddingBottom", { "data-state": "peek" }, "museum-sheet-head"),
        "drawer body padding-bottom": readProbe("museum-sheet-body pb-[calc(var(--ui-inset-b)+8px)]", "paddingBottom"),
        "plaque card max-height": readProbe("museum-card", "maxHeight"),
        "menu panel max-height": readProbe("cnwm-menu-panel", "maxHeight"),
      };
    },
    expect: (t, bar) => ({
      "dot rail bottom (computed)": t.uiInsetB,
      "dot rail box → stage bottom": t.uiInsetB,
      "drawer peek header padding-bottom": t.uiInsetB + 1,
      "drawer body padding-bottom": t.uiInsetB + 8,
      "plaque card max-height": VP.height - t.uiInset - t.uiInsetB,
      "menu panel max-height": VP.height - t.uiInset - t.uiInsetB,
    }),
  },
];

/* the Pixel's bar and pill, drawn for the eye only — after every reading */
const drawBar = (bar) => {
  if (!bar) return;
  const z = document.createElement("div");
  z.style.cssText = `position:fixed;left:0;right:0;bottom:0;height:${bar}px;background:rgba(255,255,255,.08);z-index:2147483647;pointer-events:none`;
  const pill = document.createElement("div");
  pill.style.cssText = "position:fixed;left:50%;bottom:10px;width:108px;height:4px;margin-left:-54px;border-radius:2px;background:#fff;z-index:2147483647;pointer-events:none";
  document.body.append(z, pill);
};

const browser = await chromium.launch({ args: ["--use-gl=angle", "--autoplay-policy=no-user-gesture-required"] });
for (const bar of BARS) {
  const ctx = await browser.newContext({
    viewport: VP,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
    locale: "en-US",
    timezoneId: "America/New_York",
  });
  for (const R of ROUTES) {
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, right: 0, bottom: bar, left: 0 } });
    await page.goto(BASE + R.route, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await R.ready(page).catch(() => {});
    await page.waitForTimeout(1200);
    await page.evaluate(installHelpers);
    const t = await page.evaluate(readTokens);
    check(R.route, bar, "env(safe-area-inset-bottom)", t.sab, bar);
    check(R.route, bar, "--gesture-bar", t.gestureBar, bar);
    check(R.route, bar, "--ui-inset (max of gutter and insets, pre-existing)", t.uiInset, Math.max(t.gutter, bar));
    check(R.route, bar, "--ui-inset-b = max(--ui-inset, gutter + bar)", t.uiInsetB, Math.max(t.uiInset, t.gutter + bar));
    if (bar === 0) check(R.route, bar, "--ui-inset-b collapses to --ui-inset (today's 20)", t.uiInsetB, 20);
    if (t.menuTop !== null) check(R.route, bar, "corner menu top (--menu-inset, must not move)", t.menuTop, t.gutter);
    const m = await page.evaluate(R.measure, t);
    const e = R.expect(t, bar, m);
    for (const [k, v] of Object.entries(m)) {
      if (k in e) check(R.route, bar, k, typeof v === "number" ? v : NaN, e[k], /box|→/.test(k) ? 1 : 0.5);
      else note(R.route, bar, k, v);
      if (typeof v !== "number" && k in e) rows[rows.length - 1].actual = String(v);
    }
    await page.evaluate(drawBar, bar);
    const slug = R.route === "/" ? "home" : R.route.slice(1);
    await page.screenshot({ path: join(OUT, `${slug}--bar${bar}.png`) });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const w = Math.max(...rows.map((r) => r.name.length));
for (const r of rows) console.log(`${r.ok.padEnd(4)} ${String(r.bar).padStart(2)}px ${r.route.padEnd(10)} ${r.name.padEnd(w)} ${String(r.actual).padStart(8)} ${r.expected === "" ? "" : "  expected " + r.expected}`);
const checks = rows.filter((r) => r.ok !== "note").length;
console.log(`\ngesture-bar: ${checks} checks, ${failures} failed — captures in ${OUT}/`);
process.exit(failures ? 1 : 0);
