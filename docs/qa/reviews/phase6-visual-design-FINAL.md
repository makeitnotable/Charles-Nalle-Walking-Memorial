# Phase 6 Visual Design Review — FINAL live-deploy gate

*Fresh-eyes review, 2026-08-02, against the LIVE deploy
(`https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial`). Baselines:
`docs/BASELINE.md`, `docs/LEGACY-PORT-NOTES.md`, `docs/qa/legacy/*.png`. Prior review:
`docs/qa/reviews/phase23-visual-design.md`. Evidence: live captures in `docs/qa/phase6-vd/`
(`node scripts/shots.mjs docs/qa/phase6-vd --base <live> --routes /,/bakery,/map,/people
--scrolls 2` — all 12 route×viewport captures succeeded, zero console errors), computed-style
probes `scratch/phase6-final-verify.mjs` + `scratch/phase6-final-verify2.mjs` (outputs:
`scratch/phase6-final-verify*.out`), pixel samples `scratch/phase6-hex-sample*.mjs`.*

## Verdict: RED

Three of the four claimed fixes verify exactly on live. But the fourth — the `/people` h1
widow fix — shipped **corrupted**: the headline now renders duplicated text with a literal
"NBSP;" visible on the page at every viewport. One new P0. Fix is a one-line edit; re-gate
should take minutes.

## Fix verification (prior P0/P1s)

### 1. P0 marker-pill ladder — VERIFIED FIXED

Measured on live `/map`, computed style of the pill label `<p>` (settled, 8s):

| Viewport | Label font-size | Pill padding | Line-height |
|---|---|---|---|
| 390 | **12px** | 8px | 18px |
| 768 | **15px** | 10px | 22.5px |
| 1440 | **18px** | 12px | 27px |

Exactly the contracted 12→15→18 / `p-[8px] md:p-[10px] lg:p-3` ladder. Chip is now
`width:20px;height:20px` in CSS (renders 16px under the spec'd inactive `scale(0.8)` —
correct). Everything else re-verified exact from the DOM: inactive `#4A1B0A` bg / `#FF9770`
text / `#80412B` 1px border, chip `#E45B27`, stem 2×24 `#80412B`, radius 30px, Poppins 500,
`scale(0.8)` with 300ms transition. Pixel samples on the captures confirm (`#4a1b0a` pill,
`#e45b27` chip, exact).

### 2. P1 home atmosphere — VERIFIED FIXED

Live home now carries the full approved stack: bottom gradient
`linear-gradient(rgba(16,10,6,0) 65%, #100A06 100%)` (measured on an `absolute inset-0`
layer at 390 and 1440) + the contour overlay (`homepage-overlay-800/-1440.webp`, responsive)
+ film filter now `grayscale(1) brightness(.6) sepia(.1)` (dimmed from .7 as claimed).
Side-by-side with `docs/qa/legacy/home--390.png`: contour texture visible, mission copy sits
on the darkened falloff band (sampled `#1a120f` at the frame foot), page bg `#1d1411` exact,
CTA `#ffc6b3` exact. The film strip shows a different painting frame than the legacy capture
(it rotates), so luminance can't be compared frame-to-frame — but the mood now reads as the
approved near-black atmosphere, not the brighter drift the prior review flagged.

### 3. P1 bakery embed camera — VERIFIED FIXED

With the flight allowed to settle (9s probe), the bakery Where-to-next embed shows the
destination pill "2 Commissioner's Office" **in view and near-centered** at both 390
(marker at x80/y28 of a 356×227 map) and 1440 (x200/y71 of 670×341). The static
`--scroll2` captures show a pill-less mid-flight frame — that is the same capture-timing
artifact the prior review documented (shots.mjs waits only 1.2s after scrolling); not a
defect. Embed media border `#69311d` 1px rounded confirmed by corner zoom.

### 4. /people h1 widow — **BROKEN ON LIVE — NEW P0** (see below)

## New findings

### P0

1. **`/people` h1 is corrupted — the widow "fix" was a botched edit that shipped.**
   Live DOM (and repo source, `src/pages/people.astro:39`):

   ```html
   <h1 class="type-display type-display-caps reveal mt-4">
     One day.<br />A whole city'sOne day.<br />A whole city's cast.nbsp;cast.
   </h1>
   ```

   The replacement text was merged into the original instead of replacing it, and the
   `&nbsp;` entity lost its `&`. The live page renders, at every viewport:
   **"ONE DAY. / A WHOLE CITY'SONE DAY. / A WHOLE CITY'S CAST.NBSP;CAST."** — duplicated
   headline copy plus a literal "NBSP;" in display caps on a client memorial page
   (captures: `people--390.png`, `people--1440.png`). Intended line is evidently:

   ```html
   One day.<br />A whole city's&nbsp;cast.
   ```

   which also resolves the original widow (390 wraps "A whole / city's cast." — no
   single-word last line). One-line fix + redeploy + re-shot.

### P1

None.

### P2 / notes (non-blocking)

2. **Pin label residue from prior P1 #2:** "Bank" → "Commissioner's Office" is now covered —
   it is a documented Kathy correction (`docs/CONTENT-STATUS.md`, "Map label" row), so the
   dominant label swap is client-directed, not drift. But "Gilbert Mansion" and
   "Ferry Landing" (approved: "Mansion", "Ferry") remain undocumented overrides sourced from
   the chapter JSONs (`src/content/chapters/{mansion,ferry}.json` `map.label`). They follow
   the same full-name pattern the client correction established, so this is downgraded to a
   documentation gap: add one CONTENT-STATUS line blessing the long labels, or shorten them.
3. At 1440 the larger "Commissioner's Office" pill slightly overlaps the "Bakery" pill in the
   overview framing (the two stops are a block apart). Both stay legible; inherent to the
   bigger desktop pills. Watch it if labels ever get longer.
4. Prior P2s (pull-quote inline `1.35em`, map-chrome button sizing, hero shell width, etc.)
   were not in scope for this gate and remain as recorded in phase23.

## Spot-check (overall gate)

- **Tokens:** every glyph-free pixel sample on all four routes is on-token — page bg
  `#1d1411`, filled buttons `#4a1b0a`, chips/hamburger accents `#e45b27`, home CTA
  `#ffc6b3`, outline-button interiors transparent over `#1d1411`, media border `#69311d`.
  No off-token hex found.
- **Ladder:** display caps, labels, card titles, body all render at their documented roles on
  the sampled screens; the marker pills now join the ladder (the one element that previously
  refused). People cards, bakery hero, map chrome, Where-to-next all scale correctly
  390→768→1440.
- **Family:** home, bakery, map, and people all still read unmistakably as the approved
  design elevated — atmosphere, spacing rhythm, rag, and section skeletons intact on live.
- **Console:** zero page errors across all 12 captures.

## Re-gate instructions

Fix `src/pages/people.astro:39` to `One day.<br />A whole city's&nbsp;cast.`, deploy, then:
re-shot `/people` at 390/1440 (`node scripts/shots.mjs docs/qa/phase6-vd --base <live>
--routes /people --scrolls 1`) and confirm the h1 reads "ONE DAY. / A WHOLE / CITY'S CAST."
at 390 with no widow and no stray characters. Nothing else needs re-review; on that single
verification this gate flips GREEN.
