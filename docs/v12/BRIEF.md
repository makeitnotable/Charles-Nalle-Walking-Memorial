# v12 BRIEF — Wil's 8/25 round (fourteen points + the hall canon)

*Prepared 2026-08-25 from Wil's feedback message, his answers to the v11
questions, his screenshots, and the full series-page PDF. Everything below was
verified against HEAD `7fce137` (= `origin/v2`, the full v11.3 revert). This is
the work order; Wil's answers to the open questions in §5 arrive pasted into
the kickoff prompt. RUN-STATE stays the live ledger; audit into
`docs/v12/AUDIT.md` before editing anything.*

**Scope guardrails, from Wil verbatim-adjacent:**

- The hall must end this round with "perfect performance across all devices.
  Do not reintroduce any bugs and do not make any changes other than those
  that I request."
- "Take the walk" (the map door/pill): leave exactly as is (his Q7).
- The `(01) LISTEN … (06) ONWARD` spine column: untouched (his point 4).
- Map page on mobile: camera/framing stays exactly as it is (point 1), except
  the landscape item (§3.16), which is sequenced LAST.
- Chapter cards: the ONE change is equal horizontal spacing; nothing else
  about the cards changes at any breakpoint (point 2).
- Kathy Sheehan's prose untouchable, naming canon (`docs/v4/NAMING-CANON.md`)
  governs LOCATION names — the new painting titles are a separate field, they
  replace nothing in `name.*`.

---

## 1 · The canon: official painting titles (point 7, decided)

Wil's list is authoritative for the labels. Exact strings (typos in his message
corrected only where marked):

| # | slug / key | official title (label text) |
|---|---|---|
| 0 | `bakery/horizontal` | Bakery Abduction |
| 1 | `commissioners-office/horizontal` | 1st and State Street Skirmish |
| 2 | `commissioners-office/horizontal-pt2` | The Altruist |
| 3 | `mansion/horizontal` | Charles Learning How to Read & Write |
| 4 | `ferry/horizontal` | Don't Let Them Have Him |
| 5 | `ferry/narrative1` | Nalle Crossing The Hudson |
| 6 | `ferry/narrative2` | Ferry Crossing |
| 7 | `barbershop/horizontal` | West Troy |
| 8 | `barbershop/narrative1` | Rushing the Room |
| 9 | `barbershop/narrative2` | Martin Felled by Axe |

Series-page deltas, for the record (Wil's strings win; two are flagged in §5
for his optional polish): the artist's page has "1st & State Street",
"Don't Let Them Have Him!" (exclamation), "Nalle – Rushing the Room", and
"Martin Struck by Deputy Sheriff Morrison" for #9. #3 and #7 are not on the
series page at all — the titles are Wil's, treat them as from the artist.

**Where titles go.** Add a per-work title field to chapter JSON (schema in
`src/content.config.ts:50-151`; e.g. `media.workTitles: { horizontal: "…",
narrative1: "…" }`) — content lives in JSON, not in `paintings.astro`
literals. Then in `src/pages/paintings.astro`: retire `KEY_TITLES`'s
location-based composition (`:48-53`, `:76-78`) and `PLAQUE_VARIANTS`
(`:58-60`); `title`, plaque `name`, grid captions, dot/counter aria all use the
official title. The hall plaque (`src/components/Museum.tsx:1727-1773` desktop,
`:1831-1840` sheet) keeps the `Location NN` eyebrow and renders the official
title as the line beneath it; the `variant` second line disappears (titles are
unique now). LOCATION names everywhere else (map, chapters, nav) unchanged.

## 2 · The canon: studies (point 7 + his Q4 answer)

Sources now staged in **`masters/Priest Series Page/`** (nine pen plates
extracted at full embedded resolution from the series-page PDF, with a
provenance README — read it; it records the one caption/label conflict and its
by-picture resolution). No studies exist in `masters/Stills/`.

