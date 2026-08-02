# pasqua.it — Immersiveness study

Benchmark dimension: **IMMERSIVENESS** · studied 2026-08-02 for CNWM v3.
Evidence in `docs/qa/inspiration/pasqua/` (home--*.png = entry gate; post-gate-*.png = after clicking through).

**What it is.** "House of the Unconventional" — Pasqua Wines' brand site is a single
continuous WebGL villa: every "page" is a themed room (Ch. I Vision = a mountain of
books with a wine bottle pouring a suspended ribbon of wine; another room grows a
chandelier from the floor; a taxidermy tiger wanders the hub). Nuxt 2 + bundled
Three.js; scenes are GLB models (`tiger.glb`, `book.glb`, `camere.glb` "rooms",
`cornice.glb` "frame"). Body scroll is disabled entirely — wheel/drag drives the
camera. Audio is WebAudio (`bg.mp3` ambience + `transition-v2.mp3` sting), unlocked
by the entry click.

---

## Named techniques

### 1. Film-title framing ("PASQUA WINES / PRESENTS")
Evidence: `home--1440.png`, `post-gate-1--1440.png`.
The entry screen is styled as a title card: sans-serif brand line over an oversized
serif "PRESENTS", centered on full-bleed art. The framing *persists inside* the
experience — every chapter title carries a small parenthetical over-title
"(PASQUA WINES PRESENTS)" and a chapter numeral "(CH. I)", so the whole site reads
as one continuous film rather than a set of pages.
**CNWM steal:** open with "THE HART CLUETT MUSEUM PRESENTS / THE RESCUE OF CHARLES
NALLE" as a title card over the first animated painting; carry a tiny over-title +
stop numeral ("STOP III — THE COMMISSIONER'S OFFICE") into every chapter header. Cheap
(pure typography), huge narrative-cohesion payoff.

### 2. The CTA *is* the loader (loading-as-theater)
Evidence: probe tab-order — one `<button class="b-room-cta">` contains both labels
`"PLEASE WAIT" → "START THE EXPERIENCE"`.
There is no progress bar. The gate button itself starts as "PLEASE WAIT" and swaps
to "START THE EXPERIENCE" when assets are ready — loading state and consent gate are
the same UI element, so the wait feels like a theater door opening, not a spinner.
**CNWM steal:** the curtain page transition can double as the loader: curtain stays
down with "PLEASE WAIT" stitched into it, label swaps to "BEGIN THE WALK" when the
chapter's painting video + narration are buffered. One element, two jobs.

### 3. Gesture-gated sound-on entry
Evidence: probe — zero AudioContexts pre-gate; post-click one `running` context,
`bg.mp3` + `transition-v2.mp3` fetched; a `base-audio-switch` toggle appears.
The single deliberate click grants the browser audio permission, so the world can
open *with* sound — ambience fades in as the camera pulls back. A persistent sound
toggle remains available after.
**CNWM steal:** CNWM's narration has the same autoplay problem. Use the entry
click ("Begin") to unlock audio for the whole session, start soft ambience (street
sounds, 1860 Troy), and keep a visible sound toggle. Never autoplay narration before
that first gesture.

### 4. The pull-back reveal (entry image is an object inside the world)
Evidence: compare `home--1440.png` (vineyard "photo") with `post-gate-0--1440.png` —
the vineyard is actually a framed painting hanging in an archway of the 3D villa;
clicking the gate pulls the camera back to reveal the room around it.
This is the site's signature moment: what you thought was the background turns out
to be an artwork *inside* the space you're about to explore. Instant depth, instant
"I am somewhere."
**CNWM steal:** directly translatable without WebGL — open on a full-bleed crop of
a painting, then on "Begin" scale it down into a framed, captioned artwork sitting
in the dark page layout (a simple transform + border animation). The visitor learns
the grammar in one beat: paintings are windows into 1860.

