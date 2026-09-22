# museos.arteyeducacion.org — hard-numbers design measurement audit

**Purpose:** measurement source for the CNWM v4 rebuild. Focus: MOTION and VISUAL DESIGN.
Everything below is measured, not estimated. Qualitative companion: `docs/qa/inspiration/museos.md`.

**Measured:** 2026-08-02, headless Chromium via Playwright, `deviceScaleFactor: 1`.
Every page fully wheel-scrolled to fire all reveals before the census was taken.

| Page | slug | docH @1440×900 | docH @390×844 |
|---|---|---|---|
| Home | `/` | 909 → **2799** after wheel handoff | **844** (no growth) |
| Detail 1 | `/resurgimiento-de-la-patria` | **18,395** | **14,891** |
| Detail 2 | `/recuerdo-de-la-isla-de-madera` | **16,724** | **13,440** |

**Screenshots:** `docs/v4/qa/inspo/museos/` (97 files). Scroll strips are `<page>-<vw>-s0` … `-s8` `.png`.

**Stack facts (verified in DOM):** `window.gsapVersions = ["3.15.0"]`, `window.lenisVersion = "1.1.9"`
(version markers only — `gsap`, `ScrollTrigger`, `Lenis` are all `undefined` on window; bundled at module
scope). `html` classes `is-hero-loaded is-top lenis is-loaded is-ready`. Cuberto `.mf-cursor` present.
**CSS total: 45,572 bytes across 2 files** (`_slug_.B_vAV9NT.css` 38,589 B + `_slug_.BtZQ4Ink.css` 6,983 B),
**578 top-level rules**. Fonts: **2 woff2 files** download (`untitled-sans-medium`, `untitled-serif-regular`).

**Root font-size is viewport-dependent — this drives everything:**
`html { font-size }` = **18px @1440** and **16px @390** (`--fz-base` matches). Every rem-derived number
below is 12.5% larger on desktop for the same Tailwind class.

---

## 1. TYPE CENSUS

### Distinct rendered font-sizes per page per viewport (visible text nodes only)

**Detail 1 @1440 — 11 distinct sizes, 110 visible text nodes** (Detail 2 @1440: **identical 11 sizes**)

| px | rem @18 | n | family | weight | line-height | lh/fs | letter-spacing | ls/fs | transform | sample |
|---|---|---|---|---|---|---|---|---|---|---|
| 15.75 | 0.875 | 3 | Sans | 500 | 22.5 | 1.429 | normal | — | none | `ES` |
| 18 | 1 | 15 | Sans | 500/400 | 27 | 1.500 | normal / 0.45 | 0.025em | none/upper | `Museos para el Siglo XXI` |
| 22.5 | 1.25 | 16 | Serif+Sans | 400/500 | 31.5 | 1.400 | normal | — | none | `3:59` · `[1]` |
| 27 | 1.5 | 21 | Sans+Serif | 500/400 | 36 | 1.333 | normal | — | none | `(Fecha de la obra)` / body prose |
| 33.75 | 1.875 | 1 | Serif | 400 | 40.5 | 1.200 | normal | — | none | hold instruction |
| 40.5 | 2.25 | 1 | Serif | 400 | 45 | 1.111 | normal | — | none | `Compartir` |
| 54 | 3 | 3 | Sans | 500 | 54 | **1.000** | **−2.7** | **−0.05em** | uppercase | `Adultos/as` |
| 136.8 | 9.5vw | 2 | Sans | 500 | 111.15 | **0.813** | **−10.26** | **−0.075em** | uppercase | `Resurgimiento` (h1) |
| 144 | 8 | 7 | Sans | 500 | 122.4 | **0.850** | **−7.2** | **−0.05em** | uppercase | `Contexto` |
| 180 | 10 | 1 | Sans | 400 | 180 | 1.000 | normal | — | none | preloader `100` |
| 306 | 17 | 40 | **Serif** | 400 | 306 | 1.000 | **−15.3** | **−0.05em** | none | odometer digits |

**Adjacent-step ratios @1440:** 1.143 · 1.250 · 1.200 · 1.250 · 1.200 · 1.333 · **2.533** · 1.053 · 1.250 · 1.700
**Smallest → largest ratio: 306 / 15.75 = 19.43×**

**Detail 1 @390 — 9 distinct sizes, 109 visible nodes** (Detail 2 @390: identical)
`14, 16, 20, 24, 30, 36, 42, 96, 109.2`
Ratios: 1.143 · 1.250 · 1.200 · 1.250 · 1.200 · 1.167 · **2.286** · 1.137
**Smallest → largest: 109.2 / 14 = 7.80×**

**Home @1440 — 6 sizes** `15.75, 16, 18, 27, 104.4, 180` (ratio **11.43×**); **@390 — 7 sizes**
`14, 14.22, 16, 17, 18, 39.4, 96` (ratio **6.86×**). Home headline `(MUSEOS PARA EL SIGLO XXI)` =
**104.4px = 7.25vw** @1440 with ls **−7.4px (−0.0709em)**; **39.4px = 10.1vw** @390 with ls −2.46px.

### The three named steps

