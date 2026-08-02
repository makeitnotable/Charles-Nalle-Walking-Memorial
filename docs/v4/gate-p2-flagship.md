# Acceptance Gate — P2 Flagship Chapter Pages

**Verdict: DOES NOT PASS. 0 of 7 rubric items pass.**

Reviewed: all 48 frames in `docs/v4/qa/p2-flagship/` (routes `commissioners-office`
and `ferry`; viewports 390 / 768 / 1440; base + scroll1–7).
Bar: `docs/v4/qa/inspo/pasqua/`, `docs/v4/qa/inspo/googleac/`, `docs/v4/qa/inspo/museos/`
— all three present and populated; all three used.

The client's previous verdict was "sloppy and thrown together." Several defects in this
build would produce that verdict again, and two of them are outright bugs a client will
see in the first thirty seconds: a floating button parked on top of the Share button, and
the same button eating words out of the middle of the body copy on a phone.

---

## Rubric

### (a) SIDE-BY-SIDE — **FAIL**

Pairing put up: `commissioners-office--1440--scroll4.png` (HISTORICAL CONTEXT) against
`inspo/museos/spine-context-1440.png` (CONTEXTO HISTÓRICO). Same content type, same dark
field, same idea.

Museos: one giant flush-left heading at x=22 running the full frame, `(5)` alone in the
left column, body in the right. No rules, no eyebrows, no boxes. Two type sizes on screen.

Ours: the number `(04)`, the eyebrow `HISTORY`, **and** the heading `HISTORICAL CONTEXT`
— three labels for one section — plus an orphan 275px hairline at y=409 that exists in no
other section at the same width. The heading is pushed to x=477 while the label sits at
x=137, so the eye has to cross an empty 340px gutter to get from the number to the title.

What gives it away as the cheaper one, concretely:

1. **The rounded-border box habit.** Every image on our page is a rounded rectangle with a
   1px light border — `commissioners-office--1440.png` (hero), `--scroll3.png` (sketch),
   `--scroll4.png` (brick photo), `--scroll7.png` (map), `ferry--1440--scroll6.png`
   (small sketch). Pasqua (`roots-1440-s2-y3108.png`, four portraits) and Museos
   (`detail1-1440-s2.png`, circular mask) use **hard-edged, borderless** images. Google
   A&C (`story-1440-s01.png`) goes edge-to-edge. Borders + radii on artwork is the single
   loudest "template" tell in the whole build.
2. **A third of the desktop screen is empty.** Measured ink coverage in the band x=0–477:
   `commissioners-office--1440--scroll5.png` **0.00%**, `ferry--1440--scroll5.png`
   **0.00%**, `commissioners-office--1440--scroll1.png` 0.15%,
   `commissioners-office--1440--scroll2.png` 0.11%. Four consecutive desktop screens
   where 33% of the viewport is literally blank. Pasqua's asymmetry always has a
   counterweight (`vision-1440-s4-y3194.png`: left void balanced by the NEXT arrow at
   right). Ours has nothing.
3. **Our display heading is the only thing doing any design work.** Strip the 85px
   headline from `commissioners-office--1440.png` and what's left is an eyebrow, a hairline
   and a bordered picture.

### (b) HIERARCHY SCAN — **FAIL**

Winner named per frame, 3-second glance:

| Frame | Winner | Verdict |
|---|---|---|
| `commissioners-office--390.png` | display heading | OK |
| `commissioners-office--768.png` | display heading vs. painting — **tie** | fail |
| `commissioners-office--1440.png` | display heading | OK |
| `commissioners-office--1440--scroll1.png` | cream card | OK |
| `commissioners-office--1440--scroll3.png` | the white sketch image, **not** the heading | fail — the section is titled "FROM THE SKETCH" but the 45px heading loses to a 640×426 near-white image |
| `commissioners-office--1440--scroll4.png` | full-bleed painting band (top) vs. brick photo (bottom) — **tie**, heading loses to both | fail |
| `commissioners-office--1440--scroll5.png` | **nothing** | fail |
| `commissioners-office--1440--scroll6.png` | heading, but only just — sits on a same-luminance engraving | marginal |
| `commissioners-office--1440--scroll7.png` | orange CTA pill | OK |
| `commissioners-office--390--scroll5.png` | **nothing** | fail |
| `ferry--1440--scroll5.png` | **nothing** | fail |
| `ferry--1440--scroll6.png` | heading — but it breaks the right margin (see g) | fail as composed |
| `ferry--768--scroll5.png` | **nothing** | fail |

