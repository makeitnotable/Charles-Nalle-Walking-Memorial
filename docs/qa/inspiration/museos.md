# Museos para el Siglo XXI — motion, animation & content layout study

Site: https://museos.arteyeducacion.org (arte Y educación, Uruguay)
Studied: 2026-08-02, hands-on via Playwright (desktop 1440×900 + mobile 390×844).
Screenshots: `docs/qa/inspiration/museos/` · probe scripts: `scratch/museos-probe*.mjs`

**Tech (verified in DOM/network):** Astro on Vercel (same stack as CNWM), only 2 JS
files on the page. GSAP is bundled at module scope (inline-style signature
`translate: none; rotate: none; scale: none` on animated nodes) — not on `window`,
no ScrollTrigger/Lenis globals. Custom cursor = Cuberto `mouse-follower`
(`.mf-cursor`). Images served from Prismic CDN with `auto=format,compress` +
server-side `rect=` art-directed crops. Fonts: Untitled Sans (headings/UI) +
Untitled Serif (prose). A fixed `z-[9999]` full-viewport section on every page acts
as the page-transition curtain. Body palette driven by `--background`/`--foreground`
CSS variables, flipped per section.

Prior hypotheses — all six verified: three narrator voices per artwork ✓ ·
press-and-hold reveal ✓ · numbered editorial sections ✓ · rolling-digit dates ✓ ·
inverted palettes ✓ · CDN-optimized media ✓. (The "unskippable slow preloader" did
not reproduce headless — the intro headline settles in ~2–3s; treat as mild.)

---

## Named techniques worth studying

### 1. Cursor image-trail hero
**What:** On the one-viewport homepage, mouse movement spawns a trail of small
artwork thumbnails (12 pre-sized `/trail/image-N.jpg` files preloaded at page
load) that pop in along the cursor path and linger, scattered around the giant
parenthesized headline "(MUSEOS PARA EL SIGLO XXI)".
**Why it works:** The collection introduces itself through play — you "shake"
artworks out of the page before you ever see a menu. Preloading fixed-size trail
images keeps it 60fps-cheap.
**Evidence:** `probe-home-trail--1440.png` (scattered thumbnails after a cursor
sweep), `home--1440.png` (headline caught mid mask-reveal).
**CNWM steal:** A restrained version on the landing hero — cursor/touch-drag
scatters small Mark Priest sketch fragments (pencil studies) over the dark brown
field. Pre-cut 8–12 small crops at build time. Desktop-only garnish; mobile gets
the static collage instead.

### 2. Wheel-handoff from intro to horizontal artwork slider
**What:** The homepage is only 909px tall — no page scroll. The first wheel/swipe
dismisses the fixed intro layer and hands control to a horizontal painting slider:
one large centered canvas, the next one peeking at the right edge, dotted
progress strip at bottom (square = current), persistent header/footer chrome.
Hovering a card grows a "+" button and reveals title + "Juan Manuel Blanes, 1898"
caption under the frame.
**Why it works:** Scroll intent is repurposed as gallery navigation — the site
feels like walking past canvases rather than reading a web page; the peek + dots
promise more without a menu.
**Evidence:** `probe-home-afterwheel--1440.png` (slider with right-edge peek),
`probe-home-cardhover--1440.png` (caption, + button, dotted paginator).
**CNWM steal:** The 5-stop chapter picker as a horizontal "walk" — each stop a
painting card with the next peeking in, 5 dots below mirroring the physical
route. Keep normal vertical scroll inside chapters; use the slider only as the
hub.

