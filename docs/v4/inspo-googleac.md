# Design measurement audit — artsandculture.google.com

Hard-numbers audit for the CNWM v2 rebuild. Every claim below is a measured
computed-style or geometry value, or points at a screenshot in
`docs/v4/qa/inspo/googleac/`.

## Method / provenance

| | |
|---|---|
| Tool | Playwright 1.62.1 + Chromium (headless), `deviceScaleFactor: 1` (card close-ups at 2) |
| UA | desktop Chrome 131 macOS; iPhone 17.5 Safari at 390 |
| Viewports | 1440×900, 768×1024, 390×844 |
| Consent | **No consent wall.** HTTP 200 on every page. One dismissible in-page banner ("Interested in Visual arts? … No, thanks") — clicked away before measuring; logged as `dismissLog: ["No, thanks"]` |
| Probe scripts | `probe.mjs` (type/box/section/motion/color), `cards.mjs`/`cards2.mjs`/`cards3.mjs` (card micro-grid), `extra.mjs` (section headers, scrims, hover) |
| Screenshots | 74 files in `docs/v4/qa/inspo/googleac/` |

Pages measured:

| Label | URL | docHeight @1440 | @390 |
|---|---|---|---|
| `home` | `https://artsandculture.google.com` | 15,130 px | 14,261 px |
| `tubman` | `/entity/harriet-tubman/m098yd` | 2,309 px | 1,951 px |
| `story` | `/story/fQVxL4e2rcUbxA` ("What Makes Lagos' Cultural Scene Pulse?") | 16,939 px | 16,813 px |
| `category` | `/category/historical-figure` | 41,261 px | 23,597 px |

One measurement blocked: the entity page's **"Discover this historical figure / 38 items"**
asset grid never renders in headless Chromium. `document.documentElement.scrollHeight`
stayed pinned at 2,309 px through 14 wheel events to the page bottom (scrollY maxed at
1,409) and 20 s of settle time. Text for "38 items" and "Organize by" is present; zero
grid children exist. Reported as a JS-gated grid with no fallback — see §9.

Note: homepage content is randomised per load, so absolute `y` values differ between
probe runs. All *relative* offsets below were re-verified inside a single page load.

---

## 1. TYPE CENSUS

Families in use (homepage, 1440, 268 rendered text nodes):
**Google Sans** ×157, **Google Sans Text** ×103, **Google Sans Display** ×5,
Material Icons Extended ×2, Homemade Apple ×1 (the "Celebrating 15!" script lockup).
`body` font-family = `"Google Sans Text", "Noto Naskh Arabic UI", Arial, sans-serif`.

Weights: only **400** (×137) and **500** (×130). One 600 (the script logo). No bold anywhere.

### Distinct rendered font sizes per page per viewport

| Page @ vw | # sizes | sizes (px × count), largest first |
|---|---|---|
| home @1440 | **12** | 44×5, 36×18, 32×2, 24×9, 22×25, 18.67×1, 18×16, 16×55, 14×60, 13×10, 12×43, 11×24 |
| home @768 | **10** | 44×1, 32×2, 24×22, 22×31, 18×8, 16×66, 14×54, 13×10, 12×43, 11×24 |
| home @390 | **10** | 40×1, 32×2, 24×21, 22×31, 18×4, 16×67, 14×50, 13×10, 12×44, 11×28 |
| story @1440 | **11** | 44×1, 28×13, 24×1, 22×2, 18.67×1, 18×97, 16×14, 14×18, 12×11, 11×10, 10×4 |
| story @390 | **9** | 32×1, 24×1, 22×2, 18×97, 16.38×13, 16×14, 14×12, 12×16, 11×10 |
| tubman @1440 | **10** | 32×1, 24×1, 22×2, 18.67×1, 18×1, 16×3, 15×1, 14×14, 12×2, 11×2 |
| tubman @390 | **8** | 32×1, 24×1, 22×2, 18×1, 16×3, 14×7, 12×7, 11×2 |
| category @1440 | **4** | 32×1, 18.67×1, 14×203, 12×192 |
| category @390 | **3** | 32×1, 14×178, 12×179 |

**Distinct full role tokens** (family|size|weight|line-height|letter-spacing|transform|color):
home@1440 = **42**, home@768 = 38, home@390 = 38, story@1440 = 21, tubman@1440 = 17,
category@1440 = **9**. The index page runs on 9 tokens; the homepage needs 42 for the same
component vocabulary.

### The ladder and its ratios (home @1440)

`11 · 12 · 13 · 14 · 16 · 18 · (18.67) · 22 · 24 · 32 · 36 · 44`

Step ratios: **1.091, 1.083, 1.077, 1.143, 1.125, 1.037, 1.178, 1.091, 1.333, 1.125, 1.222**

