# pasqua.it — hard-numbers design measurement audit

**Method.** Playwright + headless Chromium 1440×900 and 390×844, realistic desktop/iOS UA,
`waitUntil: networkidle` (90 s). Pages: `/` (home), `/vision/`, `/roots/`, `/sangue-doro/`.
Numbers come from `getComputedStyle` + `getBoundingClientRect` + `Range.getClientRects()`
in-page, not from screenshots. 64 screenshots in `docs/v4/qa/inspo/pasqua/`.

**The site did NOT block headless browsing.** HTTP 200, full render, all fonts and CSS available.
Two access facts that shaped the method:

1. **Entry gate.** `/` renders a full-bleed painting + a `button.b-room-cta` labelled
   `START THE EXPERIENCE` (237×31 px) that must be clicked before any content appears
   (`00-gate-1440.png`). Interior pages are reachable directly with no gate.
2. **Nothing scrolls natively.** On every page `html` and `body` are `overflow: hidden` and
   `document.documentElement.scrollHeight` is pinned to the viewport height (900 / 844).
   The real scroller is `div#app` — `position: fixed`, `overflow-y: scroll`, `height: 100vh`.
   `#app.scrollHeight` on `/vision/` = **7 287 px** while `document.scrollHeight` = **900 px**.
   Wheel events are intercepted and lerped (2 500 px of `deltaY` moved content **84 px**;
   6 000 px moved **205 px**, ratio ≈ 0.034). All measurement and scrolling was therefore
   driven by setting `#app.scrollTop` directly, which works exactly (set 6387 → read 6387).

**Stack.** Nuxt 2 static export. `gsap 3.27.1` + `ScrollTrigger`, `three.js`, `howler.js`.
Fonts self-hosted: `Wulkan Display` (400) and `Acid Grotesk` (400, 500), woff/woff2,
`font-display: swap`. Only one external stylesheet (a third-party wine-tourism widget).

---

## 1. TYPE CENSUS

### Distinct rendered font-sizes, per page, per viewport

| page | @1440 distinct sizes (px) | n | @390 distinct sizes (px) | n |
|---|---|---|---|---|
| `/` | 18, 52.5, 105 | 3 | 13, 30, 40 | 3 |
| `/vision/` | 15, 16, 18, 22.4, 24.75, 25.5, 63.75, 105 | 8 | 16, 18, 22, 22.4, 25.5, 43 | 6 |
| `/roots/` | 15, 18, 21, 25.5, 27, 105 | 6 | 16, 18, 20, 22, 43 | 5 |
| `/sangue-doro/` | 15, 16, 18, 25.5, 40.5, 105 | 6 | 12, 16, 17, 18, 22, 43 | 6 |
| **union, 4 pages** | 15, 16, 18, 21, 22.4, 24.75, 25.5, 27, 40.5, 52.5, 63.75, 105 | **12** | 12, 13, 16, 17, 18, 20, 22, 22.4, 25.5, 30, 40, 43 | **12** |

**A single page never renders more than 8 sizes.** Typical page: 6.

### Ratio between adjacent steps

@1440 union, adjacent ratios in order:
`1.07 · 1.13 · 1.17 · 1.07 · 1.10 · 1.03 · 1.06 · 1.50 · 1.30 · 1.21 · 1.65`

This is not one scale. It is **two clusters plus one jump**:

- **UI/prose cluster 15 → 27 px** — 8 of the 12 sizes live here, ratios 1.03–1.17
  (i.e. sizes that are visually near-identical; 24.75 vs 25.5 is a 1.03 step).
- **A single 1.5–1.65× gap** from 27 px to the mid/display range.
- **Display 105 px**, used on every page at 1440.

Per page the working scale is much cleaner — `/vision/` @1440:
`15 · 16 · 18 · 22.4 · 24.75 · 25.5 · 63.75 · 105`, i.e. body cluster ×1.1 steps, then **×2.5**
(25.5 → 63.75) then **×1.65** (63.75 → 105).

### Display vs body

| page | display px | body prose px | ratio |
|---|---|---|---|
| `/vision/` @1440 | 105 | 16 | **6.6 : 1** |
| `/roots/` @1440 | 105 | 18 | **5.8 : 1** |
| `/sangue-doro/` @1440 | 105 | 40.5 (lead-in) / 18 (prose) | 2.6 : 1 / 5.8 : 1 |
| `/vision/` @390 | 43 | 16 | **2.7 : 1** |
| `/roots/` @390 | 43 | 16 | **2.7 : 1** |

