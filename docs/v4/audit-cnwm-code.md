# CNWM v4 — Code-level design-system inventory (demolition list)

**Baseline:** git commit **`ee9fbad`** (the last commit before the v4 rebuild — see the pin note below).
**Scope:** every design-system decision expressed in code, with file:line, resolved to px.
**Method:** full read of `src/styles/global.css`, `src/layouts/Base.astro`, all 8 `src/pages/*.astro`,
all 6 `src/components/*`, `src/lib/curtain.ts`; exhaustive grep sweeps; empirical verification in
Chromium (Playwright) against the compiled `dist/_astro/Base.D69DB1rT.css` bundle.
**Tailwind:** v4.3.3 — all `text-*`, spacing, `max-w-*`, `rounded-*`, `duration-*` values resolved
against `node_modules/tailwindcss/theme.css` (root 16px, `--spacing: 0.25rem`).

---

## ⚠️ Baseline pin — read this first

**The v4 rebuild ran *while this audit was being written*, and has already replaced most of what is
inventoried below.**

Timeline observed on disk during the audit (all `2026-08-02`):

| Time | Event |
|---|---|
| 09:01 | `src/styles/global.css` rewritten, 467 → 808 lines; `Icon.astro`, `icons.ts` created |
| 09:03 | `Button.astro` created |
| 09:07–09:14 | `styleguide.astro`, `AudioStory.tsx`, `PressReveal.tsx`, `content.config.ts`, `[chapter].astro`, `Base.astro`, all 5 chapter JSONs rewritten |
| — | commit **`246a7c7`** landed: *"P1: v4 design system — three voices (Martel serif added), four type roles, three spacing tokens, unbox rule, one arrow, two-size buttons, cream register; styleguide v2 proves it"* |

All 8 `.type-*` roles and both `.frame` classes are **deleted** in the new system, replaced by
`.t-*` / `.btn-*` / `.icon-*` / `.shell` / `.sec`.

> ### **This audit is pinned to commit `ee9fbad` — the last commit before the v4 rebuild.**
> Every file:line reference below refers to `ee9fbad`, not to `HEAD`. Retrieve it with
> `git show ee9fbad:src/<path>` or `git archive ee9fbad src`.
>
> The document is therefore **retrospective**: it is the record of what was demolished, and the
> checklist against which P1 should be verified — not a forward plan. Each numbered finding is a
> testable assertion about the old system; re-run the same measurement against `HEAD` to confirm
> the rebuild actually closed it.

`global.css` line numbers refer to the 468-line `ee9fbad` version.

---

## 1. BUTTON INVENTORY

### 1.1 Every clickable element styled as a button or pill

Sizes are resolved px. `H` = computed outer height (padding + line-height + border).

| # | file:line | Says | Full class string (+ inline style) | Size @base / md / lg | Border / fill |
|---|---|---|---|---|---|
| 1 | `src/pages/[chapter].astro:310` | "Continue the walk" | `flex min-w-[147px] cursor-pointer items-center justify-center rounded-full border border-primary-6 bg-primary-4 px-6 py-4 text-[1.125rem] leading-[1.5rem] font-medium text-primary-11 transition-all duration-300 hover:bg-primary-5 hover:text-primary-12 hover:shadow-[inset_0_0_0_1px_#80412B] active:bg-primary-3 active:shadow-none md:px-[1.875rem] md:py-[1.25rem] md:text-[1.40625rem] md:leading-[1.875rem] lg:px-[2.25rem] lg:py-[1.5rem] lg:text-[1.6875rem] lg:leading-[2.25rem]` + `font-family: var(--font-poppins)` | px24/py16/**18px**/lh24/H58 · px30/py20/**22.5px**/lh30/H72 · px36/py24/**27px**/lh36/H86 | 1px `primary-6` #69311d, fill `primary-4` #4a1b0a, r-full |
| 2 | `src/pages/[chapter].astro:321` | "Get Directions" | same ladder as #1 but `border-primary-8`, **no** `bg-*`, no `active:bg-*` | identical to #1 | 1px `primary-8` #a55438, **no fill**, r-full |
| 3 | `src/pages/[chapter].astro:344` | "Share this chapter" | `cursor-pointer rounded-full border border-primary-8 px-5 py-2.5 text-sm font-medium text-primary-11 transition-all duration-300 hover:text-primary-12` + Poppins | px20/py10/**14px**/lh20/H42 — **no ladder** | 1px `primary-8`, no fill, r-full |
| 4 | `src/pages/index.astro:69` | "Continue" | `flex w-[148px] cursor-pointer items-center justify-center rounded-full px-6 py-4 text-center text-[1.125rem] leading-[1.5rem] font-medium transition-all duration-300 hover:brightness-105 md:px-[1.875rem] md:py-[1.25rem] md:text-[1.40625rem] md:leading-[1.875rem] lg:px-[2.25rem] lg:py-[1.5rem] lg:text-[1.6875rem] lg:leading-[2.25rem]` + `background:var(--cta-bg); color:var(--cta-text); border:1px solid var(--cta-border)` | same ladder as #1, but **fixed `w-[148px]`** not `min-w-[147px]` | 1px `--cta-border` #f7a98f, fill `--cta-bg` #ffc6b3, text #bd3900 — the only inverted element |
| 5 | `src/pages/404.astro:23` | "Start at the beginning" | identical to #1 **minus every `md:`/`lg:` class** | px24/py16/**18px**/lh24/H58 at **all** breakpoints | 1px `primary-6`, fill `primary-4`, r-full |
| 6 | `src/pages/404.astro:31` | "Open the map" | identical to #2 **minus every `md:`/`lg:` class** | px24/py16/**18px**/lh24/H58 at **all** breakpoints | 1px `primary-8`, no fill, r-full |
| 7 | `src/components/TroyMap.tsx:607` | "Overview" (+ chevron svg) | `absolute top-14 left-4 z-20 flex cursor-pointer items-center gap-2 rounded-full border border-primary-6 bg-primary-3 px-4 py-2.5 text-sm font-medium text-primary-11 transition-colors duration-300 hover:bg-primary-5 hover:text-primary-12 sm:top-16 sm:left-6` + Poppins | px16/py10/**14px**/lh20/H42 — no ladder | 1px `primary-6`, fill `primary-3` #341a11, r-full |
| 8 | `src/components/TroyMap.tsx:623` | "Take the walk" | `cursor-pointer rounded-full border border-primary-6 bg-primary-4 px-5 py-2.5 text-sm font-medium text-primary-11 transition-all duration-300 hover:bg-primary-5 hover:text-primary-12` + Poppins | px20/py10/**14px**/lh20/H42 — no ladder | 1px `primary-6`, fill `primary-4`, r-full |
| 9 | `src/components/TroyMap.tsx:632` | "See Troy in 1860" / "Back to today" | `cursor-pointer rounded-full border border-primary-8 px-5 py-2.5 text-sm font-medium text-primary-11 transition-all duration-300 hover:text-primary-12` + `background: color-mix(in srgb, var(--color-primary-2) 60%, transparent)` | px20/py10/**14px**/lh20/H42 — no ladder | 1px `primary-8`, 60% `primary-2` scrim fill, r-full |
| 10 | `src/components/TroyMap.tsx:649` | "Stop the walk" | `cursor-pointer rounded-full border border-primary-6 bg-primary-4 px-5 py-2.5 text-sm font-medium text-primary-11 transition-colors duration-300 hover:bg-primary-5 hover:text-primary-12` + Poppins | px20/py10/**14px**/lh20/H42 | 1px `primary-6`, fill `primary-4`, r-full |
| 11 | `src/pages/paintings.astro:125` | "Close" (dialog) | `cursor-pointer rounded-full border border-primary-8 px-4 py-1.5 text-sm font-medium text-primary-11 transition-colors duration-300 hover:text-primary-12` + Poppins | px16/**py6**/**14px**/lh20/H34 | 1px `primary-8`, no fill, r-full |
| 12 | `src/pages/people.astro:75` | "Ch. N · {label} →" | `rounded-full border border-primary-8 px-3 py-1.5 text-xs font-medium text-primary-11 transition-colors duration-300 hover:border-primary-7 hover:text-primary-12` + Poppins | px12/py6/**12px**/lh16/H30 | 1px `primary-8` → hover `primary-7`, no fill, r-full |
| 13 | `src/components/AudioStory.tsx:222` | play/pause icon btn | `flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-primary-6 bg-primary-4 transition-colors duration-300 hover:border-primary-7 hover:bg-primary-5 active:bg-primary-3 lg:h-18 lg:w-18` | **56×56** · 56×56 · **72×72** | 2px `primary-6`, fill `primary-4`, r16 |
| 14 | `src/components/Menu.astro:36` | burger (aria "Open menu") | `cnwm-menu-burger flex h-[72px] w-[72px] cursor-pointer items-center justify-center border-2 border-primary-6 bg-primary-3 ${notchClass}` | **72×72** fixed, no ladder | 2px `primary-6`, fill `primary-3`, corner-notched r12/12/12/**32** (`Menu.astro:25-26`) |
| 15 | `src/components/Menu.astro:55` | close (top-right panel) | `cnwm-menu-close flex w-full cursor-pointer items-center justify-center rounded-t-xl border-b-2 border-primary-6 bg-primary-3 py-6 transition-colors duration-300 hover:bg-primary-5` | full-width, py24, H≈70 | 2px bottom `primary-6`, fill `primary-3`, r12 top only |
| 16 | `src/components/Menu.astro:87` | close (bottom-right panel) | same as #15 but `rounded-b-xl border-t-2` | full-width, py24 | 2px top `primary-6`, fill `primary-3`, r12 bottom only |
| 17 | `src/components/TroyMap.tsx:100` | map marker pill (×5 on /map) | inline only: `padding:${z.pad}px; border-radius:30px; background:${s.bg}; color:${s.text}; border:1px solid ${s.border}; font-family:var(--font-poppins); font-weight:500` — `z` from `pillSizes()` `TroyMap.tsx:76-81` | pad**8**/font**12**/lh18 · pad**10**/font**15**/lh22.5 · pad**12**/font**18**/lh27 | 1px #F26835 (active) / #80412B (inactive), fill #F26835 / #4A1B0A, **r30** |
| 18 | `src/components/EmbedMap.tsx:42` | embed marker pill (×1 per chapter) | same inline idiom, `markerEl()` `EmbedMap.tsx:31-52` | pad8/12px · pad10/15px · pad12/18px | 1px #F26835, fill #F26835, **r30** |
| 19 | `src/pages/styleguide.astro:106` | "Play Chapter" | as #1 + `active:border-primary-6`, no `flex`/`items-center` | identical ladder to #1 | 1px `primary-6`, fill `primary-4`, r-full |
| 20 | `src/pages/styleguide.astro:110` | "Get Directions" | as #2 | identical ladder | 1px `primary-8`, no fill |
| 21 | `src/pages/styleguide.astro:114` | "Continue" | as #4, `w-[148px]` | identical ladder | 1px `--cta-border`, `--cta-bg` fill |
| 22 | `src/pages/styleguide.astro:47` | "Continue" (swatch) | `inline-block rounded-full px-6 py-3 font-medium` + cta inline style — **no text-size class at all** | px24/**py12**/**16px inherited**/H≈45 | 1px `--cta-border`, `--cta-bg` fill |
| 23 | `src/pages/styleguide.astro:142` | Play (specimen) | `flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-primary-6 bg-primary-4 transition-colors hover:bg-primary-5` | **56×56 fixed — no `lg:h-18`** | 2px `primary-6`, fill `primary-4`, r16 |
| 24 | `src/pages/styleguide.astro:159` | Pause (specimen) | as #23 but **no transition at all** | 56×56 fixed | 2px `primary-6`, fill `primary-4`, r16 |
| 25 | `src/pages/styleguide.astro:179` | active marker (specimen) | `flex cursor-pointer items-center justify-center rounded-[30px] p-[8px] font-medium` + inline #F26835 | pad8/12px fixed — **no ladder** | 1px #F26835, fill #F26835, r30 |
| 26 | `src/pages/styleguide.astro:187` | inactive marker (specimen) | same, inline #4A1B0A / #80412B | pad8/12px fixed | 1px #80412B, fill #4A1B0A, r30 |
| 27 | `src/pages/styleguide.astro:199` | burger (specimen) | `flex h-[72px] w-[72px] … rounded-tl-xl rounded-tr-xl rounded-bl-4xl rounded-br-xl border-2 border-primary-6 bg-primary-3` — a `<div>`, not a button | 72×72 | 2px `primary-6`, fill `primary-3` |

