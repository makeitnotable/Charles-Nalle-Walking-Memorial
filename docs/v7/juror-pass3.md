# v7 juror pass 3 — fresh-eyed visitor report

Build under review: **live GH Pages, remote `v2` head `3396185`** (verified with `git ls-remote` before the pass; `last-modified` 2026-08-16 08:57 UTC).
Method: Playwright Chromium (`--use-gl=angle --autoplay-policy=no-user-gesture-required`), one browser at a time, phone contexts with `isMobile + hasTouch` and CDP `Input.dispatchTouchEvent` for real touch drags/taps; screenshots looked at, not just DOM. Scripts: `scripts/juror3-*.mjs`. Evidence: `docs/v7/qa/juror-pass3/` (PNG, gitignored; frame dumps under `frames-*/`).
Viewports: phone 390×844 · 360×800 (+ 844×390 landscape) · tablet 768×1024 · 1024×768 · desktop 1440×900 · 1920×1080 · 200 % zoom 720×450 · reduced-motion contexts.
No source was read before scoring. Instrument rows in Sheet B come from `docs/v7/qa/final/*.md` as handed over.

---

## Sheet A — Awwwards axes (0–10)

| axis | phone (390 / 360) | tablet (768 / 1024) | desktop (1440 / 1920) |
|---|---|---|---|
| Design | **9** | **9** | **9** |
| Usability | **8** | **9** | **9** |
| Creativity | **10** | **10** | **10** |
| Content | **9** | **9** | **9** |

**Phone.** Arrival is cinematic — the bakery hero with Charles's face clear of the ☰, the wordmark and date under a whole head on `/`, drop caps, the walk cards with neighbours peeking, the peek-sheet museum. Usability loses a point for the mini-player pill vanishing for the whole Onward + footer stretch while the narration keeps playing (P2), a slightly sticky card swipe threshold, and a few dangling separators (P3).
**Tablet.** Everything the phone does with more room: 2-col People grid inside the stacked editorial reads well; walk mode identical to desktop; museum peek-sheet on 768 and the column composition on 1024 both centre the painting to the pixel. No collisions, no console errors.
**Desktop.** The museum approach triptych (card / painting / study), the pitched 3-D map at pitch 52, the quiet three-column footer. Small craft nits only: card eyebrow wraps "NALLE / SERIES", the last work's title breaks onto a line that begins with "·", the mini-player sits over the first 120 px of the reading column at 1440, footer second rule is 56 px wider than the content column.

---

## Defects

### P0 — none.
### P1 — none.

### P2
1. **C2 colour not as specified — moral/theme body still renders `#fed9cc`, not the heading's neutral-12.** Route: every chapter `#moral` / `#moral-0/1` · all viewports. Evidence: `docs/v7/qa/juror-pass3/barbershop-p360-07-moral-heading.png`, `commissioners-office-d1440-07-moral-heading.png`; sampled glyph pixels: heading `rgb(246,243,238)`, body `rgb(254,217,204)`; computed style of `[id^=moral] p.t-prose` (which carries the class `text-neutral-12`) = `rgb(254, 217, 204)` at 360/390/1440. Contrast passes (instrument), parallax works and is off under reduced-motion — but Wil asked for "white like the heading" and the body is visibly the old peach. Repro: open `/barbershop`, scroll to `(03) THE MORAL`, compare heading vs body colour; `getComputedStyle(document.querySelector('#moral p.t-prose')).color`.
2. **Phone: the collapsed mini-player pill hides for the whole Onward + footer stretch while audio keeps playing — no pause control on screen.** Route: any chapter · 390 / 360 (768+ keep the pill). Evidence: `docs/v7/qa/juror-pass3/mansion-p390-onward-pill.png`, `bakery-p390-09-footer.png` (audio at 00:12, playing, pill opacity 0), sample table in the `juror3-pill768.mjs` run: pill `op=1` until `#onward` top ≈ 80 px, then `op=0` through the footer (footer top 502, CTAs long gone at y 262) with `audio.paused=false`. It steps aside for the centred CTAs (fair) but never returns in the reserved footer lane (C10). Repro: `/mansion` at 390 → Play → scroll to Where to next and on to the footer → nothing to tap to pause.