**The display : body ratio collapses from 6.6 : 1 to 2.7 : 1 between desktop and mobile.**

### The type is fluid vw with a 12 px floor

Every size is authored as `font-size: max(12px, N vw)`. Measured source values:

| CSS value | px @1440 | role |
|---|---|---|
| `max(12px, 7.2916666667vw)` | 105.00 | display (desktop) |
| `max(12px, 11.0256410256vw)` | 43.00 @390 | display (mobile) |
| `max(12px, 4.4270833333vw)` | 63.75 | sub-display |
| `max(12px, 2.8125vw)` | 40.50 | lead paragraph |
| `max(12px, 1.7708333333vw)` | 25.50 | large prose |
| `max(12px, 1.25vw)` | 18.00 | prose / UI label |
| `max(12px, 1.0416666667vw)` | 15.00 | fine print |

Line-heights are unitless and few: **`1`, `0.857142857`, `1.185`, `1.227`, `1.32`**.
Display: `line-height: 0.857142857` → **105 px type on a 90 px line** (leading is *negative*).
Prose: 18 px / 22.5 px = **1.25**; 25.5 px / 33.75 px = **1.32**; 16 px / 18.4 px = **1.15**.

### Font families — 2 total

| family | weights rendered | sizes it appears at (@1440, `/vision/`) | role |
|---|---|---|---|
| **Acid Grotesk** | 400, 500 | 15, 16, 18, 25.5, 63.75, 105 | prose, UI labels, **and** display |
| **Wulkan Display** | 400 only | 16, 22.4, 24.75, 105 | display, chapter numerals, eyebrows |

They are **not** split display/prose. Both appear at 105 px, and the signature move is
mixing them *inside one heading*: the `<h2>` is Acid Grotesk and an inner `<em>` switches
to Wulkan Display at the same 105 px — see `vision-1440-s2-y1597.png`
("FROM INSPIRATION" serif / "TO PROJECTS" grotesk).
`/roots/` @1440 uses Wulkan Display on **890 of 1 011** text nodes (the awards list, 840 nodes at 21 px).

### Tracking, case, colour

- **`letter-spacing: normal` on 100 % of measured text nodes** across all 4 pages, both
  viewports. There is no tracking anywhere, not even at 105 px, not even on 15 px caps.
- `text-transform: uppercase` on **21 of 76** Acid Grotesk nodes and **22 of 32** Wulkan
  Display nodes (`/vision/` @1440). All display type is uppercase.
- Text colours, whole site: **`rgb(0,0,0)`**, **`rgb(187,187,173)`** (sage, used over imagery),
  **`rgb(193,56,14)`** (red accent — 2 nodes on `/vision/`). Three colours total.

---

## 2. SPACING

### The spacing system is one unit, declared in CSS

```
:root                                   { --grid-unit: 32; --grid-val: calc(100/32) }  /* 3.125 */
@media screen and (max-width: 47.99em)  { --grid-unit: 13; --grid-val: calc(100/13) }  /* 7.6923 */
```

**1 unit = `--grid-val` × 1vw.** = **45.00 px @1440**, = **30.00 px @390**.
Every section pad is expressed in that unit:

| token | expression | @1440 | @390 |
|---|---|---|---|
| page gutter (`.u-padding`) | `--grid-val × 1vw` / `× .5vw` mobile | **45 px** (1u) | **15 px** (0.5u) |
| section `padding-top` | `--grid-val × 4vw` (12.5vw) | **180 px** (4u) | **120 px** |
| section `padding-bottom` | `--grid-val × 2vw` (6.25vw) | **90 px** (2u) | **60 px** |
| footer `padding-top` | — | **450 px** (10u) | **300 px** |

Measured section padding tokens on `/vision/` @1440:
`T180/B90/L45` ×4, `T450/B11.25/L45` ×1 (footer), `T0/B0/L0` ×2 (hero, accordion).
On `/roots/` @1440 add `T180/B0/L45` ×2. **Four padding recipes site-wide.**

### Section rect gaps = 0

Sections are flush-stacked: **all 7 inter-section gaps on `/vision/` @1440 are exactly `0` px**.
There are no margins between sections. All whitespace is *padding inside* the coloured band,
which is why the ground colour change lands precisely on the whitespace boundary.

