# Charles Nalle Walking Memorial — v2

Client memorial site for the Hart Cluett Museum (Troy, NY). **Read `docs/PLAN.md`
before any work** — it is the locked execution plan (milestones M0–M6). Content
corrections and their status live in `docs/CONTENT-STATUS.md`; stack deviations from
the WBM constitution are recorded in `docs/DEVIATIONS.md` (static Astro + GH Pages —
no auth, no billing, no database, no analytics accounts; zero ongoing cost is a hard
client requirement).

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
- This code lives on the `v2` branch of `makeitnotable/Charles-Nalle-Walking-Memorial`
  (the legacy SPA owns `main`/`match-figma-designs` — never push to those branches).

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
