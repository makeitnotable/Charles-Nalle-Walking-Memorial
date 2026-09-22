# Phase 2+3 QA Smoke Review

Reviewer: fresh-context QA pass (no builder context). Date: 2026-08-02.
Target: preview server at http://localhost:4321 (build frozen; src/ untouched).
Evidence: docs/qa/phase23-qa/ (30 matrix captures + scroll shots + 5 landscape
shots), scratch/qa-console-network.mjs, scratch/qa-interactions.mjs,
scratch/qa-interactions2.mjs, scratch/qa-weight.mjs, scratch/qa-landscape.mjs.

## Verdict: PASS

No P0 or P1 defects. Three P2 cosmetic/perf notes below. All six checklist
areas green.

## Checklist results

1. **Full matrix (10 routes × 390/768/1440, --scrolls 2) — PASS.** All 30
   captures succeeded, zero capture failures, zero console errors reported by
   the shots harness. Every base capture viewed plus a broad sample of scroll
   shots: no layout breakage, no horizontal overflow, no invisible content, no
   broken images. Map renders full-viewport with all five stem-and-dot pills
   (all five verified upright and legible at 768/1440); chapter heroes, people
   cards, paintings grid, about page, and footers all intact at all widths.

2. **Console/network sweep (all 10 routes × 390 and 1440, full-page scroll to
   hydrate islands) — PASS.** **0 JS errors / 0 page errors across 20
   page-loads.** No 4xx/5xx responses on any route. The only `requestfailed`
   entries are `net::ERR_ABORTED` on chapter audio mp3s — verified benign: the
   files exist in dist/audio/ and serve 206 Partial Content; the abort is the
   browser closing its `preload="metadata"` range stream, not a missing asset.
   Only warnings were headless-Chromium WebGL perf notices (GPU stall due to
   ReadPixels) on map-bearing pages — environment noise, not app output.

3. **Landscape phone 844×390 (/bakery, /map) — PASS.** No horizontal overflow
   (documentElement scrollWidth 844 = viewport on both). Bakery hero, 3-column
   fact list, embed map, and footer all lay out correctly; map overlays and
   experience-door buttons visible and reachable. See P2-2 for a framing note.

4. **Interaction checklist — PASS (10/10).**
   - Menu links navigate through the curtain (sampled 3: "3. Mansion" → /mansion,
     "The Walk" → /map, "About" → /about).
   - Chapter "Continue the walk" navigates (/mansion → /ferry).
   - Share button doesn't throw; clipboard fallback fires ("Link copied").
   - Map marker click → overlap carousel appears (5 cards).
   - Overview button returns to overview (carousel unmounts, experience doors
     return).
   - 1860 lens toggles on (overlay opacity 1, aria-hidden=false, button flips
     to "Back to today") and back off cleanly.
   - Paintings dialog opens (native `<dialog>`, correct image) and closes via
     the close button.
   - /nonexistent returns HTTP 404 and renders the crafted 404 page ("This page
     isn't part of the memorial") with both CTAs.
   - First interaction run had two FAILs; both were test-script bugs (a strict-
     mode locator collision — Mapbox's geolocate control also carries
     `aria-pressed` — then a harness GPU crash), re-run green with fixed
     locators. No app defect.

5. **Weight & map-bundle isolation — PASS.**
   - /bakery @390, initial load to network idle: **23 requests, 4,792,992 bytes
     (~4.68 MB)**. Composition: historical.mp4 2.05 MB (intentional muted
     autoplay loop) + ch1 audio 1.32 MB (preload stream; tag is
     `preload="metadata"`, headless Chromium pulled the full file) + images
     ~0.85 MB + JS ~0.30 MB (React client 184 KB, gsap 69 KB, chapter script
     44 KB) + CSS 49 KB. Non-media payload is ~1.3 MB.
   - **mapbox-gl.js does NOT load on /bakery initial viewport** — it loads only
     after the "Where to next" embed scrolls into view (client:visible), which
     is the sanctioned exception.
   - **/, /people, /paintings, /about: zero mapbox requests even after full
     scroll.** Isolation holds.
   - Embed map verified live at 390: after the 5s cinematic ease it settles
     with the numbered pill centered on the next stop.

6. **Island-CSS guard — PASS.** `node scripts/check-css.mjs` → "all 6
   island-CSS guards present ✓" (exit 0) against the frozen dist.

## Defects

1. **P2 — Scroll-cue arrow collides with the chapter title at 390 on the
   longest title.** On /commissioners-office at 390 the second line of "OFFICE
   OF THE COMMISSIONER" runs to the right edge and the vertical scroll-cue
   arrow overlaps the final "R" (verified at 3× zoom on
   commissioners-office--390.png). Text is not clipped and stays legible; the
   other four chapters clear the arrow. Consider a right padding reserve or
   hiding the cue under ~400px.

2. **P2 — Map overview framing crowds/clips pills on small screens.** At 390
   portrait the dismissible hint card sits over markers 2 and 5, and the
   "4 Ferry Landing" pill is half-clipped at the left viewport edge; at
   844×390 landscape only 1–2 pills are inside the initial frame. The map is
   fully draggable and every marker is reachable (and the 768/1440 overviews
   frame all five cleanly), so function is intact — but the small-screen
   first impression undersells "five stops." Consider fitBounds-style padding
   per aspect ratio.

3. **P2 (perf observation) — ~4.7 MB initial transfer on /bakery at 390.**
   Driven by the autoplay historical.mp4 (2.05 MB) and the full audio pull
   (1.32 MB) noted above. Both are below the fold, so LCP is likely safe, and
   the audio tag already requests metadata-only — real devices may fetch less
   than headless did. Worth a Lighthouse mobile pass before launch to confirm
   the M1 budget (perf ≥ 90, LCP < 2.5 s throttled); not a blocker for this
   smoke.

## Notes (not defects)

- The floating 72×72 hamburger covers content it passes at certain scroll
  offsets (e.g. a "Chapter 5" link on paintings--390--scroll2). Standard
  floating-button tradeoff; content remains reachable by scrolling.
- Static scroll captures of chapter embed maps often show the pin out of
  frame — that is the 5s cinematic arrival mid-flight, not a missing marker
  (settled state verified live and in mansion--1440--scroll2 /
  commissioners-office--390--scroll2).
- 404 h1 textContent reads "This page isn'tpart of the memorial" only because
  of the `<br>`; renders correctly on two lines.
