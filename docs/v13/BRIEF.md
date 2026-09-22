# v13 — Wil's 8/26 round (eleven items)

*Work order for the next session. Planned 2026-08-26 against HEAD `277262c`.
Ledger: `docs/v13/AUDIT.md`. Report: `docs/v13/REVIEW-GUIDE.md`. House protocol
and the traps that will otherwise cost an hour each: `docs/RUN-STATE.md`.*

## Context

Wil sent an eleven-item list after reviewing the v12 deploy (`277262c`, deployed
successfully 2026-08-26 04:37 UTC to GitHub Pages). The list is a scope lock, not
a wish list: *"You're not allowed and must not change or edit anything that is not
on this list. Everything else on the website must stay the same."*

Before planning, three read-only sweeps measured the actual code at HEAD. They
changed the shape of four items materially:

| item | his diagnosis | what is actually true |
|---|---|---|
| 4.2 black bars | "`/map` ships viewport without `viewport-fit=cover`, lacks four mobile-web-app metas" | **False on every count.** All twelve built routes carry one byte-identical head block *including* `viewport-fit=cover`. `Base.astro` is already the single source and has no head slot, so no page *can* override it. Five of the six controls he lists already resolve safe areas through `--ui-inset`. |
| 4.3b / 4.5 doubled rule | "two stacked borders, one token one hardcoded" | **Reproduced — but it is a clipped `:focus-visible` outline.** `Menu.astro:164` focuses the close button on open; its 2px `#f26835` ring at `outline-offset: 3px` has its top and side segments clipped by the panel's `overflow-y: auto`, leaving only the bottom segment 3.1px under the real border. Chromium's mouse heuristic hides it; WebKit's does not — which is why he sees it and QA did not. |
| 3 Part-2 hero seam | "styling differs somehow" | **One value.** Hero 1's bottom scrim ends at opaque `rgb(29,20,17)` — exactly the page ground. Hero 2's ends at `rgba(29,20,17,.95)`, so 5% of painting-over-`#100a06` bleeds at the boundary and reads as a band. |
| 4.7 menu spacing | "tighten the gap so all four fit" | **His own stop-condition fires.** Break-even is `dvh ≈ 656`. On a real iPhone SE (dvh ≈ 477–553 with Safari's chrome) ABOUT is ~103px below the fold and zeroing the gap recovers only 48px. Per his instruction the answer is to leave the menu alone — but *prove it with numbers first*. |

Items 4 and 4.4 he reports as "not implemented" while viewing the current deploy.
The v12 code for both is demonstrably live. The plan treats them as live defects
and identifies *why* the shipped fix does not read as he expects — for item 4 the
v12 feather dissolves the top and bottom 24% of the plate, which shows **less**
picture, the opposite of what he asked for.

**One caution about his evidence.** Two of the five screenshots he supplied are
stamped **Tue Aug 25, 1:07 / 1:11 AM** — a full day before v12 deployed. The
desktop hall shot proves it: its plaque reads `LOCATION 05 / PETER BALTIMORE'S
BARBERSHOP / 2`, which is the **v11** composition; v12 replaced that with the
official title (*Martin Felled by Axe*) and dropped the variant line. So some
complaints are against a build that no longer exists. This does not weaken the
list — the "Location NN" eyebrow he wants gone is still there at HEAD, and so is
every other target — but **the executor re-measures each complaint against HEAD
before changing anything**, and the review guide tells him which shots predate the
round.

Outcome: eleven items fixed, nothing else touched, every claim re-measured on the
instruments before and after.

## Coverage map — his numbering → this plan

| his # | what he asked | here |
|---|---|---|
| 1 | 1858 map → map page transition jittery | V13-01 |
| 2 | desktop cards: equal gaps, ends not clipped, nothing else changed, tablet/mobile untouched | V13-02 |
| 3 | Ch2 Part-2 hero must blend like Part 1 | V13-03 |
| 4 | Historical Context: more image top+bottom, slightly larger, no black flash, subtle scroll effect (1.00→1.03 + translateY, reversible), feather the harsh white lines | V13-04 |
| 4.1 | drop "Location NN" from the plaque (all three form factors), keep the location button after the hall, tap = still/alive switch, desktop chip centred with Skip on its left | V13-05 |
| 4.2 | black bars top/bottom on mobile (and tablet) site-wide; viewport + mobile-web-app metas consolidated; safe-area padding on six named controls; real-device verification; the `100vh` note | V13-06 |
| 4.3a | 1858 plate blurry at max zoom on mobile/tablet | V13-07a |
| 4.3b | doubled rule under the menu's X; check the rest of the overlay; match the MAP → rule; one token | V13-07b |
| 4.4 | quote section: desktop left-set, mobile/tablet left-aligned but centred, all chapters, spine untouched | V13-08 |
| 4.5 | two orange lines below the X — replicate and fix | V13-09 (same bug as 4.3b) |
| 4.6 | mobile hall: chip on scroll, Face forward top-right on Skip's axis, drawer top padding, counter above the dots, *Martin Felled by Axe* centred everywhere, *Rushing the Room* stuck drawer | V13-10 a–f |
| 4.7 | mobile menu secondary-nav gap — with his stop-condition | V13-11 |
| — | model + effort, kickoff prompt, plan committed as an `.md` | end of this document |

---

## Ground rules

- **Branch.** Work on `v2` (`git checkout v2`), push `v2` (deploys fire from `v2`
  only), mirror every push to `claude/paintings-hall-museum-fixes-qufa6x`. Never
  touch `main`.
- **Atomic item** = implement → re-measure → commit → update `docs/RUN-STATE.md`.
  Push every ≤3 commits; confirm the deploy Action concluded success for that
  exact SHA.
- **Scope lock.** Nothing outside the eleven items. Where a real bug is found
  outside them (three are listed in "Found but out of scope"), report it in the
  review guide; do not fix it.
- **Non-negotiables** (CLAUDE.md): a `prefers-reduced-motion` variant for every
  animation; keyboard reaches everything and focus stays visible; 375px works;
  tap targets ≥24px; Kathy Sheehan's prose untouched; `withBase()` for every URL.
- Read `docs/RUN-STATE.md` § "v12 TRAPS WORTH KEEPING" before running any
  instrument. In particular: `astro preview`, not `astro dev`, for edge sampling;
  the island 504 after editing `Museum.tsx`/`TroyMap.tsx`; api.mapbox.com is
  proxy-blocked (use the route-stub style, catch-all registered FIRST).

---

## The items

### V13-01 · The 1858 lens → map transition is jittery (his #1)

**Root cause (measured, not guessed).** The `<figure>` is a flex column holding
the lens box (`flex: 1`), the caption, and the "Back to today" button
(`min-height: 44` + `mt-6` = 68px). `setLens(false)` unmounts the button in the
same commit that starts the fade, so `flex-1` absorbs 68px in that layout pass,
the box grows 68px, and the `<img>` — anchored `top: 50%` of the box — jumps
**34px downward on the exact frame the fade begins**. Three aggravators ride
along: a 1600ms `transition-opacity` keeps a permanently `will-change`-promoted
layer (up to ~33M texels at scale 6 / DPR 3) alive and blending over the WebGL
canvas; the "See Troy in 1858" door remounts *immediately* with
`backdrop-filter: blur(6px)`, forcing a backdrop readback every compositor frame
of the fade; and `lensApply()` never re-runs, so the pan clamp is stale and the
plate fades out at whatever zoom it was left at.

**Fix** — `src/components/TroyMap.tsx` (~`:1442-1534`, `:246-316`, `:1632-1676`):

1. Add a `lensClosing` flag. Keep the shell's children — box, caption, **and the
   Back button** — mounted for the whole fade; unmount only on `transitionend`
   (with a timeout fallback). Zero layout change on the close frame.
2. Delay the remount of the map-chrome trio (chip, "Take the walk", 1858 door)
   until the fade has finished, so the `backdrop-filter` never composites over a
   live fading layer.
3. Drop the fade to `--dur-slow`'s intent but a workable length: **1600ms → 520ms**
   with the house `--ease`. Record it in `docs/v4/MOTION.md`; reduced-motion gets
   an instant swap.
4. Move `will-change: transform` onto the image only while a pointer gesture is
   active; clear it on settle.
5. Re-run `lensApply()` after the box settles (and reset pan/zoom to the opening
   pose on close, so a re-open is not inherited).
6. Fix the focus contract: return focus to the "See Troy in 1858" door instead of
   `.blur()`-ing it (`:315`), and flip `aria-hidden` only after focus has left.

**Acceptance.** A frame-by-frame capture of the close shows the image anchor
moving 0px (currently 34px). No layout shift on the close frame. Keyboard: door →
lens → Back → door round-trips with a visible ring at every step.

---

### V13-02 · Desktop chapter cards — equal spacing, ends not cut off (his #2)

**His screenshot (supplied) shows three separate faults at once**, and they are all
consistent with the code:

1. **Gaps are visibly unequal** — the space between *Commissioner's Office* and
   *Uri Gilbert Home* is roughly a third of the space between *Uri Gilbert Home*
   and the focused *Washington Street Ferry Landing*. v12's equalisation did not
   take.
2. **A sliced card at the right edge** — a narrow vertical sliver of the next
   card's painting, cut mid-image, is what "ends cut off" means.
3. **The focused card is not on the container's centre line** — it sits well right
   of centre despite keen's `origin: "center"`.

**The geometry that constrains any answer.** `.walk-slide` is 514.5px at ≥1024,
keen `spacing: 16`, `origin: "center"` → pitch 530.5px. Three whole cards need
≥1576px of container, so at **1280 and 1440 only one card can ever be whole**, and
cards may not be resized. So (2) is met by making the outermost partials **dissolve
into the ground rather than be sliced** — widen and re-ease the existing 28px edge
mask — not by trying to seat five whole cards.

**The real defect, which is fixable either way.** v12's gap-equalising `shift`
translates outer cards inward — but keen's own `.keen-slider__slide {
overflow: hidden }` clips them straight back. With `transform-origin: left bottom`
and `translateX(-41.16px)`, the second-and-beyond card on each side has **41.16px
of its own artwork guillotined** (it lands on the square painting thumbnail), and
the visual gap springs back to 16 + 41.16 = 57.16px — exactly the 16/57/57 v12 set
out to fix. Measured at 1440: N1 is cut by 26.6px at the viewport edge; at 1920
N2 shows 156 of 432px with its left 41px already gone.

**Fix**, in this order:

1. **Stop fighting the slide clip.** Equalise the gap by adjusting **keen's own
   spacing at ≥1024** (or by scaling about `center bottom` and compensating the
   layout gap) rather than by translating inside a clipped box, so no card loses
   artwork. Delete the `shift` accumulation once the replacement measures equal.
2. **Centre the focused card.** Assert the active slide's centre equals the
   container's centre at rest; if keen's `origin` is being defeated (rubberband
   overshoot, a settle that never lands, or the strip measured mid-animation),
   fix the settle rather than nudging with a transform.
3. **Treat the ends — two parts, because a fade alone is not enough.**
   (a) Add an anti-sliver rule: the strip must never come to rest showing a
   hairline of a card. At settle, if the outermost partial is narrower than a
   threshold (~25% of a card), it belongs fully outside the frame; otherwise it
   reads as a deliberate peek. (b) Widen the `.location-cards-slider` mask from
   28px to a ramp long enough that whatever peek remains dissolves rather than
   being guillotined, and ease it. `@media (min-width: 640px)` already scopes the
   mask away from phones; keep that boundary exactly.

**What must not move** — his 2.2, asserted rather than assumed. Before/after DOM
snapshot of a card's computed `width`, `height`, `padding`, `border-radius`,
`box-shadow`, `border`, `font-size`/`font-family`/`line-height` on every text
role, the thumbnail's box, the internal layout, and the `:hover`/`:focus-visible`
states — **at every breakpoint**, and byte-identical at 390 and 768. Everything
below 1024 is gated out (`window.innerWidth >= 1024`, already the pattern at
`:1238`).

**Acceptance.** At 1280/1440/1920/2560, settled (poll for `!animator.active` and
no drag): all inter-card gaps equal to ±0.5px; focused-card centre within ±1px of
the container centre; focused/neighbour scale exactly 1.000/0.920; no card's
painted box clipped by its own slide; the outermost partial's alpha reaches 0
before the container edge. Phone (390) and tablet (768) card geometry, scale and
peek identical to HEAD.

**Files.** `src/components/TroyMap.tsx:1157-1272`, `src/styles/global.css:1382-1408`.

---

### V13-03 · Chapter 2 Part-2 hero must blend like Part 1 (his #3)

**Root cause.** `src/pages/[chapter].astro`.

| | hero 1 (`:282`, `<header>`) | hero 2 (`:393`) |
|---|---|---|
| bottom scrim first stop | `rgb(29,20,17) 0%` — **opaque, and exactly `--color-primary-2`, the page ground** | `rgba(29,20,17,.95) 0%` — 5% of painting over `#100a06` bleeds through |
| remaining stops | `.8 26%` · `.36 48%` · transparent 64% | `.8 24%` · `.36 44%` · transparent 60% |
| top scrim | `rgba(29,20,17,.55)` → transparent 18% | `rgba(29,20,17,.6)` → transparent 16% |

