# v12 REVIEW GUIDE — Wil's 8/25–8/26 round

*Every one of the fourteen points, plus the painting canon and a hall sweep.
Work order: `docs/v12/BRIEF.md`. Item ledger: `docs/v12/AUDIT.md`. Evidence
images: `docs/v12/qa/` (before/after pairs, JPEG, per D2).*

**Live:** <https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/>

---

## 1 · The one thing I need from you

**A two-minute check on your iPhone, after this deploys.** It is the only item
in the round no instrument here can close — this container has no address bar,
so the browser chrome cannot be observed at all.

1. Settings → Apps → Safari → **Tabs** → confirm **Allow Website Tinting** is
   ON. (If you don't see that row, just tell me your iOS version.)
2. Force-quit Safari, then open the live URL above.
3. Look at the bar colour on three screens and tell me what you see:
   - the **home page** — expect near-black/dark brown (`#1d1411`);
   - **`/commissioners-office`, scrolled down into the cream Historical
     Context section** — expect **cream** (`#f6f3ee`). This is the one that has
     been wrong;
   - **`/map`** — expect dark brown.
4. Send the three colours plus your iOS version.

**Why it stayed brown, and what changed.** The v11.2 machinery was never
broken: `qa:bleed` reports 0 visible bars across 366 bar faces, retraction
unblocked on all 11 routes, `--ui-inset` resolving at every width. The problem
is that **Safari 26 parses `theme-color` and then ignores it**. It derives the
toolbar tint from the `<body>` background instead, falling back to `<html>`,
and additionally reads `position: fixed` / `sticky` elements against the
viewport edges. This site's body ground is `#1d1411` at every scroll position —
which is exactly the dark brown you reported, on every page, no matter how well
the meta was maintained.

Body cannot simply follow the edge (sections without their own background show
the page ground *through* body, so recolouring it would repaint half the site).
So the site now paints the other surface Safari's rule names: two 2px hairlines
pinned to the top and bottom edges, coloured by the existing sampler with the
ground each edge already has — invisible by construction, inert, and beneath
every piece of chrome on the site. Where an edge is under artwork no flat colour
can match, so the strip goes transparent and Safari falls back as it does today.
Every other browser keeps taking the meta.

Measured at 390: home dark both edges · a chapter at rest transparent over its
hero, `#100a06` below · **in the cream band both edges `#f6f3ee`.**

Sources: [Ben Frain on iOS 26 tab tinting](https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/) ·
[Safari 26 toolbar colours](https://nasedk.in/blog/ios26-safari-toolbar-colors/) ·
[theme-color reference](https://www.thatdevpro.com/reference/html-meta-theme-color/)

---

## 2 · The fourteen points

| # | What you asked | What happened |
|---|---|---|
| 1 | More 3-D on the map (desktop/tablet), mobile untouched | The pitch was never removed — the camera search takes the steepest angle whose labels still fit, and 52 was simply the steepest it was ever offered. It is now offered 60/58/56/54 first, on the wide branch only, and lands **60** at 768–1920 with all five pills inside the safe box and slightly closer too (1440 zoom 14.81 → 15.01). **Phones measure byte-identical**: 52 at 14.90/15.10, same centres. |
| 2 | Equal horizontal spacing between chapter cards | The layout gap was already constant; what the eye saw was not, because each unfocused card shrinks about the edge *nearest the centre*, so the focused card's neighbour kept 16px while the pairs beyond opened to ~57. Each card is now translated back by exactly what its inboard neighbours gave up. **Desktop 16/16/16/16, spread 0.0**; 390 and 768/834 unchanged to the pixel, per your "desktop only". |
| 3 | 1858 lens: match the screenshot's crop, more caption air, best image | Opening framing is the plate's city panel filling the frame (v7's original rule; v8's ×1.3 lean-in and 1.8 floor removed). The plate is rebuilt from the 23000×19267 JP2 master to **6144×5147** (avif 1.95MB) on screens that can resolve it; phones keep the 4096 tier. Caption air 20→28, caption→door 16→24. |
| 4 | Quote section left on desktop, centred block on mobile/tablet | **Already correct — no change.** Probed on all five chapters at 390/768/834/1024/1280/1440: at ≥1024 the hook is left-set in its 9fr column with the hang indent live; below that it is a centred block with the text left inside, including the chapter-3 phone case you called correct. v10.1 had restored desktop on 8/21. If it still looks wrong to you, it will be a cached older deploy — hard-reload and tell me. |
| 5 | Historical Context: show more, no white line, light loading, scroll ease | The "white line" was the fix itself: the ground above an interlude and below it is the **same cream** on all five chapters at 390 and 1440, so painting opaque cream *on top of* the photograph washed its ends and left a boundary. (A dark ramp was tried and measured a 219-unit hard edge — worse.) The plate is now **feathered by a mask on itself**: its own pixels go transparent at each edge and the real ground shows through, which cannot introduce an edge because it introduces no colour. Longer ramp (24% vs 18%), taller plate (70/88vh vs 62/80), and the scrub grows into the section's centre and **lets go on the way out** instead of growing and holding. Reduced motion still shows it static, unclipped, full height. |
| 6 | Ch2 Moral Pt 1 bottom spacing | It was the only moral on the site with nothing after it: the other four close into `.sec` (128/168/200), this one had a hero with no margin at all — 288px above against 64 below. Same section token closes it now. |
| 7 | Painting names, sketch pairs, and the low-hung painting | See §3 and §4. The portrait work's frame bottom moves from 0.13m to **0.48m desktop / 0.53m phone**, joining the family (0.53m), with 130mm of ceiling clearance on phones. |
| 8 | Home page desktop image is low res | The still was never the reason: first paint was a poster pinned to the 800px file and what played over it was a **480×720** film upscaled 3× into a 1430px frame, while the 1080×1920 still on disk was reserved for reduced motion. The still is now the base layer at all times (800 on phones, 1080 from 768 up) and the film is re-encoded from the master at its own **800×1200** (+67% linear, 0.23→0.84MB, still lazy and after `window.load`). Both are the sources' ceilings, which you confirmed. Page weight fell 1157KB → 1042KB. |
| 9 | Mobile Moral top/bottom too big | Both grounds are the same brown, so what the eye measures is the whole run: **136 above and 168 below, down from 200 and 192**, against the History section's 96. Tablet and desktop untouched. |
| 10 | Ch4 hero: Tubman cut off | Its focus was the scalar 50, which put her face at 86% of the poster just outside a 390px frame. **85** brings both faces in with margin at 360/390/430, and the portrait film follows the same value. |
| 11 | Hall chip to the top on phones | Moved to the band between Skip's lower edge and the arch — and the arch's screen position is **projected from its real apex** through a camera posed as the rail's resting camera, not guessed, recomputed once per layout. Measured: chip centre exactly on the computed midpoint at 360/390/430, clear of Skip and the arch. Tablet and desktop untouched. |
| 12 | Dots at the bottom, gone while viewing a painting | Resting offset is now the map rail's idiom exactly (`bottom: var(--ui-inset)`; the old +4px was the only difference), the rail **fades out in approach**, and it can no longer be stranded: its offset is always set inline and the canvas is out of flow. Verified at rest, walking, in approach, and across a mid-session viewport growth. |
| 13 | Drawer outline stroke | Only the sheet's **top** edge was ever stroked, so the 16px corner radius bent that line through an arc with nothing either side and it tapered to nothing — your "going to zero". Sides are stroked now (bottom stays open, off-screen), and the desktop/landscape card has the same 1px stroke, which it never had. Measured 1px on all four device classes. |
| 14 | Close icon choreography | Exactly your cycle: absent at preview → present when open → tapping it hides the drawer completely → one scroll returns the preview → a second returns the full card with the icon. Measured at 390/430/360: peek 78px visible with no icon, full 410px with icon, hidden −66px, and back. |

Plus, from your Q8: **landscape phones** finally get a camera instead of a
guess. 844×390 lands pitch 52 at **zoom 13.30** — the value
`docs/v10/REVIEW-GUIDE.md` named when it deferred this — with all five pills on
screen and clear of the CTA. 375-tall landscape genuinely cannot seat five
pills apart at any zoom (v10 recorded that; still true), so instead of the blind
constant that put three stops off-screen it now fits the bounds: zoom 13.12,
every stop in frame.

---

## 3 · The painting titles, as they now read

Verbatim from your 8/26 map, punctuation included.

| Location | Painting |
|---|---|
| 01 Bakery | Bakery Abduction |
| 02 Commissioner's Office | 1st and State Street Skirmish |
| 02 Commissioner's Office Pt 2 | The Altruist |
| 03 Uri Gilbert Home | Charles Learning How to Read & Write |
| 04 Ferry Landing | Don't Let Them Have Him! |
| 04 Ferry Narrative I | Nalle Crossing The Hudson |
| 04 Ferry Narrative II | Ferry Crossing |
| 05 Barbershop | West Troy |
| 05 Barbershop 1 | Rushing the Room |
| 05 Barbershop 2 | Martin Felled by Axe |

The hall's plaque now reads `LOCATION 05 / MARTIN FELLED BY AXE` where it read
`PETER BALTIMORE'S BARBERSHOP / 2`. Location names are untouched everywhere
else — map, chapters, nav, bronze-plaque canon.

## 4 · Which source each study was built from

Four of the ten were already the right drawing and only needed naming. Where a
higher-resolution copy of the *same* drawing existed, it won.

| # | Painting | Drawing | Built from |
|---|---|---|---|
| 1 | Bakery Abduction | Captured at Holeur's Fashionable Bakery | **unchanged** — the tier on disk (1440×1188) is this drawing |
| 2 | 1st and State Street Skirmish | Sketch of 1st and State Street Skirmish | **your file**, at your direction (see below) |
| 3 | The Altruist | The Altruist | **unchanged** (1440×1185) |
| 4 | Charles Learning How to Read & Write | Harriet Scattering Tidings of the Event | **unchanged** (1440×903) |
| 5 | Don't Let Them Have Him! | Don't Let Them Have Him! | your file (1200×800) — the drawing serving this key was a different one |
| 6 | Nalle Crossing The Hudson | Nalle on The Hudson | the series-page plate at 1920² (identical drawing to your #6, 2.6× the pixels), caption bar trimmed |
| 7 | Ferry Crossing | Escape to West Troy | the series-page plate at 1920², trimmed |
| 8 | West Troy | Nalle Gets in The Wagon | **unchanged** (1440×1165) |
| 9 | Rushing the Room | Sketch of Rushing the Room | the series-page plate at 1920², trimmed |
| 10 | Martin Felled by Axe | Sketch of Martin Felled by Axe | your file — this drawing was hanging on the Commissioner's Office until now |

**About #2, on the record.** You reviewed the image and said use it, so it ships
as you gave it: no sharpening, no restoration. It has been through an upscaler
and will read softer than the nine drawings beside it — measured, its line-work
energy is 1,777 against 19,917–52,544 for its neighbours. Two things soften
that: the hall serves studies at 800px, where the smoothing is much less
visible, and downscaling recovers apparent crispness. If it bothers you on the
wall, `masters/Priest Series Page/The Struggle (pen).jpg` is a clean pen
drawing of the same scene and the switch is one line.

**Four new study captions** are mine, not Kathy's — descriptive of the drawing
only, in the existing curatorial voice, for the four narrative works that never
had one (Ferry Narrative I and II, Barbershop 1 and 2), plus rewritten notes for
the Commissioner's Office and the Ferry, whose drawings changed. Worth your
read; they are in the chapter JSON under `media.works[key].studyNote` and
`sketchNote`.

## 5 · Before / after

In `docs/v12/qa/`, same viewport, same build minutes apart:

- `map-1440-*` — pitch 52 → **60**. Note these two render under a stubbed
  Mapbox style: `api.mapbox.com` is blocked from this container, so there are
  no tiles and no buildings in the frame, and what the pair shows is the
  route's geometry foreshortening. The camera values are the real evidence
  (52 → 60 at every width from 768 to 1920, all five pills inside the safe
  box); the tilt itself is best judged on the live site.
- `lens-1440-*` — the 1858 opening view
- `hall-390-rest-*` — the chip's new home, the dot rail's offset
- `hall-390-last-work-*` and `hall-1440-last-work-*` — four items in one frame:
  the title, the study now hanging beside the painting, the painting off the
  floor, and the card's stroke
- `home-1440-*` — first paint

## 6 · Instruments

| Gate | Result |
|---|---|
| `astro check` | 0 errors, 0 warnings |
| `astro build` | clean, 6 island-CSS guards |
| `qa:rag` | 40 runs, **0 runts / 0 clips** |
| `qa:contrast` | **0 failures**, 0 unmeasured |
| `qa:a11y` | 51 runs, **0 violations**, 0 serious+, incl. reduced-motion and 200% zoom |
| `qa:museum` | draw calls **77–78** against a budget of 80, **no composition or chrome findings** at any viewport |
| `qa:hall` (new) | **32/32**, zero page errors at 375/390/768/1440 |
| `qa:bleed` | clean — 0 visible bars over 366 faces, 0 routes blocked |
| Lighthouse | home **perf 97 / a11y 100**, LCP 2.55s; `/paintings` perf 63 |

Two numbers that are the container, not the site, both confirmed by A/B on this
machine minutes apart the way v8 settled them: the home LCP is 2.55s here
against 2.56s on the pre-round build (it sits just over the 2.5s bar either
way, and this round left the page 115KB lighter), and `/paintings` measures 63
against the 64 RUN-STATE already records — its TBT is 150s of three.js in a
software rasteriser with no GPU. The hall's fps findings have the same cause.

## 7 · Also worth knowing

- **`npm run qa:hall`** is new — a behavioural sweep of the hall (375px floor,
  chrome collisions, approach churn, Escape, tilt recovery, orientation flips
  mid-approach, console errors). It is not v11.3's reverted `hall-check.mjs`.
- **Two earlier calls were reversed at your direction**, both logged in
  `docs/v4/DECISIONS.md` §D4: the close icon is no longer always present (v10
  V10-07), and the desktop plaque card now has a border (v8 authored it without
  one).
- **The audit's missing-webp suspect was wrong**: `troy-1858-1440.webp` does
  exist. The black-flash theory it belonged to did not survive measurement
  either — the interlude's ground is cream on both sides at every width.
- **Nothing else was touched.** "Take the walk" is as it was, the numbered
  chapter spine is untouched, and mobile/tablet card spacing is unchanged to
  the pixel.
