# CNWM v8 — AUDIT (identify before you fix)

Source: Wil's page-by-page review of 2026-08-19 (Gemini meeting notes +
full transcript, desktop → tablet → mobile). Build audited: `ece01a0`
(= v7 RUN COMPLETE, live = HEAD). The transcript is the authority — the
auto-generated task list garbles several items, two requests were
**rescinded mid-meeting**, and one request appears only in the transcript
(V8-141 painting-to-painting). Every finding below carries an ID, the
place (file:line at `ece01a0`), what is wrong, the planned fix, and how it
is verified. Severity: P1 = Wil named it and a visitor would notice ·
P2 = Wil named it, polish · REV = explicitly rescinded, do NOT do.

Process: implement → re-measure (named instrument) → commit → update
`docs/RUN-STATE.md`; push ≤ every 3 commits; live = HEAD verified per
push. Kathy-prose edits are client-directed and each gets a
`docs/CONTENT-STATUS.md` row. Baseline instrument numbers = the v7 final
evidence (`docs/v7/qa/final/`): a11y 0/0/0 × 51 · states 0/135 · contrast
0 · rag 0/0/0 · walk 8/8 · museum 5/5 · perf home 97 / chapters 98–99 /
map 64 / paintings 89–90 / people+about 99.

---

## 0 · Rescinded during the meeting (recorded so they are never "fixed")