| role | @1440 | @390 | collapse |
|---|---|---|---|
| **small label** (nav, spine number, credits) | **15.75px** Sans 500, lh 22.5 | **14px** | 1.125× |
| **mid / name** (prose, kicker, figure caption) | **27px** Serif 400, lh 36 (1.333) | **20px** Serif, lh 28 | 1.35× |
| **huge display** (section headings) | **144px** Sans 500, lh 122.4, ls −0.05em | **42px**, lh 36.75 | **3.43×** |
| **huge display** (artwork h1) | **136.8px** (9.5vw), ls −0.075em | **42px**, ls −3.15 (−0.075em) | 3.26× |
| **largest thing on the page** (odometer date) | **306px** Serif | **109.2px** | 2.80× |

**Display-to-body ratio: 144/27 = 5.33× @1440, but only 42/20 = 2.10× @390.** The typographic drama is
a desktop-only effect; mobile flattens it by 2.5×.

### Families

**Exactly 2 families, 3 (family × weight) pairs in live use.**

| combo | n on detail1@1440 | role |
|---|---|---|
| Untitled **Serif** 400 | **64** (58%) | all reading prose (27px/lh36), durations, narrator credits, **and the 306px odometer date** |
| Untitled **Sans** 500 | **35** (32%) | every label, every uppercase display heading, nav, spine numbers |
| Untitled **Sans** 400 | 11 (10%) | screen-reader-only text, footer credit, home headline |

A 4th face (`Untitled Serif 500`) is declared in `@font-face` but reports `status: unloaded` — never used.
**The entire hierarchy is done by 2 families and 1 weight step.** No italics, no small-caps, no third face.
The only serif that is *not* prose is the odometer date — serif at 306px is the deliberate "historical
voice" marker against grotesk everywhere else.

**Letter-spacing is strictly tiered and only ever applied at the extremes:**
`normal` below 54px · **−0.05em** at 54/144/306px · **−0.075em** on the artwork h1 · **+0.025em** on the
single 18px uppercase micro-label. Three values, no others.

**Line-height is a clean descending ramp with font size:** 1.500 → 1.429 → 1.400 → 1.333 → 1.200 → 1.111
→ **1.000** (54px) → **0.850** (144px) → **0.813** (136.8px). Nine values, monotonic.

---

## 2. THE NUMBERED EDITORIAL SPINE

Evidence: `spine-context-1440.png`, `spine-intro-1440.png`, `spine-author-1440.png`,
`spine-about-1440.png`, `spine-references-1440.png`, `spine-videos-1440.png` and the `-390` twins.

### Label specimen @1440

```
font-family : "Untitled Sans"
font-size   : 27px   (1.5rem, text-2xl)      ← the "(5)" glyph itself
font-weight : 500
line-height : 36px   (1.333)
letter-spacing: normal
text-transform: none
color       : rgb(255,255,255) #fff on #171615 (or #171615 on #fff in the light band)
```

The label is a **flex row with `gap: 13.5px`** (0.75rem) between the number `(5)` and its word
(`Introducción`). The number alone measures **39.78–41.83px wide**; the whole label block is
**36px tall**.

At 390 the same label renders at **14px / lh 20 / weight 500** with **`gap: 12px`** (0.75rem @16px root).

### Geometry @1440

| measurement | value |
|---|---|
| page gutter (`px-4`) | **18px** left and right |
| content column width | **1404px** (1440 − 36) |
| grid | `grid-template-columns: **702px 702px**`, `gap: normal` (0) |
| label column x / width | **x = 18**, w = **702** |
| prose column x / width | **x = 720**, w = **702** |
| **x-offset label → prose** | **dx = 702px** (exactly 50% of the content column) |
| prose type | Untitled Serif 400, **27px / lh 36** |
| prose measure | 702px ÷ 27px ≈ **26 ems**, ~62–70 chars |

The label column is **50% wide but only 36px tall** — 666px of the 702px label column is deliberately
empty. That void *is* the design.

### Figure numbering inside the tour

`[1]`–`[6]` render at **22.5px Sans 500 / lh 31.5**, x = 18, with a **45px** flex gap to the figure name,
on the inverted white ground. Reference footnotes use `[1]`/`[2]` at **18px Sans 500** with a **108px**
flex gap and sit in the **right** column (x = 720, w = 702) — the only spine element that switches sides.

### The label is GSAP-pinned (desktop only) — this is the mechanism

**6 `.pin-spacer` elements at 1440, exactly 1 at 390.** Five of them pin a numbered label so it stays
level with the top of its prose while the prose scrolls past. `padding-bottom` on the spacer = the pin
travel distance:

| section | spacer top | spacer h | pin travel (padding-bottom) | pinned child |
|---|---|---|---|---|
| `#intro` | 2227 | 288 | **252px** | `div.flex.gap-3.font-medium.text-sm` (h 36) |
| `#context` | 12142 | 596 | **560px** | `div.self-start.mb-20.lg:mb-0` (h 36) |
| `#author` | 14880 | 252 | **216px** | `div.self-start.mb-16.md:mb-0` (h 36) |
| `#about` | 15791 | 621 | **585px** | `div.self-start.mb-20.md:mb-0` (h 36) |
| `#references` | 16520 | 470 | **434px** | `div.self-start.mb-20.md:mb-0` (h 36) |
| *(the tour)* | 4427 | 7200 | **6300px** | `section.h-screen` (h 900) |

### How it collapses at 390