### 1.2 Clickable surfaces that are NOT pill-styled (7)

Not counted as button patterns, but they are the site's other tap targets and they carry a
third, unrelated visual language (the `.frame` card idiom):

| file:line | What | Treatment |
|---|---|---|
| `src/pages/paintings.astro:72` | painting open `<button>` | `painting-open frame group block w-full cursor-pointer overflow-hidden text-left` |
| `src/components/TroyMap.tsx:688` | carousel card `role="button"` | `h-[128px] w-[343px] rounded-xl border-2 border-primary-3 bg-primary-2` (sm 160/428.75, lg 192/514.5) |
| `src/components/PressReveal.tsx:129` | hero press target `role="button"` | no visual treatment of its own; inherits parent `.frame` |
| `src/components/AudioStory.tsx:258` | every narrative paragraph (tap-to-seek) | `type-body cursor-pointer rounded px-1 py-0.5 transition-colors duration-300` |
| `src/pages/about.astro:98` | "Walk the route" card | `reveal frame … bg-primary-3 p-6 … md:p-8` |
| `src/pages/people.astro:93` | "Walk the route" card | identical to above |
| `src/pages/map.astro:62` | stop list card | `frame group grid grid-cols-[6rem_1fr] … bg-primary-3 … sm:grid-cols-[8rem_1fr]` |

Plus 11 plain text links: `Menu.astro:65,70,77,78,79,80` (`text-lg` = 18px),
`[chapter].astro:335,336,337` (`type-label` + `→`), `paintings.astro:95` (`type-label` + `→`),
`[chapter].astro:350` (`underline transition-opacity`, **no duration** → 150ms).

### 1.3 Grouping — distinct visual patterns

| Pattern | Definition | Instances |
|---|---|---|
| **A** Large ladder pill — filled | r-full, 1px `primary-6`, `bg-primary-4`, full 18→22.5→27 ladder, `min-w-[147px]` | 2 — `[chapter]:310`, `styleguide:106` |
| **B** Large ladder pill — outline | r-full, 1px `primary-8`, no fill, full ladder | 2 — `[chapter]:321`, `styleguide:110` |
| **C** Large ladder pill — CTA inverted | r-full, 1px `--cta-border`, `--cta-bg` fill, full ladder, **`w-[148px]`** | 2 — `index:69`, `styleguide:114` |
| **D** Large pill, **no ladder** — filled | A, minus all `md:`/`lg:` | 1 — `404:23` |
| **E** Large pill, **no ladder** — outline | B, minus all `md:`/`lg:` | 1 — `404:31` |
| **F** CTA swatch pill | r-full, `px-6 py-3`, **no size class** (16px inherited) | 1 — `styleguide:47` |
| **G** Chrome pill sm — filled | r-full, 1px `primary-6`, `bg-primary-4`, `px-5 py-2.5 text-sm` | 2 — `TroyMap:623`, `TroyMap:649` |
| **H** Chrome pill sm — outline | r-full, 1px `primary-8`, `px-5 py-2.5 text-sm` | 2 — `TroyMap:632`, `[chapter]:344` |
| **I** Chrome pill sm + icon | r-full, 1px `primary-6`, `bg-primary-3`, **`px-4`** `py-2.5 text-sm`, `gap-2` | 1 — `TroyMap:607` |
| **J** Dialog close pill | r-full, 1px `primary-8`, **`px-4 py-1.5`** `text-sm` | 1 — `paintings:125` |
| **K** Chip micro-pill | r-full, 1px `primary-8`, `px-3 py-1.5 text-xs` | 1 — `people:75` |
| **L** Square icon button — laddered | r16, 2px `primary-6`, `h-14 w-14 lg:h-18 lg:w-18` | 1 — `AudioStory:222` |
| **M** Square icon button — fixed | r16, 2px `primary-6`, `h-14 w-14`, no ladder | 2 — `styleguide:142`, `styleguide:159` |
| **N** Burger, corner-notched | 72×72, 2px `primary-6`, `bg-primary-3`, r12/12/12/32 | 2 — `Menu:36`, `styleguide:199` |
| **O** Menu close bar | full-width, `py-6`, 2px directional border, r12 one edge | 2 — `Menu:55`, `Menu:87` |
| **P** Map marker pill | inline styles, **r30**, 1px, JS-driven ladder | 4 — `TroyMap:100`, `EmbedMap:42`, `styleguide:179`, `styleguide:187` |

> ### **16 distinct button/pill patterns · 27 source instances**
> Production only (excluding the 10 styleguide specimens): **14 patterns / 17 instances**.
> Rendered instances are higher — `Menu:36` on all 8 pages, `TroyMap:100` ×5, `AudioStory:222`
> ×2 per scene (×2 again on `commissioners-office`, which has 2 scenes), `people:75` once per
> person-chapter pair.
>
> Nine distinct padding recipes for one pill idiom: `px-6 py-4`, `px-6 py-3`, `px-5 py-2.5`,
> `px-4 py-2.5`, `px-4 py-1.5`, `px-3 py-1.5`, `p-[8px]`, `py-6`, plus the `md:`/`lg:` arbitrary
> pairs `px-[1.875rem] py-[1.25rem]` / `px-[2.25rem] py-[1.5rem]`.

### 1.4 Explicit flags

**🚩 Buttons whose text exceeds 20px at some breakpoint — 6**

All six carry `md:text-[1.40625rem]` = **22.5px** and `lg:text-[1.6875rem]` = **27px**:

| file:line | md | lg |
|---|---|---|
| `src/pages/[chapter].astro:310` | 22.5px | **27px** |
| `src/pages/[chapter].astro:321` | 22.5px | **27px** |
| `src/pages/index.astro:69` | 22.5px | **27px** |
| `src/pages/styleguide.astro:106` | 22.5px | **27px** |
| `src/pages/styleguide.astro:110` | 22.5px | **27px** |
| `src/pages/styleguide.astro:114` | 22.5px | **27px** |

At `lg` these buttons are 86px tall with 27px Poppins Medium labels — larger than `.type-card-title`
(27px) and only 1.5× smaller than the `.type-display` h1 they sit under. A button is not a heading.

**🚩 Button pairs that differ in size / padding / font-size — 6**

| Pair | Difference |
|---|---|
| `styleguide:106` + `:110` (`min-w-[147px]`) vs `styleguide:114` (`w-[148px]`) | **Three buttons in one row**: two are `min-width:147px`, the third is a hard `width:148px`. 1px apart and a different sizing mode. |
| `index:69` (`w-[148px]`) vs `[chapter]:310` / `404:23` (`min-w-[147px]`) | Same "primary CTA" role, `w` vs `min-w`, 148 vs 147px. |
| `TroyMap:607` "Overview" (`px-4`) vs `TroyMap:623`/`:632`/`:649` (`px-5`) | Same map chrome, 16px vs 20px horizontal padding. |
| `paintings:125` "Close" (`px-4 py-1.5`, H34) vs `[chapter]:344` "Share" (`px-5 py-2.5`, H42) | Same `text-sm` outline pill, **8px height difference**. |
| `styleguide:47` CTA swatch (`px-6 py-3`, 16px) vs `styleguide:114` CTA button (`px-6 py-4`, 18→27px) | The **same element** documented twice on the same page at two sizes. |
| `AudioStory:222` (`h-14 w-14 lg:h-18 lg:w-18`) vs `styleguide:142`/`:159` (`h-14 w-14`) | The styleguide's contract for the play button **omits the `lg` step that ships**. `styleguide:142` also has `transition-colors` with no duration (→150ms) and `styleguide:159` has no transition at all. |

**🚩 Buttons missing a responsive treatment their siblings have — `src/pages/404.astro` — VERIFIED**

`404.astro:23` and `404.astro:31` are byte-identical to `[chapter].astro:310` and `[chapter].astro:321`
respectively **except that every `md:` and `lg:` class is absent**:

