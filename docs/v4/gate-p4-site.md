# Acceptance Gate — P4 Full Site Rollout

**Verdict: DOES NOT PASS. 1 of 7 rubric items passes.**

Reviewed: all 165 frames in `docs/v4/qa/p4-rollout/` — routes `home`, `bakery`,
`commissioners-office`, `mansion`, `ferry`, `barbershop`, `map`, `people`, `paintings`,
`about`; viewports 390 / 768 / 1440; base + scroll1–5.
Bar: `docs/v4/qa/inspo/pasqua/`, `docs/v4/qa/inspo/googleac/`, `docs/v4/qa/inspo/museos/`.

**This build is materially better than P2.** Eight of the sixteen P2 craft defects are
genuinely fixed, and three of them were the P0s. The floating button no longer eats body
copy or collides with the Share button — it hides on scroll. The section hairline is one
width. The moral section lands on the same grid in every chapter. Nothing breaks the right
page margin. Full-bleed painting bands and hard dark→cream field cuts now exist, which is
the first real immersive move in the project.

**It still fails, for three reasons.** First, two new collision bugs shipped on `/map` — a
client will find them in thirty seconds. Second, the P2 verdict's two highest-leverage
notes (kill the rounded containers, fill the empty left third) were not acted on, so the
box census is unchanged at 5 and a third of the desktop viewport is still blank on four
screens. Third, the type system got *worse* on mobile: there is now an 8px cap-height
label, below P2's already-failing 9px floor.

---

## Rubric

### (a) SIDE-BY-SIDE — **FAIL**

Four pairings put up:

| Ours | Reference | Result |
|---|---|---|
| `mansion--1440--scroll4.png` | `inspo/museos/detail1-1440-s0.png` | **Comparable.** Full-bleed field, one giant heading, two type sizes. This frame would survive next to Museos. |
| `mansion--1440--scroll3.png` | `inspo/museos/audio-rows-detail1-1440.png` | Not comparable. Museos = three hard full-bleed bands, light/dark/dark. Ours = a rounded photo pushed to the top-right of a cream page with a blank left third. |
| `commissioners-office--1440--scroll2.png` | `inspo/pasqua/roots-1440-s2-y3108.png` | Not comparable. Pasqua puts four portraits hard-edged on a flat olive field, zero containers. Ours puts the narrative — the reason the site exists — inside a 24px-radius cream card with a drop shadow (bottom corners visible at y=310). |
| `map--1440.png` | anything | Not comparable. Two overlapping map labels and a default Mapbox UI kit. |

What gives it away as the cheaper one, concretely:

1. **Rounded containers are still the house style.** Measured: the hero image carries a
   16px radius **and a 1px rust stroke** — `mansion--1440.png` pixel x=136,y=700 is
   `rgb(128,65,43)` against a `rgb(29,20,17)` field; same on `commissioners-office--1440.png`
   and `ferry--1440.png`. The cream narrative card, the sketch, the history photo, the map
   and the `paintings` grid tiles all carry the same 16–24px radius. Pasqua, Museos and
   Google A&C use zero radii on artwork. P2 fix #14 was the single highest-leverage item on
   the list and it was not done.

2. **A third of the desktop screen is still empty.** Measured ink in the band x=0–475:
   `mansion--1440--scroll3.png` **0.15%**, `mansion--1440--scroll5.png` **0.79%**. Both
   frames carry a two-line label rail — `(03) / HISTORY`, `(05) / ONWARD` — at 9–25px, then
   700px of nothing. `people--1440--scroll2.png` and `--scroll4.png` are the same. P2's
   suggestion was to put a chapter spine there; a label was added instead and the void
   remains.

3. **`about--1440--scroll5.png` is the worst-composed frame on the site.** A 14-line pull
   quote crammed into a 628px column at x=137, while the section body it belongs to starts
   at x=477 — two left edges in one section — and the right 46% of the frame (x=770–1440)
   is empty for the full 900px height.

4. **Two shipped bugs.** See (g) 1 and 2.

### (b) HIERARCHY SCAN — **FAIL at 1440 and 768, PASS at 390**

Winner named per frame, 3-second glance:

| Frame | Winner | Verdict |
|---|---|---|
| `mansion--1440.png` | display heading | OK |
| `mansion--1440--scroll1.png` | the cream plane itself | marginal — the winner is a container, not content |
| `mansion--1440--scroll2.png` | full-bleed painting band (bottom) | OK |
| `mansion--1440--scroll3.png` | the brownstone photo | **fail** — the section's title is a 9px eyebrow; the photo wins by default |
| `mansion--1440--scroll4.png` | display heading | OK — best frame in the build |
| `mansion--1440--scroll5.png` | the orange "Continue the walk" pill (231×48) | **fail** — a button outranks the 23px destination name "WASHINGTON STREET FERRY LANDING" |
| `ferry--1440--scroll3.png` | **nothing** | **fail** — the photo's sky and the cream field are the same value |
| `ferry--1440--scroll4.png` | heading, in the bottom 22% of an otherwise flat frame | marginal |
| `people--1440--scroll2.png` / `--scroll4.png` | **nothing** | **fail** — two columns of equal-weight 23px serif |
| `paintings--1440.png` | display heading | OK, but 45% of the frame is empty and there is no painting |
| `about--1440--scroll5.png` | the quote by mass only — same 23px serif as everything else | **fail** |
| `map--1440.png` | orange pin cluster **vs** orange "Take the walk" pill — **tie** | **fail** |
| `commissioners-office--768--scroll3.png` | the full-bleed painting band; "HISTORICAL CONTEXT" below loses | **fail** |
| `mansion--390.png` / `--scroll2.png` / `--scroll4.png` | display heading each time | OK |
| `map--390.png` | the pin cluster | OK |

