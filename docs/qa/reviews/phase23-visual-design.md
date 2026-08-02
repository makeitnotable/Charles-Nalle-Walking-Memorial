# Phase 2+3 Visual Design Review — core screens + map

*Fresh-eyes review, 2026-08-02. Reviewer had no builder context. Baselines: `docs/BASELINE.md`
(token contract), `docs/LEGACY-PORT-NOTES.md` (verbatim approved spec), `docs/qa/legacy/*.png`
(approved renders). Under review: `/`, `/bakery`, `/commissioners-office`, `/map`, `/people`,
`/paintings`, `/about` at 390/768/1440. Evidence: fresh captures in `docs/qa/phase23-vd/`,
computed-style + pixel probes in `scratch/phase23-vd-measure.mjs` (output:
`scratch/phase23-vd-measure*.out`), interaction probe `scratch/phase23-vd-map-probe.mjs`.*

## Verdict: FAIL

One P0 (map marker pills never climb the type ladder) and three P1s. Everything else —
tokens, the display/body/label ladders, rag, section skeletons, spacing rhythm — measured
**exact** at all three breakpoints on every page. The build unmistakably reads as the approved
design, elevated. Fix the four findings below and this passes on a re-shot; none of them
require rethinking anything.

### Baseline caveat the next reviewer must know

The approved renders in `docs/qa/legacy/` at 768 and 1440 show **mobile styles for every
element** (legacy h1 measures 42px at 1440, wordmark 54px, hero at max-w-7xl px-0, pills at
mobile padding). The legacy capture rig evidently never applied `md:`/`lg:` variants. The
768/1440 PNGs are therefore only valid for layout gestalt, not for sizes. The size authority
is the documented ladder in BASELINE.md / LEGACY-PORT-NOTES.md — which v3 implements
correctly almost everywhere (measured: display 42/34 → 52.5/42.5 → 63/51, tracking
−1.5/−1.875/−2.25px, exact to the hundredth at all 3 widths on all 7 routes).

## Findings

### P0

1. **Map marker pills are frozen at mobile size at all breakpoints.** The pill is built with
   inline styles (`padding:8px; border-radius:30px; font 12px Poppins 500`) so it cannot
   respond: measured 12px label / 8px padding at 390, 768 AND 1440, chip 16px. Contract:
   pill `p-[8px] md:p-[10px] lg:p-3`, label `text-[12px]→[15px]→[18px]`, chip 20px
   (LEGACY-PORT-NOTES "Map — Marker"; BASELINE "Labels: 12→15→18"). Affects `/map` and every
   embedded Where-to-next map at 768/1440. (The legacy 1440 PNG also shows 12px pills, but per
   the caveat above those captures are mobile-styled throughout and cannot bless this.)
   Everything else about the pills is exact: inactive `#4A1B0A` bg / `#FF9770` text /
   `#80412B` 1px border / scale .8, active `#F26835` / `#FED9CC` / scale .9, chip `#E45B27`,
   stem 2×24 `#80412B`, radius 30px, Poppins 500 — all verified computed.

### P1

2. **Approved pin labels replaced.** v3 renders "Commissioner's Office", "Gilbert Mansion",
   "Ferry Landing" where the approved design renders **"Bank"**, "Mansion", "Ferry"
   (LEGACY-PORT-NOTES calls out `Commissioner's Office ("Bank" pin label)` explicitly; legacy
   PNGs show the short labels). The long labels also widen the pills well past the approved
   silhouette. Port notes give Brian's pins authority over *coords*, not label copy. Restore
   the approved short labels or document the override.

3. **Bakery Where-to-next embedded map loses its destination.** At 390 and 1440 captures and
   in a live probe (`scratch/bakery-390-embed.png`), the embed shows a wide, off-target
   camera and **no "2" marker in view** (the marker exists in the DOM). The
   commissioners-office embed is correct ("3 Gilbert Mansion" pill centered at destination
   zoom). Bakery embed props carry `pitch:45 bearing:45 zoom:17` — the chapter-1 camera —
   suggesting the per-chapter camera is keyed to the *current* chapter instead of the
   destination, and the easeTo never lands on the pin. The section's whole job is "see where
   you're going next"; on the first chapter every visitor walks, it currently shows nothing.

4. **Home frame is missing two approved background layers.** Approved stack
   (LEGACY-PORT-NOTES "Home"): `linear-gradient(180deg, rgba(16,10,6,0) 65%, #100A06 100%)`
   + `homepage-overlay.png` (the map-contour texture visible in every legacy home PNG)
   + image, with filter + frame at 50% opacity. v3 has the filter
   (`grayscale(100%) brightness(.7) sepia(.1)`) and the 50% frame opacity, but **no bottom
   gradient and no contour overlay** (home HTML contains neither). Result: the frame reads
   brighter and busier than the approved near-black atmosphere, and the mission copy sits on
   unshaded film frames. Side-by-side this is the one screen that drifts from "same design,
   elevated" toward "different mood."

### P2

5. Pull-quote blockquotes (new element, `reveal-quote`) size via inline `font-size:1.35em`
   → 21.6px at every breakpoint — the only type on the chapter pages that never scales.
   Give it a ladder role instead of an inline em.
