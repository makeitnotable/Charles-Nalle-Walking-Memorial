# v12 BRIEF — Wil's 8/25 round (fourteen points + the hall canon)

*Prepared 2026-08-25, revised 8/26 with Wil's answers and his `masters/Nalle
Drawings/` delivery. Verified against `origin/v2` = `3b6a685` (the drawings
commit, on top of the full v11.3 revert `7fce137`). This file is the work
order and the single source of truth for the round; RUN-STATE stays the live
ledger. Audit into `docs/v12/AUDIT.md` before editing anything.*

**Scope guardrails, from Wil:**

- The hall must end this round with **"perfect performance on mobile, tablet
  and desktop"** and **no bugs** — "do not reintroduce any bugs and do not
  make any changes other than those that I request."
- "Take the walk" (the map door/pill): leave exactly as is.
- The `(01) LISTEN … (06) ONWARD` spine column: untouched.
- Map page on mobile: camera/framing stays exactly as it is, except the
  landscape item (§3.16), sequenced LAST.
- Chapter cards: the ONE change is equal horizontal spacing, **desktop only**
  (his 8/26 answer) — tablet and mobile cards are perfect, do not touch them.
- Kathy Sheehan's prose untouchable; `docs/v4/NAMING-CANON.md` still governs
  LOCATION names. Painting titles are a NEW, separate field — they replace
  nothing in `name.*`.

---

## 1 · The canon: official painting titles

**Final.** Wil's 8/26 map is the authority for these strings, exactly as
written there — punctuation included ("it is final"). Any earlier reading of
his A/B answer is superseded; do not re-litigate the two strings this settles.

| # | slug / key | official title (label text) |
|---|---|---|
| 0 | `bakery/horizontal` | Bakery Abduction |
| 1 | `commissioners-office/horizontal` | 1st and State Street Skirmish |
| 2 | `commissioners-office/horizontal-pt2` | The Altruist |
| 3 | `mansion/horizontal` | Charles Learning How to Read & Write |
| 4 | `ferry/horizontal` | Don't Let Them Have Him! |
| 5 | `ferry/narrative1` | Nalle Crossing The Hudson |
| 6 | `ferry/narrative2` | Ferry Crossing |
| 7 | `barbershop/horizontal` | West Troy |
| 8 | `barbershop/narrative1` | Rushing the Room |
| 9 | `barbershop/narrative2` | Martin Felled by Axe |

*(Settled 8/26: his message had briefly carried two readings of #4 and #5 —
with and without the exclamation, "the" vs "The". He ruled for the map. The
table above is it; the question is closed.)*

**Where titles go.** Add a per-work title field to chapter JSON (schema in
`src/content.config.ts:50-151`; e.g. `media.workTitles: { horizontal: "…" }`)
— content lives in JSON, not in `paintings.astro` literals. Then in
`src/pages/paintings.astro`: retire the location-based composition in
`KEY_TITLES` (`:48-53`, `:76-78`) and `PLAQUE_VARIANTS` (`:58-60`); `title`,
plaque `name`, grid captions and dot/counter aria all take the official title.
The hall plaque (`src/components/Museum.tsx:1727-1773` desktop, `:1831-1840`
sheet) keeps its `Location NN` eyebrow and renders the official title beneath;
the `variant` second line ("Part 2", "1", "2") disappears — titles are unique
now. LOCATION names everywhere else (map, chapters, nav) unchanged.

## 2 · The canon: studies — Wil's map, and which file to build from

Wil's chapter → painting → drawing map (8/26) is **authoritative**. Primary
source: **`masters/Nalle Drawings/`** (ten files, numbered 1-10 in hall order,
all cropped to 1200×800). Secondary: `masters/Priest Series Page/` (nine plates
extracted from the artist's site; three are higher-resolution copies of the
same drawing). Read `masters/Priest Series Page/README.md` — it records the
identification the series page gets wrong and which source wins per drawing.

Verification done 8/26 (centre-cropped dHash + by eye). "Already correct" means
the drawing hanging on that work today IS the one Wil's map assigns — only the
label changes:

| # | work | drawing (Wil's name) | state today | build from |
|---|---|---|---|---|
| 1 | Bakery Abduction | Captured at Holeur's Fashionable Bakery | **already correct** (`bakery/sketch`, d=5) | nothing to do |
| 2 | 1st and State Street Skirmish | Sketch of 1st and State Street Skirmish | wrong drawing hangs here (#10 does) | **`masters/Nalle Drawings/2. Sketch of 1st and State Street Skirmish.jpg`** — Wil's file, at his direction |
| 3 | The Altruist | The Altruist | **already correct** (`sketch-pt2`, d=19) | nothing to do |
| 4 | Charles Learning How to Read & Write | Harriet Scattering Tidings of the Event | **already correct** (`mansion/sketch`, d=8) | nothing to do |
| 5 | Don't Let Them Have Him! | Don't Let Them Have Him! | likely already correct (`ferry/sketch`, d=22 — **verify by eye**) | site tier if same; else Wil #5 |
| 6 | Nalle Crossing The Hudson | Nalle on The Hudson | none | `masters/Priest Series Page/Nalle Crossing the Hudson (pen, 2007).jpg` (1920², **d=0 vs Wil #6**) — crop label bars |
| 7 | Ferry Crossing | Escape to West Troy | none | `…/Escape to West Troy (pen, 2007).jpg` (1920², d=6) — crop label bars |
| 8 | West Troy | Nalle Gets in The Wagon | **already correct** (`barbershop/sketch`, d=4) | nothing to do |
| 9 | Rushing the Room | Sketch of Rushing the Room | none | `…/Martin Struck by Deputy Sheriff Morrison (pen, 2008).jpg` (1920²; file name is the series page's mis-caption — the ARTWORK is Rushing the Room, per the artist's burned-in label and Wil's map) |
| 10 | Martin Felled by Axe | Sketch of Martin Felled by Axe | hangs on ch2 today (`commissioners-office/sketch`, d=11) → **moves** to `barbershop/narrative2` | reuse the existing 1440 tier |

**#2's source — settled 8/26 by Wil, build it, do not re-raise.** Use
`masters/Nalle Drawings/2. Sketch of 1st and State Street Skirmish.jpg`.

For the record, because it will look different from its nine neighbours and
someone will ask why: this file has been through an upscaler that smoothed the
pen work into soft pseudo-relief. Measured as the variance of the Laplacian at
1000px wide, its line-work energy is **1,777** against **19,917-52,544** for
the other nine drawings in the folder. It was flagged twice and Wil reviewed
the image himself and directed its use — his art, his call. Build it.

Two things that follow, neither of them a re-litigation:

- **Do not sharpen, denoise, or "restore" it.** Ship what he gave. The one
  thing that genuinely helps is the scale it is served at: downscaling to the
  hall's 800w recovers apparent crispness, so build the 800 tier from the
  1200px original and let it be.
- **Cap the chapter-page 1440 tier at 800w** with honest descriptors, as with
  every other 1200px source here — never upscale.

If he changes his mind at review, the switch is one line: build from
`masters/Priest Series Page/The Struggle (pen).jpg` (800x659, clean pen, same
scene) instead. Note in the review guide which source shipped.

Resolution rule: **studies are NOT part of the paintings' 3:2 re-frame** — they
hang at their own aspect, so prefer the fullest artwork over Wil's 3:2 crop,
and prefer the highest-pixel source of the same drawing. Wil's files are all
1200×800; never build a 1440 tier by upscaling — cap the srcset at what
exists and keep the descriptors honest (the hall reads the 800 WebP anyway,
`paintings.astro:127`; chapter pages read the 1440 JPG).

Consequences to carry through:

- `paintings.astro:98-99` `studyKeyOf` becomes data-driven per work (narratives
  can now carry studies); new media keys + `scripts/build-media.mjs` MANIFEST
  entries; `media.images[]` arrays updated.
- Chapter pages follow the same reassignment (`scenes[].reveal.sketch`,
  `[chapter].astro:616-641`): ch2 Part 1's Moral study becomes the new #2
  drawing; ch2 loses #10 to the barbershop.
- `ferry/moral-1440.jpg` is BUILT FROM the ferry drawing
  (`[chapter].astro:76-80`) — regenerate it if §2 changes which drawing that is.
- `sketchNote` captions: the ch2 Pt 1 note (`commissioners-office.json:11`,
  the "one diagonal" text) describes the drawing that is moving — move the note
  with it. Draft NEW notes in the same curatorial voice for every newly-hung
  study (#6, #7, #9, and #2's replacement). Queue all new/moved notes for Wil
  in the review guide; log provenance.
- Alt text "Study for …" strings switch to the painting titles.

## 3 · The fourteen numbered items

Each: what Wil asked → current state (file:line, verified) → the change → verify.

**3.1 — Map page pitch: more 3-D presence on desktop (and possibly tablet); mobile exactly as is.**
The pitch was NEVER removed: `PITCHES = [52,48,44,40,36,33]`
(`src/components/TroyMap.tsx:56`) is unchanged since the root commit; measured
52° at 768/1024/1440/1920 (`docs/v7/qa/final/walk/walk.md`). What CAN read as
flattened: the 3.5s prologue eases out of pitch 0 (`TroyMap.tsx:770`, `:995`),
v11 zoomed desktop out 0.19 (bottom padding 140→240, `41b19d8`), and the
no-fit fallback is pitch 33 (`:636`). The change: give the ≥640-wide branch
(`:596-634`) a tastefully deeper settled camera — try steeper first entries in
that branch's search (e.g. 56-58 before 52) while the label-safe box still fits
all five pills; keep bearing 16. Update the gate (`scripts/walk-check.mjs:168`,
currently fails ≥1024 under pitch 40) to the new floor. Phone branch
(`:510-595`) byte-untouched. Verify: stub camera probe at 768/1024/1440/1920 —
pitch above today's, pills inside the safe box, convergence holds;
before/after screenshots for Wil.

**3.2 — Chapter cards: equal horizontal spacing — DESKTOP ONLY.**
Root cause found: the keen-slider layout gap is constant (12px base / 16px
≥640, `TroyMap.tsx:1104-1107`) but the focus-scale transform
(`CARD_FOCUS = 0.08` `:105`; `detailsChanged` `:1144-1183`) anchors each
neighbour's shrink to the edge nearest the centre, so at rest the visible gaps
are ~16 vs ~57px at ≥1024. Keep the 1.00/0.92 scale idiom and card sizes
exactly; equalize the VISIBLE gaps by compensating each slide's translateX for
the scale it and its inboard neighbours gave up (accumulated, signed toward the
centre), in the same rAF write — **gated to ≥1024 so tablet and phone keep
today's behaviour byte-for-byte.** Verify with a DOM probe: settled gap between
every adjacent pair equal ±1px at 1280/1440/1920, scale still 1.000/0.920, and
**unchanged** numbers at 390/768/834.

**3.3 — 1858 lens: default view matches Wil's screenshot; more caption/button air.**
Today the lens opens leaned-in: `s0 = max(lensMinScale(), panelFit*1.3, 1.8)`,
`startCx = .58 (.52 phones)`, `startCy = .74` (`TroyMap.tsx:280-286`). Wil's
screenshot is the FULL-WIDTH plate — river band across the middle, sheet
numerals visible up top. Change: default becomes the cover fit
(`s0 = lensMinScale()`), `startCx = 0.5`, `startCy ≈ 0.5` tuned to the
screenshot's band, all breakpoints (phone keeps its credit-line wrap rules).
"Without losing image quality": regenerate the full tier from the
23000×19267 JP2 master (`masters/Stills/Historical/6. 1858 Map of Troy New
York.jp2`) at ~6-8k wide (AVIF+WebP; `apt-get install libopenjp2-tools` then
`opj_decompress -r N` for a memory-safe reduced decode; keep the served AVIF in
the low-single-MB range and update `PLATE = 3431/4096` if the aspect shifts).
Spacing: plate→caption `mt-5` (`:1414`) and caption→button `mt-4` (`:1428`)
both grow (try 28-32px and 24px) so caption/button/bottom-inset read balanced;
check against `--ui-inset` 20/40/56. Verify by screenshot against his crop at
1440 and 390.

**3.4 — Quote section: desktop left/left-aligned; mobile+tablet centered block, left text.**
VERIFY-FIRST item. The desktop regression was already fixed once: `38c7dad`
centred it everywhere, `de29ade` (v10.1) re-scoped centring to
`@media (max-width: 1023px)` (`[chapter].astro:906-915`) — at ≥1024 the hook is
a plain left-set 9fr grid item today, which is what Wil asks for. Probe all
five chapters at 390/768/834/1024/1280/1440: hook block position + text-align
against spec (≥1024 left-set left-aligned; ≤1023 block centred, text left — his
"chapter 3 mobile" is the reference). If HEAD already satisfies it, record the
probe as evidence, mark no-op, and tell Wil which deploy to re-check. Touch
NOTHING in `ChapterSpine.astro`.

**3.5 — Historical-context plate (the interlude): show more, light ground, scroll ease, feathered seams.**
File: `[chapter].astro:478-520`; fade: `global.css:1006-1024`. Current: fixed
`h-[62vh] md:h-[80vh]` crop boxes over 3:2 plates (mansion's is 16:9);
`.interlude-fade` is fully-opaque `--ground-light` CREAM at both 0% and 100% —
against the DARK section above (`#1d1411`) that top edge is the harsh line Wil
sees. (v8's V8-205 chose cream fade for ch2's `troy-1858` interlude only, dark
for photo interludes; the v11 ramp rewrite `6754456` made all edges cream —
restore the per-neighbour grounds.) The change, all breakpoints: (a) the top
fade blends into the ACTUAL ground above (dark for the four photo chapters,
cream for ch2), the bottom into the cream `#history` below; (b) extend the
eased ramps so more plate shows through the blend, and let the plate show more
of its top/bottom (grow the boxes a step, e.g. 68vh/86vh, or cap by plate
aspect so 3:2 plates crop less); (c) loading ground: reproduce the black flash
(throttled reload) — the section already paints `--ground-light`
(`global.css:1003-1005`), so find the real black source (suspects: the missing
`commissioners-office/troy-1858-1440.webp` — **the srcset names a file that is
not on disk**; the lazy `historical.mp4` poster window on ch2; GSAP scale
overflow exposing body ground) and make whatever paints during load cream;
(d) scroll: keep the scrub but make it felt — image eases in and grows
(~1.00→1.06) entering, reverses leaving, restrained; reduced-motion shows the
static uncropped state (IO/GSAP already gated at `[chapter].astro:750`).
Verify per chapter at 390/768/1440 + an RM pass.