Six frames at 1440 with no winner or an inverted winner. 390 is clean.

### (c) SQUINT TEST — **FAIL at 1440, PASS at 390**

Blurred at 8px (`squint_1440.png`, `squint_390.png` montages).

Holds at 1440: `mansion--1440.png` (heading block over image plane), `--scroll2.png` (three
planes: text / sketch / full-bleed band), `--scroll4.png` (dark texture + one white mass —
the strongest frame in the build), `about--1440.png` (hard dark→cream cut at y=408).

Collapses at 1440:
- `ferry--1440--scroll3.png` — the pale historical photo's sky and the cream field blur to
  one value. The image has no top edge and no right edge. The whole frame is a single flat
  plane.
- `people--1440--scroll4.png` — grey noise in the right two-thirds, void in the left third.
  No anchor, no plane, no edge.
- `ferry--1440--scroll4.png` — the top 60% is featureless dark; a small white mass sits in
  the bottom-right.
- `paintings--1440.png` — a heading and a paragraph in the left half; 45% of the frame is
  nothing.
- `mansion--1440--scroll3.png` / `bakery--1440--scroll3.png` — a photo in the top-right of
  a blank cream page.

At 390 every frame sampled holds: the cream field goes full-bleed, so section boundaries
read as hard horizontal cuts. Compare `inspo/museos/audio-rows-detail1-1440.png`, which at
8px is still three deliberate bands — that is what the 1440 history and people frames should
be doing and aren't.

### (d) SPACING — **PASS**

This is the one item that passes, and it is a real improvement over P2.

The gaps come from a small repeated set, verified by measurement:

- **Section rule: one width everywhere at 1440.** x136→1303 on `mansion--1440.png` (y=447),
  `commissioners-office--1440--scroll2.png` (y=507), `bakery--1440--scroll4.png` (y=280),
  `ferry--1440--scroll4.png` (y=654), `mansion--1440--scroll4.png` (y=294). P2's
  459 / 275 / 50px stubs are gone.
- **Moral-section lead-in: 560px on every chapter.** `ferry--1440--scroll4.png` field cut
  y=94 → rule y=654; `commissioners-office--1440--scroll4.png` y=8 → y=568;
  `barbershop--1440--scroll4.png` y=59 → y=619. Identical.
- **Section gap ≈195–200px at 1440** (`commissioners-office--1440--scroll2.png` card bottom
  y=310 → rule y=507), **≈125px at 390**, **≈160px at 768**. Consistent.
- **CTA row → footer band: ~190px on every chapter** (`mansion--1440--scroll5.png` buttons
  end y=562, footer rule y=762; `commissioners-office--1440--scroll5.png` y=562 → y=762).

Two things stop this being a clean pass, but neither is arbitrary enough to fail it:

1. **Three reading-column left edges.** 477 (footnote numerals, `about` body, section
   headings), 525 (chapter narrative inside the cream card,
   `mansion--1440--scroll1.png`), 531 (footnote body text, `mansion--1440--scroll3.png`).
   Pick one.
2. **The dead space is systematic but excessive.** `commissioners-office--768--scroll3.png`
   is ~500 of 1024px empty (49%); `ferry--1440--scroll4.png` is 67% empty above the
   heading; `mansion--768--scroll4.png` has 530px between the section cut (y=195) and the
   first label (y=725). It reads as pacing on the moral section, where the texture fades in.
   It reads as unfinished on `mansion--1440--scroll3.png` and `paintings--1440.png`, where
   nothing occupies it. Counted under (a) and (c), not here.

### (e) TYPE CENSUS — **FAIL** (8 sizes at 1440, ~10 at 390; bar is 4)

Measured ink heights, chapter page, excluding the 85px display heading:

**1440**

| Size | Role | Where |
|---|---|---|
| 46px | section heading | `commissioners-office--1440--scroll2.png` "FROM THE SKETCH" |
| 25px | numerals | `mansion--1440.png` "(CH. 03)"; `--scroll1.png` "(01)" |
| 23–24px | **serif body, next-stop heading, moral sans body** | `mansion--1440--scroll1.png` (23), `--scroll5.png` "WASHINGTON STREET FERRY LANDING" (23), `--scroll4.png` moral body (24) |
| 16px | footer credit | `mansion--1440--scroll5.png` |
| 15px | footnote numeral | `mansion--1440--scroll3.png` "(1)" |
| 12px | hero eyebrow, address, button label | `mansion--1440.png`; `--scroll5.png` |
| 10px | "NEXT — STOP 04", "Share" | `mansion--1440--scroll5.png` |
| 9px | section eyebrow, footer link, hold pill | `mansion--1440--scroll1.png` "LISTEN"; `--scroll5.png` "THE PEOPLE OF THIS DAY"; `--scroll2.png` "PRESS AND HOLD…" |

**Near-identical pairs to flag:**
- **Three separate roles inside one 1px band (23/23/24).** Body prose, the next-stop
  destination name, and the moral paragraph are indistinguishable in size.
- **15px footnote numeral vs 16px footer credit.** 1px apart, unrelated roles.
- **9px vs 10px in the same footer row.** `mansion--1440--scroll5.png`: "THE PEOPLE OF THIS
  DAY" (9px cap) and "Share" (10px cap) sit 700px apart in one 40px band.

The micro-label family is now **12 / 10 / 9** — three sizes, down from P2's four. Improved,
not fixed.

