# v13 — the review guide

*Wil's 8/26 round, eleven items. Work order: `docs/v13/BRIEF.md`. Ledger with
SHAs: `docs/v13/AUDIT.md`. Executed from `06e76e2` on `v2`, mirrored to
`claude/paintings-hall-museum-fixes-qufa6x`.*

---

## Read this first: two screenshots, and four diagnoses

**Two of your five screenshots predate the v12 deploy.** They are stamped
**Tue Aug 25, 1:07 / 1:11 AM** — a day before v12 went out. The desktop hall
shot proves it: its plaque reads `LOCATION 05 / PETER BALTIMORE'S BARBERSHOP /
2`, which is the **v11** composition. v12 replaced that with the official title
(*Martin Felled by Axe*) and dropped the variant line. So some of what you were
looking at no longer existed when you wrote the list.

This did not weaken the round — every target you named was still there at HEAD,
including the "Location NN" eyebrow — but every complaint was **re-measured
against HEAD before anything was touched**, and where a measurement disagreed
with the brief, the measurement decided.

**Four of your eleven diagnoses were contradicted by the code.** In each case
the *symptom you reported was real*; the cause was not what it looked like:

| your # | you said | what was actually true |
|---|---|---|
| 4.2 | "`/map` ships viewport without `viewport-fit=cover`, and lacks four mobile-web-app metas" | **False on every count.** All twelve built routes carry one byte-identical viewport meta *including* `viewport-fit=cover`, and `/map`'s mobile-web-app block matches home and the chapters exactly. `Base.astro`'s only slot is inside `<main>`, so no page *can* inject a head tag — the consolidation you asked for is already the architecture. |
| 4.3b / 4.5 | "two stacked borders, one token one hardcoded" | **Reproduced, but it is a clipped focus ring.** The menu focuses its first child on open; that ring's `outline-offset: 3px` draws outside the child, and the panel's `overflow-y: auto` clips its top and sides away — leaving only the bottom segment, a few px under the real border. Chromium hides it on mouse-click, WebKit does not, which is why you saw it and QA did not. |
| 3 | "styling differs somehow" | **One value.** Hero 1's bottom scrim opens at opaque `rgb(29,20,17)` — exactly the page ground. Hero 2's opened at `.95`, so 5% of painting bled through at the boundary. That 5% was the entire band. |
| 4.7 | "tighten the gap so all four fit" | **Your own stop-condition fires.** See §11 — the numbers are below, and the menu is unchanged because you told us to leave it if one gap was not enough. |

Two more where the fix was live and reading as its own opposite:

- **4 (Historical Context)** — v12's feather dissolved the top and bottom **24%**
  of the plate. You asked to *see more* of the image; the shipped code was
  showing less. That is why it read as "not implemented" and as *smaller*.
- **4.1c (the desktop chip)** — the *vertical* alignment you asked for was
  already exact (**0.00px** at 1024/1280/1440/1920, settled in v11). Only the
  horizontal was wrong.

---

## The eleven items

### 1 · The 1858 lens → map transition (V13-01) — `4a90331`

**It was not the fade. It was a layout race.** The figure is a flex column, and
the "Back to today" button unmounted in the *same commit* that started the
fade — so `flex-1` absorbed its 68px in that layout pass, the box grew, and the
image (anchored at 50% of the box) jumped **34px downward on the exact frame
the fade began**. That is the jitter you saw: not a rough animation, a jump.

| | before | after |
|---|---|---|
| anchor movement on the close frame | **34.00px** | **0.00px** |
| movement across all visible frames | 34.00px | **0.00px** (26 frames sampled) |
| lens box during the fade | 670 → 738px | 670px throughout |
| fade length | 1600ms | **520ms** |

The children now stay mounted for the whole fade and unmount on `transitionend`.
The re-flow still happens — at t≈614ms, with opacity measured at **0**, so you
cannot see it — and then the pose resets, so re-opening the lens no longer
inherits wherever you left it.

