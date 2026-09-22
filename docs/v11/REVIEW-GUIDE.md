# CNWM v11 — Wil's 8/22 round · review guide

Everything below is on `v2` and live.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

Ten of your twelve items are done. Two are held on a decision that is yours,
not because they were hard — because getting them wrong would put a wrong
caption on a memorial.

---

## 1 · Changes you did not request

First section, as `docs/v10/SCOPE.md` §C commits to. Three this round, all in
service of items you did ask for:

- **The next-stop pill moved from primary-10 to primary-9.** Item 4 asks for
  `/map`'s selected-pin chip, which is primary-10. On a primary-10 pill an
  orange chip of the same value is invisible; `/map` reads because its pill is
  primary-9 and the chip steps down from it. Copying the idiom meant copying
  both halves.
- **The footer's "The Paintings" curtain now breaks after "The".** v9 gave that
  curtain its authored break in the menu and missed the footer, so the same
  link curtained differently depending on where you clicked it. Item 5 put the
  identical fix on its sibling.
- **The Part-1 scene hook keeps its "Part 1".** My first pass stripped it from
  both hooks; you only asked about the second. Scoped back.

Nothing else. The full ledger is `docs/v11/SCOPE.md`.

---

## 2 · The ten that shipped

### 1 · The focused map card
The mechanism was already there and its arithmetic was wrong, which is exactly
what you were seeing. keen-slider's `distance` is a slide's **left edge** as a
fraction of the container, not its distance from the centre — so a perfectly
centred card reported 0.321 at 1440 and never reached full size. The focused
card was 3% bigger than its neighbour on a desktop, not the 8% intended: a
gradient across the strip rather than a focus. Now exactly 1.000 against 0.920
at every width — **41px wider and 15px taller at desktop**, 26×10 on a phone —
and sampled through a cycle the outgoing card runs 1 → 0.94 → 0.92 while the
incoming runs 0.92 → 0.98 → 1, together. Size and animation only.

### 2 · "Where to next"
From tablet up it is one row the width of the map: label and address left-set
on the map's left edge, **Get directions** on its right edge, vertically
centred against them. Measured at 768 / 834 / 1024 / 1280 / 1440 — **both edges
agree to 0.0px**. Your "only if space allows" is the wrap: if the two cannot sit
side by side the row falls back to the stacked centred arrangement phones keep.

### 3 · Chapter 2's second quote
Reads **"The Mob"** now. Kathy's label is untouched in the JSON — this is a
render rule: where a scene label opens with a bare "Part N", the hook prints
only what follows. Scoped to scenes after the first, because scene 2 is the one
with a "Part 2" hero a screen above it repeating the number; scene 1 has no
such hero, so its "Part 1" is the only place that number appears and it stays.

You asked me to judge the hero kicker's size. Rendered both: at t-title (56/34)
it reads timid against a full-bleed painting; one rung up at **t-display
(88/64/46)** it carries the hero the way the chapter's own H1 does, with nothing
colliding and no overflow at any width. **Sized up.**

### 4 · The next-stop pin
Now a verbatim copy of `/map`'s selected marker — orange chip, numeral in the
brown/black, 11px/600. Contrast re-run: 0 failures.

### 5 & 6 · Two line breaks
"The" sits above "People" on the People curtain; "the Project" under "About" on
the About title. The About H1 was rendering raw text, so it now goes through
`Lines` like every other display heading.

### 8b · The hall's chip
From 1024 the chip and **Skip the hall** share one top inset, but the chip is a
t-meta line plus 8px of padding against Skip's 40px button — their centres sat
4px apart. **Measured delta is 0.0px now** at 1024, 1280, 1440 and 1920.

### 9 · The map lifts off the button
Worth naming the cause: the camera's safe box constrains the label **pills**,
but a pill hangs above its dot on a leader line, so the **dot** was never in the
fit. Every pill was comfortably inside while the ferry's dot sat **10px** above
the button — at 1440, 1280 and 1920 alike. The desktop fit now reserves more
room at the bottom, which lifts dot and pill together: **60px of clearance**, a
full button-height, for 0.19 of zoom. All five pills remain inside at all ten
viewports measured; tablets and phones are untouched (they were already 34–194px).

