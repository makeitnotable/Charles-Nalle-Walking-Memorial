# CNWM v7 — "The Last Ten Percent" · Review guide for Wil

Run: 2026-08-15 → 2026-08-16, one autonomous session (Fable 5), from your
page-by-page review of 8/15. Constitution: `docs/PLAN.md`; ledger:
`docs/RUN-STATE.md`; the audit that preceded every fix: `docs/v7/AUDIT.md`
(98 findings). Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
— every push to `v2` deploys; live = HEAD was verified before the juror passes.

Nothing in Kathy's copy changed except punctuation (em dashes → commas /
colons / parentheses, zero word changes; ledger in `docs/CONTENT-STATUS.md`,
courtesy note for Kathy below). Audio timings were not re-run — the words are
identical.

## 1 · What you asked for, and what shipped (Part A → done)

Evidence: `docs/v7/qa/baseline-*` (before) vs `docs/v7/qa/final/` (after);
per-phase evidence in `docs/v7/qa/p2…p7`. Screenshots are regenerable and
gitignored; the `.md/.json` findings are committed.

| # | You said | Shipped |
|---|---|---|
| H1 | Move the splash image down; whole head above "Troy, New York…" | The film/still is art-directed per orientation (`object-position 50% 43/46%` on landscape frames) and the lockup now starts below the chin (eyebrow ≈ 42 % on phones / 32 % on desktops) — head whole with headroom at 360/390/430/768/1024/1280/1440/1920; landscape phones keep the centred layout. |
| H2 | Description rag ≈ 3 lines | 60ch at ≥1200 → exactly 3 balanced lines at 1440/1920 (4 at 768, 5 at 390); 16 px cream on a deeper film — measured ≥ 4.5:1 by pixel (was 2.6–3.1). |
| H3 | "Walk the story" | Home, People closer, About closer all read `Walk the story`. |
| H4 | Mobile CTA bottom-aligned, consistent margins | Pinned to the frame's bottom on the 16 px content inset, full-width, 48 px. |
| X1 | Curtain jitter/flash | Root cause: page B painted before the curtain markup at the END of `<body>` was parsed. Curtain now first in `<body>` + an inline head script sets the covered state before first paint; font preloads; `--dur-curtain` token; the map/museum go quiet under the cover. `frames.mjs`: 6/6 CLEAN at 4× CPU (was 6/6 DEFECT, 2–4 uncovered frames each). |
| M1 | Remove the location icon | Gone at every breakpoint. |
| M2 | More 3-D | Label-fit camera: pitch 52 (desktop, zoom 15.0–15.4) / 48–52 (phones, zoom 14.9–15.15) with every marker label inside the safe box; all five chips on the phone overview (was 4). Landscape phones hold the 15.25 floor and pan (a 222 px band cannot hold five). Note: the Studio style has no `fill-extrusion` layers — 3-D buildings would be a change to the style on your Mapbox account. |
| M3 | Stop-the-walk top-right | Top-right at the inset on every breakpoint, mirroring `Back`. |
| M4 | Dragging stops the auto-walk | Walk is a state machine: any drag/tap/key pauses; button reads `Continue`; `Walk again` after stop 5; Esc chains lens → walk → overview; the URL follows the card so Back restores your stop. |
| M5 | Card drag felt forced | keen-slider's hard-coded 500 ms quintic replaced: nearest snap or ±1 on a real flick, 650 ms house curve, no snap-back (measured 0 reversal), map follows on settle. |
| M6 | Two-line card titles | `Holeur’s / Fashionable Bakery`, `Commissioner’s / Office` (new `name.card`), `.t-card` role. |
| M7 | Back button spacing | `Back to map` on the equal inset (phones: `Back`). |
| M8 | Mobile map controls / hamburger row | One bottom row on the ☰'s axis: (i) · `Take the walk` · ☰; `See Troy in 1858` is a top-right pill; the bottom band is a scroll handle so the page below is reachable by touch (it wasn't). |
| M9 | Mobile cards | Fully opaque neighbours peeking ≥ 16 px, positive spacing, continuous 0.92→1 scale; ☰ retreats while a stop is focused; desktop strip raised clear of the ☰. |
| M10 | Chip copy | `April 27, 1860` (hidden while the lens is open). |
| L1–L4 | 1858 map | The viewer is the whole map shell within the inset; opens (and resets) on the LOWER PANEL — downtown Troy, the Hudson, West Troy — filled by height, centred on the river; the full plate stays reachable by panning (Kathy); only `Back to today` remains; touch caption. |
| C1 | Drop cap | Storybook initial on the first paragraph of every part (`initial-letter: 3`, floated fallback). |
| C2 | Moral: white body + parallax | Body cream like the heading; scrim deepened to measure; the ground drifts ±6 % on scroll (off under reduced motion). |
| C3 | Study centred | Sketch and caption share a centre line. |
| C4 | Archival label | On a chip that measures ≥ 4.5:1 on every photo (was 1.0–2.3); phones drop the place name; wipe reveal kept, no parallax. |
| C5 | Where to next declutter | Embed map has depth (shadow), quiet dark pill with an orange numeral, CTAs centred under the map, mini-player collapses to a time pill once the transcript is behind you — one orange: `Continue`. Mapbox attribution added to the embed (a licence requirement it lacked). |
| C6 | Rhythm | Heading→quote 48/64; moral→Onward 264 desktop / ~190 phone (was 560/500); one ladder on all five chapters (`census`). |
| C7 | Hero on mobile / burger | Per-orientation focus (`landscape · portrait · portraitX`); the portrait film finally positioned; bakery's face clear of the ☰. |
| C8 | Barbershop | Order T→I→T→I→T; focus 44 (faces whole); label chip; clipped J fixed (see G2). |
| C9 | Ch2 order | Part 1 → History → Moral 1 → Part 2 → Moral 2 → Onward; spine follows; twin players never overlap. |
| F1 | Footer | 3-column grid, one-line Caslon wordmark, vertical nav, rule-top disclaimer (no runt), phones stack in one column. |
| N1/N2 | Menu | Close-X quarter turn; scroll-hide now actually fires on touch (it never did — it needed a single 24 px scroll event); menu is the first tab stop; current page marked. |
| P1–P5 | People | Spot links removed; `Their story lives on / Stand where they stood / Walk the story`; H1 `ONE DAY. A WHOLE / CITY'S CAST.` from 1280 px, three lines below (never `CAST.` alone); notes punctuation-only. |
| A1–A4 | About | Quote is section (06) Afterword at one section gap; (07) `Two and a half miles. One day in 1860.` + the informative sentence (distance/minutes computed from `route.json`); `On the sidewalk` rendered. |
| U1–U10 | The Museum | Rail pitched down (floor moves), works closer, entry wall + threshold + glow visible from the start, 360° look with `Face forward`, keyboard walking, painting centred on approach with the card left / study right and one button, tap or zoom to bring it to life (Easter egg; invisible focusable toggle for keyboard/SR), phone peek-sheet, TRUE aspects (the portrait Narrative II hangs tall), Louvre-ish finish under 80 draw calls at 60 fps. |
| I1–I4 | Favicon | The CN mark — Caslon Display outlines, three candidates on `/styleguide#mark` (**a · interlock** ships; b/c are yours to pick instead), SVG/PNG/ICO/apple-touch/manifest, og.png regenerated in Caslon. |
| G1/G2/G3 | Rag · clips · contrast | `rag.mjs`: 0 unauthored runts, 0 ink clips, 0 visible em dashes at 9 viewports (from 549/212/47); `contrast.mjs` (pixel mode): 0 failures at 390/768/1440 (from 197). |
| G5 | Em dashes | Gone everywhere; 25 punctuation-only edits inside Kathy's prose (ledger). |

