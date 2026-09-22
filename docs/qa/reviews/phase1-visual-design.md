# Phase 1 Visual Design review — /styleguide vs the approved baseline

*Reviewer: fresh-context Visual Design discipline (no builder context). 2026-08-02.*
*Baselines: `docs/BASELINE.md` (token contract), `docs/LEGACY-PORT-NOTES.md` (verbatim
legacy spec), `docs/qa/legacy/*.png` (rendered truth of the approved design).*
*Instrument: `http://localhost:4321/styleguide`, pixel-sampled by
`scratch/phase1-visual-audit.mjs` (Playwright, computed styles at 390/768/1024/1440)
plus `scratch/legacy-pill-sample.mjs` (canvas pixel-sample of the legacy screenshots).
Fresh captures at `docs/qa/phase1-recheck/` — the `docs/qa/phase1/` set is stale (see F8).*

## VERDICT: **PASS** (conditional — no P0; fix F1–F2 before Phase 2 sign-off)

The reconstruction is faithful where it counts: every one of the 60 ramp hexes sampled
exact, the ×1.25/×1.5 type ladder measures exact at every breakpoint, primary-9 is the
canonical `#F26835` everywhere it appears, and no trace of the v2 invented identity
(Fraunces / Newsreader / paper grain / per-chapter palettes) survives in the rendered
instrument. Two P1s: the button primitive's type size is wrong, and the Phase 1 removal
inventory left dangling class/variable references outside the styleguide.

## Measured results (what passed)

- **Token fidelity — exact, 60/60.** All five 12-step ramps sampled via
  `[data-token]` computed background-color: primary, secondary, tertiary, gray,
  neutral — every step matches the contract hex exactly. `primary-9 = #f26835`
  (canonical, NOT `#f28835`; the only `f28835` in the repo is the explanatory comment
  in `global.css:35`). Home CTA sampled `#ffc6b3 / #bd3900 / #f7a98f` exact.
- **Type ladder — exact at all four widths (measured, not eyeballed).**
  - `.type-display`: 42/34 → 52.5/42.5 (768) → 63/51 (1024 and 1440); tracking
    −1.5 → −1.875 → −2.25px; Martel Sans 600; neutral-12. All exact.
  - `.type-wordmark`: 54 → 67.5 → 81; tracking −2.5px at all widths; uppercase;
    lh 1; second line `self-end` at −0.75rem (legacy `-mt-3`). Exact.
  - `.type-body`: 18px / 300 / lh 28.8 (1.6) / primary-12 at every width. Exact.
  - `.type-label`: 12 → 15 → 18; Poppins; uppercase; primary-11. Exact.
  - Supporting roles also on-ladder: card-title 18 → 22.5 → 27, eyebrow 14 → 17.5 → 21,
    muted 12 → 15 → 18, badge 16 → 20 → 24px with 10 → 12.5 → 15px numeral.
- **Primitives match the legacy family (verified against legacy screenshots):**
  filled button bg/text/border `#4a1b0a / #ff9770 / #69311d`, outline border `#a55438`,
  player card idle `#341a11` → playing `#4a1b0a` with border-2 `#69311d`, time pill
  `#e45b27`, play/pause icon stroke `#F26835`, hamburger 72×72 `#341a11`/border
  `#69311d`/bars `#e45b27` with 12px corners ×3 + 32px notch (`rounded-bl-4xl`),
  marker pills active `#f26835/#fed9cc` scale-.9 / inactive `#4a1b0a/#ff9770/#80412b`
  scale-.8 with stem+dot. Pixel-sampling the legacy `map--1440.png` confirms the
  rendered legacy pill was exactly `#4a1b0a` body, `#e45b27` chip, `#fed9cc` chip
  numeral, `#ff9770` label — the styleguide reproduces the approved values, not just
  the spec text.
- **No v2 remnants.** Computed font-family sweep over every element: only Martel Sans
  and Poppins stacks. No Fraunces/Newsreader in source or `package.json`; no
  `.paper` grain; `theme-color` is `#1d1411`; body bg `primary-2`; curtain resting
  styles use neutral-2 `#100a06`; motion tokens are the house vocabulary
  (`--ease-house/--ease-pop/--ease-circ-*`, 300ms UI default) with a global
  reduced-motion kill switch.

## Findings

### P1 — visible mismatch with the approved family

