# CNWM v4 — DESIGN STANDARDS

The single acceptance bar for the v4 build. Every number here was either
measured off the three reference sites (`docs/v4/inspo-*.md`) or measured in
this build. Where the opening plan (`docs/PLAN.md` §7) guessed and the evidence
disagreed, the evidence won and the change is noted.

Implementation lives in `src/styles/global.css`. Proof sheet: `/styleguide`.

---

## 0 · Why v3 failed

Not a shortage of effort — a shortage of contrast. v3 ran a smooth ×1.25/×1.5
type ladder in a single voice, capped every gap at 64px on an even grid, and put
a 1px border and a `rounded-3xl` on every surface. Adjacent levels were
near-indistinguishable, so **nothing ever won a viewport**, which is exactly the
experience of "lacking a visual hierarchy" and "thrown together".

The reference sites are not more decorated than v3. They are more *disciplined*:

| | pasqua | museos | Google A&C | CNWM v3 | CNWM v4 |
|---|---|---|---|---|---|
| Type families | 2 | 2 | 2 | 2 (both sans) | 3 (sans + **serif** + label) |
| Display : body ratio | 6.6× | 5.3× | ~3.7× | ~3.5× | **5.5×** |
| Bordered elements, whole site | **1** | 1 border-width, ~0 on home | 0 on cards | 88 | 2 portal moments |
| Border radii in use | 1 (`0`) | 1 (pill) | 1 (8px) | 10 | 3 |
| Motion durations carrying the work | 2 (0.75s / 0.2s) | 2 tiers (1.6s / 0.3s) | 6 | 12 | **2** |
| Easing curves resolving live | 2 | 1 (`.19,1,.22,1`) | 1 (`.19,1,.22,1`) | 5 | **1** (`.19,1,.22,1`) |

Two of the three reference sites drive their signature motion with the *same*
curve. v4 adopts it rather than the plan's estimate.

---

## 1 · Type — three voices, four roles

| Role | Face / weight | 390 | 768 | ≥1200 | Leading · notes |
|---|---|---|---|---|---|
| `.t-display` | Martel Sans 800, caps | 46 | 76 | **116** | 0.95, −0.02em. Hero H1 and the moral statement only — once or twice a page, alone in its viewport. |
| `.t-title` | Martel Sans 800, caps | 34 | 46 | 64 | 1.0. Section headings — the workhorse. |
| `.t-quote` | **Martel 300 (serif)** | 26 | 32 | 38 | 1.35, hung punctuation, max-width 17em. |
| `.t-prose` | **Martel 400 (serif)** | 19 | 20 | 21 | 1.75, measure 66ch. **Serif floor is 18px** — never smaller, never for UI. |
| `.t-meta` | Poppins 500, caps, +0.10em | 12 | 12 | 13 | The fixed micro-grid. Labels only — **never comprehension text**. |
| `.t-meta-body` | Poppins 400 | 14 | 14 | 15 | Addresses, captions, credits. |
| `.t-spine` | Martel Sans 300, tabular | 26 | 28 | 30 | The numbered rail — "(01)". |

At most **three** roles are ever co-visible: display appears alone, and quotes
sit in their own beat. Ratios at desktop: display/title 1.81 · title/prose 3.05 ·
prose/meta 1.62.

**Amended from the plan.** §7.1 proposed display 96–104 and meta tracking
+0.14em. Measured against pasqua (6.6× display:body) and Google A&C (0.073em of
tracking on 11px caps), display went to 116 and tracking down to 0.10em.

**Display never overflows.** `.t-display` clamps to
`min(--fs-display, --fit-basis / (--fit-chars × 0.64))`, where `--fit-chars` is
the longest authored line and `--fit-basis` is the *container* width
(`.shell` and each editorial column are inline-size containers). 0.64em is the
measured average cap advance for Martel Sans 800. Without it, "COMMISSIONER'S"
clipped at 390 and "AUTHORITARIANISM" broke its grid at 1440.

---

## 2 · Spacing — four tokens and only four

`--space-block: 24` · `--space-beat: 72/96/128` (between beats inside a section)
· `--space-section: 128/168/200` · `--space-void: 260/320/400`.

pasqua ships four effective values too (1u/2u/4u/10u of a 45px grid unit).
Every gap between sections quantizes to one of these; component-internal spacing
uses `--sp-1…5` (8/16/24/40/64).

Content **hugs the top** of a void; it never centres in one. Hairlines run the
full content width while content insets.