This is **not a modular scale**. Ratios swing from 1.037 to 1.333. It is a hand-picked
list on a 1–2 px grid at the bottom (11/12/13/14) and a 4 px grid at the top
(16/18/22/24/32/36/44). The single useful pattern: every size ≥14 has a line-height that
is a multiple of 4.

### Size → line-height pairs (home @1440, count)

`44/52` (1.18)×5 · `36/44` (1.22)×18 · `32/40` (1.25)×2 · `24/32` (1.33)×7 ·
`22/28` (1.27)×25 · `18/24` (1.33)×16 · `16/24` (**1.50**)×55 · `14/20` (1.43)×59 ·
`13/20` (1.54)×10 · `12/16` (1.33)×43 · `11/16` (1.45)×24

Direction of travel: **big type gets tight (1.18–1.27), small type gets loose (1.43–1.54)**.
The crossover is at 18 px.

### Role → token map (the part worth copying)

| Role | Token | Colour |
|---|---|---|
| **Card eyebrow / label** | `Google Sans Text · 11 / 500 / lh 16 / ls 0.8px / UPPERCASE` | `#1A73E8` (story, pocket-gallery) or `#80868B` (explore) |
| **Card title** (on white) | `Google Sans · 16 / 500 / lh 24 / ls 0.1px` | `#3C4043` or `rgba(0,0,0,.9)` |
| **Card meta / byline** | `Google Sans Text · 12 / 400 / lh 16 / ls 0.3px` | `#80868B` |
| **Card title** (on image, small) | `Google Sans · 14 / 500 / lh 20 / ls 0.25px` | `#FFF` |
| **Card title** (on image, large) | `Google Sans · 22 / 400 / lh 28 / ls normal` | `#FFF` |
| **Section heading** @1440 | `Google Sans · 36 / 400 / lh 44 / ls normal / text-align:center` | `#202124` |
| **Section heading** @768 & @390 | `Google Sans · 24 / 400 / lh 32 / ls normal / center` | `#202124` |
| **Section dek** | `Google Sans Text · 16 / 400 / lh 24 / ls 0.1px / center` | `#5F6368` |
| **Page display heading** | `Google Sans **Display** · 44 / 400 / lh 52 / ls normal` | `#3C4043` / `#FFF` |
| Page display, entity + index | `Google Sans · 32 / 400 / lh 40` | `#3C4043` |
| **Body prose** (story) | `Google Sans · 18 / 400 / lh 24 / ls normal`, ×97 nodes, 600 px column | `#FFF` |
| Story chapter head | `Google Sans · 28 / 500 / lh 36` | `#FFF` |
| Body prose (entity bio) | **Roboto** · 14 / 400 / lh 20 / ls 0.2px, 700 px column | `#3C4043` |
| Inline link / CTA | `Google Sans · 14 / 500 / lh 20 / ls 0.25px` | `#1A73E8` |

Letter-spacing is a *function of size*, applied consistently: 11 px → 0.8 px,
12 px → 0.3 px, 14 px → 0.2 px (text) or 0.25 px (UI), 16 px → 0.1 px, ≥18 px → `normal`.
Distribution @1440: `normal`×76, `0.1px`×54, `0.3px`×43, `0.25px`×39, `0.2px`×24, `0.8px`×24, `0.11px`×8.

`text-transform: uppercase` appears **24 times on 268 nodes (9 %)** and only ever on the
11 px eyebrow.

---

## 2. THE CARD MICRO-GRID — the single most reusable finding

### 2.1 The canonical 3-line card (eyebrow → title → byline)

Screenshot: **`card-home-1440-g3-390x300.png`** (a 2× close-up of one card).
Also `card-tubman-1440-g0-w228.png`, `card-story-1440-g0-422x318.png`.

Exact vertical construction, measured on card #0 of the homepage "Step inside a gallery"
rail (card box 389.33 × 299.98, image 389.33 × 218.98, AR 1.78):

```
image bottom  ────────────────────────────────────  y = 0        (radius 8px, ends here)
                  ↕ 16 px
eyebrow line-box top ───────────────────────────── +16
eyebrow BASELINE ────────────────────────────────  +28          11/500/lh16/ls0.8/UPPER
                  ↕ 24 px baseline-to-baseline
title BASELINE ──────────────────────────────────  +52          16/500/lh24/ls0.1
                  ↕ 25 px baseline-to-baseline
byline BASELINE ─────────────────────────────────  +77          12/400/lh16/ls0.3
card bottom ─────────────────────────────────────  +81          (= last baseline + 4)
```

Box-model source of those gaps: eyebrow `margin-bottom: 3px`, title `margin-bottom: 6px`,
byline `margin: 0`. Text left inset from the card/image left edge = **0 px** (flush).

