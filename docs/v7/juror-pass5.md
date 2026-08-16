# v7 juror pass 5 — fresh-eyed visitor review of the LIVE build

Build under review: `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` at commit `9fd4401` (2026-08-16). Method: Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a time, phone contexts `hasTouch + isMobile` with CDP `Input.dispatchTouchEvent` for drags/taps, viewports 390×844 · 360×800 · 768×1024 · 1024×768 · 1440×900 · 1920×1080 (+ 720×450 for 200 % zoom), reduced-motion contexts at 390 and 1440, CDP screencast at 4× CPU for the curtain. No source was read before scoring. Scripts: `scripts/juror5-*.mjs`; evidence (PNGs gitignored): `docs/v7/qa/juror-pass5/`.

## Sheet A — Awwwards axes (0–10)

| class | design | usability | creativity | content | justification |
|---|---|---|---|---|---|
| **phone** (390×844, 360×800) | **8** | **9** | **9** | **9** | The home shows the whole head above the eyebrow with the CTA pinned to the bottom; chapters read like a printed book (drop cap, cream moral prose, archival chip, pause always on screen, `Continue` the one primary); the walk pauses on drag with `Continue`, the lens opens large on the lower panel; the museum's peek-sheet, portrait canvas and 360° look all answer touch. Design loses to the museum's wayfinding chip, which stacks `SCROLL / TO / WALK` in three lines inside a squashed dark blob for the whole hall walk at 390 and 360 (P1-1). |
| **tablet** (768×1024, 1024×768) | **8** | **9** | **9** | **9** | Map, walk, lens (huge and crisp at 768), chapters, People 2-col and About are clean; the museum chip is one line right of `Skip the hall` at both sizes and the portrait work now clears the dot rail. Design loses a point for the chapter footer at 768×1024, where the first nav link wraps to two lines and its arrow floats detached to the right (P2-1). |
| **desktop** (1440×900, 1920×1080) | **9** | **9** | **9** | **9** | Everything at the bar: three-line description under a full head, chapters with spine + drop cap, walk/lens/curtain flawless, museum approach a true triptych (card left · painting centred · study right), footer three columns with the pill clear of the disclaimer. Only P3 nits (card eyebrow wrap, transient hint pill over a stop leader). |

Bar: ≥ 8 on every axis at every class and zero P0/P1 — **not met** (one P1).

## Defects

### P0 — none.

### P1

1. **`/paintings` · 390×844 and 360×800 (phone portrait, every rail-mode moment incl. first paint of the hall and the hall end) — the museum wayfinding chip wraps into three stacked lines.** The phone-tier copy `Scroll to walk` is boxed at 58×47 px inside a 66×65 (390) / 36×65 (360) container between `Skip ↓` (20–122) and the ☰ lane, so it renders as `SCROLL / TO / WALK` in a misshapen dark blob; when looked away it becomes the (correctly one-line) `Face forward` button and after `Face forward` it stacks again. It never collides with `Skip` or the ☰ (which is why `states.mjs` is silent), but it reads as a broken label at the top of the marquee page for the entire hall. Regressed by the juror-4 fix (chip moved into the free lane right of `Skip` below `lg`); at 768/1024/1440/1920/720×450 the chip is one line and clean. Evidence: `docs/v7/qa/juror-pass5/mus-p390-01-rest.png`, `mus-p390-02-rail-mid.png`, `mus-p390-13-hall-end.png`, `mus-p360-02-rail-mid-top.png`; numbers in `museum-p390.json` / `museum-p360.json` (`restLanes.chip`, `railMid.chip`). Repro: open `/paintings` at 390×844, look at the top row; scroll into the hall.

### P2

