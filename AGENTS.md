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
- **Branches.** The Astro site is this repo's default branch: `main` (renamed
  from `v2` on 2026-08-16; if the rename has not been applied yet the site is
  still on `v2` — check `git branch -r`). `.github/workflows/deploy.yml` fires
  on BOTH names, so the rename is transparent to CI and plain `git push` on the
  checked-out branch is always correct. The legacy Vite/React SPA is a DIFFERENT
  application with unrelated git history (no common ancestor, so it can never be
  merged): `legacy-spa` (frozen, tag `legacy-spa-final`), `match-figma-designs`,
  `feat/*`, `fix/*`, `test-branch` — never merge, build, deploy, or push to any
  of them.
- A fresh clone has no `.env` (gitignored) and `astro dev` never reads
  `.env.production`, so `npm run dev` seeds one automatically (`predev` →
  `scripts/ensure-env.mjs`). Without it the map renders with an empty token.

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
