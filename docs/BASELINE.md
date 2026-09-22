# CNWM v3 — Design Baseline (final tokens)

*Phase 0 deliverable. Source: the Approved Design Language Reference in `docs/PLAN.md`
(extracted 2026-08-02 from the legacy `match-figma-designs` implementation — the rendered
truth of the approved Figma). Figma MCP was unavailable this run (OAuth required,
non-interactive session; ClaudeTalkToFigma bridge not connected) — plan's fallback active.
Legacy repo is the authority for exact markup; this file is the token contract Phase 1 builds.*

## Color tokens (Radix-method 12-step, dark-only, one warm ramp)

### Primary (brand: brown → burnt orange)

| Step | Hex | Role |
|---|---|---|
| primary-1 | `#0e0807` | deepest bg |
| primary-2 | `#1d1411` | **page background** |
| primary-3 | `#341a11` | surfaces (cards, player idle) |
| primary-4 | `#4a1b0a` | active surface (player playing, narration wash) |
| primary-5 | `#592411` | hover |
| primary-6 | `#69311d` | **the universal border — on everything** |
| primary-7 | `#80412b` | secondary border/hairline |
| primary-8 | `#a55438` | strong border |
| primary-9 | `#f26835` | icon/active accent (canonicalized — legacy token said #f28835 but #F26835 shipped 13×) |
| primary-10 | `#e45b27` | badges/fills (chapter number circles, marker chips) |
| primary-11 | `#ff9770` | labels/secondary text |
| primary-12 | `#fed9cc` | body text |

### Neutral (warm cream)

| Step | Hex | Role |
|---|---|---|
| neutral-2 | `#100a06` | deep overlay / **curtain panel** |
| neutral-11 | `#e6decf` | soft cream |
| neutral-12 | `#f6f3ee` | headings |

### Gray

| Step | Hex | Role |
|---|---|---|
| gray-7 | `#4b4741` | home frame border |
| gray-11 | `#b7b3ab` | muted copy |

### Special

- Home CTA pill: `bg #FFC6B3 / text #BD3900 / border #F7A98F` — the only inverted element.
- Scrims: `linear-gradient(#1D1411, rgba(16,10,6,.95), #1D1411)`; hero fade `to top, from var(--primary-2)`.

## Type tokens

- **Martel Sans**: display semibold (600), body 300. Weights to ship: 300/600/800.
- **Poppins**: 400/500 — ONLY buttons, marker pills, progress labels (where it visibly shipped / Figma says).
- **Ladder (core signature): every size ×1.25 at md(768), ×1.5 at lg(1024).**
  - Hero h1: 42/34px → 52.5/42.5 → 63/51 · tracking −1.5 → −1.875 → −2.25px
  - Section h3: same scale, often uppercase, intentional hard `<br/>` breaks
  - Body narrative: 18px / 300 / leading 1.6 / primary-12
  - Labels: 12 → 15 → 18px uppercase primary-11
  - Wordmark: 54 → 67.5 → 81px, tracking −2.5px, two interlocked lines (second `self-end -mt-3`)
- First-WORD drop cap: 32px font-medium, negative vertical margins, once per chapter.
- Rag: `text-wrap: balance` (display) / `pretty` (body); no widows.

## Spacing / shape

- 1 Figma unit = 8px = 2 Tailwind units → **even-numbered utilities only**.
- Shell `max-w-7xl mx-auto`. Section ladder: `pt-8 px-4 → md:py-4 md:px-10 → lg:py-8 lg:px-20`.
- Media: `rounded-3xl` + border primary-6, universally.

## Motion tokens

- CSS default `duration-300`; GSAP reveals `power2.out 0.6–1.0s stagger 0.2 start "top 80%"`;
  pops `back.out(1.7)`; curtain `circ.inOut` in / `circ.out` out; Ken Burns `scale 1→1.2 scrub`;
  keen-slider linear 400ms. Map: arrival 5s ease, flyTo `zoom 20 speed .6 curve 1.4`, return 2s.
- Every effect has a reduced-motion variant. Motion is feedback and cinema, never decoration.

---

# Phase 1 removal inventory (v2-invented identity → superseded)

| Item | Where | Action |
|---|---|---|
| Fraunces import | `global.css:2`, `package.json` devDeps `@fontsource-variable/fraunces` | Remove; replace with `@fontsource/martel-sans` 300/600/800 |
| Newsreader import | `global.css:3`, `package.json` devDeps `@fontsource-variable/newsreader` | Remove; replace with `@fontsource/poppins` 400/500 |
| Paper grain | `global.css` `.paper::before`; applied `Base.astro:42` `<body class="paper …">` | Delete class + usage |
| Per-chapter palettes | `--chapter-surface/ink/accent` in `global.css:18-21`; `Base.astro` `palette` prop + inline style on `<html>`; consumed via `var(--chapter-accent)` in TroyMap/PressReveal/Narration/pages | Stop styling from palette; keep `palette` fields in chapter JSONs as data (plan: keep as data). One approved ramp everywhere. `--chapter-accent` refs → primary-9/10 |
| v2 type classes | `.font-display` (Fraunces variation settings), `.display-hero`, `.drop-cap` (letter-cap — approved design uses first-WORD cap) | Rebuild as Martel Sans roles in Phase 1 |
| `theme-color #121212` fallback | `Base.astro:33` | → primary-2 `#1d1411` |
| v2 motion tokens | `--ease-settle/--ease-drift/--dur-*` | Replace with house vocabulary tokens |
| Site header/footer (v2 generic nav) | `Base.astro` | Phase 2: replaced by corner-notched menu overlay + approved footer |

**Keepers confirmed present:** `src/content/chapters/*.json` (Kathy's content), `public/media/` pipeline,
narration timings, PressReveal concept, People/Paintings pages, Brian's pins (in chapter JSONs),
reduced-motion baseline, Mapbox token via `.env.production`, `docs/WIL-PLAYBOOK.md`.
