# Juror pass 8 — CNWM v7, live build 29e69f4

Juror: fresh, no memory of the build. Visited https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ (GH Pages, `last-modified` 2026-08-16 14:46 UTC, HEAD 29e69f4 = "juror-7 fixes") as a visitor at 390×844, 360×800, 768×1024, 1024×768, 1440×900, 1920×1080, plus 844×390 and 720×450 (200% zoom). Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), touch via CDP `Input.dispatchTouchEvent` on phone/tablet-portrait, mouse on desktop/tablet-landscape, one browser at a time. Scripts: `scripts/juror8-*.mjs`. Evidence: `docs/v7/qa/juror-pass8/` (PNG/JPG gitignored; JSON kept). No source read before scoring. Instrument rows in Sheet B are taken from `docs/v7/qa/final/*.md` as handed over — not re-run.

## What I did (visitor log)

- `/` first visit at all six viewports + 844×390: whole head visible above `Troy, New York · April 27, 1860` at 390/360/768/1024/1440/1920 (`home-*.png`); description 3 lines at 1440/1920, 4 at 768/1024, 5 at 390, 6 at 360; CTA `Walk the story` bottom-pinned full-width on phones (48 px tall, bottom margin = side inset).
- QR arrival `/bakery` and `/barbershop` at 390/360/768/1440/1920 (`bakery-p390-01-arrival`, `sw-*-hero`, `x-*-hero`). Bakery face clear of the ☰ at 390/360; barbershop faces up in frame.
- Read `/bakery` end to end at 390 (`bakery-p390-*`): play → 3.3 s in, tap paragraph 4 → seek 4.0 → 50.0 s, highlight follows; scroll up (mini pill with pause on screen while main player off-screen — verified on `/commissioners-office`, `co-p390-08`), scroll down 2600 px (mini pill + pause on screen, `bakery-p390-07`), ☰ hid after ~600 px down and returned after 200 px up; moral (`sw-*-moral*`, all five chapters at 390/768/1440: body `rgb(246,243,238)` = heading; barbershop `J` descender intact — `zoom-barbershop-J-390`); Onward (embed pill marker, centred CTAs, mini collapsed to a round pill: one orange = Continue); footer (nothing covered at the very bottom); `Continue` → curtain → landed on `/commissioners-office` (`bakery-p390-14-curtain-strip`, `-15-landed`).
- `/commissioners-office` end to end at 390 (`co-p390-*`): order hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; spine `Listen · Pt 1 / History / The moral · Pt 1 / Listen · Pt 2 / The moral · Pt 2 / Onward`; played Part 2, scrolled up into Part 1: Part 2's mini pill with pause stayed on screen (`co-p390-08`, `-09`); pressing Part 1's play paused Part 2 (one player at a time).
- Five-chapter sweep at 390 / 768 / 1440 (`sw-*`): hero, drop-cap opening, moral heading(s), onward embed after 4 s (marker pill present on all five), footer with the mini latched (768: nothing covered — `sw-bakery-t768-footer-mini`; 1440 likewise).
- `/map` phone 390 + 360 (`map-p390-*`, `map-p360-*`, `lens-p390-*`): overview all five stops in frame; scrolled past the map to the index (titles intact; `Commissioner's Office` ink right 287 < column right 300 at 360); scrolled 120 px then `Take the walk` → page snapped to top, Back top-left / Stop the walk top-right (`map-p360-05`); stop + label clear of the card strip (`map-p390-06`); mid-walk touch drag → paused, button `Continue`, no snap-back (25 × 16 ms samples monotonic), neighbours peek 17/17 px at 360 and 20/19 at 390; `Continue` → cycling resumed; `Back`; `See Troy in 1858` opens on the lower panel (Troy + Hudson + West Troy), caption 2 lines at 360/390 (`Troy, New York · 1858 · / Library of Congress`), `Back to today` works; marker tap from overview → focused with `Continue`.
- `/map` tablet 768 (touch) and 1024 (mouse), desktop 1440 (`map-t768-*`, `map-t1024-*`, `map-d1440-*`): pitched overview with labelled pills; on 1440/1024 a plain wheel over the map scrolls the page (scrollY 300 → 600) and a house chip `HOLD ⌘ AND SCROLL TO ZOOM THE MAP` appears (`map-d1440-02-wheel-1`); ⌘/Ctrl+wheel zooms the map (page stays at 0, `-03-ctrl-wheel`); walk: Back to map top-left, Stop the walk top-right, ☰ bottom-right in its lane clear of the cards; mouse drag → `Continue`, no snap-back; Stop the walk → `Continue`; lens: near-full-bleed viewer inside the insets (1328×672 at 1440), wheel zooms the plate without scrolling the page, keyboard `+ − 0 arrows` all work (`juror8-misc`), `Back to today`.
- `/paintings` museum at 1440, 1920, 1024×768, 768×1024, 390, 360, 720×450 (`mus-*`, `musph-*`, `x-paintings-*`): wayfinding chip one line at every size (546 px at 1440, 504 at 1024, 263 at 768/720, 130 `Scroll to walk` at 390/360) clear of the Skip pill (top-left) and the ☰ (top-right); FROM THE PAGE TOP WITHOUT SCROLLING clicked the visible painting at 1440, 1920, 1024×768, 768×1024 and 720×450 → the sticky stage came flush (scrollY = stage top), painting centred (cx = viewport centre), `Back to the hall` visible, Esc/Back returns to rail (`mus-d1440-02`, `x-paintings-d1920-approach-from-top`); rail scroll, drag-look (yaw −3.2), `Face forward`, click a painting → approach (card left, no border, one button; sketch right on the five sketched works), tap → alive (`alive: 4`), tap → rest; the LAST painting: tall portrait 387×580 at 1440 / 330×495 at 1024 / 462×693 at 768 / 278×418 at 390 / 257×385 at 360, undistorted, frame clear of Back, ☰ and the dot rail (`mus-*-13-last`); phone peek-sheet (95 px peek → drag header up → full 168 px, painting recomposes higher; drag down → peek; tap header → full; `musph-p390-*`); Esc; ArrowLeft/Right = prev/next in approach, ArrowDown walks the rail; ☰ hidden after the rail scroll, returned on scroll-up and opened; Skip the hall → 2-D grid (tile aspects 1.78/1.5/0.67).
- Menu open/close on `/`, chapters, `/map`, `/people`, `/about`, `/paintings`, `/404`: X rotates 90° on close (`matrix(0.68,0.73…)` → `none`), burger hides after scrolling down (`opacity 0`) and returns after ~60 px up on every page incl. `/map` and `/paintings`.
- Favicon: `/favicon.svg` (1.5 KB, path outlines only, CN monogram), `/favicon.ico` (real 3-size ICO), `/favicon-32.png`, `/apple-touch-icon.png` (180, opaque), `/icon-192.png`, `/icon-512.png`, `/site.webmanifest` (`start_url ./`, `theme_color #1d1411`) all 200 under the base path; `<head>` carries svg + png16/32 + apple-touch-icon + manifest + theme-color. The mark reads as an interlocked C+N at 180 (`apple-touch-icon.png`).
- Curtain (CDP screencast, 4× CPU, 1440): menu link chapter → `/paintings`, footer link `/people` → `/about`, map card → `/bakery` (`curtain-*-d1440/`): cover ≈ 250–650 ms, held ≈ 800 ms, one continuous reveal from ≈ 1.43 s; no uncovered frame of page B. One 40 ms frame of the bare dark panel without the date lockup during the document swap (map-card, f068 @913 ms).
- Reduced motion (`reducedMotion:'reduce'`) at 390 + 1440 on `/`, `/bakery`, `/map`, `/paintings`: nothing left at opacity 0 at the top or mid-page; `/paintings` renders the 2-D grid, no canvas; CTA navigation instant (≈75 ms). 200% zoom (720×450): no horizontal overflow on `/`, `/bakery`, `/map`, `/people`, `/about`, `/paintings`.
- Console: zero errors on every route at 390 and 1440 after a full scroll (only `ERR_ABORTED` on media/tile range requests and "preloaded but not used" font warnings on non-Caslon-first pages; `/404-nope` logs its own 404).

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 + 360) | tablet (768 + 1024) | desktop (1440 + 1920) |
|---|---|---|---|
| Design | 9 | 8 | 9 |
| Usability | 9 | 9 | 9 |
| Creativity | 9 | 9 | 9 |
| Content | 9 | 9 | 9 |