**3.6 — Ch2 Moral Pt 1 bottom spacing (desktop unbalanced).**
Cause: every moral closes with a flat 64px (`pb-16 md:pb-16`,
`[chapter].astro:598`); in the four single-moral chapters the next section adds
`--space-section` (200px desktop), but on ch2 Moral Pt 1 the Part-2 hero
follows with ZERO margin (`:361`) — 64px below against 288px above. Give the
moral→hero-2 seam real air at every breakpoint where the imbalance shows (e.g.
bottom padding stepping 96/128/160, or a margin on the hero-2 side — pick what
reads balanced against his screenshot). Verify: measured above:below ratio at
390/768/1440 plus eyeball shots.

**3.7 — Painting titles + studies** → §1 and §2. Plus the hang fix: the last
painting (*Martin Felled by Axe*, the only portrait work) hangs 400mm lower
than every other frame — `yC = 1.6` vs 1.7 with h = 2.6 (`Museum.tsx:588`,
`:595`). Raise the portrait `yC` so its frame bottom sits in family with the
landscape works (frame bottom ≈0.53m ⇒ `yC ≈ 2.0` desktop; on phones
`CEIL_Y = 3.2` — h 2.3 tops out at 3.15 + 0.17 frame, so verify and shave h if
the frame kisses the ceiling). Wil: "vertically centered on wall, just move it
up a bit higher so it is not hung on the floor." Verify: museum-check
composition + oblique shots in both orientations.