Both sections already share `bg-neutral-2` and both are followed by a scene
section on the page ground, so the 5% bleed is the entire seam.

**Fix.** Make hero 2's two gradients string-identical to hero 1's. Nothing else
changes — the `sec` class, `h-[82dvh]`, `overflow-hidden` and the lockup all stay.

**Acceptance.** Pixel-sample the 8px band either side of both seams at 390 and
1440 on `/commissioners-office`: the max per-channel delta across the boundary
must match hero 1's (which is 0).

---

### V13-04 · Historical Context image (his #4) — all screens

**Why it reads as "not implemented".** v12 gave the plate a taller box
(`h-[70vh] md:h-[88vh]`), a cream ground (`--ground-light`, so no black flash),
and a mask feather. But the feather ramps to full transparency across the **top
24% and bottom 24%** of the plate — so "extend the blend" was implemented as
*dissolve more picture*, which is the opposite of "show more of the image top and
bottom". That is the defect to correct, and it is also why the section reads
smaller rather than larger.

**Fix** — `src/pages/[chapter].astro:509-542` and `src/styles/global.css:1003-1043`:

1. **Show more picture.** Shorten the feather ramp (24% → ~12% at each end, same
   two-stage easing so it stays soft) and grow the plate a step
   (`h-[70vh] md:h-[88vh]` → `h-[76vh] md:h-[94vh]`). Net visible artwork
   increases at both ends; the blend stays a blend, not a line.
