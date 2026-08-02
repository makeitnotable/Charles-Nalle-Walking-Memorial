# RUN-STATE — CNWM v4 "The Craft Run"

*Disk is truth. This file is updated after every sub-step. A stranger must be able to
resume from IN PROGRESS with no conversation context.*

Re-orientation ritual: `docs/PLAN.md` → this file → `git log --oneline -10` → resume
from IN PROGRESS. Never redo DONE work; verify via git, not recollection.

---

## CURRENT PHASE
**P2 — Flagship chapter template**

## LAST COMMIT
(see `git log -1`)

---

## DONE

| When | What |
|---|---|
| 2026-08-03 | Protocol setup: `docs/PLAN.md`→`PLAN-v3.md`, `RUN-STATE.md`→`RUN-STATE-v3.md`, v4 plan installed as `docs/PLAN.md`, fresh RUN-STATE created, `docs/v4/` scaffolded |
| 2026-08-03 | P0 before-shot matrix captured (`docs/v4/qa/p0-before`, 138 shots, gitignored) |
| 2026-08-03 | P0(c) naming ledger DONE → `docs/v4/NAMING-CANON.md`. Bronze plaques (cast June 2026) are the naming source of truth; canon locked in `docs/v4/DECISIONS.md` D1 |
| 2026-08-03 | P1 system built: `global.css` v4 (3 voices w/ Martel serif, 4 type roles, 3 spacing tokens, unbox rules, 2 durations/1 easing, cream register), `icons.ts` + `Icon.astro` (one arrow), `Button.astro` (2 sizes × 2 variants) |
| 2026-08-03 | P1 styleguide v2 shipped + shot. Serif-under-sync-highlight legibility verified on BOTH grounds (plan §12 risk cleared). Fixed: hollow play glyph, boxy highlight edge, missing spacer |

---

## IN PROGRESS
**P2 — rebuild `src/pages/[chapter].astro` per PLAN §8 on `/commissioners-office`.**
Exact next action: read `src/components/AudioStory.tsx` + `src/components/PressReveal.tsx`,
then rewrite `[chapter].astro` with the 8-part structure: animated-painting hero
(poster-first) → editorial spine → (01) story w/ cream transcript → (02) From the sketch
(relocated press-and-hold) → full-bleed painting interlude → (03) historical context
(label-left grid) → (04) moral → (05) onward. Then bug fixes: double `class` on the
historical video, mini-player to bottom-LEFT with tabular-nums.

Still running in background at last checkpoint: P0(a) three inspiration measurement agents
(→ `docs/v4/inspo-{pasqua,googleac,museos}.md`), P0(b) visual census
(→ `docs/v4/audit-cnwm-visual.md`) and code inventory (→ `docs/v4/audit-cnwm-code.md`).
Fold their findings into `docs/v4/DESIGN-STANDARDS.md` when they land.

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
