# v7 juror pass 2 — fresh eyes on the LIVE build (commit 50f9fcb)

Site under review: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ (GH Pages, base path `/Charles-Nalle-Walking-Memorial/`), visited 2026-08-16 as a first-time visitor. Method: Playwright (Chromium and Google Chrome via `channel:"chrome"` for codec-dependent checks; flags `--use-gl=angle --autoplay-policy=no-user-gesture-required`; phone contexts `hasTouch:true, isMobile:true`, real touch drags via CDP `Input.dispatchTouchEvent`), one browser at a time. Six viewports (390×844, 360×800, 768×1024, 1024×768, 1440×900, 1920×1080) plus 844×390 and 720×450 (200% zoom) as extras. Screenshots and per-run notes: `docs/v7/qa/juror-pass2/` (scripts `scripts/juror2-*.mjs`). No source was read before scoring; instrument rows come from the executor's summaries in `docs/v7/qa/final/`.

## Sheet A — Awwwards axes (0–10)

| axis | phone (390×844 · 360×800) | tablet (768×1024 · 1024×768) | desktop (1440×900 · 1920×1080) |
|---|---|---|---|
| Design | **7** | **8** | **9** |
| Usability | **8** | **8** | **9** |
| Creativity | **9** | **9** | **9** |
| Content | **9** | **9** | **9** |

**Phone.** The chapters, home, museum and the walk itself are lovely on a phone: whole head above the eyebrow, bottom-pinned CTA, drop caps, chip-mounted credits, one collapsed play pill, a peek-sheet museum that actually drags. But the map page's own index of the five spots clips two titles off the screen (P1) and the 1858 lens caption breaks inside "Library of Congress" — craft misses on the one page a phone visitor is sent to first.

**Tablet.** 768 portrait is essentially the desktop composition and reads well everywhere; 1024×768 in walk mode lets the active stop's label pill sit on top of the card strip (P2), and the same short-viewport logic makes the landscape phone worse (see P1-2). Menu, footer, People 2-column and About all hold.

**Desktop.** This is where the site is award-calibre: the hero, the curtain (verified frame-by-frame at 4× CPU: no uncovered frame), the pitched map with pill labels, the lens filling the shell, and a museum with a real floor, coffered ceiling, gilt frames, centred inspect mode with card-left / study-right. Only nits (card eyebrow break, a title line beginning with "·", non-active map labels coming to rest on the card strip).

## Defects

### P0 — none.

### P1

