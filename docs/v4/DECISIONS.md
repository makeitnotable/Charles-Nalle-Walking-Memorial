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

**The 1858 plate is picked by resolution, not by width.** V13-07a. The
`<picture>` split on `min-width: 768px` and nothing else, so a DPR-3 phone ran
out of the 4096 file's own pixels at s=3.9 and upscaled 1.54x the rest of the
way to the zoom ceiling. Phones now take the 6144 AVIF (1.95 MiB, up from the
4096 AVIF's 0.92 MiB — **+1.02 MiB**, and only ever on the first open of the
lens); ≥768 takes the new 8192 AVIF (3.25 MiB, up from the 6144 AVIF's
1.95 MiB — **+1.30 MiB**). Above 6144 we ship AVIF only, so a non-AVIF browser keeps
exactly the WebP it is served today (6144 at ≥768, 4096 below) and no new WebP
bytes exist. Measured at the ceiling: 390/DPR3 **1.000** source px per device
px, 834/DPR2 **1.000** (the bar was 0.9). The ceiling itself is now
`min(6, naturalWidth / (box × DPR))` floored at 4, so the guarantee holds on
devices we cannot test — at the cost that a 1440/DPR2 desktop tops out at 4×
(0.771 source px per device px) rather than pretending 6 means anything there.
**Revert:** in `TroyMap.tsx`, point the two AVIF `<source>`s back at
`troy-1858-full-6144.avif` / `troy-1858-full-4096.avif` and replace
`lensMaxScale()` in `lensZoomAt` with the literal `6`.

**The chapter-card slide stops being a frame at ≥1024.** V13-02. v12's
gap-equalising shift was arithmetically right and still measured 16 / 57.16 /
57.16, because keen's own `.keen-slider__slide { overflow: hidden }` clipped the
translation straight back — every card from the second out on each side lost
41.16px of its OWN painting off its inboard edge, which is both the unequal gap
and the "sliced card" in his screenshot. Equalising through keen's `spacing`
instead is not available: one uniform pitch cannot make the focused card's two
gaps equal to the gaps between two shrunken neighbours (they differ by half the
shrink, 20.58px, at any spacing), so the shift stays and the clip goes. The
frame is now the container, which still clips, plus a 120px eased edge mask
(28px at 640–1023, unchanged) and an anti-sliver ramp that fades any partial
under a quarter of a card. Nothing below 1024 changes: the write is gated by
the same `wide` flag as the shift, and 390/768 measure byte-identical to HEAD.
**Revert:** delete the `r.slide.style.overflow` line and the `op` block in
`detailsChanged`, and the `@media (min-width: 1024px)` mask rule in
`global.css`.

## Round 23 (Wil's 9/18–9/19 round) — the chapter pages scroll inside `<main>` on iOS

**Evidence.** Wil's ask, from four screenshots on 9/18: the area behind and
around Safari's top address bar must be a solid fill in the colour of the
section at the top of the viewport, changing as the page scrolls. Eight device
passes (`docs/rounds/2026-09-18-round-23-plan.md`, `docs/PLAYBOOK-MOBILE-
CHROME.md` §3) measured that Safari paints only scrolled page content in that
region — fixed and sticky boxes are clipped at the viewport — so any fill there
is a piece of the page moved into place by script, one frame behind the
compositor, and that frame showed as a moving edge on his phone at every speed
("flicker … buggy … the fill changes size"). The one static paint Safari makes
there is the canvas, `<body>`'s colour, which shows only where the document has
not scrolled past it.

