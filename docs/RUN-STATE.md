# RUN-STATE — CNWM v8 "The Final Five Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-measure → commit → update this file as ONE atomic act. Push every ≤3
commits; verify live = HEAD after each push. Constitution: `docs/PLAN.md`
(v8). Item ledger: `docs/v8/AUDIT.md`. Previous run: `docs/PLAN-v7.md` +
`docs/RUN-STATE-v7.md`.*

## CURRENT PHASE
**v11 IN FLIGHT (Wil's 8/22 round — twelve numbered items).** Ten shipped;
items 7 (official painting titles) and 8a (the Part 1 study) are held on Wil's
decision, not on work — see `docs/v11/PAINTING-NAMES.md`. Guide:
`docs/v11/REVIEW-GUIDE.md`. Ledger: `docs/v11/SCOPE.md`.

**v10.2 SHIPPED (Wil's 8/21–8/22 round).** Three items: V10-12 the museum's
original walk restored with the arch kept · V10-13 the home lockup's air made
a shrinkable spacer · V10-14 the map's phone overview camera given a reachable
zoom floor. Guide: `docs/v10/REVIEW-GUIDE.md`. Scope ledger (every change ↔ a
verbatim quote): `docs/v10/SCOPE.md`.

**v9 — COMPLETE.** Three corrections to v8 plus eight new items. v8's closing
state below.

**v8 — RUN COMPLETE (P1–P7).** All 40 audit items shipped across 11 commits on
`v2` (mirrored to `claude/nalle-memorial-polish-kc4uvm`). Final gate:
rag 0/0/0 over 4,523 blocks × 99 passes · contrast 0 failures · a11y
0/0/0 over 51 runs · frames CLEAN 4/4 runnable · museum-check 77–79 draw
calls with no composition findings · census one ladder · audio-check
clean · Lighthouse a11y 100 everywhere. The four perf routes under their
v7 bars were proven ENVIRONMENTAL by building the pre-v8 commit and
measuring it on this machine minutes apart (home 94 vs 93 · commissioners
96 vs 96 · mansion 96 vs 96 · paintings 64 vs 64, TBT within 0.4%) — this
container has no GPU. Evidence: docs/qa/v8-final/ + docs/qa/museum-v8/. Environment note: this container blocks
cdn.playwright.dev — the pre-installed Chromium at /opt/pw-browsers is
shimmed as chromium-1234/chromium_headless_shell-1234 (symlinks to the
1194 builds); `npm run qa:setup` is NOT needed here. Dev server :4321 up
(self-daemonized).

## CURRENT ITEM
v11: ten of twelve implemented, measured and pushed. Open and Wil's: the two
painting titles that are not on the artist's series page (mansion and
barbershop horizontals), the Part 1 study (its drawing is the study for the
FERRY chapter's painting), and whether to re-frame all ten paintings from the
masters' 3:2 to replace the site's 16:9 crops.

**v10.2 (previous):** implemented, measured and pushed; docs/v10/REVIEW-GUIDE.md written.
Open and Wil's: the ten painting titles (his `masters/` filenames carry them —
"Holeur's Fashionable Bakery", "The Commissioner's Office pt1/pt2", "Uri
Gilbert's Mansion", "Washington Street Ferry Landing", "Peter Baltimore's
Barbershop" — but the site's media keys are still generic and I have NOT
assumed), the high-res splash source, and one decision: the "Take the walk"
pill covers the Mapbox wordmark (measured y 721.7 over 715.3–733.0; he did not
pick it when asked, so it is raised in the guide, not changed).

## v8 (previous run)
RUN COMPLETE. Every item in docs/v8/AUDIT.md is implemented, measured and
pushed; docs/v8/REVIEW-GUIDE.md carries the item-by-item report, the
instrument bars, the judgement calls and the human queue.

## NEXT ACTION
Nothing outstanding in this run. Waiting on Wil (REVIEW-GUIDE §3 and §5): the
Mapbox-attribution decision, the ten painting titles, the high-res splash, and
a look at the home page on his own phone — both screenshots he sent were
byte-identical re-sends of files uploaded BEFORE the fix deployed (md5
830ebe8a… / eb4b848b…), so neither shows it.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| v11 (Wil 8/22, twelve items) — V11-01 map card focus: keen's `slide.distance` is the LEFT EDGE as a fraction of the container, not distance-from-centre, so a centred card reported 0.321 at 1440 and never reached scale 1 (focused card was 3% larger than its neighbour, not 8%); now exactly 1.000 vs 0.920 everywhere · V11-02 onward row aligned to the map's edges from 768 (0.0px both sides) · V11-03 scene hook drops a leading `Part N` for scenes AFTER the first (render rule, JSON untouched); hero kicker t-title → t-display · V11-04 next-stop pin copies /map's selected marker (pill 10 → 9 so the chip is visible) · V11-05/06 People curtain and About title break · V11-08b chip centred on Skip's axis (4px → 0.0px at ≥1024) · V11-09 desktop map fit bottom 140 → 240: the safe box constrains PILLS but a pill hangs above its DOT on a leader line, so the ferry dot sat 10px off the CTA; now 60px · V11-10 interlude 52/68vh → 62/80vh, cream ground (no dark flash), 12% linear fade → eased 18% ramp, GSAP scrub 1.000 → 1.045 on the IMG inside overflow-hidden · V11-11 `.sec-head` sp-3 → sp-4/sp-5: rule→content 57 → 73/97/109 against 128/168/200 below (1:3.5 → ~1:1.75) · V11-12 `scripts/refresh-from-masters.mjs` refreshes only where the master's ASPECT matches the site's (upgrade, never re-crop): ferry/historical 1200×800 → 1440×960; 13 skipped because the delivery is 3:2/2:3 and the site serves 16:9/9:16 · V11-07/08a the PDF decoded and every work matched by PICTURE not name — 8 of 10 titles confirmed, 2 absent from the series page; studies: bakery correct, ch2 pt2 correct, ch2 pt1 is `Don't Let Them Have Him!`, the FERRY painting's study | cd9862f + 41b19d8 + 1db245c + 6754456 + 29de25c + 5732ab9 + (this commit) | rag 0 runts / 0 clips / 0 em dashes full matrix · contrast 0 failures 0 unmeasured · geometry probes: onward 0.0px both edges at 5 widths, chip/Skip 0.0px at 4 widths, cards 1.000/0.920 at 3 widths with a sampled cycle, interlude scrollWidth−innerWidth = 0 and `transform: none` under reduced motion, map framing 10 viewports all pills inside · tsc + build clean, 6 island-CSS guards |
| v10.2 (Wil 8/21–8/22) — V10-12 museum: ARCHITECTURE kept (arched end wall, archivolt, pilasters, keystone, landing, merged steps), MOTION reverted to the original straight walk (railZ linear again; railPose/SPIRAL_YAW/T_WALK/`descending` deleted; chrome ungated; slot back to 90N+100 at both sites) — arrival is a stop 5.3m short of the arch, the sticky release is the transition · V10-13 home: the top air stops being a share-of-viewport padding and becomes a SHRINKABLE FLEX SPACER (`--home-air` per tier, `::before { flex: 0 1 max(0px, air - gap) }`, siblings min-height:auto so the lockup never shrinks); bottom inset yields too; V10-11's `max(56px, min(30dvh, 75dvh-340px))` retired — measured against the dvh in his OWN screenshot (≈655, not the 664 assumed) that formula fit by 8px · V10-14 map: the phone overview search stopped at zoom 14.70 but a 390×673 phone only fits the walk at 14.60, so short phones fell off the search and took the blind OVERVIEW constant (15.25/33) — floor now 14.2 (the desktop branch's own value); the re-centring loop also set `ok` on every pass and the acceptance test never checked centring (both fixed; measured, neither changes an outcome today — they guard the floor) | 530f46e + e56d9e5 + ca0e785 + (this commit) | museum probe both orientations: z linear 0.40→−50.70 (endZ −56), y/yaw/pitch flat at 9 sampled railT, chrome visible at arrival, retrace exact, 0 page errors; museum-check calls 77/79/77/77/77 ≤80, no composition/chrome findings · home matrix 152 viewports: ≥375 wide (the project floor) 96 viewports 460–932 tall = ZERO overflow, min clearance 20.8px, his own 26.4px; 390×844 air 253.2px unchanged; 320-wide <500 tall still overflows ≤2.4px (desc wraps 7→9 lines — type change, his call) · map framing matrix 16 phone viewports under a stubbed style: 13 converged+centred (dx≈0, dy −0.2) vs 4 before; 390×673 15.25/33 fallback → 14.60/52 with all five stops in frame (the old fallback put THREE off-screen) · rag 0/0/0 · a11y 0/0/0 across 51 runs · tsc + build clean, 6 island-CSS guards |
| v9 (Wil 8/21) — CORRECTIONS to v8: V9-102 study out of the plaque card (it duplicated the wall study) + Part 2 finally hangs its own (wall study chosen per WORK, not per chapter; 6 works not 5) · V9-103 drawer close = real round 44×44 button centred above the content (17/18px air), not a corner ghost · V9-104 the hall ENDS ON THE LAST PAINTING — v8 walked 7m past it to a blank wall then down steps ("a weird white wall with a bunch of dots… stuck scrolling"): descent deleted, arch kept as far-end architecture/light source, tail is a bloom+dissolve whose outer edge is the page ground so the grid scrolls up seamlessly; slot back to 90N+100. NEW: V9-101 pitch −0.19/−0.155 · V9-201 where-to-next (pin = canonical, line beneath = "Chapter N", LOCATION NN marker dropped) · V9-202 cream fade both edges on all 5 historical-context plates (the "pale band on a dark painting" risk I flagged does NOT occur — every plate is a light archival photo) · V9-203 study caption side air · V9-204 hook rows left-aligned in a centred block · V9-205 full 1858 credit one line ≥390 (needed 370px, chip gave 351: tracking .055em + 8px padding + shallower inset; 375/360 wrap, allowed) · V9-206 phone lens opens further left · V9-301 viewport-fit=cover + grounded html/map-shell (the black bars) · V9-302 curtain honours authored breaks → "The / Paintings" · V9-303 menu double-divider REPRODUCED and fixed (close button scrolled away, its border-b resting under the panel border; now sticky) · V9-401 phone home balanced (air above 312→253, below 24→86; head lifted scale 1.2; CTA unpinned) · V9-402 rag: the paragraph had BOTH authored breaks AND text-wrap:balance — engines disagree, hence Pixel-perfect/iPhone-wrong; balancing off where breaks are authored (the measure was NOT the cause: 19% headroom, measured before changing anything) | 8fc9509 + 3957d9f + (this commit) | rag 0/0/0 full matrix · contrast 0 failures · a11y 0/0/0 across 51 runs incl. RM + zoom200 · draw calls 79 land / 77 else ≤80 (Part 2 study hit 81; the 3 step treads merged to ONE mesh returned 2 calls, appearance unchanged) · curtain probe: 2 <p> "The"/"Paintings" · menu bug reproduced then fixed at 390×640 · credit 1 line at 390/412/430, 2 at 375/360 · home probe 5 widths |
| P5 batch 4 — V8-327 arch + stairs (the end wall is ONE ShapeGeometry with an arched cutout — ARCH_W 1.9, spring 2.0, apex 2.95 — plus archivolt, two pilasters and a keystone; the wall masks the glow plane, so the old "white rectangle" becomes an arch of light with no new texture; glow widened to 7.4×5.6 at endZ−3.4 so it fills the frame once you are through; steps rebuilt 0.16 rise / 0.5 run descending 0.48m with treads lighter than the landing; railZ() → piecewise railPose(railT) with T_WALK DERIVED from walk vs descent distance (0.875) so the speed never changes at the hand-off; chip/Skip/Face-forward unmount and the dots fade while descending; slot 90N+100 → 90N+160vh at BOTH sites; hook exposes descending/tWalk/endZ) | (this commit) | arch probe at railT 0/.5/.86/.93/.97/1 × 1440+390: z −49.8 → −58 (past endZ −56), y 1.55 → 1.07 (0.48 exactly), pitch dips −0.219 then settles, dots opacity 1 → 0, Skip gone, 0 page errors; museum-p5f calls 77 (79 land) ≤ 80, no composition/chrome findings; at rail END the fps findings fall to 14/240 (390) — past the arch only 3 objects draw, which independently confirms the fps ceiling is this container's software-GL scene cost |
| P5 batch 3 — V8-325 frames (the canvas floated 105mm proud of the innermost ring, so obliquely each painting read as a slab with brown flanks: depths are now authored as "how far this face stands into the room" and step in 15mm — moulding 20 / lip 35 / slip 50 / canvas 60, i.e. 10mm proud, a shadow line instead of a wall; in-plane steps widen to 340/180/70mm for a slightly richer profile; the study frame takes the same idiom. FIRST attempt inverted the order (moulding most proud) and the solid boxes occluded every painting — caught by the oblique shot, not by any assertion) + a Face-forward duplicate at ≥1024 (V8-322's `lg:hidden` sat on a `.btn-sm`, whose unlayered `display:inline-flex` beats Tailwind's layered utility — the utility now rides a bare span; only instance in the codebase) | (this commit) | museum-p5e: calls 74 (76 land) ≤80, ZERO composition/chrome findings; frame shots hall/oblique/mid at 1440+390 before vs after; face-forward probe = exactly 1 visible at 390/768/1024/1440, at the authored corner |
| P5 batch 2 — V8-328 drawer (pill handle deleted; 44×44 X close, visible only when open; DOT_GAP=24/DOTS_H=36 single-sourced across the JSX bottom, tick()'s live follower and layout()'s reserve; ONE continuous sheetPos driven by header drag + axis-locked stage swipe (8px window, 1.2 vertical bias) + a wheel state machine (zoom above the floor → open → close, 160ms latch, idle snap); body always mounted so layout() reads the VISIBLE height and the painting recomposes as the drawer slides; the alive-toggle overlay is `pointer-events:none` so a swipe starting over the painting reaches the stage — keyboard/SR activation unaffected) + V8-329 study on the plaque (new `study`/`studyAspect`/`studyNote` fields — the 5 horizontals take their chapter's drawing, commissioners Part 2 its own `sketch-pt2`, narratives none; thumbnail+label on one line with the note beneath at full card width; card capped to the stage with inner scroll) + instrument fix: museum-check waits for the dolly to SETTLE before the composition assertions | (this commit) | drawer probe 390/768: wheel-open · X-close · swipe-open · hook round-trip all land, dotGap exactly 24 in every state, painting recomposes live (top 278→228), 0 console errors; card heights 682/668/600 at 1024×768 / 1280×800 / 1440×900 (was 973 at 1024×768, overflowing); museum-p5d: calls 74 (76 land) ≤80, cx 0.501 at 768/1024/1440 (0.531 before the settle fix), overlaps card false; a11y /paintings 0/0/0 across 6 runs incl. RM + zoom200 |
| P6 people+about — V8-301 the three-line H1 at every width (the v7 xl two-line swap deleted; 88px at ≥1280 in the 8fr column, right edge 872<1440) + V8-303 tablet intro break (authored `md:max-lg` br + `{" "}`; natural wraps elsewhere) + V8-304 afterword attribution breaks after "Freeing Charles:" at EVERY width (Wil asked tablet; the one-liner also overran the 46rem figure at 1024–1440 with a mid-subtitle wrap — the audit's noted fallback; data split at the colon, never hardcoded) + V8-305 phones read photo → NAME → prose via grid areas (DOM stays heading-first; 32px above / 28px below the name; ≥640 the v7 name-first layout exact, 48px row gap) + V8-306 book title NBSP-glued at phrase boundaries (punctuation-only) + V8-307 About closer centred below lg (58/58 · 183/183 · 227/227 · 260/260; 1024+ left 0/427+; People closer untouched per Wil "on the about page") | (this commit) | rag people+about 9vps 0/0/0 (+ /about re-run post-V8-304: 0/0/0); a11y 6 runs 0 serious/mod/minor + RM + zoom200 ok; p6-probe2 settled geometry table + shots (scratchpad/p6-shots) |
| P5 batch 1 — V8-320 plaque (eyebrow = `Location 0N` alone in card + sheet; attribution = quote's role, bold, not italic; barbershop hall pair named "Peter Baltimore's Barbershop 1/2" via per-chapter PLAQUE_VARIANTS — ferry keeps Narrative I/II, grid keeps narratives per Wil 00:34:11; grid caption Location NN) + V8-321 Skip arrow points right (rotate removed) + V8-322/323 chrome (Face-forward: desktop top-right on Skip's axis, phones bottom-centre above the dots; chip: tablets ~44% centred, phones above the dots) + V8-324 camera (RAIL_PITCH −0.15/−0.12; yaw 0.0022, pitch 0.0018, inertia τ 0.12) + V8-330 phone inspect fit (portrait fov cap 92°, F .88, dH/dV split in compose()) + V8-326 alive-by-default (nearest-N window 2/3, pool N+1, input-armed, still-swap on rVFC, per-index stopped[], softGL tier rests the hall under SwiftShader) + V8-331 painting-to-painting (approach-tap on another canvas walks to it) | (this commit) | museum-check p5b: calls 74–76 ≤ 80, pitch −0.12/−0.15 measured, approach cx/cy centred, overlaps false, controls enumerated, land "sheet >55%" finding GONE vs baseline; fps 239/240 >26ms is ENVIRONMENTAL — proven by running the same instrument on a pre-museum 8ef1d5e worktree (:4324): identical 239/240 at every station/vp with v7 pitches (scratchpad/museum-p4base); real-fps check goes to live/RG |
| P4 map — V8-201 strip ON the inset (pb inset; cardLift/fade-limit synced; the (i) lifts above the strip during walk via .troymap-root[data-walk]) + V8-202 .t-card 20/25.5/30 cream + V8-203 four corners (1858 door top-right bordered ALL breakpoints, chip centre-aligned to it 78/78 · 61/62 · 41/42; walk door phone bottom-left on the ☰ axis, desktop centred; phone (i) mounts bottom-right beside the ☰) + V8-206 bearing 16 (pitch 52 held at every vp by the search) + V8-207 phone pins = pills with `name.pin` (schema + 3 JSONs; markerHtml narrow branch; labelRect models the real pill; THE PHONE SEARCH still fit ±12 dot boxes — now fits pill rects, bakery pill was 23px past the edge before) + V8-251 verified equal (40/40) + V8-252 ☰ hidden during walk everywhere (visibility) + V8-261 lens hint deleted + V8-262 caption mt-5 + V8-263 lens opens on downtown (panelFit ×1.3, width floor 1.8, cx .58 cy .74 — Green Island out of frame at 1440 and 390, verified by crop inspection) | (this commit) | map-probe stub runs at 390/768/1440 (bearing/pitch/doors/strip/menu/buttons), pills probe (5 named pills inside the frame), lens shots desk+phone + top-left label crop; attribution position unverifiable under the stub (no attrib strings) — static CSS + live check |
| P3c V8-277 hook centring (phones: scene h2 + quote centred, hung indent off; kicker + narration left) + V8-278 barbershop up (landscape 100 — the 1440 frame has only 60px of slack so bottom-anchor is the whole lever; NEW heroFocus.portraitScale 1.18 lifts the phone hero about its bottom edge — phones show the vertical poster's full height so object-position can't move it; the lady's face now mid-frame, sills gone) + V8-204 where-to-next (LOCATION NN rides the heading row bottom/right-aligned EXACT 169/169 · 1304/1304; Continue REMOVED; whole-map stretched link = the one door "Continue to X"; embed pill = solid orange active idiom; Get directions centred, still ghost) + V8-205 ch2 plate fades cream (--ground-light both edges; photo interludes keep dark) | (this commit) | pill DOM probe (bg 228,91,39 · ink 29,20,17); onward shots desk/phone; barber hero shots ×2; hook shot 390; ch2 interlude seam shot |
| P3b V8-275 moral legibility (scrim middle .86→.90; `.moral-ground` blur 2px + scale 1.04 RM-safe; per-moral `groundFocus` map) + V8-276 ferry moral ground = its study drawing (tiers regenerated from sketch-1440.jpg via sharp, 439KB jpg ≈ old 417KB; bakery ground provenance queued for Wil) + hero separator `text-neutral-12` (V7-007's stated fix was never in the markup; the longer LOCATION pushed the orange dot onto lit paint, p10 3.39) + hero lockup halo densified + **instrument fix**: contrast.mjs skips alpha-0 leaves at classify (the audio control fades in on arrival; classifying it at page top froze alpha 0 → p10 1 false failures; v7 dodged it only by hydration timing — proven by A/B: same fails with pt-5 restored, v7 worktree "pass" was vacuous, its hydration 403'd) | (this commit) | contrast 390+1440 × 5 chapters: 0 fails (10 cells); moral shots ×7 both widths |
| P3a V8-271 chip (md+ bottom = inset/2 — the bottom fade dissolves the plate's edge so the full inset read loose; the wipe's pre-reveal scale(1.04) was polluting measurements — settled gaps now 20/20 phone · 40/20 tablet · 56/28 desktop; ch2 phones read "Troy, New York · 1858", licence tail ≥640; mobile "archival record" kept per Wil 01:01:06) + V8-272 chapter H1 phones step up (global --fit-advance var, hero-scoped 0.64 + 52px phone cap: 34.7→39.1 / 40.5→45.6 / 44.2→49.7 at 390; tablet/desktop capped unchanged) + V8-274 study note → t-meta-body (tertiary) | (this commit) | chip-probe3 one-line ×5 chapters ×3 vps; h1-verify 4 vps ovf 0; rag chapters @360/390 0/0/0; eyeball shots |
| P2 V8-104 mobile home (CTA hugs 233px centred, pb 24; head lifted — media scale(1.09) origin bottom, chin 40%→34.6%; 7-line authored pyramid rag 18/29/36/38/31/30/23ch via display-gated `<br class=home-br>` + `{" "}` separators — Astro trims text↔element newlines) + V8-103 tablet (portrait ≥768 gets object-position 50% 37% + pt 36dvh + opened gaps — tablets CROP vertically, aspect 0.75 > source 0.5625, so object-position governs there) + V8-101 (srcset descriptor tells the truth: 1080w; high-res source queued for Wil) | (this commit) | home-shots probe: CTA 233px/gap 34, eyebrow 38% phones / 38% tablet / 34% desktop, 7/4/3 desc lines, 0 overflow at 360/390/430/768/834/1440; paragraph text+breaks verified rendered |
| P1 V8-001 spot→location sweep (24 template strings, 4 prose edits incl. V8-102 home / V8-208 map / V8-302 people copy; CONTENT-STATUS v8 ledger) + V8-002 button optics (.btn 52/22, .btn-sm 40/18, icon-side trims as explicit btn-icon-start/end classes — :has(> .icon) failed on lone-icon buttons; TroyMap safe box 48→52) + V8-273 player gap (.player-rule-gap 27/37 coarse; measured 28 vs 27 at 1440) + V8-351/352 footer (grid-areas, Share bottom == nav bottom EXACT at 768/1024/1440 via 1fr/auto rows + row-gap 1rem; mobile gap 2.5rem, nav gap-2, disclaimer 2 authored lines) | (this commit) | rag 9vps×11 routes 0/0/0 (two mid-run HMR phantoms re-verified clean individually); a11y 0/0/0 ×14 runs (/,/map,/bakery,/people @390/1440); p1-probe numbers in scratchpad |

## DECISIONS (run-time)
- C3 "map gradient" resolved by probe (scratch c3-context-1200.png): the
  cream scene prose sits directly above the cream 1858 plate on
  /commissioners-office and the plate's edge fade is dark brown
  (`[chapter].astro:433-436`) → the fade becomes `--ground-light` for the
  `troy-1858` interlude only; photo interludes keep the dark fade
  (V8-205).
- Wil's "Christensen" = speech-to-text for the author's correct spelling
  "Christianson" (consistent across the repo + the book) — no spelling
  change (V8-304).
- Branch mirroring: every `v2` push is mirrored to
  `claude/nalle-memorial-polish-kc4uvm` (the session's designated
  branch); deploys only fire from `v2`.

## STANDING NOTES
- Dev :4321 (self-daemonized `astro dev`; `astro dev stop/status/logs`).
  Production preview :4322 for perf. One Playwright process at a time;
  background long instruments (v7 lesson — foreground timeouts SIGTERM
  Chromium).
- `scroll-behavior: smooth` is on — instruments scroll with
  `behavior: "instant"`.
- ENV: **iOS Safari's chrome takes ~190 CSS px**, so `100dvh` on a 390×844
  iPhone is ≈ **655**, not 844 and not the 664 v10 assumed — measured off Wil's
  own screenshot (frame 635 tall + the 20px p-2.5 inset). Any home- or map-page
  measurement run at the device's full height is measuring a viewport that does
  not exist; the phone matrices must use real dvh values. The map's overview
  search failing on short phones (V10-14) was this same 190px, one layer down.
- INSTRUMENT: the home page's entry choreography (`home-rise`, staggered to
  seq 5) plays once on load. Measuring through it reports phantom 22px offsets —
  that is `translateY(22px)` mid-flight, not a layout bug. Settle first:
  `await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))))`.
- INSTRUMENT: the map's overview arrives on a 2s `easeTo`. Sample only once the
  camera is at rest (poll centre/zoom/pitch unchanged for ~6 ticks AND
  `!map.isMoving()`), or every reading is mid-ease.
- INSTRUMENT: editing an island's source (Museum.tsx / TroyMap.tsx) reliably
  stales Vite's optimized deps — the island then 504s ("Outdated Optimize Dep")
  and never hydrates, so `window.__museum` / `__troyMap` never appear and every
  probe times out looking like a runtime bug. `astro dev stop && astro dev
  --background` clears it. Hit twice in v11 alone; check this BEFORE debugging
  the component.
- ENV: this container's Chromium cannot decode the site's MP4s at all (no
  proprietary codecs), so video dimensions cannot be read in a browser and
  films never play. `ffmpeg`/`ffprobe` are not installed either, so the splash
  cannot be transcoded here.
- ENV: `poppler-utils` IS installable via apt (`pdftotext`, `pdftoppm`) — that
  is how Wil's markapriest.org PDF was decoded. `markapriest.org` itself and
  `carnegiecenter.omeka.net` are both egress-blocked.
- ENV/INSTRUMENT: `qa:walk` CANNOT run here — api.mapbox.com is proxy-blocked,
  so the style never loads ("Style is not done loading" ×8 viewports). Map
  geometry is verified instead with a Playwright route-stub style: fulfil
  `**/styles/v1/**` with a minimal `{version:8, sources:{}, layers:[background]}`
  and 204 everything else on mapbox.com. **Playwright matches routes
  LAST-registered-first**, so register the catch-all FIRST and the style route
  LAST or the stub never lands. Under the stub `project`/`unproject`/
  `cameraForBounds` are all real, which is everything the camera search needs.
  Do NOT commit a walk.md produced by a blocked run — it replaces good evidence
  with an environment failure.

## BLOCKED / NOTES
- V8-101 needs the high-res `home-bg.png` (≥2160w) + splash film ≥1080w
  from Wil — in-repo we fix the lying srcset descriptor only.
- ENV: walk-check/states need the real Mapbox style and cannot run here —
  Phase-4 verification ran through scripts in scratchpad using a
  Playwright route-stub style (site untouched); geometry/camera/layout
  asserted there; tile visuals + attribution positions go to the live
  check + Wil.
- ENV: makeitnotable.github.io is ALSO proxy-blocked — the live site
  cannot be curled from this container. Live = HEAD verification is
  substituted by the deploy.yml Actions run for the exact HEAD sha
  concluding success (build + deploy-pages publish that sha); checked
  after every push via the GitHub MCP.
- ENV: this container's egress proxy 403-blocks api.mapbox.com — the GL
  map cannot fetch its style/tiles here (the a11y "console errors" on
  /map are exactly that fetch). Map geometry work (V8-206/207) will be
  verified with a Playwright route-stub style (site code untouched);
  tile visuals verified on the live site page-load markers + by Wil.
- NEVER edit src/ while an instrument runs — HMR reloads mid-measure
  produced phantom readings (barbershop@360 clips, people@land destroyed
  context); both re-verified clean individually.
- ENV: museum-check's fps assertion is unverifiable in this container —
  Chromium runs on SwiftShader (software GL), and the PRE-museum commit
  8ef1d5e measures the identical 239/240 frames >26ms at every station
  and viewport (worktree probe, scratchpad/museum-p4base/museum.md). All
  non-fps assertions (draw calls, pitch, composition, controls, overlap)
  are the working gates here; real frame pacing goes to the live check.
  (Worktree probes need `server.fs.allow` pointing at the main clone —
  the symlinked node_modules otherwise 403s and the run is vacuous.)

## v11.2 — mobile chrome (traps worth keeping)
- ENV/INSTRUMENT: **edge sampling MUST run against `astro preview`, never
  `astro dev`.** `astro-dev-toolbar` is a fixed element across the bottom of the
  viewport, so in dev every bottom-edge sample is the toolbar and not the page —
  it sent the first three passes of the tint work chasing a ground that was not
  there. `npm run build && npm run preview -- --port 4331`, then
  `npm run qa:bleed -- --base http://localhost:4331`.
- INSTRUMENT: **`qa:shots` cannot prove a visual no-op on this site.** Two runs
  of the SAME build differ in 60 of 155 captures — /paintings is a live three.js
  hall on SwiftShader, and the reveal/lazy-media pages settle differently run to
  run. Establish the noise floor first (capture twice, diff those) or the change
  cannot be separated from a frame. For a CSS declaration, ask the DOM instead:
  snapshot computed paint, flip the declaration in the SAME page instance,
  snapshot again — no timing, no frames, no noise.
- TRAP: comparing computed colours across a toggle catches TRANSITIONS mid-
  flight and serialises the same colour two ways (`color(srgb …)` against the
  `oklab(…)` interpolation space). `.walk-seg` read as 3 differences that were
  not differences. Inject
  `*,*::before,*::after{transition:none !important;animation:none !important}`
  first.
- TRAP: a band's MEAN is not its ground — a row of body text dragged /map's
  edges 47–86 away from a page that was in fact seamless. Take the MODE of the
  band, quantised.
- TRAP: sample edges **4px in**. The walk rail is a 3px hairline pinned to the
  top of every chapter page; row 0 measures the rail, not the page.
- TRAP: `getComputedStyle().getPropertyValue("--x")` returns the substituted
  TOKEN STREAM, not a resolved length. Four islands `parseFloat` `--ui-inset`;
  the moment it became a `max()` they would have read NaN and fallen back to
  20px at every width. `@property --ui-inset { syntax: "<length>" }` is what
  keeps them working.
- ENV: Chromium reports **no safe-area insets**, so `env(safe-area-inset-*)` is
  always 0px here. The growth half of the lane is proved by standing a 47px
  inset in env()'s place with an injected `max()` and watching the anchors
  follow; the real thing goes to a phone.
- ENV: mobile browser chrome — its tint, and whether it retracts — **cannot be
  observed in this container at all**; headless Chromium has no address bar.
  Every precondition is measured (`qa:bleed`); the chrome itself goes to Wil.

## v11.3 — the seam-and-hall round (traps worth keeping)
- TIMELINE: before diagnosing "the fix didn't work" from a user screenshot,
  compare the screenshot's clock to the deploy's. Wil's five 8/24 screenshots
  (12:59–13:08 EDT) predate run 196 (13:58 EDT) — they show the build the fix
  replaced. The Actions run list dates every sha; his phone's clock dates the
  evidence.
- LAYOUT: `position: sticky` STAYS IN FLOW. A sticky 100dvh overlay pushed the
  museum island — and the whole hall — one viewport down (canvas top 733 on a
  733 screen). Overlays over in-flow siblings are `absolute`.
- LAYOUT: `position: sticky` also always CREATES A STACKING CONTEXT — the
  stage's z-30 children can never rise above a later z-20 sibling of the
  stage, whatever their z-index. Order across a sticky boundary is decided at
  the boundary.
- LAYOUT: never clear a JS-positioned element's inline offset to "" unless a
  CSS fallback exists — with none, `bottom` resolves to `auto` and the element
  falls into static flow after the last in-flow sibling. Corollary: give a
  full-bleed canvas `position:absolute; inset:0` so nothing can ever fall
  "after" it.
- INSTRUMENT: a lockup whose clearance IS its padding must be collision-tested
  on the union of its text children — the padded box reaches the screen edge
  by construction and intersects everything.
- INSTRUMENT: `npm run qa:hall` (scripts/hall-check.mjs) now gates the tilt
  escape hatch, the dot rail's position (at rest, walking, in approach, and
  across a mid-session viewport growth), and the /paintings lead geometry.
  Needs `astro preview`, same as qa:bleed.