1. **/map · phone 390×844 and 360×800 · the spot index below the map clips titles.** In the "(01) The map — Five spots through Troy" list, the title column is too narrow for the authored lines: `HOLEUR'S / FASHIONABLE BAKERY`, `COMMISSIONER'S OFFICE` and `PETER BALTIMORE'S BARBERSHOP` run under the arrow and past the viewport edge; the visitor sees "FASHIONABLE BAKE", "COMMISSIONER'S OFFI" cut off (measured ink right 388 / 422 / 443 px vs row right 370 px at 390; same at 360). Tablet and desktop are clean. Evidence: `docs/v7/qa/juror-pass2/mapindex-p390.png`, `mapindex-p360.png`, `map-p390-03-index.png`. Repro: open `/map` on a phone, scroll past the map to the index. (Contradicts G1 "every chapter card title never crossing the arrow" and M13.)
2. **/map · 844×390 (landscape phone, outside the six scoring viewports but inside the plan's v7 matrix) · walk mode draws the active marker on top of the card.** At every stop the label pill + numbered dot render over the active card, covering the title ("Holeur's" gets a "1" dot on it). Evidence: `walkover-land-0.png`, `walkover-land-2.png` (marker union rect y152–207 vs card top 117 at every sampled second). Repro: rotate a phone, `/map` → Take the walk. Listed for honesty; verdict below rests on P1-1.

### P2

1. **/map · 1024×768 · active label pill overlaps the card strip at rest.** During the auto walk the "3 GILBERT HOME" pill sits over the card's SPOT eyebrow (pill y402–471 vs card top 444; "1 BAKERY" 6 px, "4 FERRY LANDING" touching). At 1440/1920 the active label clears the cards, but non-active labels come to rest on the strip (e.g. "2 COMMISSIONER'S OFFICE" over the Barbershop card at 1440 after Continue). Evidence: `map-t1024-05-walk-mid.png`, `walkover-t1024-1.png`, `walkdrag-d1440-continued.png`, `crop-map-d1440-ferrylabel.png`. Repro: `/map` → Take the walk, wait for stop 3 (1024×768).
2. **/map lens · phone · caption rag.** `TROY, NEW YORK · 1858 · LIBRARY / OF CONGRESS` breaks inside the institution name at 390 and 360 (the very case L3 names). The Commissioner's Office interlude credit chip does the same at 390. Evidence: `map-p390-10-lens-open.png`, `map-p360-10-lens-open.png`, `el-commissioners-office-p390-interlude.png`.
3. **Chapters · phone · collapsed play pill vs the centred Onward CTAs.** As `Continue` / `Get directions` enter the bottom of the screen the pill (x 20–134) covers the left ~32 px of `CONTINUE` (x 102–289) and a tap there hits the pill; it resolves 60 px of scroll later, but it is the exact moment C5 designed to be "one orange". Evidence: `ch-bakery-p390-07-onward-cta.png` (same at 360, softer at 768 where pill and buttons share a row). Repro: play narration, scroll to Where to next.

### P3

- /map overview · 360×800: the "DRAG TO EXPLORE · TAP A STOP" hint chip covers marker 4 for its first ~10 s (overlaps its lower half at 390). `strip-map-p360.png`, `crop-map-p390-hint4.png`.
- /map overview · phone: chips 5 and 2 touch (geography); numerals stay legible. `crop-map-p390-chips52.png`.
- Home · 844×390: the man's head is not visible above the eyebrow (H1's acceptance lists this viewport). `home-land.png`.
- Museum · 1440 approach card: eyebrow wraps `MARK PRIEST · NALLE / SERIES · SPOT 02`; the last work's title puts `· NARRATIVE II` at the start of a line. `mus-d1440-09-approach.png`, `mus-d1440-15-last-approach.png`.
- Footer · 768: `THE PEOPLE OF / THIS DAY` wraps with its arrow floating far right. `ch-barbershop-t768-08-footer.png`.
- Footer · 1440 with the pill latched: the pill's top sits ~4 px under the disclaimer's last line (tight, not covering). `crop-footer-d1440-pill.png`.
- Map walk · desktop: a 220 px mouse drag on a card snaps back to the same card (by design: nearest snap unless flicked); feels sticky next to the phone's flick. `walkdrag-d1440-after-drag.png`.
- Museum hall end: doorway + glow read; no discernible steps (U9 was a stretch). `mus-d1440-03-rail-6.png`.
- 200% zoom (720×450): the museum rail chip's first word sits under the `Skip the hall` pill ("…LL TO WALK"); the `SEE TROY / IN 1858` door wraps to two lines. `musland-z200-rail.png`, `zoom200-map.png`. (At 844×390 the chip now clears Skip.)
- Console: zero errors on every route/state; 10 Chrome warnings "font preloaded but not used within a few seconds" (Caslon Text/Display preloads on pages that use them late).
- Home has no ☰ (splash with a single CTA): People/Paintings/About are only reachable via the map — a deliberate choice, noted for Wil.
- Barbershop's `Continue` loops to Spot 01 (`Next · Spot 01`) — content/route decision, noted.

## Sheet B — the ledger

Legend: ✔ Met · ✘ Not met · — N/A. Classes: phone / tablet / desktop.