Three aggravators went with it: the fade drops to 520ms on the house ease
(reduced motion swaps instantly); the map chrome is held back until the fade
finishes, so its `backdrop-filter` never composites over a live fading layer;
and `will-change: transform` comes off the permanent path — measured `auto` at
rest, `transform` during a drag, `auto` again after. That last one also helps
your 4.3 complaint independently of resolution: iOS Safari is lazy about
re-rasterising a permanently promoted layer this large, which softens the plate
on its own.

Keyboard round-trip verified with a visible ring at every step, and focus now
**returns to the "See Troy in 1858" door** instead of being dropped.

### 2 · Desktop chapter cards — equal spacing, ends not cut off (V13-02) — `4a90331`

**v12's arithmetic was already right; keen-slider was undoing it.** The library
puts `overflow: hidden` on every slide, so the inward shift that equalised the
gaps had **41.16px of each outer card's own artwork guillotined** — and the
visible gap sprang back to 16 + 41.16 = **57.16px**, which is exactly the
16/57/57 that v12 set out to fix. You were looking at a fix being cancelled.

| width | gaps before | gaps after |
|---|---|---|
| 1280 / 1440 | 16 / 16 | 16 / 15.96 / 15.96 / 15.96 |
| 1920 / 2560 | **57.16** / 16 / 16 / **57.16** | 16 / 15.96 / 15.96 / 15.96 |

Spread **0.04px** against a ±0.5px bar. Focused-card centre error 0.25px
(bar ±1). Scales exactly 1.0000 / 0.9200. **Cards clipped by their own slide:
5 of 5 at every width ≥1024 before → 0 after.**

*Judgement call:* the plan proposed equalising through keen's own `spacing`
instead. Measured, that is geometrically impossible — one uniform pitch cannot
equalise the focused card's two gaps against the gaps between two *shrunken*
neighbours; they differ by half the shrink (20.58px) at any spacing or origin.
So the clip goes, not the shift. **Revert:** delete the one line that sets
`overflow: visible` on wide slides.

**On "ends cut off".** At 1280 and 1440 three whole cards need 1576px and the
strip cannot hold them, so an outermost *partial* is a permanent condition —
and cards may not be resized, which you asked for. The fix is that a partial
now **dissolves** instead of being sliced: the edge ramp goes 28px → 120px,
eased. Pixel-sampled at 1920 with a white ground behind the mask: **0 ink at
x = 0, 1, 2, 4**, first faint ink at x = 7, full by x = 120. The dissolve
completes *inside* the frame, so no card ever meets the container edge with ink
still in it.

**Tablet and mobile are untouched, as you required** — asserted, not assumed.
A full computed snapshot at 390 and 768 (slide overflow, inner transform and
origin, card width/height/padding/border-radius/box-shadow/border, the
thumbnail box, and font-size/family/line-height/letter-spacing/weight/colour on
every text role) diffs **byte-identical** to HEAD. The new ramp lives in its own
`min-width: 1024px` block; the 640px boundary and its 28px ramp are exactly as
they were.

**One thing I could not reproduce — your third fault.** You said the focused
card sits right of centre. At rest it does not: the centre error is **0.25px**
at every width ≥1024, and identical before and after my change. The most likely
explanation is that the screenshot caught the strip **mid-settle** — keen runs a
650ms ease-out after a drag — rather than at rest. Per your scope lock I did not
add a nudge to chase it. If you see it again at rest, send a screenshot taken a
second after the strip stops moving and I will treat it as a live defect.

### 3 · Chapter 2's Part-2 hero must blend like Part 1 (V13-03) — `a30b4c8`

One value, exactly as the audit predicted. Hero 2's two gradients are now
string-identical to hero 1's.

| | before | after |
|---|---|---|
| hero 2 seam, 390 | Δ 0.9 | **Δ 0.1** |
| hero 2 seam, 1440 | Δ 0.7 | **Δ 0.1** |
| hero 1 seam (reference) | Δ 0.4 / 0.6 | unchanged |

