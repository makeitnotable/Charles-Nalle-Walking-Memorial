# v12 AUDIT — the item ledger

*Work order: `docs/v12/BRIEF.md`. One item = implement → re-measure → commit →
update `docs/RUN-STATE.md`. Every line below was re-verified against HEAD
`68978a4` before any edit; baseline at that commit: `astro check` 0 errors /
0 warnings, `astro build` clean, 6 island-CSS guards present.*

Status: `open` → `done` (with the commit) as the round proceeds.

| id | item | status |
|---|---|---|
| V12-01 | Official painting titles (BRIEF §1) | done `0bed557` |
| V12-02 | Study canon — Wil's ten-drawing map (BRIEF §2) | done `0bed557` |
| V12-03 | Map pitch: deeper 3-D on ≥640 (3.1) | done `54671a6` |
| V12-04 | Chapter-card gaps equal — desktop only (3.2) | done `54671a6` |
| V12-05 | 1858 lens default view + caption air (3.3) | done `c26a531` |
| V12-06 | Quote section alignment — VERIFY FIRST (3.4) | **no-op — verified** |
| V12-07 | Historical-context plate: seams, size, scroll (3.5) | done `c47ed3e` |
| V12-08 | Ch2 Moral Pt 1 bottom spacing (3.6) | done `c47ed3e` |
| V12-09 | Portrait painting hangs too low (3.7) | done `0bed557` |
| V12-10 | Home desktop resolution (3.8) | done `0c280cf` |
| V12-11 | Mobile moral top/bottom air (3.9) | done `c47ed3e` |
| V12-12 | Ch4 hero focus — Tubman cut off (3.10) | done `c47ed3e` |
| V12-13 | Hall chip to the top on phones (3.11) | done `0bed557` |
| V12-14 | Dot rail: bottom-anchored, hidden in approach (3.12) | done `0bed557` |
| V12-15 | Drawer outline stroke (3.13) | done `0bed557` |
| V12-16 | Drawer close-icon choreography (3.14) | done `0bed557` |
| V12-17 | Re-frame the paintings to 3:2 — stills only (3.15) | done `54671a6` |
| V12-18 | Landscape-phone map framing — LAST (3.16) | open |
| V12-19 | iOS browser-bar tint follow-through (3.17) | open |
| V12-20 | Hall bug sweep beyond the fourteen (§5.4) | done `2313c68` — 32/32 via `npm run qa:hall` |

---

## V12-01 · Official painting titles

**Wrong.** No work carries its own title. `src/pages/paintings.astro:48-53`
composes labels from the LOCATION name plus a key suffix (`KEY_TITLES`), and
`:58-60` (`PLAQUE_VARIANTS`) prints "1"/"2" on the barbershop plaques. So the
hall names a place ten times, never an artwork.
**Verify:** every plaque, grid caption, dot `aria-label` and counter reads the
BRIEF §1 string; `name.canonical` untouched everywhere else (map, chapters,
nav); `astro check` clean; DOM probe of all ten plaques at 390 + 1440.

## V12-02 · Study canon

**Wrong.** `paintings.astro:98-99` derives the study from the painting KEY
(`horizontal` → `sketch`), so four narrative works can never carry one, and
two studies hang on the wrong painting: `commissioners-office/sketch` is the
drawing Wil maps to *Martin Felled by Axe*, and the ferry chapter's own study
is a different drawing again. Confirmed 8/26 by centre-cropped dHash + eye.
**Verify:** each of the ten hangs the drawing BRIEF §2 assigns; new tiers built
by `scripts/build-media.mjs`, never upscaled; chapter pages follow the same
reassignment; alt text uses painting titles; `qa:museum` composition clean.

## V12-03 · Map pitch (≥640)

**Not wrong, but flat-reading.** `PITCHES = [52,48,44,40,36,33]`
(`TroyMap.tsx:56`) is unchanged since the root commit; the desktop branch
(`:596-634`) simply takes the first pitch whose `cameraForBounds` fits, and
v11 widened the bottom padding to 240 (`:610`), which flattens the frame by
zooming out. Wil wants more depth on desktop, mobile untouched.
**Verify:** stub camera probe at 768/1024/1440/1920 — settled pitch above
today's, all five pills inside the safe box, search still converges; phone
branch byte-identical (`git diff` shows no change in `:510-595`).

## V12-04 · Chapter-card gaps (desktop only)

