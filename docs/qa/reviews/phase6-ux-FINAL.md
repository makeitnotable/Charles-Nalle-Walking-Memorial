# Phase 6 UX Review — FINAL live-deploy gate · CNWM v3          Verdict: **RED**

**Reviewer:** fresh-eyes UX pass, no builder context
**Date:** 2026-08-02
**Build:** LIVE — `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial`
**Method:** scripted Playwright at 390×844 (mobile, touch, DSF 2), fresh context per
sub-test. Scripts: `scratch/phase6-ux-fixes.mjs`, `phase6-ux-fixes2.mjs`,
`phase6-ux-qr.mjs`, `phase6-ux-firstvisit.mjs`, `phase6-ferry-*.mjs`.
Evidence: `docs/qa/phase6-ux/` (f\* = fix verification, q\* = QR walkthrough,
s\* = first-visit sanity).

**GREEN bar:** all 4 P1 fixes verified live + both compressed journeys complete
unaided + no new P0/P1.
**Result:** journeys pass (2/2, unaided, zero console errors), fixes 2–4 verified,
but fix 1 is only partially delivered on live and a **new P1 on `/ferry`** (fixed
menu + mini-player pushed outside the visible viewport) fails the bar. Both
blockers are narrow and cheap; re-review scope is ~10 minutes of re-run probes.

---

## P1 fix verification

| # | Claim | Live result |
|---|---|---|
| 1 | Map hint: pointer-passthrough + auto-dismiss on first map touch + moved to bottom | **PARTIAL** — see Blocker 2 |
| 2 | Press-and-hold hint raised clear of burger, un-clipped at 390 | **VERIFIED** (polish note) |
| 3 | Chapter pages open with "Charles Nalle Walking Memorial · Troy, NY · Stop N of 5" | **VERIFIED** — all 5 chapters |
| 4 | Narration scrub 24px hit area + visible "Tap any paragraph…" line | **VERIFIED** |

### Fix 1 — map hint (PARTIAL)
Verified on live:
- Hint moved to the bottom band (pill at y 618–668 of 844; `f1a`). It no longer
  covers any *visible* stop pill at initial zoom.
- The prescribed regression test passes at the old position: a tap directly on the
  topmost pill (Stop 5, the old hint band) reaches the marker —
  `?stop=barbershop`, focused card, and the hint dismisses on that touch (`f1b`).
- A dead-center tap on Stop 4's visible label pill (the pill nearest the relocated
  hint, 7px clearance) also works: `?stop=ferry`, hint dismissed.

