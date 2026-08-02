# Stakeholder Gate — Wil's review of the rebuild

Reviewed: `docs/v4/qa/p6-live/` (live site, 390 / 768 / 1440) against `docs/v4/qa/p0-before/`
and the three reference sites in `docs/v4/qa/inspo/`.

Short version up front: this is not a step backwards any more. It's a large, real jump.
But there are four or five things on it that a stranger would notice in the first minute,
and two of them are on the second screen of the journey.

---

## 1. Walking it like a visitor

**Home** (`home--1440.png`, `home--390.png`) — This is now a proper title card. The eyebrow is
letterspaced small caps, the name is huge and confident, the 1821—1875 rule is a nice quiet
touch, and the Continue button is a balanced pill with an arrow in it. Compare `p0-before/home--1440.png`:
the old one had a fat, over-rounded blob of a button with no icon and a tall, unbalanced
silhouette, and the illustration had those distracting white crack/lightning veins running
across the whole frame. The new image treatment darkens those out. This screen feels expensive.
Good first impression.

**Map** (`map--1440.png`, `map--390.png`, `map--768.png`) — And then it falls over. This is the
weakest screen on the site and it's the second thing anyone sees.

- The path is now clearly visible. Fine. But the five stops are reduced to numbered dots with
  no names, and **two pairs of them physically overlap**. On `map--1440.png`, pin 5 (≈747,226)
  and pin 2 (≈756,237) are ~14px apart with ~11px radii — they sit on top of each other. Pins 1
  and 3 collide the same way near the Bakery label. On `map--390.png` it's worse: pin 2 is almost
  entirely hidden behind pin 5.
- Only the active stop shows a name ("BAKERY"). So a visitor lands on the map and sees five
  orange dots, two of which are stacked, and one word. In `p0-before/map--1440.png` **every pin
  was labelled** — Barbershop, Commissioner's Office, Bakery, Gilbert Mansion, Ferry Landing.
  That was uglier but you could read it. We traded legibility for tidiness and lost.
- The path geometry reads as an abstract triangle cutting diagonally across the city rather than
  a walk. There's also a stray orange stub with a dot on top hanging off the Bakery pin
  (≈833,395 on `map--1440.png`) that connects to nothing.
- The Mapbox default chrome — the "500 ft" scale bar and the round geolocate button bottom-left —
  is untouched and looks like leftover furniture from a different product.

Scroll past the map and it recovers immediately. `map--1440--scroll3.png` / `scroll4.png`: the
stop list is genuinely excellent. Hairline rules, "STOP 01" eyebrow, big name, address, arrow
right-aligned, thumbnail left. Editorial, calm, museum-grade. `p0-before/map--1440--scroll3.png`
had chunky bordered cards all shouting "CHAPTER" with a numbered dot floating in the corner —
repetitive and cheap. This is a big win. Same list at 768 (`map--768--scroll3.png`) is just as good.

**A chapter** (`mansion--1440.png` → `scroll4.png`) — The template opens well. Eyebrow, "(CH. 03)",
enormous name, hairline, then "SCROLL TO LISTEN" with a headphone icon and a clean down arrow.
Then the painting — in colour, full width, rounded, credited "MARK PRIEST · NALLE SERIES".
Then it flips to a cream panel with the story in a serif at a proper reading measure
(`mansion--1440--scroll1.png`). That dark→light flip is the best move on the whole site; it's the
museos trick and it lands. Then "FROM THE SKETCH" (`ferry--1440--scroll2.png`) — the sketch gets
its own section with an explanation of why it exists, and press-and-hold to develop the painting.
Then history, then "WHERE TO NEXT" with the next stop and two buttons.

**People / Paintings / About** — `people--1440.png` is the best page on the site. "ONE DAY. /
A WHOLE CITY'S CAST." at that scale, then the Tubman quote in serif with hanging quote marks and
an orange attribution. That's a designed page. `people--1440--scroll1.png` — the two-column
people list with hairlines and "CH. 1 · BAKERY →" cross-links is clean. `paintings--1440--scroll1.png`
is a proper gallery grid. `about--1440.png` opens well and flips to cream.

