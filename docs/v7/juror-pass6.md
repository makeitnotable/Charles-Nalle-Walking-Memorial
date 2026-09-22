# Juror pass 6 — Charles Nalle Walking Memorial (live GH Pages, commit df0ee6c)

Fresh-eyed visitor pass on `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/`, 2026-08-16.
Method: Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a
time, phone contexts with `hasTouch`/`isMobile` + CDP `Input.dispatchTouchEvent`, desktop with the mouse.
Viewports: 390×844 · 360×800 · 768×1024 · 1024×768 · 1440×900 · 1920×1080 (+ 844×390 and 720×450 spot checks).
No source read before scoring. Scripts: `scripts/juror6-*.mjs`. Evidence: `docs/v7/qa/juror-pass6/` (PNGs, gitignored).

What I did as a visitor: first visit at `/` at every class (+ landscape phone); QR arrival on `/bakery` and
`/barbershop`; read `/bakery` end to end with the narration playing (play, tap-to-seek, pause control sampled
every 500 px, moral colours, Where to next, footer with the mini-player latched) at 390/768/1024/1440;
`/commissioners-office` end to end (order, both players, only-one-mini rule, pause-control coverage while Part 2
plays) at 390 and 1440; `/map` overview → spot index → `Take the walk` from a scrolled position → walk step →
card drag mid-walk (Continue? snap-back?) → Continue → Stop → Back → `See Troy in 1858` (view, caption,
keyboard `+ ← 0`, `Back to today`) at 360/390/768/1024/1440/1920, plus a drag-feel matrix at 768; the museum
at 360/390/768/1024/1440/1920/720×450 (chip, Skip, ☰; rail scroll 25/55/96 %; drag to look; `Face forward`;
approach; tap the painting; peek-sheet tap/drag up/down; `Back to the hall`; last portrait; Esc; keyboard
Tab/Enter/←→/Esc); menu open/close + scroll-hide/return on all 11 routes at 390 and 1440; curtain screencasts
at 4× CPU (Continue→next at 390 and 1440, map card→chapter at 1440); reduced-motion sweep of all routes at
390/1440; 200 % zoom (720×450) sweep; console/network on every route; favicon set fetched and inspected at
16 px (8×), 32 px and 180 px.

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 / 360) | tablet (768 / 1024) | desktop (1440 / 1920) |
|---|---|---|---|
| Design | 9 | 8.5 | 9.5 |
| Usability | 8 | 8.5 | 9 |
| Creativity | 9.5 | 9.5 | 9.5 |
| Content | 9.5 | 9.5 | 9.5 |

**Phone.** The splash lands with Charles's whole head above the eyebrow, the CTA pinned to the bottom of the
frame; chapters read like a printed book (drop caps, tinted live paragraph, cream moral over the parallax
study, one primary orange at Where to next); the map overview shows all five stops with the bottom row on the
☰'s axis and the walk mode is exemplary (Back / Stop the walk, cards peeking both sides, drag pauses → Continue,
no snap-back). Two things keep usability at 8: on the two-part Commissioner's Office the pause control
disappears for the whole 8 000 px above Part 2's player while Part 2 plays, and at 360 the museum's tall
portrait frame runs under the ☰ and its sheet title starts a line with a lone "·".

**Tablet.** Landscape (1024×768) is desktop-grade everywhere; portrait (768×1024) reads well on every page —
footer nav one line with hugging arrows, mini-player pill clear of everything, map walk lane clean — but the
museum's last portrait is composed too tall at 768: its frame runs under `Back to the hall`, under the ☰ and
under the dot rail. Card drag on the wide tablet cards needs a real flick to advance (a 220 px/220 ms swipe
returns to the same card), which feels a touch reluctant.

**Desktop.** The strongest class: 3-D overview map with the doors pair, the 1858 lens framing the lower panel
in a near-full-bleed viewer, the hall with pitched-down camera, plank floor and moulded frames, the triptych
inspect mode (card left, painting dead centre, study right, one button). Only nits: the plaque eyebrow breaks
"NALLE / SERIES" and a map label pill can park right under `Stop the walk` mid-walk.