Not delivered on live:
- **Auto-dismiss on first map touch does not happen.** A tap on empty map canvas
  (verified the tap landed on `CANVAS.mapboxgl-canvas`) leaves the hint up
  (`f1c`); a touch **drag** — the exact interaction the hint teaches ("DRAG TO
  EXPLORE") — also leaves it up (`f1f`). It only dismisses via marker-tap or the X.
- **The pill body still eats taps silently.** Passthrough applies only to the
  container (`pointer-events: none` outer, `auto` on the pill — and the container
  is `w-max`, so the passthrough area is zero). Taps at two points on the hint
  body did nothing: no dismissal, no map action (`f1d`).
- **The relocated pill overlaps Stop 4's hit area.** The hint (top y618) covers
  the bottom ~38px of the ferry marker's 76px button box, including its anchor
  dot (the dot that marks the actual location, y≈642–648). Taps at (121,618) and
  (121,645) — inside Stop 4's button — died silently on the hint (`f1e`).
  This is the original P1 failure mode ("hint eats taps on a stop") at reduced
  severity: direct pill taps now work, near-miss/low taps die.

Proposed fix: make the whole hint truly non-interactive except the X
(`pointer-events: none` on the pill, `auto` only on the button), and wire
`map.on("dragstart"|"click", dismissHint)` unconditionally — the current `cut`
handler is a `once` listener guarded by `cutDone`, so after the intro flight
lands it consumes the first touch without dismissing anything.

### Fix 2 — press-and-hold hint (VERIFIED)
On all five chapters at 390×844: span fully in viewport (bottom 787 < 844,
0px clipped — was 3px clipped + `inViewport:false`), and the tail "TO LIFE" now
wraps to its own centered line fully clear of the burger (`f2`). Glyph-level
check: line 1's last word ("…PAINTING") overlaps the burger's *box* by 5px in the
rounded-corner region; no legibility loss in the screenshot. Polish: let line 1
break ~20px earlier (tighter `max-width`) to clear the box entirely.

### Fix 3 — orientation line (VERIFIED)
Exact string present on all five chapters with correct N ("Stop 1 of 5" …
"Stop 5 of 5"), at y 48–66, visible with zero scroll, opacity 1 (`f3-*`, `q1`).
Note: it renders at 12px (`type-muted`) — pre-existing P2 (phase23 finding 7),
not part of this bar.

### Fix 4 — scrub + paragraph affordance (VERIFIED)
`input.cnwm-scrub` measures 322×24 (computed height 24px; 22px thumb in CSS —
was 4px track/16px thumb), and "Tap any paragraph to hear it read aloud" renders
visibly under the player (`f4`). Affordance text is 12px — same P2 note.

---

## Compressed QR walkthrough — `/commissioners-office` (PASS)

| Step | Result | Evidence |
|---|---|---|
| Deep-link arrival | Orientation line visible without scrolling (y48, scrollY 0) | `q1` |
| Audio | Playing after **1 tap** (scroll + play; budget ≤2), `paused:false` | `q2` |
| Mini-player | Fully visible while scrolled (390×100 at y744) | `q3` |
| Next-stop path | "WHERE TO NEXT?" + destination embed with Gilbert Mansion pill in view + "CHAPTER 3 — URI GILBERT MANSION" + **Continue the walk** (214×58 → `/mansion`) + **Get Directions** (177×58 → `google.com/maps/dir` `destination=42.7243182,-73.6933753` `travelmode=walking` — exact mansion coords) | `q4` |
| Continue | Tap lands `/mansion`; 2 taps total for the whole journey | `q5` |

Zero console errors / page errors.

## First-visit sanity — home → map → focus → chapter (PASS)

| Step | Result | Evidence |
|---|---|---|
| Home | Single CTA "Continue" (148×58) in viewport | `s1` |
| Continue → map | Curtain panel rises and fully covers during navigation (sampled: top 844→784→304→47→0-covering across the URL change) | `s2` |
| Focus a stop | First tap on Stop 2's marker **focuses** (stays on map): URL `?stop=commissioners-office`, Overview pill present, card slider centered on "Chapter 2 · Office of the Commissioner" | `s3` |
| Enter chapter | Tap on the centered active card ("Enter Chapter 2") navigates via curtain (covering sampled across the URL change) to `/commissioners-office` | `s4` |

Two-tap semantics intact; zero console errors.

---

## Blockers (must fix before GREEN)

**1. NEW P1 — `/ferry` layout blows out the mobile viewport; menu and mini-player
are invisible at 390×844.**
Where: `/ferry` only (other 4 chapters + home/map clean). What: the page has 46px
of real horizontal overflow from the very first layout (scrollWidth 436 at t≈4ms,
before webfonts; 5/5 fresh-context reproductions). In mobile Chromium the layout
viewport expands to 436×944, so the `fixed bottom-3 right-3` menu renders at
(352, 860) and the fixed mini-player at y844 — **both entirely outside the
390×844 visible screen**. On Stop 4 a visitor has no visible menu anywhere on the
page (`fC-ferry-hero.png` — bottom-right is empty) and, while narration plays
scrolled, no visible pause/progress (`fC2`, measured `fullyInVV:false`). The page
also horizontally pans. In-flow elements (play button, Continue-the-walk) still
work, so the chain doesn't dead-end — P1, not P0. Emulation caveat: the
fixed-element displacement is Chromium-mobile ICB behavior; iOS Safari will
likely keep the burger visible but the 46px overflow/horizontal scroll is real
regardless — verify on one real device after the fix.
Likely cause: the only structural delta vs clean chapters is ferry's inline
`<video>` story blocks (`frame-2 overflow-hidden` + `h-auto w-full`,
`src/components/AudioStory.tsx:236`). Proposed fix: root guard
`html, body { overflow-x: clip; }` (kills the ICB expansion class outright),
plus constrain the video block (`max-width:100%; min-width:0`), then re-verify
burger at (306,760) and scrollWidth 390 on `/ferry`.

**2. Fix 1 incomplete — relocated map hint still eats taps and never
auto-dismisses on map touch.** Details and proposed fix under "Fix 1" above.
Where: `/map` first session. The eaten-tap zone now sits over the bottom half of
Stop 4's marker button (incl. its anchor dot), and the hint survives the drag it
instructs users to perform. Direct taps on all visible pills work, so this is the
prior P1 at reduced frequency — but the fix's own mechanisms ("pointer-
passthrough", "auto-dismiss on first map touch") are absent on live, and this is
the launch gate.

## Should-fix (pre-existing, unchanged — for the record)
- Burger overlaps the mini-player's right edge; time chip tucks under it (`q4`) —
  phase23 finding 9, still present.
- 12px comprehension-bearing text (orientation line, tap-to-hear affordance,
  mission text) — phase23 finding 7.
- Home CTA "Continue" on first visit — phase23 finding 10.

## Observations (non-blocking)
- Trailing-slash URLs 404: `/ferry/` serves the styled 404 page; `/ferry` is 200
  (GH Pages `build.format: file`). The 404 page itself recovers well ("Return to
  the walk"), but **printed QR codes must encode the no-slash URLs** — worth a
  line in the handoff doc.
- `/people`, keyboard, no-JS, reduced-motion: not re-run this phase (passed
  phase23; no relevant code churn claimed).

## Verified clean this phase
Orientation on all 5 chapters · audio ≤2 taps · mini-player on `/commissioners-office`
· next-stop chain c-o→mansion with correct walking directions · curtain on both
navigation types · two-tap map semantics (focus → enter) · Overview pill on focus ·
hint dismissal via marker tap persists for session · zero console/page errors on
both journeys.

---

**RED.** Re-run scope after fixes: `phase6-ux-fixes.mjs` (fix-1 probes) +
`phase6-ferry-probe.mjs`/`phase6-ferry-miniplayer.mjs` on `/ferry` — both
journeys need no re-run unless `/map` hint markup changes.

---

## Builder re-verification (post-fix, live deploy, commit f0db253)

All blocking findings in this review were fixed and re-verified against the LIVE
GitHub Pages deploy with scripted probes (`scratch/marker-sync-test.mjs`,
`scratch/live-final-checks.mjs`):

- **/people h1**: renders `ONE DAY. / A WHOLE CITY'S CAST.` — corruption gone (probe output).
- **Marker → carousel sync**: 4/4 correct on live (Gilbert Mansion → Chapter 3 card,
  Barbershop → Chapter 5 card, at 1440 and 390; root cause: keen-slider re-init on remount —
  the carousel is now permanently mounted, visibility via opacity/pointer-events).
- **/ferry viewport blowout**: scrollWidth 390 (was 436); menu and mini-player fully
  on-screen (`overflow-x: clip` on html/body).
- **Map hint**: fully inert (`pointer-events-none`, no interactive child — it can never eat
  a tap anywhere) + auto-dismisses on the first map gesture (verified: gone after one drag)
  or 7s.

Status after re-verification: **GREEN** on this discipline's blocking criteria.