**3.8 — Home page desktop image is low-res. ROOT CAUSE FOUND — no new asset needed.**
Wil confirms 1080×1920 is the highest still he has, and the splash master is
only 800×1200 — but that is not what ships. On desktop with motion allowed the
page plays **`public/media/site/splash.mp4` at 480×720** (`index.astro:27-37`),
upscaled ~3× on a 1440-tall display; the still poster is the 800×1422 file
(`index.astro:15`, `:31-32`), while the 1080×1920 file on disk is served only
to reduced-motion users (`:43-55`). Two changes, both from assets already in
the repo: (a) poster + preload become `home-bg-1440.avif` (1080×1920) at
≥768; (b) re-encode `splash.mp4` from
`masters/CNWM - Animated Images/Splash Page Image.mp4` (800×1200, 4.4 Mb/s)
at 800×1200 — a 67% linear gain — targeting roughly 0.9-1.4 MB for the 8s loop
(it is lazy-loaded after `window.load`, `Base.astro:305-353`, so it is a
bandwidth not an LCP cost; hold the perf budget and say what it cost).
ffmpeg is available — see §6. Keep filter, framing and behaviour identical
(`index.astro:27-65`). Also fix the descriptor comment at `:39-42`, which now
overstates what is missing.

**3.9 — Mobile Moral top/bottom too big.**
Mobile moral = 72px beat margin + 128px pt / 64px pb (`global.css:611-613`,
`[chapter].astro:598`) vs History's 96/96 (`:525`). On <768 only: bring the
moral's effective top/bottom air to the History section's rhythm or slightly
more (e.g. pt-24/pb-24, with the beat margin supplying the "slightly more").
Desktop/tablet unchanged (except 3.6). All five chapters. Verify: measured
paddings + shots at 390.