## Defects

### P0 — none.
### P1 — none.

### P2
1. **`/commissioners-office` · 390 & 1440 (all classes) · no pause control while Part 2 plays and the reader is above Part 2's player.** With Part 2 narrating, every scroll position from the hero through Part 1, History, Moral 1 and the Part-2 hero (scrollY 0–8000 at 390; equivalent span at 1440) shows no visible pause/play control; the Pt-2 mini-pill only appears once you have scrolled below its player. (Single-part chapters have the same behaviour but the gap is only the hero, ~1 screen — acceptable.) Evidence: `co2-p390-pt2-gap-0.png`, `co2-p390-pt2-gap-400.png`, `co2-p390-pt2-gap-800.png`, console table in `scripts/juror6-co2.mjs` output. Repro: open `/commissioners-office`, scroll to Part 2, press Play, scroll back up into Part 1 → audio continues, nothing to press.
2. **`/paintings` museum · 768×1024 (and 360×800) · the tall portrait's frame collides with the corner controls and the dot rail.** At 768 in approach on work 10 (`Peter Baltimore's Barbershop · Narrative II`) the frame's top moulding runs under `Back to the hall` (40,40) and under the ☰ (656,40), and its bottom moulding sits under the `10 / 10` counter + dot rail (y≈891); the canvas itself is clear (rect 88–873) so the instrument's "disjoint" check passes, but the eye sees the burger sitting on the picture frame. At 360×800 the ☰ (bottom 92) overlaps the frame top (~78) by ~12 px. Evidence: `mus-t768-10-last-portrait.png`, `mus-p360-10-last-portrait.png`. Repro: `/paintings`, tap the last dot.
3. **`/paintings` museum · 720×450 (200 % zoom) · plaque card overflows.** In approach the card column is 172 px wide: the title wraps to 6 lines with a lone "·" line, `BACK TO THE HALL` (195 px) spills past the card's right edge, and the portrait frame's bottom sits on the dot rail. Evidence: `mus-z720-10-last-portrait.png`, `mus-z720-5-approach.png`. Repro: 720×450 viewport (or 1440 at 200 % zoom), `/paintings`, approach any work.

### P3
1. `/paintings` sheet title · 360×800 · `PETER BALTIMORE'S / BARBERSHOP / · NARRATIVE II` — third line begins with the separator. `mus-p360-10-last-portrait.png`.
2. `/paintings` desktop plaque eyebrow · 1440/1920 · `MARK PRIEST · NALLE / SERIES · SPOT 01` splits the series name across lines. `mus-d1440-5-approach.png`.
3. `/map` overview · 390/360 · the transient `DRAG TO EXPLORE · TAP A STOP` hint (fades ~10 s) overlaps the Spot 4 pin by ~12 px while it shows. `map-p390-1-overview.png`.
4. `/map` walk · 1440 · at stop 3 the `1 BAKERY` label pill parks directly under `Stop the walk` with its leader line behind the button. `map-d1440-7-walk-step2.png`.
5. `/map` lens caption · 390 · `TROY, NEW YORK · 1858 ·` / `LIBRARY OF CONGRESS` — the separator ends line 1. `lens-p390-1-open.png`.
6. `/` · 844×390 (landscape phone) · the man's head is not visible above the eyebrow (the stack fills the height). H1 lists 844×390 in its acceptance. `home-land844.png`.
7. `/paintings` keyboard · 1440 · Tabbing past the dots continues into the 2-D grid below the sticky stage; pressing Enter on a dot from there approaches with the stage partly scrolled off (painting rect top at −92). Minor keyboard-only path. `scripts/juror6-muskb.mjs` output.

## Sheet B — Wil's ledger