### 3. Chapter title plate → crop-collage reveal
**What:** Detail pages open with a solid near-black plate: author kicker in
parentheses `(Juan Manuel Blanes)`, then the title in enormous compressed
grotesk filling the full width over two lines. Directly beneath, before you ever
see the whole painting, comes a full-bleed collage of overlapping detail crops
(face, drape, jaguar skin) — the work arrives in fragments first.
**Why it works:** Withholding the full canvas builds appetite; the fragments make
you *look* at brushwork the way a docent would point at it. The hard black plate
gives every chapter an identical, confident opening beat.
**Evidence:** `probe-detail-scroll0--1440.png` (title plate + top of crop),
`probe-detail-scroll0--390.png` (mobile: kicker, title, stacked crop collage).
**CNWM steal:** This is the chapter-opener pattern: warm dark plate, "(Mark
Priest)" kicker, stop title huge, then fragments of the painting (or sketch →
painting pairs) before the full reveal. Maps perfectly to 5 chapters.

### 4. Odometer date plate ("rolling digits")
**What:** A full-width close-up of the gilded frame's brass nameplate, then a
dark plate with the work's date at ~40vh in serif — each digit is a vertical
`0123456789` column translated into place (odometer/slot-machine roll as it
enters), labeled quietly "(Fecha de la obra)".
**Why it works:** A single number becomes a scene. The frame close-up above it
grounds the date in a physical object; the serif at giant size against the
grotesk everywhere else marks it as "historical voice".
**Evidence:** `probe-date-digits--1440.png` (frame plaque + giant 1898); DOM shows
four `0123456789` columns in the section (`scratch/museos-probe2.out`).
**CNWM steal:** "April 27, 1860" as a rolling-digit plate at the top of the story
— or roll the stop number (01…05) at each chapter break. Cheap to build (CSS
translate on digit columns, GSAP or vanilla), huge payoff, and reduced-motion
fallback is just the static number.

### 5. Numbered editorial spine
**What:** Every content block carries an index: `(0) Introducción`, `(5) Contexto
Histórico`, `(6) Videos relacionados`, `(7) Autor`, `(8) Nuestra iniciativa`,
references. Inside the artwork tour the figures use bracket numbering `[1]–[4]`
like plate numbers. Layout is a two-column grid — small numbered label left,
serif prose right — with enormous vertical breathing room (`mb-36 md:mb-96`).
**Why it works:** The numbers turn a long scroll into a legible table of contents
you feel as you pass it; the label/prose split keeps line lengths short and
museum-catalog formal. Two type voices (grotesk labels, serif prose) do all the
hierarchy work.
**Evidence:** `probe-detail-scroll6--1440.png` ((8) label left, prose right),
`probe-detail-scroll2--1440.png` / `probe-detail-scroll3--1440.png` ([1], [4]
figure slides).
**CNWM steal:** Number the walk: (01) Mansion … (05) Bakery on chapter pages, and
[1]…[n] for figures inside each painting's analysis. Gives the 5-stop route a
typographic identity that matches the physical wayfinding.

