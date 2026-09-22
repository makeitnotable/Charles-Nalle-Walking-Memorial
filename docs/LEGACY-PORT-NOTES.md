# Legacy → v3 porting notes (read before building Phases 1–3)

*Extracted from legacy repo `match-figma-designs` on 2026-08-02 (overnight run). Legacy path:
`<project>/Charles Nalle Walking Memorial Website/Charles-Nalle-Walking-Memorial`. All legacy
class strings below are verbatim and transplant ~1:1 into Astro/Tailwind v4.*

## Legacy routes ↔ v3 routes

| Legacy | v3 (keep v3 slugs!) | Chapter |
|---|---|---|
| `/bakery` | `/bakery` | 1 Holeur's Fashionable Bakery |
| `/commissioner1` + `/commissioner2` | `/commissioners-office` (v3 merges both scenes on one page — ch2 has TWO scenes) | 2 Commissioner's Office ("Bank" pin label) |
| `/mansion` | `/mansion` | 3 |
| `/ferry` | `/ferry` | 4 |
| `/barber` | `/barbershop` | 5 |
| `/`, `/map`, `/about` | same | |

v3 also has `/people`, `/paintings` (keep, restyle). **NOTE: v3 chapter order in content JSONs
is mansion=? bakery=1 …— verify `order` fields in `src/content/chapters/*.json` (Brian's pins,
Kathy's content are truth).**

## Full legacy @theme tokens (index.css) — richer than PLAN Reference

Primary 1-12: #0e0807 #1d1411 #341a11 #4a1b0a #592411 #69311d #80412b #a55438 **#f28835(→canonicalize #f26835)** #e45b27 #ff9770 #fed9cc
Secondary (red) 1-12: #0f0707 #1f1110 #3d0e0e #55050b #660b11 #791b1d #932c2b #be3a3a #bf3b3b #af2b2e #ff8f8b #ffd0cb
Tertiary (blue) 1-12: #010036 #010550 #040f74 #0921b3 #133092 #1e3fa2 #2c50b4 #3c63c9 #537de5 #477dd7 #8ab2ff #cce1ff
Gray 1-12: #080907 #191715 #24211d #2c2924 #34302a #3d3a34 #4b4741 #648059 #706d66 #7e7a73 #b7b3ab #f0edeb
Neutral 1-12: #070912 #100a06 #302414 #503d22 #705731 #8f7040 #ad8950 #bb9e70 #c9b490 #d7c9b0 #e6decf #f6f3ee
Fonts: `--font-sans: "Martel Sans"` (Google import wght 200-900; v3 self-hosts 300/600/800). Poppins imported 400-700 but `font-poppins` never registered → only worked where inline `font-['Poppins']`.

## Chapter page section order (LocationPage.jsx)

1. **HeroSection** (wrapped `relative mx-auto mt-6 lg:mt-12 px-0 md:px-10 lg:px-12`)
2. **AudioPlayerSection** (`w-fit mx-auto mt-16` for ch1-3; ch4/5 embed it in left column)
3. **Narrative** — ch1-3: `NarrativeSectionOneThroughThree` (2-col split at md, content halved); ch4/5 (`narrative.contentDesktop`): mobile 1-col, md+ two-col grid with first 3 paras left (under player) + rest right
4. **HistoricalContextSection** (`max-w-7xl mx-auto mb-8 md:mb-12`)
5. **MoralMessageSection** (full-bleed)
6. **WhereToNextSection** + **FooterSection** (`max-w-7xl mx-auto`)

## Signature component spec (verbatim values)

### Hero (HeroSection.jsx + HeroHeader.jsx)
- Shell: `h-screen flex flex-col relative overflow-hidden`; header `px-8 space-y-6 py-6`.
- Header row1: "CHAPTER" `font-poppins text-[.75rem]→[0.9375rem]→[1.125rem] text-[#ff9770]` + number badge `w-[1rem]→[1.25rem]→[1.5rem] rounded-full bg-primary-10` with `text-[.625rem]→[0.78125rem]→[.9375rem] font-medium font-poppins text-primary-12`.
- h1: `font-['Martel_Sans'] text-[2.625rem] leading-[2.125rem] md:text-[3.28125rem] md:leading-[2.65625rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] font-semibold tracking-[-1.5px] text-[#F6F3EE]` + ArrowWithDynamicShaft right, `self-stretch`.
- Media: `mt-0 md:mt-6 lg:mt-12 w-full flex-1 max-h-screen bg-neutral-1 rounded-3xl border border-[rgba(105,49,29,1)] object-cover object-center`; video autoplay/loop/muted/playsinline + poster; vertical asset mobile, horizontal desktop.
- Scrub: ScrollTrigger `start "top top" end "+=100%" scrub 0.5` → media `{scale:1.4, borderRadius:0, marginTop:0}`, header `{y:-200}`.
- Bottom fade: `absolute bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-primary-2)] to-transparent`.
- **v3: press-and-hold reveal replaces plain media INSIDE this frame** (sketch → animated painting).

### Audio player (AudioPlayerSection.jsx)
- Card: `rounded-3xl border-2 border-primary-6` size `md:w-[29.296rem] md:h-[26.05rem] lg:w-[32.5rem] lg:h-[29.291rem]`; bg `primary-3` idle → `primary-4` playing (`transition-colors duration-300`).
- Cover: `p-4` wrap; inner `w-[21.44rem] h-[14.29rem] md:w-[26.79rem] md:h-[17.86rem] lg:min-w-[29.5rem] lg:min-h-[19.66rem] rounded-xl border-primary-6 border-2`; `scale-102` when playing.
- Play button: `w-14 h-14 lg:w-18 lg:h-18 bg-primary-4 border-2 border-primary-6 rounded-2xl` hover `bg-[#592411] border-[#80412B]` active `bg-[#341A11]`; icons stroke `#F26835` (play triangle 20×22, pause two 4×16 rects).
- Titles: chapterName `text-primary-12 font-semibold lg:text-[1.6875rem] uppercase`; subtitle `text-primary-11 font-poppins text-[12px]`.
- Time pill: `bg-primary-10 rounded-3xl px-3 py-0.5`; two stacked spans (duration-only vs `MM:SS | MM:SS`), inactive one `absolute opacity-0` → width animates via `transition-all duration-300`.
- Mini player: `fixed bottom-0 z-[999]` → inner `max-w-7xl mx-auto p-3` → card `w-72 rounded-2xl border-2 border-primary-6 p-2` same bg swap; opacity swaps with main (`mainPlayerVisible` = main play button top >= 0); `showMiniPlayer` latches on first play.
- **v3: synced paragraph highlight (primary-4 wash) + scrub + paragraph-tap seek woven in.**

### Curtain (TransitionOverlay.jsx)
- Panel `fixed inset-0 z-[9999] bg #100A06`, starts `translateY(100%)`.
- In: `y 100%→0` 0.6s `circ.inOut`; text (CHARLES/NALLE stack or destination name, `text-[54px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none`, second line `self-end -mt-3`) fades in 0.3s at `-=0.3`.
- Hold 1.0s — navigation fires at hold start. Out: text 0.1s fade + panel `y→-100%` 0.6s `circ.out` simultaneously. Reset to y:100%.
- v3: module intercepts internal link clicks; navigate during hold; play exit on new page load (sessionStorage flag). Reduced-motion: instant nav.

### Menu (MenuOverlay.jsx)
- Hamburger: `fixed top-3 right-3` (or bottom-right on map) `z-[1000]`, `72×72 bg-primary-3 border-2 border-primary-6`, corners `rounded-xl` ×3 + screen-edge corner `rounded-bl-4xl` (top-right position), three bars `bg-primary-10 h-0.5` w-8/w-8/w-6(self-start ml-4.5).
- Appear: `scale .8→1, rotation -180→0, back.out(1.7)` + bars `scaleX 0→1 stagger 0.1`.
- Open panel: `bg-[#341A11] border-2 border-[#69311D] rounded-xl`, `back.out(1.7)` 0.6s from corner origin; close row `py-6` with X (`#F26835`), separated `border-b-2/t-2 #69311D`; items `text-lg text-[#FF9770] hover:text-[#F26835]`, order: Home / 1-5 chapters / About, `p-8` + indents.

### Map (constants + utils + useMapStore + MapBox + slider + card)
- Config: center `[-73.6948, 42.7235]` zoom 15.25 pitch 33 bearing 10; maxBounds `[[-73.73,42.70],[-73.65,42.75]]`; style `mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft`.
- **v3 uses Brian's exact pins from v2 chapter JSONs** (NOT legacy coords). Legacy pin labels: Bakery(below) Bank(above) Mansion(below) Ferry(below) Barbershop(above); "Commissioner Part 2" shares Bank pin, showPin:false.
- Marker (utils.createMarkerElement): pill `p-[8px] md:p-[10px] lg:p-3 rounded-[30px]` Poppins, chip `20px rounded-full bg #E45B31... indexBg #E45B27` + label `text-[12px]→[15px]→[18px]`; stem `w-0.5 h-30px` + dot `8px`; above/below per pinPosition. Active: bg `#F26835` text `#FED9CC` border `#F26835` line `#F26835` scale .9; Inactive: bg `#4A1B0A` text `#FF9770` border `#80412B` line `#80412B` scale .8; `transition-transform duration-300`.
- Cameras: select flyTo `{zoom:20, speed:.6, curve:1.4}`; initial arrival easeTo `{zoom:targetZoom, curve:1.4, duration:5000}`; back-to-overview easeTo 2000ms to center/15.25/33/10. Embedded per-chapter cameras (locationPage): 1:{45,45,17} 2:{48,75,17.8} 3:{45,45,15.5} 4:{45,55,17.3} 5:{48,55,17.5}.
- Slider: keen-slider `fixed bottom-0 pb-6 z-10`; slides `!min-w-[343px] sm:428.75px lg:514.5px`, spacing **-20 mobile** / 16 sm+; origin center, snap, linear 400ms; active `scale-100` vs `scale-85 origin-bottom`; `animationEnded` → debounced 150ms flyTo. Two-tap: tap inactive card → moveToIdx; tap active → navigate (curtain).
- Card: `w-[343px] h-[128px] sm:[428.75×160] lg:[514.5×192] bg-primary-2 border-2 border-primary-3 rounded-xl overflow-hidden flex`; square img left (`128/160/192px`, `border-r rgba(105,49,29,1)`); right `p-3`: "CHAPTER" poppins `text-[12px]→[15px]→[18px] text-primary-11` + number chip `bg-primary-10`; title `text-[1.125rem]→[1.40625rem]→[1.6875rem] font-medium Martel text-primary-12`; Arrow below.
- Embedded map (WhereToNext): `w-[343px] h-[229px] md:w-[386px] md:h-[257px] lg:w-[514.5px] lg:h-[343px]` (or 100% w) `rounded-3xl border-1 border-primary-6`, non-interactive, no buttons.

### Home (Home.jsx)
- Shell `p-4 md:p-12 h-dvh`; frame div `absolute inset-0` w/ `linear-gradient(180deg, rgba(16,10,6,0) 65%, #100A06 100%), url(homepage-overlay.png), url(home-bg.png)`, cover/center, `filter grayscale(100%) brightness(.7) sepia(.1) opacity(.9)`, `borderRadius 32px border 1px #4B4741 opacity 50%`.
- Stack (z-10, justify-between h-full): top group `gap-8 pt-16`: "Troy, NY" `text-primary-11 text-[14px]→[17.5px]→[21px]`; wordmark CHARLES/NALLE `text-[54px]→[67.5px]→[81px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none`, NALLE `self-end -mt-3`; "1821 —(28×1px bg-primary-10 rule) 1875".
- Middle: Continue Button `filled-secondary`.
- Bottom: mission copy `text-gray-11 text-[12px]→[15px]→[18px] text-center`, TWO variants w/ hand breaks (mobile `max-w-[283px] md:max-w-[353px]`; desktop `<br/>` after "designed").

### Buttons (Button.jsx) — `rounded-full min-w-[147px] transition-all duration-300`
- filled: `bg-primary-4 hover:bg-[#592411] active:bg-[#341A11] text-primary-11 hover:text-[#FED9CC] Poppins font-medium border-1 border-primary-6 hover:shadow-[inset_0_0_0_1px_#80412B] active:shadow-none py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem]→[1.40625rem]→[1.6875rem]`.
- outline: same paddings/type, `border-primary-8`, transparent bg.
- filled-secondary (Home CTA): `bg-[#FFC6B3] text-[#BD3900] border-[#F7A98F] w-[148px]`.
- ghost: `text-primary-11 py-4 px-10 text-xl`.

### Sections
- Narrative para: `mx-5 text-primary-12 text-[18px] font-[300] leading-[1.6]`; first-WORD cap `text-[32px] inline-block -mt-2 -mb-2 font-medium`; paras `gap-y-8 lg:gap-y-12`; ch1-3 split into 2 cols at md (content halved).
- Section h3 (Historical/WhereToNext/Moral): `text-[#F6F3EE] uppercase text-[2.625rem] leading-[2.125rem] tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] lg:tracking-[-0.14063rem] font-semibold Martel` with intentional `<br/>` (e.g. "Historical <br/> Context").
- ProgressIndicator: `text-[0.75rem]→[0.9375rem]→[1.125rem] font-[500] font-poppins` — "Section N/4" style labels, placement varies mobile/desktop.
- HistoricalContext: h3 + number + media (`rounded-2xl border-2 border-primary-6 max-h-[363px]`, video w/ poster if animatedHistorical) + numbered points row (`chips bg-primary-10 16/20/24px` + `text-[18px] font-[300]` text, `md:flex-row` split).
- MoralMessage: full-bleed; bg layer = moral image + scrim `linear-gradient(#1D1411, rgba(16,10,6,.95), #1D1411)`; mobile: h3 → offset square image (`250→281.25→375px rounded-3xl border-primary-6 mr-5`, right-aligned) → number → message; GSAP suite: title/number/message fade-up 0.8s power2.out `top 80%` toggleActions reverse, image scale .95→1.
- WhereToNext: h3 split first word / rest with `<br/>`; embedded MapBox; "Get Directions" outline button → Google Maps walking directions to next stop coords.
- Footer: Share component (default mobile / unstacked desktop) `mb-4 md:mb-28`.

### ArrowWithDynamicShaft.jsx (read when porting)
Stem stretches to match title height; used in HeroHeader + cards.

## Motion vocabulary (legacy, confirmed)
- CSS `duration-300` everywhere; GSAP `power2.out` 0.6–1.0s reveals, stagger 0.2, `start "top 80%"`, `toggleActions: "play none none reverse"`; pops `back.out(1.7)` (menu 0.6s in / `back.in(1.7)` 0.3s out; hamburger rotation -180 + bars scaleX stagger 0.1); curtain timings above; slider linear 400ms; map cameras above.

## v2 keeper inventory (do not lose in re-skin)
- `src/components/PressReveal.tsx` — press-and-hold w/ keyboard + touch + reduced-motion + tap fallback; progress bar `h-[3px]`; goes INSIDE hero frame.
- `src/components/Narration.tsx` — timings + paragraph sync; re-skin to player design (primary-4 wash highlight).
- `src/content/chapters/*.json` — Kathy's content + Brian's pins + narration timings + media paths.
- `public/media/` — 95MB optimized pipeline; `scripts/` media tooling.
- People/Paintings pages, About; `withBase()` URL discipline everywhere.