### P3
1. **844×390 (landscape phone) home:** the head is behind the wordmark, not above the eyebrow (physically no room; H1 lists this viewport). `home-land.png`.
2. **844×390 map overview** shows only stops 1 and 3 in frame (2, 4, 5 outside; walk.md itself reports 4 labels outside the safe box at "land"). `map-land-01-overview.png`.
3. **Curtain label blink (map → chapter, 4× CPU, 390):** one screencast frame at +856 ms shows the covered curtain without the "APRIL 27, 1860 / BAKERY" lockup, then it is back. No uncovered page-B frame anywhere in four cases. `frames-map-card-p390-montage.png`, `frames-map-card-p390/f236-856.jpg`.
4. **Lens caption on phone** breaks as `TROY, NEW YORK · 1858 ·` / `LIBRARY OF CONGRESS` — a trailing separator ends line 1. `map-p390-10-lens.png`.
5. **Museum card eyebrow** wraps `MARK PRIEST · NALLE` / `SERIES · SPOT 02` (breaks inside "Nalle Series") at 1440/1024/land; the last work's title breaks to `PETER BALTIMORE'S / BARBERSHOP / · NARRATIVE II` at 1440 (line begins with "·"). `museum-d1440-06-approach.png`, `museum-d1440-12-last-approach.png`.
6. **Map hint chip** ("Drag to explore · tap a stop") overlaps stop 4's marker at 390 and the Ferry Landing leader at 1440 for the few seconds it lives (gone by 15 s). `map-p390-01-overview.png`, `map-d1440-01-overview.png`.
7. **Card swipe threshold:** a 180 px / 400 ms swipe on a 351 px card pitch (390) settles back to the same card (nearest snap, below the flick velocity); 200 px / 250 ms advances. Feels slightly sticky, no snap-back or yank. `juror3-mapdrag.mjs` log.
8. **Desktop mini-player** (bottom-left, 198×62) sits over the first ~120 px of the prose column at 1440 while it is latched. `commissioners-office-d1440-04-player0-mini.png`.
9. **Footer second rule** spans 320–1600 at 1920 while the content column is 376–1544 (56 px wider each side). `about-d1920-footer.png`.
10. Museum: the last (portrait) work shows no study to its right at 1024/1440 (every other approach does). `museum-d1440-12-last-approach.png`.
11. **200 % zoom (720×450) `/paintings`:** the `Skip the hall` pill still sits over the first word of the rail chip ("SC…ROLL TO WALK"); at 844×390 the chip now clears it. `crop-zoom200-paintings-top.png`, `crop-museum-land-top.png`.
12. **1440 chapter footer with the pill latched:** the pill's top edge grazes the descenders of the disclaimer's second line ("discretion, and risk.") — touching, not covering. `crop-co-d1440-footer.png`.

---

## Sheet B — Wil's ledger, verified as a visitor

Legend: Met · Not met · N/A (internal / not observable). One line each. Phone = 390+360 (+844×390 where noted), tablet = 768+1024, desktop = 1440+1920.

| item | phone | tablet | desktop | note |
|---|---|---|---|---|
| G1 rag/orphans | Met | Met | Met | instrument 0 runts / 0 display runts; visually clean; three dangling-separator breaks listed as P3 (4, 5) |
| G2 clipped letterforms | Met | Met | Met | 0 ink clips; barbershop `FOR JUSTICE` J descender whole at 360/1440 |
| G3 contrast | Met | Met | Met | contrast.md 0 failures incl. pixel mode; nothing read as thin |
| G4 tablet parity | — | Met | — | 768/1024 walked on every route; People 2-col inside stacked editorial reads well |
| G5 em dashes | Met | Met | Met | none visible on any route (only inside the 404 page's inline script comment) |
| G6 floating-UI grid | Met | Met | Met | states.md 0/127 collisions; observed Back/Stop/☰/attribution/pill on the inset grid |
| G7 motion tokens / RM parity | Met | Met | Met | reduced-motion: home all visible, chapter reveals visible + audio plays, map walk works, museum → 2-D grid (no canvas); tokens not observable |
| H1 head visible above eyebrow | Met (P3 at 844×390) | Met | Met | 390/360/768/1024/1440/1920 whole head + headroom above `Troy, New York…` |
| H2 description lines | Met | Met | Met | 5 lines @390, 6 balanced @360, 4 @768/1024, exactly 3 @1440/1920 |
| H3 `Walk the story` | Met | Met | Met | |
| H4 CTA bottom-aligned on phone | Met | N/A | N/A | full-width pill 48 px tall, 26 px above the frame at 390/360; landscape keeps in-flow |
| H5 description contrast | Met | Met | Met | pixel contrast passes; reads crisp on the film |
| H6 entry choreography | Met | Met | Met | CTA present and legible at 1.6 s; reduced-motion shows everything at once |
| X1 curtain jitter | Met | Met | Met | 4× CPU screencasts: map-card 390, Continue 390 + 1440, menu link 1440 — no uncovered page-B frame; frames.md CLEAN ×6; one-frame label blink noted (P3-3) |
| M1 geolocate removed | Met | Met | Met | no locate control at any viewport |
| M2 pitch / all five visible | Met (P3 at 844×390) | Met | Met | pitch 52 at 390/768/1024/1440/1920, 48 at 360; all five markers inside the viewport at every portrait/desktop size |
| M3 Stop top-right | Met | Met | Met | `Stop the walk` @200,20 (390) / 558,40 (768) / 1214,56 (1440); mirrors Back top-left |
| M4 drag pauses · Continue · Walk again | Met | Met | Met | drag → button `Continue` (aria "Continue the walk") immediately; Continue resumes from the current card (02→03→04); Stop → Continue; after stop 5 `Walk again` restarts at 01 |
| M5 drag smoothing | Met | Met | Met | ±1 card, expo settle, no snap-back reversal after settle; sub-threshold swipe returns to origin (P3-7) |
| M6 card titles two lines | Met | Met | Met | `Holeur's / Fashionable Bakery`, `Commissioner's / Office`, never crossing the arrow |
| M7 Back to map inset | Met | Met | Met | @20,20 / 40,40 / 56,56 |
| M8 mobile overview row | Met | N/A | N/A | (i) left, `Take the walk` centred, ☰ bottom-right on one axis; `See Troy in 1858` top-right pill; date chip top-left |
| M9 mobile walk cards | Met | N/A | N/A | opaque, ≥16 px peeks both sides, `Back` label, ☰ hidden while focused, strip clear of the attribution |
| M10 chip `April 27, 1860` | Met | Met | Met | |
| M11 card spacing | Met | N/A | N/A | balanced 12 px gaps |
| M12 curtain interplay | Met | Met | Met | map-card transition frames clean; no map motion visible under the cover |
| M13 map copy block | Met | Met | Met | `FIVE SPOTS / THROUGH TROY`, index titles on authored lines, `Spot 01…05` |
| L1 lens reframe | Met | Met | Met | opens on the lower panel (West Troy · Hudson · Troy); reset returns to it; full plate pannable |
| L2 bigger viewer | Met | Met | Met | near full-bleed within the inset at 390/768/1440 |
| L3 lens copy/controls | Met (P3-4) | Met | Met | only `Back to today` centred, date chip hidden, `Take the walk` gone; caption 1 line ≥768 |
| L4 interaction | Met | Met | Met | `+ − 0` keys work; zoom controls top-right of the viewer |
| C1 drop cap | Met | Met | Met | `initial-letter: 3`, Caslon Display, 3 lines at desktop / 3 at phone; highlight + tap-to-seek unaffected |
| C2 moral contrast + parallax + colour | **Not met (colour)** | **Not met (colour)** | **Not met (colour)** | contrast Met, parallax Met (translateY tracks scroll, `none` under RM); body still `#fed9cc` — P2-1 |
| C3 study centred | Met | Met | Met | `align-items: center` ≥ md; sketch and caption share a centre line |
| C4 interlude credit | Met | Met | Met | credit on a dark chip; wipe reveal fires; no parallax on the photo |
| C5 Where-to-next declutter | Met (P2-2) | Met | Met | embed shadow, quiet dark pill with orange numeral, CTAs centred under the map, mini collapses to a pill; `Continue` is the single primary |
| C6 rhythm | Met | Met | Met | census: identical ladder on the four single-part chapters; CO variant consistent; heading→quote gap reads as a companion |
| C7 ☰ scroll-hide + hero focus | Met | Met | Met | hides after ~720 px down, back after ~90 px up on every scrolling route; bakery face clear of the ☰ |
| C8 barbershop | Met | Met | Met | faces in the hero at 360/390; body T→I→T→I→T; chip credit; J whole; study centred |
| C9 chapter 2 order | Met | Met | Met | hero → scene-0 → interlude → history → moral-0 → hero-2 → scene-1 → moral-1 → onward; spine Listen·Pt 1 / History / The moral·Pt 1 / Listen·Pt 2 / The moral·Pt 2 / Onward; both players play, tap-to-seek on both, one mini at a time |
| C10 footer lane | Met (lane reserved; pill hidden — P2-2) | Met | Met | pill visible in the footer lane at 768/1024/1440/1920/844×390 |
| C11 chapter UI dashes | Met | Met | Met | `Next · Spot 02`, `5 State Street · Mutual Bank Building`, attribution stands alone |
| C12 latent | Met | Met | Met | no `Uri Gilbert Mansion` in UI (only in Kathy's history prose) |
| F1 footer | Met | Met | Met | wordmark one line, `Made by Notable`, arrow list, Share on chapters, disclaimer 2 lines ending `and risk.` at 390/768/1440/1920 (3 lines at 360, no runt); P3-9 |
| N1 X spins on close | Met | Met | Met | rotation caught mid-click (`matrix(0.97,0.23,…)`); focus returns to the burger |
| N2 scroll-hide everywhere | Met | Met | Met | verified on chapters, /map (page scroll), /paintings, /people, /about; never while open |
| N3 arrow tail | Met | Met | Met | unchanged |
| P1 spot links removed | Met | Met | Met | 0 `Spot NN` links under people |
| P2 closer copy | Met | Met | Met | `Their story lives on` · `Stand where they stood` · `Walk the story` |
| P3 dashes | Met | Met | Met | none visible |
| P4 H1 rag | Met | Met | Met | `ONE DAY. A WHOLE / CITY'S CAST.` at 1440; three lines below |
| P5 grid | — | Met | Met | 2-col at 768 reads well; header two-column at lg |
| A1 quote → numbered (06), Onward (07) | Met | Met | Met | |
| A2 closer copy | Met | Met | Met | `Two and a half miles. One day in 1860.` + computed body + `Walk the story` |
| A3 dashes | Met | Met | Met | |
| A4 latent | N/A | N/A | N/A | internal |
| U1 rail pitch | Met | Met | Met | pitch −0.10 (−0.08 portrait); floor visible |
| U2 paintings closer / end visible | Met | Met | Met | spacing 5, far 80, end glow visible from the entrance |
| U3 finish | Met | Met | Met | moulded frames, plank floor, baseboard/cornice, coffered ceiling; art stays the subject; museum.md 74–76 calls, 0 long frames |
| U4 360° look | Met | Met | Met | drag yawed −3.13 rad; `Face forward` appears and recentres; page scroll untouched |
| U5 movement feel | Met | Met | Met | native scroll; ←/→ look in rail, Enter approach, ←/→ prev/next in approach, Esc back; counter + dots in approach |
| U6 inspect desktop | — | Met (1024) | Met | painting centre 50.0/50.1 %, aspect 1.777; card left no border; study right; only `Back to the hall`; click toggles the animation; invisible focusable button reachable by Shift+Tab (Enter → alive) |
| U7 inspect phone | Met | Met (768) | — | peek-sheet tap + drag up/down, painting recomposes higher when full; `Back to the hall` top-left; landscape = column, quote hidden |
| U8 true aspects | Met | Met | Met | portrait work 0.666–0.667 in approach at 390/768/1024/1440, grid tile 0.667, dialog plays the portrait video |
| U9 end of hall | Met | Met | Met | doorway + glow at the end (stretch item) |
| U10 hygiene | Met | Met | Met | Skip top-left, chip `The Museum · scroll to walk · drag to look · tap a painting` / `Scroll to walk`, ↓ icon, top-right lane empty for the ☰; 0 console errors |
| I1 CN monogram | Met | Met | Met | interlocked Caslon C+N, paths only; reads as CN at 16 (thin) and 32 |
| I2 icon set | Met | Met | Met | svg / 16 / 32 / 48-in-ICO (real 3-size ICO) / 180 / 192 / 512 / manifest (relative `start_url`) all 200 |
| I3 head wiring | Met | Met | Met | svg + png + ico + apple-touch + manifest links under the base path |
| I4 og.png | Met | Met | Met | 1200×630 served |
| G-L1 title dashes | Met | Met | Met | `X · Charles Nalle Walking Memorial` everywhere |
| G-L2 docs drift | N/A | N/A | N/A | |
| G-L3 trailing slash | Met | Met | Met | `/bakery/` (HTTP 404) lands on `/bakery` |
| G-L4 sr-only dash | N/A | N/A | N/A | not visible |
| G-L5 unrendered fields | N/A | N/A | N/A | content decision |

### Instrument bars (from `docs/v7/qa/final/`)

| bar | result |
|---|---|
| axe serious/critical | 0 / 0 across 51 runs (+4 on /paintings); 0 moderate/minor — **met** |
| contrast incl. pixel mode | 0 failures (18 unmeasured /people @768 rows are "never in view", not failures) — **met** |
| rag: runts / ink clips / em dashes | 0 / 0 / 0 over 502 blocks — **met** |
| states collisions | 0 / 127 (one `FAILURE@land` capture is a closed-browser error, not a collision) — **met** |
| census rhythm ladder | bakery/mansion/ferry/barbershop identical `-3,-900,1028,0,0,128,200,200`; CO extends it consistently — **met** |
| frames | 6/6 CLEAN at 390 + 1440, 4× CPU — **met** (my own 4 captures agree) |
| perf (production) | home 97 · chapters 98–99 · /people 99 · /about 99 · /paintings 89–90 · /map 64 (bar 63) — **met** |
| a11y | 100 on every route — **met** |
| keyboard walk | complete: 2/21/16/37 stops all with visible rings, menu + dialog focus return — **met**; my own: museum Tab/Enter/Esc/arrows + Shift+Tab to the painting button |
| reduced-motion parity | all text visible, 0 errors; my own: home / ferry / map walk / museum → grid — **met** |
| live URL verified | remote `v2` = `3396185`, GH Pages last-modified 08:57 UTC, all icon URLs 200 — **met** |
| console errors | 0 on every route at 390 and 1440 (media range `ERR_ABORTED` on mp3 and the expected 404 on `/nope` excluded) |

---

## The one moment I would retell

Standing in the dark hall on a phone, dragging a full turn to look back at the entrance, then tapping the Commissioner's Office canvas — the crowd starts to move inside the frame while the plaque sits folded at the bottom of the screen waiting to be pulled up. The Museum is still it.

---

## Cross-check of the previous jurors' P1/P2 items on this build (read after scoring)

**Juror 1** (`docs/v7/juror-pass1.md`)
- P1-1 portrait work stretched 3:2 → **fixed**: approach rect aspect 0.666–0.667 at 390/768/1024/1440, grid tile 0.667, dialog plays the 800×1200 video (`museum-*-12-last-approach.png`, `museum-p390-20-grid-last.png`).
- P1-2 phone peek-sheet dead to touch → **fixed**: CDP touch tap and touch drag toggle peek↔full at 390 and 768; painting recomposes (`museum-p390-08/09/10-sheet-*.png`).
- P2-1 sheet-full misplaces the dot rail → **fixed**: dots ride 37 px above the measured sheet in both states.
- P2-2 `Skip the hall` over the rail chip at 844×390 / 720×450 → **fixed at 844×390**, **still present at 720×450** (my P3-11).
- P2-3 pill covers the footer disclaimer → **fixed on tablet/desktop** (pill in the reserved lane; a 4 px graze at 1440, my P3-12); on phones the pill is now hidden through the footer instead (my P2-2).
- P2-4 attribution (i) under the active card at 390 → **fixed**: card bottom 744, (i) at 773.
- P2-5 head clipped / no headroom at 1920/1024/1440 → **fixed**: `object-position 50% 39–42 %`, whole head with headroom (`home-d1440.png`, `home-d1920.png`, `home-t1024.png`).

**Juror 2** (`docs/v7/juror-pass2.md`)
- P1-1 phone spot-index titles clipped → **fixed**: authored lines, arrows clear (`map-p390-02-index-top.png`, `map-p390-03-index-mid.png`).
- P1-2 844×390 walk mode marker over the card → **fixed**: active dot 14 px above the strip, label above it (`map-land-05-walk.png`).
- P2-1 1024×768 label pill over the card strip (and resting non-active labels at 1440) → **fixed**: labels clear at 1024 and 1440 at every sampled stop (`map-t1024-05-walk.png`, `map-d1440-05-walk-stop2.png`).
- P2-2 lens caption / CO chip break inside "Library of Congress" → **fixed as asked** (institution kept whole); the separator now dangles at the end of line 1 (my P3-4).
- P2-3 phone pill over the centred Onward CTAs → **fixed** by stepping aside — over-corrected: the pill never returns in the footer lane while audio plays (my P2-2).

## VERDICT: **FAIL** — Sheet A clears the bar at every class (all axes ≥ 8), zero P0/P1, every instrument bar met, but Sheet B carries one **Not met** (C2: the moral body colour is still `#fed9cc`, not the heading's white) plus one P2 usability gap on phones (mini-player pill hidden through the footer while audio plays). Both are P2 fixes; per the protocol they do not restart the two-pass count.
