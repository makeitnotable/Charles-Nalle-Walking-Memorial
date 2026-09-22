# Phase 2+3 Motion Design review — the five signatures vs the legacy vocabulary

*Reviewer: fresh-context Motion Design discipline (no builder context). 2026-08-02.*
*Baselines: `docs/LEGACY-PORT-NOTES.md` ("Motion vocabulary" + signature specs),
`docs/ELEVATION-PLAN.md` (M3–M8 promises, F1/F2 guardrails). Motion thesis: "the past
developing into the present."*
*Instrument: `http://localhost:4321` (frozen build), driven by
`scratch/qa-m1-curtain.mjs`, `qa-m1b-failopen.mjs`, `qa-m2-hero-menu.mjs`,
`qa-m4-player.mjs` + `qa-m4b-seek.mjs`, `qa-m5-map.mjs` + `qa-m5b-prologue.mjs` +
`qa-m5c-skip.mjs`, `qa-m6-reduced.mjs` (context `reducedMotion:'reduce'`),
`qa-m7-cls-scroll.mjs` (buffered layout-shift observer), `qa-m8-console.mjs`.
Evidence: `docs/qa/phase23-motion/` (stepped captures + DOM-state JSON in the
scripts' stdout, quoted below). Viewport 1280×800 unless noted.*

## VERDICT: **PASS** (conditional — no P0; fix F1 and F2 before launch sign-off)

The five signature systems are on the site, verbatim where the spec is verbatim, and
they serve the thesis rather than decorate: the curtain speaks the destination and the
date between scenes, the hero scrub develops the framed painting into full bleed as you
enter the story, the press-reveal is the thesis in miniature, and the map's prologue /
self-drawing route / dive cameras make the walk itself the film. Every effect observed
has a working reduced-motion variant, page scroll is native everywhere, reveals produce
effectively zero layout shift, and the curtain's fail-open genuinely rescues a hung
navigation (verified with a deliberately stalled request). Two P1s: the map flights'
"any touch skips" guardrail does not actually work (wrong event, wrong stop semantics —
a drag during the prologue strands the camera mid-flight), and the map page ships a
0.63 hydration CLS that will torpedo the perf budget.

## What was verified (measured, not eyeballed)

### 1. Curtain (signature #1) — spec-faithful, fail-open proven

Sampled four navigations at ~150–200ms intervals (`curtain-*.png`, DOM state logged):

- **home → map** (Continue), **bakery → commissioners-office** ("Continue the walk"),
  **mansion → about** (menu item), **map carousel active card → bakery** (two-tap).
- Cover half: panel `translateY(100%→0)` measured on the 0.6s `circ.inOut` curve
  (panelTop 800→90→0 across 0.45s); wordmark/destination fades in during the last
  0.3s; navigation fires ~150ms after full cover. Chapter destinations render the
  label + the "APRIL 27, 1860" over-title (elevation C13) — see
  `curtain-bakery-next-01.png`; non-chapter destinations (About, The Walk) correctly
  omit the date; menu/carousel/index links all carry `data-curtain-label`.
- Exit half on page B: starts fully covered (the seam is invisible in every frame
  sampled), holds ~0.45s, text 0.1s out + panel 0.6s `circ.out` upward, then parks at
  `translateY(100%)` with `pointer-events:none` and the sessionStorage flag cleared —
  verified terminal state on all four runs.
- **Fail-open (guardrail F2): genuinely works.** With the destination request stalled
  forever (hung load), the panel covers, waits, and at **t≈4.0–4.5s releases itself**
  (panelTop back to 800, `pointer-events:none`, flag cleared, page interactive —
  console-stream telemetry in `qa-m1b`/probe output; `failopen-*.png`). The exit half
  has its own 3s watchdog. bfcache restores park the panel (`pageshow` handler).
- No navigation sampled ever left the panel blocking a page.

### 2. Hero scrub (signature #3) — verbatim legacy values, clean reverse

On /bakery, sampled at 0/25/50/100% of one viewport past `start "top top"`
(`hero-scrub-*.png`, computed styles):

| scroll | media scale | media radius | media margin-top | header y |
|---|---|---|---|---|
| 0% | 1.000 | 24px | 48px | 0 |
| 25% | 1.175 | 14px | 27px | −87.5 |
| 50% | 1.300 | 6px | 12px | −150 |
| 100% | 1.400 | 0px | 0px | −200 |

Exactly the spec (`scale 1.4, borderRadius 0, marginTop 0`, header `y −200`,
`scrub 0.5`). Scrolling back to 0 restores every value. The margin/scale animate
inside the `overflow-hidden h-screen` hero shell, so downstream layout never moves
(bakery whole-page CLS 0.039, none of it from the scrub — see §7).

### 3. Menu (signature #5) — the pop vocabulary, with focus discipline

Both corners audited (`menu-home-*.png`, `menu-bakery-*.png`):

- Open: burger hides, panel scales from the corner origin with the `back.out(1.7)`
  overshoot **measured** mid-flight (scale 1.015–1.019 before settling at 1.0), ~0.6s.
- Close (button and Esc): panel `back.in(1.7)` 0.3s out, then the burger repops with
  scale overshoot + bar stagger.
- `aria-expanded` tracks state; focus moves into the panel on open and returns to the
  burger on close. Curtain plays over the open panel (z 9999 > 1000).

### 4. Audio player (signature #2) — two-state + weave verified

`player-*.png`; DOM-state JSON at each step:

- Play: card `bg-primary-3 → bg-primary-4` on the 300ms transition (computed
  background mid-flight `rgb(70,27,11)` at +150ms, settled `rgb(74,27,10)`); cover
  `scale-102`; time pill morphs 53px → 97px with the stacked-span swap
  (`01:25` ↔ `00:04 | 01:25`); button aria-label Play↔Pause. Pause restores every
  idle value.
- Narration weave: the `primary-4` wash follows the timings (active paragraph appears
  at 1.2s per `bakery.json`); **tap-to-seek verified** — clicking paragraph 2 seeks to
  41.85s (timing starts 41.1s), starts playback, and moves the wash there
  (`player-para-seek.png`).
- Mini player: latches on first play, and the opacity swap keys exactly off the main
  play button's viewport top (main card opacity 1↔0, mini 0↔1 with
  `pointer-events:none` when hidden; caught mid-crossfade at 0.02/0.98 —
  `player-mini-visible.png` / `player-mini-hidden.png`).