| | @1440 | @390 |
|---|---|---|
| gutter | 18px | **16px** |
| content width | 1404px | **358px** |
| grid columns | `702px 702px` | **`358px`** (single) |
| label → prose dx | **702px** | **0px** (stacked, same x = 16) |
| label size | 27px / lh 36 | **14px / lh 20** |
| prose size | 27px / lh 36 | 20px / lh 28 |
| label pins | **5 pin-spacers** | **0** |

**The spine's whole point is deleted on mobile.** The index rail becomes a 14px orphan line sitting on
top of 20px prose — a 1.43× size step, and nothing holds it in view. Compare `spine-context-1440.png`
(giant `(5)` holding the left half of the screen) against `spine-context-390.png`.

---

## 3. SPACING

### Inter-section gaps, detail 1 (measured `next.top − (prev.top + prev.height)`)

Section IDs are identical on both artwork pages: `#hero #date #intro #audio #tutorial .pin-spacer
#context #videos #author #about #references #outro footer`.

| boundary | gap @1440 | rem@18 | Tailwind | gap @390 | rem@16 |
|---|---|---|---|---|---|
| hero → date | 0 | — | — | 0 | — |
| **date → intro** | **270** | 15 | `md:mb-60` | **144** | 9 (`mb-36`) |
| **intro → audio** | **432** | 24 | `md:mb-96` | **112** | 7 (`mb-28`) |
| audio → tutorial | 0 (`md:pb-32` = 144 internal) | — | — | 0 | — |
| tutorial → tour | 0 | — | — | 0 | — |
| tour → context | 0 (`md:py-40` = 180 internal) | — | — | 0 | — |
| context → videos | 0 | — | — | 0 | — |
| **videos → author** | **360** | 20 | `md:mb-80` | **144** | 9 |
| **author → about** | **324** | 18 | `md:mb-72` | **112** | 7 |
| **about → references** | **108** | 6 | `md:mb-24` | **124** | `mb-[124px]` |
| **references → outro** | **324** | 18 | `md:mb-72` | **160** | 10 (`mb-40`) |
| outro → footer | 0 (`pb-36` = 162 internal) | — | — | 0 | — |

**Distinct non-zero gap values @1440: 5 → `{108, 270, 324×2, 360, 432}`**
**Distinct non-zero gap values @390: 4 → `{112×2, 124, 144×2, 160}`**

**The set is small and quantized.** All desktop gaps are exact rem multiples at the 18px root
(6 / 15 / 18 / 20 / 24 rem). All mobile gaps are exact rem multiples at 16px **except one**:
`mb-[124px]` — the single arbitrary value on the page.

### All authored vertical spacing ≥24px (computed margin/padding/row-gap tally, detail1@1440)

Excluding the 6 GSAP-generated pin paddings (6300, 585, 560, 434, 252, 216), the **designed** set is
**15 values**:

`27(×2) · 36(×5) · 45(×16) · 54(×2) · 72 · 90 · 108(×4) · 144 · 162 · 180(×2) · 216 · 270 · 324(×2) · 360 · 432`

Every one is an exact rem or half-rem at 18px (1.5, 2, 2.5, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24 rem).
**Zero arbitrary values on desktop.** The workhorse is **45px** (2.5rem, `py-5`) with 16 uses; the
section rhythm is carried by 4 large values only (270 / 324 / 360 / 432).

### Largest deliberate voids

| rank | px | what |
|---|---|---|
| 1 | **7,200 @1440 / 6,752 @390** | `.pin-spacer` for the tour — **exactly 8.00 viewports** of scroll (6 slides + reveal). Detail 2 = 6,300 / 5,908 = **exactly 7.00 viewports** (5 slides). Formula: **(slides + 2) × 100vh**. |
| 2 | **900 @1440 / 844 @390** | `#tutorial` — one full viewport holding a single 33.75px/24px sentence (`tutorial-void-1440.png`, `tutorial-void-390.png`) |
| 3 | **432** | `#intro` bottom margin (`md:mb-96`) — the largest *margin* |
| 4 | **666** | vertical emptiness inside the 702px label column below each 36px spine label |

---

## 4. BOX CENSUS

Count of elements with a visible border **or** a background that differs from the page ground:

| page / viewport | total boxes | bordered | with bg | **distinct radii** | **distinct border-widths** |
|---|---|---|---|---|---|
| detail1 @1440 | **14** | 9 | 8 | `{9999px: 3}` | **`{1px: 18 sides}`** |
| detail1 @390 | **15** | 9 | 9 | `{9999px: 4}` | `{1px: 18}` |
| detail2 @1440 | **12** | 7 | 8 | `{9999px: 3}` | `{1px: 16}` |
| detail2 @390 | **13** | 7 | 9 | `{9999px: 4}` | `{1px: 16}` |
| home @1440 | **4** | **0** | 4 | `{}` | `{}` |
| home @390 | 4 | 0 | 4 | `{}` | `{}` |

**There is exactly one border-width on the entire site: 1px. There is exactly one border-radius:
9999px.** No rounded rectangles exist. No card exists. No element in any census carries a radius
between 1px and 9998px. The homepage has **zero** bordered elements.

### What IS bordered (the complete list, detail1@1440)

