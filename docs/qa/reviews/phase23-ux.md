# Phase 2+3 UX Review — CNWM v3 rebuild

**Reviewer:** fresh-eyes UX pass, no builder context
**Date:** 2026-08-02
**Build:** frozen preview at `http://localhost:4321` (no rebuild, `src/` untouched)
**Method:** two scripted Playwright walkthroughs at 390x844 (mobile, touch), plus a
systematic audit (text sizes, tap targets, press-and-hold fallbacks, map two-tap
semantics, keyboard, no-JS). Scripts: `scratch/phase23-ux-walk-a.mjs`,
`scratch/phase23-ux-walk-b.mjs`, `scratch/phase23-ux-audit{,2,3}.mjs`.
Screenshots: `docs/qa/phase23-ux/` (a\* = walkthrough A, b\* = walkthrough B,
c\* = audit).

---

## Verdicts

| Walkthrough | Verdict |
|---|---|
| A — First-time home visitor | **PASS** (with P1 friction on the map hint, findings 1, 5) |
| B — QR sidewalk arrival | **PASS** (with P1 orientation gaps, findings 2, 3) |

No P0 (dead-end / task failure) found. Every scripted task completed unaided:
home → chapter → audio → map → focus stop 2; and deep-link → orient → audio →
next stop with walking directions. The P1s below are real friction for the two
audiences that matter most here (sidewalk QR users and older visitors) and
should be fixed before launch.

---

## Walkthrough A — first-time home visitor (evidence: a01–a12)

| Step | Result | Grade |
|---|---|---|
| Land on `/` | Wordmark, dates, one CTA ("Continue"), one-line mission text at bottom | Comprehension: **good** — single obvious action. Nit: mission text is 12px (finding 7); "Continue" reads like resuming, "Begin the walk" would orient better (finding 10) |
| Reach a chapter | Continue → map (1 tap) → marker 1 (2) → active card (3) = **3 taps**; alt path: scroll to static stop list under the map = 2 taps | Findability: **good** — markers, cards, and list all converge; effort acceptable |
| Play audio | Play button 56x56, one tap; `audio.paused=false` confirmed, button flips to "Pause narration" | **Pass** — player is ~1.6 screens below chapter landing (scroll, no extra taps) |
| Reach the map | Burger (1 tap) → "The Walk" (2 taps); menu closes cleanly via close bar (recovery tested) | **Pass** — menu is the reliable hub; wrong-tap recovery is one tap |
| Focus stop 2 | First tap on Stop 2's marker is **swallowed by the "Drag to explore · Tap a stop" hint pill** (finding 1, a11a). After dismissing: tap focuses, URL becomes `/map?stop=commissioners-office`, card slider centers stop 2, "Overview" pill appears | **Pass with P1** — the hint blocks the exact marker it is teaching you to tap |

Recovery notes: browser back works everywhere tested; focused map state has a
visible "Overview" pill (121x42); menu opens/closes cleanly; second tap on a
*marker* is a no-op (harmless), navigation lives on the active card.

## Walkthrough B — QR sidewalk arrival at `/commissioners-office` (evidence: b01–b09)

| Step | Result | Grade |
|---|---|---|
| Orient | First viewport: "CHAPTER" + badge "2" + "OFFICE OF THE COMMISSIONER" + scroll arrow. **No "of 5", no site name, no Charles Nalle context** until the story text or the menu (finding 3) | Comprehension: **partial** — you know you're at a numbered chapter, not how long the walk is or whose story it is |
| Play audio | 1 tap after ~1.8 screens of scroll; plays; paragraph-tap seek verified (3.6s → 41.4s on tapping paragraph 3) | **Pass** — within the ≤2-tap budget |
| Mini-player | Persists while scrolling: fixed bottom bar, 390x125, pause 48x56, live time chip | **Pass** (finding 9: burger overlaps its right edge) |
| Find next stop | "WHERE TO NEXT?" at page end (~10 screens down): destination embed map, "CHAPTER 3 — URI GILBERT MANSION", **Continue the walk** (214x58) + **Get Directions** (177x58, Google Maps `travelmode=walking`, correct coords) | **Pass** — unaided success; clear, big, correctly targeted |
| Chain integrity | 1→2→3→4→5 verified; ferry (no plaque) → barbershop; barbershop loops to "CHAPTER 1 — WHERE THE STORY BEGAN" | **Pass** — no dead end at the last stop |

---

## Numbered findings

### P1 — significant friction/confusion

1. **Map first-use hint intercepts taps on Stop 2's marker.** The "Drag to
   explore · Tap a stop" pill (fixed near the top) sits directly over the
   Commissioner's Office marker at initial zoom; taps on that marker hit the
   hint and die silently until the 32px X is found. It does not auto-dismiss on
   map taps (verified: still present after tapping empty map). It also
   shadows Stop 5's pill at the top edge. The hint teaches "tap a stop" while
   eating taps on a stop. Evidence: `a02`, `a11a-map-hint-blocks-marker2.png`,
   audit log "subtree intercepts pointer events". (Dismissal does persist for
   the session — good.) Fix direction: auto-dismiss on first map interaction,
   or move the hint below the top marker band.

2. **Press-and-hold hint is clipped and covered at 390x844.** On chapter load
   the only instruction for the signature interaction — "PRESS AND HOLD TO
   BRING THE PAINTING TO LIFE" — renders 12px uppercase at the exact bottom
   edge of the viewport (bottom 3px clipped; `inViewport: false`) with the
   72px menu burger covering its tail ("...TO LIFE"). On a bright sidewalk it
   is effectively invisible. Evidence: `b01`, `c01-presshold-hint.png`,
   audit log `burgerOverlapsHint: true`. The interaction itself works well
   (progress bar during hold, stays revealed after release, `aria-pressed`
   toggles — `c02`).

