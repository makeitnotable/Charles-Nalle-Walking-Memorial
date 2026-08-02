# CNWM V2 — Phase-Based Execution Plan (3-day target)

*Updated 2026-08-02 after the kickoff session. Supersedes the week-based version. Timeline is **3 days maximum**, organized as phases with hard exit criteria — not calendar weeks. Full project background, stakeholders, and contract facts: memory file `cnwm-project-state.md` and repo `docs/PLAN.md` / `docs/CONTENT-STATUS.md`.*

## Status snapshot

**DONE — Phase 0 (foundation), commit `3e932d6` on `main` of local repo `<project>/cnwm-v2`:**
Astro 7 + Tailwind 4 + React 19 islands + GSAP, TS strict (0 errors), 9 routes building at the frozen slugs, content fully ported from legacy `locationData.jsx` → `src/content/chapters/*.json` with Kathy's documentable corrections applied (ledger: `docs/CONTENT-STATUS.md`), narration MP3s in `public/audio/`, GH Pages workflow, real title/favicon/OG, skip links, reduced-motion baseline.

**DONE — Week 0 prep, staged in `<project>/Week 0 Deliverables/`:** 4 QR codes (SVG + print PNG, EC level H, machine-decode verified) encoding `hartcluett.org/nalle/*`; Amanda's Squarespace URL-Mapping lines; Brian email draft (plaque "ONCE HOUSE"→"HOUSED" typo flag + plan + call after 8/4); Matt email draft. **Sending is Wil's job — Amanda's mappings are the only gate to Matt's payment.**

**PENDING from Wil (tracked in `docs/CONTENT-STATUS.md`):** ferry "skiff, no leap" narrative rewrite · Ch2a + Ch4 audio re-records · Athenaeum image · display-typeface license pick (free-license fallback will be proposed in Phase 1).

## Deploy strategy (corrected — this replaces the "create new GitHub repo" step)

git IS installed. Do not create a new repo. Use the existing infrastructure:

- **GitHub:** `https://github.com/makeitnotable/Charles-Nalle-Walking-Memorial` (old site lives on `main` / `match-figma-designs` — leave untouched).
  Push v2 as an independent branch:
  `cd "<project>/cnwm-v2" && git remote add origin https://github.com/makeitnotable/Charles-Nalle-Walking-Memorial.git && git push -u origin main:v2`
- **Vercel:** project `notableprojects/charles-nalle-walking-memorial` is connected to that repo → every push to `v2` gets an automatic **preview URL** (the per-phase review link, free). Add `vercel.json` to cnwm-v2 with `{"framework": "astro"}` so branch deployments override the project's old Vite preset.
- **Astro config:** default `base: '/'` + `site` = the Vercel production URL (Vercel is the launch target). The GH Pages workflow passes env overrides (`base`, `site`) for the github.io build — GH Pages stays as the zero-cost handoff/escape path, not the launch path.
- **Launch flip (Phase 6):** set Vercel Production Branch → `v2` (or merge). Production URL `charles-nalle-walking-memorial.vercel.app` is what Amanda's `/nalle/*` mappings already target — **include legacy-slug redirects in `vercel.json`** (`/commissioner1 → /commissioners-office`, `/barber → /barbershop`, `/commissioner2 → /commissioners-office#part-2`) so Amanda's Week-0 mappings keep working forever and she never touches Squarespace again. Bronze QR unaffected by any of this.

## The 3 days

Each phase ends with: build green, `astro check` clean, pushed → Vercel preview verified on a real phone. Ship order is fixed; if anything slips, Phase 2 (chapters) is the value core and Phase 6 items cannot be cut.

### Day 1 — the experience core

