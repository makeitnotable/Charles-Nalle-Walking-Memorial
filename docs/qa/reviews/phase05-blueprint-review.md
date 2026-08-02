# Phase 0.5 blueprint review — independent design-director pass

*Reviewed 2026-08-02 against: `docs/INSPIRATION.md`, `docs/ELEVATION-PLAN.md`, the five
full studies in `docs/qa/inspiration/*.md`, and sampled evidence screenshots from all
five sites. No builder context — judged on what is on disk.*

## Verdict: YES — conditionally

Executed fully, this blueprint plausibly reaches the benchmark standard. The award DNA
the synthesis extracted is genuinely covered by concrete rows: the signature interaction
(C1) is validated by a museum-world twin and improved on it (keyboard + reduced-motion);
the map plan (M1–M8) is the most complete section and correctly treats marseille's
techniques as translations, not clones; the seams (S1–S6) take pasqua's two best
non-WebGL ideas; the guardrails encode exactly the failures that break the two most
theatrical benchmarks. Nothing in the plan copies a refused trap.

But "plausibly reaches" is carried by the Map and the Chapter *hero*. The chapter *body*,
mobile composition, and several keepers the synthesis itself names were silently dropped
between INSPIRATION.md and the plan. These are the gaps between "handsome tribute site"
and the standard of the five. None require new stack, new assets beyond crops, or any
change to the approved identity — which is exactly why their absence is a plan defect
rather than a scope decision.

---

## Named gaps (each materially lowers the ceiling)

**1. The chapter body never lets the paintings narrate — googleac's story-scroll /
zoom-crop grammar has no Chapter translation.**
googleac's two strongest storytelling moves — full-bleed painting-crop slides with
per-image ⓘ credit chips and blur-extended letterboxing (story-scroll), and the
zoom-crop essay (same artwork recropped, scroll = camera move, sequencing logic stated
in copy) — reach the plan only as **G3, in the Paintings dialog, "Phase 4 if time."**
Museos' crop-collage-before-the-full-painting (named in the synthesis, §museos) has no
row at all. The Chapter screen, the emotional core, is currently: hero (C1/C2) → quote
(C5) → player + transcript (C3) → moral message (C6) → next-stop map (C7). Between the
hero and the moral, the paintings do no storytelling work — Mark Priest's canvases are
the site's singular asset and the plan uses each one roughly once. Three or four
build-time crops per painting (faces, hands, the crowd) interleaved with Kathy's prose
as full-bleed beats is cheap, is precisely what both googleac and museos do, and is the
single largest ceiling-raiser missing from the plan.

**2. No mobile art-direction row anywhere — pasqua's "390 is a reframe, not a crop"
was dropped.**
The synthesis names art-directed mobile recomposition as a pasqua keeper. No blueprint
entry translates it: nothing specifies per-painting focal points / `object-position`,
portrait recomposition of the 16:9 animated videos, or mobile-specific crops. Q2
screenshots audit *layout* at 390, not *composition*. This site's primary field context
is a phone on a Troy sidewalk — the 390 render is the first impression for the QR
audience, and the plan currently leaves every painting to center-crop. Museos' own
mobile failure (near-blank 390 viewports) shows what desktop-tuned rhythm does; the
plan refuses that trap in words but assigns no row to the positive discipline.

**3. The date has no moment — "April 27, 1860" appears in zero rows.**
Museos' odometer rolling-digit date plate is named in the synthesis's own keeper list
("odometer rolling-digit dates") and then vanishes from the plan. googleac's dated
topical hook ("On April 27, 1860…" — permanent, and free) is likewise unclaimed. The
single most load-bearing fact in the story has no designed typographic moment. The
museos study itself scored this "cheap to build, huge payoff, reduced-motion fallback
is the static number." One row fixes it (chapter-opener plate or map-arrival title).

**4. Chapter exits are one-rung — the related-content ladder exists only on About (A2).**
googleac's exit pattern is two rungs: lateral siblings, then upward parent — "never a
dead end." The study's explicit steal was "end **every chapter** with exactly this
ladder: Next-stop card + 1–2 lateral cards (the People in this scene, the Painting of
this scene) → one upward banner (Walk the full route → Map)." The plan gives chapters
only C7 (next stop). P2 links People→chapters, but nothing links chapters→People or
chapters→Paintings. On a 9-page site the cross-weave is most of the IA craft; without
it, People and Paintings are orphan galleries and every chapter bottoms out in a single
door.