**Wrong.** Layout gap is constant (`spacing: 12` base, `16` at ≥640,
`TroyMap.tsx:1104-1107`) but `detailsChanged` (`:1144-1183`) shrinks each
unfocused card by `CARD_FOCUS = 0.08` (`:105`) about `transformOrigin` "left
bottom"/"right bottom" (`:1181`) — the edge nearest the centre. The focused
card's neighbours therefore sit 16px away while the pairs beyond them sit
~57px apart at ≥1024.
**Verify:** DOM probe of settled adjacent-pair gaps equal ±1px at
1280/1440/1920; scale still exactly 1.000/0.920; gaps at 390/768/834
numerically UNCHANGED from the pre-change run.

## V12-05 · 1858 lens

**Wrong (default framing).** `lensReset` opens leaned-in:
`s0 = max(lensMinScale(), panelFit*1.3, 1.8)`, `startCx .58/.52`,
`startCy .74` (`TroyMap.tsx:280-286`) — Wil's screenshot is the whole plate.
Caption air is thin: `mt-5` plate→caption (`:1414`), `mt-4` caption→button
(`:1428`). Served plate is `troy-1858-full-4096` (4096×3431) while the master
is a 23000×19267 JP2.
**Verify:** screenshot at 1440 + 390 against his crop; plate fills the frame at
rest; caption/button/inset rhythm measured; new tier's bytes reported against
the perf budget.

## V12-06 · Quote section — VERIFY FIRST

**Possibly already correct.** `38c7dad` centred the hook at every width;
`de29ade` re-scoped it to `@media (max-width: 1023px)`
(`[chapter].astro:906-915`), which is what Wil asks for. Measure before
touching.
**Verify:** probe hook box + `text-align` on all five chapters at
390/768/834/1024/1280/1440. If it already matches, record the probe and change
nothing. `ChapterSpine.astro` untouched either way.

## V12-07 · Historical-context plate

**Wrong (three ways).** (a) `.interlude-fade` is opaque `--ground-light` at
BOTH 0% and 100% (`global.css:1006-1024`) while the section above the plate is
`#1d1411` on four of five chapters — that is the harsh line. (b) Fixed
`h-[62vh] md:h-[80vh]` boxes (`[chapter].astro:483`) crop the plate hard, with
no `object-position` and one 16:9 plate among four 3:2. (c) The scrub is
1.000→1.045 on entry only (`:801-811`) — no ease-out on the way back up. Also
found: `commissioners-office/troy-1858-1440.webp` is named in the srcset but
**absent from disk** — a candidate for the black flash.
**Verify:** per chapter at 390/768/1440 — no hard seam either edge, more plate
visible than before (measured), scrub grows AND shrinks, RM shows the static
state; missing webp either built or dropped from the srcset.

## V12-08 · Ch2 Moral Pt 1 bottom

**Wrong.** Every moral closes on a flat 64px (`pb-16 md:pb-16`,
`[chapter].astro:598`). Four chapters follow it with `.sec` (200px desktop);
ch2's Part-2 hero (`:361`) carries no margin at all — so 288px above, 64px
below.
**Verify:** measured above:below at 390/768/1440 on ch2, plus a shot; the four
single-moral chapters unchanged except where V12-11 applies.

## V12-09 · Portrait painting hangs low

**Wrong.** `Museum.tsx:588` gives the portrait work `h = 2.6` (30% taller than
any landscape) and `:595` hangs it at `yC = 1.6` (100mm LOWER) — frame bottom
0.13m off the floor against 0.53m for every other frame.
**Verify:** frame bottom within ~30mm of the landscape family in both
orientations; no ceiling collision at `CEIL_Y = 3.2` (portrait); `qa:museum`
composition clean; oblique shots.

## V12-10 · Home desktop resolution

**Wrong.** Desktop with motion allowed plays `splash.mp4` at **480×720**
(`index.astro:27-37`) — a ~3× upscale — with an 800×1422 poster (`:15`,
`:31-32`), while the 1080×1920 file on disk is reserved for reduced motion
(`:43-55`). The master film is 800×1200 (measured with ffmpeg).
**Verify:** desktop poster/preload = the 1080 tier; re-encoded film reports its
dimensions and bytes; visual A/B at 1440; perf on the production preview.

## V12-11 · Mobile moral air

**Wrong.** Mobile moral = 72px beat margin + 128px top + 64px bottom
(`global.css:611-613`, `[chapter].astro:598`) against History's 96/96
(`:525`).
**Verify:** measured top/bottom at 390 for all five chapters, in the History
section's family; ≥768 unchanged except V12-08.

## V12-12 · Ch4 hero focus

**Wrong.** `ferry.json:11` is the scalar `heroFocus: 50`, which expands to
portrait `50% 50%` (`[chapter].astro:233-236`) and crops Tubman off the right
edge on phones.
**Verify:** shots at 360/390/430 portrait with both faces in frame; landscape
framing unchanged; the portrait `<video>` object-position matches the still.