**Phase 1: Media pipeline + design system (morning).**
- Batch-convert chapter PNGs → AVIF/WebP responsive sets (Astro `<Image>`/sharp); re-encode animated MP4s (H.265+VP9, posters, lazy, `playsinline`); audio untouched pending re-records.
- Tokens: type scale (broadside-inspired display + text serif — propose 2–3 candidates to Wil, free-license fallback wired in immediately), per-chapter palettes from the design-sprint "emotions to feel," paper/ink textures, motion durations/easings, `prefers-reduced-motion` variant for every animation.
- Perf budget in CI: Lighthouse mobile ≥ 90 perf, LCP < 2.5s throttled 4G.

**Phase 2: Chapter experience (afternoon — prove on Bakery, then stamp across all five).**
- Hero: sketch version → **press-and-hold reveal** → animated painting (pointer + touch + keyboard; reduced-motion = crossfade).
- Synced narration: paragraph-level highlight from timestamped JSON (auto-align text↔audio; re-align Ch2a/Ch4 when Wil's re-records land); persistent mini-player; transcript toggle.
- Numbered sections: portal → narrative scenes → historical context → moral → where-to-next (route strip); scroll choreography per chapter palette; inverted palettes between map and chapters.

### Day 2 — the world and the doors

**Phase 3: Map experience (morning).**
- Publish Mapbox style (drop `/draft`); aged-paper texture pass; **1860 Troy map** opacity-toggle overlay (`Design/Website/Chapter Images/Stills/6. Map of Troy New York.png`); exact plaque coordinates from Brian's links; "Commissioner's Office" label.
- Route **draws itself 1→5** with skippable camera flythrough; ambient cues opt-in.
- Two modes: *On the sidewalk* (QR deep link → chapter, "next stop" wayfinding) and *From anywhere* (guided flythrough). Single map instance created once — do NOT port the old `PersistentMap.jsx` multi-instance pattern.

**Phase 4: Entry + multi-door IA (afternoon).**
- Title sequence: "Troy, New York · April 27, 1860," rolling dates, painting waking behind type; < 3s to interactive, skippable, sound opt-in (gesture unlocks audio).
- Doors: **The Walk** (map) · **The Story** (chapters 1–6) · **The People** (Nalle, Tubman, Baltimore, Townsend, Gilbert cards → scenes) · **The Paintings** (gallery + deep zoom). About page ported.

### Day 3 — hardening and launch

**Phase 5: Hardening (morning).**
- Cross-device pass: small iPhone, mid-tier Android, iPad, desktop; portrait + landscape.
- A11y: contrast, focus, semantics, transcripts, reduced-motion end-to-end. Perf audit on throttled 4G against the budget.
- Content verification word-for-word against Kathy's approved text; integrate any delivered re-records/rewrites (`docs/CONTENT-STATUS.md` → all green or explicitly deferred with Wil's sign-off).

**Phase 6: Launch + handoff prep (afternoon).**
- Flip Vercel production to `v2` with legacy-slug redirects live; re-scan all 4 printed QR proofs end-to-end (bronze gate).
- Stakeholder review link to Brian/Kathy/Amanda; Kathy's final sign-off is the content gate.
- Handoff prep: 1-page doc (accounts, URLs, content editing, contacts); Mapbox publish + migration plan to museum account; GH Pages escape hatch documented. Repo/Mapbox ownership transfer executes after client sign-off (it's the contractual close-out, not a launch blocker).
- Awwwards submission package: screens, feature capture video, write-up (submission fee = Wil's call).

## Verification (launch gate)

Every deep link < 3s on throttled 4G · press-reveal + synced narration verified on real touch devices · map pins match Brian's coordinates · Lighthouse mobile ≥ 90 perf / ≥ 95 a11y · `hartcluett.org/nalle/*` → correct v2 pages via the printed QR codes · Kathy sign-off recorded.

## Risks

- **Amanda redirect latency** — only Week-0-critical item; everything else proceeds regardless.
- **Audio re-records late** — chapters ship with current audio + corrected text; re-align highlights when files land (drop-in, no rework).
- **Low-end phone perf** — budgets + reduced-motion + capability detection are Phase 1 scope, not retrofits.
