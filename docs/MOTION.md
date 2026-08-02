# Motion inventory — CNWM v3

*The complete effect ledger (Phase 4 deliverable). **The thesis all motion serves: the past
developing into the present.** Every effect names what it communicates; every effect has a
reduced-motion variant; nothing gates content. House tokens: `--dur-ui` 300ms ·
`--dur-reveal` 800ms · `--dur-curtain` 600ms · eases `--ease-house` (power2.out),
`--ease-pop` (back.out 1.7), `--ease-circ-in-out/out`.*

| # | Effect | Trigger | Duration / easing | Reduced-motion variant | What it communicates |
|---|---|---|---|---|---|
| 1 | Curtain cover (panel up + wordmark in) | any internal link click | 0.6s circ.inOut + 0.3s text | instant navigation, no curtain | passage between places; the memorial's name carries you |
| 2 | Curtain exit (hold → panel up out) | next page load (flagged) | 0.45s hold + 0.6s circ.out | none (no cover happened) | arrival; doubles as the loader — no spinner exists |
| 3 | Curtain fail-open | 4s (cover) / 3s (exit) watchdogs | 0.4s force-exit | n/a (safety) | content is never hostage (guardrail F2) |
| 4 | Home frame fade-in | page load | 1.4s ease-house, opacity 0→.5 | static at 0.5 | the past surfacing |
| 5 | Home stack staggered rise | page load | 0.9s ease-house, 160ms stagger ×6 | static | the title card composing itself |
| 6 | Home rule draw (1821—1875) | page load (after dates rise) | 0.7s scaleX ease-house | static | a life span, drawn |
| 7 | Press-and-hold reveal | pointer hold on chapter hero | 1400ms hold, decay 2.2×; lock → video | tap/click crossfades sketch↔painting | THE signature: the sketch develops into the living painting |
| 8 | Hero scrub parallax | scroll through first viewport | scrub 0.5; media scale→1.4 un-round, header y→−200 | none (static hero) | the painting takes over the frame as you enter the story |
| 9 | Scroll-reveal suite (.reveal) | element enters viewport (IO 12%) | 0.8s ease-house, y 30→0 + fade | visible always | sections surface as you walk deeper |
| 10 | Quote reveal (.reveal-quote) | quote enters viewport | 1s ease-house, scale .96→1 + rise | visible always | a spoken line arriving |
| 11 | Two-state player lift | play/pause | 300ms colors (p3↔p4) + cover scale 1↔1.02 | same (color/scale only, no positional motion) | the player is awake and reading |
| 12 | Time pill morph | play/pause | 300ms width via stacked spans | same | time starts existing when audio does |
| 13 | Mini-player swap | main play button leaves viewport | 300ms opacity swap | same | the narration walks with you |
| 14 | Narration highlight wash | timeupdate hits paragraph timing | 300ms background (primary-4 wash) | same | the voice's place on the page |
| 15 | Painting interlude Ken Burns | scroll through interlude band | scrub 0.6; scale 1.12→1, y −4→+4% | static image | the camera moves through the painting |
| 16 | Moral section reveals | scroll into moral | 0.8s ease-house staggered (via .reveal) | visible | the lesson assembles |
| 17 | Menu open pop | hamburger click | 0.6s back.out(1.7) from corner | instant toggle | the corner unfolds |
| 18 | Menu close + hamburger return | close click / Escape | 0.3s back.in + 0.5s rotate return, bars stagger 0.1 | instant | tucked back into its notch |
| 19 | Map overview prologue | /map load (no deep link) | 3.5s easeTo 13.75/0/0 → 15.25/33/10 | starts settled | the city rises into view — the intro film IS the map (skippable: any touch) |
| 20 | Deep-link cinematic arrival | /map?stop= load | 5s easeTo zoom 20 + name plate fade | jumpTo, plate shown | flying to where you're standing (skippable) |
| 21 | Marker state change | selection changes | 300ms transform scale .8↔.9 + colors | same | which stop is speaking |
| 22 | Selection dive | marker/card tap | flyTo zoom 20, speed .6, curve 1.4 | jumpTo 18.5 | dive through the pin to the street |
| 23 | Overview return | Overview button | 2s easeTo | jumpTo | pulling back to see the whole walk |
| 24 | Carousel snap + scale | drag/tap cards | 400ms linear; active 1.0 vs .85 origin-bottom | same (transform states) | the focused chapter stands forward |
| 25 | Camera follows carousel | animationEnded + 150ms debounce | flyTo (as #22) | jumpTo | the city follows your browsing |
| 26 | Route self-draw | map load + 1.2s | rAF ~3 pts/frame, dotted #F26835 | drawn instantly | the walk inscribing itself on Troy |
| 27 | Guided flythrough | "Take the walk" | 2.6s flyTo per stop + 3.4s hold ×5 | stepped jumps, 1.2s holds | the whole rescue route as one flight (Stop button always visible) |
| 28 | 1860 lens crossfade | lens toggle | 700ms opacity | same | the modern map dissolves into Mark Priest's 1860 Troy |
| 29 | EmbedMap chapter arrival | WhereToNext enters viewport (client:visible) | 5s easeTo per-chapter camera | starts at destination | the next stop approaching |
| 30 | Ambient painting loops | autoplay muted mp4s (hero video, historical, gallery dialog) | continuous, posters as fallback | posters/stills (`motion-reduce` + poster) | the paintings are alive |
| 31 | Micro-interactions (buttons, links, cards) | hover/focus/active | 300ms colors/inset-shadow | same (non-positional) | everything answers your hand |

## Rules enforced
- Reduced-motion parity: rows 1–31 each carry a variant; the global
  `prefers-reduced-motion` clamp in global.css floors all CSS transitions/animations at 0.01ms.
- No scroll-jacking anywhere; native scroll only. Scrubs (8, 15) read scroll, never write it.
- No loading gates: static HTML renders content before any JS; the curtain is the only
  full-screen moment and it fail-opens (row 3).
- Zero CLS by construction: reveals animate transform/opacity only; media boxes carry
  explicit aspect/height (structural CSS).
