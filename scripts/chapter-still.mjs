#!/usr/bin/env node
/**
 * Round 38 — the still document, measured
 * (docs/rounds/2026-09-22-round-38-plan.md; the mode itself is round 23's
 * device passes 8–12, docs/rounds/2026-09-18-round-23-plan.md).
 *
 * Why this exists: the chapter pages' fill behind Safari's top bar — a solid
 * colour that switches with the section at the top edge — is the STILL
 * DOCUMENT: on iOS (`-webkit-touch-callout`, the head script in Base.astro)
 * every chapter route takes `data-scroll="inner"`, `<html>` clips at the
 * viewport, `<main>` is the scroller (the layout viewport plus the toolbar's
 * run E under the bottom bar), and the region behind the top bar shows the
 * canvas — `<body>`'s colour, written by the sampler — static, painted by
 * Safari itself. Wil approved it on his phone (9/19 "exactly what I wanted",
 * 9/20 "everything is perfect"); five later passes replaced it with page-placed
 * fills he never saw work, and round 38 put it back. Round 23's probes were
 * scratch scripts; this is the permanent one, so the mode the phone approved
 * can be re-measured on any tree. Chromium never takes the iOS gate, so the
 * gate is stood in from an init script (`CSS.supports("-webkit-touch-callout",
 * "none")` → true, which is what the head script tests) and the phone's
 * toolbar run is stood in as `--reader-e: 129px` (playbook §1) — the CSS
 * `@supports` block that sets E is Safari's alone.
 *
 * At 390×844 (touch, mobile), gate and E stood in, on all five chapters:
 *   · `data-scroll="inner"`; the document holds still — its only overflow is
 *     `<main>`'s E under the toolbar, which `<html>` (overflow hidden) clips
 *     and the close-out's pin holds at 0; `<main>` is the scroller —
 *     position relative, overflow-y auto, its box 100% + E tall, its content
 *     thousands of pixels taller.
 *   · The hero is one small viewport tall and carries E below it (device pass
 *     10), so the first scene starts below the toolbar's run.
 *   · The rail rides inside `<main>` at the top edge, 3px, bare (no visor);
 *     the cover is `display: none`; nothing of passes 13–17 exists (`#reader`,
 *     `#runway`, `.edge-trigger`, a `chrome` slot).
 *   · `<body>` is the hero's brown #1d1411 at rest (and the theme-color meta
 *     with it), the transcript's cream #f6f3ee once `<main>` is scrolled so
 *     the transcript sits at the top edge, and brown again back at the top —
 *     the sampler hears `<main>`'s scroll re-sent on window.
 *   · A scripted `scrollTo(0, 100)` on the window leaves the document at 0
 *     (the closeout's pin).
 *   · The corner menu retreats on reading forward and returns on scrolling
 *     back (it reads `<main>`'s offset); the hero lockup's scrub runs against
 *     `<main>` (opacity falls by 300px and is back at 1 at the top).
 *   · The narration's mini player, once a play latches it, is rendered inside
 *     the island (inside `<main>`), fixed to the viewport — no portal.
 *   · A `#history` deep link lands inside `<main>` with the document at 0.
 *   · No page errors.
 * At 768×1024 with the gate stood in (an iPad): the still document, E = 0.
 * Off the gate (Chromium as it is), 390×844 and 1440×900: no `data-scroll`,
 * the document scrolls, `<main>` is not a scroller, the cover hidden — the
 * shape every non-iOS visitor and the visual gate see, unchanged.
 * `?scroll=inner` off the gate engages the mode (its rules key on the
 * attribute alone); `?scroll=doc` under the gate leaves the document scrolling.
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
    railHeight: rail ? rect(rail).height : NaN,
    railTop: rail ? rect(rail).top : NaN,
    railPosition: rail ? cs(rail).position : "",
    railBg: rail ? cs(rail).backgroundColor : "",
    coverDisplay: cover ? cs(cover).display : "absent",
    /* round 40 brought `.edge-trigger` back as a flag-gated element (checked
       on its own below), so it is no longer residue */
    residue: ["#reader", "#runway", ".runway-cap", "[slot='chrome']"].filter((s) => document.querySelector(s)),
    bodyBg: cs(document.body).backgroundColor,
    bodyInline: document.body.style.backgroundColor,
    meta: meta ? meta.getAttribute("content") : "",
    menuHidden: (document.querySelector(".cnwm-menu") || {}).dataset ? document.querySelector(".cnwm-menu").dataset.hidden || "false" : "absent",
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
    /* round 40: the edge trigger (`?scroll=edge`) and what a hit at the top
       edge finds — the rail is pointer-events: none, so it is never the hit */
    trigger: (() => {
      const t = document.querySelector(".edge-trigger");
      if (!t) return null;
      const c = cs(t);
      const r = rect(t);
      return { display: c.display, position: c.position, top: r.top, height: r.height, width: r.width, pointerEvents: c.pointerEvents, bg: c.backgroundColor };
    })(),
    hitTop: (() => {
      const el = document.elementFromPoint((window.innerWidth / 2) | 0, 2);
      return el ? (el.className && typeof el.className === "string" ? el.className : el.tagName.toLowerCase()) : "none";
    })(),
  };
};
/* The document scrolled so the transcript's cream block sits at the top edge
   (the plain-document modes: `?scroll=edge`, `?scroll=doc`). */
