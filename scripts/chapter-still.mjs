#!/usr/bin/env node
/**
 * Rounds 38–44 — the chapter pages under Safari's bars, measured
 * (docs/rounds/2026-09-22-round-44-plan.md; the modes are round 23's:
 * docs/rounds/2026-09-18-round-23-plan.md).
 *
 * Why this exists: how the five chapter pages sit under Safari's bars was
 * settled on Wil's phone over three modes, and this instrument re-measures
 * all three on any tree, in Chromium, with the iOS gate stood in from an init
 * script (`CSS.supports("-webkit-touch-callout", "none")` → true, which is
 * what the head script in Base.astro tests). Chromium never takes the gate on
 * its own, so the visual gate sees the plain document; this is the only
 * instrument that exercises the iOS defaults.
 *
 * THE RUNWAY — the phone default since round 44 (Wil, 9/22, on the Bakery
 * under the flag: "the way everything works on the bakery page is how it
 * should work on every chapter page … this is done"). The document scrolls a
 * solid runway (`<body>`, sized to the chapter, carrying the section's colour
 * from the sampler — the top bar's solid fill, and Safari's fill for the
 * returning toolbar), so both bars collapse and return; the chapter rides in
 * a fixed, clipped `<main>` whose `#reader` the script moves by −scrollY. At
 * 390×844 (the screen's shorter side under 700 → `data-scroll="sync"`), on
 * all five chapters:
 *   · the mode; `<main>` fixed and clipped at the viewport; the document as
 *     tall as the chapter (`<body>` and `#reader` the same height); the reader
 *     at 0 at rest and exactly −scrollY after a scroll and at the transcript;
 *   · the rail out of the moving box (a child of `<body>`, fixed, at the top
 *     edge, 3px) and holding the edge while the document scrolls; the cover
 *     hidden;
 *   · `<body>` the hero's brown #1d1411 at rest, the transcript's cream
 *     #f6f3ee with the transcript at the top edge, brown again at the top;
 *   · the menu one gutter below the rail, retreating on a forward scroll; the
 *     hero lockup's scrub against the document; the mini player portaled out
 *     of `<main>` after a real play; no page errors.
 * THE STILL DOCUMENT — the iPad default (768+: its toolbar never collapses)
 * and `?scroll=inner`, approved 9/19–9/20: `<html>` clips, `<main>` is the
 * scroller (the layout viewport plus the toolbar's run E under the bottom
 * bar), the document holds still. At 390 under the flag with the phone's E
 * stood in (`--reader-e: 129px`, playbook §1 — the CSS `@supports` block that
 * sets E is Safari's alone), on all five chapters: the mode, the document
 * still (its only overflow E, clipped, pinned at 0 against scripts), `<main>`
 * the scroller at the viewport + E, the hero one small viewport with E below
 * it and the first scene below the toolbar's run, the rail inside `<main>` at
 * the top edge (3px, bare), the reader wrapper inert (no transform), the
 * cover hidden, the colours as above with `<main>` scrolled, the menu, the
 * scrub against `<main>`, the mini player inside the island (no portal), no
 * page errors; at 768 the mode by default with E = 0.
 * Deep links: `#history` lands by scrolling the document (the runway) and
 * inside `<main>` (the still document), the document at 0 there.
 * A top safe-area inset (iOS 26 reports one once its bars have moved in a
 * scrolling document — round 41's read), emulated over CDP at 12: the rail
 * rides it in both modes; the menu follows it in the runway (one gutter below
 * the rail, 32) and keeps round 23's `max()` in the still document (20).
 * Off the gate (Chromium as it is), 390×844 and 1440×900: no `data-scroll`,
 * the document scrolls, `<main>` is not a scroller, the cover hidden — what
 * every non-iOS visitor and the visual gate see. The flags: `?scroll=inner`
 * and `?scroll=sync` engage their modes in Chromium (the rules key on the
 * attribute alone); `?scroll=doc` under the gate leaves the document
 * scrolling.
 *
 *   node scripts/chapter-still.mjs [--base http://localhost:4331] [--out node_modules/.cache/chapter-still]
 *   npm run qa:still
 *
 * Output: <out>/still.json + still.md. Exit 1 on any failed assertion.
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
  console.log("usage: node scripts/chapter-still.mjs [--base URL] [--out dir]");
  process.exit(0);
}
const BASE = flag("base", "http://localhost:4331").replace(/\/$/, "");
const OUT = flag("out", "node_modules/.cache/chapter-still");
mkdirSync(OUT, { recursive: true });

const CHAPTERS = ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"];
/* the phone's toolbar run under the bottom bar (playbook §1: E = 129 on
   Wil's iPhone, the value every round-23 probe stood in) */