```
[chapter].astro:310  … md:px-[1.875rem] md:py-[1.25rem] md:text-[1.40625rem] md:leading-[1.875rem]
                        lg:px-[2.25rem] lg:py-[1.5rem] lg:text-[1.6875rem] lg:leading-[2.25rem]
404.astro:23         … active:bg-primary-3 active:shadow-none          ← string ends here
```

Consequence: on a 1440px desktop the 404 page's two CTAs render **58px tall with 18px labels**
while the identically-worded chapter CTAs render **86px tall with 27px labels** — a 48% size
discontinuity between two pages of the same site. The same omission applies to the outline pair
(`404:31` vs `[chapter]:321`).

---

## 2. ICON / SVG INVENTORY

### 2.1 Every inline `<svg>` (10)

| # | file:line | viewBox | Rendered w×h | fill / stroke | stroke-width | linecap / linejoin | preserveAspectRatio |
|---|---|---|---|---|---|---|---|
| 1 | `src/components/Menu.astro:58` | `0 0 22 22` | 22×22 | `fill="none"`, stroke `#F26835` | 2 | round / round | — (default `xMidYMid meet`) |
| 2 | `src/components/Menu.astro:90` | `0 0 22 22` | 22×22 | `fill="none"`, stroke `#F26835` | 2 | round / round | — |
| 3 | `src/components/AudioStory.tsx:64` (PlayIcon) | `0 0 17 21` | **20×22** | `fill="none"`, stroke `#F26835` | 2 | round / round | — |
| 4 | `src/components/AudioStory.tsx:77` (PauseIcon) | `0 0 14 18` | 14×18 | `fill="none"`, **two `<rect>` stroked, not filled** | 2 | round / round | — |
| 5 | `src/pages/styleguide.astro:143` | `0 0 17 21` | **16×18** | `fill="none"`, stroke `#F26835` | 2 | round / round | — |
| 6 | `src/pages/styleguide.astro:160` | `0 0 14 18` | 14×18 | stroked rects | 2 | round / round | — |
| 7 | `src/pages/[chapter].astro:73` (hero rule) | `0 0 2 1` | **w=2, h = `flex-1` (unbounded)** | `fill="currentColor"` path | — | — | **`preserveAspectRatio="none"`** |
| 8 | `src/pages/[chapter].astro:76` (arrowhead) | **`0 87 13 9`** | 13×9 | `fill="currentColor"` path | — | — | — |
| 9 | `src/components/TroyMap.tsx:610` (chevron-left) | `0 0 24 24` | **14×14** | `fill="none"`, stroke `#F26835` | **2.5** | round / round | — |
| 10 | `src/components/TroyMap.tsx:734` (card arrow) | `0 0 120 10` | `w-full h-auto` | `fill="none"`, stroke `currentColor` | **1.2** | **none → `butt` / `miter`** | **`preserveAspectRatio="none"`** |

Plus `public/favicon.svg` (viewBox `0 0 128 128`, referenced `Base.astro:36`) — uses
**`font-family="Arial Black, Arial, sans-serif"`**, a system font entirely outside the identity.

Non-SVG "icons" built from divs: the 3 burger bars (`Menu.astro:41,42,43`;
`styleguide.astro:201,202,203`) and the marker stem + dot
(`TroyMap.tsx:90-98`, `EmbedMap.tsx:48-49`, `styleguide.astro:183-184,191-192`).

### 2.2 🚩 Non-uniform scaling / `preserveAspectRatio="none"`

**Explicit `preserveAspectRatio="none"` — 2**

- **`src/pages/[chapter].astro:73`** — `<svg width="2" class="block min-h-0 flex-1" viewBox="0 0 2 1" preserveAspectRatio="none">`. Width is pinned to 2px; height comes from `flex-1`, so it stretches to whatever the hero header's flex track is (~100px+). The 1-unit-tall viewBox is scaled ~100× vertically and 1× horizontally. The `d="M0.4 0H1.6V1H0.4V0Z"` bar therefore paints as a **1.2px-wide hairline of arbitrary height** — a rendering hazard on any non-integer DPR.
- **`src/components/TroyMap.tsx:734`** — `<svg className="-mb-1 h-auto w-full" viewBox="0 0 120 10" preserveAspectRatio="none">`. `h-auto` currently lets the intrinsic 12:1 ratio hold inside `items-center`, so it does not shear *today* — but the guard is the parent's `align-items`, not the SVG. Any height constraint on that flex row shears the arrowhead. It is also the **only** icon with `stroke-width="1.2"` and the **only** one with no `stroke-linecap`/`stroke-linejoin` (→ `butt` cap, `miter` join, against `round`/`round` everywhere else).

**Box ratio ≠ viewBox ratio (letterboxed, wrong-shaped box) — 2**

| file:line | box AR | viewBox AR | Effect |
|---|---|---|---|
| `src/components/AudioStory.tsx:64` | 20/22 = 0.909 | 17/21 = 0.810 | `xMidYMid meet` → scale 1.048, glyph paints 17.8×22 inside a 20×22 box: **2.2px of dead space** left+right, icon is off-centre relative to its 56×56 button |
| `src/pages/styleguide.astro:143` | 16/18 = 0.889 | 17/21 = 0.810 | scale 0.857, glyph paints 14.6×18 inside 16×18 |

**Divergent painted stroke weights** — six icons all nominally "stroke-width 2", four different
optical results once the box/viewBox scale is applied:

| file:line | nominal | scale | **painted** |
|---|---|---|---|
| `Menu.astro:58` / `:90` | 2 | 1.000 | **2.00px** |
| `AudioStory.tsx:64` | 2 | 1.048 | **2.10px** |
| `AudioStory.tsx:77`, `styleguide:160` | 2 | 1.000 | **2.00px** |
| `styleguide.astro:143` | 2 | 0.857 | **1.71px** |
| `TroyMap.tsx:610` | **2.5** | 0.583 | **1.46px** |
| `TroyMap.tsx:734` | **1.2** | (stretched) | ~1.2px, butt/miter |

**Other icon-level defects**

- **`src/pages/[chapter].astro:76`** — viewBox `0 87 13 9` has a **non-zero min-y of 87**: the icon was exported as a crop window out of a taller artboard rather than a normalized one. Ratio is uniform so it renders correctly, but it cannot be recoloured, resized, or moved into a sprite without recomputing the offset.
- **`src/pages/styleguide.astro:143` vs `src/components/AudioStory.tsx:64`** — the styleguide's Play path `d` is a **different, simplified path** from the one that ships, at a **different size** (16×18 vs 20×22). The design-system contract page documents an icon the site does not use.
- `AudioStory.tsx:77` / `styleguide:160` PauseIcon draws two `<rect width="4" height="16">` with a **2px stroke and no fill** — each bar paints as a hollow 6×18 outline with a 2×14 transparent core, not a solid bar.

### 2.3 Arrow idioms

| # | Idiom | Instances |
|---|---|---|
| 1 | SVG chevron-left, `viewBox 0 0 24 24`, stroke 2.5, round/round, painted 1.46px | `TroyMap.tsx:610` |
| 2 | SVG solid arrowhead (down), `viewBox 0 87 13 9`, `fill="currentColor"`, no stroke | `[chapter].astro:76` |
| 3 | SVG shaft + open arrowhead, `viewBox 0 0 120 10`, stroke 1.2, butt/miter, `preserveAspectRatio="none"` | `TroyMap.tsx:734` |
| 4 | Text glyph `→` (U+2192) at `.type-display` — **42 / 52.5 / 63px** | `about.astro:104`, `people.astro:99` |
| 5 | Text glyph `→` at `.type-label` — 12 / 15 / 18px | `[chapter].astro:335`, `:336`, `:337`, `paintings.astro:97` |
| 6 | Text glyph `→` at `text-xs` — 12px flat | `people.astro:78` |

> ### **6 distinct arrow idioms** (3 vector + 3 typographic size classes)
> Collapsing the text glyph to one idiom rendered at three sizes gives **4**.
> Three of the six are vector and share **no** geometry, stroke weight, cap, join, or viewBox
> convention with each other. A 63px text arrow (`about.astro:104`) and a 1.46px-stroke SVG
> chevron (`TroyMap.tsx:610`) are the same semantic ("go") in the same product.

Other glyphs in rendered UI: `·` U+00B7 as a separator in 9 places
(`[chapter]:56`, `:167`, `paintings:89`, `map:88`, `people:78`, `TroyMap:563`, `:574`, `:597`,
`styleguide:21`), `—` U+2014 em-dash throughout content, `−` U+2212 in `styleguide:58,65`,
`“ ”` curly quotes in `[chapter]:123`, `about:87`, `people:45`, `&nbsp;` in `people:39`.

---

## 3. TYPE INVENTORY

### 3.1 The `.type-*` roles — `src/styles/global.css`

| Role | Definition | base | md ≥768 | lg ≥1024 |
|---|---|---|---|---|
| `.type-display` | `:153` / md `:234` / lg `:243` | **42px** (lh 34, ls −1.5px) | **52.5px** (lh 42.5, ls −1.875px) | **63px** (lh 51, ls −2.25px) |
| `.type-wordmark` | `:169` / md `:235` / lg `:244` | **54px** (ls −2.5px) | **67.5px** | **81px** |
| `.type-body` | `:180` | **18px** (300, lh 1.6) | 18px | 18px |
| `.type-label` | `:190` / md `:236` / lg `:245` | **12px** (lh 15) | **15px** (lh 18.75) | **18px** (lh 22.5) |
| `.type-progress` | `:200` / md `:237` / lg `:246` | **12px** (lh 18) | **15px** (lh 30) | **18px** (lh 27) |
| `.type-eyebrow` | `:208` / md `:238` / lg `:247` | **14px** | **17.5px** | **21px** |
| `.type-muted` | `:216` / md `:239` / lg `:248` | **12px** | **15px** | **18px** |
| `.type-card-title` | `:225` / md `:240` / lg `:249` | **18px** (lh 1.3) | **22.5px** | **27px** |
| `.first-word` | `:256` | **32px** (400) | 32px | 32px |

### 3.2 Every inline Tailwind `text-*` / inline `font-size`