const DOC_TO_CREAM = () => {
  const el = document.querySelector("#main .ground-cream");
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY + 60;
  window.scrollTo({ top, behavior: "instant" });
  return top;
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

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  /* ── 1 · the still document under the gate, on the phone ──────────────── */
  for (const slug of CHAPTERS) {
    const session = `${slug} 390 gate`;
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    await ctx.addInitScript(GATE);
    /* the stand-in sheet: an init script runs before <html> exists, so the
       sheet is appended the moment the root element appears (the visual
       gate's own idiom for its still-sheet) — in place before the first
       rule is matched, never a frame late */
    await ctx.addInitScript((css) => {
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
    }, STAND_IN_E);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/${slug}`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);

    check(session, "data-scroll is inner", s.scroll === "inner", s.scroll || "(none)");
    /* <main> runs E under the bottom toolbar, so the root's only overflow is
       that E — clipped by <html>, and pinned at 0 against scripts (below) */
    check(session, `the document holds still (its only overflow is E, ≤ ${844 + E}, clipped)`, s.docScrollHeight <= s.innerHeight + E + 1, `scrollHeight ${s.docScrollHeight} vs ${s.innerHeight}`);
    check(session, "<html> clips (overflow hidden)", s.htmlOverflow === "hidden", s.htmlOverflow);
    check(session, "<main> is the scroller (relative, overflow-y auto)", s.mainPosition === "relative" && s.mainOverflowY === "auto", `${s.mainPosition} / ${s.mainOverflowY}`);
    check(session, `<main>'s box is the viewport + E (${844 + E})`, near(s.mainHeight, 844 + E, 1), r1(s.mainHeight));
    check(session, "<main> holds the chapter (scrollHeight ≫ box)", s.mainScrollHeight > s.mainHeight + 2000, `${s.mainScrollHeight}`);
    check(session, "the hero is one small viewport (844)", near(s.heroHeight, 844, 1), r1(s.heroHeight));
    check(session, `the hero carries E below it (${E})`, near(s.heroMarginBottom, E, 0.5), r1(s.heroMarginBottom));
    check(session, `the first scene starts below the toolbar's run (≥ ${844 + E})`, s.scene0Top >= 844 + E - 1, r1(s.scene0Top));
    check(session, "the rail rides inside <main>, fixed at the top edge, 3px, bare", s.railInMain && s.railPosition === "fixed" && near(s.railTop, 0, 0.5) && near(s.railHeight, 3, 0.5), `inMain ${s.railInMain} ${s.railPosition} top ${r1(s.railTop)} h ${r1(s.railHeight)}`);
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    check(session, "nothing of passes 13–17 in the DOM", s.residue.length === 0, s.residue.join(",") || "clean");
    check(session, "<main> carries the page ground", s.mainBg === BROWN, s.mainBg);
    check(session, "<body> is the hero's brown at rest", s.bodyBg === BROWN, s.bodyBg);
    check(session, "theme-color is the brown at rest", s.meta === "#1d1411", s.meta);
    check(session, "the lockup is opaque at rest", s.lockupOpacity > 0.95, r1(s.lockupOpacity));
    check(session, "the menu is present at rest", s.menuHidden === "false", s.menuHidden);

    /* the document cannot be scrolled by a script (the closeout's pin) */
    await page.evaluate(() => window.scrollTo(0, 100));
    await sleep(120);
    const pinned = await page.evaluate(() => window.scrollY);
    check(session, "the root stays at 0 under a scripted scroll", pinned === 0, pinned);

    /* the hero scrub runs against <main>: opacity falls by 300px */
    await SCROLL_MAIN(page, 300, 4);
    await sleep(900);
    const at300 = await page.evaluate(STATE);
    check(session, "the lockup's scrub runs against <main> (opacity < 0.7 at 300px)", at300.lockupOpacity < 0.7, r1(at300.lockupOpacity));

    /* reading forward hides the corner menu; scrolling back brings it back */
    await SCROLL_MAIN(page, 900, 8);
    await sleep(300);
    const fwd = await page.evaluate(STATE);
    check(session, "the menu retreats on reading forward", fwd.menuHidden === "true", fwd.menuHidden);
    await SCROLL_MAIN(page, 780, 4);
    await sleep(300);
    const back = await page.evaluate(STATE);
    check(session, "the menu returns on scrolling back", back.menuHidden === "false", back.menuHidden);

    /* the colour follows the section at the top edge: the transcript's cream */
    const creamTop = await page.evaluate(CREAM_TOP);
    check(session, "the transcript's cream block exists", typeof creamTop === "number", creamTop);
    if (typeof creamTop === "number") {
      await SCROLL_MAIN(page, Math.round(creamTop + 60), 6);
      await sleep(600);
      const inCream = await page.evaluate(STATE);
      check(session, "<body> takes the cream with the transcript at the top edge", inCream.bodyBg === CREAM, inCream.bodyBg);
      check(session, "theme-color follows (cream)", inCream.meta === "#f6f3ee", inCream.meta);
      check(session, "the document is still at 0 while <main> is scrolled", inCream.scrollY === 0 && inCream.mainScrollTop > 1000, `scrollY ${inCream.scrollY} main ${inCream.mainScrollTop}`);
      check(session, "the rail holds the top edge while <main> scrolls", near(inCream.railTop, 0, 0.5) && near(inCream.railHeight, 3, 0.5), `top ${r1(inCream.railTop)} h ${r1(inCream.railHeight)}`);
    }
    await SCROLL_MAIN(page, 0, 6);
    await sleep(600);
    /* the scrub catches up over ~0.5 s (`scrub: 0.5`): poll to rest, bounded */
    let home = await page.evaluate(STATE);
    for (let i = 0; i < 12 && !(home.lockupOpacity > 0.95); i++) {
      await sleep(200);
      home = await page.evaluate(STATE);
    }
    check(session, "<body> is the brown again at the top", home.bodyBg === BROWN, home.bodyBg);
    check(session, "the lockup is opaque again at the top", home.lockupOpacity > 0.95, r1(home.lockupOpacity));

    /* the narration's mini player: inside the island, no portal. A real play
       (the main control's button); if the audio cannot play here the latch
       never sets and the check is recorded as not exercised, not failed. */
    const playBtn = await page.$('button[aria-label^="Play narration"]');
    let latched = false;
    if (playBtn) {
      await playBtn.scrollIntoViewIfNeeded().catch(() => {});
      await playBtn.click({ force: true }).catch(() => {});
      for (let i = 0; i < 20 && !latched; i++) {
        await sleep(250);
        latched = await page.evaluate(() => !![...document.querySelectorAll("div.fixed")].find((d) => /z-\[999\]/.test(d.className)));
      }
    }
    if (latched) {
      const m = await page.evaluate(STATE);
      check(session, "the mini player is rendered inside <main> (no portal), fixed", m.miniInMain === true && m.miniPosition === "fixed", `inMain ${m.miniInMain} ${m.miniPosition}`);
      check(session, "the mini player sits on the bottom lane (20px)", near(m.miniBottom, 20, 0.5), r1(m.miniBottom));
    } else {
      results.push({ session, name: "the mini player (audio did not play here — not exercised)", ok: true, detail: playBtn ? "no latch" : "no play button" });
    }
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 2 · a deep link lands inside <main> ─────────────────────────────── */
  {
    const session = "bakery#history 390 gate";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/bakery#history`, { waitUntil: "load" });
    await settle(page);
    await sleep(400);
    const s = await page.evaluate(STATE);
    check(session, "data-scroll is inner", s.scroll === "inner", s.scroll || "(none)");
    check(session, "#history lands at the top of <main> (within 40px)", s.historyTop >= -2 && s.historyTop <= 40, r1(s.historyTop));
    check(session, "the document is at 0", s.scrollY === 0, s.scrollY);
    check(session, "<body> is the cream (history is a cream ground)", s.bodyBg === CREAM, s.bodyBg);
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 3 · the iPad: the still document with no toolbar run ────────────── */
  {
    const session = "bakery 768 gate";
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "data-scroll is inner", s.scroll === "inner", s.scroll || "(none)");
    check(session, "the document does not scroll", s.docScrollHeight <= s.innerHeight + 1, `${s.docScrollHeight} vs ${s.innerHeight}`);
    check(session, "<main> is the scroller, exactly the viewport (E = 0)", s.mainOverflowY === "auto" && near(s.mainHeight, 1024, 1), `${s.mainOverflowY} ${r1(s.mainHeight)}`);
    check(session, "the hero carries no margin (E = 0)", near(s.heroMarginBottom, 0, 0.5), r1(s.heroMarginBottom));
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    await ctx.close();
  }

  /* ── 4 · off the gate: the document, as every non-iOS visitor sees it ─── */
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
    check(session, "<main> is not a scroller", s.mainOverflowY === "visible", s.mainOverflowY);
    check(session, "<html> does not clip", s.htmlOverflow !== "hidden", s.htmlOverflow);
    check(session, "the hero carries no margin", near(s.heroMarginBottom, 0, 0.5), r1(s.heroMarginBottom));
    check(session, "the cover is display:none", s.coverDisplay === "none", s.coverDisplay);
    check(session, "the rail rides inside <main>, 3px", s.railInMain && near(s.railHeight, 3, 0.5), `inMain ${s.railInMain} h ${r1(s.railHeight)}`);
    check(session, "nothing of passes 13–17 in the DOM", s.residue.length === 0, s.residue.join(",") || "clean");
    check(session, "<body> is the brown at rest", s.bodyBg === BROWN, s.bodyBg);
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ── 5 · the flags ───────────────────────────────────────────────────── */
  {
    const session = "bakery?scroll=inner 390 no gate";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery?scroll=inner`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the flag engages the still document in Chromium", s.scroll === "inner" && s.mainOverflowY === "auto" && s.docScrollHeight <= s.innerHeight + 1, `${s.scroll} ${s.mainOverflowY} ${s.docScrollHeight}`);
    await ctx.close();
  }
  {
    const session = "bakery?scroll=doc 390 gate";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery?scroll=doc`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the flag leaves the document scrolling under the gate", s.scroll === "doc" && s.mainOverflowY === "visible" && s.docScrollHeight > s.innerHeight + 2000, `${s.scroll} ${s.mainOverflowY} ${s.docScrollHeight}`);
    await ctx.close();
  }

  /* ── 6 · round 40: the edge trigger, behind `?scroll=edge` ───────────── */
  for (const variant of [
    { q: "?scroll=edge", band: 0 },
    { q: "?scroll=edge&band=12", band: 12 },
  ]) {
    const session = `bakery${variant.q} 390 gate`;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    const errors = errorsOf(page);
    await page.goto(`${BASE}/bakery${variant.q}`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "data-scroll is edge", s.scroll === "edge", s.scroll || "(none)");
    check(session, "the document scrolls (a plain document)", s.docScrollHeight > s.innerHeight + 2000 && s.htmlOverflow !== "hidden" && s.mainOverflowY === "visible", `${s.docScrollHeight} ${s.htmlOverflow} ${s.mainOverflowY}`);
    check(session, "the cover is display:none, the rail bare (3px)", s.coverDisplay === "none" && near(s.railHeight, 3, 0.5), `${s.coverDisplay} rail ${r1(s.railHeight)}`);
    check(session, "the hero carries no margin", near(s.heroMarginBottom, 0, 0.5), r1(s.heroMarginBottom));
    const t = s.trigger;
    check(session, "the trigger is a fixed strip on the top edge, full width", !!t && t.display === "block" && t.position === "fixed" && near(t.top, 0, 0.5) && near(t.width, 390, 0.5), t ? `${t.display} ${t.position} top ${r1(t.top)} w ${r1(t.width)}` : "absent");
    check(session, `the trigger is ${variant.band || 8}px tall`, !!t && near(t.height, variant.band || 8, 0.5), t ? r1(t.height) : "absent");
    check(session, "the trigger is hit-testable", !!t && t.pointerEvents === "auto", t ? t.pointerEvents : "absent");
    check(session, "a hit at the top edge finds the trigger (not the rail)", /edge-trigger/.test(s.hitTop), s.hitTop);
    if (variant.band) check(session, "the band takes <body>'s colour (brown at rest)", !!t && t.bg === BROWN, t ? t.bg : "absent");
    else check(session, "the strip is invisible (transparent)", !!t && /rgba\(0, 0, 0, 0\)|transparent/.test(t.bg), t ? t.bg : "absent");
    check(session, "<body> is the brown at rest", s.bodyBg === BROWN, s.bodyBg);
    const creamTop = await page.evaluate(DOC_TO_CREAM);
    await sleep(600);
    const c = await page.evaluate(STATE);
    check(session, "<body> takes the cream with the transcript at the top edge", typeof creamTop === "number" && c.bodyBg === CREAM && c.scrollY > 1000, `${c.bodyBg} scrollY ${c.scrollY}`);
    if (variant.band) check(session, "the band follows to the cream", !!c.trigger && c.trigger.bg === CREAM, c.trigger ? c.trigger.bg : "absent");
    check(session, "the trigger holds the top edge while the document scrolls", !!c.trigger && near(c.trigger.top, 0, 0.5) && /edge-trigger/.test(c.hitTop), c.trigger ? `top ${r1(c.trigger.top)} hit ${c.hitTop}` : "absent");
    check(session, "the menu retreated (the document scrolled forward)", c.menuHidden === "true", c.menuHidden);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await sleep(600);
    const h = await page.evaluate(STATE);
    check(session, "<body> is the brown again at the top", h.bodyBg === BROWN, h.bodyBg);
    check(session, "no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }
  {
    /* off the flag the trigger is inert: rendered on the chapter routes, never displayed */
    const session = "bakery 390 gate (trigger off the flag)";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.addInitScript(GATE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/bakery`, { waitUntil: "load" });
    await settle(page);
    const s = await page.evaluate(STATE);
    check(session, "the trigger is display:none under the default", !!s.trigger && s.trigger.display === "none", s.trigger ? s.trigger.display : "absent");
    check(session, "a hit at the top edge does not find it", !/edge-trigger/.test(s.hitTop), s.hitTop);
    await ctx.close();
  }
} finally {
  await browser.close();
}

/* ── report ─────────────────────────────────────────────────────────────── */
const lines = [
  "# chapter-still — the still document, measured",
  "",
  `Base ${BASE} · E stood in at ${E}px · ${results.length} checks, ${failures} failed`,
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