**390** — 25 / 21–22 / 20 / 15 / 13 / 12 / 11 / 10 / 9 / **8** = ten sizes, and the
micro-label family is **four** (11 / 10 / 9 / 8). Worse than 1440.

**Phone legibility — worse than P2.** `mansion--390--scroll4.png` sets "THE MORAL" at **8px
cap height in orange over a dark engraving** (zoomed: `z_390_moral_lbl.png`). P2 flagged 9px
as unreadable outdoors; this build went below it. Also 9px: "THE SKETCH"
(`mansion--390--scroll2.png`), "NEXT — STOP 05" and all four footer links
(`mansion--390--scroll5.png`).

For comparison, `inspo/museos/spine-context-1440.png` uses two sizes on screen;
`inspo/pasqua/roots-1440-s2-y3108.png` uses three including nav.

### (f) BOX CENSUS — **FAIL** (5 containers per chapter viewport; bar is 1)

Counting containers only — pills, the menu control and the Mapbox controls excluded.

| # | Container | Treatment | Where |
|---|---|---|---|
| 1 | hero image | 16px radius **+ 1px rust stroke** | `mansion--1440.png`, `ferry--1440.png`, `bakery--1440.png` |
| 2 | cream narrative card | 24px radius + drop shadow | `commissioners-office--1440--scroll2.png` (corners at y=310), `ferry--1440--scroll2.png` (y=210), `barbershop--1440--scroll2.png` (y=565) |
| 3 | sketch image | 16px radius | `ferry--1440--scroll2.png`, `mansion--768--scroll2.png` |
| 4 | history photo | 16px radius | `commissioners-office--1440--scroll3.png`, `bakery--1440--scroll3.png` |
| 5 | map | 16px radius | `mansion--1440--scroll5.png`, `barbershop--1440--scroll5.png` |

Same count as P2. Per-page extras: `map--1440.png` adds a bordered "THE WALK · FIVE STOPS ·
APRIL 27, 1860" pill and a "DRAG TO EXPLORE · TAP A STOP" pill; `home--1440.png` wraps the
**entire page** in a rounded bordered card.

**An internal inconsistency worth naming:** `paintings--1440--scroll2.png` tiles have a
radius but **no** stroke; the chapter hero has a radius **and** a stroke. Two rules for
artwork on one site.

Nothing in the reference set does this. Pasqua: zero borders, zero radii on artwork.
Museos: zero. Google A&C: edge-to-edge tiles.

### (g) CRAFT DEFECTS — **FAIL**

In severity order.

**P0 — reads as a bug**

1. **Two map labels overlap.** `map--1440.png`, centre of frame (x≈790–880, y≈310–350) and
   `map--390.png` (x≈262–330, y≈300–330): the "1 Bakery" pill collides with the
   "2 Commissioner's Office" pill; the Bakery numeral badge is clipped by the other pill's
   body. Zoomed confirmation in `z_map_pins.png` / `z_map390_pins.png`.

2. **The menu button sits on the Mapbox attribution bar.** `map--1440.png` (button
   x1356–1428 / y816–888, attribution strip y884–898 — the button covers the "v" in
   "Improve"), `map--768.png` (button x684–756 / y940–1012 over the strip at y1008–1022),
   and `map--390.png`, where the button covers roughly half of a white circular Mapbox
   control at ≈(370, 825). Zoomed: `z_map_attr.png`, `z_map390_btn.png`.

**P1 — the "thrown together" tells**

3. **The primary nav control lives in two different corners depending on the route.**
   TOP-right on `home--*.png`, `about--*.png`, `people--*.png`, `paintings--*.png`.
   BOTTOM-right on all five chapters and `map--*.png`.

4. **The menu button is parked on the hero painting below 1024px.** Button x684–756 over an
   image ending at x=726: `mansion--768.png`, `commissioners-office--768.png`,
   `ferry--768.png`, `bakery--768.png`, `barbershop--768.png`. Button x310–372 over an image
   ending at x=369: every `*--390.png` chapter hero.

5. **The menu button's corner radius is asymmetric** — three tight corners and one much
   larger bottom-left. Visible at every size; zoomed in `z_home768_menu.png` and
   `z_map390_btn.png`. It matches no other shape in the build.

6. **The menu button breaks the home card's frame.** `home--1440.png`, `home--768.png`,
   `home--390.png`: the button straddles the card's rounded top-right corner, so the card's
   1px border runs into the button and terminates.

7. **The home display heading is right-aligned inside a centred composition.**
   `home--1440.png`: "CHARLES" spans x437–1003 and "NALLE" spans x620–1005 — both flush
   right at ≈1004 — while "TROY, NY", "1821 —— 1875", the Continue pill and the caption are
   all centred at x=720. Same at `home--768.png` (both lines end at 573) and `home--390.png`
   (both end at 316). Neither centred nor on a grid.

8. **The footer link row wraps ragged at every viewport.**
   `mansion--1440--scroll5.png`: 3 links on row 1, "THE WALK →" alone on row 2.
   `commissioners-office--768--scroll5.png`: 1 / 1 / 2 — with obvious empty space to the
   right of rows 1 and 2 where the next link would fit.
   `mansion--390--scroll5.png`: 1 / 2 / 1. Zoomed: `z_390_footer.png`.

9. **Footer credit widow.** "Charles Nalle Walking Memorial · Made by / **Notable**" on
   `mansion--1440--scroll5.png` and `mansion--390--scroll5.png`; three lines with the same
   orphan on `mansion--768--scroll5.png` and `commissioners-office--768--scroll5.png`.