**3.10 — Ch4 hero: Tubman's face cut off on the right (mobile).**
`ferry.json:11` `heroFocus: 50` (scalar → portrait `50% 50%`,
`[chapter].astro:233-236`, `global.css:1652-1654`). Raise `portraitX` toward
100 (barbershop already ships `portraitX: 100`) until both Charles and Tubman
sit in frame at 360/390/430 portrait; keep landscape at 50. Mirror the value
onto the portrait `<video>` inline object-position (`[chapter].astro:302-311`).
Verify by screenshot at three phone widths.

**3.11 — Hall chip (mobile): centered under Skip, above the arch.**
Today the phone chip sits at `bottom: calc(var(--ui-inset)+44px)`
(`Museum.tsx:1634`). Mobile (<640) only: move it to the TOP, horizontally
centred (it already is), vertically centred between Skip's bottom edge (`Skip`
at `top: var(--ui-inset)+safe-top`, 40px tall, `:1677-1697`) and the on-screen
top of the end-of-hall arch. Compute the arch apex's screen Y once per layout
(project world point x=0, y≈2.95, z=endZ at the resting entry camera — the
scene already exposes what `layout()` needs) and set a CSS var; fall back to a
tuned constant if the projection is unstable. Tablet/desktop chip untouched.
Verify at 360/390/430: chip centred in that band, no overlap with Skip or the
arch, and the Face-forward swap lands in the same spot.

