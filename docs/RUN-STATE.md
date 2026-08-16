# RUN-STATE — CNWM v7 "The Last Ten Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-shoot → commit → update this file as ONE atomic act. Push every ≤3 commits.
NEXT ACTION is always written before any stop. Constitution: `docs/PLAN.md`
(v7). Previous run: `docs/PLAN-v6.md` + `docs/RUN-STATE-v6.md`.*

## CURRENT PHASE
**Phase 0 — Bootstrap + baseline** (started 2026-08-15, Fable 5 / HIGH)

## CURRENT ITEM
Phase 0 wiring: npm scripts (`qa:rag qa:a11y qa:frames qa:walk qa:museum
build:favicon`), debug hooks (`window.__troyMap`, `window.__museum`), matrix
extensions (shots → 9 viewports; contrast + 768 & pixel mode; perf +
`/paintings`), then the baseline run → `docs/v7/qa/baseline-*`.

## NEXT ACTION
Wire the new instruments (`scripts/rag.mjs`, `scripts/a11y.mjs`,
`scripts/frames.mjs`, `scripts/walk-check.mjs`, `scripts/museum-check.mjs`)
and the debug hooks; extend `shots.mjs`/`contrast.mjs`/`perf.mjs`; commit
("v7 P0: instruments wired"); run the baseline; commit
("v7 P0: baseline"); then Phase 1 → `docs/v7/AUDIT.md`.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| Plan bootstrapped (v6 docs archived → `docs/PLAN-v6.md`, `docs/RUN-STATE-v6.md`; v7 plan → `docs/PLAN.md`) | 2a6e880 | `git show --stat 2a6e880` |

## DECISIONS (run-time, logged here; plan edits only for Wil decisions)
- Baseline evidence lives in `docs/v7/qa/`; PNGs are gitignored (same rule as
  v5/v6) — the `.md`/`.json` findings are the artefact.

## BLOCKED / NOTES
- None.
