# Marseille 2021 (laphase5.com) — MAP + INTERACTIVITY study

Benchmark for CNWM v3's Mapbox walking-tour centerpiece. Probed hands-on with
Playwright at 1440 and 390 (scripts in `scratch/marseille-*.mjs`; raw logs in
`docs/qa/inspiration/marseille/*-log.txt`). All screenshots referenced below live
in `docs/qa/inspiration/marseille/`.

## Tech verified (not guessed)

- Vue SPA + **custom WebGL2 renderer** (one fullscreen canvas, `.WebGL`). No
  Mapbox/Leaflet/THREE globals — bundled engine. Loads `models/terrain.glb`,
  `models/water.glb`, plus **93 self-hosted binary vector tiles**
  (`map/roads/16-x-y.bin` on CloudFront) — they built their own tile pipeline
  for one city at zoom 16.
- **Hybrid render stack**: WebGL draws terrain/water/extruded buildings/pins;
  a DOM `.Labels` layer holds every district name as a positioned `<div>`
  re-projected each frame; `.Pins`/`.Pin-direction`/`.HoverPin`/footer are DOM.
- **Howler.js audio**, one file per micro-interaction: `pin_over.mp3`,
  `pin_out.mp3`, `zoom.mp3`, `btn_over.mp3`, `btn_click.mp3`, ambient `map.mp3`,
  and per-category panorama beds (`360_culture.mp3`, `360_outdoor.mp3`,
  `360_enterprise.mp3`). Global mute in the fixed header.
- **Deep-linkable routes** for every state: `/en`, `/en/:place/360`,
  `/en/:place/details`, `/en/pages/about`.

## Named techniques worth stealing

### 1. Counter-to-question onboarding
Loader is a bare rolling odometer (`en--1440.png`, `probe-1440-01-loaded.png`)
that counts to 100 while ~100 assets preload, then resolves into a single
question — "WHAT IF YOU DISCOVERED MARSEILLE DIFFERENTLY THIS YEAR?" — with one
"Next" button. Question-led entry confirmed.
**CNWM steal:** open on a question ("What did Troy look like on April 27,
1860?") — but stream Mapbox tiles behind it instead of gating on 100% (see
Traps).

### 2. Skippable cinematic prologue on the live map
The intro "film" is not video — it is the same 3D scene doing a slow flyover
while kinetic type ("FULL OF / SURPRISE") plays, with a persistent bottom-center
"Skip intro" (`walk-1440-02-after-next.png`). The film doubles as the map
warming up, so skipping lands you on an already-hot scene.
**CNWM steal:** Mapbox free-camera flyover chaining the 5 stops as the intro,
title cards between stops, always-visible Skip, ending parked at Stop 1. Zero
extra asset cost — it's the same map.

### 3. Compass-bezel pin hover (`.HoverPin`)
Hovering a pin swells a dark ring around it: place name curved along the top
arc, district curved along the bottom ("CITY HALL • OLD PORT") — reads like a
wax seal / compass bezel (`pin-1440-02-hover.png`). Cursor flips to pointer,
`pin_over.mp3` ticks, `pin_out.mp3` on leave.
**CNWM steal:** on marker hover/focus, swell an SVG ring around Brian's plaque
pin with the stop name on a `<textPath>` circle ("MANSION • STOP 1 •"). On
touch, make first tap show the ring, second tap commit (see Traps).

### 4. Dive-through-the-pin selection
Clicking a pin routes instantly to `/en/city-hall/360`; the camera dives toward
the pin and crossfades into a full-bleed 360 panorama while a giant emotional
statement animates in letter-by-letter ("YOU ARE MAJESTIC",
`map-1440-07-list-item-selected.png`; mid-transition ghosting of map labels
visible in `pin-1440-05-t3.png`). `zoom.mp3` scores the move. Close reverses it.
**CNWM steal:** on stop select, `map.flyTo` with zoom + pitch increase into the
plaque pin, then crossfade to the stop's hero image (or the 1860 painting
detail) with one bold line ("YOU ARE WHERE THE CROWD GATHERED"). URL becomes
`/stops/:slug` so every stop is shareable.