| Utility / declaration | px | file:line |
|---|---|---|
| `text-[0.625rem]` / `text-[.625rem]` | **10** | `[chapter]:62`, `[chapter]:211`, `map:76`, `TroyMap:722`, `styleguide:125` |
| `style="font-size:10px"` | **10** | `styleguide:38` |
| `text-[11px]` | **11** | `AudioStory:377`, `styleguide:180`, `styleguide:188` |
| `style="font-size:11px"` | **11** | `TroyMap:102`, `EmbedMap:44` |
| `text-[0.7rem]` | **11.2** | `about:41` |
| `text-xs` | **12** | `people:75` |
| `text-[12px]` | **12** | `AudioStory:201`, `:207`, `:302`, `styleguide:147`, `:151`, `:164`, `:168`, `:181`, `:189` |
| `font-size:${z.font}px` base | **12** | `TroyMap:104` (via `pillSizes()` `:80`), `EmbedMap:46` (via `:38`) |
| `text-[0.78125rem]` (md:/sm:) | **12.5** | `[chapter]:62`, `:211`, `map:76`, `TroyMap:722`, `styleguide:125` |
| `text-sm` | **14** | `TroyMap:607`, `:623`, `:632`, `:649`, `[chapter]:344`, `paintings:125` |
| `text-[0.9rem]` (lg:) | **14.4** | `about:41` |
| `text-[0.9375rem]` / `text-[.9375rem]` (lg:) | **15** | `[chapter]:62`, `:211`, `TroyMap:722`, `styleguide:125` |
| `font-size:${z.font}px` md | **15** | `TroyMap:104` (`:79`), `EmbedMap:46` (`:37`) |
| body default (no size class) | **16** | `styleguide:47` |
| `text-[16px]` | **16** | `AudioStory:375` |
| `text-lg` | **18** | `Menu:65`, `:70`, `:77`, `:78`, `:79`, `:80` |
| `text-[1.125rem]` | **18** | `[chapter]:310`, `:321`, `404:23`, `:31`, `index:69`, `TroyMap:730`, `styleguide:106`, `:110`, `:114` |
| `font-size:${z.font}px` lg | **18** | `TroyMap:104` (`:78`), `EmbedMap:46` (`:36`) |
| `text-[1.40625rem]` (md:/sm:) | **22.5** | same 9 lines as `text-[1.125rem]` |
| `style="font-size:1.35em"` on `.type-card-title` | **24.3** / 30.375 / 36.45 | `[chapter]:122`, `about:86`, `people:44` |
| `text-[1.6875rem]` (lg:) | **27** | same 9 lines as `text-[1.125rem]` |

### 3.3 Sorted list of every px size that can render

```
10 · 11 · 11.2 · 12 · 12.5 · 14 · 14.4 · 15 · 16 · 17.5 · 18 · 21 · 22.5 · 24.3 · 27 ·
30.375 · 32 · 36.45 · 42 · 52.5 · 54 · 63 · 67.5 · 81
```

> ### **24 distinct rendered font sizes.** 8 of them are below 16px.
> The intended system is 9 roles on a ×1.25/×1.5 ladder. What ships is 24 sizes, of which
> 11 (`10, 11, 11.2, 12.5, 14.4, 16, 24.3, 30.375, 32, 36.45`, plus `14` via `text-sm`)
> exist outside the ladder entirely.

### 3.4 🚩 Sub-16px text — a11y issues

Eight sub-16px sizes: **10, 11, 11.2, 12, 12.5, 14, 14.4, 15**. Note that `.type-label`,
`.type-muted` and `.type-progress` only reach 18px at **lg ≥1024** — on every phone and tablet
they are 12px and 15px. This is a QR-code walking tour: the phone is the primary device.

**Carrying comprehension content — must fix:**

| file:line | Size | Content |
|---|---|---|
| `src/pages/index.astro:78` | **12px** / 15 md / 18 lg | **The home mission statement** — "The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy and the story of Charles Nalle". The single sentence that explains what the site is, at 12px on every phone. |
| `src/pages/index.astro:83` | 12 / 15 / 18 | Desktop variant of the same mission statement |
| `src/pages/[chapter].astro:56` | **12px** | **The QR-arrival orientation line** — "Charles Nalle Walking Memorial · Troy, NY · Stop N of 5". The first text a visitor reads after scanning a sidewalk plaque. |
| `src/pages/map.astro:86-88` | **12px** | **Stop street addresses** + "· no plaque — website only". The line a visitor reads while standing on the street trying to find the next stop. |
| `src/components/AudioStory.tsx:377` | **11px, no ladder at any breakpoint** | Mini-player subtitle = the location name ("Holeur's Fashionable Bakery"), also `truncate` + `max-w-[8.5rem]` |
| `src/components/AudioStory.tsx:302` | **12px, no ladder** | Main-player subtitle = the location name |
| `src/components/AudioStory.tsx:331` | **12px** | Affordance hint — "Tap any paragraph to hear it read aloud" |
| `src/components/PressReveal.tsx:198,205` | **12px** | Affordance hint for the site's signature interaction — "Press and hold to bring the painting to life" / "Tap to reveal the painting" |
| `src/components/TroyMap.tsx:597` | **12px** | Map affordance hint — "Drag to explore · Tap a stop" |
| `src/components/TroyMap.tsx:104` + `src/components/EmbedMap.tsx:46` | **12px** | **Map marker labels** — the stop names on the map itself, the primary wayfinding layer |
| `src/pages/[chapter].astro:335,336,337` | **12px** | The three footer navigation links (People / Paintings / About) — the only cross-site nav outside the burger |
| `src/pages/people.astro:75,78` | **12px, no ladder** | "appears in" chapter chip links — navigation |
| `src/pages/paintings.astro:89` | **12px** | Painting credit "Mark Priest · Nalle Series" |
| `src/pages/paintings.astro:121` | **12px** | Close-look dialog title |
| `src/pages/[chapter].astro:125`, `about.astro:89-91`, `people.astro:48-50` | **12px** | Quote attributions — who said the words above |
| `src/pages/[chapter].astro:164` | **12px** | Painting credit overlay on the full-bleed interlude |
| `src/pages/[chapter].astro:304` | **12px** | The next-stop label above "Continue the walk" |
| `src/pages/map.astro:37` | **12px** | "The walk is loading…" — the map's only loading state |
| `src/components/TroyMap.tsx:582` | **12px** | Arrival plate "Stop N of 5" |
| `src/components/TroyMap.tsx:574` | **12px** | Map place label "The Walk · Five stops · April 27, 1860" |

**Button labels below 16px:** `TroyMap:607`, `:623`, `:632`, `:649`, `[chapter]:344`,
`paintings:125` all use `text-sm` = **14px**; `people:75` uses `text-xs` = **12px**.

**Numeric-only, still sub-16:** 10px chapter badge digits (`[chapter]:62`, `:211`, `map:76`,
`TroyMap:722`, `styleguide:125` — these are the stop number, i.e. wayfinding), 11px marker chip
digits (`TroyMap:102`, `EmbedMap:44`), 11.2px step badge (`about:41`), 12px time pill
(`AudioStory:201`, `:207`), 10px hex labels (`styleguide:38`, internal only).

---

## 4. SPACING INVENTORY

Tailwind v4 `--spacing: 0.25rem` → `n × 4px`.
`0.5`=2 · `1`=4 · `2`=8 · `2.5`=10 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 · `16`=64 · `20`=80 · `24`=96 · `30`=120

### 4.1 By page — vertical gaps used for section / major-block separation

**`src/pages/[chapter].astro`**

| file:line | Utility | px | Separates |
|---|---|---|---|
| `:51` | `mt-6` / `lg:mt-12` | 24 / 48 | hero wrapper ← page top |
| `:53` | `space-y-6`, `py-6` | 24, 24 | hero header stack |
| `:88` | `mt-0` / `md:mt-6` / `lg:mt-12` | 0 / 24 / 48 | hero media ← hero header |
| `:116` | `mt-16` | 64 | scene section ← hero |
| `:118` | `mb-8` | 32 | scene h2 |
| `:121` | `mb-10` | 40 | quote figure |
| `:147` | `mt-16` | 64 | painting interlude ← scenes |
| `:172` | `mt-8`, `mb-8` / `md:mb-12` | 32, 32 / 48 | history section |
| `:173` | `pt-8`, `md:py-4`, `lg:py-8`, `gap-y-8`, `md:gap-y-12` | 32, 16, 32, 32, 48 | history inner |
| `:178` | `py-4` | 16 | "Section 2/4" |
| `:204` | `gap-y-4` / `md:gap-y-0` | 16 / 0 | history point row |
| `:225` | `gap-y-8` / `lg:gap-y-12` | 32 / 48 | portal history grid |
| `:251` | `pt-8`, `pb-16`, `md:py-8`, `lg:py-12`, `gap-y-8`, `md:gap-y-12` | 32, 64, 32, 48, 32, 48 | moral inner |
| `:252` | `mt-8` / `md:mt-4` / `lg:mt-8` | 32 / 16 / 32 | moral h2 |
| `:277` | `mt-8` / `md:mt-0`, `pt-4`, `md:py-4`, `lg:py-8`, `gap-y-8`, `md:gap-y-12` | 32 / 0, 16, 16, 32, 32, 48 | where-to-next inner |
| `:284` | `py-4` | 16 | "Section 4/4" |
| `:174`, `:278` | `gap-y-2` | 8 | heading + progress stacks |
| `:333` | `mt-1` / `lg:mt-16`, `mb-8` / `md:mb-16` | 4 / 64, 32 / 64 | footer |
| `:334` | `mb-6` | 24 | footer link row |
| `:339` | `pt-8` | 32 | footer rule row |

**`src/pages/index.astro`** — `:15` `p-4`/`md:p-12` (16/48) · `:53` `gap-8` (32), `pt-16` (64) · `:59` `gap-2` (8) · `:66` `px-4` · `:76` `p-4` (16) · `:78,:83` `mb-2` (8) · animation delays `:118` 160ms step

**`src/pages/map.astro`** — `:43` `pt-16` (64), `pb-8` (32) · `:45` `mt-4` (16) · `:48` `mt-6` (24) · `:54` `mt-12` (48), `space-y-6` (24) · `:71` `p-4`/`sm:p-5` (16/20) · `:83,:86` `mt-1` (4)