---

## 2. My eight complaints, one by one

### 1. "The icons, like the arrows for example look terrible" — **FIXED**
The old scroll cue on `p0-before/mansion--1440.png` was a thin vertical line with a detached
chevron floating at the bottom — it looked like a rendering error. It's gone. There is now one
consistent stroked arrow used everywhere at a sensible weight: the stop-list rows
(`map--1440--scroll4.png`), the people cross-links (`people--1440--scroll1.png`), the paintings
cards (`paintings--1440--scroll1.png`), inside the buttons (`mansion--768--scroll4.png`), and a
headphone glyph paired with a down arrow in the scroll cue. They read as one family now.

### 2. "The buttons are unbalanced" — **FIXED**
`p0-before/mansion--1440--scroll4.png`: "Continue the walk" and "Get Directions" were ~90px tall
with enormous vertical padding, mismatched widths, no icons, and the filled one was a muddy dark
red on dark brown. `p6-live/mansion--768--scroll4.png`: both are ~48px, same height, same padding,
both carry the arrow, primary is orange with dark text (proper contrast), secondary is outlined
orange. Balanced pair. Home's Continue button and the people page's "Open the walk"
(`people--390--scroll4.png`) match the same spec.

Minor: on `map--390.png` the stacked "Take the walk" / "See Troy in 1860" pills are different
widths (~132 vs ~146px) while centred one above the other. When they're stacked they should match.

### 3. "The path is so low contrast it is invisible — accessibility issue" — **FIXED**
`p0-before/map--1440--scroll2.png` had a faint dotted hairline you had to hunt for. `p6-live/map--1440.png`
has a thick solid rust line you cannot miss, at 390 and 768 too. Complaint satisfied.

Caveat I'll register but not hold against you: it's still a dark brown against dark grey, so it's
leaning on hue difference more than brightness difference. It's plainly visible; it just isn't
generous. A brighter core would settle it for good.

### 4. "Spacing and layout... the whole site lacks a visual hierarchy" — **FIXED**
This is the biggest improvement and it's not close. Every page now has: eyebrow → oversized
display headline → hairline rule → body at a controlled measure, plus a numbered section rail
("(01) LISTEN", "(03) HISTORY", "(05) ONWARD") running down the left. Compare
`p0-before/map--1440--scroll2.png` (headline ~54px, everything crammed into the top-left, no rules,
no rhythm) to `p6-live/map--1440--scroll2.png` (headline 3x bigger, hairline above, section number
in the margin). You can now tell what matters on every screen at a glance. The serif/sans split —
sans for display and UI, serif for narrative — is doing a lot of work and it's applied consistently.

### 5. "The site looks sloppy and thrown together" — **PARTLY**
The system underneath is good. The finishing is not. See section 3 — the footer string, the
next-stop maps, and the panel transition are all things I'd expect to be caught before it reached me.

### 6. "The words, titles and names are inconsistent" — **PARTLY**
The *names* are fixed. "URI GILBERT HOME", "HOLEUR'S FASHIONABLE BAKERY", "WASHINGTON STREET FERRY
LANDING", "PETER BALTIMORE'S BARBERSHOP" now match between the map list and the chapter page —
the old build had "URI GILBERT MANSION" on the chapter page and "Gilbert Mansion" on the pin, and
"OFFICE OF THE COMMISSIONER" in the list vs "Commissioner's Office" on the map. That's resolved,
and the long/short forms look like a deliberate canonical/display/short system.

The *labels around* the names are not. In one journey I'm told the same thing five different ways:

| Where | Wording |
|---|---|
| `map--1440--scroll4.png` | `STOP 01` |
| `mansion--1440.png` eyebrow | `STOP 03 OF 5` |
| `mansion--1440.png` heading | `(CH. 03)` |
| `people--1440--scroll1.png` | `CH. 1 ·` |
| `paintings--1440--scroll1.png` | `CHAPTER 1` |
| `mansion--768--scroll4.png` | `NEXT — STOP 04` |

Pick one word — stop or chapter — and one number format. Right now "stop" and "chapter" are used
interchangeably for the same object, and on a chapter page "(CH. 03)" (the chapter) and "(03)"
(the third *section* of that chapter) sit on the same page in the same orange in the same
parenthesised format. Those are two different numbering systems dressed identically.

### 7. "The sketches replaced the chapter hero image — this should not have been done" — **FIXED, and fixed well**
`p0-before/mansion--1440.png` and `p0-before/mansion--390.png` opened on a black-and-white hatched
sketch with "PRESS AND HOLD TO BRING THE PAINTING TO LIFE" stamped across it. Gone.
`p6-live/mansion--1440.png` opens on the painting, in colour, credited. And the sketch hasn't been
thrown away — it's been given a proper home in its own section (`ferry--1440--scroll2.png`,
`barbershop--390--scroll2.png`) titled "FROM THE SKETCH", with copy explaining that every painting
began as a graphite study and inviting the press-and-hold. That's a better answer than I asked
for. Credit where it's due.

One flaw: the press-and-hold pill isn't styled consistently. On `ferry--1440--scroll2.png` it's
orange text on a translucent dark pill sitting on busy black-and-white hatching, and it's genuinely
hard to read. On `mansion--768--scroll2.png` it's cream on solid rust — legible. On
`barbershop--390--scroll2.png` it's cream on translucent. Three treatments of one control. The
orange-on-hatching variant is the low-contrast problem all over again, just somewhere new.

### 8. "Chapter pages should share a template, and it should be the most beautiful thing on the site" — **PARTLY**
They do share a template — all five chapters are structurally identical, which was not true before.
And it's good. It is not yet the most beautiful thing on the site; the People page is. See section 6.

---

## 3. Is it polished, or still thrown together?

Mostly polished, with a short list of things that undo it. These are the specific ones:

**a) The mobile footer has a broken string — on every page.**
`mansion--390--scroll4.png`, `people--390--scroll4.png`, `paintings--390--scroll4.png` all read:

> Charles Nalle Walking Memorial**M**ade by Notable

No space, no line break. At 1440 (`paintings--1440--scroll4.png`) it renders correctly on two
lines. So the last thing a phone visitor sees on every single page is a typo. That is precisely
what "thrown together" looks like.

**b) The footer link grid is ragged.**
Same frames. In a 2×2 grid, some arrows are pushed to the right edge of their column
("THE PEOPLE OF THIS DAY →" at x≈170, "ABOUT THE MEMORIAL →" at x≈361) and some sit inline right
after the text ("THE PAINTINGS →", "THE WALK →"). Two arrow behaviours inside one component, and
uneven row heights because some labels wrap and some don't.

**c) The "Where to next" map does not frame its own pin.**
- `mansion--1440--scroll4.png` and `mansion--768--scroll4.png`: **no pin at all.** Just an empty
  grey map. The one job that card has.
- `ferry--1440--scroll4.png`: pin clipped by the top edge of the card.
- `barbershop--768--scroll4.png`: pin label cut in half by the top edge of the card.
- `bakery--1440--scroll4.png`: correct — "2 Commissioner's Office", centred, fully visible.

One of four right.

**d) The dark→light transition bisects the section label.**
On `mansion--1440--scroll1.png`, `bakery--1440--scroll1.png`, `barbershop--1440--scroll1.png` and
`commissioners-office--1440--scroll1.png` — four different chapters, same scroll depth — the cream
panel's left edge lands at x≈170 while the "(01) LISTEN" label spans x≈137–186. The result is
"(01" in orange on dark and ")" in orange on cream, with "LISTEN" split mid-word. I understand
this is the panel wiping in and that at rest it's full-bleed and reads fine
(`mansion--1440--scroll3.png` proves that). But I caught it on four chapters at the same point,
which means a normal scroll lands there. During the transition the label looks broken.