Max per-channel delta across the 8px band either side of the boundary. Hero 2
now sits at or under hero 1's own noise floor. Seam sweep across all five
chapters: max Δ 0–17, against the **219** that v12's rejected dark ramp drew.

Nothing else about that hero moved — not the `sec` class, not `h-[82dvh]`, not
the lockup.

### 4 · Historical Context (V13-04) — `a30b4c8`

The v12 code was live. It read as missing because the feather was dissolving
the picture rather than revealing it. The ramp is halved (24% → 12%, same
two-stage curve compressed) and the plate grows a step.

Measured off the computed mask, not derived from the ramp fraction:

| width | plate | fully-opaque artwork |
|---|---|---|
| 375 | 630 → **684** | 327.6 → **519.8** (+59%) |
| 768 | 792 → **846** | 411.8 → **643.0** (+56%) |

The scrub is retuned to your spec — scale 1.00 → 1.03 **plus translateY −8px**,
where v12 ran 1 → 1.055 with no translate. On the live scrub: progress 0.5 →
`1.0297 / −7.91px`; progress 1.0 → `1.0004 / −0.11px`; scrolling back up
reproduces `1.0297 / −7.90px`. Reversible, as you asked. Under reduced motion
the plate measures `transform: none`.

Black flash: `.wipe-clip` now carries the cream ground too, so the clip box can
never show the dark body ground for a frame on a cold load.

**No `object-position` was added anywhere.** At every tested width the default
already frames all five plates; inventing focus values the pictures do not need
would be a change for its own sake. If you disagree after seeing the 1440
crops, the per-chapter values live in each chapter JSON.

### 4.1 · The hall: plaque, tap switch, desktop chip (V13-05) — `d097ea3`

**The "Location NN" eyebrow is gone** from both plaque render sites, which
between them cover desktop, tablet and phone. It is generated from
`pad2(plaque.order)`, so all ten works were covered at once. **The location
button in the grid below the hall — the one you explicitly protected — is
untouched**, and verified so.

**The tap switch.** The switch existed; what made it feel broken is that the
raycast demanded an exact hit on the *canvas*, so a tap on the moulding did
nothing — and with no feedback, a tap that worked was indistinguishable from
one that missed. Taps now toggle anywhere inside the work's projected rect
±9% (the moulding is 8.5% a side), and a play/pause glyph confirms the state
for ~900ms. Measured after: a tap 4% above the canvas toggles, 7% below
toggles, 30% below correctly does nothing. A painting you switch off stays off
when you leave — that is deliberate switch semantics.

**The desktop chip.** Your vertical complaint was already fixed: pill centre
and Skip centre agree to **0.00px** at 1024/1280/1440/1920. The horizontal was
the real fault — the pill centred on the *viewport*, ignoring the two controls
sharing its band, so at 1024 it sat 24.6px from Skip against 245.6px of air.

| width | Skip→pill / pill→right, before | after |
|---|---|---|
| 1024 | 24.6 / 245.6 | **79.6 / 78.6** |
| 1440 | 185.1 / 422.2 | **240.1 / 239.2** |

*Judgement call:* taken literally, "mirror the same reserve on the right" is
geometrically identical to centring on the viewport and would have changed
nothing. The pill is centred between Skip's right edge and the corner menu's
left edge instead. **Revert:** delete the `transform: translateX(...)` line in
`global.css`.

### 4.2 · "Black bars" and the viewport metas (V13-06) — `2b6c342`

Your diagnosis was false on every count (see the table at the top). What was
actually done:

1. **A regression lock, which is what you were really asking for.** `npm run
   qa:head` now fails the build if any document has other than exactly one
   viewport meta, if the strings differ across documents, if `viewport-fit=cover`
   is missing, or if the five mobile-web-app metas are not identical everywhere.
   Negative-tested: stripping `viewport-fit=cover` from one built route exits 1
   and names both faults.
