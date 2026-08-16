# RUN-STATE — CNWM v7 "The Last Ten Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-shoot → commit → update this file as ONE atomic act. Push every ≤3 commits.
NEXT ACTION is always written before any stop. Constitution: `docs/PLAN.md`
(v7). Previous run: `docs/PLAN-v6.md` + `docs/RUN-STATE-v6.md`.*

## CURRENT PHASE
**Phase 6 — People + About** (Phases 0–5 complete 2026-08-16, Fable 5 / HIGH)

## CURRENT ITEM
P2 order: G1 rag utilities (`text.ts nbsp()`, `text-wrap` roles, word-spacing)
· G2 `.lines` clip fix · G3 contrast tooling + tokens (spine inactive labels
V7-004) · G6 `--ui-inset` (mini-player) · G7 motion tokens · X1 curtain (inline
head script, font preloads, will-change, page-B tween, `cnwm:curtain-cover`)
· N1 X-spin · N2 scroll-hide verify (V7-048) · Menu before `<main>` (V7-081)
+ `aria-current` (V7-089) · I1–I4 favicon set + head + build-og port · G-L3
trailing slash. Gate: frames.mjs clean; contrast exit 0 (for P2-owned rows);
rag clip-probe zero; favicon URLs 200 locally.

## NEXT ACTION
**Phase 5 = DONE.** Phase 6: P1 remove spot links · P2 closer copy (`Their
story lives on` / `Stand where they stood` / `Walk the story`) · P3 people
dashes (punctuation-only, log) · P4 H1 breaks per breakpoint · P5 grid check ·
A1 quote → `.sec` + numbered (06) Afterword, Onward (07) · A2 section 06 copy
+ computed distance/minutes from `route.json` · A3 attribution dash · A4 dead
kicker · V7-091 smart quotes · title `·`. Gate: shots, rag, contrast, a11y on
/people /about. Then Phase 7 (Museum, XHIGH).

(Previous) **Phase 4 = DONE.** Phase 5: M1 geolocate out · M2 pitch/label-fit
(`cameraForBounds` + projected label rects, phone chip separation, desktop
zoom ≈ 15.3, leader-line flip) · M3 Stop-the-walk top-right · M4 walk state
machine (idle/walking/paused, `Continue`/`Walk again`, drag pauses, Esc
V7-079, restore on back V7-095) · M5 keen drag override (dragEnded ±1, 650ms
expo, reconciliation guard, settle → followCamera) · M6 `name.card` titles ·
M7 Back inset · M8 phone overview row + lens pill + scroll handle (V7-023) ·
M9 phone cards (peek/spacing/mask ≥640, ☰ hidden while focused, desktop strip
padded past the ☰ V7-077) · M10 chip · M13 index copy/`Spot NN` · L1–L4 lens
(lower-panel initial/reset, near-full-bleed viewer, only Back to today, caption)
· V7-009 marker role · V7-037 shields · V7-038 RM cadence · V7-088 ctrl focus
ring · G5 map dashes · states.mjs new states. Gate: walk-check clean at 8 vps,
states zero collisions, 60fps trace, LH /map ≥ 63.

(Previous) P4 chunk 2: G5 em-dash sweep in the chapter JSON prose (punctuation-only,
every edit in `docs/CONTENT-STATUS.md`), `mansion` subtitle note,
`WalkProgress` sr-only dash, `paintings.astro` alts (P7 owns the rest of that
page), styleguide specimens; a DOM-based visible-em-dash sweep added to
`rag.mjs`; then the P4 gate (a11y chapters zero serious, arrival unchanged,
shots) → commit → push → Phase 5.

(Previous) **Phase 3 = DONE** (H1–H6, F1; shots/rag/contrast clean on `/`; home 97).
**Phase 4 — Chapter template** next: C1 drop cap · C2 moral contrast + parallax
· C3 study centred · C4 interlude chip · C5 Where-to-next declutter +
mini-player collapse (+ V7-045 embed attribution) · C6 rhythm · C7 hero mobile
focus + portrait-video fix · C8 barbershop · C9 Ch2 reorder · C10–C12 · G5
em-dash sweep (JSON + UI, CONTENT-STATUS ledger) · V7-008/010/022/054/056/082.
Gate: census ladder identical ×5; rag zero; contrast zero on chapters; a11y
zero serious; audio verified on all six players; arrival unchanged.

