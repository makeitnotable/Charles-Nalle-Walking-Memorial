# RUN-STATE — CNWM v7 "The Last Ten Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-shoot → commit → update this file as ONE atomic act. Push every ≤3 commits.
NEXT ACTION is always written before any stop. Constitution: `docs/PLAN.md`
(v7). Previous run: `docs/PLAN-v6.md` + `docs/RUN-STATE-v6.md`.*

## CURRENT PHASE
**Phase 8 — The Gate** (Phases 0–7 complete 2026-08-16, Fable 5)

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
**Juror pass 8 = FAIL on Sheet B only** (`docs/v7/juror-pass8.md`, build 29e69f4;
Sheet A phone 9/9/9/9, tablet 8/9/9/9, desktop 9/9/9/9; ZERO P0/P1; all
instrument bars met; juror-7 P1 + P2-1 + four P3s confirmed fixed). Two P2s,
fixed: (1) museum plaque titles runted `· NARRATIVE / II` in the 13rem card at
1024×768 (and `Part / 2` at 844×390) → the plaque is an authored two-line
lockup (name, then variant on its own line; `KEY_TITLES` numerals glued for
every other context) — verified 5 lines/no runt at 1024×768; (2) walk-state
race — a step's programmatic `moveToIdx` was still in flight when `Back` landed
~3.5 s after `Continue`, and its `animationEnded`/`slideChanged` relit the stop
(pill over the 1858 plate) → `settle()`/`slideChanged` no-op when the strip is
not focused — verified 0 active markers after the exact repro. P3s fixed:
scripted focus (Back / dot) only after keyboard input; lens caption two
authored lines on phones; 1858 pill `nowrap` (720×450); people roles
`nowrap`; bakery player title two lines at 390 (no ellipsis). Regression: walk
8/8 · rag 0/0/0. Next: commit → push → verify live → **juror pass 9** (fresh)
→ if PASS → **juror pass 10** (fresh, identical build) → REVIEW-GUIDE §3 →
memory → push. (Pass 8 was not clean, so — as after pass 3 — the next two must
both PASS.)

