# Inspiration study — synthesis (Phase 0.5)

*Five benchmark sites studied hands-on 2026-08-02 by independent agents with the Playwright
harness. Full per-site reports with evidence screenshots: `docs/qa/inspiration/{museos,rewild,
marseille,pasqua,googleac}.md` + screenshot folders. This file is the synthesis the
ELEVATION-PLAN builds from.*

## Per-site: what earns the award, what to refuse

### museos.arteyeducacion.org — motion · content layout (annex: museos.md)
Same stack as CNWM (Astro + GSAP + Vercel, 2 JS files/page). Verified: **pinned hold-to-reveal
painting tour** (press-and-hold anywhere reveals the full canvas, gold scaleX progress bar,
mobile "+" tap fallback) — the museum-world twin of our signature; **numbered editorial spine**
`(0)…(8)` + label-left/prose-right grid; **odometer rolling-digit dates**; **narration rows**
as full-width editorial objects (three voices per artwork); crop-collage before full painting;
per-section palette inversion. **Refuse:** intro overlay that traps pointer events; desktop
spacing that leaves near-blank 390 viewports; hold gesture with no keyboard path.

### rewildyourself.com — motion · scroll (annex: rewild.md)
Locomotive Scroll virtualized runway (43 viewports), pinned-stage "acts" where scroll distance
= act duration, scroll-written shader uniforms (world state = narrative position), curtain-rise
loader→intro handoff, per-page entrance choreography, statement→breath→**forked** CTA (story
path vs utility path). **Refuse (hard):** the loader gate bricked the whole site in every
automated context (an invisible overlay with pointer-events:auto) — content hostage to
motion; ~zero `prefers-reduced-motion` handling in 1.2MB of animation code.

### marseille.laphase5.com — map · interactivity (annex: marseille.md)
Custom WebGL city, but every technique translates to Mapbox: **skippable cinematic prologue on
the live map** (the intro film IS the scene flying); **dive-through-the-pin selection** (camera
dives, crossfades to full-bleed place statement); **edge-chip wayfinding** (viewport-edge chips
count off-screen pins, click pans to them); compass-bezel pin hover; typographic index with
live preview; honest map furniture (scale bar, recenter, one dismissible hint card); deep links
for every state. **Refuse:** 30–60s loader wall; hover-only pin identity (tap-blind mobile);
story buried two gestures deep.

### pasqua.it — immersiveness (annex: pasqua.md)
A continuous Three.js villa; the lessons are cheaper than the tech: **film-title framing**
("PRESENTS…", persistent "(CH. I)" over-titles); **the CTA is the loader** ("PLEASE WAIT" →
"START THE EXPERIENCE" — no spinner, anticipation as theater); **gesture-gated sound-on**
(zero AudioContexts before the click, ambience + persistent toggle after); **the pull-back
reveal** (the full-bleed entry image turns out to be a framed painting in a larger world);
screen-space type holding still over world-space motion; art-directed mobile recomposition
(390 is a reframe, not a crop). **Refuse:** everything hostage to the gate (no-JS/SEO gets
nothing); reduced-motion ignored; sound-first with no visual equivalent.

### artsandculture.google.com — storytelling · IA (annex: googleac.md)
**Question-led front door** ("What do you want to discover?"); **content-type eyebrow labels**
(STORY / ONLINE EXHIBIT + institution credit on every card); **story-scroll** full-bleed
painting-crop slides with per-image credit; **zoom-crop essay** (same artwork recropped —
scroll as camera move, sequencing logic stated in copy); **related-content ladder** (siblings →
parent theme banner — no dead ends); **subject-page spine** (portrait → dated fact → counted
sections → giant pull-quote; the Harriet Tubman page is our direct analogue). **Refuse:** the
signup toast that photobombs every view; organization-without-identity ("no soul" confirmed);
gray lazy-load boxes; doors-all-the-way-down with no sense of size — CNWM should *display* its
smallness ("Stop 2 of 5").

## The award DNA (cross-cut, confirmed hands-on)
1. **One signature interaction** — ours is press-and-hold sketch→painting (museos validates it
   as museum-grade; ours adds keyboard + reduced-motion paths theirs lacks).
2. **Narrative before navigation, always skippable** — cinematic arrivals and prologues, never
   gates. The two sites that gate (rewild, pasqua) are the two that break.
3. **Typography carries identity** — Martel's voice is our equivalent of pasqua's screen-space
   titles; the ladder is the system.
4. **Motion has a thesis** — every effect names what it communicates (rewild: growth; marseille:
   flight; museos: development). Ours: *the past developing into the present*.
5. **Sound opt-in** — narration is user-initiated; pasqua's gesture-gate pattern proves consent
   can be elegant.
6. **Craft in the seams** — loaders, titles, favicons, transitions. The curtain doubles as our
   loader (pasqua's "CTA is the loader" without the hostage-taking).
7. **Ruthless media pipeline** — museos' CDN crops ↔ our 95MB AVIF/WebP/H.264 pipeline.

## Guardrails (the traps, as hard boundaries)
- **No loading gate, ever.** Static HTML renders content before any JS. (rewild/pasqua)
- **No scroll-jacking; native scroll only.** (rewild)
- **Reduced-motion parity for every effect** — the benchmark sites' universal failure is our
  differentiator. (all five)
- **No hover-only affordances; every pin/control labeled.** (marseille, museos)
- **No interrupting overlays** — nothing ever photobombs the story. (googleac)
- **Show our smallness** — 5 stops, N of M everywhere; never bottomless. (googleac)