## V12-13 · Hall chip on phones

**Wrong placement per Wil.** The chip sits at the BOTTOM on phones
(`bottom: calc(var(--ui-inset)+44px)`, `Museum.tsx:1634`), stacked over the dot
rail's band. He wants it up top, centred between Skip's lower edge and the
arch.
**Verify:** at 360/390/430 — chip centred in that band ±2px, no overlap with
Skip or the arch, Face-forward swaps in place; ≥640 untouched.

## V12-14 · Dot rail

**Wrong (three ways).** (a) Rests at `calc(var(--ui-inset)+4px)`
(`Museum.tsx:1866`) — 4px off the map rail's idiom. (b) Never hides in
approach (`:1859` gates on `ready` alone), so it rides the drawer on phones.
(c) `tick()` clears the inline `bottom` to `""` (`:1382-1385`) with no CSS
fallback — `bottom` resolves to `auto` and the rail falls into static flow.
**Verify:** rail bottom at rest / walking / approach / after a mid-session
resize, both orientations; dots absent while a painting is open; the (c) trap
covered by an assertion, not just by reading.

## V12-15 · Drawer stroke

**Wrong.** The sheet declares only `border-top` under
`border-radius: 16px 16px 0 0` (`global.css:1680-1686`), so the stroke tapers
to nothing through each top corner. The desktop card has NO border at all —
`.museum-card` (`Museum.tsx:1736`) has no CSS rule anywhere in the repo.
**Verify:** stroke continuous around every visible corner at
390/768/1024/1440, sampled by pixel probe at the corner arcs; v8's "no border"
call logged as reversed in `docs/v4/DECISIONS.md`.

## V12-16 · Drawer close icon

**Wrong per Wil (reverses v10 V10-07).** The X renders unconditionally
whenever the sheet exists (`Museum.tsx:1810-1827`), peek included, and closing
returns to peek rather than hiding the drawer.
**Verify:** on 390 + portrait tablet, the cycle peek(no X) → full(X) → X hides
the drawer entirely → scroll returns peek → scroll returns full with X; wheel
latch and velocity thresholds unchanged; keyboard/SR parity; axe clean.

## V12-17 · Re-frame to 3:2 (stills only)

**Wrong, and inconsistent with the video already shipping.** Six of the ten
stills are 16:9 crops (`bakery/horizontal`, `commissioners-office/horizontal`,
`…/horizontal-pt2`, `ferry/horizontal`, `ferry/narrative1`,
`ferry/narrative2`) while EVERY served hall video is already 1200×800 3:2
(measured with ffmpeg) — so today the still and the film in the same frame
disagree. Three stills are already 3:2; `barbershop/narrative2` is 2:3 in both
still and master and stays portrait.
**Verify:** all ten stills match their master's aspect; the hall re-hangs
itself from disk (`paintings.astro:92`); `maxW` clamps re-checked;
`qa:museum` composition bars updated; grid and chapter uses of those keys
eyeballed.

## V12-18 · Landscape-phone map — LAST

**Wrong.** 844×390 falls off the phone search at `ZOOM_FLOOR = 14.2`
(`TroyMap.tsx:548`) and takes the blind fallback `{...OVERVIEW, pitch: 33}`
(`:636`) — three stops off-screen. `docs/v10/REVIEW-GUIDE.md:109-112` records
that it needs zoom 13.30.
**Verify:** camera matrix incl. 844×390 and 667×375; landscape converges with
all five pills in frame; portrait phones and desktop numerically unchanged
from the V12-03 run.

## V12-19 · iOS browser-bar tint

**Unobservable here.** The sampler (`Base.astro:88-199`), `color-scheme: dark`
(`global.css:275-280`) and the static `#1d1411` (`Base.astro:72`) are all
present and correct; Wil reports the bar still dark. No address bar exists in
this container, so nothing can be confirmed from here.
**Verify:** `qa:bleed` preconditions against `astro preview` (never `dev`);
research current-iOS behaviour; ship the best-known implementation and hand
Wil an exact device protocol.

## V12-20 · Hall bug sweep

**Wil's bar for the round:** "eliminate all bugs… perfect performance on
mobile, tablet, and desktop." Known-broken already: the tilt escape hatch
tests yaw only (`Museum.tsx:1388`), so a vertical drag tilts the hall with no
way back. Sweep beyond that: pointer/wheel/pinch edges, resize and orientation
mid-approach, the video lifecycle (`:1128-1160`), focus order and Esc,
reduced motion, 375px.
**Verify:** each defect gets a reproduction before a fix and an assertion
after; `qa:museum` + a11y clean at the end.