(Earlier) **Juror pass 7 = FAIL** (`docs/v7/juror-pass7.md`, build c202f20; Sheet A phone
9/8/9/9, tablet 9/8/9/9, desktop 9/7/9/9; one P1 = on desktop / tablet-landscape
the museum's inspect view opened cropped when the painting was clicked from
the page top (stage half under the header; `Back` below the fold; wheel
captured) → `approach()` now scrolls the stage flush first (all classes,
past-the-end too); verified stage top 0 / Back visible / painting inside at
1440·1024·768·1920 from both positions (`docs/v7/qa/j7fix/`). Also fixed:
desktop map wheel is cooperative (P2-1, DECISIONS), M9 peeks 17/19 px (Sheet B
"Not met" → Met), 1024×768 painting 442 px wide (P3-8), 1858 pill backdrop
(P3-3), map index title fits at 360 (P3-6). Left as documented residuals /
human queue: phone one-finger map pan (P2-2 → Wil), 844×390 head (P3-1), 1920
overview stack (P3-2), labels under Stop/Continue mid-flight (P3-4), embed
fly-in (P3-7). Regression: walk 8/8 · museum 5/5 · states (see log).
Next: commit → push → verify live → **juror pass 8** (fresh) → if PASS →
**juror pass 9** (fresh, identical build) → REVIEW-GUIDE §3 → memory → push.
The count restarted (P1 fix).

(Earlier) **Juror pass 6 = PASS** (`docs/v7/juror-pass6.md`, build df0ee6c; Sheet A
phone 9/9/9/9, tablet 9/9/9/9, desktop 9/9/9/9; ZERO P0/P1; Sheet B all Met;
retell = the Museum). Its three P2s + one P3 fixed (P2/P3 fixes may land between
the two passes): the mini-player now shows whenever the main control is
off-screen above OR below (Ch2 Part 2 → scroll up), the museum composition fits
the frame at every aspect (portrait Narrative II no longer clipped by the card at
1024×768), the desktop card keeps a 13rem floor at 200 % zoom (720×450) and its
`Back to the hall` button goes full-width inside narrow cards, the `· KEY`
separator travels with the subtitle → **c586a93 + c202f20**, pushed, live
verified (Museum bundle carries `clamp(13rem` and `lg:w-auto`). **Juror pass 7
running** (fresh agent, build c202f20, `docs/v7/juror-pass7.md`). If PASS →
REVIEW-GUIDE §3 (fill `{{JUROR}}`) → RUN-STATE "RUN COMPLETE" → memory → push.
If FAIL with P0/P1 → fix → push → verify live → two fresh passes again; if only
P2/P3 → fix, push, juror pass 8.

(Earlier) **Juror pass 5 = FAIL** (`docs/v7/juror-pass5.md`; Sheet A phone 8/9/9/9,
tablet 8/9/9/9, desktop 9/9/9/9; one P1 = the phone museum chip wrapped to
three lines in the lane I made for tablets → phones now get the chip on its
own row under the Skip pill (full width, centred, `nowrap`); tablets keep the
lane right of Skip; measured clean at 360/390/640/720/768/1024. P2 fixed:
chapter footer nav column ≥ 15rem + `nowrap` labels at 768 (with Share).
Next: push → verify live → **juror pass 6** (fresh) → if PASS → **juror pass
7** (fresh, identical build) → REVIEW-GUIDE §3 → memory → push.

(Earlier) **Juror pass 4 = FAIL** (`docs/v7/juror-pass4.md`; Sheet A phone 9/8/9/9,
tablet 7/8/9/9, desktop 9/9/9/9; one P1 = the museum rail chip under the
`Skip the hall` pill at 640–830 px (my tablet copy tier was too wide) → the
chip now lives in the free lane right of the pill below lg with the short
copy; measured clear at 390/640/720/768/830/1024. P2s fixed: entering the
walk/focus from a scrolled page scrolls the shell into view; the sheet layout
reserves the dot rail so the tall portrait clears it at 768; chapter footer
lane 8rem so the pill never touches the disclaimer at 1440; lens takes
keyboard focus on open. Next: push → verify live → **juror pass 5** (fresh) →
if PASS → **juror pass 6** (fresh, identical build) → REVIEW-GUIDE §3 →
memory → push.

(Earlier) **Juror pass 3 = FAIL on Sheet B only** (`docs/v7/juror-pass3.md`; Sheet A
9/8/10/9 phone, 9/9/10/9 tablet, 9/9/10/9 desktop; ZERO P0/P1; all
instrument bars met; retell = the Museum on a phone). Two P2s, fixed:
C2 body colour (the unlayered `.t-prose` role beat the `text-neutral-12`
utility → `.moral .t-prose { color: neutral-12 }`; verified rgb(246,243,238))
and the phone pill that hid through Onward+footer while playing (it now
shrinks to the round play/pause button while the CTA row is on screen; never
hidden). Next: push → verify live → **juror pass 4** (fresh) → if PASS →
**juror pass 5** (fresh, identical build) → REVIEW-GUIDE §3 → memory → push.

(Earlier) **Juror pass 2 = FAIL** (`docs/v7/juror-pass2.md`; Sheet A phone 7/8/9/9,
tablet 8/8/9/9, desktop 9/9/9/9; retell = the Museum; both juror-1 P1s and
most P2s confirmed fixed). P1 (fixed): the phone map index clipped titles —
my `nbsp()` glue on the names; index now shows the authored `name.card`
lines, never glued. Landscape/short-viewport walk overlap (fixed): the
followed stop is LIFTED half a strip above the cards at every viewport
(`cardLift`, capped for landscape phones); markers whose label falls under
the strip fade while focused. P2s (fixed): lens + interlude captions keep
`Library of Congress` together; the phone pill steps aside while the Onward
CTA row is on screen; rag exempts ≤20-char two-line names; walk-check M9 in
screen space. Gates after: walk-check 8/8, states 0/127 (browser per
viewport), museum 5/5, audio 5/5 ×2, rag /map,/ch2 0. Next: push → verify
live → **juror pass 3** (fresh) → if PASS → **juror pass 4** (fresh, same
build) → REVIEW-GUIDE §3 → memory → push.

(Earlier) **Juror pass 1 = FAIL** (`docs/v7/juror-pass1.md`; Sheet A 8/7/9/9 phone,
8/7/9/9 tablet, 8/9/9/9 desktop; retell = the Museum). P1s, both fixed:
(1) U8 aspects fell back to 1.5 in the PRODUCTION build (module-relative
`import.meta.url` path under `astro build`) → resolved from `process.cwd()`;
verified in `dist/paintings.html` (0.6667 / 1.5 / 1.7778); (2) the phone
peek-sheet was dead to touch (pointer capture set on the sheet, handlers on the
header) → capture on the header + click fallback; tap/tap/drag verified by CDP
touch. P2s fixed: dot rail rides the measured sheet height; chip copy tiers so
it never meets the Skip pill; footer lane (`pb-28` had lost to the scoped
rule → `data-audio`); phone card strip raised past the stacked (i)+logo; hero
headroom (39 % / 42 %). P3s: play labels per part, `Back to map` spacing,
lens caption + museum eyebrow dots glued, og:image:alt. Next: states/a11y
re-run → commit → push → verify live aspects → juror pass 2 (fresh) → if PASS
→ juror pass 3 (fresh) on the same build → REVIEW-GUIDE §3 → memory → push.

(Earlier) Phase 8 in flight: final evidence regenerated (above); live = HEAD site
output verified by curl markers (`--pct`, P5/P6/P7 strings); **juror pass 1
launched** on the live build (fresh agent, `docs/v7/JUROR-PROMPT.md`) →
report at `docs/v7/juror-pass1.md`. If PASS → juror pass 2 (different fresh
agent) on the identical build → if PASS → fill REVIEW-GUIDE §3, final memory
update, push. If FAIL on P0/P1 → fix → push → verify live → restart the count.
Rule: never run a browser instrument while a juror runs; never let a
foreground call time out during any Playwright run.

(Previous) **Phase 7 = DONE.** Phase 8: (1) regenerate ALL evidence on the final build
(shots 9 vps → `docs/v7/qa/final-shots`, probe, states (all vps incl. museum
+ walk), census, contrast, rag, a11y, frames, walk, museum, audio, arrival,
perf on the production build) → fix any regression → commit; (2) push + verify
live = HEAD (curl + Actions); (3) two consecutive fresh-juror passes (Sheet A
+ Sheet B) on the identical build, P2/P3 fixes only between; (4) live
end-to-end verify (routes, icons, a chapter walk-through, museum, console);
(5) `docs/v7/REVIEW-GUIDE.md` (before/afters, both sheets, residual P2/P3,
human queue), CONTENT-STATUS/DEVIATIONS/HANDOVER touch-ups, memory update.

(Previous) **Phase 6 = DONE.** Phase 7 (Museum, `src/components/Museum.tsx` +
`src/pages/paintings.astro`), in the plan's implementation order: 1 build-time
aspects (U8: sharp metadata → `Work.aspect`/`sketchAspect`, grid tile
aspect-ratio) → 2 constants + rail + entry wall + sketch side + plane sizing
(U1/U2) → 3 debug hook extensions + IO/visibility + pointercancel +
touch-action → 4 look controller + keyboard + Face forward (U4/U5) → 5
approach composition + zoom + tap toggle + desktop card (U6) → 6 phone sheet
(U7) → 7 finish pass (U3) → 8 lanes/insets/copy (U10) → 9 threshold (U9,
stretch) → 10 docs. Each step verified by `scripts/museum-check.mjs`; gate:
museum states in states.mjs, 60fps traces 390/1440, perf /paintings ≥ 80/70,
a11y 100, RM grid parity, portrait work at true aspect. Then Phase 8 (gate).

(Previous) **Phase 5 = DONE.** Phase 6: P1 remove spot links · P2 closer copy (`Their
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
| **P6 People + About** — P1 spot links removed · P2 closer `Their story lives on` / `Stand where they stood` / `Walk the story` · P3 five people.ts notes punctuation-only (ledger in CONTENT-STATUS) + blurbs/meta/title · P4 H1: three authored lines < 1280, `ONE DAY. A WHOLE / CITY'S CAST.` full-shell from xl with the intro tucked in the right column · roles/notes nbsp · A1 quote → section (06) Afterword at one section gap, attribution without the dash, `.t-quote-long` · A2 (07) closer `Two and a half miles. One day in 1860.` + informative sentence, distance/minutes from `route.json` · A3/A4 kicker `On the sidewalk` rendered · list titles/bullets nbsp · 404 `it’s` | fb5e6ad | `docs/v7/qa/p6/{rag,contrast,a11y}.md` — rag 0/0/0 dashes at 6 vps, contrast 0, a11y 0/0/0 |
| **P7 The Museum** (`Museum.tsx` rewritten; `paintings.astro`) — U8 build-time aspects (sharp; portrait Narrative II 0.667 hangs tall, 16:9s wide; grid tiles at real aspect) · U1 rail pitch −0.10/−0.08 · U2 SPACING 5, OVERRUN 1.5, END_GAP 6, far 80, fog 8→32, entry wall, doorway + 3 steps + glow (U9) · U3 finish: plank floor with sheen band, plaster walls with baked baseboard/cornice, coffered ceiling, moulding + gilt lip (vertex-lit tops) + slip; 74–76 draw calls, 0 long frames at DPR 1.5 · U4 unbounded yaw + inertia, pitch clamp, `Face forward`, double-tap recentre · U5 keyboard ←/→ ↑/↓ W/S Enter Esc +/− · U6 per-frame `compose()`: painting centred (cx 0.50), fov widens to 84° instead of leaving the corridor, card left no border one button, sketch screen-right on both walls, tap/zoom Easter egg (edge-triggered ≥1.35/≤1.20) + invisible focusable toggle over the projected rect · U7 phone + portrait-tablet peek-sheet (pointer drag, velocity settle, tap toggles, keyboard), Back top-left, dot rail rides above the sheet · U10 Skip top-left on `--ui-inset`, chip copy, IO/visibility/curtain/pagehide split, `pointercancel`, `touch-action`, disposal, lead fallback hidden under the stage, RM note above the grid (V7-090), focus: Back on approach / the dot on return (V7-080), states.mjs museum states + GL flags · perf /paintings 89–90 (build chunked across idle callbacks; was 78–85 unchunked) · a11y /paintings 0/0/0 · MOTION.md exceptions | 3b27817 | `docs/v7/qa/p7/{museum,a11y-paintings}.md` — museum-check 5/5 ✓ |
| **P8 final evidence on 3b27817+** (`docs/v7/qa/final/`): a11y **0/0/0 across 51 runs** (11 routes × 3 vps + 6 states, keyboard walks all rings visible, RM parity, 200 % no overflow) · states **0/132** (incl. the v7 walk/lens/museum states) · census one ladder ×5 (`…128, 200, 200`) · contrast **0 failures** (style + pixel, 11 × 3) · rag **0 unauthored runts · 0 ink clips · 0 visible em dashes** at 9 vps (map viewport excluded as a clipper — markers at the map edge are geography) · walk-check 8/8 (one 100 ms long task during a drag at 430 on the DEV server — noted) · museum-check 5/5 · audio-check 5/5 at 1440 and 390 · arrival 5/5 no film bytes · production perf: home 97, chapters 98–99, map 64, paintings 89–90, people/about 99 · probe 0 collisions/0 errors (the /404 route's own 404 only) · frames 5/6 CLEAN (map-card@390, Continue, home-door at 390+1440; map-card@1440 = harness NO-NAV, not a curtain frame) · shots: 9 vps × 11 routes captured across runs (PNGs gitignored; Chromium's network service died ~15 min into long runs — evidence only) | 37e3036 + b1fc7b7 | `docs/v7/qa/final/*.md` |
| **P5 map + walk + lens** — M1 geolocate gone · M2 label-fit overview camera (desktop `cameraForBounds` + projected pill rects → pitch 52 @ zoom 14.7–15.4; phones a direct search → pitch 48–52 @ 14.9–15.15 with all five chips inside the safe box + a render-time chip nudge for the two one-block-apart stops; landscape phones keep the 33/15.25 pan floor) · M3 `Stop the walk` top-right · M4 walk state machine (idle/walking/paused/done, `tourRun` counter, drag/tap/key pause, `Continue`/`Walk again`, Esc chain V7-079, URL follows the card V7-095) · M5 keen `dragEnded` override (nearest snap or ±1 flick, 650ms expo, reconciliation guard, `settle → followCamera`, continuous neighbour scale) · M6 `name.card` + `.t-card` role · M7 Back at the inset · M8 phone row (attribution · Take the walk · ☰ on one axis; 1858 pill top-right; bottom band = `touch-action: pan-y` scroll handle V7-023) · M9 phone cards `min(343px,84vw)`, spacing 12, mask ≥640, ☰ retreats while focused/lens (`data-walk`), desktop strip raised past the ☰ (V7-077) · M10 chip `April 27, 1860` (hidden in the lens) · M13 index copy/nbsp/`no plaque, website only` · L1–L4 lens = the whole shell, plate covers the box (min scale = cover), reset/first-open = lower panel filled by height centred on the river, one door `Back to today` (mounted only when open), touch caption · V7-009 marker role · V7-037 shield layers hidden · V7-038 RM cadence 2.5s · V7-088 ctrl focus ring · `text-wrap-style` longhand site-wide (the shorthand had been re-enabling wrap inside `nowrap` pills/truncate) · states.mjs: 5 new map states + lens-layer + focused-chrome doctrine · walk-check: long-task probe, landscape note | 652143b | `docs/v7/qa/p5/{walk,states,a11y-map}.md` — walk-check 8/8 ✓ (drag pauses, 0 reversal, swipes land 0 m, titles 2L), states 0/111, a11y /map 0/0/0, rag /map 0 runts 0 clips 0 dashes, LH /map 64 (baseline 63), home 97 |

## DECISIONS (run-time, logged here; plan edits only for Wil decisions)
- P6: the People H1 reads `ONE DAY. A WHOLE / CITY'S CAST.` from **1280px**
  (Tailwind `xl`, the shell's max width — the only width that holds 88px
  Caslon across a full-shell H1); below that the header keeps its two-column
  fold with three authored lines. Note: Tailwind orders arbitrary `min-[…]`
  variants BEFORE `lg:`/`xl:`, so use the named breakpoints when overriding.
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

- V7-010 ROOT CAUSE (found in the final shots log): React's style-hydration
  diff flagged the scrub track's `backgroundImage` gradient with `var()`
  (`+ backgroundImage` / `- background-image`, identical values) — a React 19
  false positive on `var()` gradients in style objects. The played fraction now
  rides a `--pct` custom property and the gradient lives in CSS.
- The Chromium "GPU process exited unexpectedly: exit_code=15" crashes line up
  EXACTLY with a foreground tool call hitting its 600 s timeout: the harness's
  timeout sweep SIGTERMs the session's Chromium helpers. Never let a foreground
  command time out while an instrument runs — poll with short calls.
- Instruments must run ONE Playwright process at a time and via the harness's
  background mode: overlapping runs (or a plain `&` chain outliving its
  shell) had their Chromium GPU/network helpers SIGTERMed mid-run (exit 15),
  which read as "Target closed" crashes. Not a site issue.

- Juror pass 7 (P2): the /map wheel is COOPERATIVE on fine pointers only
  (`cooperativeGestures: matchMedia("(pointer: fine)")` + `setCooperativeGestures`
  on change): a plain wheel over the full-viewport map scrolls the page (the
  copy, spot index and footer under it were unreachable by mouse — the
  guardrail's "no scroll-jacking"), ⌘/Ctrl + wheel zooms, drag/double-click/the
  walk unchanged; the notice is our hint chip (Caslon Text meta, house ground,
  centred, lingers 1.4 s) not Mapbox's black veil. Touch is untouched (one
  finger explores, bottom lane scrolls; Wil's M8 answer) — the juror's phone P2
  (one-finger swipe pans) would need two-finger cooperative panning and is
  Wil's call (REVIEW-GUIDE §5). Revert: drop the two options + the `.mapboxgl-*-blocker` CSS.
- Juror pass 7 (M9): walk-card neighbours scale about the edge NEAREST the
  active card (`transform-origin: left/right bottom` written with the scale in
  `detailsChanged`) so the layout peek (16.8 px @360 · 19.2 @390) is what the
  eye gets; about their own centre the .92 scale hid 12 px of it (5–7 px read).
- Juror pass 7 (P1): `approach()` brings the sticky stage flush with the
  viewport before composing (from the page top the hall peeks under the
  header; past the rail's end the stage has unpinned) — smooth, instant under
  reduced motion. The desktop card width is ONE formula in CSS and the
  composition (`clamp(13rem, 30vw − inset − 24px − 3rem, 22rem)`), the −3rem
  giving the painting ~2× the width at 1024×768 (P3-8).

## STANDING NOTES
- Dev server: `astro dev` on :4321 (background); production preview on :4322
  for perf. Chromium flags for the museum: `--use-gl=angle
  --autoplay-policy=no-user-gesture-required`.
- `scroll-behavior: smooth` is on — instruments must `scrollTo({behavior:
  "instant"})` and never read `scrollY` back as a target.

## BLOCKED / NOTES
- None.