2. **Three genuinely-raw safe-area offsets closed** — the only fixed chrome on
   the site whose offsets did not already resolve through `--ui-inset`: the walk
   rail's top, and the skip link on both axes. Everything else you listed —
   "Take the walk", the date chip, the 1858 door, the hamburger, the chapter
   section-nav, the audio player — already resolved safe areas correctly and was
   left alone.
3. **The chrome-tint strips now out-paint the full-bleed stages.** v12 shipped
   two 2px strips to give Safari's sampler the intended colour, at `z-index: 0`
   — which only outranks a same-level sibling *by DOM order*, and both `/map`'s
   shell and `/paintings`' stage come later in the document. So on exactly the
   two routes your screenshots came from, the stage painted over the strip and
   Safari sampled the WebGL canvas instead.
   The ceiling here is the **walk rail**, not the scrim: a first pass at
   `z:950` was measured eating two-thirds of the rail's 3px progress stripe
   (top 2px read as the strip, only the third px as the rail). `z:100` clears
   both islands while leaving the rail, scrim, menu and curtain untouched.
4. **Your `100vh` + `overflow: hidden` note does not apply here** — `.map-shell`
   is `height: 100dvh` with no overflow lock and the document scrolls normally,
   so Safari's toolbar does retract. Verified, not assumed.

**§ THIS IS THE ONE THING I CANNOT CLOSE FROM HERE — see the bottom of this
guide for exactly what to capture.**

### 4.3a · The 1858 plate at max zoom (V13-07a) — `14731bc` + `4a90331`

The arithmetic behind your complaint: the `<picture>` split on `min-width:
768px` alone, with **no DPR term anywhere**, so a DPR-3 phone exhausted its 1:1
pixels at scale 3.90 of a ceiling of 6, and a DPR-2 tablet at 4.07 — about a
1.5× upscale at the ceiling on both.

A new **8192×6862** tier is built from the 23000×19267 JP2 master. Two proofs:

- **The framing did not move** — both tiers downscaled to a common 512px and
  differenced: mean absolute error **0.88/255**.
- **It genuinely resolves more, rather than merely weighing more** — rendered
  into the same 1024px box, Laplacian variance **1169 vs the 6144 tier's 428**,
  i.e. 2.73× the high-frequency detail.

*Judgement call — quality is calibrated, not chosen.* At 6144 this encoder
reproduces the shipped 1.95 MB tier at **q≈52**, so q52 is this plate's house
register and the new tier is cut at it: **3.25 MB**. A first pass at q62
measured 4.69 MB — heavier than its own siblings, no sharper.

*Judgement call — AVIF only above 6144.* The 8192 WebP measured **8.31 MB**,
more than the rest of the site's media together, to serve browsers that have
not existed since Safari 16.4 (2023). Above 6144 a non-AVIF browser falls back
to the 6144 WebP, which is exactly what it is served today — a no-op, not a
regression. **Revert:** `node scripts/build-1858-tier.mjs 8192 --webp` and add
the `<source>` back.

**The code half — and the actual arithmetic of your complaint.** Selection now
accounts for resolution rather than width alone, and the zoom ceiling is
resolution-aware (`min(6, naturalWidth / (box × DPR))`, floor 4), so "crystal
clear at max zoom" holds by construction on devices we cannot test here.

Measured by driving the Zoom-in control to the ceiling and reading the matrix:

| device | tier served | source px per device px at the ceiling |
|---|---|---|
| 390 @ DPR 3 (phone) | 6144 | 0.65 → **1.000** |
| 834 @ DPR 2 (tablet) | 8192 | 0.68 → **1.000** |

Cost, and only on first open of the lens: phones 0.92 → 1.95 MiB, ≥768
1.95 → 3.25 MiB.

*Judgement call:* the phone **WebP** fallback stays at 4096 rather than 6144 —
pushing 3.07 MiB of WebP at a non-AVIF phone over cellular is worse than the
status quo, and the AVIF path (what any phone able to run this actually gets)
is already 1:1. **Revert:** point the `<img src>` at the 6144 WebP.