| Line | family | size | weight | line-height | letter-spacing | transform | colour | margin-bottom |
|---|---|---|---|---|---|---|---|---|
| Eyebrow | Google Sans Text | 11 | 500 | 16 | 0.8 px | uppercase | `#1A73E8` | 3 px |
| Title | Google Sans | 16 | 500 | 24 | 0.1 px | none | `#3C4043` | 6 px |
| Byline | Google Sans Text | 12 | 400 | 16 | 0.3 px | none | `#80868B` | 0 |

### 2.2 Does it hold? — verified across 19 cards on 3 pages at 2 viewports

| Page @ vw | card box | image AR | n cards | imgBottom→text top | imgBottom→baseline 1 | baseline gaps | cardBottom→last baseline | text left inset |
|---|---|---|---|---|---|---|---|---|
| home @1440 | 389.33 × 299.98 | 1.78 | 8 | **16** ×8/8 | **28** ×8/8 | **[24, 25]** ×8/8 | **4** ×8/8 | **0** ×8/8 |
| story @1440 | 421.33 × 317.98 | 1.78 | 9 | **16** ×9/9 | **28** ×9/9 | **[24, 25]** ×9/9 | **4** ×9/9 | **0** ×9/9 |
| tubman @1440 | 227.19 × 308.19 | 1.00 | 2 | **16** ×2/2 | **28** ×2/2 | **[24, 25]** / [24, 49]* | 4 / 20* | **0** ×2/2 |
| tubman @390 | 194 × 291 | 1.00 | 2 | **16** ×2/2 | **28** ×2/2 | **[24, 25]** / [24, 49]* | 20 | **0** ×2/2 |

\* the `[24, 49]` card has a 2-line title. **49 = 24 + 25** — the extra title line adds
exactly one 24 px line-height step and the title→byline gap is unchanged. The rhythm is
preserved on wrap.

**Verdict: the offsets are IDENTICAL — 100 % — across 4 different card widths
(194, 227, 389, 421 px), 2 image aspect ratios (1.00 and 1.78), 3 pages and 2 viewports.**
Only the image *size* is responsive. The text block below it is a fixed 81 px stamp.
This is the single most portable thing on the site.

### 2.3 The circular "Explore" card (image-above-text, centred)

Screenshot `card-home-1440-g0-252x378.png`. Card 252 × 378 @1440, 196 × 322 @390.
Image is a **`border-radius: 50%`** circle, AR 1.00 (252 px @1440, 196 px @390).

| offset | @1440 (n=14) | @390 (n=12) |
|---|---|---|
| image bottom → text top | **42** ×14/14 | **42** ×12/12 |
| image bottom → eyebrow baseline | **54** | **54** |
| baseline gaps (eyebrow→title→meta) | **[29, 30]** ×14/14 | **[29, 30]** ×12/12 |
| card bottom → last baseline | **13** | **13** |
| text left inset (centred) | 98.66 | 70.66 |

Lines: eyebrow `Google Sans Text 11/500/lh16/ls0.8/UPPERCASE/#80868B, margin 16px top / 8px bottom`;
title `Google Sans 16/500/lh24/ls0.1/rgba(0,0,0,.9)`; meta `Google Sans Text 14/400/lh20/ls0.2/rgba(0,0,0,.5), margin 8/8`.
Byte-identical between 1440 and 390.

### 2.4 The overlay card (text inside the image)

Dominant pattern on this site. Measured by inset from the **card bottom**, not the image bottom.

| Variant | box | image radius | lines | text bottom inset | last baseline inset | text left inset | n / consistency |
|---|---|---|---|---|---|---|---|
| home "Recommended" | 288 × 172.8 (AR 1.67) | 8 px | 2 | **4** | **8** | 56 (centred) | 10/10 |
| home square tile | 227.19 × 227.19 | 8 px | 1 | **16** | **23** | **16** | 9/10 |
| home coverflow hero | 316 × 454 (AR 0.70) | 8 px | 1 | **24** | **31** | **24** | 8/8 |
| category index | 236 × 236 @1440 · 253.33 @768 · 127.33 @390 | 0 px | 2 | **12** | **16** | **12** | 14/14 at all 3 vw |

Category index card, verified at **1440, 768 and 390 — identical**:
title `Google Sans 14/500/lh20/ls0.25/#FFF`, count `Google Sans Text 12/400/lh16/ls0.3/#FFF`,
**baseline gap 17 px**, bottom inset 12 px, left inset 12 px.
The count string is a literal item count: `"1,710 items"`, `"26 items"`.
831 such cards on one page at 1440, all identical.

**Rule the site follows: inset = 12 / 16 / 24 px scaling with card size; the text block
is bottom-anchored, never vertically centred.**

---

## 3. BOX CENSUS — cards have no box

Homepage @1440: **390** elements ≥24×16 px carry any border, radius, shadow or background.