6. Hero block runs 1344px wide at 1440 (`lg:px-12`, no max-width) while every other section
   sits in the 1280 `max-w-7xl` shell; legacy 1440 render shows the hero aligned at the
   shell. Header starts x≈76 vs section content x≈96–108.
7. Historical Context gains a 4-paragraph 2-col prose block not in the approved skeleton
   (h3 + number + media + numbered-points row). Kathy-content keeper, additive — confirm
   intent, else it dilutes the section's punch.
8. The approved post-narrative "Chapter 2" button is gone; replaced by the (new)
   "CHAPTER N — DESTINATION" label + "Continue the walk" filled button in Where-to-next.
   Same family, arguably better — flag for approval. Button tokens themselves are exact
   (filled `#4A1B0A`/`#FF9770`/border `#69311D`, outline border `#A55438`, 18→22.5→27,
   py 16→20→24 / px 24→30→36).
9. Map chrome additions are new UI with no approved counterpart: title chip
   ("THE WALK · FIVE STOPS · APRIL 27, 1860"), drag-hint pill, geolocate control, scale bar,
   and "Take the walk" / "See Troy in 1860" buttons at a static 14px Poppins py-10/px-20 —
   off the documented button spec. All on-token visually. The approved always-visible bottom
   card slider now appears only in walk mode ("Take the walk" → keen-slider, 5 slides,
   fixed bottom — verified; active/inactive marker swap exact per spec). Initial state =
   overview + static "Five stops through Troy" list section below the map (new). Deliberate
   elevation by all appearances — needs sign-off as the map's resting state differs from the
   approved render.
10. `/people` h1 at 390 ends in a single-word widow line ("ONE DAY. / A WHOLE CITY'S /
    CAST.") — the hard break after "ONE DAY." defeats `balance` on the second segment.
11. About drift vs approved renders: "CHARLES NALLE" section h3 renders one line (approved:
    stacked two); portraits at 124px/212px vs approved ~250–375px offset squares; the steps
    "Get Directions" button was dropped; "OVERVIEW" label moved above the h1 (now matches the
    chapter-label pattern — fine, but it's a flip from the approved render).
12. Commissioners-office 390: hero title drops the approved "PART 1." line (the merged page
    moves Part headings into section h3s — coherent), and the hero arrow sits within ~8px of
    the final "R" — tight vs legacy's clear lane.
13. First-word drop cap requests weight 400; only 300/600/800 ship, so it renders 300 —
    one step lighter than legacy's true 400. global.css documents 400 as the approved
    rendering; either ship a 400 face or document 300.
14. Informational: the home wordmark correctly scales 54→67.5→81 per contract; the legacy
    768/1440 PNGs show 54 fixed (capture-rig artifact, see caveat). Do not "fix" v3 to match
    the broken baselines.

## Verified exact (measured, all three breakpoints)

- **Tokens:** page bg `#1d1411` (pixel-sampled); media borders `#69311d` 1px, card borders
  `#69311d` 2px (pixel-sampled); player idle `#341a11`; badges/chips `#e45b27`; labels
  `#ff9770`; body `#fed9cc`; headings `#f6f3ee`; home CTA `#FFC6B3`/`#BD3900`/`#F7A98F`
  at w-148. No off-token hex found anywhere.
- **Ladder:** display 42/34 → 52.5/42.5 → 63/51 (tracking −1.5/−1.875/−2.25); labels
  12→15→18 Poppins uppercase; progress 12→15→18 Poppins 500; card titles 18→22.5→27;
  eyebrow 14→17.5→21; muted 12→15→18; body 18/300/1.6; drop cap 32px; wordmark 54→67.5→81
  with −2.5px tracking and the `self-end -mt-3` interlock.
- **Rag:** `balance` on display, `pretty` on body; approved hard breaks intact — title `\n`s,
  "Historical / Context", "Where / to next?", moral-line stacks.
- **Skeletons:** chapter order hero → player → narrative → historical → moral → where-to-next
  (with additive quote + painting-interlude sections); two-scene merge on
  /commissioners-office is coherent (two players, Part 1/Part 2 h3s); Home three-stack
  frame (eyebrow / wordmark / 1821—rule—1875, CTA middle, mission bottom with both approved
  copy variants and the `<br/>` after "designed" at lg); hamburger 72×72 `bg-primary-3`
  border-2 `primary-6` corner-notched, top-right on home, bottom-right on content pages
  (matches renders).
- **Spacing:** every measured margin/padding/gap on the 8px scale (16/24/32/48/64;
  narrative gap-y 32 → 48 at lg).
- **Player:** card 469px @768 / 520px @1440, rounded-3xl border-2 `primary-6`, idle
  `primary-3`, play tile `primary-4` + `#F26835` icon, time pill `primary-10` — plus the
  planned v3 elevations (scrub bar, paragraph sync) reading natively in the language.

## Re-review instructions

Fix 1–4, re-run `node scripts/shots.mjs docs/qa/phase23-vd --routes
/,/bakery,/commissioners-office,/map --scrolls 3`, and eyeball: 1440 map pills ≥ 18px
labels, "Bank" pill on /bakery embed centered at zoom ~17.8, home frame contour texture +
bottom falloff present at 390.