1. **Buttons render 16px Poppins at every breakpoint; the approved base is 18px.**
   The three buttons in the styleguide row (`src/pages/styleguide.astro:105-116`) set
   no font-size, so they inherit Poppins 16px at 390, 768, and 1440 (measured). Legacy
   `Button.jsx` is `text-[1.125rem]` (18px) at base — and the legacy screenshots render
   ~18px (home `Continue` ≈60px tall vs styleguide ≈52px; `Chapter 2` at 1440
   likewise). Padding (16/24), min-w 147px, colors, and states are all correct — only
   the type size is off. Fix: 18px base. Note the legacy class spec also ladders
   md/lg (22.5/27px + py-20/24, px-30/36), but the legacy *rendered* screenshots stay
   at base sizes even at 1440 — pick one truth deliberately and record it in
   BASELINE.md; 18px base is the non-negotiable either way.

2. **Phase 1 removal inventory is half-executed: deleted tokens/classes are still
   referenced outside the instrument.** `--chapter-accent/-surface/-ink`,
   `.font-display`, `.display-hero`, `.label-caps`, `.drop-cap`, `--font-display`,
   `--ease-settle` were removed from `global.css` (correct) but their consumers were
   not repointed: `src/pages/map.astro` (33-34, 52, 58, 65, 86, 92),
   `src/pages/people.astro` (32-33, 44, 51-52), `src/pages/paintings.astro`
   (41-42, 71, 80), `src/pages/about.astro` (15, 23, 46, 54-55), `src/pages/404.astro`
   (12, 21-22, 26), `src/components/Narration.tsx` (149, 158, 172, 187-189, 208),
   `src/components/TroyMap.tsx` (192, 220, 229, 240, 248, 267, 271, 276),
   `src/components/InlineMedia.astro` (33). These now resolve to nothing (colorless
   accents, default-weight headings) on /map, /people, /paintings, /about, /404 and in
   the narration/map islands. BASELINE explicitly assigns "`--chapter-accent` refs →
   primary-9/10" to Phase 1. If the plan parks page restyling in Phases 2-3, downgrade
   to tracked P2 debt — but it must be tracked, not silent.

### P2 — nits

3. **`.first-word` cap is weight 600; approved is `font-medium` (500)**
   (`global.css:249` vs port notes verbatim). Size 32px and −0.5rem margins are exact.

4. **Player-card demo details drift from legacy:** the inner cover reuses `.frame-2`
   (24px radius) where legacy covers are `rounded-xl` (12px) border-2; and the
   playing-state time pill "00:41 | 01:25" wraps to 2-3 lines at every breakpoint
   (legacy is a single line — add `whitespace-nowrap` and give the demo card room; the
   27px title also wraps awkwardly at lg in the fixed `w-72` card). Demo-card-only,
   but this page is the reference artifact Phase 2+ copies from.

5. **Marker-pill demo doesn't ladder:** label fixed at 12px and chip at 20px at all
   widths; legacy labels run 12 → 15 → 18 with padding p-[8px] → p-[10px] → p-3. The
   mobile size shown is correct; md/lg are understated in the instrument.

6. **`.type-card-title` is a single 600-weight role.** Correct for the player
   chapterName (`font-semibold`), but the legacy map-slider card title is
   `font-medium` (500). Phase 3's slider will need a 500 variant or it will drift.

7. **The swatch column can't detect `@theme` drift.** Tailwind v4 prunes unreferenced
   theme vars from the emitted CSS — `--color-primary-1` and `--color-primary-7`
   (both hold BASELINE roles), all of secondary/tertiary, and most gray/neutral steps
   are absent at runtime — so the styleguide paints swatches from inline hexes. The
   `@theme` source was verified against BASELINE by eye this review (it matches), and
   every token exercised through a utility class sampled correct, but the instrument
   itself only proves the inline array. Known limitation; re-verify `@theme` whenever
   it changes, or have swatches read `var(--color-*)` once steps gain real consumers.

8. **Housekeeping:** (a) `docs/qa/phase1/*.png` are stale — they show a v2 text nav
   header that no longer exists in `Base.astro` (the corner-notched hamburger now
   renders there); current truth captured at `docs/qa/phase1-recheck/`. Re-shoot
   phase1 or point reviewers at the recheck set. (b) Martel Sans 400 is imported and
   used (eyebrow/muted) though BASELINE's weight list says 300/600/800 — it matches
   legacy default-weight text; amend the BASELINE weight list to 300/400/600/800
   rather than dropping the weight.

## Rubric summary

| Check | Result |
|---|---|
| Token fidelity (every sampled hex exact) | PASS — 60/60 exact |
| Type roles match ladder at 390/768/1024+ (measured) | PASS — all exact |
| Primitives match legacy family + values | PASS except button type size (F1) |
| Canonical #F26835 for primary-9 | PASS — everywhere, incl. icon strokes |
| No Fraunces/Newsreader/paper-grain remnants | PASS — computed-style sweep clean |
