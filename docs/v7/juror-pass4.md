# v7 juror pass 4 — fresh-eyed visitor review of the LIVE build

- **Build under review:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ — GH Pages `last-modified: Sun, 16 Aug 2026 09:52:57 GMT` (one minute after `eae5219`'s commit time; local HEAD = `origin/v2` = `eae5219`). All 11 routes fetched 200; `/bakery/` (trailing slash) lands on the 404 shell and client-redirects to `/bakery` (G-L3 works).
- **Method:** Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a time; phone contexts `isMobile + hasTouch` with CDP `Input.dispatchTouchEvent` for drags/taps; viewports 390×844 · 360×800 · 768×1024 · 1024×768 · 1440×900 · 1920×1080, plus 844×390 (landscape phone), 720×450 (200 % zoom) and `reducedMotion: reduce`. Every key moment was looked at as a PNG, not scored from the DOM. Scripts: `scripts/juror4-*.mjs`; evidence: `docs/v7/qa/juror-pass4/` (PNGs gitignored, JSON kept). Instrument rows below are read from `docs/v7/qa/final/*.md` as handed over, not re-run.
- **No site source was read before scoring.** Previous juror reports were opened only after this document's scores were written (see the cross-check at the end).

## Sheet A — Awwwards axes (0–10)

| class | design | usability | creativity | content | two-line justification |
|---|---|---|---|---|---|
| **phone** (390×844, 360×800) | **9** | **8** | **9** | **9** | The whole head is above the eyebrow, the CTA is pinned to the bottom, chapters read beautifully with the drop cap, cream moral prose and the pause always on screen; the walk pauses on drag with `Continue`, no snap-back; the museum peek-sheet answers a tap and a drag. Usability loses a point for the walk-from-a-scrolled-page state (P2-1) and the mini-player pill masking the start of the bottom two reading lines at 390/360. |
| **tablet** (768×1024, 1024×768) | **7** | **8** | **9** | **9** | Chapters, map, walk, lens and People/About are clean at both sizes; the museum approach and peek-sheet work at 768. Design drops below the bar because at 768×1024 the museum's rail chip runs under the `Skip the hall` pill (P1-1, visible for the whole hall walk) and the portrait work's lower edge sits under the dot rail (P2-2). |
| **desktop** (1440×900, 1920×1080) | **9** | **9** | **9** | **9** | The 3-D overview with pitched pills, the walk strip, the near-full-bleed 1858 lens, the desktop triptych in the museum (card left · painting centred · sketch right), keyboard Enter/arrows/Esc all work; the curtain covers before page B paints at 4× CPU. Only nits: the mini-player pill kisses the footer disclaimer at 1440 and the lens drops keyboard focus on open. |

Bar: ≥ 8 on every axis at every class and zero P0/P1 — **not met** (tablet design 7; one P1).

## Defects

### P0 — none.

### P1

1. **`/paintings` · 768×1024 (tablet portrait) — and every width from ~640 to ~830 px, so also the 200 % zoom viewport 720×450 — the museum rail chip collides with the `Skip the hall` pill.** In rail mode (the default museum state, shown for the entire hall) the chip `SCROLL TO WALK · DRAG TO LOOK · TAP A PAINTING` is centred at 173–595 px while the pill spans 40–226 px: the "SC" of SCROLL is under the pill's arrow and the visitor reads "SKIP THE HALL ↓ROLL TO WALK …". Measured: 768×1024 chip 173–595 vs pill 40–226 (53 px overlap); 720×450 chip 149–571 vs pill 20–206; 640/700/800-wide the same; 844×390 clears by 5 px; 1024×768 uses the long "THE MUSEUM · …" chip and clears. The executor's own capture `docs/v7/qa/final/states/museum-768-01-rail-rest.png` shows the same overlap (the states instrument did not flag it — the chip is presumably excluded from its collision set). Evidence: `docs/v7/qa/juror-pass4/chip-collide-768x1024.png`, `chip-collide-768-crop.png`, `chip-collide-720x450.png`, `mus-t768-01-rail-40.png`, `z200-paintings-mid.png`; numbers in `scripts/juror4-chip.mjs` output. Repro: open `/paintings` at 768×1024, scroll into the hall. (Fix shape: use the phone tier `Scroll to walk` below ~840 px, or start the chip's lane after the pill.)

### P2

1. **`/map` · all classes — entering the walk (or focus mode) from a scrolled page leaves the controls off-screen.** The map shell is 100 dvh; if the visitor has scrolled even 180 px (the doors row is still visible near the bottom) and taps `Take the walk`, walk mode starts without scrolling the shell back into view: `Back` / `Stop the walk` sit above the viewport, the fixed card strip floats over the copy block, and the followed stop is framed for a shell that is partly off-screen. Nothing scrolls the shell in (checked with and without reduced motion; `scrollY` stays at 180 for 2.4 s). Scrolling up recovers, so it is not P1. Evidence: `walk-scrolled-p390-normal.png`, `walk-scrolled-d1440-normal.png`, `rm-map-d1440-walk.png`, `z200-map-walk.png`. Repro: `/map`, scroll 180 px, tap `Take the walk`. (Fix shape: `scrollIntoView` the shell — instant under reduced motion — on walk/focus entry and on marker tap.)
2. **`/paintings` · 768×1024 — the portrait work (10/10) in approach runs under the dot rail and grazes the ☰ lane.** `paintingRect(9)` = 107–661 × 96–927 with the peek-sheet header at 928 and the dot rail/counter drawn at ≈ 880–904, so the counter and dots sit on the lower part of the canvas; the top edge (96) is above the top row's bottom (112) and touches the ☰ (656–728 × 40–112) by a few px. Every other work at 768 and every work at 390/360/1024/1440 is clear (rects centred within ±3 %). Evidence: `mus-t768-12-last.png`, `mus-t768.json` (`last`). Repro: `/paintings` at 768×1024, approach the last dot.
3. **Chapter footer · 1440×900 — the latched mini-player pill kisses the disclaimer.** With narration playing, the pill (56,782 · 114×62) intersects the line box of "discretion, and risk." (bakery and commissioners-office both report the hit; visually the pill's ring touches the descender line). Clear at 390/360/768/1920. Evidence: `bakery-d1440-09-footer.png`, `bakery-d1440.json` (`footer.hits`). Repro: play, scroll to the footer at 1440. (Fix shape: a little more `pb` on the footer at ≥1280.)

### P3

1. **`/map` lens · keyboard focus.** Opening the lens with Enter unmounts the door and drops focus to `<body>`; Tab then continues into the spot index — the viewer, `+ − ⟲` and `Back to today` are only reachable with Shift+Tab. Once focused, the viewer's `+ − 0 arrows` all work (verified). Move focus into the viewer or onto `Back to today` on open.
2. **844×390 landscape phone (outside the three classes, but named in H1/M2 acceptance):** home — the man's head is behind the wordmark (no room for both in 390 px of height); map overview shows only stops 1 and 3 (the documented landscape zoom floor; `walk.md` says 4 labels outside safe); a chapter's moral heading passes under the mini pill. Evidence: `home-land.png`, `land-map-overview.png`, `land-bakery-moral.png`.
3. **Now-playing title truncation at 390/360:** "Holeur's Fashionable B…", "Commissioner's Office · …" — in the two-part chapter the "Pt 1/Pt 2" is the part that gets cut. Evidence: `commissioners-office-p390-03-playing.png`, `barbershop-p360-03-playing.png`.
4. **Lens caption on phones** wraps `TROY, NEW YORK · 1858 ·` / `LIBRARY OF CONGRESS` — a dangling separator at the end of line 1 (not a runt, so `rag.mjs` is silent). Evidence: `map-p390-14-lens.png`.
5. **About closer heading at 1440/1920** balances as `TWO AND A HALF / MILES. ONE DAY IN 1860.` — an authored break after "MILES." would read as the sentence does. Evidence: `about-d1440-02-bottom.png`.
6. **Map at 200 % zoom (720×450):** the `See Troy in 1858` door wraps to two lines beside `Take the walk`. Evidence: `z200-map-top.png`.
7. **Phone reading column vs the fixed pill:** at 390/360 (and more so at 720×450) the latched mini-player pill masks the first words of the bottom two lines of the prose while you read; a visitor scrolls past it, but a right-aligned pill on phones or a bottom scrim would remove the mask. Evidence: `bakery-p390-05-history-mini.png`, `co-p390-03-part2-mini.png`, `z200-bakery-mini.png`.
8. **Museum approach at 1024×768:** the painting composes at ~330 px (32 % of the width) — correct by the triptych rule but it feels small next to the 1440 view. Evidence: `mus-t1024-06-approach.png`.
9. **Museum peek-sheet on works with no quote** (e.g. Ferry Landing · Narrative I): the handle invites a drag but "full" is only 28 px taller than "peek". Evidence: `mus-p390-08-sheet-tap.png`.
10. **Story prose column at ≥1200** starts at the rail's x (136 px) while the part heading/quote sit in the content column (≈ 467 px) — the reading column reads left-shifted from its own heading (a design choice, noted, not scored). Evidence: `bakery-d1440-04-tapped.png`, `bakery-d1440-full-small.png`.
11. **Museum · 390 · keyboard approach drops focus.** Enter on a dot at 390 approaches the work but `document.activeElement` is `<body>` afterwards (at 1440 it lands on `Back to the hall`). Enter on the sheet header toggles peek/full correctly and Esc returns focus to the dot. Evidence: `scripts/juror4-sheet-kb.mjs` output.

## Sheet B — Wil's ledger (Part A), verified as a visitor

Legend: Met / Not met / N/A (not visitor-verifiable or not applicable at that class). Phone = 390/360 · Tablet = 768/1024 · Desktop = 1440/1920.

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| H1 head visible above the eyebrow | Met | Met | Met | Full head with headroom at 390/360/768/1024/1440/1920; 844×390 has no room (P3-2). `home-*.png` |
| H2 description 3 lines desktop, balanced elsewhere | Met | Met | Met | Exactly 3 lines at 1440/1920; 5 at 390, 6 at 360, 4 at 768, no orphan. |
| H3 CTA `Walk the story` | Met | Met | Met | Home, People closer, About closer all read `Walk the story` → `/map`. |
| H4 mobile CTA bottom-aligned, full width, 48 px | Met | N/A | N/A | 390: CTA 26,770 338×48; 360: 26,726 308×48; landscape keeps in-flow. |
| H5 description contrast on the film | Met | Met | Met | Cream `rgb(246,243,238)` 16 px on the film; `contrast.md` pixel mode 0 failures. |
| H6 entry choreography ≤ 700 ms, RM shows all | Met | Met | Met | CTA present in the first shot after load; RM: all text visible (`rm-home-p390-top.png`). |
| X1 curtain: no uncovered page-B frame | Met | Met | Met | Own CDP screencast at 4× CPU: map-card→mansion @390 and Continue→ferry @1440 — cover → hold → one reveal, no flash (`curtain-map-card-p390-crop.png`); `frames.md` 6/6 CLEAN. |
| M1 geolocate removed | Met | Met | Met | Only (i) attribution + Mapbox logo bottom-left. |
| M2 overview pitch ≥ 40, all five visible | Met | Met | Met | Five chips/pills inside the frame at 390/360/768/1024/1440/1920 (`map-*-01-overview.png`); `walk.md` pitch 48–52. Landscape phone shows 2 (P3-2). |
| M3 `Stop the walk` top-right at inset | Met | Met | Met | 390: 200,20 · 768: 558,40 · 1440: 1214,56; never over cards/labels. |
| M4 drag pauses, `Continue` resumes, no snap-back | Met | Met | Met | Touch/mouse drag mid-walk → button `Continue` immediately, 26 samples over 400 ms monotonic (0 reversals) at 390/768/1024/1440; `Continue` → cycling resumes; `Stop` → `Continue`. |
| M5 drag smoothing feels natural | Met | Met | Met | Release decelerates over ~450 ms to the snap point; a 136 px nudge returned to the same card without a fling. |
| M6 card titles two lines, clear of the arrow | Met | Met | Met | Bakery/CO on two lines at 343/416/515 px cards; `walk.md` confirms at all 8 widths. |
| M7 `Back to map` at equal inset | N/A | Met | Met | 768: 40,40 · 1440: 56,56 (phones show `Back` at 20,20). |
| M8 mobile overview row: (i) · `Take the walk` · ☰ on one axis; lens pill top-right | Met | N/A | N/A | 390: (i) 20,773 · button 68,764 207×48 · ☰ 298,752; `See Troy in 1858` 210,20 top-right. |
| M9 mobile walk cards opaque, peeks ≥ 16 px, `Back`, ☰ hidden while focused | Met | N/A | N/A | Peeks both sides at 390/360; `.cnwm-menu` opacity 0 with `data-walk=true`; `Back` 109×38. |
| M10 chip `April 27, 1860` | Met | Met | Met | Top-left chip on every overview. |
| M11 mobile card spacing | Met | N/A | N/A | Positive gap, neighbours scaled. |
| M12 map quiet under the curtain | Met | Met | Met | Screencast shows a still map under the cover; no console errors. |
| M13 map copy rag / em dashes / `Spot 01` padding | Met | Met | Met | Zero em dashes on all 11 routes; `SPOT 01…05` padded in index, footer and museum grid. |
| L1 lens opens on the lower panel; reset returns | Met | Met | Met | Opens on downtown + Hudson + West Troy at 390/768/1024/1440; `0` resets to the same frame. |
| L2 bigger viewer | Met | Met | Met | 1440: viewer 1328×672 within insets; 390: 350×675. |
| L3 lens copy/controls | Met | Met | Met | Only `Back to today` (centred) + `+ − ⟲`; caption `Troy, New York · 1858 · Library of Congress` (phone wrap P3-4). |
| L4 interaction unchanged | Met | Met | Met | Wheel, drag-pan, touch-drag, `+ − 0 ←↑` all verified once the viewer is focused (P3-1 on focus hand-off). |
| C1 drop cap | Met | Met | Met | `initial-letter: 3`, Caslon Display, on all six openings; highlight + tap-to-seek intact (seek 2.3 → 49.8 s). |
| C2 moral prose cream + parallax | Met | Met | Met | Body `rgb(246,243,238)` = heading on all five morals (both in ch2); background moves with scroll; RM static. |
| C3 study centred | Met | Met | Met | Sketch and caption vertically centred at 1440/1920 (`bakery-d1440-06-moral.png`). |
| C4 archival credit on a chip, wipe kept, no parallax | Met | Met | Met | `… · ARCHIVAL RECORD` chip on the photo at 390/768/1440/1920, barbershop included. |
| C5 Where-to-next declutter | Met | Met | Met | Shadowed embed map, CTAs centred under it, quiet numeral pill, phone pill shrinks to the play button beside the CTAs; `Continue` is the primary. |
| C6 rhythm | Met | Met | Met | Heading→quote tight; moral→Onward ≈ 200; `census.md` same ladder on all five. |
| C7 burger hide/show + hero faces | Met | Met | Met | Opacity 0 after 1000 px down, back after 80 px up on every page incl. `/map` and `/paintings`; bakery/barbershop faces clear of the ☰. |
| C8 barbershop hero/order/label/J | Met | Met | Met | Hero focus 44 %; story T→I→T→I→T; `FOR JUSTICE` J intact (`barbershop-p360-06-moral.png`). |
| C9 chapter 2 order + two players | Met | Met | Met | ids `hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward`; spine (01)–(06); playing Pt 2 pauses Pt 1, one mini at a time. |
| C10 footer reserves the mini lane | Met | Met | Not met | 1440: pill kisses the disclaimer (P2-3). |
| C11 em dashes in chapter UI | Met | Met | Met | `Next · Spot 02`, `5 State Street · Mutual Bank Building`, none visible anywhere. |
| C12 latent (subtitle, dead exports) | Met | Met | Met | Mansion player subtitle reads `Uri Gilbert Home`; code items N/A for a visitor. |
| F1 footer redesign | Met | Met | Met | Wordmark one line, `Made by Notable`, arrow list with current page hidden, `Share` on chapters, hairline + disclaimer; stacks on phone. |
| N1 X spins on close | Met | Met | Met | Close button rotates then closes (observed in the menu-close step). |
| N2 scroll-hide on every page | Met | Met | Met | See C7; never hides while open. |
| N3 arrow tail unchanged | Met | Met | Met | Same tail everywhere. |
| P1 no spot links under people | Met | Met | Met | 0 `Spot n` links on `/people`. |
| P2 People closer copy | Met | Met | Met | `Their story lives on` · `Stand where they stood` · `Walk the story`. |
| P3 em dashes on People | Met | Met | Met | 0. |
| P4 People H1 breaks | Met | Met | Met | 390/768: `ONE DAY. / A WHOLE / CITY'S CAST.`; 1440: `ONE DAY. A WHOLE / CITY'S CAST.` |
| P5 grid at 768–1023 | N/A | Met | N/A | Two-column cards inside the stacked editorial read cleanly at 768. |
| A1 Afterword numbered section | Met | Met | Met | `(06) Afterword` quote block, `(07) Onward`. |
| A2 About closer copy | Met | Met | Met | Eyebrow/heading/body/CTA as specified, `2.5 miles · about 45 minutes` on the map page. |
| A3 quote attribution dash dropped | Met | Met | Met | Attribution stands alone. |
| A4 latent | N/A | N/A | N/A | Not visitor-verifiable. |
| U1 rail pitched down | Met | Met | Met | pitch −0.08/−0.10 rad; floor visible in every rail shot. |
| U2 paintings closer, end wall visible | Met | Met | Met | spacing 5, far 80; the end glow is visible from the entrance. |
| U3 environment finish | Met | Met | Met | Plank floor with light bands, plaster walls, gilt frames, cornice, doorway glow; ≤ 76 draw calls (`museum.md`). |
| U4 360° look | Met | Met | Met | Yaw wraps (−4.3 … −7.85 rad observed); `Face forward` chip appears and recentres. |
| U5 movement feel + keyboard | Met | Met | Met | Native scroll; `←/→`, Enter, Esc verified at 1024/1440; counter + dots in every mode. |
| U6 desktop inspect | N/A | Met | Met | Painting centred (cx 0.5 / cy 0.5), card left without border, sketch right, only `Back to the hall`; tap toggles alive. |
| U7 phone peek-sheet | Met | Met (768) | N/A | Tap and drag both expand/collapse; painting recomposes higher; `Back to the hall` top-left; alive tap works with the sheet open. |
| U8 true aspects | Met | Met | Met | 1.778 / 1.5 / 0.667 rects; the portrait hangs tall and undistorted at every size (`mus-*-12-last.png`); grid tile 568×852. |
| U9 hall-end threshold | Met | Met | Met | Doorway glow + lit floor at 100 % rail, hand-off into the grid. |
| U10 hygiene (insets, Skip top-left, chip tiers, states) | Met | **Not met** | Met | 768×1024 chip/`Skip the hall` collision (P1-1) and the portrait work under the dot rail (P2-2); 390 and 1440 clean. |
| I1 CN monogram | Met | Met | Met | Reads as CN at 16/32/180 (`sheet-favicon.png`). |
| I2 icon set | Met | Met | Met | svg (paths only), 16/32/48 png, 180 apple-touch, 192/512, real 3-size ICO, manifest with relative `start_url ./` and base-correct icons — all 200. |
| I3 head wiring | Met | Met | Met | `rel=icon svg/png`, `shortcut icon`, `apple-touch-icon`, `manifest`, `theme-color #1d1411`, `og:image:width/height/alt`. |
| I4 og.png | Met | Met | Met | 1200×630 served. |
| G1 rag / runts | Met | Met | Met | No runts seen; `rag.md` 0/0/0 (P3-4/5 are aesthetic breaks, not runts). |
| G2 no clipped letterforms | Met | Met | Met | `FOR JUSTICE`, `INJUSTICE THRIVES` intact; `rag.md` 0 clips. |
| G3 contrast | Met | Met | Met | Cream moral prose, chips under floating labels; `contrast.md` 0 failures incl. pixel mode. |
| G4 tablet parity | Met | Not met | Met | Everything but the museum rail chip/portrait work is at parity at 768/1024. |
| G5 em-dash sweep | Met | Met | Met | 0 visible em dashes on all 11 routes at 390 and 1440. |
| G6 floating-UI grid | Met | Not met | Met | Insets honoured everywhere seen; the tablet museum collision breaks the lane doctrine. |
| G7 motion tokens / RM parity | Met | Met | Met | RM: home/ferry/map/paintings all text visible, museum falls back to the grid, walk still works. |
| G-L1 titles/meta `·` | Met | Met | Met | Every `<title>` uses `·`; `/styleguide` carries `noindex, nofollow`. |
| G-L2 docs drift | N/A | N/A | N/A | Docs, not visitor-verifiable. |
| G-L3 trailing-slash redirect | Met | Met | Met | `/bakery/` → `/bakery` (one console 404 from the shell, expected). |
| G-L4 sr-only em dash | N/A | N/A | N/A | Not visitor-visible; the a11y run is clean. |
| G-L5 unrendered `quote.source` / `portal.hook` | N/A | N/A | N/A | Content decision for Wil. |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | result |
|---|---|
| axe zero serious/critical on every route/state | Met — 0/0/0/0 across 51 runs (`a11y.md`), plus 4 museum runs (`a11y-paintings/a11y.md`). |
| contrast incl. pixel mode exit 0 | Met — 0 failures at 390/768/1440; 18 `/people` @768 rows never in view (unmeasured, not failed). |
| rag zero runts / clips / em dashes | Met — 0 / 0 / 0 over 502 blocks (`rag.md`). |
| states zero collisions | **Reported met (127 states, 0 collisions) but contradicted** — the museum rail chip / `Skip the hall` overlap at 768 is visible in the instrument's own `museum-768-01-rail-rest.png` (P1-1); the instrument's collision set does not include the chip. |
| census one rhythm ladder | Met — five chapters share `… 0 · 0 · 128 · 200 · 200` (ch2 with its extra parts) (`census.md`). |
| frames clean | Met — 6/6 CLEAN at 4× CPU (`frames.md`); confirmed by my own screencasts. |
| perf | Met — home 97 · chapters 98–99 · /people 99 · /about 99 · /paintings 89–90 · /map 64 (bar 63); a11y 100, best-practices 100 (`perf.md`). |
| a11y 100 | Met (`perf.md`). |
| keyboard walk complete | Met — 21–37 stops with visible rings on `/map` `/bakery` `/paintings`; menu and dialog focus round-trips (`a11y.md`); museum Enter/arrows/Esc verified here. Lens focus hand-off P3-1. |
| reduced-motion parity | Met — all text visible on 11 routes at 390/1440 (`a11y.md`); own pass on `/`, `/ferry`, `/map`, `/paintings` clean. |
| live URL verified | Met — every route and icon 200 on GH Pages; console clean on all 11 routes at 390 and 1440 (fresh browser per route). |
| museum check | Met — 5/5 viewports, ≤ 76 calls, 0 long frames, approach centred (`museum.md`) — but the 768 portrait-work overlap (P2-2) is outside its `overlaps card` check. |
| walk check | Met — 8/8 (`walk.md`). |

## The one moment I'd retell

Standing in the hall at 1440 after dragging to look at the side wall and hitting `Face forward`, then clicking the last canvas: the camera walks up to Mark Priest's tall barbershop painting, it hangs true and narrow in a gilt frame with the plaque at the left, and one click on the canvas makes the room's stillness break as the painting starts to move. The museum is still the moment.

## VERDICT

**FAIL** — one P1 (museum rail chip under `Skip the hall` at 768×1024 and at 200 % zoom) and tablet design 7 < 8; everything else is at or above the bar. Fix P1-1 (a chip tier below ~840 px) and re-run; P2-1 (scroll the map shell into view on walk/focus entry) and P2-2 (portrait work vs dot rail at 768) are the next two worth landing in the same pass.

## Cross-check of previous jurors' remaining P2 items (read only after the scores above were written)

| juror · item | status on `eae5219` | evidence |
|---|---|---|
| J1-P2-1 museum sheet "full" by keyboard mispositions the dot rail / no recompose | **Fixed** — Enter on the header: sheet full, dots ride 37 px above the header (683→589), painting recomposes 295→248; Enter again collapses; Esc returns focus to the dot. | `scripts/juror4-sheet-kb.mjs`, `mus-p390-25-sheet-kb-full.png` |
| J1-P2-2 `Skip the hall` over the rail chip at 844×390 and 720×450 | **Not fixed (moved)** — 844×390 now clears by 5 px, but 720×450 still overlaps and the collision now also lands on the tablet-portrait 768×1024 with the mid-tier chip → this pass's P1-1. | `chip-collide-720x450.png`, `chip-collide-768x1024.png` |
| J1-P2-3 collapsed pill covers the footer disclaimer / transits `Continue` | **Mostly fixed** — 390/360/768/1920 clear (pill below the disclaimer, play button beside the CTAs); residual 4 px kiss at 1440 → P2-3. | `bakery-p390-09-footer.png`, `bakery-d1440-09-footer.png` |
| J1-P2-4 (i) attribution half under the active card at 390 walk | **Fixed** — card bottom 744 vs (i) 773. | `map-p390-07-walk-start.png`, `walk.md` controls |
| J1-P2-5 home head clipped at 1920/1024/1440 | **Fixed** — full head with headroom at all six matrix sizes. | `home-*.png`, `sheet-home.png` |
| J2-P2-1 label pills over the card strip at 1024×768 / resting labels at 1440 | **Fixed** — followed stop lifted above the strip, under-strip labels fade; no pill on a card in any walk shot at 768/1024/1440/1920. | `map-t1024-08-walk-mid.png`, `map-d1440-12-stopped.png` |
| J2-P2-2 lens caption breaks inside `LIBRARY / OF CONGRESS` at 390/360 | **Fixed** — institution name intact; only a trailing `·` at the end of line 1 remains (P3-4). | `map-p390-14-lens.png` |
| J2-P2-3 phone play pill covers the left of `Continue` | **Fixed** — pill shrinks to a play button (20–74) beside `CONTINUE` (102–289); no overlap at 390/360. | `bakery-p390-07-onward-top.png`, `barbershop-p360-07-onward-top.png` |
| J3-P2-1 moral body `#fed9cc` not the heading's white | **Fixed** — body `rgb(246,243,238)` = heading on all five chapters (both ch2 morals) at 390/360/768/1024/1440/1920. | `moral-colors` steps in `*-{vpk}.json`, `barbershop-p360-06-moral.png` |
| J3-P2-2 phone pill hidden through Onward + footer while playing | **Fixed** — pause control on screen at every scroll step of every chapter sweep (0 misses), the play button stays through the footer. | `pause-visible-sweep` in `bakery-p390.json`, `bakery-p390-09-footer.png` |
