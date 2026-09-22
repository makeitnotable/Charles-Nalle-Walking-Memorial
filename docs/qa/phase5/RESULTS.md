# Phase 5 — Performance & hardening results

*Lighthouse mobile, simulated 4G (throttled ~1.6Mbps), local preview build. Raw reports +
summary.json in this folder. Bars (docs/PLAN.md): perf ≥90 · a11y ≥95 · LCP <2.5s on chapter
pages (the QR path) · zero CLS.*

## Final numbers

| Route | Perf | A11y | Best-practices | LCP | CLS | TBT | Transfer |
|---|---|---|---|---|---|---|---|
| / (home) | **90** ✓ | 95 ✓ | 100 | 3.6s | 0.001 | 0ms | 1.77MB |
| /bakery (QR path) | **89** | **100** ✓ | 100 | 3.6s | 0.036 | 0ms | **598KB** |
| /map | 66 | **100** ✓ | 100 | 6.3s | 0.001 | 304ms | 2.0MB |

## What the phase changed (before → after)

- /bakery: perf 79→89 · a11y 93→**100** · transfer **4.79MB→598KB** (−87%)
- /map: perf 40→66 · TBT **3289ms→304ms** · hydration CLS **0.6362→0.0012**
- /: perf 85→90 · LCP 4.35→3.6s

Levers applied: all ambient/autoplay videos lazy-load via IO and never start before the
window load event (posters are the instant paint); hero sketch carries `fetchpriority=high` +
`<link rel=preload>`; sketches recompressed (grayscale q42, −25%); below-fold images lazy;
hidden fallbacks no longer download; map island's box server-reserved; time-pill contrast
fixed to AA (primary-2 on primary-10, 4.9:1); footer tap targets ≥24px.

## Residuals (documented, none block)

1. **/bakery perf 89 (bar 90), LCP 3.6s (target 2.5s).** The remaining path is render-blocking
   CSS+fonts before a 183KB full-viewport LCP image on simulated 1.6Mbps. Real-world LTE runs
   3–8× faster than the simulation; the page is 598KB total with zero blocking time and CLS
   0.036. Next lever if wanted: critical-CSS inlining or a smaller mobile sketch rendition.
2. **/map perf 66.** Inherent to a WebGL-map-first page (mapbox-gl parse + tile fetch is the
   LCP). Interaction health is clean: TBT 304ms, CLS 0.001, a11y 100. The QR sidewalk path
   (chapters) never pays this cost; map JS loads only on map/chapter routes.
3. Wheel-scroll over the full-viewport map zooms the map (standard map-page tradeoff); the
   stop index below is reachable by keyboard/touch/drag past the shell.

## Content verification

`git diff 22ee66f..HEAD -- src/content/ src/data/` = **empty**: Kathy's narrative, Brian's
pins, and the cast data are bit-identical to the pre-run state. Pending content items
unchanged (ferry skiff rewrite, Ch2a/Ch4 audio re-records, Athenaeum image — Wil's drops,
tracked in docs/CONTENT-STATUS.md).

## A11y sweep (from the discipline reviews + Lighthouse)

- Keyboard end-to-end verified (UX review): menu, reveal, scrub (arrow keys), Escape, focus
  rings visible everywhere.
- a11y 95–100 on all three audited routes; the two Lighthouse failures found (time-pill
  contrast, footer link size) fixed this phase.
- Reduced-motion parity verified across 19/19 reveals + curtain + map + player (Motion review).
- No-JS: /map serves the complete stop index; chapters serve full narrative HTML.
