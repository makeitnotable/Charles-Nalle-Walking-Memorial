# Charles Nalle Walking Memorial — v2

The story website for the Charles Nalle Walking Memorial in Troy, NY: four bronze
QR plaques on the streets where, on April 27, 1860, the people of Troy — led by
Harriet Tubman — freed Charles Nalle from the Fugitive Slave Act.

Built for the Hart Cluett Museum by Notable / WBM. Static Astro site, hosted free
on GitHub Pages; the bronze plaques' QR codes point at permanent
`hartcluett.org/nalle/*` redirect URLs owned by the museum.

## Develop

```bash
npm install
npm run dev        # serves at localhost:4321
npm run build      # static output in dist/
```

## Where things live

- `docs/PLAN.md` — the full rebuild plan (milestones M0–M6). Read this first.
- `docs/CONTENT-STATUS.md` — every known content correction and its status.
- `docs/DEVIATIONS.md` — why this repo deviates from the WBM product stack.
- `src/content/chapters/*.json` — all narrative content, one file per chapter.
- `src/data/about.ts` — About page content.
- `public/audio/` — narration MP3s.
- Heavy media (paintings, animations) is **not** in this repo yet — the M1 media
  pipeline imports it optimized from the legacy asset library.

## Deploys

This code lives on the **`v2` branch** of
`makeitnotable/Charles-Nalle-Walking-Memorial` (the legacy SPA keeps `main` and
`match-figma-designs` untouched). Every push to `v2` deploys to GitHub Pages at
`https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` via
`.github/workflows/deploy.yml`; Vercel also builds a branch preview automatically.
At M6 handoff the branch graduates to a museum-owned repo.
