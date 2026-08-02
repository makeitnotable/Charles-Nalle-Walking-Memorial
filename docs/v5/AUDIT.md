# v5 AUDIT — why this does not win

*Stage 1 of `docs/AUDIT-PROMPT.md`. Evidence only. Every finding below is
measured off a rendered page or read off a screenshot; nothing is inferred from
source intent. Instruments: `scripts/probe.mjs` (rendered-px ruler),
`scripts/states.mjs` (110 interaction states), `scripts/census.mjs` (full type +
rhythm ladder), `scripts/shots.mjs` (route × viewport × 5 scroll depths).*

**Matrix captured:** 11 routes × 5 viewports (390×844, 844×390 landscape phone,
768×1024, 1024×768, 1440×900) at rest + 5 scroll depths, plus 110 interaction
states (menu open · narration playing · mini-player latched · both at once · map
card focused under an open menu · press-reveal mid-hold · curtain mid-transition
· hover · focus).

**Evidence root:** `docs/v5/qa/` — `probe-local/probe.md`, `states-local/states.md`,
`census-local.md`, `shots-local/`, `eyes/`. Screenshots are gitignored (regenerable);
the findings are the artefact.

---

## 1 · Scores

Awwwards axes and weights: **Design 40% · Usability 30% · Creativity 20% ·
Content 10%.** SOTD reality is ~8.5. Anything under 7 is a named failure.
Scored per route at its worst breakpoint, then per breakpoint where it differs.

| Route | Design | Usability | Creativity | Content | Weighted | Worst breakpoint |
|---|---|---|---|---|---|---|
| `/` home | 6.0 | 6.5 | 5.5 | 5.0 | **6.0** | all — same at every size |
| `/bakery` | 5.5 | 7.0 | 6.5 | 5.5 | **6.2** | 844×390 landscape |
| `/commissioners-office` | 5.5 | 7.0 | 6.5 | 5.5 | **6.2** | 844×390 |
| `/mansion` | 5.5 | 7.0 | 6.5 | 5.5 | **6.2** | 844×390 |
| `/ferry` | 5.5 | 7.0 | 7.0 | 5.5 | **6.3** | 844×390 |
| `/barbershop` | 5.5 | 7.0 | 7.0 | 5.5 | **6.3** | 844×390 |
| `/map` | 4.5 | 4.0 | 6.5 | 6.0 | **4.9** | 390 and 844×390 |
| `/people` | 5.0 | 6.5 | 4.5 | 6.0 | **5.5** | 1440 |
| `/paintings` | 6.5 | 7.5 | 5.5 | 6.0 | **6.5** | 390 |
| `/about` | 6.0 | 7.0 | 5.0 | 7.0 | **6.1** | 1024 |
| `/404` | 6.5 | 7.5 | 5.0 | 6.0 | **6.4** | 1440 |

**Site weighted mean: 6.1.** Every route is below 7 on at least one axis.
Nothing on this site currently scores 8. The gap to SOTD is not one big miss —
it is ~2.4 points spread across every axis of every page, which is exactly what
"looks good, feels unfinished" measures like.

Per-breakpoint deltas worth stating separately:

| Breakpoint | Mean | Note |
|---|---|---|
| 390×844 | 6.3 | the tuned one — mobile hero actually fits |
| 768×1024 | 6.0 | hero overflows fold by 87px |
| 1024×768 | 5.8 | hero overflows by 107px; editorial grid splits with no room |
| 1440×900 | 5.9 | hero overflows by 97–100px; display at 116px |
| 844×390 | **4.6** | **hero overflows by 184–256px; desktop type on a 390px-tall screen** |

---

## 2 · Root causes — why it fails to feel award-winning

Five structural reasons. Every itemised finding in §3 is a symptom of one of them.

### R1 · The hero was never solved for the fold — on any screen but one

`header#hero` is `min-h-dvh`, so it declares itself a one-viewport composition.
Its contents cannot fit one viewport. The lockup reserves `md:min-h-[46dvh]`,
the media box reserves `min-h-[42dvh] md:min-h-[46dvh]`, and between and around
them sit `pt-24` (96px), a meta line, a rule, a `mt-8`, a "Scroll to listen" cue
and `pb-6`. That sums to **~112dvh before the display type is even measured.**