- **Phone.** Caslon on near-black, the reading progress bar, hanging quote marks, storybook drop caps, the collapsed mini pill, two-line card titles with 17 px peeks and the peek-sheet museum all read as one hand; the only things a visitor notices are the truncated `Holeur's Fashionable B…` in the player and a stray focus ring on `Back to the hall`. Everything I tried worked first time with touch.
- **Tablet.** 768 portrait is the best surface the site has (the last portrait painting fills the frame; footer + mini clean). 1024×768 loses a point on design: the museum plaque wraps `…· NARRATIVE / I` and `/ II` (a 1–2 character last line on a title role) and the `5 BARBERSHOP` pill crowds `BACK TO MAP` in walk mode.
- **Desktop.** Map at pitch 52 with cooperative wheel + a house-styled ⌘ chip, the walk with card scaling, the 1858 plate, and the museum triptych (card / painting / study) at 1440 and 1920 are all finished work; the only nits are the transient hint chip landing on stop 4's pin and `· NARRATIVE I` starting a plaque line with the separator.

## Defects

### P0
None.

### P1
None.

### P2
1. **Museum plaque title runts at 1024×768** — route `/paintings`, viewport 1024×768 (tablet-landscape), approach works 6/7/9/10: `WASHINGTON STREET FERRY LANDING · NARRATIVE / I`, `… · NARRATIVE / II`, `PETER BALTIMORE'S BARBERSHOP · NARRATIVE / I`, `/ II` — a one- or two-character last line on a `.t-title-sm` role (G1's own runt definition), and the line before it starts with the `·` separator. Also `Commissioner's Office · Part / 2` at 844×390. Evidence: `docs/v7/qa/juror-pass8/mus-t1024-08-approach.png`, `mus-t1024-13-last.png`, `plaque-rag.json` (all ten titles × 1024/1440/1920/844×390). Repro: open `/paintings` at 1024×768, scroll into the hall, click the tenth dot (or any Narrative work). Note: at 1440/1920 the same titles wrap `… / · NARRATIVE II` (no runt, but the separator opens the line) — a `nbsp` between `NARRATIVE` and the numeral, and between `·` and `NARRATIVE`, fixes both.
2. **A stop can stay "active" after `Back` and its pill then floats above the 1858 plate** — route `/map`, phone 360/390 and tablet 768 (touch), also seen at 390 with mouse timing. Repro (deterministic in my runs): `Take the walk` → wait ≈ 5.7 s → drag the cards one card (walk pauses, `Continue`) → tap `Continue` → wait ≈ 3.5 s (the walk has just landed on the next stop) → tap `Back`. The overview returns with that stop still highlighted and labelled (`FERRY LANDING · 4`); open `See Troy in 1858` and the orange `4 FERRY LANDING` pill + pin render on top of the plate. Waiting 5 s instead of 3.5 s before `Back` clears it, so it is a timing race between the tour step's activation and `Back`'s reset. Evidence: `backrace2-p390-3500.png` (stray after Back), `backrace2-p390.json` (delays 1000/2000/5000 clean, 3500 stray), `map-p360-10-lens.png` and `map-t768-10-lens.png` (pill over the plate).

### P3
1. `/bakery` 390: the player title truncates to `Holeur's Fashionable B…` (`bakery-p390-04-playing.png`); other chapters fit.
2. Museum: after a pointer/touch approach `Back to the hall` is focused programmatically and matches `:focus-visible`, so it renders with its orange focus ring for mouse/touch users (`mus-d1440-02-approach-from-top.png`, `musph-p390-03-sheet-up.png`; `juror8-misc` → `focus-visible=true`).
3. `/map`: the transient `DRAG TO EXPLORE · TAP A STOP` hint chip (auto-hides ≈ 8 s) sits on stop 4's marker/leader at 390, 1440 and 1920 (`map-p390-01-overview.png`, `map-d1440-01-overview.png`, `x-map-d1920-overview.png`); at 1024×768 in walk mode the `5 BARBERSHOP` pill sits 10 px from `BACK TO MAP` (`map-t1024-07-walk-mid.png`).
4. `/map` phone lens caption wraps `TROY, NEW YORK · 1858 · / LIBRARY OF CONGRESS` — the separator dangles at the line end at 360/390 (`lens-p390-05-lens-after-walk.png`); at 720×450 the `SEE TROY IN 1858` pill wraps to two lines (`z200-map-top.png`).
5. `/people` 768/1440 eyebrows `INDUSTRIALIST · / CHARLES'S EMPLOYER`, `BARBER · / UNDERGROUND RAILROAD` break after the separator; `CHIEF CIVIL- / RIGHTS ATTORNEY` breaks on the hyphen (`x-people-t768-cards.png`).
6. `/` at 844×390 (landscape phone): the head is not visible above the eyebrow — the text stack fills the frame (`home-land.png`); named in H1's acceptance list, not a scored class.
7. Curtain at 4× CPU: one ≈40 ms frame of the bare panel without the `APRIL 27, 1860` lockup during the document swap (`curtain-map-card-d1440/f068-913.jpg`); page B never shows.
8. Chapter footer at 1440: the hairline above the disclaimer runs 80–1360 while the top rule is full-bleed and the content sits at 136 — three widths (`sw-mansion-d1440-footer-mini.png`).
9. Lens viewer area on desktop measures 69% (1440) of the viewport — the ledger's "≥ 80%" figure is not reached, though the viewer is full-bleed inside the insets and the rest is its own caption + `Back to today` (`map-d1440-11-lens.png`).
10. `/map` phone: a one-finger swipe on the map body pans the map (`touch-action: none`; scrollY stays 0), so the copy block / spot index below are reached only by swiping from the bottom control lane (scrollY 854) — the cue is the small orange chevron under `Take the walk` (`mapswipe-p390-after-body-swipe.png`, `juror8-mapswipe`). Consistent with the on-map hint `Drag to explore`, so I rate it a discoverability note, not a defect.

## Sheet B — Wil's ledger

Met / Not met / N/A per class (phone · tablet · desktop) with a one-line note.

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| H1 whole head above the eyebrow | Met | Met | Met | 390/360/768/1024/1440/1920 all show the full head with headroom; 844×390 does not (P3-6) |
| H2 description 3 lines desktop, balanced elsewhere | Met | Met | Met | 3 at 1440/1920 · 4 at 768/1024 · 5 at 390 · 6 at 360, no runt |
| H3 CTA `Walk the story` | Met | Met | Met | |
| H4 mobile CTA bottom-aligned, full-width, 48 px | Met | N/A | N/A | 390: x 26–364, bottom 818 (margin 26 = side inset); 360 likewise; landscape keeps in-flow |
| H5 description contrast | Met | Met | Met | `rgb(246,243,238)` 16 px on the film; contrast.md pixel mode 0 failures |
| H6 entry choreography / reduced-motion shows all | Met | Met | Met | rm pass: nothing at opacity 0; CTA present |
| X1 curtain: no flash of page B | Met | Met | Met | frames.md 6/6 CLEAN; my 4× screencasts (menu link, footer link, map card) show no uncovered page-B frame; one bare-panel frame during swap (P3-7) |
| M1 geolocate removed | Met | Met | Met | walk.md geolocate `no` ×8; none seen |
| M2 overview pitch, all five labels safe | Met | Met | Met | walk.md pitch 48–52 at 360–1920, 0 labels outside safe; all five visible on the phone (`map-p390-01`) |
| M3 `Stop the walk` top-right at inset | Met | Met | Met | 390: 200,20 · 768: 558,40 · 1440: 1214,56 |
| M4 drag pauses, `Continue` resumes, `Stop` → idle | Met | Met | Met | verified touch + mouse; button `Stop the walk` → `Continue` → `Stop the walk`; `Continue the walk` aria; stray-active-after-Back race (P2-2) |
| M5 drag smoothing, no snap-back | Met | Met | Met | 25 × 16 ms samples monotonic at 360/390/768/1024/1440 |
| M6 card titles two lines, never cross the arrow | Met | Met | Met | `Holeur's / Fashionable Bakery`, `Commissioner's / Office` at every size; walk.md 2L |
| M7 `Back to map` equal inset | Met | Met | Met | 20,20 · 40,40 · 56,56 |
| M8 mobile overview row: (i) · `Take the walk` · ☰ on one axis; 1858 pill top-right | Met | Met | N/A | 360: (i) 20 / button 52–259 / ☰ 268; every control ≥ 44 px; the button clears the (i) by 8 px at 360 |
| M9 mobile cards opaque, peeks ≥ 16, `Back`, ☰ hidden while focused, strip clears attribution | Met | Met | N/A | peeks 17/17 at 360, 20/19 at 390; ☰ absent in walk mode on phones; strip bottom 744 vs (i) 773 at 390 |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing balanced | Met | Met | N/A | 12 px gaps, neighbours scaled |
| M12 map quiet under the curtain | Met | Met | Met | card → chapter capture clean |
| M13 map copy block rag, `Spot 01` padding | Met | Met | Met | rag.md 0 runts; `Spot 01` on /map and /paintings |
| L1 lens opens/resets on the lower panel | Met | Met | Met | 390/768/1440 open on Troy + Hudson + West Troy; `0` resets |
| L2 bigger viewer | Met | Met | Met | 350×675 at 390 (72% of viewport), 1328×672 at 1440 (69% — P3-9), plate 4096 crisp when zoomed |
| L3 lens copy/controls | Met | Met | Met | only `Back to today`; date chip hidden while open; caption 2 lines on phones with a dangling `·` (P3-4) |
| L4 interaction unchanged | Met | Met | Met | pan, wheel (no page scroll), `+ − 0 arrows` verified |
| C1 drop cap | Met | Met | Met | 3-line cap at 768/1440, 3 at 390 (`sw-ferry-t768-open`, `co-p390-08`) |
| C2 moral body cream = heading, contrast, parallax | Met | Met | Met | body and heading both `rgb(246,243,238)` on all six morals; contrast.md pixel 0 fails |
| C3 study centred | Met | Met | Met | 768/1440 sketch vertically centred with its caption block |
| C4 archival credit on a chip, wipe reveal, no parallax | Met | Met | Met | `ARCHIVAL RECORD` chip (`bakery-p390-07`) |
| C5 Where-to-next declutter | Met | Met | Met | shadowed embed, quiet pill marker, centred CTAs, mini collapses to a round pill — `Continue` is the one orange |
| C6 rhythm | Met | Met | Met | census.md ladder identical on all five (128 · 200 · 200); heading → quote gap reads as companion |
| C7 ☰ hide/show + hero faces clear | Met | Met | Met | verified on chapters, /map, /paintings, /people, /about, /404 |
| C8 barbershop hero focus, T→I→T→I→T, J descender | Met | Met | Met | faces in frame at 390/1440; `FOR JUSTICE` J intact (`zoom-barbershop-J-390`) |
| C9 chapter 2 order + spine + two players | Met | Met | Met | id order and spine verified; one mini at a time |
| C10 footer reserves the mini lane | Met | Met | Met | 390/768/1440 footer with mini latched: nothing covered |
| C11 em dashes in chapter UI | Met | Met | Met | `NEXT · SPOT 02`, `5 State Street · Mutual Bank Building`; text-node sweep finds `—` only in script comments |
| C12 latent (mansion subtitle) | Met | Met | Met | player reads `Uri Gilbert Home` |
| F1 footer redesign | Met | Met | Met | wordmark one line, `Made by Notable`, arrow list, Share right on chapters, disclaimer no runt; rule widths differ (P3-8) |
| N1 X spins on close | Met | Met | Met | 90° rotation sampled on /people /about /404 |
| N2 scroll hide/show everywhere | Met | Met | Met | incl. /map and /paintings (returns on 60–120 px up) |
| N3 arrow tail unchanged | Met | Met | Met | |
| P1 spot links removed | Met | Met | Met | 0 `Spot NN` links under people |
| P2 closer copy | Met | Met | Met | `Their story lives on` · `Stand where they stood` · `Walk the story` |
| P3 people em dashes | Met | Met | Met | none visible |
| P4 H1 rag | Met | Met | Met | 3 lines at 390, `ONE DAY. A WHOLE / CITY'S CAST.` at 1440 |
| P5 grid at 768–1023 | Met | Met | Met | 2-col cards read well at 768 (eyebrow separator wraps — P3-5) |
| A1 afterword `(06)` + Onward `(07)` | Met | Met | Met | rails (01)…(07) |
| A2 section 07 copy, computed distance/time | Met | Met | Met | `Two and a half miles. One day in 1860.` · `forty-five minutes` |
| A3 attribution dash dropped, `·` title | Met | Met | Met | `About · Charles Nalle Walking Memorial` |
| A4 latent | N/A | N/A | N/A | not visitor-visible |
| U1 rail pitched down | Met | Met | Met | museum.md −0.08/−0.10; floor visible in every rail shot |
| U2 paintings closer, end wall visible | Met | Met | Met | spacing 5, far 80, glow visible from the entrance |
| U3 finished environment | Met | Met | Met | plank floor, coffers, moulded frames with gilt lip, baseboard/cornice |
| U4 360° look, Face forward | Met | Met | Met | yaw −3.2 by drag; `Face forward` restores 0 |
| U5 movement feel + keyboard | Met | Met | Met | native scroll, ArrowDown walks, ←/→ prev/next, Enter/Esc |
| U6 desktop inspect: centred, card left no border, sketch right, tap toggles life | Met | Met | Met | 1440/1920/1024: cx = centre; alive 4 → −1; plaque runt at 1024 (P2-1) |
| U7 mobile peek-sheet | Met | Met | N/A | peek 95 → full 168 by drag/tap; painting recomposes; Back top-left |
| U8 true aspect per work | Met | Met | Met | last work 387×580 (0.667); grid tiles 1.78/1.5/0.67 |
| U9 hall-end threshold | Met | Met | Met | glow + doorway visible from the rail |
| U10 hygiene: insets, Skip top-left, chip copy, dots | Met | Met | Met | chip one line at all seven sizes; Skip top-left; ☰ lane empty |
| I1 CN monogram | Met | Met | Met | reads as interlocked C+N at 180; SVG is paths only |
| I2 icon set | Met | Met | Met | svg / 16 / 32 / 180 / 192 / 512 / real ICO / manifest all 200 |
| I3 head wiring | Met | Met | Met | svg + png + apple-touch + manifest + theme-color |
| I4 og.png | Met | Met | Met | 200, 125 KB |
| G1 rag: zero runts / clips | Met | **Not met** | Met | rag.md 0/0 on the page matrix, but the museum plaque at 1024×768 ends `NARRATIVE / I`, `/ II` on four titles (P2-1); 844×390 `Part / 2` |
| G2 no clipped letterforms | Met | Met | Met | J descenders intact; rag.md 0 clips |
| G3 contrast AA | Met | Met | Met | contrast.md 0 failures incl. pixel mode; a11y 0 violations |
| G4 tablet parity | Met | Met (see G1) | Met | 768 excellent; 1024×768 carries the plaque runt |
| G5 em-dash sweep | Met | Met | Met | text-node sweep: only script comments |
| G6 floating-UI grid | Met | Met | Met | states.md 0/133; my floating dumps show insets 20/40/56 |
| G7 motion tokens / reduced-motion parity | Met | Met | Met | rm pass clean on 4 routes × 2 sizes |
| G-L1 title/meta dashes | Met | Met | Met | `Charles Nalle Walking Memorial · Troy, NY` |
| G-L2 docs drift | N/A | N/A | N/A | |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` lands on `/bakery` |
| G-L4 sr-only dashes | Met | Met | Met | none found |
| G-L5 unrendered fields | N/A | N/A | N/A | |

### Instrument bars (from `docs/v7/qa/final/`)

| bar | result |
|---|---|
| axe zero serious/critical every route/state | Met — 0/0/0/0 across 51 runs (+4 paintings runs) |
| contrast incl. pixel mode exit 0 | Met — 0 failures (18 /people@768 unmeasured "never in view") |
| rag zero unauthored runts / ink clips / em dashes | Met on the instrument's matrix — 0/0/0 over 502 blocks; the museum approach state at 1024×768 is outside its matrix and carries runts (P2-1) |
| states zero collisions | Met — 0/133 |
| census one rhythm ladder | Met — 128 · 200 · 200 on all five chapters |
| frames clean | Met — 6/6 CLEAN at 390/1440, 4× CPU |
| perf | Met — home 97, chapters 98–99, people/about 99, /paintings 89–90, /map 64 (baseline exception) |
| a11y 100 | Met — 100 on every route |
| keyboard walk complete | Met — 2/21/16/37 stops, 0 without a ring; menu + dialog focus return |
| reduced-motion parity | Met — a11y.md 22/22 all text visible; my rm pass |
| live URL verified | Met — GH Pages 200, `last-modified` 2026-08-16 14:46 UTC, HEAD 29e69f4 |

## The one moment I would retell

The Museum — specifically on a 768 iPad in portrait: you scroll down a real hall (plank floor, coffered ceiling, gilt-lipped frames, a glow at the far end), tap the last dot, and the tall barbershop canvas rises to fill almost the whole screen with `Back to the hall` alone in the corner and the plaque as a little grab-sheet at the bottom; drag the sheet up and the painting steps back and up to make room; tap the painting and it starts to move.

## Cross-check against juror 7 (read only after my scores and lists were written)

- **J7 P1 — museum approach from the initial scroll opens cropped, `Back` off-screen, wheel captured (1440/1920/1024×768):** **fixed on 29e69f4.** From the page top without scrolling, clicking the visible painting at 1440, 1920, 1024×768, 768×1024 and 720×450 brings the sticky stage flush (scrollY = stage top: 407 / 432 / 341 / 377 / 296), composes the painting at the viewport centre and shows `Back to the hall` (1440: 76,580; 1024: 60,524; 768: 40,40; 720×450: 36,283); Back/Esc return to the rail (`mus-d1440-02-approach-from-top.png`, `x-paintings-d1920-approach-from-top.png`, `mus-t1024.json`, `mus-t768.json`, `mus-z200.json` → `approachFromTop`).
- **J7 P2-1 — desktop wheel over the map never scrolls the page:** **fixed.** Plain wheel over the canvas scrolls the page (300 → 600 at 1440 and 1024) with a house chip `HOLD ⌘ AND SCROLL TO ZOOM THE MAP`; ⌘/Ctrl+wheel zooms the map with the page at 0 (`map-d1440-02-wheel-1.png`, `map-d1440-03-ctrl-wheel.png`, `map-t1024.json`).
- **J7 P2-2 — phone map body captures the swipe; index only reachable from the bottom lane:** **not changed** on this build (my P3-10: body swipe pans, lane swipe scrolls 854). I rate it P3, not P2 — the on-map hint says `Drag to explore` and the chevron cue is present — so it does not affect my verdict.
- **J7 P3-1** (844×390 head) — still present (my P3-6). **P3-2** (1920 overview: label pill / hint chip / doors cramped) — still present in a milder form: the transient hint chip touches stop 4's pin at 1920 and 1440 (my P3-3). **P3-3** (1858 ghost pill lets a street label bleed through at 1440) — **fixed**: the pill has a solid dark backdrop (`map-d1440-01-overview.png`). **P3-4** (world-anchored labels under Stop/Continue mid-flight) — not observed overlapping in my shots; the `5 BARBERSHOP` pill does crowd `BACK TO MAP` at 1024×768 (my P3-3). **P3-5** (peeks 7–10 px) — **fixed**: 17/17 at 360, 20/19 at 390. **P3-6** (`Commissioner's` wider than its index column at 360/390) — **fixed**: ink right 287 < column 300 at 360, 302 < 330 at 390. **P3-7** (embed map flies in for 1–3 s, label clipped/absent at first) — still present (`bakery-p390-11-onward.png` 1.5 s after entry shows the map mid-flight without the pill). **P3-8** (1024×768 landscape works ~25% of the stage) — **fixed**: 442 px / 43% of the stage (`mus-t1024-08-approach.png`).

## VERDICT

**FAIL** — narrowly, and only on Sheet B: G1 is not met at the tablet class (museum plaque titles end in a lone `I` / `II` at 1024×768, P2-1), and a P2 walk-state race leaves a stop highlighted after `Back` and lets its pill float over the 1858 plate (P2-2). No P0/P1; every Sheet A axis is ≥ 8 at every class; every instrument bar is met. Both fixes are P2-class (a `nbsp` in the plaque title; a reset of the active stop / abort of the in-flight step on `Back`), so under the protocol they may land without restarting the two-pass count.
