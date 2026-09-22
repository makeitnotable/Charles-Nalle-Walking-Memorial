# CNWM v4 — The Craft Run (Award-Caliber Rebuild)

*Written 2026-08-03. This document is **fully self-contained** and written for a fresh
session with NO prior conversation context. Everything needed is in this file + the repo
docs it names. Wil pastes the KICKOFF PROMPT (bottom of this file) to start; the session
then runs fully autonomously: audits → design system → polish the entire site → map fixes →
deploy. Wil's words: deliver "an award winning site-wide design that I will love." No
mid-run check-ins — queue anything genuinely needing him in the review guide.*

---

## 1 · Context — what exists and what Wil said

**The project:** Charles Nalle Walking Memorial — a 5-stop walking-tour story site for the
Hart Cluett Museum (Troy, NY): the 1860 rescue of Charles Nalle, led by Harriet Tubman.
Mark Priest's paintings + sketches + animated painting videos, Kathy Sheehan's narration
audio, bronze QR plaques on the actual sidewalks. Astro 7 + Tailwind 4 + React islands +
GSAP + Mapbox GL, fully static, deployed by CI to GitHub Pages on every push.

- **Repo:** `/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2`
- **Live:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
- **Branch hazard:** local `main` tracks `origin/v2`. Plain `git push` is safe (goes to v2).
  **NEVER push `main:main`** — `origin/main` belongs to the legacy SPA. CI deploys `v2`.

**History:** v3 (an overnight run, ~50 commits, finished 2026-08-03 5am) rebuilt the site to
match the stakeholder-approved design spec with measured fidelity — every hex exact, every
type value exact — revived the previously-invisible map, and hardened performance
(chapter path 4.79MB → 598KB). Its full history: `docs/RUN-STATE.md`, reviews under
`docs/qa/reviews/`. **Do not re-read all of that; this file carries what matters.**

**Wil's verdict on v3 (verbatim):** *"Overall, it is a start… but I'm not in love with the
final output, it feels a little bit like a step backwards. It doesn't feel polished or
professional… Overall the site looks sloppy and like it was thrown together."* The good,
per Wil: the map is alive and working; performance is better.

**The root cause (understand this — it is the whole reason v4 exists):** v3's review gates
measured *fidelity to spec*, and the spec's own source (a mid-fidelity legacy build) was
never design-grade. Reviewers passed 27px buttons, ragged three-column layouts, and crude
ad-hoc SVG arrows because they matched the porting notes. **Fidelity ≠ craft. v4's only
acceptance bar is craft**, measured against three inspiration sites.

**The v4 bar (Wil):** *pasqua.it (immersivity, storytelling) × artsandculture.google.com
(visual design, organization, layout, presentation) × museos.arteyeducacion.org (motion and
visual design) "had a baby"* — clean, pretty, in the existing Figma identity (warm
brown/orange ramps, Martel Sans, Poppins). Figma defines required content + page flow;
**full creative freedom on execution quality is explicitly granted.** Must look incredible
at 390 / 768 / 1440.

## 2 · Wil's eight named defects (each must demonstrably die)

| # | Defect (his words, compressed) | Dies in | Proof required |
|---|---|---|---|
| W1 | Icons — "the arrows for example look terrible" | P1 | icon sheet + before/after |
| W2 | "The buttons are unbalanced" | P1 | button-pair screenshot at 3 widths |
| W3 | Map route "so low contrast that it is invisible — an accessibility issue" | P3 | grayscale screenshot shows the route plainly |
| W4 | "Spacing and layout… lacking a visual hierarchy" | P1+P2 | squint-test pass on every page |
| W5 | "The site looks sloppy and thrown together" | all | caliber gate green |
| W6 | Names/titles "do not reflect the requested changes / updates and are inconsistent" | P0+P4 | canon table + ledger cross-check |
| W7 | "The sketches have replaced the chapter pages hero image — this should not have been done" | P2 | hero = animated painting, screenshot |
| W8 | Chapter template must be THE most beautiful/engaging/immersive artifact | P2 | flagship caliber gate green |

## 3 · Locked decisions (Wil answered these directly — do not re-litigate)