Measured overflow of the hero media past the fold:

| | 390 | 844×390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| `/ferry` | fits (25px spare) | **−256px** | **−87px** | **−107px** | **−100px** |
| `/mansion` | fits | **−184px** | **−87px** | **−107px** | **−97px** |

Consequence: on every screen except a portrait phone, the first thing a juror
sees is a headline that fills a third of the viewport above a painting that is
sliced by the bottom edge. The painting — the reason the site exists — is
introduced as a cropped strip. This single defect is most of the Design score.

### R2 · The display role has no fixed size, so hierarchy cannot be learned

`.t-display` is `min(--fs-display, --fit-basis / (--fit-chars × 0.64))`. The
size is therefore a function of **how long the string happens to be**. Measured
at 1440, the *same role* renders at:

`116px` (bakery, commissioners, mansion, ferry, barbershop heroes; people;
paintings; map) · `107.8px` (bakery moral) · `107.4px` (about) · `92.4px`
(mansion moral) · `86.9px` (404) · `80.9px` (ferry moral).

Six sizes for one role on one site. A reader cannot learn "this size means
chapter title" because it never means one size. And because the clamp measures
characters, the *longest* names get the *smallest* type — the ferry, the
climax of the story, gets the quietest moral headline on the site.

Underneath that, the ladder is not four roles but **nine to ten rendered sizes
per page** at 1440 (census), with **five sizes shared by two or more roles** on
every chapter page — 15px alone carries `t-spine`, `t-meta-body`, `btn`, and
two kinds of unstyled span and anchor.

### R3 · Uniform rhythm — the page is a metronome, not a story

Measured gaps between top-level sections on every chapter page at 1440:

`200, 200, 200, 200, 400, 200, 200`

Six sections, one interval, one exception. Every chapter is identical. Nothing
accelerates into the rescue and nothing rests after it; the moral lands at the
same volume as the "where to next" banner. museos and Google A&C both earn their
scores by *changing* rhythm — crop-collage before full painting, act-change
grounds, a pull-quote that stops the page. Here the spacing token was applied
uniformly and correctly, and correctness is what makes it feel mechanical.

### R4 · Content repeats instead of deepening — in prose and in pictures

**Pictures.** Measured per chapter page, every viewport: the horizontal painting
renders **three times** (hero poster → press-reveal end state → full-bleed
interlude) and the moral painting renders **twice inside the same section**
(full-bleed background + a 220px inline thumbnail, both visible at once). Every
chapter has 6–11 distinct assets available; the template draws two of them
repeatedly. `/map` renders each stop's `square` crop twice.

**Prose.** `portal.history` has the identical shape in all five chapters: three
short factual sentences (P0–P2) followed by a long paragraph (P3) that restates
all three in different words. The page then renders `historicalContext` — the
numbered facts — directly above it, and those overlap too (`bakery hist(1)` ↔
`bakery portal.P0` measure 0.33 Jaccard; `barbershop hist(2)` ↔ `portal.P0`
0.30). A reader is told the same thing three times in one section. All six moral
CTAs across the site are titled **"Make a Difference."**

### R5 · Floating UI has no system — it has five separate opinions

There is no shared lane, inset, or stacking contract. Measured inventory:
`.walk-rail` fixed top 0 z900 · `.cnwm-menu` fixed top 32/right 12 z1000 ·
mini-player fixed bottom 16/left 16 z999 · the map's seven `absolute` overlays
at z10/z20/z30 · Mapbox's own scale, geolocate and attribution, unaligned to
anything. The content grid sits at a 56px gutter; the menu sits at 12px. On a
1440 chapter page the menu floats **124px outside the content's right edge**,
belonging to no column.

The collisions this produces are in §3.C. The worst is structural: on `/map` the
menu panel is z1000 over markers at z0, so **opening the menu covers the map's
own navigation** — at 768 it slices the "GILBERT HOME" marker in half and clips
its own "COMMISSIONER'S OFFICE" label off the right edge of the screen.