| property | count | values |
|---|---|---|
| **border-width > 0** | **32** | `2px solid #FFF` ×8 (avatar rings), `1px solid #80868B` ×4, `3px solid` ×12 in the four Google brand colours (`#4285F4`/`#DB4437`/`#F4B400`/`#0F9D58` — the logo dots), `1px solid #000` ×2, misc ×6 |
| **border-radius** | **355** | **`8px` ×194**, `50%` ×94, `0 0 8px 8px` ×14, `16px` ×13, `4px` ×13, `4px 4px 0 0` ×10, `2px` ×8, `56px` ×5, `100px`/`48px` ×1 each |
| **box-shadow** | **24** | `rgba(60,64,67,.3) 0 1px 2px, rgba(60,64,67,.15) 0 1px 3px 1px` ×16 (Material elevation 1) · `rgba(60,64,67,.3) 0 1px 2px, rgba(60,64,67,.15) 0 2px 6px 2px` ×7 (elevation 2) · `rgba(0,0,0,.14) 0 0 4px, rgba(0,0,0,.28) 0 4px 8px` ×1 |
| **background-color** | **184** | `#DADCE0` ×77 (image placeholder), `#FFF` ×40, `#1A73E8` ×13, `rgba(0,0,0,.4)` ×13, `#202124` ×8 |

**Not one of the 32 borders and not one of the 24 shadows is on a content card.** The
borders are avatar rings, focus rings and logo geometry; the shadows are on chips, FABs
and the sign-in button.

Measured on the card container element itself, for **all 6 homepage card groups plus the
tubman and story rails**:

```
background-color : rgba(0, 0, 0, 0)     ← transparent
border-width     : 0
border-radius    : 0px
box-shadow       : none
padding          : 0 / 0 / 0 / 0
```

The **image element inside** carries `border-radius: 8px` (or `50%` on the Explore rail),
`box-shadow: none`, `border-width: 0`.

Per-viewport totals: @768 border 23 / radius 355 / shadow 29 / bg 186 (of 391);
@390 border 27 / radius 330 / shadow 21 / bg 177 (of 359).
Category index @1440: **border 0**, radius 7, shadow 1, bg 343 (of 348) — a 831-card page
with **zero borders and one shadow**.

### How a card is delimited, exactly

1. **An 8 px-radius image rectangle.** That silhouette *is* the card. Nothing wraps it.
2. **The gutter.** 16 px @1440/768, 8 px @390 (4 px on the category grid).
3. **A vertical text stamp** at a fixed 16 px from the image bottom (§2.1).
4. For overlay cards, **a bottom scrim gradient** — the only "chrome" on the whole site:

| gradient | count | element size | radius |
|---|---|---|---|
| `linear-gradient(to top, rgba(0,0,0,.4) 0px, rgba(0,0,0,0) 100%)` | 18 | full-card (e.g. 340 × 274.25, 220 × 390) | 0 |
| `linear-gradient(to top, rgba(0,0,0,.6) 0px, rgba(0,0,0,0) 100%)` | 4 | **× 116 px tall**, bottom-anchored | **`0 0 8px 8px`** |
| `linear-gradient(0deg, rgba(0,0,0,.4) 0px, rgba(0,0,0,0))` | **402** | **236 × 60 px**, bottom-anchored | 0 |
| `linear-gradient(0deg, rgba(0,0,0,.4) 14%, rgba(0,0,0,.25) 25%, rgba(0,0,0,.25) 65%, rgba(0,0,0,.4) 88%)` | 1 | 1200 × 640 (hero) | 0 |

The category grid's answer is the tidiest: **a 60 px-tall `rgba(0,0,0,0.4)`→transparent
scrim on a 236 px card (25 % of card height)**, holding 2 lines of white text.

---

## 4. GRID

| | @1440 | @768 | @390 |
|---|---|---|---|
| Content column | **1200 px** (×104 elements share the `120 → 1320` edge pair) | **720 px** (`24 → 744`, ×38) | **342 px** (`24 → 366`, ×141) |
| **Outer page margin** | **120 px** | **24 px** | **24 px** |
| Full-bleed band | `0 → 1440` ×60 | `0 → 768` ×155 | `0 → 390` ×167 |
| Heading measure | **760 px** centred (`340 → 1100`, ×41) | 712 px (`28 → 740`) | 342 px |
| Story prose measure | **600 px**, left-anchored at x = 40 (×65) | — | 342 px |
| Entity bio measure | **700 px** centred (`370 → 1070`) | — | 342 px |

### Card grids — columns and gutters

**The homepage has no wrapping card grid at all.** Every rail is a horizontal carousel:
`display: inline-block` children laid out past the viewport (measured left edges run to
x = 3347 at a 1440 viewport), paged by arrow buttons. Columns below = *cards that fit the
1200 px content column*, and every rail resolves to it exactly:

