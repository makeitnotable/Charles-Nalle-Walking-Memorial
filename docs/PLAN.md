# CNWM v3 — Approved DNA, Elite Execution (Overnight Autonomous Plan)

*Written 2026-08-02 (evening). Supersedes prior plans in this file. The executing session must be able to run all night with full autonomy and produce an output requiring zero big edits at Wil's morning review. Everything needed is in this file + the referenced docs; do not depend on prior conversation context.*

## Context — why v3 exists

v2 (the overnight Astro rebuild, live at `makeitnotable.github.io/Charles-Nalle-Walking-Memorial/`, branch `v2` of `makeitnotable/Charles-Nalle-Walking-Memorial`) got the **architecture right and the design wrong**:

1. **It replaced an approved design with an invented one.** The stakeholder-approved baseline is the Figma file "Website — Charles Nalle WM" (nodes `1950-16104`, `1950-16312`, `1950-16313` — mobile/tablet/desktop), which the legacy repo's `match-figma-designs` branch implements faithfully over 104 commits. v2 invented a new identity (Fraunces/Newsreader, paper grain, per-chapter palettes) instead of elevating the approved one.
2. **A real rendering bug shipped:** Tailwind v4's Vite plugin never scanned the React island `.tsx` files, so island-only utility classes were never generated. **Confirmed on the live site: the map wrapper's computed height is `0`** — the canvas mounts, the style loads, the token is valid under every referer, zero console errors, but everything is clipped inside a zero-height container. The user sees only page background. Same class of bug breaks the press-and-hold hero (no `aspect-[3/2]` box) and island-only classes throughout. `Base.*.css` contains zero `aspect-ratio` rules.
3. **The approved map UX was downgraded** to generic markers + a dialog card, losing the designed experience (tilted chrome-free overview, stem-and-dot pill markers, bottom overlap-carousel, cinematic camera).
4. **Signature components were lost:** the curtain page transition, the two-state audio player, the corner-notched menu, the hero scroll parallax, the CHARLES/NALLE wordmark, first-word drop caps.

**v2's keepers (do NOT lose these):** static architecture with real deep links + CI, the 95MB optimized media pipeline (`public/media/`, scripts/), Kathy's content corrections in `src/content/chapters/*.json`, narration timings + synced-highlight concept, press-and-hold reveal concept, People/Paintings pages, Brian's exact plaque coordinates, reduced-motion/a11y baseline, the committed Mapbox token setup, `docs/WIL-PLAYBOOK.md`.

**v3 = the approved design DNA × v2's architecture × an award layer** benchmarked against: museos.arteyeducacion.org (motion/content layout), rewildyourself.com (scroll), marseille.laphase5.com (map), pasqua.it (immersion), artsandculture.google.com (storytelling/IA).

**THE NORTH STAR (every decision and every review answers to this):** when Wil wakes up, the live site is something he can show Kathy, Brian, and Amanda that morning. It must feel **instantly familiar** to them — unmistakably the design they approved — and simultaneously land as *"wow, this is so incredible, what a massive improvement."* Familiar + wow. If a choice increases wow but erodes familiarity (or vice versa), find the expression that delivers both; that tension is the craft.

## Locked decisions (Wil, 2026-08-02)

1. **Base:** v2 Astro repo, re-skinned. Work on branch `v2` at `<project>/cnwm-v2`.
2. **Figma:** Wil authorizes the Figma MCP before kickoff → extract screens/variables from the three nodes. **If auth is missing at runtime, do not block:** the Approved Design Language Reference below + the legacy repo are the baseline; proceed.
3. **License:** *"Figma is the core but layouts, type, and color can be evolved to make the design better so long as the improvements respect the core idea. Motion, scroll choreography, transitions, polish and everything else are up to you. No decision lists, no flagging — run with it. The output must feel as incredible as the inspiration sites."* — Full creative autonomy within the approved identity. Wil compares final output vs legacy + Figma himself.
4. **v2 features:** keep press-reveal, synced narration, People, Paintings, entry moment — restyled into the approved language.

## Compaction-proof operating protocol (MANDATORY — read first)

This run lasts many hours unattended; **auto-compaction WILL summarize or drop conversation context, possibly several times.** The session must therefore treat conversation memory as disposable cache and **disk as the only truth**:

1. **First action of the run:** copy this plan into the repo as `docs/PLAN.md`, then create `docs/RUN-STATE.md` — the live run ledger. Structure: `CURRENT PHASE` · `LAST COMMIT (sha + message)` · `DONE` (checklist with timestamps) · `IN PROGRESS (exact next action, specific enough that a stranger could resume)` · `BLOCKED/NOTES` · `REVIEW VERDICTS` (per discipline, per phase).
2. **Update `RUN-STATE.md` after every completed sub-step** — not per phase, per *step* (a fix landed, a review returned, a script ran). The `IN PROGRESS` line is always written BEFORE starting the step it names.
3. **Commit + push relentlessly** — every completed sub-step commits (small, descriptive messages); push at minimum every 3 commits and at every phase boundary. Git history is the recovery ledger; a crash or compaction can never lose more than minutes of work.
4. **All findings live in files, immediately** — review verdicts, screenshots, metrics, decisions go straight into `docs/` (`INSPIRATION.md`, `ELEVATION-PLAN.md`, `qa/…`, `MOTION.md`) the moment they exist. Never hold a finding only in conversation.
5. **Re-orientation ritual — run it at session start AND any time context feels thin, summarized, or post-compaction:** read `docs/PLAN.md` → `docs/RUN-STATE.md` → `git log --oneline -8` → resume from the `IN PROGRESS` line. Never reconstruct state from conversation memory; never redo work marked DONE (verify via git, not recollection).
6. **Memory checkpoint at every phase boundary:** append the phase's completion + next phase to the auto-memory file (`cnwm-project-state.md`) — memory survives compaction and new sessions.
7. If the session is interrupted entirely, a fresh session bootstraps from: memory → `docs/PLAN.md` → `docs/RUN-STATE.md` → git log. Nothing else is required.

