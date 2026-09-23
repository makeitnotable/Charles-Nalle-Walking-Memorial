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

- `docs/HANDOVER.md` — the museum's operating manual (how the plaques reach the
  site, how to change words, who to contact, the changelog).
- `docs/HANDOFF-PLAN.md` — the step-by-step transfer of the site to the museum.
- `docs/CONTENT-STATUS.md` — every known content correction and its status.
- `docs/DEVIATIONS.md` — why this repo deviates from the WBM product stack.
- `docs/v4/` — the design system: standards, naming canon, decisions, motion.
- `docs/handoff/troy-map-style.json` — a backup of the map's design (its Mapbox
  style), for re-uploading in Mapbox Studio if it is ever needed.
- `docs/PLAYBOOK-MOBILE-CHROME.md` — how the site handles Safari's and Android's
  browser bars; read before touching any full-bleed stage.
- `src/content/chapters/*.json` — all narrative content, one file per chapter.
- `src/data/about.ts` — About page content.
- `public/audio/` — narration MP3s; `public/media/` — paintings, stills and
  films, generated from `masters/` by `scripts/build-*.mjs`.

## Deploys

This code lives on the **`main` branch** of
`makeitnotable/Charles-Nalle-Walking-Memorial`, the only branch: working and
deploy branch in one. Every push to `main` deploys to GitHub Pages at
`https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` via
`.github/workflows/deploy.yml`. There is no other deployment. At handoff the
repository transfers to a museum-owned account (`docs/HANDOFF-PLAN.md`).