## 2 · Instrument bars on the final build

See `docs/v7/qa/final/` and the DONE table in `docs/RUN-STATE.md`
(a11y 0/0/0 across 51 runs · states 0/132 · census one ladder ×5 · perf on the
production build: home 97 · chapters 98–99 · map 64 · paintings 89–90 ·
people/about 99).

## 3 · Juror passes

Protocol: `docs/v7/JUROR-PROMPT.md` — a fresh agent per pass, no source
reading before scoring, live URL, six viewports (390/360 · 768/1024 ·
1440/1920) plus 844×390 and 720×450 (200 % zoom) spot checks, real touch via
CDP, screencasts at 4× CPU for the curtain. Two consecutive clean passes on the
identical build end the run; only P2/P3 fixes may land between them. Reports:
`docs/v7/juror-pass1.md` … `juror-pass10.md`; their scripts `scripts/juror*-*.mjs`.

| pass | build | Sheet A (design·usability·creativity·content) phone / tablet / desktop | P0/P1 | verdict → what changed |
|---|---|---|---|---|
| 1 | a8328c8 | 8·7·9·9 / 8·7·9·9 / 8·9·9·9 | 2 P1 | FAIL — the portrait work rendered 1.5:1 in production (`sharp` path resolved from the module, not `process.cwd()`), the phone peek-sheet was dead to touch (pointer capture on the sheet; touch emulation delivers only `click`) → both fixed. |
| 2 | 50f9fcb | 7·8·9·9 / 8·8·9·9 / 9·9·9·9 | 1 P1 | FAIL — my `nbsp()` glue clipped the map index titles at 390 → authored two-line names, never glued; also the walk marker over the card strip on landscape/1024 (`cardLift` + labels fade under the strip). |
| 3 | 3396185 | 9·8·10·9 / 9·9·10·9 / 9·9·10·9 | 0 | FAIL on Sheet B only — C2 body colour still peach (an unlayered `.t-prose` role beat the utility) and the phone pill hid through the footer → fixed (pill shrinks to the round button instead). |
| 4 | eae5219 | 9·8·9·9 / 7·8·9·9 / 9·9·9·9 | 1 P1 | FAIL — museum chip under the `Skip the hall` pill at 640–830 → chip lane right of the pill; P2s: walk/focus scroll the shell into view, sheet layout reserves the dot rail, footer lane 8rem, lens takes focus. |
| 5 | 9fd4401 | 8·9·9·9 / 8·9·9·9 / 9·9·9·9 | 1 P1 | FAIL — the phone chip wrapped to three lines in the tablet lane → phones get their own row under Skip, `nowrap`; P2: chapter footer nav ≥ 15rem + `nowrap`. |
| 6 | df0ee6c | 9·8·9.5·9.5 / 8.5·8.5·9.5·9.5 / 9.5·9·9.5·9.5 | 0 | **PASS** — three P2s fixed between passes (mini-player when the main control is off-screen above; museum composition fits the frame; 13rem card floor at 200 % zoom + full-width button) → c586a93, c202f20. |
| 7 | c202f20 | 9·8·9·9 / 9·8·9·9 / 9·7·9·9 | 1 P1 | FAIL — clicking a painting from the page top (desktop / tablet-landscape) opened the inspect view cropped, `Back` below the fold, wheel captured → `approach()` scrolls the sticky stage flush first. Also: desktop map wheel is cooperative (plain wheel scrolls the page, ⌘/Ctrl+wheel zooms), M9 peeks 17/19 px, 1024×768 painting 2× wider, 1858 pill backdrop, index title fits at 360. Count restarted. |
| 8 | 29e69f4 | 9·9·9·9 / 8·9·9·9 / 9·9·9·9 | 0 | FAIL on Sheet B only — the plaque title runted `· NARRATIVE / II` in the 13rem card at 1024×768 (now an authored two-line lockup: name, then variant) and a walk-state race (`Back` ~3.5 s after `Continue` left the stop lit; the strip's settle now no-ops when unfocused). P3s: scripted focus only after keyboard input, lens caption two lines on phones, 1858 pill/people roles `nowrap`, bakery player title two lines at 390. |
| 9 | {{PASS9_BUILD}} | {{PASS9_SHEET}} | {{PASS9_P01}} | {{PASS9_VERDICT}} |
| 10 | {{PASS10_BUILD}} | {{PASS10_SHEET}} | {{PASS10_P01}} | {{PASS10_VERDICT}} |

Retell moment, every pass: the Museum (the walk down the hall, `Face forward`,
the approach that centres the painting with the plaque left and the study
right, and the tap that brings the crowd to life).

{{PASS_NOTES}}

## 4 · Residual P2/P3 (nothing here blocks anything)

- (Closed) The intermittent React hydration-mismatch warning on chapter pages
  was root-caused during the juror loop — the scrub's `var()` gradient in a
  React style object — and fixed with a `--pct` custom property; the console is
  clean in dev and production.
- Phones: the full-viewport map takes one-finger swipes as pans; the page
  below is reached from the bottom control lane (the scroll handle + chevron,
  your M8 answer). Two-finger cooperative panning would change "drag to
  explore" — yours to call (§5). Desktops now scroll on a plain wheel and zoom
  on ⌘/Ctrl + wheel (juror pass 7).
- Map, small nits jurors listed as P3 and left: the 1920 overview's Ferry
  Landing label, hint chip and doors sit within ~10 px of each other; a
  world-anchored stop label can pass under `Stop the walk`/`Continue`
  mid-flight; the Where-to-next embed flies in for 2.6 s (v4 arrival, kept).
- Landscape phones (844×390): the map overview cannot hold five stops in a
  222 px safe band at a legible zoom — it holds the 15.25 floor and pans
  (v6 decision, kept).
- Home has no ☰ (your v6 restraint sign-off) — the CTA is the only door.
- The last stop's Where-to-next loops to Spot 01 (no "you've walked the five"
  state) — a content decision, yours (below).
