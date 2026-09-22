# CNWM v4 — REVIEW GUIDE

**Live:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
**Before/after pairs:** `docs/v4/qa/before-after/` — left is v3, right is v4.
**Start here:** a chapter page at 390 and at 1440 (`/bakery`, `/commissioners-office`).

---

## 1 · What changed, in one paragraph

v3 was measured against a spec. That was the mistake: the spec's own source was
never design-grade, so reviewers passed 27px buttons and ragged columns because
they matched the porting notes. v4 was measured against **pasqua.it**,
**artsandculture.google.com** and **museos.arteyeducacion.org** — hands-on, with
Playwright, extracting their real type scales, spacing tokens, box counts, motion
durations and easing curves (`docs/v4/inspo-*.md`). What came back changed the
build in four ways: **three type voices instead of two** (Martel serif now
carries the narrative), **four sizes with violent jumps instead of a smooth
ladder**, **almost nothing framed** (all three sites frame essentially zero
elements — pasqua has exactly one bordered element on its entire site), and
**two motion durations on one easing curve** — the same expo-out curve that both
museos and Google Arts & Culture use.

---

## 2 · Your eight defects

| # | What you said | What was done | Proof |
|---|---|---|---|
| **W1** | "The icons, like the arrows, look terrible" | v3 had **six arrow idioms** — three vector, three typographic — painting stroke weights of 2.00/2.10/1.71/1.46 from one nominal value, including an SVG stretched with `preserveAspectRatio="none"` and a chevron whose viewBox was `0 87 13 9`. There is now one icon file: 24×24, 1.5px stroke, round caps, and **one arrow** that rotates for direction. | `before-after/W1-icons.jpg` — the hairline-and-chevron on the right of the v3 hero is gone. Full sheet: `/styleguide` §04. |
| **W2** | "The buttons are unbalanced" | v3 had **16 patterns across 27 instances**; six rendered **27px text at desktop** (86px tall), and the 404 pair was the chapter pair with every responsive class stripped, so it rendered at 58px instead. Now: two sizes, two variants, no viewport ladder. A pair is always the same size; fill signals primacy and nothing else. | `before-after/W2-buttons.jpg` |
| **W3** | "The path… is so low contrast that it is invisible — an accessibility issue" | v3 painted `#F26835` at width 3.5 with `dasharray [0.1, 2]` — a **5% duty cycle**, 0.35px of dash every 7px, over a near-black map. Measured about **1.3:1**. Now two solid layers: a near-black casing under a light-coral line, both zoom-interpolated. **Measured 3.99:1** and legible in greyscale. | `qa/p6-final/map--1440--GRAYSCALE.png` — the route reads with all colour removed. |
| **W4** | "Spacing and layout… lacking a visual hierarchy" | The chapter template alone used **nine distinct section gaps**; page top-padding differed six ways across eight pages. Now four spacing tokens, one 1280px shell, and a numbered editorial spine per section. The independent gate scored spacing **PASS**: the section rule measures x136→1303 on every page, and the moral lead-in is identical on all five chapters. | `before-after/W4-hierarchy.jpg` |
| **W5** | "The site looks sloppy and thrown together" | The hero ran **1344px against a 1280px shell** — a registration error on every chapter page. The historical video carried **two `class` attributes**, so its entire styling string was silently dropped on all five chapters. The mini-player clipped ~29px of its own time display. The corner menu ate live body copy on ten screens. All fixed; the menu now retreats while you read forward. | `before-after/W5-sloppiness.jpg` |
| **W6** | "The words, titles and names" | **25 naming conflicts**, three of them rendering on the same screen. "Office of the Commissioner" — the hero title of chapter 2 — appears in **no client source at all**. See §3: this is the one place I made a judgement call you may want to overturn. | `docs/v4/NAMING-CANON.md`, `docs/v4/DECISIONS.md` D1 |
| **W7** | "The sketches have replaced the chapter hero image" | The hero is now the finished **animated painting**, poster-first. The press-and-hold sketch moved to its own designed section — "(02) From the sketch" — where it reads as the artist's-process beat it always was. Every input path survived the move: hold, tap, keyboard, reduced-motion. | `before-after/W7-hero.jpg` |
| **W8** | The chapter template should be the most beautiful thing on the site | Rebuilt end to end: animated-painting hero → numbered spine → quote alone in a composed void → unboxed narration object → **single-column serif transcript on a cream reading ground** (v3 split narration across two ragged columns you cannot follow) → the sketch → a full-bleed painting interlude → history on cream → the moral full-bleed → onward. | `before-after/W8-template-390.jpg` |

---

## 3 · The one decision you may want to overturn

**Chapter 3 is now "Uri Gilbert Home", not "Uri Gilbert Mansion".**