2. **`object-position`, per his note.** The plate is `object-cover`, so a taller
   box re-crops it. Audit each of the five chapters' interlude plates at 375 /
   390 / 768 / 1024 / 1440 and set `object-position` per plate (the chapter JSON
   already carries a `heroFocus` idiom to copy) wherever the subject is losing its
   head or feet. Do not invent a focus value where the default already frames it.
3. **Black flash.** Already covered by `.painting-interlude { background: var(--ground-light) }`.
   Verify on a cold, throttled load at 390 that the first paint of the band is
   cream (`#f6f3ee`), and add `background: var(--ground-light)` to `.wipe-clip`
   inside the interlude so the clip box can never paint the body ground.
4. **Scroll effect, to his spec.** The v12 scrub is scale `1 → 1.055 → 1` with no
   translate. Retune to **scale 1.00 → 1.03 plus translateY ≈ −8px**, reversible
   on scroll-up (GSAP ScrollTrigger `scrub`, which is already reversible).
   `prefers-reduced-motion` keeps `transform: none`.
5. **Feather quality.** Keep the mask (a mask cannot introduce a second colour —
   v12 proved a dark ramp draws a 219-unit hard edge here); only its length
   changes.

**Acceptance**, at **375 / 390 / 768 / 1024 / 1440** ("across all screen sizes" is
his wording and is the acceptance bar): plate height and visible (unmasked)
artwork height both increase vs HEAD, measured per chapter. Cold-load first paint
of the band is cream at every width. Scrub peaks at 1.03 / −8px and returns to
1.00 / 0 on scroll-up. `transform: none` under reduced motion. No horizontal
overflow (`scrollWidth − innerWidth === 0`). Seam sample either side of the plate
shows no hard edge (the v12 dark-ramp attempt measured 219 units — the number to
stay far below).

---

### V13-05 · Hall drawer, tap switch, desktop chip (his #4.1)

**a. Remove the "Location NN" eyebrow from the plaque — desktop, tablet and
mobile.** The plaque has exactly two render sites and between them they cover all
three form factors: `src/components/Museum.tsx:1871` (the `!portraitUI` card —
desktop and landscape tablet) and `:1952` (the `portraitUI` sheet — phones and
portrait tablets). Remove it from both; the title moves up into its place (drop
the now-orphaned `mt-3` / `mt-2`). Applies to **all ten works** — the eyebrow is
generated from `pad2(plaque.order)`, so there is nothing per-painting to miss.
**Keep** `src/pages/paintings.astro:225` — that is the location *button* in the
grid below the hall, which he explicitly protects. Every other "Location NN" on
the site (map, chapters, nav, walk progress, where-to-next) is untouched; the
audit found eleven such sites and only these two change.

**b. The still ↔ alive switch — his answer: "Keep approach, fix the switch."**
Today `tap()` (`:1032-1046`) approaches from the rail, and once approached a tap
on that same painting calls `toggleAlive()`. The switch exists; what makes it feel
broken:

- `hitPainting()` requires an exact raycast hit on the canvas mesh, so taps near
  the frame edge or on the mat do nothing. **Fix:** in approach, treat a tap
  anywhere inside the approached work's projected rect (`paintingRect`, already
  computed at `:1481-1484`) as a toggle.
- The `.museum-alive-toggle` overlay is `pointer-events: none` by design (so
  swipes reach the stage) — keep that, but make its `aria-label` read from
  `stopped[i]`, not from `alive === approached`, so the announced state is the
  true state.
- No state feedback. Add the minimum that makes it read as a switch: a brief
  play/pause glyph that fades in on toggle and out after ~900ms (reduced-motion:
  appears and disappears without the fade). No persistent chrome.
- Confirm the tap gate (`dt < 300ms && moved < 8px`, `:1012-1018`) is not eating
  real taps on a phone; widen to 10px only if measurement shows it does.

`stopped[]` deliberately persists when you leave approach — a painting you
switched off stays off. That is correct switch semantics; keep it.

