# v5 FIX-PLAN

*Stage 2. Every finding in `docs/v5/AUDIT.md` mapped to a concrete change, in
execution order. No fix is done from code — only from pixels: implement →
re-shoot the same view → check off in `docs/RUN-STATE.md` with before/after
paths.*

Order is fixed: **the four confirmed defect classes first**, then structural,
then the small-cuts sweep.

---

## F1 · Type scale — the ladder becomes fixed steps (A1–A14, F2)

**F1.1 — Display becomes a real step, with the fit-clamp demoted to a guard.**
`.t-display` currently *sizes itself* from `--fit-chars`, so the role has six
sizes. Change the formula so the authored step is the size and the clamp only
prevents overflow of an unusually long string:

```
font-size: min(var(--fs-display), var(--fit-basis) / (var(--fit-chars) * 0.72))
```

The constant is measured, not guessed. Rendering all 26 display strings on the
site at 100px in Martel Sans ExtraBold uppercase with the system's −0.02em
tracking gives an advance-per-character of **mean 0.618em, min 0.546
("IS PERSISTENT"), max 0.763 ("HOME")** — a 40% spread, which is why a
character count can never *be* the size. So the guard takes **0.72** (above
every string longer than five characters, including "WASHINGTON" at 0.709) and
exists only to stop an overflow; the authored step is the size.

No floor: `clamp(floor, size, guard)` returns the floor when floor > guard, so a
floor would reintroduce overflow at 390 on the longest string
("AUTHORITARIANISM", which legitimately cannot be large on a phone).

With F1.2's cap this resolves to **one size at desktop for every display on the
site** — the guard stops biting above 768px once the moral leaves the narrow
editorial column (F5.1). *Fixes A3, A4.*

**F1.2 — Cap the desktop display step.** `--fs-display` 116px → **88px** at
≥1200px, 76px → **64px** at ≥768px. Measured target: the hero H1 occupies ≤22%
of viewport height at every breakpoint (currently 37%). *Fixes A1.*

**F1.3 — Gate the desktop step on height.** Every `min-width` type breakpoint
becomes `(min-width: 768px) and (min-height: 600px)` so a 844×390 landscape
phone keeps mobile type. *Fixes A2 — the single worst breakpoint on the site.*

**F1.4 — Compute every `--fit-chars` from its own string.** `/map`, `/paintings`,
`/people`, `/404` are hand-counted and drift. Add a `longestLine()` helper to
`src/lib/` and use it everywhere `[chapter].astro` already does. *Fixes A8, A9.*