1. **Chapter hero = the finished ANIMATED PAINTING** (mp4 loop, poster-first for LCP).
   The press-and-hold sketch→painting interaction **relocates to its own designed "From the
   sketch" section** in the chapter body (the artist's-process beat). Keyboard/tap/
   reduced-motion paths must survive the move.
2. **Names/titles:** verify every displayed name/title/label against the requested-changes
   ledger (`docs/CONTENT-STATUS.md` + `<project>/Context/Website Edits.pdf`, one directory
   above the repo) and **canonicalize one naming system** (schema in §7.8).
3. **Type voices:** **add Martel (serif)** — same foundry/family as Martel Sans, designed to
   pair — as the narrative-prose and quote voice. Martel Sans keeps display. Poppins keeps
   labels/buttons. (`@fontsource/martel`, weights 300+400 only, latin subset. Martel has no
   italic — never fake one.)
4. **Run mode:** fully autonomous through deploy. Wil reviews the final live result.

## 4 · Operating protocol (compaction-proof — MANDATORY from minute one)

This run lasts many hours unattended; context WILL be compacted. Disk is truth:

1. **First actions:** `git mv docs/PLAN.md docs/PLAN-v3.md` (preserve history), copy THIS
   file to `docs/PLAN.md`; archive `docs/RUN-STATE.md` → `docs/RUN-STATE-v3.md`; create a
   fresh `docs/RUN-STATE.md` (structure: CURRENT PHASE · LAST COMMIT · DONE w/ timestamps ·
   IN PROGRESS — exact next action a stranger could resume · BLOCKED/NOTES · GATE VERDICTS).
   Commit + push.
2. Update RUN-STATE after **every sub-step**; the IN PROGRESS line is written BEFORE
   starting the step it names. Commit small + push at least every 3 commits.
3. All findings go to files under `docs/v4/` the moment they exist — never held in
   conversation. Screenshots to `docs/v4/qa/<phase>/`.
4. **Re-orientation ritual** (session start + anytime context feels thin):
   `docs/PLAN.md` → `docs/RUN-STATE.md` → `git log --oneline -10` → resume from IN PROGRESS.
   Never redo work marked DONE; verify via git, not recollection.
5. Memory checkpoint at every phase boundary (auto-memory file `cnwm-project-state.md`).
6. **Look at everything you build.** The harnesses are the eyes: `node scripts/shots.mjs
   <outdir> [--base URL] [--routes /a,/b] [--scrolls N]` (all routes × 390/768/1440),
   `node scripts/perf.mjs` (Lighthouse), `node scripts/map-probe.mjs` (map diagnostics).
   Never ship an element you haven't seen rendered in a screenshot. Playwright is the only
   trusted eye — never markup greps, never assumption.
7. Build guard: `npm run build` runs `scripts/check-css.mjs` (island-CSS guards) — keep
   green. `npx astro check` must stay at 0 errors.

## 5 · The craft diagnosis (why v3 reads sloppy — internalize before designing)

What all three inspiration sites share, that v3 lacks (verified hands-on, on file in
`docs/qa/inspiration/{museos,pasqua,googleac}.md` with screenshots):

1. **Few sizes, violent jumps.** 3–4 type sizes per site with 2.7–5× jumps (museos: 15px
   labels / 54px names / 110px display). v3 runs a smooth ×1.25 ladder where adjacent
   levels are near-indistinguishable — *nothing wins*. This is precisely "lacks hierarchy."
2. **Two type voices.** Serif prose against sans chrome. v3 is two sans faces = one voice.
3. **Composed whitespace.** 330–440px deliberate voids; half-empty viewports as pacing
   (museos leaves the entire left half of the screen empty except one spine numeral). v3
   caps gaps at 64px on a dense, even grid — flat and airless.
4. **Unboxed chrome.** GA&C: zero card borders — the image IS the card; text hangs below on
   a fixed eyebrow(11px caps)/title(15–16px)/meta(12px gray) micro-grid with identical
   y-offsets (26/12/12) on every card of every page. pasqua boxes exactly ONE element per
   screen. museos chrome is bare text on hairlines that run full-bleed while content
   insets. **v3 boxes everything** — 1–2px #69311d borders + rounded-3xl on every surface.
