# CNWM v7 — AUDIT (Phase 1: identify before you fix)

Build audited: `7b7a986` (= `623b13a` + Phase-0 instruments; no product change).
Method (docs/PLAN.md Part B): every instrument on the v7 matrix + a hand UX
heuristics walk with fresh eyes on phone / tablet / desktop. Evidence lives in
`docs/v7/qa/baseline-*` (PNGs gitignored; `.md/.json` committed) and
`docs/v7/qa/uxwalk-{phone,desk}/`. Every finding below carries an ID
`V7-nnn`, cites its Part-A item (or NEW), and names the phase that fixes it.

**Severity:** P0 blocks a core task · P1 a visitor notices, "unfinished" ·
P2 a designer notices · P3 polish. **Category:** a11y · ux · design · perf.

---

## 1 · Instrument baseline (numbers, before any fix)

| instrument | matrix | result | evidence |
|---|---|---|---|
| `shots.mjs` | 11 routes × 9 vps + scroll shots | 345 captures, 0 failures, console clean except /404's own 404 | `baseline-shots/` |
| `probe.mjs` | 11 × 5 | **0 floating collisions at rest**, type ladder 5–7 sizes/page, 0 overflow, 0 CLS flags | `baseline-probe/probe.md` |
| `census.mjs` | 11 × 5 | rhythm ladder on chapters `…128, 400, 200` (moral→Onward = 400 void +160 pad); 10–12 rendered sizes on chapters | `baseline-census.md` |
| `contrast.mjs` (style + **pixel**) | 11 × 3 | **197 failures (0 style · 197 pixel), 0 unmeasured** — 7 root causes (§2 G3) | `baseline-contrast.md/.json` |
| `rag.mjs` (new) | 11 × 9 | **549 runt rows (274 authored lockups) · 144 two-word display runts · 212 clips** — 119 unique runt cases; **every clip is `.lines .line-box{overflow:hidden}`** (4–13 px overhang top+bottom on every `<Lines>` heading) | `baseline-rag/rag.md/.json` |
| `a11y.mjs` (new; axe wcag2a/aa/21aa/22aa/bp + kbd + RM + 200%) | 11 × 3 + 6 states | after de-flaking the reveal fade: **serious = desktop ChapterSpine inactive labels** (19–41 nodes × 5 chapters @1440); moderate `landmark-unique` (4× `nav.rail[aria-label="Sections in this chapter"]` per chapter); minor `aria-allowed-role` on `.mapboxgl-marker[role=img]`; keyboard: all rings visible, menu/dialog Enter/Esc/focus-return OK, **home has only 2 tab stops** (skip → CTA; no menu on home by v6 decision); RM: parity OK; 200%: no overflow; console: intermittent React hydration mismatch on chapters | `baseline-a11y/a11y.md/.json` |
| `arrival.mjs` | 5 chapters, Slow-4G 4× CPU | no film bytes in first 10 s on any chapter ✓ | `baseline-arrival/` |
| `frames.mjs` (new) | 3 navigations × 390/1440, 4× CPU | **DEFECT on all 6 cases**: 2–4 uncovered page-B frames (39–84 ms) before the curtain snaps; click→covered 600–690 ms; hold 430–600 ms; reveal 0.48–0.57 s; text reflow 0 px | `baseline-frames/frames.md` |
| `walk-check.mjs` (new) | /map × 8 vps | see §2 A3 (pitch 33 everywhere; geolocate present; Stop-the-walk over cards; walk does not pause on drag; a 120 px drag flings a full card; labels outside safe box at phone) | `baseline-walk/walk.md` |
| `museum-check.mjs` (new) | /paintings × 5 vps | 42 findings; 71–73 draw calls, 0 long frames at rest/mid/end/approach (angle/swiftshader); pitch 0, far 60, all aspects 1.5, Skip pill in the menu lane at every vp, painting cx .69 in approach @land/1024/1440 (and **overlapping the card** @land/1024), chip present, "Bring it to life" visible | `baseline-museum/museum.md` |
| `states.mjs` | 5 vps × 18 states | **0/90 states with collisions** (the doctrine holds at rest and in the v6 states; the NEW v7 states — walk-mode desktop/mobile, paused, lens, museum modes, mini-player collapsed — are added in P5/P7) | `baseline-states/states.md` |
| `perf.mjs` (Lighthouse mobile, all routes) | 10 routes, **production build via `astro preview :4322`** (dev-server numbers are meaningless: 25–60) | home **97** (LCP 2.48 s) · bakery 99 · ch2 98 · mansion 98 · ferry 98 · barbershop 98 · **map 63** (LCP 8.67 s, TBT 393 ms — the documented exception, up from 56 live) · people 99 · **paintings 89** (LCP 3.31 s, TBT 150 ms) · about 99; a11y 100 + best-practices 100 everywhere; CLS ≤ 0.004 | `baseline-perf/summary.json` |

---

## 2 · Findings ledger

Format: **ID · route · viewport(s) · category · severity · evidence → proposed fix · Part-A item · fix phase**.

### A0 · Global