**F1.5 — Separate the 15px pile-up.** Add `--fs-spine-sm: 13px` for the chapter
spine list (deleting `ChapterSpine`'s inline `font-size:15px`), keep `btn` at
15px, move `t-meta-body` to 14px at desktop. Target: no size carries more than
two roles. *Fixes A6, A7.*

**F1.6 — Role-map the strays.** The census finds unstyled 16px and 21px spans
and anchors. Give each a role class. *Fixes A5.*

**F1.7 — `/404` H1 becomes `t-title`.** A 36-character sentence is not a name.
*Fixes A14.*

**F1.8 — Home wordmark onto the display step**, off its own vw ladder. *A13.*

**F1.9 — `/people` H1 authored breaks**: "ONE DAY. / A WHOLE CITY'S CAST."
*Fixes A10, A11.*

**F1.10 — Mapbox chrome to 12px `t-meta`.** *A12.*

Gate: re-run `scripts/census.mjs`. Pass = ≤6 sizes per page, ≤2 roles per size,
display renders one size per breakpoint, nothing under 12px.

---

## F2 · The chapter hero — solve the fold (B1, B15, A1, F2)

The header declares `min-h-dvh` and its contents sum to ~112dvh. Rebuild as an
explicit two-row grid instead of a stack of competing minimums:

```
#hero { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr; }
```

- Row 1 (`auto`): meta line → H1 → rule → scroll cue. Takes exactly what it needs.
- Row 2 (`1fr`): the media. Takes **everything left**, never less than 34dvh.
- Delete `md:min-h-[46dvh]` from the lockup and `min-h-[42dvh] md:min-h-[46dvh]`
  from the media — both are the bug.
- `pt-20/24` → `pt-16` (the walk rail is 3–24px, not 96px).

Measured acceptance: `hero-media.bottom ≤ viewport height` at all five
breakpoints, on all five chapters. *Fixes B1, B15, A1, F2.*

---

## F3 · Duplicate imagery — every slot draws a distinct asset (D1–D6)

**F3.1 — The interlude stops repeating the hero.** Add an `interlude` key to each
chapter's media resolution, chosen so no chapter repeats:

| chapter | hero (reveal) | press-reveal | **interlude (new)** | history | moral |
|---|---|---|---|---|---|
| bakery | horizontal | horizontal | **vertical** | historical film | moral |
| commissioners-office | horizontal | horizontal | **horizontal-pt2** | historical film | moral |
| mansion | horizontal | horizontal | **square** | historical film | moral |
| ferry | horizontal | horizontal | **narrative2** | historical film | moral |
| barbershop | horizontal | horizontal | **narrative1** | historical film | moral |

The press-reveal keeps the horizontal painting — resolving *to the painting* is
the entire point of the interaction; it is the one intentional repeat, and it is
separated from the hero by two full sections. *Fixes D1, D5.*

**F3.2 — Delete the moral thumbnail.** `[chapter].astro:362–368` renders
`moral-800.webp` at 220×220 in front of the same image used as the section's
full-bleed background. Delete it; give the call-to-action the width it frees.
*Fixes D2.*

**F3.3 — Chapter 2 gets its second scene's own imagery.** Scene 2 currently
inherits scene 1's assets. Wire `horizontal-pt2` / `sketch-pt2` / `moral-pt2` /
`historical-pt2` to the part-2 sections. *Fixes D4.*

**F3.4 — `/map` index uses `vertical`, not `square`.** *Fixes D3.*

**F3.5 — Home serves `home-bg-1440` above 800px.** *Fixes D6.*

Gate: `scripts/probe.mjs` "Repeated imagery" table is **empty** for every route
except the one documented press-reveal pair.

---

## F4 · Floating UI — one lane system (C1–C9, B2, B3, B7, B8, B9, B13, B14)

**F4.1 — One inset token.** `--ui-inset: var(--gutter)` — every floating element
(menu, mini-player, map controls) aligns to the same gutter the content uses, so
nothing floats 124px adrift. *Fixes B2, B7.*

**F4.2 — Reserved lanes, declared once.**

| lane | owner | never shared with |
|---|---|---|
| top edge, full width, 3px | walk rail | — (it is 3px and inert) |
| top-right | corner menu | map markers, map header |
| bottom-left | mini-player (chapters) / geolocate + scale (map) | — |
| bottom-centre | map primary CTA | — |
| bottom-right | Mapbox attribution | corner menu |

**F4.3 — The map menu moves to bottom-right** (the `Base.astro` prop that
already exists and was never passed), and the marker field gets a top+right safe
area so no marker can sit under either corner. *Fixes C1, C2, C8.*

**F4.4 — Menu panel fits its own longest label.** Width from `20rem` → `22rem`,
and the chapter name step drops to `t-meta`-scale where the longest name
("Commissioner's Office") would otherwise overflow. Add `max-height:
calc(100dvh - 2*var(--ui-inset))` + `overflow-y:auto` so the 844×390 case cannot
exceed the viewport. *Fixes C3, C4.*

**F4.5 — Marker labels stay inside a safe area.** Pad the `fitBounds` and clamp
each label's offset so no pill crosses the viewport edge at 390. *Fixes C5.*

**F4.6 — Walk rail clears embedded chrome.** Rail `z-index` 900 → below the
embedded map's marker layer, or (simpler and better) the embedded map in the
onward section gets `margin-top` so it never sits under the rail; and
`.editorial > .rail` sticky `top` goes from 88px to `calc(24px + var(--sp-3))`
so the spine cannot be sliced. *Fixes C6, C7.*

**F4.7 — Footer padding follows the actual menu position.** `md:pr-28` only when
the menu is bottom-right; `pb-28` only on chapter pages. *Fixes B8, B9.*

**F4.8 — Map chrome onto the system**: scale bar and attribution restyled,
geolocate and scale on one left lane. *Fixes B13, C9.*

**F4.9 — Drop the loading placeholder on hydrate.** *Fixes B14.*

Gate: `scripts/states.mjs` reports **0 collisions in all 110 states**, including
menu-open + audio-playing + map-focused.

---

## F5 · Rhythm and composition (R3, B4, B5, B6, B10, B11, B12, G1, G2)

**F5.1 — Break the metronome.** Chapter section gaps become a composed sequence
instead of seven identical 200s:

| section | gap before | why |
|---|---|---|
| scene(s) | `--space-beat` (128) | close after the hero — the story starts fast |
| sketch | `--space-section` (200) | a breath |
| interlude | **0** | the painting arrives hard against the sketch — the process resolves |
| history | `--space-void` (400) | the act change, already the cream ground |
| moral | `--space-beat` (128) | the moral lands *on top of* the history, not after a pause |
| onward | `--space-void` (400) | the story is over; the walk continues |

Measured acceptance: no chapter page has more than three equal consecutive gaps.

**F5.2 — Chapter 2 breaks the scaffold** using its two scenes (two listening
sections already exist; give them their own imagery and a shorter gap between
them so the pair reads as one escalating event).

**F5.3 — Ferry and Barbershop** use `narrative1/2` as full-bleed interludes
rather than only inline films, so the two chapters with extra art *look* like
they have extra art. *Fixes E5.*

**F5.4 — Home recomposed** (B5, B6, E7, E8): group the lockup, name the walk and
its size on the CTA, lead the copy with April 27 1860, raise the frame border.

**F5.5 — `/people` two-column lockup** with a face above the fold. *Fixes B4.*

**F5.6 — Sketch section**: affordance on the artwork, ground the white sketch.
*Fixes B11, B12.*

**F5.7 — `/map`**: the five stop cards visible on arrival; one primary CTA, one
quiet. *Fixes G1, G2.*

**F5.8 — `.bleed` geometry fixed** so no block measures −72px. *Fixes B10.*

---

## F6 · Content dedup and voice (E1–E10)

**Rule: Kathy Sheehan's approved facts are untouchable.** Every edit below
removes a *restatement* or sharpens a *label*. No stated fact is altered,
added, or removed. Every change is logged line-by-line in
`docs/CONTENT-STATUS.md` so it is auditable and reversible.

**F6.1 — `portal.history` 4 paragraphs → 2, in all five chapters.** P3 restates
P0+P1+P2; keep P3's *corrected* wording (ferry's "waiting skiff" is Kathy's
correction) and fold in the distinct facts from P0–P2. Net: every fact survives,
the restatement dies. *Fixes E1, E10.*

