# Charles Nalle Walking Memorial — V2 Rebuild & Launch Plan

## Context

The Charles Nalle Walking Memorial (Troy, NY) pairs 4 bronze QR plaques (fabricator: Matt Crane / Silver Crane LLC, artist: Brian Tolle) with a story website built by Notable/WBM for the Hart Cluett Museum (historian/content authority: Kathy Sheehan; admin: Amanda Irwin — hard requirement: **zero ongoing hosting cost**). The v1 site (React/Vite SPA) was functionally complete but subpar: generic typography, thin motion, 8.5MB chapter pages, un-applied content corrections, and deploy problems. Plaque production and Matt's payment were blocked on final website URLs for QR generation.

**Decision (2026-08-01): the award-caliber v2 rebuild IS the launch site.** No further polish on the old SPA. The rebuild targets Awwwards-submission quality, modeled on five studied inspiration sites (Museos para el Siglo XXI, Rewild Yourself, Marseille by La Phase 5, Pasqua Wines, Google Arts & Culture).

Wil is the **only person** on the project. Wil personally delivers corrected narrative text + re-recorded audio; Claude executes the build.

### Locked decisions
1. **Sequencing:** Rebuild is the launch (no interim ship of the old site).
2. **Stack:** Fresh **Astro** build — prerendered static pages + interactive islands. Outputs plain files → GitHub Pages hosts it free with real deep-link URLs (no SPA 404 hacks needed).
3. **QR URLs:** Bronze QR codes point at **hartcluett.org redirect URLs** (museum-owned, permanent). ⇒ *QR codes generated and delivered to Matt in Week 0 — plaque production runs in parallel with the build.* Redirects point at the current Vercel site until v2 ships, then flip.
4. **Scope:** Full award spec — entry sequence, route-drawing map, press-to-reveal chapters, synced narration, multi-door navigation, textures/typography, perf + a11y.

## Key paths & facts (source of truth)

- **Project folder:** `/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle`
- **Legacy repo (content + asset source, becomes archive):** `<project>/Charles Nalle Walking Memorial Website/Charles-Nalle-Walking-Memorial` — working branch `match-figma-designs` (104 ahead of `main`; GH Pages workflow deploys stale `main`). Live: `https://charles-nalle-walking-memorial.vercel.app`
- **All legacy narrative/site content:** `src/data/locationData.jsx` (ported → `src/content/chapters/*.json` here). About content: `src/data/aboutData.js` (ported → `src/data/about.ts`)
- **Assets:** legacy `public/` (275MB, unoptimized): per-chapter folders with `square/horizontal/vertical/historical/moral` PNGs (up to 6.2MB each); `public/CNWM - Animated Images/` — animated MP4s of every painting (incl. `_historical`, `_vertical`, `_horizontal`, and chapters 4–5 `narrative_1/2` variants) + `Splash Page Image.mp4`; `public/Audio Files/` — 6 narration MP3s (Ch1 1:24, Ch2a 1:10, Ch2b 1:48, Ch3 2:29, Ch4 2:15, Ch5 2:01)
- **Additional design assets:** `<project>/Design/Images/` (OG paintings, sketch versions of every painting, historical photos); `<project>/Design/Website/Chapter Images/Stills/6. Map of Troy New York.png` (1860 map — use as map overlay); `<project>/Design/Website/Map - *.png`
- **Mapbox:** style `mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft` on Wil's `wbmdesign` account, token in old repo `.env`. Must be **published** (drop `/draft`) and migrated to a museum-owned free account at handoff.
- **Plaque coordinates (Brian, 5/13/26):** Commissioner's Office 5 State St `maps.app.goo.gl/qxYA5PTfSzdrGxA66` · Barbershop 10-6 1st St `maps.app.goo.gl/LcHgr9gTwPj6yby59` · Bakery (vacant lot) `maps.app.goo.gl/fHXxMNQ3HHmJwjXP7` · Gilbert home 189 2nd St `maps.app.goo.gl/GWqdtL7dLqCRcHfi8` · Ferry (website-only, NO plaque) `maps.app.goo.gl/pjrzDfUg6NCsWCj48`. Map label "Bank" → **"Commissioner's Office"**.
- **Kathy's corrections (7/1/26, must be reflected in Wil's new text/audio):** church bells = **Second Street Presbyterian** (not Liberty St — appeared in old locationData lines ~143/167 and Ch2a audio); Mutual Bank portal history: landlord → **employer**; Barbershop portal gets **Athenaeum building image**; Scene 2: quote addressed to "Peter (Baltimore)" + word "them"; Scene 5: Nalle boarded a waiting **skiff** — no leap into the river (affects Ch4 audio). See `docs/CONTENT-STATUS.md` for what is already applied vs. pending.
- **Plaque proof typo (flag to Brian BEFORE casting):** Commissioner's plaque reads "ONCE HOUSE THE" → "ONCE HOUSED THE" (`Context/2026_0610_10x12plaquesNEWLAYOUT.pdf`).
- **Contract facts:** RCHS contract $12k, ownership transfers on payment; open item — subcontractor Giuseppe Mele's final $1,250. Memory file: `~/.claude/projects/-Users-thebayniac-…-Charles-Nalle/memory/cnwm-project-state.md`.