### 4.3b + 4.5 · The doubled rule under the menu's X (V13-07b / V13-09) — `2b6c342`

One bug, both your numbers. Reproduced first by pixel scan, opened **by
keyboard** so the focus state fires:

```
before   cssY  0.0  #80412b   panel border
              57.0  #80412b   close-row border
              61.0–62.5  #f26835   ← the second line you saw (clipped ring)
```

It is not two borders. It is one focus ring with its top and sides clipped off
by the panel's own scroll box. An inward ring never leaves that box. Measured
after, on the `/map` panel's focused link: a complete 2px rectangle, top at
y1–3 and bottom at y13–15 of a 16.2px box whose 12px text sits at y4–12.5 —
unclipped, and clear of the glyphs. Contrast 5.23:1.

Neither border was removed and the close row's border was not re-tokened:
**once the ring is inward there is exactly one line under the X**, so your
"two sources, one token" instruction is satisfied by there no longer being two.

Full sweep of both panel variants across `/about`, `/people`, `/paintings`,
`/map` and a chapter, at 375×667 and 390×844, opened by keyboard and by mouse,
at both scroll extremes: exactly the expected rules and nothing else.

### 4.4 · The quote section on every chapter (V13-08) — `a30b4c8`

Why chapter 3 looked right and the others did not: the block was sized by
`fit-content`, so every chapter got a *different* width. A long quote (17em —
wider than any phone column) saturated to 100% with nothing left to centre,
while chapter 3's short one genuinely centred. One shared measure below 1024
fixes it, so all five present identically.

Both values were measured against HEAD's own line counts, not guessed:

| | 260px | 280px | 300px | 650px | **544px** |
|---|---|---|---|---|---|
| phone: hooks gaining a line | 5 (worst **+2**) | 2 (+1) | 1 (+1) | — | — |
| phone: margin each side | 38px | **28px** | 18px | — | — |
| tablet: hooks gaining a line | — | — | — | 0 | **0** |
| tablet: margin each side | — | — | — | 19px | **72px** |

280px phone / 544px tablet. 544 is not a taste call — it is the quote's own
17em measure, and already the width three of the six hooks resolved to, so it
brings the outlier into line rather than dragging the rest out to meet it.

After, all five chapters agree at every width: 360→280 (m20) · 375→280 (m28) ·
390→280 (m35) · 430→280 (m55) · 768→544 (m72) · 1023→544 (m200).

**An honest limit you should know about.** You named chapter 3's phone
rendering as the correct look. It sat at 237px with **49px** either side. No
single shared measure reproduces that without wrapping the long quotes past
your own one-line limit — parity and that exact look are mutually exclusive
here. This ships parity, because that is what the item asks for. If you would
rather have chapter 3's exact margins and accept longer quotes running two
lines further, that is a one-number change.

**Desktop was not touched** — both rules live inside `max-width: 1023px`.
Verified anyway at 1024/1440/1920: the hook is left-set at its column's left
edge with `text-align: start`, and the (01) Listen … (04) Onward spine measures
220@40 / 276@136 / 276@376 — unmoved, as you required.

### 4.6 · The mobile paintings hall (V13-10) — `d097ea3`

Six sub-items, all closed.

- **"Scroll to Walk" now goes** once the walk starts. Nothing watched scroll
  before. At 390: present at railT 0, gone at 0.03 and 0.50. Tablet and desktop
  keep their copy, which carries the drag/tap instructions too.
- **Face forward** sat mid-screen at cy 188 against Skip's cy 40. It now
  measures **cy 40 exactly**, right edge at the `--ui-inset`.
- **The drawer's top padding equals its left padding** — 20/20 on a phone,
  40/40 at 768.
- **The counter sits centred above the dots** at every width; centre-to-centre
  with the dot rail measures **−0.01px**.
- ***Rushing the Room*** — see below.
- ***Martin Felled by Axe*** — see below.