**c. Desktop chip centred with Skip on its left.** At ≥1024 the chip row is
`inset-x-0` + `justify-center`, so the pill centres on the **viewport**, while
Skip is an absolutely-positioned sibling at `left: var(--ui-inset)` in the same
40px band. v11 aligned them *vertically* (`min-height: 40px; align-items: center`).
**Measure first** at 1024/1280/1440/1920: the pill's vertical centre vs Skip's,
and the horizontal clearance between Skip's right edge and the pill's left edge
(at 1024 the ~575px pill leaves roughly 55px on the left against ~215px on the
right, which is what reads as "not centred"). If the vertical centres already
agree, say so with the numbers and change only the horizontal: centre the pill in
the band that begins at Skip's right edge, mirroring the same reserve on the right
so it stays optically centred. Nothing below 1024 changes.

**Files.** `src/components/Museum.tsx:1749-1780`, `1837-1845`, `1871`, `1952`,
`1032-1046`, `1161-1165`; `src/styles/global.css:1045-1063`, `1706-1717`.

---

### V13-06 · "Black bars" and the viewport metas (his #4.2)

**State the audit plainly, in the review guide and to him.** Every one of the six
claims is false at HEAD, with evidence:

- `grep -h -o '<meta name="viewport"[^>]*>' dist/*.html | sort -u` returns
  **exactly one** unique string across all twelve built routes:
  `width=device-width, initial-scale=1, viewport-fit=cover`. `/map` included.
- `/map` also ships `theme-color`, `mobile-web-app-capable`,
  `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style:
  black-translucent` and `apple-mobile-web-app-title` — byte-identical to home
  and the chapters.
- Every `<meta>` in the repo lives in `src/layouts/Base.astro`. Its only `<slot />`
  is at `:320`, inside `<main>`. **No page or component can inject a head tag.**
  The consolidation he asks for is already the architecture.

**What to actually do:**

1. **Lock it so it cannot regress** — his stated intent. Add an assertion to the
   QA suite (extend `scripts/` with a `qa:head` check, or fold it into an existing
   script) that fails the build if `dist/*.html` contains anything other than one
   identical viewport meta per document, `viewport-fit=cover` present.
2. **Close the three real safe-area gaps** — the only fixed chrome on the site
   whose offsets do *not* resolve through `--ui-inset`:
   - `.walk-rail` (`global.css:1501-1508`) sits at raw `top: 0` on every chapter
     page → `top: env(safe-area-inset-top, 0px)`.
   - `.skip-link` (`global.css:1849-1863`) lands under the notch when focused →
     same treatment on both axes.
   - The map's hint chip (`TroyMap.tsx:1575`) uses raw `bottom-44 / sm:bottom-32 /
     max-height:560 bottom-20` below `xl` → route them through `--ui-inset` the way
     the `xl:` branch already does.
   Deliberately raw and left alone: `.chrome-tint-*` (they exist to sit on the
   physical edge for Safari 26's sampler), the scrim, the curtain, `.lens-shell`,
   `.map-canvas`, the museum stage.
3. **Everything else on his list is already done**: "Take the walk", the
   "April 27, 1860" chip, the "See Troy in 1858" door, the hamburger, the chapter
   section-nav and the audio player all resolve `env(safe-area-inset-*)` through
   `--ui-inset` (`global.css:1581-1594`). Verify, report the line numbers, change
   nothing.
4. **His note about `100vh` + `overflow: hidden` is also wrong for this site** —
   `.map-shell` is `position: relative; height: 100dvh` with no overflow lock, and
   the document scrolls normally, so Safari's toolbar does retract. Say so.

5. **The strongest live hypothesis for the bars themselves — and it is testable
   here.** v12 established that **Safari 26 parses `theme-color` and ignores it**;
   it tints its bars from the `<body>` background, falling back to `<html>`, plus
   whatever fixed/sticky element sits against the viewport edge. v12 shipped
   `.chrome-tint-top` / `.chrome-tint-bottom` — two 2px fixed strips — to give the
   sampler the intended colour. **They carry `z-index: 0` and are emitted right
   after `<body>` opens (`Base.astro:265-266`), before `<main>`.** On any route
   whose content is a full-bleed positioned stage — `/map` (`.map-shell` +
   `.map-canvas`) and `/paintings` (the museum's sticky `h-dvh` stage) — that
   stage paints *over* the strips, so Safari samples the WebGL canvas instead of
   the intended tint. **Those are exactly the two routes his screenshots come
   from.** Fix: lift the strips above the full-bleed stages (raise their
   `z-index` clear of the map shell and the museum stage, keeping them
   `pointer-events: none` and 2px), then re-run `qa:bleed` against `astro preview`
   and confirm the sampled top and bottom bands are the intended colour on **all
   twelve routes**, at the default unscrolled position. This is a real, shippable
   fix, not a guess deferred to his phone.

**What still cannot be closed from here.** Headless Chromium reports no safe-area
insets and has no address bar, so the bar itself is unobservable in this
container. **Manual action for Wil** — one screen recording per browser (**iOS
Safari, iOS Chrome, Android Chrome**), on `/map`, `/paintings` and one chapter, in
the default unscrolled state, with the URL bar visible, **on a phone and on a
tablet** (he asks "and tablet, if it applies" — it needs a device to answer), plus
device model and OS version. If the bars survive the fix above, that recording is
what tells us which surface Safari is actually sampling.

---

### V13-07a · The 1858 plate is blurry at max zoom (his #4.3, first half)

**The arithmetic.** The `<picture>` splits on `min-width: 768px` only — **no DPR
term anywhere**. Max zoom is 6 (`TroyMap.tsx:264`).

| device | box | file served | 1:1 device pixels exhausted at | upscale at s=6 |
|---|---|---|---|---|
| 390×844 phone, DPR 3 | 350px | `4096` (0.92 MB) | s = 3.90 | **1.54×** |
| 834×1112 tablet, DPR 2 | 754px | `6144` (1.95 MB) | s = 4.07 | **1.47×** |

The code comment at `:1468` ("~2 source pixels per CSS pixel") is right about CSS
pixels and is exactly the bug: it never accounts for DPR.

**Fix.** The master is **23000 × 19267** (`masters/Stills/Historical/6. 1858 Map
of Troy New York.jp2`, readable with `opj_decompress`, aspect 0.8377 — it matches
`PLATE` exactly), so there is plenty of headroom.

1. Build a **8192-wide tier** (`troy-1858-full-8192.{avif,webp}`) from the master
   into `public/media/site/`, via the existing refresh script pattern.
2. Re-cut the `<picture>` so selection accounts for resolution: phones get
   **6144** (at DPR 3, 6144 / (350 × 6 × 3) = 0.975 ≈ 1:1); ≥768 gets **8192**
   (tablet DPR 2: 8192 / 9048 = 0.905). Record the byte cost in DECISIONS with a
   one-line revert.
3. Belt and braces: make the zoom ceiling **resolution-aware** — replace the hard
   `6` with `min(6, naturalWidth / (box.clientWidth × devicePixelRatio))` clamped
   to a floor of 4, so "crystal clear at max zoom" holds by construction on any
   device, including ones we cannot test.
4. Move `will-change: transform` off the permanent path (see V13-01 item 4) —
   iOS Safari is lazy about re-rasterising a permanently promoted layer this
   large, which softens the plate independently of the arithmetic.

**Acceptance.** At 390/DPR3 and 834/DPR2, source-px-per-device-px ≥ 0.9 at the
ceiling. Lens open→zoom-to-max→pan still ≥ 50fps in the stub harness. Bytes
recorded.

---

### V13-07b · The doubled rule under the menu's X (his #4.3 second half, and #4.5 — the same bug)

**Reproduced, with pixel evidence.** `/about` at 390×844, dpr 2, panel opened by
keyboard:

```
cssY   0.0  #7b3e29   panel border-top
cssY  57.1  #80412b   close button border-b        1px  --color-primary-7
cssY  61.2  #f26835   ← FOCUS OUTLINE              2px  --color-primary-9
cssY 431.1  #5d2f1f   .rule-top above MAP          1px  --hairline
```

Opened by mouse click the second line is absent — Chromium suppresses
`:focus-visible` there, WebKit does not. `Menu.astro:164` focuses the panel's
first focusable child; on the top-right variant that is the close button, which
takes the global ring at `global.css:1841-1844` (`outline: 2px solid
var(--color-primary-9); outline-offset: 3px`). Because the panel is
`overflow-y: auto`, the ring's top and side segments are clipped away and only the
**bottom** segment survives — 3.1px under the real border, brighter and heavier.
His description is exact; his diagnosis is not.

**Fix.** Scope an inward ring to the close button:
`.cnwm-menu-close:focus-visible { outline-offset: -3px }` (verify `#f26835` on
`#341a11` still reads — it does, by a wide margin). The ring stays fully visible,
nothing is clipped, and the doubled line disappears. **Do not** remove either
border and **do not** re-token the close row's `border-b`: once the ring is inward
there is exactly one line under the X, so the "two sources, one token" instruction
is satisfied by there no longer being two. Record that reasoning in DECISIONS.