- **V7-001** · all `<Lines>` headings (chapter `.t-title.lines`, `#history-heading`, `#moral-*-heading`, `/people` + `/paintings` H1) · all 9 vps · design · **P1** · `baseline-rag/rag.md` "Clips" (212 rows: `h2.t-title.lines` 99, `#history-heading` 45, `#moral-heading` 36, moral-0/1 9+9); `uxwalk-phone/co-390-moral-heading-3x.png` → the word rects (font content box) overhang `.line-box` by 4 px/side at `--lh-title:1` and 6–13 px at `--lh-display:.95`; on Caslon the J/Q descenders and the ball terminal fracture at the box edge · **G2** · P2
- **V7-002** · chapters (`#scene` quote, `#history` `<dl>`, moral h3/p), footer disclaimer, `/about` numbered list, `/map` index, `/people` names/roles, `/paintings` grid captions, `/404` · all · design · **P1** · `baseline-rag/rag.md` "Runts" — 119 unique cases; worst offenders: footer disclaimer `p.t-meta-body.max-w-[72ch]` runt at 360/768/1024/1280/1440/1920/land (all routes); `blockquote.t-quote` last line 1–2 words on bakery/ch2/ferry/about; `h3.t-title-sm` People names (`HANSBROUGH`, `HOLMES`, `TOWNSEND`); `p.t-title-sm` moral sub-heads (`…YOU ARE UNDER`, `…TO KEEP`); map index `span.t-title-sm.block` names + addresses; `/paintings` grid captions with ` — NARRATIVE II`; `p.t-meta` "TAP ANY PARAGRAPH…ALOUD" @360; `a.link-meta.t-meta` "ABOUT THE / MEMORIAL" in the footer @360–430 → (a) `text-wrap: pretty` on prose/meta/meta-body/li/dd, `text-wrap: balance` on `.t-title-sm`, `.t-quote`, non-`.lines` h1/h2, card titles; (b) `nbsp()` build helper gluing the last two words of headings/eyebrows/labels/captions/buttons; (c) authored breaks for the named display cases; (d) `hyphens: manual` · **G1** · P2 (+ each page phase)
- **V7-003** · authored `.lines` lockups: `WHERE TO / NEXT` (all chapters), `HISTORICAL / CONTEXT`, `NOT ALL LAWS / ARE MORAL`, `AUTHORITARIANISM / IS PERSISTENT`, `FREEDOM ISN'T / FREE`, `THE NALLE / SERIES`, home wordmark `CHARLES / NALLE` · all · design · P3 · `rag.md` (274 "authored" rows) → these are deliberate two-line lockups; `rag.mjs` will report them under "authored lockups" for eyeballing and exclude them from the gate; hand-review each against the named cases (`WHERE TO NEXT` stays; `FREEDOM ISN'T / FREE` stays) · G1 · P2 (instrument) + P4 (eyeball)
- **V7-004** · desktop ChapterSpine inactive labels `span.t-spine-sm`/`span.t-meta.transition-colors` (`#ff9770` × opacity .62 on `#1d1411` = **4.01:1**) · 1440 (all five chapters, 156 rows; axe serious 19–41 nodes) · a11y · **P1** · `baseline-contrast.md`, `baseline-a11y/a11y.md` → raise inactive opacity to ≥ .70 (→ ≥ 4.5) or use `--ink-meta` at full opacity; keep the active/hover contrast step · **G3** · P2
- **V7-005** · home eyebrow `p.t-meta.home-seq` (2.16–3.34 p10) and description `.home-desc.t-meta-body` (2.6–3.08 p10) on the film · 390/768/1440 · a11y · **P1** · `baseline-contrast.md`; `uxwalk-phone/home-390-01-first.png` → extend `--scrim-photo` upward + raise the description role to 16px `--color-neutral-12` @ ≥ .9 (H5); measured ≥ 4.5 by pixel · **H5/G3** · P3
- **V7-006** · archival interlude credit `p.t-meta.absolute` `#ff9770` floating on the photo: **1.0–2.3 p10** on every chapter (ch2's 1858-plate credit 1.1; ferry 1.12; bakery 1.39; barbershop 1.34) · 390/768/1440 · a11y · **P1** · `baseline-contrast.md`; `uxwalk-phone/bakery-390-audio-03-mini.png` → credit on a chip (`color-mix(primary-2 82%)`, like the map chip) or a bottom scrim band; single line, no runt · **C4/G3** · P4
- **V7-007** · moral-section sketch caption `p.t-meta "THE ARTIST'S STUDY"` 4.22–4.43 (bakery/ch2/mansion/barbershop @390, several @768/1440); `p.t-meta-body "Mark Priest · Nalle Series"` 4.35 @1440 mansion/ferry; ch2 Part-2 painting-hero eyebrow `SPOT 02 · CONTINUED` 2.35–4.31; chapter hero separator `span.hidden.sm:inline "·"` 3.27–4.19; home `1875` caption 2.94 min · 390/768/1440 · a11y · P2 · `baseline-contrast.md` → deepen the moral scrim middle band (~.86) + slight blur on the bg image only; chip the Part-2 eyebrow like C4; hero separator inherits `--color-neutral-12` at reduced size · **C2/G3** · P4
- **V7-008** · `landmark-unique`: four `nav.rail[aria-label="Sections in this chapter"]` per chapter (mobile collapsed + desktop per scene) · all · a11y · P2 · `baseline-a11y` → one `<nav>` per page (or unique labels: "Sections · Part 1", "…Part 2"; hide the collapsed duplicate with `aria-hidden`/`inert`) · **NEW (G-a11y)** · P4
- **V7-009** · `aria-allowed-role`: `.mapboxgl-marker[role="img"]` (Mapbox adds `role=img` to the marker `<div>`; our button lives inside) · /map · a11y · P3 · `baseline-a11y` → `marker.getElement().removeAttribute("role")` (the inner `<button aria-label>` is the accessible object) · **NEW** · P5
- **V7-010** · intermittent React hydration-mismatch console error on chapters (AudioStory island: server vs client attributes) · chapters, any vp · perf · P2 · `baseline-a11y/a11y.md` Console; `uxwalk-phone` UXP-39 → find the SSR/CSR branch (`typeof window`, formatted time, `matchMedia` in render) and make it deterministic; zero console errors is a guardrail · **NEW** · P4
- **V7-011** · floating UI not on `--ui-inset`: AudioStory mini-player `fixed bottom-4 left-4`; Museum's three ad-hoc insets (`top-[max(env(safe-area-inset-top),24px)]`, `right-[var(--gutter)]`, `+44px` row) · chapters, /paintings · design · P2 · `baseline-museum/museum.md` ("Skip pill top=24 (inset 56)") → move to `--ui-inset` (+ `env(safe-area-inset-top)`); lane comment in `global.css:1072` updated (map: menu bottom-right, attribution bottom-left) · **G6** · P2/P7
- **V7-012** · dead motion tokens `--ease-circ-in-out`, `--ease-pop`, `--dur-curtain` (`global.css:217–219`) unused by `curtain.ts` (hardcodes `circ.inOut`/0.6) and `Menu.astro` · — · design · P3 · grep → wire or delete; document museum damping + moral parallax in `docs/v4/MOTION.md` · **G7** · P2
- **V7-013** · em dashes in visible copy: chapter JSON prose 37, `people.ts` 5, `people.astro` 3, `about.astro` 1, `map.astro` 4, `paintings.astro` 5, `[chapter].astro` 2 + `split("—")`, `index.astro` title/meta, `TroyMap.tsx` aria/alt, `Museum.tsx` plaque, `WalkProgress.astro` sr-only, `styleguide.astro` specimens, `<title>` tags site-wide · all · design · P2 · `grep -rn "—" src/` (grep is noisy with JSX comments — a DOM-based visible-text sweep is added to `rag.mjs` in P4) → locked decision 2: punctuation-only inside Kathy's prose (ledger in CONTENT-STATUS.md), copy rewrites elsewhere per the plan · **G5** · P4 (+P5/P6 for map/people/about)
- **V7-014** · vocabulary split "Spot" vs "Chapter": mini-player subtitle "Chapter 1", map cards "CHAPTER n" (≥640) + aria "Enter Chapter 2", museum plaque "Chapter 2", while heroes/onward/grid say "Spot 01" · all · ux · P2 · `uxwalk-phone` UXP-14 → "Spot" everywhere visitors read it (`Spot 01` zero-padded, M13); plaque keeps "Nalle Series · Spot 2"? — no: plaque reads `Mark Priest · Nalle Series · Spot 02` · **M13/NEW** · P4/P5/P7

### A1 · Home

- **V7-015** · hero crop: Nalle's head is not cut, but the kicker `TROY, NEW YORK · APRIL 27, 1860` runs across his brow and the wordmark covers eyes/nose (video + picture at `object-position 50% 50%`) · 360/390/430/1440/1920 · design · **P1** (Wil's request) · `uxwalk-phone/home-390-01-first.png`, `baseline-shots/home--*.png` → port `heroFocus` to home: `object-position: center <N>%` per orientation on both `<video>` and `<picture>` so the whole head sits above the eyebrow line with headroom · **H1** · P3
- **V7-016** · description paragraph: `max-w-[46ch]` gives 4 lines at 1440/1920 with hand `&nbsp;`; not the 3-line rag Wil asked for · ≥1200 · design · P2 · `baseline-shots/home--1440.png` → widen to ~56–60ch at ≥1200, keep balance, `nbsp()` last two words; exactly 3 lines at 1440/1920 · **H2** · P3
- **V7-017** · CTA copy `Walk the five spots` → `Walk the story` · all · ux · P2 · — · **H3** · P3
- **V7-018** · mobile: CTA is in-flow under the stack; Wil wants it pinned to the frame's bottom (margin = content inset), full-width in the inset, tap ≥ 48 · <768 portrait · ux · P2 · `uxwalk-phone/home-390-01-first.png`; @320 the CTA is 295 px inside a 300 px frame (UXP-36) · **H4** · P3
- **V7-019** · landscape phone: kicker touches the frame's top border · 844×390 · design · P3 · `uxwalk-phone/land-home-844x390-01.png` (UXP-37) → min top padding 16 px in the `max-height:500px` rule · **H4/H6** · P3
- **V7-020** · home has no ☰ (only exit = CTA) · all · ux · P3 (v6 "home-nav restraint" sign-off by Wil) · UXP-10 → keep; note in REVIEW-GUIDE as an intentional decision · — · P8 (guide)