**Rushing the Room was never about that painting.** Nothing exited approach on
scroll *at all*: the exit had exactly three call sites, all of them deliberate
user actions, and the observer only stopped the render loop — so the drawer
stayed mounted wherever the page went. Index 8 is merely where you *notice* it,
because the rail's arithmetic leaves it almost no runway. The fix is
index-agnostic: approach exits when the stage un-pins. Verified on **all ten
works at 390 and 768 — approach, one flick past the wrap, drawer gone, page
clear: 20/20.** The check asserts the drawer *opened* first, so it cannot pass
by never opening.

***Martin Felled by Axe* was worse than you could see.** On a portrait tablet
its frame top measured **3.32 against a 3.2 ceiling — 12cm through it.** Its
height is now *derived* from the ceiling (`yC === CEIL_Y / 2`) rather than
authored, which is what makes your "never" hold:

| viewport | ceiling | before | after |
|---|---|---|---|
| phone portrait | 3.2 | 1.80 | **1.60** |
| tablet portrait | 3.2 | 1.90 (frame 12cm through the ceiling) | **1.60** |
| phone landscape | 4.2 | 1.80 (30cm low) | **2.10** |
| desktop | 4.2 | 1.90 (20cm low) | **2.10** |

**The other nine were measured and deliberately left.** Their frames run
0.53–2.87 in every orientation — never near ceiling or floor — and 1.70 sits
15cm above the 1.55 eye, which is the museum's own hanging line. Only the
portrait work was ever wrong. Moving the rest would move the whole hall, which
is not what you asked for.

**"All other interaction and behavior should stay the same"** — your words, and
the real risk here. `qa:hall` was run after *every* sub-item, geometry last,
and reported **32 of 32 at every step**. The final sweep is **0 failing of 51**
(the original 32 plus 19 new checks, kept in a separate tally so either set
regresses legibly).

### 4.7 · The mobile menu's secondary-nav gap (V13-11) — **no change, by your own rule** — `2b6c342`

You wrote: *"If reducing that one gap alone is not enough to fit all four items
above the fold on a standard mobile viewport, stop and do not make the change."*

It is not enough. Measured three times independently:

| viewport | ABOUT vs the fold | verdict |
|---|---|---|
| 375×667 (headless) | clears by 12.18px | fits |
| 375×640 | 15.01px below | reachable |
| 375×600 | 55.20px below | **unreachable** |
| **375×553 — real iPhone SE with Safari chrome** | **102.46px below** | **unreachable** |
| 375×477 — same, lower bound | 178.87px below | **unreachable** |

The gap is 18.2px and three of them sit above ABOUT, so **zeroing it entirely
buys 54.7px** against the 102–179px a real iPhone SE needs. Break-even is
**dvh ≈ 659**; an SE with Safari's chrome gives you 477–553.

Every compensation that *would* close it — shrinking the chapter list,
tightening panel padding, reducing type, moving the divider — you forbade by
name. So the menu is untouched and the measurement is the deliverable.

---

## Found outside the eleven — reported, not fixed

Per your scope lock, these were left alone.

1. **The hall's render loop stays dead after a curtain transition.** A `covered`
   flag is set on the curtain event and never reset, so the loop does not
   restart.
2. **Two counters disagree by one** on the current work — benign; it only runs
   the texture preloader one work ahead of the dot rail.
3. **At ≥1024, when you look away the chip row still renders but its only child
   is hidden**, so the wayfinding text vanishes while you are looking around.
4. **`tier2-tmp.mjs` is stray build scratch** committed at the repo root in v12.
   Harmless, but it is not a source file and does not belong there.
5. **Under `prefers-reduced-motion` the whole 3-D hall is disabled** and the
   static fallback renders. Worth knowing before anyone tries to test the hall
   in that mode — it is by design, not a bug.
6. **The 1858 lens has no focus trap** (pre-existing): a fifth Tab past "Back
   to today" leaves the viewer and lands on the chapter links behind the map.