- Story paragraphs vs the quote/heading column sit on the v4 editorial rail
  (a horizontal jog on wide screens) — intentional, unchanged.
- The Museum's rail chip on phones is `Scroll to walk`; the walk-by-keyboard
  is `↑/↓`/`W/S`.

## 5 · Human queue (yours / Kathy's / Brian's)

- **Kathy** — courtesy note: 25 punctuation-only edits inside her prose (em
  dashes → commas/colons/parentheses; zero word changes; the audio matches
  word for word) — table in `docs/CONTENT-STATUS.md` (v7 sections). Also the
  player's subtitle reads the canonical `Uri Gilbert Home` (the JSON's data
  label still says Mansion; nothing visible).
- **Wil** — the phone map's one-finger pan vs page scroll: keep "drag to
  explore" (today; the bottom lane scrolls) or switch touch to two-finger
  cooperative panning (one flag: `cooperativeGestures` for coarse pointers too);
  favicon pick if you prefer b (cameo) or c (step) over a
  (`/styleguide#mark`); `quote.source` and mansion `portal.hook` are authored
  but never rendered (render or delete); a "walk complete" state on the last
  chapter's Where-to-next; footer content additions the desk juror suggested
  (institution line, © year) — you said same content, so not shipped; 3-D
  buildings on /map need `fill-extrusion` layers in your Studio style; Vercel
  dashboard deletion (still on you); handoff playbook (museum GitHub → transfer
  → Mapbox → mappings → QR release → zip backup).
- **Brian Tolle** — plaque typo `ONCE HOUSE THE` → `HOUSED` before etching
  (unchanged, still open).

## 6 · How to re-run everything

`astro dev` on :4321, then `npm run qa:rag / qa:a11y / qa:frames / qa:walk /
qa:museum / qa:audio / qa:states / qa:contrast / qa:shots / qa:census /
qa:probe / qa:arrival`; perf on the PRODUCTION build (`npm run build` →
`astro preview --port 4322` → `node scripts/perf.mjs --base http://localhost:4322`);
`node scripts/serve-dist.mjs` = a GH-Pages-like server for 404/trailing-slash
checks; `npm run build:favicon` / `build:og` regenerate the icon set / og.png.
The juror protocol is `docs/v7/JUROR-PROMPT.md`.
