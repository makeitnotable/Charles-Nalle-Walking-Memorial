# CNWM v10 + v10.2 — review guide

Everything below is on `v2` and live.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

---

## 1 · Changes you did not request

This section is first, and it is the point of `docs/v10/SCOPE.md`: every change
in this round traces to a sentence of yours, or it is listed here.

**Two mechanical necessities in v10.2**, both in service of fixes you asked for:

- The home lockup's `gap` moved out of a Tailwind class and into a
  `--home-gap` variable in the stylesheet. The spacer that now holds the top
  air has to subtract exactly one gap, so the value has to be readable in CSS.
  Same numbers at every breakpoint — nothing moves.
- `qa:walk`'s evidence file is deliberately **not** updated. That instrument
  cannot run in this container at all (Mapbox is blocked here), so re-running
  it would replace good evidence with an environment failure.

**Nothing else.** The full v10 list, including the earlier round's two
misreadings and one piece of scope creep, is in `docs/v10/SCOPE.md` §B and §C.

---

## 2 · The three items in v10.2

### The museum: your first transition back, with the arch

You said: *"the motion, animation and transition from the very, very first one,
but we keep the arch. Walk to the end arrive at the arch, then get pushed down
into the next section."*

That is exactly what it does now. Every piece of architecture stays — the
arched end wall, its archivolt, the pilasters, the keystone, the landing and
steps beyond. Only the **motion** reverted. There is no step-through, no
descent, no turn: you walk level down the hall and stop, facing the arch, 5.3
metres short of it, with the light beyond it filling the frame. The chrome no
longer clears out, because there is nothing to clear out for. Reaching the end
of the scroll simply releases the sticky stage and the stills come up from
below, as they did the first time.

Measured in both orientations: the walk is a straight line, eye height and
heading dead constant from start to finish, and scrolling back up retraces it
exactly.

### The home page: the button, properly this time

**First — the screenshots you sent are the ones from before the fix went out.**
Both files are byte-identical to the ones you uploaded at 21:17; the fix
committed at 21:34 and deployed as run #188. So please look again on your
phone. That said, measuring your screenshot was worth doing, because it says
the fix was calibrated against the wrong number.

Your frame is 635px tall, which puts `100dvh` at about **655** on a 390×844
phone — Safari's chrome takes ~190px, not the ~180 I had assumed. Run the old
formula against 655 and the button lands inside the frame **by 8px**. That is a
fix and it is not a margin: dynamic type or a different toolbar state eats 8px
without trying.

So the mechanism changed rather than the number. The air above the lockup is no
longer padding calculated as a share of the viewport — it is a **spacer that
yields**. Each breakpoint still says how much air it wants; when the frame is
too short, the air gives way, all the way to zero, and the lockup is never the
thing that gets squeezed. Overflow stops being unlikely and becomes impossible.

At and above 375px wide, **96 viewports from 460 to 932 tall now show zero
overflow with at least 20.8px of clear space under the button**; yours has 26.4.
Full device heights are untouched — 253px of air at 390×844, exactly as before.

*One honest exception:* at 320px wide the description wraps to 9 lines instead
of its 7 authored ones, and the lockup genuinely exceeds the frame by ~2px on
frames under 500 tall. 320 is below this site's 375px floor, and only a type
change would fix it — your call, not mine.

### The map: the framing

You chose "the framing", and it turned out to be a real defect rather than
taste. The overview camera hunts for the highest zoom at which all five stop
pills fit inside a safe box. **It stopped hunting at zoom 14.70** — but a phone
with Safari's chrome showing (390×673) only fits the walk at **14.60**. So
those phones fell off the bottom of the search and took a hard-coded fallback
camera fitted to nothing.

Rendered at 390×673, the old fallback puts **three of the five stops
off-screen**: the route runs off the top and bottom edges and only the bakery
and the mansion are in frame. The floor is now 14.2 — the number the desktop
path has always used — and the same viewport resolves to a real camera with the
whole walk centred in frame.

Across 16 phone viewports, **13 now find a properly centred camera against 4
before**. The search still takes the highest zoom that fits, so this can only
rescue a viewport, never loosen one that already worked.

---

## 3 · For your decision

**The "Take the walk" button sits on top of the Mapbox logo.** Measured on your
screenshot: the button's bottom edge is at y 721.7 and the Mapbox wordmark runs
715.3–733.0 — both live in the bottom-left corner on the same 20px inset, so
the button covers it. I have **not** changed this, because you did not pick it
when I asked. It is worth a decision though: Mapbox's terms require the wordmark
and the (i) to stay visible. The fix is one line — lift the button above the
attribution lane, or move it to the centre as it already is at larger sizes.

**Landscape phones still use the fallback map camera.** 844×390 would need zoom
13.30 to fit the walk and 667×375 does not fit at any zoom. Both behaved this
way before this round too. Zooming that far out is a composition you have not
seen, so I left it rather than deciding for you.

---

## 4 · Instrument bars

| Gate | Result |
|---|---|
| `rag` | 0 runts · 0 clips · 0 visible em dashes, full matrix |
| `a11y` | 0 serious/critical · 0 moderate · 0 minor across 51 runs |
| `museum-check` | draw calls 77–79 against the 80 budget; no composition or chrome findings |
| home layout matrix | 96 viewports ≥375 wide: 0 overflow, min 20.8px clearance |
| map framing matrix | 13/16 phone viewports centred (was 4/16) |
| build | 12 pages, `tsc` clean, all 6 island-CSS guards present |

Two gates cannot run in this container and go to the live check: `museum-check`'s
frame pacing (software GL here — the pre-museum commit measures identically) and
`qa:walk` (Mapbox is blocked, so the style never loads).

---

## 5 · Still with you

- **The ten painting titles.** The masters you pushed carry them in the
  filenames — "Holeur's Fashionable Bakery", "The Commissioner's Office pt1/pt2",
  "Uri Gilbert's Mansion", "Washington Street Ferry Landing", "Peter Baltimore's
  Barbershop". The site's media keys are still generic (`horizontal`,
  `narrative1`, `horizontal-pt2`). Say the word and I will wire the real titles
  through; I have not assumed.
- **The high-res splash.** `home-bg.png` at ≥3000px and the film at ≥2160px,
  plus a pipeline tier above the current 1440 cap.
