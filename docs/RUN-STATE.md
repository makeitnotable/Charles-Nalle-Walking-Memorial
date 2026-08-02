# CNWM v3 — RUN STATE (live ledger)

*Disk is truth. Update after every sub-step. Re-orientation: `docs/PLAN.md` → this file → `git log --oneline -8` → resume from IN PROGRESS.*

## CURRENT PHASE

**COMPLETE — all phases 0 → 6 DONE (2026-08-03, ~4:50am)**

## LAST COMMIT

`06d3d5b RUN COMPLETE: all phases 0-6 done, four disciplines green on live, stakeholder test passed. Morning read: docs/REVIEW-GUIDE.md` (final)

## DONE

- [x] 2026-08-02 ~eve — Plan read in full from `~/.claude/plans/ultrathink-i-will-update-kind-dream.md`
- [x] 2026-08-02 ~eve — Plan copied to `docs/PLAN.md`; RUN-STATE created (`0c71732`)
- [x] Phase 0.1 — Island CSS bug FIXED, two layers: (a) `@source` directives in global.css so Tailwind scans `.tsx` islands — verified via grep of dist CSS (`h-[100dvh]`, `aspect-ratio:3/2`, `orientation:portrait` all emit now); (b) **the deeper root cause**: `mapbox-gl.css` sets `.mapboxgl-map{position:relative}` and loads AFTER the utility bundle, overriding `.absolute` at equal specificity → container 0-height even with utilities present. Fixed with `.map-shell .map-canvas` (two-class specificity) structural CSS. Plus `map.resize()` on load + ResizeObserver, and `scripts/check-css.mjs` post-build guard (6 checks) wired into `npm run build`. (`c3f8381`, `0418f87`)
- [x] Phase 0.1e — Visual acceptance PASSED: `docs/qa/phase0/map--{390,768,1440}.png` show streets/labels/5 markers/route line full-viewport. Press-reveal box correct (bakery--390.png: 4/5 portrait aspect, sketch + hint visible).
- [x] Phase 0.2 — Playwright harness installed: `scripts/shots.mjs <outdir> [--base] [--routes]` captures every route × 390/768/1440 + scroll positions. `scripts/map-probe.mjs` = map diagnostic.

- [x] Phase 0.3 — Figma unavailable (official MCP needs OAuth, non-interactive session; ClaudeTalkToFigma bridge not connected — one attempt made). Fallback ACTIVE per plan: Reference + legacy repo.
- [x] Phase 0.4 — `docs/BASELINE.md` (final tokens + Phase 1 removal inventory). `docs/LEGACY-PORT-NOTES.md` (verbatim legacy spec: full 5-ramp tokens, all signature components, section order, motion vocab — the porting bible for Phases 1–3).
- [x] Phase 0 QA smoke review (fresh subagent): all 3 claims PASS. P1 (map numerals rotated 90°) FIXED — inline counter-rotation on marker span, screenshot-verified upright. P2s noted: markers 2/5 overlap at overview zoom (Phase 3 rebuilds markers entirely); v2 sticky Listen chip overlap (v2 UI dies in Phase 2 re-skin). Verdict: docs/qa/reviews/phase0-qa-smoke.md.
- [x] Prep — fonts swapped: @fontsource martel-sans 300/600/800 + poppins 400/500 installed & imported; fraunces/newsreader uninstalled. keen-slider installed. Build green + CSS guards pass.
- [x] Legacy screenshots captured: docs/qa/legacy/ (9 routes × 3 viewports + scrolls) from charles-nalle-walking-memorial.vercel.app.
- [x] Phase 0.5 (1/6 agents back): Google A&C study → docs/qa/inspiration/googleac.md (8 techniques). QA smoke agent done.

