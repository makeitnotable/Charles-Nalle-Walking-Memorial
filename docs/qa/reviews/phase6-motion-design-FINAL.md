# Phase 6 Motion Design review — FINAL live-deploy gate

*Reviewer: fresh-context Motion Design discipline (no builder context). 2026-08-02.*
*Instrument: the LIVE deploy — `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial`
(GH Pages, base path `/Charles-Nalle-Walking-Memorial`) — driven by
`scratch/phase6-f1-skip.mjs`, `phase6-f1b-drag.mjs`, `phase6-f2-cls.mjs`,
`phase6-curtain.mjs`, `phase6-curtain-seam.mjs`, `phase6-interlude.mjs`,
`phase6-reduced.mjs`, `phase6-rm-map2.mjs`. Evidence: `docs/qa/phase6-motion/`.
Viewport 1280×800 unless noted. Prior review: `phase23-motion-design.md`
(PASS conditional on F1 + F2).*

## VERDICT: **GREEN**

Both launch conditions are verified fixed **on the live deploy**, measured, not
taken from the fix notes: every arrival flight now cuts to its destination on the
first touch (mousedown, drag, and the deep-link arrival all land inside 300ms with
zero stranded frames in six runs), and the /map hydration shift is gone —
live CLS 0.0003–0.0012 against the 0.1 budget, including a 4× CPU-throttled mobile
run. The curtain plays its full choreography on live with the "APRIL 27, 1860"
over-title on chapter navigations and an invisible seam, the new painting-interlude
Ken Burns scrub is transform-only, monotonic, and jank-free, lazy-loaded films
start after window load, and the reduced-motion contract holds on both sampled
routes. No new P0/P1. One new P2 (a pill-on-pill occlusion in the settled
overview) and one P3 note, below — neither blocks the gate.

## 1. F1 — flight skip: VERIFIED FIXED on live

The fix (`TroyMap.tsx`: `mousedown`/`touchstart`/`wheel` → `map.stop()` +
`jumpTo(flightTarget)`, disarmed on natural `idle`) behaves on live exactly as
promised. Camera state read via the scale control (no window handle is exposed —
`mapboxgl` global undefined) plus in-browser pixel diffs of stepped captures.

**Prologue tap** (mouse.down at t=1.5s, canvas at 350,620):

| probe | scale @tap+280ms | scale @4s | scale @8s | pixel diff |
|---|---|---|---|---|
| tap at 1.5s | **500 ft** (settled) | 500 ft | 500 ft | +280ms vs 8s **0.07%** (route still drawing); 4s vs 8s **0.00%** |
| control (no input) | 1,000 ft mid-flight @1.85s | — | 500 ft | 1.85s vs 8s **26.77%** |

`f1-prologue-tap-plus280ms.png` is already the tilted fit-bounds overview with the
hint dismissed (`cut()` is the only thing that dismisses it programmatically) —
the camera IS at the destination within the ~300ms window, not stranded flat.

**Prologue drag mid-flight** (`phase6-f1b-drag.mjs`, drag 600ms after the map
`load` event, i.e. unambiguously inside the 3.5s ease): hint dismissed, scale
500 ft at +300ms and unchanged at final; `f1-prologue-dragmid-plus300ms.png` shows
the settled overview with pills and the partially-drawn route. The original
stranding repro (phase23 `map-skip-drag.png`, flat 1,000 ft aerial, no recovery
affordance) is dead. One earlier drag run (`f1-prologue-drag-*.png`) fired at
1.5s wall-clock before the style `load` had armed the listeners — the flight then
ran and settled normally by 8s (500 ft), i.e. even the pre-flight-input case ends
composed, never stranded.

**Deep-link arrival** (`/map?stop=mansion`, tap at t=2s): scale cuts to **10 ft**
(street level, zoom 20) by +280ms and reads 10 ft again at 9s;
`f1-arrival-tap-plus280ms.png` shows the full arrival composition already parked —
"STOP 3 OF 5 / URI GILBERT MANSION" nameplate, 3D extrusions, active pill,
carousel focused on chapter 3. The 9s frame is identical minus the nameplate
(auto-dismissed at 5.2s — the 2.96% diff is that region). Control without input is
still mid-ease at 2.3s (1,000 ft, 21.94% diff vs landed). The QR walker the
feature was built for gets their stop on the first touch.

## 2. F2 — /map hydration CLS: VERIFIED FIXED on live

`map.astro` server-renders the full-height `.map-shell` with the "The walk is
loading…" plate (confirmed present in the raw GH Pages HTML via curl), so the
island hydrates into reserved space. Buffered `layout-shift` observer on live:

| profile | load CLS | full-page CLS (scroll to index) | biggest entry |
|---|---|---|---|
| desktop 1280×800 | **0.0003** | 0.0003 | none > 0.0005 |
| mobile 390×844 | **0.0012** | 0.0012 | 0.0011 @339ms, `mapboxgl-ctrl-bottom-left` |
| mobile 390×844, 4× CPU throttle | **0.0012** | 0.0012 | same ctrl @1080ms |

Was **0.6362** at phase 2+3. Now two orders of magnitude under the 0.1 budget on
every profile; the only mover is Mapbox's own attribution/scale strip.

## 3. Curtain on live — full choreography + over-title