**Amended from the plan.** §7.2's 160/200/240 and 320/360/440 produced two
consecutive near-empty viewports at 390 — the exact failure the museos audit
flags as that site's worst trait. See `docs/v4/DECISIONS.md` D3.

---

## 3 · One shell

`--shell: 1280px`, gutters 20/40/56. The v3 chapter hero ran 1344px against a
1280px shell — a registration error visible on every chapter page. There is now
no markup path that can produce a second width.

---

## 4 · The box rule

**A border marks a portal, not a container.** Only two elements in the whole
site carry one: the chapter hero frame and the home photo frame. Everything else
that used to be framed keeps its radius and loses its outline — paintings,
sketches, archival media, maps, cards, players, text blocks, dialogs.

Radii: `--r-lg: 24px` (the two portal frames) · `--r: 12px` (all other media) ·
pill (controls). Three values, down from ten.

**Census rule: ≤1 framed container per viewport.** Controls (buttons, pills,
the corner menu) are not containers and do not count.

**Amended from the plan.** §7.3 kept frames on hero, sketch, historical media,
the embedded map, the moral inset and the map cards. Measured, all three
reference sites frame essentially nothing (pasqua: one 45×45 ring on the entire
site), and the P2 gate failed the box census at 5 per viewport. The frame
survives as the *rounded corner*, which is the part of the Figma identity that
actually reads.

---

## 5 · Grounds — dark cinematic, and cream for reading

Default is the warm dark register. **Long-form reading passages sit on cream**
(`#f6f3ee`, ink `#1d1411`, 16.4:1): the chapter transcript, the chapter history
section, and About's project narrative. That is the museos act change, and it is
what stops a chapter's text-only viewports from blurring into one grey band.

The narration highlight has a variant per ground and uses
`box-decoration-break: clone`, so a wrapped span reads as a highlighter stroke
rather than a ragged rectangle.

---

## 6 · Buttons

Two sizes (`.btn` 15px/48px, `.btn-sm` 13px/38px), two variants (solid
`primary-10` with `primary-2` ink at 5.0:1; ghost 1px `primary-7`), **no
viewport ladder**. A pair is always the same size — fill signals primacy and
nothing else. v3 had 16 patterns across 27 instances, six of them rendering 27px
text at `lg`, and the 404 pair was the chapter pair with every responsive class
stripped.

---

## 7 · Icons

`src/components/icons.ts` — 24×24 viewBox, 1.5px stroke, round caps and joins,
`currentColor`, never non-uniformly scaled. **One arrow**, rotated for
direction. v3 had six idioms (three vector, three typographic) and painted
stroke weights of 2.00/2.10/1.71/1.46 from one nominal value, including an SVG
stretched with `preserveAspectRatio="none"`.

---

## 8 · Motion

`--dur-fast: 300ms` (state, hover, highlight) · `--dur-slow: 1600ms` (reveals,
wipes, quote settle) · `--ease: cubic-bezier(0.19, 1, 0.22, 1)`.

Reveal vocabulary: opacity + 24px rise, 200ms stagger. Display type may use a
per-line mask rise — travel exactly one line-height, **opacity never changes**,
200ms stagger, measured off museos.

Documented exceptions, and only these: the curtain set-piece keeps its circ
timing; Mapbox cameras keep cinematic `flyTo`/`easeTo` durations; the corner-menu
bloom is the single `back.out` overshoot. Full census: `docs/v4/MOTION.md`.

Reduced-motion parity is 100%. Films marked `data-reduce-static` never attach a
source under reduced motion — the poster *is* the finished painting.

---

## 9 · Naming

One object per chapter: `name.{canonical, display, short}`, plus `pinPosition`.
The bronze plaques govern. Derivations and the evidence are in
`docs/v4/DECISIONS.md` D1; the full audit is `docs/v4/NAMING-CANON.md`.
`title`, `cardTitle`, `map.label` and `next.label` have been deleted from the
schema and the JSON so a second source cannot reappear.

---

## 10 · The map route

Two solid layers replacing v3's single dotted one: casing `#0B0705` at
zoom-interpolated 11→17px, main line `#FF9770` (primary-11) at 5.5→9px, opacity
1, round caps, self-drawing. v3 painted `#F26835` at width 3.5 with
`line-dasharray: [0.1, 2]` — a 5% duty cycle over a near-black map, measured at
about 1.3:1.

**Acceptance: the route must read plainly in a greyscale screenshot.** Measured
**3.99:1** against the map ground at 1440 (`docs/v4/qa/p3-map/`).