### Real voids (measured as bands with no text and no media)

Sweep of every text `ClientRect` + every `img/video/svg/picture`, merged, gaps ≥ 20 px:

`/vision/` @1440 — 18 voids:
`22 · 23 · 26 · 36 · 39 · 46 · 46 · 51 · 55 · 69 · 69 · 73 · 112 · 169 · 236 · 241 · 259 · 352`

`/sangue-doro/` @1440 — 9 voids:
`27 · 46 · 46 · 72 · 179 · 183 · 199 · 252 · **452**`

`/roots/` @1440 — 62 voids, dominated by the awards list rhythm:
32 voids fall in the 30 px bucket, 8 in the 25 px bucket, 8 at 40 px, 6 at ~71 px,
then `104 · 123 · 162 · 168 · 195 · 253 · 447`.

**Across all 4 pages @1440: 90 voids, 38 distinct heights.** Bucketed to 10 px:

```
20px×8   30px×36  40px×10  50px×6   60px×1   70px×10  100px×1  110px×1
120px×1  160px×1  170px×2  180px×2  200px×2  210px×1  240px×2  250px×2
260px×1  350px×1  450px×2
```

**Is it a small quantised set? Yes at the small end, no at the large end.**
64 of 90 voids (71 %) sit in just three buckets — **30 px, 40 px, 70 px** — which are
0.67u / 0.89u / 1.6u. The large voids (160–452 px) are *not* quantised; they are the
residue of fixed 180/90 padding meeting variable content height, so they land on
arbitrary values (169, 195, 236, 241, 253, 259, 352, 447, 452).

### The largest deliberate void

**452 px** — `/sangue-doro/` @1440, y 3 545.5 → 3 997.5, immediately above the footer.
= **0.50 viewport-heights** = **10.0 grid units**.
Runner-up **447 px** (`/roots/`, y 12 851 → 13 298, same position). Both are the
`footer { padding-top: 450px }` token. The largest *mid-page* void is **352 px**
(`/vision/` y 5 476 → 5 828 = 0.39 vh), the seam between the draggable slider and the
next paragraph section — see `roots-1440-s3-y4661.png` for a screen that is ~55 % empty.

@390 the largest voids are **328 px** (home, 0.39 vh), **290 px**, **239 px**, **222 px**.
Same ratio, smaller absolute: the void is proportional, not fixed.

---

## 3. BOX CENSUS

Counting every element ≥ 8×8 px with `border-width > 0` and a non-transparent border colour,
**or** a `background-color` differing from the page background:

| page / vp | decorated elements total | full-bleed ground bands | sub-viewport-width "boxes" | **boxes per viewport-height** |
|---|---|---|---|---|
| `/vision/` @1440 (9 bands) | 30 | 7 | 15 | **1.7** |
| `/roots/` @1440 (15 bands) | 36 | 5 | 30 | **2.0** |
| `/sangue-doro/` @1440 (5 bands) | 14 | 1 | 11 | **2.2** |
| `/vision/` @390 (8 bands) | 25 | 7 | 14 | **1.8** |
| `/roots/` @390 (16 bands) | 36 | 5 | 30 | **1.9** |
| `/sangue-doro/` @390 (4 bands) | 14 | 1 | 11 | **2.8** |

**How many framed/boxed elements are visible in a typical single viewport? Effectively zero.**

That "1.7–2.8" number is misleading and must be discounted, because **almost every one of
those sub-viewport boxes is a `div.picture__cover`** — the olive `rgb(92,98,28)` wipe mask
that sits over an image and is animated to `scaleY(0)` on reveal (measured computed
transform: `matrix(1.05, 0, 0, 0, 0, 0)`). It is a transition artefact, not a frame.
Excluding those, the persistent decorated elements across all 4 pages are:

- **21 × 9 px circles** (`roots-timeline__timeline-dot`, `border-radius: 100%`)
- **1 × 45×45 px ring** (`roots-timeline__timeline-dot-inner`, `border: 1px rgb(193,56,14)`,
  `border-radius: 100%`) — **the only bordered element found on the entire site**
