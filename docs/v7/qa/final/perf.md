# Lighthouse (mobile, simulated slow-4G, 4× CPU) — PRODUCTION build via `astro preview :4322`

Bars (docs/PLAN.md Part E): home ≥ 95 · chapters ≥ 95 · /people /about ≥ 95 · /paintings ≥ 80 desktop / ≥ 70 mobile · /map ≥ 63 (its baseline; documented exception) · a11y 100.

| route | perf | a11y | best-practices | LCP | TBT | notes |
|---|---|---|---|---|---|---|
| / | 97 | 100 | 100 | 2.55 s | 0 | LCP = the wordmark text (font-bound); removing the Caslon preloads makes it worse (2.63 s) |
| /bakery | 99 | 100 | 100 | 1.96 s | 0 | |
| /commissioners-office | 98 | 100 | 100 | 2.26 s | 0 | |
| /mansion | 98 | 100 | 100 | 2.11 s | 0 | |
| /ferry | 98 | 100 | 100 | 2.19 s | 0 | |
| /barbershop | 98 | 100 | 100 | 2.10 s | 0 | |
| /map | 64 | 100 | 100 | 9.0 s | ~400 ms | baseline 63; the mapping engine's cost (documented exception) |
| /people | 99 | 100 | 100 | 1.66 s | 0 | |
| /paintings | 89–90 | 100 | 100 | 3.3 s | ~175 ms | museum build chunked across idle callbacks (unchunked it read 78–85) |
| /about | 99 | 100 | 100 | 1.58 s | 0 | |

Measured 2026-08-16 (P3/P5/P7 checkpoints; final build re-measured for /map, /, /paintings). Raw JSON in the scratchpad runs (`perf-p3*`, `perf-p5*`, `perf-p7*`); `baseline-perf/summary.json` holds the P0 baseline.