- [x] Phase 0.5 (3/5 agents back): museos (8 techniques: hold-to-reveal tour, numbered spine, odometer dates, narration rows), pasqua (8: pull-back reveal, CTA-is-the-loader, gesture-gated sound, screen-space type), googleac (8: question-led door, eyebrow taxonomy, zoom-crop essay, related-ladder). All in docs/qa/inspiration/*.md.
- [x] Phase 1 CORE (done early while agents run): global.css rebuilt as approved system — 5×12 ramps, type roles (.type-display/-wordmark/-body/-label/-progress/-eyebrow/-muted/-card-title) on the ×1.25/×1.5 ladder, .first-word cap, .frame idiom, motion tokens, curtain/narration/reveal primitives, structural island CSS kept. `/styleguide` route renders all of it — screenshot-verified at 1440 (docs/qa/phase1/). v2 identity classes (paper/font-display/label-caps/prose-narrative/drop-cap) deleted from CSS; v2 pages reference them until Phase 2 re-skin (expected mid-flight state).

- [x] Phase 0.5 COMPLETE: all 5 studies in (docs/qa/inspiration/). docs/INSPIRATION.md (synthesis + guardrails) + docs/ELEVATION-PLAN.md (traceable blueprint, status-tracked) written. Blueprint review subagent RUNNING.
- [x] Phase 1 Visual Design review: **PASS** (60/60 hexes exact, ladder measured exact at all widths, zero Fraunces/paper remnants). Fixes applied: .first-word → 400 (legacy font-medium resolved to 400 — no Martel 500 exists), styleguide button text ladder, demo radii, BASELINE weight list amended, dead Narration.tsx/InlineMedia.astro deleted. Verdict: docs/qa/reviews/phase1-visual-design.md.
- [x] Phase 2 core screens BUILT (all screenshot-verified vs legacy):
  - Base.astro: v2 header/footer killed; curtain markup + init; Menu component (top-right default, bottom-right on chapters).
  - src/lib/curtain.ts — MPA curtain (cover on A → navigate → exit on B via sessionStorage; reduced-motion instant; data-curtain-label for destination names; data-no-curtain opt-out).
  - Menu.astro — corner-notched 72×72 hamburger + back.out(1.7) panel (Home/1–5/Walk/People/Paintings/About), Escape closes, focus managed.
  - index.astro — approved Home (H1/H2/H3 ☑): frame + splash film + staggered rise + rule draw.
  - [chapter].astro — approved skeleton (C1–C7 ☑): hero w/ PressReveal fill inside bordered frame + GSAP scrub parallax; quote pull; AudioStory island (two-state player + synced transcript + scrub + paragraph-seek + mini-player); HistoricalContext (points + portal.history prose); full-bleed Moral w/ scrim; WhereToNext w/ EmbedMap (per-chapter cameras, 5s arrival, approved marker) + Continue-the-walk/Get-Directions buttons; Share footer. Menu bottom-right (matches legacy chapters).
  - PressReveal restyled (approved tokens, fill prop). people/paintings/about/404 re-skinned (P1/P2/G1/A1/A2 ☑).
- [x] All committed + pushed through "Phase 2: People…404 re-skinned".

- [x] Phase 3 CORE BUILT + screenshot-verified: TroyMap.tsx rewritten to signature #4 (tilted chrome-free overview settles via skippable prologue; exact stem-dot pill markers anchored by stem direction — separates stops 2/5; keen-slider overlap carousel w/ two-tap + 150ms debounced camera follow; flyTo zoom-20 dive; Overview return 2s; route-draw; guided flythrough skippable; 1860 lens re-skinned; geolocate + scale bottom-left; hint card; deep-link ?stop= w/ 5s arrival + name plate (M10); all flights skippable (S9)). map.astro re-skinned (typographic index M12). Evidence: docs/qa/phase3/map-settled--1440.png (all 5 pills, 3D tilt), map-focus--390.png (dive + carousel).
- [x] Phase 0.5 blueprint review: **YES (conditional)** — 9 gaps + 2 guardrail flags → ALL resolved: ELEVATION-PLAN amended (C10–C13, M10–M12, S7–S9 + conscious-drops section w/ rationale); curtain fail-open implemented both halves (F2); flight skippability (F1). Verdict: docs/qa/reviews/phase05-blueprint-review.md.
- [x] Phase 4 batch 1 BUILT: C10 painting interlude (full-bleed Ken Burns scrub + credit chip), C11 lateral chapter exits, C8 quote reveal, C13 "April 27, 1860" curtain over-title on chapter navs (wired site-wide via data-curtain-date), G2 animated paintings in gallery dialog, S4 CN-wordmark favicon.
- [!] NOTE: one rebuild landed mid-review (~02:35) — the 4 Phase 2+3 reviewers' preview picked up Phase 4 batch-1 additively. Their findings remain valid; noted for transparency.

- [x] Phase 2+3 DISCIPLINE REVIEWS — ALL FOUR IN, every P0/P1 FIXED same-session:
  - **QA smoke: PASS** (0 P0/P1). P2 fixes applied: hero title/arrow gap, mobile overview fits pills, hint repositioned. docs/qa/reviews/phase23-qa-smoke.md
  - **UX: PASS both walkthroughs** (0 P0). P1 fixes: hint passthrough+auto-dismiss, press-hold hint raised at 390, chapter orientation line ("CNWM · Troy, NY · Stop N of 5"), 24px scrub hit area, visible tap-to-seek line. docs/qa/reviews/phase23-ux.md
  - **Visual Design: FAIL → fixed.** P0 (marker pills now ladder 12/15/18 + resize re-render, both maps); home approved overlay texture restored (webp 177/341KB) + film dimmed .6; people widow. P1-2 pin labels kept accurate (deliberate deviation → residuals); P1-3 embed verified correct when settled (evidence embed-bakery-settled.png — reviewer caught the 5s flight mid-air). docs/qa/reviews/phase23-visual-design.md
  - **Motion: PASS conditional → both P1s fixed + probe-verified.** F1: flights cut-to-destination on mousedown/touchstart (pointerdown never fires); F2: map shell server-reserved → CLS 0.6362→**0.0012**. F4 mini truncate, F6 play() guarded. Curtain fail-open PROVEN against a hung nav. docs/qa/reviews/phase23-motion-design.md
- [x] astro check 0 errors; build + 6 CSS guards green (guard now checks scale-85 as the .tsx sentinel).

- [x] Phase 5 DONE: bakery 89/100/598KB (was 79/93/4.79MB), home 90, map TBT 304ms; content diff vs pre-run = empty; docs/qa/phase5/RESULTS.md.
- [x] Phase 6 DONE: live verified end-to-end; 4 discipline finals + stakeholder test on LIVE. Motion GREEN outright; Visual/UX/QA RED→GREEN — every blocker fixed + live-probed same night (people h1, carousel remount desync, ferry viewport blowout, hint tap-eating). Stakeholder test: RECOGNIZE YES · WOWED YES. REVIEW-GUIDE.md complete (walkthrough, before/afters, verdicts, residuals, self-audit). Final commit f0db253+.

## RUN COMPLETE

The morning read starts at docs/REVIEW-GUIDE.md.

### Superseded in-progress note (kept for history)
> Phase 5: run scripts/perf.mjs (Lighthouse mobile ≥90/≥95, LCP<2.5s on /bakery) against local preview → fix what's under bar (known: ~4.7MB /bakery from autoplay historical.mp4 — lazy-load below-fold video candidates) → a11y contrast check (#FF9770 labels) → content spot-check vs CONTENT-STATUS.md → push → verify LIVE deploy → Phase 6 final gates (4 live reviews + returning-stakeholder test + REVIEW-GUIDE.md final).

## BLOCKED / NOTES

- Figma MCP (official): requires OAuth; session is non-interactive → cannot authenticate. **Fallback active per plan:** Approved Design Language Reference (docs/PLAN.md) + legacy repo `match-figma-designs` are the baseline. Will attempt ClaudeTalkToFigma bridge (needs Figma desktop plugin open) once in Phase 0; do not block on it.
- Local branch is `main` but tracks `origin/v2` — pushes land on origin/v2 (CI deploys from there). Do not rename; just `git push`.
- Legacy reference (READ-ONLY): `<project>/Charles Nalle Walking Memorial Website/Charles-Nalle-Walking-Memorial` @ `match-figma-designs`. Legacy live build: charles-nalle-walking-memorial.vercel.app
- v3 live target: makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

## REVIEW VERDICTS

| Phase | Visual Design | Motion Design | UX | QA |
|---|---|---|---|---|
| 0 | — | — | — | pending (smoke) |
| 0.5 | — | — | — | — (blueprint review instead) |
| 1 | pending | — | — | — |
| 2 | pending | pending | pending | pending (smoke) |
| 3 | pending | pending | pending | pending (smoke) |
| 4 | — | pending | pending | pending (smoke) |
| 5 | — | — | — | DONE (RESULTS.md) |
| 6 (live) | RED→GREEN | GREEN | RED→GREEN | RED→GREEN |
| 6 stakeholder test | **RECOGNIZE YES · WOWED YES** | | | |