| element | size | border | radius | bg |
|---|---|---|---|---|
| `ul.border-t` (audio list) | 1440 × 436 | `1px solid #fff` **top only** | 0 | transparent |
| `li.border-b` × 3 (audio rows) | 1440 × 145 | `1px solid #fff` **bottom only** | 0 | transparent |
| `span.btn-start-audio` × 3 | **51 × 51** | `1px solid #fff` all sides | **9999px** | `#171615` |
| `span#play-audio` × 3 (glyph) | **15 × 15** | none | 0 | `#fff` |
| `a.reference-item` × 2 | **702 × 235** | `1px solid #fff` **top only** | 0 | transparent |
| mobile `+` button (390 only) | **40 × 40** | none | **9999px** | `#171615` |

**Content blocks are delimited by nothing at all** except (a) the ground flip and (b) whitespace.
Hairlines are used only twice: on the audio-narration list and on the reference list.

### Hairline measurements

**Thickness: 1px. Color: `rgb(255,255,255)` #fff on the dark ground.** Six hairlines on detail1@1440.

| hairline | width | x | full-bleed? | inset from viewport |
|---|---|---|---|---|
| `ul.border-t` (audio, top rule) | **1440** | 0 | **yes** | **0** |
| `li.border-b` × 3 (audio rows) | **1440** | 0 | **yes** | **0** |
| `a.reference-item` × 2 (top rule) | **702** | 720 | no | **738 total** (720 L / 18 R) |

**The inset difference is the point:** the audio hairlines run **full-bleed at 1440px, x=0**, while the
text inside those same rows sits inside the **18px page gutter** — a **18px inset difference on each
side, 36px total**. The rule out-runs its content, which is what makes the rows read as museum-catalog
ledger lines rather than list items. See `audio-detail1-1440.png` and `refs-hairlines-1440.png`.

At 390: audio rules are full-bleed **390px at x=0** against a **16px** content gutter (**16px inset
difference per side**); reference rules shrink to **358px at x=16** — i.e. on mobile the reference
hairline stops out-running its content and matches the column exactly.

---

## 5. GROUND SHIFTS

Sampled with `document.elementsFromPoint(6, y)` walking the painted background every ~60px of document
height. **Exactly two ground colors exist across the entire site.**

```
--background : #171615   (rgb 23,22,21)
--foreground : #fff
```

Sections flip by swapping them: `class="bg-[--foreground] text-[--background]"`.

### Detail 1 @1440 (docH 18,395) — 2 flips

| scroll range | % of page | background | text |
|---|---|---|---|
| 0 → 4,427 | 0–24.1% | **`#171615`** (full-bleed painting image 501–1652) | `#ffffff` |
| **4,427** ← FLIP dark→light | | | |
| 4,427 → 11,301 | 24.1–61.4% | **`#ffffff`** (`section#scan`, the pinned tour) | `#171615` |
| **~11,301–11,627** ← FLIP light→dark | | | |
| 11,627 → 18,395 | 63.2–100% | **`#171615`** | `#ffffff` |

The light band is **7,200px = 39.1% of the page** — exactly the `.pin-spacer` height. **The palette
inversion and the pinned tour are the same object.**

### Detail 1 @390 (docH 14,891) — 2 flips

| scroll range | % | background |
|---|---|---|
| 0 → 3,070 | 0–20.6% | `#171615` |
| **3,070** ← FLIP | | |
| 3,070 → 9,822 | 20.6–66.0% | `#ffffff` (**6,752px = 45.3%**) |
| **9,822** ← FLIP | | |
| 9,822 → 14,891 | 66.0–100% | `#171615` |

### Homepage — no flip

`body` is `bg-white text-black`; **1 ground, 0 flips**. Only the `#preloader` overlay is dark
(`#171615` with `#fafafa` text) and it lives off-screen at `translateY(−900px)`.

### What survives both grounds

**The full palette is 9 hex values in 45.5 KB of CSS:**
`#171615` (2 uses) · `#fff` (6) · `#fafafa` (5, every SVG stroke) · `#cdcccc` (2) · `#000` (1) ·
`#0000` (6) · `#171615cc` (80% scrim) · `#17161580` (50% scrim) · **`#BC9859` (1)**.

Constant across both grounds: the **two type families**, the **1px hairline**, the **18px/16px gutter**,
and the strict `--background`/`--foreground` swap of the same two hexes.

**Correction to the prior qualitative study:** the gold **`#BC9859` does NOT survive both modes.** It
appears in exactly **one CSS rule** (`.bg-\[\#BC9859\]`) on exactly **one element** — the tour progress
bar `absolute z-50 top-0 left-0 right-0 w-full h-1 origin-left scale-x-0` — which only ever exists
inside the light-ground `#scan` section. Measured: **4.5px tall @1440 / 4px @390**, `transform-origin:
0px 2.25px`, `transition-duration: 0s` (driven directly by scroll, not CSS). At tour slide 2 of 6 it read
`matrix(0.1715, 0, 0, 1, 0, 0)` = **scaleX 0.1715**, i.e. 67px of 390. **The accent is a 4px line that
appears for 39% of one page and nowhere else.**

Evidence: `flip-dark-to-light-1440.png`, `flip-light-to-dark-1440.png`, and the `-390` twins.

---

## 6. MOTION — the priority

### Libraries