10. **Three pill treatments in one footer view.** `mansion--1440--scroll5.png`, measured:
    "Continue the walk" filled 231×**48**, "Get directions" outlined 199×**48**, "Share"
    outlined 106×**38**. At 390 the Share pill goes full-width 350×40 while the two CTAs
    stay shrink-to-fit at 231 and 199, stacked left-aligned — two stacked pills of unequal
    width. On `map--1440.png` the CTAs are 40px tall, not 48.

11. **Icon side is inconsistent inside one frame.** `mansion--1440--scroll5.png`: arrow
    **trails** "Continue the walk" and the footer links, pin **leads** "Get directions",
    iOS share glyph **leads** "Share". (Arrow *weights* now match — that part of P2 #8 is
    fixed.)

12. **Redundant three-label section headers.** `(02)` + `THE SKETCH` + `FROM THE SKETCH` on
    `commissioners-office--1440--scroll2.png`, `ferry--1440--scroll2.png`,
    `mansion--390--scroll2.png`. `(04)` + `HISTORY` + `HISTORICAL CONTEXT` on
    `commissioners-office--1440--scroll3.png`, `commissioners-office--390--scroll3.png`,
    `barbershop--390--scroll3.png`.

13. **The hold instruction still appears twice in one frame.** Body sentence "Press and hold
    the study to let the finished painting develop under your hand." plus the on-image pill
    "PRESS AND HOLD TO BRING THE PAINTING TO LIFE": `mansion--1440--scroll2.png`,
    `mansion--768--scroll2.png`, `bakery--390--scroll2.png`.

14. **The hold pill wraps to two lines with an orphan at 390.** `bakery--390--scroll2.png`:
    "PRESS AND HOLD TO BRING THE PAINTING / TO LIFE", spanning x=45–345 inside an image that
    runs x=20–370 — 25px of clearance on each side.

15. **Image caption illegible over the artwork.** `commissioners-office--768--scroll3.png`,
    y≈245: "MARK PRIEST · NALLE SERIES" set in orange over bright yellow cobblestones.
    (Its right edge now lands on the content edge at x=727 — the P2 margin bug is fixed, but
    the placement introduced a contrast failure.)

16. **A pale image dissolves into the cream field.** `ferry--1440--scroll3.png`: the
    photo's sky and the page background are the same value, so the image has no top edge and
    no right edge. Same problem at `ferry--768--scroll3.png`.

17. **Cross-column baseline break.** `people--1440--scroll4.png`: "DEPUTY U.S. MARSHAL
    HOLMES" wraps to two lines, so the right column's body starts at y≈564 while the left
    column's ("HENRY 'JACK' WALE") starts at y≈538. Every other row in the grid aligns.

18. **The same component wraps two different ways.** `people--1440--scroll2.png` stacks the
    two chapter links under PETER BALTIMORE; `people--1440--scroll4.png` runs them inline
    under DEPUTY HOLMES.

19. **Widows and orphans in body copy.** `about--390.png` "of Troy." alone on the last line;
    `mansion--390--scroll3.png` "free Charles." alone (a 275px measure caused by a 55px
    numeral indent); `paintings--390--scroll2.png` "COMMISSIONER'S OFFICE — / PART 2".

20. **Unstyled third-party chrome.** `map--1440.png`, `map--768.png`, `map--390.png` all
    show the default Mapbox wordmark, the "500 ft" scale bar, the geolocate control, and the
    "© Mapbox © OpenStreetMap **Improve this map**" attribution bar. The wordmark also
    appears on every chapter `*--scroll5.png`.

21. **Two chapter-number conventions in one frame.** `mansion--1440.png` carries both
    "STOP 03 OF 5 · TROY, NY · APRIL 27, 1860" and "(CH. 03)".

22. **Section numerals are not a fixed structure.** "THE MORAL" is `(04)` on
    `mansion--1440--scroll4.png` and `ferry--1440--scroll4.png` but `(05)` on
    `commissioners-office--1440--scroll4.png`; "ONWARD" is `(05)` on
    `mansion--1440--scroll5.png` and `barbershop--1440--scroll5.png` but `(06)` on
    `commissioners-office--1440--scroll5.png`.

---

## Verification of every P2 defect

### FIXED (8)

| P2 # | Defect | Evidence |
|---|---|---|
| 1 | Floating menu button overlaps the Share button | The button is absent from **every** scrolled frame site-wide (detector run over all 165 files: it appears only in unscrolled base frames). `commissioners-office--768--scroll5.png`, `mansion--768--scroll5.png` show clean footers. |
| 2 | Menu button covers body copy on mobile | Same mechanism. `mansion--390--scroll1.png`, `mansion--390--scroll5.png`, `ferry--390--scroll5.png` all clean. |
| 3 | Section hairline three widths at 1440 | Now x136→1303 everywhere: `mansion--1440.png` y447, `commissioners-office--1440--scroll2.png` y507, `bakery--1440--scroll4.png` y280, `ferry--1440--scroll4.png` y654. |
| 4 | Moral section on two different grids | Label rail x=136/137 and heading x=477/481 on `mansion--1440--scroll4.png`, `ferry--1440--scroll4.png`, `commissioners-office--1440--scroll4.png`. |
| 5 | Display heading breaks the right margin | `ferry--1440--scroll4.png` "AUTHORITARIANISM" ends at x≈1296 against the 1303 content edge. |
| 6 | Eyebrow wraps to two lines | "THE MORAL" sits on one line in `ferry--1440--scroll4.png` and `commissioners-office--1440--scroll4.png`. |
| 7 | Caption on a different right margin | `commissioners-office--768--scroll3.png` caption ends at x=727 = the content edge. (But see new defect g-15.) |
| 16 | Same sketch as texture *and* as content | `mansion--1440--scroll4.png`, `ferry--1440--scroll4.png` use the sketch only as a full-bleed field. No thumbnail anywhere. P2 fix #23 (mobile reflow of that thumbnail) is fixed by deletion — `mansion--390--scroll4.png`. |

