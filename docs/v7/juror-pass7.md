# v7 juror pass 7 — fresh eyes on the LIVE build (c202f20)

Build under review: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ — GH Pages `last-modified 2026-08-16 13:06Z`, two minutes after commit `c202f20` (07:04 MDT); HEAD = live. Reviewed 2026-08-16 as a visitor first (no source read before scoring). Playwright 1.62 / Chromium with `--use-gl=angle --autoplay-policy=no-user-gesture-required`; phone contexts `hasTouch:true, isMobile:true`, CDP `Input.dispatchTouchEvent` for drags/taps; one browser at a time.

Evidence: `docs/v7/qa/juror-pass7/` (PNGs, JSON logs, screencast frames in `frames-390/` and `frames-1440/`, contact sheets `sheet-*.png`). Scripts: `scripts/juror7-*.mjs`.

Viewports visited: 390×844, 360×800 (phone) · 768×1024, 1024×768 (tablet) · 1440×900, 1920×1080 (desktop) · plus 844×390 (landscape phone, home only) and 720×450 (200% zoom, all routes).

---

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 / 360) | tablet (768 / 1024) | desktop (1440 / 1920) |
|---|---|---|---|
| design | 9 | 9 | 9 |
| usability | 8 | 8 | 7 |
| creativity | 9 | 9 | 9 |
| content | 9 | 9 | 9 |

**Phone.** The home frame, the chapter template (drop cap, tap-to-seek highlight, mini-player → pill, moral parallax, one primary orange at Where-to-next), the walk with its opaque cards and the peek-sheet museum are genuinely finished work; nothing reads unfinished. Usability loses points for a full-viewport map that captures one-finger swipes (the index below is discoverable only from the bottom control lane and a ~6 px chevron) and card peeks of 7–10 px.

**Tablet.** Parity is real: 768 portrait gets the phone composition (sheet, chip on its own row) and 1024 landscape gets the desktop triptych, both with clean lanes and no collisions. Usability: at 1024×768 the museum's approach-from-the-top trap (below) applies; at 768 portrait it appears in a milder form (sheet below the fold, `Back` reachable).

**Desktop.** The richest class: 3-D pitched map, the lens filling the shell, the Louvre-ish hall with the card-left / painting-centre / sketch-right inspect. Usability 7 because of one P1 (approach from the initial scroll leaves the inspect view cropped with `Back` off-screen and the wheel captured) and one P2 (the wheel over the map never scrolls the page, so the copy/index/footer under the map are effectively unreachable for mouse users).

---

## Defects

### P0
none

### P1
1. **/paintings · 1440×900, 1920×1080, 1024×768 (desktop + tablet-landscape) — inspect view opens cropped below the fold with no visible exit.** From the initial scroll position the hall is visible under the page header (stage top at y=407 @1440, 432 @1920, 341 @1024) and the chip says "tap a painting". Clicking the visible bakery painting enters approach mode composed for the *full* stage: the painting spans y 708–1006 (fold 900), `Back to the hall` sits at y=958 (off-screen; @1920 its top edge is at 1073 of 1080; @1024 at 846 of 768), the dot rail is off-screen too. Wheel-down does not scroll the page (captured by the stage; scrollY stays 0), wheel-up zooms the painting and turns it alive, clicking the wall does nothing. Only Esc / PageDown / the scrollbar / the ☰ get the visitor out. A visitor would read this as broken. Evidence: `museum-1440-40-rest-top.png`, `museum-1440-41-approach-from-top.png`, `museum-1024-41-approach-from-top.png`, `sheet-museum-fromtop.png`, `museum3-{1440,1920,1024,768}.json` (`t3000.vis.back` y = 958 / 1073 / 846; `afterScrollAttempt.vis.scrollY` = 0; `afterWheelUp.st.alive` = 0). Repro: open `/paintings` at 1440×900, do not scroll, click the painting on the right wall; try to wheel down. (768 portrait: painting visible and `Back` visible top-left, but the peek-sheet and dot rail are below the fold; the touch swipe is taken by the sheet — milder, listed here as the same root cause.)