### 5. Chrome dissolved into the scene
Evidence: `post-gate-3--1440.png`, `post-gate-0--390.png`.
No bars, no cards, no backgrounds: the header is bare letterspaced text floating on
the render; prev/next chapters sit in the bottom corners as small-caps serif labels
with tiny olive circular arrows; the only solid UI is the pill CTA. On mobile,
everything collapses to logo + one "MENU" pill. UI colors are sampled from the scene
(olive, parchment) so chrome feels *of* the world.
**CNWM steal:** keep CNWM's nav as bare warm-toned text over the dark ground (no
header bar), and put "← Stop II / Stop IV →" as corner labels styled like the
chapter markers. Tint all controls from the painting palette (ochre, oxblood,
lamplight).

### 6. Typography floats in the world, world moves behind it
Evidence: `post-gate-1--1440.png` vs `post-gate-2--1440.png` — the same huge title
"HOUSE OF THE UNCONVENTIONAL" holds screen position while the camera travels to a
different room behind it; scene objects (chandelier) partially overlap the letters.
Titles are screen-space, scenes are world-space; the parallax between them is what
sells the depth. The type itself is enormous (~12vw serif) and low-contrast
(parchment on parchment), acting as atmosphere rather than label.
**CNWM steal:** during the curtain transition or while an animated painting plays,
keep the chapter title fixed while the painting video pans/zooms behind it; let the
title sit at slightly reduced opacity so brushwork shows through. Same trick, zero
WebGL — just a fixed-position heading over a moving `<video>`.

### 7. Scroll replaced by authored camera travel (drag/wheel = dolly)
Evidence: probe — `scrollHeight == innerHeight`, `body overflow: hidden`, wheel
events advance the experience while `scrollY` stays 0; hub shows "DISCOVER / DRAG"
affordances.
There is no document to scroll; input is remapped to camera movement along an
authored path between rooms, so pacing is fully directed. Chapter hand-offs
("(CH. II) ROOTS →") make the route feel like a guided tour, not navigation.
**CNWM steal:** don't hijack scroll (see traps) — but steal the *pacing model*: one
beat per viewport, explicit next-stop hand-offs at chapter ends styled as tour
directions ("Continue to Stop IV — First Street"), matching the literal walking
route.

### 8. Art-directed responsive recomposition
Evidence: `home--390.png` vs `home--1440.png`; `post-gate-0--390.png`.
Mobile is not a squeezed desktop: the camera reframes (villa shifts off-center, the
archway becomes a full-height portal), type re-stacks, and nav collapses to a single
pill. The 390 view is its own composition of the same scene.
**CNWM steal:** define a mobile crop/`object-position` per painting (portrait focal
point) instead of center-cropping the 16:9 videos; walkers on the actual route will
see the 390 version first.

---

## Traps to avoid

1. **Everything hostage to the gate.** Nothing — not text, not wines, not contact —
   is reachable without clicking through a WebGL loading gate. Headless/SEO/slow
   devices get a title card and a button. The probe's first two screenshots *are*
   the entire no-JS experience. CNWM must keep story text, map, and stops as real
   HTML pages; the theatrical entry is a layer on top, not the door to everything.
2. **Reduced-motion is ignored.** Emulating `prefers-reduced-motion: reduce`
   changed nothing — same canvas, same camera flights. CNWM's constitution already
   forbids this: posters instead of videos, cross-fades instead of curtain sweep.
3. **Sound-first, caption-never.** The experience assumes hearing; ambience and
   transitions have no visual equivalent, and if you decline sound nothing replaces
   it. CNWM narration needs synced transcripts/captions as a first-class equal, and
   the "sound on?" choice should be explicit at the gate, not implied.
4. *(minor)* **Scroll hijack tax.** Wheel-as-dolly means no scrollbar, no position
   memory, awkward keyboard travel. Fine for a wine brand, wrong for a memorial
   people will revisit mid-walk on a phone. Keep native scroll.

---

## One-line verdict
Pasqua's immersion is 90% staging and 10% technology: a title card, a loader
disguised as a theater door, one camera pull-back that reframes the hero image as
an artwork inside a world, and chrome dyed to match the scene. All four moves
survive translation to CNWM's HTML/video stack; the WebGL villa itself is the part
to admire and not copy.
