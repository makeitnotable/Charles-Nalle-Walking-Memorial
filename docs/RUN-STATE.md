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

## IN PROGRESS

> Phase 0.3: attempt Figma pull via ClaudeTalkToFigma bridge (timeboxed, one attempt — official Figma MCP needs OAuth, unavailable in this non-interactive session; plan's fallback = Design Language Reference + legacy repo). Then Phase 0.4: v2-invented-identity removal inventory → docs/BASELINE.md. Then QA smoke review subagent. Then Phase 0.5.

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