**`src/pages/people.astro`** — `:36` `pt-10` (40), `pb-24` (96) · `:38` `mt-4` (16) · `:43` `mt-10` (40) · `:53` `mt-8` (32) · `:60` `mt-16` (64) · `:62` `mt-4` (16) · `:63` `mt-8` (32), `gap-5` (20) · `:65` `p-5` (20) · `:67,:97` `mt-2` (8) · `:68` `mt-3` (12) · `:69` `mt-5` (20), `gap-2` (8) · `:93` `mt-16` (64), `p-6`/`md:p-8` (24/32)

**`src/pages/paintings.astro`** — `:54` `pt-10` (40), `pb-24` (96) · `:56` `mt-4` (16) · `:59` `mt-8` (32) · `:66` `mt-12` (48), `gap-6` (24) · `:86` `mt-3` (12) · `:120` `p-4` (16), `gap-4` (16)

**`src/pages/about.astro`** — `:19` `pb-16` (64) · `:20` `pt-16` (64), `pb-10` (40) · `:22` `mt-4` (16) · `:28,:79` `mt-5` (20) · `:31` `mt-16` (64) · `:35` `mt-8` (32), `space-y-6` (24) · `:38` `gap-3` (12) · `:50` `mt-2` (8), `space-y-1` (4) · `:65` `mt-16` (64) · `:67` `mt-2` (8) · `:74` `mt-6` (24) · `:85` `mt-16` (64) · `:89` `mt-3` (12) · `:98` `mt-16` (64), `p-6`/`md:p-8` (24/32)

**`src/pages/404.astro`** — `:11` `pt-16` (64) · `:13` `mt-4` (16) · `:16` `mt-6` (24) · `:20` `mt-10` (40), `gap-4` (16)

**`src/pages/styleguide.astro`** — `:20` `py-8` (32) · `:22` `mt-4` (16) · `:25` `mt-16` (64) · `:54,:99` `mt-20` (80) · `:28,:44,:56` `mt-6` (24) · `:101` `gap-10` (40) · `:56` `gap-8` (32)

**`src/components/AudioStory.tsx`** — `:295` `pb-6`/`pb-4` (24/16) · `:320` `mt-4` (16) · `:331` `mt-4` (16) · `:337` `mt-8`/`md:mt-12` (32/48) · `:339` `py-4` (16) · `:342-:351` `gap-x-8`, `gap-y-8`, `lg:gap-y-12` (32, 32, 48) · `:367` `p-3` (12)

**`src/components/TroyMap.tsx`** — `:550` `p-4`/`sm:p-10` (16/40) · `:562` `mt-4` (16) · `:569` `p-4`/`sm:p-6` (16/24) · `:580` `top-16`/`sm:top-20` (64/80) · `:593` `bottom-44`/`sm:bottom-32` (176/128) · `:607` `top-14`/`sm:top-16` (56/64) · `:619` `bottom-8` (32), `gap-3` (12) · `:645` `bottom-44`/`sm:bottom-52` (176/208) · `:663` `pb-24`/`sm:pb-6` (96/24) · `:717` `p-3` (12)

**`src/components/Menu.astro`** — `:22` `bottom-3 right-3` / `top-3 right-3` (12) · `:40` `gap-2` (8) · `:55,:87` `py-6` (24) · `:63` `p-8` (32) · `:64,:66` `gap-6` (24)

### 4.2 🚩 Distinct section-gap values inside `src/pages/[chapter].astro` alone

**Broad set** (every `mt`/`mb`/`pt`/`pb`/`py`/`gap-y` used for section or major-block separation):

```
0 · 4 · 8 · 16 · 24 · 32 · 40 · 48 · 64      →  9 distinct values
```