### PARTLY FIXED (3)

| P2 # | Defect | Status |
|---|---|---|
| 8 | Two arrow weights + mixed icon family + three pill heights | Arrow **weights** now match (`z_m_btns.png`, `z_390_footer.png`). Icon **side** still mixed and pill heights still 48/48/38. **See g-10, g-11.** |
| 13 | Three chapter-number conventions | "CHAPTER 2 \| PT. 1" is gone (now "LISTEN" / "LISTEN · PT 2"). "STOP 03 OF 5" and "(CH. 03)" still coexist in the hero. **See g-21.** |
| P2 fix 15 | Rebuild the footnote block | Real progress: the footnotes moved onto the cream field with orange numerals (`mansion--1440--scroll3.png`, `bakery--1440--scroll3.png`) instead of P2's dark text wall. But it is not full-bleed, there are no row rules, and the left third is still 0.15% ink. |

### STILL PRESENT (8)

| P2 # | Defect | Evidence it is still there |
|---|---|---|
| 9 | Bad line breaks / orphans in footnotes | `mansion--390--scroll3.png` "citizens to find and / free Charles." — a 55px numeral indent collapses the measure to ~275px at 390. `commissioners-office--390--scroll3.png` same. |
| 10 | Footer link row wraps ragged | **Worse** — now four links. 3-1 at 1440, 1-1-2 at 768, 1-2-1 at 390. |
| 11 | Three labels per section | `commissioners-office--1440--scroll2.png`, `mansion--390--scroll2.png`, `barbershop--390--scroll3.png`. |
| 12 | Hold instruction duplicated in one frame | `mansion--1440--scroll2.png`, `mansion--768--scroll2.png`, `bakery--390--scroll2.png`. |
| 14 | Menu button's lopsided corner radius | `z_home768_menu.png`, `z_map390_btn.png` — three tight corners, one large bottom-left. |
| 15 | Unstyled Mapbox chrome | **Worse** — `map--1440.png` now also exposes the attribution bar, scale bar and geolocate control. |
| P2 fix 14 | Borders and radii off the artwork | **Not done.** Hero carries a 16px radius *and* a 1px rust stroke (`mansion--1440.png` x=136 = `rgb(128,65,43)`). Five containers per chapter viewport, same as P2. |
| P2 fix 16 | Fill the empty left third with a chapter spine | **Not done.** A two-line label rail was added; the column below it is 0.15% ink (`mansion--1440--scroll3.png`) / 0.79% (`mansion--1440--scroll5.png`). No progress indicator, no section list, no sticky audio. |
| P2 fix 17 | Fixed hero image height | **Not done.** 2-line headings → 395px of painting (44%): `commissioners-office--1440.png`, `mansion--1440.png`. 3-line headings → **285px (32%)**: `bakery--1440.png`, `ferry--1440.png`, `barbershop--1440.png`. Three of five chapters open on a letterbox strip. |
| P2 fix 18 | Scroll cue + audio cue on the hero | **Not done.** No down-arrow and no player on any `*--1440.png` / `*--390.png` hero. "LISTEN" is a 9px eyebrow that appears only after the first scroll. Compare `inspo/googleac/story-1440-s01.png`, which puts a circled down-arrow at the bottom edge of every story hero. |

### NEW (12)

| # | Defect | Where |
|---|---|---|
| N1 | Two map labels collide | `map--1440.png` x≈790–880 y≈310–350; `map--390.png` x≈262–330 y≈300–330 |
| N2 | Menu button on the Mapbox attribution bar | `map--1440.png`, `map--768.png`, `map--390.png` |
| N3 | Menu button in two different corners by route | TR on home/about/people/paintings, BR on all chapters + map |
| N4 | Home heading right-aligned in a centred composition | `home--1440.png`, `home--768.png`, `home--390.png` |
| N5 | Menu button straddles the home card's corner | `home--1440.png`, `home--768.png`, `home--390.png` |
| N6 | Cross-column baseline break | `people--1440--scroll4.png` (left body y≈538, right body y≈564) |
| N7 | Same link component stacks in one column, runs inline in the other | `people--1440--scroll2.png` vs `people--1440--scroll4.png` |
| N8 | 8px cap-height label — below P2's failing 9px floor | `mansion--390--scroll4.png` "THE MORAL", orange on a dark engraving |
| N9 | Caption illegible over the artwork | `commissioners-office--768--scroll3.png` y≈245 |
| N10 | Pale history photo dissolves into the cream field | `ferry--1440--scroll3.png`, `ferry--768--scroll3.png` |
| N11 | Hold pill wraps to 2 lines with an orphan | `bakery--390--scroll2.png` |
| N12 | Pull quote at x=137 while its section body is at x=477; 14-line rag; right 46% void | `about--1440--scroll5.png` |
| N13 | Section numerals are not a fixed structure across chapters | `(04)` vs `(05)` for THE MORAL; `(05)` vs `(06)` for ONWARD |

---

## The five questions

### 1. Is this site beautiful? Plausible as an award submission?

**Not beautiful yet. Not plausible as a submission.**

