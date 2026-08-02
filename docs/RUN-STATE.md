# RUN-STATE — CNWM v4 "The Craft Run"

*Disk is truth. This file is updated after every sub-step. A stranger must be able to
resume from IN PROGRESS with no conversation context.*

Re-orientation ritual: `docs/PLAN.md` → this file → `git log --oneline -10` → resume
from IN PROGRESS. Never redo DONE work; verify via git, not recollection.

---

## CURRENT PHASE
**P0 — Audits**

## LAST COMMIT
(see `git log -1`)

---

## DONE

| When | What |
|---|---|
| 2026-08-03 | Protocol setup: `docs/PLAN.md`→`PLAN-v3.md`, `RUN-STATE.md`→`RUN-STATE-v3.md`, v4 plan installed as `docs/PLAN.md`, fresh RUN-STATE created, `docs/v4/` scaffolded |

---

## IN PROGRESS
**P0(a/b/c) — launch the three audit tracks.**
Exact next action: commit + push the protocol setup, then spawn parallel audit agents:
(a) inspiration deep-dive → `docs/v4/AUDIT-INSPO.md`;
(b) CNWM failure census (every route × 390/768/1440, W1–W8 mapped to occurrences) →
`docs/v4/AUDIT-CNWM.md`; (c) naming/content ledger → `docs/v4/NAMING-CANON.md`.
Then synthesize `docs/v4/DESIGN-STANDARDS.md` + `docs/v4/CALIBER-RUBRIC.md`.

---

## BLOCKED / NOTES
- Branch hazard: local `main` tracks `origin/v2`. Plain `git push` is safe. **NEVER push `main:main`.**
- Figma MCP servers are unauthenticated in this session — Figma is reference-only via the
  existing repo docs (`docs/LEGACY-PORT-NOTES.md`, `docs/CONTENT-STATUS.md`, and the
  `Context/` PDFs one directory above the repo).

---

## GATE VERDICTS

| Phase | Gate | Verdict | Evidence |
|---|---|---|---|
| P0 | standards-confirm | — | — |
| P1 | caliber (styleguide) | — | — |
| P2 | caliber (flagship) | — | — |
| P3 | caliber + W3 grayscale + keeper regression | — | — |
| P4 | caliber per page-type | — | — |
| P5 | motion census | — | — |
| P6 | final gates on LIVE + Wil test | — | — |