| rail | card w | gutter | cards visible | arithmetic |
|---|---|---|---|---|
| Pocket Gallery (3-line) | 389.33 | **16** | **3** | 3×389.33 + 2×16 = 1200 |
| Recommended / museums | 288 | **16** | **4** | 4×288 + 3×16 = 1200 |
| Square tiles | 227.19 | **16** | **5** | 5×227.19 + 4×16 = 1200 |
| Explore (circles) | 252 | **64** | **4** | 4×252 + 3×64 = 1200 |
| Coverflow hero | 316 | **−92 / −192** (overlapping) | 1 focused + 6 stacked | z-stacked |

@390 the same rails keep the card width but drop the gutter to **8 px** (circles: 48 px);
a 288 px card in a 342 px column shows **1.19 cards** per screen.

**The category index is the only true grid** (`<ul class="sGe3x">`, cards are square `<a>`):

| vw | columns | card | gutter (h and v) | outer margin | arithmetic |
|---|---|---|---|---|---|
| 1440 | **5** | 236 × 236 | **4** | 120 | 5×236 + 4×4 = 1196 ≈ 1200 |
| 768 | **3** | 253.33 | **4** | **0** (edge-to-edge) | 3×253.33 + 2×4 = 768 |
| 390 | **3** | 127.33 | **4** | **0** (edge-to-edge) | 3×127.33 + 2×4 = 390 |

Column counts verified over 831 cards @1440 (`colCounts: [5,5,5,5,5,5…]`, `hGaps: {"4": 664}`,
`vGaps: {"4": 166}`) and 524 cards @390. Screenshot `category-1440-s01.png`, `category-390-s02.png`.

---

## 5. SPACING

The homepage is **29 sibling `<section class="wWQRF">` elements** inside `div.o9lmk`.
All are full-bleed (`x = 0, w = 1440`). Margins are 0, so the measured gap *between*
section boxes is **0 px ×26** and **24 px ×2**. All vertical rhythm comes from each
section's own padding:

| viewport | section padding (top/bottom) × count | resulting gap between section content |
|---|---|---|
| **1440** | `36/36` ×22 · `36/0` ×4 · `0/0` ×2 · `0/36` ×1 | **72 px** (36 + 36) |
| **768** | `24/24` ×22 · `24/0` ×4 · `0/0` ×2 · `0/24` ×1 | **48 px** |
| **390** | `24/24` ×22 · `24/0` ×4 · `0/0` ×2 · `0/24` ×1 | **48 px** |

Two full-bleed story heroes add `margin-top: 24px` (the only non-zero section margin).

Other pages: story page section pads `0/0` ×13, `0/64` ×2, `60/40` ×1 (edge-to-edge
chapters). Entity page `0/0` ×3, `0/48` ×1, with section margins `48/0` ×2 → **48 px** and
**80 px** gaps. Category index: 2 sections, `0/64`, `0/0`.

**Distinct vertical spacing values on the whole homepage: 4 (24, 36, 48, 72) at 1440;
3 (24, 48) at 390.**

### Space above and below a section heading

| measurement | @1440 | @390 |
|---|---|---|
| section top → H2 top | **36 px** (13/13 sections) | **24 px** (4/4) |
| H2 line-box bottom → dek top | **8 px** (dek `margin-top: 8px`) | **8 px** |
| dek bottom → first card top | **40 px** | **24 px** |
| H2 bottom → first card (no dek) | **40 px** | **24 px** |
| H2 bottom → first card (with dek) | **72 px** (= 8 + 24 + 40) | **56 px** (= 8 + 24 + 24) |

One number governs it all: **40 px @1440 / 24 px @390 between the last header line and the
first card**, regardless of whether a dek exists.

---

## 6. SECTION HEADER PATTERN

19 section headers measured on the homepage @1440 (`extra-home-1440.json`).
**13 of 19 use one lockup.** No eyebrow. No count. No inline link.

```
┌──────────────────── section, full-bleed 1440, padding 36 top ───────────────┐
│                            ↕ 36                                             │
│              H2  36/400/lh44/ls normal  #202124  text-align:center          │
│              constrained to 760 px, x = 340 → 1100 (NOT the 1200 column)    │
│                            ↕ 8  (dek margin-top)                            │
│              H3  16/400/lh24/ls 0.1px  #5F6368  center  (optional dek)      │
│                            ↕ 40                                             │
│              ── card rail, 1200 px column, x = 120 ──                       │
│                            ↕ ~36                                            │
│              "See all …"  14/500/lh20/ls 0.25px  #1A73E8  CENTRED           │
│                            ↕ 36 (section padding-bottom)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

Observed instances of the standard lockup: "What do you want to explore?", "Meet the Blobs",
"Some new stories", "What do you know about…", "Recommended for you", "Take a cultural
journey", "Step inside a gallery", "Explore with Street View", "Back to the beginning",
"See Science Museums", "Explore by time", "Museum explorer", "National Parks around the
world", "Explore in high definition", "Keep exploring…".

**The link is placed after the rail, not beside the heading.** Measured offsets on 6
sections — heading y vs link y: "Explore with Street View" 6660.89 → "See more sites"
7178.89 = **518 px apart**; "See Science Museums" 8904.89 → "See all collections" 9217.69 =
**313 px**; "Explore by time" → "Travel through time" = **367 px**; "Museum explorer" →
"Explore 3,000+ collections" = **542 px**; "National Parks…" → "More collections" = **313 px**;
"Explore in high definition" → "More artworks" = **367 px**. All are horizontally centred
(x ≈ 606–647), 14 px, `#1A73E8`.