It is now genuinely good in places, which it was not at P2. `mansion--1440--scroll4.png` —
a full-bleed engraving field, one 85px heading, one paragraph, two type sizes — would hold
its own next to `inspo/museos/detail1-1440-s0.png`. The dark→cream field cut at
`about--1440.png` y=408 is the kind of move that makes a scroll feel like moving through
rooms. The palette and the typeface pairing were always right, and the paintings are
genuinely strong.

What stops it: five rounded containers per chapter viewport, eight type sizes at 1440 and
ten at 390, a third of the desktop screen empty on four screens, and two collision bugs on
the orientation page. Juries reject on craft before they consider concept, and N1/N2 are
single-frame disqualifiers.

**Single weakest moment across the whole site: `map--1440.png` / `map--390.png`.**

It is the orientation screen for a walking tour — the second thing a QR visitor touches
after `home`. It ships with: two overlapping stop labels, the primary nav control sitting on
Mapbox's copyright line, four different pill treatments in one frame (a bordered header pill,
a "DRAG TO EXPLORE" pill, and two 40px CTAs that don't match the chapters' 48px spec), and
the only unstyled third-party UI kit on the site. It also never tells you the walking
distance, the order, or how long the walk takes — which is the one thing this page exists to
do.

**What I would do:** rebuild it as a designed plate rather than an embedded widget.
Collision-avoid the labels or replace them with five numbered dots plus a left-rail legend
listing the stops in order with distances — which simultaneously fills the empty left third
that fails everywhere else. Restyle or suppress the Mapbox controls and move attribution to
a single line in the site footer. Remove the floating menu button from the map surface
entirely. Match the two CTAs to the chapter spec: 48px, one filled, one outlined, equal
width.

Runner-up: `about--1440--scroll5.png`.

### 2. Is it immersive — a story you walk through, or a web page you read?

**Closer than P2, still a web page.**

What it now has that P2 lacked, and this is real progress:
- Full-bleed painting bands that run edge to edge — `mansion--1440--scroll2.png`,
  `bakery--1440--scroll2.png`.
- A full-bleed sketch field behind the moral heading rather than a bordered thumbnail —
  `mansion--1440--scroll4.png`, `ferry--1440--scroll4.png`.
- Hard colour-field cuts at section boundaries — `about--1440.png` y=408,
  `commissioners-office--768--scroll3.png` y=457, `ferry--1440--scroll4.png` y=94.

What pasqua and museos still have that this lacks:

- **A persistent spine.** `inspo/museos/detail1-1440-s0.png` and
  `inspo/museos/audio-rows-detail1-1440.png` carry the same header on every frame —
  "Museos para el Siglo XXI" left, a rule centre, "(Juan Manuel Blanes)" right. You always
  know where you are. Here the *only* persistent element is a hamburger that hides the
  moment you scroll, so while reading you have no orientation at all — on a product where
  the visitor is physically standing on a sidewalk between two stops.
- **Scale change.** Museos cuts from a 100px heading to a full-bleed painting to a 40px
  audio band. Pasqua cuts from a full-bleed photograph to a flat olive field
  (`inspo/pasqua/roots-1440-s0-y0.png`). Here the narrative is always the same 23px serif,
  in the same cream slab, in the same position, in every chapter. Sections 1, 3 and 5 of all
  five chapters are compositionally identical.
- **Arrival and departure as designed moments.** `mansion--1440--scroll5.png` ends the
  chapter on a grey Mapbox tile and two pills.
- **The audio treated as the point.** `inspo/museos/audio-rows-detail1-1440.png` makes it
  three full-bleed rows at 60px with play buttons. Here the site's best asset is announced by
  a **9px** orange eyebrow reading "LISTEN" in a rail — the smallest type on the page.
- **The hold interaction as an event.** It is still a translucent tooltip pill over a busy
  sketch (`ferry--1440--scroll2.png`), plus a duplicate sentence in the body copy, and at
  390 it wraps to two lines (`bakery--390--scroll2.png`).

### 3. Mobile (390): better or worse than desktop?

**Better — the reverse of P2, and the right way round for a sidewalk QR product.**

Why it wins: the label rail stacks above the heading instead of sitting in a column, so the
empty left third disappears entirely; the cream field goes full-bleed edge to edge
(`mansion--390--scroll1.png`); the menu button no longer eats body copy; and every 390 frame
sampled survives the 8px squint test, where four 1440 frames collapse. `mansion--390.png`
shows 498px of painting in an 844px frame (59%) — the best hero on the site.

Where it falls down:
- **8px and 9px cap-height labels.** `mansion--390--scroll4.png` "THE MORAL" at 8px, orange
  on a dark engraving. `mansion--390--scroll2.png` "THE SKETCH" 9px.
  `mansion--390--scroll5.png` footer links 9px. Not readable one-handed in daylight.
- **The footnote measure collapses to ~275px** because the numeral takes a 55px indent —
  `mansion--390--scroll3.png` produces "citizens to find and / free Charles."
- **Footer links wrap 1-2-1** with obvious space on row 1 (`mansion--390--scroll5.png`).
- **Two stacked CTA pills of unequal width** — 231 and 199 — then a 350px full-width Share
  pill 10px shorter (`mansion--390--scroll5.png`).
- **The menu button sits on the hero painting's bottom-right corner** on every
  `*--390.png` chapter hero.
- **`map--390.png` is the worst mobile frame on the site** — pin collision plus the button
  covering a Mapbox control.

### 4. Which page is the weakest of the ten?

**`map`.** Two collision bugs (N1, N2), four pill treatments in one frame, CTAs that are
40px where every other page uses 48px, the only unstyled third-party UI on the site, and it
fails at its actual job — no distance, no order, no duration. For a walking tour this is the
most functionally important page after the chapters, and it is the least designed.