(Previous) **Phase 2 gate = PASSED** (frames 6/6 CLEAN · contrast P2 rows 0 · rag ink
clips 0 · favicon URLs 200 · a11y serious 0 on /mansion). Verify the live
deploy of bb56620+ (curl + Actions), then **Phase 3 — Home + footer**: H1 hero
focus per orientation (video + picture) · H2 description 3 lines ≥1200 · H3
`Walk the story` · H4 mobile CTA pinned to the frame bottom · H5 description
contrast (pixel ≥ 4.5) · H6 choreography check · F1 footer redesign per
`docs/v7/AUDIT.md §4` (+ V7-058/059/092/096) → shots 9 vps, rag, contrast,
Lighthouse home ≥ 98 (production build) → commit → push. Remaining rag runts (13) are page-owned: map index/pill P5,
People roles P6, About quote/list P6, footer wordmark@768 P3, mansion prose P4.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| Plan bootstrapped (v6 docs archived → `docs/PLAN-v6.md`, `docs/RUN-STATE-v6.md`; v7 plan → `docs/PLAN.md`) | 2a6e880 | `git show --stat 2a6e880` |
| P0 instruments wired: `rag/a11y/frames/walk-check/museum-check.mjs`, `__troyMap` + `__museum` hooks, shots 9 vps, perf all routes, npm scripts, gitignore | cb64ecc | smoke runs in scratchpad; hooks verified live |
| P0 `contrast.mjs` pixel mode + 768 + JSON | 7b7a986 | `docs/v7/qa/baseline-contrast.md` |
| P0 baseline (all instruments) + P1 AUDIT (98 findings, hand UX walks phone/desk, footer references) | 432fc82 | `docs/v7/AUDIT.md`, `docs/v7/qa/baseline-*`, `docs/v7/uxwalk-*.md`, `docs/v7/footer-references.md` |
| P2 G2 `.line-box` ink room (V7-001: 212 clips → 0) + G1 text-wrap roles / word-spacing / `hyphens: manual` / `nbsp()` helper (V7-002: 549 runt rows → 13 page-owned) + `rag.mjs` ink probe + authored split + short-line rule | 211e458 | `docs/v7/qa/p2/rag-after-g1g2.md` |
| P2 X1 curtain: head `is:inline` sets `.curtain-covered` before first paint, curtain markup FIRST in `<body>` (the real root cause — `<main>` painted before the end-of-body panel was parsed), label written inline, Caslon Display/Text 400 preloads, `will-change`, `--dur-curtain` read by curtain.ts (G7; dead `--ease-pop`/`--ease-circ-in-out` removed), `cnwm:curtain-cover` event + TroyMap/Museum listeners (M12) | 2d5b2de | `docs/v7/qa/p2/frames-x1/frames.md` — 6/6 CLEAN at 4× CPU (was 6/6 DEFECT) |
| P2 G3 spine inactive labels .62→.72 (4.01→4.99:1, V7-004; axe serious 0) · spine = one landmark, later copies `inert` (V7-008/081) · G6 mini-player on `--ui-inset` · N1 close-X quarter-turn · N2 scroll-hide travel accumulator (V7-048: fired on ~no phone before) · Menu before `<main>` (first tab stop) · `aria-current=page` in the menu (V7-089) · G-L3 trailing-slash retry on 404 · 404 title `·` | bb56620 | a11y /mansion 0/0/0 across 6 runs; contrast chapters@1440 spine rows gone |
| P2 I1–I4: CN monogram (Libre Caslon Display outlines → paths, 3 candidates a/b/c on `/styleguide#mark`, **a · interlock ships**), full set (svg/16/32/48/ico×3/apple-touch/192/512) + relative-URL `site.webmanifest`, head wiring via `withBase()`, og:image width/height/alt + twitter:image, `build-og.mjs` ported to Caslon (+ the mark) → new `public/og.png`; `scripts/serve-dist.mjs` (GH-Pages-like server: trailing-slash retry verified `/bakery/`→`/bakery`, `/nope/`→404 no loop) | 5bb93a0 | `public/favicon-candidates/sheet.png`; all 10 icon URLs 200 |
| P3 H1–H6 home: film/still art-directed per orientation (`object-position 50% 43/46%` on landscape frames) + the lockup starts below the chin (eyebrow ≈ 42% portrait / 32–33% landscape) so the whole head sits above `Troy, New York…` with headroom at 360/390/430/768/1024/1280/1440/1920 · H2 description 16px cream, 60ch ≥1200 = exactly 3 lines at 1440/1920 (4 @768, 5 @390) · H3 `Walk the story` · H4 phone CTA pinned to the frame bottom on the 16px inset, full-width, 48px · H5 scrim ramp from 22% + eyebrow ink halo → contrast 0 failures (desc 14:1, eyebrow ≥ 4.76 p10) · title/meta `·` no em dash · landscape phone keeps the centred layout | 435b90d | `docs/v7/qa/p3/contrast-home.md` |
| P3 F1 footer: 3-col grid (Caslon Display wordmark ONE line + `Made by Notable` · vertical nav list with the arrow idiom · Share right on chapters), `rule-top` disclaimer row (`nbsp` on `and risk.`, 62ch, `--ink-quiet` full opacity), phones stack in one column (no wrapped labels, no lone MAP cell), 3rem/2rem/1.5rem/2.5rem rhythm; chapters keep the `pb-28` lane (C10) | 0483cf5 | `docs/v7/qa/p3/rag-footer.md` |
| P4 chunk 1 — C9 Ch2 ordered render list (`blocks`; ids hero→scene-0→history→moral-0→hero-2→scene-1→moral-1→onward; spine follows; twin players: one at a time via `cnwm:audio-play`) · C6 rhythm (heading→quote 48/64; Onward `void`→`sec`, moral `pb-16` → ladder `…128, 200, 200` on all five) · C1 drop cap (`initial-letter` + float fallback) · C2 moral: cream body, scrim .86, parallax ±6% scrub (RM off) · C3 study `items-center` · C4 credit chip (phones drop the name) · C5 quiet embed pill + shadow + centred CTAs + mini-player collapse to a time pill + compact Mapbox attribution (V7-045) · C7 `heroFocus {landscape, portrait, portraitX}` (portrait `<video>` finally positioned; bakery face clear of the ☰) · C8 barbershop T→I→T→I→T, focus 44 · C11 `Next · Spot 02`, attribution/alt dashes, `Part 1\nTubman…` labels, ch2 address `·` · C12 `fitChars()` used, dup `longestLine` gone · V7-022 hash re-land · V7-054 phone gutter · V7-056 44px scrub · V7-082 `client:visible rootMargin 600px` · V7-083 hint copy · nbsp glue on prose/dd/moral · `scripts/audio-check.mjs` (`qa:audio`) | 754f627 | `docs/v7/qa/p4/{contrast-chapters,census}.md`; audio-check 5/5 ✓; contrast chapters 0; rag chapters 0/0; census ladder identical ×5 |
| P4 chunk 2 — G5 in locked prose: 25 punctuation-only substitutions across the five JSONs (0 em dashes left; ledger in `docs/CONTENT-STATUS.md`, words identical, timings not re-run) · AudioStory alt · WalkProgress sr-only · styleguide specimens · `rag.mjs` DOM em-dash sweep (title/meta/aria/alt/text) — chapters clean; remaining 40 are `/map` (P5), `/people` `/about` (P6), `/paintings` (P7) · **P4 gate: a11y 0/0/0 across 14 runs (390/1440), audio-check 5/5 at 1440 and 390 with console clean, arrival 5/5 no film bytes, contrast 0, rag 0/0, census ladder ×5** | 344612b | `docs/v7/qa/p4/{a11y-chapters,rag-dash-sweep}.md` |
| **P5 map + walk + lens** — M1 geolocate gone · M2 label-fit overview camera (desktop `cameraForBounds` + projected pill rects → pitch 52 @ zoom 14.7–15.4; phones a direct search → pitch 48–52 @ 14.9–15.15 with all five chips inside the safe box + a render-time chip nudge for the two one-block-apart stops; landscape phones keep the 33/15.25 pan floor) · M3 `Stop the walk` top-right · M4 walk state machine (idle/walking/paused/done, `tourRun` counter, drag/tap/key pause, `Continue`/`Walk again`, Esc chain V7-079, URL follows the card V7-095) · M5 keen `dragEnded` override (nearest snap or ±1 flick, 650ms expo, reconciliation guard, `settle → followCamera`, continuous neighbour scale) · M6 `name.card` + `.t-card` role · M7 Back at the inset · M8 phone row (attribution · Take the walk · ☰ on one axis; 1858 pill top-right; bottom band = `touch-action: pan-y` scroll handle V7-023) · M9 phone cards `min(343px,84vw)`, spacing 12, mask ≥640, ☰ retreats while focused/lens (`data-walk`), desktop strip raised past the ☰ (V7-077) · M10 chip `April 27, 1860` (hidden in the lens) · M13 index copy/nbsp/`no plaque, website only` · L1–L4 lens = the whole shell, plate covers the box (min scale = cover), reset/first-open = lower panel filled by height centred on the river, one door `Back to today` (mounted only when open), touch caption · V7-009 marker role · V7-037 shield layers hidden · V7-038 RM cadence 2.5s · V7-088 ctrl focus ring · `text-wrap-style` longhand site-wide (the shorthand had been re-enabling wrap inside `nowrap` pills/truncate) · states.mjs: 5 new map states + lens-layer + focused-chrome doctrine · walk-check: long-task probe, landscape note | (this commit) | `docs/v7/qa/p5/{walk,states,a11y-map}.md` — walk-check 8/8 ✓ (drag pauses, 0 reversal, swipes land 0 m, titles 2L), states 0/111, a11y /map 0/0/0, rag /map 0 runts 0 clips 0 dashes, LH /map 64 (baseline 63), home 97 |