### 5. Edge-chip wayfinding (`.Pin-direction`)
When pins are off-screen, 24px circular chips clamp to the viewport edges with
a count and a tiny arrow — "10 →" at the right edge means ten places that way
(`map-1440-01-map-initial.png`; counts re-tally live during drag, verified in
`map-1440-log.txt`). Clicking a chip pans the camera toward those pins
(`map-1440-04-pin-click-settled.png`). Present on mobile too
(`map-390-01-map-initial.png`).
**CNWM steal:** perfect for a 5-stop route — clamp numbered chips ("2", "5") at
the screen edge pointing toward off-screen stops; tap = flyTo. Doubles as a
"you haven't seen these yet" progress cue.

### 6. Typographic index with live preview ("All places")
The list view is a full-screen stack of huge condensed all-caps names; hovered
item flips from solid fill to outline, and the right half of the screen plays a
live photo/video preview of that place (`map-1440-06-all-places.png`; mobile
variant with inverted-highlight selection in `map-390-05-all-places.png`).
Click deep-links straight into the place.
**CNWM steal:** an "All stops" overlay with the five stop names huge (numbered),
outline-on-hover, archival image preview on the right. Cheap to build, doubles
as keyboard/screen-reader navigation for the whole tour.

### 7. Two-color world + labels that live in the scene
The entire map is two temperatures: dark desaturated navy (water/ground/roads
as thin white lines) vs warm cream-apricot extruded buildings — instant
map-as-artifact quality. The "Old Port of Marseille" label is perspective-
projected so it reads as painted onto the water (`pin-1440-02-hover.png`).
**CNWM steal:** custom Mapbox style in exactly two temperatures — navy night
Troy + gaslight-cream `fill-extrusion` buildings — tuned to the 1860 painting's
palette so the painting-overlay lens feels continuous with the basemap. Use
Mapbox `symbol` layers with pitch alignment `map` so street/river names lie in
the scene like Marseille's.

### 8. One-line hint card + honest map furniture
First map visit shows a small white card, compass icon + "Click and drag the
map / to discover all places," which dismisses on first drag
(`map-1440-04-pin-click-settled.png`). Footer carries a live scale bar
("200 m" updates with zoom), a compass, "Center the map" reset, and "All
places." Micro-SFX on every control (`btn_over`, `btn_click`).
**CNWM steal:** one hint card max ("Drag to look around — or follow the
numbered route"), a real scale bar (it's a *walking* tour — distance is
content), and a "Recenter route" reset. Skip hover SFX; keep one soft ambient
bed with a visible mute, defaulting muted.

## Traps to avoid

1. **The loader wall.** Everything is gated behind a 100% preload — on a slow
   connection you stare at digits for 30–60s with zero narrative. Headless
   default 2.5s capture never even saw the site. CNWM must render the Mapbox
   canvas progressively and let the question/intro play *over* streaming tiles.
2. **Hover-only identity, tap-blind mobile.** Pins are anonymous white
   teardrops until hover — and touch has no hover, so mobile users tap blind.
   The site is desktop-first ("Center the map" vanishes at 390). CNWM's five
   pins should carry always-visible numbers (Brian's plaque pins numbered 1–5)
   and named labels at rest on mobile — the field-use case *is* mobile.
3. **Depth buried two gestures deep.** A place is a panorama + one slogan;
   the actual story is `/360` → "Discover more" → `/details`
   (`pin-1440-09-discover-more.png`). Emotionally big, informationally thin —
   the prior "shallow per-location content" hypothesis is confirmed. For a
   memorial, the story must be the *first* payload (bottom card carousel on
   selection), with the cinematic layer as garnish, not gatekeeper.
4. **Free-roam with no sequence.** Fine for city tourism, wrong for a walking
   memorial: Marseille has no route, no order, no "next." CNWM keeps the
   carousel's prev/next as the spine and uses these techniques (dive, chips,
   ring hover) *along* the route line.

## Evidence index

- Loader: `en--1440.png`, `en--390.png` · Question screen: `walk-1440-01-post-loader.png` (DOM text in `walk-1440-log.txt`)
- Intro film + skip: `walk-1440-02-after-next.png`
- Map at rest (desktop/mobile): `map-1440-01-map-initial.png`, `map-390-01-map-initial.png`
- Hint card + edge-chip pan: `map-1440-04-pin-click-settled.png`
- Pin hover ring: `pin-1440-02-hover.png` · Dive transition: `pin-1440-03-t1.png` → `pin-1440-05-t3.png` → `pin-1440-08-settled.png`
- 360 statement view: `map-1440-07-list-item-selected.png` · Details page: `pin-1440-09-discover-more.png`
- All-places index: `map-1440-06-all-places.png`, `map-390-05-all-places.png`
