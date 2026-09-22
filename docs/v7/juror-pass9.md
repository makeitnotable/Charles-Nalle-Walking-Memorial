# Juror pass 9 — Charles Nalle Walking Memorial (live GH Pages, commit 480f715)

Fresh-eyed juror, 2026-08-16. Visited the LIVE site https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ as a visitor at six viewports (390×844, 360×800, 768×1024, 1024×768, 1440×900, 1920×1080) plus 720×450 (200 % zoom) and reduced-motion, headless Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a time, real touch via CDP on the phone/tablet profiles. No site source was read before scoring. Scripts: `scripts/juror9-*.mjs`; evidence (PNGs, JSON notes, screencast frames): `docs/v7/qa/juror-pass9/` (all paths below are relative to that folder unless stated).

Instrument summaries read (not re-run): `docs/v7/qa/final/{a11y,a11y-paintings,states,contrast,rag,walk,museum,frames,census,probe,perf}`.

---

## VERDICT

**FAIL** — one P1 defect on the build under review: on `/people` at phone widths ≤ ~400 px (360, 375, 390) the whole content column is 384 px wide inside a 320/350 px viewport lane, so every line of Kathy's people notes and every role label runs past the right edge and is clipped mid-word (at 360: "unrecord…", "wro…", "who ha…"; at 390: "Dra[g]", "the crowd" flush to the edge). At 768 the same cause pushes the "Industrialist · Charles's employer" role under the neighbouring card. Everything else on the site is at or above the bar; the museum is still the moment I would retell.

---

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 / 360) | tablet (768 / 1024) | desktop (1440 / 1920) |
|---|---|---|---|
| Design | 8 | 8 | 9 |
| Usability | **7** | 8 | 9 |
| Creativity | 9 | 9 | 9 |
| Content | 8 | 9 | 9 |

**Phone.** The splash (whole head with headroom, six balanced lines, bottom-pinned CTA), the QR arrivals, the chapter read (drop cap, tap-to-seek, a pause pill on screen in both scroll directions, cream moral body under a cream heading), the map (five stops visible, Back/Stop the walk top-row, opaque cards with 16–18 px peeks, drag pauses → `Continue`, no lit stop after Back, the 1858 plate opening on downtown Troy) and the museum peek-sheet are all finished work. `/people` is not: at 360 and 390 the prose is cut off at the right edge on every card, which a visitor reads as broken — that alone holds usability at 7 and content at 8.

**Tablet.** 768 portrait and 1024 landscape both read as designed for, not merely tolerated: the map pins with labels, the doors pair, the walk cards, the 768 lens filling the shell, the approach with card-left / painting-centred at 1024 and the peek-sheet at 768. Two things keep design at 8: the `/people` 2-col grid at 768 lets one role label overflow into the next column, and the museum plaque eyebrow breaks "NALLE / SERIES" mid-name in every landscape card.

**Desktop.** 1440 and 1920 are the strongest class: cooperative wheel on the map with the house chip, one-card drags with expo settling, `Walk again` after stop 5, the lens near-full-bleed, the hall's floor cue and end glow, centred approach with plaque left / study right, tall undistorted portrait for the last work, keyboard path complete (Tab → dots → Enter → ←/→ → Esc, ring only after keyboard input). Only P3 nits remain (plaque eyebrow rag, transient hint chip crowding stop 4, one blank ground frame in the crossing at 4× CPU).

---

## P0 — none.

## P1

1. **`/people` · phone 360×800 and 390×844 (also 375 by extension; clean from ≈ 404 px up) · text clipped at the right edge on every card.** The `.editorial` grid is 320 px (360) / 350 px (390) wide but its single column resolves to 384 px (a `nowrap` role label such as "Industrialist · Charles's employer" sets the min-content width), so the section heading, the intro and every note run 14–44 px past the viewport and `html` clips them: at 360 "Black and white, famous and unrecord…", "…that the law was wro…", "A coachman for the Gilbert family who ha…"; at 390 "…she rallied the rescuers: "Drag us out! Dra…". Evidence: `p360-people-clip.png`, `p390-ovf-people-dpr2.png`, `p390-ss-people-01.png`; DOM chain in `scripts/juror9-people-dom.mjs` output (`.editorial` 320 px → grid column 384 px). Repro: open `/people` at 360×800 or 390×844, scroll to "The rescuers". Note: this is a regression introduced by the juror-8 P3 fix "people roles nowrap" in 480f715 — the instruments did not catch it because `documentElement.scrollWidth` stays 360/390 (only `body.scrollWidth` grows to 404) and the rag clip probe only looks at descenders.