## Design bar (from the five-site study)

1. **One signature interaction** → CNWM's: *press-and-hold the sketch to bring Mark Priest's painting to life* (uses existing animated MP4s), plus the *route that draws itself* across the map.
2. **Narrative before navigation** — cinematic, skippable entry ("Troy, New York · April 27, 1860"); sound opt-in (Pasqua's gesture-gated audio, at Museos' weight).
3. **Typography = identity** — 1860s broadside-inspired display face + readable text serif; kill Martel-Sans-everywhere.
4. **Motion with a thesis** — archival/painterly reveals; per-chapter palette + pacing driven by the design sprint's "emotions to feel."
5. **Sound as a layer** — synced narration w/ paragraph highlighting; optional ambient cues (bells, river); always opt-in; transcripts included.
6. **Craft seams** — real `<title>`/favicon/OG, poetic-but-skippable loader, numbered sections, inverted palettes (Museos), custom cursor on map.
7. **Media pipeline** — AVIF/WebP + srcset, compressed video, LCP < 2.5s on 4G (audience is on a sidewalk on cellular).

## Week 0 — Unblock stakeholders (Wil, ~1 day)

1. **Freeze URL slugs** and send Amanda exact Squarespace redirect instructions: `hartcluett.org/nalle` → home, `/nalle/bakery`, `/nalle/commissioners-office`, `/nalle/mansion`, `/nalle/barbershop` (+ `/nalle/ferry` for web). Initially target the current Vercel URLs; flip to v2 at launch.
2. **Generate 4 QR codes** from those hartcluett.org URLs, test-scan on phone, deliver to Matt + Brian ⇒ plaque production and Matt's payment unblock NOW.
3. **Flag the plaque typo** ("ONCE HOUSE") to Brian before casting.
4. **Schedule the Brian call** (Wil available after Tue 8/4): plaques proceed now, upgraded site ships in ~4–6 weeks at the same URLs.
5. Confirm narrator availability for re-records; settle Mele's $1,250 status.

*Status 2026-08-01: QR codes generated + machine-verified; Amanda instructions and Brian/Matt email drafts written — see `<project>/Week 0 Deliverables/`. Sending is Wil's action. Redirects NOT yet live (verified `/nalle` 404s).*

## Content Wil delivers (before/while M2 runs)