**Both menu variants, not just the one he photographed.** `/map` mounts the panel
`bottom-right`, where the close button is the *last* child with `border-t` and
`querySelector("a, button")` therefore focuses the **Home** anchor instead —
measured producing its own clipped ring at cssY 28–29 and 52–53, i.e. the same
class of doubled line near the top of that panel. The inward-ring fix must be
scoped so it covers the close button in both positions **and** the first link,
i.e. any focusable child of a panel that clips its own overflow.

**"Check the same pattern isn't repeated further down the overlay"** — his words.
Scan the **entire panel height**, not just the top, in both variants, and enumerate
every rule found: expected is the panel border (top and bottom), one close-row
border, and `.rule-top` above MAP. Anything else is a finding.

V9-303's sticky-close fix is still working (verified by scrolling the panel to its
limit at 375×667 and 390×640) — leave it alone.

**Acceptance.** Full-height pixel-scan of the panel on `/about`, `/people`,
`/paintings`, `/map` and a chapter, at 375×667 and 390×844, opened **by keyboard**
and by mouse, at `scrollTop` 0 and at the scroll limit: exactly the three expected
rules and no others, and a focus ring still measurable on whatever child holds
focus. WebKit is where this reproduces — note in the guide that Wil confirms on
iOS Safari, iOS Chrome and Android Chrome.

---

### V13-08 · Quote section alignment on every chapter (his #4.4)

**Why chapter 3 looks right and the others do not.** Below 1024,
`.scene-hook` is `width: fit-content; margin-inline: auto` ([chapter].astro
`:943-953`). `fit-content` resolves to `min(max-content, available)`. Chapter 3's
quote is *"Are you a Negro?"* — its max-content is ~240px in a 335px column, so
the block genuinely centres. Every other chapter's quote is long, `.t-quote`'s
`max-width: 17em` at `--fs-quote: 26px` is 442px > the 335px column, so the block
resolves to 100% and there is nothing left to centre. **At tablet widths all five
already centre** (17em = 544px inside a 688px column) — this is a phone-only
divergence.

**Fix.** Give the hook one shared measure below 1024 instead of a per-chapter
intrinsic width, so every chapter presents identically:
`.scene-hook { width: min(100%, var(--hook-measure)); margin-inline: auto }`,
with `--hook-measure` set per breakpoint so the block is visibly narrower than the
column on phones. Text stays left-aligned inside the block; the hung indent stays
off below 1024. **Desktop (≥1024) is not touched** — the two-column `.editorial`
grid and its left-set hook are already what he asks for, and the
(01) Listen … (04) Onward spine (`.editorial > .rail`) is not in the selector path.

**Measure before choosing the number.** Record block width vs column width for all
five chapters at 360/375/390/430/768/1024/1440 before and after; the target is
that all five agree at every width and that phones show a visible, equal margin
either side. If the quote's line count grows by more than one line at 375, step
the measure back and say so.

**Acceptance.** Block-width parity across all five chapters at every width; the
spine's geometry byte-identical to HEAD; rag check (`qa:rag`) 0 runts / 0 clips at
360 and 390.

---

### V13-09 · duplicate of V13-07b

His 4.5 is the same bug as the second half of 4.3. One fix, one commit; the review
guide answers both numbers.

---

### V13-10 · Mobile paintings hall (his #4.6)

Six sub-items in `src/components/Museum.tsx`.