## P2

1. **`/people` · tablet 768×1024 · role label overflows its column.** In the 2-col grid the nowrap "INDUSTRIALIST · CHARLES'S EMPLOYER" runs under the "WH" monogram of the neighbouring card and "BARBER · UNDERGROUND RAILROAD" touches the column edge. Evidence: `t768-ss-people-01.png`. Repro: `/people` at 768×1024, scroll to Uri Gilbert. Same root cause as the P1.

## P3

1. **`/paintings` approach card (1024, 1440, 1920, 720) · plaque eyebrow breaks mid-name**: "MARK PRIEST · NALLE / SERIES · SPOT 0N" on two lines in every landscape card width. Evidence: `d1440-mus-01-approach-from-top.png`, `d1440-mus-11-last.png`, `t1024-mus-13-approach-8.png`, `z720-mus-11-last.png`.
2. **Crossing at 4× CPU · one blank ground frame between page A's curtain and page B's curtain** (home door → map at 390 at t≈916 ms; map card → chapter at 1440 at t≈1014 ms): the date lockup blinks off for one frame (luminance 13 → 21 → 13). Not a flash of page-B content; the other five captures were continuous. Evidence: `frames-d1440-map-card/f091-687.jpg` → `f092-1014.jpg` → `f093-1055.jpg`; profiles in `d1440-transitions.json`, `p390-transitions.json`.
3. **`/map` overview · transient hint chip vs stop 4**: at 360 "DRAG TO EXPLORE · TAP A STOP" covers stop 4 until it fades, at 390 it abuts it, at 1440 it sits directly under the "4 FERRY LANDING" pill. Evidence: `p360-map-overview.png`, `p390-map-overview.png`, `d1440-map-overview.png`.
4. **`/map` walk mode · 360×800 · active label pill clamped flush to the left viewport edge** ("COMMISSIONER'S OFFICE" pill at x = 0). Evidence: `p360-map-walk-4s.png`.
5. **`/paintings` · approach from the page top scrolls the page ≈ 300–430 px, which trips the ☰ scroll-hide** — in approach mode there is no corner menu until you go Back and scroll up (all classes). Evidence: `d1440-mus-01-approach-from-top.png`, `p390-mus-01-approach-from-top.png` (no ☰), `d1440-mus-02-after-back-click.png`.
6. **`/paintings` phone approach · painting composed edge-to-edge**: the frame's outer moulding touches both screen edges at 390 (≈ 2 px margin). Evidence: `p390-mus-01-approach-from-top.png`, `p390-mus-07-alive.png`.
7. **Chapter mini-player pill covers the hero H1** when the listener scrolls back to the top while audio plays (bottom-left pill over "BAKERY" at 390). Evidence: `p390-bakery-away-up.png`.
8. **Walk-progress bar rides above the curtain** during a chapter → chapter crossing (the five-segment strip stays visible over the covered page). Evidence: `p390-bakery-continue-mid.png`.
9. **`/map` at 720×450 (200 % zoom / short landscape)** · the overview frames only stops 1 and 3 (2, 4, 5 are off the top/bottom) and the "SEE TROY IN 1858" pill sits 8 px from the ☰. Not a scored class; no horizontal overflow. Evidence: `z720-map-overview.png`.

---

## The one moment I would retell

Tapping the last painting on a phone: the hall darkens, the tall Peter Baltimore portrait swings to centre and hangs there undistorted, the dot rail slides above a plaque that peeks in from the bottom, and a second tap on the canvas brings the scene to life. On the desktop the walk down the plank floor toward the glow at the end of the hall, then dragging to look at the sketch beside each work, is the same feeling — a museum you can actually walk. It is still the moment.

