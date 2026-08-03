# CNWM v6 — Seven-Element Elevation: Wil's 30 + The Museum

Repo: `<P>` = `/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2` (always quote — parentheses/spaces). Branch `main` → `origin/v2`; plain `git push` only, **never `main:main`**.

## Context

After v2–v5, Wil's verdict: much closer, **not a redesign — many micro-improvements + one heavy lift**. He supplied (a) the seven-element award framework and (b) a 30-item punch list. The v5 audit machinery (73 findings; probe/states/census/shots/perf + build-route instruments; adversarial juror protocol) exists and stays.

**⚠️ Repo state is IN FLUX — a parallel session progressed v5 while this plan was written.** Per auto-memory (2026-08-03): v5 Stages 1–3 complete; **juror pass 1 = 6.8/10 "would not shortlist" (8 P0 · 26 P1 · 19 P2)**; five P0s since fixed (real Mapbox Directions route geometry in `src/data/route.json` via `scripts/build-route.mjs`, per-chapter `heroFocus`, About portraits/quote, /map footer); **three P0s open** — painting dialog clipped at 844×390, map stop labels anonymous on phones, 1860 overlay ungeoreferenced (Wil decision). v5 screenshots are now gitignored (findings are the artifact). Do NOT trust this paragraph either: **Phase 0 reconciles from `git` + `docs/RUN-STATE.md` per Part C3 — git + pixels win over every doc, including this one.** The v6 dual-rubric gate replaces v5's Stage-4 finish condition (same Awwwards bar + the seven-elements sheet).

## Locked decisions (Wil, this session)

