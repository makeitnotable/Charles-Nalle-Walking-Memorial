# Phase 0 QA Smoke Review

Reviewer: fresh-context QA pass over docs/qa/phase0/ screenshots (all 10 routes x 3
viewports viewed; all 12 map shots; marker crops at 4x from map--1440.png).
Date: 2026-08-02

## Verdicts

1. **/map renders full-viewport Mapbox map — PASS.** Streets, street labels, the
   dotted route line, and all 5 color-coded numbered stop markers are visible at
   390, 768, and 1440. No 0-height collapse; map fills the viewport above the
   "Five stops through Troy" list section. One rendering defect on the marker
   numerals (defect 1 below) — does not void the claim.
2. **Chapter press-and-hold reveal box — PASS.** All five chapters (bakery,
   commissioners-office, mansion, ferry, barbershop) show a real aspect-ratio box:
   ~3/2 landscape at 1440 (≈976x648), ~4/5 portrait at 390 and 768. Sketch image
   and "PRESS AND HOLD TO BRING THE PAINTING TO LIFE" hint visible in every shot.
3. **All routes render without gross layout breakage — PASS.** home, map, about,
   people, paintings, and the 5 chapter pages all render sane layouts at all 3
   widths (bases plus scroll spot-checks: prose, audio players, fact lists,
   people cards, paintings grid, footers all intact; no overflow, no collapsed
   sections, no horizontal scrollbars evident).

## Defects

1. **P1 — Map stop numerals render rotated ~90° inside the pins.** At every
   viewport the digits 1–5 are sideways (verified at 4x zoom on map--1440.png:
   "5", "2", "1", "3", "4" all rotated; "1" reads like a sideways "I", "3"/"4"
   are hard to identify). The numbers are the wayfinding key that links the map
   pins to the numbered stop list below, so this impairs the map's core function.
   Likely a counter-rotation bug on the marker label, not a styling choice —
   structural, in scope despite the later re-skin.
2. **P2 — Markers 2 and 5 overlap at default zoom** (State St / River St pins)
   at all three widths. Both stay visible; marker 2 is partially occluded.
   Consider a slight zoom/offset or collision handling.
3. **P2 — Sticky "Listen" audio player overlaps content while scrolling**
   (e.g. mansion--1440--scroll1 covers a line of body text; ferry--768--scroll1
   and barbershop--390--scroll1 sit over the hero image). Reads as intentional
   sticky behavior — confirm it is, and that it never traps text underneath at
   rest positions.

No P0s. Phase 0 claims stand; recommend fixing defect 1 before the phase is
called fully done, as it is the one true rendering bug in the batch.
