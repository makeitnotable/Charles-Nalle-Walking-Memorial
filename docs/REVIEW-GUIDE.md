# CNWM v3 — Morning Review Guide

*Draft scaffold (built during the overnight run; finalized in Phase 6 with live-deploy
evidence). Part (a) is stakeholder-presentable; part (b) is Wil's internals.*

---

# (a) For Kathy, Brian, and Amanda — what's new

**The live site: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/**

This is the website you approved — the same colors, the same type, the same screens — now
built on a faster, sturdier foundation, with the paintings brought to life.

**A short walkthrough (5 minutes, phone in hand):**

1. **The front door.** The page you approved — CHARLES / NALLE over the painting, Troy NY,
   1821—1875 — but the painting now *moves*: Mark Priest's artwork plays like a living scene
   inside the frame.
2. **Press and hold.** Open Chapter 1 (Holeur's Fashionable Bakery). The pencil sketch sits
   under your finger — press and hold it, and the finished painting develops and wakes into
   motion. This is the site's signature moment.
3. **The narration reads along.** Tap play on the audio player (the same card design you
   approved). As Kathy's narration plays, the paragraph being read glows softly. Tap any
   paragraph to hear it. Keep scrolling — a small player follows you.
4. **The walk.** Open the map. The city rises into view — the labeled pins, the walking
   route drawing itself between the five stops. Tap a stop, and the camera dives to the
   street. Tap "Take the walk" for a guided flight over the whole route. Tap "See Troy in
   1860" to see today's map dissolve into Mark's painted map.
5. **Every road leads onward.** People, Paintings, About — everything is one tap from the
   corner menu, and every page ends with a door to the next.

**Before/after pairs (same screens, old build → new build):** see the gallery in
`docs/qa/` — [to be assembled in Phase 6: home, chapter, map, about at phone width].

Nothing about the content changed without a documented correction — the words are Kathy's,
the pins are Brian's, the paintings are Mark's.

---

# (b) Wil's internals

## Three-way comparison
- **v3 live:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
- **Legacy (approved rendering):** https://charles-nalle-walking-memorial.vercel.app
- **Figma:** nodes 1950-16104 / 1950-16312 / 1950-16313 in "Website — Charles Nalle WM"

## What happened tonight (one line per phase)
- **Phase 0:** the island-CSS bug fixed two layers deep (Tailwind `@source` + the
  mapbox-gl.css cascade override that was the real killer); permanent build guard; Playwright
  QA harness; map visibly alive at all widths for the first time.
- **Phase 0.5:** five benchmark sites studied hands-on by independent agents →
  `docs/INSPIRATION.md` + `docs/ELEVATION-PLAN.md`; blueprint independently reviewed (YES),
  9 gaps closed.
- **Phase 1:** the approved design system rebuilt (5×12 ramps, the ×1.25/×1.5 ladder,
  Martel Sans + Poppins self-hosted) — `/styleguide`; independent Visual Design review PASS
  (60/60 hexes exact, ladder measured exact).
- **Phase 2:** Home, chapter template, curtain, corner menu, People/Paintings/About/404 —
  the approved skeletons with v2's features (press-reveal, synced narration) woven in.
- **Phase 3:** the approved map experience rebuilt to spec + elevated (route-draw, guided
  walk, 1860 lens, deep links, geolocate).
- **Phase 4:** the award layer — painting interludes, quote reveals, date over-titles,
  animated paintings in the gallery, fail-open curtain, focal-point crops.
- **Phase 5:** [perf numbers — to be filled]
- **Phase 6:** [live verification + final reviews — to be filled]

## Review verdicts (files in docs/qa/reviews/)
| Review | Verdict |
|---|---|
| Phase 0 QA smoke | PASS (P1 marker numerals fixed) |
| Phase 0.5 blueprint | YES — 9 gaps all resolved in the amended blueprint |
| Phase 1 Visual Design | PASS (conditional fixes applied) |
| Phase 2+3 Visual Design | [pending] |
| Phase 2+3 Motion Design | [pending] |
| Phase 2+3 UX | [pending] |
| Phase 2+3 QA smoke | [pending] |
| Phase 5 QA full | [pending] |
| Phase 6 live (all four) | [pending] |
| Returning-stakeholder test | [pending] |

## Pre-existing stakeholder items (unchanged — playbook Parts A/C/D)
- **Kathy:** word-for-word content sign-off (Part D). Pending content: ferry "skiff" rewrite,
  Ch2a/Ch4 audio re-records (Wil's drops).
- **Brian:** pin placement confirmation, painting credits, the plaque typo ("ONCE HOUSE THE" →
  "HOUSED") — must reach Brian BEFORE casting.
- **Amanda:** `hartcluett.org/nalle/*` URL mappings (Part A — still the gate to Matt's
  payment). Bronze QR URLs point at hartcluett.org, never at github.io.
- **Wil:** Athenaeum image for the barbershop; Mapbox style publish + account migration at
  handoff (Part E).

## Residuals (open items, none blocking)
- [to be finalized in Phase 6 — target: none]

## Self-audit table
- [Phase 6: every acceptance criterion in docs/PLAN.md → evidence link]