| work | study | action |
|---|---|---|
| Bakery Abduction | *Captured at Holeur's Fashionable Bakery* = current `bakery/sketch` | none — correct today |
| 1st and State Street Skirmish | ***The Struggle*** (`masters/Priest Series Page/The Struggle (pen).jpg`, 800×659) | NEW — replaces the current `commissioners-office/sketch` tiers. Same wide State-Street melee: portico left, brownstone row right. Source is 800w: build the 800 tier, do NOT upscale to 1440 — cap the srcset at what exists |
| The Altruist | current `sketch-pt2` | none — correct today |
| Charles Learning How to Read & Write | current `mansion/sketch` (genteel street before the mansion) | KEEP unless Wil says otherwise (§5 Q3) — the only delivered Gilbert-Home drawing |
| Don't Let Them Have Him | the drawing currently serving as `commissioners-office/sketch` IS this painting's study (*Don't Let Them Have Him!*, pen, 2008) | MOVE the existing 1440-quality tiers to `ferry/sketch` (higher quality than the 800² PDF plate; the plate is provenance/backup) |
| Nalle Crossing The Hudson | *Nalle Crossing the Hudson* pen (`…/Nalle Crossing the Hudson (pen, 2007).jpg`, 1920², burned label bars top — crop to artwork) | NEW — narrative works get studies for the first time |
| Ferry Crossing | *Ferry Crossing* pen (`…/Ferry Crossing (pen, 2008).jpg`, 800×583) | NEW (800w cap, as above) |
| West Troy | current `barbershop/sketch` (figures dragging a man past a cart — scene-matches the West Troy street) | KEEP unless Wil says otherwise (§5 Q3; the alternative is the *Escape to West Troy* pen, a rowboat scene) |
| Rushing the Room | **none exists anywhere** (the pen burned-in as "Rushing the Room" is by picture the Martin study — README) | hang NO study for it this round; Wil is asking Mark Priest (§5 Q3) |
| Martin Felled by Axe | *Martin Struck by Deputy Sheriff Morrison* pen (`…/Martin Struck by Deputy Sheriff Morrison (pen, 2008).jpg`, 1920², crop label bars) | NEW |

Consequences to carry through:

- `src/pages/paintings.astro:98-99` `studyKeyOf` becomes data-driven per work
  (narratives can now carry studies); new media keys + `scripts/build-media.mjs`
  MANIFEST entries for the new tiers; `media.images[]` arrays updated.
- Chapter pages follow the same reassignment (`scenes[].reveal.sketch`,
  `[chapter].astro:616-641`): ch2 Part 1's Moral study becomes *The Struggle*;
  the ferry chapter's becomes *Don't Let Them Have Him*.
- The displaced drawing now at `ferry/sketch` (dense close-in cobblestone
  brawl) retires from the site unless Wil identifies it (§5 Q3).
- `ferry/moral-1440.jpg` is BUILT FROM the old ferry drawing
  (`[chapter].astro:76-80`) — regenerate the moral ground from the new ferry
  study so the Moral section matches its own study.
- `sketchNote` captions: the ch2 Pt 1 note (the "one diagonal" text,
  `commissioners-office.json:11`) describes the *Don't Let Them Have Him*
  drawing → it moves with the drawing to the ferry chapter. Draft NEW notes in
  the same curatorial voice for: The Struggle, Nalle Crossing the Hudson pen,
  Ferry Crossing pen, Martin pen. Queue all new/moved notes for Wil's review
  in the review guide (they are curatorial copy, not Kathy's narrative — log
  the provenance anyway).
- Alt text "Study for …" strings switch to painting titles.

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
the search for that branch (e.g. 56–58 before 52) while the label-safe box
still fits all five pills; keep bearing 16. Update the gate
(`scripts/walk-check.mjs:168`, currently `pitch < 40` fails ≥1024) to the new
floor. Phone branch (`:510-595`) byte-untouched. Verify: stub-style camera
probe at 768/1024/1440/1920 — pitch above today's, pills inside the safe box,
convergence still holds; before/after screenshots for Wil.

**3.2 — Chapter cards: equal horizontal spacing, all breakpoints; nothing else.**
Root cause found: keen-slider layout gap is constant (12px base / 16px ≥640,
`TroyMap.tsx:1104-1107`) but the focus-scale transform (`CARD_FOCUS = 0.08`
`:105`; `detailsChanged` `:1144-1183`) anchors each neighbour's shrink to the
edge nearest the centre, so at rest the visual gaps are ~12 vs ~38px on
phones, ~16 vs ~57px at ≥1024. The change: keep the 1.00/0.92 scale idiom and
card sizes exactly; equalize the VISIBLE gaps by compensating each slide's
translateX for the scale it and its inboard neighbours gave up (accumulated,
signed toward the centre), in the same rAF write. Verify with a DOM probe:
settled gap between every adjacent card pair equal ±1px at 390/768/1440, and
scale still 1.000/0.920.

**3.3 — 1858 lens: default view matches Wil's screenshot; more caption/button air.**
Today the lens opens leaned-in: `s0 = max(lensMinScale(), panelFit*1.3, 1.8)`,
`startCx = .58 (.52 phones)`, `startCy = .74` (`TroyMap.tsx:280-286`). Wil's
screenshot is the FULL-WIDTH plate — river band across the middle, the sheet
numerals visible up top. Change: default becomes the cover fit
(`s0 = lensMinScale()`), `startCx = 0.5`, `startCy ≈ 0.5` tuned to the
screenshot's band, all breakpoints (phone keeps its credit-line wrap rules).
"Without losing image quality": regenerate the full tier from the 23000×19267
JP2 master (`masters/Stills/Historical/6. 1858 Map of Troy New York.jp2`) at
~6-8k wide (AVIF+WebP; `apt-get install libopenjp2-tools` then
`opj_decompress -r N` for a memory-safe reduced decode; keep the served AVIF
in the low-single-MB range and update `PLATE` aspect if it changes from
3431/4096). Spacing: plate→caption `mt-5` (`:1414`) and caption→button `mt-4`
(`:1428`) both grow (try 28-32px and 24px) so caption/button/bottom-inset read
balanced; check against `--ui-inset` 20/40/56. Verify by screenshot against
his crop at 1440 and 390.

**3.4 — Quote section: desktop left/left-aligned; mobile+tablet centered block, left text.**
VERIFY-FIRST item. The desktop regression was already fixed once: `38c7dad`
centred it everywhere, `de29ade` (v10.1) re-scoped centring to
`@media (max-width: 1023px)` (`[chapter].astro:906-915`) — at ≥1024 the hook
is a plain left-set 9fr grid item today, which is what Wil asks for. Probe all
five chapters at 390/768/834/1024/1280/1440: hook block position + text-align
vs spec (≥1024 left-set left-aligned; ≤1023 block centered, text left — his
"chapter 3 mobile" is the reference). If HEAD already satisfies it, record the
probe as evidence, mark no-op, and tell Wil what deploy to re-check. Touch
NOTHING in `ChapterSpine.astro`.

**3.5 — Historical-context plate (the interlude): show more, light ground, scroll ease, feathered seams.**
File: `[chapter].astro:478-520`; fade: `global.css:1006-1024`. Current: fixed
`h-[62vh] md:h-[80vh]` crop boxes over 3:2 plates (mansion's is 16:9);
`.interlude-fade` is fully-opaque `--ground-light` CREAM at both 0% and 100% —
against the DARK section above (`#1d1411`) that top edge is the harsh line Wil
sees. (v8's V8-205 decision was cream fade for the ch2 `troy-1858` interlude
only, dark for photo interludes; the v11 ramp rewrite `6754456` made all edges
cream — restore the per-neighbour grounds.) The change, all breakpoints:
(a) top fade blends into the ACTUAL ground above (dark for the four photo
chapters, cream for ch2), bottom fade into the cream `#history` below;
(b) extend the eased ramps so more plate shows through the blend, and let the
plate show more of its top/bottom (grow the boxes a step, e.g. 68vh/86vh, or
cap by plate aspect so 3:2 plates crop less); (c) loading ground: reproduce
the black flash (throttled reload) — the section already paints
`--ground-light` (`global.css:1003-1005`), so find the actual black source
(suspects: the missing `commissioners-office/troy-1858-1440.webp` — the srcset
names a file that is NOT on disk, fix the tier; the lazy `historical.mp4`
poster window on ch2; GSAP scale overflow exposing body ground) and make
whatever paints during load cream; (d) scroll: keep scrub but make it felt —
image eases in and grows (~1.00→1.06) entering, reverses leaving, restrained,
`prefers-reduced-motion` shows the static uncropped state (IO/GSAP already
gated at `[chapter].astro:750`). Verify per chapter at 390/768/1440 + RM pass.

**3.6 — Ch2 Moral Pt 1 bottom spacing (desktop unbalanced).**
Cause: every moral closes with a flat 64px (`pb-16 md:pb-16`,
`[chapter].astro:598`); in the four single-moral chapters the next section
adds `--space-section` (200px desktop) but on ch2 Moral Pt 1 the Part-2 hero
follows with ZERO margin (`:361`) — so 64px total against 288px above it. Give
the moral→hero-2 seam real air at every breakpoint where the imbalance shows
(e.g. bottom padding stepping 96/128/160, or a margin on the hero-2 side —
pick what reads balanced against his screenshot). Verify: measured
above:below ratio at 390/768/1440 plus eyeball shots.

**3.7 — Painting titles + studies** → §1 and §2. Plus the hang fix: the LAST
painting ("Martin Felled by Axe", the only portrait) hangs 400mm lower than
every other frame — `yC = 1.6` vs 1.7 with h = 2.6 (`Museum.tsx:588`, `:595`).
Raise the portrait `yC` so its frame bottom sits in family with the landscape
works (frame bottom ≈0.53m ⇒ `yC ≈ 2.0` desktop; phone `CEIL_Y = 3.2`
headroom: h 2.3 tops out at 3.15+0.17 frame — verify, shave h if the frame
kisses the ceiling). Wil: "vertically centered on wall, just move it up a bit
higher so it is not hung on the floor." Verify: museum-check composition +
oblique shots both orientations.

**3.8 — Home page desktop image is low-res.**
Confirmed: desktop serves `home-bg-1440.avif` which is really 1080×1920
(`index.astro:39-48`); the painting is *Drop Him!, Catch Him!* and it is NOT
among the 47 files in `masters/` (agents verified) — the ≥2160-wide master
Wil believes he uploaded is not in the repo. §4 manual step asks him for it.
When it lands in `masters/`: rebuild the `home-bg` ladder (add a real 2160
tier, honest descriptors), keep filter/framing/behavior identical
(`index.astro:27-65`). If Wil cannot supply one, fallback: the PDF's plate of
that painting is only 1024² — NOT an upgrade; say so and leave the item open.

**3.9 — Mobile Moral top/bottom too big.**
Mobile moral = 72px beat margin + 128px pt / 64px pb (`global.css:611-613`,
`[chapter].astro:598`) vs History's 96/96 (`:525`). On <768 only: bring the
moral's effective top/bottom air to the History section's rhythm or slightly
more (e.g. pt-24/pb-24 with the beat margin giving the "slightly more").
Desktop/tablet unchanged (except 3.6). All five chapters. Verify: measured
paddings + shots at 390.

**3.10 — Ch4 hero: Tubman's face cut off on the right (mobile).**
`ferry.json:11` `heroFocus: 50` (scalar → portrait `50% 50%`,
`[chapter].astro:233-236`, `global.css:1652-1654`). Raise `portraitX` toward
100 (barbershop already ships `portraitX: 100`) until both Charles and
Tubman's faces sit in frame at 360/390/430 portrait; keep landscape at 50.
Also mirror the value onto the portrait `<video>` inline object-position
(`[chapter].astro:302-311`). Verify by screenshot at three phone widths.

**3.11 — Hall chip (mobile): centered under Skip, above the arch.**
Today the phone chip sits at `bottom: calc(var(--ui-inset)+44px)`
(`Museum.tsx:1634`). Mobile (<640) only: move it to the TOP, horizontally
centered (it already is), vertically centered between Skip's bottom edge
(`Skip` at `top: var(--ui-inset)+safe-top`, 40px tall, `:1677-1697`) and the
on-screen top of the end-of-hall arch. Compute the arch apex's screen Y once
per layout (project world point x=0, y≈2.95 apex, z=endZ at the resting entry
camera — the scene already exposes what layout() needs) and set a CSS var;
fall back to a tuned constant if the projection is unstable. Tablet/desktop
chip untouched. Verify at 360/390/430: chip centred in that band, no overlap
with Skip or the arch, and the Face-forward swap still lands in the same spot.

**3.12 — Indicator dots: bottom-anchored like the map cards; hidden while a painting is open.**
Dots today rest at `calc(var(--ui-inset)+4px)` and NEVER hide in approach —
on phones they ride above the drawer (`Museum.tsx:1859-1899`, follower
`:1377-1386`). Change, all devices: (a) rest bottom margin ≡ the map rail's
`pb-[var(--ui-inset)]` (`TroyMap.tsx:1583`) — drop the +4px; (b) in approach
(painting open) the dots fade OUT (reuse the house `--dur-fast` fade), and the
sheet follower logic goes away with it; check `layout()`'s DOTS_H/DOT_GAP
reserve so the drawer may reclaim that space without recompose glitches;
(c) while doing this, re-land the dot-rail robustness fix the v11.3 revert
took away: never clear the inline `bottom` to `""` without a CSS fallback
(v11.3: set the explicit resting value instead; and
`renderer.domElement.style.position = "absolute"; inset = "0"` so the canvas
can never push the rail into flow) — Wil's point 12 ("remain visible and be
positioned at the bottom") cannot hold through viewport changes without it.
Verify: rail position at rest / walking / approach-open / after a mid-session
viewport resize, both orientations, plus dots gone while a painting is open.

**3.13 — Drawer outline stroke.**
Phone sheet: only `border-top` exists, so `border-radius: 16px 16px 0 0`
tapers the stroke to nothing around the top corners (`global.css:1680-1686`)
— give the sheet left/right (and top) borders so the radius arc is stroked;
keep bottom open. Desktop card: NO border by design since v8
(`Museum.tsx:1735-1743`, `.museum-card` has no CSS rule) — add the same 1px
`--color-primary-7` stroke (rounded 12px); tablet uses the same two paths,
check both orientations. Log the reversal of v8's "no border" call in
`docs/v4/DECISIONS.md`. Verify: stroke continuous around visible corners at
390/768/1024/1440.

**3.14 — Drawer close (X) choreography (mobile).**
Today the X renders whenever the sheet exists, peek included
(`Museum.tsx:1810-1827` — v10's V10-07 "present at all times"; Wil reverses
that — log it in DECISIONS). New mobile state machine over the existing
`peek/full` + `sheetPos` machinery (`:113-160`, wheel `:990-1041`, drag
`:1575-1607`, swipe `:890-935`):
- X hidden at peek; X appears (centred at the top of the sheet, where it
  already lives) once the user has opened toward FULL — "after the user
  scrolls down to review more of the drawer's content".
- Tapping X hides the drawer COMPLETELY (new `hidden` state, translated fully
  off, `aria-hidden`, focus returned to the stage; Back-to-the-hall and Esc
  still work).
- From `hidden`, still viewing the painting: first downward scroll/swipe →
  the PEEK preview returns; second → FULL with all content and the X centred
  at top. Wheel latch (160ms) and velocity thresholds stay as-is.
Keyboard/SR parity: the header stays reachable, state changes announced via
the existing semantics, zoom-above-floor wheel ownership unchanged. Desktop
card unchanged. Verify on 390 + a portrait tablet (the sheet gates on
portrait UI): full cycle open→X→hidden→scroll→peek→scroll→full→X, plus axe
pass.

**3.15 — Re-frame the ten paintings to the masters' 3:2 (his Q5: do it, from `masters/CNWM - Animated Images` + `masters/Stills/Paintings`).**
Scope: the museum/paintings-page work textures and grid images — the keys
`horizontal`, `horizontal-pt2`, `narrative1`, `narrative2` (six are 16:9
today, three already 3:2, one already 2:3 — table in the 8/25 session notes;
chapter heroes/reveals keep their art-directed crops). Stills: rebuild those
tiers from `masters/Stills/Paintings/` natives (2400×1600 / 1600×2400;
delivery naming per `masters/README.md`: `N. …-1.png` = landscape,
`N.1`/`N.2` = narratives, `2.2 …pt2-1` = ch2 part 2 landscape) via
`scripts/build-media.mjs`; `paintings.astro` reads aspect from disk so the
hall re-hangs itself — re-check `maxW` clamps and the museum-check
composition bars after. Videos: the hall's alive layer
(`KEY_VIDEOS`, `paintings.astro:63-68`) currently serves 16:9 crops; the
`_animation.mp4` masters are the full-frame versions but **this container can
neither decode nor transcode video** (no ffmpeg, no codecs). First parse the
masters' real pixel size from the MP4 `tkhd`/`avc1` boxes (use the `mp4box`
npm package or a correct hand parser — a naive offset read failed in the 8/25
session). If a master's aspect matches its new still, copy it through the
pipeline as the served file (sizes are 3-7MB — check against the perf budget
and the current ~1MB reveals; if too heavy, that's the §4 manual re-export).
If aspects don't match or weight busts the budget, queue the §4 manual step
(Wil re-exports 3:2 animations) and ship stills-only reframe with the alive
layer temporarily withheld ONLY where the aspect mismatch would visibly pop
(image↔video crossfade) — never a stretched or letterboxed texture.

**3.16 — Landscape-phone map framing (his Q8: fix LAST, after everything above).**
844×390 falls off the phone search at `ZOOM_FLOOR = 14.2` (`TroyMap.tsx:548`)
and takes the blind 15.25/33 fallback (`:636`) — three stops off-screen
(documented: `docs/v10/REVIEW-GUIDE.md:109-112` names zoom **13.30**). Add a
landscape-phone branch (w≥640 && h<560 or similar height predicate — the
codebase already keys on `h < 560`) whose floor reaches 13.30 so the search
converges instead of falling back; portrait phones and desktop untouched;
re-run the stub camera matrix incl. 844×390 + 667×375 and the walk-check
gates. Do this only after 3.1 so the deeper desktop pitch and this share one
final verification pass.

**3.17 — iOS browser-bar tint (v11.2 follow-through; Wil: "still dark brown or black").**
The mechanism is the runtime sampler + `color-scheme: dark` + static
`#1d1411` (`Base.astro:72`, `:88-199`; `global.css:275-280`;
`docs/v11/REVIEW-GUIDE-v11.2.md`). The chrome itself is UNOBSERVABLE in this
container (headless, no address bar) — do not claim a fix from here. Steps:
(a) re-verify the preconditions on the production build via `npm run qa:bleed`
(preview server, never dev — the dev toolbar poisons bottom-edge sampling);
(b) research current-iOS `theme-color` handling (iOS Safari tinting has
changed across recent majors; try WebSearch from the session); (c) the likely
suspects, in order: the user-level "Allow Website Tinting" toggle being off,
an iOS version that no longer honors `theme-color` in-tab, Safari clamping
near-black tints, or the sampler's dynamic writes being ignored after load —
if research indicates the last one, try a static per-page `theme-color` match
of each page's dominant edge as a degradation path; (d) whatever changes,
Wil's §4 device protocol is the only real gate — put the exact expected
colors per page/scroll position in the review guide and hand him the 2-minute
checklist. Expected behavior stays v11.2's: the bar takes the color of the
ground that touches it (dark over dark sections, cream over cream).

## 4 · Manual items queued for Wil (also listed in the session reply)

1. **High-res home splash source** — a ≥2160px-wide file (PNG/TIFF/highest
   JPG) of *Drop Him!, Catch Him!* (the vertical splash artwork), dropped into
   `masters/` (any path) and pushed to `v2`, or attached in-session.
2. **Rushing the Room study** — ask Mark Priest for the pen study (none exists
   on the series page; the one labeled "Rushing the Room" is by picture the
   Martin drawing). Until then that painting hangs without a study.
3. **iPhone chrome test** after the v12 deploy (protocol in the review guide;
   include iOS version + the Safari "Allow Website Tinting" state with the
   report).
4. **Conditional** — 3:2 re-exports of the `_animation` MP4s if the delivered
   masters turn out not to match the new 3:2 stills or bust the perf budget
   (3.15 decides; exact ffmpeg commands will be provided if needed).

## 5 · Open questions answered in the kickoff paste (defaults if unanswered)

1. **Card-gap scope** (his point 2 reads two ways): equalize gaps at ALL
   breakpoints (default — his "on all screen sizes" sentence) vs desktop-only
   (his "perfect on tablet and mobile" sentence).
2. **Title polish**: keep `Don't Let Them Have Him` and `Nalle Crossing The
   Hudson` exactly as he wrote them (default), or adopt the artist's
   punctuation/casing (`…Have Him!`, `…Crossing the Hudson`).
3. **Studies**: keep the current mansion drawing for *Charles Learning How to
   Read & Write* and the current barbershop drawing for *West Troy*
   (default), or swap West Troy's to the *Escape to West Troy* rowboat pen;
   and does he know the titles of the two unidentified drawings (mansion's,
   and the displaced cobblestone-brawl one)?
4. **Hall tilt escape hatch**: while touching the dot rail (3.12), also
   re-land the one-line tilt-recovery fix from his own 13:02 screenshot
   (`away` test gains `|dragPitch| > 0.12`, `Museum.tsx:1388`) — default YES
   under "perfect performance, no bugs"; skip if he says no.

## 6 · Order of work, and the gates

Suggested order: audit → §1/§2 canon (7) → hall items 3.7-hang/3.11/3.12/
3.13/3.14 → 3.15 reframe → map 3.1/3.2/3.3 → chapters 3.4/3.5/3.6/3.9/3.10 →
3.8 (if the master arrived) → 3.17 → LAST 3.16 → full instrument pass →
review guide.

Gates, per the house protocol (atomic: implement → measure → commit →
RUN-STATE; push ≤3 commits; deploys fire from `v2` only, mirror to the
session's designated branch): `npm run check` + `npm run build`; `qa:rag`,
`qa:a11y` (incl. RM + zoom200), `qa:contrast`, `qa:museum` (update its
composition bars for the new aspects/yC), map geometry via the stub-style
probe (api.mapbox.com is proxy-blocked — RUN-STATE documents the stub),
`qa:bleed` against `astro preview`, perf on the production preview only.
Container facts that bite: no ffmpeg/codecs; `identify` absent (use `file`);
Playwright browser pre-installed at `/opt/pw-browsers` (no `qa:setup` here);
live site can't be curled — verify live=HEAD via the deploy Action for the
pushed SHA; editing an island's source stales Vite deps (restart `astro dev`
before debugging hydration). Every animation keeps a reduced-motion variant;
keyboard reaches everything; 375px floor; tap targets ≥24px; `withBase()` for
every URL; no scroll-jacking; end with a short review guide + the human queue.
