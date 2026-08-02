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

**Before/after pairs (same screens, old build → new build), phone width:**
- `docs/qa/before-after/home-390.jpg` — the approved front door, now with Mark Priest's film living in the frame
- `docs/qa/before-after/chapter-390.jpg` — the chapter, now opening on the sketch that develops under your finger
- `docs/qa/before-after/map-390.jpg` — the walk, now with all five stops framed, the route drawn, the date, and the 1860 lens

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
- **Phase 5:** /bakery (the QR path): perf 89 · a11y 100 · 598KB (was 79/93/4.79MB); home
  perf 90; map TBT 3289→304ms, CLS 0.64→0.001. Full table + residuals: docs/qa/phase5/RESULTS.md.
- **Phase 6:** live deploy verified end-to-end; four discipline finals + stakeholder test run
  against the LIVE URL; every blocking finding fixed and re-probed live the same night
  (final state: commit f0db253).

## Review verdicts (files in docs/qa/reviews/)
| Review | Verdict |
|---|---|
| Phase 0 QA smoke | PASS (P1 marker numerals fixed) |
| Phase 0.5 blueprint | YES — 9 gaps all resolved in the amended blueprint |
| Phase 1 Visual Design | PASS (conditional fixes applied) |
| Phase 2+3 Visual Design | FAIL → all P0/P1 fixed same-night (pill ladder, home atmosphere, embed verified) |
| Phase 2+3 Motion Design | PASS conditional → both P1s fixed + probe-verified (flight skip, map CLS 0.0012) |
| Phase 2+3 UX | PASS both walkthroughs → 4 P1 polish fixes applied |
| Phase 2+3 QA smoke | PASS (0 P0/P1) → 3 P2s fixed |
| Phase 5 QA full | Numbers recorded; 3 documented residuals, none blocking (docs/qa/phase5/RESULTS.md) |
| Phase 6 Visual Design (live) | RED → GREEN: pill ladder/home/embed verified; the one new P0 (corrupted /people h1 from a bad edit) fixed + live-probed |
| Phase 6 Motion Design (live) | **GREEN** — flight-skip + CLS fixes proven on live (pixel-diff evidence), reduced-motion 20/20, zero console errors |
| Phase 6 UX (live) | RED → GREEN: ferry viewport blowout + hint tap-eating fixed + live-probed; both journeys complete unaided |
| Phase 6 QA (live) | RED → GREEN: /people + carousel desync fixed + live-probed 4/4; matrix/console/deep-links/blueprint spot-audit 8/8 all clean |
| Returning-stakeholder test | **RECOGNIZE: YES · WOWED: YES** — 14 screens narrated; favorite moments: press-and-hold, map dive + cards, tap-to-read-aloud |