### 5. Map (signature #4) — the film works; the skip does not

`map-*.png`; UI-state JSON at each step:

- **Prologue**: aerial 13.75/pitch 0 at 800ms → settled tilted overview (scale bar
  300ft, pitch/bearing visible) by 3.5s (`map-prologue-*.png`). Reduced motion starts
  settled.
- **Route self-draw**: absent at 1.3s, complete dotted primary-9 line by ~3.5s
  (`map-1s-route-start.png` vs `map-8s-route-drawn.png`).
- **Dive**: marker tap → flyTo lands at zoom 20 (10ft scale, 3D extrusions), active
  pill `#F26835` at `scale(0.9)`, inactive `#4A1B0A` at `scale(0.8)` (inline styles
  read back), carousel up with active card `scale-100` vs neighbors `scale-85`,
  `?stop=` written to the URL (`map-dive-6s.png`).
- **Two-tap**: active card click navigates through the curtain with label + date
  (M1 run 4). **Overview**: 2s ease back, carousel dismissed, markers reset, `?stop=`
  removed. **Tour**: pitch-48 cinematic steps with "Stop the walk" present and
  functional; stopping restores the focused state. **1860 lens**: 700ms crossfade to
  Mark Priest's map with caption (`map-lens.png`). **Deep-link arrival**
  (`/map?stop=bakery`): 5s ease with the "Stop 1 of 5 / Holeur's Fashionable Bakery"
  nameplate, auto-dismissed by ~5.2s (`map-arrival-*.png`).

### 6. Reduced motion — zero broken states

Full sweep under `reducedMotion:'reduce'` (`rm-*.png`):

- Home: all six stack elements opacity 1 at 250ms; splash video `display:none`, still
  image shown. Curtain skipped — click → committed navigation in **102ms**.