- **1 px hairline rules.** `/vision/` 8 (1 px, `rgb(0,0,0)`), `/sangue-doro/` 2,
  `/roots/` a 1×2880 px timeline axis in `rgb(92,98,28)`, plus the awards list:
  scrolled to y 7769 on `/roots/`, **13 of the 13 decorated elements in that viewport are
  1 px black rules** (`roots-1440-s5-y7769.png`).

### Border-radius values in use

| value | count | where |
|---|---|---|
| **`0px`** | 12 / 14 / 22 / 35 (per page) — **effectively 100 % of rectangles** | everything |
| `100%` | 21 | timeline dots on `/roots/` only |

**No rounded rectangles exist anywhere on the site.** No cards, no chips, no panels,
no shadows. The only closed shapes are photographs and four full-bleed colour bands.

---

## 4. GRID / MEASURE

**@1440**

- Every section is **1440 px wide** (8 of 8 on `/vision/`). There is no centred max-width wrapper.
- Page margins: **45 px left / 45 px right** (`.u-padding`, = 1 grid unit = 3.125vw).
- Content column: **1350 px** (1440 − 90). Confirmed: `.b-title` measures 1350×810,
  `.paragraph__title` 1350×185.
- Average character width of the prose font (Acid Grotesk 18 px, measured with a 55-char ruler):
  **8.8 px**.

Text-block widths actually used, in grid units:

| px | grid units | est. chars @8.8 px | measured chars/line |
|---|---|---|---|
| 315.0 | 7u | 35.8 | **34 – 36** |
| 326.3 | 7.25u | 37.1 | **31 – 39** |
| 425.4 | 9.45u | 48.3 | **54** |
| 472.5 | 10.5u | 53.7 | **51** |
| 675 / 676.3 | 15u | 76.9 | — |
| 810 | 18u | 57.9 @ 40.5 px | **74 – 98** |
| **900** | **20u** | 102.3 | **68** (at 25.5 px lead type) |
| 1350 | 30u | 153 | display only |

**Prose measure is 31–54 characters per line** for the 18 px two-column body
(`326.3 px` and `472.5 px` blocks), and **68 characters** for the 25.5 px single-column
lead at 900 px. The 900 px block is only ever used at the larger 25.5 px size,
which is what keeps it inside a readable measure — at 18 px it would be 102 ch.

**@390**

- Margins **15 px / 15 px** (0.5u). Content column **360 px**.
- Text-block widths: **259.8 px (8.7u), 300 px (10u), 360 px (12u), 390 px (full bleed)**.
- Measured chars/line: **43 – 47** (360 px @16 px), **27 – 34** (259.8 px @16 px).

**Horizontal overflow.** `/roots/` @1440: rightmost text ink is at **x = 5 769 px** against a
1 440 px viewport — **4 329 px of drag-only content off-screen**. `/vision/` @390: text ink
spans **−20.9 px → 409.4 px**, i.e. **19 px past both edges** (the marquee band).

---

## 5. MOTION

CSS harvested from all 54 same-origin stylesheets + `<style>` blocks (467 KB, 1 697 rules;
1 cross-origin sheet blocked).

### transition-duration — distinct set (10 values)

| duration | occurrences |
|---|---|
| **0.75 s** | **57** |
| **0.2 s** | **49** |
| 0.4 s | 17 |
| 0.3 s | 16 |
| 0.5 s | 9 |
| 0.6 s | 7 |
| 0.1 s | 4 |
| 1 s | 4 |
| 5000 s | 5 *(the infinite marquee)* |
| 0.05 s | 2 |

**Two durations carry 60 % of all transitions: 0.75 s and 0.2 s.**
Practical read: `0.2s` = hover/UI feedback, `0.75s` = reveal/state change.

### animation-duration — distinct set (6 values)

`1 s` ×5 · `3 s` ×2 · `2 s` ×2 · `1.2 s` ×2 · `5000 s` ×2 · `0.3 s` ×1
Keyframes defined: **`spin`, `noise`, `infinite-bounce`, `autofill`** (+ 3 from the video player).

### transition-delay

Only three values exist: `0s`, `0.1s` ×2, `0.2s` ×2. **Staggering is done in JS, not CSS.**

### transition-timing-function — distinct set (7)

| function | occurrences | equivalent |
|---|---|---|
| `cubic-bezier(.215,.61,.355,1)` | **61** | easeOutCubic |
| `linear` | 56 | — (mostly the marquee) |
| `ease-in-out` | 43 | — |
| `cubic-bezier(.77,0,.175,1)` | **32** | easeInOutQuart |
| `ease` | 28 | browser default |
| `ease-out` | 6 | — |
| `steps(3)` | 2 | — |