Six frames with no winner or a two-way tie. The "nothing wins" frames are all the
footnote/history block, which is a wall of 22px serif with no image, no heading, and no
rule anywhere in the viewport.

### (c) SQUINT TEST — **FAIL**

Blurred all frames at 8px (`squint-1440`, `squint-390` montages).

Holds up: the hero frames (heading block over image block), `--scroll1` (cream card is a
clean light plane on dark), `--scroll7` (map plane + orange pill).

Collapses:
- `commissioners-office--1440--scroll5.png` and `ferry--1440--scroll5.png` — at 8px the
  entire frame is one undifferentiated warm-grey band. No plane, no anchor, no edge. This
  is the exact failure the rubric describes.
- `commissioners-office--390--scroll5.png`, `ferry--768--scroll5.png` — same.
- `commissioners-office--390--scroll6.png` — the heading and the engraving texture behind
  it blur to the same value; the composition goes flat grey.
- `commissioners-office--1440--scroll4.png` — the `(04) / HISTORY` label at x=137 vanishes
  entirely at 8px. It contributes nothing to structure.

Compare `inspo/museos/audio-rows-detail1-1440.png`: at 8px it is three hard full-bleed
bands, light/dark/dark, that still read as a designed rhythm. That is what the footnote
block should be doing and isn't.

### (d) SPACING — **FAIL**

The good news first: **section-level vertical rhythm is on a system.** Measured
element-bottom to next-section-rule: 1440 ≈ 200px (`--scroll3` 202, `--scroll4` 204,
`--scroll7` 198); 768 ≈ 160px (163, 159); 390 ≈ 125px (128, 123, 125). Consistent.

It fails on two counts anyway:

