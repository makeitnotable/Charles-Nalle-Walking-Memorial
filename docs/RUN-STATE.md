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

## STAGE 3 — EXECUTION LOG (fix → re-shoot → check off)

| Fix | What | Pixel proof |
|---|---|---|
| F1.1–1.3 | Display step capped 116→88 (1200+) and 76→64 (768+); fit constant 0.64→0.72 (measured: 26 display strings render 0.546–0.763em/char, mean 0.618); both desktop steps now gated on `min-height:600px` | hero measurement table below |
| F1.4 | `--fit-chars` computed from the string via new `src/lib/text.ts` on `/map`, `/people`, `/paintings` — `/people` had declared 14 for a 20-char line (43% oversized, cause of its zigzag rag) | `astro check` 0 errors |
| F1.5 | `--fs-spine-sm` (13px) + `.t-spine-sm`; `ChapterSpine`'s inline `font-size:15px` deleted | — |
| F1.7 | `/404` H1 display → `t-title` (a sentence is not a name) | — |
| F1.8 | Wordmark gains a `19dvh` cap — it was pushing the home CTA half off a landscape phone | — |
| **F2** | **Chapter hero rebuilt as `grid-rows-[auto_1fr]`** — was two competing 46dvh minimums + ~190px chrome inside a 100dvh box (~112dvh of content) | **20/20 portrait+desktop views now FIT; painting occupies 46–65% of the fold (was cut off)** |
| F2b | Landscape phone hero **reframed to two columns** (pasqua's lesson, named in INSPIRATION.md and never taken) — stacked it could not fit 390px of height at any type size | `eyes/ferry-hero-land-AFTER.png` — fits with 24px spare |

Hero fold, before → after (media bottom vs viewport height):

| route | 390 | 844×390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| before | fits | **−256** | **−87** | **−107** | **−100** |
| after | fits | **fits** | **fits** | **fits** | **fits** |

## IN PROGRESS
**F3 — duplicate imagery.** Next exact action: add an `interlude` asset per
chapter in `[chapter].astro` (bakery→vertical, ch2→horizontal-pt2,
mansion→square, ferry→narrative2, barbershop→narrative1) and delete the moral
thumbnail at `[chapter].astro:362–368`, which renders the same image already
serving as that section's full-bleed background. Then F4 (floating UI lanes),
F5 (rhythm), F6 (content dedup), F7 (motion), F8 (sweep).

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