But on **live elements** only two ever resolve:
`cubic-bezier(0.215, 0.61, 0.355, 1)` and `cubic-bezier(0.77, 0, 0.175, 1)`.
On `/roots/` @1440 the computed pair `transition-duration: 0.5s, 0.75s` with
`cubic-bezier(0.215,0.61,0.355,1)` twice appears on **252 elements** (the awards rows).

### JS animation libraries — present

| library | evidence |
|---|---|
| **GSAP 3.27.1** | `version:"3.27.1"` in bundle; 52 `gsap` string hits across chunks (two stale copies 3.6.0/3.6.2 also bundled) |
| **ScrollTrigger** | 10 hits, `et.ScrollTrigger \|\| st("scrollTrigger", e)` |
| **three.js** | 196 hits; `window.__THREE__` present; homepage renders a single **1440×900 `<canvas>`** |
| **howler.js** | 42 hits; `window.Howler`, `window.Howl`; a sound on/off toggle sits in the footer |
| Lenis / Locomotive / Framer Motion / Swiper / Barba | **not found** — the smooth scroll is custom (native `overflow-y:scroll` on `#app` + wheel lerp) |

`window` keys observed: `gsapVersions`, `HowlerGlobal`, `Howler`, `Howl`, `__THREE__`.

### GSAP duration & ease literals in the bundles

Durations: `1.2` ×40 · `0.6` ×21 · `1` ×20 · `0.8` ×20 · `0.5` ×17 · `0.4` ×8 · `0.3` ×7 ·
`1.5` ×3 · `8` ×2 · `3.5` ×2 · `0.2` ×2 · `0.1` ×2 · `2` · `1.8` · `1.45` · `0.95` · `0.7` · `0.075`

Eases: `power2.out` ×52 · `power2.inOut` ×29 · `expo.inOut` ×12 · `power3.inOut` ×7 ·
`expo.out` ×6 · `none` ×5 · `linear` ×4 · `power2.in` ×3 · `power1.inOut` ×2 ·
**`powe2.out` ×2 (typo — silently falls back to the default ease)**.

**The JS timeline is slower than the CSS one: the modal GSAP duration is 1.2 s vs 0.75 s in CSS.**

---

## 6. COLOR / GROUND

Four ground colours across the whole site, all fully opaque, no gradients on sections:

| swatch | rgb | hex | role |
|---|---|---|---|
| sage | `rgb(187, 187, 173)` | `#BBBBAD` | default page ground, `body` background |
| clay | `rgb(111, 101, 73)` | `#6F6549` | alternate band, footer |
| ochre | `rgb(147, 133, 80)` | `#938550` | alternate band |
| olive | `rgb(92, 98, 28)` | `#5C621C` | alternate band, image reveal masks |
| accent | `rgb(193, 56, 14)` | `#C1380E` | asterisk decoration, timeline dot — text on 2 nodes only |

**Yes, the page changes ground — repeatedly, and it is the primary chaptering device.**

`/vision/` @1440, in scroll order (identical at 390):

```
y     0 –   504  #BBBBAD  hero (photo bleeds over it)
y   504 – 1584  #BBBBAD  intro
y  1584 – 2703  #6F6549  paragraph + image      <- ground change #1
y  2703 – 4310  #938550  project slider         <- ground change #2
y  4310 – 5660  #BBBBAD  draggable slider       <- back to sage
y  5660 – 6610  #5C621C  paragraph              <- ground change #3
y  6610 – 7110  #BBBBAD  podcast accordion
y  7110 – 7594  #6F6549  footer
```

**6 ground changes over 7 594 px = one every ~1 265 px (1.4 viewports).**
The seam is visible mid-screen in `vision-1440-s1-y798.png` (sage → clay) and
`vision-390-s1-y751.png` (same seam at 390).

`/roots/`: `#BBBBAD → #938550 → #938550 → #5C621C → #BBBBAD → #6F6549` (4 distinct, 5 changes over 13 330 px).
`/sangue-doro/`: only **2** grounds, 2 changes over 4 029 px — the shortest page is also the flattest.

