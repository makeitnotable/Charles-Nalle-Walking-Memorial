# Juror pass 10 — fresh-eyed visitor review of the LIVE build (`f1dbbb3`)

Reviewed 2026-08-16 against `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` (verified: `origin/v2` = local HEAD = `f1dbbb3`; GH Pages `last-modified 17:34:50Z`, one minute after the commit; the live `Base.astro…EKz95t6P.js` hash matches `dist/`). Headless Chromium 1.62 via Playwright (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a time, phone contexts with `hasTouch`/`isMobile` and CDP touch events. Source code was not read before scoring; only the protocol, the ledger and the instrument summaries in `docs/v7/qa/final/`. Evidence: `docs/v7/qa/juror-pass10/` (PNG/JPG, gitignored) produced by `scripts/juror10-*.mjs`.

Viewports: phone 390×844 + 360×800 · tablet 768×1024 + 1024×768 · desktop 1440×900 + 1920×1080 · plus 720×450 (200 % zoom) and reduced-motion contexts at 390 and 1440.

Note: at the time of writing the local working tree carries uncommitted edits (`src/components/Museum.tsx`, `src/components/TroyMap.tsx`, `src/pages/people.astro`, `docs/RUN-STATE.md`, `docs/v7/REVIEW-GUIDE.md`); they were not read and are not part of the build reviewed — everything below is the live `f1dbbb3`.

---

## Sheet A — Awwwards axes

| axis | phone (390 / 360) | tablet (768 / 1024×768) | desktop (1440 / 1920) |
|---|---|---|---|
| Design | **9** | **8** | **9** |
| Usability | **9** | **9** | **9** |
| Creativity | **9** | **9** | **10** |
| Content | **9** | **9** | **9** |

**Phone.** Home puts Charles's whole head above the eyebrow line at both widths, the CTA is pinned to the frame's bottom, and every chapter reads as one continuous object: hero → drop-capped story with tap-to-seek → chip-labelled archival photo → history → moral (body cream like its heading, parallax on the sketch ground) → Onward with one orange. The map's overview holds all five stops, walk mode is Back / Stop-the-walk / centred card with both neighbours peeking, and the museum's peek-sheet + tall final portrait land cleanly; the only phone nits are transient (Onward map takes ~2 s to fly to its pin; the map hint chip brushes stop 4).

**Tablet.** Same system, faithfully carried; 768 portrait is close to flawless (footer + latched mini-player clean, two-part People roles wrap at the separator, walk mode identical to desktop). Marked down one on design for two craft slips a designer would catch: the People role "Chief civil-rights attorney" runs 7 px (768) / 21 px (1024) past its column rule, and the museum plaque at 1024×768 sets long titles one word per line (works 6/7/9) with the eyebrow on three lines.

**Desktop.** The Museum hall (plank floor, coffered ceiling, gilt frames, sketch hung beside each primary work, end glow), the pitched map with a smooth expo-out card strip and a Louvre-plate 1858 lens are award-grade; curtain transitions are frame-clean at 4× CPU throttle. Design loses one point for the "Drag to explore · tap a stop" hint chip sitting on top of the Ferry Landing pill for ~3 s after the overview settles at 1440/1920.

---

## P0 — none.

## P1 — none.

## P2

1. **`/map` overview · 1440×900 and 1920×1080 · hint chip collides with stop 4.** After the prologue camera settles (~3 s) the transient "DRAG TO EXPLORE · TAP A STOP" chip sits over the bottom-right of the "4 FERRY LANDING" pill and hides half of its pin dot until the chip fades (~6 s after load). Evidence `juror-pass10/zoom-map-hint-d1440.png`, `zoom-map-hint-d1920.png`, `map-overview-d1440.png`; probe `scripts/juror10-hint.mjs` (`overlaps:true` at 3 s and 5 s, chip gone by 8 s). Repro: open `/map` at 1440×900, wait 3–6 s. Not present at 768/1024/390 (chip is clear there).
2. **`/people` · 768×1024 and 1024×768 · single-segment role label overruns its column.** "CHIEF CIVIL-RIGHTS ATTORNEY" (Martin I. Townsend) is set as one unbreakable segment; at 768 it ends at x=735 vs the column/rule edge 728 (7 px), at 1024×768 at x=1005 vs 984 (21 px, i.e. into the page's right gutter). Every other role and every note stays inside its column at every class; phones and desktop are clean. Evidence `people-cards-t1024.png`, `people-cards-t768.png`; measurement in `scripts/juror10-pages.mjs` output (`over:true` only for that role at 768/1024). Repro: `/people` at 1024×768, second row, right card.

## P3

1. `/paintings` approach · 1024×768 (and 720×450) · plaque card is narrow (~210 px): eyebrow becomes three lines ("MARK PRIEST / NALLE SERIES / SPOT 04", the middle dot vanishes at the wrap) and long titles set one word per line — "WASHINGTON / STREET / FERRY / LANDING / NARRATIVE I" (works 6/7/9); readable, but clunky. `museum-plaque-w6-t1024.png`, `museum-plaque-w7-t1024.png`, `museum-plaque-w9-t1024.png`.
2. `/paintings` approach · desktop · if the ☰ has already retreated (rail scrolled > 240 px) it stays hidden for the whole inspect state; wheel is (correctly) locked in approach, so the corner menu is only reachable after Esc/Back + a small scroll up. From a page-top click it is present. `museum-approach-d1440.png` (no ☰) vs `museum-approach-fromtop-d1440.png` (☰ present); `scripts/juror10-burger.mjs`.
3. Chapter Onward · phone · the embedded map needs ~2 s after the section enters view to fly to the next-spot pin; a 1.5 s screenshot shows the map without the pill. `bakery-onward-p390.png` (early) vs `bakery-onward-p360.png` (settled).
4. `/map` overview · 390 · the hint chip's left end touches the "4" chip's bottom (no text overlap; ~4 s). `zoom-map-hint-p390.png`.
5. `/map` desktop wheel notice · 1440 · "HOLD ⌘ AND SCROLL TO ZOOM THE MAP" is centred on the map's centre, so when the map is half-scrolled it lands beside the "1 BAKERY" pill and above "3 GILBERT HOME" (adjacent, not overlapping). `map-wheel-d1440.png`.
6. Museum peek-sheet · phone · the "Expand the plaque" handle is a `role=button` DIV (works with touch and keyboard); the full sheet is content-sized (~170 px), fine for the short quotes but leaves no room if a longer quote were authored. `sheet-full-p390.png`.
7. Chapter story · desktop · the cream story section runs its 62-ch measure on the left with the right half of the page empty (editorial choice carried from v6; not a defect, but the one place a 1440 reader feels the page is half-used). `bakery-tapped-d1440.png`.
8. Chapter · 390 · if the listener scrolls back to the very top while audio plays, the mini-player pill (bottom-left) sits over the third line of the hero H1 ("BAKERY"). `bakery-mini-top-p390.png`.
9. `/map` 1858 lens · desktop · the viewer is full-width within the inset but 1328×672 ≈ 69 % of the 1440×900 viewport (the ledger's L2 wording says ≥ 80 %); the caption + Back-to-today band takes the rest. Reads as near-full-bleed; noted for the record. `map-lens-d1440.png`.

---

## What was actually done (visitor walk)

- **Home** at all six sizes: head + headroom above "TROY, NEW YORK · APRIL 27, 1860" everywhere (`home-*.png`); description 3 lines at 1440/1920, 5/6 at 390/360, colour `#f6f3ee`; CTA "Walk the story" 48 px, bottom-pinned on phones. No horizontal overflow (body scrollWidth = innerWidth, zero offenders).
- **QR arrival** `/bakery`, `/barbershop` at all six: hero, chip, faces clear of ☰ (`bakery-arrive-*.png`, `barbershop-arrive-*.png`).
- **Read a chapter** (`/bakery`, all six): play → audio starts (t=2.3 s), tap 4th paragraph → seek to 49.66 s + highlight; scroll down and back to the top: a `Pause narration` control is on screen at every position (mini-player bottom-left, 44 px, collapses to a glyph pill at Onward/footer); moral heading and body both `rgb(246,243,238)`; Onward has one solid orange (Continue), map pill quiet; footer + latched mini-player: nothing covered at 390/360/768/1024/1440/1920; Continue → curtain → `/commissioners-office`.
- **`/commissioners-office`**: order hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; two players; play Part 2, scroll up into Part 1 → the Part 2 mini-player ("SPOT 02 · PT 2") stays on screen; pressing Part 1 pauses Part 2 and only one mini shows.
- **`/people`** all six: notes and roles inside the viewport everywhere; inside the column everywhere except P2-2; two-part roles ("Industrialist · Charles's employer", "Barber · Underground Railroad") wrap at the separator into two clean lines on phones and 768; H1 reads ONE DAY. A WHOLE / CITY'S CAST. at 1440/1920 and three lines below.
- **`/map`**: overview shows all five stops at 390 and 360 (`map-overview-p390.png`); desktop wheel over the map scrolls the page (0→400) and shows the ⌘ notice; ⌘/Ctrl+wheel zooms (`map-ctrlwheel-d1440.png`); the spot index below the map keeps every title on one line at every class; scroll 220 px then Take the walk → page returns to 0 and Back/Stop-the-walk are in view; the active stop's label pill sits clear of the card strip at every class; a 160 px touch drag mid-walk → `Continue the walk` immediately, strip settles monotonically (expo-out, no reversal, screencast `dragflash-p390-contact.jpg`), stays paused 4.5 s; a fast flick moves exactly one card, a 20 px nudge returns to the same card (`scripts/juror10-flick.mjs`); Continue → `Stop the walk` and cycling resumes; Back after 3.5 s → overview with no stop lit; both neighbours peek ~16–20 px at 360/390.
- **1858 lens**: opens on the lower panel (Green Island · Hudson · West Troy · Troy) filling a near-full-bleed viewer at every class; caption one line on desktop, two on phones; only +/−/reset inside the viewer and Back to today under it; nothing floats over the plate; Back to today returns to the overview.
- **Museum** at 390/360/768/1024×768/1440/1920/720×450: chip one line at every class and clear of Skip and ☰; page-top click on the visible painting (desktop, 1024×768, 768, 720) scrolls the stage into frame, enters approach with Back to the hall visible, ☰ present, Back exits, no focus ring after the mouse click; rail scroll, drag-look → Face forward, click → approach centred (x 0.500, y 0.45–0.50), card left / study right on the five primary works; tap → alive (`alive:i`), tap → rest; last work hangs at aspect 0.667, frame clear of Back/☰/dots at every class; phone peek-sheet drag up/down/tap, Back reachable, tap-to-life with the sheet full; Esc; keyboard Tab → dot rail with a visible ring, Enter approaches, → moves to the next work, Esc returns and focus lands on a dot; Skip the hall → grid, tile aspects `1.78/1.5/0.67`.
- **Menu** open/close on chapters, `/people`, `/about`, `/map`, `/paintings` at 390 and 1440; the X rotates on close; ☰ hides after scrolling down and returns on a 60–100 px scroll up on every page incl. `/map` and `/paintings`.
- **Favicon set**: `/favicon.svg` 200 (paths, 1.5 KB), `/favicon.ico` 200 (`image/vnd.microsoft.icon`, 15 KB multi-size), `/apple-touch-icon.png` 200, `/site.webmanifest` 200 (relative `start_url ./`, 192/512/svg icons), `/favicon-32.png`, `/icon-192.png`, `/icon-512.png`, `/og.png` 200; `<head>` carries svg + 32/16 png + shortcut ico + apple-touch-icon + manifest under the base path.
- **Transitions** (4× CPU): Continue and menu-link screencasts show page A → curtain rises with date + label → hold → single continuous reveal; no uncovered page-B frame (`frames-continue-d1440-contact.jpg`, `frames-*` folders).
- **Reduced motion** at 390 and 1440 on `/`, `/bakery`, `/map`, `/paintings`: no invisible text blocks; `/paintings` renders the 2-D grid, no canvas.
- **200 % zoom (720×450)**: `/people`, `/about`, `/paintings` no horizontal overflow; museum approach still fits (small painting, card, Back, dots).
- **Console**: zero errors/warnings on every route and state visited except the expected 404 resource on `/404`. `/bakery/` (trailing slash) redirects to `/bakery`.

---

## Sheet B — the ledger

Legend: **Met** / **Not met** / **N/A** (not visitor-verifiable or not applicable at that class). Phone = 390+360, Tablet = 768+1024×768, Desktop = 1440+1920.

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| G1 rag / orphans / widows | Met | Met | Met | rag.md 0 runts / 0 two-word display runts over 99 passes; visually clean everywhere I looked; People H1 and footer wordmark as specified |
| G2 no clipped letterforms | Met | Met | Met | barbershop "FOR JUSTICE" J descender intact at 360/390/1440 (`barbershop-moral-p360.png`); rag.md 0 clips |
| G3 contrast AA | Met | Met | Met | contrast.md 0 failures (style + pixel); moral body cream, interlude credit on a dark chip, home description `#f6f3ee`; note 18 /people@768 rows "never in view" in the pixel run |
| G4 tablet parity | Met | Met | Met | 768 and 1024×768 walked end to end; the two tablet slips are P2-2 / P3-1, not gaps in behaviour |
| G5 em-dash sweep | Met | Met | Met | zero visible em dashes on every route (`innerText` scan); titles use `·` |
| G6 floating-UI grid | Met | Met | Met | states.md 133 states / 0 collisions; my only collision is the transient hint chip (P2-1) |
| G7 motion tokens | N/A | N/A | N/A | code-level; visible motion is consistent and reduced-motion is complete |
| H1 whole head visible | Met | Met | Met | all six sizes + headroom (`home-*.png`) |
| H2 description 3 lines desktop, balanced phone | Met | Met | Met | 3 at 1440/1920, 4 at tablets, 5/6 at phones, no orphan |
| H3 CTA `Walk the story` | Met | Met | Met | |
| H4 mobile CTA bottom-aligned | Met | N/A | N/A | 390: 770–818, 360: 726–774, full width within the inset, 48 px |
| H5 description contrast | Met | Met | Met | `#f6f3ee` on the film; contrast.md pixel pass |
| H6 entry choreography | Met | Met | Met | CTA present at 1.8 s; reduced motion shows everything |
| X1 curtain jitter/flash | Met | Met | Met | frames.md CLEAN ×6; my 4× screencasts (Continue, menu link) clean |
| M1 geolocate removed | Met | Met | Met | no locate control at any class |
| M2 overview pitch / all five visible | Met | Met | Met | walk.md pitch 48–52; five stops in view at 360/390 (`map-overview-p3*.png`) |
| M3 Stop the walk top-right | Met | Met | Met | `@200,20` (390) · `@558,40` (768) · `@1214,56` (1440) |
| M4 drag pauses, Continue resumes | Met | Met | Met | Continue at once after a drag; stays paused; Continue → cycling |
| M5 carousel smoothing | Met | Met | Met | expo-out settle, no reversal, ±1 card on flick, nudge returns |
| M6 card titles two lines | Met | Met | Met | Holeur's / Fashionable Bakery, Commissioner's / Office; nothing crosses the arrow |
| M7 Back to map equal inset | Met | Met | Met | `@20,20` / `@40,40` / `@56,56` |
| M8 mobile overview layout | Met | N/A | N/A | (i) left, Take the walk centred, ☰ bottom-right on one axis; 1858 pill top-right |
| M9 mobile walk cards | Met | N/A | N/A | opaque, scaled 0.92→0.99, peeks both sides, `Back`, ☰ hidden while focused |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing | Met | N/A | N/A | balanced 12 px gaps |
| M12 map quiet under curtain | Met | Met | Met | frames clean; card→chapter transition smooth |
| M13 map copy block | Met | Met | Met | "2.5 miles · about 45 minutes on foot"; no em dashes; `Spot 01` |
| L1 lens reframe to lower panel | Met | Met | Met | opens on Green Island–Hudson–West Troy–Troy; reset returns there |
| L2 bigger viewer | Met | Met | Met | 350×675 at 390, 1328×672 at 1440 — full width within `--ui-inset`; ≈ 69 % of the viewport area (the ledger's "≥ 80 %" is not literally reached because the caption + Back-to-today band takes the rest — my P3-9; the reframed lower panel is street-legible) |
| L3 lens copy/controls | Met | Met | Met | only Back to today; caption 2 lines phone / 1 line desktop |
| L4 interaction | Met | Met | Met | +/−/reset present; drag/pinch/wheel per caption; keyboard per a11y walk |
| C1 drop cap | Met | Met | Met | `initial-letter: 3`, Caslon Display, on all openings incl. both ch2 parts; highlight + tap-to-seek intact |
| C2 moral contrast + parallax | Met | Met | Met | body = heading colour; sketch ground moves on scroll; reduced motion static |
| C3 study centred | Met | Met | Met | sketch vertically centred with its text block (`bakery-moral-d1440.png`) |
| C4 interlude credit chip | Met | Met | Met | dark chip `rgba(29,20,17,.84)`, one line, all five chapters (`interlude-*.png`) |
| C5 Where-to-next declutter | Met | Met | Met | shadowed embed, quiet pin pill, CTAs centred under the map, mini-player collapses — one orange |
| C6 rhythm | Met | Met | Met | census: identical ladder on all five (`128 · 200 · 200`, CO adds its Part-2 block); heading→quote close (`ferry-heading-quote-d1440.png`) |
| C7 ☰ scroll-hide + hero focus | Met | Met | Met | hides after down-scroll, returns on up, on every page; bakery/barbershop faces clear of ☰ |
| C8 barbershop | Met | Met | Met | faces framed; story T→I→T→I→T; chip credit; J intact; study centred |
| C9 chapter 2 reorder | Met | Met | Met | id order as specified; spine numerals follow; two players; one mini at a time |
| C10 chapter footer lane | Met | Met | Met | footer + latched/collapsed mini: nothing covered at any class |
| C11 chapter UI em dashes | Met | Met | Met | `NEXT · SPOT 02`, `5 State Street · Mutual Bank Building`, attribution alone |
| C12 latent (subtitle, dead exports) | Met | Met | Met | player subtitle reads "Uri Gilbert Home"; code items N/A |
| F1 footer | Met | Met | Met | wordmark one line, Made by Notable, arrow nav, Share, disclaimer no runt (`bakery-footer-*.png`) |
| N1 X spins on close | Met | Met | Met | rotation sampled on every page |
| N2 scroll-hide/show | Met | Met | Met | incl. `/map` and `/paintings` |
| N3 arrow tail unchanged | Met | Met | Met | |
| P1 spot links removed | Met | Met | Met | monogram + role + name + note only |
| P2 closer copy | Met | Met | Met | Their story lives on · Stand where they stood · Walk the story |
| P3 people em dashes | Met | Met | Met | none visible |
| P4 H1 rag | Met | Met | Met | ONE DAY. A WHOLE / CITY'S CAST. at ≥1024; three lines below; CAST. never alone |
| P5 grid at 768–1023 | Met | Met | Met | 2-col cards read well; the one label overrun is P2-2 |
| A1 afterword spacing/numbering | Met | Met | Met | (06) Afterword quote, (07) Onward, `.sec` gap |
| A2 About closer copy | Met | Met | Met | The streets are waiting · Two and a half miles. One day in 1860. · Walk the story |
| A3 About em dash | Met | Met | Met | attribution stands alone |
| A4 latent kicker/portraits | N/A | N/A | N/A | code-level |
| U1 rail pitch down | Met | Met | Met | pitch −0.08/−0.10, floor visible |
| U2 paintings closer / end visible | Met | Met | Met | spacing 5, far 80, end glow visible from the entrance |
| U3 finish | Met | Met | Met | planks, plaster, coffers, baseboard/cornice, gilt frames — art stays the subject |
| U4 360° look | Met | Met | Met | yaw −1.3 after a drag, Face forward chip, recentres |
| U5 movement feel | Met | Met | Met | native scroll, dots + counter in every mode, keyboard walk |
| U6 inspect desktop | Met | Met | Met | centred, card left no border, study right, only Back to the hall, tap toggles life; plaque wrap at 1024×768 is P3-1 |
| U7 inspect phone | Met | N/A | N/A | peek-sheet drag/tap, Back top-left, tap-to-life; landscape uses the column layout |
| U8 true aspect | Met | Met | Met | last work 0.667 tall; grid tile 0.67 |
| U9 end of hall | Met | Met | Met | doorway/glow visible; grid follows the stage |
| U10 hygiene | Met | Met | Met | Skip top-left, chip copy, insets, ☰ lane top-right kept empty; P3-2 for the retreated ☰ |
| I1 CN mark | Met | Met | Met | favicon.svg = paths on `#1d1411`, reads as CN |
| I2 icon set | Met | Met | Met | svg/ico/png 16-32-180-192-512/manifest all 200 |
| I3 `<head>` wiring | Met | Met | Met | six `rel` links under the base path |
| I4 og build | N/A | N/A | N/A | `/og.png` 200 (125 KB); script itself is code-level |
| G-L1 home title/meta | Met | Met | Met | `Charles Nalle Walking Memorial · Troy, NY` |
| G-L2 docs drift | N/A | N/A | N/A | docs |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → `/bakery` |
| G-L4 sr-only em dashes | N/A | N/A | N/A | not visible; innerText scan clean |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | result |
|---|---|
| axe zero serious/critical every route/state | **Met** — 0/0/0/0 across 51 runs (+4 paintings runs) |
| contrast (incl. pixel mode) exit 0 | **Met** — 0 failures by style and pixel at 390/768/1440 (18 /people@768 rows never scrolled into view by the sampler — noted) |
| rag zero runts / zero clips / zero em dashes | **Met** — 0 / 0 / 0 over 4640 blocks, 99 passes |
| states zero collisions | **Met** — 133 states, 0 (the transient map hint chip is not among the captured states) |
| census one rhythm ladder on the five chapters | **Met** — `-3, -900, 1028, 0, 0, 128, 200, 200` on four; CO inserts its Part-2 block with the same values |
| frames clean | **Met** — 6/6 CLEAN at 4×; my own screencasts agree |
| perf (production) | **Met** — home 97 · chapters 98–99 · people/about 99 · paintings 89–90 (mobile) · map 64 |
| a11y 100 | **Met** — 100 on every route |
| keyboard walk complete | **Met** — 2/21/16/37 stops with rings; menu + dialog + museum keyboard verified again by me |
| reduced-motion parity | **Met** — all text visible; museum → grid |
| live URL verified | **Met** — HEAD = origin/v2 = live |

---

## The one moment I would retell

Scrolling into the hall on a desktop: the plank floor slides under you, the gilt frames catch the coffer light, a pen-and-ink study hangs beside each big canvas, and a small warm doorway glows at the far end — then you click a painting and it dollies to centre with its plaque on the left, and a second click makes the painting move. It still is the Museum.

---

## VERDICT: **PASS** — all axes ≥ 8 at every class, zero P0/P1, Sheet B all Met / N-A, instrument bars met (two P2s and nine P3s listed above for the polish queue).

---

## Cross-check of juror 9's items on this build (read only after my scores were written)

- **J9 P1-1 — `/people` at 360/390: the column resolves to 384 px and every note/role is clipped at the right edge** — **fixed.** At 360 and 390 `body.scrollWidth` = viewport, every role/note right edge is inside its card (`over:false` for all 14 cards at both widths, `scripts/juror10-pages.mjs`), and the two-part roles wrap at the separator (`people-cards-p390.png`: "BARBER / UNDERGROUND RAILROAD"). Nothing clipped mid-word.
- **J9 P2-1 — `/people` 768: "INDUSTRIALIST · CHARLES'S EMPLOYER" runs under the neighbouring monogram** — **fixed.** It now wraps to two whole segments inside its own column (`people-cards-t768.png`). Residual, smaller and different: the single-segment "CHIEF CIVIL-RIGHTS ATTORNEY" still overruns its column by 7 px at 768 and 21 px at 1024×768 (my P2-2).
- **J9 P3-1 — plaque eyebrow breaks mid-name ("MARK PRIEST · NALLE / SERIES · SPOT 0N")** — **fixed**: segments now break only at the separators ("MARK PRIEST · NALLE SERIES / SPOT 01" at 1440; "MARK PRIEST / NALLE SERIES / SPOT 04" at 1024×768). The three-line eyebrow at 1024×768 is my P3-1.
- **J9 P3-2 — one blank ground frame in the crossing at 4× CPU** — **not reproduced** in my two 4× screencasts (Continue and menu-link at 1440, `frames-continue-d1440/`, `frames-menu-people-d1440/`): the covered luminance holds flat (m12/m13) from cover to reveal.
- **J9 P3-3 — hint chip vs stop 4** — **still present**, and at 1440/1920 it now sits *on* the pill and its pin for ~3 s (my P2-1); at 390 it only brushes the "4" chip (my P3-4).
- **J9 P3-4 — 360 walk: active label pill clamped flush to the left edge** — **fixed / not reproduced**: at 360 the "COMMISSIONER'S OFFICE" pill is centred over its marker (`map-walk-mid-p360.png`).
- **J9 P3-5 — approach from the page top trips the ☰ scroll-hide** — **fixed for the page-top click** (☰ visible in `museum-approach-fromtop-d1440.png`, `-t1024`, `-t768`, `-z720`); still hidden if the visitor had already scrolled the rail before approaching (my P3-2).
- **J9 P3-6 — phone approach painting edge-to-edge** — **fixed**: painting rect 42–348 at 390 (frame ≈ 30 px from each edge, `museum-approach-p390.png`).
- **J9 P3-7 — mini-player pill over the hero H1 when scrolling back to the top mid-play (390)** — **still present** (my P3-8, `bakery-mini-top-p390.png`).
- **J9 P3-8 — walk-progress bar rides above the curtain during a chapter → chapter crossing** — **not reproduced**: at 390 the bar (z 900) is visible only while the panel (z 9999) is still rising (≤ 462 ms in `frames-menu-people-p390/`); at hold the top strip is solid ground (`zoom-curtain-top-p390.png`).
- **J9 P3-9 — `/map` at 720×450 frames only stops 1 and 3** — **still present** (`j9-z720-map-overview.png`: stops 2, 4, 5 out of view); not a scored class.

Net: juror 9's P1 and P2 are fixed on `f1dbbb3`; of the nine P3s, four are fixed (1, 4, 5-for-page-top, 6), two were not reproduced (2, 8), three remain (3 → now my P2-1 at desktop, 7, 9). Nothing found on this build reaches P1.