### The three exceptions

**A. "Today in history"** — the only eyebrow lockup. Left-aligned, x = 208, w = 448:

| line | token | gap to next |
|---|---|---|
| eyebrow "Today in history" | `Google Sans Text 12/400/lh16/ls0.3` `rgba(0,0,0,.8)` | `margin-bottom: 16px` |
| heading | `Google Sans 32/400/lh40` `#202124` | `margin-bottom: 24px` |
| dek | `Google Sans Text 12/400/lh16/ls0.3` `#80868B` | `margin-bottom: 8px` |
| link "Learn more" | `Google Sans 14/500/lh20/ls0.25` `#1A73E8` | — |

section top → eyebrow top = **80 px**.

**B. "Museum spotlight"** — `Google Sans **Display** 44/400/lh52`, `#3C4043`, left-aligned
at x = 144, w = 700, `margin: 16px top / 24px bottom`. section top → heading = **115 px**.

**C. Count-in-heading (entity page).** `/entity/harriet-tubman` uses
**`"2 stories"` as the section heading itself** — `Google Sans 22/400/lh28/ls normal`,
`#3C4043`, left-aligned at x = 120 across the 1200 column. Screenshot `tubman-1440-s00.png`.
Below the asset grid: `"38 items"` as `Google Sans 15/400/lh20` `rgba(0,0,0,.5)` — a
*fourth* heading size and the page's only 15 px value. The count is never a separate badge;
it is the heading string.

**Category index header:** H1 `Google Sans 32/400/lh40` `#3C4043`, centred at x = 573.2
(w = 293.58); a filter row of `Google Sans 14/500/lh20/ls0.25` chips ("All", "A-Z")
sits below it; the grid starts at y = 201.

---

## 7. MOTION

From the 5 stylesheets served (159,417 bytes total), **6 `@keyframes`** blocks.

Duration literals in raw CSS — **14 distinct**:
`.5s`×15, `.2s`×9, `0.15s`×9, `0.25s`×8, `.3s`×4, `.25s`×3, `1.5s`×2, `0s`×2, `.4s`×2,
`4s`×2, `600ms`×2, `0.5s`×2, `.15s`×1, `3s`×1.

Timing-function literals in raw CSS — **6 distinct**:
`ease-out`×11, `ease`×10, `ease-in-out`×8, `ease-in`×7, `linear`×4,
`cubic-bezier(0.165, 0.84, 0.44, 1)`×2.

Computed transitions actually applied to elements on the homepage, by frequency:

| transition | count |
|---|---|
| `opacity 0.3s ease-out` | **122** |
| `transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)` | **80** |
| `opacity, transform 0.3s cubic-bezier(0, 0, 0.25, 1)` | **68** |
| `transform 1s cubic-bezier(0.19, 1, 0.22, 1)` | 54 |
| `opacity 0.2s / visibility 0s / transform 0s ease` (delay 0.2s) | 33 |
| `background-color 0.2s, opacity 0.15s, box-shadow 0.15s ease-out` | 18 |
| `background 0.3s ease` | 17 |
| `opacity 0.2s cubic-bezier(0.19, 1, 0.22, 1)` | 16 |
| `transform 0.15s cubic-bezier(0.4, 0, 1, 1)` | 16 |
| `fill 0.15s cubic-bezier(0.4, 0, 1, 1)` | 9 |
| `background 1s cubic-bezier(0.19, 1, 0.22, 1)` | 8 |
| `transform, background-color 0.3s/0.35s cubic-bezier(0.24, 1, 0.32, 1)` | 2 |

Computed durations in use: **0.15, 0.2, 0.3, 0.35, 0.5, 1.0 s** (6 values).
Signature easing: **`cubic-bezier(0.19, 1, 0.22, 1)`** (expo-out) on every transform,
**`ease-out`** on every opacity fade, **`cubic-bezier(0, 0, 0.25, 1)`** on the card
opacity+transform pair.