**Strict set** (only the top-level `<section>` / `<footer>` / hero-wrapper separators and their
immediate layout child's `gap-y-*`):

```
0 · 4 · 16 · 24 · 32 · 48 · 64               →  7 distinct values
```

> ### **9 distinct section-gap values in the chapter template alone** (7 at strict section level).
> There is no rhythm: consecutive sections are separated by 64px (`:116`, `:147`), then 32px
> (`:172`), then 32px again (`:277`), then 4px (`:333` footer `mt-1` — which becomes 64px only at
> `lg`). The footer sits **4px** below the section above it on mobile and **64px** below it on
> desktop, a 16× swing driven by one `lg:mt-16`.

### 4.3 🚩 Top-of-page padding per page — **NOT the same value**

| Page | file:line | Declaration | base | md | lg |
|---|---|---|---|---|---|
| `src/pages/map.astro` | `:35` | `.map-shell` (100dvh), **no top padding** | **0** | 0 | 0 |
| `src/pages/index.astro` | `:15` + `:53` | `p-4 md:p-12` + `pt-16` on the stack | **16** (+64) | **48** (+64) | 48 (+64) |
| `src/pages/[chapter].astro` | `:51` | `mt-6 … lg:mt-12` — a **margin**, not padding; header adds `py-6` | **24** | 24 | **48** |
| `src/pages/styleguide.astro` | `:20` | `py-8` | **32** | 32 | 32 |
| `src/pages/people.astro` | `:36` | `pt-10` | **40** | 40 | 40 |
| `src/pages/paintings.astro` | `:54` | `pt-10` | **40** | 40 | 40 |
| `src/pages/about.astro` | `:20` | `pt-16` (on `<header>`; `<article>` `:19` has none) | **64** | 64 | 64 |
| `src/pages/404.astro` | `:11` | `pt-16` | **64** | 64 | 64 |
| `src/pages/map.astro` (index below map) | `:43` | `pt-16` | **64** | 64 | 64 |

> **Answer: no.** Five distinct top-of-page values — **0, 16/48, 24/48, 32, 40, 64** — and the
> chapter page uses a *margin* where every other page uses *padding*.

**Horizontal gutters diverge the same way.** Six pages agree on `px-4 md:px-10 lg:px-20`
(16/40/80): `map:43`, `people:36`, `paintings:54`, `about:19`, `404:11`, `styleguide:20`.
`src/pages/[chapter].astro` uses **four different gutters on one page**: `px-0 md:px-10 lg:px-12`
(hero `:51`), `px-4 md:px-6` (scenes `:116` — 16/24px, a quarter of every other page at `lg`),
`px-4` (history `:173`, where-next `:277`), `px-8` (moral `:251`). Its footer `:333` uses
`px-4 md:mx-10 lg:mx-30` — margins, not padding, 120px each side at `lg`.
`src/pages/index.astro:15` uses `p-4 md:p-12` (16/48).

---

## 5. BORDER / BOX INVENTORY

### 5.1 Definitions — `src/styles/global.css`

| file:line | Class | Radius | Border |
|---|---|---|---|
| `:269-272` | `.frame` | 1.5rem = **24px** | 1px solid `--color-primary-6` #69311d |
| `:273-276` | `.frame-2` | **24px** | 2px solid `--color-primary-6` |
| `:334-343` | `.cnwm-scrub` (track) | 9999px | none |
| `:344-353` | `.cnwm-scrub::-webkit-slider-thumb` | 9999px | 2px solid `--color-primary-12` #fed9cc |
| `:354-360` | `.cnwm-scrub::-moz-range-thumb` | 9999px | 2px solid `--color-primary-12` |
| `:427-430` | `.narration-active` | **4px** | none |
| `:441-450` | `.skip-link` | `0 0 0.5rem 0` = **8px bottom-right only** | none |
| `:436-439` | `:focus-visible` | — | outline 2px `--color-primary-9` #f26835, offset 3px |

### 5.2 Every element with a border or rounded corner — grouped

**MEDIA (14)**

| file:line | Radius | Border |
|---|---|---|
| `src/pages/[chapter].astro:88` | `.frame` 24px | 1px primary-6 |
| `src/pages/[chapter].astro:192` | `rounded-2xl` 16px | 2px primary-6 — **⚠ never applies, see §8a** |
| `src/pages/[chapter].astro:199` | `rounded-2xl` 16px | 2px primary-6 |
| `src/pages/[chapter].astro:257` | `rounded-3xl` 24px | **1px** primary-6 |
| `src/pages/[chapter].astro:289` | `.frame` 24px | 1px primary-6 |
| `src/components/AudioStory.tsx:236` | `.frame-2` 24px | 2px primary-6 |
| `src/components/AudioStory.tsx:287` | `rounded-xl` **12px** | 2px primary-6 |
| `src/components/PressReveal.tsx:127` | `rounded-sm` **4px** | none |
| `src/components/TroyMap.tsx:560` | `.frame` 24px | 1px primary-6 |
| `src/components/TroyMap.tsx:714` | none | **1px right only** primary-6 |
| `src/pages/map.astro:69` | none | **1px right only** primary-6 |
| `src/pages/about.astro:74` | `.frame` 24px | 1px primary-6 |
| `src/pages/paintings.astro:72` | `.frame` 24px | 1px primary-6 |
| `src/pages/index.astro:19` | **`rounded-[32px]`** | 1px **`gray-7` #4b4741** — the only gray border on the site |

**TEXT BLOCK (3)** — `src/components/AudioStory.tsx:258` (`rounded` 4px, no border) ·
`src/pages/[chapter].astro:339` (`border-t` 1px primary-6, footer rule) ·
`.narration-active` `global.css:428` (4px)

**CARD (9)**

| file:line | Radius | Border |
|---|---|---|
| `src/components/AudioStory.tsx:279` | `rounded-3xl` 24px | 2px primary-6 |
| `src/components/AudioStory.tsx:369` | `rounded-2xl` **16px** | 2px primary-6 |
| `src/components/TroyMap.tsx:581` | `.frame` 24px | 1px primary-6 |
| `src/components/TroyMap.tsx:596` | `.frame` 24px | 1px primary-6 |
| `src/components/TroyMap.tsx:688` | `rounded-xl` **12px** | 2px **`primary-3` #341a11** — the only primary-3 border |
| `src/pages/map.astro:62` | `.frame` 24px | 1px primary-6 |
| `src/pages/about.astro:98` | `.frame` 24px | 1px primary-6 |
| `src/pages/people.astro:65` | `.frame` 24px | 1px primary-6 |
| `src/pages/people.astro:93` | `.frame` 24px | 1px primary-6 |

**CHROME (33)** — `Menu.astro:36` (r12/12/12/32, 2px primary-6) · `Menu.astro:41,42,43` (r-full bars, ×3) ·
`Menu.astro:49` (r12, 2px) · `Menu.astro:55` (r12 top, 2px bottom) · `Menu.astro:87` (r12 bottom, 2px top) ·
`AudioStory.tsx:198` (r24 pill) · `AudioStory.tsx:222` (r16, 2px) · `PressReveal.tsx:198` (r-full) ·
`TroyMap.tsx:92/96` (r-full dot) · `TroyMap.tsx:100` (**r30**, 1px) · `TroyMap.tsx:101` (r-full chip) ·
`TroyMap.tsx:571` (r-full) · `TroyMap.tsx:607` (r-full, 1px primary-6) · `TroyMap.tsx:623` (r-full, 1px primary-6) ·
`TroyMap.tsx:632` (r-full, 1px primary-8) · `TroyMap.tsx:649` (r-full, 1px primary-6) · `TroyMap.tsx:720` (r-full chip) ·
`EmbedMap.tsx:42` (**r30**, 1px) · `EmbedMap.tsx:43` (r-full) · `EmbedMap.tsx:49` (r-full) ·
`[chapter].astro:60` (r-full badge) · `:164` (r-full pill) · `:209` (r-full badge) · `:310` (r-full, 1px primary-6) ·
`:321` (r-full, 1px primary-8) · `:344` (r-full, 1px primary-8) · `index.astro:69` (r-full, 1px `--cta-border`) ·
`map.astro:74` (r-full badge) · `about.astro:39` (r-full badge) · `people.astro:75` (r-full, 1px primary-8) ·
`paintings.astro:125` (r-full, 1px primary-8) · `global.css:334` scrub track + `:344`/`:354` thumbs (2px primary-12) ·
`global.css:441` skip-link (8px one corner)

**DIALOG (1)** — `src/pages/paintings.astro:109` `.frame-2` 24px, 2px primary-6

**STYLEGUIDE SPECIMENS (28)** — `styleguide.astro:34, 47, 106, 110, 114, 124, 131, 138, 139, 142, 150, 155, 156, 159, 167, 177, 179, 180, 184, 187, 188, 192, 199, 201, 202, 203, 216, 217`

> ### **88 bordered / rounded elements total — 60 in production + 28 styleguide specimens.**
> By kind: **media 14 · text block 3 · card 9 · chrome 33 · dialog 1**.

### 5.3 Distinct values

**10 distinct radii:** 4px (`rounded`, `rounded-sm`, `.narration-active`) · 6px (`rounded-md`) ·
8px (`.skip-link`, one corner) · 12px (`rounded-xl`) · 16px (`rounded-2xl`) ·
24px (`rounded-3xl`, `.frame`, `.frame-2`) · **30px** (inline marker pills — the only 30) ·
32px (`rounded-4xl` burger notch; `rounded-[32px]` home frame) · 9999px (`rounded-full`) · 0.

The same conceptual object gets three radii: the main player card is `rounded-3xl` (24px,
`AudioStory:279`) but the mini player is `rounded-2xl` (16px, `AudioStory:369`) and the cover
inside the card is `rounded-xl` (12px, `AudioStory:287`).

**8 distinct border colours:** `primary-6` #69311d (dominant, 30+ uses) · `primary-8` #a55438 ·
`primary-7` #80412b (hover only: `people:75`, `AudioStory:222`) · `primary-3` #341a11
(`TroyMap:688` only) · `gray-7` #4b4741 (`index:19` only) · `primary-12` #fed9cc (scrub thumbs) ·
`--cta-border` #f7a98f (`index:69`, `styleguide:47`, `:115`) · raw `#F26835` / `#80412B`
(marker pills, `TroyMap:46,53,100`, `EmbedMap:42`, `styleguide:179,187`).

> **`#80412B` is `primary-7` written as a raw hex.** The same colour ships under two names —
> as a token in `people.astro:75` (`hover:border-primary-7`) and as a literal in `TroyMap.tsx:53`
> and in the `hover:shadow-[inset_0_0_0_1px_#80412B]` pseudo-borders at `[chapter]:310`, `:321`,
> `404:23`, `:31`, `styleguide:106`, `:110`.

**2 border widths** (1px, 2px) applied in 6 shapes: all-1, all-2, `border-t`, `border-r`,
`border-b-2`, `border-t-2`.

---

## 6. MOTION INVENTORY

### 6.1 Every duration

**CSS tokens — `src/styles/global.css`**

| file:line | Token | Value | Uses in baseline |
|---|---|---|---|
| `:123` | `--dur-ui` | **300ms** | 1 (`:429`) |
| `:124` | `--dur-reveal` | **800ms** | 2 (`:380`, `:381`) |
| `:125` | `--dur-curtain` | **600ms** | **0 — DEAD** |

**CSS declarations**

| file:line | Duration | Easing |
|---|---|---|
| `global.css:379-381` | 800ms (`--dur-reveal`) | `--ease-house` |
| `global.css:399-402` | **1000ms** (`1s`, hard-coded — not the token) | `--ease-house` |
| `global.css:429` | 300ms (`--dur-ui`) | `--ease-house` |
| `global.css:463,465` | **0.01ms** (reduced-motion override) | — |
| `index.astro:106` | **1400ms** (`frame-in`) | `--ease-house` |
| `index.astro:117` | **900ms** (`home-rise`) | `--ease-house` |
| `index.astro:118` | delay `300ms + seq × 160ms` → 300/460/620/780/940/1100ms | — |
| `index.astro:131` | **700ms** (`rule-x`) | `--ease-house` |
| `index.astro:132` | delay `300 + 3×160 + 250` = **1030ms** | — |

**Tailwind `duration-*`**

| Value | Count | file:line |
|---|---|---|
| **300ms** | **40** | `AudioStory:198,222,258,279,287,295,369` (7) · `Menu:55,65,70,77,78,79,80,87` (8) · `TroyMap:607,623,632,649,663,684` (6) · `404:23,31` (2) · `[chapter]:310,321,335,336,337,344` (6) · `about:98` · `index:69` · `map:62` · `paintings:95,125` (2) · `people:75,93` (2) · `styleguide:106,110,114,156` (4) |
| **500ms** | 1 | `paintings.astro:83` |
| **700ms** | 1 | `TroyMap.tsx:550` |
| **150ms** (implicit `--default-transition-duration`) | 2 | `[chapter].astro:350` (`transition-opacity`, no duration) · `styleguide.astro:142` (`transition-colors`, no duration) |

**Inline style transitions**

| file:line | Duration | Easing |
|---|---|---|
| `AudioStory.tsx:282` | 300ms (opacity) + **300ms (background-color, no easing → CSS `ease`)** | `ease-in-out` / *initial* |
| `AudioStory.tsx:364` | 300ms | `ease-in-out` |
| `PressReveal.tsx:184` | **600ms** | `--ease-house` |
| `PressReveal.tsx:194` | **500ms** | `--ease-house` |
| `PressReveal.tsx:216` | **700ms** | `--ease-house` |
| `TroyMap.tsx:108` | 300ms | `ease-in-out` (CSS keyword, inside an HTML string) |

**GSAP**

| file:line | Duration | Ease |
|---|---|---|
| `Menu.astro:118` | 0.6s = **600ms** | `back.out(1.7)` |
| `Menu.astro:133` | 0.5s = **500ms** | `back.out(1.7)` |
| `Menu.astro:138` | 0.3s = **300ms**, stagger 0.1s, delay 0.2s | `back.out(2)` |
| `Menu.astro:148-149` | 0.3s = **300ms** | `back.in(1.7)` |
| `curtain.ts:69` | 0.6s = **600ms** | `circ.inOut` |
| `curtain.ts:70` | 0.3s = **300ms** (position `-=0.3`) | `power2.out` |
| `curtain.ts:72` | 0.15s = **150ms** (empty settle tween) | — |
| `curtain.ts:81` | 0.1s = **100ms** | *none → GSAP default `power1.out`* |
| `curtain.ts:84-85` | 0.4s = **400ms** | `circ.out` |
| `curtain.ts:115` | 0.45s = **450ms** (empty hold tween) | — |
| `curtain.ts:116` | 0.1s = **100ms** | `power2.in` |
| `curtain.ts:121-122` | 0.6s = **600ms** | `circ.out` |
| `[chapter].astro:375` | `scrub: 0.5` = **500ms** lag | — |
| `[chapter].astro:394` | — | **`"none"` (linear)** |
| `[chapter].astro:399` | `scrub: 0.6` = **600ms** lag | — |

**Mapbox camera** — `TroyMap.tsx:242` **2000ms** · `TroyMap.tsx:356` **5000ms** ·
`TroyMap.tsx:367` **3500ms** · `TroyMap.tsx:504` **2600ms** · `EmbedMap.tsx:88` **5000ms** ·
`TroyMap.tsx:213` `flyTo speed:0.6 curve:1.4` (derived duration)

**keen-slider** — `TroyMap.tsx:451` `duration: 400`, `easing: (t) => t` (**linear**) ·
`TroyMap.tsx:455`, `:477` `duration: 0`

**setTimeout / rAF-driven animation timings** — `TroyMap.tsx:163` **200ms** (marker re-render debounce) ·
`TroyMap.tsx:338` **1200ms** (route-draw start) · `TroyMap.tsx:348` **5200ms** (arrival plate dwell) ·
`TroyMap.tsx:416` **7000ms** (hint auto-dismiss) · `TroyMap.tsx:432` **150ms** (carousel→camera debounce) ·
`TroyMap.tsx:474` **80ms** (slider settle retry) · `TroyMap.tsx:497` **1200ms** (reduced-motion tour dwell) ·
`TroyMap.tsx:507` **3400ms** (tour leg dwell) · `curtain.ts:92` **4000ms** (cover fail-open) ·
`curtain.ts:138` **3000ms** (exit fail-open) · `PressReveal.tsx:25` `HOLD_MS = **1400**` ·
`PressReveal.tsx:26` `DECAY_RATE = 2.2` (→ ~455ms full decay) · `PressReveal.tsx:81` 64ms frame clamp ·
`TroyMap.tsx:329-336` route draw `i += 3` over 241 pts ≈ **1333ms** @60fps

### 6.2 🚩 DISTINCT DURATIONS

**Component / micro-interaction band** — what a design system would tokenize
(excludes the reduced-motion override, the `0ms` instant jumps, map camera flights, and dwell timers):

```
100 · 150 · 300 · 400 · 450 · 500 · 600 · 700 · 800 · 900 · 1000 · 1400   →  12 distinct durations
```

| Duration | Count | Where |
|---|---|---|
| **300ms** | **47** | 40 × `duration-300`, 4 × inline `300ms`, 2 × GSAP `0.3`, `--dur-ui` |
| **600ms** | 6 | GSAP `0.6` ×3, `PressReveal:184`, `scrub 0.6`, `--dur-curtain` (dead) |
| **500ms** | 4 | `duration-500`, GSAP `0.5`, `PressReveal:194`, `scrub 0.5` |
| **700ms** | 3 | `duration-700`, `PressReveal:216`, `rule-x` |
| **100ms** | 2 | `curtain.ts:81`, `:116` |
| **150ms** | 2 | Tailwind implicit default ×2 (`[chapter]:350`, `styleguide:142`) — plus `curtain.ts:72` |
| **1400ms** | 2 | `index.astro:106` `frame-in`, `PressReveal.tsx:25` `HOLD_MS` |
| **400 · 450 · 800 · 900 · 1000** | 1 each | `curtain:84`/keen · `curtain:115` · `--dur-reveal` · `home-rise` · `.reveal-quote` |

**Full superset including map flights and dwell timers — 24 values:**
`0.01 · 0 · 80 · 100 · 150 · 200 · 300 · 400 · 450 · 500 · 600 · 700 · 800 · 900 · 1000 · 1200 · 1333 · 1400 · 2000 · 2600 · 3400 · 3500 · 4000 · 5000 · 5200 · 7000`

### 6.3 🚩 DISTINCT EASINGS

**Declared house vocabulary — `src/styles/global.css:119-122` — 4 tokens, 3 of them DEAD:**

| file:line | Token | Curve | Baseline uses |
|---|---|---|---|
| `:119` | `--ease-house` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (power2.out) | **11** — `global.css:380,381,400,401,429`; `PressReveal:184,194,216`; `index:106,117,131` |
| `:120` | `--ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (back.out(1.7)) | **0 — DEAD** |
| `:121` | `--ease-circ-in-out` | `cubic-bezier(0.85, 0, 0.15, 1)` | **0 — DEAD** |
| `:122` | `--ease-circ-out` | `cubic-bezier(0, 0.55, 0.45, 1)` | **0 — DEAD** |

**Curves that actually paint in CSS — 5:**

| Curve | Source | Uses |
|---|---|---|
| `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `--ease-house` | 11 |
| `cubic-bezier(0.4, 0, 0.2, 1)` | **Tailwind `--default-transition-timing-function`** — every `transition-*`/`duration-*` with no `ease-*` utility | **~40** — the site's true dominant easing, and it is not in the token list |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Tailwind `ease-in-out` utility (same curve) | 1 — `AudioStory:198` |
| `cubic-bezier(0.42, 0, 0.58, 1)` | **CSS keyword `ease-in-out`** in inline styles — *a different curve from Tailwind's `ease-in-out`* | 3 — `AudioStory:282`, `:364`, `TroyMap:108` |
| `cubic-bezier(0, 0, 0.2, 1)` | Tailwind `ease-out` utility | 1 — `TroyMap:684` |
| `cubic-bezier(0.25, 0.1, 0.25, 1)` | bare CSS `ease` (initial value) — `background-color 300ms` with no function | 1 — `AudioStory:282` |

**GSAP / JS eases — 9:** `back.out(1.7)` (`Menu:118,133`) · `back.out(2)` (`Menu:138`) ·
`back.in(1.7)` (`Menu:149`) · `circ.inOut` (`curtain:69`) · `circ.out` (`curtain:85,122`) ·
`power2.out` (`curtain:70`) · `power2.in` (`curtain:116`) · `power1.out` implicit (`curtain:81`) ·
`"none"`/linear (`[chapter]:394`, keen `TroyMap:451`)

> ### **4 declared easing tokens — 3 of them dead. 5 distinct curves actually painting in CSS. 9 more in GSAP/JS. 14 distinct easing behaviours in total.**
> The system declares 4 curves, uses 1 of them, and lets 4 undeclared curves in through Tailwind
> defaults and raw CSS keywords. `AudioStory.tsx:282` alone runs three different easings in one
> declaration: `ease-in-out` (0.42/0/0.58/1) on opacity, the initial `ease` on background-color,
> and the Tailwind default on whatever `transition-colors` at `:279` is still governing.

---

## 7. MAX-WIDTH / SHELL INVENTORY

### 7.1 Page content shells

| file:line | Utility | px | Role |
|---|---|---|---|
| `src/pages/404.astro:11` | `max-w-7xl` | **1280** | page shell |
| `src/pages/about.astro:19` | `max-w-7xl` | **1280** | page shell |
| `src/pages/map.astro:43` | `max-w-7xl` | **1280** | index shell |
| `src/pages/paintings.astro:54` | `max-w-7xl` | **1280** | page shell |
| `src/pages/people.astro:36` | `max-w-7xl` | **1280** | page shell |
| `src/pages/styleguide.astro:20` | `max-w-7xl` | **1280** | page shell |
| `src/pages/[chapter].astro:116` | `max-w-7xl` | **1280** | scene section |
| `src/pages/[chapter].astro:172` | `max-w-7xl` | **1280** | history section |
| `src/pages/[chapter].astro:251` | `max-w-7xl` | **1280** | moral inner |
| `src/pages/[chapter].astro:276` | `max-w-7xl` | **1280** | where-to-next section |
| `src/components/AudioStory.tsx:337` | `max-w-7xl` | **1280** | narrative wrapper — **nested inside `[chapter]:116`'s own `max-w-7xl`, can never bind** |
| `src/components/AudioStory.tsx:367` | `max-w-7xl` | **1280** | mini-player rail |

**Prose measures:** `max-w-2xl` = **672px** — `[chapter]:121`, `:265`, `:268`, `about:27`, `:31`,
`:76`, `:85`, `people:43`. `max-w-xl` = **576px** — `404:16`, `map:48`, `paintings:59`,
`people:53`, `:62`, `styleguide:70`, `:210`. `max-w-md` = **448px** — `TroyMap:535`, `styleguide:90`.
Two competing prose measures (672 and 576) with no rule for which applies.

**Fixed / component widths:** `.embed-map-shell` `global.css:311` `max-width: 42rem` = **672px** ·
`index.astro:78` `max-w-[283px]` / `md:max-w-[353px]` · `PressReveal.tsx:202`
`maxWidth: min(86vw, 34rem)` = **544px** · `TroyMap.tsx:580`, `:593` `max-w-[86vw]` ·
`AudioStory.tsx:279` `md:w-[29.296rem]` = **468.7px** / `lg:w-[32.5rem]` = **520px** ·
`AudioStory.tsx:369` `w-72` = **288px** · `AudioStory.tsx:377` `max-w-[8.5rem]` = **136px** ·
`TroyMap.tsx:681`/`:688` **343 / 428.75 / 514.5px** · `max-w-full` — `[chapter]:192`, `:199`, `about:74`

### 7.2 🚩 The chapter hero shell — claim VERIFIED, cause is worse than stated

**Source — `src/pages/[chapter].astro:51`:**

```astro
<div class="relative mx-auto mt-6 px-0 md:px-10 lg:px-12">
  <header id="hero" class="relative flex h-screen flex-col overflow-hidden">      <!-- :52 -->
    …
    <div id="hero-media" class="frame relative mt-0 max-h-screen w-full flex-1
         overflow-hidden bg-neutral-1 md:mt-6 lg:mt-12">                          <!-- :88 -->
```

**There is no `max-w-*` anywhere in the hero chain** (`:51` → `:52` → `:88`). The `mx-auto` at
`:51` has nothing to centre against, so the hero is **100% of the body width** minus
`lg:px-12` (48px each side).

| Viewport | Chapter hero (`:51`) | Every other section (`max-w-7xl`) | Δ |
|---|---|---|---|
| 1280px | 1184px | 1248px (1280 − `px-4`) | −64 |
| **1440px** | **1344px** | **1248px** | **+96** |
| 1920px | **1824px** | 1248px | **+576** |
| 2560px | **2464px** | 1248px | **+1216** |

> **The plan's claim is confirmed at the 1440px design viewport: the chapter hero renders exactly
> 1344px wide (1440 − 2×48) against a 1280px site shell.** But the hero is not a 1344px shell —
> it is an *unbounded* one. Above 1440px it keeps growing while every section below it stays
> pinned at 1280px, so the overhang widens without limit. On a 27" display the hero is nearly
> twice the width of the body copy directly beneath it.

**Other shell deviations on the same page:**

- `src/pages/[chapter].astro:116` — the scene section uses `px-4 md:px-6` (16/24px) where all six
  other pages use `px-4 md:px-10 lg:px-20` (16/40/80px). Content width at `lg`: **1232px** here
  vs **1120px** everywhere else.
- `src/pages/[chapter].astro:251` — the moral inner uses `px-8` (32px) → **1216px** at `lg`.
- `src/pages/[chapter].astro:333` — the footer uses `md:mx-10 lg:mx-30` (margins, 120px each side
  at `lg`) inside the 1280px section → **1040px**.
- `src/pages/[chapter].astro:147` — the painting interlude has no `max-w` (full-bleed, intended).
- `src/pages/[chapter].astro:238` — the moral section has no `max-w` (full-bleed image, intended).

**Five different content measures on one page: 1344 (hero, unbounded) · 1248 (scenes) · 1216 (moral) · 1232 (history/where-next) · 1040 (footer).**

- `src/components/AudioStory.tsx:337` — `max-w-7xl` nested directly inside `[chapter]:116`'s
  `max-w-7xl px-4`. Dead constraint today; a latent double-shell if AudioStory is ever reused.

---

## 8. KNOWN BUGS — VERIFICATION

### (a) `src/pages/[chapter].astro` — `<video>` with TWO `class` attributes — ✅ **VERIFIED** (with the *opposite* symptom to the one described)

**Source — `src/pages/[chapter].astro:183-193`:**

```astro
<video
  class="lazy-video"                                                          ← :184
  data-src={withBase(`media/${slug}/historical.mp4`)}
  data-poster={withBase(`media/${slug}/historical-poster.jpg`)}
  preload="none"
  autoplay
  loop
  muted
  playsinline
  class="mx-auto max-h-[363px] w-auto max-w-full rounded-2xl border-2
         border-primary-6 object-cover"                                       ← :192
/>
```

**Astro emits both attributes verbatim** — confirmed in `dist/bakery.html`:

```html
<video class="lazy-video" data-src="/media/bakery/historical.mp4"
  data-poster="/media/bakery/historical-poster.jpg" preload="none" autoplay loop muted
  playsinline class="mx-auto max-h-[363px] w-auto max-w-full rounded-2xl border-2
  border-primary-6 object-cover">
```

**But the brief's stated consequence is backwards.** Per the HTML tokenizer spec, a duplicate
attribute is a parse error and **the later duplicate is discarded — the FIRST wins.** Verified
empirically in Chromium:

```
className:           "lazy-video"
classList:           ["lazy-video"]
matches('.lazy-video[data-src]'):  true      ← lazy hydration WORKS
matches('.rounded-2xl'):           false     ← styling is GONE
```

**Actual defect:** `lazy-video` survives, so `Base.astro:77`'s
`querySelectorAll(".lazy-video[data-src]")` *does* match and the video *does* lazy-hydrate
correctly. What is silently dropped is the entire styling class list — so the historical-context
video renders with **no `max-h-[363px]` cap, no `mx-auto` centring, no `rounded-2xl`, no
`border-2 border-primary-6`, and no `object-cover`**.

**Blast radius: all 5 chapters.** Every chapter has `"historical"` in `media.videos`
(`bakery.json`, `barbershop.json`, `commissioners-office.json`, `ferry.json`, `mansion.json`),
so the `hasHistoricalVideo` branch at `[chapter].astro:182` is taken every time and the
`<Picture>` fallback at `:195-201` — which applies **the exact same class string correctly** —
never runs. The result is that the historical media is the only media on the site rendered
outside the frame idiom, at unconstrained native size.

---

### (b) `AudioStory.tsx` mini-player time pill clipping — ✅ **VERIFIED**

Measured in Chromium at 375/390/414px against the compiled `dist/_astro/Base.D69DB1rT.css`:

```
pill clientWidth : 68px      (content box 68 − 24 padding = 44px)
pill scrollWidth : 85px      →  17px overflow, CLIPPED
time text width  : 72.98px   →  28.98px of the string is cut  ≈ the last 4 chars
computed         : overflow-x: hidden · flex-shrink: 1 · font-variant-numeric: normal
```

`"00:41 | 01:25"` renders as roughly `"00:41 | 0"` — the final `1:25` is clipped.

**Source — `src/components/AudioStory.tsx:197-215`:**

```jsx
const timePill = (mini = false) => (
  <div className="relative inline-block overflow-hidden rounded-3xl bg-primary-10
                  px-3 py-0.5 transition-all duration-300 ease-in-out">      ← :198
    <div className="relative whitespace-nowrap">                             ← :199
      <span className={`inline-block text-[12px] … ${!playing ? "" : "absolute opacity-0"}`}>
        {fmt(total)}                                                          ← :204
      </span>
      <span className={`inline-block text-[12px] … ${playing ? "" : "absolute opacity-0"}`}>
        {fmt(time)} | {fmt(total)}                                            ← :211
      </span>
```

Four causes, all required:

1. **`AudioStory.tsx:369`** — the mini card is a hard `w-72` = **288px**. Inner budget after
   `border-2` + `p-2` = 268px, and it never grows.
2. **`AudioStory.tsx:384`** — `{timePill(true)}` is a flex item of the
   `flex flex-row items-center justify-between` row at `:371` with **no `shrink-0`**, so it
   inherits `flex-shrink: 1` and is compressed when the row overflows.
3. **`AudioStory.tsx:198`** — the pill carries **`overflow-hidden`** (needed to hide the
   absolutely-positioned twin span), so the compression clips silently instead of overflowing
   visibly.
4. **No `tabular-nums` anywhere in the codebase** (`font-variant-numeric: normal` confirmed;
   `grep -rn 'tabular' src/` returns nothing in the baseline). Proportional digits mean the
   clip point *moves every second as the digits change* — the last character flickers in and out
   rather than being stably truncated.

Worse at `lg`: the play button grows to `lg:h-18 lg:w-18` (`:222`) = 72px, +16px of pressure on
the same fixed 288px card.

---

### (c) `AudioStory.tsx` mini-player and `Menu.astro` burger in the same corner — ✅ **VERIFIED**

**Positioning classes:**

| Element | file:line | Classes |
|---|---|---|
| Mini-player wrapper | `src/components/AudioStory.tsx:360` | `fixed right-0 bottom-0 left-0 **z-[999]** w-full` |
| Mini-player rail | `src/components/AudioStory.tsx:367` | `mx-auto w-full max-w-7xl p-3` |
| Mini-player card | `src/components/AudioStory.tsx:369` | `w-72` (288px) |
| Menu root | `src/components/Menu.astro:30` + `:22` | `cnwm-menu fixed **bottom-3 right-3** **z-[1000]**` |
| Burger button | `src/components/Menu.astro:36` | `h-[72px] w-[72px]` |

**The collision is structural, not incidental:** `src/pages/[chapter].astro:47` sets
`menuPosition="bottom-right"`, and chapter pages are **the only pages where `AudioStory` renders**.
The two elements are therefore guaranteed co-located on exactly the pages where both exist.

**Measured (Chromium, real CSS):**

| Viewport | Mini card x | Burger x | Horizontal overlap | Vertical overlap |
|---|---|---|---|---|
| **375px** | 12 → **300** | **291** → 363 | **9px** | **72px** |
| 390px | 12 → 300 | 306 → 378 | 0 (6px gap) | 72px |
| 414px | 12 → 300 | 330 → 402 | 0 (30px gap) | 72px |

At **375px — the minimum width `CLAUDE.md` mandates support for** — the two overlap by 9px across
a 72px-tall band, and the burger's `z-[1000]` paints **over** the mini player's `z-[999]`. The
overlapped strip is precisely where the time pill sits (pill spans x 222→290; burger's left edge
is at x 291). So on a 375px phone the clipped time pill from bug (b) is also 1px from being
occluded by the burger. Both elements are bottom-anchored into the same 76px strip
(card y 712→788, burger y 716→788) at every width tested.

---

### (d) `TroyMap.tsx` hardcoded label string in `PIN_ABOVE` — ✅ **VERIFIED**

**`src/components/TroyMap.tsx:37-39`:**

```ts
/** Marker stem direction per stop label (stops 2 & 5 sit ~50m apart — the
 * above/below split keeps their pills from colliding). */
const PIN_ABOVE = new Set(["Commissioner's Office"]);
```

A content string is compiled into layout logic. It is read twice — `TroyMap.tsx:106`
(`const above = PIN_ABOVE.has(stop.label)`) and `TroyMap.tsx:303`
(`anchor: PIN_ABOVE.has(stop.label) ? "top" : "bottom"`) — and matched against
`stop.label`, which comes from `map.label` in the content JSON
(`src/content/chapters/commissioners-office.json`). Any edit to that label — including the
typographic apostrophe `'` (U+2019) vs `'` — silently breaks the anti-collision rule and the
stop-2/stop-5 pills overlap again. The comment at `:37-38` documents the *intent* but the code
encodes the *instance*; the flag belongs in the chapter schema
(`src/content.config.ts`), not in a `Set` literal.

---

### (e) `TroyMap.tsx` route line paint properties — ✅ **VERIFIED**

**`src/components/TroyMap.tsx:320-326`:**

```ts
map.addLayer({
  id: "route-line",
  type: "line",
  source: "route",
  layout: { "line-cap": "round", "line-join": "round" },
  paint: { "line-color": "#F26835", "line-width": 3.5, "line-dasharray": [0.1, 2], "line-opacity": 0.85 },
});
```

| Property | Value | Note |
|---|---|---|
| `line-color` | **`#F26835`** | raw hex — the `--color-primary-9` value, not the token |
| `line-width` | **3.5** | flat; no zoom-interpolation stop, so it is 3.5px at z13.75 and at z20 |
| `line-dasharray` | **`[0.1, 2]`** | dash 0.1× width = **0.35px**, gap 2× width = **7px** — a 5% duty cycle; with `line-cap: round` each dash renders as a ~3.5px dot, i.e. a **dotted** line, not a dashed one |
| `line-opacity` | **0.85** | |
| `line-cap` / `line-join` | `round` / `round` | `:324` |

Geometry source: `lerpRoute(stops)` at `TroyMap.tsx:113-125` interpolates 60 points per leg
(241 points total). The self-draw at `:327-339` advances `i += 3` per `requestAnimationFrame`
after a `setTimeout` of **1200ms** (`:338`) — ≈80 frames ≈ **1333ms** at 60fps. Under
`prefers-reduced-motion` the full route is set at once (`:317`).

---

## Appendix — headline counts

| Inventory | Result |
|---|---|
| Button patterns / instances | **16 patterns · 27 source instances** (14 / 17 excluding styleguide) |
| Buttons > 20px text | **6** (all reach 27px at `lg`) |
| Buttons missing a sibling's responsive ladder | **2** — `404.astro:23`, `404.astro:31` |
| Inline `<svg>` | **10** (+ 1 favicon) |
| `preserveAspectRatio="none"` | **2** — `[chapter].astro:73`, `TroyMap.tsx:734` |
| Box-ratio ≠ viewBox-ratio | **2** — `AudioStory.tsx:64`, `styleguide.astro:143` |
| Distinct arrow idioms | **6** (3 vector + 3 typographic) |
| Distinct rendered font sizes | **24** — 8 of them sub-16px |
| Distinct section-gap values in `[chapter].astro` | **9** (7 strict) |
| Top-of-page padding values across 8 pages | **6 different values** — not unified |
| Bordered / rounded elements | **88** (60 production + 28 specimens) |
| Distinct radii / border colours / widths | **10 · 8 · 2** |
| Distinct durations | **12** (component band) · 24 (full superset) |
| Distinct easings | **4 declared (3 dead)** · 5 painting in CSS · 14 total behaviours |
| Dominant shell | `max-w-7xl` **1280px** ×12 |
| Chapter hero shell | **unbounded** — 1344px @1440, 1824px @1920 |
| Bugs verified | **5 / 5** (bug (a) confirmed with inverted symptom) |