## Key paths

- **v3 workspace:** `<project>/cnwm-v2` (project = `/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle`)
- **Approved-design source code:** `<project>/Charles Nalle Walking Memorial Website/Charles-Nalle-Walking-Memorial` on branch `match-figma-designs` — READ-ONLY reference; port from it liberally (its Tailwind idiom transplants almost 1:1 into Astro components)
- **Figma (approved baseline):**
  - https://www.figma.com/design/Ih7nb0M1vhfezuOV5laF6r/Website---Charles-Nalle-WM?node-id=1950-16104&m=dev
  - https://www.figma.com/design/Ih7nb0M1vhfezuOV5laF6r/Website---Charles-Nalle-WM?node-id=1950-16312&m=dev
  - https://www.figma.com/design/Ih7nb0M1vhfezuOV5laF6r/Website---Charles-Nalle-WM?node-id=1950-16313&m=dev
- **Inspiration benchmark (the standard v3 must meet — studied hands-on in Phase 0.5):**
  1. https://museos.arteyeducacion.org — motion, animation, content layout
  2. https://rewildyourself.com — motion, scroll effects
  3. https://marseille.laphase5.com/en — map + interactivity
  4. https://pasqua.it — immersiveness
  5. https://artsandculture.google.com — storytelling + information organization