7. **`public/media/site/troy-1858-full-4096.avif` is now unreferenced** by the
   AVIF path and could be pruned; media was not touched.
8. **`api.mapbox.com` is blocked by this container's proxy**, so the QA console
   log shows tunnel errors on map-bearing pages. Not application code; it will
   not appear on a real network.

## Instrument notes worth keeping

Two false greens were caught during this round and both are now recorded in
`docs/RUN-STATE.md`:

- **`qa:contrast` and `qa:rag` default to port 4321.** Run against a preview on
  any other port, every route returns connection-refused *and the script still
  prints "0 failures"*, because it only counts failures among routes it reached.
  Always check the **"0 unmeasured"** tally, not the headline. `qa:hall` had the
  same hard-coded port and now takes `--base`.
- **`elementFromPoint` cannot see `pointer-events: none` elements.** Both the
  chrome-tint strips and the walk rail are inert, so a stacking proof built on
  it reports the section underneath and proves nothing. Sample pixels instead.

---

## THE ONE THING I NEED FROM YOUR PHONE

**Everything else in this round is closed from here. This is not.**

**Why it cannot be closed here.** Headless Chromium in this container reports
**zero** safe-area insets and **has no address bar at all**. The black bars you
photographed are drawn by Safari and Chrome themselves, outside the page. There
is no instrument in this container that can see them. Every other claim in your
4.2 was testable and was tested; this one genuinely needs a device.

**What shipped anyway.** Not a guess deferred to you — a real, measured fix.
v12 established that Safari 26 parses `theme-color` and *ignores* it, tinting
its bars from the `<body>` background plus whatever fixed element sits against
the viewport edge. v12 shipped two 2px strips to give that sampler the right
colour; they were being painted over by the map and museum stages on exactly
the two routes your screenshots came from. That is fixed. **It may already be
gone.** Please check before recording anything.

### What to capture

**One screen recording per browser — three in total:**

- **iOS Safari**
- **iOS Chrome**
- **Android Chrome** (if you have a device to hand; if not, say so and we treat
  it as untested rather than passing)

**In each recording, visit these three routes:**

1. `/map`
2. `/paintings`
3. any one chapter (e.g. `/bakery`)

**For each route, please:**

- **Start in the DEFAULT UNSCROLLED STATE** — this is the crucial part. The
  bars are only visible *before you scroll*. Load the page and hold still for
  two seconds before touching anything.
- **Keep the URL bar visible.** Do not scroll it away before recording.
- Then scroll down a little, so I can see whether the bar colour changes as the
  page moves under it. That single detail tells us which surface Safari is
  sampling, which is the thing I cannot determine from here.

**Also do it on a tablet if you have one.** You asked "and tablet, if it
applies" — that needs a device to answer, and I could not.

**And please tell me:**

- **device model** (e.g. iPhone 15 Pro)
- **OS version** (e.g. iOS 26.1)
- the **browser version** if it is easy to find

### What I will do with it

If the bars are gone: the item closes and nothing more is needed.

If they survive, the recording tells us which surface the browser is sampling —
the body ground, a fixed element, or something else — and that is a targeted
fix rather than another round of guessing. The reason I want the *scroll*
included is that a bar which changes colour as the page moves is sampling
page content; one that stays fixed is sampling the body. Those are different
bugs with different fixes, and the recording distinguishes them in about two
seconds of footage.

### One thing worth knowing either way

Safari and Chrome only collapse the URL bar when **the document itself
scrolls**. I checked whether this site prevents that — it does not: the map
shell is `height: 100dvh` with no overflow lock, and the document scrolls
normally, so the toolbar does retract. Your note about a fixed `100vh` shell
was a reasonable suspicion; it just is not what this site does.

If what you actually want is a genuinely chrome-free full screen at the plaques
— no URL bar at all, outdoors, in sunlight — that is not something any web page
can demand. It requires the **Home Screen install path** (Share → Add to Home
Screen), which the meta tags already support. That is a product decision rather
than a bug, so I have not acted on it; say the word if you want it pursued.