**3.12 — Indicator dots: bottom-anchored like the map cards; hidden while a painting is open.**
Dots today rest at `calc(var(--ui-inset)+4px)` and NEVER hide in approach — on
phones they ride above the drawer (`Museum.tsx:1859-1899`, follower
`:1377-1386`). Change, all devices: (a) rest bottom margin ≡ the map rail's
`pb-[var(--ui-inset)]` (`TroyMap.tsx:1583`) — drop the +4px; (b) in approach
the dots fade OUT (house `--dur-fast` fade), and the sheet-follower logic goes
with them; check `layout()`'s DOTS_H/DOT_GAP reserve so the drawer can reclaim
that space without a recompose glitch; (c) re-land the dot-rail robustness fix
the v11.3 revert removed — never clear the inline `bottom` to `""` without a
CSS fallback (v11.3 set the explicit resting value, and made the canvas
`position:absolute; inset:0` so it can never push the rail into flow). Wil's
"remain visible and be positioned at the bottom" cannot hold through viewport
changes without (c). Verify: rail position at rest / walking / approach-open /
after a mid-session viewport resize, both orientations, plus dots gone while a
painting is open.

**3.13 — Drawer outline stroke.**
Phone sheet: only `border-top` exists, so `border-radius: 16px 16px 0 0` tapers
the stroke to nothing around the top corners (`global.css:1680-1686`) — give
the sheet left/right (and top) borders so the arc is stroked; keep the bottom
open. Desktop card: NO border by design since v8 (`Museum.tsx:1735-1743`;
`.museum-card` has no CSS rule anywhere) — add the same 1px
`--color-primary-7` stroke, rounded 12px; tablet uses both paths, check each
orientation. Log the reversal of v8's "no border" call in
`docs/v4/DECISIONS.md`. Verify: stroke continuous around every visible corner
at 390/768/1024/1440.

**3.14 — Drawer close (X) choreography (mobile).**
Today the X renders whenever the sheet exists, peek included
(`Museum.tsx:1810-1827` — v10's V10-07 "present at all times"; Wil reverses
that, log it in DECISIONS). New mobile state machine over the existing
`peek/full` + `sheetPos` machinery (`:113-160`, wheel `:990-1041`, drag
`:1575-1607`, swipe `:890-935`):
- X hidden at peek; it appears (centred at the top of the sheet, where it
  already lives) once the user has opened toward FULL — "after the user scrolls
  down to review more of the drawer's content".