### P2
1. **/map · desktop 1024/1440/1920 — the wheel over the map zooms the map; the page never scrolls.** With the pointer anywhere over the canvas (centre, bottom edge, right side) `wheel(0,600)` leaves scrollY at 0; only PageDown/scrollbar, or a wheel while the pointer rests on a button, reaches the copy block, the spot index and the footer. No scroll cue is visible on desktop. Evidence: `mapwheel-1440.json` (`wheelCenter 0, wheelBottomEdge 0, wheelRightSide 0, pageDown 860`), `map-1440-50-after-wheel-center.png`. Repro: `/map` @1440, wheel down with the pointer over the map.
2. **/map · phone 390/360 — the full-viewport map captures one-finger swipes (pans), so the index below is discoverable only from the bottom control lane.** A swipe on the map body pans the map (scrollY 0); a swipe starting on the `Take the walk`/☰ lane scrolls (393). The cue is a ~6 px orange chevron under the button. Evidence: `map-390-20-after-swipe-on-map.png`, `map2-390.json` (`scrollAfterSwipeOnMap 0`, `scrollAfterSwipeBottomLane 393`, `mapCanvasTouchAction none`), `zoom-map-390-bottom.png`. Repro: `/map` on a phone, swipe up on the map.

### P3
1. **/ · 844×390 landscape phone** — the man's head sits behind the wordmark, not above the eyebrow line (H1 names 844×390). `home-844.png`.
2. **/map · 1920 overview** — the `④ Ferry Landing` label pill, the `Drag to explore · tap a stop` hint chip and the doors pair stack within ~10 px of each other; reads cramped. `zoom-map-1920-bottom.png`.
3. **/map · 1440 overview** — the translucent `See Troy in 1858` ghost pill lets the "1st St" street label bleed through the button text. `zoom-map-1440-bottom.png`.
4. **/map · walk mode (any class)** — world-anchored stop labels can pass under the top-right `Stop the walk`/`Continue` button mid-flight (Bakery label under `Continue` at 1440). `map-1440-08-after-drag.png`, `map-390-09-continued.png`.
5. **/map · phone walk cards** — neighbour peeks measure 7–10 px at 360/390 (M9 asks ≥ 16 px); the scale-to-0.92 eats the layout peek. `zoom-map-360-cards.png`, `map-360.json` (`walkCards` x = 29+300 → next at 354 of 360).
6. **/map · 360/390 spot index** — "Commissioner's" (26 px Caslon) is ~33 px wider than its column (scrollWidth 209 vs 176) and its tail runs into the arrow column; the arrow sits on the second line so nothing overlaps. `zoom-map-360-index.png`, `misc.json`.
7. **Chapters · Where to next** — the embed map flies in for ~2–3.5 s after it scrolls into view; for the first second the stop label sits above the frame's top edge (clipped). `embed-390-barbershop-{0,1000,2000,3500}.png`, `embed-1440-bakery-*.png`.
8. **/paintings · 1024×768 inspect** — landscape works render at ~25 % of the stage width (259×146 px), noticeably smaller than at 768 or 1440; the portrait work is fine. `museum-1024-04-approach-1.png`.

Console: zero errors/warnings on every route × viewport (home, five chapters, map, people, paintings, about, 404; reduced-motion; 200% zoom) — the only failed requests are aborted media range requests and map tiles cancelled mid-flight.

---