- Bakery: 19/19 `.reveal` elements visible, 0 stuck after a full-page scroll; hero
  scrub never registers (media/header transform `none`); press-reveal swaps to the
  "Tap to reveal the painting" affordance; player state machine fully functional.
- Map: settled overview + complete route at 1.5s (no prologue), marker click is an
  instant jump with carousel present at 700ms.
- Menu: instant open/close. Global CSS kill-switch (`transition/animation-duration
  0.01ms !important`) backstops every CSS transition.

### 7. Scroll-jacking + CLS scan

- Native scroll everywhere: `html/body` overflow `visible` on all 7 routes,
  programmatic scroll lands where asked, no wheel/touch preventDefault outside the
  map canvas, no smooth-scroll library. (`html {scroll-behavior:smooth}` with the
  correct reduced-motion `auto` override.)
- Animation CLS ≈ zero: buffered layout-shift totals — home 0.0037, bakery 0.0392
  (all at t≈42ms image load, none from reveals/scrub), commissioners 0.0009, about
  0.0049, people 0, paintings 0. The reveal suite (opacity+translateY, CSS-owned) and
  both players (fixed/transform) shift nothing.
- **Exception: /map CLS 0.6362** — see F2.
- Console: zero errors/pageerrors on /, /bakery, /map, /about.

## Findings

### P1 — fix before launch sign-off

1. **F1 — The map-flight "skip" guardrail is broken two ways; a drag during the
   prologue strands the camera mid-flight.** `TroyMap.tsx` registers
   `map.once("pointerdown", skip)` / `map.once("wheel", skip)`, but Mapbox GL JS
   (v3.27) emits `mousedown`/`touchstart`, not `pointerdown` — the touch/mouse
   listener never fires (the only "pointerdown" in `mapbox-gl.js` is Marker-internal
   drag state). And the handler is `map.stop()`, which freezes the camera **where it
   is**, not at the destination. Observed: a tap 1.5s into the prologue does nothing
   (flight continues — `map-skip-tap.png`); a small drag halts the camera at an
   un-composed flat aerial (1,000ft scale, pitch ~0 — `map-skip-drag.png`) and the
   settled pitch-33 overview is never reached — there is no recovery affordance in
   the unfocused state (the Overview button only exists once focused). The same
   applies to the 5s QR arrival ease, where a stranded frame orphans the walker the
   feature was built for. ELEVATION-PLAN M3/F1 promises "skippable — any touch cuts
   to the destination"; today touch either does nothing or strands. Fix shape
   (builder's call): listen on `mousedown`+`touchstart`+`wheel`, and skip by jumping
   to the flight target (`jumpTo(OVERVIEW)` / the arrival camera) rather than
   `map.stop()`.

2. **F2 — /map ships CLS 0.63 at hydration.** `TroyMap` is `client:only="react"`, so
   the static HTML has no map shell at all; the typographic index renders at the top
   and jumps down a full viewport when the island mounts (layout-shift value 0.625 at
   t≈68ms locally; on a slow connection this is a visible full-page jump seconds in).
   The project perf budget (Lighthouse mobile ≥ 90, CLS effectively ≤ 0.1) cannot
   survive 0.63 on a flagship page. The `.map-shell { height:100dvh }` CSS already
   exists — reserving that height in the static document (placeholder div in
   `map.astro` around the island) would zero this out. Caught by the CLS scan; it is
   hydration-, not animation-driven, but it is the page's biggest motion artifact.

### P2 — visible blemishes on approved moments

3. **F3 — The settled overview hides two of the five stops on common desktop
   viewports.** At 1280×800 stop 5's pill is entirely above the viewport (only its
   stem/dot visible at the top edge) and stop 2's pill sits behind the "Drag to
   explore" hint card; at 1440×900 stop 5 grazes the top edge and stop 2 is still
   half-occluded by the hint (`map-8s-route-drawn.png`,
   `map-overview-topedge-crop.png`, `docs/qa/phase3/map-settled--1440.png`). The
   establishing shot's plate says "Five stops"; the frame shows three labels. The
   prologue's promise — see the whole walk — under-delivers exactly at its landing
   frame. Candidates: nudge `OVERVIEW.center`/zoom, fit-bounds the stops with padding,
   or move the hint card out of the pill band.