- **Content truth:** `cnwm-v2/src/content/chapters/*.json` (Kathy's corrections applied; ledger `docs/CONTENT-STATUS.md`); her marked-up source: `<project>/Context/Website Edits.pdf` (pencil marks)
- Live: GH Pages URL above · legacy reference build: `charles-nalle-walking-memorial.vercel.app`

---

# APPROVED DESIGN LANGUAGE REFERENCE
*(Extracted from the legacy implementation 2026-08-02 — the rendered truth of the approved Figma. Executor: verify/enrich against Figma MCP when available; re-read the named legacy files for exact markup.)*

## Color — one warm ramp, dark-only (from legacy `src/index.css` @theme)
Radix-style 12-step scales (Wil endorses Radix method):
- **Primary (brand, brown→burnt orange):** 1 `#0e0807` · 2 `#1d1411` (page bg) · 3 `#341a11` (surfaces) · 4 `#4a1b0a` (active surface) · 5 `#592411` (hover) · 6 `#69311d` (**the universal border — on everything**) · 7 `#80412b` · 8 `#a55438` · 9 → canonicalize as `#f26835` (icon/active accent; legacy token said #f28835 but #F26835 shipped 13×) · 10 `#e45b27` (badges/fills) · 11 `#ff9770` (labels/secondary text) · 12 `#fed9cc` (body text)
- **Neutral (warm cream):** 2 `#100a06` (deep overlay/curtain) … 11 `#e6decf` · 12 `#f6f3ee` (headings)
- **Gray:** 7 `#4b4741` (home frame border) · 11 `#b7b3ab` (muted copy)
- Special: Home CTA pill `bg #FFC6B3 / text #BD3900 / border #F7A98F` — the only inverted element.
- Scrims: `linear-gradient(#1D1411, rgba(16,10,6,.95), #1D1411)`; hero fade `to top, from var(--primary-2)`.

## Type
- **Martel Sans** (semibold display, 300-weight body) + **Poppins** (labels, buttons, marker pills). Self-host via fontsource. Note: legacy's `font-poppins` class silently never applied (unregistered token) — the *approved rendering* is Martel-dominant; register Poppins properly and use it only where it visibly shipped (buttons, marker pills, progress labels) or where Figma says so.
- **The ×1.25/×1.5 ladder (core signature):** every size — type, cards, badges — multiplies ×1.25 at `md`(768) and ×1.5 at `lg`(1024). Hero h1: `42/34px → 52.5/42.5 → 63/51`, tracking `-1.5 → -1.875 → -2.25px` (leading tighter than size). Section h3 same scale, often uppercase, intentional hard `<br/>` breaks. Body narrative: `18px / weight 300 / leading 1.6 / #FED9CC`. Labels: `12 → 15 → 18px` uppercase `#FF9770`. Wordmark: `54 → 67.5 → 81px`, tracking `-2.5px`, two interlocked lines (second `self-end -mt-3`).
- **First-WORD drop cap:** first word of chapter's first paragraph at `32px font-medium` with negative vertical margins (not a letter cap). Once per chapter.
- v3 typography bar (Wil's): clean rags (`text-wrap: balance/pretty`), no widows, consistent rhythm at every breakpoint.

## Spacing
Figma 1 unit = 8px = 2 Tailwind units → even-numbered utilities only. Shell: `max-w-7xl mx-auto`. Section padding ladder: `pt-8 px-4 → md:py-4 md:px-10 → lg:py-8 lg:px-20`. Media: `rounded-3xl` + `border #69311D` universally.

## Signature components (port these; legacy file pointers)
1. **Curtain transition** (`TransitionOverlay.jsx`, `stores/useTransitionStore.jsx`): `#100A06` panel slides up (0.6s circ.inOut), CHARLES/NALLE wordmark (or destination name) fades in, 1.0s hold while navigation fires, exits upward (0.6s circ.out). Every navigation. In Astro: small client router intercept or View Transitions + GSAP overlay; reduced-motion = instant.
2. **Two-state audio player** (`AudioPlayerSection.jsx`): card `rounded-3xl border-2 #69311D`; background lifts primary-3→4 while playing; cover `scale-102`; time pill morphs `MM:SS → MM:SS | MM:SS` via stacked crossfade; `w-72` fixed mini-player opacity-swaps in exactly when the main button scrolls out. **v3: weave the synced paragraph-highlighting INTO this player design.**
3. **Hero** (`HeroSection.jsx`): `h-screen`; media `rounded-3xl` bordered, vertical asset on mobile/horizontal on desktop, animated mp4 with poster; scroll-scrub (0.5) parallax: media scales to 1.4, un-rounds to full bleed, title rises -200. **v3: press-and-hold sketch→painting reveal lives INSIDE this hero treatment.**
4. **Map** (`map/MapBox.jsx`, `LocationCardsSlider.jsx`, `LocationCard.jsx`, `constants.js`, `utils.js`): style `mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft`; overview `zoom 15.25 / pitch 33 / bearing 10`, maxBounds fenced to downtown Troy, chrome-free until selection. Markers = Poppins pill + 20px numbered chip (#E45B27) + 2px×30px stem + 8px dot, above/below per location; active `#F26835/#FED9CC scale-.9` vs inactive `#4A1B0A/#FF9770 scale-.8`. Cards: `fixed bottom-0 pb-6` keen-slider carousel, widths `343→428.75→514.5`, **-20px spacing mobile** (overlap), active `scale-100` vs `scale-85 origin-bottom`, two-tap (focus, then navigate via curtain); camera follows carousel debounced 150ms; selection flyTo `zoom 20, speed .6, curve 1.4`; 5s cinematic arrival ease; per-chapter embedded "Where to next" cameras in constants. **v3 keeps Brian's exact pins from v2 JSONs and adds route-draw/flythrough/1860-lens as elevation within this chrome.**
5. **Menu** (`MenuOverlay.jsx`): 72×72 corner-notched hamburger (3 corners `rounded-xl`, screen-edge corner `rounded-4xl`), three #E45B27 bars (third shorter), opens in place `back.out(1.7)` to a bordered panel: Home / 1–5 chapters / About in `#FF9770`.
6. **Home** (`Home.jsx`): full-viewport photo frame (`rounded-[32px]`, `#4B4741` border, grayscale+dim filter, gradient fade), three-stack: "Troy, NY" → interlocked wordmark → "1821 — 1875" with 28×1px rule → `#FFC6B3` Continue pill → muted mission copy with hand-authored breakpoint-specific line breaks. **v3: entry-moment energy (splash film in the frame, wordmark rise, rule draw) folded into THIS layout.**
7. **Supporting details:** `ArrowWithDynamicShaft` (stem stretches to match title height), ProgressIndicator "Section N/4", chapter number badges (#E45B27 circles), ambient always-moving paintings (mp4 autoplay/loop/muted + poster).

## Motion vocabulary (from legacy — the house style)
`duration-300` CSS default; GSAP reveals `power2.out 0.6–1.0s, stagger 0.2, start "top 80%"`; pops `back.out(1.7)`; curtain `circ.inOut/out`; Ken Burns `scale 1→1.2 scrub`; keen-slider linear 400ms; map cameras as above. No keyframe confetti — motion is feedback and cinema, never decoration. Everything has a reduced-motion variant.

---

# THE FOUR DISCIPLINES — CREATION & REVIEW

*The build is organized as four disciplines, each with an explicit creation track and an independent review track. The phases below are the execution order; this matrix is the quality contract. A phase is not done until its discipline reviews pass. Every review is run by a fresh subagent with no builder context, using Playwright-rendered screenshots or live interaction — never markup greps.*

## 1 · Visual Design — Colors · Type · Rag · Layout · UI Elements · Spacing

**Creation** (Phases 1–3):
- **Colors:** the approved 12-step ramps (Reference above) rebuilt as Radix-method scales; every usage tokenized; the two legacy inconsistencies resolved; scrims/gradients from the Reference. Evolution allowed where it strengthens the identity (e.g., refining a step for AA contrast).
- **Type:** Martel Sans + Poppins self-hosted; the ×1.25/×1.5 ladder as tokens; display tracking/leading per Reference; a documented role scale (hero/section/body/label/quote/badge) in `/styleguide`.
- **Rag:** `text-wrap: balance` on display, `pretty` on body; the approved intentional hard breaks preserved; no widows/orphans on headings; quote punctuation hung; checked at all three breakpoints per screen.
- **Layout:** approved skeletons per screen (Home three-stack frame, chapter section order, ch4/5 two-column desktop, map chrome) with license to evolve where better; `max-w-7xl` shell; full-bleed moments (moral, map) deliberate.
- **UI Elements:** the signature component set (player, cards, markers, menu, buttons, badges, arrows, progress labels) rebuilt to spec values; every interactive element has default/hover/active/focus/disabled states designed.
- **Spacing:** 8px Figma-unit scale, even-numbered utilities, the section-padding ladder; vertical rhythm consistent across chapters.

**Review — Visual Design Review (subagent, rubric):** screenshot grids (v3 | legacy | Figma export) per screen per breakpoint. Checks: token fidelity (pixel-sample 6 hexes/screen), type roles match the ladder (measure rendered px), rag quality (no widows, breaks intentional, quotes hung), layout parity with approved skeletons, state coverage on 5 sampled elements, spacing rhythm (measure section gaps against the scale). **Pass bar:** zero token/ladder violations; rag clean on every reviewed screen; any deliberate evolution reads as the same design family.
**Runs after:** Phase 1 (styleguide), Phase 2 (screens), Phase 3 (map), final at Phase 6.

## 2 · Motion Design — Transitions · Animations · Scroll Effects

**Creation** (Phases 2–4):
- **Transitions:** the curtain navigation transition (signature #1) on every route change; element-level continuity where cheap (persistent audio mini-player across scroll); menu open/close pops (`back.out(1.7)`); map camera moves (5s arrival, flyTo curve 1.4, 2s return).
- **Animations:** press-and-hold reveal choreography (develop → wake); two-state player (surface lift, cover scale, time-pill morph, mini-player swap); marker state changes; ambient painting motion (mp4 loops with posters); micro-interactions on every interactive element (300ms house default).
- **Scroll Effects:** hero scrub parallax (scale→1.4, un-round, title rise); moral-section reveal suite (power2.out, stagger 0.2); Ken Burns quote backgrounds; section reveals site-wide in the house vocabulary; route-draw on the map.
- All motion uses the motion tokens; every effect has a `prefers-reduced-motion` variant; inventory maintained in `docs/MOTION.md` (effect · trigger · duration/easing · reduced variant).

**Review — Motion Design Review (subagent, rubric):** live interaction pass (Playwright video capture or stepped screenshots at scroll positions) + `docs/MOTION.md` audit. Checks: every navigation shows the curtain (sampled 6 routes); scroll effects fire at correct triggers without jank; durations/easings match tokens; nothing moves without purpose (motion-as-thesis test: name what each effect communicates); reduced-motion run shows full content with zero broken states; no scroll-jacking; zero CLS from animation. **Pass bar:** inventory complete and accurate; reduced parity 100%; no effect flagged "decorative with no purpose."
**Runs after:** Phase 2 (core), Phase 3 (map), Phase 4 (full layer), final at Phase 6.

## 3 · User Experience — Organization · Intuitiveness · Ease of use · Immersiveness · Audio · 3D

**Creation** (Phases 2–4):
- **Organization:** the multi-door IA (Walk/Story/People/Paintings/About) mapped onto the approved nav (menu overlay + home); chapter sections in the approved order with ProgressIndicator wayfinding; every page answers where-am-I / what-next.
- **Intuitiveness:** two-tap map cards with visible affordances; press-and-hold with a visible labeled hint plus tap fallback; audio play affordance prominent (the lit-up player); no gesture-only critical paths — broad age range (a 15-year-old and a 75-year-old both succeed unaided).
- **Ease of use:** QR sidewalk path is sacred (deep link → chapter loads fast → audio one tap → next stop obvious); back always available; menu reachable everywhere; tap targets ≥24px; keyboard end-to-end.
- **Immersiveness:** the curtain + ambient paintings + scrub hero + map cinema produce presence without confusion; immersion never gates content (skip/scroll-past always possible).
- **Audio:** narration with synced paragraph highlighting inside the two-state player; mini-player persistence; scrubbing + paragraph-tap seek; transcripts are the visible text; all audio user-initiated; (ambient cues only if opt-in).
- **3D:** the tilted map camera (pitch 33 / bearing 10) and cinematic camera moves are the 3D layer — depth through parallax and camera, not gimmick; maintained through the elevation work.

**Review — UX Review (subagent, rubric):** two scripted walkthroughs against the live build: (a) *first-time home visitor* — reach a chapter, play audio, reach the map, reach stop 2; (b) *QR sidewalk arrival* — deep-link into `/commissioners-office`, orient, play, continue the walk. Grades each step: comprehension, findability, effort, recovery from wrong taps. Plus: age-range heuristics (effective text ≥16px, affordance visibility, no hidden gestures), audio UX (discover/play/seek/persist), immersion-vs-clarity balance. **Pass bar:** both walkthroughs complete unaided with zero dead-ends; no critical step relies on an invisible affordance; audio reachable in ≤2 taps from any chapter.
**Runs after:** Phase 2, Phase 3, Phase 4, final at Phase 6.

## 4 · Quality Assurance — Bugs · Loading Speed · Overall Performance

**Creation** (continuous; hardening in Phase 5):
- **Bugs:** interaction checklist per screen (links, player, reveal, menu, curtain, map gestures, dialog); console/network clean on every route; cross-viewport matrix 390/768/1440 + landscape phone; the island-CSS class of bug permanently guarded (Phase 0 fix + a build-time check that samples key island utilities in output CSS).
- **Loading Speed:** LCP <2.5s on throttled 4G for chapter pages (the QR path); fonts subset + preloaded; media lazy with posters; route JS budgeted (map bundle only on map routes).
- **Overall Performance:** Lighthouse mobile ≥90 perf / ≥95 a11y on home, one chapter, map; zero CLS; interaction latency <100ms; memory sane on the map (single instance verified).

**Review — QA Review (subagent, rubric):** runs the Playwright matrix + interaction checklist + Lighthouse from the **live deploy**; files findings as numbered defects with severity. **Pass bar:** zero P0/P1 defects; metrics at or above targets recorded in `docs/qa/`; residuals (P2+) listed with rationale.
**Runs after:** every phase (smoke), full pass at Phase 5, re-verified live at Phase 6.

---

# EXECUTION PHASES

*Each phase ends with: build green → deploy/preview → Playwright-rendered screenshots → the discipline reviews scheduled for that phase (matrix above) → fix → next. Commit + push per phase (CI deploys; the install step self-heals). Fix-loop: each review runs at most twice; anything still open lands in `docs/REVIEW-GUIDE.md` residuals (target: none).*

## Phase 0 — Foundation repair & truth acquisition (~1.5h)

**Work:**
0. **Bootstrap the compaction-proof protocol:** copy this plan to `docs/PLAN.md`; create `docs/RUN-STATE.md`; commit. (Protocol section above — mandatory from the first minute.)
1. **Fix the island CSS bug (the map is currently INVISIBLE — wrapper height 0, confirmed live):**
   a. Add Tailwind v4 `@source` directives in `src/styles/global.css` (e.g. `@source "../components";`) so `.tsx` islands are scanned; rebuild and **verify the emitted CSS contains** `h-\[100dvh\]`, `aspect-\[3\/2\]`, `portrait:` variants — grep the dist CSS, don't assume.
   b. Belt-and-braces: give structural island dimensions plain CSS classes that cannot vanish (`.map-shell { height: 100dvh }`, `.reveal-frame { aspect-ratio: 3/2 }` + portrait override) — layout-critical sizing must not depend on utility scanning.
   c. After the container has real height, ensure the map sizes correctly: `map.resize()` on load + a `ResizeObserver` on the container (a map initialized in a 0-height box keeps a 300px canvas otherwise).
   d. Add a permanent build guard: a post-build script step that fails if key island utilities/classes are missing from the output CSS.
   e. **Acceptance is visual, not mechanical:** live screenshot shows streets/labels/markers plainly visible, full-viewport, at 390/768/1440 — not a dark empty canvas. This item is the phase gate; nothing else proceeds until the map is visibly a map.
2. **Install the QA eye:** add Playwright (devDep; constitution-sanctioned) + a `scripts/shots.mjs` capturing every route at 390×844, 768×1024, 1440×900 (+ key scroll positions) to `docs/qa/<phase>/`. This harness is the acceptance instrument for every later phase.
3. **Figma pull (MCP verified WORKING 2026-08-02: authenticated as Wil B., file accessible, single top-level page "✅ Approved" = `16:438`):** `get_screenshot` works on the big nodes (node `1950:16104` is a 12520×7682 board — request per-frame screenshots at `maxDimension` 1024–2048 and download via the returned curl URL). **Known issue:** `get_metadata`/large XML responses on the giant nodes fail with an SSE parse error — do NOT retry the full node; instead drill into smaller CHILD frames (get_metadata on `16:438` subtrees, or get_design_context on individual screen frames). Save everything to `docs/figma-baseline/`. Diff against the Reference above; correct the Reference where Figma disagrees.
4. Delete v2-invented identity remnants inventory (list what Phase 1 will remove: Fraunces/Newsreader imports, paper grain, per-chapter palette JSON fields → superseded by the single approved ramp; keep palette fields as data but stop styling from them).

**Deliverables:** working full-viewport map + correct press-reveal box (screenshot-proven), Playwright harness, `docs/BASELINE.md` (final tokens).
**Acceptance:** screenshots show map filling viewport at all 3 sizes; zero missing-utility regressions; harness runs in one command.
**Reviews:** QA smoke (screenshot set audited against this phase's claims).
**Risks:** Figma MCP unauthorized (fallback defined); `@source` path specifics (verify emitted CSS, not assumption).

## Phase 0.5 — Inspiration study & elevation blueprint (~1.5h)

*The bridge phase the whole run hangs on: study the benchmark hands-on, then write the plan for how the approved Figma/legacy design gets elevated TO that benchmark. Build phases execute this blueprint; final reviews verify against it.*

**Work:**
1. **Hands-on inspiration review** — visit all five sites with the Playwright harness (screenshots at multiple scroll positions, viewport 390 + 1440, interaction probing, DOM/tech inspection). For each, study its *named dimension* and extract 5–8 concrete, named techniques (e.g., "press-to-reveal artwork," "statement→breath→CTA scroll rhythm," "chrome-free map overview with cinematic arrival," "gesture-gated sound-on entry," "one artwork, many doors"). Also record 2–3 things each site does *poorly* — traps to avoid (unskippable preloaders, sound-hostage content, style-over-substance map shallowness, soulless-platform genericism). Output: `docs/INSPIRATION.md`.
2. **Gap analysis** — for each CNWM screen (Home, Chapter, Map, People, Paintings, About) and each of the four disciplines: where does the Figma/legacy baseline stand versus the benchmark? What does it already have that the inspiration sites would envy (Mark Priest's paintings + sketches + animations, real narration, a true story with Harriet Tubman, a physical walking route)?
3. **The elevation blueprint** — `docs/ELEVATION-PLAN.md`: a screen-by-screen × discipline-by-discipline list of specific elevations, each entry naming (a) the baseline element it elevates, (b) the inspiration technique it adapts, (c) the CNWM-native expression of it (never a copy — the technique translated into the approved identity), (d) which phase executes it. This document is the build order for Phases 2–4 and the checklist for the final reviews.

**Starting corpus (prior study, 2026-08-01 — treat as hypotheses to verify hands-on):**
- *Museos:* three narrator voices per artwork · press-and-hold artwork reveal · numbered editorial sections · rolling-digit dates · inverted palettes per page · CDN-optimized media. Poorly: unskippable slow preloader; hover-only interactions on touch.
- *Rewild:* statement→breath→one-CTA scroll rhythm · organic motion-as-message · WebGL restraint. Poorly: entry gate + heavy payload; utility buried under mood.
- *Marseille:* question-led onboarding → skippable intro film → free map exploration · hand-made map-as-artifact · district vignettes with ambient sound. Poorly: desktop-first; shallow per-location content.
- *Pasqua:* film-title framing ("presents…") · gesture-gated sound-on entry · minimal UI chrome over full-bleed media. Poorly: everything hostage to a loading gate; sound-first accessibility failure.
- *Google A&C:* one-subject-many-doors ("How will you discover…") · question-led entry · gigapixel zoom · topical hooks ("Today in history"). Poorly: no soul — organization without identity.
- *The award DNA (all five):* one signature interaction · narrative before navigation (always skippable) · typography carries identity · motion has a thesis · sound opt-in · craft in the seams (loaders, titles, favicons, transitions) · ruthless media pipeline.

**Deliverables:** `docs/INSPIRATION.md`, `docs/ELEVATION-PLAN.md`.
**Acceptance:** every elevation entry is traceable (baseline element + inspiration technique + CNWM expression + executing phase); every screen × discipline cell has at least one entry or an explicit "baseline already at bar" note.
**Review (independent):** a fresh subagent reads ONLY the inspiration screenshots + the blueprint and answers: *"If executed fully, does this plausibly reach the standard of these five sites?"* — with named gaps. Builder revises until the answer is yes with zero named gaps.
**Risk:** site access/render flakiness in headless — fall back to the starting corpus + whatever renders; do not burn more than the timebox.

## Phase 1 — Design system reconstruction (~2h)

**Work:** rebuild `global.css` as the approved system — the 12-step ramps as CSS custom properties + Tailwind theme; Martel Sans + Poppins self-hosted (subset weights: Martel 300/600/800, Poppins 400/500); the ×1.25/×1.5 ladder as fluid type tokens; spacing scale; motion tokens (durations/easings above); border/radius idiom (`rounded-3xl` + primary-6 border as a component class). Resolve the two legacy inconsistencies deliberately (canonical `#F26835`; Poppins registered and used only where shipped/Figma-specified). Build `/styleguide` route rendering every token, type ladder at all breakpoints, and each signature component primitive.
**Deliverables:** new `global.css` tokens, `/styleguide`, fonts wired.
**Acceptance:** styleguide screenshots match Reference values (spot-check hexes via pixel sampling in the QA script); no Fraunces/Newsreader/paper remnants anywhere; body text ≥16px effective at mobile.
**Reviews:** Visual Design (styleguide vs Reference tables + legacy screenshots — capture legacy from `charles-nalle-walking-memorial.vercel.app` with the same harness for side-by-sides).

## Phase 2 — Core screens to approved DNA (~3h)

**Work:** port legacy markup/structure into Astro components (its Tailwind classes transplant nearly 1:1):
- **Home** per signature #6 with the entry moment folded in (splash film inside the photo frame, staggered wordmark rise, rule draw, CTA). Kill v2's separate title-sequence layout.
- **Chapter template** per signatures #2/#3/#7: hero with scrub parallax + press-reveal integrated (sketch develops into the animated painting within the bordered hero frame; touch/keyboard/reduced-motion paths kept from v2); ProgressIndicator sections; narrative 18/300/1.6 with first-word caps; ch2's two scenes and ch4/5's two-column desktop pattern; audio = the two-state player with synced paragraph highlighting woven in (highlight style: subtle primary-4 wash, not v2's accent block); HistoricalContext; full-bleed MoralMessage with its reveal suite; WhereToNext with the embedded 3:2 map card + per-chapter cameras; Footer.
- **Curtain transition** on all navigation (signature #1) — implement once as a small client module.
- **Menu** (signature #5). **About** restyled. **People/Paintings** restyled to the language (bordered cards, ladder type, ramp colors — they should look like they always belonged).
**Deliverables:** all routes re-skinned; curtain live; menu live.
**Acceptance:** side-by-side screenshot grids (v3 | legacy | Figma export) read as one design, elevated; every Phase-2-tagged `ELEVATION-PLAN.md` entry executed; every v2 feature present in new skin; hard line breaks and rags clean at all 3 breakpoints; no dead ends.
**Reviews:** Visual Design + Motion Design + UX + QA smoke (per matrix).

## Phase 3 — The map, approved then elevated (~2h)

**Work:** rebuild `/map` to signature #4 exactly (tilted chrome-free overview, stem-dot markers with exact state values, overlap carousel with two-tap + camera-follow, back button, cinematic arrivals, maxBounds) using Brian's exact pins; restore the embedded chapter-page map. Then elevate within the chrome: self-drawing route between stops, optional guided flythrough ("Take the walk" — skippable, reduced-motion honored), the 1860 painting lens re-skinned to the language, geolocate for sidewalk visitors. Single map instance; do not port legacy's dead `PersistentMap.jsx`/`LocationButtons.jsx`.
**Deliverables:** the approved map experience + elevation layers, embedded maps back on chapters.
**Acceptance:** full-viewport at all sizes (screenshot-proven **on the live deploy**), marker/card specs match Reference values, carousel overlap behavior on mobile width, tour skippable, Phase-3-tagged `ELEVATION-PLAN.md` entries executed, no console errors.
**Reviews:** Visual Design (marker/card spec table) + Motion Design (cameras, route-draw) + UX (QR-arrival walkthrough) + QA smoke.

## Phase 4 — The award layer (~2.5h)

**Work:** execute every remaining `ELEVATION-PLAN.md` entry — motion with a thesis, scroll choreography (reveal suites site-wide in the house vocabulary), ambient painting motion everywhere it earns its place, micro-interactions (hovers, focus, active states per inventory), the 1860 lens moment, entry choreography, transitional continuity (curtain + element persistence), sound-design touches only if opt-in and cheap. License is granted: evolve layouts/type/color where it makes the design *better* while unmistakably the same identity. Guardrails (the traps named in `docs/INSPIRATION.md`): no scroll-jacking; content never hostage to motion or loading; reduced-motion parity for every single effect; broad-age-range clarity beats cleverness on every trade.
**Deliverables:** motion inventory doc (`docs/MOTION.md`: every effect, trigger, duration/easing, reduced variant).
**Acceptance:** zero CLS from animations; every effect listed with its reduced variant; the seven-point award DNA self-audit (signature interaction · narrative framing · typography identity · motion thesis · sound opt-in · craft seams · media pipeline) passes with evidence.
**Reviews:** Motion Design (full) + UX (full, incl. narrated first-visit judged against `docs/INSPIRATION.md`'s findings — does it *feel* like that caliber?) + QA smoke.

## Phase 5 — Performance & hardening (~1.5h)

**Work:** font subsetting check, preload critical assets, media re-budget (Martel/Poppins add weight — compensate), Lighthouse mobile ≥90 perf / ≥95 a11y, LCP <2.5s throttled 4G on chapter pages (QR entry path is sacred); full a11y sweep (contrast on #FF9770-over-#1D1411 label combinations — verify AA at rendered sizes, adjust step if needed; focus states; transcripts; keyboard end-to-end). **Content verification:** page-by-page against `Context/Website Edits.pdf` pencil marks + `docs/CONTENT-STATUS.md` (pending items remain: ferry skiff rewrite, Ch2a/Ch4 audio, Athenaeum image — Wil's inputs, not blockers).
**Acceptance:** metric numbers recorded in `docs/qa/phase5/`; zero known defects or an explicit residual list.
**Reviews:** QA (full pass — bugs, loading speed, overall performance).

## Phase 6 — Release candidate & review guide (~1h)

**Work:** final deploy; verify the LIVE URL end-to-end with rendered screenshots; write `docs/REVIEW-GUIDE.md` in two parts: **(a) a stakeholder-presentable summary Wil can show that morning** — the live link, a short "what's new" walkthrough in plain client language, and before/after screenshot pairs (legacy vs v3) per screen that make the improvement self-evident; **(b) Wil's internals** — the three-way comparison links (v3 live · legacy Vercel · Figma nodes), per-screen notes, the pre-existing stakeholder items (Kathy's word-for-word sign-off, Brian's pins/credits/plaque typo, Amanda's redirects, Wil's content drops — playbook Parts A/C/D unchanged), and the self-audit table: every acceptance criterion in this plan → evidence link. Update memory + `docs/CONTENT-STATUS.md` + playbook delta.
**Acceptance:** the zero-big-edits bar — nothing in the guide says "known broken"; every criterion has evidence.
**Reviews (final gate):** all four disciplines re-run against the **live deploy** — Visual Design, Motion Design, UX, QA — plus an item-by-item verification of `docs/ELEVATION-PLAN.md` (every entry executed or explicitly resolved), plus **the returning-stakeholder test**: a fresh subagent, given only the legacy screenshots, the Figma exports, and the live v3, role-plays a stakeholder who approved the original design and answers two questions — *"Do I recognize this immediately as our website?"* and *"Am I wowed by the improvement?"* Both must be an unqualified yes, with the reaction narrated screen by screen. Reports saved to `docs/qa/reviews/`; ship only on four greens + complete blueprint + a passed stakeholder test.

---

## Independent review protocol (how the four discipline reviews run)

Each review spawns a **fresh subagent with no builder context**, given only: its discipline rubric (matrix above), the Playwright screenshots / live URL, and the Reference + Figma baselines + legacy screenshots. Findings return as a numbered, severity-ranked list; the builder fixes and re-runs the review once; anything still open after the second pass goes to `docs/REVIEW-GUIDE.md` residuals (target: none). The Phase 6 gate is **all four disciplines green on the live deploy** — Visual Design, Motion Design, UX, and QA — each review's final report saved under `docs/qa/reviews/`.

## Dependencies · Risks · Constraints

- **Wil pre-kickoff (5 min):** authorize the Figma MCP connector (claude.ai connector settings). If skipped, the night proceeds on the Reference + legacy code (explicit fallback).
- New devDeps: Playwright (QA), keen-slider (approved carousel), fontsource Martel Sans/Poppins. All free/OFL/MIT; zero runtime cost to the museum.
- CI deploys on every push (self-healing install). GH Pages latency ~3 min — use local `astro preview` + Playwright for inner-loop QA; live URL for phase gates.
- The browser pane throttles when hidden — **Playwright is the only trusted eye**, never the pane, never markup greps.
- Mapbox: token committed and verified valid for all origins; style stays `/draft` until launch (playbook Part E publishes it). No secret handling needed this run (avoids permission-classifier friction).
- Zero-ongoing-cost constraint unchanged. Bronze QR URLs remain `hartcluett.org/nalle/*` — untouched by this work.
- Timebox ≈15h. If compressed: Phases 0, 0.5, 1–3 are non-negotiable; Phase 4 executes the blueprint's highest-impact entries first and degrades gracefully; Phase 5 minimum = perf numbers + content check.

## Stakeholder input (pre-existing only — per Wil, no new flags)

Kathy: word-for-word content sign-off (Part D). Brian: pin placement, painting credits, plaque typo. Amanda: `/nalle/*` redirects (Part A — still the gate to Matt's payment). Wil: audio re-records, ferry rewrite, Athenaeum image (Part C). None block the overnight run.

## Verification (end-to-end, at the finish)

1. `npm run build` + `astro check` clean; CI green; live URL serves v3.
2. Playwright matrix: every route × 3 viewports from the **live** URL — no layout breakage, map full-viewport, reveal correct.
3. Three-way visual: v3 screenshots beside legacy screenshots beside Figma exports — same DNA, visibly elevated.
4. Interaction pass on a real phone viewport: QR deep-link path (chapter → audio → next → map) flawless.
5. Lighthouse mobile ≥90/≥95; LCP <2.5s throttled on `/bakery`.
6. `docs/REVIEW-GUIDE.md` complete with evidence links — the morning read starts and ends there.
7. `docs/RUN-STATE.md` shows every phase DONE with review verdicts; final state pushed.

---

## KICKOFF PROMPT (Wil: paste this verbatim to start the overnight session)

> Execute the CNWM v3 plan end to end, fully autonomously, through the night.
>
> Ground rules, in priority order:
> 1. **Compaction protocol first.** Read `~/.claude/plans/ultrathink-i-will-update-kind-dream.md` in full. Your very first actions: copy it to `cnwm-v2/docs/PLAN.md`, create `docs/RUN-STATE.md`, commit both. From then on: disk is truth, conversation is cache. Update RUN-STATE after every sub-step, commit constantly, push often. If your context is ever compacted or feels thin, STOP and re-orient: `docs/PLAN.md` → `docs/RUN-STATE.md` → `git log --oneline -8` → resume from the IN PROGRESS line. Never redo work marked DONE; never trust recollection over git.
> 2. Work through the phases in order (0 → 0.5 → 1 → 2 → 3 → 4 → 5 → 6). Phase 0's map fix gates everything. Run every discipline review (Visual Design, Motion Design, UX, QA) where the plan schedules it, as fresh independent subagents, and record verdicts in files.
> 3. The bar is the five inspiration sites. The identity is the approved Figma/legacy design. The license is already granted in the plan — evolve boldly within the identity, no flags, no check-ins.
> 4. The North Star: in the morning I show this to the clients and stakeholders. It must feel instantly familiar to them — their approved design — AND make them say "wow, this is so incredible, what a massive improvement." Familiar + wow, on every screen.
> 5. Do not stop for my input. Queue anything that genuinely needs me in `docs/REVIEW-GUIDE.md`. Finish with all four discipline reviews green on the live deploy, the returning-stakeholder test passed, and the stakeholder-presentable review guide complete. I will review in the morning expecting zero big edits.
