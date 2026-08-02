# rewildyourself.com — Motion & Scroll Effects study

Dimension: **motion and scroll effects** (one of five benchmark studies for CNWM v3).
Studied 2026-08-02 via Playwright at 390/768/1440, plus bundle inspection of
`dist/main.js` (1.2 MB). Screenshots in `docs/qa/inspiration/rewild/`.

## Tech fingerprint (verified in DOM + bundle)

- WordPress/Bedrock + custom theme; the experience lives in one 1.2 MB `main.js`.
- **Locomotive Scroll v4** (`html.has-scroll-init.has-scroll-smooth`,
  `data-scroll-container`, multiplier 1.8; body is `position:fixed`, scroll fully
  virtualized — `window.scrollY` never moves).
- **GSAP** timelines (module-scoped, not on `window`): `autoAlpha`, labeled
  timelines, overlap positions like `"-=1.2"`.
- **Barba-style page namespaces** (`home`, `archive-faq`, `archive-inspire`,
  `archive-champion`, `archive-wellness`, `archive-time`, `archive-hubs`) each with
  `once/enter/leave` entrance timelines.
- **Raw WebGL** fullscreen fixed canvas (single `getContext("webgl")`) with shader
  uniforms `uWorldOpacity`, `uScaleFactor` written from scroll events; a 2d canvas
  (`#postcard-canvas`) for a postcard feature; **Swiper** for the giant carousel;
  **Howler.js** for audio.
- Internal event bus: `cc.trigger({name:"loaderEnd"})` → `enterHome` → intro
  timeline → `onComplete: gT.start()` (scroll unlock).
- Homepage scroll runway: **39,019 px ≈ 43 viewports** across 11 sections
  (heights: 1×, 1.5×, 1.5×, **20×**, 6×, 2.5× ×5, 1× viewport).
- GA scroll-depth events (`percent_scrolled`) — they instrument the journey.

## The entry gate (known weakness — confirmed, dramatically)