**a. "Scroll to Walk" disappears once scrolling starts.** Nothing in the React
tree watches scroll today — the chip renders on `ready && !inApproach` and is
visible for the entire walk. `railT` exists only inside the scene closure
(`:779`, `:833-845`); the only state `onScroll` writes is the integer `railIdx`.
Add a boolean (`walkStarted`, set when `railT` crosses ~0.01, cleared at 0) and
gate the **mobile** chip on it. Desktop/tablet copy unchanged.

**b. Face forward top-right, vertically centred with Skip.** The phone instance
currently *replaces* the chip inside the centred chip row (`:1757-1771`). Mount it
instead at `top: calc(var(--ui-inset) + env(safe-area-inset-top)); right:
var(--ui-inset)` — the same anchor the desktop instance already uses at
`:1781-1795` — so it lands on Skip's axis at top-right. Keep the `lg:hidden` on a
bare `<span>` (`.btn-sm`'s unlayered `display: inline-flex` beats a layered
utility — the comment at `:1758-1761` is load-bearing). Per his last sentence, if
the drawer is open and the top-right anchor would collide, leave the button where
it is in that state.

**c. Drawer top padding matches its left padding.** The header is
`px-[var(--ui-inset)] pt-3 pb-3` (`:1904`) — 20px at the sides, **12px** on top.
Take `pt-3` → `pt-[var(--ui-inset)]`. This grows the header by 8px, so re-derive
the two constants that encode header height: the sheet's `maxHeight: "55dvh"`
(`:1900`) and the body's `maxHeight: "calc(55dvh - 118px)"` (`:1958`) — 118 already
matches neither the measured peek (~78px) nor full (~144px) header, so measure both
states and set them from the measurement rather than nudging the literal.

**d. The counter (1/10) centred above the dots.** Today it is inline inside the
centred flex row (`:1995`, `gap-4`), which pushes the dot list off centre by half
the counter's width, and it is `hidden sm:block`. Restack the nav to a column so
the counter sits centred **above** the dots, and show it at every width.
*(DECISION, one-line revert: if he wants phones to stay countless, restore
`hidden sm:block` — the layout change stands either way.)*

**e. "Martin Felled by Axe" vertically centred on the wall.** His ruling:
*"Center it on the wall so that it never appears to be on the ceiling or the
floor."* The wall runs `y ∈ [0, CEIL_Y]` and every part of a work is centred on
`yC`, so this is `yC === CEIL_Y / 2`.

| viewport | CEIL_Y | current `yC` | required | note |
|---|---|---|---|---|
| portrait, phone | 3.2 | 1.80 | **1.60** | 20cm too high |
| portrait, **not** phone (tablet) | 3.2 | 1.90 | **1.60** | **frame top is 3.32 — it currently goes 12cm through the ceiling** |
| landscape, phone | 4.2 | 1.80 | **2.10** | 30cm too low |
| landscape, desktop | 4.2 | 1.90 | **2.10** | 20cm too low |

Two things must change for "always" to hold. First, derive the portrait work's
`yC` from `CEIL_Y` (`:646`). Second, the room is built once — the scene effect's
deps are `[capable, works]` (`:1657`) — so `CEIL_Y`, `CH` and every placement are
frozen at the orientation the hall was built in and **rotating the device does not
re-hang anything**. Put each work's meshes into a `THREE.Group` positioned at
`(x, yC, z)` with children at offsets relative to `yC`, so `onResize`
(`:1540-1545`) can re-hang on an orientation flip with a single `group.position.y`
write alongside the ceiling/corridor update. Measure the other nine works and
**report** their numbers; change them only where a measurement shows they read
high or low, and record any such change in DECISIONS.

**f. "Rushing the Room" leaves the drawer stuck and lets the page scroll on.**
Root cause found: **nothing exits approach on scroll.** `setApproached(null)` has
exactly three call sites — Escape (`:1391`) and the two "Back to the hall" buttons
(`:1828`, `:1882`). The `IntersectionObserver` at `:1493-1497` only stops the
render loop; the React tree keeps the drawer mounted wherever the page goes. It is
reachable from any work; index 8 is where you *notice* it, because the rail's own
arithmetic leaves it almost no runway: `railZ()` travels +0.4 → −50.7, work 9 sits
at −50, so index 8 holds railT 0.840–0.937 and index 9 gets a **truncated** band
(6.3% of the scroll instead of 9.8%). Approach *Rushing the Room* and only ~56–144vh
of rail remains; one flick exhausts it, the sticky stage un-pins, and the page runs
into the next section with the drawer still open.

**Fix (index-agnostic, which is the point):** leave approach automatically when the
stage un-pins — extend the existing scroll/IO path so that `r.top > 1 || r.bottom
< H - 1` beyond a small threshold calls `approach(null)`. Then close the scroll
paths that approach never blocked: `touch-action: none` on the overlaid "Back to
the hall" button (`:1822-1832`), and handle Space / PageUp / PageDown / Home / End /
ArrowUp / ArrowDown in the approach branch of `onKey` (`:1381-1408`) instead of
letting them fall through to the browser. **Do not** change `OVERRUN` or the slot
height — v9 locked "the hall ENDS ON THE LAST PAINTING" and lengthening the rail
would walk the visitor past it into blank wall.

**Acceptance.** Extend `npm run qa:hall`: approach each of the ten works at 390 and
768, flick to the bottom of the wrap, assert `approached === null` and the sheet
unmounted; assert the page never leaves the wrap with a drawer open; assert the
portrait work's frame top ≤ `CEIL_Y` and `|yC − CEIL_Y/2| < 0.01` in both
orientations; assert the chip is gone once `railT > 0.02` on mobile and present at
`railT === 0`; assert Face forward's box is right-aligned and shares Skip's
vertical centre at ≤767; assert the drawer's `padding-top` equals its
`padding-left` in the peek state; assert the counter's centre is on the dot rail's
centre.

**"All other interaction and behavior should stay the same"** — his words, and the
biggest risk in this item, since (f) adds a new exit path and (e) re-parents every
mesh. The existing 32 `qa:hall` checks must all still pass unchanged: scroll →
walk, drag → look, tap → approach, dot → approach, Esc → back, Back button → back,
the sheet's three positions and its drag/swipe/wheel state machine, the alive
window, draw calls ≤ 80, and retrace. Run them before the item and after every
commit inside it.

---

### V13-11 · Mobile menu secondary-nav spacing (his #4.7)

