# CNWM v4 — MOTION CENSUS

Verified by grep over `src/` after the P5 consolidation sweep. v3 shipped
**12 distinct durations and 4 declared easings, 3 of which were dead** — motion
read as thrown-together for exactly the same reason the spacing did.

---

## The vocabulary

| Token | Value | Carries |
|---|---|---|
| `--dur-fast` | **300ms** | state, hover, pills, the sync highlight, the corner-menu retreat |
| `--dur-slow` | **1600ms** | scroll reveals, clip-wipes, the quote settle, the press-reveal lock |
| `--ease` | **`cubic-bezier(0.19, 1, 0.22, 1)`** | everything above |

Measured, not chosen: museos runs a UI tier whose workhorse is exactly 300ms
and a cinematic tier that is effectively just 1.6s, with nothing in between
(`docs/v4/inspo-museos.md` §6). Both museos and Google Arts & Culture drive
their signature motion with that same expo-out curve.

## Reveal grammar

- **Content:** opacity 0→1 with a 24px rise. Stagger 200ms between siblings.
- **Display type:** per-line mask rise — travel is exactly one line-height,
  **opacity never changes** (the mask does the work), stagger 200ms. Measured
  off museos, where the same reveal runs 1.6s at the same curve.
- **Media:** `clip-path` wipe from the bottom edge plus scale 1.04→1.
- **Scrubs** (hero parallax, the Ken Burns interlude) use `ease: "none"` —
  a scrub is driven by scroll position, so any easing would fight the finger.

## Documented exceptions — and only these

| Where | Value | Why it is exempt |
|---|---|---|
| `src/lib/curtain.ts` | 0.6s `circ.inOut` in, `circ.out` out, plus 0.1/0.15/0.4/0.45 beats | The page-transition set-piece. Its timing is approved identity and its fail-open logic depends on the beat lengths. |
| `src/components/TroyMap.tsx` | `flyTo`/`easeTo` at 400 / 2000 / 2600 / 3500 / 5000ms | Mapbox camera language. A 300ms flight across Troy is a teleport, not a move; the 5s arrival is the QR deep-link cinematic. |
| `src/components/Menu.astro` | 0.6s `back.out(1.7)` on open | **The one overshoot in the entire site** — the corner-menu bloom. v3 ran three (`back.out(1.7)`, `back.out(2)`, `back.in(1.7)`); the other two are now `power2`. |

## Reduced motion

Parity is 100%. `@media (prefers-reduced-motion: reduce)` clamps every
animation and transition to 0.01ms, GSAP timelines are gated behind the same
query, and every film marked `data-reduce-static` never attaches a source — its
poster **is** the finished painting, so a reduced-motion visitor sees the
artwork rather than a blank frame.

The same gate now also covers thin connections: `navigator.connection.saveData`
or an `effectiveType` of 2g/slow-2g/3g skips the films entirely. A visitor
standing at a bronze plaque on cellular gets the painting, not a 570KB download.

## Layout stability

CLS measured 0.000 on home, 0.003 on the chapter path, 0.001 on the map
(`docs/v4/qa/p6-perf/summary.json`). Nothing scroll-jacks: the page scrolls
natively everywhere, and the only pinned behaviour is the sticky section rail,
which uses `position: sticky` rather than a scroll handler.

## v7 additions (2026-08-16) — documented exceptions

- **The Museum (`Museum.tsx`)** — camera dolly and look are critically-damped
  lerps (τ ≈ 0.22 s dolly / 0.16 s look), not the house `--dur`/`--ease`
  tokens: a scroll-driven camera must track the scroll continuously; look
  inertia decays with τ 0.18 s. Approach mode is a modality: the composition
  (distance, fov up to 84°, vertical placement) is recomputed every frame
  through the same lerp, so a sheet drag or a zoom recomposes without a cut.
  Rail pitch −0.10 rad (−0.08 portrait) is a fixed pose, not motion.
- **Moral-section parallax (`[chapter].astro`)** — the theme's ground image
  drifts ±6 % against scroll (gsap ScrollTrigger, `scrub: true`, `ease: none`);
  the image is oversized (scale 1.14) so no edge shows. Off under reduced
  motion. Meaningful: the ground moves like the story under it (Wil, 8/15:
  parallax on the moral background yes, on archival images no).
- **Menu close-X quarter turn** — 300 ms `expo.out` on click, then the panel
  folds; no turn under reduced motion. `--dur-curtain` is now read by
  `curtain.ts`; the unused `--ease-pop` / `--ease-circ-in-out` tokens are gone.

## v13 additions (2026-08-26)

- **The Historical Context plate (`[chapter].astro`)** — one scrubbed GSAP
  timeline across the whole passage: `scale 1.00 → 1.03` **plus
  `translateY 0 → −8px`**, `sine.inOut`, `scrub: 0.6`, then back down on the
  way out. v12 ran `scale 1 → 1.055` with no translate; Wil's 8/26 spec names
  1.00→1.03 and "a slight translateY (a few pixels)", so both numbers are his,
  not a taste call. Measured on the scrub: progress 0.5 → `1.0297 / −7.91px`,
  progress 1.0 → `1.0004 / −0.11px`, and scrolling back up reproduces
  `1.0297 / −7.90px` — reversible, which is what he asked for ("scrolling back
  up should reverse it"). The transform stays on the IMG, never the section:
  a scale on a full-bleed block once reported 1584px of width on a 1440
  screen. Under `prefers-reduced-motion` the whole block is gated off and the
  plate measures `transform: none`.

- **The hall's still/alive switch cue (`Museum.tsx`)** — v13 V13-05b. A
  play/pause glyph over the work for 900ms on toggle: `museum-switch-cue`,
  `var(--ease)`, opacity 0 → 1 → 1 → 0, then nothing. It is feedback, not
  chrome, and it never takes the pointer (`pointer-events: none`) so the stage
  keeps every swipe. Under `prefers-reduced-motion` it runs
  `museum-switch-cue-cut` — the same 900ms, `step-end`, so the glyph appears
  and disappears without a fade. (Belt and braces: the three.js hall is
  disabled entirely under reduce and the static fallback renders instead, so
  the cue never mounts there at all.)
