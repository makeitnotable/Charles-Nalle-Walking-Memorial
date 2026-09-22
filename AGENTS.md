# Charles Nalle Walking Memorial — v2

Client memorial site for the Hart Cluett Museum (Troy, NY).

**Design work starts at `docs/v4/DESIGN-STANDARDS.md`** — the system contract,
with the source of every number. The acceptance bar is `docs/v4/CALIBER-RUBRIC.md`
(craft against three named reference sites, never fidelity to a spec — that was
the v3 mistake). Judgement calls and how to revert them: `docs/v4/DECISIONS.md`.
Motion census: `docs/v4/MOTION.md`. Naming is single-sourced from
`name.{canonical,display,short}` in the chapter JSON — the bronze plaques govern
(`docs/v4/NAMING-CANON.md`). `/styleguide` renders the whole system at real size.

`docs/PLAN.md` is the v4 execution plan; `docs/RUN-STATE.md` tracks where the
build got to. Content corrections live in `docs/CONTENT-STATUS.md`; stack
deviations from the WBM constitution are in `docs/DEVIATIONS.md` (static Astro +
GH Pages — no auth, no billing, no database, no analytics accounts; zero ongoing
cost is a hard client requirement).

Non-negotiables inherited from the constitution's design baseline:

- Every animation has a `prefers-reduced-motion` variant.
- Keyboard reaches everything; focus always visible.
- Works at 375px; tap targets ≥ 24px.
- Narrative text is Kathy Sheehan's domain — never rewrite story prose without a
  correction documented in `docs/CONTENT-STATUS.md`.
- Perf budget (from M1): Lighthouse mobile ≥ 90 perf / ≥ 95 a11y, LCP < 2.5s throttled.
- The base path differs per environment (GH Pages serves under
  `/Charles-Nalle-Walking-Memorial`; dev and Vercel previews under `/`) — always build
  URLs with `withBase()` from `src/lib/url.ts`, never hardcode root-relative paths.
- **This site is the `v2` branch.** Check out `v2`, work on `v2`, push `v2`
  (plain `git push`). Every push auto-deploys to GitHub Pages via
  `.github/workflows/deploy.yml`.
- **`main` is a mirror of the shipped `v2` — never develop on it.** Since the
  2026-09-22 sign-off (`docs/v4/DECISIONS.md`, "Ship"), `main` holds exactly the
  `v2` commit that was shipped to the client, refreshed at each sign-off with
  `git push --force origin v2:main` (its history is `v2`'s, so a force is the
  only way to move it). The deploy workflow publishes on pushes to `main` as
  well as `v2`, so a push to `main` republishes whatever `main` holds: only ever
  push the `v2` tip there. The retired 2024 Vite/React app that `main` used to
  hold — unrelated git history, no common ancestor with this site — lives on
  `legacy-spa` (tip = tag `legacy-spa-final`); it, `match-figma-designs`,
  `feat/*`, `fix/*` and `test-branch` are never merged, built, deployed or
  pushed to. Shipped versions carry a tag (`ship-2026-09-22`).
- A fresh clone has no `.env` (gitignored) and `astro dev` never reads
  `.env.production`, so `npm run dev` seeds one automatically (`predev` →
  `scripts/ensure-env.mjs`). Without it the map renders with an empty token.

**Mobile browser chrome — Safari 26's glass bars, full-bleed stages, viewport
units — is solved on `/map` and the solutions transfer.** Read
`docs/PLAYBOOK-MOBILE-CHROME.md` before touching any full-bleed stage, the
bars' colour, or anything sized in `lvh`/`svh`/`dvh`: the measured geometry,
the runway pattern and its three traps, the `<body>`-colour rule, the
reset-on-open rule, and how to verify each without a phone
(`npm run qa:framing`). Client rounds 1–21 (2026-09-15 → 09-18) are in
`docs/rounds/`, one manifest and plan per round.

## Client rounds — the discipline

Rounds 1–2 shipped `lvh` stage sizing against a simulated browser bar, and Wil
found the map, the splash and the card strip broken on his phone. Every client
round now runs under three mechanical gates and one rule; each round's manifest
lives in `docs/rounds/<date>-round-N.json` (the plan's allowed-file list).

1. **Revert point.** Before the first edit: `git tag client-round-N-base <v2 tip>`.
   This repo's tokens may refuse tag pushes, so also push the same commit as a
   branch, `claude/client-round-N-base`, and carry the SHA in the manifest.
   Undo a round: `git reset --hard client-round-N-base`.
2. **Scope gate.** `npm run qa:scope` before every commit and push. It diffs the
   tree against the round's base and fails on any path the manifest does not list.
3. **Visual gate.** `npm run qa:snap` against `astro preview --port 4331`
   (11 routes × 390/768/1440 plus the museum rail; canvases masked). Baselines
   live in `docs/qa/baseline/`; refresh them with `npm run qa:snap:update`, which
   touches only routes the manifest's `snap.allowedRoutes` names. Drift anywhere
   else is a defect to fix, never a new baseline.
4. **Device first.** Anything that depends on browser chrome or viewport units
   (`lvh`/`dvh`/`svh`, safe areas, the bar tint) never ships to `v2` on
   assumption. It goes to the review branch or the hidden test page
   (`/chrome-test`) for Wil's phone first — no instrument here can see Safari's bars.

Every round report ends with the checklist, the verified/unverified split and
the revert command.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
