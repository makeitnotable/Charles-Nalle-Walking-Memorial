# CNWM v11.3 — the seam-and-hall round · review guide

Everything below is on `v2` and live.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

---

## 0 · The finding that reframes your five screenshots

They are stamped **12:59–13:08**. The deploy carrying the dynamic chrome tint
and `color-scheme` completed at **13:58** — fifty minutes after your last
frame. Every screenshot shows the build those fixes replaced. So before
judging any of this: **reload each page on your phone** (pull to refresh, or
close the tab and reopen).

And the sentence to hold: no web API makes a browser's bars transparent in a
normal tab. What ships instead is every lever that exists — the bars take the
page's exact edge colour, the page's edges are made matchable everywhere, the
chrome retracts on scroll, and the home-screen app has no chrome at all. Your
iOS 26 Safari adds the rest: in its minimized state the page already runs
edge-to-edge behind the floating pill.

## 1 · The chapter hero (your 13:08 frame)

A bright painting met the top of the screen through a 55% scrim — and no flat
bar colour can ever match a painting, so even a perfect tint left a band.
The page now meets the bar halfway: both hero scrims **start solid** and ease
into their existing ramp, and the heroes pin the tint to that same value. The
bar dissolves into the scrim instead of cutting across the art.

Measured: every hero edge, five chapters × three phone widths, flat and
within Δ1 of the tint — they measured Δ130–182 against the art before.
Site-wide the seamless bar-faces count is now **345 of 366**, with 4
unavoidable art edges and 17 screens split between two grounds (one colour
cannot serve both ends; the tint takes the dominant one).

The disclosed design touch: the top 1% of each hero painting now sits under
solid scrim. It carried 55% there already; one gradient stop reverts it.

## 2 · The menu (13:05)

The menu dims the page behind a 62% scrim, but the tint sampler skipped
translucent layers — so the bars stayed a shade lighter than the dimmed page.
It composites them now, and the menu pokes it on open and close. Measured:
tint follows the scrim to Δ1 of the painted edge, and restores exactly.

## 3 · The hall's two bugs (13:02 — both in your one frame)

**The floor filling the screen.** One vertical thumb-drag tilts the camera up
to ±0.5 rad and only `recenter()` ever resets it — and the **Face forward**
affordance watched yaw alone, so it never appeared. Measured: one drag,
0 → 0.475 rad (~18°), permanent. The test now watches pitch past ~7° too;
pressing Face forward measures back to 0.000. The drag feel is untouched.

**"SCROLL TO WALK" through the dots.** The rail's positioner cleared its
inline `bottom` to `""` — but there was no CSS value behind it, so `bottom`
became `auto` and the rail fell into static flow after the canvas: one full
viewport down, or (mid-retraction, as your phone caught it) exactly onto the
chip. It now always states its position, and the canvas is out of flow so
that resting place no longer exists for anything.

## 4 · The Paintings page opens ON the hall (12:59)

Measured at your phone's geometry: the header above the hall took **41%** of
the first screen; the hall got 59%; the toolbar you asked about took 11%.
Per your call, the title now rides **over** the hall the way every chapter
hero works — scrim, text-shadow, bottom-left, withdrawing as you scroll —
and the hall owns **100%** of the first screen. While the title is up, the
hall's bottom wayfinding yields to it and crossfades in exactly as the title
leaves. Reduced motion: the static lead painting with the title over it.

## 5 · Instrument bars

| Gate | Result |
|---|---|
| `qa:hall` (new) | tilt escape + rail position (rest / walking / approach / across a viewport growth) + lead geometry — clean |
| `qa:bleed` | 0 visible bars · seamless 345/366 (was 335) · art-exempt 14 → 4 |
| `qa:rag` / `qa:contrast` / `qa:a11y` | 0 · 0 · 0 across the full matrix |
| build | 12 pages, `astro check` 0 errors, all 6 island-CSS guards |

## 6 · Your phone settles the rest — after a reload

1. Home and menu: do the bars match the page now?
2. A chapter: do the bars dissolve into the hero's scrim, top and bottom?
3. The hall: does a vertical drag offer FACE FORWARD, and does it right the
   view? Do the dots sit steady above the chip?
4. /paintings: does it open on a full-screen hall with the title over it?
5. Add to Home Screen, open from the icon: no chrome at all.

Anything still showing a band after the reload: one screenshot, and I measure
it against the section it sits on. If home still shows dark strips, that is
Safari dimming through `color-scheme`, and the next lever is applying the
hero-style solid edge to the page grounds — a design call I would put to you
first.
