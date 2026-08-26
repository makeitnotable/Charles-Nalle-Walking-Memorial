# v4 DECISIONS — judgement calls made during the autonomous run

Each entry: what was decided, the evidence, and the exact revert. Anything here
that Wil may want to overturn is also listed in `docs/v4/REVIEW-GUIDE.md`.

---

## D1 · The bronze plaques govern place names (W6)

**Evidence.** `../Context/2026_0610_10x12plaquesNEWLAYOUT.pdf` — the four bronze
plaques went to production in June 2026 with cast headlines:
**BAKERY · COMMISSIONER'S OFFICE · URI GILBERT HOME · BARBERSHOP**.
The plaque is the immovable object: a visitor reads it on the sidewalk and scans
the QR beneath it. The screen must answer with the same words. The website can be
edited in minutes; the bronze cannot be edited at all.

The naming audit (`docs/v4/NAMING-CANON.md`) found **25 conflicts** across five
surfaces, including three that render on the same screen. "Office of the
Commissioner" — the current hero H1 and card title for chapter 2 — appears in **no
client source at all**; it is an artefact of the v2 port.

**Decision.** One canon per chapter, three forms. The bronze headline is taken
verbatim as the `short` form (the sidewalk word). `canonical` expands it only where
the bronze is obviously an abbreviation of a proper business or person name.

| # | canonical | display (authored breaks) | short | bronze headline |
|---|---|---|---|---|
| 1 | Holeur's Fashionable Bakery | HOLEUR'S\nFASHIONABLE\nBAKERY | Bakery | BAKERY |
| 2 | Commissioner's Office | COMMISSIONER'S\nOFFICE | Commissioner's Office | COMMISSIONER'S OFFICE |
| 3 | Uri Gilbert Home | URI GILBERT\nHOME | Gilbert Home | URI GILBERT HOME |
| 4 | Washington Street Ferry Landing | WASHINGTON\nSTREET FERRY\nLANDING | Ferry Landing | *(no plaque — `plaque: false`)* |
| 5 | Peter Baltimore's Barbershop | PETER\nBALTIMORE'S\nBARBERSHOP | Barbershop | BARBERSHOP |

Derivations, applied everywhere: hero H1 ← `display` · card titles, `<title>`,
curtain labels, People chips ← `canonical` · map pills, menu, aria-labels ←
`short` · next-links ← generated `Chapter {order} — {canonical}` (the free-text
`"Chapter 1 — Where the story began"` at `barbershop.json` dies).

**The one judgement call: chapter 3.** Sources genuinely conflict — the 2024
storyboard says *Mansion*, the 2026 bronze says *HOME*. I followed the bronze for
the reason above. This is the single naming change Wil may want to overturn.

**Revert.** Set `name.canonical` to `Uri Gilbert Mansion`, `name.display` to
`URI GILBERT\nMANSION` and `name.short` to `Gilbert Mansion` in
`src/content/chapters/mansion.json`. Nothing else needs to change — every surface
derives from those three fields.

**Not changed.** Narrative prose is Kathy Sheehan's. Where a sentence of hers says
"mansion", it stays; a house can be called a mansion in prose while the stop is
named for the bronze. The 15 items that would change narrative meaning are listed
in `docs/v4/NAMING-CANON.md` §E and queued for sign-off, not edited.

---

## D2 · Screenshot matrices are not committed

`docs/qa/` already carries 443 MB of v3 PNGs. The v4 matrices (~50 MB per phase ×
7 phases) would triple the repo and slow every CI deploy. `docs/v4/qa/**/*.png` is
gitignored; the audit documents reference filenames that exist on the build
machine, and only the curated before/after pairs in `docs/v4/qa/before-after/`
(JPEG) are committed as the review-guide evidence.

---

## D3 · Section gap tokens tuned down from the plan's opening numbers

Plan §7.2 proposed `--space-section: 160/200/240` and `--space-void: 320/360/440`.
Built and measured at 390, those produce two consecutive near-empty viewports on a
phone — precisely the failure the museos audit flags as that site's worst trait
(`docs/qa/inspiration/museos.md`, "Desktop-tuned rhythm leaves mobile voids").
Shipping values are `128/168/200` for `--space-section` and `260/320/400` for
`--space-void`, which hold the same *proportion* of the viewport at each width.
Recorded because it is a deliberate deviation from the written plan, not drift.

---

## D4 · v12 reverses two earlier museum calls, at Wil's direction

Both were deliberate when made, and both are deliberate now. Recorded so the
next reader does not "fix" them back.

**The plaque's close icon is no longer always present.** v10 V10-07 (Wil,
8/21) put the X on screen whenever the drawer existed — "present at all times,
not just something that appears when the user starts to scroll down." v12 (Wil,
8/26) asks for the opposite behaviour and describes the whole cycle: the icon
belongs to the OPEN drawer, tapping it hides the drawer completely, and
scrolling on brings it back a step at a time — preview first, then the full
card with the icon. Implemented as a third drawer state (`sheetHidden`) rather
than a fourth point on the 0..1 position axis, so the drag, swipe and wheel
maths are untouched. To revert: drop the `sheet === "full"` guard on
`.museum-sheet-close`, point its click back at `snapSheet("peek")`, and delete
the hidden branches in `onWheel` and the stage swipe.

**The desktop plaque card now has a border.** v8 authored it without one on
purpose (`Museum.tsx` header: "desktop card at the left edge with no border and
one button"). Wil, 8/26: the drawer's stroke "is missing all together on
desktop, check tablet too." `.museum-card` now takes the same 1px
`--color-primary-7` the phone sheet carries. The sheet's own stroke was a real
defect rather than a choice — only its top edge was ever drawn, so the 16px
corner radius bent that line through an arc with nothing either side of it and
it tapered to nothing, which is what he saw "going to zero" at the top corners.