const E = 129;
const BROWN = "rgb(29, 20, 17)"; // #1d1411 — the page ground and the heroes' ground
const CREAM = "rgb(246, 243, 238)"; // #f6f3ee — the transcript's cream

const results = [];
let failures = 0;
const check = (session, name, ok, detail = "") => {
  results.push({ session, name, ok: !!ok, detail: String(detail) });
  if (!ok) failures++;
};
const near = (a, b, tol) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;
const r1 = (v) => (typeof v === "number" ? Math.round(v * 10) / 10 : v);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* The iOS gate, stood in before any page script runs: the head script asks
   `CSS.supports("-webkit-touch-callout", "none")`. Everything else CSS.supports
   answers is left alone. */
const GATE = `(() => {
  const real = CSS.supports.bind(CSS);
  CSS.supports = function (a, b) {
    if (b === undefined) return /-webkit-touch-callout/.test(String(a)) || real(a);
    return String(a) === "-webkit-touch-callout" || real(a, b);
  };
})();`;
/* The phone's E, which only Safari's own @supports block sets. */
const STAND_IN_E = `html[data-scroll="inner"] main#main { --reader-e: ${E}px !important; }`;
/* An init script runs before <html> exists, so a stand-in sheet is appended
   the moment the root element appears (the visual gate's own idiom). */
const STAND_IN = (css) => {
  const add = () => {
    const s = document.createElement("style");
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  };
  if (document.documentElement) add();
  else
    new MutationObserver((_, o) => {
      if (!document.documentElement) return;
      o.disconnect();
      add();
    }).observe(document, { childList: true });
};

/* What the page reports, in one evaluate. */
const STATE = () => {
  const html = document.documentElement;
  const main = document.getElementById("main");
  const rail = document.querySelector(".walk-rail-static");
  const cover = document.querySelector(".edge-cover");
  const hero = document.getElementById("hero");
  const scene0 = document.getElementById("scene-0");
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom };
  };
  const mini = [...document.querySelectorAll("div.fixed")].find((d) => /z-\[999\]/.test(d.className) && /bottom-\[var\(--ui-inset-b\)\]/.test(d.className));
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  const menu = document.querySelector(".cnwm-menu");
  return {
    scroll: html.dataset.scroll || "",
    docScrollHeight: html.scrollHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    htmlOverflow: cs(html).overflowY,
    mainPosition: cs(main).position,
    mainOverflowY: cs(main).overflowY,
    mainHeight: rect(main).height,
    mainScrollHeight: main.scrollHeight,
    mainScrollTop: main.scrollTop,
    mainBg: cs(main).backgroundColor,
    heroHeight: hero ? rect(hero).height : NaN,
    heroMarginBottom: hero ? parseFloat(cs(hero).marginBottom) : NaN,
    scene0Top: scene0 ? rect(scene0).top : NaN,
    railInMain: !!(rail && rail.closest("main#main")),
    railParent: rail && rail.parentElement ? rail.parentElement.tagName.toLowerCase() + (rail.parentElement.id ? "#" + rail.parentElement.id : "") : "absent",
    railHeight: rail ? rect(rail).height : NaN,
    railTop: rail ? rect(rail).top : NaN,
    railPosition: rail ? cs(rail).position : "",
    coverDisplay: cover ? cs(cover).display : "absent",
    /* what earlier passes left behind and must never come back unasked */
    residue: ["#runway", ".edge-trigger", ".runway-cap", "[slot='chrome']"].filter((s) => document.querySelector(s)),
    reader: (() => {
      const r = document.getElementById("reader");
      if (!r) return null;
      const t = cs(r).transform;
      const m = /matrix\(([^)]+)\)/.exec(t);
      const ty = m ? parseFloat(m[1].split(",")[5]) : t === "none" ? 0 : NaN;
      return { transform: t, ty, height: rect(r).height };
    })(),
    bodyHeight: parseFloat(cs(document.body).height),
    bodyBg: cs(document.body).backgroundColor,
    meta: meta ? meta.getAttribute("content") : "",
    menuHidden: menu ? menu.dataset.hidden || "false" : "absent",
    menuTop: menu ? rect(menu).top : NaN,
    menuRightGap: menu ? window.innerWidth - rect(menu).left - rect(menu).width : NaN,
    lockupOpacity: (() => {
      const l = document.getElementById("hero-lockup");
      return l ? parseFloat(cs(l).opacity) : NaN;
    })(),
    miniInMain: mini ? !!mini.closest("main#main") : null,
    miniPosition: mini ? cs(mini).position : "",
    miniBottom: mini ? parseFloat(cs(mini).bottom) : NaN,
    historyTop: (() => {
      const h = document.getElementById("history");
      return h ? rect(h).top : NaN;
    })(),
  };
};
/* Scroll the still document's <main> by steps, so the corner menu's
   direction counters see real events (a single jump is one event). */