Animations (spinners only): `1.333s cubic-bezier(0.4, 0, 0.2, 1) infinite` ×24,
`1.568s linear infinite` ×2, `5.332s cubic-bezier(0.4, 0, 0.2, 1) infinite` ×4.

### Hover — measured before/after computed-style delta

**Standard card (story page, 421.33 × 317.98). Screenshot `hover-story-1440-h5.png`.**
Exactly **4 property changes, all on the inner image wrapper `div.mRtnL`**:

| element | prop | before | after |
|---|---|---|---|
| `div.mRtnL` (image) | `transform` | `none` | `matrix(1.1, 0, 0, 1.1, 0, 0)` = **scale(1.1)** |
| `div.mRtnL` | width | 421.33 | 463.46 |
| `div.mRtnL` | height | 236.98 | 260.68 |
| `div.mRtnL` | top | 300.39 | 288.54 (scales from centre, −11.85) |

The card box itself, the text, the shadow, the radius and the colours are **unchanged**.
Card container `transition: all 0s ease` — the motion lives entirely on the child, and the
container's `overflow: hidden` crops the 10 % overscale. **That is the whole hover
vocabulary: a 1.1× image zoom inside a fixed frame.**

**Category index card (236 × 236, ×6 sampled):** declares
`transition: opacity, transform 0.3s cubic-bezier(0, 0, 0.25, 1)` but produced
**0 measured property changes on hover** on all 6. The 831-card index has no hover affordance.

**Coverflow hero (homepage):** not hover — a focus state. Card grows
404.41 × 391.06 → **469.5 × 454** (1.161×), inner media additionally `scale(1.1)`,
title box 363.07 → 421.5 wide. 18 changed properties. Screenshots `hover-home-1440-h0…h5.png`.

---

## 8. COLOR

Page background: `body` = **`rgb(255, 255, 255)`** on all four pages at all three viewports.
`html` = `rgba(0, 0, 0, 0)`.

Card background: **`rgba(0, 0, 0, 0)`** (transparent) on every homepage/story/entity card.
Category index card: **`rgb(241, 243, 244)`** `#F1F3F4` (placeholder tint, ×343).
Image placeholder on the homepage: **`rgb(218, 220, 224)`** `#DADCE0` (×77).

Section band colours (full-bleed, homepage): `#E9D2FD` lavender ×2, `#99B57E` green ×4,
`#000000` ×4, `#D84315` orange ×2, `#202124` ×8, `#FFFFFF` ×40.

### Text colour ramp — homepage @1440, 12 distinct

| colour | hex | count | role |
|---|---|---|---|
| `rgb(255, 255, 255)` | `#FFFFFF` | **127** | all on-image text |
| `rgb(128, 134, 139)` | `#80868B` | 35 | card byline, dek, muted eyebrow |
| `rgb(32, 33, 36)` | `#202124` | 28 | section H2 |
| `rgb(60, 64, 67)` | `#3C4043` | 20 | card title on white |
| `rgba(0, 0, 0, 0.9)` | ≈`#1A1A1A` | 17 | card title on white (**duplicate role**) |
| `rgba(0, 0, 0, 0.5)` | — | 17 | card meta (**duplicate role**) |
| `rgb(95, 99, 104)` | `#5F6368` | 10 | section dek |
| `rgb(26, 115, 232)` | `#1A73E8` | 9 | eyebrow + links |
| `rgba(0, 0, 0, 0.54)` | — | 2 | icons |
| `rgba(0, 0, 0, 0.8)` | — | 1 | "Today in history" eyebrow |
| `rgb(249, 179, 19)` | `#F9B313` | 1 | "Celebrating 15!" script |
| `rgb(46, 90, 137)` | `#2E5A89` | 1 | one-off chip |

Reduced to intent: **white, 4 greys (`#202124` → `#3C4043` → `#5F6368` → `#80868B`),
one blue (`#1A73E8`)**. That is a 6-value ramp. The extra 6 are duplicates and one-offs.

Per page: story@1440 = 6 text colours; tubman@1440 = 8; **category@1440 = 6**
(`#FFF`×385, `#202124`×6, `#3C4043`×2, `#80868B`×2, `#F9B313`×1, `rgba(0,0,0,.9)`×1).
category@390 = **4**.

---

## 9. WHAT IS BAD

1. **The homepage is 15,130 px at 1440 — 16.8 viewport-heights, 29 sections — with no
   in-page navigation, no anchor list and no progress indicator.** Nothing tells you the
   scroll has an end. @390 it is 14,261 px = 16.9 screens.

2. **The category index is 41,261 px at 1440 (45.8 screens) holding 831 identical
   236 × 236 cards in one undifferentiated 5-column grid with 4 px gutters.** No
   sub-headings, no alphabet rail, no sticky filter, no pagination. The only control
   ("All" / "A-Z") is at y ≈ 150 and scrolls away immediately.