**Runner-up: `paintings`.** `paintings--1440.png` gives an entire 900px viewport to a
heading and a three-line paragraph with 45% of the frame empty and **no painting on it**;
`paintings--390.png` puts the first artwork at y=697, so a phone user scrolls almost a full
screen of text on a page called The Nalle Series. Compare `inspo/googleac/story-1440-s01.png`,
which gives a whole viewport to one image. Ironically the grid below is the best-executed
component in the build — borderless tiles, consistent gutters, clean captions.

### 5. Do the five chapter pages feel like one template applied with care?

**Yes — the template itself is now consistent. It breaks by heading length, not by chapter.**

Verified identical across all five: label rail at x=136/137; content column at x=477/481;
section rule x136→1303; 560px lead-in to the moral section; ~195px section gap; ~190px
CTA-to-footer gap; identical footer. **P2's grid break — ferry's moral section rendering at
x=254 — is gone.** No single chapter breaks.

The two places the template does not hold:

1. **Hero image height varies by heading length, and the majority lose.**
   `commissioners-office--1440.png` and `mansion--1440.png` have 2-line headings and show
   **395px of painting (44%)**. `bakery--1440.png`, `ferry--1440.png` and
   `barbershop--1440.png` have 3-line headings and show **285px (32%)** — a letterbox strip
   above two-thirds of empty brown. **Bakery is Chapter 1**, so the weakest hero on the site
   is the first one a visitor sees.

2. **Section numerals are not a fixed structure.** `commissioners-office` has six sections
   to everyone else's five, so "THE MORAL" is `(05)` there and `(04)` elsewhere, and
   "ONWARD" is `(06)` vs `(05)`. The `(0n)` numerals read as a fixed chapter skeleton and
   aren't one.

**Strongest chapter: `mansion`** — 44% hero, the cleanest moral frame in the build
(`mansion--1440--scroll4.png`). **Weakest: `bakery`** — 32% hero on the walk's opening
chapter, and `bakery--1440--scroll2.png` carries the duplicate hold instruction plus 195px
of dead band above the full-bleed painting.

---

## Prioritized fix list

Most damaging first. Every item names the file, the frame position, and the change.

**P0 — reads as a bug, fix before the client sees this again**

1. **Two map labels overlap.**
   `map--1440.png` (Bakery pill x≈790–880 / y≈310–350 colliding with Commissioner's Office
   pill x≈650–862) and `map--390.png` (x≈262–330 / y≈300–330, the Bakery numeral badge is
   clipped). Add collision avoidance to the label layer, or drop to numbered dots on the map
   with the stop names in a legend rail. Verify at all three viewports and at the default
   zoom the page actually loads with.

2. **The menu button sits on the Mapbox attribution bar.**
   `map--1440.png` bottom-right (button x1356–1428 / y816–888 over the strip at y884–898),
   `map--768.png` (button x684–756 / y940–1012 over the strip at y1008–1022), `map--390.png`
   (button covers ~half of the white circular control at ≈370,825). Remove the floating
   button from the map surface entirely and place the map's own controls on a reserved rail,
   or move attribution into the site footer.

**P1 — the "thrown together" tells**

3. **Pin the hero image to a constant fraction of viewport height.**
   `bakery--1440.png`, `ferry--1440.png`, `barbershop--1440.png` show 285px (32%);
   `mansion--1440.png` and `commissioners-office--1440.png` show 395px (44%). Cap the display
   heading's line count or set the image to a fixed `min-height` so every chapter opens on the
   same amount of painting. Target the 44% figure; verify all five chapters at 1440, 768, 390.

4. **Put the menu button in one corner and keep it off the artwork.**
   Currently top-right on `home--*.png`, `about--*.png`, `people--*.png`, `paintings--*.png`
   and bottom-right on all five chapters and `map--*.png`. Pick one. Then reserve a safe area
   so it stops landing on the hero painting at `mansion--768.png` (x684–756 over an image
   ending at x=726) and every `*--390.png`, and stops straddling the card corner on
   `home--1440.png` / `--768.png` / `--390.png`.

5. **Take the radii and the stroke off the artwork.**
   Hero (`mansion--1440.png` — a 16px radius *and* a 1px `rgb(128,65,43)` stroke at x=136),
   cream narrative card (`commissioners-office--1440--scroll2.png`, 24px radius + shadow at
   y=310), sketch (`ferry--1440--scroll2.png`), history photo
   (`commissioners-office--1440--scroll3.png`), map (`mansion--1440--scroll5.png`), paintings
   tiles (`paintings--1440--scroll2.png`). Hard-edged and borderless, per
   `inspo/pasqua/roots-1440-s2-y3108.png`. This takes the box census from 5 to 0–1 in one
   pass and is still the single highest-leverage change on the list — it was P2 fix #14 and
   was not done.

6. **Collapse the micro-label sizes to one, at 12px cap minimum.**
   1440 currently runs 12px (`mansion--1440.png` hero eyebrow) / 10px
   (`mansion--1440--scroll5.png` "NEXT — STOP 04", "Share") / 9px (`--scroll1.png` "LISTEN",
   `--scroll5.png` footer links, `--scroll2.png` hold pill). 390 runs 11 / 10 / 9 / **8**
   (`mansion--390--scroll4.png` "THE MORAL"). One token, 12px cap floor at every viewport.
   This alone removes three sizes at 1440 and four at 390.