| lib | detected how | verdict |
|---|---|---|
| **GSAP 3.15.0** | `window.gsapVersions = ["3.15.0"]` | present, module-scoped; **14 elements** carry the inline signature `translate:none; rotate:none; scale:none` on detail1, **20** on home |
| **Lenis 1.1.9** | `window.lenisVersion`, `html.lenis` class | present (smooth scroll) |
| **ScrollTrigger** | 6 `.pin-spacer` elements @1440, 1 @390 | present (that DOM is ScrollTrigger's pin output) |
| **mouse-follower** (Cuberto) | `.mf-cursor` element, class `mf-cursor -hidden` | present |
| `window.gsap` / `ScrollTrigger` / `Lenis` | `undefined` | not globals |
| `will-change` | `{transform: 11}` | 11 elements, transform only |

### The distinct DURATION set — **it is 17, not 2**

From regex over every `transition*`/`animation*` declaration in both stylesheets:

| duration | count | | duration | count |
|---|---|---|---|---|
| **0.2s** | **11** | | 0.8s | 1 |
| **0.4s** | **9** | | 1s | 1 |
| **0.3s** | **7** | | 1.2s | 1 |
| **0.5s** | **7** | | 1.4s | 1 |
| **0.15s** | **6** | | 1.5s | 1 |
| 0.25s | 3 | | **1.6s** | 2 |
| 0.35s | 2 | | 2s | 1 |
| 3s | 2 | | 0.1s | 1 |
| 0.18s | 1 | | 0.6s (delay) | 1 |

**17 distinct non-zero authored durations.** Narrowing to what actually computes on live elements at
1440 gives **11 distinct**: `0.15s(9) · 0.2s(13) · 0.3s(15) · 0.35s(3) · 0.4s(2) · 0.5s(8) · 1.2s(1) ·
1.4s(2) · 1.6s(11) · 2s(5) · 3s(2)`. Identical set at 390 (1.6s drops from 11→10 uses).

**The homepage is far tighter: 5 distinct durations** — `0.5s(12) · 0.2s(2) · 0.3s(2) · 0.4s(2) · 0.35s(1)`.

**Reading:** this is not a disciplined 3-token system. It is a **two-tier** system with sprawl inside
each tier — a UI tier clustered at **0.15–0.5s** (52 of 62 computed uses) and a cinematic tier at
**1.2–3s** (10 uses, all reveals). The cinematic tier is effectively **1.6s + 2s**.

### The distinct TIMING-FUNCTION set — **12**

| function | count | note |
|---|---|---|
| `ease-in-out` | 12 | |
| `ease-out` | 6 | |
| `cubic-bezier(.4,0,.2,1)` | 6 | Tailwind default |
| `linear` | 5 | |
| `cubic-bezier(.25,0,0,1)` | 5 | |
| `ease` | 3 | |
| **`var(--ease-out-expo)` = `cubic-bezier(.19,1,.22,1)`** | **2** | **the signature reveal curve** |
| `cubic-bezier(.215,.61,.355,1)` (`--ease-out-cubic`) | 1 | |
| `cubic-bezier(.76,0,.24,1)` | 1 | image reveal |
| `cubic-bezier(.51,.01,.24,1.01)` | 1 | |
| `cubic-bezier(0,0,.2,1)` | 1 | Tailwind `ease-out` |
| `ease-in` | 1 | |

The stylesheet **declares an 18-curve easing library** as CSS variables (`--ease-in/out/in-out` ×
quad/cubic/quart/quint/expo/circ) and **references exactly one of them** (`--ease-out-expo`). 17 declared
curves are dead code.

### `@keyframes` — there are only 2 in the whole site

```css
@keyframes moveMask { 0%,100% { y:0; height:126px } 50% { y:63px; height:63px } }
@keyframes move     { 50% { transform: translateY(-63px) } }
```
Both run **3s infinite ease-in-out** on the scroll-hint arrow (`svg.arrow`, viewBox `0 0 30 127`) and its
`<rect>` mask. Confirmed live via `document.getAnimations()`: 2 running animations, `duration: 3000`,
`iterations: null` (infinite), keyframe easing `ease-in-out`. **63px = exactly half of the 126px line.**

### THREE ANIMATED ELEMENTS, MEASURED

**(a) Display headline — mask-reveal (the signature move)**

```
selector    : #context span, #author span, #about span   (one <span> per line)
computed    : transition: transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)   [= --ease-out-expo]
rest state  : transform: matrix(1,0,0,1,0, 122.391)   →  translateY(122.391px)
end state   : translateY(0)
delay ladder: 0s (line 1) · 0.2s (line 2) · 0.4s (line 3)   — counts 6 / 4 / 1
```
**Property animated: `transform: translateY` only. Opacity does not change (1 → 1).** It is a pure
mask-slide: the line is clipped by `overflow:hidden` and slides up from below.

**Travel distance = exactly one line-height.** @1440: **122.391px** = 0.85 × 144px. @390: **36.75px** =
0.875 × 42px. Measured live at 60fps sampling:

| | @1440 | @390 |
|---|---|---|
| line 1 start / duration | 24.7 ms / **1598 ms** | 26.0 ms / **1601 ms** |
| line 2 start / duration | 224.6 ms / **1600 ms** | 217.7 ms / **1608 ms** |
| **stagger** | **199.9 ms** | **191.7 ms** |

**(b) Odometer date strips — `#date`**

4 × `div.strip`, each a `0123456789` column in **306px Serif** (cell height 306px), translated to show
one digit of `1898`. Sampled live @1440:

| strip | start | duration | translateY range |
|---|---|---|---|
| 1 | 13.7 ms | **2358 ms** | −1836.0 → −26.3 |
| 2 | 254.9 ms | **2333 ms** | −2065.5 → 0 |
| 3 | 504.9 ms | **2090 ms** | −1834.7 → 0 |
| 4 | 755.4 ms | **1824 ms** | −229.5 → −0.5 |

**Stagger = 241 / 250 / 250.5 ms ≈ 250 ms per digit column.** Max travel **2,065.5px = 6.75 digit cells**.
Durations shorten as the stagger grows so all four land together. CSS carries the generic staggers
`transition-delay: calc(.2s * var(--i))` and `calc(.6s * var(--i))`.
Evidence: `date-odometer-1440.png`, `date-odometer-390.png`.

**(c) Hold-to-reveal — `clip-path: circle()`, rAF-driven, asymmetric**

`transition-duration: 0s` on the mask — this is a per-frame lerp in JS, not a CSS transition.

```
rest  : clip-path: circle(14% at 57.5% 27%)        ← the detail crop, off-centre
held  : clip-path: circle(79.7% at 50.0% 49.9%)    ← whole canvas, dead centre
```
Measured every 80 ms (`hold-before-1440.png` → `hold-during-1440.png` → `hold-after-1440.png`):

| t (ms) | 0 | 240 | 480 | 800 | 1200 | 1680 |
|---|---|---|---|---|---|---|
| radius | 23.95% | 46.30% | 59.27% | 69.60% | 75.51% | 78.34% |
| centre | 56.4,30.5 | 53.8,38.3 | 52.4,42.8 | 51.2,46.4 | 50.5,48.4 | 50.2,49.4 |

Exponential approach, **time-constant τ ≈ 475 ms** (**per-frame lerp α ≈ 0.035 at 60 fps**);
**90% of travel by ~800 ms**, settles ~1.7 s.

**Release is 5× faster: 76% → 14% in ~320 ms**, with −39.1% in a single 80 ms window, then flat.
Identical behaviour at 390 (rest radius 18% at 20%,68%; hold 79.7% at 49.9%,50.1%).

### The complete reveal vocabulary

| technique | property | amount | duration | easing |
|---|---|---|---|---|
| headline mask-slide | `translateY` | **1 line-height** (122.39px / 36.75px) | **1.6s** | `cubic-bezier(.19,1,.22,1)` |
| headline stagger | `transition-delay` | — | **200ms** per line, max 3 | — |
| odometer roll | `translateY` | up to **2,065px** (6.75 × 306px cells) | 1.82–2.36s | — |
| odometer stagger | — | — | **250ms** per digit | — |
| image settle | `scale` | **2.1 → 1** (hero) · **1.3 → 1** (portrait) | 2s (`opacity, filter, transform`) | `cubic-bezier(.76,0,.24,1)` |
| tour slide crossfade | `opacity` 0→1 | — | **575 / 576 ms** | — |
| tour caption | `translateY` + opacity | **30px** | **592 / 598 ms** | — |
| crop circle grow | `clip-path: circle()` | 0% → **14%** | **991 / 992 ms** | — |
| hold reveal | `clip-path: circle()` | 14% → **79.7%** | rAF, τ≈475ms | exponential lerp |
| hold release | `clip-path: circle()` | 79.7% → 14% | **~320 ms** | exponential lerp |
| header hide on scroll | `opacity` 1→0 | (+63px / 52px translate) | **392 ms** | — |
| link arrow swap | `translateX` | **±24px** (two arrows) | **300 ms** | `cubic-bezier(0,0,.2,1)` |
| audio row invert | `background-color` → `#fff` | — | **300 ms** | `cubic-bezier(.4,0,.2,1)` |
| audio button hover | size 50 → **51px** | **+1px (1.02×)** | 0s | — |
| scroll hint | `translateY` + SVG `y`/`height` | **63px** of 126px | **3s infinite** | `ease-in-out` |
| home chrome enter | `translateY` | **±81px** | **1000 ms** | — |
| home intro handoff | `translateY` | **−806.7px** (≈ 0.9 viewport) | ~2.6 s | — |

**Properties animated, complete list: `transform` (translateY / translateX / scale / scaleX), `opacity`,
`clip-path: circle()`, `filter`, `background-color`, and SVG `y`/`height`.** No text blur-in, no
letter-spacing animation, no colour-shift reveals, no 3D. **Only 2 `@keyframes` blocks exist.** Everything
else is a CSS transition or a GSAP tween.

**Stagger, definitive: 200 ms (headline lines) and 250 ms (odometer digits).** No other stagger detected.

---

## 7. ICONOGRAPHY

Detail1@1440 carries **14 `<svg>` elements** (8 visible); @390 also 14 (11 visible).

### Play button (video section) — `videos-play-1440.png`, `icon-play-zoom-1440.png`, `icon-play-zoom-390.png`

```
viewBox        : "0 0 108 108"
rendered       : 108 × 108 px @1440   (md:w-24 md:h-24)
                  48 ×  48 px @390    (w-12 h-12)  → viewBox scale 0.4444
ring           : <circle cx="54" cy="54" r="53.25">
                 fill: none · stroke: rgb(250,250,250) #fafafa · stroke-width: 1.5 · linecap: butt
glyph          : <path d="M48.1431 67.5V40.5L65.5002 54L48.1431 67.5Z">  (FILLED, not stroked)
                 fill: rgb(250,250,250) · bbox 17.36 × 27 user units
```

| metric | @1440 | @390 |
|---|---|---|
| **circle diameter** | **106.5 px** | **47.33 px** |
| **rendered stroke-width** | **1.5 px** | **0.667 px** ← sub-pixel |
| **glyph size** | **17.36 × 27 px** | **7.72 × 12 px** |
| **glyph height ÷ circle diameter** | **25.4%** | **25.4%** |
| glyph is **fill**, ring is **stroke** | yes | yes |
| hit area (parent `<button>`) | **693 × 389.81** | **370.56 × 208.44** |

The ring is drawn at `r=53.25` inside a 108 box, so it clears the edge by **1.5 user units** — exactly one
stroke-width of optical padding.

### Arrow (reference / link rows) — `refs-hairlines-1440.png`, `refhover-detail1-1440.png`

```
viewBox      : "0 0 20 16"        rendered: 20 × 16 px  (both viewports)
class        : arrow-icon arrow-1|arrow-2 transition-transform duration-300 ease-out
single <path>: fill: none · stroke: rgb(250,250,250) · stroke-width: 1px · linecap: butt · linejoin: miter
hover        : arrow-1  translateX 0 → +24px  ·  arrow-2  translateX −24px → 0
transition   : transform 0.3s cubic-bezier(0, 0, 0.2, 1)
```
**Travel (24px) is 1.2× the icon width (20px)** — the outgoing arrow fully clears its own box.
At 390 hover produces no change (no `:hover`); the second arrow simply never arrives.

### Scroll-hint arrow (the animated one)

```
svg.arrow  viewBox "0 0 30 127"   rendered 30 × 127 px   (path stroke-width 1px, butt)
companion  viewBox "0 0 1 126"    rendered  1 × 126 px   (a <line>, stroke #fafafa 1px)
motion     @keyframes move: translateY(−63px) · @keyframes moveMask: y 0→63px, height 126→63px
           both 3s infinite ease-in-out
```

### Mobile "+" reveal button (390 only)

```
viewBox "0 0 12 12"   rendered 12 × 12 px   path d="M6 0v12m6-6H0"
stroke-width: 1.5 (attr) · fill: rgb(255,255,255)
host <button>: 40 × 40 px · border-radius 9999px · bg #171615 · no aria-label
glyph ÷ button = 30.0%
```
At 1440 this button computes to **0 × 0** (hidden) — visible in `hold-during-1440.png` as the cursor dot.

### Audio play/pause control — **not an SVG**

```
<span class="btn-start-audio">   51 × 51 px (50 × 50 at rest, 51 on hover)
                                 border: 1px solid #fff · border-radius: 9999px · bg #171615
<span id="play-audio">           15 × 15 px · background #fff · transform: translateX(2px)
                                 clip-path: polygon(14% 5%, 14% 95%, 50% 73%, 50% 27%,
                                                    50% 27%, 50% 73%, 86% 50%, 86% 50%)
```
An **8-point polygon with duplicated vertices** so play ↔ pause can tween without re-pathing.
**Glyph ÷ circle = 15 / 51 = 29.4%.** The 2px translateX is optical centring for the triangle.
Same 51px circle at both viewports. Evidence: `audio-detail1-1440.png`, `audio-playing-detail1-1440.png`.

### Social icons

`viewBox "0 0 16 16"`, `width="1em"` → rendered **22.5 × 22.5 px @1440**, **20 × 20 px @390**.
`fill: rgb(255,255,255)`, no stroke.

### Icon system summary

- **stroke-widths in use: exactly 2 — `1` and `1.5`**
- **stroke-linecap: `butt` on every icon** (never authored; always the CSS initial value)
- **stroke-linejoin: `miter` everywhere**
- **every stroked icon uses `#fafafa`; every filled icon uses `#fff` or `#171615`**
- circle-to-glyph ratios cluster at **25.4%** (play in ring) and **29.4%** (audio play in ring)
- **no icon font, no sprite sheet** — every SVG is inline

---

## 8. WHAT IS BAD / hostile to a11y or mobile

Ordered by severity. Numbers from detail1 unless noted.

1. **Zero focus indicator, site-wide.** All **12 of 12** interactive elements tested report
   `outline-style: none` and `box-shadow: none` when focused, at both viewports. There are **41
   tabbable elements** per detail page. Keyboard navigation is completely invisible.

2. **Zero `prefers-reduced-motion` support.** `@media (prefers-reduced-motion...)` appears **0 times**
   in 45,572 bytes of CSS (17 media queries exist; none is reduced-motion). Both 3s infinite keyframe
   loops, the 1.6s expo headline slides, the `scale(2.1)` hero settle and the 2.3s odometer roll all run
   unconditionally. This alone violates the CNWM constitution's animation baseline.

3. **No keyboard or button path to the primary interaction.** The full-painting reveal is
   press-and-hold only at 1440 (no button, no key binding). At 390 it degrades to a **40 × 40** `+`
   button with **no `aria-label` and no text** — below the 44px target and unnamed. Combined with (1),
   a keyboard user cannot reach it, see it, or trigger it.

4. **Images are unlabelled.** **20 of 30** `<img>` on detail1 have missing or empty `alt` (both
   viewports). On the **homepage it is 15 of 15** — every cursor-trail thumbnail is an unlabelled image.
   For an art collection, the artwork itself is the content being hidden from assistive tech.

5. **Unnamed and undersized controls.** @1440: **9** visible interactive elements are under 44px in at
   least one dimension and **6** have no accessible name at all. @390: **11** undersized, **7** unnamed.
   Worst offenders: a **64 × 10 px** button @1440 (**36 × 6 px** @390 — the slider paginator), and
   20 × 20 px social links.

6. **Two stacked full-viewport fixed layers stay in the DOM and stay hit-testable.**
   `div#preloader` — `z-index: 9998`, `pointer-events: auto`, `opacity: 1`, `visibility: visible`,
   parked at `translateY(−900px)`. Plus `section.z-[9999]` — `pointer-events: auto`, opacity 0.
   **On the homepage there are 5 such layers, 3 with `pointer-events: auto`**, including
   `div.fixed.h-dvh.grid.place-content-center` (z 10) sitting over `section.slider-section` (z 1).
   This is the measured cause of the pointer-trapping noted qualitatively.

7. **Heading structure is broken.** Two `<h1>` per detail page ("Museos para el Siglo XXI" at 18px in
   the header, and the artwork title at 136.8px). One `<h2>` has the text content
   `0123456789    0123456789    0123456789    0123456789` at **306px** — the odometer digit columns are
   exposed to screen readers as a nonsense heading.

8. **Mobile scroll tax: 8 viewports for 6 slides.** `.pin-spacer` = **6,752px = 8.00 × 844px** at 390
   (detail2: 5,908 = 7.00 viewports). `#tutorial` burns a **further full 844px viewport** on a single
   24px sentence (`tutorial-void-390.png`). That is **9 consecutive viewports** with at most one short
   paragraph on screen at a time.

9. **The editorial spine is deleted on mobile.** 6 `.pin-spacer` → **1**; grid `702px 702px` → `358px`;
   label→prose offset **702px → 0px**; label size **27px → 14px**. The numbered index rail — the single
   strongest idea on the site — survives only as a small orphan line.

10. **Display type collapses 3.43× on mobile while body collapses 1.35×.** 144 → 42px vs 27 → 20px.
    Display-to-body drops from **5.33× to 2.10×**. Everything that makes the desktop page feel
    monumental is absent at 390.

11. **Dead CSS classes create false expectations.** `user-select-none` is applied to the tour section
    but **0 elements** compute `user-select: none` at either viewport — the class is undefined in the
    stylesheet. A real long-press on a phone will still raise the OS selection/callout menu **during**
    the hold-to-reveal gesture. (This corrects the prior study, which recorded `user-select-none` as
    working.) Similarly, **17 of the 18 declared easing CSS variables are never referenced.**

12. **Everything depends on JS.** `<audio>` elements ship with **no `src` and no `controls`** (src is
    assigned on click — measured: `…prismic.io/…adultos-voz-educadora.mp3`). The video `<iframe>` has
    `src=""` and `title="Video"`. Good for performance; with JS off or failed, the narration and video
    simply do not exist and there is no fallback link.

13. **Hover-only affordances.** The dual-arrow ±24px swap on reference rows and the 50→51px audio button
    growth produce **no change at 390** (verified: before == after). Mobile users get a hairline row with
    a static arrow and no indication it is interactive.

---

## Appendix — what to steal, with the numbers attached

| take | exact value |
|---|---|
| type families | **2** (grotesk 500 for labels/display, serif 400 for prose) — 1 weight step total |
| root font-size | **18px @≥768, 16px below** (gives the whole scale a free 1.125× desktop boost) |
| type scale steps | 0.875 / 1 / 1.25 / 1.5 / 1.875 / 2.25 / 3 rem, then jump **2.53×** to display |
| display tracking | **−0.05em** at 3rem+, **−0.075em** on the page title |
| display leading | **0.85** at 144px, **0.813** at 136.8px |
| spine grid | **50/50** (`702px 702px`), label 36px tall in a 702px column, **dx = 702px** |
| gutter | **18px** desktop / **16px** mobile |
| section rhythm | 4 values only: **270 / 324 / 360 / 432 px** desktop; **112 / 144 / 160** mobile |
| borders | **1px only**, **radius 9999px only**, ≤15 boxes per page, **0 on the landing page** |
| hairlines | **1px**, full-bleed while content insets **18px** (36px total over-run) |
| grounds | **2 hexes** (`#171615` / `#fff`), **2 flips per page**, light band = **39% @1440 / 45% @390** |
| accent | **1 colour** (`#BC9859`), **1 rule**, **1 element**, **4.5px tall** |
| signature reveal | `translateY(1 line-height) → 0`, **1.6s**, `cubic-bezier(.19,1,.22,1)`, **200ms stagger** |
| UI duration | **0.3s** (15 uses) with `cubic-bezier(.4,0,.2,1)`; hover swaps **0.3s ease-out**, **24px** |
| cinematic duration | **1.6s** (headlines) and **2s** (images, `cubic-bezier(.76,0,.24,1)`, scale 2.1→1) |
| play button | viewBox 108, ring `r=53.25` stroke **1.5**, glyph **17.36×27**, **glyph = 25.4% of diameter** |
| arrow | viewBox `0 0 20 16`, stroke **1px**, cap **butt**, hover travel **±24px** |
| **fix before shipping** | focus rings · `prefers-reduced-motion` · alt text · a real button behind the hold gesture · cap mobile section gaps · keep the spine pinned (or visible) at 390 |