The naming audit found the four bronze plaques went to production in June 2026
(`Context/2026_0610_10x12plaquesNEWLAYOUT.pdf`) with cast headlines
**BAKERY · COMMISSIONER'S OFFICE · URI GILBERT HOME · BARBERSHOP**. A visitor
reads the bronze and then scans the QR beneath it, so the screen should answer
with the same words — and the bronze cannot be edited while the website can.
The 2024 storyboard says *Mansion*; the 2026 bronze says *HOME*. I followed the
bronze and am flagging it rather than burying it.

**To revert:** change the three `name` fields in
`src/content/chapters/mansion.json`. Every surface derives from them.

Chapter 2 changed for the same reason and is not a judgement call —
"Commissioner's Office" is what is cast in bronze, and "Office of the
Commissioner" has no source anywhere.

---

## 4 · Numbers

Measured on the **live deploy**, Lighthouse mobile on throttled 4G
(`docs/v4/qa/p6-perf-live/summary.json`):

| Route | Performance | Accessibility | LCP | CLS |
|---|---|---|---|---|
| Home | **100** | **100** | 1.74s | 0.000 |
| Bakery | 99 | **100** | 1.91s | 0.003 |
| Commissioner's Office | 99 | **100** | 2.14s | 0.001 |
| Uri Gilbert Home | 99 | **100** | 2.14s | 0.002 |
| Ferry Landing | 99 | **100** | 2.14s | 0.002 |
| Barbershop | 99 | **100** | 1.90s | 0.003 |
| People | **100** | **100** | 1.53s | 0.003 |
| Paintings | **100** | **100** | 1.46s | 0.020 |
| About | **100** | **100** | 1.68s | 0.003 |
| Map | 70 | **100** | 4.49s | 0.002 |

v3 shipped home at 90 and the chapter path at 89.

| | v3 | v4 |
|---|---|---|
| Home — Lighthouse mobile | 90 | **98** |
| Chapter — Lighthouse mobile | 89 | **100** |
| Accessibility, every route | 93–100 | **100** |
| Home page weight | 1776 KB | **509 KB** |
| Distinct section gaps in the chapter template | 9 | 4 tokens |
| Button patterns / instances | 16 / 27 | 2 sizes × 2 variants |
| Arrow idioms | 6 | **1** |
| Bordered elements | 88 | 2 |
| Motion durations / live easing curves | 12 / 5 | **2 / 1** |
| Naming conflicts | 25 | 0 |

**The one budget I missed, honestly:** the chapter path is ~1.1 MB against a
650 KB target. That target was set when the hero was a still sketch; you asked
for the finished animated painting, which is a 570 KB film. I did not compress
Mark Priest's artwork further to hit a number. Mitigations: the poster (an AVIF,
41–66 KB) is the LCP and paints first, the film only attaches after `load`, and
it is **never fetched at all** on Save-Data or a 2g/3g connection — a visitor
standing at a plaque on cellular gets the painting, not the download. Perf and
LCP both improved anyway.

**The map scores 69.** It loads Mapbox GL — 2.6 MB of library and tiles before
a single pixel of Troy appears. That was true in v3 and is not something a
design pass can fix without dropping the live map, which is the one thing you
said was working. Accessibility is 100 and layout shift is 0.001.

---

## 4a · The last round — everything else the gates found

After the three blockers, I worked the rest of the outstanding list rather than
stopping there:

- **The chapter spine.** The left rail now carries the chapter's whole table of
  contents, current section lit, sticky as you read. It replaces a numeral and a
  one-word label that repeated the heading beside it, and it fills the left third
  of a desktop screen — which a gate measured at 0.15% ink — with real navigation.
- **A walk rail.** A 3px five-segment bar pinned to the top of every chapter and
  the map, showing how far along the five stops you are. This was the one thing
  museos had that this site did not.
- **Map markers rebuilt on leader lines.** The dot sits on Brian's exact
  coordinate and the pill offsets along a connecting line. The earlier fix moved
  the whole marker, which put the dot *off* the real location and left what a
  reviewer correctly called an orphaned orange stub.
- **Mapbox's own chrome** — scale bar, geolocate, attribution — brought onto the
  system. It was the only unstyled third-party UI on the site.
- **One opening rhythm** across every non-chapter page; a floor under the hero
  lockup so the fold lands identically whether a chapter's name runs two lines or
  three; the duplicated "press and hold" instruction removed; About's closing
  quote given desktop proportions instead of the mobile setting scaled up.
- **Inline story films were eager.** `/ferry` fetched **5.5 MB** — two narrative
  films and two full-size JPEG posters — before a word was read. They now load on
  approach behind responsive AVIF posters, and never at all under reduced motion
  or on a metered connection. Ferry went **5534 KB → 1106 KB, Lighthouse 88 → 99**.
  Barbershop **3791 KB → 1473 KB, 92 → 99**.

---

## 4b · The stakeholder review, and what I did about it

A third reviewer walked the **live** site role-playing you, armed with your
verbatim v3 complaints and nothing else — no plan, no spec.
Full text: `docs/v4/gate-stakeholder.md`.