7. **Fix the footer link block.**
   `mansion--1440--scroll5.png` wraps 3-then-1; `commissioners-office--768--scroll5.png`
   wraps 1-1-2 with obvious empty space on rows 1 and 2; `mansion--390--scroll5.png` wraps
   1-2-1. Set it as an explicit 2×2 or a single stack rather than a column-flow that fills
   column 1 first. While in there, fix the credit widow — "…Made by / **Notable**" — with a
   non-breaking space or a shorter string.

8. **Unify the button system.**
   `mansion--1440--scroll5.png`: "Continue the walk" 231×48 filled, "Get directions" 199×48
   outlined, "Share" 106×38 outlined; `map--1440.png` CTAs are 40px. One pill height (48),
   one icon side — put every icon on the same side or drop the pin and share glyphs entirely.
   At 390 make the two stacked CTAs equal width (`mansion--390--scroll5.png`, currently 231
   and 199).

**P2 — the difference between "fine" and the bar**

9. **Fill the left rail with a chapter spine.**
   `mansion--1440--scroll3.png` (0.15% ink in x=0–475), `mansion--1440--scroll5.png` (0.79%),
   `people--1440--scroll2.png`, `people--1440--scroll4.png`. Put the stop number, the section
   list with the current one marked, scroll progress and a sticky audio control there, per
   `inspo/museos/spine-context-1440.png`. This closes the dead-space gap, the hierarchy gap
   and the orientation gap with one component.

10. **Cut the redundant section labels.**
    `(02)` + `THE SKETCH` + `FROM THE SKETCH` (`commissioners-office--1440--scroll2.png`,
    `mansion--390--scroll2.png`); `(04)` + `HISTORY` + `HISTORICAL CONTEXT`
    (`commissioners-office--1440--scroll3.png`, `barbershop--390--scroll3.png`). Keep the
    numeral and the heading; delete the eyebrow. Then give
    `mansion--1440--scroll3.png` an actual heading so the frame has a winner.

11. **Remove the duplicated hold instruction and redesign the affordance.**
    `mansion--1440--scroll2.png`, `mansion--768--scroll2.png`, `bakery--390--scroll2.png`
    carry both the body sentence and the on-image pill. Delete the body sentence, and make the
    on-image cue a designed element rather than a translucent tooltip that wraps to two lines
    with a "TO LIFE" orphan at 390.

12. **Add a scroll cue and an audio cue to every hero.**
    All ten `*--1440.png` / `*--768.png` / `*--390.png` base frames. A down-arrow at the
    bottom edge per `inspo/googleac/story-1440-s01.png`, and a visible "Listen — 1:10"
    affordance so a QR visitor knows there is narration before scrolling. Right now the only
    audio signal on the entire site is a 9px eyebrow reading "LISTEN".

13. **Rebuild `about--1440--scroll5.png`.**
    The pull quote sits at x=137 in a 628px column producing 14 ragged lines, while the
    section body it belongs to starts at x=477, and the right 46% of the frame is empty. Put
    the quote on the content grid at a ~65ch measure, or make it a full-bleed inverted band.

14. **Give `ferry--1440--scroll3.png` and `ferry--768--scroll3.png` an edge.**
    The pale historical photo's sky is the same value as the cream field, so the image has no
    top or right edge and the frame is one flat plane at 8px blur. Either invert the field
    behind it or crop to a darker portion.

15. **Fix the `paintings` hero.**
    `paintings--1440.png` gives a full viewport to a heading and a paragraph with no artwork
    and 45% empty; `paintings--390.png` puts the first painting at y=697. Bring one painting
    above the fold — ideally full-bleed, per `inspo/googleac/story-1440-s01.png`.

16. **Fix the `people` grid.**
    `people--1440--scroll4.png`: "DEPUTY U.S. MARSHAL HOLMES" wraps to two lines so the right
    column's body starts 26px below the left's. Set a fixed height for the name slot.
    `people--1440--scroll2.png` vs `--scroll4.png`: make the chapter-link rows wrap the same
    way in both columns.

17. **Fix the mobile footnote measure.**
    `mansion--390--scroll3.png`, `commissioners-office--390--scroll3.png`: the 55px numeral
    indent leaves a ~275px measure (~24 characters) at 22px serif, producing orphans like
    "free Charles." Hang the numeral in the margin below 480px so the text runs the full
    column.

18. **Move or restyle the image caption.**
    `commissioners-office--768--scroll3.png` y≈245: "MARK PRIEST · NALLE SERIES" in orange
    over bright yellow cobblestones is unreadable. Put it below the band on the content grid.

19. **Align the home hero.**
    `home--1440.png`, `home--768.png`, `home--390.png`: the display heading is flush right
    (both lines ending at ≈1004 / 573 / 316) inside a composition where everything else is
    centred. Centre it or left-align the whole block.

20. **Pick one chapter-number convention and one section skeleton.**
    `mansion--1440.png` shows both "STOP 03 OF 5" and "(CH. 03)". And `THE MORAL` is `(04)`
    on `mansion--1440--scroll4.png` but `(05)` on `commissioners-office--1440--scroll4.png`.
    Either give every chapter the same section count, or stop numbering sections.

21. **Style or suppress the remaining Mapbox chrome.**
    Wordmark on every chapter `*--scroll5.png`; wordmark, scale bar, geolocate control and
    attribution bar on `map--1440.png`, `map--768.png`, `map--390.png`.

22. **Fix the menu button's corner radius.**
    Every viewport, every route. Three tight corners and one much larger bottom-left
    (`z_home768_menu.png`, `z_map390_btn.png`). It matches no other shape in the build, so it
    reads as a rendering accident rather than a mark.