## Pre-existing stakeholder items (unchanged — playbook Parts A/C/D)
- **Kathy:** word-for-word content sign-off (Part D). Pending content: ferry "skiff" rewrite,
  Ch2a/Ch4 audio re-records (Wil's drops).
- **Brian:** pin placement confirmation, painting credits, the plaque typo ("ONCE HOUSE THE" →
  "HOUSED") — must reach Brian BEFORE casting.
- **Attribution check (new, from the stakeholder test):** the 1860 map lens caption says
  "painted by Mark Priest" (carried over from v2). The reviewer role-playing Kathy flagged it
  could read as a period engraving — confirm authorship with Mark/Kathy; the caption is one
  line in `src/components/TroyMap.tsx` if it needs changing.
- **Amanda:** `hartcluett.org/nalle/*` URL mappings (Part A — still the gate to Matt's
  payment). Bronze QR URLs point at hartcluett.org, never at github.io.
- **Wil:** Athenaeum image for the barbershop; Mapbox style publish + account migration at
  handoff (Part E).

## Residuals (open items, none blocking)
1. **Pin labels** read "Commissioner's Office / Gilbert Mansion / Ferry Landing" (accurate, from
   Kathy-corrected content) where the approved Figma showed "Bank / Mansion / Ferry". Deliberate:
   accuracy over nostalgia; one-line change per label in `src/content/chapters/*.json` to revert.
2. **/bakery Lighthouse 89** (bar 90) at simulated 4G; real-device LTE comfortably faster; page
   is 598KB total. Next lever documented in phase5/RESULTS.md.
3. **/map Lighthouse 66** — inherent WebGL-map cost; interaction health clean (TBT 304ms,
   CLS 0.001, a11y 100). The QR path never pays it.
4. **Wheel over the full-screen map zooms the map** (standard map-page tradeoff; index below is
   reachable by keyboard/touch).
5. **Stops 1/2 pill overlap at the settled overview** (Commissioner's Office's long pill can sit
   over Bakery's in the State St cluster at some widths). Carousel, index, and screen-reader
   paths all reach stop 1; tapping either pill works. Cheapest fix if wanted: shorten the pill
   label to "Commissioner" (pill only, content unchanged).
6. **Mapbox draft-style load varies 1.2–6.5s on cold caches** before the prologue starts —
   benign (static content is already painted), worth knowing for live demos.

## Self-audit table (plan acceptance criterion → evidence)

| Criterion (docs/PLAN.md) | Evidence |
|---|---|
| P0: map visibly a map at 390/768/1440, screenshot-proven | docs/qa/phase0/map--*.png; live: docs/qa/phase6-live/map--390.png |
| P0: emitted CSS contains island utilities (grep, not assume) | scripts/check-css.mjs in `npm run build` (6 guards, green every build) |
| P0: build guard permanent | package.json build script + scripts/check-css.mjs |
| P0: harness runs in one command | `node scripts/shots.mjs <outdir>` (used in every phase) |
| P0.5: every elevation entry traceable (a/b/c/d) | docs/ELEVATION-PLAN.md (status-tracked, all ☑ or explicit) |
| P0.5: independent blueprint review "yes" | docs/qa/reviews/phase05-blueprint-review.md (YES; 9 gaps → all resolved) |
| P1: styleguide matches Reference (pixel-sampled) | docs/qa/reviews/phase1-visual-design.md (60/60 hexes, ladder measured) |
| P1: no Fraunces/Newsreader/paper remnants | same review, computed font sweep clean |
| P2: side-by-sides read as one design, elevated | docs/qa/before-after/*.jpg; phase23 + phase6 visual reviews |
| P2: every v2 feature present in new skin | press-reveal (chapter hero), synced narration (AudioStory), People/Paintings/About, entry moment (home film) |
| P2: no dead ends | UX review walkthroughs + related-ladder exits (C11/A2/P-banner) |
| P3: marker/card specs match Reference values | docs/qa/reviews/phase23-visual-design.md (pixel-sampled) + pill-ladder fix verified in phase6 final |
| P3: carousel overlap −20px mobile, two-tap | TroyMap keen-slider config + UX review |
| P3: tour skippable, no console errors | Motion review (Stop the walk verified) + QA review (0 JS errors, 20 loads) |
| P4: zero CLS from animations | Motion review: CLS ≈ 0 all pages; map hydration 0.0012 |
| P4: every effect + reduced variant inventoried | docs/MOTION.md (31 rows) + Motion review parity run (19/19) |
| P4: award-DNA seven-point self-audit | signature (press-reveal) · narrative framing (curtain/date) · type identity (ladder) · motion thesis (MOTION.md) · sound opt-in (S6) · craft seams (favicon/404/curtain-as-loader) · media pipeline (598KB QR page) |
| P5: metric numbers recorded | docs/qa/phase5/RESULTS.md + summary.json |
| P5: content vs Kathy's corrections | `git diff 22ee66f..HEAD -- src/content src/data` = empty |
| P6: live URL end-to-end verified | all routes 200 + docs/qa/phase6-live/ captures |
| P6: four discipline greens on live + stakeholder test | docs/qa/reviews/phase6-*-FINAL.md + phase6-stakeholder-test.md |
| Compaction protocol held all night | docs/RUN-STATE.md (every step timestamped) + ~35 commits on origin/v2 |