const SCROLL_MAIN = async (page, to, steps = 6) => {
  const from = await page.evaluate(() => document.getElementById("main").scrollTop);
  for (let i = 1; i <= steps; i++) {
    const y = Math.round(from + ((to - from) * i) / steps);
    await page.evaluate((v) => {
      document.getElementById("main").scrollTop = v;
    }, y);
    await sleep(40);
  }
};
/* Where the transcript's cream block sits: its top in <main>'s scroll space. */
const CREAM_TOP = () => {
  const main = document.getElementById("main");
  const el = document.querySelector("#main .ground-cream");
  if (!el) return null;
  return el.getBoundingClientRect().top + main.scrollTop;
};
/* The document scrolled so the transcript's cream block sits at the top edge
   (the scrolling modes). In the runway the box is placed a frame late, so
   the target is read from the reader's own rect. */
const DOC_TO_CREAM = () => {
  const el = document.querySelector("#main .ground-cream");
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY + 60;
  window.scrollTo({ top, behavior: "instant" });
  return top;
};
const errorsOf = (page) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e && e.message ? e.message : e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
};
const settle = async (page) => {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await sleep(500);
};
const settledLockup = async (page) => {
  let s = await page.evaluate(STATE);
  for (let i = 0; i < 12 && !(s.lockupOpacity > 0.95); i++) {
    await sleep(200);
    s = await page.evaluate(STATE);
  }
  return s;
};
/* A real play on the main control; the latch that mounts the mini player.
   The control is brought into the viewport by the mode's own scroller: in
   the runway the document scrolls and the reader follows on the scroll
   event, so the browser's scrollIntoView (which knows nothing of the
   translate) cannot reach it — the window is scrolled by the control's
   runway position instead; in the still document <main> is the scroller
   and scrollIntoView reaches it. If the audio cannot play here the latch
   never sets and the check is recorded as not exercised, not failed. */