**There is no dark mode and no true dark ground.** The darkest band, `#5C621C`, still carries
black text. Body text is `rgb(0,0,0)` on all four grounds; the only light text
(`rgb(187,187,173)`) sits over photography.

---

## 7. IMMERSIVE / STORYTELLING DEVICES — the 5 strongest

### 7.1 The homepage is not a page — it is a 3-room WebGL diorama with no scroll

Evidence: `home-1440-room0.png` … `home-1440-room7.png`, `00-gate-1440.png`.

`document.scrollHeight === 900` and `#app.scrollHeight === 900`: **the homepage has zero
scrollable content.** `<main>` contains one `section.rooms` (1440×900) over a single
**1440×900 `<canvas>`**. Navigation is a paged chapter carousel:
`button.rooms__content-controls-control--prev` (236×75) and `--next` (234×75), each a
49×49 arrow + a 164×75 label, pinned in `div.rooms__content-controls` (1440×165) at y 735
(bottom 18 % of the viewport). The DOM label reads `DRAG`. Chapters cycle
**(CH. I) VISION → (CH. II) ROOTS → (CH. III) WINES** and loop.

The lockup at the bottom corners is, top to bottom:
**eyebrow `(CH. I)` — 18 px Wulkan Display, `rgb(187,187,173)`, at x 176 / y 780**, then
**title `VISION` — 52.5 px Wulkan Display**, with the arrow disc outboard.
Everything is gated behind `START THE EXPERIENCE`.

### 7.2 The hero is deliberately cropped to 56 vh, not 100 vh

Evidence: `vision-1440-s0-y0.png`, `sanguedoro-1440-s0-y0.png`.

```css
.hero__image        { height: 100vh }
.hero__image.small  { height: 56vh }   /* what /vision/, /roots/, /sangue-doro/ actually use */
.hero__image (alt)  { height: 75vh }
```

Measured: **504 px tall at 1440×900 (56 %), 472.6 px at 390×844 (56 %)**.
The image is `object-fit: cover`, full-bleed 1440 px wide, and the page title is
*inside* it, bottom-left: `.hero__title` at **x 45 (= 1 grid unit), y 369**, 329×90 px,
105 px Acid Grotesk uppercase in `rgb(187,187,173)`. The next section's flat colour starts
immediately at y 504 with **zero** gap. Every hero image also carries
`div.noise` — `background-image: url(noise.png)`, `opacity: 0.65`,
**`mix-blend-mode: hard-light`** — a film-grain plate over 100 % of the photograph.
A rotating black `MANIFESTO` disc (circular text "UNCONVENTIONAL • UNCONVENTIONAL •",
25.5 px) straddles the hero/intro seam at the right edge.

### 7.3 Chapter openers: a two-line headline with a family swap mid-sentence

Evidence: `vision-1440-s2-y1597.png` ("FROM INSPIRATION" / "TO PROJECTS").

The exact lockup order in `.paragraph__title` / `.slider__title` / `.draggable-slider__title`
is **not** eyebrow → number → title → rule. It is:

```
h2  (105 px, line-height 90 px, uppercase, Acid Grotesk)
└─ div.line          ← one div per rendered line
   └─ div.line__inner ← the animated element, horizontally offset per line
      └─ em          ← THIS ONE WORD/PHRASE SWITCHES TO WULKAN DISPLAY, same 105 px
```

Measured on `/vision/`: line 1 `.line` is 1350×95 but its `.line__inner` is **1089 px wide
starting at x 269** and the `<em>` inside is **1089×149 at y+71**; line 2 `.line__inner` is
**808 px at x 293**. On `.slider__title` line 1 `.line__inner` sits at **x = −45** — it
**bleeds 45 px off the left edge**. Each line is independently offset horizontally, so the
two lines of a heading are ragged and drift on scroll rather than sitting on a shared axis.

The optional decoration is a **45×45 px red asterisk** (`div.title__decoration`,
`background-image: url(/svg/decoration.svg)`, `position: absolute; left: 540px; top: 11.25px`)
placed *inline inside* the first line — visible in `vision-1440-s0-y0.png`.
No rules, no numerals, no eyebrow above the title.