| ID | phone | tablet | desktop | note |
|---|---|---|---|---|
| H1 | ✔ | ✔ | ✔ | whole head with headroom at 390/360/768/1024/1440/1920; not at 844×390 (P3) |
| H2 | ✔ | ✔ | ✔ | exactly 3 lines at 1440/1920; 5 balanced lines at 390 (6 at 360, short final pair) |
| H3 | ✔ | ✔ | ✔ | `Walk the story` |
| H4 | ✔ | — | — | CTA pinned to the frame bottom at 390/360, 48 px tall |
| H5 | ✔ | ✔ | ✔ | contrast sweep 0 failures; reads cleanly on the film |
| H6 | ✔ | ✔ | ✔ | CTA present in the 2.5 s arrival shot; reduced-motion shows everything |
| X1 | ✔ | ✔ | ✔ | screencasts at 4× CPU (Continue→next, map card→chapter, menu→About; 390 & 1440): no uncovered page-B frame, ~1 s hold, one reveal (`curtain/sheet-*.png`) |
| M1 | ✔ | ✔ | ✔ | no geolocate control anywhere |
| M2 | ✔ | ✔ | ✔ | pitched overview, five stops visible at 390/360 (chips) and pills from 768 up |
| M3 | ✔ | ✔ | ✔ | `Stop the walk` top-right at 20/40/56 inset |
| M4 | ✔ | ✔ | ✔ | drag → `Continue` immediately; card x settles monotonically (no reversal); Continue resumes; Stop → Continue; `Walk again` after stop 5 |
| M5 | ✔ | ✔ | ✔ | smooth settle in 25 ms samples; desktop nudge snaps back by design (P3) |
| M6 | ✔ | ✔ | ✔ | Bakery / Commissioner's on two lines in the walk cards; but see M13 for the page index |
| M7 | ✔ | ✔ | ✔ | Back at 20,20 / 40,40 / 56,56 |
| M8 | ✔ | — | — | (i) · Take the walk · ☰ on one axis; 1858 pill top-right; ☰ gap only 9 px at 360 |
| M9 | ✔ | — | — | opaque cards, both neighbours peek, map follows, `Back`, ☰ hidden while focused |
| M10 | ✔ | ✔ | ✔ | `April 27, 1860` |
| M11 | ✔ | — | — | spacing balanced |
| M12 | ✔ | ✔ | ✔ | card→chapter under the curtain is clean |
| M13 | ✘ | ✔ | ✔ | phone index titles overflow/clip (P1-1); heading/prose rag fine; `Spot 01` padding consistent |
| L1 | ✔ | ✔ | ✔ | opens on the lower panel (Troy · Hudson · West Troy); reset re-frames |
| L2 | ✔ | ✔ | ✔ | viewer fills the shell within the inset |
| L3 | ✘ | ✔ | ✔ | Take the walk hidden, chip hidden, Back to today centred; caption breaks `LIBRARY / OF CONGRESS` at 390/360 (P2-2) |
| L4 | ✔ | ✔ | ✔ | touch pan + pinch, mouse pan + wheel verified; +/−/reset buttons present (keyboard not exercised) |
| C1 | ✔ | ✔ | ✔ | `initial-letter: 3` Caslon Display on all six openings; visually 3 lines |
| C2 | ✔ | ✔ | ✔ | body reads near-white on the deepened scrim; parallax not judged from stills |
| C3 | ✔ | ✔ | ✔ | study vertically centred with the caption |
| C4 | ✔ | ✔ | ✔ | credit on a chip on all five (barbershop included) |
| C5 | ✔ | ✔ | ✔ | CTAs centred under the map, quiet pill on the map, mini collapses to a pill; one orange — with the P2-3 overlap on the way in |
| C6 | ✔ | ✔ | ✔ | census: 128 · 200 · 200 on all four single-part chapters; CO the same steps |
| C7 | ✔ | ✔ | ✔ | ☰ hides after scrolling down and returns after ~60 px up on every chapter; faces clear of the ☰ |
| C8 | ✔ | ✔ | ✔ | faces in the hero, T→I→T→I→T, chip credit, `J` descender intact at 390/768/1440, study centred |
| C9 | ✔ | ✔ | ✔ | hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; spine matches; both players; playing Pt 2 pauses Pt 1; one mini |
| C10 | ✔ | ✔ | ✔ | footer lane clear with the pill latched at 390/768/1440 |
| C11 | ✔ | ✔ | ✔ | `Next · Spot 01`; no visible em dashes |
| C12 | ✔ | ✔ | ✔ | mansion player reads `Uri Gilbert Home` |
| F1 | ✔ | ✔ | ✔ | wordmark one line, 3-col at 1440, stacked at 390, disclaimer no runt; 768 nav wrap nit |
| N1 | ✔ | ✔ | ✔ | close X rotates 90° over ~250 ms while the panel fades |
| N2 | ✔ | ✔ | ✔ | hides/shows on chapters, /map (index scroll) and /paintings (rail); returns on 80 px up |
| N3 | — | — | — | unchanged |
| P1 | ✔ | ✔ | ✔ | no spot links under people |
| P2 | ✔ | ✔ | ✔ | Their story lives on · Stand where they stood · Walk the story |
| P3 | ✔ | ✔ | ✔ | none visible |
| P4 | ✔ | ✔ | ✔ | `ONE DAY. / A WHOLE / CITY'S CAST.` at 390/768; `ONE DAY. A WHOLE / CITY'S CAST.` at 1440 |
| P5 | — | ✔ | — | 2-col cards at 768 read well |
| A1 | ✔ | ✔ | ✔ | (06) Afterword numbered, (07) Onward |
| A2 | ✔ | ✔ | ✔ | eyebrow/heading/body/CTA as specified |
| A3 | ✔ | ✔ | ✔ | attribution stands alone; title `·` |
| A4 | ✔ | ✔ | ✔ | `On the sidewalk` kicker rendered |
| U1 | ✔ | ✔ | ✔ | rail pitch −0.08 (portrait) / −0.10, floor visible |
| U2 | ✔ | ✔ | ✔ | spacing 5; rail overruns the last work; end wall + glow visible from the entrance |
| U3 | ✔ | ✔ | ✔ | planks, coffers, baseboard, gilt frames — art stays the subject |
| U4 | ✔ | ✔ | ✔ | drag yaw to −1.15 rad; `Face forward` appears and recentres |
| U5 | ✔ | ✔ | ✔ | ←/→ look in rail, Enter approaches, →/← next work, Esc back; counter + dots visible in approach |
| U6 | — | ✔ | ✔ | centred (cx 0.500), card left no border, study right, only `Back to the hall`; tap toggles alive (label → `Let the painting rest`; frame changes) |
| U7 | ✔ | ✔ (768) | — | peek sheet: drag up → full with quote, drag down → peek, tap toggles; Back top-left; painting recomposes |
| U8 | ✔ | ✔ | ✔ | last work 0.667 tall portrait, undistorted (341×512 / 438×657); grid tile 350×525 |
| U9 | ✔ | ✔ | ✔ | doorway + glow; steps not discernible (stretch item) |
| U10 | ✔ | ✔ | ✔ | Skip top-left, chip copy `The Museum · Scroll to walk · Drag to look · Tap a painting` (`Scroll to walk` on phone), ☰ lane empty |
| I1 | ✔ | ✔ | ✔ | reads CN at 32; recognisable at 16 (`favicon-renders.png`) |
| I2 | ✔ | ✔ | ✔ | svg / 16 / 32 / 48-in-ICO (15 KB) / 180 / 192 / 512 / manifest all 200 |
| I3 | ✔ | ✔ | ✔ | head wiring under the base path; og:image w/h/alt present |
| I4 | ✔ | ✔ | ✔ | og.png served |
| G1 | ✘ | ✔ | ✔ | zero runts by the instrument; but the phone map index overflow (P1-1) and lens caption (P2-2) |
| G2 | ✔ | ✔ | ✔ | no clipped letterforms seen (J checked at three sizes) |
| G3 | ✔ | ✔ | ✔ | contrast sweep exit 0 (18 rows unmeasured at /people 768 — instrument gap, not a fail) |
| G4 | ✔ | ✘ | ✔ | 1024×768 walk-mode label/card overlap is a tablet-only gap (P2-1) |
| G5 | ✔ | ✔ | ✔ | none visible on any page |
| G6 | ✔ | ✔ | ✔ | states 0/107; caveat: map markers and the pill-vs-CTA moment are outside its net |
| G7 | ✔ | ✔ | ✔ | reduced motion: home/chapter/map/paintings all text visible, museum → 2-D grid, curtain instant |
| G-L1 | ✔ | ✔ | ✔ | title `Charles Nalle Walking Memorial · Troy, NY` |
| G-L2 | — | — | — | docs |
| G-L3 | ✔ | ✔ | ✔ | `/bakery/` → `/bakery`; `/nope` → 404 page |
| G-L4 | ✔ | ✔ | ✔ | nothing visible; sr-only not read |
| G-L5 | — | — | — | content decision |

