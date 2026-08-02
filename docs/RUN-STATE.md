# CNWM v3 — RUN STATE (live ledger)

*Disk is truth. Update after every sub-step. Re-orientation: `docs/PLAN.md` → this file → `git log --oneline -8` → resume from IN PROGRESS.*

## CURRENT PHASE

**Phase 0 — Foundation repair & truth acquisition**

## LAST COMMIT

`0418f87` Phase 0.1b: mapbox-gl.css cascade fix — map renders full-viewport

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

## IN PROGRESS

> Phase 0.5: waiting on 4 inspiration agents (museos, rewild, marseille, pasqua) → then write docs/INSPIRATION.md (synthesis) + docs/ELEVATION-PLAN.md (screen × discipline blueprint) → independent blueprint review subagent → then Phase 1 (rebuild global.css to approved tokens + /styleguide route).

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
| 5 | — | — | — | pending (full) |
| 6 (live) | pending | pending | pending | pending |
| 6 stakeholder test | pending | | | |