const latchMini = async (page, session) => {
  const playBtn = await page.$('button[aria-label^="Play narration"]');
  let latched = false;
  let why = playBtn ? "no latch" : "no play button";
  if (playBtn) {
    const mode = await page.evaluate(() => document.documentElement.dataset.scroll || "");
    if (mode === "sync") {
      await playBtn.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, r.top + window.scrollY - (window.innerHeight - r.height) / 2), behavior: "instant" });
      });
    } else {
      await playBtn.scrollIntoViewIfNeeded().catch(() => {});
    }
    await sleep(700);
    const box = await playBtn.boundingBox();
    const vh = await page.evaluate(() => window.innerHeight);
    if (box && box.y >= 0 && box.y + box.height <= vh) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      for (let i = 0; i < 20 && !latched; i++) {
        await sleep(250);
        latched = await page.evaluate(() => !![...document.querySelectorAll("div.fixed")].find((d) => /z-\[999\]/.test(d.className)));
      }
    } else why = box ? `control off-screen (y ${Math.round(box.y)} of ${vh})` : "no box";
  }
  if (!latched) results.push({ session, name: "the mini player (audio did not play here — not exercised)", ok: true, detail: why });
  return latched;
};
const phoneContext = (browser, extra = {}) =>
  browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: "no-preference", ...extra });

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  /* ── 1 · the runway: the phone default, on all five chapters ─────────── */
  for (const slug of CHAPTERS) {
    const session = `${slug} 390 gate (runway, default)`;
    const ctx = await phoneContext(browser);
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/${slug}`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "data-scroll is sync (the phone default)", s.scroll === "sync", s.scroll || "(none)");
    check(session, "<main> is fixed and clipped at the viewport (844)", s.mainPosition === "fixed" && s.mainOverflowY === "clip" && near(s.mainHeight, 844, 1), `${s.mainPosition} ${s.mainOverflowY} ${r1(s.mainHeight)}`);
    check(session, "the document is the runway: as tall as the chapter", !!s.reader && s.docScrollHeight > 5000 && near(s.docScrollHeight, s.reader.height, 2) && near(s.bodyHeight, s.reader.height, 2), s.reader ? `doc ${s.docScrollHeight} body ${r1(s.bodyHeight)} reader ${r1(s.reader.height)}` : "absent");
    check(session, "the reader is at 0 at rest", !!s.reader && s.reader.ty === 0, s.reader ? s.reader.transform : "absent");
    check(session, "the rail left the moving box (after <main>, in <body>), fixed at the top edge, 3px", s.railParent === "body" && s.railPosition === "fixed" && near(s.railTop, 0, 0.5) && near(s.railHeight, 3, 0.5), `${s.railParent} ${s.railPosition} top ${r1(s.railTop)} h ${r1(s.railHeight)}`);
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    check(session, "nothing of the retired passes in the DOM", s.residue.length === 0, s.residue.join(",") || "clean");
    check(session, "<main> carries the page ground", s.mainBg === BROWN, s.mainBg);
    check(session, "<body> (the runway) is the hero's brown at rest", s.bodyBg === BROWN, s.bodyBg);
    check(session, "theme-color is the brown at rest", s.meta === "#1d1411", s.meta);
    check(session, "the menu sits one gutter below the rail (20px), 20px from the right", near(s.menuTop - s.railTop, 20, 0.5) && near(s.menuRightGap, 20, 0.5), `top ${r1(s.menuTop)} rail ${r1(s.railTop)} rightGap ${r1(s.menuRightGap)}`);
    check(session, "the lockup is opaque at rest", s.lockupOpacity > 0.95, r1(s.lockupOpacity));

    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
    await sleep(900);
    const at300 = await page.evaluate(STATE);
    check(session, "the reader follows the document (−300 at scroll 300)", at300.scrollY === 300 && !!at300.reader && near(at300.reader.ty, -300, 1), at300.reader ? `scrollY ${at300.scrollY} ty ${r1(at300.reader.ty)}` : "absent");
    check(session, "the lockup's scrub runs against the document (opacity < 0.7 at 300px)", at300.lockupOpacity < 0.7, r1(at300.lockupOpacity));

    const creamTop = await page.evaluate(DOC_TO_CREAM);
    await sleep(700);
    const c = await page.evaluate(STATE);
    check(session, "the runway takes the cream with the transcript at the top edge", typeof creamTop === "number" && c.bodyBg === CREAM && c.scrollY > 1000, `${c.bodyBg} scrollY ${c.scrollY}`);
    check(session, "theme-color follows (cream)", c.meta === "#f6f3ee", c.meta);
    check(session, "the reader is exactly −scrollY at rest", !!c.reader && near(c.reader.ty, -c.scrollY, 1), c.reader ? `ty ${r1(c.reader.ty)} scrollY ${c.scrollY}` : "absent");
    check(session, "the rail holds the top edge while the document scrolls", near(c.railTop, 0, 0.5) && near(c.railHeight, 3, 0.5), `top ${r1(c.railTop)} h ${r1(c.railHeight)}`);
    check(session, "the menu retreated (the document scrolled forward)", c.menuHidden === "true", c.menuHidden);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await sleep(700);
    const home = await settledLockup(page);
    check(session, "the runway is the brown again at the top", home.bodyBg === BROWN, home.bodyBg);
    check(session, "the reader is back at 0", !!home.reader && home.reader.ty === 0, home.reader ? home.reader.transform : "absent");
    check(session, "the lockup is opaque again at the top", home.lockupOpacity > 0.95, r1(home.lockupOpacity));

    if (await latchMini(page, session)) {
      const m = await page.evaluate(STATE);
      check(session, "the mini player is portaled out of <main> (in <body>), fixed", m.miniInMain === false && m.miniPosition === "fixed", `inMain ${m.miniInMain} ${m.miniPosition}`);
      /* Round 45: on phones the pill is centred on the map door's lane,
         `--map-lane` = the bottom inset (20) − 4px = 16 (global.css). */
      check(session, "the mini player sits on the map door's lane (16px)", near(m.miniBottom, 16, 0.5), r1(m.miniBottom));
    }
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 2 · the still document under `?scroll=inner`, on all five chapters ─ */
  for (const slug of CHAPTERS) {
    const session = `${slug}?scroll=inner 390 gate (the still document)`;
    const ctx = await phoneContext(browser);
    await ctx.addInitScript(GATE);
    await ctx.addInitScript(STAND_IN, STAND_IN_E);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/${slug}?scroll=inner`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);

    check(session, "data-scroll is inner", s.scroll === "inner", s.scroll || "(none)");
    check(session, `the document holds still (its only overflow is E, ≤ ${844 + E}, clipped)`, s.docScrollHeight <= s.innerHeight + E + 1, `scrollHeight ${s.docScrollHeight} vs ${s.innerHeight}`);
    check(session, "<html> clips (overflow hidden)", s.htmlOverflow === "hidden", s.htmlOverflow);
    check(session, "<main> is the scroller (relative, overflow-y auto)", s.mainPosition === "relative" && s.mainOverflowY === "auto", `${s.mainPosition} / ${s.mainOverflowY}`);
    check(session, `<main>'s box is the viewport + E (${844 + E})`, near(s.mainHeight, 844 + E, 1), r1(s.mainHeight));
    check(session, "<main> holds the chapter (scrollHeight ≫ box)", s.mainScrollHeight > s.mainHeight + 2000, `${s.mainScrollHeight}`);
    check(session, "the hero is one small viewport (844)", near(s.heroHeight, 844, 1), r1(s.heroHeight));
    check(session, `the hero carries E below it (${E})`, near(s.heroMarginBottom, E, 0.5), r1(s.heroMarginBottom));
    check(session, `the first scene starts below the toolbar's run (≥ ${844 + E})`, s.scene0Top >= 844 + E - 1, r1(s.scene0Top));
    check(session, "the rail rides inside <main>, fixed at the top edge, 3px, bare", s.railInMain && s.railPosition === "fixed" && near(s.railTop, 0, 0.5) && near(s.railHeight, 3, 0.5), `inMain ${s.railInMain} ${s.railPosition} top ${r1(s.railTop)} h ${r1(s.railHeight)}`);
    check(session, "the reader wrapper is inert (no transform)", !!s.reader && s.reader.ty === 0, s.reader ? s.reader.transform : "absent");
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    check(session, "nothing of the retired passes in the DOM", s.residue.length === 0, s.residue.join(",") || "clean");
    check(session, "<body> is the hero's brown at rest", s.bodyBg === BROWN, s.bodyBg);
    check(session, "the menu is present at rest, one gutter below the rail", s.menuHidden === "false" && near(s.menuTop - s.railTop, 20, 0.5), `${s.menuHidden} top ${r1(s.menuTop)}`);

    await page.evaluate(() => window.scrollTo(0, 100));
    await sleep(120);
    const pinned = await page.evaluate(() => window.scrollY);
    check(session, "the root stays at 0 under a scripted scroll", pinned === 0, pinned);

    await SCROLL_MAIN(page, 300, 4);
    await sleep(900);
    const at300 = await page.evaluate(STATE);
    check(session, "the lockup's scrub runs against <main> (opacity < 0.7 at 300px)", at300.lockupOpacity < 0.7, r1(at300.lockupOpacity));

    await SCROLL_MAIN(page, 900, 8);
    await sleep(300);
    const fwd = await page.evaluate(STATE);
    check(session, "the menu retreats on reading forward", fwd.menuHidden === "true", fwd.menuHidden);
    await SCROLL_MAIN(page, 780, 4);
    await sleep(300);
    const back = await page.evaluate(STATE);
    check(session, "the menu returns on scrolling back", back.menuHidden === "false", back.menuHidden);

    const creamTop = await page.evaluate(CREAM_TOP);
    if (typeof creamTop === "number") {
      await SCROLL_MAIN(page, Math.round(creamTop + 60), 6);
      await sleep(600);
      const inCream = await page.evaluate(STATE);
      check(session, "<body> takes the cream with the transcript at the top edge", inCream.bodyBg === CREAM, inCream.bodyBg);
      check(session, "the document is still at 0 while <main> is scrolled", inCream.scrollY === 0 && inCream.mainScrollTop > 1000, `scrollY ${inCream.scrollY} main ${inCream.mainScrollTop}`);
    } else check(session, "the transcript's cream block exists", false, creamTop);
    await SCROLL_MAIN(page, 0, 6);
    await sleep(600);
    const home = await settledLockup(page);
    check(session, "<body> is the brown again at the top", home.bodyBg === BROWN, home.bodyBg);
    check(session, "the lockup is opaque again at the top", home.lockupOpacity > 0.95, r1(home.lockupOpacity));

    if (await latchMini(page, session)) {
      const m = await page.evaluate(STATE);
      check(session, "the mini player is rendered inside <main> (no portal), fixed", m.miniInMain === true && m.miniPosition === "fixed", `inMain ${m.miniInMain} ${m.miniPosition}`);
    }
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 3 · deep links ──────────────────────────────────────────────────── */
  for (const variant of [
    { q: "", name: "runway", inner: false },
    { q: "?scroll=inner", name: "still document", inner: true },
  ]) {
    const session = `bakery${variant.q}#history 390 gate (${variant.name})`;
    const ctx = await phoneContext(browser);
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/bakery${variant.q}#history`, { waitUntil: "load" });
    await settle(page);
    await sleep(700);
    const s = await page.evaluate(STATE);
    check(session, `data-scroll is ${variant.inner ? "inner" : "sync"}`, s.scroll === (variant.inner ? "inner" : "sync"), s.scroll || "(none)");
    check(session, "#history lands at the top of the viewport (within 40px)", s.historyTop >= -2 && s.historyTop <= 40, r1(s.historyTop));
    if (variant.inner) check(session, "the document is at 0 (it landed inside <main>)", s.scrollY === 0, s.scrollY);
    else check(session, "the document scrolled there (the reader followed)", s.scrollY > 1000 && !!s.reader && near(s.reader.ty, -s.scrollY, 1), s.reader ? `scrollY ${s.scrollY} ty ${r1(s.reader.ty)}` : "absent");
    check(session, "<body> is the cream (history is a cream ground)", s.bodyBg === CREAM, s.bodyBg);
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 4 · the iPad: the still document by default, no toolbar run ─────── */
  {
    const session = "bakery 768 gate (iPad)";
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "data-scroll is inner (the screen's shorter side is 768)", s.scroll === "inner", s.scroll || "(none)");
    check(session, "the document does not scroll", s.docScrollHeight <= s.innerHeight + 1, `${s.docScrollHeight} vs ${s.innerHeight}`);
    check(session, "<main> is the scroller, exactly the viewport (E = 0)", s.mainOverflowY === "auto" && near(s.mainHeight, 1024, 1), `${s.mainOverflowY} ${r1(s.mainHeight)}`);
    check(session, "the hero carries no margin (E = 0)", near(s.heroMarginBottom, 0, 0.5), r1(s.heroMarginBottom));
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    await ctx.close();
  }

  /* ── 5 · off the gate: the document, as every non-iOS visitor sees it ─── */
  for (const vp of [
    { width: 390, height: 844, mobile: true },
    { width: 1440, height: 900, mobile: false },
  ]) {
    const session = `bakery ${vp.width} no gate`;
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/bakery`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "no data-scroll", s.scroll === "", s.scroll || "(none)");
    check(session, "the document scrolls", s.docScrollHeight > s.innerHeight + 2000, `${s.docScrollHeight}`);
    check(session, "<main> is not a scroller, not fixed", s.mainOverflowY === "visible" && s.mainPosition !== "fixed", `${s.mainOverflowY} ${s.mainPosition}`);
    check(session, "<html> does not clip", s.htmlOverflow !== "hidden", s.htmlOverflow);
    check(session, "the reader wrapper is inert (no transform)", !!s.reader && s.reader.ty === 0, s.reader ? s.reader.transform : "absent");
    check(session, "the hero carries no margin", near(s.heroMarginBottom, 0, 0.5), r1(s.heroMarginBottom));
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    check(session, "the rail rides inside <main>, 3px", s.railInMain && near(s.railHeight, 3, 0.5), `inMain ${s.railInMain} h ${r1(s.railHeight)}`);
    check(session, "nothing of the retired passes in the DOM", s.residue.length === 0, s.residue.join(",") || "clean");
    check(session, "<body> is the brown at rest", s.bodyBg === BROWN, s.bodyBg);
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 6 · the flags ───────────────────────────────────────────────────── */
  {
    const session = "bakery?scroll=inner 390 no gate";
    const ctx = await phoneContext(browser);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery?scroll=inner`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the flag engages the still document in Chromium", s.scroll === "inner" && s.mainOverflowY === "auto" && s.docScrollHeight <= s.innerHeight + 1, `${s.scroll} ${s.mainOverflowY} ${s.docScrollHeight}`);
    await ctx.close();
  }
  {
    const session = "bakery?scroll=sync 390 no gate";
    const ctx = await phoneContext(browser);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery?scroll=sync`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the flag engages the runway in Chromium", s.scroll === "sync" && s.mainPosition === "fixed" && s.railParent === "body", `${s.scroll} ${s.mainPosition} rail in ${s.railParent}`);
    await ctx.close();
  }
  {
    const session = "bakery?scroll=doc 390 gate";
    const ctx = await phoneContext(browser);
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery?scroll=doc`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the flag leaves the document scrolling under the gate", s.scroll === "doc" && s.mainOverflowY === "visible" && s.mainPosition !== "fixed" && s.docScrollHeight > s.innerHeight + 2000, `${s.scroll} ${s.mainOverflowY} ${s.mainPosition} ${s.docScrollHeight}`);
    await ctx.close();
  }

  /* ── 7 · a top safe-area inset (iOS 26 reports one once its bars have
     moved in a scrolling document), emulated over CDP ─────────────────── */
  for (const variant of [
    { q: "", menuTop: 32, name: "the menu follows the rail's inset (the runway)" },
    { q: "?scroll=inner", menuTop: 20, name: "the still document keeps round 23's max()" },
  ]) {
    const session = `bakery${variant.q} 390 gate, top inset 12`;
    const ctx = await phoneContext(browser);
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 12, right: 0, bottom: 0, left: 0 } });
    await page.goto(`${BASE}/bakery${variant.q}`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the rail rides the top inset (12)", near(s.railTop, 12, 0.5), r1(s.railTop));
    check(session, `${variant.name} — menu top ${variant.menuTop}`, near(s.menuTop, variant.menuTop, 0.5), r1(s.menuTop));
    check(session, "the menu's right inset is the gutter (20)", near(s.menuRightGap, 20, 0.5), r1(s.menuRightGap));
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: {} }).catch(() => {});
    await ctx.close();
  }
} finally {
  await browser.close();
}

/* ── report ─────────────────────────────────────────────────────────────── */
const lines = [
  "# chapter-still — the chapter pages under Safari's bars, measured",
  "",
  `Base ${BASE} · E stood in at ${E}px for the still document · ${results.length} checks, ${failures} failed`,
  "",
  "| session | check | ok | detail |",
  "|---|---|---|---|",
  ...results.map((r) => `| ${r.session} | ${r.name} | ${r.ok ? "✓" : "✗"} | ${r.detail} |`),
];
writeFileSync(join(OUT, "still.md"), lines.join("\n") + "\n");
writeFileSync(join(OUT, "still.json"), JSON.stringify({ base: BASE, e: E, results, failures }, null, 2));
for (const r of results) if (!r.ok) console.error(`✗ ${r.session} — ${r.name}: ${r.detail}`);
console.log(`chapter-still: ${results.length} checks, ${failures} failed · ${join(OUT, "still.md")}`);
process.exit(failures ? 1 : 0);