**home Continue → map** (`curtain-home-map-0*.png`, DOM state logged): panel rises
(panelTop 288 → 0 across 250–550ms) with the interlocked CHARLES/NALLE wordmark;
page B starts **fully covered** (panelTop 0 at the first sample after commit),
holds, exits upward (−633 mid-flight) and parks at translateY(100%) with
`pointer-events:none` and the sessionStorage flag cleared.

**Chapter over-title** (/map index stop card → /bakery, commit-time sampling in
`phase6-curtain-seam.mjs`): cover shows **"BAKERY / APRIL 27, 1860"**
(`curtain-overtitle-cover.png` — date in primary-9 under the destination); page B
samples read panelTop 0 with the over-title still up from t=170 through 417ms
(the ~0.45s hold), then −130 → −788 → parked at 800/`none` by t≈1.17s. The seam
was invisible in every sampled frame. No pageerrors on either run.

## 4. Painting interlude (new since phase 2+3) — clean scrub

`/bakery` full-bleed band, three offsets (`interlude-bakery-{1,2,3}.png`):

| band position | img scale | img translateY |
|---|---|---|
| entering (top at 75% vh) | 1.102 | −15.8px |
| centered | 1.060 | 0px |
| leaving (bottom at 25% vh) | 1.018 | +15.8px |

Monotonic, subtle, transform-only — matches the `1.12→1 / yPercent −4→4, scrub
0.6` spec inside the `overflow-hidden` band, so nothing downstream moves. Jank
probe through the band: **0 long frames of 195**. Page CLS including the scrub
pass: 0.0411, of which 0.0375 is the known t≈460ms hero image load — scrub-window
entries are ≤0.0008. Lazy `loading="lazy"` image resolved before the band arrived.

## 5. Reduced motion + lazy video + console

- **/bakery** (`reducedMotion:'reduce'`): hero media and interlude img computed
  transform `none` (both scrubs correctly never register), press-reveal shows the
  "Tap to reveal the painting" affordance (`rm-bakery-top.png`), **20/20** reveal
  elements visible after a full-page sweep, 0 stuck, 0 invisible.
- **/map** reduced: settled fit-bounds overview with all 5 markers
  (`rm-map-settled-2.png`, capture gated on marker mount), scale 500 ft matching
  the normal-motion settle; marker tap is an instant jump (50 ft) with the
  carousel up and `?stop=ferry` written (`rm-map-focused.png`). No broken states,
  no pageerrors.
- **Lazy video** (new): home splash `<video>` has its src at the `load` event
  (readyState 0) and is **playing at +3.5s** (readyState 4, currentTime 3.45,
  paused false, display block — `home-splash-3500ms.png` shows the film inside
  the approved frame).
- **Console scan** on live `/`, `/bakery`, `/map`, `/about`: zero console errors,
  zero pageerrors — across every probe in this review.

## Findings

### P2 — visible blemish, not gate-blocking

1. **F8 (new) — Stop 1's pill is fully occluded behind Stop 2's pill in the
   settled overview.** The fit-bounds `overviewCamera()` fix resolved old F3's
   viewport clipping — all five markers now measure `inView:true` at 1280×800 —
   but stop 1 (Holeur's Fashionable Bakery, rect 676,261 114×91) sits entirely
   inside stop 2's pill (544,233 255×91): the two stops are a block apart and
   both anchor in the same band (`f1-overview-pills-settled.png` crop — a sliver
   of pill 1 peeks behind pill 2/3). The establishing plate says "Five stops";
   the frame labels four, and a tap on that area dives to stop 2. Mitigations
   already on the page: the carousel, the typographic index, and the aria-labeled
   buttons all reach stop 1, and the pills separate at any dive zoom. Candidates:
   add stop 1 to the above/below split (`PIN_ABOVE`-style), or nudge
   bearing/padding so the State St cluster fans out. Same family and severity as
   shipped F3 — polish, not a launch condition.

### P3 — notes

2. **Live Mapbox style latency moves the whole map timeline.** On GH Pages the
   style `load` (which starts the prologue, mounts markers/route, and arms the
   skip) fired anywhere from ~1.2s to **6.5s** after navigation across runs. The
   pre-load state is benign — the construction camera renders a static tilted
   map over the server-reserved shell, and input before `load` neither breaks nor
   strands anything (verified above) — but demo-day walkthroughs should expect
   the film to start late on cold caches. Nothing to fix in motion; noting for
   expectations.
3. Prior P2/P3s (F4 mini-player pill clip, F5 wheel-blocked index, F6 unhandled
   `audio.play()`) were not re-tested at this gate and stand as previously filed.

## Evidence index

`docs/qa/phase6-motion/`: F1 (`f1-prologue-{control,tap,drag,dragmid}-*.png`,
`f1-arrival-{control,tap}-*.png`, `f1-overview-pills-settled.png`), curtain
(`curtain-home-map-01..05.png`, `curtain-overtitle-{cover,pageB-early,pageB-hold}.png`),
interlude (`interlude-bakery-{1,2,3}.png`), reduced motion
(`rm-bakery-{top,interlude}.png`, `rm-map-{settled,settled-2,focused}.png`),
lazy video (`home-splash-3500ms.png`). Numeric traces (scale-control reads, CLS
entries, panel samples, transform matrices, pixel-diff percentages) are printed by
the `scratch/phase6-*.mjs` scripts, all rerunnable against the live URL.
