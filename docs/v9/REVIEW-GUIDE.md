# CNWM v9 — Wil's 8/21 round · review guide

Everything below is on `v2` and live. This round was mostly **corrections to
v8**: three places where I built what you asked for and the result was wrong
in your eye, plus eight new items.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

---

## 1 · The three corrections

**The study came back out of the plaque card.** You were right that it was the
same thing twice — the drawing already hangs beside its painting on the wall.
The card is text-only now. While I was in there: the Commissioner's Office
Part 2 has always had its own study on disk and never hung it, so it does now.
Six paintings carry a study on the wall instead of five.

**The drawer's close button** is a real round button with an X, centred above
the card's content where the drag pill used to be — 44×44, on the button
colours, 17px of air above it and 18px below. Not a ghost glyph in a corner.

**The end of the hall.** Your description was exact: v8 walked you seven
metres *past* the last painting to a blank wall, then down steps to stare at a
landing. The hall now **ends on its last painting**. The archway stays — it is
what gives the corridor its depth and its light — but you never walk through
it. Instead the last stretch of scroll is a transition rather than travel: the
arch's warm light rises to take the whole frame while the hall dissolves into
it, and because the light's outer edge is the page's own ground, the stills
grid scrolls up out of it with no seam. **This is the item most worth your eye
— the mechanism is right, the exact timing is taste.**

## 2 · The rest

| You said | What shipped |
|---|---|
| Camera slightly more down | −0.15 → −0.19 (portrait −0.12 → −0.155). A step, not a lurch. |
| Where-to-next repeats the name | The pin carries the **full name** ("Holeur's Fashionable Bakery"); the line beneath is now **"Chapter 2"**. The LOCATION NN marker in the heading row is gone — the number reads once. |
| Light gradient on the historical-context images | Cream at both edges on all five chapters. I had flagged a risk that this would haze the top of a dark image; it doesn't, because every one of those plates is a light archival photograph. It reads the same as the 1858 map you approved. |
| "Artist study" caption needs side air | Padding added wherever the caption sits under the sketch rather than beside it. |
| Quote block: text left-aligned, block centred | The three rows now share a left edge inside a block centred in the column (phones only). v8 had centred the text itself. |
| Full 1858 credit on one line | "Troy, New York · 1858 · Library of Congress" needs 370px; the chip allowed 351, so it broke to two lines. Closed the gap without touching the words — slightly tighter micro-tracking, 4px of padding, a shallower inset. **One line from 390 up**; 375 and below wrap to two, which you allowed. |
| 1858 lens further right on mobile | Opens further left in the crop, which is what shows more of the map's left side. |
| Black bars top and bottom | Found it: the page shipped without `viewport-fit=cover`, so iOS inset the content and painted those strips itself. Fixed, and html plus the map shell now carry the page's ground so nothing can read as black. **Please re-check on your iPhone** — this is the one fix I cannot verify here. |
| Menu double divider | **Reproduced it.** On a short screen the panel scrolls, and the close button scrolled away with the content — leaving its own bottom border resting just under the panel's border, two hairlines with no icon between them. It's pinned now, which also keeps Close reachable from anywhere in the list. |
| "The Paintings" on two lines when loading | The curtain paints "The" over "Paintings". Labels now honour authored breaks the way chapter names already did. |
| Home mobile: image up, content balanced, CTA inside | His head lifts to just under the top edge, the lockup starts higher, and the CTA closes the block inside the frame instead of being pinned to the floor. At 390 the air above went 312 → 253px and below 24 → 86px. |
| Rag perfect on Pixel, wrong on iPhone | The paragraph carried **both** hand-authored breaks **and** `text-wrap: balance`, and the two engines disagree about that combination — same markup, different rag per browser. Balancing is off where breaks are authored. Worth confirming on your iPhone. |

## 3 · Instrument bars

rag **0 runts / 0 clips / 0 em dashes** across the full matrix · contrast
**0 failures** · a11y **0 findings across 51 runs** including reduced motion
and 200% zoom · museum draw calls **79 landscape / 77 elsewhere** against the
80 budget.

One note on that budget: hanging the Part 2 study pushed landscape phones to
81. Rather than drop the study, I merged the three step treads into a single
mesh — they are background detail beyond an arch nobody enters now — which
returned two calls. Appearance unchanged.

## 4 · Still yours

1. **Painting titles.** You said you'd confirm them today. The hall currently
   names works from generic media keys (`horizontal`, `narrative1`) and the
   source files are equally generic, so the real titles have to come from you.
   I need all ten: bakery ×1 · commissioner's ×2 · Gilbert ×1 · ferry ×3 ·
   barbershop ×3. They'll then read the same everywhere — hall plaque, stills
   grid, dialog, alt text.
2. **The high-res splash** — `home-bg.png` ≥ 3000px on the long edge and a
   splash film ≥ 2160px. The pipeline also needs a wider tier than its 1440
   cap before a Retina hero can be sharp; that's my side, once the source
   lands.
3. **Two things I can't verify here:** the black-bar fix on real iOS, and the
   home rag on your iPhone.
4. **The hall's closing transition** — timing is taste (see §1).