---

## Sheet B — Wil's ledger (Met / Not met / N/A per class; note)

Legend: P = phone (390/360) · T = tablet (768/1024) · D = desktop (1440/1920). "Met (inst)" = verified by the executor's instrument summary and consistent with what I saw.

| ID | P | T | D | note |
|---|---|---|---|---|
| G1 rag/orphans/widows | Met | Met | Met | rag.md 0 runts / 0 two-word display runts; visually clean; the only rag I noticed is the museum plaque eyebrow "NALLE / SERIES" (P3-1) |
| G2 no clipped letterforms | Met | Met | Met | "FOR JUSTICE" J descender whole at 390/1440 (`p390-barbershop-moral.png`); rag.md 0 ink clips. (The `/people` overflow is layout clipping, logged under P5.) |
| G3 contrast AA | Met | Met | Met | contrast.md 0 failures incl. pixel mode; moral body cream, archival credit on a chip, home description readable |
| G4 tablet parity | Met | **Not met** | Met | 768 `/people` 2-col: role label overflows into the neighbouring column (P2-1); everything else reads well at 768 and 1024 |
| G5 em-dash sweep | Met | Met | Met | no visible em dash anywhere I read (chips, addresses, "NEXT · SPOT 02", plaque, About attribution); rag.md 0 |
| G6 floating-UI grid | Met | Met | Met | states.md 133 states / 0 collisions; mini pill, ☰, Back/Stop, Skip, chip all on the inset grid in every state I saw |
| G7 motion tokens | N/A | N/A | N/A | code-level; observable side: reduced-motion parity 100 % on `/`, chapter, `/map`, `/paintings` (grid fallback, no hidden text, 0 console errors) |
| H1 hero head visible | Met | Met | Met | whole head with headroom above "Troy, New York · April 27, 1860" at 390/360/768/1024/1440/1920 (`*-home-first.png`); tightest at 1440 (≈ 20 px above the hair) |
| H2 description lines | Met | Met | Met | 5 lines @390, 6 @360, 4 @768/1024, exactly 3 @1440/1920, balanced, no orphan |
| H3 CTA "Walk the story" | Met | Met | Met | home, People closer and About closer all read "Walk the story" |
| H4 mobile CTA bottom-aligned | Met | — | — | 390/360: full-width pill pinned at the frame bottom, 48 px tall, margin = side inset |
| H5 description contrast | Met | Met | Met | contrast.md pixel mode 0 failures; legible over the film at every size |
| H6 entry choreography | Met | Met | Met | CTA present at ≤ 700 ms after load; reduced motion shows everything |
| X1 curtain jitter/flash | Met* | Met* | Met* | frames.md CLEAN ×6; my captures: no page-B content before the hold, no wordmark reflow, one continuous reveal — *one blank-ground frame in 2 of 7 captures at 4× CPU (P3-2) |
| M1 geolocate removed | Met | Met | Met | no locate control anywhere |
| M2 overview pitch / all five visible | Met | Met | Met | all five stops on screen at 360/390/768/1024/1440/1920; walk.md pitch 48–52 |
| M3 Stop the walk top-right | Met | Met | Met | at the inset on every class; never over cards or labels |
| M4 drag pauses → Continue → resumes | Met | Met | Met | button reads `Continue` (aria "Continue the walk") immediately after a drag; press → `Stop the walk` and cycling resumes; `Walk again` after stop 5 (`d1440-wf-*`) |
| M5 carousel drag smoothing | Met | Met | Met | 16 ms samples show monotonic expo settling, ±1 card max, no reversal (`*-map-notes.json` drag.samples); a 20 px nudge returns to the same card |
| M6 card titles two lines | Met | Met | Met | "Holeur's / Fashionable Bakery", "Commissioner's / Office" on two lines; no title crosses the arrow |
| M7 Back equal inset | Met | Met | Met | Back at 20/40/56 top-left |
| M8 mobile overview layout | Met | — | — | (i) left · Take the walk centred · ☰ right on one axis; "See Troy in 1858" pill top-right at 44 px |
| M9 mobile walk cards | Met | — | — | opaque, 16–18 px peeks at 360/390, `Back` label, ☰ hidden while focused, strip clears attribution |
| M10 chip copy | Met | Met | Met | "APRIL 27, 1860" |
| M11 card spacing | Met | — | — | balanced 12 px gaps |
| M12 curtain interplay | Met | Met | Met | map crossings clean in the frame captures |
| M13 map copy block | Met | Met | Met | "Five spots / through Troy" heading, clean prose rag, "2.5 miles · about 45 minutes on foot", `Spot 01` padded |
| L1 lens reframe (lower panel) | Met | Met | Met | opens on downtown Troy + Hudson + West Troy at 390/768/1440; reset available |
| L2 bigger viewer | Met | Met | Met | fills the shell at 768; near-full-bleed at 1440 |
| L3 lens copy/controls | Met | Met | Met | only "Back to today" (centred); caption two lines at phones, one line 768+; "Drag to explore · pinch to zoom" on phones |
| L4 interaction unchanged | Met | Met | Met | drag pans; + − ⟲ present; keyboard covered by a11y.md |
| C1 drop cap | Met | Met | Met | 3-line drop cap on every opening incl. both ch2 parts |
| C2 moral contrast + parallax | Met | Met | Met | body cream/white like the heading (measured rgb(246,243,238)); parallax not judged from stills |
| C3 study centred | Met | Met | Met | 1440: sketch vertically centred with caption |
| C4 archival credit chip | Met | Met | Met | "HOLEUR'S FASHIONABLE BAKERY · ARCHIVAL RECORD" on a chip (`d1440-ss-bakery-03.png`) |
| C5 Where-to-next declutter | Met | Met | Met | Continue is the single primary; embed map shadow; quiet numeral pill; mini collapses to a round pill at Onward |
| C6 rhythm | Met | Met | Met | census.md one ladder; heading→quote close, moral→Onward ≈ a beat not a screen |
| C7 hamburger hide + hero focus | Met | Met | Met | hides after scrolling down, returns on a short scroll up on every page (`*-pages-notes.json`); bakery face clear of ☰ at 390 |
| C8 barbershop | Met | Met | Met | hero on the faces; T→I→T→I→T order confirmed in DOM; J clear; study centred |
| C9 ch2 order | Met | Met | Met | ids hero → scene-0 → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; both players work; Pt 2 mini stays on screen when scrolled into Pt 1 |
| C10 chapter footer lane | Met | Met | Met | footer with mini latched at 390/768/1440: nothing covered |
| C11 chapter UI em dashes | Met | Met | Met | "NEXT · SPOT 02", "5 State Street · Mutual Bank Building" |
| C12 latent | Met | Met | Met | mansion player reads "Uri Gilbert Home" |
| F1 footer | Met | Met | Met | 3-col at 768+/stacked at 390, one-line wordmark, disclaimer 2 lines no runt, Share on chapters |
| N1 X spins on close | Met | Met | Met | close icon rotates 90° over ≈ 300 ms then closes (sampled) |
| N2 scroll-hide/show | Met | Met | Met | verified on chapters, /people, /paintings, /about, /404 and /map (desktop) |
| N3 arrow tail | Met | Met | Met | unchanged |
| P1 spot links removed | Met | Met | Met | 0 "Spot n" links under people |
| P2 People closer copy | Met | Met | Met | "Their story lives on" · "Stand where they stood" · "Walk the story" |
| P3 People em dashes | Met | Met | Met | roles use "·" |
| P4 People H1 rag | Met | Met | Met | "ONE DAY. / A WHOLE / CITY'S CAST." @390; "ONE DAY. A WHOLE / CITY'S CAST." @1024+ |
| P5 People grid check | **Not met** | **Not met** | Met | phone: column 384 px in a 320/350 lane → clipped prose (P1-1); 768: role overflows into the next column (P2-1) |
| A1 About spacing / (06) Afterword | Met | Met | Met | (06) Afterword quote, (07) Onward |
| A2 About closer copy | Met | Met | Met | "The streets are waiting" · "Two and a half miles. One day in 1860." · body · "Walk the story" |
| A3 About em dash | Met | Met | Met | attribution stands alone |
| A4 latent | N/A | N/A | N/A | code/content note |
| U1 rail pitched down | Met | Met | Met | pitch −0.08 (portrait) / −0.10; floor visible |
| U2 paintings closer / end visible | Met | Met | Met | end glow visible from the entrance; spacing 5 |
| U3 environment finish | Met | Met | Met | plank floor, moulded gilt frames, cornice/baseboard, coffered ceiling |
| U4 360° look | Met | Met | Met | yaw unbounded, "Face forward" chip, recentre |
| U5 movement + keyboard | Met | Met | Met | native scroll; Tab→dots→Enter→←/→→Esc; ←/→ look in rail; counter+dots in every mode |
| U6 inspect desktop | Met (land) | Met | Met | painting centred, card left (no border), study right, only "Back to the hall", tap toggles life, focusable "Bring the painting to life" |
| U7 inspect mobile sheet | Met | Met (768) | — | peek 94 px → full on tap or drag, painting recomposes higher, Back top-left, dots ride above |
| U8 true aspect | Met | Met | Met | last work tall & narrow, undistorted; grid tile portrait |
| U9 end of hall | Met | Met | Met | doorway glow visible; steps not inspected up close |
| U10 hygiene | Met | Met | Met | Skip top-left, chip "The Museum · scroll to walk · drag to look · tap a painting" / "Scroll to walk", ↓ icon; corner lane empty in every museum mode (☰ merely scroll-hidden after approach, P3-5) |
| I1 CN mark | Met | Met | Met | favicon reads CN at 32 px and 180 px |
| I2 icon set | Met | Met | Met | favicon.svg/ico/-32/-16, apple-touch-icon 180, icon-192/512, manifest — all 200 under the base path |
| I3 head wiring | Met | Met | Met | svg + png + ico + apple-touch + manifest + theme-color links present |
| I4 og.png | Met | Met | Met | 1200×630, 200 |
| G-L1 title em dashes / styleguide | Met | Met | Met | "Charles Nalle Walking Memorial · Troy, NY" |
| G-L2 docs drift | N/A | N/A | N/A | docs |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` → `/bakery` |
| G-L4 sr-only dash | N/A | N/A | N/A | not visible |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`, not re-run)

