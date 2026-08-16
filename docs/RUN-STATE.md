# RUN-STATE — CNWM v7 "The Last Ten Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-shoot → commit → update this file as ONE atomic act. Push every ≤3 commits.
NEXT ACTION is always written before any stop. Constitution: `docs/PLAN.md`
(v7). Previous run: `docs/PLAN-v6.md` + `docs/RUN-STATE-v6.md`.*

## CURRENT PHASE
**Phase 2 — Foundations** (Phases 0–1 complete 2026-08-15/16, Fable 5 / HIGH)

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
**Phase 2 gate = PASSED** (frames 6/6 CLEAN · contrast P2 rows 0 · rag ink
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
| P2 I1–I4: CN monogram (Libre Caslon Display outlines → paths, 3 candidates a/b/c on `/styleguide#mark`, **a · interlock ships**), full set (svg/16/32/48/ico×3/apple-touch/192/512) + relative-URL `site.webmanifest`, head wiring via `withBase()`, og:image width/height/alt + twitter:image, `build-og.mjs` ported to Caslon (+ the mark) → new `public/og.png`; `scripts/serve-dist.mjs` (GH-Pages-like server: trailing-slash retry verified `/bakery/`→`/bakery`, `/nope/`→404 no loop) | (this commit) | `public/favicon-candidates/sheet.png`; all 10 icon URLs 200 |

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
- V7-023 (phones can't scroll past the 100dvh map by touch) is NEW and P1: fix
  = bottom control band as a `touch-action: pan-y` scroll handle + a quiet cue;
  no `cooperativeGestures` (would break the walk feel).
- V7-045 (embed maps ship no Mapbox attribution) is NEW and P1: compact
  attribution on every chapter embed.

## STANDING NOTES
- Dev server: `astro dev` on :4321 (background); production preview on :4322
  for perf. Chromium flags for the museum: `--use-gl=angle
  --autoplay-policy=no-user-gesture-required`.
- `scroll-behavior: smooth` is on — instruments must `scrollTo({behavior:
  "instant"})` and never read `scrollY` back as a target.

## BLOCKED / NOTES
- None.