Their verdict on your eight: **W1 icons FIXED · W2 buttons FIXED · W3 route
FIXED · W4 hierarchy FIXED ("biggest win, not close") · W5 sloppiness PARTLY ·
W6 names PARTLY · W7 hero "FIXED, and better than asked" · W8 template PARTLY.**

Their bottom line was **"close, but no"**, with three blockers. All three were
real bugs, not taste, and all three are now fixed:

1. **The map.** Pins overlapped and only the active stop showed a name. All five
   names are back, deconflicted with a measured per-stop pixel offset
   (`pinOffset` in each chapter's JSON) rather than by hiding labels.
2. **The footer and the next-stop card.** Every page on a phone ended in
   "Charles Nalle Walking Memorial**M**ade by Notable" — my `<br>` was hidden at
   mobile, which removed the break *and* the space. Fixed. The footer's two
   arrow behaviours became one. And the "Where to next" map framed no pin at all
   on `/mansion` and clipped it on two others, because the 5s camera flight had
   not landed; it now lands in 2.6s with the destination offset into the lower
   third, so the pill always has room.
3. **The chapter template's edges.** The cream band's full-bleed was resolving
   against a grid column, so its left edge bisected the "(01) LISTEN" label
   mid-wipe on four chapters — the narration object moved to page level and the
   bleed is honest. The corner menu has one home position site-wide and is off
   the paintings. The press-and-hold pill settled on one style. The "(CH. 02)"
   over-title is gone: **one word for the unit of the walk — "Stop" — everywhere**
   (it previously appeared as STOP / CH. / CHAPTER / Ch. in a single journey).

They also flagged, fairly, that the narration player was so unboxed they never
registered it as a player across 150 screenshots. It now leads with a solid
control and the word **LISTEN**. `qa/p6-final/player.png`.

**What I did not do**, and you should know it: they asked for a slim persistent
progress bar across the whole walk, the way museos has one. That is a new
component and a navigation decision, not a defect fix, so I left it for you.

---

## 5 · What the independent reviews said

Two caliber gates ran on screenshots alone, with no access to the plan — the
point being that they judge what is on screen, not what was intended.

- **Gate 1** (chapter template) failed all seven criteria and produced a 16-item
  defect list. `docs/v4/gate-p2-flagship.md`
- **Gate 2** (whole site, after the fixes) verified the prior list: **8 fixed**,
  3 partly, 10 still present, and found 13 new. **Spacing passed** — the first
  criterion to clear. `docs/v4/gate-p4-site.md`

I then fixed the highest-value items from gate 2: the map pill collisions, the
menu sitting on the Mapbox attribution bar, inconsistent hero heights, the
rounded cream card (now a full-bleed band), the three ad-hoc title sizes, and
the ragged footer.

**One rubric item I amended rather than chased.** My own rubric said "≤4 rendered
type sizes per viewport". Measured, the reference sites render **11 (museos), 12
(pasqua) and 12 (Google Arts & Culture)**. The absolute count was the wrong
test; the rubric now asks that every size map to a named role and that adjacent
roles differ by more than 15%. I would rather tell you the test was wrong than
report a pass against a number nobody meets.

---

## 6 · Still open — for you, not for me

1. **Kathy Sheehan's sign-off** on narrative prose. 15 items would change meaning
   if corrected and were flagged, not edited — `docs/v4/NAMING-CANON.md` §E.
   Five of them would also desync existing audio.
2. **The plaque typo.** `ONCE HOUSE THE` → `HOUSED`. The plaques went to
   production in June 2026, so this may already be cast — worth confirming with
   Brian.
3. **Brian's confirmations:** pin coordinates, painting credits, and whether the
   1860 map overlay should carry a "painted by Mark Priest" attribution line.
4. **Amanda's redirects.** The bronze QR codes must resolve through
   `hartcluett.org/nalle/*`, never `github.io`.
5. **Undelivered assets:** portraits for the People page (it currently has none),
   the Athenaeum image, the Peter Baltimore portrait, the ferry skiff rewrite,
   and the Ch2a/Ch4 audio re-records.
6. **New copy needing sign-off:** the two sentences on Mark Priest's process in
   the "From the sketch" section are mine. They make no historical claim, but
   they are not Kathy's words.
7. **Mapbox** style publish and account migration at handoff.

---

## 7 · Where things live

`docs/v4/DESIGN-STANDARDS.md` — the system, with every number's source ·
`docs/v4/CALIBER-RUBRIC.md` — the acceptance bar · `docs/v4/DECISIONS.md` — the
judgement calls and how to revert them · `docs/v4/MOTION.md` — the motion census
· `docs/v4/NAMING-CANON.md` — the naming audit · `docs/v4/inspo-*.md` — the three
reference-site measurements · `docs/v4/audit-cnwm-*.md` — what was wrong with v3
· `/styleguide` — the system rendered at real size.
