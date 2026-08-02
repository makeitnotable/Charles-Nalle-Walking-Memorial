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

| F3 | Interlude draws the archival record (ch2: `horizontal-pt2`, its real second painting) — a contact sheet proved `vertical`/`square` are crops of the SAME canvas, so the plan's first idea would not have fixed it. Painting now appears exactly 2× (hero + press-reveal resolution). Moral thumbnail deleted. Map index → archival photo | probe repeats: `moral` 2× and `/map square` 2× both gone |
| F3b | Found while measuring: the sketch section passed 3 children to a 2-column grid, so the **press-and-hold rendered 276px wide at 1440** | now full content column |
| F6 | `portal.history` 4 paras → 2 in all five chapters, 4,064→1,531 chars. Every fact preserved; Kathy's "waiting skiff" wins over the older "helped onto a boat". Six identical "Make a Difference" CTA headings → six distinct. Per-chapter `sketchNote` replaces one byte-identical paragraph ×5 | logged line-by-line in `docs/CONTENT-STATUS.md` |
| F4 | `--ui-inset` shared by all floating UI; **menu gets a scrim** (turns a collision into a layer) + max-height + wider column; marker labels → numbered chips below 640px; fitBounds pads for LABELS not dots; walk rail inert everywhere; footer padding follows the actual floating UI | `states-v5` sweep |
| F5 | Chapter gaps composed (was `200,200,200,200,400,200,200`); home recomposed — one stack, legible photograph (0.5→0.72), copy leads with the date, CTA names destination + size; `/people` two-column open, borrowed Tubman quote returned to Ch2 | — |
| F7 | Hero 1.15 scale + interlude Ken Burns cut (the latter is why a full-bleed block measured 1584px on a 1440 screen); home entrance 2.8s → ~1.0s; menu retreat threshold 4px→24px | — |
| F8 | Mapbox chrome on `--ui-inset`, scale to the 12px floor; loading placeholder retired on hydrate; map CTA hierarchy; press-reveal hairline; footer link target | — |

| F5b | History section: the 400px void in front of the cream block deleted — the ground flip IS the act change, and 528px of announcement read as a blank screen. Chapter rhythm now **128, 200, 0, 0, 128, 400, 200** (was `200,200,200,200,400,200,200`) | measured on `/mansion` @1440 |
| F4b | Below 640px **no** marker is named — naming only the active one still ran BAKERY off the right edge. Mapbox corner inset moved from each control to the CORNER (it had stacked 56px between them and walked the scale bar halfway up the left edge) | `eyes/B-map-1440.png`; bottom-left lane all at x=56 |

## IN PROGRESS
**Stage 3 verification → Stage 4 gate.** Clean sweep running against the rebuilt
local preview → `docs/v5/qa/{states-v5, probe-v5, census-v5.md, shots-v5}`.
Acceptance: 0 collisions in all 110 states · repeated-imagery table empty ·
≤6 type sizes per page, display at one size per breakpoint.

Live deploy: `ab4d573` pushed; waiting on CI (live bundle must be
`Base.DyzLfYUN.css`). Then Stage 4 — a fresh adversarial juror subagent with no
builder context, live URL only, instructed to look for reasons to score LOW.
Finish condition: every page ≥8 on every axis at every breakpoint, zero P0/P1,
**two consecutive juror passes that surface nothing new.**

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