### Against the five inspiration sites

- **pasqua** — screen-space type holds *still* over world-space motion, and the
  mobile view is a *reframe*. Here the same composition is scaled down and the
  landscape phone gets desktop type on a 390px-tall screen. `docs/INSPIRATION.md`
  named "art-directed mobile recomposition" as the lesson; it was not taken.
- **museos** — the numbered spine and the act-change ground were both ported,
  but ported *evenly*: every section gets the same gap and the same weight, so
  the borrowed structure reads as a template rather than an argument.
- **Google A&C** — "show our smallness." The home page never says five stops,
  never says April 27 1860, and its CTA says "Continue" with no destination.
- **marseille** — every pin labelled, deep links for every state. Here three of
  five marker labels are clipped off-screen at 390.
- **rewild** — motion with a thesis. Ours decorates: a Ken Burns scrub on the
  interlude, a 1.15 hero scale, a menu bloom. None of them *narrate*.

---

## 3 · Findings

P0 = breaks the award case · P1 = visibly unpolished · P2 = detail.
Every finding names the evidence file, the breakpoint, and the fix.

### A · Type scale (Wil's confirmed defect 1)

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| A1 | **P0** | Chapter hero H1 renders 116px × 3 lines = 331px, 37% of a 900px viewport, and pushes the painting past the fold | `eyes/ferry-hero-1440.png`; probe 1440 | Cap display at 88px ≤1600px wide; recompose hero (see B1) |
| A2 | **P0** | At 844×390 the `min-width:768px` query fires on a 390px-**tall** screen: display 76px, hero overflows by 184–256px | probe `phone-landscape`; `states-local/mansion-land-01-rest.png` | Gate the desktop step on height too: `(min-width:768px) and (min-height:600px)` |
| A3 | **P0** | One role, six rendered sizes site-wide (116/107.8/107.4/92.4/86.9/80.9) because the clamp is string-length-driven | `census-local.md` role map | Make `--fit-chars` a *guard*, not the size: fixed step, clamp only to prevent overflow |
| A4 | **P0** | Longest names get smallest type — ferry's moral (the story's climax) renders 80.9px vs bakery's 107.8px | census 1440 | Same as A3 |
| A5 | P1 | 9–10 distinct rendered sizes per page against a declared four-role ladder | `census-local.md` | Role-map every stray span/anchor; delete off-ladder sizes |
| A6 | P1 | 15px carries five roles at once (`t-spine`+`t-meta-body`+`btn`+span+a) — spine numeral, caption and button are indistinguishable | census role map, all chapter routes | Separate spine and caption steps; buttons keep 15px alone |
| A7 | P1 | `ChapterSpine` hardcodes `font-size:15px` inline, overriding the `--fs-spine` token (30px) it is supposed to use | `ChapterSpine.astro:44` | Add a real `--fs-spine-sm` token; delete the inline style |
| A8 | P1 | `/map` h1 declares `--fit-chars: 10` but its longest line "through Troy" is 12 — the clamp under-measures by 20% | `map.astro:56` | Compute from the string, like `[chapter].astro` does |
| A9 | P1 | `/paintings` (`--fit-chars: 9` vs "THE NALLE" = 9 ✓) and `/people` (14 vs actual) and `/404` (21) are hand-counted and drift | `paintings/people/404.astro` | Compute all of them |
| A10 | P1 | `/people` H1 rag is a violent zigzag: line ends at x=690, 1068, 463 | `states-local/people-1440-01-rest.png` | Author the breaks; balance to a 2-line lockup |
| A11 | P1 | "CAST." is a 5-character widow line under two full lines | same | Re-break to "ONE DAY. / A WHOLE CITY'S CAST." |
| A12 | P2 | `/map` renders 10px and 11px type (Mapbox scale + attribution), below the system's own 12px floor | census `/map` 1440 | Style Mapbox chrome to `t-meta` 12px |
| A13 | P2 | Home wordmark `clamp(54px,11vw,128px)` is the only viewport-ladder type left in the system | `global.css:372` | Bring onto the display step |
| A14 | P2 | `/404` H1 at 86.9px for "THIS PAGE ISN'T PART OF THE MEMORIAL" — a 36-char sentence set as display | census | Set as `t-title`; display is for names |