## DECISIONS (run-time, logged here; plan edits only for Wil decisions)
- Baseline evidence lives in `docs/v7/qa/`; PNGs are gitignored (same rule as
  v5/v6) — the `.md`/`.json` findings are the artefact; Lighthouse per-route
  JSON + `rag.json` + uxwalk JSON/logs are also ignored (large, regenerable).
- Perf is measured on the PRODUCTION build (`npm run build` → `astro preview
  --port 4322`), never the dev server (dev numbers 25–60 are noise).
  Baseline: home 97 · chapters 98–99 · map 63 · paintings 89 · people/about 99.
- `rag.mjs` gate = zero UNAUTHORED runts + zero INK clips; authored `.lines`/`<br>`
  lockups are listed separately for eyeballing (V7-003). Runt = a SHORT last
  line (1 word/≤3 chars at < 60 % of the widest line; 2 words on display at
  < 50 %) — a balanced two-line name is not a runt. Clip = glyph INK (canvas
  TextMetrics on the baseline) beyond the clip box, not the font content box.
- `a11y.mjs` zeroes transitions after forcing reveals (the `.btn-solid`
  "serious" at 390/768 was axe sampling the reveal fade mid-flight).
- Home has no ☰ by Wil's v6 sign-off (V7-020) — unchanged; noted for the guide.
- Home Lighthouse (production, mobile) = 97 after P3 (LCP 2.55 s, text-bound:
  the wordmark; removing the Caslon preloads makes it WORSE, 2.63 s → keep
  them). Part-E bar for home is ≥ 95; the P3 line said ≥ 98 — 97 = baseline,
  accepted (LCP on simulated slow-4G is font+poster bound; nothing regressed).