- [ ] Corrected narrative text for all chapters (Kathy's list applied; ideally Kathy signs off the full script once)
- [ ] Re-recorded audio: Ch2 Pt1 (bells), Ch4 (skiff), likely Ch2 Pt2 (quote/"them") — same narrator or full re-record decision
- [ ] Timestamped transcript OR permission for Claude to auto-align text↔audio for synced highlighting
- [ ] Athenaeum building image (from Brian/Kathy) for Barbershop
- [ ] Display typeface choice/license (Claude proposes 2–3 candidates in M1; free-license fallback identified)
- [ ] (Optional, post-launch) children's narration, Spanish track — architecture supports multiple tracks per chapter (Museos pattern)

## Build milestones (execute in order; each ends with a deployed preview + UX review pass)

**M0 — Foundation (wk 1).** ✅ This repo. Astro + Tailwind + GSAP; React islands only where needed (map, audio player, reveal interaction). `locationData.jsx` ported → content collections (one entry per chapter; portal/scenes/quotes/historical/moral/next + per-chapter palette + audio refs). Routes: `/`, `/map`, `/bakery`, `/commissioners-office` (pt1+pt2 merged as one chapter with two scenes), `/mansion`, `/ferry`, `/barbershop`, `/about`, 404. GH Pages CI. Real `<title>`, favicon, OG image.

**M1 — Media pipeline + design system (wk 1–2).** Batch-convert all chapter PNGs → AVIF/WebP with responsive widths (Astro `<Image>`); re-encode MP4s (H.265/VP9, posters, lazy). Type scale, tokens, paper/ink textures, per-chapter palettes, `prefers-reduced-motion` variants of every animation. Perf budget enforced in CI (Lighthouse ≤ perf 90 mobile, LCP < 2.5s throttled).

**M2 — Chapter experience (wk 2–3).** Hero: sketch version → **press-and-hold reveal** → animated painting MP4 (touch + mouse + keyboard accessible; reduced-motion = crossfade). Synced narration: play → paragraph-level highlight (timestamped JSON per chapter); persistent mini-player; transcript toggle. Numbered sections (portal → narrative scenes → historical context → moral → where-to-next w/ route strip). Scroll choreography per design-sprint emotions.

**M3 — Map experience (wk 3–4).** Publish Mapbox style (drop `/draft`); age-paper texture pass; **1860 Troy map** as opacity-toggle overlay; exact plaque coordinates + corrected labels; route **draws 1→5** with camera flythrough intro (skippable); ambient cues opt-in. Two modes: *On the sidewalk* (QR deep link → chapter, "next stop" wayfinding) and *From anywhere* (guided flythrough). The old `PersistentMap.jsx` bug pattern must NOT be ported — one map instance, created once.

**M4 — Entry + multi-door IA (wk 4).** Title sequence ("Troy, NY · April 27, 1860", rolling dates, painting waking behind type; < 3s to interactive, skippable, sound opt-in). Nav doors: **The Walk** (map), **The Story** (chapters), **The People** (Tubman, Baltimore, Townsend, Gilbert, Nalle character cards → scenes), **The Paintings** (gallery + deep zoom). About page designed.

**M5 — Hardening (wk 5).** Cross-device matrix (small iPhone, Android mid-tier, iPad, desktop; portrait+landscape). A11y audit: contrast, focus states, semantics, transcripts, reduced-motion. Perf audit on throttled 4G. Content verification pass against Kathy's approved script (word-for-word).

**M6 — Launch + handoff + award (wk 5–6).** Deploy to GH Pages; Amanda flips the `/nalle/*` redirects to the new site (bronze QR unaffected). Transfer: repo → Hart Cluett GitHub org; Mapbox style+token → museum free account; 1-page handoff doc (accounts, URLs, how to edit content, contacts). Kathy/Brian/Amanda review link → sign-off. Awwwards submission package (screens, feature video, write-up; submission fee = Wil's call).

## Verification

- **Week 0:** all 4 QR codes scan to working pages on a phone over cellular; Matt confirms receipt; Amanda confirms redirects live.
- **Per milestone:** deployed preview + UX review; perf budget green in CI.
- **Launch gate:** every deep link loads < 3s on throttled 4G; press-reveal + synced narration work on touch devices; map pins verified against Brian's coordinates on-site or via Street View; Kathy signs off final text/audio; Lighthouse mobile ≥ 90 perf / ≥ 95 a11y; redirects flipped and re-scanned from the printed QR proofs before casting is finalized.

## Risks

- **Narrator unavailable** → decide splice vs. full re-record in Week 0 (blocks M2 audio sync, not the rest).
- **Amanda redirect latency** → provide copy-paste instructions; QR delivery to Matt cannot happen until redirects exist (only Week-0-critical item).
- **Solo bandwidth** → milestones are independently shippable; M2 (chapters) is the value core if the timeline compresses.
- **Low-end phone perf with heavy motion** → capability detection + reduced-motion fallbacks in scope from M1, not bolted on.