**e) The menu button sits on the paintings.**
On `mansion--390.png`, `bakery--390.png`, `ferry--390.png`, `mansion--768.png` a heavy ~72px
rounded-square hamburger is parked bottom-right directly on top of the artwork. On a memorial
built around these paintings, covering a corner of every one of them with a menu button is the
wrong trade. It also changes home position by page type — top-right on home/map/people/paintings/about,
bottom-right on chapter pages — so it moves on you as you navigate.

**f) The About page pull quote is the mobile layout scaled up.**
`about--1440--scroll4.png`: a ~46px serif quote set in a ~630px column, running thirteen lines
down the left half of a 1440px screen with the entire right half empty. On mobile
(`about--390--scroll4.png`) the same quote is beautifully set. Desktop needs its own proportions.

**g) Hero heights aren't systematised across page types.**
Chapter heroes are near-full-viewport. `about--1440.png` flips to cream at y=408 — a squat, half-height
opening. `paintings--1440.png` is full-height with ~280px of dead air under the intro paragraph.
Three different opening rhythms for three page types.

---

## 4. Against pasqua / Google Arts & Culture / museos

Closer than it's ever been, and the borrowing is intelligent rather than literal. The numbered
section rail in the left margin is straight from museos (`inspo/museos/spine-intro-1440.png` —
"(0) Introducción" in the left column, text right) and it's used correctly. The stop list and the
paintings grid hold up next to Google Arts & Culture. The dark/light flip is museos'
`flip-dark-to-light`. The typographic confidence on the People page is pasqua-class.

Where it falls short:

**No persistent chrome.** museos keeps a permanent top bar — project title left, progress centre,
subject right — and a permanent bottom audio bar with the play control, duration and narrator
credit (`inspo/museos/spine-intro-1440.png`). Google A&C keeps a full nav bar on every frame
(`inspo/googleac/story-1440-s01.png`) even in full-bleed immersive mode. Our site has a floating
hamburger and nothing else. You never know where you are, how far through you are, or how to get
back. That single missing element is most of the gap between "a nice long page" and "an instrument".

**The audio is invisible.** The chapter pages promise "SCROLL TO LISTEN" with a headphone icon,
the sections are literally named "LISTEN", and `bakery--1440--scroll1.png` says "TAP ANY PARAGRAPH
TO HEAR IT READ ALOUD" — and there is no player anywhere in 150 screenshots. No play button, no
progress, no narrator credit, no way to pause. museos makes the player a designed object you can
see at all times. Our most distinctive feature has no surface. (Also: that instruction line is
orange on cream at small caps size — weak contrast for the one label explaining the feature.)

**pasqua and Google use the full canvas; we use the left 60%.** `inspo/pasqua/roots-1440-s2-y3108.png`
runs a four-up portrait grid edge to edge on a saturated colour field.
`inspo/googleac/home-1440-s01.png` bleeds imagery to all four edges. Our desktop pages are
predominantly a left column with dark emptiness on the right. Museos does this too, so it isn't
wrong — but museos earns it with the fixed bars top and bottom holding the frame. Without those,
ours reads as unused space rather than composed space.

---

## 5. Mobile at 390 — does it look incredible?

It looks *good*. Not incredible.

Working: `people--390.png` is lovely — the headline breaks well, the quote with hanging quotation
marks is beautifully set. `bakery--390.png` and `ferry--390.png` heroes are strong, with the
painting in a tall portrait crop. `map--390--scroll4.png` — the stop list translates cleanly.
`mansion--390--scroll4.png` — the next-stop block and stacked buttons are correct and well spaced.
`about--390--scroll4.png` — the pull quote is better on mobile than on desktop.

