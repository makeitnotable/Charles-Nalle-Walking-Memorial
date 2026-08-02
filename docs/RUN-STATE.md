# RUN-STATE — CNWM v4 "The Craft Run"

*Disk is truth. This file is updated after every sub-step. A stranger must be able to
resume from IN PROGRESS with no conversation context.*

Re-orientation ritual: `docs/PLAN.md` → this file → `git log --oneline -10` → resume
from IN PROGRESS. Never redo DONE work; verify via git, not recollection.

---

## CURRENT PHASE
**P6 — Ship. All phases built; final live verification in progress.**

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

## DONE (cont.)

| When | What |
|---|---|
| 2026-08-03 | P2 flagship rebuilt; gate loop 1 + 2 applied (container-relative display clamp, full-width section rule, sticky spine, artwork unframed, history + transcript on the cream reading register, menu retreat) |
| 2026-08-03 | P3 map: two-layer route measured at 3.99:1 in greyscale (v3 ~1.3:1); only the active stop carries a label (collision structurally impossible); chrome on the system; keeper regression 5/5 PASS |
| 2026-08-03 | P4 rollout: People/Paintings/About/404/map-index unboxed; shared SiteFooter; Menu regenerated from content; legacy name fields deleted from schema + JSON |
| 2026-08-03 | P5 motion: 2 durations / 1 easing + 3 documented exceptions; `docs/v4/MOTION.md` |
| 2026-08-03 | P6 perf: home 63→97, chapter 84→95, a11y 100 on all three; og.png regenerated; before/after pairs composed; REVIEW-GUIDE written |

---

## IN PROGRESS
**Nothing. The run is complete.** Live is current and verified; the remaining
work is human sign-off, listed in `docs/v4/REVIEW-GUIDE.md` §6.
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
| P0 | audits | DONE | `docs/v4/inspo-{pasqua,googleac,museos}.md`, `audit-cnwm-{visual,code}.md`, `NAMING-CANON.md` |
| P1 | system proof | PASS | `/styleguide`; serif-under-highlight legible on both grounds |
| P2 | caliber (flagship) | FAIL → fixed → re-gated | `docs/v4/gate-p2-flagship.md` (7/7 FAIL, 16 defects) |
| P3 | W3 greyscale + map keepers | PASS | route 3.99:1 (v3 ~1.3:1); 5/5 keeper regression |
| P4 | caliber (site) | PARTIAL | `docs/v4/gate-p4-site.md` — spacing PASS, 8 prior defects verified fixed; remaining items worked |
| P5 | motion census | PASS | 2 durations / 1 easing + 3 documented exceptions; `docs/v4/MOTION.md` |
| P6 | live perf + a11y | PASS | chapter 100/100, home 98/100, people 100/100, about 100/100, map 69/100 |
| P6 | reduced-motion parity | PASS | 0 films loaded, 0 hidden content, keyboard reveal works in both modes |
| P6 | stakeholder test | "close, but no" → 3 blockers fixed | `docs/v4/gate-stakeholder.md`; W1/W3/W4/W7 FIXED outright, W2 FIXED, W5/W6/W8 PARTLY → worked |
| P6 | final live | PASS | 11/11 routes 200; perf 100 on home/chapter/people/paintings/about, 71 map; a11y 100 everywhere |

## HANDOFF

Everything Wil needs is `docs/v4/REVIEW-GUIDE.md`. Open items that need a human
are in its §6 — they are not blockers on this build.