### A2 · The Crossing

- **V7-021** · uncovered page-B frames before the hold on EVERY curtain navigation (map card→chapter 3–4 frames/68–73 ms; Continue→next 3–4 frames/39–84 ms; home→map 2–3 frames/57–58 ms at 4× CPU); click→covered ≈ 600–690 ms; hold ≈ 430–600 ms; reveal ≈ 0.48–0.57 s; wordmark reflow 0 px · 390 + 1440 · ux · **P1** · `baseline-frames/frames.md`, `frames/continue-390/f056-852.jpg` (Commissioner's hero fully painted, no curtain) → X1 fix set: `is:inline` head script reading the sessionStorage flag → `html.curtain-covered` before first paint (+ label stash), font preloads for Caslon Display/Text 400, `will-change: transform` during the sequence, page-B text tween instead of hard set, `cnwm:curtain-cover` event (map/museum go quiet), keep fail-open timers · **X1/M12** · P2
- **V7-022** · deep-link `#scene-1` / `#history` arrival drifts as the page grows (media heights); one of two runs landed at scrollY 0 · 390 · ux · P2 · UXP-27 (`part3.json deep2-*`) → reserve media heights (aspect boxes already exist — verify the AudioStory island height), re-scroll to the hash after fonts/media settle (`load` + 1 frame) · **NEW** · P4

### A3 · Map + the walk

- **V7-023** · phones: the 100dvh map (`touch-action:none`) swallows every vertical touch-drag — the "Five spots through Troy" index + footer below the map are unreachable by touch (scrollY stays 0) · 360/390/430/844×390 · ux · **P1** · `uxwalk-phone/map-390-13-below-fold.png` (UXP-01) → make the bottom control band a full-width scroll handle (`touch-action: pan-y` on the row wrapper, not the buttons) and add a quiet `▾` "Five spots" cue on phones; keep single-finger pan on the map itself (no cooperativeGestures — it would break the walk feel) · **NEW (M8)** · P5
- **V7-024** · overview shows 4 of 5 markers on portrait phones (#4 Ferry Landing 64–110 px below the fold at zoom 15.25); labels 1 & 4 outside the safe box · 360/390/430 · ux · **P1** · `uxwalk-phone/map-390-01-overview.png` (UXP-02); `baseline-walk/walk.md` → M2's projected-label fit with the real bottom row/top row as padding, pitch candidates `[52…33]` · **M2** · P5
- **V7-025** · overview pitch 33 at every viewport (`OVERVIEW.pitch`); the style has **no `fill-extrusion` layers** (`walk.json fillExtrusion: []`) so "more 3-D" must come from pitch + terrain-less perspective; desktop wants ≥ 40 · all · design · P2 · `baseline-walk/walk.md` → M2 (label-fit search) + note for Wil that 3-D buildings need a Studio-style change on his account · **M2** · P5
- **V7-026** · `Stop the walk` is `absolute bottom-44…` — sits ON the active card (covers the thumbnail + label row) · 360/390/430/1440 · ux · **P1** · `uxwalk-phone/map-390-02-walk-start.png` (UXP-03); `walk.md` "not at top-right" → top-right at `--ui-inset` on every breakpoint · **M3** · P5
- **V7-027** · manual carousel drag during the walk does not pause it (`touring` stays true; loop advances 2→3→4 over the visitor's chosen card) · 390 · ux · **P1** · `walk.json dragTest`, UXP-04 → `walk: idle|walking|paused` state machine, `pauseWalk()` on `dragStarted`/tap/marker/keyboard; button reads `Continue`; `Walk again` after stop 5 · **M4** · P5
- **V7-028** · a 120 px touch drag flings a whole card in one 16 ms sample (`pos 1.21→1.66`, keen's hard-coded 500 ms quintic snap on ANY release velocity); the 80 ms `moveToIdx({duration:0})` retry yanks live drags · 390 · ux · **P1** · `walk.json dragTest.pos` → M5 `dragEnded` override (nearest snap or ±1 on a real flick, 650 ms expo-out), reconciliation effect early-return during drag/animation, `settle()`→`followCamera` · **M5** · P5
- **V7-029** · card titles: `Commissioner's Office` renders on ONE line at ≥640 (wanted two: `Commissioner's / Office`); `Holeur's Fashionable Bakery` breaks `Holeur's Fashionable / Bakery` (wanted `Holeur's / Fashionable Bakery`) · all · design · P2 · `walk.md` "Card titles" → `name.card` field + `whitespace-pre-line`; title as a `.t-*` role · **M6** · P5
- **V7-030** · `Back to map` at `top: --ui-inset + 48px` (not the equal inset) · ≥640 · design · P3 · `walk.md` controls → `top-[var(--ui-inset)]` · **M7** · P5
- **V7-031** · phone overview bottom row: geolocate ⌖ + ⓘ + Mapbox logo left, `Take the walk` (48) + `See Troy in 1858` (40 px, < 44) stacked centre, ☰ bottom-right; in walk mode geolocate/ⓘ hide under the card strip; landscape: ☰ overlaps the right neighbour card, logo/ⓘ under the left card · 360/390/430/844×390 · ux · P2 · UXP-17/18, `walk.md` controls → M8 layout (attribution · `Take the walk` · ☰ on one axis; lens toggle top-right pill; geolocate removed) + M9 (☰ hidden while focused on phones; card strip padded above attribution) · **M1/M8/M9** · P5
- **V7-032** · GeolocateControl present at every viewport (Wil: remove) · all · ux · P2 · `walk.md geolocate: yes` · **M1** · P5
- **V7-033** · phone walk cards: neighbours peek only ~31 px and are faded by the 28 px edge mask; spacing −20 (overlap); inactive not dimmed by design but the mask reads as dimming; @320 the 343 px card clips · 360/390/430/320 · design · P2 · UXP-41/19 → slide `min(343px, 84vw)`, spacing ~12, `origin:center`, mask ≥640-only, per-slide scale .92→1 · **M9/M11** · P5
- **V7-034** · marker chips on phones: 24 px, #2 and #5 centres 15 px apart, #1 hugs the right edge · 360/390/430 · a11y · P2 · UXP-16, `walk.md minSep` → part of M2's fit (≥ 22 px centre separation) + chip 28 px · **M2** · P5
- **V7-035** · chip copy `Five spots · April 27, 1860` → `April 27, 1860` · all · design · P3 · — · **M10** · P5
- **V7-036** · route line reads as a dark thread (5 px `#FF9770` on 8 px `#100A06` casing under buildings) · all · design · P3 · UXP-30 → widen at z15, lighter casing; verify after the pitch change · **NEW (M2)** · P5
- **V7-037** · blank highway-shield glyphs render top-right and along Ferry St in the dark style · 390/430 · design · P3 · UXP-34 → hide `road-shield`/`road-number-shield` layers at runtime (`setLayoutProperty visibility none`) or note for Wil's Studio style · **NEW** · P5
- **V7-038** · reduced-motion walk auto-cycles with 1.2 s jump-cuts (five hard cuts in 6 s) · 390 RM · ux · P3 · UXP-42 → 2.5 s cadence under RM (parity: still auto, gentler) · **NEW (G7)** · P5
- **V7-039** · map index copy block (`map.astro:54–123`) rag + em dashes; `Spot NN` zero-padding site-wide (`paintings.astro:169`) · all · design · P3 · `rag.md` `/map` rows → nbsp/balance; `pad2` · **M13** · P5

### A4 · The 1858 lens

- **V7-040** · lens viewer is `min(92vw, 88dvh)` at 4096/3431 → 359×301 on a 390 phone (36 % of the height): the whole sheet fits illegibly; on 1440 it is a modest box; initial view = full plate; `Take the walk` and the chip stay visible under it; +/−/reset stack over the map's top-right; caption wraps to 2 lines @360 and says "pinch or scroll" · 360/390/430/1440/1920 · ux · **P1** (locked decision 1) · `uxwalk-phone/map-390-07-lens.png` (UXP-15/35) → L1 lower-panel initial/reset view, L2 near-full-bleed viewer within `--ui-inset`, L3 only `Back to today` centred + hide the chip while open, caption one line/touch wording, `states.mjs` new state `map/06-lens-open` · **L1–L4** · P5

### A5 · Chapter template (all five)

- **V7-041** · no drop cap on the first paragraph of each part · all · design · P2 (Wil's request) · — → `::first-letter` `initial-letter: 3` (float fallback) on `items[0]` in `AudioStory.tsx:326–332`, must not break `narration-active`/tap-to-seek · **C1** · P4
- **V7-042** · moral/theme section: body `#fed9cc` (Wil: "white like the heading"); no parallax; sketch caption borderline contrast (V7-007) · all · design · P2 · `baseline-shots/*--scroll2.png` → `--color-neutral-12` body, scrim middle band deepened to measure ≥ 4.5, scroll parallax ±6–8 % on the bg image only (scrub, RM off, oversized image) · **C2** · P4
- **V7-043** · Artist's-study figure `md:items-end` — sketch bottom-aligned, caption/text block not centred with it · ≥768 · design · P3 · `baseline-shots/mansion--1440--scroll2.png` → `md:items-center`; same idiom checked in the museum plaque and About portraits · **C3** · P4
- **V7-044** · Where-to-next: SIX orange elements in one screen (`(04)`, ONWARD, the 226×74 orange marker pill on the embed, `NEXT — SPOT 02`, solid CONTINUE, outlined GET DIRECTIONS) + the orange mini-player when latched; the embed map is flat (no depth); CTAs sit left under the title, not under the map · all · design · **P1** (Wil: "declutter") · `uxwalk-phone/bakery-390-onward.png` (UXP-12) → C5: soft shadow on the embed, CTAs centred under the map, marker pill → quiet dark pill with orange numeral, mini-player collapses to a small pill once Onward is in view; one primary orange (`Continue`) · **C5** · P4
- **V7-045** · **embed maps have no Mapbox attribution** (`attributionControl:false`, logo only) on all five chapters — a Mapbox ToS requirement · all · ux · **P1** · UXP-28 (`part3.json embed-map-ctrls`) → compact `AttributionControl` on the embed (bottom-right, `--ui-inset`-quiet) · **NEW (C5)** · P4
- **V7-046** · rhythm: part heading → opening quote `.beat` 128 @desktop (Wil: too far); moral bottom → Onward = 160 pad + 400 void = 560 px ≈ a screen (phones ~500 px = 60 % of the screen; "the page reads as finished") · all · design · **P1** · `baseline-census.md` gaps `…128, 400, 200`; `uxwalk-phone/bakery-390-moral-end-gap.png` (UXP-11) → beat → ~48–64; Onward `void`→`sec` + moral bottom pad tuned to ≈ 200–260 desktop, proportional on phone/tablet; every gap on a token; identical ladder ×5 · **C6** · P4
- **V7-047** · bakery hero @phone: the seized man's face sits directly under the 72 px ☰ (object-position 50% 30%); the portrait `<video>` at `[chapter].astro:229–237` has NO `object-position` while its poster does · 360/390/430 · design · **P1** · `uxwalk-phone/bakery-390-01-hero.png` (UXP-06) → per-orientation `heroFocus` (`{portrait, landscape}`), video gets the same focus; per-chapter check that faces clear the ☰ · **C7** · P4
- **V7-048** · ☰ does not hide on scroll-down on chapters (only shrinks 72→68 px, y 20→34); the close X does not animate; the burger bars don't morph · 390 (all) · ux · P2 · `uxwalk-phone/menu-390-07-touch-scrolled-down.png` (UXP-40) → verify `Menu.astro:206–229` thresholds actually fire on device-like scroll (the agent measured no hide at 390 — investigate: the handler may be bound to a scroller that isn't `window`, or `data-hidden` is overridden), tune; N1 X-spin · **N1/N2/C7** · P2
- **V7-049** · barbershop: hero focus 62 (faces low), story order T→I→I→T? (media rows at `paragraphs[1]`,`[2]`), archival credit worst-case contrast (V7-006), clipped J (V7-001), study alignment (V7-043) · all · design · P2 · `baseline-shots/barbershop--*` → C8 (a)–(e); `@media:narrative2` moves after "Across his body…" · **C8** · P4
- **V7-050** · Chapter 2 order: Part 1 → Part 2 → interlude → History → Moral 1 → Moral 2 (three loops); spine numerals follow that order · all · ux · **P1** (locked decision 6) · `baseline-shots/commissioners-office--1440--scroll*.png` → single ordered render list Part 1 → interlude → History → Moral 1 → Part-2 hero → Part 2 → Moral 2 → Onward; `sections` pushed in that order; one visible mini-player at a time · **C9** · P4
- **V7-051** · chapter footer `pb-28` lane reserve — recheck after the mini-player collapse · all · design · P3 · — · **C10** · P4
- **V7-052** · chapter UI em dashes (`Next — Spot NN`, `— attribution`, alts) + JSON labels/address; `split("—")` at `:335` · all · design · P2 · grep → `Next · Spot 02`? — no: per plan `Next` label loses the dash: `Next · Spot 02`; attribution dash dropped; `Part 1\nTubman Creates a Crowd` (`split("\n")`) · **C11** · P4
- **V7-053** · latent: `mansion.json` audio subtitle `Uri Gilbert Mansion` → `Uri Gilbert Home` (UI subtitle only; log); `[chapter].astro:153` duplicate `longestLine`; `fitChars()` dead export; `quote.source` + mansion `portal.hook` authored but unrendered (Wil decision) · — · design · P3 · — · **C12/G-L5** · P4/P8
- **V7-054** · `#history` hanging "(1)" gutter eats 56 px of a 350 px measure on phones (~26 ch lines, lumpy rag) · 360/390 · design · P3 · UXP-31 → inline the numeral on <640 (`grid-cols-[2.25rem_1fr]` or numeral above) · **NEW (G1)** · P4
- **V7-055** · all-caps display headings have negative tracking and 0 word-spacing → `FOR JUSTICE` reads as `FORJUSTICE` at phone sizes · 360/390/430 · design · P3 · `uxwalk-phone/barbershop-390-moral-heading-3x.png` (UXP-26) → `word-spacing: .06–.08em` on `.t-display`/`.t-title` uppercase roles · **NEW (G1)** · P2
- **V7-056** · narration scrubber: 24 px range with ~12 px thumb (fiddly) · all touch · a11y · P3 · UXP-23 → 44 px hit area · **NEW** · P4
- **V7-057** · last stop's Where-to-next loops to `Next — Spot 01 · Continue` — no sense of completion · /barbershop · ux · P3 · UXP-13 → content/UX decision for Wil (e.g. closing state pointing to People/Paintings) → REVIEW-GUIDE queue · — · P8

### A6 · Footer

- **V7-058** · phones: two-column link grid — left labels wrap to two lines with arrows pushed to a far column, right arrows hug the text; About/People footers leave a lone `MAP` cell; disclaimer runt `risk.` @360; wordmark one line ✓ · 360/390 (+ desktop layout quality) · design · **P1** (Wil: redesign) · `uxwalk-phone/bakery-390-footer.png`, `about-390-02-footer.png` (UXP-24/25); `rag.md` disclaimer runt on 7 vps → F1 per §3 references: 3-col desktop grid, vertical nav list with the arrow idiom, `rule-top` disclaimer row (`nbsp()`), mobile stack wordmark → nav → Share → rule → disclaimer, `opacity-70` dropped if contrast needs · **F1** · P3
- **V7-059** · footer tap targets: links 32 px, "Notable" 29 px; Mapbox logo link 88×23 (< 24) · all · a11y · P3 · UXP-38 → pad link boxes ≥ 32/44; the Mapbox logo is Mapbox's own (leave) · **F1** · P3

### A7 · Menu

- **V7-060** · N1 close-X spin absent; N2 scroll-hide unverified/not firing on chapters at 390 (see V7-048); N3 arrow tail stays · all · ux · P2 · — · **N1/N2** · P2

### A8 · People

- **V7-061** · spot links under every person (Wil: remove); closer copy; em dashes; H1 `ONE DAY. / A WHOLE CITY'S CAST.` reads `ONE DAY. A WHOLE / CITY'S CAST.` wanted at ≥1024 (rag flags the H1 at 1024–1920); `h3.t-title-sm` names runt (`HANSBROUGH`, `HOLMES`, `TOWNSEND`); roles runt (`INDUSTRIALIST · CHARLES'S / EMPLOYER`) · all · design · P2 · `rag.md /people` → P1–P5 · **P1–P5** · P6

### A9 · About

- **V7-062** · portraits → closing quote `.void` (400) — too much (Wil); the quote is not a numbered section; section 06 copy; em dash attribution; `about.ts:24` dead kicker; numbered list runts (`(1) Start at the / Memorial Plaque`, `(4) Use the map to begin / the tour.`, `The location's historical / significance`) · all · design · P2 · `baseline-census.md` about gaps `…200, 400, 200`; `rag.md /about` → A1–A4 + nbsp/balance · **A1–A4** · P6

### A10 · The Museum

- **V7-063** · every canvas plane is 3.0×2.0 (`paintings.astro:78` `aspect: 1.5`): the portrait `barbershop/narrative2` (1440×2160) is stretched ~2.25× horizontally; grid tiles `aspect-[3/2]` · all · design · **P1** · `uxwalk-phone/paintings-390-04-approach-9.png` vs `ref-narrative2-source.png` (UXP-05); `museum.md aspects` → U8 build-time aspects (sharp), `Work.aspect` + `sketchAspect`, plane fits max-h/max-w box, video cover-fit uses the real aspect, grid tile `aspect-ratio` real · **U8** · P7
- **V7-064** · rail camera pitch 0 (no floor cue), `far 60`/fog 10→40 (end wall + glow never render), SPACING 7 (hall long, works far), rail ends 3 m short of the last work, look clamped ±0.6/±0.3, no keyboard walking · all · ux · P2 · `baseline-museum/museum.md` (pitch 0, far 60 at all vps) → U1/U2/U4/U5 · **U1/U2/U4/U5** · P7
- **V7-065** · approach @1440: painting centre x = 0.69 (right field), plaque card bottom-left with border and TWO buttons (`Bring it to life` visible), `Esc or Back returns to the hall` chip on top; sketch hangs on the entrance side (screen-left on left-wall works) · ≥1024 · design · **P1** (locked decision 9) · `museum.md` approach row; `baseline-museum/approach-1440.png` → U6: painting centred, card left column no border, only `Back to the hall`, chip removed, tap/zoom Easter egg + sr-only toggle, sketch screen-right · **U6** · P7
- **V7-066** · approach @phone: card 253 px tall at the bottom (30 % of the stage), fixed (no peek/expand), buttons 38 px (< 44), `Skip ↓` 71×28; portrait rail is a ~250 px letterbox — wall paintings are 2–47 px slivers, "tap a work" not achievable, only the dots work; first viewport shows ~526 px of empty ceiling before the stage sticks · 360/390 · ux · **P1** · `uxwalk-phone/paintings-390-02-scroll-35.png`, `paintings-390-01-first.png` (UXP-08/20/22) → U7 peek-sheet + U1/U2 (closer, pitched, narrower corridor already 2.4) + fov/plane sizing per design notes; stage pinning/first-frame composition; 44 px controls · **U7/U1/U2/U10** · P7
- **V7-067** · `/paintings` corner menu is TOP-RIGHT and the `Skip the hall` pill (@≥640) / `Skip ↓` (@<640) sit in its lane at `top 24/68`, not on `--ui-inset` (56/20); the ☰ is hidden for the whole ~4000 px hall stretch (scroll-hide) so the menu is unreachable inside the hall until you scroll up · all · ux · P2 · `museum.md` ("Skip pill top=24 (inset 56)", "sits in the corner-menu lane"); UXP-21 → U10: Skip pill top-LEFT on `--ui-inset`; keep the top-right lane empty; decide ☰ behaviour in the hall (retreat is by design; `Back` and scroll-up bring it back — note) · **U10** · P7
- **V7-068** · rail chip copy `The Museum · scroll to walk · tap a painting` / `Scroll to walk · tap a work` + literal `↓` glyph in `Skip ↓`; `matchMedia` in render; `visibilitychange` bug; no `/paintings` in `perf.mjs` (fixed in P0); no museum states in `states.mjs` · all · design · P3 · `museum.md` → U10 copy (`…drag to look…`, `Face forward` when looked away), `ICONS.arrow` rotated, IO/visibility split, states added · **U10** · P7
- **V7-069** · reduced-motion `/paintings` fallback poster is the 800 px webp cover-cropped ×4.7 on a 390 phone (soft) · 390 RM · design · P3 · `uxwalk-phone/rm-paintings-390-01.png` (UXP-29) → serve the 1440 tier / a portrait crop for the RM/no-GL poster · **NEW (U10)** · P7
- **V7-070** · grid tiles: only hover feedback (scale 1.06), no `:active` on touch · all · ux · P3 · UXP-44 → `:active` opacity/scale · **NEW (U10)** · P7
- **V7-071** · landscape phone `/paintings`: header pushes the stage below the fold; only the hint row + `SKIP THE HALL` (32 px) visible in the strip · 844×390 · design · P3 · `uxwalk-phone/land-paintings-844x390-01.png` (UXP-45) → landscape composition per U7 ("landscape phone uses the column composition, quote hidden") + collapse the header in landscape · **U7** · P7

### A11 · Favicon + head

- **V7-072** · favicon = a placeholder letter (Arial-Black "C"?) `favicon.svg`; the `favicon.ico` in `public/` is a 32×32 PNG; no apple-touch-icon / manifest / PNG sizes; `og:image` lacks width/height/alt; `<title>` uses ` — ` · all · design · **P1** (Wil: a real favicon) · `public/favicon.svg`, `Base.astro:44–69` → I1 CN monogram (Caslon paths, 3 candidates on `/styleguide`, juror pick), I2 full set + manifest (base-path-correct), I3 head wiring via `withBase()`, I4 `build-og.mjs` port (currently ENOENT on Martel/Poppins) · **I1–I4** · P2

### A12 · Latent

- **V7-073** · `/styleguide` `noIndex` (verify), em dashes in specimens · — · P3 · **G-L1** · P2/P4
- **V7-074** · docs drift (`DESIGN-STANDARDS.md` §1/§7, `Icon.astro:4`, `global.css:1072` lanes, `TroyMap.tsx:48` `pinPosition`) · — · P3 · **G-L2** · P8
- **V7-075** · trailing-slash URLs 404 on GH Pages (`/bakery/`) · — · ux · P2 · **G-L3** · P2 (inline strip-and-redirect in `404.astro`)
- **V7-076** · `WalkProgress.astro:53` sr-only `—`; `paintings.astro` `data-title`/alts · — · P3 · **G-L4** · P4/P7

### A13 · Added by the desktop/tablet walk (new IDs; folded into the phases above)

- **V7-077** · /map walk + focused mode, desktop/tablet: the 72 px bottom-right ☰ sits ON the third carousel card (title/art covered) · 768/1024/1280/1440/1920 · ux · **P1** · `uxwalk-desk/map-1440-05-walk-stop2.png` (UXD-03) → card strip padded so no card sits under the ☰ (plan decision); ☰ stays bottom-right in its lane · **M9 (desktop)** · P5
- **V7-078** · `Stop the walk` overlaps the active card's top edge by ~8 px on desktop (bottom-52 vs 192 px card) · 1024–1920 · design · P2 · UXD-18 → M3 top-right · **M3** · P5
- **V7-079** · Escape does nothing on /map (does not close the lens, pause the walk, or leave focused mode) · all · a11y · P2 · `uxwalk-desk/04-a11y.json` (UXD-20) → one keydown handler: Esc → close lens → pause walk → back to overview · **NEW (M4/L4)** · P5
- **V7-080** · /paintings keyboard: approaching via a dot drops focus to `<body>`; Escape then lands focus in the 2-D grid 10 000 px below and the page jumps · all · a11y · P2 · UXD-21 → focus `Back to the hall` on approach; restore focus to the dot on exit · **NEW (U6/U10)** · P7
- **V7-081** · chapters: the ☰ is the LAST tab stop (Menu rendered after `<main>`), and the spine rail repeats in every section (4× per chapter) · all · a11y · P2 · UXD-22 → render `<Menu>` before `<main>` in `Base.astro` (fixed positioning is unaffected); one `<nav>` per page (V7-008) · **NEW** · P2/P4
- **V7-082** · first keyboard activation of Play is dead: the `client:visible` AudioStory island has not hydrated when Tab scrolls the button into view (Enter #1 no-op, Enter #2 plays) · all · a11y · P2 · UXD-24 → `client:visible={{rootMargin:"600px"}}` (or `client:idle`) so hydration precedes focus; verify with the a11y keyboard walk · **NEW** · P4
- **V7-083** · narration paragraphs ("Tap any paragraph…") are pointer-only; not focusable · all · a11y · P3 (seek is available via the slider, so WCAG 2.1.1 is met) · UXD-23 → accepted; hint copy says "Tap/Click" per pointer type; note in REVIEW-GUIDE · — · P4 (copy)
- **V7-084** · label leader lines cross at 768/1024 (`5 BARBERSHOP` × `2 COMMISSIONER'S OFFICE`); desktop overview zoom 14.5 makes the loop a small block in a sea of grey · 768/1024/1440/1920 · design · P2 · UXD-29/30 → M2's fit (tighter padding ≈ zoom 15.3 on ≥1280) + `pinOffset` quadrant flip for Barbershop · **M2** · P5
- **V7-085** · /map at 200 % zoom (720×450): the hint pill hides under `Take the walk`; 2 of 5 stops in view · short viewports · a11y · P2 · UXD-17 → M2 safe box uses the real control rects; hint pill above the doors under a max-height query · **M2/M8** · P5
- **V7-086** · /paintings at 200 % zoom / short landscape: the plaque covers ~40 % of the painting · 720×450, 844×390 · a11y · P2 · UXD-16 → U7 landscape composition (column) + sheet below ~560 px stage height · **U7** · P7
- **V7-087** · 2-D grid tiles crop the art (3:2 `object-fit:cover`; the portrait work reduced to its middle third) · all · design · P2 · UXD-15 → U8 real-aspect tiles · **U8** · P7
- **V7-088** · Mapbox control buttons keep the default blue focus ring · /map · a11y · P3 · UXD-45 → `.mapboxgl-ctrl button:focus-visible` house outline · **NEW** · P5
- **V7-089** · menu panel has no current-page indication · all · ux · P3 · UXD-37 → `aria-current="page"` + a quiet marker (or hide the current page like the footer) · **NEW (N)** · P2
- **V7-090** · reduced-motion `/paintings` offers no hint that the hall exists · RM · ux · P3 · UXD-48 → one quiet line above the grid ("The 3-D hall opens with motion enabled") · **NEW (U10)** · P7
- **V7-091** · straight quotes/apostrophes in `/about`, `/404`, `/paintings` copy beside curly ones · all · design · P3 · UXD-40 → smart quotes (punctuation-only; log if inside locked prose) · **NEW (G5)** · P6/P7
- **V7-092** · footer content suggestions (institution line, © year, artist credit) and a ~230 px dead band above the rule on `/paintings` · all · design · P3 · UXD-10 → Wil said same content/links: content additions go to the REVIEW-GUIDE queue; the dead band is fixed with F1 · **F1 / human queue** · P3/P8
- **V7-093** · story column vs quote/heading column horizontal jog on desktop (x 136 vs 476) · 1440/1920 · design · P3 · UXD-31 → the v4 editorial rail is intentional; no change; noted · — · —
- **V7-094** · rail camera never faces a painting without clicking; hall end is a bare wall + glow · ≥768 · design · P3 · UXD-32/33 → U4 look + U9 stretch (doorway/steps) · **U4/U9** · P7
- **V7-095** · browser Back from a chapter restores /map at plain overview (focused card lost) · all · ux · P3 · UXD-44 → persist `activeIdx`/focused in sessionStorage; restore on load (cheap, in M4's state work) · **NEW (M4)** · P5
- **V7-096** · /404 H1 → body ~150 px · all · design · P3 · UXD-53 → tighten to a token · **NEW** · P3
- **V7-097** · portrait tablet (768): home eyebrow + wordmark across the face; chapter hero crops the top of the central figure's head · 768 · design · P3 · UXD-50/51 → H1/C7 per-orientation focus covers 768 · **H1/C7** · P3/P4

---

## 3 · Hand UX walk (fresh eyes)

Full lists: `docs/v7/uxwalk-phone.md (scripts in `scripts/uxwalk/`)` (45 findings: 1 P0 · 7 P1 · 22 P2 · 15 P3) and `docs/v7/uxwalk-desk.md` (54 findings: 0 P0 · 8 P1 · 25 P2 · 21 P3). Every P0/P1/P2 above that came from the walk cites its `UXP-nn`/`UXD-nn`; P3s not worth a ledger row stay in those files. What already feels excellent (both walks agree): the chapter typographic system, the audio player + mini-player restraint, the museum approach on a phone, QR arrival legibility, the 404 copy, zero horizontal overflow at 320, keyboard reach and visible focus everywhere, reduced-motion parity.

Heuristics covered: first visit · QR arrival on each chapter · the walk · the lens · the museum · menu · footer · back-button/deep-link · 320 px · landscape phones · zoom 200 % · reduced motion · tap-target ≥ 24 (≥ 44 primary) · touch-only vs hover-only affordances (none hover-only found; the grid tile lacks a touch `:active`) · console errors. Not testable locally: the no-Mapbox-token fallback (the placeholder branch exists in `TroyMap.tsx:849`) — covered by code review only.

---

## 4 · Footer references (F1) — 10 lines

Sources and the reference table: `docs/v7/footer-references.md` (LAS Art Foundation HM · Draw History SOTD · Milwaukee Art Museum HM · Käthe Kollwitz Memorial SOTD · Obama Presidency Oral History HM · Augustinus Fonden HM · Pentagram SOTD · Royal Ontario Museum HM).

1. Two-tier structure is the norm: a content grid, ONE full-width hairline, then a small muted meta row — the `rule-top` disclaimer row under the 3-col grid is exactly the reference pattern (0.75–0.875 rem, ~60–65 % ink, one line desktop, free wrap mobile).
2. 3-col desktop grid: wordmark block left (widest span), nav as a plain vertical list centre, Share/action right and narrow.
3. Mobile stacking: wordmark → nav → Share → hairline → disclaimer, `gap ≈ 1.5rem`, hairlines between stacked blocks.
4. A large quiet decorative wordmark IS common on memorial/museum footers, kept quiet by same-hue reduced-opacity colour, tight leading, a `clamp()` size cap and air (not a fill colour); for Caslon: one line, `clamp(1.75rem, 4vw, 3rem)`, ~70 % ink.
5. Nav: plain vertical list, no heading, 0.875–1 rem, 0.35–0.5 rem rhythm; hover = offset underline or the arrow-reveal slide (matches the house arrow idiom); no icons.
6. Hairlines: 1 px, text hue at low alpha (never neutral grey on a warm ground); one rule above the disclaimer, optionally one at the footer top; no vertical rules between columns.
7. Padding: top 2.5–3.75 rem, grid→rule 2 rem, rule→legal 1.125–1.75 rem, bottom 2.5–2.75 rem (6 rem under a giant wordmark) → CNWM `padding: 3rem 0 2.5rem; .rule-top{margin-top:2rem;padding-top:1.5rem}`.
8. Credit ("Made by Notable") is first-class but smallest and muted, under the wordmark; the disclaimer alone on the rule-top row.
9. Share = a single low-key text link with the arrow idiom, top-aligned with the nav's first item; no social icon row.
10. Tone: let ONE element carry weight (the name), everything else one small size, one hairline, fixed rem rhythm, no extra decoration.

---

## 5 · Fix-in-phase index

P2 Foundations: V7-001 002 003(instr) 004 011 012 021 048 055 060 072 073 075 081 089 · P3 Home+footer: 005 015–020 058 059 092 096 097 · P4 Chapters: 006 007 008 010 013 014 022 041–047 049–054 056 057(guide) 076 082 083 · P5 Map+lens: 009 023–040 077–079 084 085 088 095 · P6 People+About: 061 062 091 · P7 Museum: 063–071 080 086 087 090 094 · P8 Gate/docs: 020 057 074 092.
