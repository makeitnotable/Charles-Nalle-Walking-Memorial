# Phase 6 — FINAL live-deploy QA gate

*Fresh-eyes review of the LIVE deploy at
`https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial` (GH Pages, base path
`/Charles-Nalle-Walking-Memorial`). Playwright scripts in `scratch/phase6-*.mjs`; evidence
(57 captures) in `docs/qa/phase6-qa/`. Reviewed 2026-08-02.*

## Verdict: **RED**

Two P1 defects are live. Everything else — full screenshot matrix, console/network,
deep-links, curtain, player, lens, menu, dialog, 404 — is clean, and all 8 spot-audited
ELEVATION-PLAN ☑ entries are real. Fix the two P1s, redeploy, and re-run
`scratch/phase6-marker-probe.mjs` + one screenshot of `/people`; nothing else needs
re-review.

## Defects

| # | Sev | Defect | Evidence |
|---|---|---|---|
| 1 | **P1** | **/people H1 is corrupted on live** — renders "ONE DAY. / A WHOLE CITY'SONE DAY. / A WHOLE CITY'S CAST.NBSP;CAST." (duplicated text + literal `NBSP;`) at 390/768/1440. Source bug, not a render race: `src/pages/people.astro:39` reads `One day.<br />A whole city'sOne day.<br />A whole city's cast.nbsp;cast.` — a botched edit of what was clearly `One day.<br />A whole city's&nbsp;cast.` | `people--390.png`, `people--768.png`, `people--1440.png` |
| 2 | **P1** | **Map marker → carousel active-card desync** — tapping ANY stop marker flies the camera to the right stop and sets `?stop=` correctly, but the carousel always fronts the **Chapter 2 (Office of the Commissioner)** card. One tap on the fronted card then navigates to `/commissioners-office` regardless of which stop the user chose. Reproduced 3/3 (Stop 3 @1440, Stop 5 @1440, Stop 3 @390 — `scratch/phase6-marker-probe.mjs`). Breaks the approved M4 two-tap contract on the centerpiece screen. Recovery exists (tap the correct card to focus, tap again — verified) and the deep-link/Continue arrival path syncs correctly, but a user who taps a marker and taps the big card lands in the wrong chapter. Suspect: keen-slider init/sync race in `src/components/TroyMap.tsx` — `initial: activeIdx` + the sync effect (~line 441) vs `slideChanged`/`animationEnded` overwriting `activeIdx` mid-move. | `map-marker3-carousel-1440.png` (camera on Gilbert Mansion, Chapter 2 card fronted); probe output in this review's session |
| 3 | P3 | Trailing-slash chapter URLs (`/mansion/` etc.) 404 on GH Pages (build format `file`). The custom 404 with "Start at the beginning / Open the map" serves, so it fails gracefully; all internal links use the canonical no-slash form. Watch QR codes / printed URLs: they must not carry a trailing slash. | curl: `/mansion` 200, `/mansion/` 404 |
| 4 | P4 | At 1440 map overview, the "Bakery" pill is partially occluded by the "Commissioner's Office" pill (readable, layered). | `map--1440.png` |

## Scope results

1. **Full live matrix** — `shots.mjs` 10 routes × 390/768/1440, exit 0, no capture
   failures. All 30 base captures viewed individually + long-page scroll shots. No layout
   breakage, no missing images/posters, no base-path 404s anywhere. Only visual defect
   found: #1 above.
2. **Console + network, every route @390** — `scratch/phase6-console-network.mjs`:
   **0 JS/console errors, 0 HTTP ≥400** across all 10 routes (full-page scroll included to
   hydrate lazy islands). The five `net::ERR_ABORTED` on chapter `audio/*.mp3` are the
   browser cancelling metadata prefetch — all six files verified serving (HTTP 206),
   and narration playback is proven in the C3 audit. favicon/media/audio all resolve under
   the base path.
3. **Deep-link** — `/map?stop=ferry` @390: arrival plate "Stop 4 of 5 / WASHINGTON STREET
   FERRY LANDING" over the flight, lands zoomed on the Ferry Landing pin, carousel present
   with the Chapter 4 card active, `?stop=ferry` retained, 0 JS errors. **PASS**
   (`deeplink-ferry-arrival-390.png`, `deeplink-ferry-settled-390.png`).
4. **Interactions on live** — 8/9 passed (`scratch/phase6-interactions.mjs`):
   menu → Mansion ✓, menu → The Walk ✓, Continue-the-walk `/mansion→/ferry` ✓ with curtain
   over-title "Ferry Landing / April 27, 1860" ✓, marker → carousel appears (5 cards) ✓,
   **active-card → chapter ✗ (defect #2)**, paintings dialog open/close ✓ with animated
   `reveal-horizontal.mp4` playing ✓, 404 page at `/nonexistent` = status 404, house
   language, both CTAs ✓ (`404-live-1440.png`).
5. **ELEVATION-PLAN ☑ spot-audit** — table below; **8/8 real, no falsely-checked entries.**
6. **Phase 5 numbers** — `docs/qa/phase5/RESULTS.md` exists with filled tables (perf/a11y/
   LCP/CLS/TBT/transfer per route, before→after, residuals, content-freeze verification).

## ☑ spot-audit (live)

| Entry | Claim | Live? | Evidence |
|---|---|---|---|
| H1 | Splash film plays inside the approved home frame | ✔ | `splash.mp4` playing (readyState 4) inside the bordered frame; `home--*.png` |
| C3 | Synced narration player: card player + transcript wash + tap-to-seek + scrub | ✔ | `/mansion`: plays (3.2s), `narration-active` wash follows, tap last paragraph seeks 3.2s→126.0s, slim scrub present; "Tap any paragraph" affordance visible (`audit-c3-player-1440.png`) |
| C10 | Full-bleed painting interlude between narrative and historical, credit chip | ✔ | `.painting-interlude` with "MARK PRIEST · NALLE SERIES" chip (`audit-c10-interlude-1440.png`) |
| C13 | Curtain date over-title on chapter navigations | ✔ | Curtain read "Ferry Landing / April 27, 1860" during Continue-the-walk (MutationObserver capture) |
| M5 | Route draws itself, dotted primary line | ✔ | Dotted route visible stop-to-stop at overview and at deep-link arrival (`audit-m5-route-1440.png`, `deeplink-ferry-settled-390.png`) |
| M7 | 1860 lens: Mark Priest map crossfade in approved chrome | ✔ | `troy-1860-1440.webp` at opacity 1, framed, label "Troy, New York · 1860 — painted by Mark Priest", toggles to "Back to today" (`audit-m7-lens-1440.png`) |
| G2 | Animated painting loops in gallery/dialog | ✔ | Dialog plays `bakery/reveal-horizontal.mp4` unpaused (`paintings-dialog-1440.png`) |
| S3 | 72×72 corner-notched menu, full panel IA | ✔ | Burger measures exactly 72×72; panel lists Home / 1–5 / The Walk / The People / The Paintings / About (`audit-s3-menu-1440.png`) |

## GREEN bar check

- Zero P0/P1 on live — **FAIL** (defects #1, #2)
- No 404s (media/audio/favicon/base-path) — PASS
- Deep links work — PASS
- Spot-audited blueprint entries all real — PASS (8/8)

RED is on the narrowest possible grounds: one one-line content-markup fix
(`people.astro:39`) and one carousel state-sync fix (`TroyMap.tsx`). Both are
re-verifiable in minutes with the scripts left in `scratch/`.