5. **1px-stroke geometric icons ≤24px** (museos play = 46px circle, 1px stroke, 9px glyph).
   v3 has three unrelated arrow idioms at stroke widths 1.2/2/2.5 — one visibly distorted
   by non-uniform SVG stretch (the map-card arrow, `preserveAspectRatio="none"`).
6. **Editorial numbered spines** — "(0)…(8)" large, quiet, in their own column (museos);
   "(CH. I)" over-title lockups reused at exactly two scales (pasqua).
7. **Ground shifts mark act changes** — museos flips dark→cream for reading passages. v3 is
   one brown on every pixel of every page; no register change anywhere.
8. **Motion on ~2 durations + 1 easing.** v3's motion inventory has 12 durations and 4
   easings — motion reads thrown-together exactly the way inconsistent spacing does.
9. **Counts and scope stated honestly** (GA&C "2 stories", banner = exactly 4 elements) —
   quiet section headers; the artwork carries hierarchy, headings only label.

**v3 concrete breakage** (from code inventory — all fixed in their phase):
- 8 divergent button patterns / 24 instances; some 27px text at lg; 404's buttons lack the
  responsive ladder entirely; map chrome is a 4th sub-variant at a different size.
- Route line `#F26835, w3.5, dasharray [0.1,2], opacity .85` = sparse dark-orange dots on a
  dark map — invisible (W3).
- Chapter hero block 1344px wide vs the 1280px `max-w-7xl` shell everywhere else — a
  visible registration error.
- Four different section gaps inside the chapter template alone; page top paddings disagree
  across pages (`pt-16` vs `pt-10` vs `mt-6`).
- Naming: FIVE surfaces (`title` / `cardTitle` / `map.label` / `next.label` / a hardcoded
  list in `Menu.astro:16-22`) with conflicts — map pill says "Commissioner's Office" while
  its own card says "Office of the Commissioner"; `next.label` for bakery is free-text
  ("Where the story began"); `TroyMap.tsx:39` hardcodes a label string in `PIN_ABOVE`.
- Bugs: `[chapter].astro` historical `<video>` has TWO class attributes (second wins →
  `lazy-video` dropped → that video never lazy-hydrates); stop-1 map pill can hide entirely
  inside stop-2's pill at overview; mini-player time pill clips its last digit; mini-player
  and menu burger collide in the same corner; sub-16px text carries comprehension content in
  ~6 places (home mission 12px, hints 12px, addresses 12px).

## 6 · Keepers — do not regress (v3 got these right)

Working map (deep links `?stop=`, guided tour, 1860 lens, geolocate, carousel two-tap +
camera-follow — **style the carousel, do not restructure its DOM**: keen-slider was
stabilized by keeping it permanently mounted; structural changes reopen a nasty remount
desync) · curtain page transition (timing/fail-open logic intact; text restyles) · corner
menu concept (the 72×72 notched burger is approved identity) · AudioStory sync machinery
(timings, paragraph-tap seek, mini-player latch behavior) · all content data
(`src/content/chapters/*.json` — Kathy's narrative is verbatim-sacred; Brian's pin
coordinates exact) · media pipeline (`public/media/<slug>/`: `sketch`, `horizontal`
(painting still), `reveal-horizontal|vertical` (animated painting mp4 + `-poster.jpg`),
`historical`(+mp4), `moral`, `square`, site assets) · perf discipline (lazy-video system in
`Base.astro` — films load via IO + after window `load`; LCP preload prop; `overflow-x:
clip` on root guards fixed-UI blowouts) · reduced-motion parity 100% + a11y (keyboard
end-to-end, AA contrast — the time-pill uses dark-on-orange for AA; keep) · harnesses ·
GH Pages CI · zero-ongoing-cost constraint.

---

# 7 · THE v4 DESIGN DIRECTION
*(Starting spec. P0's fresh audits confirm/amend with measured evidence, then
`docs/v4/DESIGN-STANDARDS.md` becomes the single acceptance bar. Numbers below are the
default — change them only with audit evidence, and record why.)*