| bar | result |
|---|---|
| axe zero serious/critical on every route/state | Met — 0/0/0/0 across 51 runs (+ 4 paintings runs) |
| contrast (incl. pixel mode) exit 0 | Met — 0 failures (18 /people@768 rows "never in view", unmeasured) |
| rag zero unauthored runts / zero ink clips / zero em dashes | Met — 0 / 0 / 0 over 99 passes (46 authored lockups listed) |
| states zero collisions | Met — 133 states, 0 collisions |
| census one rhythm ladder on the five chapters | Met — same ladder on all five |
| frames clean | Met — 6/6 CLEAN at 390 & 1440, 4× CPU (my own captures: P3-2 note) |
| perf | Met — home 97 · chapters 98–99 · people/about 99 · paintings 89–90 · map 64 (bar 63) |
| a11y 100 | Met — 100 on every route |
| keyboard walk complete | Met — a11y.md; my own Tab/Enter/Esc/arrow path on /paintings at 390/768/1024/1440/1920/720 |
| reduced-motion parity | Met — a11y.md + my pass at 390/1440 |
| live URL verified | Met — HEAD 480f715 = origin/v2, live HTML carries the v7 head wiring, 0 console errors on every route I visited (only the deliberate 404 on the 404 test) |

Note on the instruments: none of them caught the `/people` horizontal clip because it lives in `body.scrollWidth` (404) while `documentElement.scrollWidth` stays at the viewport width and the rag clip probe measures descenders only — worth a horizontal `Range`-rect-vs-viewport check in `rag.mjs`.

