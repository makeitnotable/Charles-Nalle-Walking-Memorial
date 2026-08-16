# Contrast sweep — http://localhost:4321

AA bar: 4.5:1 (3:1 large). Style rows: computed colour over the nearest opaque background. Pixel rows: text hidden, background screenshotted and sampled under each line — ratio shown as **min / p10**; the gate uses p10.

**0 failure(s)** (0 by style · 0 by pixel) — 0 still unmeasured

| route | vp | mode | element | text | px/wt | fg | bg | ratio | bar |
|---|---|---|---|---|---|---|---|---|---|

## Pixel-measured passes (worst cases)

| route | vp | element | text | p10 | min | bar |
|---|---|---|---|---|---|---|
| / | 1440 | `p.t-meta.home-seq` | "TROY, NEW YORK · APRIL 27, 1860" | 4.76 | 3.58 | 4.5 |
| / | 390 | `p.t-meta.home-seq` | "TROY, NEW YORK · APRIL 27, 1860" | 6.76 | 4.91 | 4.5 |
| / | 390 | `p.t-meta` | "1821" | 6.77 | 6.68 | 4.5 |
| / | 768 | `p.t-meta` | "1821" | 6.95 | 6.95 | 4.5 |
| / | 768 | `p.t-meta.home-seq` | "TROY, NEW YORK · APRIL 27, 1860" | 7.24 | 5.63 | 4.5 |
| / | 768 | `p.t-meta` | "1875" | 8.28 | 7.77 | 4.5 |
| / | 390 | `p.t-meta` | "1875" | 8.37 | 8.14 | 4.5 |
| / | 1440 | `p.t-meta` | "1821" | 8.37 | 8.29 | 4.5 |
| / | 1440 | `p.t-meta` | "1875" | 8.53 | 8.37 | 4.5 |
| / | 390 | `span.t-wordmark.home-seq` | "NALLE" | 12.26 | 11.07 | 3 |
| / | 768 | `span.t-wordmark.home-seq` | "NALLE" | 12.6 | 11.23 | 3 |
| / | 1440 | `span.t-wordmark.home-seq` | "CHARLES" | 13.86 | 8.12 | 3 |
| / | 768 | `span.t-wordmark.home-seq` | "CHARLES" | 14.04 | 9.69 | 3 |
| / | 390 | `span.t-wordmark.home-seq` | "CHARLES" | 14.21 | 10.57 | 3 |
| / | 1440 | `span.t-wordmark.home-seq` | "NALLE" | 14.57 | 11.44 | 3 |

## Unmeasured (0)

- none