1. **Thesis (#1):** *One day, five stops* — the day Troy pulled Charles Nalle free, April 27, 1860. Day-first framing everywhere (home already recomposed in working tree).
2. **Signature composition (#2):** **The 3-D Museum** (`/paintings`) is the site's one concentrated boldness — "the only page that's immersive and crazy cool like this" (pasqua-style). **The Crossing** (curtain + "April 27, 1860") stays as the restrained site-wide transition ritual. **Press-and-hold is retired**; the sketch relocates to the theme/moral section per Figma (item 18); "sketch comes alive" lives in the museum as the *turn-the-painting-on* control.
3. **Typography (items 1, 12, 16, 23): serif-led display with a new tight pairing** — elegant, historical, grounded — chosen via in-run audition (shortlist: Playfair Display [Scotch-Roman class, the 1860 American newspaper voice], Libre Caslon Display+Text [the American printing face], EB Garamond [range incl. real small caps]; criteria: period credibility, display presence at lighter weight, small-size legibility, oldstyle figures for dates, OFL/self-hosted, subset+variable perf). Poppins retires unless the audition keeps it for chrome. **Iconography derived from the type** (existing library harmonized or custom-drawn to the serif's construction — my call, per Wil). Supersedes the BASELINE type contract → log in `docs/DEVIATIONS.md`.
4. **Museum navigation:** guided rail + free look. Camera glides on scroll/swipe, drag to look, tap a painting to approach; sketch hung beside its painting; museum-plaque captions; **"turn on" button plays the painting's existing animated variant** (video texture). Seamless and beautiful; style-mirrors the site; 2-D gallery remains as fallback (no-WebGL / reduced-motion / save-data / context-loss). Future-extensible painting list.
5. **Ch. 2 structure (item 26):** one page, Pt 1 + Pt 2 together, **each part gets the complete twin template** (own hero, story, context) — *reading of Wil's "1 and 2"; flagged for correction here if wrong.* Map shows one pin; QR lands at Pt 1.
6. **Naming (item 27):** "Map" in nav/links; story verbs only in CTAs with context ("Walk the five stops" home CTA; "Continue" at chapter ends).
7. **Content pool:** the Figma designs as amended by Kathy (authority chain: legacy `match-figma-designs` + `../Context/Website Edits.pdf` + `docs/CONTENT-STATUS.md` ledger, incl. her deferred relocations: scene-3 painting → scene 5; escape/river painting; Pliny Moore caption). No invented content; UI microcopy allowed; Kathy's facts untouchable. Museum page: full creative freedom, style-mirrored.
8. **Run mode:** fully autonomous through the dual-rubric juror gate, then push. Human items queued in REVIEW-GUIDE (Kathy sign-offs, Ch2a/Ch4 re-records, ferry rewrite, Athenaeum image). **Executes in a FRESH session via the Kickoff Prompt at the bottom of this plan — this planning session does not run it.** Continuity/model-switch contingency in Part C.

## Kickoff inputs (optional, 1 minute each — run proceeds without them)
- **Figma arrow (item 11), node 2142-4066**: authorize Figma MCP / open the ClaudeTalkToFigma plugin channel, or export the arrow SVG into `Design/`. Fallback chain: extract from legacy repo (it implemented the Figma) → faithful redraw within the new icon system.
- Figma access generally lets Phase-A conformance verify against nodes 1950-16104/16312/16313 instead of the documented fallback.

## PART A — Seven-Element Stress-Test Battery (baseline in Phase 0, gate in Phase 6)

Artifacts → `<P>/docs/v5/elements/`. New scripts clone `scripts/shots.mjs` patterns.

| # | Element | Test | Instrument | Pass bar |
|---|---|---|---|---|
| 1 | Thesis | Compression test: 3 fresh jurors, home shots + copy only, one sentence each | shots.mjs + probe copy dump | 3/3 rescue+Troy; ≥2/3 the single day; 0/3 "biography"/"gallery" |
| 2 | Signature+restraint | Moment census (every animated/interactive treatment + computed transition tuples per route); juror: "the ONE moment you'd tell someone about?" | new `scripts/moments.mjs` | All tuples on tokens or documented exceptions; jurors converge on the Museum; Crossing reads as ritual, not competitor |
| 3 | Execution | Full instrument re-run local + live; jank trace on carousel + museum rail | probe/states/census/perf + CDP tracing | 0 collisions; ≤6 sizes/page; gaps on tokens; LH ≥90/≥95 (map + museum documented exceptions); 60fps interactions; 0 console errors |
| 4 | Typography | Grayscale strip test (`filter:grayscale(1)`, imagery hidden) + specimen review | new `scripts/strip.mjs` | Juror names the voices + jobs; personality ≥8; zero "generic/template" verdicts |
| 5 | Interaction meaning | Meaning ledger: census row → "what it narrates"; no answer ⇒ kill list | E2 census + hand column | Zero decorative-only rows; museum turn-on + Crossing read as thesis gestures |
| 6 | Content depth | Figma-conformance placement matrix + authority check (Priest series title; *Freeing Charles* citations; **1860 map NOT attributed to Priest** — item 19) | checklist vs BASELINE/LEGACY-PORT-NOTES/Edits.pdf | Zero unexplained deviations; Kathy relocations applied; juror "curated" ≥8 |
| 7 | Threshold | QR-arrival filmstrip: cold cache, Slow-4G + 4× CPU, 390×844, frames at 0.5/1/2/3s, each chapter | new `scripts/arrival.mjs` (CDP throttle) | t=1s kicker+name legible; ≤2.5s hero painted; no dark frame >0.5s; no shift 1s→3s; no `.mp4` on thin pipe |

Plus `scripts/contrast.mjs` (WCAG luminance, exit-nonzero) for route color, type system, and all item-23 checks.

## PART B — The work, phased (Wil's 30 mapped; ~3 days, museum is the honest wildcard)

### Phase 0 — Reconcile reality + instruments (S)
**Reconcile first (Part C3):** `git status` + `git log --oneline -15` vs `docs/RUN-STATE.md` — a parallel session advanced v5 (five P0 fixes committed; possibly more). If anything verified-dirty remains, build + re-shoot + commit it; **push** so live = HEAD; sync RUN-STATE (open a v6 section; leave the v5 section as history; carry v5's open P0/P1 ledger forward into the v6 item map). Then: wire `qa:*` npm scripts; build the 4 new instruments; run baselines E1/E2/E4/E7; attempt Figma-arrow fetch (chain above).

### Phase 1 — Type & icon system (M) — cascades into everything, so first
- **Audition**: build 2–3 candidate systems as `/styleguide` specimens (display/title/quote/prose/meta roles, date lockups with oldstyle figures, real content); fresh juror + stakeholder-proxy pick; then apply site-wide via `global.css` tokens. Fixes items 1+16 weight ("too heavy") structurally: serif display at lighter optical weight.
- **Iconography born from the type** (item 12): redraw/replace the 11 glyphs in `src/components/icons.ts` to match the serif's construction (stroke contrast, terminals); location icon replaced (typographic marker treatment); **arrow per Figma node 2142-4066** (item 11).
- **Button states** (item 15): hover/active/focus/pressed micro-transitions on tokens for `.btn`/`.btn-sm`/`.link-meta` + cream variants.
- **Footer** (item 24): quiet, grounded, helpful-not-noticeable pass on `SiteFooter.astro`.
- **Naming sweep** (item 27) + **1860-map attribution fix** (item 19, `TroyMap.tsx` lens caption).
- Verify: strip test + census re-run; contrast.mjs on all new type colors/sizes.

### Phase 2 — Splash + chapter template (M–L)
- **Splash** (items 3–6): `noMenu` on `/`; image repositioned immersive, padding/margins reduced (`index.astro` frame); CTA reads "Continue" / "Start the story" (pick at build, story-verb rule); description = **exact Figma copy** with perfect rag at all sizes (`text-wrap: balance` + authored breaks, verified 390/768/1024/1440/landscape).
- **Chapter hero wow** (items 2, 16): full-bleed immersive media (kill letterbox strip), serif display lockup, kicker+date first paint; **QR-arrival is the design target** — E7 filmstrip is the acceptance test; perf bars hold.
- **Section motion** (item 17): scroll-driven entrances per section (reveal grammar, `.lines` wired via build-time `splitLines()` in `src/lib/text.ts` — the authored-but-dead per-line mask reveal finally fires), section-to-section transitions; **no scroll-jacking** (guardrail).
- **Sketch → theme section** (item 18): sketch presented in the moral/theme section per Figma placement; `PressReveal.tsx` retired; reveal-video assets remain for the museum.
- Items 22 (chapter-end CTA → "Continue"), 25 (remove "Scroll to listen"), 20 (EmbedMap pin click → next chapter, map otherwise inert), 21 (directions = `google.com/maps/dir/?api=1&destination=lat,lng&travelmode=walking` — opens the app on phones; verify).
- **Ch2 twin template** (item 26 per locked reading) — Pt 2 mirrors Pt 1's full structure on one route.
- **The Crossing** (restrained ritual): date-led curtain typography in the new serif (oldstyle "April 27, 1860" as protagonist, chapter name subordinate); cover 0.6s + hold ≤1.0s + exit 0.6s; fail-open timers untouched; reduced-motion instant.
- Loading states: audio `waiting/stalled` pulse + `aria-live`; EmbedMap ground-colored shell.
- **Fold guard**: re-run F2 acceptance (hero ≤ viewport, 5 chapters × 5 viewports).

### Phase 3 — Map overhaul (M) — items 7–14, 13, 10 + v5 open P0s
`TroyMap.tsx` + `map.astro`: remove ScaleControl (item 7, the "elevation counter"); route color to an accessible ramp value — grayscale screenshot must show it plainly (item 8, W3 heritage; route is now real Directions geometry from `src/data/route.json`); remove WalkProgress rail on `/map` (item 9); top-left chip: accurate copy or removed, **hidden whenever chapter cards are visible**, "Overview" → "Back to map" (items 10, 13); card arrows → Figma arrow (item 11); **carousel smoothness** (item 14): decouple camera-follow from drag (follow on settle), consistent `easeTo` curve, memoized marker re-renders, rubberband feel — accepted only on a 60fps CDP trace; menu `bottom-right` on map (dead prop finally passed). **v5 open P0s land here:** phone stop-labels anonymity (the chip fix traded clipping for namelessness — solve both: active stop named + others identifiable without collision); 1860 overlay ungeoreferenced — attempt a bounded alignment (corner-pinning against known streets); if it can't be done honestly, present it as an artifact (framed plate, not a lens) and queue the decision for Wil in REVIEW-GUIDE.

### Phase 4 — THE MUSEUM (L — the heavy lift, full creative freedom, style-mirrored)
New Three.js guided-rail gallery replacing `/paintings` default (2-D grid becomes the fallback + SR-parallel DOM):
- **Scene**: one warm gallery hall (walls/floor from site tokens, warm spotlight pools per canvas), paintings as textures from existing 1440 renditions (downscaled by device), **sketch hung beside its painting**, serif plaque captions from existing titles/credits ("Mark Priest · A Fugitive Slave Rescued", series title from `about.ts`).
- **Rail + look**: scroll/swipe scrubs camera along a spline past every work; drag = clamped free look; tap/click a painting → ease to frontal view + plaque; Esc/back returns to rail.
- **Turn it on**: a plaque-adjacent control ("Bring it to life" class microcopy) swaps the canvas texture to the existing animated `.mp4` (video texture), one live at a time.
- **Craft bars**: seamless (no loading gate — progressive texture load by rail proximity, designed in-scene loading treatment), 60fps on mid-phone (DPR clamp ≤1.5, pause when offscreen/tab-hidden, dispose on leave), full keyboard path (arrows move rail, Enter approaches, control reachable), the 2-D grid renders beneath for screen readers.
- **Fallback triggers**: no WebGL, reduced motion, save-data/2g-3g, context loss → 2-D grid.
- **Budget**: `three` added (justify in DEVIATIONS.md; ~150KB gz; zero hosting cost); route perf documented exception like `/map` — target ≥80 desktop / ≥70 mobile, a11y 100.
- **Ship rule**: museum ships only if it clears the juror bar (element 2 Exceeded); otherwise grid stays and museum lands next run. Own commits, revert-ready.
- **v5 open P0 absorbed**: the painting-dialog clip at 844×390 dies with the museum (no dialog on the rail path) — but the fallback grid keeps a dialog, so fix the clip there regardless (it's the SR/reduced-motion path).

### Phase 5 — People, About, global a11y (M)
- **People cards** (item 28): elevate entries into profile-card treatment (typographic monogram placeholder now, photo slot for later; keep the loved layout direction — refine, don't redo).
- **About** (item 30): no regression; apply new type/icon system; keep Figma-considered layout.
- **Item 23 global pass**: contrast.mjs sweep, entrance choreography audit, "heavy text presented typographically" — hung quotes, drop caps, hanging numerals, measures ≤66ch, glanceable hierarchy; zero contrast failures.

### Phase 6 — The Gate (M)
Regenerate all evidence (shots/probe/states/census/perf + E1–E7). **Dual-rubric fresh-juror gate**: Sheet A (Awwwards axes ≥8 every breakpoint class, zero P0/P1) + Sheet B (all seven elements ≥ Met in full; **≥2 Exceeded, the Museum among them**; juror writes the thesis sentence they perceive). **Two consecutive clean passes**, different jurors, only P2/P3 fixes between. Then: live end-to-end verify, `docs/v5/REVIEW-GUIDE.md` (before/afters, both sheets, residuals, queued human items incl. the Ch2-reading flag), memory + RUN-STATE update, final push.

## Item → phase index
1→P1 · 2→P2 · 3→P2 · 4→P2 · 5→P2 · 6→P2 · 7→P3 · 8→P3 · 9→P3 · 10→P3 · 11→P1/P3 · 12→P1 · 13→P3 · 14→P3 · 15→P1 · 16→P2 · 17→P2 · 18→P2 · 19→P1 · 20→P2 · 21→P2 · 22→P2 · 23→P5 · 24→P1 · 25→P2 · 26→P2 · 27→P1 · 28→P5 · 29→P4 · 30→P5

## PART C — Run continuity & contingency (context windows · usage limits · model switching)

The run must survive: context-window compaction, a hard session death, a usage-limit cutoff, and a mid-run model switch (Fable 5 → Opus 5) — with zero loss of context or quality. The mechanism is the project's established rule, hardened: **disk is truth; the conversation is disposable.**

### C1. The two truth files
- `<P>/docs/PLAN.md` — this plan, copied verbatim at bootstrap (the constitution; never edited mid-run except to log a Wil decision).
- `<P>/docs/RUN-STATE.md` — the live ledger, v6 section with fixed format: `CURRENT PHASE` · `CURRENT ITEM` · **`NEXT ACTION` (one concrete step, always written before any stop)** · `DONE` table (item → commit → evidence path) · `DECISIONS` log · `BLOCKED/NOTES`. A stranger (or the next model) must be able to resume from PLAN.md + RUN-STATE.md + `git log` alone.

### C2. The atomic-act rule (the whole contingency, really)
**One work item = implement → re-shoot pixels → commit → update RUN-STATE → (every ≤3 commits) push — as ONE act.** Never park meaningful work uncommitted; never update RUN-STATE without the commit or vice versa. The v5 failure (docs said "F3 in progress" while F4 sat uncommitted in the tree) must not recur. Under this rule, the worst any cutoff can cost is the single in-flight item.

### C3. Recovery protocol (any fresh session, any model, any reason)
1. Read `docs/PLAN.md`, then `docs/RUN-STATE.md` → resume at `NEXT ACTION`.
2. `git status` + `git log --oneline -10`. Dirty tree = suspect: build + re-shoot before committing anything; never discard silently.
3. If RUN-STATE and git disagree, **git + pixels win**; fix RUN-STATE first.
4. After a MODEL switch mid-phase: re-run the current phase's gate instruments once before continuing (cheap parity insurance); jurors always run on the strongest model available at that moment.
5. Context compaction mid-session needs no action — decisions live in RUN-STATE/DECISIONS the moment they're made, never only in conversation.

### C4. Usage-pressure rules
- **Museum-first pivot:** Phase 4 depends only on Phase 1 (type/icon system), not on P2/P3. If usage on the primary model looks likely to run out before P4 starts, pull P4 forward (P0 → P1 → P4 → P2 → P3 → P5 → P6) so the heaviest creative lift lands on the strongest model.
- At a usage cutoff: finish the atomic act if possible (commit + RUN-STATE + push), otherwise the recovery protocol absorbs it. Switch sessions/models and paste the same Kickoff Prompt — it is idempotent.
- End of every session, regardless of reason: update the auto-memory `cnwm-project-state.md` (run status, phase, next action, session/model) so even the memory layer survives.

### C5. Model & effort recommendation
- **Recommended: Fable 5, effort HIGH for Phases 0–3 and 5; raise to XHIGH for Phase 4 (the Museum) and every Phase 6 juror pass.** The mechanical phases are instrument-gated (model ceiling barely shows); the museum build and adversarial verdicts are where capability reaches pixels. This split conserves Fable usage for the two places it matters.
- **Simplest alternative:** Fable 5 XHIGH end-to-end, accepting faster usage burn (pair with the museum-first pivot).
- **Fallback: Opus 5 at MAX effort** — identical protocol, fully acceptable for P0–P3/P5; for P4/P6 expect more fix-loop iterations at the juror gate (the gate, not the model, enforces the bar — quality is protected either way).

## Critical files
`<P>/src/styles/global.css` · `<P>/src/components/icons.ts` + `Icon.astro` · `<P>/src/pages/{index,[chapter],map,people,paintings,about}.astro` · `<P>/src/components/{Menu,WalkProgress,SiteFooter}.astro` · `<P>/src/components/{TroyMap,AudioStory,EmbedMap,PressReveal}.tsx` (PressReveal retired) · `<P>/src/lib/{curtain,text}.ts` + new `observe.ts` · new `src/components/Museum*` (Three.js island) · `<P>/scripts/` + new `{moments,strip,arrival,contrast}.mjs` · `<P>/package.json` · `<P>/docs/{RUN-STATE,CONTENT-STATUS,DEVIATIONS}.md`

## Verification
Pixels over code: every fix re-shot, checked into RUN-STATE with before/after. Phase gates: P1 strip+census+contrast · P2 E7 filmstrip + F2 fold + curtain fail-open · P3 60fps trace + grayscale route proof · P4 juror bar + perf budget + fallback matrix · P5 contrast sweep · P6 dual-rubric ×2. Push every ≤3 commits; sync this plan into `<P>/docs/PLAN.md` at kickoff (compaction-proof; RUN-STATE is truth).

## Risks & cut-line
1. **Museum blow-up** (the L item eats the run): timeboxed — single hall, rail-only before free-look, stills before video textures; ship rule protects the site (grid stays if bar missed).
2. **Type migration breadth** (every page touched): token-level swap + full shots diff; audition prevents thrash; Martel stays as prose fallback if the pairing needs it.
3. **Ch2 "1 and 2" misread**: locked reading flagged at top; twin-template is structurally reversible into split pages.
4. **Hero immersion vs QR performance** (items 2/16 pull against LCP): E7 is the tiebreaker — text first, poster ≤2.5s on Slow-4G, films thin-pipe-skipped.
5. **Carousel fix regressing map stability** (v4's "one thing working"): behavior-preserving refactor, 60fps trace + states.mjs before/after.
Cut-line order: museum video-textures → museum free-look → icon custom-drawing (harmonized library instead) → people cards (typographic pass only).

---

## KICKOFF PROMPT (paste into the fresh execution session — idempotent: same prompt bootstraps, resumes, and survives model switches)

```
You are running the CNWM v6 award-elevation build, fully autonomously, to completion.
Repo: /Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2  (always quote the path; branch main tracks origin/v2; plain `git push` only — NEVER push main:main).

FIRST ACTIONS, in order:
1. Read <repo>/docs/PLAN.md fully. If it is missing or older than ~/.claude/plans/ultrathink-below-are-the-spicy-gadget.md, copy that plan file over it verbatim and commit. It is the constitution: locked decisions, the seven-element test battery, Phases 0–6, Part C continuity rules.
2. Read <repo>/docs/RUN-STATE.md. If it has a v6 section → resume exactly from its NEXT ACTION. If not, this is bootstrap: create the v6 section (format in PLAN.md Part C1) and begin Phase 0.
3. Run `git status` and `git log --oneline -10`. Dirty tree = suspect: build and re-shoot pixels before committing anything; never discard work silently. If RUN-STATE and git disagree, git + pixels win — correct RUN-STATE first.
4. Update auto-memory `cnwm-project-state.md`: v6 run started/resumed, this session's model, current phase.

OPERATING RULES (from PLAN.md, non-negotiable):
- Disk is truth; the conversation is disposable. One work item = implement → re-shoot → commit → update RUN-STATE as ONE atomic act; push every ≤3 commits; always write NEXT ACTION before stopping for any reason.
- Pixels over code: no fix is done until re-shot. Instruments: npm qa:* scripts (wire in Phase 0).
- Fully autonomous — no check-ins. Human-only items (Kathy sign-offs, re-records, ferry rewrite, Athenaeum image, Figma-arrow export if unavailable) go to the REVIEW-GUIDE queue, never block.
- Content: Figma-as-amended is the authority; Kathy's approved facts untouchable; nothing invented; UI microcopy allowed.
- Guardrails: no loading gates, no scroll-jacking, reduced-motion parity everywhere, no hover-only affordances, no interrupting overlays.
- Finish = Phase 6 dual-rubric juror gate (Sheet A: Awwwards axes ≥8 every breakpoint class, zero P0/P1 · Sheet B: all seven elements ≥ Met in full, ≥2 Exceeded incl. the Museum), TWO consecutive clean passes by fresh jurors, live end-to-end verify, docs/v5/REVIEW-GUIDE.md written, memory + RUN-STATE updated, pushed.
- Usage pressure: follow PLAN.md Part C4 (museum-first pivot; atomic act at cutoff; this same prompt resumes in the next session on any model).
```