- **REV-1** · Secondary-button border/outline colors (`Back to map`,
  `Back to today`, all `.btn-ghost`) — requested at 00:03:52, **rescinded
  00:08:31** ("no changes to any of the outlines on any of these
  secondary buttons"). No change. (V8-330 optical padding still applies.)
- **REV-2** · Menu-button corner radius (extreme top-right curve when the
  ☰ sits top-right) — requested 00:37:19, **rescinded 01:10:37** ("The
  menu buttons across mobile, desktop and tablet will have no change at
  all anywhere"). No change.
- **REV-3** · Orange-on-orange kicker pairs (About "07 Onward / The
  streets are waiting", People "03 Onward / Their story lives on") —
  requested 00:47:32/00:52:51, **rescinded 00:54:00** ("Do not change
  this anywhere… Keep the orange the same"). No change.

## 1 · Global (V8-0xx)

- **V8-001 · spot → location, sitewide** · P1 · 00:14:13 "anywhere where
  we're using the terminology spot, let's change that to location".
  UI templates (the word is never authored in chapter JSON):
  `TroyMap.tsx:738` (aria) · `:1222` (no-token fallback) · `:1351`
  (arrival plate "Spot NN of 5") · `:1410` (aria "first spot") ·
  `:1520-1521` (card arias) · `:1558` (card eyebrow `Spot`) ·
  `map.astro:14` (H1 "Five spots<br/>through Troy" → "Five locations
  throughout Troy", per 00:12:32; re-run `fitChars`) · `:41` (meta) ·
  `:55` (aria) · `:109` (index eyebrow) · `[chapter].astro:292` ("Spot NN
  of 5") · `:370` ("Spot NN · continued") · `:403` (AudioStory `spot`
  prop) · `:606` ("Next · Spot NN" — see V8-204 for the relayout) ·
  `paintings.astro:205` (grid caption) · `Museum.tsx:1252/:1313` (plaque
  eyebrows — see V8-320) · `WalkProgress.astro:53` (sr-only) ·
  `AudioStory.tsx:33-34/88/318/403/457` (prop plumbing + labels) ·
  `styleguide.astro:58` (stale "STOP 02 OF 5" specimen).
  Prose (CONTENT-STATUS rows): `index.astro:104` "Five spots mark where
  it happened." → "Five locations across the city mark where it
  happened." (00:01:26) · `map.astro:66` "Four spots carry bronze
  plaques" → "Four locations carry…" (00:13:14) · `about.astro:163-164`
  "the fifth spot" → "the fifth location" · `people.astro:63` "spot by
  spot" — superseded by the V8-302 copy replacement.
  Verify: `rg -i '\bspot' src/` = code/comments only; `qa:rag` at 9 vps
  (Location is 4ch longer than Spot — pills/eyebrows/cards must not wrap
  at 360/390); `qa:a11y` (aria strings).
- **V8-002 · Button optical padding** · P2 · 01:20:46 buttons feel wider
  than tall ("left and right margin gets a little bit smaller and the top
  and bottom gets a little bit taller"). `global.css:761-765` `.btn`
  min-height 48 / padding-inline 28 (H:V ≈ 1.9:1); `:772-776` `.btn-sm`
  38 (44 coarse) / 20. Fix: `.btn` padding-inline 28→22 and min-height
  48→52; `.btn-sm` padding-inline 20→18, min-height 38→40 (coarse stays
  44); icon-end trim (the 18px arrow carries its own visual space —
  `padding-inline-end` −4px when the last child is an icon, via a
  `:has(> .icon:last-child)` rule). CAUTION: TroyMap's safe-box math
  (`TroyMap.tsx:477`, strip heights :568-574/:768-771) assumes the 48px
  door; bumping `.btn` to 52 must re-run `qa:walk` label-fit. Verify:
  screenshots of every button surface at 390/768/1440; `qa:states`;
  `qa:walk`.

## 2 · Home (V8-1xx)

- **V8-101 · Splash reads low-res** · P1 · 00:00:22. Two causes: the
  visible element is the 480×720 `splash.mp4` (`index.astro:27-37`)
  stretched ~3× at 1440; and the still srcset lies — `home-bg-1440.avif`
  is declared `1440w` but the file is 1080px wide (`index.astro:42`;
  `build-media.mjs:159` clamps to the source, which is 1080 wide on
  Wil's machine — `${LEGACY}/home-bg.png`). No larger source exists in
  the repo. Fix now: correct the srcset descriptor (1440w → 1080w).
  HUMAN QUEUE: need `home-bg.png` ≥ 2160px wide + a splash film export
  ≥ 1080px wide; `scripts/build-media.mjs` regenerates every tier.
  Verify: rendered srcset; queue entry in the review guide.
- **V8-102 · Hero copy** · P1 · 00:01:26. `index.astro:102-104` last
  sentence → "Five locations across the city mark where it happened."
  (nbsp re-glued). CONTENT-STATUS row. Verify: `qa:rag` home (3-line rag
  at 1440 held per v7 H2), `qa:contrast` home.
- **V8-103 · Tablet hero clumped at the bottom** · P1 · 00:35:22.
  Portrait tablets fall through every media query to the base rule
  (`index.astro:129-139`: object-position 50% 50%, padding-top
  clamp(200px,41dvh,460px)). Fix: a portrait ≥768px step — media/head up
  (object-position ≈ 50% 42–44%), lockup up (padding-top ≈
  clamp(180px,30dvh,340px)), gap opened. Verify: screenshots 768×1024,
  834×1194, 1024×1366; `qa:contrast` home; head whole with headroom.
- **V8-104 · Mobile CTA + stack** · P1 · 00:55:44/00:56:45. `.home-cta`
  `width:100%` (`index.astro:179-185`) → hug content, centred,
  `margin-top:auto` kept; the freed side margin becomes bottom padding
  (16px → ≈ 28px); head + text blocks nudged up (portrait ladders
  `index.astro:160-176`); the hero paragraph re-ragged as a tight
  pyramid with the new copy (authored `<br>`s, phones only). Verify:
  shots 360/390/430; `qa:rag`; CTA ≥ 48px tall, centred with equal
  side gaps.

## 3 · Map (V8-2xx map page · V8-25x walk · V8-26x lens)

- **V8-201 · Overview cards ride too high** · P1 · 00:02:32 (desktop
  bottom-align with the ☰), 00:39:35 (tablet: ☰ moves ABOVE the cards),
  01:00:17 (mobile: bottom-align). Strip wrapper
  `TroyMap.tsx:1483-1490` `pb-[calc(var(--ui-inset)+80px)] sm:+96px`;
  the SAME height is duplicated in `cardLift()` :568-574 and the
  marker-fade limit :768-771 — all three move together. Desktop/mobile:
  reduce the reserve so the card bottoms sit on the ☰'s axis
  (`--ui-inset`); tablet (640–1023): ☰ keeps bottom-right but the strip
  drops to the inset with the ☰ riding above the cards (Menu gets a
  tablet offset) — measure and pick the cleaner of the two readings
  during implementation. Verify: `qa:walk` 8 vps · `qa:states` ·
  screenshots 390/768/1024/1440 (card bottom == ☰ bottom ±4px).
- **V8-202 · Card titles too small/light** · P1 · 00:13:54 ("bump up the
  title… weight a little bit thicker", keep the authored line breaks).
  `.t-card` `global.css:1224-1243` 18/22.5/27 Caslon 400. Fix: step the
  ladder up (≈ 21/26/31) and raise the optical weight (Caslon Display
  has no 500 — use the Text cut's 600 or letterform size alone; measure
  against the card box 128/160/192 so two lines + eyebrow still fit).
  Eyebrow `Spot` → `Location` (V8-001) must not wrap the row at 360.
  Verify: screenshots; `qa:rag` (map) zero clips.
- **V8-203 · Doors regroup** · P1 · 00:10:19/00:37:19 (desktop+tablet:
  `See Troy in 1858` → top-right, top-aligned with the `April 27, 1860`
  chip; `Take the walk` centred at the bottom) · 00:57:32 (mobile: the
  1858 pill reads as not-a-button → give it the `.btn-ghost` border; the
  chip centre-aligns with it; `Take the walk` left-aligns with the chip
  and centre-aligns with the ☰). Today: chip top-left :1330-1342; 1858
  desktop = bottom-centre row :1448-1460, phone = top-right :1462-1474;
  walk door :1442-1445. Fix: ≥640 the 1858 button moves to
  `top/right: var(--ui-inset)` (vertically centred against the chip
  row); phones keep top-right but adopt the ghost border; the walk door
  keeps bottom-centre (drop the −24px phone offset; left-align with the
  inset per the mobile note while staying on the ☰ axis — measure both,
  pick what reads). Attribution (i) stays bottom-left. Verify:
  `qa:states` map states 0 collisions · `qa:walk` (safe box changes —
  :477 must learn the new top-right occupancy) · screenshots ×4 vps.
- **V8-204 · Where-to-next relayout (chapters)** · P1 · 00:15:20-00:17:08.
  `[chapter].astro:605-631`: "Next · Spot 02" → **"Location 02"**, moved
  up to sit bottom-aligned with the `WHERE TO NEXT` heading and
  right-aligned with the map edge (heading row :583 becomes a
  flex row `items-end justify-between` scoped to the map's width);
  destination name (:607) becomes the ORANGE chip (the one orange in the
  section now that Continue is gone); **Continue removed** (:610-618);
  `Get directions` (:619-630) centred beneath the address; the embed map
  becomes the navigation door — whole-shell `<a>` around the map with
  the same `data-curtain-label`/`date` (EmbedMap already builds a pin
  `<a>`, `EmbedMap.tsx:34-45`; canvas stays `interactive:false` :78).
  Verify: `qa:census` ladder ×5 unchanged · `qa:a11y` chapters (link
  name on the map door) · `qa:contrast` (orange chip ≥ 4.5:1) ·
  screenshots ×3 vps · click-through test dev.
- **V8-205 · Embed/interlude dark fade → cream (ch2 map)** · P2 ·
  00:18:56. Probed on /commissioners-office at 1440: the cream scene
  prose (ground-cream) sits directly above the cream 1858 plate, but the
  plate's edges fade to dark brown — `[chapter].astro:433-436`
  `linear-gradient(to bottom, var(--color-primary-2), transparent 12%,
  transparent 88%, var(--color-primary-2))`. Fix: for the `troy-1858`
  interlude the fade color becomes `--ground-light` (#f6f3ee) both
  edges ("the two white sections fading into the map"); other chapters'
  photo interludes keep the dark fade (Wil named only the map). The
  credit chip stays measurable (`qa:contrast` pixel on the plate).
  Verify: screenshot before/after · `qa:contrast` /commissioners-office.
- **V8-206 · Map camera: slight rotation + 3-D everywhere** · P2 ·
  00:11:23/00:38:45/00:59:26. `OVERVIEW.bearing = 10` (`TroyMap.tsx:41`)
  reads straight-on at overview pitch. Fix: bearing 10 → ≈ 16 (one
  literal; the label-fit search re-validates chip separation); confirm
  the phone/tablet search still lands pitch ≥ 44 (PITCHES :53) — log the
  chosen pitch per vp from `qa:walk`. Verify: `qa:walk` 8/8 ·
  screenshots.
- **V8-207 · Phone pins = labeled pills** · P1 · 00:58:43/01:00:43
  ("pins should look the same as tablet/desktop", short names: Bakery ·
  Commissioner · Mansion · Ferry · Barbershop). Today phones render
  numbered 24px dots (`markerHtml` narrow branch `TroyMap.tsx:125-156`).
  Fix: new optional `name.pin` in the schema (`content.config.ts:63-70`)
  + five JSONs (Commissioner’s Office → "Commissioner", Gilbert Home →
  "Mansion" per Wil's list, Ferry Landing → "Ferry"); phones render the
  desktop pill idiom (leader line + numeral chip + label) using
  `pin ?? short`; the label-rect model :478-484 and the chip nudge
  :762-811 learn the pill footprint; label-fit re-runs (five pills must
  fit the phone safe box — if the search fails at every pitch, shrink
  the phone pill font to 11px before surrendering pitch). NAMING-CANON
  note: `name.short` (the bronze word) is untouched; `pin` is a
  map-pill-only shortening, documented in the JSON.
  Verify: `qa:walk` 8/8 (incl. 360/390/430 + landscape) · `qa:states` ·
  screenshots.
- **V8-208 · Below-map copy** · P1 · 00:12:32/00:13:14. `map.astro:14`
  heading → "Five locations\nthroughout Troy" · `:66` "Four locations
  carry bronze plaques…" · `:41/:55` meta/aria follow. CONTENT-STATUS.
  Verify: `qa:rag` map (heading fit at 360 via fitChars) · screenshots.
- **V8-251 · Walk buttons equal height** · P2 · 01:00:43. `Back`
  (`btn-sm btn-ghost` + icon, :1381-1400) vs `Continue/Walk again`
  (`btn-sm btn-solid`, :1405-1416) — same declared min-height; measure
  rendered boxes at 390 (icon/line-height asymmetry) and equalize.
  Verify: box measurements in dev tools probe; screenshots.
- **V8-252 · ☰ hidden during the walk everywhere** · P2 · 00:59:54 ("you
  really should hide the menu across all screen sizes when we're taking
  the walk if that UX makes sense"). Today only phones
  (`global.css:1244-1252` gated `max-width: 639px`; set from
  `TroyMap.tsx:1151-1161`). Fix: drop the media query (keep the lens
  behavior consistent); Esc/Back restore it. A11y: the menu is
  `inert`/`aria-hidden` while retreated so focus order stays sane.
  Verify: `qa:states` walk states · `qa:a11y` map.
- **V8-261 · Lens copy deleted** · P1 · 00:03:52/00:04:52. The hint line
  `Drag to explore · pinch or scroll to zoom` (`TroyMap.tsx:1311-1314`)
  is removed entirely (both variants). Verify: screenshot; `qa:a11y`
  (aria-label on the viewer :1254 keeps the instructions for SR users —
  intentional).
- **V8-262 · Lens caption breathing room** · P2 · 00:09:39. The
  `Troy, New York · 1858 · Library of Congress` figcaption sits `mt-3`
  under the plate (:1304-1310). Fix: mt-3 → mt-5 (and the button mt-3 →
  mt-4) so the caption clears the plate. Verify: screenshot 1440/390.
- **V8-263 · Lens opens more zoomed (Wil's crop)** · P1 · 00:04:26-00:07:27
  + his screenshot (zoom until "Green Island" disappears, plate dragged
  toward bottom and slightly right — downtown Troy fills the panel).
  `lensReset()` `TroyMap.tsx:263-274` currently fits the LOWER_PANEL
  (y 0.5–1) by height, centred cx 0.5. Fix: raise the initial scale
  (≈ ×1.35 over panel-fit) and bias the centre right/down (cx ≈ 0.56,
  cy ≈ 0.80 of the plate) to mirror the meeting screenshot; same reset
  math at every breakpoint ("apply this crop across tablet and mobile so
  it feels similar" — Needs-further-discussion; flagged in the review
  guide). Min-scale/cover logic (:229-247) unchanged. Verify:
  screenshots 390/768/1440 against the meeting crop; zoom/reset still
  work (`qa:states` lens states).

## 4 · Chapter template (V8-27x–29x)

- **V8-271 · Archival chip inset + labels** · P1 · 00:14:39/00:40:32
  (bottom gap must equal the right gap) · 01:02:43 (mobile: drop
  "Library of Congress" from the ch2 chip; every chip fits one line).
  `[chapter].astro:440-443` — right `var(--gutter)`, bottom
  `var(--ui-inset)` are the SAME token, so the visual imbalance is the
  chip's own metrics; measure rendered gaps at 768/1440 and equalize
  (likely `bottom: calc(var(--ui-inset) - 4px)` or chip line-height).
  Mobile: ch2's `rest` (`:113-126`) gets a `hidden`-below-sm span around
  `· Library of Congress`; chapters 1/3/4/5 keep "archival record" (Wil
  01:01:38 liked it). One line verified at 360/390. Verify:
  `qa:contrast` pixel on chips · gap probe · screenshots.
- **V8-272 · Chapter H1 up a step (phones)** · P2 · 01:01:38-01:02:43.
  `.t-display` fit-clamp renders 34.7–44.2px at 390
  (`global.css:329-340`, advance guard 0.72). Fix: phones raise
  `--fs-display` 46→52 and relax the advance divisor to 0.68 for the
  hero H1 only if needed — largest size with no hyphenation and ≥
  gutter clearance (`fitChars` still governs). Verify: `qa:rag` clip
  probe 0 · screenshots ×5 chapters at 360/390/430.
- **V8-273 · Player divider gap** · P2 · 00:42:33/00:44:05. Divider→
  button = 20px (`AudioStory.tsx:393` pt-5); button→slider optical =
  27px fine / 37px coarse (mt-4 + `.cnwm-scrub` padding-block 11/21,
  `global.css:1051-1060`). Fix: pt-5 → pt-7 (28px) + a coarse-pointer
  step if 37px still reads unequal on touch. All chapters at once.
  Verify: `qa:audio` 5/5 · box-gap probe · screenshots.
- **V8-274 · Artist study = tertiary** · P2 · 00:46:09/01:03:59. The
  study note is `.t-prose` (`[chapter].astro:553`). Fix: → `.t-meta-body`
  (one step down; the moral cream override `global.css:631-637` keeps
  the color). Verify: `qa:contrast` moral rows · screenshots ·
  `qa:census` type ladder.
- **V8-275 · Moral background legibility** · P2 · 00:21:08/00:23:18 (mix
  of position, darker overlay, slight blur). Scrim middle band 0.86
  (`[chapter].astro:518`), ground `object-position: center 25%` (:514),
  parallax ±6% (:660-671). Fix: scrim middle → 0.90; ground gets a 2px
  blur + slight scale (the parallax already scales 1.14 so no edge
  reveal); per-moral authored `object-position` where the drawing's busy
  band sits behind the text (audit each of the 7 morals by screenshot).
  Taste call flagged for Wil. Verify: `qa:contrast` pixel morals ·
  before/after shots.
- **V8-276 · Ferry moral ground ≠ its study** · P1 · 00:21:34/00:44:42.
  The moral ground is `media/<slug>/moral-*.jpg` derived per index
  (`[chapter].astro:83`), the study is `reveal.sketch` (:86). Ferry:
  ground = skiff drawing, study = street brawl. Fix: regenerate ferry's
  `moral-*` tiers from the SAME drawing as `sketch-*` (sharp resize in a
  one-off script — build-media.mjs's source lives on Wil's machine, so
  derive from the in-repo `sketch-1440.jpg` 1440×1189) and eyeball the
  other four chapters for the same mismatch (bakery/barbershop grounds
  are different drawings too — Wil generalized "make sure we're using
  the same sketches in the background as are being presented in the
  section itself", so ALL five morals' grounds become their chapter's
  study drawing unless the result reads worse; decision logged).
  Verify: visual diff · `qa:contrast` morals (new grounds re-measured).
- **V8-277 · Mobile hook centring** · P2 · 01:05:06. No alignment rules
  today (`[chapter].astro:376-411`). Fix: phones only (`max-sm`): the
  scene `h2` + quote figure centre; kicker + AudioStory stay left.
  Verify: screenshots 360/390 ×5 chapters · `qa:rag`.
- **V8-278 · Barbershop images up** · P1 · 00:22:08 (hero: window-sill
  bottoms out of frame, faces visible) · 00:22:45 (the second image less
  road) · 01:08:21-01:09:10 (mobile: the lady's face). heroFocus
  `barbershop.json:10-14` {landscape 44, portrait 40} → lower both
  (≈ 30/26, tuned by screenshot); the "second image" = the barbershop
  interlude/history archival photo — locate its crop (interlude img
  `object-cover` full-bleed; add an object-position if it shows road).
  Verify: screenshots desktop/tablet/mobile before/after.

## 5 · People + About (V8-30x)

- **V8-301 · People H1 three lines everywhere** · P2 · 00:23:44.
  `people.astro:15-18` + the xl swap :52-53. Fix: the `_SM` three-line
  lockup at every width; keep the two-column grid at xl (a full-shell
  3-line 88px display would balloon — measure; if Wil's "beautiful"
  needs full-shell, fitChars caps it). Verify: `qa:rag` (authored
  lockup listed, no runt) · screenshots 390/768/1280/1440.
- **V8-302 · People subtext copy** · P1 · 00:25:07. `people.astro:61-64`
  → "Every person below stood on the pavement that exists today. Their
  roles in the story are told in each chapter, location by location."
  (dictation "Their role in the story are told each chapter location by
  location" grammar-normalized — flagged in the review guide).
  CONTENT-STATUS row. Verify: `qa:rag` people.
- **V8-303 · People intro rag (tablet)** · P2 · 00:47:11. The second
  sentence of `people.astro:56-60` starts on its own line on tablet
  (authored `<br class="hidden md:max-lg:inline">`-style break).
  Verify: screenshots 768/834/1024.
- **V8-304 · About afterword attribution break** · P2 · 00:52:21.
  `about.astro:144-146` concatenates name + source. Fix: authored break
  after "Freeing Charles" (tablet band md:max-lg per Wil's "tablet view
  only"; check 1440 — if the one-liner also overruns there, break
  everywhere and note it). NOTE: the repo's "Christianson" is the
  author's correct spelling — Wil's "Christensen" is speech-to-text; no
  spelling change. Verify: screenshots 768/1024/1440 · `qa:rag` about.
- **V8-305 · About names below photos (mobile)** · P2 · 01:18:34.
  `about.astro:90-124` — mobile order kicker → NAME → photo → prose.
  Fix: phones only, the name (h2 :100) renders under the img (:107)
  with breathing room (flex order or restructured markup; heading
  hierarchy and DOM reading order stay sensible for SR — visual-only
  reorder via CSS `order` inside a flex column keeps DOM order; a11y
  checked). Verify: screenshots 360/390 ×3 sections · `qa:a11y` about.
- **V8-306 · Scott bio rag** · P2 · 01:19:39. `about.ts:81` book title
  unglued. Fix: nbsp-glue the title phrase so it wraps as a unit
  ("Freeing Charles: The Struggle to Free a Slave on the Eve of the
  Civil War" — glue around the colon groups), punctuation-only.
  Verify: `qa:rag` about at 6 vps.
- **V8-307 · About closer centred (mobile+tablet)** · P2 · 01:20:08.
  `about.astro:167-172` — `max-lg` centring on the button row (desktop
  unchanged). ALSO applies to the People closer? Wil said "section
  seven… on the about page… on mobile and tablet" — About only; People
  closer unchanged. Verify: screenshots 390/768/1440.

## 6 · Museum (V8-32x–34x) — sub-plan in the v8 plan file; sequencing
U12 fit → U3 alive → U5 arch → U10 drawer, chrome/naming first

- **V8-320 · Plaque eyebrow + attribution + naming** · P1 ·
  00:27:05/00:28:54/00:32:36. Eyebrow "MARK PRIEST · NALLE SERIES ·
  SPOT 0N" (`Museum.tsx:1246-1254` card, :1307-1315 sheet) → "LOCATION
  0N". Attribution (:1267/:1331 `.t-meta`) → same role as the quote
  (`.t-meta-body`), NOT italic, bold; quote keeps its size/color but
  loses italics? — no: Wil: quote stays as-is, the NAME below it in the
  same font size/color as the quote, not italics, bolded. Names:
  `KEY_TITLES` (`paintings.astro:47-53`) is chapter-agnostic — add a
  per-chapter override so barbershop narrative1/2 read "Peter
  Baltimore's Barbershop 1 / 2" (plaque variant "1"/"2"); ferry keeps
  Narrative I/II; the 2-D grid section keeps its titles (00:34:11 "we
  can leave the narratives on this page"). Grid caption `Spot NN`
  (:205) → Location. Verify: `qa:museum` · screenshots of card + sheet ·
  grid captions.
- **V8-321 · Skip arrow + padding** · P2 · 00:31:16 (arrow points right,
  not down) · 01:09:10 (right padding > left). `Museum.tsx:1206` drop
  `rotate(90deg)`; icon-end trim from V8-002 fixes the imbalance.
  Verify: screenshot.
- **V8-322 · Face forward placement** · P2 · 00:31:16 (desktop: right
  side, same margin as Skip, vertically centred with it) · 01:16:24
  (mobile: bottom-centre right above the dots; chip too). Today it
  replaces the chip in the top band (:1166-1189). Fix: split the
  containers — desktop `top: inset+safe / right: var(--ui-inset)`;
  portraitUI: bottom-centred directly above the dot rail. Verify:
  `qa:states` museum · screenshots ×4 vps.
- **V8-323 · Rail chip position (tablet+mobile)** · P2 · 00:48:36
  (tablet "not quite in the middle… slightly above the middle,
  centred") · 01:09:54 (mobile "more towards the middle").
  `Museum.tsx:1170` — tablet/mobile band moves to `top: 42%` centred
  full-width; desktop unchanged. Verify: screenshots · `qa:states`.
- **V8-324 · Camera down + slower pan** · P1 · 00:26:42 (see paintings,
  less ceiling) · 00:30:11 (pan "aggressive… I don't have control").
  `RAIL_PITCH −0.10/−0.08` (`Museum.tsx:72-73`) → ≈ −0.15/−0.12; yaw
  sensitivity 0.0035 (:638) → ≈ 0.0022, pitch drag 0.0025 → ≈ 0.0018,
  inertia τ 0.18 (:913) → ≈ 0.12. Verify: `qa:museum` 5/5 · manual feel
  at 390/1440 · screenshots (paintings central, floor visible).
- **V8-325 · Frames: canvas proud of the moulding** · P1 · 00:27:58/
  00:31:16 ("big brown line at the side… not in their frames"). The
  canvas plane sits ~0.10m in front of the ring boxes
  (`Museum.tsx:448/:468` vs :452-464). Fix: recess the canvas to
  ~0.01m proud of the slip's front face; step the three ring sizes for
  a slightly more ornate profile — positions/sizes only, zero new draw
  calls. Verify: oblique screenshots down the hall · `qa:museum` calls
  ≤ 80.
- **V8-326 · Alive by default (windowed)** · P1 · 00:28:54/00:29:41.
  Design in the plan file (nearest-N window: 2 phone / 3 desktop;
  `stopped[]` intent; `stillTexs[]` cache; input-armed startup so the
  Lighthouse trace is unchanged; per-index teardown; tap stops/restarts;
  zoom-edge logic deleted; a11y toggle relabelled Pause/Play; RM parity
  by construction). Verify: `qa:museum` new aliveList assertions ·
  production perf /paintings ≥ 80 (target hold 89) · zero mp4 in the LH
  trace · manual on 390.
- **V8-327 · Arch + stairs + glow** · P1 · 00:29:41/00:33:29/01:17:34.
  The "white orb" = the unfogged 4×3.4m glow plane overflowing the
  1.6m doorway (`Museum.tsx:369-385`); doorway is post-and-lintel
  (:346-357); steps exist but are occluded (:362-368). Fix per the
  sub-plan: ShapeGeometry end wall with an arched cut (1.9m × spring
  2.0 × r 0.95) + archivolt + pilasters + keystone + landing (+3 draw
  calls); glow rebaked as an arch-shaped warm gradient sized to the
  opening; steps 0.16/0.5 descending 0.48m; `railZ()` → piecewise
  `railPose()` — the last ~12% of scroll walks through the arch and
  down (slot +60vh at :126 AND :1164); dots/chip/Skip fade while
  descending. Verify: `qa:museum` (new end-state assertions: z past
  endZ, y descended, dots hidden; calls ≤ 80) · screenshots railT ≈
  .9/.95/1 ×4 vps · scroll feel.
- **V8-328 · Drawer: X close + spacing + scroll-driven** · P1 ·
  00:49:28/00:50:27/01:11:39-01:13:04. Handle bar (:1306) deleted; X
  close button (44×44) in the sheet head; dot gap `+12` (:1344, dup at
  :572) → shared DOT_GAP 24; continuous `sheetPos` with the wheel state
  machine + axis-locked stage swipe + live recompose (sub-plan §3).
  Verify: `qa:museum` wheel assertions · manual 390/768 · `qa:a11y`
  paintings (X focus order).
- **V8-329 · Study into card + drawer** · P2 · 01:13:43-01:16:00. The
  sketch lives only in 3-D (:488-510). Fix: card and sheet-full get a
  small study thumbnail under the quote (the 5 horizontal works;
  commissioners Part 2 can use the on-disk `sketch-pt2-*`; narrative
  works have no study — omit), with the redesigned hierarchy (eyebrow →
  title → quote → bold attribution → study row → button), balanced and
  painting-first. Verify: screenshots card/sheet ×4 vps · `qa:museum` ·
  `qa:a11y`.
- **V8-330 · Mobile whole-frame fit** · P1 · 01:16:47. `compose()`'s 84°
  cap under-delivers the horizontal fit on portrait phones
  (`Museum.tsx:595`; needs ≈ 92° at 390/360 with F 0.88). Fix per
  sub-plan: `FOV_CAP_PORTRAIT = 92`, portrait F 0.82 → 0.88, fov from
  the binding axis. Verify: `qa:museum` containment assertion at 390 ·
  screenshots 360/390/768.
- **V8-331 · Painting-to-painting click** · P1 · 00:32:06 (transcript
  only). `tap()` `Museum.tsx:671-681` — in approach, a hit on another
  painting currently no-ops → `approach(hitIndex)`. Verify: manual +
  a `qa:museum` tap assertion.

## 7 · Footer (V8-35x)

- **V8-351 · Share left / nav right** · P1 · 00:17:49/00:41:18.
  `SiteFooter.astro:96-117` grid + :49-80 zones. Fix: Share moves into
  the wordmark column under "Made by Notable", bottom-aligned with the
  nav block; the nav column right-aligns (`justify-self: end`, internal
  left alignment kept). Applies ≥768; phones keep the stack (V8-352).
  Verify: screenshots 768/1024/1440 on a chapter (share present) and
  /map (no share) · `qa:rag` footer.
- **V8-352 · Mobile footer rhythm + disclaimer** · P1 · 01:07:09/
  01:08:02. Nav `gap-3` (:62) → gap-2; block gap 2rem (:100) → 2.75rem
  between the mark block and the nav; disclaimer (:88-93) authored two
  lines: "Walking routes and directions are suggestions only." /
  "Explore at your own pace, discretion, and risk." (phones; wider
  screens keep one line if it fits — measure). The chapters' `data-audio`
  8rem lane stays. Verify: `qa:rag` footer at 9 vps (the two-line
  authoring must not runt) · screenshots.

## 8 · Order of work (dependency-aware)

1. Phase 1 — global fabric: V8-001 → V8-002 → V8-273 → V8-351/352.
2. Phase 2 — home: V8-102 → V8-104 → V8-103 → V8-101.
3. Phase 3 — chapters: V8-271 → V8-272 → V8-274 → V8-275/276 → V8-277 →
   V8-278 → V8-204 → V8-205.
4. Phase 4 — map: V8-202 → V8-201 → V8-203 → V8-206 → V8-207 → V8-251 →
   V8-252 → V8-261/262/263 → V8-208.
5. Phase 5 — museum: V8-320/321/322/323 → V8-324 → V8-325 → V8-330 →
   V8-326 → V8-331 → V8-328 → V8-329 → V8-327.
6. Phase 6 — people/about: V8-301/302/303 → V8-304/305/306/307.
7. Phase 7 — full instrument gate → docs/v8/REVIEW-GUIDE.md → final push.

Every item: implement → instrument → commit → RUN-STATE. Push ≤3 commits,
live = HEAD verified each push (curl marker + Actions green).