**Where numerals do appear** they are Wulkan Display and right-aligned:
`.podcast-header__wrapper` (1440×48) reads
`EPISODE` (16 px Acid Grotesk, x 45) → `01` (**22.4 px Wulkan Display**, x 115) →
**a 1×26 px vertical rule at x 270** → details (16 px, x 315, 1080 px wide).
Slider captions use the same idea: title left (18 px uppercase) + counter `01/06`
right in Wulkan Display (`vision-1440-s4-y3194.png`).

### 7.4 The 105 px manifesto slab: one heading owning 90 % of the viewport

Evidence: `vision-1440-s1-y798.png`, `vision-390-s1-y751.png`.

`.b-title.intro__title` on `/vision/` measures **1350 × 810 px** — 9 lines of 90 px, at
105 px / 0.857 line-height, in Wulkan Display. At a 900 px viewport that is **90 % of the
screen occupied by a single paragraph set as display type**, edge to edge from x 45 to
x 1395, with a 180 px pad above and 90 px below. There is no image, no rule, no chrome —
the ground colour and the type are the entire composition. At 390 the same block is
43 px type and still fills the screen.

### 7.5 Imagery: full-bleed for ground, hard-cropped rectangles for content, olive wipe reveal

Evidence: `vision-1440-s2-y1597.png` (158×215 postage stamp), `vision-1440-s4-y3194.png`
(676×648 slab + 315×405 secondary), `roots-1440-s5-y7769.png` (sticky 315×220 image).

- **Full-bleed** is reserved for the hero only: `hero__image`, `b-picture`, `picture__image`
  and `noise` all measure **1440 × 504**. On `/vision/` @1440 there are 21 elements at
  width ≥ 1440 and **16 of them are the hero stack or a flat colour band** — not photos.
- **Everything else is a framed rectangle with `border-radius: 0px` and no border**, at
  wildly different scales inside one section: the `.paragraph__picture` is **158 × 215 px**
  (a 3.5u × 4.8u postage stamp floated left of a 1035 px headline) while the slider's
  primary image is **675 × 810** and the secondary **315 × 405** — an exact 2.14 : 1 area
  ratio, deliberately mismatched.
- **Reveal**: each `figure.b-picture` carries `div.picture__cover` filled
  `rgb(92, 98, 28)` with computed transform `matrix(1.05, 0, 0, 0, 0, 0)` —
  `scaleX(1.05) scaleY(0)`. The image is uncovered by an **olive block wiping vertically**,
  not by a fade. This is the single most repeated component on the site
  (10 of 11 non-full-bleed "boxes" on `/sangue-doro/`).
- **Drag rows**: `div.draggable-slider__pictures` is **2 468.5 px wide inside a 1440 px
  viewport** on `/vision/` (3 006.5 px on `/sangue-doro/`), holding 8 pictures at
  446×491, 332×365 and 6 × 248×273 — a deliberately unequal, hand-placed row you drag.
- **Pinned**: `/roots/` uses `div.awards__left` — `position: sticky; top: 135px`, 315×220.5 px —
  so a single image holds still beside 6 754 px of scrolling award rows
  (`roots-1440-s5-y7769.png`). This is the **only** `position: sticky` element found on the site;
  everything else pinned is `position: fixed` chrome: `header.app-header` (1440×99.2, z 3),
  `nav.shop-navigator` (1152×720, z 2), `section.manifesto` (1152×720, z 9),
  `div.app-cursor` (1440×900, z 1 — a custom 90 px cursor).

---

## 8. WHAT IS BAD — would not survive an accessibility or mobile review

1. **Keyboard scrolling is broken.** `html` and `body` are `overflow: hidden`; the scroller is
   `div#app` (`position: fixed`, `overflow-y: scroll`) with **`tabindex = null`**. Measured:
   pressing **`End` moved the page 0 px** (main rect stayed at y −239). A keyboard-only or
   switch user cannot reach the footer of a 13 330 px page without first tabbing into a link
   inside the container. `document.scrollHeight` reports **900 px** on a page whose real
   content is **13 330 px**, which also breaks browser find-on-page scroll-into-view,
   scroll restoration, and any assistive tech that trusts document height.

2. **Zero `prefers-reduced-motion` support.** **0 occurrences** in 467 KB of CSS across
   16 distinct media queries. The single JS hit is a library feature-detect object
   (`reducedMotion: matchMedia("(prefers-reduced-motion)").matches`) whose value is referenced
   nowhere else. Against that: 4 keyframe animations, 90+ CSS transitions, a three.js canvas,
   a `5000s` infinite marquee, a 90 px custom cursor, and GSAP timelines up to 8 s.
   This is a WCAG 2.3.3 / 2.2.2 failure and a vestibular-trigger risk.

