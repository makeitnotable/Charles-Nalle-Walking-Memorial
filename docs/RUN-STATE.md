# RUN-STATE — CNWM v5 "The Award Audit"

*Disk is truth. Updated after every sub-step. A stranger must be able to resume
from IN PROGRESS with no conversation context.*

Re-orientation ritual: `docs/PLAN.md` → this file → `git log --oneline -10` →
resume from IN PROGRESS. Never redo DONE work; verify via git, not recollection.

The mandate: `docs/AUDIT-PROMPT.md`. Wil's verdict on v4 is that the site looks
*good* and feels *unfinished* — a large number of small failures. Four confirmed
defect classes are automatic P0s (type scale, triple-duplicated chapter imagery,
floating-UI collisions, sloppy alignment). Outputs land in `docs/v5/`.

---

## CURRENT PHASE
**Stage 1 — Audit. Evidence only, no fixes.**

## LAST COMMIT
(see `git log -1`)

---

## DONE

| When | What |
|---|---|
| 2026-08-02 | v4 RUN-STATE archived → `docs/RUN-STATE-v4.md`; `docs/v5/` scaffolded |
| 2026-08-02 | Build green (12 routes, check-css 6/6); preview serving :4321 |
| 2026-08-02 | Media inventory: every chapter has ≥6 distinct assets (ch2: 11, ch4/ch5: 8) — so duplicate-imagery defects are fixable without new art |
| 2026-08-02 | v5 instruments written: `scripts/probe.mjs` (rendered-px ruler: type ladder, floating-UI collisions, per-page repeated assets, alignment edges, cross-route copy dupes, CLS/overflow/tap/console) and `scripts/states.mjs` (interaction-state capture + collision measurement in each state) |

---

## IN PROGRESS
**Stage 1.1 — capture the evidence matrix.** `scripts/probe.mjs` running against
local preview across 11 routes × 5 viewports (390, 844×390 landscape, 768, 1024,
1440) → `docs/v5/qa/probe-local/`. Next after it lands: run `scripts/states.mjs`
for the interaction states, then `scripts/shots.mjs` for the scroll-depth matrix,
then the same three against the LIVE deploy.

---

## BLOCKED / NOTES
- Branch hazard: local `main` tracks `origin/v2`. Plain `git push` is safe.
  **NEVER push `main:main`.**
- Figma MCP is unauthenticated in this session; design reference is repo docs only.
- Kathy Sheehan's approved facts are untouchable. Content work is dedup/tighten/
  re-rhythm ONLY — never a change to a stated fact.

---

## GATE VERDICTS

| Stage | Gate | Verdict | Evidence |
|---|---|---|---|
| 1 | audit ≥60 findings + scores | — | `docs/v5/AUDIT.md` |
| 2 | fix plan | — | `docs/v5/FIX-PLAN.md` |
| 3 | execute (pixel-verified) | — | before/after paths in this file |
| 4 | adversarial juror ×2 clean | — | `docs/v5/juror-*.md` |