## Sheet B — Wil's ledger (Met / Not met / N/A per class)

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| H1 head visible above eyebrow | Met | Met | Met | 390/360/768/1024/1440/1920 whole head with headroom (`sheet-home.png`); 844×390 landscape phone: head under the wordmark (P3-1) |
| H2 description 3 lines desktop, balanced elsewhere | Met | Met | Met | 5 lines @390, 6 @360, 4 @768/1024, 3 @1440/1920 (`home.json`), no orphan |
| H3 CTA `Walk the story` | Met | Met | Met | |
| H4 mobile CTA bottom-aligned, full width, margin = inset | Met | N/A | N/A | 26 px sides, 26 px bottom @390; landscape phone keeps in-flow |
| H5 description contrast | Met | Met | Met | text is `rgb(246,243,238)`; contrast.md pixel mode 0 failures |
| H6 choreography ≤ 700 ms, RM shows all | Met | Met | Met | CTA fully visible 701 ms @390 / 697 ms @1440 after load (`misc.json`); RM shots complete |
| X1 curtain: no uncovered page-B frame | Met | Met | Met | screencast @4× CPU: mapcard/continue/menu/home at 390 + 1440 covered at 430–860 ms, hold, one reveal, no odd frames (`transitions-*.json`, `sheet-frames-*.png`) |
| M1 geolocate gone | Met | Met | Met | no locate control anywhere |
| M2 overview pitch / all five visible | Met | Met | Met | 5/5 markers in view at 360/390/768/1024/1440/1920; visibly 3-D; walk.md pitch 48–52 |
| M3 `Stop the walk` top-right | Met | Met | Met | 200,20 @390 · 558,40 @768 · 1214,56 @1440 |
| M4 drag pauses → `Continue` resumes; no snap-back | Met | Met | Met | button reads `Continue the walk` 60 ms after release; monotonic settle, 0 reversals; Continue resumes cycling; Stop → Continue (`map-*.json`) |
| M5 drag smoothing | Met | Met | Met | 140 px flick advances exactly one card; slow drag returns to the same card; feels natural in the frames |
| M6 card titles two lines | Met | Met | Met | Holeur's / Fashionable Bakery, Commissioner's / Office on two lines, never crossing the arrow (walk shots) |
| M7 `Back to map` equal inset | Met | Met | Met | 20,20 / 40,40 / 56,56 |
| M8 mobile overview row | Met | N/A | N/A | (i) left, `Take the walk` centred, ☰ right on one axis; 1858 pill top-right |
| M9 mobile walk cards | Not met (peek) | N/A | N/A | opaque, scaled 0.92, map follows, `Back` copy, ☰ hidden while focused — all met; neighbour peek 7–10 px vs ≥ 16 px spec (P3-5) |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing balanced | Met | N/A | N/A | |
| M12 curtain interplay | Met | Met | Met | map goes quiet under the cover (frames clean) |
| M13 map copy block rag / Spot NN | Met | Met | Met | "2.5 miles · about 45 minutes on foot"; Spot 01–05 |
| L1 lens frames the lower panel | Met | Met | Met | initial + reset = Troy/Hudson/West Troy (`map-*-12/21-lens-open.png`) |
| L2 bigger viewer | Met | Met | Met | fills the shell within the inset at every class |
| L3 lens copy/controls | Met | Met | Met | only `Back to today` centred; date chip hidden while open; caption one line (`Drag to explore · pinch to zoom` on phone) |
| L4 interaction | Met | Met | Met | drag pans, `+ − 0` work, Esc closes, `Back to today` restores overview |
| C1 drop cap | Met | Met | Met | A / O / P drop caps on 3 lines desktop, 2–3 phone; highlight + tap-to-seek intact |
| C2 moral contrast + parallax | Met | Met | Met | body and heading both `rgb(246,243,238)` on all morals incl. ch2 ×2; background parallaxes |
| C3 study centred | Met | Met | Met | `md:items-center` in effect |
| C4 archival credit chip | Met | Met | Met | `Archival record` chip on the photo (barbershop walk) |
| C5 Where-to-next declutter | Met | Met | Met | shadowed embed, CTAs centred under the map, quiet pill label, mini-player collapses to a pill; `Continue` is the one primary |
| C6 rhythm | Met | Met | Met | heading→quote tight; moral→Onward ≈ 200; census ladder identical on five chapters |
| C7 ☰ scroll-hide + hero focus | Met | Met | Met | hides after scroll-down, returns on scroll-up on every page; bakery/barbershop faces clear of the ☰ |
| C8 barbershop | Met | Met | Met | faces framed (`100% 40%` phone / `50% 44%` desktop); story T→I→T→I→T; J descender intact |
| C9 ch2 order + spine + two players | Met | Met | Met | hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; spine 01–06 matches; playing Pt 1 pauses Pt 2, one mini-player |
| C10 footer reserves the lane | Met | Met | Met | pill never covers a footer link at 390/768/1440 (`footerCovered []`) |
| C11 em dashes in chapter UI | Met | Met | Met | `Next · Spot 02`, `5 State Street · Mutual Bank Building`, attribution without dash |
| C12 latent (subtitle, code) | Met | Met | Met | subtitle reads `Uri Gilbert Home`; code hygiene not visitor-verifiable |
| F1 footer | Met | Met | Met | 3-col desktop, stacked phone, wordmark one line, disclaimer no runt |
| N1 X spins on close | Met | Met | Met | rotation sampled through 90° on every page |
| N2 scroll-hide on all pages | Met | Met | Met | incl. /paintings; /map only when the pointer is off the canvas (P2-1) |
| N3 arrow tail unchanged | Met | Met | Met | |
| P1 spot links removed | Met | Met | Met | |
| P2 closer copy | Met | Met | Met | Their story lives on / Stand where they stood / Walk the story |
| P3 em dashes | Met | Met | Met | none visible; `1859–1946` en dash kept |
| P4 H1 rag | Met | Met | Met | ONE DAY. A WHOLE / CITY'S CAST. @1440; three lines @390 |
| P5 grid 768–1023 | N/A | Met | N/A | 2-col cards read well at 768 |
| A1 afterword numbered | Met | Met | Met | (06) Afterword, (07) Onward |
| A2 closer copy | Met | Met | Met | Two and a half miles. One day in 1860. + body + Walk the story |
| A3 attribution dash dropped | Met | Met | Met | |
| A4 kicker | Met | Met | Met | `On the sidewalk` rendered |
| U1 rail pitched down | Met | Met | Met | pitch −0.08 (portrait) / −0.10; floor visible |
| U2 paintings closer, end visible | Met | Met | Met | spacing 5, far 80, doorway glow visible from the entrance |
| U3 finish | Met | Met | Met | plank floor, moulded frames, coffered ceiling, baseboard/cornice |
| U4 360° look + Face forward | Met | Met | Met | yaw wraps (−4.96, −6.61 rad seen), `Face forward` appears and recentres |
| U5 movement feel / keyboard | Met | Met | Met | native scroll, Tab→dot→Enter, ←/→ prev/next in approach, ←/→ look in rail, Esc; counter+dots visible in approach |
| U6 desktop inspect | Met | Met | Met | painting centred, card left no border, sketch right, only `Back to the hall`, chip gone, tap toggles alive, wheel-zoom toggles, invisible focusable button — **but see P1** for the entry from the top |
| U7 phone peek-sheet | Met | Met | N/A | tap/drag header peek⇄full, painting recomposes, `Back` top-left, tap brings alive |
| U8 true aspect | Met | Met | Met | portrait 0.667 tall & narrow, grid tiles 1.78/1.5/0.67 |
| U9 threshold (stretch) | Met | Met | Met | doorway glow at the hall end hands off to the 2-D section |
| U10 hygiene | Met | Met | Met | Skip top-left, chip copy (phone `Scroll to walk`), one line, clear of Skip and ☰ at 360/390/768/1024/1440/1920/720×450 |
| I1 CN mark | Met | Met | Met | reads as an interlocked CN at 32, muddier but legible at 16 (`favicon-render.png`) |
| I2 icon set | Met | Met | Met | svg / ico (15 KB multi-size) / 16 / 32 / 180 opaque / 192 / 512 / manifest all 200 |
| I3 head wiring | Met | Met | Met | icon svg + png 32/16 + shortcut ico + apple-touch + manifest, all under the base path |
| I4 og.png | Met | Met | Met | 1200×630 served |
| G1 rag | Met | Met | Met | rag.md 0 runts; no runt seen in any shot |
| G2 no clipped letterforms | Met | Met | Met | J in INJUSTICE / JUSTICE intact at 390 & 1440 |
| G3 contrast | Met | Met | Met | contrast.md 0 failures incl. pixel mode; morals/credits legible |
| G4 tablet parity | N/A | Met | N/A | 768 + 1024 checked on every route |
| G5 em-dash sweep | Met | Met | Met | none visible on any page |
| G6 floating-UI grid | Met | Met | Met | states.md 0 collisions in 127 states; my only crowding is a map label (P3-2) |
| G7 motion tokens | N/A | N/A | N/A | code-level; reduced-motion parity verified (below) |
| G-L1 titles `·` | Met | Met | Met | `X · Charles Nalle Walking Memorial` |
| G-L2 docs drift | N/A | N/A | N/A | not visitor-verifiable |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → 404 page redirects to `/bakery` (title = bakery) |
| G-L4 sr-only dash | N/A | N/A | N/A | not visitor-verifiable |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | result |
|---|---|
| axe zero serious/critical every route/state | Met — 0 serious/critical/moderate/minor across 51 runs (+4 paintings runs) |
| contrast incl. pixel mode exit 0 | Met — 0 failures (0 style, 0 pixel); 18 /people @768 rows unmeasured "never in view" |
| rag zero runts / clips / em dashes | Met — 0 / 0 / 0 over 502 blocks |
| states zero collisions | Met — 127 states, 0 collisions (one `FAILURE@land` capture noted in the log) |
| census one rhythm ladder on five chapters | Met — 128 · 200 · 200 on all five |
| frames clean | Met — six cases CLEAN; my live re-capture agrees |
| perf | Met — home 97, chapters 98–99, people/about 99, paintings 89–90 mobile, map 64 (bar 63) |
| a11y 100 | Met — 100 on every route |
| keyboard walk complete | Met — instrument 37 stops on /paintings; my Tab→dot→Enter→arrows→alive→Esc path works, focus rings visible |
| reduced-motion parity | Met — home/chapter/map/paintings at 390/768/1440: all text visible, museum replaced by the grid, no console errors |
| live URL verified | Met — HEAD c202f20 = live |