Against it, in order of how much it bothers me:
1. The footer string is broken on every page (3a).
2. The footer link grid is ragged (3b).
3. The hamburger sits on the artwork on every chapter hero (3e).
4. `map--390.png` — the pin overlap is at its worst here; stop 2 is essentially hidden behind stop 5.
5. Stacked map buttons are unequal widths.
6. The stop-list thumbnails are small enough (~56px) that they read as specks rather than an
   invitation; the type dominates them completely.

Nothing here is structural. It's all finishing.

---

## 6. Is the chapter template the most beautiful, most immersive thing on the site?

No. It's the most *sophisticated* thing — the tonal flip, the sketch section, the section rail,
the press-and-hold — but the People page is the most beautiful, and the map's stop list is the most
resolved. The chapter template is carrying more unfinished edges than either.

Specifically, what stops it:

- The template doesn't hold its rhythm. Because the headline is set at one size regardless of
  length, the hairline rule and the top of the painting land at different heights on every chapter:
  `mansion--1440.png` and `commissioners-office--1440.png` put the rule at y≈447; `bakery--1440.png`,
  `ferry--1440.png` and `barbershop--1440.png` push it to y≈558. On the two-line chapters you get a
  good look at the painting above the fold; on the three-line ones you get a sliver. Five chapters,
  two different first impressions. If it's a template, the fold should be a constant — scale the
  display size to fit the name.
- The "Where to next" map is broken or mis-framed on three of the four chapters I checked (3c).
- The panel transition bisects the section label on four of five chapters (3d).
- The press-and-hold pill has three different styles (complaint 7).
- The menu button covers the painting (3e).

Fix those five and it genuinely becomes the best thing here. It's close.

---

## 7. The bottom line — would I love this?

**Close, but no.**

I want to be clear that this is not the same conversation as last time. Last time I said it felt
like a step backwards and looked thrown together, and that was fair. This is a different site.
The hierarchy problem is solved outright. The buttons and icons are solved outright. The sketch
is back where it belongs and handled more thoughtfully than I asked for. The stop list, the People
page and the tonal flip are work I'd put my name on. Whoever did the typography understood the
brief.

But I can't say I love it while the second screen of the journey has overlapping unlabelled pins
on it, and every page on a phone ends in a typo. Those aren't taste disagreements — they're things
that make a careful visitor stop trusting the thing they're reading. On a memorial, trust is the
whole product.

**Three things and I'm there:**

1. **Fix the map.** Deconflict the five pins so none of them overlap at any zoom (offset the
   stacked pairs or cluster them), and put the stop names back on the pins — all five, not just
   the active one. The list below it proves you know how to present these stops; the map should
   match it. Kill the orphan orange stub near the Bakery pin and style or hide the default Mapbox
   scale bar and locate button. Worst screen, second position — it has to carry its weight.

2. **Finish the footer and the next-stop card.** The mobile footer string
   ("Charles Nalle Walking MemorialMade by Notable") needs its line break back on every page, and
   the footer link grid needs one arrow rule, not two. And the "Where to next" map has to frame its
   own pin every time — `mansion` shows no pin at all at both 1440 and 768, `ferry` and `barbershop`
   clip theirs on the card's top edge. `bakery` is the one that's right; make the rest match it.

3. **Clean up the chapter template's edges.** In priority order: stop the cream panel's wipe from
   bisecting the "(01) LISTEN" label (hold the label until the panel is under it, or move it inside
   the panel); move the menu button off the paintings on mobile and give it one consistent home
   position across all page types; scale the chapter headline to the length of the name so the
   hairline and the painting land at the same height on all five; and settle the press-and-hold
   pill on one style — the cream-on-solid-rust version.

Two more that aren't blockers but would take it from "very good" to the level I actually asked for:
give the audio a visible, designed player — you promise "scroll to listen" and there's nothing
there to look at — and add a slim persistent bar so people know where they are in the walk. That's
what museos has that we don't, and it's the difference between a beautiful page and an experience.

Pick one word — stop, or chapter — while you're in there.