### B · Layout, alignment, composition (Wil's confirmed defect 4)

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| B1 | **P0** | Hero sums to ~112dvh inside a `min-h-dvh` box: two 46dvh minimums plus ~190px of fixed chrome | `[chapter].astro:111–172` | Rebuild as an explicit grid: lockup gets what it needs, media takes `1fr` |
| B2 | **P0** | Corner menu sits at right:12px while content sits at a 56px gutter — 124px adrift, anchored to nothing, on every page | all 1440 shots | One inset token for all floating UI, aligned to the gutter |
| B3 | **P0** | `/map`: seven floating elements (header pill, menu, 5 markers, 2 CTAs, scale, geolocate, attribution) with no shared lane | `states-local/map-390-01-rest.png` | Reserved corners/lanes; see C |
| B4 | P1 | `/people` leaves the entire right half of the fold empty and a 220px void between H1 and quote, with portraits available | `people-1440-01-rest.png` | Two-column lockup; bring a face above the fold |
| B5 | P1 | Home: 154px of dead space between the date rule and the CTA, 163px between CTA and mission copy — `justify-between` spreading three islands | `home-1440-01-rest.png` | Compose deliberately; group the lockup |
| B6 | P1 | Home frame border (`gray-7` #4b4741 on #1d1411) is invisible, so the "framed photo" idea never reads | same | Raise the border or drop the conceit |
| B7 | P1 | Home menu button sits 36px outside the frame's right edge and 16px above its top — outside the only container on the page | same | Inside the frame, on the gutter |
| B8 | P1 | Footer reserves `md:pr-28` (112px) for a corner menu that is at the *top* of chapter pages — the Share button hangs 112px in from the right while everything else is on the gutter | `SiteFooter.astro:38` | Reserve only where the menu is actually adjacent |
| B9 | P1 | Footer `pb-28` (112px) reserves for a mini-player on `/people`, `/paintings`, `/about`, which have no audio | same | Conditional |
| B10 | P1 | A full-bleed block measures x=−72px, width 1584 on a 1440 viewport — 144px oversized, hidden only by `overflow-x: clip` | probe edges, all chapter routes | Fix `.bleed` inside a container-typed shell |
| B11 | P1 | Sketch section: the press-and-hold instruction sits *below* an 790px-tall image, so at normal scroll depth the signature interaction shows no affordance | `shots-local/mansion--768--scroll2.png` | Affordance on the artwork |
| B12 | P1 | The sketch is a white rectangle butted onto a near-black ground with no transition — the harshest luminance edge on the site | same | Ground it (inset, mat, or vignette) |
| B13 | P2 | `/map` scale bar sits at x=10, geolocate at x=14 — two left insets 4px apart | `map-390-01-rest.png` | One lane |
| B14 | P2 | `/map` loading placeholder ("THE WALK IS LOADING…") stays in the DOM after hydration, overlapping live markers | `states-local/states.md` rows 1–2 | Remove on hydrate |
| B15 | P2 | Chapter hero: 350px of empty gutter right of the H1 while type crushes the left | `eyes/ferry-hero-1440.png` | Falls out of B1 |

### C · Floating UI collisions (Wil's confirmed defect 3)

Measured across 110 states. Seven states carry real overlaps.

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| C1 | **P0** | `/map` + menu open: the panel (z1000) covers stop markers (z0) — Commissioner's Office, Ferry Landing, Barbershop, Bakery all obscured at 390 | `map-390-02-menu-open.png` | Menu and markers cannot share space: relocate the menu on `/map` and inset the marker field |
| C2 | **P0** | `/map` 768: panel slices the "GILBERT HOME" marker in half (25×40 overlap) | `map-768-02-menu-open.png` | Same |
| C3 | **P0** | Menu panel's own text is clipped by the viewport: "COMMISSIONER'S" overflows the 256px inner width and is cut at the screen edge | same | Widen the panel / set the label size to fit the longest name |
| C4 | **P0** | 844×390: the menu panel is 358px tall in a 390px viewport and covers the whole map stage plus the CTA cluster | `map-land-02-menu-open.png` | Scrollable panel with a height cap |
| C5 | **P0** | Three of five map marker labels are clipped by the viewport edges at 390 ("COMMISSIONER'S O…", "BAKER…", barbershop dot half off-left) | `map-390-01-rest.png` | Pad the fitBounds; keep labels inside a safe area |
| C6 | P1 | Walk rail (fixed, z900, 24px) slices the embedded map's "4 FERRY LANDING" marker in the chapter's onward section (146×24) | `mansion-land-09-cta-focus.png` | Rail must not overlay embedded map chrome |
| C7 | P1 | Chapter spine (`nav.rail`, sticky) passes under the walk rail at the end of its section and is sliced by it (220×24 at 1024) | probe collisions, `/commissioners-office` 1024 | Sticky `top` must clear the rail |
| C8 | P1 | `/map` menu is top-right, but `Base.astro` documents and supports a `bottom-right` position that `map.astro` never passes — the escape hatch exists and is unwired | `map.astro:31`, `Base.astro:12` | Wire it or delete it |
| C9 | P2 | Mapbox attribution renders in default link styling, the only unstyled third-party UI left | `map-768-02-menu-open.png` | On the system |

### D · Repeated imagery (Wil's confirmed defect 2)

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| D1 | **P0** | The horizontal painting renders **3×** per chapter page: hero poster (`reveal-horizontal-poster`), press-reveal end state (`reveal.painting = "horizontal"`), full-bleed interlude (`horizontal-1440.jpg`) | probe repeats, all 5 chapters × all 5 viewports | Interlude draws a *different* asset per chapter; press-reveal keeps the painting (it is the point of the interaction) |
| D2 | **P0** | The moral painting renders **2× inside one section** — full-bleed background and a 220px inline thumbnail, co-visible | probe repeats; `[chapter].astro:338,365` | Delete the thumbnail; the background *is* the artwork |
| D3 | P1 | `/map` renders each stop's `square` crop twice (carousel card + index) | probe repeats `/map` all viewports | Index uses a different crop |
| D4 | P1 | ch2 has 5 unused part-2 assets (`horizontal-pt2`, `vertical-pt2`, `sketch-pt2`, `moral-pt2`, `historical-pt2`); ch4/ch5 have `narrative1/2` used only as inline films | media inventory vs `[chapter].astro` | Chapter 2's two scenes get their own imagery; give ch4/ch5 rhythm the others cannot have |
| D5 | P1 | `square` and `vertical` crops are unused on chapter pages entirely | media inventory | Use them for the varied interlude (D1) |
| D6 | P2 | Home hero preloads and paints `home-bg-800.avif` — an 800px file — into a 1344×806 frame at 1440 | `index.astro:15,28` | Serve `home-bg-1440` above 800px |

### E · Content repetition and voice

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| E1 | **P0** | `portal.history` P3 restates P0+P1+P2 in every one of the five chapters — a long paragraph saying what three short ones just said | full text dump, §R4 | Merge to two paragraphs preserving every distinct fact and Kathy's corrected wording; log in `CONTENT-STATUS.md` |
| E2 | **P0** | The history section renders `historicalContext` (numbered facts) immediately above `portal.history` (prose) and they overlap — `bakery hist(1)` ↔ `portal.P0` 0.33 Jaccard | fuzzy dedup run | Cut the overlapping numbered fact or the overlapping sentence — never both |
| E3 | P1 | All six moral CTAs on the site are titled **"Make a Difference"** | content dump | One per chapter, in that chapter's voice |
| E4 | P1 | Harriet Tubman's "Drag him to the river!" quote is spent on both `/people` and `/commissioners-office` — the site's most powerful line, used twice | `people-1440-01-rest.png` + ch2 scene1 | `/people` takes a different voice |
| E5 | P1 | Every chapter runs the identical scaffold — quote → narration → sketch → interlude → history → moral → onward — regardless of what that chapter *has* | `[chapter].astro`; all shots | Vary by chapter using each one's unique assets (R3) |
| E6 | P1 | The "From the sketch" paragraph is byte-identical on all five chapters | `[chapter].astro:225–229` | Per-chapter, or state it once site-wide |
| E7 | P1 | Home mission copy reads as a spec ("a digital physical experience designed to share the history") — the only prose on the front door and it describes the format, not the story | `home-1440-01-rest.png` | Lead with April 27, 1860 |
| E8 | P1 | Home CTA says "Continue" — no destination, no scale, no promise | same | Name the walk and its size |
| E9 | P2 | `/people` eyebrow "THE PEOPLE" repeats the nav label directly above an H1 that already says it | `people-1440-01-rest.png` | Cut or re-purpose |
| E10 | P2 | Ferry `portal.P1` still says "helped onto a boat" while P3 carries Kathy's corrected "boarded a waiting skiff" — two phrasings of the corrected fact co-exist | content dump | Keep the corrected wording only |

### F · Motion

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| F1 | P1 | Motion decorates rather than narrates: a Ken Burns scrub on the interlude, a 1.15 hero scale, a menu bloom — none carries the stated thesis ("the past developing into the present") | `[chapter].astro:450–488`; MOTION.md | Reserve motion for the reveal and the act changes; cut the rest |
| F2 | P1 | The hero scrub scales the media to 1.15 while the media is already cut off by the fold — it grows something the viewport cannot show | probe + `[chapter].astro:466` | Falls out of B1 |
| F3 | P1 | Home entrance completes at ~2.8s (1200ms stagger + 1600ms duration) with no content before it — the slowest first impression on the site | `index.astro:121` | Tighten to ≤1.6s total |
| F4 | P2 | Menu retreat-on-scroll fires at y>240 with a 4px threshold — it flickers on trackpad micro-scrolls | `Menu.astro:201` | Raise the threshold / debounce |
| F5 | P2 | Menu close animation runs 300ms `power2.in` + a 300ms burger bloom + a 60ms stagger = 660ms to close a menu | `Menu.astro:140–168` | One duration |

### G · Interaction, states, accessibility

| # | P | Finding | Evidence | Fix |
|---|---|---|---|---|
| G1 | P1 | The map carousel never appears at rest — 110-state sweep could not find a card to focus at any breakpoint; the stop cards only exist after a marker is chosen | `states.md` (no `card-focus` rows) | Show the walk's five cards on arrival |
| G2 | P1 | "Take the walk" and "See Troy in 1860" are two same-size pills stacked at the bottom centre of the map with equal weight | `map-390-01-rest.png` | One primary, one quiet |
| G3 | P2 | Footer "Notable" link is 55×20 — under the 24px target floor the constitution sets | probe tap targets | Pad |
| G4 | P2 | Mapbox attribution links are 15px tall | probe tap targets `/map` landscape | Accept as third-party or pad |
| G5 | P2 | Menu close button is a 78px-tall full-width bar holding one 16px × glyph | `map-768-02-menu-open.png` | Proportion it |

### H · Clean bill (verified, do not "fix")

Recorded so the fix pass does not chase ghosts, and so regressions are visible:

- **Console: zero errors and zero warnings** across all 55 route × viewport loads.
- **CLS ≤ 0.012** everywhere; most routes exactly 0.
- **No horizontal overflow** on any route at any breakpoint.
- **Zero collisions on chapter pages** in all 10 chapter interaction states at
  all 5 breakpoints — including audio-playing + menu-open. Wil's "menu buttons
  overlap" is real but is specifically a `/map` defect.
- Mini-player correctly occupies bottom-left while the menu owns top-right.
- The cream reading register, the narration sync highlight, and the press-and-hold
  keyboard path all work as documented.

---

## 4 · Count

**73 findings** — 16 P0, 38 P1, 19 P2 — across 8 classes, all four of Wil's
confirmed defects verified as fact and expanded to their full class.

Next: `docs/v5/FIX-PLAN.md`.