1. **Arbitrary heading→body gaps.** Same-size headings (44px cap in both), different gaps:
   - `commissioners-office--1440--scroll3.png`: "SKETCH" baseline y=545 → body y=601 = **56px**
   - `commissioners-office--1440--scroll4.png`: "CONTEXT" baseline y=520 → image y=585 = **65px**

   56 vs 65 is the classic mistake gap — visible, but too close to read as intent.
   (`--scroll6` is 82px, but that heading is 88px cap, so it's defensible.)

2. **Dead space that reads as unfinished, not as pacing.** The 0.00% / 0.11% / 0.15% ink
   readings above. On `commissioners-office--1440--scroll5.png` and
   `ferry--1440--scroll5.png` a third of the screen is empty for the full height of the
   frame with no element to justify it. Deliberate negative space has an edge you can
   point to; this has none.

### (e) TYPE CENSUS — **FAIL** (≈12 distinguishable sizes at 1440, excluding the display heading)

Measured cap / ascender heights:

| Style | Size | Where |
|---|---|---|
| Section heading | 45px cap | `--scroll3` FROM THE SKETCH |
| Pull quote | ~40px | `--scroll2` "Drag him to the river!" |
| Parenthetical numeral | 24px | `(CH. 02)`, `(03)`, `(04)` |
| Next-stop heading | 22px cap | `--scroll7` URI GILBERT HOME |
| Serif body | 22px | cream card / history / footnotes |
| Footer credit | 16px | `--scroll7` "Charles Nalle Walking Memorial…" |
| Footnote marker | 14px | `--scroll5` `(3)` |
| Track title / address | 12px | `--scroll1` "Commissioner's Office"; `--scroll7` "189 Second Street" |
| Eyebrow A | **12px cap** | `commissioners-office--1440.png` "STOP 02 OF 5 · TROY, NY…" |
| Eyebrow B | **11px cap** | `--scroll1` "CHAPTER 2 \| PT. 1" |
| Eyebrow C | **10px cap** | `--scroll7` "NEXT — STOP 03"; `--scroll1` "01:10" |
| Eyebrow D | **9px cap** | "THE SKETCH", "TAP ANY PARAGRAPH…", "MARK PRIEST · NALLE SERIES", "THE PEOPLE OF THIS DAY" |

**Four sizes of the same uppercase micro-label** (12 / 11 / 10 / 9). Three of them appear
inside one 80px-tall component: in `commissioners-office--1440--scroll1.png` the audio bar
carries "CHAPTER 2 | PT. 1" (11px cap), "Commissioner's Office" (12px) and "01:10" (10px)
stacked within 35 vertical pixels. Those are the mistake-adjacent pairs.

Phone legibility: `commissioners-office--390--scroll3.png` "THE SKETCH" and
`--scroll4.png` "MARK PRIEST · NALLE SERIES" render at 9px cap height on a 390px screen —
too small to read comfortably at arm's length in daylight, which is the actual use case.
`--scroll5.png` footnote markers `(4)` `(5)` are smaller still.

For comparison, `inspo/museos/spine-context-1440.png` uses **two** sizes on screen;
`inspo/pasqua/roots-1440-s2-y3108.png` uses three including nav.

### (f) BOX CENSUS — **FAIL** (2–5 boxes per viewport; bar is 1)

| Frame | Framed/bordered elements | Count |
|---|---|---|
| `commissioners-office--1440.png` | hero image (radius + 1px border), floating menu button | 2 |
| `commissioners-office--1440--scroll1.png` | cream card, menu button | 2 |
| `commissioners-office--1440--scroll3.png` | cream card (bottom still in frame), sketch image, "PRESS AND HOLD" pill, menu button | 4 |
| `commissioners-office--1440--scroll7.png` | map, "Continue the walk" pill, "Get directions" pill, "Share" pill, menu button | **5** |
| `commissioners-office--390--scroll7.png` | map, 2 CTA pills, full-width Share pill, menu button | **5** |
| `ferry--1440--scroll2.png` | cream card + rounded image nested inside it, menu button | 3 (one nested) |
| `ferry--1440--scroll6.png` | small sketch image (radius + border), menu button | 2 |

Nothing in the reference set does this. Pasqua: zero borders, zero radii, zero pills except
the `EN – IT` toggle. Museos: zero. Google A&C: edge-to-edge tiles, one `Sign in` pill.

Three different pill heights coexist in `commissioners-office--1440--scroll7.png`: CTA
pills 48px tall, Share pill 38px tall, menu button 72px square.

### (g) CRAFT DEFECTS — **FAIL**

Hunted specifically. Found, in severity order:

1. **Floating menu button sits on top of the Share button.**
   `commissioners-office--768--scroll7.png` and `ferry--768--scroll7.png`, bottom right.
   The button's rounded corner covers the "e" of "Share" and its 1px orange border runs
   straight through the Share pill's own border — a double-border collision. This is not a
   near-miss; it is overlap. Reads as a bug.

2. **The menu button eats body copy on mobile.**
   - `commissioners-office--390--scroll1.png`, right edge at y≈760–830: covers the "t" of
     "rang ou**t**" mid-word.
   - `commissioners-office--390--scroll5.png`: covers "Buildi**ng**," on one line and
     "prepa**red**" on the next — two consecutive lines truncated mid-word.
   - `ferry--390--scroll6.png`: covers the end of "using your voice & the pre**ss**".
   - `ferry--768--scroll6.png`: same block, same occlusion.
   There is no gutter, shim, or safe-area reserved for it.

3. **The section-header hairline is three different widths on one page — at 1440 only.**
   - `commissioners-office--1440--scroll3.png` y=321: x136→595, **459px**
   - `commissioners-office--1440--scroll4.png` y=409: x136→411, **275px**
   - `ferry--1440--scroll6.png` y=70: x136→185, **50px**
   At 390 and 768 the same rule is full content width (350px / 677px). So at desktop the
   rule isn't a designed element at all — it's whatever the label column happens to be
   that section.

4. **Same component renders on two different grids across the two chapters.**
   The "moral" section:
   - `commissioners-office--1440--scroll6.png`: heading x=482, body x=477, sub-block x=825 — the standard grid.
   - `ferry--1440--scroll6.png`: heading x=254, body x=253, sub-block x=601 — a grid that exists nowhere else.
   The heading auto-fits to width, so the longer word "AUTHORITARIANISM" drags the whole
   layout left with it.

5. **Display heading breaks the right margin.**
   `ferry--1440--scroll6.png`: "AUTHORITARIANISM" runs to x=1424 — 16px from the viewport
   edge — while every other element on the page stops at x=1303. 121px of overhang.

6. **Eyebrow label wraps because its column collapsed.**
   `ferry--1440--scroll6.png` top left: "THE MORAL" breaks to "THE / MORAL" on two lines
   inside a ~50px column. Same label sits on one line in
   `commissioners-office--1440--scroll6.png`.

7. **Image caption uses a different right margin than everything else.**
   `commissioners-office--1440--scroll4.png` and `ferry--1440--scroll4.png`: "MARK PRIEST ·
   NALLE SERIES" ends at x=1381; every other element on the page ends at x=1303. A 78px
   inconsistency, clearly visible against the page edge.

8. **Two arrow weights and a mixed icon family in one 40px-tall footer row.**
   `commissioners-office--1440--scroll7.png`: the arrow inside "Continue the walk" is a
   heavy ~2.5px stroke with a large head; the arrows on "THE PAINTINGS →" / "ABOUT THE
   MEMORIAL →" are ~1.5px with a small head; "Share" uses an iOS-style share glyph.
   Icon placement is also inconsistent — arrow **trails** on "Continue the walk", pin
   **leads** on "Get directions", share glyph **leads** on "Share".

9. **Awkward break / double short line.**
   `ferry--390--scroll5.png`, footnote (3): "…By 1860, when Charles / **Nalle escaped,
   Georgia** / had as many as 462,198 / **enslaved people.**" Line 2 ends 40% short of the
   measure with "had" easily fitting; line 4 is a two-word orphan. Reads as a manual break,
   not typesetting.

10. **Footer link row wraps 1-then-2 on mobile.**
    `commissioners-office--390--scroll7.png` / `ferry--390--scroll7.png`: "THE PEOPLE OF
    THIS DAY →" alone on row 1, "THE PAINTINGS →" and "ABOUT THE MEMORIAL →" on row 2.
    Ragged, unbalanced, obviously accidental.

11. **Redundant labelling.** Every section carries three labels that say the same thing:
    `(03)` + `THE SKETCH` + `FROM THE SKETCH`; `(04)` + `HISTORY` + `HISTORICAL CONTEXT`.

12. **The same instruction appears twice in one frame.** `ferry--1440--scroll3.png`: the
    paragraph "Press and hold the study to let the finished painting develop under your
    hand." and, 200px to its right, the pill "PRESS AND HOLD TO BRING THE PAINTING TO LIFE".

13. **Three naming conventions for one chapter number, on one page.** "STOP 02 OF 5"
    (hero eyebrow), "(CH. 02)" (hero numeral), "CHAPTER 2 | PT. 1" (audio bar) — and
    `ferry--1440--scroll1.png` drops the part entirely: "CHAPTER 4".

14. **Menu button shape is an orphan.** `commissioners-office--1440--scroll7.png`, zoomed:
    a squircle with three tight corners and one much larger bottom-right radius. That
    asymmetric radius appears on no other element in the build, so it reads as a rendering
    accident rather than a mark.

15. **Unstyled third-party artifact.** The Mapbox wordmark sits in the bottom-left of the
    map in `commissioners-office--390--scroll7.png`, `--768--scroll7.png`,
    `--1440--scroll7.png`, `ferry--*--scroll7.png` at default styling.

16. **Same artwork used as texture and as content in one frame.**
    `commissioners-office--1440--scroll6.png`: the rescue sketch fills the background at low
    opacity *and* appears as a 300px bordered thumbnail on top of itself.

---

## The four questions

### 1. Is it beautiful? Would it survive an award submission?

No, and no. It is **competent** — the typeface pairing is good, the palette (warm
near-black `#1D1411`, cream `#F6F3EE`, the orange accent) is right for the subject, and the
paintings are genuinely strong. But competent is not the bar. Three things stop it being
beautiful: the artwork is imprisoned in bordered boxes instead of being allowed to fill the
frame; a third of the desktop viewport is empty for four straight screens; and the type
system has four near-identical micro-label sizes, which is what "sloppy" actually looks
like at a technical level.

Award juries reject on craft defects before they consider the concept. Defects 1, 2 and 5
above (button over button, button over text, heading breaking margin) are single-frame
disqualifiers.

**Single weakest moment in the whole scroll:** `commissioners-office--1440--scroll5.png` /
`ferry--1440--scroll5.png` — the footnote-plus-history block. Zero ink in the left third,
no image, no heading, no rule, no colour, just ~700px of 22px serif in two stacked lists
that use the same type size. It fails the squint test, fails the hierarchy scan, and it is
where a visitor stops scrolling.

**What I'd do about it:** kill the block as a text dump. Make the footnotes a full-bleed
inverted band — cream field, dark text, edge-to-edge, one fact per row with a hairline
between rows, exactly the move `inspo/museos/audio-rows-detail1-1440.png` makes. That gives
the squint test a hard plane to grab, gives the eye a reason to slow down, and uses the
empty left third instead of pretending it isn't there. Then let the "history" prose sit in
a single ~65ch column with a period photograph pinned into the left rail.

### 2. Is it immersive?

It reads as a **web page**, not a walk. Specifically:

- **The story is delivered inside a card.** `commissioners-office--1440--scroll1.png`: the
  narrative — the actual reason the site exists — is a cream rounded rectangle floating on
  brown. A card is a container for a list item. Pasqua and Museos never put narrative in a
  container; they let the field itself change (`inspo/pasqua/roots-1440-s0-y0.png` cuts
  from photograph to solid olive; `inspo/museos/detail1-1440-s0.png` cuts from black to
  full-bleed painting). Colour-field cuts are what make a scroll feel like moving through
  rooms.
- **The paintings never fill the frame.** Only `--scroll4` goes full-bleed, and only as a
  ~200px band. Google A&C gives an entire viewport to one image
  (`inspo/googleac/story-1440-s01.png`, `story-1440-s05.png`).
- **No sense of place or progress.** Museos carries a persistent top spine
  (`spine-context-1440.png`, `spine-references-390.png`) that tells you where you are in
  the piece at all times. We have a hamburger and nothing else. On a walking tour, where
  the visitor is physically standing between stops, that omission is expensive.
- **No arrival or departure.** `--scroll7` ends with a grey Mapbox tile and two pills.
  Compare `inspo/pasqua/vision-1440-s4-y3194.png`: "NEXT" set large with a drawn arrow, as
  a designed moment.
- **The one genuinely immersive idea is buried.** "Press and hold to bring the painting to
  life" (`ferry--1440--scroll3.png`) is the best thing in the build. It is announced by an
  8px-cap label on a translucent pill over a busy sketch, plus a duplicate sentence in the
  body copy. Museos' equivalent (`hold-during-1440.png`, `hold-before-390.png`) makes the
  hold a full-frame event.

What's missing versus the references, in one line: **scale changes and colour-field cuts.**
Every one of our screens is the same warm-brown field with content politely inset from it.

### 3. Mobile (390) specifically

**Worse than desktop**, which is the wrong way round for a QR-code-on-a-sidewalk product.

What's better on mobile: the section-header rule is full content width (350px) instead of
the arbitrary 459/275/50px stubs, and there's no empty left column because the single
column fills the screen.

Where it falls down:

- **The menu button occludes body text on three separate screens** —
  `commissioners-office--390--scroll1.png`, `--scroll5.png`, `ferry--390--scroll6.png` —
  cutting words mid-syllable. On desktop it only crowds; on mobile it destroys.
- **9px cap-height labels.** "THE SKETCH" (`--390--scroll3.png`), "MARK PRIEST · NALLE
  SERIES" (`--390--scroll4.png`). Outdoors, one-handed, that is not readable.
- **The "make a difference" block doesn't reflow.** `ferry--390--scroll6.png`: the sketch
  stays a 220px square pinned left with ~130px of dead space beside it, then the text runs
  full width below. On a 390px screen the image should be full-bleed.
- **The moral heading rags badly.** `commissioners-office--390--scroll6.png`: "WHEN NOT /
  CHALLENGED / INJUSTICE / THRIVES" — four lines, one of them two words and three of them
  single words, over a busy engraving at near-identical luminance.
- **Three pill treatments stacked.** `--390--scroll7.png`: "Continue the walk" 231×48
  shrink-to-fit, "Get directions" 199×48 shrink-to-fit, "Share" 350×38 full-width. Three
  widths, two heights, in one 480px stretch.
- **Footer links wrap 1-then-2.**
- The hero is the strongest mobile frame — `commissioners-office--390.png` and
  `ferry--390.png` both hold. Everything after scroll2 degrades.

### 4. The hero — enough authority for a sidewalk QR scan?

**Not quite, and it's inconsistent between chapters.**

`commissioners-office--390.png` is close. The eyebrow gives location and date, the numeral
gives position in the walk, the heading is large and confident, and ~530px of the painting
is visible below the rule. That is 63% of the frame carrying image. It works.

Then it falls apart by viewport and by chapter, because nothing about the hero is fixed —
the heading auto-wraps and pushes everything below it:

- `commissioners-office--768.png`: 590px of image in a 1024px frame (58%).
- `commissioners-office--1440.png`: 390px of image in a 900px frame (43%).
- `ferry--1440.png`: the heading takes three lines, so only a **290px letterbox strip** of
  painting survives above the fold — **32%**. The opening frame of the Ferry Landing
  chapter is two-thirds empty brown.

Three further problems with the hero as an arrival moment:

- **No scroll cue.** Google A&C puts a circled down-arrow at the bottom of every story hero
  (`inspo/googleac/story-1440-s00.png`, `story-390-s00.png`). Someone standing on a
  sidewalk with a phone needs to be told there's more.
- **No audio cue.** The site's best feature is narrated audio, and there is no sign of it
  until the visitor scrolls past the hero.
- **The painting is in a bordered box.** It reads as an illustration accompanying a title,
  not as the place you are standing in. Pasqua's `roots-390-s0-y0.png` puts the title *on*
  the image; Museos' `detail1-390-s0.png` runs the painting to all four edges.

---

## Prioritized fix list

Most damaging first. Every item names the file, the frame position, and the change.

**P0 — reads as a bug, fix before anyone sees this again**

1. **Floating menu button overlaps the Share button.**
   `commissioners-office--768--scroll7.png`, `ferry--768--scroll7.png`, bottom right
   (button ≈686–754 × 942–1010; Share pill ≈624–727 × 922–958). Give the footer a
   bottom padding equal to the button's height + 24px, or hide the floating button when the
   footer enters the viewport. Do not just nudge it — verify at 768 and 390.

2. **Floating menu button covers body copy.**
   `commissioners-office--390--scroll1.png` (cuts "rang ou**t**"),
   `commissioners-office--390--scroll5.png` (cuts "Buildi**ng**," and "prepa**red**"),
   `ferry--390--scroll6.png` and `ferry--768--scroll6.png` (cuts "the pre**ss**").
   Reserve a safe area: add right padding to the reading column equal to the button width +
   16px below 1024px, **or** auto-hide the button on scroll-down / reveal on scroll-up.

3. **Display heading breaks the right page margin.**
   `ferry--1440--scroll6.png`: "AUTHORITARIANISM" spans x=254→1424 against a 1303px content
   edge. Cap the heading at the content width (1303) and let it wrap; remove the auto-fit
   that scales type to fill the viewport.

**P1 — the "thrown together" tells**

4. **Same section renders on two different grids.**
   `commissioners-office--1440--scroll6.png` (heading x=482, body x=477, sub x=825) vs
   `ferry--1440--scroll6.png` (heading x=254, body x=253, sub x=601). Fix the label column
   to a constant width (e.g. 220px) and the content column to a constant start (477) so the
   moral section lands identically on every chapter regardless of heading length.

5. **Section hairline is three widths at 1440.**
   459px in `commissioners-office--1440--scroll3.png` (y=321), 275px in `--scroll4.png`
   (y=409), 50px in `ferry--1440--scroll6.png` (y=70). Either make it full content width
   (137→1303) as it already is at 390/768, or delete it. Do not let it inherit the label
   column's width.

6. **Eyebrow wraps to two lines.**
   `ferry--1440--scroll6.png` top-left: "THE / MORAL". Falls out of fix #4; verify after.

7. **Image caption sits on a different right margin.**
   `commissioners-office--1440--scroll4.png` and `ferry--1440--scroll4.png`: "MARK PRIEST ·
   NALLE SERIES" ends at x=1381 vs the page's x=1303. Move the caption onto the content
   grid.

8. **Collapse the four micro-label sizes into one.**
   12px cap (`commissioners-office--1440.png` "STOP 02 OF 5…"), 11px (`--scroll1.png`
   "CHAPTER 2 | PT. 1"), 10px (`--scroll7.png` "NEXT — STOP 03", "01:10"), 9px ("THE
   SKETCH", "TAP ANY PARAGRAPH…", "MARK PRIEST…", "THE PEOPLE OF THIS DAY"). Pick one —
   12px cap minimum, for the phone case — and use it everywhere. This alone removes three
   type sizes.

9. **Unify the button system.**
   `commissioners-office--1440--scroll7.png` and `--390--scroll7.png`: CTA pills 48px tall,
   Share pill 38px tall, menu button 72px. Icons: heavy arrow trailing on "Continue the
   walk", light arrow trailing on footer links, pin leading on "Get directions", share
   glyph leading on "Share". One pill height, one icon stroke weight, one icon side.

10. **Fix the two heading→body gaps that differ by 9px.**
    `commissioners-office--1440--scroll3.png` 56px vs `--scroll4.png` 65px, on
    identically-sized 44px-cap headings. Pick one token.

11. **Fix the mobile footer link wrap.**
    `commissioners-office--390--scroll7.png`, `ferry--390--scroll7.png`: 1 link on row 1,
    2 on row 2. Stack all three, or make it a 2×2 with the Share action.

12. **Fix the forced line break in footnote (3).**
    `ferry--390--scroll5.png`: "Nalle escaped, Georgia" ends 40% short with "had" fitting;
    "enslaved people." is a two-word orphan. Remove the nowrap/`&nbsp;` around the numerals.

13. **Style or suppress the Mapbox wordmark.**
    All `*--scroll7.png` frames, map bottom-left.

**P2 — the difference between "fine" and the bar**

14. **Take the borders and radii off the artwork.**
    Hero images (`commissioners-office--1440.png`, `ferry--1440.png`), sketch
    (`--scroll3.png`), history photo (`--scroll4.png`), moral thumbnail
    (`ferry--1440--scroll6.png`). Hard-edged, borderless, per
    `inspo/pasqua/roots-1440-s2-y3108.png` and `inspo/museos/detail1-1440-s2.png`. This is
    the single highest-leverage visual change in the list: it takes the box census from 5
    to 1–2 in one pass.

15. **Rebuild the footnote/history block as a full-bleed inverted band.**
    `commissioners-office--1440--scroll5.png`, `ferry--1440--scroll5.png`,
    `commissioners-office--390--scroll5.png`, `ferry--768--scroll5.png` — currently 0.00%
    ink in the left third and nothing wins the frame. Cream field, dark text, edge-to-edge,
    one fact per row with a hairline between rows. Model:
    `inspo/museos/audio-rows-detail1-1440.png`.

16. **Fill or justify the empty left third at 1440.**
    `commissioners-office--1440--scroll1.png` (0.15% ink x=0–477), `--scroll2.png` (0.11%),
    `--scroll5.png` (0.00%), `ferry--1440--scroll1.png` / `--scroll5.png`. Put the chapter
    spine there — stop number, section list, scroll progress, sticky audio control — per
    `inspo/museos/spine-context-1440.png`. This solves the immersion gap and the dead-space
    gap with one component.

17. **Give the hero a fixed image height.**
    `ferry--1440.png` shows a 290px strip (32% of frame) because the heading takes three
    lines; `commissioners-office--390.png` shows 63%. Pin the hero image to a constant
    fraction of viewport height across chapters and viewports, and put the title **on** the
    image rather than above it.

18. **Add a scroll cue and an audio cue to the hero.**
    All four hero frames. A down-arrow at the bottom edge (`inspo/googleac/story-390-s00.png`)
    and a visible "Listen — 1:10" affordance so the QR visitor knows there is narration
    before they scroll.

19. **Cut the redundant section labels.**
    `(03)` + `THE SKETCH` + `FROM THE SKETCH`; `(04)` + `HISTORY` + `HISTORICAL CONTEXT`.
    Keep the numeral and the heading; delete the eyebrow.

20. **Remove the duplicated hold instruction.**
    `ferry--1440--scroll3.png`: the body sentence "Press and hold the study to let the
    finished painting develop under your hand." and the on-image pill "PRESS AND HOLD TO
    BRING THE PAINTING TO LIFE" both appear in the same frame. Keep the on-image one, and
    make it a designed affordance rather than a translucent tooltip.

21. **Pick one chapter-number convention.**
    "STOP 02 OF 5", "(CH. 02)", "CHAPTER 2 | PT. 1" all appear on
    `commissioners-office`; `ferry--1440--scroll1.png` uses "CHAPTER 4" with no part.

22. **Stop using the same sketch as background texture and foreground content.**
    `commissioners-office--1440--scroll6.png`. Also lift the text/background contrast — at
    8px blur the heading and the engraving are the same value.

23. **Give the moral-section image a mobile reflow.**
    `ferry--390--scroll6.png`, `commissioners-office--390--scroll6.png`: 220px square pinned
    left with ~130px of dead space beside it. Go full-bleed below 480px.

24. **Fix the menu button's lopsided corner radius.**
    `commissioners-office--1440--scroll7.png`, zoomed: three tight corners, one much larger
    bottom-right. It matches no other shape in the build.