### 6. Pinned hold-to-reveal painting tour
**What:** After an explicit full-screen instruction slide ("mantené el cursor
apretado para revelar la obra completa"), a pinned 100vh section walks through
detail crops `[1] Mujer blanca → [4] Jaguar`: absolutely-stacked slides
crossfaded via opacity/visibility as you scroll, a gold `#BC9859` progress bar
scaling on X across the top, each slide = numbered label + circular detail crop +
one paragraph. Press-and-hold anywhere fades the slide away and reveals the FULL
painting full-bleed; release returns you to the crop. Section flips to the
inverted palette (`bg-[--foreground] text-[--background]`) and sets
`user-select-none`. Mobile swaps the hold for a round "+" tap button per slide.
**Why it works:** It converts passive scrolling into *looking*: the crop tells
you where to look, the hold answers "show me the whole thing" exactly when
curiosity peaks, and the gesture cost makes the reveal feel earned. The palette
inversion signals "you are now inside the painting."
**Evidence:** `probe-tour-before-hold--1440.png` vs
`probe-tour-during-hold--1440.png` (crop slide → full-bleed canvas while mouse is
down), `probe-detail-scroll4--1440.png` (reveal state), gold progress bar visible
top-left growing between `probe-detail-scroll2/3--1440.png`;
`probe-detail-scroll2--390.png` (mobile "+" button variant).
**CNWM steal:** The single best fit for CNWM: hold-to-reveal maps to *sketch ↔
finished painting* (hold to see the painting resolve from Priest's study), or
crop-tour the rescue scene figure by figure (Nalle, the crowd, the officers)
with narration. Keep their instruction interstitial and the mobile tap-toggle;
add a keyboard binding (space/enter) they lack.

### 7. Audio narration as editorial rows, not players
**What:** Narration is a content section, not a widget: three full-width rows —
`ADULTOS/AS 3:59` (Patricia Lannes, Voz Educadora), `ADULTOS/AS 5:48` (Mónica
Michelena, Rep. Charrúa), `NIÑOS/AS 1:15` (Mariana Valdés) — each with a thin
circular play button, giant uppercase audience label, duration superscript, and
right-aligned narrator credit, separated by hairlines on the dark ground. Rows
expand into an inline scrubber on tap; `<audio>` elements exist with no `src`
until played (lazy). Compact pill versions of the same three voices reappear in
a floating mini-player.
**Why it works:** Treating voices as *content choices* (educator / indigenous
representative / children) instead of one buried play button makes multiple
perspectives the point of the page. Typographic scale does the affordance work —
no player chrome needed until asked for.
**Evidence:** `probe-detail-scroll1--1440.png` (the three rows); button/audio
inventory in `scratch/museos-probe2.out`.
**CNWM steal:** Present CNWM's real narration exactly like this per chapter:
rows for e.g. NARRATOR / HISTORIAN / YOUTH cut, duration + credit right-aligned,
hairline rows on the warm dark ground. Also steal lazy `src` assignment — five
chapters of audio never preload.

### 8. Per-section palette inversion via CSS variables
**What:** The whole site runs on `--background`/`--foreground` utilities. Chapter
pages are dark (near-black `#1a1815`-ish, white text); the analysis tour inverts
to warm off-white with black text; the homepage is white. Sections declare
`bg-[--foreground] text-[--background]` to flip. The gold `#BC9859` accent
survives both modes.
**Why it works:** Inversion is the cheapest possible "act change" — no imagery
needed. Long dark stretches don't fatigue because the reading-heavy analysis
happens on light ground.
**Evidence:** `probe-detail-scroll2--1440.png` (light tour) vs
`probe-detail-scroll5/6--1440.png` (dark videos/initiative sections) on the same
page.
**CNWM steal:** CNWM is committed to dark warm brown — use inversion sparingly:
flip to warm cream (aged-paper tone) for the sketch/analysis passages inside
each chapter, keeping orange as the constant accent. One variable pair, already
compatible with Astro + vanilla CSS.

---

## What it does poorly (traps to avoid)

1. **Pointer-trapping fixed overlays.** The homepage intro is a fixed
   `data-text-wrapper` layer covering the viewport; the slider links underneath
   are unreachable until you wheel past it (our Playwright hover timed out for
   60s on an element that was "visible and stable"). Any full-viewport fixed
   layer over interactive content breaks middle-click, tab-focus and assistive
   tech. CNWM: never stack a decorative fixed layer over links; dismiss intros by
   removing them from the DOM, not just handing off wheel events.

2. **Desktop-tuned rhythm leaves mobile voids.** Spacing like `mb-36 md:mb-96`
   plus 100vh transition plates produces near-empty screens at 390px —
   `probe-detail-scroll1--390.png` is a full viewport that is ~15% arrow, 85%
   blank. On a phone that reads as "the page is broken/over." CNWM: audit every
   chapter at 390 for consecutive empty viewports; cap section gaps on mobile.

3. **Gesture-dependent content with no universal input.** The hold-to-reveal
   needs a dedicated instruction slide to be discoverable, sets
   `user-select-none` (fighting native long-press/selection), and ships a second,
   divergent mobile interaction ("+" tap) — and there is still no keyboard path
   to the full-painting reveal, and no visible scroll affordance on the 1-screen
   homepage at desktop. CNWM: keep the gesture, but make it an enhancement over a
   plain button/keypress that does the same reveal, per the constitution's
   keyboard + reduced-motion baseline.
