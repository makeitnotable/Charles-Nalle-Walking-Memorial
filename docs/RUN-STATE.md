# RUN-STATE — CNWM v6 "Seven-Element Elevation"

*Disk is truth; the conversation is disposable. One work item = implement →
re-shoot → commit → update this file as ONE atomic act. Push every ≤3 commits.
NEXT ACTION is always written before any stop. Constitution: `docs/PLAN.md`.*

## CURRENT PHASE
**Phase 6 — THE GATE**

## CURRENT ITEM
Dual-rubric juror pass 5 RUNNING (fresh juror, evidence under
`docs/v5/qa/juror-pass5-v6/`). **Consecutive-clean counter: 1** (pass 4
PASSED). ZERO changes made between passes 4 and 5 — identical build.

## NEXT ACTION
Read pass 5's verdict. If clean: gate complete → live end-to-end verify
(push → ~3min GH Pages → arrival + spot shots against the live URL),
fill REVIEW-GUIDE-v6 verdicts + promote to docs/v5/REVIEW-GUIDE.md,
GATE VERDICTS table, memory update, final push. If it surfaces anything
new: fix (P2/P3 only if the pass was otherwise clean) and re-run.

## GATE LOG
- **Pass 1** (`docs/v5/qa/juror-pass1-v6/`, 151 shots, console clean):
  Sheet A phone 9.0/8.5/9.0/9.5, desktop 8.0/8.5/9.0/9.5 — zero P0,
  **one P1** (hero kicker legibility at 1440/landscape on busy paint).
  **Sheet B PASSED: four Exceeded — Thesis, Signature (the Museum, named
  as the moment they'd retell), Interaction meaning, Content depth
  (curated 9/10); Typography Met (personality 8.5, "not generic");
  juror's thesis sentence = the locked thesis, verbatim in spirit.**
  Verdict: failed by exactly the one P1.
- **Fix loop 1→2** (commit 18243a3): deeper hero scrim band + lockup
  halo (the P1), interlude fades 12/88, measure 54ch (Caslon's narrow
  zero), no pre-lit marker at overview, attribution bottom-left, hint
  pill ducks on short viewports, moral scrim .78, organised→organized.
- **Pass 2** (`docs/v5/qa/juror-pass2-v6/`, 130+ shots, console clean):
  axes 8/8/9/9 both classes — zero P1, **one P0, root-caused by the
  juror**: `.wipe`'s clip-path sat on the observed element itself;
  Chromium intersects a target against its own clip, so the archival
  interlude never revealed at natural scroll — a permanent black band
  in all five chapters for default-motion visitors (the instruments
  force `is-in`, which is exactly why they were blind to it). Sheet B:
  FIVE at Exceeded-or-better incl. the Museum; Execution held at
  Partial by the P0. P2s noted: home has two links by design (queued
  for Wil), phone overview edge-clips stop 1 (camera-floor tradeoff,
  documented), mini-player title truncation, /people odd-count void.
- **Fix loop 2→3** (a651e35): clip moved to `.wipe-clip` child (also the
  positioning context); section observed un-clipped; pixel-verified at
  natural wheel scroll — the ferry landing photograph reveals.
- **Pass 3** (`docs/v5/qa/juror-pass3-v6/`, 195 artifacts, console clean
  on all 22 loads): axes 9/8/9/9 phone · 9/9/9/9 desktop — zero P0,
  **three P1s**: interlude credit clipped off-screen left at 390 on 3/5
  chapters; straight typewriter apostrophes sitewide incl. display
  glyphs; walk-mode neighbour chip over the active name plate. Sheet B:
  four Exceeded incl. the Museum; Execution Partial on the P1s. P2s:
  $1,000 converted two ways ($35k vs $40k — FLAGGED for Kathy, not
  edited), home-nav restraint (queued for Wil), zoom-floor crops at
  844×390, moral bottom whitespace at 1440, finale loops to Stop 01.
- **Fix loop 3→4** (a36c66f): credit clamped to both gutters (verified
  left=20px on all three); typographic ’ “ ” everywhere (glyph-only
  substitution, zero words changed, CONTENT-STATUS logged); active
  marker z-30 (verified in DOM). Ledger gained the Kathy flag.
- **Pass 4** (`docs/v5/qa/juror-pass4-v6/`, 143 artifacts, console clean
  everywhere): **GATE PASSED** — zero P0, zero P1, all axes 9/9/9/9 at
  BOTH breakpoint classes. Sheet B: **FIVE Exceeded** (Thesis,
  Signature/Museum, Execution, Typography 9/10, Interaction meaning);
  Content depth 9/10 Met, Threshold Met. Residuals: three P2s (map
  fit-bounds crops on short viewports — the documented camera-floor
  tradeoff; unlabeled pins until tap — the documented chip design;
  desktop left-set measure — house editorial grammar). Consecutive
  cleans: 1.

## P5 CLOSED — evidence
Item 28: monogram bookplates on People (first+last initials, photo-slot
proportions, `p5/people-1440.png`). Item 30: About carries the system, no
regression (`p5/about-*.png`). Item 23: contrast 0 fails (P3), measure
≤66ch via t-prose, hung quotes, hanging numerals, reveal grammar
consistent; /about wordmark+display pairing accepted as the identity
lockup exception (same class as home).

## P4 CLOSED (build) — evidence
Museum committed through 35656f0. Three juror passes: Partial → **strong
"Met in full", zero P0s** (`docs/v5/elements/p4-museum/J*-*.png`). Landed:
capability-gated three (dynamic import), native-scroll rail + sticky stage,
fixtures/beams/pools light model, far-end draw, composition-managed
approach (plaque column on landscape, raised canvas on portrait), plaque
speaks the scene's approved quote, alive/rest video textures cover-fitted,
dot rail + counter wayfinding, touch/desktop skips, anisotropy, eager
catalogue load, fps proxies clean at 390 and 1440. Fallback grid = SR
surface; P0-4 dialog clip dead (`open:flex`). Residual juror P2s noted in
pass-3 report (gradient banding, frame flatness, mobile counter) — P6
inputs. EXCEEDED verdict deferred to the full-site gate by design.

## P3 CLOSED — evidence
- Items 7/8/9/10/11/13/14 landed; grayscale route proof
  (`p3-map/map--*--imagery.png`); fps proxy 240 frames / 3 >26ms; juror
  P1-2/4/5/6/7 fixed, P1-25/26 resolved by earlier lane work + scale
  removal, P1-3 accepted (licence mark, opacity already calmed); P0-5 dead
  (active chip named); P0-6 = D4 (framed plate, queued for Wil).
- Contrast sweep: **0 failures site-wide** (`contrast-p3.md`).

## P2 CLOSED — evidence
- E7: five chapters, zero film bytes on thin pipe; full hero at 1s frame
  (`arrival-p2/`). F2: hero=100dvh by construction, 15/15 fold checks pass.
- Splash 3–6 (D3 deviation queued for Wil) · hero full-bleed 2/16 · motion
  17 (line-mask live) · sketch→moral 18, PressReveal deleted · 20 (pin=link
  via curtain delegate) · 21 verified · 22 "Continue" · 25 removed · 26 twin
  (Pt2 hero, ch2 interlude → historical-pt2) · Crossing date-led · audio
  buffering states · E4 carry-ins done (mid-register CTA, first-word cut).

## DONE (v6)

| Item | Commit | Evidence |
|---|---|---|
| Bootstrap: v4 plan archived → `PLAN-v4.md`; v6 plan installed as `PLAN.md`; v6 RUN-STATE section opened | 26158ff | — |
| P0: `qa:*` scripts wired; 4 new instruments (`moments/strip/arrival/contrast.mjs`); baselines E1/E2/E4/E7 + contrast run | (this commit) | `docs/v5/elements/BASELINES.md` |
| P0 baseline findings: E1 thesis PASSES (3/3 jurors); 26 off-token motion tuples; mp4 on thin pipe 2.6–4.2s every chapter (P2 target); /map stop chips 2.75:1 contrast (P3 target) | (this commit) | `docs/v5/elements/*.md` |

## DECISIONS (v6)
- All locked decisions live in PLAN.md "Locked decisions" — not repeated here.
- **D1 (P1 audition, juror + stakeholder-proxy unanimous): Libre Caslon
  Display (display/title/quote) + Libre Caslon Text (prose + ALL chrome as
  letterspaced caps). Poppins, Martel and Martel Sans retire.** Playfair
  rejected ("template DNA"), EB Garamond rejected (bookish at hero scale).
  Evidence: `docs/v5/elements/audition/` + verdicts quoted in commit.
- **D2: date lockups use the BROADSIDE register** — letterspaced caps +
  lining figures (LC ships no oldstyle figures/true smcp; an 1860 handbill
  set dates exactly this way). Amends PLAN's "oldstyle figures" assumption —
  logged in DEVIATIONS.md. No third face gets borrowed for dates.
- **D4 (P0-6): the 1860 map stays a framed plate, not a georeferenced
  overlay.** The plate is a period illustration, not a survey — corner-pinning
  it to modern streets would fabricate an accuracy it does not have, exactly
  the class of error P0-3 (the chord route) was. The current presentation
  (dimmed backdrop, framed artifact, caption, no live map showing through)
  already reads as a "then" view. Queued for Wil in REVIEW-GUIDE with this
  reasoning; if he sources true corner coordinates, the lens can upgrade.
- **D3: home description keeps the thesis sentence, not the exact Figma
  descriptor** ("…a digital physical experience designed to share the
  history of Troy…"). The Figma sentence describes the deliverable and
  cannot pass the locked E1 compression gate (no rescue, no Tubman, no day).
  Item 6 satisfied via authored rag on the thesis sentence instead.
  **Queued for Wil in REVIEW-GUIDE** — if he wants the Figma sentence
  verbatim, it's a one-line swap.

## CARRIED FORWARD from v5 (open ledger)
Juror pass 1 (6.8/10, `docs/v5/juror-pass1.md`): **3 open P0s** —
P0-4 painting dialog clipped at 844×390 (→ Phase 4, fix in fallback grid
regardless); P0-5 map stop labels anonymous on phones (→ Phase 3); P0-6 1860
overlay ungeoreferenced (→ Phase 3, bounded alignment attempt else artifact
presentation + REVIEW-GUIDE). Plus **26 P1 · 19 P2** itemised in juror-pass1.md
(heaviest clusters: `/map` P1-2…7, 11, 25, 26; press-reveal P1-15…17, 20 — the
press-reveal cluster dies with PressReveal's retirement in Phase 2).

## BLOCKED / NOTES (v6)
- Branch hazard: local `main` tracks `origin/v2`. Plain `git push` only.
  **NEVER push `main:main`.**
- Official Figma MCP unauthenticated this session; ClaudeTalkToFigma plugin
  tools present but need an open plugin channel — attempt at arrow-fetch step,
  fall back per PLAN chain.
- Human-only queue → REVIEW-GUIDE (Kathy sign-offs, Ch2a/Ch4 re-records, ferry
  rewrite, Athenaeum image, Ch2 "1 and 2" reading flag).

---
---

# RUN-STATE — CNWM v5 "The Award Audit" (history — superseded by v6)

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
**Stage 4 — juror gate. Pass 1 returned 6.8/10 and did NOT pass.**
Stages 1–3 complete. See STAGE 4 below for the exact next actions.

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

## STAGE 4 — THE JUROR GATE

**Pass 1 complete: `docs/v5/juror-pass1.md`.** Fresh adversarial subagent, no
builder context, live URL only, 409 of its own screenshots, told to look for
reasons to score LOW.

**Verdict: 6.8 / 10 — "not award-winning, would not shortlist."**
(Design 6.86 · Usability 6.68 · Creativity 6.18 · Content 8.36.)
Findings: **8 P0 · 26 P1 · 19 P2.** For reference, my own Stage-1 audit scored
the pre-fix site 6.1, so the work moved it ~0.7 — real, and not enough.

Three of its eight P0s were things my Stage-1 audit never looked at, and one of
them I looked straight at and got wrong (I called the route "honest
cartography"; it was a factual error).

### Juror P0s — status

| # | Finding | Status |
|---|---|---|
| P0-1 | About portraits are 250×251 files rendered at 828px (3.3× upscale); `-800`/`-1440` are the same bytes | **FIXED** — render at native size, beside the prose |
| P0-2 | About closing quote 52px × 13 centred lines, taller than the viewport, attribution below the fold | **FIXED** — 30px cap, left-anchored, one object |
| P0-3 | **The walking route was straight chords** — crossed the Hudson twice, cut through blocks, followed no street | **FIXED** — real Mapbox Directions walking geometry, `src/data/route.json`, regenerate with `scripts/build-route.mjs`. 2.5 mi / ~45 min, now stated on the map page |
| P0-7 | `/map` had no footer — the destination of every CTA on the site was a dead end | **FIXED** |
| P0-8 | Hero paintings cropped through the faces (2.84:1 band, 3:2 canvas, 47% discarded at a 50% focal point) | **FIXED** — per-chapter `heroFocus` read off each canvas |
| P0-4 | Painting dialog caption + Close clipped below the viewport at 844×390 | **OPEN** |
| P0-5 | Map stop labels suppressed at 390 and 844 — five anonymous numbered dots | **OPEN** — my own fix for the clipped-label defect traded clipping for anonymity. Needs a third answer (collision-aware label placement, or names in the arrival plate with a clear tap affordance) |
| P0-6 | The 1860 overlay is an ungeoreferenced rectangle over a live modern map, modern street names showing round all four edges | **OPEN** — needs either real corner coordinates or re-presenting it as a "then" view rather than an overlay. A design decision, not a bug fix |

**26 P1s and 19 P2s are itemised in `docs/v5/juror-pass1.md` and are untouched.**
The heaviest cluster is `/map` (P1-2 … P1-7, P1-11, P1-25, P1-26) and the
press-reveal detail (P1-15 … P1-17, P1-20).

## IN PROGRESS
**Stage 4 is NOT passed. Do not report this run as complete.**

Exact next actions, in order:
1. Close juror P0-4, P0-5, P0-6.
2. Work the 26 P1s from `docs/v5/juror-pass1.md`, `/map` cluster first.
3. Re-deploy, then run **juror pass 2** — a fresh subagent, no builder context,
   same prompt shape as pass 1 (it is recorded in the git history of this file's
   commit range). The finish condition is unchanged: **every page ≥8 on every
   axis at every breakpoint, zero P0/P1, and two consecutive passes that
   surface nothing new.**

### What IS closed, by measurement, not opinion

| Wil's confirmed defect | Proof |
|---|---|
| 1 · header/display type too big | Display renders **one size per breakpoint** (88px at 1440, 64 at 768/1024) instead of six sizes site-wide; hero fits the fold at all five viewports, having overflowed by 87–256px at four of them |
| 2 · same painting three times per chapter | `probe.md` repeated-imagery table: **empty**, every route, every viewport |
| 3 · menu buttons overlap other buttons | `states-final/states.md`: **110 states captured · 0 collisions** |
| 4 · sloppy alignment | One `--ui-inset` for all floating UI (the burger was 124px outside the content edge); Mapbox chrome on one lane; footer padding follows the actual floating UI |

Also closed: chapter rhythm `128,200,0,0,128,400,200` (was `200,200,200,200,400,200,200`
on all five chapters); `portal.history` 4,064→1,531 chars with every fact
preserved and Kathy's corrected "skiff" wording winning; six identical
"Make a Difference" CTA headings → six distinct; console clean; CLS ≤0.012;
no horizontal overflow.

## IN PROGRESS


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