### Instrument bars (from `docs/v7/qa/final/`)

| bar | result |
|---|---|
| axe | 0 serious/critical (0 moderate/minor) across 51 runs + 4 on /paintings — **met** |
| contrast incl. pixel mode | 0 failures at 390/768/1440 — **met** (18 /people@768 rows never measured) |
| rag | 0 unauthored runts · 0 ink clips · 0 visible em dashes — **met** by its definition (it does not measure horizontal overflow: see P1-1) |
| states | 107 states, 0 collisions — **met** (mapbox markers not in its net: see P2-1) |
| census | one rhythm ladder on the five chapters — **met** |
| frames | 6/6 CLEAN at 4× CPU — **met** (re-confirmed here) |
| perf | home 97 · chapters 98–99 · people/about 99 · paintings 89–90 · map 64 — **met** |
| a11y | 100 on every route — **met** |
| keyboard walk | complete, all stops ringed; museum keyboard path re-walked here — **met** |
| reduced-motion parity | all text visible; re-checked on /, /ferry, /map, /paintings — **met** |
| live URL | 50f9fcb live; every route and icon URL 200 — **met** |

## Cross-check against juror pass 1 (read only after the scores above were written)

| pass-1 item | status on 50f9fcb |
|---|---|
| P1-1 portrait work stretched 3:2 | **fixed** — 0.667 tall in the hall at 390/768/1024/1440, grid tile 350×525 |
| P1-2 phone peek-sheet dead to touch | **fixed** — CDP touch drag up/down and header tap all move the sheet; painting recomposes |
| P2-1 sheet-full mispositions the dot rail | **fixed** — rail rides just above the measured sheet (y 589 @390 full) |
| P2-2 Skip pill overlaps the rail chip at 844×390 / 720×450 | **fixed at 844×390**; still overlaps at 720×450 (P3 here) |
| P2-3 collapsed pill covers the footer disclaimer | **fixed** — footer lane reserved at 390/768/1440; the transit over `Continue` at phone remains (my P2-3) |
| P2-4 attribution (i) under the active card at 390 | **fixed** — (i) at y 773–797, card bottom 745 |
| P2-5 home head clipped at 1920/1024/1440 | **fixed** — head + headroom at all six; tight but clear at 1440 |
| P3 "BACK  TO MAP" double space | not seen (reads normally in `map-d1440-05-walk-mid.png`) |
| P3 lens caption dangling "·" | changed, not solved — now `LIBRARY / OF CONGRESS` (my P2-2) |
| P3 museum eyebrow / "· NARRATIVE II" | still present (my P3) |
| P3 About closer heading balance | still `TWO AND A HALF / MILES. ONE DAY IN 1860.` at 1440 |
| P3 CO play labels without Pt 1/2 | **fixed** — `Play narration: Commissioner's Office, Pt 1 / Pt 2` |
| P3 og:image:alt em dash | **fixed** — colon |
| P3 preload warnings | still (10 across the sweep) |
| P3 hint chip over marker 4 | still (my P3) |
| P3 720×450 `SEE TROY / IN 1858` wrap | still (P3) |
| P3 walk cadence ≈ 3 s per stop | still (~3.3 s; taste) |

## The one moment I would retell

Standing in the museum on a laptop, dragging the room around until the chip says *Face forward*, then clicking the Commissioner's Office canvas: the hall dollies in, the card slides in on the left with Townsend's line, the pencil study hangs to the right, and one more click on the painting sets the crowd moving. It is the same trick on a phone, with the plaque as a sheet you pull up with your thumb.

## VERDICT

**FAIL** — Sheet A holds ≥ 8 except phone design (7), and there is one in-class P1: the phone map index clips chapter titles (P1-1). Everything else that Wil asked for is there and mostly exquisite; the fix list is short (map index title measure on phones; lens/interlude caption break; walk-mode label lift on short viewports; pill vs Onward CTAs).