3. **Images have no alt text.** `/vision/` **22 of 23**, `/roots/` **13 of 13**,
   `/sangue-doro/` **14 of 14**, `/` **2 of 2**. Effectively **51 of 52 images site-wide
   have an empty or missing `alt`** — on a site whose entire argument is carried by imagery.

4. **Tap targets fail the 24×24 minimum.** @1440: **20–22 elements per page** under 24 px.
   Every primary nav link is **22.5 px tall**; the shop links are **18 px tall**.
   The smallest is the language switch: **`IT` at 10.4 × 22.5 px** and **`EN` at 17.5 × 22.5 px**.
   @390 four targets remain under 24 px, all at **21.6 px** tall (`EN`, `PRIVACY`, `COOKIES`).
   WCAG 2.5.8 minimum is 24×24; Apple/Google guidance is 44/48.

5. **Focus is suppressed.** **9 `outline: none` rules** against 34 `:focus` rules, on a site
   where keyboard users already cannot scroll.

6. **The homepage is a hard gate with no fallback.** All content sits behind a
   `START THE EXPERIENCE` button, then behind a `<canvas>` with **no scrollable content at all**.
   The three chapters are reachable only by clicking 234×75 arrows or dragging. There is no
   scroll affordance, no skip link, and on touch the primary interaction is an unlabelled drag.

7. **Two headings compete for `h1`.** `/vision/` and `/roots/` each render **2 `<h1>`**;
   `/sangue-doro/` renders **3**.

8. **Horizontal overflow at 390.** `/vision/` text ink spans **x −20.9 → 409.4** in a 390 px
   viewport — content sits **19 px past both edges**. `/roots/` @1440 has text ink out to
   **x 5 769** (4 329 px off-screen) reachable only by dragging, with no visible scrollbar
   or keyboard equivalent.

9. **105 px display type is not responsive to content, only to viewport.** A 9-line `<h1>`
   block measures **1350 × 810 px** — 90 % of a 900 px viewport for one sentence. At
   1024×600 laptop heights that heading would exceed the viewport entirely. The `max(12px, …vw)`
   floor also means `/sangue-doro/` @390 renders body text at **12 px**.

10. **Contrast is thin by construction.** Black text on `#938550` (ochre) and `#5C621C` (olive)
    passes, but the sage `#BBBBAD` display type sitting over photography in the hero
    (`vision-1440-s0-y0.png`) has no scrim and no fixed contrast floor — legibility depends
    entirely on which photo is loaded.

11. **Custom cursor replaces the system cursor** (`div.app-cursor`, 1440×900, a 90 px inner
    element) with `body { cursor: auto }` — motion-tracking chrome that cannot be disabled and
    has no reduced-motion variant.

---

## Appendix — evidence index (`docs/v4/qa/inspo/pasqua/`)

| file | shows |
|---|---|
| `00-gate-1440.png` | entry gate, `START THE EXPERIENCE` |
| `home-1440-room0…7.png` / `home-390-room0…7.png` | 3-chapter WebGL rooms, `(CH. I)` lockup |
| `vision-1440-s0-y0.png` | 56 vh hero, title at x 45, red asterisk, MANIFESTO disc |
| `vision-1440-s1-y798.png` | 105 px slab filling 90 % of viewport, sage→clay ground seam |
| `vision-1440-s2-y1597.png` | mixed-family headline, 158×215 postage-stamp image, 2-col prose |
| `vision-1440-s4-y3194.png` | slider, caption + `01/06` counter, `NEXT →` |
| `vision-1440-s0…s8` / `vision-390-s0…s7` | full scroll traverse, both viewports |
| `roots-1440-s3-y4661.png` | a screen that is ~55 % empty |
| `roots-1440-s5-y7769.png` | sticky 315×220 image + 13 × 1 px hairline award rules |
| `roots-1440-s0…s8` / `roots-390-s0…s8` | 13 330 px page traverse |
| `sanguedoro-1440-s0…s4` / `sanguedoro-390-s0…s3` | 452 px pre-footer void, 2-ground page |
| `vision-390-s1-y751.png` | mobile 43 px display + same ground seam |