The loader is a red slug crawling a 2 px hairline with a % counter
(`home--1440.png`). Scroll stays **locked** until loader → intro timeline
completes (`gT.stop()` on home, `gT.start()` only in the intro's `onComplete`).
Two real failures observed:

1. Production currently 404s `dist/atmosphere.webp` — an asset in the preload
   manifest that no longer exists.
2. In any rAF-throttled context the loader tween froze at `opacity: 0.0038` with
   `pointer-events: auto` — an invisible full-screen overlay that eats every wheel
   and click. **The entire site bricks.** No timeout, no fail-open. We could not
   unlock scroll in headless or headed automation at all; the deep-journey
   evidence below comes from DOM/bundle forensics and forced container
   transforms rather than live scrolling.

## Named techniques worth stealing

### 1. Character-progress loader ("the snail crawl")
A hand-painted slug crawls along a hairline progress bar with a percentage —
loading is the first story beat, in-world from frame one.
Evidence: `home--1440.png` (slug at 3%).
**CNWM steal:** a tiny walking silhouette (or lantern) traversing a hairline as a
chapter's painting video + narration buffer. But per-chapter and fail-open —
never gate the whole site (see traps).

### 2. Curtain-rise handoff (loader → intro → scroll unlock)
GSAP chain: loader fades out over 1.2 s while the world fades in, overlapped
(`"-=1.2"`); only the intro's `onComplete` enables scroll. Users literally cannot
scroll past an unfinished opening — the rhythm of the first 3 seconds is
authored, not left to chance.
Evidence: bundle (`.to(this.loader,{duration:1.2,autoAlpha:0,display:"none"})
.add(()=>cc.trigger({name:"loaderEnd"}),"-=1.2")`; `onComplete:…gT.start()`).
**CNWM steal:** hero sequence per chapter — background settles, painting fades
in, title arrives, *then* scroll enables. Keep the lock ≤ 2 s and always
`setTimeout` a fail-open unlock.

### 3. Pinned-stage acts (sticky layer + oversized runway per section)
Every one of the 11 sections has a `data-scroll-sticky` layer pinned against a
runway 1.5×–20× the viewport (`data-scroll-target=.l-home-N`). The stage holds
still; scroll distance becomes act *duration*, and progress scrubs the act. The
hero holds for thousands of pixels while only ambient details evolve — a
"breath" between statements.
Evidence: DOM census (13 sticky elements, section heights above);
`probe-1440-p06.png` vs `probe-1440-p14.png` (same hero, kelp/bee advanced).
**CNWM steal:** one pinned stage per chapter — the painting holds while
narration captions and sketch overlays scrub through. GSAP ScrollTrigger
`pin: true, scrub: true` does this natively; runway ≈ 2.5–3× viewport per
chapter (rewild's 20× carousel is too much).

### 4. Persistent-world layer with ambient actors
The underwater world — fixed WebGL water gradient, drifting plankton particles,
kelp borders, and creatures (sea dragon, bee) — lives *outside* the scroll
container and persists across all sections, animating on its own clock. The page
is never static, even mid-pin; content scrolls *through* a living environment.
Evidence: `forced-1440-y12000.png` / `forced-1440-y36000.png` (container pushed
36k px — DOM copy gone, world still there, creatures moved); kelp growth between
`probe-1440-p06/p14.png` is time-based, not scroll-based.
**CNWM steal:** a persistent warm-dark atmosphere layer behind all 5 chapters —
ember/dust motes, faint lantern flicker, and occasional drifting elements pulled
from Mark Priest's sketches (a hat, a rope, a horse silhouette). Canvas 2d or
CSS + GSAP ticker; no WebGL needed.

### 5. Scroll-driven shader scrub (world state = narrative position)
`locoScroll.on("scroll", …)` writes progress into shader uniforms
(`uWorldOpacity`, `uScaleFactor` on named meshes like "heart") — the
*environment itself* is the progress indicator. This is "organic
motion-as-message" verified: you know where you are in the story because the
world has changed, not because a progress bar says so.
Evidence: bundle (`gT.locoScroll.on("scroll",this.bindedHandle)`,
`oc.from(t.material.uniforms.uScaleFactor,…)`).
**CNWM steal:** map ScrollTrigger progress to CSS custom properties
(`--chapter-progress`) that drive the sketch→finished-painting crossfade, or
scrub the animated painting video's `currentTime`. Scroll = watching the
painting come alive. This is CNWM's single highest-leverage motion idea.

### 6. Statement → breath → forked CTA hero
Hero rhythm: hand-lettered logo statement, one-line subtitle, breath of space,
then **two labeled paths** with helper microcopy — "WELCOME" (meander through
the story) vs "DIVE IN" (jump to news/utility) — each with an animated companion
(a bee hovers by DIVE IN). Prior hypothesis was one CTA; it's actually a fork:
story route vs utility route, declared up front.
Evidence: `probe-1440-p06.png`, `home--390--scroll4.png`.
**CNWM steal:** hero fork solves rewild's own buried-utility problem — "Begin
the story" (chapter 1 journey) vs "Walk the route" (map + 5 stops). Two paths,
one sentence of microcopy each.

### 7. Per-page entrance choreography (namespace `once/enter` hooks)
Every archive page owns an entrance timeline played on `loaderEnd` (first load)
or on SPA transition; menu navigation staggers nav items out
(`yPercent:150, stagger:.04, transformOrigin:"left top"`) before starting the
next page's timeline. Motion identity is consistent across the whole site, not
just the homepage.
Evidence: bundle (`{name:"archive-faq", once(){…cc.on("loaderEnd",…t.play())}}`,
nav stagger code).
**CNWM steal:** a shared 3-beat entrance for all chapter pages (background →
painting → title, ~1.2 s total, easeOut) defined once and reused; Astro view
transitions can carry the same grammar without a SPA router.

### 8. Surfacing into utility (dark journey → warm cream landing)
After 43 viewports of deep-sea dark, the site surfaces into a warm textured
cream "Join Our Community" band, then a conventional dark-green footer (contact,
foundation, partner logos). The palette inversion is the "you've arrived" cue —
mood ends, utility begins.
Evidence: `interior-top.png` (the 404 page reuses the same footer system —
cream band + footer).
**CNWM steal:** end each chapter (and the site) by surfacing from warm-black
into a parchment band holding the practical layer: directions to the next stop,
audio controls, credits, museum info. Dark = story, parchment = utility, always.

## Traps to avoid

1. **Never chain scroll unlock to asset promises.** Rewild's unlock sits at the
   end of loader → intro-timeline → `onComplete`, with no timeout. One missing
   asset (they're shipping a 404 *right now*) or one throttled rAF and the site
   is an invisible-overlay brick — loader at opacity 0.0038 still swallowing all
   input. CNWM: scroll is never locked; entrances play *over* an already
   scrollable page; any overlay that fades out also sets
   `display:none; pointer-events:none` and has a hard fail-open timer.
2. **Don't bury utility under 43 viewports of mood.** News, community, contact
   all live after a 39k px journey (their fix — the DIVE IN shortcut — exists
   only on the hero). CNWM: persistent chapter nav + "skip to map" affordance on
   every chapter; the walking-route user in the street gets utility in one tap.
3. **All-or-nothing motion.** 1.2 MB of animation code and exactly one
   `prefers-reduced-motion` hit — inside a vendored feature-detect, driving
   nothing. There is no reduced-motion experience at all. CNWM's constitution
   requires a variant for every animation: static painting + readable text flow
   must be a first-class render path, not a degraded one.

## Hypothesis scorecard

- *Statement → breath → one-CTA rhythm*: *revised* — it's a two-path fork
  (story vs utility), which is the stronger idea.
- *Organic motion-as-message*: **verified** (shader-uniform world scrub,
  persistent ambient actors).
- *WebGL restraint*: **verified** — one fullscreen canvas for atmosphere only;
  creatures/kelp/copy are sprites and DOM. The restraint is real; the payload
  discipline is not (1.2 MB bundle + full-site preload gate).

## Screenshot index

- `home--1440.png` — slug loader at 3% (the gate)
- `probe-1440-p06.png`, `probe-1440-p14.png` — pinned hero, ambient drift between offsets
- `home--390--scroll4.png` … — mobile hero (stacked fork CTAs)
- `forced-1440-y12000.png`, `forced-1440-y36000.png` — persistent world layer isolated
- `menu-open.png` — pill search reveal (header utility)
- `interior-top.png` — cream community band + footer (utility surfacing; via 404 page)
- Probe scripts: `scratch/rewild-*.mjs`