4. **F4 — Mini player time pill clips its last digit while playing.** The w-72 card
   with chapter 1's two-line subtitle compresses the row and the playing-state pill
   (`00:04 | 01:25`) overflows the card edge, cutting the final glyph
   (`player-mini-pill-clip.png`, from `player-mini-visible.png`). Needs `min-w-0` +
   truncation on the title block or a `shrink-0` pill inside the flex row.

### P3 — robustness / polish notes

5. **F5 — The Walk's index below the map is unreachable by wheel/trackpad.** The map
   consumes wheel for zoom over the full-viewport canvas (scrollY stayed 0;
   `map-after-wheel.png` shows the zoom-out), and nothing signals content below. The
   index is explicitly the keyboard/SR/no-JS path (Tab reaches it), but mouse users
   have no scroll path and no cue. Consider Mapbox `cooperativeGestures` or a
   scroll affordance if the index is meant to be discovered by everyone.

6. **F6 — Unhandled `audio.play()` promise in `AudioStory`.** `toggle()`/
   `seekParagraph()` call `a.play()` and set `playing=true` unconditionally; if
   playback is ever refused (autoplay policy edge, decode failure) the card latches
   into the playing state with silent audio, plus an unhandled-rejection in console.
   One `.catch(() => setPlaying(false))` closes it. (PressReveal already models this
   correctly with its `videoFailed` fallback.)

7. **F7 — documented deviation, no action: the curtain hold is split, not 1.0s.**
   Legacy holds a covered second on one page; the MPA split spends ~0.15s settle on
   page A + ~0.45s hold on page B and lets the real load absorb the difference —
   measured total cover ranged 1.2s (fast pages) to ~3.5s (map, heavy WebGL load)
   with the seam invisible in every sampled frame. This reads as intended and honors
   the legacy rhythm; noting it so nobody "fixes" it back to a fixed 1.0s.

## Motion inventory (observed on the instrument — seed for docs/MOTION.md)