- Tapping X hides the drawer COMPLETELY (new `hidden` state, translated fully
  off, `aria-hidden`, focus returned to the stage; Back-to-the-hall and Esc
  still work).
- From `hidden`, still viewing the painting: the first downward scroll/swipe
  returns the PEEK preview; the second opens FULL with all content and the X
  centred at top. Wheel latch (160ms) and velocity thresholds stay as-is.
Keyboard/SR parity: the header stays reachable, state changes announced through
the existing semantics, zoom-above-floor wheel ownership unchanged. Desktop
card unchanged. Verify on 390 and a portrait tablet (the sheet gates on
portrait UI): the full cycle open→X→hidden→scroll→peek→scroll→full→X, plus an
axe pass.

**3.15 — Re-frame the paintings to the masters' 3:2 — STILLS ONLY; the videos are already 3:2.**
Measured 8/26 with ffmpeg: **every served hall video is already 1200×800 (3:2)
and matches its master 1:1**; `barbershop/narrative2` is 800×1200 (2:3) and its
master is 2:3 too — that work is genuinely portrait and stays portrait (it is
also the one being raised on the wall, §3.7). So the alive layer needs no
re-encode and Wil needs to re-export nothing. What is off-canon is the STILLS:
six of the ten are 16:9 crops (`bakery/horizontal`,
`commissioners-office/horizontal`, `…/horizontal-pt2`, `ferry/horizontal`,
`ferry/narrative1`, `ferry/narrative2`); three are already 3:2
(`mansion/horizontal`, `barbershop/horizontal`, `barbershop/narrative1`).
Today those six stills disagree with the 3:2 video that plays in the same
frame — the re-frame FIXES an existing mismatch rather than creating one.
Rebuild the six from `masters/Stills/Paintings/` (2400×1600 natives; delivery
naming per `masters/README.md`) through `scripts/build-media.mjs`.
`paintings.astro` reads aspect from disk, so the hall re-hangs itself — re-check
the `maxW` clamps (`Museum.tsx:590-594`) and the museum-check composition bars
afterwards. The 2-D grid on `/paintings` and any chapter-page use of these keys
inherit the new crop: look at every one before committing.

**3.16 — Landscape-phone map framing (LAST).**
844×390 falls off the phone search at `ZOOM_FLOOR = 14.2` (`TroyMap.tsx:548`)
and takes the blind 15.25/33 fallback (`:636`) — three stops off-screen
(documented: `docs/v10/REVIEW-GUIDE.md:109-112` names zoom **13.30**). Add a
landscape-phone branch (the codebase already keys on `h < 560`) whose floor
reaches 13.30 so the search converges instead of falling back; portrait phones
and desktop untouched; re-run the stub camera matrix including 844×390 and
667×375, plus the walk-check gates. Do this only after 3.1 so the deeper
desktop pitch and this share one final verification pass.

**3.17 — iOS browser-bar tint (v11.2 follow-through; Wil: "still dark brown or black").**
The mechanism is the runtime sampler + `color-scheme: dark` + static `#1d1411`
(`Base.astro:72`, `:88-199`; `global.css:275-280`;
`docs/v11/REVIEW-GUIDE-v11.2.md`). The chrome is UNOBSERVABLE in this container
— do not claim a fix from here. Steps: (a) re-verify the preconditions on the
production build via `npm run qa:bleed` (against `astro preview`, never `dev` —
the dev toolbar poisons bottom-edge sampling); (b) research current-iOS
`theme-color` handling (WebSearch is available; iOS Safari tinting has changed
across recent majors); (c) likely suspects in order — the user-level "Allow
Website Tinting" toggle, an iOS version that no longer honours `theme-color`
in-tab, Safari clamping near-black tints, or dynamic writes being ignored after
load; if research points at the last, try a static per-page `theme-color`
matching each page's dominant edge as a degradation path; (d) whatever changes,
Wil's device test is the only real gate — put the exact expected colour per
page and scroll position in the review guide with the 2-minute checklist.
Expected behaviour stays v11.2's: the bar takes the colour of the ground that
touches it.

