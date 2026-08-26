# v13 — the eleven-item ledger

*Wil's 8/26 round. Work order: `docs/v13/BRIEF.md`. Report:
`docs/v13/REVIEW-GUIDE.md`. Planned against `277262c`; executed from `06e76e2`.*

**Scope lock.** Wil: *"You're not allowed and must not change or edit anything
that is not on this list. Everything else on the website must stay the same."*
Bugs found outside the eleven are reported in the review guide, not fixed.

**Rule of evidence.** A subagent's report is not evidence — the instrument
output is. Every row below was re-measured by the orchestrator against HEAD
before the change and after it.

| # | his # | item | state | SHA |
|---|---|---|---|---|
| V13-01 | 1 | 1858 lens → map close is jittery | OPEN | — |
| V13-02 | 2 | desktop chapter cards: equal gaps, ends not clipped | OPEN | — |
| V13-03 | 3 | Ch2 Part-2 hero must blend like Part 1 | OPEN | — |
| V13-04 | 4 | Historical Context plate: more picture, larger, no black flash, 1.00→1.03 scrub, feathered | OPEN | — |
| V13-05 | 4.1 | hall drawer eyebrow, still/alive tap switch, desktop chip centring | OPEN | — |
| V13-06 | 4.2 | "black bars", viewport/mobile-web-app metas, safe areas | OPEN | — |
| V13-07a | 4.3a | 1858 plate blurry at max zoom on mobile/tablet | OPEN | — |
| V13-07b | 4.3b | doubled rule under the menu's X | OPEN | — |
| V13-08 | 4.4 | quote section alignment on every chapter | OPEN | — |
| V13-09 | 4.5 | two orange lines below the X (duplicate of V13-07b) | OPEN | — |
| V13-10 | 4.6 | mobile paintings hall — six sub-items | OPEN | — |
| V13-11 | 4.7 | mobile menu secondary-nav spacing | OPEN | — |

## Pre-flight measurements (orchestrator, against HEAD `06e76e2`)

**V13-06 head audit — his diagnosis is false on every count.**
`dist/` at HEAD, 12 built routes:

```
unique <meta name="viewport"> strings across dist/*.html : 1
  width=device-width, initial-scale=1, viewport-fit=cover
viewport metas per document                              : 1  (all 12)
/map mobile-web-app block                                : byte-identical to
  index.html and bakery.html — theme-color #1d1411,
  mobile-web-app-capable, apple-mobile-web-app-capable,
  apple-mobile-web-app-status-bar-style black-translucent,
  apple-mobile-web-app-title
```

`viewport-fit=cover` is present on `/map`. There is no per-page override to
remove; `Base.astro`'s only `<slot />` sits inside `<main>`, so no page *can*
inject a head tag. The consolidation he asks for is already the architecture.

**V13-03 — one value, confirmed by reading the two style strings.**
`src/pages/[chapter].astro`:

```
:345 hero 1  linear-gradient(to top, rgb(29,20,17) 0%, …,.8 26%, …,.36 48%, transparent 64%),
             linear-gradient(to bottom, rgba(29,20,17,.55), transparent 18%)
:441 hero 2  linear-gradient(to top, rgba(29,20,17,.95) 0%, …,.8 24%, …,.36 44%, transparent 60%),
             linear-gradient(to bottom, rgba(29,20,17,.6), transparent 16%)
```

Hero 1's first stop is opaque and exactly the page ground; hero 2's is 95%, so
5% of painting-over-`#100a06` bleeds at the boundary. That is the whole seam.

**V13-05a — two render sites, confirmed.** `Museum.tsx:1871` (the `!portraitUI`
card) and `:1952` (the `portraitUI` sheet) both emit
`<p className="t-meta">Location&nbsp;{pad2(plaque.order)}</p>`. Eleven other
"Location NN" sites exist on the site; `paintings.astro:225` is the location
*button* he explicitly protects. Only the two plaque sites change.
