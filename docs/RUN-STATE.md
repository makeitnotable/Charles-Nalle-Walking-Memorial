# CNWM v3 — RUN STATE (live ledger)

*Disk is truth. Update after every sub-step. Re-orientation: `docs/PLAN.md` → this file → `git log --oneline -8` → resume from IN PROGRESS.*

## CURRENT PHASE

**Phase 0 — Foundation repair & truth acquisition**

## LAST COMMIT

`22ee66f` CI: surface npm ci's error log and fall back to npm install *(pre-run baseline)*

## DONE

- [x] 2026-08-02 ~eve — Plan read in full from `~/.claude/plans/ultrathink-i-will-update-kind-dream.md`
- [x] 2026-08-02 ~eve — Plan copied to `docs/PLAN.md`; RUN-STATE created

## IN PROGRESS

> Phase 0.0: commit PLAN.md + RUN-STATE.md, push. Then Phase 0.1: fix the island CSS bug — add `@source` directives to `src/styles/global.css`, add structural plain-CSS classes (`.map-shell`, `.reveal-frame`), `map.resize()` + ResizeObserver, post-build CSS guard script, verify emitted CSS via grep, then visual acceptance via Playwright screenshots at 390/768/1440.

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