3. **No "stop N of M" anywhere on chapter pages.** A QR arrival sees "Chapter 2"
   but never "of 5", and the first viewport carries no site name or one-line
   premise. The brief's orientation questions ("who am I reading about, which
   stop is this, N of M?") are only fully answerable by opening the menu (2
   taps) and inferring from the numbered list. For plaque visitors who never
   saw the home page, a "Stop 2 of 5 — The Charles Nalle Walking Memorial"
   line in the hero would close the gap. Evidence: `b01`, walkthrough-B log
   (`contains "of 5"? false`).

4. **Narration scrub bar fails the 24px tap-target rule.** `input.cnwm-scrub`
   is 322x4 with a 16x16 thumb (both under the constitution's ≥24px minimum,
   and this site skews older). Paragraph-tap seek mitigates — but that
   affordance is itself invisible on touch (finding 6). Evidence: audit log
   `TAP TARGETS <24px`, CSS `.cnwm-scrub{height:4px}`,
   `::-webkit-slider-thumb{width:16px;height:16px}`.

### P2 — polish

5. **Two-tap card behavior is only arrow-deep.** First tap (marker or side
   card) focuses; tapping the centered card navigates. The visible cue is an
   arrow on the active card (`c09`) — no "tap to open chapter" text, and the
   hint only explains the first tap ("Tap a stop"). ARIA is excellent
   ("Focus stop 2: …" vs "Enter Chapter 2: …"), so screen readers actually get
   a better explanation than sighted users. Slider cards are `tabindex="-1"`,
   but keyboard users have the equivalent static stop list below the map.

6. **Paragraph tap-to-seek is a hover-only affordance.** The only hint is
   `title="Tap to hear this passage"` — invisible on touch. It works well
   (verified seek), it's just undiscoverable; a one-time visual nudge or a
   small icon on the active paragraph would surface it. Not critical-path
   (play/scrub exist), so P2.

7. **Sub-16px text on comprehension-bearing content.** Story body is 18px
   (good), but: home mission statement 12px (`type-muted`) — the only "what
   is this?" text on the landing page; press-hold hint 12px (finding 2);
   stop-list addresses 12px; section labels ("Section 1/4") 12px; player
   subtitle and time chip 12px. For a 13–75 audience these carry real
   information. Audit log: `SMALL TEXT (<16px)` per page.

8. **Footer-area links under 24px.** "THE PEOPLE OF THIS DAY →" (154x15),
   "THE PAINTINGS →" (100x15), "ABOUT THE MEMORIAL →" (142x15), "Notable"
   (46x22). Padding, not font size, is the fix.

9. **Bottom-right collision while audio plays.** The fixed mini-player and the
   72px burger overlap; the burger sits on the player's right edge and the
   time chip tucks under it (`b04`, `b07`). Nothing becomes unreachable, but
   it reads as unfinished.

10. **Home CTA label.** "Continue" on first visit implies a resumed session;
    "Begin the walk" (or similar) would say what happens next. One-word nit.

---

## Audit checklist results

| Check | Result |
|---|---|
| Body text ≥16px mobile | **Pass** for story content (18px); labels/captions at 12px flagged (finding 7) |
| Tap targets ≥24px | **Mostly pass** — markers 76px tall, play 56x56, menu links 234x28, close bar 310x72, dismiss-hint 32x32, map cards 343x128, stop-list cards ≥99px tall. Failures: scrub (finding 4), footer links (finding 8) |
| No critical action hover-only | **Pass** — play, navigation, press-hold hint all visibly labeled; paragraph-seek is hover-hinted but non-critical (finding 6) |
| Press-and-hold: labeled hint + fallbacks | Hint exists but clipped/covered (finding 2). Keyboard: Tab reaches it, focus ring visible, quick Space press triggers the full reveal (verified). Touch: hold works with progress feedback; a quick tap gives no response at all — no nudge, no partial fill |
| Audio ≤2 taps from chapter landing | **Pass** — scroll + 1 tap on every chapter tested |
| Mini-player persists on scroll | **Pass** — fixed bottom bar with pause + time on `/bakery` and `/commissioners-office` (a08, b04) |
| Map two-tap discoverable | **Works, moderately legible** — arrow cue only (finding 5) |
| Back/overview always available | **Pass** — "Overview" pill in focused map state (also on `?stop=` deep links), menu burger on every page, browser back clean |
| Keyboard | **Pass** — home tab order: skip link → Continue → burger, all with visible 2px orange outline; Enter opens menu, focus moves into panel links, **Escape closes**; chapter order: skip → press-reveal → play → scrub (arrow keys seek, verified ±2s); play via Enter works once the island hydrates |
| Map page with JS disabled | **Pass** — raw HTML contains the full 5-stop `<ol>` with real `<a href>` links; reveal-hiding is scoped to `html.js` so everything is visible; verified rendering and link visibility in a JS-disabled context (`c08-map-nojs.png`). No-JS chapter pages keep all story text and next-stop CTA readable |

## What's working well (keep)

- The "Where to next?" pattern: destination mini-map + chapter label + two big
  correctly-scoped CTAs (walking directions per stop, correct coordinates).
- Full chapter chain with a loop at stop 5 back to chapter 1 — no dead ends.
- Marker pills are large, labeled buttons ("Stop 2: Office of the
  Commissioner"), not bare dots; ferry's "no plaque — website only" carried
  into its aria-label and the stop list.
- Progressive enhancement is genuinely done, not claimed.
- Focus visibility and menu keyboard behavior are exemplary for this stack.