---

## Cross-check of juror 8's P2/P3 items on this build (read after my scores were written)

- **J8 P2-1 — museum plaque title runts at 1024×768 (`… · NARRATIVE / I`)** — **fixed.** The title is now an authored two-line lockup without the separator: `PETER / BALTIMORE'S / BARBERSHOP / NARRATIVE I` at 1024×768 (`t1024-mus-13-approach-8.png`), `WASHINGTON STREET FERRY LANDING / NARRATIVE I` at 768 (`t768-mus-06-approach.png`), `PETER BALTIMORE'S / BARBERSHOP / NARRATIVE II` at 1440/1920/720. No lone numeral anywhere I looked. (New, smaller: the eyebrow above it now breaks `NALLE / SERIES` in every landscape card — my P3-1.)
- **J8 P2-2 — a stop stays active after `Back` (Continue → 3.5 s → Back) and its pill floats over the 1858 plate** — **fixed.** I ran the exact sequence (walk → drag → `Continue` → 3.5 s → `Back`) at 360, 390, 768, 1024, 1440 and 1920: the overview comes back with no stop highlighted or labelled (`*-map-after-back.png`, `back.markers` in `*-map-notes.json` carry no active state), and opening `See Troy in 1858` afterwards shows nothing over the plate (`p390-map-lens-open.png`, `t768-map-lens-open.png`, `d1440-map-lens-open.png`).
- **J8 P3-1** (`/bakery` 390 player title truncates) — **fixed**: "Holeur's Fashionable / Bakery" on two lines (`p390-bakery-playing.png`).
- **J8 P3-2** (`Back to the hall` focused with a ring after a pointer approach) — **fixed**: after a mouse/touch approach and a mouse click on Back, focus is on `body` and no ring is drawn (`d1440-mus-01-approach-from-top.png`, `fromtop.focusAfterBackClick` in `*-museum-notes.json`); the ring appears only once a key has been pressed (`t1024-mus-13-approach-8.png`, taken after an Esc), which is the intended behaviour.
- **J8 P3-3** (hint chip on stop 4 at 390/1440/1920) — **still present** (my P3-3). The `5 BARBERSHOP` pill vs `BACK TO MAP` at 1024×768 mid-walk: not observed in my 1024 shots (settled stops frame mid-screen), not specifically re-timed.
- **J8 P3-4** (phone lens caption dangles a `·`; 720×450 `SEE TROY IN 1858` pill wraps) — **fixed** on both: `TROY, NEW YORK · 1858 / LIBRARY OF CONGRESS` at 360/390 (`p390-map-lens-open.png`), the pill is one line at 720×450 (`z720-map-overview.png`).
- **J8 P3-5** (`/people` eyebrows break after the separator at 768/1440) — **fixed at 1440** (all roles on one line, `d1440-ss-people-01.png`) **but the `nowrap` fix regressed the phone and tablet layouts**: at 360/390 the whole column overflows and clips (my P1-1), at 768 the role runs into the next column (my P2-1).
- **J8 P3-6** (844×390 head) — not re-checked (not a scored class).
- **J8 P3-7** (one bare frame during the document swap at 4× CPU) — **still present** in 2 of my 7 captures (my P3-2); page B never shows.
- **J8 P3-8** (chapter footer: three rule widths at 1440) — **still present** (`d1440-ss-bakery-08.png`: full-bleed top rule, disclaimer rule ≈ 80–1360, content at 136).
- **J8 P3-9** (lens viewer ≈ 69 % of the 1440 viewport) — **unchanged** (viewer ≈ 1328×668).
- **J8 P3-10** (phone map body swipe pans the map; index reached from the bottom lane) — **unchanged**, by design; not re-rated.

Net: both of juror 8's P2s are fixed on 480f715; three of the P3s are fixed (1, 2, 4), one is fixed at desktop but regressed below it (5 → my P1/P2), the rest are unchanged. The verdict above is FAIL because of the new P1 on `/people`, not because of anything juror 8 listed.