**5. Nothing breathes at rest — rewild's persistent ambient layer has no translation.**
The rewild study's own steal list includes a persistent warm-dark atmosphere layer
(ember/dust motes, faint lantern flicker, drifting sketch fragments — "canvas 2d or
CSS, no WebGL needed"). The synthesis dropped it. In the plan, all motion is entrance
choreography (H2), scroll response (C2/C6/C8), or media loops where a video happens to
exist (C9/G2). Once settled, the dark ground is fully static — the one quality all
four immersive benchmarks share ("the page is never static") has no CNWM answer.
Reduced-motion = off, obviously; but its absence at rest is visible the moment you put
a chapter page next to any of the four.

**6. Map furniture falls short of the "honest furniture" the synthesis itself specifies.**
INSPIRATION.md names "scale bar, recenter, one dismissible hint card" as the marseille
keeper. M8 ships only geolocate + hint card. On a literal walking tour, distance IS
content (the marseille study says exactly this), and once M8's hint invites dragging,
a "recenter route" reset is the recovery affordance. Two small controls, currently
unowned by any row.

**7. No typographic "All stops" index — marseille's index-with-live-preview was dropped.**
The synthesis keeps "typographic index with live preview." The plan's only list of the
five stops is the S3 hamburger panel — functional nav, not the full-screen numbered
index (huge names, outline-on-hover/focus, archival preview) the study proposed, which
also doubles as the keyboard/screen-reader path through the map experience. Q6 requires
keyboard end-to-end; the index is how the benchmark solved it *with craft* instead of
with a menu.

**8. The map arrival has no authored voice moment — question-led entry and the
statement beat both went unclaimed.**
Two per-site keepers point at the same empty slot: googleac's question-led front door
and marseille's dive→full-bleed statement ("YOU ARE MAJESTIC"). Home is verbatim-locked
(H3, correctly — identity guardrail), so the natural home for CNWM's question ("What
did Troy look like on April 27, 1860?") is the M3 overview arrival, and the natural
home for the statement beat is the moment after the M3/M4 dive commits (the S1 curtain
currently shows only a destination *label*, which is wayfinding, not voice). Neither
row claims any copy moment. This is where the marseille study's "emotionally big"
quality lives, and the plan currently reproduces the camera without the voice.

**9. The QR mid-walk arrival — the product's most common real entry — has no design row.**
Q4 performance-tests `/bakery` as "the QR path," so the plan knows plaque-QR visitors
land mid-story on chapter pages. But no row designs that arrival: a first-time visitor
materializing at Stop 3 gets a chapter hero with no orientation beat ("Stop 3 of 5 —
walking the route? ← the story so far / the map"). All five sites' DNA ("narrative
before navigation," "show our smallness") applies most at this entry, and it's the one
entry none of the five benchmarks had to solve — which is precisely why CNWM solving
it is award material rather than table stakes.

---

## Guardrail / identity flags

**F1. The cinematic arrivals never state their skip — H4, M3, C7.**
"Narrative before navigation, **always skippable**" is award-DNA rule 2, and M6
dutifully says "skippable at any tap." But the 5s overview arrival (H4/M3) fires on
every Continue press, and C7 runs a 5s easeTo inside every chapter — neither row
states tap-to-interrupt or reduced-motion-instant. A mandatory 5-second camera flight
on the primary CTA is a mini-gate, the exact species of failure the guardrails exist
for. S5's blanket doesn't cover "skippable," only reduced-motion. Add the skip clause
to the rows or the QA gate (Phase 6 verifies "item by item" — the item must say it).

**F2. The curtain rows (S1/S2) lack the fail-open clause the studies demand.**
Two of five benchmarks brick via exactly one mechanism: an overlay that fades but keeps
`pointer-events: auto`, with unlock chained to asset promises and no timeout (rewild's
invisible 0.0038-opacity brick; museos' pointer-trapping intro). The rewild study's
trap #1 prescribes the fix verbatim: any overlay that fades out also sets
`display:none; pointer-events:none` and has a hard fail-open timer. S1 puts the curtain
on **every** internal navigation and S2 makes it the loading state — the highest-stakes
overlay in the site — and neither row nor Q-item encodes fail-open. The #1 cross-site
refusal deserves a written, testable line, not an assumption.

No blueprint entry violates the approved identity. H1/H3/C1/C6/M1–M4 all elevate
*inside* the approved frames, verbatim copy, and exact state values — the plan is
disciplined about this, and P1/G1/A1 correctly re-skin toward the house language
rather than away from it. The identity risk in this plan is omission (gaps 1–2
leaving screens plainer than the benchmarks), not violation.

---

## Dispositions consciously accepted (reviewed, not gaps)

- **Cursor image-trail hero (museos #1)** — desktop-only garnish; dropping it is fine.
- **Wheel-handoff horizontal hub (museos #2)** — M4's carousel owns the hub role; fine.
- **Palette inversion / surfacing-into-parchment (museos #8, rewild #8)** — both studies
  recommend a cream "utility surface"; the plan stays dark throughout. Defensible under
  the approved-identity lock, but worth one deliberate look at the chapter-end zone
  (C7/credits) during Phase 4 — both benchmarks use the light band as the "you've
  arrived" cue and it costs one CSS variable pair.
- **Compass-bezel pin hover (marseille #3)** — correctly refused in favor of
  always-visible labels (M2); the anti-trap wins.
- **Organize-by toggle (googleac #7)** — right-sized omission for a 5-item site.
- **Forked hero CTA (rewild #6)** — Home is identity-locked to the single door; the S3
  menu carries the utility path. Accepted, contingent on gap 9 giving mid-walk users
  their own path in.

## Bottom line

The plan already contains the hardest 70%: a validated signature, a map worth an award
section on its own, and guardrails with teeth. The dropped 30% is concentrated in one
place — the chapter body between hero and moral, and the phone in the visitor's hand.
Add rows for gaps 1–3 (crops-as-narrative, mobile art direction, the date), wire the
ladder (4), and write the skip/fail-open clauses into S1/S2/M3/C7 (F1/F2), and the
result does not merely gesture at the five sites — it belongs next to them, with a
reduced-motion and no-gate story none of the five can tell.