Legend: Met · Not met · N/A. "Instr" = per the executor's instrument summary in `docs/v7/qa/final/`, not re-run.

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| G1 rag/orphans | Met | Met | Met | Instr rag 0 runts / 0 two-word display runts; my eye: 360 sheet title leading "·", 1440 plaque eyebrow split (P3) |
| G2 no clipped letterforms | Met | Met | Met | Instr 0 ink clips; barbershop `FOR JUSTICE` J intact in shots |
| G3 contrast AA | Met | Met | Met | Instr contrast 0 failures incl. pixel mode; moral body cream `rgb(246,243,238)` = heading; footer disclaimer opacity 1 |
| G4 tablet parity | Met | Met | Met | 768/1024 verified on every route; one tablet-only visual (P2 #2) |
| G5 em-dash sweep | Met | Met | Met | Instr none visible; none seen in copy, titles, addresses, chips |
| G6 floating-UI grid | Met | Met | Met | Instr states 127/0 collisions; insets 20/40/56 observed on Back/Stop/Skip/☰ |
| G7 motion tokens / RM parity | Met | Met | Met | Reduced-motion sweep: all text visible, museum → grid; parallax off-visible; token wiring is internal (N/A to a visitor) |
| H1 head visible | Met | Met | Met | 390/360/768/1024/1440/1920 yes; 844×390 no (P3 #6) |
| H2 description 3 lines | Met | Met | Met | 5 lines at 390/360, 4 at 768/1024, 3 at 1440/1920, no orphan |
| H3 `Walk the story` | Met | Met | Met | |
| H4 mobile CTA bottom-aligned | Met | N/A | N/A | 390: CTA 26–364 × 770–818, full width in inset; landscape phone keeps in-flow |
| H5 description contrast | Met | Met | Met | Instr; visually crisp on the film |
| H6 entry choreography | Met | Met | Met | CTA present at 2.6 s; RM shows everything |
| X1 curtain jitter/flash | Met | Met | Met | 4× CPU screencasts: page A stable → cover 0.3 s → hold → one continuous reveal, page B never uncovered (`curtain-continue-p390-strip.png`, `curtain-card-d1440-strip.png`); Instr frames CLEAN ×6 |
| M1 geolocate removed | Met | Met | Met | none at any class |
| M2 pitch / all five visible | Met | Met | Met | Instr pitch 48–52, 0 labels outside safe; all five in view at 360/390/768/1024/1440/1920 |
| M3 `Stop the walk` top-right | Met | Met | Met | 200,20 / 558,40 / 1214,56 |
| M4 drag pauses → Continue → resume | Met | Met | Met | button flips to Continue immediately; Continue → Stop the walk; Stop → Continue |
| M5 drag smoothing | Met | Met | Met | monotonic ease-out after release, no oscillation; ±1 card cap; wide tablet cards need a real flick (note) |
| M6 card titles two lines | Met | Met | Met | Instr walk.md; Bakery/CO 2 L, arrow clear |
| M7 `Back to map` inset | Met | Met | Met | 20,20 / 40,40 / 56,56 |
| M8 mobile overview row | Met | N/A | N/A | (i) left · Take the walk centred · ☰ right at 390/360; lens pill top-right |
| M9 mobile walk cards | Met | N/A | N/A | opaque, peeks both sides, `Back`, ☰ hidden while focused, strip clears attribution |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing | Met | N/A | N/A | balanced at 390/360 |
| M12 curtain interplay | Met | Met | Met | card→chapter screencast clean |
| M13 map copy block | Met | Met | Met | index titles intact, `Spot 01…05` padded |
| L1 lens lower panel | Met | Met | Met | opens on Troy + Hudson + West Troy; `0`/reset returns there |
| L2 bigger viewer | Met | Met | Met | 72 % of the viewport at 390; near full-bleed at 1440/1920 |
| L3 lens copy/controls | Met | Met | Met | only `Back to today`; date chip hidden; caption one line ≥768, two balanced lines at 390 (P3 #5) |
| L4 interaction | Met | Met | Met | `+` → scale 6, `←` pans, `0` resets |
| C1 drop cap | Met | Met | Met | storybook cap on the first paragraph (bakery, CO both parts) |
| C2 moral contrast + parallax | Met | Met | Met | body cream = heading; bg image 1.14× moves ~37 px per 500 px scroll |
| C3 study centred | Met | Met | Met | `align-items:center` measured; visually centred |
| C4 interlude credit | Met | Met | Met | credit sits on a dark chip on the archival photo |
| C5 Where to next declutter | Met | Met | Met | shadowed embed map, quiet pill, centred CTAs, mini collapses to the play button — Continue is the single primary |
| C6 rhythm | Met | Met | Met | head→quote 38/52, moral→Onward 168/200; Instr census same ladder on all five |
| C7 ☰ scroll-hide + hero faces | Met | Met | Met | hides after scroll-down, back on 20 px up on all 11 routes; bakery/barbershop faces clear of the ☰ |
| C8 barbershop | Met | Met | Met | faces up; two story images between text; J intact |
| C9 CO reorder + two players | Met | Met | Met | order hero→scene-0→history→moral-0→hero-2→scene-1→moral-1→onward; spine 01–06 matches; one mini at a time; tap-to-seek both parts. Coverage gap while Part 2 plays = P2 #1 |
| C10 footer lane | Met | Met | Met | pill sits below the disclaimer at 390/768/1024/1440 |
| C11 em dashes in chapter UI | Met | Met | Met | `Next · Spot 02`, `5 State Street · Mutual Bank Building` |
| C12 latent | Met | Met | Met | mansion player subtitle reads `Uri Gilbert Home` |
| F1 footer | Met | Met | Met | wordmark one line, vertical nav w/ arrows, Share right, disclaimer no runt at 390/768/1024/1440 |
| N1 X spins on close | Met | Met | Met | rotation sampled on every page |
| N2 scroll-hide/show | Met | Met | Met | incl. `/map` (bottom-right) and `/paintings` |
| N3 arrow tail | Met | Met | Met | unchanged |
| P1 no spot links | Met | Met | Met | |
| P2 closer copy | Met | Met | Met | `Their story lives on` / `Stand where they stood` / `Walk the story` |
| P3 em dashes | Met | Met | Met | |
| P4 H1 rag | Met | Met | Met | `ONE DAY. / A WHOLE / CITY'S CAST.` <1024, `ONE DAY. A WHOLE / CITY'S CAST.` at 1440 |
| P5 grid 768–1023 | N/A | Met | N/A | 2-col cards read well |
| A1 afterword (06) + Onward (07) | Met | Met | Met | |
| A2 section 07 copy | Met | Met | Met | `Two and a half miles. One day in 1860.` |
| A3 em dash | Met | Met | Met | |
| A4 latent | N/A | N/A | N/A | internal |
| U1 pitch down | Met | Met | Met | rail pitch −0.08 (phone) / −0.10 (desktop), floor visible |
| U2 paintings closer | Met | Met | Met | spacing 5, far 80, end glow visible from the start |
| U3 finish | Met | Met | Met | moulded frames, plank floor, cornice, coffers |
| U4 360° look + Face forward | Met | Met | Met | drag look → `Face forward` chip → recentre |
| U5 movement + keyboard | Met | Met | Met | native scroll; ←/→ look ±0.35; Enter approach; Esc back; dots + counter in approach |
| U6 desktop inspect | N/A | Met | Met | painting centred (720,450), card left no border, study right, only `Back to the hall`; tap/Enter toggles alive |
| U7 mobile peek-sheet | Met | Met | N/A | tap header → full, drag down → peek, drag up → full; painting recomposes; Back top-left reachable in both |
| U8 true aspect | Met | Met | Met | portrait hangs tall and narrow (24–366 × 111–622 at 390); grid tile portrait |
| U9 end of hall | Met | Met | Met | glow at the end of the corridor from the entrance |
| U10 hygiene / lanes | Met | Met | Met | chip copy per class, one line, clear of Skip and ☰ at 360/390/768/1024/1440/1920/720; canvas rects disjoint from card/sheet — but the *frame* enters the ☰ lane at 360/768 (P2 #2) |
| I1 CN mark | Met | Met | Met | reads CN at 16 px (8× inspection) and 32 px |
| I2 icon set | Met | Met | Met | svg / 16 / 32 / 48 / 180 / 192 / 512 / real 3-size ico / manifest all 200 |
| I3 head wiring | Met | Met | Met | 6 icon/manifest links under the base path |
| I4 og.png | Met | Met | Met | 200, 1200×630 |
| G-L1 titles | Met | Met | Met | `X · Charles Nalle Walking Memorial` |
| G-L2 docs drift | N/A | N/A | N/A | docs |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → 404 → redirects to `/bakery` |
| G-L4 sr-only dash | N/A | N/A | N/A | not visible |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | result |
|---|---|
| axe zero serious/critical every route/state | Met — 0/0/0/0 across 51 runs (+ 4 on /paintings) |
| contrast incl. pixel mode exit 0 | Met — 0 failures (18 /people rows unmeasured "never in view" at 768 — same roles pass elsewhere) |
| rag zero runts / clips / em dashes | Met — 0 / 0 / 0 over 502 blocks |
| states zero collisions | Met — 127 states, 0 collisions |
| census one rhythm ladder | Met — five chapters share `… 128 · 200 · 200` (CO adds its second part) |
| frames clean | Met — 6/6 CLEAN at 4× CPU; my own screencasts agree |
| perf | Met — home 97 · chapters 98–99 · /people 99 · /about 99 · /paintings 89–90 · /map 64 (bar 63) |
| a11y 100 | Met — every route |
| keyboard walk complete | Met — instr + my museum/lens/menu paths |
| reduced-motion parity | Met — my sweep at 390/1440 + instr |
| live URL verified | Met — GH Pages serves the build under review; 0 console errors on all routes (only the intentional 404 on `/bakery/`) |

## The one moment I would retell

Standing in the hall on a laptop, dragging to look back down the corridor, pressing `Face forward`, then
clicking a painting: the camera glides up, the plaque slides in on the left, Mark Priest's ink study hangs to
the right, and a tap on the canvas makes the crowd move. The Museum is still the moment.

## Cross-check against juror 5 (read after my scores were written)

- **Juror-5 P1 — museum wayfinding chip wrapping into `SCROLL / TO / WALK` at 390/360:** **fixed on df0ee6c.** The
  phone chip renders one line, on its own row under `Skip` — 390: `SCROLL TO WALK` at 130,398 · 130×15 · 1 line;
  360: 115,392 · 130×15 · 1 line; after `Face forward` it returns to one line (`mus-p390-2-rail-25.png`,
  `mus-p360-*`, `scripts/juror6-museum.mjs` output "UI at rest" / "after Face forward").
- **Juror-5 P2 — chapter footer at 768×1024, `THE PEOPLE OF THIS DAY` wrapping with a detached arrow:** **fixed.**
  On `/bakery` at 768 with the mini-player latched all four nav links are one line with hugging arrows
  (`THE PEOPLE OF THIS DAY` 329,654 · 216×26 · 1 client rect; `tour-bakery-t768-4-footer.png`).
- Juror-5 P3s 1 (plaque eyebrow rag), 2 (map hint over stop 4), 3 (lens caption separator) and 6 (museum keyboard
  edge case) are still present and appear in my P3 list; none is a bar item.

## Verdict

**PASS** — all axes ≥ 8 at every class, zero P0/P1, Sheet B all Met/N-A, instrument bars met.
Three P2s are listed for the next fix window (CO Part-2 pause coverage; the portrait frame vs ☰/Back/dot rail
at 768×1024 and 360×800; the 200 %-zoom plaque card).