---

## The one moment I would retell

Standing in the hall on a phone: the plank floor sliding under you as you scroll, a painting on the left wall growing until you tap it — it slides to the centre, the sheet peeks up with its name, and then you touch the canvas and the crowd starts to move. The Museum is still the moment.

---

## Cross-check against juror 6 (read only after my scores were written)

- **J6 P2 #1 — `/commissioners-office`, no pause control while Part 2 plays and the reader is above Part 2's player:** **fixed on c202f20.** With Pt 2 narrating and the page scrolled into Part 1's heading and paragraphs, the Pt-2 mini-player (`Pause narration: Commissioner's Office, Pt 2`, 44×44) is on screen at 390 and 1440 (`co-390-04-in-part1-while-pt2-plays.png`, `co-390.json` / `co-1440.json` → `btnsInPart1WhilePt2Plays`).
- **J6 P2 #2 — `/paintings` 768×1024 / 360×800, the tall portrait's frame under `Back to the hall` / ☰ / dot rail:** **fixed.** At 768 the frame's top moulding clears `Back` (40–78) and the ☰ is hidden in approach; the bottom moulding clears the `10 / 10` counter and dots (canvas 134–827, dots at 895). At 360 the frame (canvas 137–522) clears `Back` (20–58) and the dots (646+); ☰ hidden (`museum-768-10-last-portrait.png`, `museum-360-10-last-portrait.png`, `museum-768.json`/`museum-360.json` → `last.collisions []`).
- **J6 P2 #3 — `/paintings` 720×450, plaque card overflow:** **fixed.** The card is 176 px wide, `Back to the hall` is now full-width inside it (no spill), the title wraps to four lines, and the frame's bottom (canvas 101–349) clears the dot rail at 406 (`museum-720z-10-last-portrait.png`, `museum-720z.json`). The remnant is cosmetic: the last title line begins with the `·` separator (J6's own P3-1), which I do not count.

Of juror 6's P3s, the 844×390 head (his #6) is still present (my P3-1); his #7 (keyboard approach with the stage partly scrolled off) is the narrow keyboard-only face of my P1 — on this build the same composition-off-screen happens to any pointer user who taps a painting from the initial scroll position at 1024/1440/1920.

---

## VERDICT: FAIL — one P1 (desktop/tablet-landscape museum approach from the initial scroll opens cropped with `Back` off-screen and the wheel captured); Sheet A ≥ 8 everywhere except desktop usability 7; Sheet B all Met/N-A except M9 (peek 7–10 px vs ≥ 16); instrument bars all met.