## 4 · Human queue — NOTHING BLOCKS THIS ROUND

Every earlier manual item is closed. Start and finish the round without waiting
on Wil for anything.

1. **Post-deploy, human-only:** the iPhone browser-bar check (§3.17). The tint
   cannot be observed in this container at all, so this is the only way to
   confirm that item. Put the protocol in the review guide: force-quit Safari,
   open the live GH Pages URL, and report the bar colour on `/` , on
   `/commissioners-office` scrolled into the cream Historical Context section,
   and on `/map`; plus the iOS version and the Safari "Allow Website Tinting"
   state. Everything else in §3.17 ships on best-known implementation whether or
   not that report comes back.
2. **Optional, any time:** if Wil ever finds an un-upscaled scan of the
   1st-and-State-Street drawing, it drops into `masters/Nalle Drawings/` and
   the study rebuilds from it. Not needed — §2 ships his current file at his
   direction.
3. *(Closed 8/26)* High-res home source — not needed; §3.8 is fixed from assets
   already in the repo.
4. *(Closed 8/26)* 3:2 animation re-exports — not needed; the videos are
   already 3:2 (§3.15).

## 5 · Wil's answers (8/26) — all questions closed

1. **Card gaps: desktop only.** Tablet and phone untouched.
2. **Titles: his map is final** — the strings in §1 are verbatim from it,
   punctuation included. Closed; do not re-ask.
3. **Studies:** his `masters/Nalle Drawings/` map governs (§2) — every earlier
   default is superseded.
4. **Bugs:** "Do not bring back any bugs, eliminate all bugs on the paintings
   hall / museum page so it has perfect performance on mobile, tablet, and
   desktop." This authorises the tilt-recovery fix (`away` test gains
   `|dragPitch| > 0.12`, `Museum.tsx:1388`) alongside §3.12(c), **and** it sets
   the bar for the round: hunt the hall's remaining defects, do not merely land
   the fourteen. Sweep at least: pointer/wheel/pinch edge cases, resize and
   orientation changes mid-approach, the video lifecycle (`:1128-1160`), focus
   order and Esc, reduced-motion, 375px, and the QA harness's own gates.

## 6 · Order of work, and the gates

Suggested order: audit → §1/§2 canon → hall (3.7 hang, 3.11, 3.12, 3.13, 3.14)
→ 3.15 reframe → hall bug sweep (§5.4) → map (3.1, 3.2, 3.3) → chapters (3.4,
3.5, 3.6, 3.9, 3.10) → 3.8 home → 3.17 chrome → LAST 3.16 landscape → full
instrument pass → review guide.

Gates, per the house protocol (atomic: implement → measure → commit →
RUN-STATE; push ≤3 commits; deploys fire from `v2` only, mirror to the
session's designated branch): `npm run check` + `npm run build`; `qa:rag`,
`qa:a11y` (incl. RM + zoom200), `qa:contrast`, `qa:museum` (update its
composition bars for the new aspects and `yC`), map geometry via the stub probe
(api.mapbox.com is proxy-blocked — RUN-STATE documents the stub), `qa:bleed`
against `astro preview`, perf on the production preview only.

**Container facts, verified 8/26:**

- `npm install` first — a fresh container has no `node_modules`, and
  `paintings.astro` needs `sharp` at build time (it works once installed).
- **ffmpeg IS available**: `npm i --prefix <scratchpad>/tools ffmpeg-static`
  downloads a working static build through the proxy. Install it OUTSIDE the
  project — a later `npm i` in the repo prunes an unsaved dep and deletes the
  binary. Probe with `-nostdin`, or a `while read` loop over filenames will eat
  its own input and return nothing.
- `identify` (ImageMagick) is absent — use `file`, `sharp`, or ffmpeg.
- Playwright's browser is pre-installed at `/opt/pw-browsers` (no `qa:setup`).
- The live site cannot be curled — verify live = HEAD via the deploy Action for
  the pushed SHA.
- Editing an island's source stales Vite deps: restart `astro dev` before
  debugging hydration.

Non-negotiables: every animation keeps a reduced-motion variant; keyboard
reaches everything with visible focus; 375px floor; tap targets ≥24px;
`withBase()` for every URL; no scroll-jacking; Lighthouse mobile ≥90 perf /
≥95 a11y, LCP <2.5s throttled. End with a short review guide and the human
queue.