**Measured, and his own stop-condition applies.** Content is 647.91px against a
panel capped at `100dvh − 2 × --ui-inset` (i.e. `dvh − 42`). ABOUT's bottom sits at
content-y 613.91 at every width. **Break-even is `dvh ≈ 656`.** Each 1px removed
from `space-y-4` lifts ABOUT by 3px (three gaps).

| viewport | ABOUT | gap needed |
|---|---|---|
| 375×667 (headless) | clears by 11.09px, but the panel still scrolls 21px | 16 → 9 to remove the residual scroll |
| 375×640 | 15.91px below fold | 16 → ≤10.7 |
| 375×600 | 55.91px below fold | 16 → ≤2.6 |
| **375×553 (real iPhone SE with Safari chrome)** | **102.91px below fold** | **unreachable — zeroing the gap recovers only 48 of 102.91px** |

**Therefore: measure, then leave the menu as it is.** He wrote: *"If reducing that
one gap alone is not enough to fit all four items above the fold on a standard
mobile viewport, stop and do not make the change — revert it and leave the menu
as-is with the scroll."* On a real iPhone SE it is not enough, and the compensations
that would work (shrinking the chapter list, tightening panel padding, reducing
type, moving the divider) are all forbidden by name.

The executor must still **run the measurement on real dvh values** (not the raw
device height — iOS Safari's chrome takes ~190 CSS px, see RUN-STATE), publish the
table, and only then close the item as "no change, by his rule". If the numbers
come out differently from the table above, the rule — not the table — decides.

---

## Found but out of scope — report, do not fix

1. `covered` is set to `true` on `cnwm:curtain-cover`/`pagehide` and **never reset**
   (`Museum.tsx:1506-1511`), so the hall's render loop stays dead after a curtain
   transition (`:1417`).
2. `onScroll` and `tick()` disagree by one on the current work
   (`:837` has `- 1`, `:1427` does not) — benign, it only runs the texture
   preloader one work ahead of the dot rail.
3. At ≥1024, when `lookedAway` is true the chip row still renders but its only
   child is `lg:hidden`, so the wayfinding text vanishes while the visitor looks
   around.

---

## Verification

Per item, before and after, on `astro preview` (never `astro dev` for edge
sampling):

- `npm run qa:rag`, `qa:contrast`, `qa:a11y`, `qa:museum`, `qa:hall`, `qa:bleed`
- `npx tsc --noEmit` and `npm run build` clean; the six island-CSS guards hold
- `node scripts/perf.mjs` — Lighthouse mobile ≥ 90 perf / ≥ 95 a11y, LCP < 2.5s
- New/extended probes: the head-meta assertion (V13-06), the hall stress additions
  (V13-10), the lens close-frame capture (V13-01), the card-gap sweep (V13-02), the
  hook-width parity sweep (V13-08), the menu pixel scan opened by keyboard (V13-07b)
- After each push: confirm the deploy Action concluded success for that exact SHA

**What cannot be verified here** (goes to Wil, listed in the review guide): the iOS
browser-chrome bars, real safe-area insets (Chromium reports 0), real frame pacing
in the hall (SwiftShader), and Mapbox tile visuals (api.mapbox.com is
proxy-blocked).

---

## Execution order

By group (see "Execution model"), one at a time, because concurrent instruments
corrupt each other:

0. **G5** (Haiku) — hand off the 8192 plate build first; it touches no `src/` file
   and runs no browser, so it can build while G1 works.
1. **G4** (Sonnet · high) — V13-07b/09 → V13-06 → V13-11. Cheapest band, closes
   four of his numbers, and proves the commit/push/deploy loop early.
2. **G3** (Sonnet · high) — V13-03 (one value) → V13-04 → V13-08. All three share
   one chapter-page instrument.
3. **G2** (Opus · high) — V13-05a → V13-05c → V13-05b → V13-10 a–d → V13-10f →
   V13-10e. The re-parenting (10e) goes last so the 32 hall checks are green
   under every other change before the geometry moves.
4. **G1** (Opus · high) — V13-01 → V13-07a code (its `will-change` change rides on
   01) → V13-02. Fold in G5's tiers when they land.
5. `docs/v13/REVIEW-GUIDE.md`, then RUN-STATE.

---

## Manual actions for Wil

1. **Device evidence for the black bars** (V13-06) — the one thing that cannot be
   closed from here: one screen recording each on iOS Safari, iOS Chrome and
   Android Chrome, on `/map` and one chapter page, in the default unscrolled
   state, URL bar visible, plus device model and OS version.
2. **Nothing else.** Every other item is closable from here. The card-rail
   screenshot has landed and V13-02 is unblocked.

---

## Execution model — which model, at what effort, on which part

Wil is at ~90% of his weekly usage limit. A single Opus-at-max session over eleven
items would work but is the wrong shape, for a concrete reason: **the cost here is
dominated by how many times the three big files get re-read**, not by the model
tier. `Museum.tsx` (~2,000 lines), `TroyMap.tsx` (~1,800) and `global.css`
(~1,900) are touched by nine of the eleven items. Eleven independent agents would
each pull those in again.

So: **group the work by FILE, not by item.** Each group reads its file once and
closes every item that lives in it.

### The groups

| # | group | items | files it owns | model · effort |
|---|---|---|---|---|
| **G1** | The map island | V13-01, V13-02, V13-07a *(code half)* | `TroyMap.tsx`, the rail/mask block in `global.css` | **Opus 5 · high** |
| **G2** | The hall island | V13-05a/b/c, V13-10 a–f | `Museum.tsx`, the museum block in `global.css` | **Opus 5 · high** |
| **G3** | The chapter pages | V13-03, V13-04, V13-08 | `[chapter].astro`, the interlude/quote blocks in `global.css` | **Sonnet 5 · high** |
| **G4** | Chrome, head and menu | V13-06, V13-07b/09, V13-11 | `Base.astro`, `Menu.astro`, the chrome/menu blocks in `global.css` | **Sonnet 5 · high** |
| **G5** | The 8192 plate | V13-07a *(media half)* | `scripts/`, `public/media/site/` — **no app code** | **Haiku 4.5** |

**Orchestrator: Opus 5 · medium.** It holds the scope lock, reviews every group's
diff before it lands, runs the shared instruments, commits, pushes, confirms the
deploy, and writes the review guide. Medium rather than max because the hard
thinking is already done — this brief carries the root cause for all eleven items,
so no group has to re-derive any of it. **That analysis is the round's biggest
saving and it is already paid for.**

### G1 and G2 get Opus for a reason

Both are multi-hundred-line changes inside hydrated islands where a wrong edit is
invisible until a probe catches it: keen-slider's internal geometry and a
transition lifecycle in G1; a three.js re-parenting plus a new approach-exit path
in G2. G2 also has to preserve 32 existing behavioural checks while changing how
every mesh is positioned. G3 and G4 are CSS and markup with the mechanism already
named to the line — Sonnet does that well and cheaply.

### They must run SEQUENTIALLY, not in parallel

Two constraints in `docs/RUN-STATE.md` make concurrent groups actively dangerous,
not merely wasteful:

- **One Playwright process at a time** in this container.
- **Never edit `src/` while an instrument runs** — HMR reloads mid-measure produce
  phantom readings, which has already cost this project two false bug hunts.

Two groups editing and measuring at once will corrupt each other's numbers and burn
usage chasing ghosts. Run **G1 → G2 → G3 → G4** in sequence (or any order; the
groups are independent). **G5 is the one exception** — it touches no `src/` file
and runs no browser, so hand it off first and let it build while G1 works.

### Cheap vs expensive, stated plainly

- **Nearly free**: script runs, the image build, Lighthouse, instrument runs — wall
  clock is not usage. Let the long ones run.
- **Expensive**: re-reading the big islands, and long debug loops inside them.

Two rules that follow: probes must print a **compact summary**, never dump files or
raw pixel arrays into the transcript; and reads of the three big files use
`offset`/`limit` against the line numbers this brief already gives, not whole-file
reads.

### If the budget runs short, cut in this order

Ship top-down; stop wherever the limit bites. Each band is a coherent stopping
point.

1. **Cheapest, closes five of his numbers** — V13-03 (one value), V13-07b + V13-09
   (one scoped CSS rule), V13-05a (the eyebrow), V13-11 (measure and close, ~no
   code). Mostly G3/G4 work.
2. **The two bugs he actually hit** — V13-10f (*Rushing the Room*), V13-10e
   (*Martin Felled by Axe*).
3. **Visible on every visit** — V13-02 (the card rail), V13-04 (Historical
   Context), V13-08 (the quotes), V13-06 (the bars).
4. **Polish and payload** — V13-01 (the lens transition), V13-07a (the 8192
   plate), the remaining V13-10 and V13-05 sub-items.

Whatever is not reached goes into `docs/v13/AUDIT.md` marked open, so the following
session starts from the ledger rather than from scratch.

---

## Deliverables

- **`docs/v13/BRIEF.md` — this file.** Committed to `v2` at planning time and
  mirrored to `claude/paintings-hall-museum-fixes-qufa6x`, ahead of any code
  change, so the executing session starts from disk rather than from a
  conversation. Docs-only: no `src/` file is touched, so the deploy it triggers is
  a no-op for the live site.
- `docs/v13/AUDIT.md` — the eleven-item ledger, each row closed with a commit SHA
- `docs/v13/REVIEW-GUIDE.md` — the item-by-item report, the numbers, the two
  DECISIONS with their one-line reverts, the three out-of-scope findings, and the
  human queue
- `docs/RUN-STATE.md` and `docs/v4/{DECISIONS,MOTION}.md` updated as work lands

---

## Kickoff prompt for the next session

> Read `docs/v13/BRIEF.md` and carry it out in full — all eleven items
> (V13-01 through V13-11).
>
> **Run it the way the brief's "Execution model" section says**: you are the
> orchestrator on Opus 5 at medium effort, and you delegate the code to five
> file-scoped subagents — G1 the map island and G2 the hall island on **Opus 5 at
> high effort**, G3 the chapter pages and G4 chrome/head/menu on **Sonnet 5 at
> high effort**, G5 the 8192 plate build on **Haiku 4.5**. Hand G5 off first — it
> touches no `src/` file and can build while G1 works. **Run G1–G4 strictly one at
> a time**: this container allows one Playwright process, and editing `src/` while
> an instrument runs produces phantom readings. You review every group's diff
> before it lands, run the shared instruments, commit, push and write the guide.
> I'm at ~90% of my weekly usage limit, so keep probe output to compact summaries
> and read the big islands by line range, not whole-file. If you run short, cut in
> the four-band order the brief gives and mark the rest open in the ledger.
>
> Work on `v2`: `git checkout v2`, develop on `v2`, push `v2` (that is what
> deploys), and mirror every push to `claude/paintings-hall-museum-fixes-qufa6x`.
> Never touch `main` — it is a different application.
>
> The brief is a scope lock. Wil wrote: *"You're not allowed and must not change
> or edit anything that is not on this list. Everything else on the website must
> stay the same."* Honour it literally. Where the brief lists a bug it found
> outside the eleven items, report it in the review guide and leave it alone.
>
> Four of the eleven items carry a client diagnosis that the code contradicts —
> the brief names each one with the evidence. **Measure before you touch
> anything**, including on items you expect to be already correct, and let the
> measurement decide. Two of his screenshots predate the v12 deploy, so re-verify
> every complaint against HEAD first. V13-11 is expected to close as "no change,
> by his own stop-condition" — but only after you publish the dvh table that
> proves it.
>
> Work autonomously to completion. One item = implement → re-measure → commit →
> update `docs/RUN-STATE.md`, as one atomic act; push at least every three
> commits and confirm the deploy Action concluded success for that exact SHA.
> A subagent's report is not evidence — the instrument output is. Re-run the
> shared checks yourself before you commit a group's work.
> Read `docs/RUN-STATE.md` § "v12 TRAPS WORTH KEEPING" before running any
> instrument — several of them will otherwise cost you an hour each.
>
> Hold the non-negotiables in `CLAUDE.md`: a `prefers-reduced-motion` variant for
> every animation, keyboard reach with visible focus, 375px, tap targets ≥ 24px,
> the Lighthouse budget, `withBase()` for every URL, and Kathy Sheehan's prose
> untouched.
>
> Finish with `docs/v13/REVIEW-GUIDE.md`: the item-by-item report with the
> before/after numbers, every judgement call and its one-line revert, the
> out-of-scope findings, and the one thing I have to check on my own phone (the
> browser-chrome bars — tell me exactly what to capture).