| # | Effect | Trigger | Duration / easing | Reduced-motion variant | What it communicates |
|---|---|---|---|---|---|
| 1 | Curtain cover: neutral-2 panel rises + wordmark/destination (+ date on chapters) fades in | Click on any internal link (`data-no-curtain` opts out; modified clicks/new-tab exempt) | 0.6s `circ.inOut` panel; 0.3s `power2.out` text; nav at +0.15s | Instant navigation, no curtain | A scene change in the film; the destination is spoken; masks the MPA load |
| 2 | Curtain exit: hold, text out, panel exits upward | Destination load with sessionStorage flag | 0.45s hold; 0.1s text; 0.6s `circ.out` panel | None (page starts uncovered) | Completes the scene; "APRIL 27, 1860" stamps chapter entries |
| 3 | Curtain fail-open watchdogs | 4s (cover) / 3s (exit) after start | 0.4s `circ.out` release / instant park | n/a | The panel can never brick a page (verified against a hung load) |
| 4 | Home entry: frame settles from black, three-stack rises, date rule draws | Home load | 1400ms frame; 900ms `--ease-house` per element, 160ms stagger from 300ms; 700ms rule scaleX | Everything static and visible; splash film replaced by still | The memorial wakes; film inside the approved photo frame |
| 5 | Hero scrub: media scale 1→1.4, radius 24→0, margin 48→0; header y→−200 | Scroll through first viewport of chapter hero (GSAP ScrollTrigger, scrub 0.5) | Scrub-locked to scroll; verbatim legacy values | Effect absent; static hero | The framed painting grows to full bleed — the past develops into the present as you enter |
| 6 | Press-reveal: sketch dissolves into painting, then wakes into film | Press-and-hold 1400ms (pointer/touch); Enter/Space toggles; early release decays (rate 2.2) | rAF progress; 600ms `--ease-house` crossfade on lock; hint fade 500ms | Tap crossfades sketch → still painting | The thesis in miniature: the visitor develops the sketch into the living painting |
| 7 | Scroll reveals (`.reveal` → `.is-in`) | IntersectionObserver (12% threshold, −8% bottom margin), once | 800ms `--ease-house`, opacity + y30 | Visible statically (also the no-JS state) | Paces the reading; sections arrive as you walk |
| 8 | Player two-state: card primary-3↔4, cover scale-102, pill 53↔97px morph, padding breath | Play/pause | 300ms CSS transitions | Instant state swap (CSS kill-switch) | The card breathes while the story is spoken |
| 9 | Narration wash + tap-seek | `timeupdate` vs paragraph timings; paragraph click | 300ms background `--ease-house` | Instant | The transcript is the text; reading follows the voice, and touch steers it |
| 10 | Mini player opacity swap | Main play button top crosses viewport 0 (scroll) | 300ms opacity, pointer-events gated | Instant | The narrator follows the reader down the page |
| 11 | Menu open: panel pops from its corner | Burger click | 0.6s `back.out(1.7)` scale 0.8→1 (overshoot measured) | Instant show | Playful, physical; the corner notch is the hinge |
| 12 | Menu close + burger return: panel back.in, burger re-pops with bar stagger | Close button / Esc | 0.3s `back.in(1.7)`; burger 0.5s pop + rotation −180; bars scaleX stagger 0.1 | Instant swap | Reversibility in the same voice |
| 13 | Map prologue: aerial → tilted overview | Map load without `?stop=` | 3.5s easeTo (13.75/0/0 → 15.25/33/10) | Starts settled | Establishing shot: first the city, then the walk |
| 14 | Route self-draw: dotted primary-9 line traces the five stops | Load +1.2s | ~1.3s rAF growth | Instant full route | The walk draws itself across Troy |
| 15 | Marker dive | Marker tap; carousel change (debounced 150ms) | flyTo zoom 20, speed 0.6, curve 1.4 | jumpTo zoom 18.5 | Descend from the story to the street where it happened |
| 16 | Overview return | Overview button | 2s easeTo | jumpTo | Release back to the whole story |
| 17 | Deep-link arrival + nameplate | `/map?stop=<slug>` (QR path) | 5s easeTo; nameplate ~5.2s | jumpTo (nameplate still shows) | The walker lands on their stop with a spoken title |
| 18 | Guided tour | "Take the walk" | Per stop: 2.6s flyTo (pitch 48, alternating bearing) + dwell; "Stop the walk" aborts | 1.2s stepped jumps | The whole rescue traced as one flight |
| 19 | Marker active/inactive | Selection state | 300ms transform, scale 0.8↔0.9 + palette swap | Instant | Where you are on the walk |
| 20 | Carousel slide + card scale | Drag / tap inactive card / programmatic focus | keen-slider linear 400ms; card scale 0.85↔1, 300ms ease-out origin-bottom | Slide is direct-manipulation (JS transform, exempt); scale instant | Chapters as a hand of cards; the active one is offered |
| 21 | 1860 lens crossfade | "See Troy in 1860" toggle | 700ms opacity | Instant | Time travel: today's streets under Mark Priest's 1860 Troy |
| 22 | Micro-interactions: buttons, links, hint dismiss, share | Hover/active/focus | 300ms `transition-all/colors` (`--dur-ui`) | Instant | Feedback, never decoration — the house default |

## Evidence index

`docs/qa/phase23-motion/`: curtain sequences (`curtain-{home-map,bakery-next,menu-about,map-card}-NN.png`),
fail-open (`failopen-*.png`), hero (`hero-scrub-{0,25,50,100}.png`), menu
(`menu-{home,bakery}-*.png`), player (`player-{idle,playing,sync,paused,para-seek,mini-*}.png`),
map (`map-prologue-*ms.png`, `map-{1s,7s,8s}-*.png`, `map-dive-*.png`,
`map-overview-*.png`, `map-tour-*.png`, `map-lens.png`, `map-arrival-*.png`,
`map-skip-{tap,drag}.png`, `map-after-wheel.png`), reduced motion (`rm-*.png`).
Numeric traces are printed by the `scratch/qa-m*.mjs` scripts (rerunnable against the
frozen build).
