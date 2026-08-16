# v7 juror pass 1 — Charles Nalle Walking Memorial (live GH Pages)

Juror: fresh, independent (no source read before scoring). Build under review: **https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/** as served on 2026-08-16 (`/paintings` last-modified 05:14 GMT = HEAD `a8328c8`). Method: Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), phone contexts `isMobile+hasTouch` with CDP `Input.dispatchTouchEvent` drags/taps; six viewports (390×844, 360×800, 768×1024, 1024×768, 1440×900, 1920×1080) plus 844×390 and 720×450 (200 % zoom) where the protocol asks. Evidence: `docs/v7/qa/juror-pass1/` (PNGs + JSON, gitignored). Scripts: `scripts/juror1-*.mjs`. Instrument rows in Sheet B come from the executor's `docs/v7/qa/final/*.md`.

Visited: `/` (6 vps) · QR arrival `/bakery` + `/barbershop` (6 vps) · full read of `/bakery` at 390/768/1440 (play, tap-to-seek, every section, mini-player, Continue with frame capture) · `/commissioners-office` both parts (order, spine, both players, one mini, tap-to-seek, collapse) · `/map` overview → Take the walk → mid-walk drag (slow 20 px, flick) → Continue → Stop → Back → 1858 lens (pan, pinch/wheel, reset, Back to today) → Enter a card → chapter → browser back, at 390/768/1024/1440 · `/paintings` museum at 390/768/1024/1440/844×390: rail scroll, drag-look, Face forward, click a painting (approach), tap it (alive/rest), wheel zoom, sheet drag/tap/keyboard, Back, Esc, dot-rail keyboard, hall end, grid, dialog · `/people` `/about` `/404` scroll-throughs · menu open/close + scroll-hide on every route at 390/1440 · footer on chapter/about at 390/768/1440/1920 · favicon set · reduced-motion on `/` `/bakery` `/map` `/paintings` · 200 % zoom on all routes · console on every run.

---

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 / 360) | tablet (768 / 1024) | desktop (1440 / 1920) |
|---|---|---|---|
| Design | **8** | **8** | **8** |
| Usability | **7** | **7** | **9** |
| Creativity | **9** | **9** | **9** |
| Content | **9** | **9** | **9** |

**Phone.** The type system, palette and rhythm are genuinely high-end (home splash, chapter openings with drop caps, moral sections, People/About) and the map walk now feels deliberate: Back/Continue top row, opaque peeking cards, no snap-back, walk pauses on touch. Usability loses two points because the museum's peek-sheet is dead to touch (drag and tap do nothing — only keyboard opens it) and the collapsed mini-player pill parks over the footer disclaimer / CTAs; the museum's showpiece portrait is also stretched.
**Tablet.** Same strengths; 768 portrait behaves like a big phone (sheet also dead to touch), 1024 landscape uses the desktop composition and is clean. Map at both is well framed (pitch 52, all five labels). Design 8 for the same fidelity defect (stretched painting, `sketchAspect` all 1.25).
**Desktop.** The strongest class: 3-D map with all five pills, lens fills the shell and opens on the lower panel, curtain is clean under frame capture, museum approach = painting centred / card left / sketch right / one button, keyboard path complete (Enter/←→/Esc/+−). Design held to 8 by the distorted "Barbershop · Narrative II" and by Charles's crown clipping the home frame at 1920×1080 and 1024×768.

---

## Defects

### P0 — none

### P1

1. **`/paintings` (museum) · all classes · the portrait work "Peter Baltimore's Barbershop · Narrative II" hangs as a 3:2 landscape and is stretched ≈2.25× horizontally (the "sheriff's-office distortion" Wil named). U8 is not on the live build: the island props carry `aspect: 1.5` for all ten works and `sketchAspect: 1.25` for all five sketches (`curl …/paintings | grep aspect` → `10 aspect:[0,1.5]`, `5 sketchAspect:[0,1.25]`), while the asset is 1440×2160 (portrait) and its dialog video 800×1200. The 2-D grid tile is a 3:2 crop of the tall painting. Evidence: `docs/v7/qa/juror-pass1/mus4-d1440-portrait-approach.png` (582×388 projected rect, ratio 1.50), `mus3-p390-01-approach-portrait.png`, `mus4-t768-portrait-approach.png`, `mus-d1440-16-grid-portrait.png`, `museum4.json`. Repro: `/paintings` → scroll to the end of the hall → tap the last dot ("Approach Peter Baltimore's Barbershop · Narrative II") — faces and the SHERIFF OFFICE sign are visibly wide. (Looks like the build-time `sharp` metadata step fell back to defaults on the GH Actions build; the executor's museum.md shows the same 339×226 / 582×388 rects, so the instrument never checked the ratio.)
2. **`/paintings` (museum, approach) · phone 390 + tablet-portrait 768 · the peek-sheet cannot be expanded by touch or pointer.** Dragging the header ("Expand the plaque", `touch-action:none`) up 300–400 px, flicking, dragging down, and tapping the header/handle all leave the sheet at `peek` (header top stays 720 @390 / 928 @768; `.museum-sheet` never gets a transform). The header receives `pointerdown` → `gotpointercapture` → 20× `pointermove` → `pointerup` (logged at window level, both `pointerType:touch` via CDP and `pointerType:mouse`), so the input reaches the handler — it even switches `.museum-sheet` to `transition:none` on pointerdown and writes `transform: translateY(0px)` at the end of a 360 px upward drag, i.e. the travel range clamps to zero (the full height appears to measure 0 while the body is collapsed); only keyboard Enter toggles peek↔full (`museum8` run: `mus8-p390-slow-handle-drag.png`). A phone visitor sees a drag handle that does nothing and never reaches the quote/attribution. Evidence: `museum5-p390.json`, `museum6-p390.json`, `museum7-p390.json`, `museum7-t768.json`, `mus7-p390-01-after-up.png`, `mus6-p390-01-after-slow-drag.png`. Repro: phone → `/paintings` → tap any painting → drag the sheet handle upward, or tap it.

### P2

1. **`/paintings` (museum) · phone/tablet-portrait · sheet "full" (reached by keyboard) mispositions the dot rail** over the painting (rail jumps to y≈355 as if the sheet were 0.55·H, while the sheet only grows to its content, header 720→647); the painting does not recompose. `mus5-p390-02-after-enter.png`, `mus7-p390-03-kbd-full.png`. Repro: approach → focus the sheet header → Enter.
2. **`/paintings` (museum rail) · 844×390 landscape phone and 720×450 (200 % zoom) · "Skip the hall" overlaps the rail chip** ("THE" of "THE MUSEUM · SCROLL TO WALK…" sits under the button; the phone-short chip copy is not used at 844 wide). `mus-land-01-rail-rest.png`, `zoom200-paintings-mid.png`.
3. **Chapters · all classes · the collapsed mini-player pill covers the footer disclaimer at max scroll** ("Wal…" hidden) — the C10 "reserved lane" is ~52 px, the pill is 62 px + inset; at 390 it also transits over `Continue`/`Get directions` while scrolling. `read-bakery-p390-06-footer.png`, `read-bakery-d1440-06-footer.png`, `read-bakery-p390-05-onward.png`. Repro: play narration → scroll to the end.
4. **`/map` walk mode · 390 · the Mapbox attribution (i) sits half under the active card's bottom-left corner** (card bottom 792, (i) 772–796 + card shadow); the Mapbox wordmark also appears here below it. `crop-390-walk-attrib.png`, `walk2-p390-01-after-small-drag.png`. Repro: `/map` → Take the walk.
5. **`/` · 1920×1080 and 1024×768 · the crown of Charles's head is clipped by the frame top; 1440×900 has zero headroom** (H1 asks "full head visible with headroom" at these sizes). `crop-home-1920-head.png`, `home-t1024.png`, `crop-home-1440-head.png`.

### P3

- `/map` walk (≥ sm) · "BACK  TO MAP" renders a double word-space (`crop-backtomap.png`, `map-t768-02-walk.png`).
- `/map` lens · 390 · caption wraps with a dangling separator "TROY, NEW YORK · 1858 ·" / "LIBRARY OF CONGRESS" (`map-p390-08-lens.png`); the museum card eyebrow does the same at desktop ("MARK PRIEST · NALLE SERIES ·" / "SPOT 03") and the Narrative II title breaks to a leading "· NARRATIVE II" (`mus4-d1440-portrait-approach.png`).
- Chapters · 390 · "TAP OR CLICK A PARAGRAPH TO HEAR IT / READ ALOUD" 2-word second line (`read-bakery-p390-02-playing.png`).
- `/about` · closer heading balances to "TWO AND A HALF / MILES. ONE DAY IN 1860." — splits the phrase (`thru-about-d1440-08.png`, `thru-about-p390-*`).
- `/commissioners-office` · both play buttons are labelled "Play narration: Commissioner's Office" (no Pt 1 / Pt 2 for SR users) (`ch2audio-d1440.json`).
- All routes · `og:image:alt` still contains an em dash (meta only; visible text is clean).
- `/map` · console warnings: two Caslon woff2 `<link rel=preload>` "not used within a few seconds" (`walk2-p390.json` log). No console errors anywhere else except the 404 page's own 404 and the `/bakery/` trailing-slash 404 that redirects.
- Museum · after a touch approach, "Back to the hall" (and the returned-to dot) show a focus ring in headless; verify on a real phone (`mus2-p390-01-approach-by-click.png`).
- Menu · initial focus on open is "Close menu" everywhere except `/map` ("Home").
- `/people` · 1440: large empty left column under the H1 in the header (`sl-people-1440-0.png`) — editorial, but reads as a hole.
- `/map` overview · the "DRAG TO EXPLORE · TAP A STOP" hint sits over marker 4 / the ferry pin for a beat (`map-p390-01-overview.png`, `map-d1440-01-overview.png`).
- Chapters · phone · prose runs under the ☰ when it re-appears on scroll-up (`det-barbershop-p390-interlude.png`) — inherent to the pattern, noted.
- 720×450 · "SEE TROY / IN 1858" pill wraps to two lines (`zoom200-map-top.png`).
- Walk auto-cycle ≈ 3 s per stop finishes the five stops in ~14 s — brisk for a "walk" (taste).

---

## Sheet B — Wil's ledger (Met / Not met / N/A per class + note)

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| H1 hero head visible | Met | Met (768) / **Not met** (1024×768: crown clipped) | **Not met** (1920 crown clipped; 1440 zero headroom) | `home-*.png`, crops |
| H2 description 3 lines desktop / balanced phone | Met | Met | Met | 3 lines at 1440/1920; 5 at 390 |
| H3 CTA "Walk the story" | Met | Met | Met | |
| H4 mobile CTA bottom-aligned, full-width, 48 px | Met | N/A | N/A | 338×48 @ y770 (390), 308×48 (360) |
| H5 description contrast | Met | Met | Met | contrast.md 0 failures; visually white on film |
| H6 entry choreography / RM shows all | Met | Met | Met | RM pass shows everything |
| X1 curtain no flash | Met | Met | Met | own frame capture Continue + card→chapter clean at 390/1440; frames.md CLEAN |
| M1 geolocate removed | Met | Met | Met | walk.md geolocate no; not seen |
| M2 overview pitch ≥ 40 | Met (52) | Met (52) | Met (52) | all five labels visible |
| M3 Stop the walk top-right | Met | Met | Met | @200,20 / 558,40 / 1214,56 |
| M4 drag pauses, Continue resumes, Walk again | Met | Met | Met | walk2-*.json: paused immediately, no reversal, resumes; Stop → not moving ≤ 1.2 s |
| M5 drag feel | Met | Met | Met | monotonic settle, ±1 card on flick |
| M6 card titles two lines | Met | Met | Met | Holeur's/Fashionable Bakery, Commissioner's/Office |
| M7 Back to map inset | Met | Met | Met | @20,20 / 40,40 / 56,56 |
| M8 mobile overview row | Met | N/A | N/A | (i) · Take the walk · ☰ on one axis; 1858 pill top-right |
| M9 mobile walk cards | Met | Met (768) | N/A | opaque, peeks both sides, Back/Stop top row, ☰ hidden while focused |
| M10 chip "April 27, 1860" | Met | Met | Met | |
| M11 card spacing | Met | Met | N/A | |
| M12 map quiet under curtain | Met | Met | Met | Enter → clean frames |
| M13 map copy block rag / Spot NN | Met | Met | Met | `map-d1440-01b-index.png` |
| L1 lens opens on lower panel | Met | Met | Met | transform scale 4.6 @390 shows lower panel; 1.21 @1440 |
| L2 bigger viewer | Met (350×675) | Met (688×831 / 944×575) | Met (1328×672) | |
| L3 lens copy/controls | Met (P3 dangling "·") | Met | Met | only Back to today; chip hidden |
| L4 interaction | Met | Met | Met | pan, pinch/wheel to 6×/2.48×, reset |
| C1 drop cap | Met | Met | Met | 3 lines desktop, 3 phone |
| C2 moral contrast + parallax | Met | Met | Met | body reads white; parallax not measured, RM fine |
| C3 study centred | Met | Met | Met | `read-bakery-d1440-moral.png` |
| C4 archival credit on chip | Met | Met | Met | "ARCHIVAL RECORD" pill |
| C5 Where-to-next declutter | Met | Met | Met | Continue is the single orange; pill collapses (but see P2-3) |
| C6 rhythm | Met | Met | Met | heading→quote 42/39/53; moral→onward 128/168/200 on all five |
| C7 ☰ scroll-hide + hero faces | Met | Met | Met | hides after scroll-down, returns on up, on every route |
| C8 barbershop | Met | Met | Met | T→I→T→I→T verified in DOM; hero on faces |
| C9 ch2 order + one mini | Met | Met | Met | hero→scene-0→history→moral-0→hero-2→scene-1→moral-1→onward; spine (01)–(06); one mini; playing one pauses the other |
| C10 footer mini lane | **Not met** | **Not met** | **Not met** | pill covers the disclaimer at max scroll (P2-3) |
| C11 em dashes in chapter UI | Met | Met | Met | "Next · Spot 02", "5 State Street · Mutual Bank Building" |
| C12 mansion subtitle | Met | Met | Met | "Uri Gilbert Home" (Mansion remains only in Kathy's prose) |
| F1 footer redesign | Met | Met | Met | 3-col, wordmark one line, nav list, Share, disclaimer 2 lines no runt |
| N1 X spins on close | Met | Met | Met | transform → rotate 90° sampled on close |
| N2 scroll-hide everywhere | Met | Met | Met | incl. /map (page scroll) and /paintings |
| N3 arrow tail unchanged | Met | Met | Met | |
| P1 spot links removed | Met | Met | Met | 0 "Spot NN" links |
| P2 closer copy | Met | Met | Met | Their story lives on / Stand where they stood / Walk the story |
| P3 em dashes | Met | Met | Met | 0 visible |
| P4 H1 rag | Met (3 lines) | Met | Met ("ONE DAY. A WHOLE / CITY'S CAST.") | |
| P5 grid check | Met | Met | Met | 2-col at 768/1024 reads well |
| A1 afterword section | Met | Met | Met | (06) Afterword · Onward (07) |
| A2 closer copy + computed 2.5 mi/45 min | Met | Met | Met | (P3 heading break) |
| A3 attribution dash dropped | Met | Met | Met | |
| A4 kicker | Met | Met | Met | "On the sidewalk" rendered as (02) rail label |
| U1 rail pitch down | Met | Met | Met | −0.08/−0.10 rad, floor visible |
| U2 paintings closer / end visible | Met | Met | Met | spacing 5, far 80, glow visible from start |
| U3 finish | Met | Met | Met | planks, plaster, cornice, gilt frames — restrained |
| U4 360° look | Met | Met | Met | yaw −2.07 rad reached, Face forward, recentre |
| U5 movement / keyboard | Met | Met | Met | ←/→ look, Enter, Esc, ±zoom |
| U6 inspect desktop | N/A | Met (1024) | Met | centred, card left no border, sketch right, one button, tap toggles, wheel ≥1.35 turns on |
| U7 inspect mobile sheet | **Not met** | **Not met** (768) / Met (1024) | N/A | sheet ignores drag + tap (P1-2); keyboard only |
| U8 true aspect per work | **Not met** | **Not met** | **Not met** | all 10 works 1.5, sketches 1.25 on live (P1-1) |
| U9 hall-end threshold | Met | Met | Met | doorway + glow; steps not discernible (stretch) |
| U10 hygiene | Met (P2-2 at 844×390) | Met | Met | Skip top-left, chip copy, no "Bring it to life" wording |
| I1 CN monogram | Met | Met | Met | reads CN at 16 px (`mont-favicon.png`) |
| I2 icon set | Met | Met | Met | svg/16/32/48-ico/180/192/512/manifest all 200 |
| I3 head wiring | Met | Met | Met | 6 links, base-path correct, relative manifest |
| I4 og.png | Met | Met | Met | 200, 125 KB (alt text keeps an em dash — P3) |
| G1 rag | Met | Met | Met | rag.md 0; a few 2-word/dangling-separator lines noted P3 |
| G2 clipped letterforms | Met | Met | Met | rag.md 0 clips; moral J intact |
| G3 contrast | Met | Met | Met | contrast.md 0 (18 /people@768 unmeasured — never in view) |
| G4 tablet parity | Met | Met | Met | 768/1024 visited on every page |
| G5 em-dash sweep | Met | Met | Met | none visible on any route (meta alt only) |
| G6 floating-UI grid | Met | Met | Met | states.md 0; two live overlaps found P2-2, P2-4 |
| G7 motion tokens / RM parity | Met | Met | Met | RM: no 3-D, grid + note; chapters/map/home fine |
| G-L1 home meta / styleguide noindex | Met | Met | Met | title "·"; styleguide noindex |
| G-L2 docs drift | N/A | N/A | N/A | docs — not judged |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → 404 → redirects to `/bakery` |
| G-L4 sr-only dashes | Met | Met | Met | none found |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | status | note |
|---|---|---|
| axe zero serious/critical every route/state | Met | a11y.md 0/0/0/0 across 51 runs |
| contrast (incl. pixel) exit 0 | Met | contrast.md 0 failures; 18 unmeasured on /people@768 |
| rag zero runts / clips / em dashes | Met | rag.md 0/0/0 (5 authored lockups listed) |
| states zero collisions | Met (instrument) — two live overlaps missed | P2-2, P2-4 |
| census one rhythm ladder | Met | five chapters share `…0,0,128,200,200`; ch2 adds its part segments |
| frames clean | Met | frames.md CLEAN (map-card 1440 NO-NAV; my own capture of card→chapter at 1440 is clean) |
| perf (production) home ≥95, chapters ≥95, people/about ≥95, paintings ≥80/70, map ≥63 | Met per baseline/RUN-STATE — **no perf.md in `final/`** | baseline: home 97 · ch 98–99 · people/about 99 · paintings 89 · map 63; not re-evidenced after P7 |
| a11y 100 | Met | baseline Lighthouse a11y 100 everywhere |
| keyboard walk complete | Met | a11y.md + my museum keyboard path |
| reduced-motion parity | Met | a11y.md + own RM pass |
| live URL verified | Met | all evidence from the live URL |

---

## The one moment I would retell

Still the Museum: dragging to look and having the whole hall swing round you — a side-wall painting fills the screen and the plaster and plank floor recede behind — then clicking it, the camera dollies in, the frame centres, the sketch hangs to the right, and one tap makes the painting move. That is the moment. Just fix the one that hangs sideways.

---

## VERDICT: **FAIL** — two P1s (portrait work stretched on the live build / phone peek-sheet dead to touch); Sheet B U7, U8, C10, H1 not met; the P1 fixes restart the two-pass count.