**Decision (Wil, 9/19, of the `?scroll=inner` link: "It's exactly what I
wanted. Please apply it to all the remaining chapter pages").** On every
chapter route, wherever the bars exist (the `-webkit-touch-callout` gate, iOS
and iPadOS), the document does not scroll: `<html>` clips at the viewport and
`<main>` is the scroller, extended under the bottom toolbar by the runway's E
so content still shows through its glass. `<body>` carries the section at the
top edge (the sampler), so the bar region is a static solid fill that switches
colour at each section — no cover, no visor, no tracker. **The cost he
accepted:** Safari's bars collapse only when the document scrolls, so on the
chapter pages the address bar and the bottom toolbar stay expanded while
reading (199px of a 390×844 screen). The other side of it: nothing re-lays out
or re-tints because a bar moved. Desktop, Android and every other route are
unchanged. `?scroll=doc` restores the document scroller and the pass-7 cover
on one page load.

**Amended 9/22 (device pass 13, Wil: "the bottom toolbar should
automatically hide when the user scrolls down and reappear when the user
scrolls up").** On phones the document scrolls again — as a solid RUNWAY:
`<body>` sized to the chapter and carrying the section's colour, so the fill
behind the bars stays static, and the chapter in a fixed, clipped `<main>`
whose `#reader` the compositor moves by −scrollY. Safari's bars collapse and
return as on any page. The costs he takes for that: the page is placed a
frame behind the finger (a stalled main thread stalls the page for that
moment), and when the bottom toolbar is up it sits on the section's colour,
not on content — since pass 15 the colour of the section arriving from
below, from a colour map of the chapter that the runway carries, with a
cap above the viewport holding the top bar to the top-edge section's
colour. The still document stays on wider screens (the iPad's toolbar
never collapses) and behind `?scroll=inner`.

**Amended again 9/22 (device pass 17).** The runway's fixed `<main>` made
the bottom toolbar an opaque fill whatever its colour: Safari 26 paints a
bar opaque when the element it hit-tests at that edge is inside a fixed or
sticky box, and glass otherwise. So on phones the chapter scrolls as a
plain document again (`data-scroll="edge"`), natively, and one fixed,
invisible, hit-testable 8px strip on the top edge (`.edge-trigger`) makes
Safari paint the TOP bar as an opaque fill in `<body>`'s colour — the
section at the top edge — while the bottom toolbar, with nothing fixed to
find, is glass over the chapter's own text. No cover, visor or runway is in
play; they remain behind `?scroll=doc`, `?scroll=sync` and, for the iPad's
default, `?scroll=inner`.

**Reverted 9/22 (round 38, Wil: the session that ran passes 13–17 "went
rogue because it auto compacted … there was a point that things were working
perfectly on the live site, then the linked session broke everything that
was working on the chapter pages, I need it fixed").** The two amendments
above are undone and the decision stands as he made it on 9/19: **the still
document is the chapter default wherever the bars exist** — every iOS chapter
route, phone and iPad alike — exactly as the round's close-out shipped it
(`1e5b07d`, approved on his phone: "exactly what I wanted", "we will call
this done", "everything is perfect … close this out"). The runway
(`sync`), its colour map, the `chrome` slot, the transparent `<main>`, the
mini player's portal and the edge trigger (`edge`) are gone from the source,
not parked behind flags: none of the five passes was confirmed on his phone
("literally nothing has changed in the last two tries … start fresh"), and
each rebuilt the page on a hypothesis about Safari's bars. What the
close-out had stays: `?scroll=doc` is the comparison flag (the document
scroller with pass 7's cover), `?scroll=inner` exercises the mode in
Chromium, and `npm run qa:still` (new, `scripts/chapter-still.mjs`) measures
the mode with the gate and the phone's toolbar run stood in. **The ask that
started pass 13 — the bottom toolbar hiding on the way down — is open, by
his decision:** Safari collapses its bars only when the document scrolls,
and the static fill he approved exists only while the document is still
(round 23, passes 1–8 measured every page-placed fill lagging a frame at
the bar). It is the same trade he chose on 9/19; if he wants the other
side of it, that is a new round with a device pass per push, never a
default changed on assumption (CLAUDE.md, rule 4).

**Round 40 (9/22, after "Works great!" on round 38 live): "The only thing
I want is the bottom bar to disappear when the user scrolls down. No other
changes."** Told that Safari collapses its bars only when the document
scrolls and collapses both together — so the still document's static top
fill and a collapsing toolbar cannot both be page paint — he reaffirmed.
His decision, taken device-first: the mode ships behind `?scroll=edge`
with the default untouched. The chapter scrolls as a plain document (the
bars collapse and return; the toolbar is glass over the in-flow text), and
a fixed, invisible, hit-testable 8px strip on the top edge (`.edge-trigger`)
asks Safari to paint the top bar as an opaque fill in `<body>`'s colour —
round 24's measured rule, extended by round 23 pass 16's observation that a
transparent fixed element kept a bar opaque; `&band=<px>` is the visible
variant in the section's colour if the invisible strip is not enough of a
hit. It becomes the default only on his read: then the head script's
`else if (…) dataset.scroll = "inner"` branch assigns `"edge"` instead
(one word). **Revert** of round 40: `git reset --hard client-round-40-base`
(= `3d9aa1c`); off the flag nothing changes anyway.

**Round 41 (9/22, his read of round 40: "the menu is now in the wrong
place … a weird flicker … underneath the progress bars … weird
transparency in that area"; told the top bar's size change is inherent to
collapsing bars, he chose B: "Lets try B. If i do not like B, be prepared
to go with A").** Measured from his screenshot: the burger 20px from the
right edge and ~8px below the rail. The burger is a 72px box straight
inside `.cnwm-menu`, its inset a `max()` that cannot fall below the gutter,
its retreat transform downward only — so the menu had not moved; the rail
had, ~12px below the viewport's top, which is its `top:
env(safe-area-inset-top)`. iOS 26 reports a top inset once its bars have
moved in a scrolling document; the still document never scrolls, so the
inset never showed. **Decision, edge mode only:** the menu's top is the
gutter below the same inset the rail rides (round 23's rule byte for byte
at inset 0, the approved 20px relation at every inset), and the trigger
strip is the rail's own 3px behind it (the 8px strip's lower 5px were the
band under the rail). The default is still the still document. If he
rejects B, the next round removes the edge flag's code so the source is
round 38 exactly. **Revert** of round 41: `git reset --hard
client-round-41-base` (= `1dcd2ce`).

**Round 42 (9/22): A.** Wil, on round 41's link: "Nothing was changed or
fixed. Go back to the working version I approved." The edge flag's code
(rounds 40–41) is removed; `src/` is byte-identical to round 38
(`3d9aa1c`), the still document the iOS default, `?scroll=doc` the only
comparison flag. The bottom-toolbar ask is closed by his decision: it hides
only when the document scrolls, which moves the top bar with it, and the
fixed bars are what he approved. He named "one other that I liked" — the
working version with the toolbar carrying a solid fill when it reappears
on a scroll up: that is the runway (this round's passes 13–16, `042518b`),
in the history, available behind a flag on request. **Revert** of round
42: `git reset --hard client-round-42-base` (= `566dc62`).

**Round 43 (9/22): the runway, behind `?scroll=sync`.** Wil, after round
42: "Can we have everything stay the same but will it work where the
bottom toolbar will disappear on scroll down … I don't mind if the bottom
toolbar has to have a solid fill … the same way on the address bar. There
should be absolutely zero changes to the top address bar." Told that the
one thing no page can remove is that Safari moves the top bar in the same
animation — it shrinks and grows with the toolbar, while its fill can stay
the solid section colour — and that the runway's toolbar fill was the page
brown on his phone (passes 15–16), he chose: "Fine! Let's try it if I don't
like it we'll officially go with A." **Decision, device-first:** pass 13's
runway re-applied behind the flag, the default untouched — `<main>` fixed
and clipped, `#reader` moved by −scrollY, `<body>` the runway in the
section's colour, the rail out of the moving box at runtime, the mini
player portaled in this mode only, the menu on the rail's inset (round
41's rule), the cover `doc`-only; pass 15's colour map and pass 16's
transparent `<main>` left in the history. His read decides: approve → the
head script's default assigns `"sync"` (one word); reject → A, the code
removed as round 42 did. **Revert** of round 43: `git reset --hard
client-round-43-base` (= `833e382`).

**Approved 9/22 (round 44).** Wil, on the Bakery under the flag, live: "As
far as i can see the way everything works on the bakery page is how it
should work on every chapter page. As far as I am concerned, this is done
push to master and live site and document everything and the final version
that we are shipping to the client accordingly and to best practices."
**The runway is the chapter default on phones** — the head script's default
branch assigns `"sync"` where the screen's shorter side is under 700 (every
iPhone; told from the screen, never the viewport, which iOS reports as 980
before the meta is parsed — round 23 pass 14's gate) — **and iPads keep the
still document** (`"inner"`, 744+): their toolbar never collapses, so the
runway would cost its one-frame placement for nothing, and the still
document is what he approved on 9/19. `?scroll=sync|inner|doc` override on
one page load. The instrument's default checks moved with it (`qa:still`:
the runway on all five chapters, the still document under `?scroll=inner`).
Shipped by the same round: the handover's changelog (version 1.4), this
log's "Ship" refresh, the playbook's §3 closed, the `main` mirror and
`release/2026-09-22` refreshed to the tip. **Revert** to the still document
on phones: make that branch assign `"inner"` unconditionally (one word), or
`git reset --hard client-round-44-base` (= `abb2934`) and push `v2`.

**Revert:** `git reset --hard client-round-38-base` (= `e38460d`) brings
pass 17's tree back. To choose another mode as the chapter default, make the
`else if (…) dataset.scroll = "inner"` branch in the head flags script
(`src/layouts/Base.astro`) assign `"doc"` (the document with the cover) or
delete it; the `?scroll=` flags may stay. To undo the whole of round 23:
`git reset --hard client-round-23-base` (= `4d13540`) and push `v2`.

## Round 24 (Wil's 9/21 round) — `/paintings`: Safari's bars stay glass over the hall

**Evidence.** Wil's two screenshots of 2026-09-21: at rest the bottom
toolbar sits on a flat band where the hall's floor should continue;
walking, the minimized address bar's region shows the same flat brown over
the ceiling. His answers: the bars keep collapsing, live see-through first,
`/paintings` only, the at-rest top bar stays; after four passes, "no solid
fill behind or around either bar", "edge to edge like the map", "a simple
solution", "research this from a completely new perspective". Two facts
measured on his phone in earlier rounds (playbook §1, §11): Safari 26's
bars are glass unless a fixed or sticky element is what its edge probe
finds — the sticky, viewport-sized stage was, so both bars were opaque
fills; and a pinned box's paint never reaches the bar regions, only in-flow
page paint does. Every earlier pass honoured one fact and not the other.

**Decision.** Both at once. The pin: the sticky element is a wrapper a
viewport taller than the viewport (WebKit's probe skips a pinned box that
overshoots the viewport along the edge's axis), with the stage absolute at
its foot in exactly its old box. The runway: the canvas renders 110 rows
above and below the stage and two in-flow `<canvas>` strips carry those
rows into the bar regions every frame — the pass-0 design. Default on
wherever the bars collapse; nothing exists where lvh == svh. The body tint
of the fourth push stays gone (he rejected the colour change).
`?runway=off` leaves the pin alone, `?runway=readpixels` forces the
readback copy, `?debug=1` prints the geometry. Nothing changes on any other
device or route.

**Revert:** `git reset --hard client-round-24-base` (= `1e5b07d`); or in
`Museum.tsx` delete the block from `RUNWAY_BUILD` through `runwayProbe`,
the `paintRunways(now)` call and the `hideStrip` lines in the tick, the
`probeCam.clearViewOffset()` line, the `runway` hook state and the
`runwayProbe` export, the strip removals in dispose, restore `sizeToStage`
to the two lines of v13, and in the JSX remove the `museum-pin` wrapper and
give the stage back `sticky top-0`; in `global.css` delete the round-24
block (`--museum-b`/`--museum-pin`, `.museum-wrap`, `.museum-pin`,
`--museum-svh`, `.museum-runway`, `html .museum-stage`); `qa:runway` and
`scripts/museum-runway.mjs` go with them.

## Round 25 (Wil's 9/22 round) — `/paintings`: the lead painting waits for the hall

**Evidence.** Wil, 2026-09-22, after approving round 24 on his phone:
"when the page initially loads, it looks like it's chapter page 2, which
flashes for just a second and then the actual page loads"; "Proceed with
that fix." The slot's server-rendered lead painting (Chapter 2's "The
Altruist"), the fallback for readers whose hall never mounts, showed for the
second between first paint and the island's mount.

**Decision.** A page-ground cover over the painting, inside the lead box:
gone on its own 2.4s after the styles apply (a 300ms fade), gone at once
when the island marks the slot `data-hall="off"` because the hall cannot
run, and never present without JS or under reduced motion. The painting
still paints beneath it, so the LCP candidate and its timing are unchanged.
Nothing else on the page changes; no route drifts.

**Revert:** `git reset --hard client-round-25-base` (= `5bc92b9`); or delete
the `.museum-lead-cover` div (and the `museum-lead` class) in
`paintings.astro`, the round-25 block in `global.css`, the `data-hall` line
in `Museum.tsx`, and `qa:lead` with `scripts/museum-lead.mjs`.

## Round 26 (Wil's 9/22 round) — `/paintings`: the drawer continues under the toolbar

**Evidence.** Wil, 2026-09-22, after approving round 25: "One small bug
left. It occurs when a user taps a painting and the drawer is shown." His
screenshot: the drawer's lower edge exposed, the hall's floor between it and
the toolbar. Confirmed reading: the drawer was designed with an open bottom
under what was Safari's solid fill; round 24 made that band glass over the
runway strip, which paints the floor, and the drawer inside the pinned stage
cannot reach under the toolbar.

**Decision.** The strip carries the drawer: whenever the drawer covers the
stage's bottom edge, the bottom strip's rows from the drawer's top edge down
are the floor rows blurred as the drawer's backdrop blurs them, with the
drawer's own ground (its computed background colour) and side strokes laid
over. The floor returns the frame the drawer leaves. Museum.tsx only;
nothing else on the page changes; no route drifts.

**Revert:** `git reset --hard client-round-26-base` (= `505a461`); or in
`Museum.tsx` delete the round-26 block (`blurCanvas` through `drawerOver`),
the `drawerFrom` lines in `paintRunways`' bottom branch, and the `drawer`
fields in the probe, the readout and the hook state.

## Round 28 (Wil's 9/22 round) — `/paintings`: the drawer expands on scroll

**Evidence.** Wil, 2026-09-22: with a painting open, swiping up no longer
expands the drawer; the page scrolls the hall silently under it and Back
lands somewhere else. "The drawer should expand when the user scrolls down
after selecting a painting." The gesture code is unchanged since the
round-24 base and works in Chromium with touch and mouse; v14 E7's lock
(touch-action, a document-level touchmove preventDefault) no longer holds on
his iPhone since the pin, for a reason WebKit's source does not show and no
instrument here can measure.

**Decision.** Make the drawer robust to whichever way iOS routes the
gesture: with a painting open, the document's scroll drives the drawer
exactly as the swipe does and snaps when it settles; the page is clamped to
the hall's band so the stage never un-pins under the drawer; Back restores
the tap's scroll position. The drawer's handle loses the 6px tap tolerance
that let its first touchmove through, and the pin no longer declares
`pointer-events: none`. The pointer and wheel paths stay. Nothing visible
changes; no route drifts.

**Revert:** `git reset --hard client-round-28-base` (= `a9de24f`); or in
`Museum.tsx` delete `clampApproachScroll`, `scrollDrivesSheet` and their
calls in `onScroll`, the round-28 state after `settleUntil`, the
`approachScrollY` lines in `approach` and its restore, the handle clause in
`lockTouchStart` and the four round-28 hook fields; in `global.css` restore
`pointer-events: none` on `.museum-pin` and `pointer-events: auto` on
`html .museum-stage`; `qa:drawer` with `scripts/museum-drawer.mjs` goes
with them.

## Round 31 (Wil's 9/22 round) — `/paintings`: the drawer's X unfolds with the drawer

**Evidence.** Wil, 2026-09-22, on round 28 ("almost perfect"): the drawer's
Close button "takes too long to appear, it shows up maybe a second after
the drawer is expanded, it seems like it appears out of nowhere, it should
appear instantly by animating in with the expansion of the drawer." It was
mounted by the drawer's state, which the scroll path sets only once the
scroll settles, after the flick's momentum on iOS; and it mounted with no
transition.

**Decision.** The X is mounted in both states and folded away in peek (no
height, margin, stroke or opacity), unfolding over `--dur-fast` at `--ease`
the moment the drawer passes 12% of its travel, whatever moves it; the
drawer's travel is measured to the header without the X so its mapping
never jumps; the state follows at the ends at once on the scroll path; the
sheet's resize observer re-applies the live position rather than the
state's end. v14.2's peek header is unchanged. No route drifts.

**Revert:** `git reset --hard client-round-31-base` (= `839b00f`); or in
`Museum.tsx` mount the button on `sheet === "full" && !sheetHidden` again,
drop `sheetCloseRef`, the `data-x` lines in `applySheet` and `hideSheet`,
the X-less travel in `sheetTravel`, the end snaps in `scrollDrivesSheet` and
the observer's live re-apply; in `global.css` delete the round-31 rule and
its four transitions.

## Ship, 2026-09-22 — `main` mirrors the shipped `v2`

**Evidence.** Wil, 2026-09-22, after round 31: "As far as I can see
paintings page is done, push to master and live site and document
everything and the final version that we are shipping to the client
accordingly and to best practices." `main` held the retired 2024 Vite/React
app, an unrelated history the site's `v2` line can never merge with, and
the deploy workflow publishes on pushes to both branches — which is why the
rule was never to touch `main`.

**Decision.** The retired app is preserved as the branch `legacy-spa` (its
tip is also the tag `legacy-spa-final`), and `main` carries the shipped `v2`
tree through a merge commit with two parents — `main`'s old tip and the
`v2` tip — whose tree is `v2`'s exactly (`git commit-tree`), pushed as an
ordinary fast-forward: no history is rewritten and nothing is forced. So
the branch a reader expects to hold the site does, and a push to `main` can
only ever republish the site. `v2` stays the working and deploy branch;
`main` is refreshed the same way at each client sign-off, never developed
on. The shipped commit is marked by the branch `release/2026-09-22` (the tag
`ship-2026-09-22` exists locally; the remote refuses tag pushes). The client
handover moves to version 1.1 with the rounds in its changelog.

**Revert:** `git push --force origin legacy-spa:main` restores the retired
app on `main` — a force push, and one that would publish the old app: run
it only with the deploy workflow disabled or with `v2` pushed again right
after. Deleting `release/2026-09-22` and `legacy-spa` returns the branches
to the old arrangement.

**Refreshed 2026-09-22, round 34, for the map's sign-off.** Wil, on round 29
live: "As far as i can see map page is done push to master and live site and
document everything…". The same procedure, an hour later: a merge commit
with two parents — the mirror's tip `4e01f8f` and round 34's `v2` tip —
whose tree is `v2`'s, pushed to `main` as a fast-forward, and
`release/2026-09-22` moved to the same tip. Every later sign-off repeats
this, so the mirror's history is one merge commit per sign-off, each
pointing at the `v2` commit it carries. Revert as above.

**Refreshed 2026-09-22, round 35, for the Android bottom lane's sign-off.**
Wil, on round 33 live: "As far as i can see these edits are done push to master and live site and document everything and the final version that we are shipping to the client accordingly and to best practices." The same
procedure: a merge commit whose tree is round 35's `v2` tip's, its parents
`main`'s tip at the moment of the push and that `v2` tip (both named in the
mirror commit's own message), pushed to `main` as a fast-forward, and
`release/2026-09-22` moved to the same tip. When this round was written
(18:22 UTC) the remote held `main` at `8095a82` and `release/2026-09-22` at
`130a48c`; the tip this mirror carries: rounds 33–35 and, from the other sessions, round 34 and round 23's device passes up to the tip's own commit ("Client round 23, device pass 17: the edge trigger — Safari…"). Revert as above.

**Refreshed 2026-09-22, round 37, for the Paintings page's second sign-off.**
Wil, on round 36 live: "As far as i can see paintings page is done push to master and live site and document everything and the final version that we are shipping to the client accordingly and to best practices."
The same procedure: a merge commit whose tree is round 37's `v2` tip's, its
parents `main`'s tip at the moment of the push and that `v2` tip (both named
in the mirror commit's own message), pushed to `main` as a fast-forward, and
`release/2026-09-22` moved to the same tip. When this round was written the
remote held `main` at `d3d827d` (the round-35 mirror) and `release/2026-09-22`
at `e606214`; the tip this mirror carries: round 36 on top of everything
round 35 shipped. Revert as above.

**Refreshed 2026-09-22, round 44, for the chapter pages' sign-off.** Wil,
on round 43 live under the flag: "As far as i can see the way everything
works on the bakery page is how it should work on every chapter page. As
far as I am concerned, this is done push to master and live site and
document everything and the final version that we are shipping to the
client accordingly and to best practices." The same procedure: a merge
commit whose tree is round 44's `v2` tip's, its parents `main`'s tip at the
moment of the push and that `v2` tip (both named in the mirror commit's own
message), pushed to `main` as a fast-forward, and `release/2026-09-22`
moved to the same tip. When this round was written the remote held `main`
at `f1a0e22` (the round-37 mirror, tree = `e38460d`) and
`release/2026-09-22` at `e38460d`; the tip this mirror carries: rounds
38–44 (the chapter pages restored to round 23's close, then the runway as
the phone default, with the record) on top of everything round 37 shipped.
Revert as above.
## Round 33 (Wil's 9/22 Pixel round) — the bottom lane under Android's gesture bar

**Evidence.** Wil, 2026-09-22, four Pixel 6 (Chrome, gesture navigation)
screenshots: "there is an issue with the distance between the bottom of the
screen and the home indicator … and the vertical spacing between it and the
bottom of some of the buttons/ui elements throughout the website." Measured
from the shots (1080×2400 at 2.625): Chrome draws the page to the screen's
edge and reports the 24px gesture bar as `env(safe-area-inset-bottom)`, so
`--ui-inset`'s `max(20px, inset)` is 24 and every bottom control's box stands
ON the bar's top edge, 10px above the pill (the 1858 door's box at 24.0, the
museum counter's ink at 28.6; the hero title, on the raw gutter, at 23.2; the
splash frame's border at 10.7, under the pill; the pill's top at 13.7). The
`max()` is right on iOS — the toolbar is the floor at rest, and the collapsed
inset of 34 already clears the indicator by 21px — and wrong only where a bar
is drawn over the page with no toolbar between.

**Decision.** A bottom lane: `--ui-inset-b` = `max(--ui-inset, gutter +
--gesture-bar)` and `--gesture-bar` = the reported bottom inset, both defined
only under `@supports not (-webkit-touch-callout: none)` — the inverse of the
iOS gate — and equal to `--ui-inset` / 0 everywhere else; every bottom-anchored
control (the map's lane, controls, lens, handle and hint; the museum's rail,
drawer and caps; the mini-player) reads the lane, and the two things not on it
(the splash frame's outer box, the hero lockup's inset) add the bar. iOS and
every engine with no reported bar are byte-identical (`qa:snap` 36/36 at 0
drift, `qa:framing` unchanged); on the Pixel the frame, the door, the title
and the rail sit a gutter above the bar (`qa:gesture`, 86 checks, a 24px bar
emulated over CDP). It went to the review branch first (playbook rule 4) and to `v2` at his
instruction the same day ("push them to the live site we are shipping to the
client"); the device pass is on the live site.
Plan: `docs/rounds/2026-09-22-round-33-plan.md`; playbook §12.

**Revert:** `git reset --hard client-round-33-base` (= `042518b`); or in
`global.css` drop the `@property --gesture-bar` / `--ui-inset-b` blocks, the
two `:root` lines and the `@supports not` block, and put `--ui-inset` back for
`--ui-inset-b` (and delete `+ var(--gesture-bar)`) in the round's files;
`scripts/gesture-bar.mjs` and `qa:gesture` go with them.

**Signed off, 2026-09-22.** Wil, on the live site: "As far as i can see these edits are done push to master and live site and document everything and the final version that we are shipping to the client accordingly and to best practices." Shipped by round 35 (docs only): the handover's changelog and
phone note, this log's "Ship" refresh, the round-33 plan's Closed line and
playbook §12's sign-off; the `main` mirror and `release/2026-09-22` refreshed
to that tip.

## Round 36 (Wil's 9/22 round) — `/paintings`: Skip holds still while the reader pans the hall

**Evidence.** Wil, 2026-09-22, after the ship: "New problem, the skip
button in the hall now moves its position when panning around the paintings
hall, fix this, it should never happen do not change or break anything
else." Skip was positioned on `--ui-inset`, the lane every corner shares,
which takes the deepest of the four safe areas; `env(safe-area-inset-bottom)`
is 0 with Safari's bars expanded and 34px once they collapse (playbook §1),
and a pan on the hall with any vertical drift is a page scroll (the canvas
keeps `touch-action: pan-y` — the walk), which moves the bars. So Skip
jumped 14px right and 14px down on every pan and back on the next — round
23's burger symptom on the other top corner, carried since as the
playbook's open item ("Wil's call if it ever reads as jitter"). Reproduced
here with the collapsed bars' inset emulated (CDP): Skip 20/20 → 34/34,
the top-right menu (round 23's `--menu-inset`) holding beside it; nothing
else a pan does moved it.

**Decision.** Round 23's rule, mirrored for the top-left corner: Skip
reads `--skip-inset` — the gutter, the top inset and the left inset — and
nothing at the bottom edge can move it. Wherever no safe area is set the
new inset is the gutter, exactly as the old one was, so nothing changes on
desktop, tablet, Android, or the phone at rest. The chip row's band is
measured from Skip's box and holds with it; the bottom-centre column
(Face forward, the dot rail) keeps the bottom lane by design (round 33's
`--ui-inset-b`, which is `--ui-inset` on iOS) — the bottom inset is the one
that matters there — and the menu keeps `--menu-inset`.
A new instrument, `qa:skip`, drives the hall with touch and asserts the
corner holds through a look, a walk, a diagonal drag, a scroll, the
minimized viewport and the collapsed bars' inset. Numbered 36: rounds 33
(the bottom lane), 34 (the map's ship) and 35 (the bottom lane's ship) and
round 23's device pass 17 landed on `v2` from other sessions while this was
measured; rebased onto their tip, `e606214`. `main`
and `release/2026-09-22` are refreshed at his sign-off, per the ship rule
above.

**Revert:** `git reset --hard client-round-36-base` (= `e606214`); or, by
hand, delete `--skip-inset` from `.museum-stage` in `global.css` and put
`--ui-inset` back in Skip's `top`/`left` in `Museum.tsx`, and remove
`scripts/museum-skip.mjs` and the `qa:skip` script.

**Signed off, 2026-09-22.** Wil, on the live site, after his device pass:
"As far as i can see paintings page is done push to master and live site and document everything and the final version that we are shipping to the client accordingly and to best practices."
Recorded by round 37 (docs only): the handover's Paintings entry (version
1.3), this log's "Ship" refresh, the playbook's §1 and §10, the round-36
plan's Closed section; the `main` mirror and `release/2026-09-22` refreshed
to that tip.