3. **Two parallel grey ramps for the same jobs.** `#3C4043` (×20) *and* `rgba(0,0,0,.9)`
   (×17) both set card titles; `#80868B` (×35) *and* `rgba(0,0,0,.5)` (×17) both set card
   meta. Same component, different rails, different token.

4. **42 distinct type role-tokens for 12 sizes on one page.** The index page proves 9
   tokens is enough for the same card vocabulary.

5. **The eyebrow colour is not semantic.** The identical
   `11/500/lh16/ls0.8/UPPERCASE` token renders `#1A73E8` on Pocket-Gallery and Story cards
   and `#80868B` on Explore cards. Nothing in the content distinguishes them; a reader
   cannot learn the rule.

6. **"See all" links are orphaned 313–542 px below the heading they belong to** (measured
   on 6 sections; max = 518 px for "Explore with Street View" → "See more sites"), centred
   in the viewport rather than aligned to the 1200 px grid or to the heading.

7. **Four different heading sizes do the same job on the same site**: 36/400 centred (H2),
   32/400 left (Today-in-history + entity + index H1), 44/400 Google Sans Display left
   (Museum spotlight), 22/400 left ("2 stories"). Plus a fifth one-off at 15 px ("38 items").

8. **The entity page's asset grid does not render without JS.** `/entity/harriet-tubman`
   reports "38 items" and "Organize by" but `scrollHeight` never exceeds 2,309 px through a
   full scroll to the bottom — zero grid children exist in the DOM. No SSR fallback, no
   `<noscript>`. Same result at 390 (1,951 px).

9. **The 831-card index has no hover state.** Six sampled cards declare
   `transition: opacity, transform 0.3s` and change **zero** computed properties on hover.
   Combined with `border: 0` and `box-shadow: none`, a card is indistinguishable from a
   plain image until it is clicked.

10. **Overlay text contrast is unmanaged.** Category cards put white `14/500` + white
    `12/400` over a **60 px-tall `rgba(0,0,0,0.4)`** scrim (25 % of a 236 px card). On light
    images (visible in `category-1440-s01.png`: "Nelson Mandela / 383 items" over a bright
    green mural, "Kamala Harris / 45 items", "Charles de Gaulle / 2,490 items") the text
    fails legibility. The scrim is a fixed constant, not derived from image luminance.

11. **Horizontal rails hide most of their content.** 8-card rails show 3–5 cards inside the
    1200 px column; measured left edges run out to x = 3347 at a 1440 viewport. The
    remainder is reachable only by clicking an arrow — no scrollbar, no peek affordance
    beyond a partial card, no count.

12. **@390 the rails break.** A 288 px card in a 342 px content column shows **1.19 cards**;
    the second card is a 54 px sliver. The 8 px gutter at 390 (vs 16 at 1440) makes the
    sliver read as an edge artefact rather than an affordance.

13. **Line-height has no rule.** 14 size/line-height pairs on one page spanning ratios
    **1.00 → 1.54** (`24/24`, `16/24`, `13/20`). Nothing is derived; every pair is hand-set.

14. **Off-grid values** ship in production: font-size `18.67px` (the script logo, on 3 of 4
    pages), `16.38px` (story @390), `15px` (entity "38 items"), and section margins of
    `125.41px` / `125.39px` on the "Keep exploring" theme cards.

15. **Body prose changes typeface between page types.** Story pages set prose in
    `Google Sans 18/400/lh24` (600 px measure); the entity page sets its bio in
    **Roboto 14/400/lh20** (700 px measure) — a different family, 4 px smaller, in a wider
    column, on the same site.

---

## Screenshot index (`docs/v4/qa/inspo/googleac/`)

| Group | Files |
|---|---|
| Homepage scroll | `home-1440-s00…s06.png`, `home-768-s00…s06.png`, `home-390-s00…s06.png` |
| Entity (Tubman) | `tubman-1440-s00…s02.png`, `tubman-390-s00…s02.png` |
| Story (Lagos) | `story-1440-s00…s06.png`, `story-390-s00…s06.png` |
| Category index | `category-1440-s00…s06.png`, `category-390-s00…s06.png` |
| **Card close-ups (2×)** | `card-home-1440-g3-390x300.png` ← *the canonical 3-line card*, `card-home-1440-g0-252x378.png` (circular), `card-home-1440-g1-288x172.png`, `card-home-1440-g2-228x228.png`, `card-home-1440-g4-316x454.png`, `card-home-1440-g5-288x460.png`, `card-story-1440-g0-422x318.png`, `card-story-390-g0-w304.png`, `card-tubman-1440-g0-w228.png`, `card-tubman-390-g0-w194.png` |
| Hover states | `hover-story-1440-h5.png` (the 1.1× image zoom), `hover-home-1440-h0…h5.png` (coverflow focus) |