### 7.1 Type — three voices, four sizes, violent jumps

| Role | Face/weight | 390 | 768 | 1440 | Leading · notes |
|---|---|---|---|---|---|
| Display | Martel Sans 800, caps per Figma | 44px | 72px | 96–104px | 0.95, tracking −0.02em; authored line breaks; ~5× prose at 1440 — THE jump |
| Subhead / Quote (share one size slot) | Martel Sans 600 / **Martel serif 300** | 28 | 34 | 42 | 1.15 (subhead) / 1.35 (quote, hung punctuation) |
| Prose | **Martel serif 400** | 19 | 20 | 21 | 1.75; measure ≤66ch; serif floor 18px — never smaller, never for UI |
| Meta (ONE unit) | Poppins 500, caps, +0.14em | 12 | 13 | 13 | **does not scale with viewport** — the fixed micro-grid; labels only, never comprehension text |

Plus: meta-body (Poppins 400, 14px, gray-11) for addresses/captions; button text (Poppins
500, 15px md / 13px sm); spine numerals (Martel Sans 300, ~28–32px, "(01)"). The v3 roles
`.type-eyebrow/.type-muted/.type-progress/.type-card-title` and the ×1.25/×1.5 ladder die.
Eyebrow lockup everywhere: meta → 16px → title → 12px → meta-body (GA&C's fixed offsets).

### 7.2 Spacing — three tokens, composed voids

`--space-block: 24px` (intra-component) · `--space-section: 160/200/240px` (390/768/1440)
between numbered sections · `--space-void: 320/360/440px` — **max two voids per page**, at
act changes (hero→story, moral→onward). Every vertical gap quantizes to these three.
Asymmetry rule: content hugs the TOP of a void (pasqua's half-empty viewport), never
centers. Hairline section rules run full-bleed while content insets (museos). **One shell:
`max-w-[1280px]`** — the hero registration error dies.

### 7.3 Un-boxing — a border marks an ARTIFACT, never a text container, never chrome

- **Keeps the frame** (1px primary-6): hero media, From-the-sketch media, historical
  media, the embedded map, the moral inset painting, map stop-cards + pills (functional),
  menu panel, the home photo frame. Radius calms: 24px on hero/home frames only, 12px
  elsewhere.
- **Loses the box:** audio player (becomes an unboxed story object on hairlines), transcript,
  quotes, ALL text blocks, People cards, Paintings grid, About media, footer, hint chips,
  dialog chrome → GA&C treatment: flush image + eyebrow/title/meta stack, hairline dividers.
- **Pasqua census rule: ≤1 framed element per viewport** (enforced by the caliber rubric).

### 7.4 Ground shift — one cream register (museos act change)

`--ground-light: #f6f3ee` (neutral-12) with ink `#1d1411`. Applied to exactly two places:
the transcript reading passage inside the story section, and About's long text. Narration
highlight gets a cream-ground variant (soft `#f4ddd0` wash + hairline left rule). Everything
else stays the dark cinematic register (hero, moral, map). Prototype BOTH registers in the
styleguide before committing (serif + sync-highlight legibility check at 19px).

### 7.5 Buttons — two sizes, two variants, no viewport ladder

`btn` (15px Poppins 500, 48px height, px-28px, pill) · `btn-sm` (13px, 38px, px-20px).
Variants: **solid** (bg primary-10 `#e45b27`, text primary-2 `#1d1411` — dark-on-orange for
AA ~4.9:1; hover bg primary-9) · **ghost** (1px border primary-7, text primary-11, hover
text primary-12). Pairs are always same size, solid+ghost ("Continue the walk" / "Get
Directions") — equal optical weight, fill = primacy only. Home's approved inverted cream
pill stays (adopts btn metrics). All 24 existing instances collapse to
`src/components/Button.astro` + shared classes for islands. 27px button text dies.

### 7.6 Icons — one file, one weight

New `src/components/icons.ts` (path data shared by an `Icon.astro` + TSX use): 24px
viewBox, **1.5px stroke**, round caps/joins, `currentColor`, never non-uniformly scaled.
Glyphs (~8): arrow (one idiom — rotate for right/down/external), chevron, close, play,
pause, share, pin, plus. The three ad-hoc arrow idioms and the stretched card arrow die (W1).

### 7.7 Motion — two durations, one easing, one overshoot

`--dur-fast: 300ms` (hover, pills, highlight) · `--dur-slow: 900ms` (reveals, wipes, quote
settle) · easing `cubic-bezier(0.22, 1, 0.36, 1)` everywhere. Reveal vocabulary: opacity +
24px rise, 60–90ms stagger; display type may use per-line mask rises; media may clip-wipe +
scale 1.04→1. **Documented exceptions:** curtain keeps its circ timing (set-piece); map
cameras keep cinematic durations (flyTo/easeTo language); the ONE `back.out` overshoot is
the corner-menu bloom. All 12 stray durations remap. Reduced-motion parity stays 100%.

### 7.8 Naming canon (W6)

Schema change in `src/content.config.ts` + all 5 chapter JSONs — one object per chapter:
`name: { canonical, display, short }` (display = line-broken form; short = pill/menu form).
Derivations: hero H1 ← `display` · cards/`<title>`/curtain labels/People chips ←
`canonical` · map pills + menu ← `short` · next-links ← generated `"Chapter {order} —
{canonical}"` (free-text variants die). `Menu.astro`'s hardcoded list regenerates from
`getCollection`. `PIN_ABOVE` becomes a `pinPosition` field in JSON (stop 2 above; others
below). Proposed canon (P0 verifies against the ledger): Holeur's Fashionable Bakery/Bakery ·
Office of the Commissioner/Commissioner's Office · Uri Gilbert Mansion/Gilbert Mansion ·
Washington Street Ferry Landing/Ferry Landing · Peter Baltimore's Barbershop/Barbershop.
**P0 ledger step:** cross-check every displayed string against `docs/CONTENT-STATUS.md` +
`Context/Website Edits.pdf`; correct labels; log every change. Narrative prose is Kathy's
domain — anything that would change meaning gets flagged in the ledger, never edited.

### 7.9 Map route (W3) + map chrome

Route: two layers replacing the current single layer — casing `#100A06`, width
zoom-interpolated 5.5→9 (z14→z17), opacity .85, under main line `#FF9770` (primary-11),
width 2.5→4, opacity 1, solid, round caps. Self-draw animation kept (progressive GeoJSON
feed). Acceptance: **the route reads plainly in a grayscale screenshot** (≥3:1 vs ground,
pixel-verified). Same treatment in `EmbedMap.tsx`. Chrome: doors/Overview/hint → `btn-sm`
ghost + Icon set; place chip → meta unit; pills keep approved state colors but adopt the
fixed meta type (no viewport ladder) and get a collision pass at overview (stop 1 must
never hide inside stop 2 — nudge anchors by order; verify screenshot).

---

# 8 · Chapter template — the flagship (W7, W8; Figma flow preserved, presentation elevated)

Flagship build target: **`/commissioners-office`** (hardest case — two scenes); perf gates
still measure `/bakery` (the QR reference path). Structure:

1. **Hero — the animated painting.** Full-height, registered to the 1280 shell, inside the
   signature 24px frame. Media = `reveal-horizontal.mp4` loop (portrait:
   `reveal-vertical.mp4`), **poster-first**: LCP is the painting poster (P2 extends
   `scripts/build-media.mjs` to emit webp/responsive posters for the reveal videos — only
   `.jpg` posters exist today; **new filenames**, GH Pages caches aggressively); video src
   attaches after window `load` (existing lazy-video path); reduced-motion/no-JS = still
   painting. Lockup: meta row ("STOP 02 OF 5 · TROY, NY · APRIL 27, 1860") → "(CH. 02)"
   over-title unit (pasqua; reused at exactly two scales site-wide) → display title from
   `name.display` → refined rule. Scroll-scrub kept, scale capped ~1.15.
2. **Editorial spine.** At lg: a left rail with "(01) LISTEN · (02) THE SKETCH · (03)
   HISTORY · (04) THE MORAL · (05) ONWARD" in meta type, current section emphasized,
   doubling as anchor nav; ≤768 collapses to inline "(0N)" eyebrows. Replaces all
   "Section N/4" labels.
3. **(01) The story.** Scene quote first — serif quote, unboxed, alone in a composed void.
   Then the audio object: unboxed play control (Icon set) + title + time on a top hairline;
   the approved two-state color behavior persists subtly (ground lifts while playing).
   Transcript below on the **cream ground register**: Martel serif 19–21/1.75, serif
   drop-word, re-tuned sync highlight, "tap any paragraph to hear it read" affordance kept.
   Ch2 renders both scenes here in sequence. **Mini-player relocates bottom-LEFT** (menu
   owns the right corner — collision dies) with `tabular-nums` + min-width (clip bug dies).
4. **(02) From the sketch.** The relocated press-and-hold: label-left (meta eyebrow + two
   serif sentences on Mark Priest's process), framed sketch right — press-and-hold develops
   it into the painting (progress hairline; tap/keyboard/reduced paths intact = crossfade
   toggle). The full-bleed painting interlude (Ken Burns band) stays as the pasqua moment,
   now placed AFTER this section, edge-to-edge, zero chrome, credit chip.
5. **(03) Historical context.** Label-left/prose-right (museos): 4-col label rail + 8-col
   content at lg. Facts as hanging "(1)(2)(3)" meta numerals on a fixed numeral column —
   the orange chips die. Archival media keeps its frame; **fix the double-class bug so its
   video lazy-loads.** Long prose = serif reading passage (cream register if the styleguide
   prototype wins; otherwise dark serif).
6. **(04) The moral.** Full-bleed dark pasqua moment: moral painting edge-to-edge, scrim,
   display statement with line-mask reveal, serif message ≤66ch, the inset square painting
   keeps its frame as the viewport's one artifact. Entered via a void.
7. **(05) Onward.** Framed cinematic embed map + destination lockup (meta "NEXT — STOP 03"
   + canonical name + address in meta-body) + ONE equal-weight `btn` pair (Continue the
   walk / Get Directions). GA&C banner discipline: four elements, nothing else.
8. **Footer band** (identical site-wide): full-bleed hairline top rule; one row on the
   shell — wordmark/credit left, lateral links center (real ≥24px targets), share `btn-sm`
   right. The three-sizes hodgepodge dies.

# 9 · Other pages

- **Home:** the approved stack IS the pasqua title card — keep it verbatim (frame, film,
  CHARLES/NALLE wordmark, dates, cream pill, mission line). Fixes only: contour overlay
  removed or ≤8% opacity (currently reads as scratches across the CTA), mission copy ≥14px,
  wordmark optical-spacing pass, entrance re-timed to the new motion tokens.
- **People:** GA&C unboxed grid (image/eyebrow/title/meta stacks, hairline dividers);
  Tubman quote-first kept; canonical chapter chips.
- **Paintings:** image-is-the-card grid; eyebrow/title/credit stacks; dialog re-chromed
  (btn-sm, Icon close, animated-painting playback kept).
- **About:** serif editorial layout; portraits at proper scale; closing walk-banner kept,
  unboxed.
- **404, styleguide:** on-system. **Menu/curtain:** same concepts, re-set in the new
  type/spacing (curtain wordmark + "APRIL 27, 1860" over-title restyled).

# 10 · Phases and gates

*Every phase: build green (`npm run build` + `astro check`) → screenshots → gate → fix loop
→ commit/push → RUN-STATE. Gate reviews are **fresh subagents given only screenshots + the
rubric — never the spec, never builder context.***

| Phase | Work | Gate |
|---|---|---|
| **P0 Audits (~3h)** | (a) 3 parallel agents deep-dive the inspiration sites hands-on (Playwright: 390+1440, many scroll depths, computed-style measurements — type px/leading, gaps, box census, durations) → `docs/v4/AUDIT-INSPO.md` with numbers; (b) CNWM page-by-page failure census, every route × 3 viewports, each of W1–W8 mapped to every occurrence → `docs/v4/AUDIT-CNWM.md`; (c) naming/content ledger cross-check → `docs/v4/NAMING-CANON.md`; (d) synthesize → **`docs/v4/DESIGN-STANDARDS.md`** (amend §7 with evidence) + **`docs/v4/CALIBER-RUBRIC.md`** (§11) | Independent agent confirms: "followed exactly, these standards produce inspiration-level output" — with named gaps; revise until none |
| **P1 System (~2.5h)** | `global.css` v4 (voices w/ `@fontsource/martel`, 4-size scale, 3 spacing tokens, unbox rules, motion tokens, cream register), `icons.ts` + `Icon.astro`, `Button.astro`, meta unit; **styleguide v2** proves everything (type specimen, both grounds w/ sync-highlight demo, button pairs, icon sheet, spacing/void demo) | Caliber gate on styleguide screenshots (esp. W1/W2 kills) |
| **P2 Flagship (~4h)** | Rebuild `[chapter].astro` + restyle `AudioStory.tsx` + `PressReveal.tsx` per §8 on `/commissioners-office`; poster pipeline (`scripts/build-media.mjs` ext.); bug fixes (double-class, mini-player left + tabular-nums); 3 viewports, full motion | **THE make-or-break caliber gate**: flagship beside museos/pasqua/GA&C shots. Iterate HERE until green — never carry a weak template into rollout |
| **P3 Map + Home (~2h)** | §7.9 route/chrome/pins/collision; `pinPosition` data-driven; Home fixes (§9); regression: tour, `?stop=`, lens, geolocate, two-tap all still work | Caliber + W3 grayscale proof + keeper regression checklist |
| **P4 Rollout (~2.5h)** | 4 remaining chapters (template-driven; per-chapter media/content QA), People/Paintings/About/404, menu/curtain restyle, naming sweep site-wide (schema + all surfaces) | Caliber per page-type on full matrix |
| **P5 Motion (~1.5h)** | Duration/easing consolidation sweep, choreography polish, `docs/v4/MOTION.md` census (exactly 2 durations + documented exceptions) | Motion review: census verified, reduced parity 100%, zero scroll-jack/CLS |
| **P6 Ship (~2h)** | `perf.mjs` (no regression: home ≥90, chapter ≥89 + a11y 100, chapter path ≤650KB, LCP poster verified), QA matrix + console clean, deploy, live verification, regenerate `og.png` to the new lockup | **Final gates on LIVE** (§11) + `docs/v4/REVIEW-GUIDE.md` for Wil (what changed, before/after pairs for W1–W8, residuals, standing items) |

Timebox ≈17h. If compressed: P0–P2 are non-negotiable; P3 next; P4 prioritizes chapters;
P5 folds into P4; P6 minimum = perf + caliber gate + live verify.

# 11 · The CALIBER rubric (replaces spec-fidelity review — the only visual bar)

Run by fresh subagents given ONLY screenshots + this rubric:
- **(a) Side-by-side:** the page beside a same-purpose inspiration screenshot — "which
  studio shipped this?" must read as parity.
- **(b) Hierarchy scan:** a 3-second glance names exactly ONE winner per viewport.
- **(c) Squint test:** blurred ~8px, the composition still reads (structure survives).
- **(d) Spacing measurement:** every section gap measures to one of the 3 tokens.
- **(e) Type census:** ≤4 rendered sizes per viewport (excluding display/meta pairing).
- **(f) Box census:** ≤1 framed element per viewport.
- **(g) The Wil test (final, live only):** an agent role-playing Wil — armed with his
  verbatim v3 complaints (§1–2) — walks the live site; every W1–W8 verifiably dead with
  before/after evidence; answers "would Wil love this?" honestly.
**Any FAIL loops the phase. Two failed loops = REDESIGN that section, don't tweak it.**

# 12 · Risks / blind spots (from planning review — heed these)

- **Serif × sync highlight:** test Martel 19px under the wash on BOTH grounds in the
  styleguide BEFORE P2 lands it.
- **Animated hero vs LCP:** poster-first is mandatory; new poster filenames (GH Pages
  cache); video only after `load`; re-measure the 598KB path in P6.
- **Un-boxing vs identity:** the frame survives on artifacts — that's the identity thread.
  Record the border-reduction rationale in `docs/DEVIATIONS.md`.
- **Martel legibility:** high-contrast face — never below 18px, never on meta, check the
  300-weight quote on dark at 390.
- **keen-slider fragility:** restyle classes only; never restructure the carousel DOM or
  its mount pattern.
- **Home/curtain/menu are approved identity** — token alignment and polish only; no
  structural redesign there.
- **Content boundary:** labels/names only; narrative meaning changes → ledger, never edit.
- **Deploy:** plain `git push` only (lands on v2). GH Pages latency ~3min; verify live with
  fresh screenshots, not assumptions.

# 13 · Critical files

`src/styles/global.css` (system v4) · `src/pages/styleguide.astro` (proof) ·
`src/pages/[chapter].astro` + `src/components/AudioStory.tsx` +
`src/components/PressReveal.tsx` (flagship) · `src/components/TroyMap.tsx` +
`src/components/EmbedMap.tsx` (map) · `src/pages/{index,map,people,paintings,about,404}.astro`
· `src/components/Menu.astro` · `src/layouts/Base.astro` · `src/lib/curtain.ts` ·
`src/content.config.ts` + `src/content/chapters/*.json` (naming schema; labels only) ·
NEW: `src/components/icons.ts`, `src/components/Icon.astro`, `src/components/Button.astro`
· `scripts/build-media.mjs` (poster ext.) · docs under `docs/v4/`.

# 14 · Standing items (NOT this run's scope — keep queued in the review guide)

Kathy's word-for-word sign-off · Brian's pin confirmation/painting credits + the plaque typo
("ONCE HOUSE THE"→"HOUSED", must reach Brian before casting) · Amanda's
`hartcluett.org/nalle/*` redirects (bronze QR URLs never point at github.io) · Wil's content
drops (ferry skiff rewrite, Ch2a/Ch4 audio re-records, Athenaeum image) · 1860-map
"painted by Mark Priest" attribution confirmation (one caption line in TroyMap.tsx once
confirmed) · Mapbox style publish + account migration at handoff.

---

## KICKOFF PROMPT (Wil: paste this verbatim into the new session)

> Execute the CNWM v4 plan end to end, fully autonomously.
>
> Ground rules, in priority order:
> 1. **Protocol first.** Read `~/.claude/plans/ultrathink-overall-it-is-fizzy-puddle.md` in
>    full. First actions: in the repo (`<project>/cnwm-v2`), preserve the v3 history
>    (`git mv docs/PLAN.md docs/PLAN-v3.md`; archive RUN-STATE the same way), copy the plan
>    to `docs/PLAN.md`, create a fresh `docs/RUN-STATE.md`, commit, push. From then on disk
>    is truth: update RUN-STATE every sub-step, commit constantly, push often. If context
>    ever feels thin: `docs/PLAN.md` → `docs/RUN-STATE.md` → `git log --oneline -10` →
>    resume from IN PROGRESS. Never redo DONE work; never trust recollection over git.
> 2. Work the phases in order (P0 audits → P1 system → P2 flagship → P3 map+home → P4
>    rollout → P5 motion → P6 ship). The flagship caliber gate (P2) is make-or-break —
>    iterate there until it's genuinely at the inspiration bar; never carry a weak template
>    into rollout. Two failed gate loops = redesign the section, don't tweak.
> 3. The bar is craft, not spec-fidelity — that's the mistake v3 made. Every visual gate is
>    a fresh subagent judging screenshots against `docs/v4/CALIBER-RUBRIC.md` and the
>    inspiration sites. Look at every screenshot you produce with fresh eyes before you
>    commit. When uncertain between two treatments, choose restraint: fewer boxes, fewer
>    sizes, more whitespace.
> 4. My eight named defects (plan §2) must each demonstrably die, with before/after proof
>    in the review guide. The hero is the finished animated painting. The chapter template
>    is the flagship — the most beautiful, engaging, immersive thing on the site.
> 5. Do not stop for my input. Queue anything genuinely needing me in
>    `docs/v4/REVIEW-GUIDE.md`. Finish with: all gates green on the live deploy, the Wil
>    test passed honestly, perf not regressed, and the review guide complete. I expect an
>    award-winning site-wide design that I will love.
