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
X1 curtain (inline head script + `.curtain-covered` CSS, font preloads,
will-change, page-B text tween, `cnwm:curtain-cover` event + map/museum
listeners, wire `--ease-circ-in-out`/`--dur-curtain` G7) → `frames.mjs` clean
at 390/1440 → commit. Then G3 spine labels (V7-004) + G6 mini-player inset +
N1 X-spin + N2 scroll-hide (V7-048) + Menu before main (V7-081) +
aria-current (V7-089) + G-L3 trailing slash → commit. Then I1–I4 favicon →
commit. Push. Remaining rag runts (13) are page-owned: map index/pill P5,
People roles P6, About quote/list P6, footer wordmark@768 P3, mansion prose P4.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| Plan bootstrapped (v6 docs archived → `docs/PLAN-v6.md`, `docs/RUN-STATE-v6.md`; v7 plan → `docs/PLAN.md`) | 2a6e880 | `git show --stat 2a6e880` |
| P0 instruments wired: `rag/a11y/frames/walk-check/museum-check.mjs`, `__troyMap` + `__museum` hooks, shots 9 vps, perf all routes, npm scripts, gitignore | cb64ecc | smoke runs in scratchpad; hooks verified live |
| P0 `contrast.mjs` pixel mode + 768 + JSON | 7b7a986 | `docs/v7/qa/baseline-contrast.md` |
| P0 baseline (all instruments) + P1 AUDIT (98 findings, hand UX walks phone/desk, footer references) | 432fc82 | `docs/v7/AUDIT.md`, `docs/v7/qa/baseline-*`, `docs/v7/uxwalk-*.md`, `docs/v7/footer-references.md` |
| P2 G2 `.line-box` ink room (V7-001: 212 clips → 0) + G1 text-wrap roles / word-spacing / `hyphens: manual` / `nbsp()` helper (V7-002: 549 runt rows → 13 page-owned) + `rag.mjs` ink probe + authored split + short-line rule | (this commit) | `docs/v7/qa/p2/rag-after-g1g2.md` |

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
