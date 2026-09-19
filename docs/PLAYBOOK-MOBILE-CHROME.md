# Playbook — mobile browser chrome, full-bleed stages, and how `/map` was fixed

*Written 2026-09-18 at the close of client rounds 19–21, when Wil signed off
the map page ("Looks and works great. I think the map page's edits are
complete."). This is the record of what worked, what did not, and the rules
that transfer to other pages. Every number here was measured, on his iPhone
(iOS 26 Safari, "Top" address-bar layout, 390×844 CSS px) or in this
container's Chromium; nothing is inferred. Read it before touching any
full-bleed stage, the bars' colour, or anything sized in viewport units.
Detailed history: `docs/rounds/2026-09-17-round-8-plan.md` (the bars),
`docs/rounds/2026-09-18-round-19-plan.md` through `-21-plan.md` (the map).*

## 1 · The geometry, measured on the phone

| At rest, bars expanded | CSS px |
|---|---|
| Top bar (status + address) — covers document offsets −107 → 0 | 107 |
| Visible page = layout viewport = `100svh` | 645 |
| Bottom toolbar — covers document offsets 645 → 737 | 92 |
| Screen = `100lvh` | 844 |
| `100lvh − 100svh` (the pair; CSS cannot report the split) | 199 |

- **`svh` holds still while the bars move. `dvh` and `window.innerHeight`
  do not** (645 at rest, 753 minimized). Anything sized or fitted from the
  moving pair re-lays out on every bar transition — that was the round-4
  scroll jitter, and the framing defect of round 19.
- **`env(safe-area-inset-bottom)` is 0 at rest and 34 minimized.**
  `--ui-inset` is a `max()` of the gutter and the four safe-area insets, so
  every corner control moves 14px on every bar transition. Site-wide design
  token; left as is (Wil's call if it ever reads as jitter).
- **The bars are glass.** In-flow content renders behind both bars once it
  exists there. A `position: fixed` or `sticky` box's overflow is clipped at
  the visual viewport and never reaches the bars (measured: 160px requested,
  21px rendered). So a stage that must show under the bars has to be
  **in flow** and **physically extend** under them.
- **Nothing exists above document offset 0.** At scroll 0 the top bar shows
  the fallback colour, whatever the page paints. The only way to put content
  under the top bar at rest is for the page not to rest at scroll 0.
- **Safari tints its bars from `<body>`'s `background-color`.** Not
  `<html>`, not `theme-color` (parsed and ignored), not an opacity-0 or
  off-screen element (not read). A live change of `<body>`'s colour moves the
  tint; removing the element that supplied a colour does not clear it. The
  page ground therefore lives on `<main>` (round 14), and `<body>` is free to
  carry whatever the bars should read.
- **Gate on CSS, never on the user-agent.** `@supports (-webkit-touch-callout:
  none)` fires on iOS even with Request Desktop Website on; `pointer` and
  `hover` queries do not survive desktop mode.

## 2 · The runway pattern (how `/map` paints under both bars)

The shell is `100svh + E + T` tall. `E = round(down, min(100lvh − 100svh,
20svh), 1px)` extends below the visible box (129 on his phone, ≥ the 92px
toolbar); `T = round(down, min(110px, 100lvh − 100svh), 1px)` extends above
it (110 against the 107px bar). Both are 0 wherever `lvh == svh` — every
desktop, Android, and any iOS without bars — so no width or UA query is
needed. The **UI layer keeps its original box** (`margin-top: T; height:
100% − E − T`), so every control anchored to it holds its screen position;
the **canvas** reaches `top: −T` and `bottom: −E`; the **camera takes T and E
back as padding**, so the framing the reader sees is unchanged; and the page
**lands at scroll T** (`map.astro`), with `history.scrollRestoration =
"manual"` and `scroll-behavior` forced to `auto` for the jump.

Three traps, all found in round 19, all transferable:

1. **Everything computed in canvas pixels must add T.** `map.project` /
   `map.unproject` are container pixels; a safe box or a centring target
   written in window pixels sits T too high, and an iterative fit then moves
   the group by T on every pass instead of converging and falls through to
   its blind fallback. That was Wil's "pins missing / wrong orientation".
   Rule: read positions from the box the reader sees (the UI layer's own
   `clientHeight`), never from `window.innerHeight`, and offset by T.
2. **A first child's `margin-top` collapses through parents with no border or
   padding** — through the shell, `<main>` and `<body>` — so all of them
   started T down the document once the island mounted. Invisible on the
   phone, but Chromium's scroll anchoring followed `<main>`'s edge and doubled
   the landing to 2T. `display: flow-root` on the shell keeps the margin
   inside it. Any runway built with a margin needs this.
3. **The runway is scrollable.** A flick to the top parks the page at 0, and
   every pre-existing `scrollTo(0)` in the island did the same. So: every
   programmatic scroll targets T (`landShell`); a scroll that settles above T
   re-lands (160ms after the last scroll event, never while a finger is down,
   smooth, a cut under reduced motion); `pageshow` re-lands; `orientationchange`
   re-lands after T changes. The one scripted scroll on the page, recorded in
   `docs/v4/MOTION.md`.

Accepted geometry: the camera under a taller canvas is not pixel-identical
to the flat one (pitch foreshortening), so pins move by up to ~10px between
T=0 and T=110. The invariant is "five pills inside the visible box, none
overlapping", not bit-identity.

## 3 · The bars' colour follows the section (round 21)

`Base.astro`'s edge sampler already resolves "what colour sits under each
edge" for the `theme-color` meta (Chrome for Android's fill). On `/map`
(`data-root-fill="map"`) it writes that colour to `<body>` inline: the map's
grey `#353535` while the map owns the screen, the ground's brown `#1d1411`
once the index does. Safari animates the change. `<body>` has one colour and
the bottom toolbar follows it too — the accepted cost of a section-tracking
bar. To give another page a tracking bar: gate the same write on that page's
attribute and accept the bottom bar's share of the transition band.

**Round 23 (2026-09-18).** The chapter routes (`data-top-bar="section"`)
track too, at his instruction, with the colour of the section at the TOP
edge (`sectionGroundAt`, which now counts `<main>` and `.ground-cream` blocks
as grounds). And because the minimized bar is glass over whatever the
document holds above the viewport's top edge — what has just scrolled past —
a tint alone leaves the content ghosting through it. The in-flow
`.edge-cover` (a 320px absolute box in the document, translated on every
scroll event so its bottom edge rides on the viewport's top edge, coloured
by the sampler) gives that glass a solid ground: the one place in-flow paint
reaches and fixed paint does not (§1). **Measured on his phone (device pass
1, 15:13): Safari composites the cover through the minimized pill** — the
region read the transcript's cream, solid — so in-flow paint ABOVE the
viewport's top edge reaches the bar region exactly as the runway's does
below it. A feathered edge does not help: through it the section above the
top edge ghosts in and the glass reads as a gradient, which he rejected; the
edge is hard by default (`?feather=<px>` softens it on the device,
`?cover=off` removes it). **Device pass 2 (17:41): a scroll-event tracker is
not enough.** Set from `scrollY` on each scroll event, the cover sat 3–6px
short of the rail at rest, a different amount after every scroll — the last
scroll event the main thread sees is not where iOS finally settles, and
nothing re-read it. Two rules from that: anchor a scroll-tracked edge to the
fixed element it must meet (here the walk rail's bottom, 3px behind its
line), never to "the viewport top"; and let the compositor drive it where it
can — `.edge-cover` now rides a scroll-driven animation (`animation-timeline:
scroll(root)`) whose `animation-range` is an absolute `0px 100000px` of scroll
offset rather than the page's 0–100%, which would depend on the scrollport's
height and change as the bars collapse. The script self-checks the mapping on
the first scroll events and falls back to a rail-anchored tracker that keeps
re-reading for 600 ms after every scroll (`?cover=js` forces it). Whether
Safari runs that timeline on its compositor is the open measurement;
`?cover=debug` prints which path is driving and the visual/layout viewport
numbers. Device pass 3 added two rules: **check a compositor-driven position
only at rest** — in motion the main thread reads it a frame behind, and a
check that fails in motion demotes a good path for good (that was his
"flicker at different speeds") — and **a section's colour for the bars is
the colour it fades INTO, not the `background-color` hidden under its
artwork**: the heroes' ground is the page brown `#1d1411`, not the `#100a06`
no one ever sees. **Device pass 4 measured the limit of main-thread
positioning**: his crop of the expanded bar mid-scroll had the cover ~30px
above the rail — one frame of scroll — so on his phone the scroll timeline
is not accelerated (or the script was driving), and any box moved from the
main thread will jitter in the bar region by speed × a frame. The rule: what
must hold still against the bars while the page moves has to be placed by
the scrolling thread — `position: fixed` (clipped to the viewport, so never
in the bar region) or `position: sticky` (in the scrolled contents, so
possibly there). The cover is sticky now: first in `<body>`'s flow, 320px
tall, a −320px bottom margin, drawn 319px above its layout box, `top: 0`.
**Device pass 5 measured it: a stuck box is clipped at the viewport exactly
like a fixed one and never paints in the bar region** ("now it's
transparent"). So the list is closed: that region shows scrolled page paint
and Safari's own tint, nothing else — and an element Safari reads for its
own fill (round 8, tests 4–5) has to be a VISIBLE opaque strip, read as a
tint source. A solid fill there is scrolled page paint or nothing, and page
paint is positioned by the page, one frame behind the compositor at speed.
Device pass 6 showed that a feather only blurs that frame; the rule that
finally holds is **aim scrolled paint at a point a fixed box can hide, never
at the viewport's edge**: the walk rail is a fixed, opaque band of the
section colour (`--edge-visor`, 32px, its line at the foot), the cover's
edge aims at the band's middle, and the frame of lag moves inside the band
instead of in the bar region. The script leads the scroll by its measured
speed × ~1.5 frames (the frame interval is measured from rAF), and the
half-band absorbs the residual. The cost is the band: the fill ends 32px
below the viewport's top edge, with the indicators at its foot. `?visor=<px>`
tunes it on the phone; `?debug=1` on a chapter prints the driving path,
`animation-timeline` support, the parsed `animation-range-end` and the
Safari version; `?cover=track&debug=1` is the one screenshot that settles
whether a compositor-run timeline is available on the phone. The only design
that removes the frame altogether — an inner scroll container, so the
document never moves and the bar region shows the canvas — most likely stops
Safari's bars from collapsing, and is Wil's call. Device pass 7 ("too tall",
and a flicker both fast and slow) refined the rule: **aim the scrolled paint
at the band's FOOT, not its middle, and bias the lead toward the page.** The
band's height is the tolerance, and only one direction of error is visible
(the edge rising into the bar region); an edge that dips runs behind the
line and over the page in the section's own colour. So the cover aims at the
top of the visor's line and the lead is one frame of motion plus half a
frame downward whichever way the page moves — a symmetric lead sits half a
frame toward exposure on every scroll up, which at 1–2px/ms is the whole of
a 16px half-band. Default `--edge-visor` is 16px (13px of room). What no
lead covers is a dropped main-thread frame (~8px of room per frame at
1px/ms); only a compositor-run timeline has none.

## 4 · State resets on every open (round 19)

Wil's rule: every open and every reload is the first-visit view. So nothing
writes state into the URL (`?stop=` was consumed once at arrival and then
removed); a back/forward-cache restore (`pageshow` with `persisted`) resets
every island state, clears any "leaving" latch the curtain set on the way
out, restores the whole route and cuts to the overview; and the overview fit
reads a box that does not depend on the bars' state at the moment of load.
Chromium headless never engages its bfcache, so that branch was reasoned and
then confirmed on the phone.

## 5 · Bar transitions and jitter (round 19)

With the shell in `svh` nothing on the page resizes when the bars move, but
`mapbox-gl` 3.27 listens to `window` resize itself and re-ran resize + render
on every transition — `trackResize: false`, with our ResizeObserver and
`orientationchange` handler calling `map.resize()` for real changes. Any
handler on `resize` should skip work unless its own inputs changed (the pill
ladder key). Whatever is left of the jitter is the 14px `--ui-inset` shift
and the compositor; not measured here.

## 6 · Lanes and tokens (round 20)

One registered token, `--map-lane`, is the walk door's bottom offset AND the
card strip's bottom padding at every width, so the two can never disagree
(phones `--ui-inset + --map-door-lift`, 640 and up `--ui-inset + 12px`). The
lift is a registered property with an initial value (−4px, the number Wil
chose on the phone through the `?cta=<px>` flag). **Register with
`@property` any custom property that JS reads with `parseFloat`** — an
unregistered one hands back the token stream, not a length. The device-side
tuning flag (`?name=value` → `documentElement.style.setProperty`) is the
cheapest way to let Wil pick a number without a deploy per guess; leave it in
once the default is chosen.

## 7 · Locking scroll for a view (rounds 1 and 20)

Event-level prevention — `wheel`, captured `touchmove`, the scroll keys —
plus `touch-action: none` on the strip, for the lifetime of the state that
owns the screen (the whole focused view, not only while an animation runs).
Never `overflow: hidden` on `<html>`: hiding the desktop scrollbar resizes
the stage. Programmatic landings are not events and still run.

## 8 · How it was verified without a phone

- **`scripts/map-framing.mjs` (`npm run qa:framing`)** — the map's camera
  search needs no tiles: an offline stub style (no sources, one background
  layer) lets `load` fire, and the pins are DOM. `--t 110 --e 129` stands the
  runway in through an init-script `<style>` with `!important` on the shell,
  the same technique RUN-STATE records for safe-area insets. It asserts the
  landing, the framing, the re-land after a scroll to 0, a pin tap, the walk
  door, the cards' lane, the logo row, and the scroll lock under a real wheel.
  Run it on the base build (a worktree at the round's tag, `cp -al
  node_modules`, delete `.vite` and `.astro`) and on the new one at T=0:
  cameras and pill positions must agree to the decimal — that is the proof
  nothing moved off iOS.
- **The visual gate** (`qa:snap`) photographs every route at scroll 0 in
  Chromium, where T and E are 0 and the pins never load. It catches drift on
  every other route and on the map's controls, never on the framing.
- **Chromium's scroll anchoring and bfcache differ from Safari's**: the
  anchoring found a real defect; the bfcache never engaged headlessly.
- **What only the phone can show**: the bars themselves, momentum, the
  freeze, a gap against the real toolbar pill. Say so in every report.

## 9 · The round checklist that got every round through

1. `git tag client-round-N-base <v2 tip>` (tags cannot be pushed; the SHA
   goes in the manifest, and `v2` itself holds the commit).
2. `docs/rounds/<date>-round-N.json` — allowed files, `snap.allowedRoutes`
   (only routes whose at-rest pixels are meant to change), notes.
3. Build, `astro check`, `qa:scope`, the instrument that measures the
   change, `qa:snap` (then `qa:snap:update` for the allowed routes only).
4. Commit with what was verified, what only the phone can show, and the
   revert line; push the branch; fast-forward `v2`; confirm the Actions run.
5. Report to Wil with the checklist, the verified / unverified split, the
   live link, and the revert command. He tests on the device and replies.

## 10 · Open, by his decision

- The scrolled composition of `/map` (his screenshot 4): the controls float
  ~160px above the map's end and the index sits far below. Proposal made,
  not shipped: drop the empty section rule under the map and use the beat
  spacing there; the runway below is inherent while the map is in flow.
- The 14px shift of the corner controls when the bars collapse (`--ui-inset`
  following the safe-area inset). Round 23 took the top-right menu off the
  shared lane (`--menu-inset`: the gutter and the top and right insets only);
  the mini-player and the interlude credit still ride `--ui-inset`.
- Compact address-bar layout was never measured; E (129) may be shorter than
  its toolbar. One line to raise if a band ever shows.
