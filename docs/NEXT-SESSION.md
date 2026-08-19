# Starting a new session on this repo (cloud or local)

The Charles Nalle Walking Memorial — a static Astro site for the Hart Cluett
Museum (Troy, NY), paired with bronze QR plaques. **v7 "The Last Ten Percent"
completed 2026-08-16** at commit `443c6d7`; the live site equals HEAD.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

## 1 · Read these first, in this order

1. `AGENTS.md` (= `CLAUDE.md`, a symlink) — the non-negotiables.
2. `docs/RUN-STATE.md` — **the live ledger.** CURRENT PHASE, the DONE table,
   every run-time DECISION and why. This is truth for "where are we", together
   with `git log` — never a memory or a summary.
3. `docs/v7/REVIEW-GUIDE.md` — what shipped per requested item (§1), instrument
   bars (§2), the eleven juror passes (§3), **residual P2/P3 (§4)** and the
   **human queue (§5)**. §4 and §5 are the open list; start there.
4. `docs/v4/DESIGN-STANDARDS.md` + `docs/v4/CALIBER-RUBRIC.md` before any design
   work; `docs/v4/DECISIONS.md` for judgement calls and how to revert them.

## 2 · Branches and deploy

- **The site is the `v2` branch.** Work there and push there.
- **`main` is the legacy Vite/React SPA — a different application** with
  unrelated git history (no common ancestor; the two can never be merged), as
  are `match-figma-designs`, `feat/*`, `fix/*`, `test-branch`. Never merge,
  build, deploy, or push to them. Pages publishes from Actions, so a push to
  `main` would build the OLD app over the live site. The legacy tip is frozen
  at tag `legacy-spa-final`.
- `v2` is the repo's **default branch** (set 2026-08-19), so a fresh clone or
  cloud session lands here automatically.
- Every push to the site branch auto-deploys to GitHub Pages via
  `.github/workflows/deploy.yml` (Pages build type = "GitHub Actions"; no
  branch setting governs it). **Live must equal HEAD before any review pass** —
  verify with `curl -sI <live>/ | grep last-modified` plus a grep of the live
  bundle for a string you just changed.

## 3 · Running it

```bash
npm install
npm run dev        # :4321 — seeds .env from .env.production automatically
npm run check      # type-check (astro check)
npm run build      # production build + CSS check
```

**On a fresh machine or container, install the browser first:**

```bash
npm run qa:setup   # playwright install chromium — the npm package ships no browser
```

Without it every instrument fails with "Executable doesn't exist". `qa:perf`
additionally drives Chrome through `chrome-launcher`; if no system Chrome is
present, point it at the Playwright build with
`export CHROME_PATH=$(node -e "console.log(require('playwright').chromium.executablePath())")`.

Quality instruments live in `scripts/` (`npm run qa:*`), all take `--base URL`
and default to :4321 — `rag` (runts, glyph-ink clips, em dashes), `a11y` (axe +
keyboard + reduced motion + 200 % zoom), `states` (interaction states and
collisions), `contrast` (computed style AND pixel sampling over imagery),
`census` (type/rhythm ladder), `frames` (curtain capture), `walk-check`,
`museum-check`, `audio-check`, `arrival`, `probe`, `shots`, `perf`.
Full list and re-run recipe: `docs/v7/REVIEW-GUIDE.md` §6.

**Perf is measured on the PRODUCTION build only** — `npm run build` →
`astro preview --port 4322` → `node scripts/perf.mjs --base http://localhost:4322`.
Dev-server Lighthouse numbers are noise.

## 4 · Rules that were learned the expensive way

- **Disk is truth.** `docs/RUN-STATE.md` + `git log` + the live site, never a
  recollection. Write NEXT ACTION before stopping.
- **Atomic act:** implement → re-measure with the instrument → commit → update
  RUN-STATE, as one unit. Push at least every three commits.
- **Identify before you fix.** Audit first, write the finding down, then fix.
  A new round of work starts with a new AUDIT, not with edits.
- **Measure an element against its LANE**, not against itself — `body.scrollWidth`
  vs `innerWidth`, the card's right edge vs the column's. A `nowrap` that looks
  fine in isolation widened a grid column and clipped a whole page (v7 pass 9).
- **Kathy Sheehan's prose is untouchable.** No word changes without a logged
  correction in `docs/CONTENT-STATUS.md`; punctuation-only edits are logged too.
- **One Playwright process at a time**, and never let a foreground command hit
  its timeout while an instrument runs — the harness SIGTERMs Chromium helpers
  and it reads as a crash.
- Guardrails: no scroll-jacking, reduced-motion parity, keyboard reaches
  everything, no hover-only affordances, no loading gates, floating UI on
  `--ui-inset`, motion on house tokens, zero console errors, `withBase()` for
  every URL.

## 5 · Kickoff prompt template

Paste into a fresh session, with your list filled in:

> Work on the Charles Nalle Walking Memorial in this repo. Read `AGENTS.md`,
> then `docs/RUN-STATE.md`, then `docs/v7/REVIEW-GUIDE.md` §4–§5 — that is the
> current state; v7 is complete and the live site equals HEAD.
>
> This round: <PASTE YOUR EDIT LIST HERE>
>
> Work autonomously to completion. Audit before fixing: write each item into
> `docs/v8/AUDIT.md` with what is wrong, where (file:line), and how you will
> verify it, before changing anything. Then work item by item, atomically
> (implement → re-measure with the relevant `npm run qa:*` instrument → commit →
> update `docs/RUN-STATE.md`), pushing at least every three commits, and verify
> live equals HEAD after each push. Do not ask me for check-ins; anything only a
> human can decide goes into a queue at the end. Finish by re-running the
> instruments that cover what you touched, and write me a short review guide of
> what changed and what still needs me.

For a change big enough to need a caliber bar again, use the juror protocol in
`docs/v7/JUROR-PROMPT.md`: fresh-eyed agents scoring the live build, two
consecutive clean passes on an identical build.