### 10 · Historical context
The white line had a cause. The fade was `transparent 12%` — a **linear** ramp
over an eighth of the plate. These are light archival photographs whose top and
bottom edges are dark masonry, so a ramp that short against dark content reads
as a cut. Same distance, eased, over 18% at each end: the plate dissolves now.
The extra picture comes from the plate itself, which is taller — **612 → 752px
at 1440**. The section painted no background at all, which is why a band of the
page's dark body showed until the image decoded; it carries the cream now.
The scroll move is a scrub, so scrolling back retraces rather than replays:
**1.000 → 1.045** with a lag. It is on the image inside `overflow-hidden`, never
the block — a scale on the full-bleed section is what once reported 1584px of
width on a 1440 screen. Measured horizontal overflow: **0**. Reduced motion:
fully static.

### 11 · The divider gap (your redline)
Measured first: **57px** from the rule to the first line of content against
~200px below it at desktop — a 1:3.5 ratio, which is why the asymmetry read as
cramped rather than intended. The rule's own padding is the only lever that
moves everything below it without touching the section's bottom rhythm. Now
**73 / 97 / 109** against 128 / 168 / 200 — a steady ~1:1.75 at every width, on
the chapter sections, About and People alike. No layout grid: your note made
that optional and the spacing did not need one.

### 12 · The final images
`build-media.mjs` pointed at your Mac, so it has never been runnable anywhere
else. `scripts/refresh-from-masters.mjs` now derives from the in-repo masters
with one rule: refresh only where the master's **aspect matches** what the site
already serves. One key qualified — **ferry/historical, 1200×800 → 1440×960** —
and I verified it is the same plate first.

**Thirteen were skipped, and this is worth your eye:** the delivered art is
2400×1600 and 1600×2400 (3:2 and 2:3), while the site serves 16:9 and 9:16.
Every painting on the site is a crop of its master to a screen aspect. Comparing
the bakery side by side, the master carries the cart's frame and the men's legs
that the 16:9 cuts off. Re-deriving would re-frame all ten paintings — a real
improvement, possibly, but an art-direction decision and yours. See §3.

Also: the 1858 plate's master is a JP2 and this environment has no JPEG 2000
codec; and `sketch`, `moral` and `square` have no masters in the delivery, so
they keep the assets they have.

---

## 3 · For your decision

**a. Two painting titles are missing.** Eight of the ten are identified with
confidence — matched by putting your PDF's plate beside the file on disk, never
by name. Two are not on the series page at all: the **mansion's** (a dark
interior, two men over papers) and the **barbershop's** (a rearing white horse,
a US flag, signage reading WEST TROY). I have applied none of the ten: naming
eight correctly and leaving two under location names would read as an error on
the same page. Full table in `docs/v11/PAINTING-NAMES.md`.

**b. The Part 1 study.** You were right, and it is more specific than "some are
wrong". Part 2's study is **correct**; Part 1's is not, and it is not a swap.
The drawing beside *1st & State Street* is **Don't Let Them Have Him!** — a real
Nalle drawing of a different moment, and the painting it belongs to is the one
the **ferry** chapter hangs. Fixing it means choosing: show nothing there, move
the drawing to the ferry chapter at the cost of what is there now, or supply the
true study (not in `masters/`, not on the page). Removing a study is as much a
decision as replacing one, so I have left it.

**c. Re-frame the paintings to the masters' 3:2?** See item 12 above.

**d. Still open from v10.2:** the "Take the walk" pill covering the Mapbox
wordmark, and landscape-phone map framing (needs zoom 13.30).

---

## 4 · Instrument bars

| Gate | Result |
|---|---|
| `rag` | 0 runts · 0 clips · 0 visible em dashes, full matrix |
| `contrast` | 0 failures (0 style · 0 pixel), 0 unmeasured |
| geometry probes | onward row 0.0px on both edges · chip/Skip centres 0.0px · map cards 1.000/0.920 · interlude overflow 0 |
| build | 12 pages, `tsc` clean, all 6 island-CSS guards present |

`qa:walk` still cannot run here (Mapbox is proxy-blocked); map work is verified
against a stubbed style, which makes the projection real without needing tiles.

---

## 5 · One note for next time

Two of this round's bugs — the map card scale and the map camera's bottom
clearance — were both *measurement* errors rather than taste: a value that
looked like a distance-from-centre but was a left-edge offset, and a safe box
that constrained labels but not the dots they hang from. Both had been shipping
for several rounds and both were invisible until measured. The probes for them
are in the session's scratchpad and the numbers are in the commit messages.
