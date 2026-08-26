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

## v13 (Wil's 8/26 round)

**The hall chip centres in the band, not on the viewport.** V13-05c, his 4.1:
"the tag … should be center aligned with the skip the hall button on its left."
The vertical was already right — measured, the pill's centre and Skip's agree
to **0.00px** at 1024/1280/1440/1920, which v11 settled. What still read wrong
was horizontal: the pill centres on the *viewport*, which ignores the two
standing controls sharing its band, so at 1024 it sat 24.6px from Skip against
245.6px of air on the right. Note the brief's literal instruction — "mirror the
same reserve on the right" — is geometrically identical to viewport-centring
(a band `[S, W−S]` has centre `W/2`) and would have changed nothing; the pill
is centred between Skip's right edge and the corner menu's left edge instead.
After: 79.6/78.6 at 1024, 240.1/239.2 at 1440. The scene writes 0 whenever the
pill would not fit the band, and nothing below 1024 is touched.
**Revert:** delete `transform: translateX(var(--cnwm-chip-x, 0px))` in `global.css`.

**The drawer's header height is measured, not encoded.** V13-10c. The body's
cap was `calc(55dvh - 118px)`, and 118 matched neither state after the eyebrow
came off: the header measures 61.9 peek / 127.9 full on a phone and 84.2 /
150.2 at 768, because it is `--ui-inset` (20 vs 40) plus a fluid title whose
line-height itself differs by 2.3px between the two. No single literal can
serve that, so the header publishes its own height to `--cnwm-sheet-head` via
a ResizeObserver and the body reads it. The sheet's own `55dvh` is unchanged —
that is the design cap, not a header encoding.
**Revert:** put the literal back and drop the observer.

**The counter shows at every width.** V13-10d. It was `hidden sm:block` and
inline in the dots row, which pushed the rail off-centre by half its own width.
It now sits centred above the dots at every width (centre-to-centre −0.01px).
**Revert:** restore `hidden sm:block` — the column layout stands either way.

**Face forward is one instance, not two.** V13-10b. The phone copy lived inside
the centred chip row; both now share the desktop anchor. With no display
utility on either element, the v8 V8-322 hazard — `.btn-sm`'s unlayered
`display: inline-flex` beating a layered `lg:hidden` — can no longer fire.
Face forward (`ready && !inApproach`) and the drawer (`approached !== null`)
are mutually exclusive by construction, so his "leave it where it is if the
drawer is open" case cannot arise.
**Revert:** re-add an `lg:hidden` copy in the chip row and `hidden lg:block` on the top-right div.

**`rehang()` is deliberately a no-op today.** V13-10e. The room is built once
(the scene effect's deps are `[capable, works]`), so `CEIL_Y` never changes
after build — `onResize` does not touch it. Ceiling and `yC` are therefore
frozen *together*, and `yC === CEIL_Y / 2` stays true in every orientation.
Re-hanging to the other orientation's ceiling while the ceiling itself did not
move would push the work off-centre against the wall the visitor can actually
see. The group and its single `group.position.y` write are in place for when
the room becomes live.
**Revert:** drop `rehang()` and its call in `onResize`.

**The nine landscape works keep 1.70.** V13-10e asked for *Martin Felled by
Axe* specifically; the other nine were measured and left. Their frames run
0.53–2.87 in every orientation — never near ceiling or floor — and 1.70 sits
15cm above the 1.55 eye, the museum's own hanging line. Only the portrait work
was ever wrong: on a portrait tablet its frame top measured **3.32 against a
3.2 ceiling — 12cm through it**. Moving the other nine would move the whole hall.
**Revert:** n/a — this is the unchanged state.

**A tap toggles anywhere on the work, not only on the canvas.** V13-05b. The
raycast required an exact hit on the canvas mesh, so a tap on the moulding did
nothing and a working tap was indistinguishable from a missed one. Approach
taps now toggle anywhere inside the work's projected rect ±9% (the moulding is
canvas + 0.34, i.e. 8.5% a side), and a play/pause glyph fades in for ~900ms.
The overlay stays `pointer-events: none` so the stage keeps every swipe, and
`stopped[]` still persists out of approach — a painting switched off stays off.
The tap gate (`dt < 300ms && moved < 8px`) was measured and left alone: a
synthesized tap reads dt 1ms / moved 0px, and real finger jitter is not
measurable in this container.
**Revert:** change `0.09` in `Museum.tsx`'s approach-tap branch back to a raycast-only hit.
