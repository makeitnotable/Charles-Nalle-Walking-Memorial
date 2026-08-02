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

| | v3 | v4 |
|---|---|---|
| Home — Lighthouse mobile | 90 | **97** |
| Chapter — Lighthouse mobile | 89 | **95** |
| Chapter — LCP | — | **2.56s** |
| Accessibility (home / chapter / map) | 93–100 | **100 / 100 / 100** |
| Home page weight | 1776 KB | **510 KB** |
| Chapter page weight | 598 KB | 797 KB *(see below)* |
| Distinct section gaps in the chapter template | 9 | 4 tokens |
| Button patterns / instances | 16 / 27 | 2 sizes × 2 variants |
| Arrow idioms | 6 | **1** |
| Bordered elements | 88 | 2 |
| Motion durations / live easing curves | 12 / 5 | **2 / 1** |
| Naming conflicts | 25 | 0 |

**The one budget I missed, honestly:** the chapter path is 797 KB against a
650 KB target. That target was set when the hero was a still sketch; you asked
for the finished animated painting, which is a 570 KB film. I did not compress
Mark Priest's artwork further to hit a number. Mitigations: the poster (an AVIF,
41–66 KB) is the LCP and paints first, the film only attaches after `load`, and
it is **never fetched at all** on Save-Data or a 2g/3g connection — a visitor
standing at a plaque on cellular gets the painting, not the download. Perf and
LCP both improved anyway.

**The map scores 60.** It loads Mapbox GL (2.6 MB of library and tiles) — that
was true in v3 too and is not something a design pass can fix. Accessibility is
100 and layout shift is 0.001.

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