**F6.2 — Resolve `historicalContext` ↔ `portal.history` overlap.** Where a
numbered fact and a portal sentence say the same thing (bakery 1↔P0,
barbershop 2↔P0), the numbered fact wins — it is the tighter form — and the
portal sentence drops. *Fixes E2.*

**F6.3 — Six distinct moral CTA titles**, one per chapter, in that chapter's
voice. Titles are labels, not Kathy's narrative. *Fixes E3.*

**F6.4 — `/people` takes a different quote** so the Tubman line belongs to
Chapter 2 alone. *Fixes E4.*

**F6.5 — "From the sketch" copy becomes per-chapter** or states the process once
site-wide. *Fixes E6.*

**F6.6 — Home copy and CTA rewritten.** *Fixes E7, E8.*

**F6.7 — `/people` eyebrow cut.** *Fixes E9.*

---

## F7 · Motion (F1, F3, F4, F5)

- **F7.1** Cut the interlude Ken Burns and the hero 1.15 scale. Keep motion for
  the press-reveal (the thesis: the past developing into the present), the
  curtain, and the act-change ground. *Fixes F1, F2.*
- **F7.2** Home entrance 2.8s → ≤1.6s total. *Fixes F3.*
- **F7.3** Menu retreat threshold raised; close animation one duration. *F4, F5.*

---

## F8 · Small-cuts sweep (G3–G5, B13, and anything the re-shoot surfaces)

Footer link padding · menu close-button proportion · Mapbox tap targets ·
map left-lane alignment · plus a fresh pass over the re-shot matrix, since
fixing rhythm and type will expose seams that the current spacing hides.

---

## Execution order

1. **F1** type (touches everything downstream)
2. **F2** hero (the single highest-value fix)
3. **F3** imagery
4. **F4** floating UI
5. **F5** rhythm and composition
6. **F6** content
7. **F7** motion
8. **F8** sweep

After each: re-shoot the affected views, record before/after in RUN-STATE,
commit. Push every 3 commits. Then Stage 4 — the adversarial juror gate.