1. **Chapter footer · 768×1024 — first nav link wraps with a detached arrow.** On chapters (where the `Share` button takes the third column) the nav column narrows and `THE PEOPLE OF THIS DAY →` breaks to `THE PEOPLE OF / THIS DAY` with the arrow floating far right of both lines; the other three links are one line with hugging arrows. `/map` at 768 (no Share) is one line. `rag.mjs` is silent (two words on the last line is not a runt). Evidence: `ch-barbershop-t768-05-foot.png`, compare `map-t768-03-indexfoot-crop.png`. Repro: any chapter at 768×1024, scroll to the footer.

### P3

1. **Museum approach card eyebrow rag (desktop / 200 % zoom):** at 1440 the card reads `MARK PRIEST · NALLE / SERIES · SPOT 03` (institution split); at 720×450 `MARK / PRIEST · NALLE / SERIES · SPOT 03` with `MARK` alone. Evidence: `mus-d1440-06-approach.png`, `mus-z720-06-approach.png`.
2. **Map overview transient hint over a stop:** for the first seconds `DRAG TO EXPLORE · TAP A STOP` sits on stop 4's chip at 390 and on the Ferry Landing leader at 1440; gone by 12 s. Evidence: `map-p390-01-overview.png`, `map-d1440-01-overview.png`, `map-p390-20-overview-12s-cropbottom.png`.
3. **Lens caption on phones** wraps `TROY, NEW YORK · 1858 ·` / `LIBRARY OF CONGRESS` — dangling separator (same shape as People's `BARBER · / UNDERGROUND RAILROAD` at 390/768). Evidence: `map-p390-24-lens.png`, `pg-people-p390-cards.png`, `spot-people-cards-t768.png`.
4. **History list nbsp holes at 390:** gluing the last two words leaves `roles in the` / `Underground Railroad.` and `is where Charles Nalle` / `was arrested.` — short penultimate lines. Evidence: `full-bakery-p390-crop3300.png`.
5. **Commissioner's Office · 390 — Pt 1's fixed mini pill transits Pt 2's in-flow slider row** while scrolling Pt 2's player through the bottom of the screen (no control blocked; the play button sits above it). Evidence: `co-p390-02-pt2-player.png`.
6. **Museum keyboard edge case:** if a visitor Tabs past the hall into the 2-D grid (page scrolled to the grid), then Shift+Tabs back to a dot and presses Enter, the state goes to `approach` but the viewport stays on the grid and Esc (focus in the grid) does nothing until they scroll up. The natural path (Tab → dot → Enter → arrows → Tab to the painting button → Enter toggles alive → Esc → arrows look → ArrowDown walks) is complete. Evidence: `kb-d1440-02-enter.png`, `kb-d1440.json`, `kb2-d1440.json`.
7. **Now-playing title truncation** at 390 (`Commissioner's Office ·…`) — cosmetic. Evidence: `co2-p390-02-after-click2.png`.

## Sheet B — Wil's ledger (Part A), verified as a visitor

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| G1 rag / orphans / widows | Met | Met | Met | Instrument 0 runts; visually clean; P3-3/P3-4 nits only. |
| G2 no clipped letterforms | Met | Met | Met | Barbershop `FOR JUSTICE` and ch2 `INJUSTICE` J descenders intact (`spot-barber-moral-p390.png`). |
| G3 contrast AA | Met | Met | Met | Instrument 0 failures incl. pixel mode; moral body cream, archival chip, disclaimer solid. |
| G4 tablet parity | Met | **Not met** | Met | Chapter footer nav wrap at 768×1024 (P2-1); everything else parity. |
| G5 em-dash sweep | Met | Met | Met | 0 visible em dashes on any route (sweep + rag). |
| G6 floating-UI grid | Met | Met | Met | 0 collisions in my states; P3-5 transient transit only. |
| G7 motion tokens / reduced motion | Met | Met | Met | Reduced motion: all text visible, museum → grid, walk instant. |
| H1 head above the eyebrow | Met | Met | Met | Full head with headroom at 390/360/768/1024/1440/1920 (`home-*.png`). |
| H2 description 3 lines desktop | Met | Met | Met | 3 lines at 1440/1920, 4 at 1024, 5 at 390/360; no orphan. |
| H3 `Walk the story` | Met | Met | Met | |
| H4 mobile CTA bottom-aligned | Met | N/A | N/A | 48 px, bottom margin = side inset (26 px at 390). |
| H5 description contrast | Met | Met | Met | Cream 16 px on the film; instrument pass. |
| H6 entry choreography | Met | Met | Met | CTA landed within the first screenshot (~1.8 s); reduced motion shows all. |
| X1 curtain jitter/flash | Met | Met | Met | Screencast at 4× CPU: page A → curtain → hold → one continuous wipe; no uncovered page-B frame (`curtain-map-card-p390-sheet.png`, `curtain-continue-d1440-sheet.png`). |
| M1 geolocate removed | Met | Met | Met | |
| M2 overview pitch / all five visible | Met | Met | Met | Five stops in view at 390/360/768/1024/1440/1920; pitch 52 on ≥1024 (walk.md). |
| M3 `Stop the walk` top-right | Met | Met | Met | (200,20)@390 · (1214,56)@1440. |
| M4 drag pauses → `Continue`, `Walk again` | Met | Met | Met | Flick advances 1 card and pauses; nudge returns; stays paused 5 s; `Continue` resumes; `Walk again from the first spot` after stop 5. |
| M5 carousel feel | Met | Met | Met | ±1 card per release, expo settle, no yank; map follows on settle. |
| M6 two-line card titles | Met | Met | Met | Bakery/CO two lines everywhere; nothing crosses the arrow. |
| M7 `Back to map` equal inset | Met | Met | Met | (56,56)@1440, (20,20)@390. |
| M8 mobile overview row | Met | N/A | N/A | (i) left · `Take the walk` centred · ☰ right on one axis; `See Troy in 1858` pill top-right. |
| M9 mobile walk cards | Met | Met | N/A | Opaque cards, ≥16 px peeks, `Back`, ☰ hidden while focused on phones, strip clears the (i). |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing | Met | Met | Met | |
| M12 map quiet under the curtain | Met | Met | Met | Clean screencast from the card. |
| M13 map copy block | Met | Met | Met | `FIVE SPOTS / THROUGH TROY`, `2.5 miles · about 45 minutes`, `Spot 01`. |
| L1 lens reframed to the lower panel | Met | Met | Met | Opens on downtown Troy + Hudson + West Troy; `0`/reset returns there. |
| L2 bigger viewer | Met | Met | Met | 72 % of the viewport at 390, 74 % at 1920, 69 % at 1440 (spec said ≥ 80 % desktop — the rest is the caption + `Back to today` band; visually near-full-bleed). |
| L3 lens copy/controls | Met | Met | Met | Only `Back to today`; date chip hidden; caption one line ≥768, two lines with a dangling `·` at 390 (P3-3). |
| L4 interaction | Met | Met | Met | Pan, wheel, `+ − ⟲`, `0` reset verified. |
| C1 drop cap | Met | Met | Met | All six openings, Libre Caslon Display, 3 lines desktop / 3 phone. |
| C2 moral contrast + parallax | Met | Met | Met | Body = heading `rgb(246,243,238)` on all five (both ch2 morals); bg transform moves with scroll. |
| C3 study centred | Met | Met | Met | Study/caption centres equal on all five at 1440 (`sweep-d1440.json`). |
| C4 archival credit chip, no parallax | Met | Met | Met | `ARCHIVAL RECORD` chip on the photo (bakery, barbershop shots). |
| C5 Where-to-next declutter | Met | Met | Met | Shadowed map, quiet pill, centred CTAs, `Continue` the one orange, mini collapses. |
| C6 rhythm | Met | Met | Met | Same ladder on the five (census); moral→Onward no longer a dead screen. |
| C7 burger scroll-hide + hero focus | Met | Met | Met | Hides on scroll-down, returns on scroll-up on chapters/map/paintings; bakery face clear of the ☰ at 390. |
| C8 barbershop | Met | Met | Met | Focus 44 %, T→I→T→I→T, chip, J, centred study. |
| C9 chapter 2 order + two players | Met | Met | Met | hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; one mini at a time; tap-to-seek on both. |
| C10 footer mini lane | Met | Met | Met | Nothing covered at 390/768/1440 with the pill latched. |
| C11 chapter UI em dashes | Met | Met | Met | `Next · Spot 02`, `5 State Street · Mutual Bank Building`. |
| C12 latent (mansion subtitle etc.) | N/A | N/A | N/A | Only Kathy's prose says "Mansion"; UI says Home. |
| F1 footer redesign | Met | **Not met** | Met | Wordmark one line, nav list, Share, disclaimer no runt — but the 768 chapter nav wrap (P2-1). |
| N1 X spins on close | Met | Met | Met | Close icon rotates 0→90° over ~36 frames, then closes. |
| N2 scroll-hide/show | Met | Met | Met | |
| N3 arrow tail | Met | Met | Met | Unchanged. |
| P1 no spot links | Met | Met | Met | |
| P2 People closer copy | Met | Met | Met | `Their story lives on` · `Stand where they stood` · `Walk the story`. |
| P3 People em dashes | Met | Met | Met | |
| P4 People H1 rag | Met | Met | Met | `ONE DAY. A WHOLE / CITY'S CAST.` at 1440; three lines at 390/1024. |
| P5 People grid | Met | Met | Met | 2-col at 768 reads well. |
| A1 About afterword section | Met | Met | Met | `(06) Afterword` quote · `(07) Onward`. |
| A2 About closer copy | Met | Met | Met | `Two and a half miles. One day in 1860.` |
| A3 About em dash | Met | Met | Met | |
| A4 latent | N/A | N/A | N/A | |
| U1 rail pitch down | Met | Met | Met | −0.08 / −0.10 rad, floor visible. |
| U2 paintings closer, end visible | Met | Met | Met | Spacing 5; end wall + glow visible from the entrance. |
| U3 finished environment | Met | Met | Met | Moulded gilt frames, plank floor, cornice/baseboard, coffers, plaster. |
| U4 360° look | Met | Met | Met | Yaw −1.48 reached by drag; `Face forward` restores. |
| U5 movement feel + keyboard | Met | Met | Met | Native scroll; ArrowDown walks, ←/→ look, Enter approach, Esc back. |
| U6 inspect desktop | N/A | Met | Met | Painting centred (50/50), card left no border, study right, one button, tap toggles alive. |
| U7 inspect mobile | Met | Met | N/A | Peek sheet drags to full and back, painting recomposes, `Back to the hall` top-left, tap = alive. |
| U8 true aspect | Met | Met | Met | Portrait work 0.67 tall and narrow; grid tiles 1.78/1.5/0.67. |
| U9 end of hall | Met | Met | Met | Doorway + glow at the end. |
| U10 hygiene (insets, Skip top-left, chip tiers) | **Not met** | Met | Met | Phone chip stacks three lines (P1-1); 768/1024/1440/1920/720×450 clean. |
| I1 CN monogram | Met | Met | Met | Caslon C+N paths, two-tone, reads at 16 px. |
| I2 icon set | Met | Met | Met | svg/16/32/ico(3 sizes)/apple-touch/192/512/manifest all 200. |
| I3 head wiring | Met | Met | Met | icon svg + png + shortcut + apple-touch + manifest, base-path correct. |
| I4 og.png | Met | Met | Met | 200, 125 KB. |
| G-L1 title `·` | Met | Met | Met | |
| G-L2 docs drift | N/A | N/A | N/A | |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → `/bakery`. |
| G-L4 sr-only dashes | N/A | N/A | N/A | Not visible. |
| G-L5 unrendered fields | N/A | N/A | N/A | |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | reading |
|---|---|
| axe zero serious/critical every route/state | Met — 0/0/0/0 across 51 runs (+4 paintings). |
| contrast incl. pixel mode exit 0 | Met — 0 failures at 390/768/1440 (18 People rows unmeasured "never in view" — noted). |
| rag zero runts / clips / em dashes | Met — 0/0/0 over 502 blocks. |
| states zero collisions | Met (127 states, 0) — but the phone chip wrap (P1-1) is a rendering defect the collision set cannot see. |
| census one rhythm ladder | Met — 128·200·200 on all five (ch2 with its interleaved 0·128·128). |
| frames clean | Met — 6/6 CLEAN; my own screencasts agree. |
| perf | Met — home 97 · chapters 98–99 · people/about 99 · paintings 89–90 · map 64 (≥ 63). |
| a11y 100 | Met. |
| keyboard walk complete | Met (natural path); P3-6 edge case. |
| reduced-motion parity | Met — verified at 390/1440 on `/`, `/ferry`, `/map`, `/paintings`. |
| live URL verified | Met — HEAD `9fd4401`, all routes 200, 0 console errors on every page except the expected 404 resource on `/404`. |

## The one moment I'd retell

Tapping the last dot in the museum on a phone: the camera slides down the hall, turns, and the tall Sheriff's Office canvas hangs in front of you at its true portrait proportion inside a gilt moulded frame, the dot rail sitting quietly under it and a peek-sheet whispering `Mark Priest · Nalle Series · Spot 05`; drag the sheet up and Christianson's quote appears while the painting lifts to make room. The Museum is still the moment.

## VERDICT

**FAIL** — one P1 (the phone-portrait museum chip stacking `SCROLL / TO / WALK` at 390 and 360, a regression from the juror-4 fix) with tablet/desktop otherwise at or above the bar; Sheet B all Met/N-A except U10 (phone), G4/F1 (tablet footer nav wrap, P2-1). Fix P1-1 (give the phone chip its natural width, e.g. `white-space: nowrap` in the free lane or a shorter tier), land P2-1 in the same pass, and re-run.

## Cross-check of juror 4's P1/P2 items (read only after the scores above were written)

| juror-4 item | status on 9fd4401 | evidence |
|---|---|---|
| J4-P1-1 museum rail chip under `Skip the hall` at 768×1024 and 720×450 | **Fixed at 768/720 — regressed at phones.** 768: chip `Scroll to walk · tap a painting` at 307–570 vs pill 40–226 (81 px clear); 720×450: chip 283–546 vs pill 20–206. But the same change boxes the 390/360 chip to 58 px wide so `Scroll to walk` stacks three lines → this pass's P1-1. | `mus-t768-02-rail-mid.png`, `mus-z720-02-rail-mid.png`, `mus-p390-02-rail-mid.png`, `museum-*.json` `restLanes` |
| J4-P2-1 walk/focus from a scrolled page leaves controls off-screen | **Fixed** — scroll 140 px, `Take the walk` → `scrollY` 0 within 2.6 s at 390 and 1440; `Back` / `Stop the walk` in view. | `map-p390-05-walk-start.png`, `map-p390.json` / `map-d1440.json` `afterWalk.scrollY` |
| J4-P2-2 768 portrait work under the dot rail / grazing the ☰ | **Fixed** — `paintingRect(9)` 122–646 × 88–873, dots at 891, sheet at 928, ☰ at 658+ (canvas ends 646). | `mus-t768-11-last.png`, `museum-t768.json` `last.controls` |
| J4-P2-3 1440 footer pill kisses the disclaimer | **Fixed** — pill at 782–844 sits below the disclaimer's second line box (~771); visible clearance. | `ch-bakery-d1440-05-foot.png` |