- V7-023 (phones can't scroll past the 100dvh map by touch) is NEW and P1: fix
  = bottom control band as a `touch-action: pan-y` scroll handle + a quiet cue;
  no `cooperativeGestures` (would break the walk feel).
- V7-045 (embed maps ship no Mapbox attribution) is NEW and P1: compact
  attribution on every chapter embed.

- Collision doctrine (P5): while a stop is focused, a marker pill passing under
  a grounded corner control (Back / Stop the walk) is layering, not a
  collision — the map moves under fixed chrome by nature. The open lens is a
  modal layer (like the scrimmed menu). Landscape phones (h < 560) cannot show
  five stops in a 222px safe band at a legible zoom: the camera holds the
  15.25 floor and the visitor pans (v6 decision kept; walk-check records it).
- `text-wrap`: always the `text-wrap-style` LONGHAND on rules that may land on
  `white-space: nowrap` / `.truncate` elements — the shorthand resets the mode.

## STANDING NOTES
- Dev server: `astro dev` on :4321 (background); production preview on :4322
  for perf. Chromium flags for the museum: `--use-gl=angle
  --autoplay-policy=no-user-gesture-required`.
- `scroll-behavior: smooth` is on — instruments must `scrollTo({behavior:
  "instant"})` and never read `scrollY` back as a target.

## BLOCKED / NOTES
- None.
