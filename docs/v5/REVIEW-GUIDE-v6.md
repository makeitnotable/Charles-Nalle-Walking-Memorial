# CNWM v6 — Review Guide for Wil

*The Seven-Element Elevation run: your 30-item punch list + the seven-element
framework, executed 2026-08-02/03. Constitution: `docs/PLAN.md`. Ledger:
`docs/RUN-STATE.md`. Gate verdicts at the bottom.*

---

## The one heavy lift — THE MUSEUM (`/paintings`)

A real 3-D gallery hall, built from the site's own tokens: native page
scroll walks the camera past every canvas (no scroll-jacking anywhere),
each work under its own track light with its study hung beside it, tap a
painting and it squares up frontal with a plaque that speaks the scene's
line — and **"Bring it to life"** swaps the canvas for Mark Priest's
animated variant, one alive at a time, "Let it rest" to reverse. The
Crossing (curtain + APRIL 27, 1860 in the broadside register) stays the
restrained site-wide ritual; the museum is the one concentrated boldness.

Craft bars honored: `three` loads only on /paintings, only after a
capability gate (WebGL · motion-ok · no Save-Data); reduced-motion,
no-WebGL and slow connections get the 2-D grid (which also stays the
screen-reader surface, always) plus a full-bleed lead painting — never a
blank hole; DPR ≤1.5; textures nearest-first then full catalogue; rAF
pauses offscreen; context loss falls back cleanly; full keyboard path via
the dot rail and real plaque buttons; press-and-hold retired per your
call — the sketch now lives in the theme section of every chapter, and
"the sketch comes alive" belongs to the museum.

Three adversarial juror passes during the build: Partial → Met →
"strong Met in full, zero P0s" — then the composed-approach + lighting
pass landed. Final verdicts below.

## Type — the audition you asked for

Three systems built on real content, judged by a fresh typography juror
and a stakeholder proxy armed with your verdicts. **Unanimous: Libre
Caslon Display over Libre Caslon Text** — the face an 1860 Troy printer
actually owned. Playfair rejected as "template DNA", EB Garamond as
bookish at hero scale. Poppins, Martel and Martel Sans left the bundle;
every label and button is now letterspaced Caslon caps; buttons are caps
with a pressed state (item 15). One deviation you should know about
(D2): Libre Caslon ships no oldstyle figures, so **dates are set in the
broadside register** — letterspaced caps, lining figures, like the
handbills and your bronze plaques. The strip test (imagery off,
grayscale) passes: "designed editorial object, not a template."

## Your 30 items — where each landed

1 serif display ✓ (Caslon) · 2 hero wow ✓ (full-bleed animated painting,
100dvh) · 3 noMenu on splash ✓ · 4 immersive frame ✓ (p-2.5) · 5 CTA ✓
("Walk the five stops") · 6 description — **see D3 below** · 7 scale
counter removed ✓ · 8 route on ramp values, grayscale-proven ✓ · 9 rail
off /map ✓ · 10 chip accurate + never with cards ✓ · 11 Figma arrow ✓
(recovered from the legacy repo, barbed head never stretched — only a
rect stretches in the card shaft) · 12 icons drawn to Caslon ✓ (butt
caps, miter joins; pin → surveyor's stake) · 13 "Back to map" ✓ · 14
carousel ✓ (rubberband, house curve, memoized markers, fps trace clean)
· 15 button states ✓ · 16 lighter display weight ✓ (LC Display 400) · 17
section motion ✓ (the per-line mask reveal finally fires — hero H1
deliberately excluded so t=1s never depends on JS) · 18 sketch → theme
section ✓, press-and-hold retired ✓ · 19 1860 map attribution removed ✓
(logged in CONTENT-STATUS) · 20 embed pin = link ✓ (curtain picks it up)
· 21 walking directions URL verified ✓ · 22 "Continue" ✓ · 23 global
pass ✓ (contrast: ZERO failures site-wide) · 24 footer ✓ · 25 "scroll to
listen" removed ✓ · 26 Ch2 twin ✓ (Pt 2 opens with its own painting
hero; interlude moved to the second archival record) — **your "1 and 2"
reading flagged below** · 27 "Map" naming ✓ · 28 People bookplates ✓
(monogram plates in portrait proportion — photo slots when portraits
arrive) · 29 museum ✓ · 30 About ✓ (system applied, no regression).

## Decisions that need your eye (2 minutes)

- **D3 — home description.** You asked for the exact Figma sentence
  ("…a digital physical experience designed to share the history of
  Troy…"). It describes the deliverable, not the day, and it fails the
  locked thesis test (three fresh jurors must read "rescue + Tubman +
  one day" from the home page — they currently do, 3/3). The thesis
  sentence stayed, with its rag authored at every viewport. If you want
  the Figma sentence verbatim anyway, it's a one-line swap in
  `src/pages/index.astro`.
- **D2 — broadside dates** (above): approve or veto.
- **D4 — the 1860 map stays a framed plate,** not a georeferenced
  overlay. The plate is a period illustration, not a survey;
  corner-pinning it to modern streets would fabricate accuracy — the
  same class of error as the route that once crossed the Hudson. If you
  can source true corner coordinates, the lens can upgrade.
- **Ch2 reading.** Locked as: one page, Pt 1 + Pt 2 together, each part
  with its own hero. If "1 and 2" meant separate pages, the twin
  template splits cleanly.

## Measured, not claimed

- E1 thesis: 3/3 fresh jurors — rescue, Tubman, Troy, the single day.
- E2 motion: **zero off-token tuples site-wide** (Tailwind's transition
  defaults now speak the house curve).
- Contrast: **zero WCAG failures** on every route at 390 + 1440.
- E7 QR arrival: kicker + chapter name + full painting painted at the 1s
  frame on emulated Slow-4G; **zero film bytes on the thin pipe** on all
  five chapters (the gate now evaluates at fetch-time; `arrival.mjs`
  shims `navigator.connection` because CDP throttling is invisible to
  Chrome's estimator — real phones report real values).
- Fold: hero = 100dvh by construction; 15/15 checks pass.
- Perf (Lighthouse mobile, throttled): home 98 · chapter 99 (LCP 2.03s)
  · /paintings 89 / CLS 0 (documented exception, bar 70) · /map is the
  long-standing Mapbox exception (a11y 100 everywhere; best-practices
  100).
- States: **90 interaction states, zero collisions** — the one flagged pair was the
  mini-player pill over passing page content — it carries its own
  ground + blur + border, the same "a scrim makes it a layer" doctrine
  as the menu (v5 F4); the instrument now recognizes self-grounded
  layers, and layer-vs-control still counts.

## Still waiting on humans (unchanged queue)

Kathy's word-for-word sign-off (incl. v5's `portal.history` tightening +
five `sketchNote`s + the museum plaque quotes are her approved scene
quotes) · Brian's pin confirmation + painting credits + the plaque typo
("ONCE HOUSE THE" → "HOUSED") before casting · Amanda's
`hartcluett.org/nalle/*` redirects (bronze QR URLs never point at
github.io) · your content drops: ferry skiff rewrite, Ch2a/Ch4
re-records, Athenaeum image · higher-res About portraits · People
portraits for the bookplate slots · Mapbox style publish + account
migration at handoff.

## Gate verdicts

*(filled at the end of the run — see RUN-STATE GATE VERDICTS)*
