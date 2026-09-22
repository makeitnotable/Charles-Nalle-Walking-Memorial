# CNWM v2 — Visual / UX Failure Census

**Source:** `docs/v4/qa/p0-before/` — 138 screenshots, 10 routes × 3 viewports (390 / 768 / 1440) × up to 5 scroll positions. Every file was examined.

**Client verdict being explained:** *"It doesn't feel polished or professional… Overall the site looks sloppy and like it was thrown together."*

**Verdict of this audit: the client is right, and the cause is not taste — it is measurable.** At 1440 the mansion chapter page has **six different left edges**; barbershop has **eleven**. The site uses **nine corner radii**, **seven icon idioms**, **four different list-link affordances**, **two incompatible pull-quote systems**, and calls the same five places by **five or six different names each**. Every chapter page leads with an unfinished black-and-white pen study while the finished Mark Priest paintings — the reason this site exists — appear below the fold as cropped thumbnails. The walking-tour map's route line is a dark-rust dotted path on a near-black basemap at roughly 1.3:1 contrast, and on 4 of 6 chapter "where to next" screens there is no destination marker on the map at all.

Defect codes used throughout:

| Code | Client's words |
|---|---|
| W1 | Icons — "the arrows for example look terrible" |
| W2 | Buttons — "the buttons are unbalanced" |
| W3 | Map route — "the path… is so low contrast that it is invisible — an accessibility issue" |
| W4 | Spacing / hierarchy — "lacking a visual hierarchy" |
| W5 | Sloppiness — reads as an error |
| W6 | Names / titles — same place, different names |
| W7 | Hero — sketch where the painting should be |
| W8 | Chapter template not flagship-worthy |

---

## 0. Global chrome (present on every route)

These are the defects that repeat everywhere. They are listed once here and not re-listed on every route table.

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| all | `home--1440.png` vs `mansion--1440.png` | The hamburger is **top-right on home and about, bottom-right on every chapter page, map, people and paintings**. The same control has two anchors. A user who learns where the menu is on the landing page cannot find it on the next page. | W5 | fatal |
| 1440 | `home--1440.png` | Hamburger spans x1360–1425; the hero card ends at x1392. The button **hangs 33px off the right edge of the content shell**. Nothing else on the page uses that edge. | W5 | major |
| 390/768 | `mansion--390--scroll1.png`, `barbershop--390--scroll1.png`, `ferry--390--scroll1.png`, `bakery--390--scroll1.png`, `bakery--768--scroll1.png`, `about--390--scroll2.png`, `about--390--scroll4.png`, `people--390--scroll2.png`, `map--390--scroll1.png`, `commissioners-office--768--scroll2.png` | The floating hamburger (x306–378 / y760–832 at 390; x684–756 / y940–1012 at 768) **sits on top of live body text and destroys words mid-string**. Sample casualties: "Finally, he pulled himself together and mana[ged]" (mansion 390), "behind the Gil[bert]" (people 390), "the crowd gasped, and Marshal Holmes and t[he]" (ferry 390), "in a single day" → "single day" (map 390), and the artist credit "MARK PRIEST · NALLE [SERIES]" (commissioners 768 scroll2). | W5 | fatal |
| 390/768 | `paintings--768--scroll3.png`, `paintings--390--scroll4.png` | The hamburger **completely occludes live navigation links** — "CHAPTE[R 3 →]" and "C[HAPTER 5 →]". Interactive targets are unreachable and unreadable. | W5 | fatal |
| 390 | `mansion--390.png`, `commissioners-office--390.png`, `barbershop--390.png`, `ferry--390.png`, `bakery--390.png` | The hamburger **overlaps the "PRESS AND HOLD…" instruction chip** (chip x25–365, button x306–378). The only explanation of the page's signature interaction is partly under a button, on all five chapter pages. | W1/W5 | fatal |
| 390 | `mansion--390--scroll4.png`, `barbershop--390--scroll4.png`, `ferry--390--scroll4.png` | The hamburger sits **on top of the footer rule** (y≈789), covering its right ~70px. | W5 | minor |
| all | site-wide | **Seven icon idioms, four stroke weights, no shared system**: (1) 1px SVG hairline + micro-chevron scroll hint, chapter hero top-right; (2) ~1.5px typographic `→` glyph in footer links and chapter cards; (3) ~12px `→` in people chips, which degrades to an unreadable "-›" smudge at 390; (4) ~52px solid-headed 3.5px-stroke white SVG arrow on the about/people CTA; (5) stroked triangle play mark in the audio player; (6) filled numeral discs at three sizes (chapter badge, map pin, fact list); (7) 3px 3-bar hamburger. Plus a ~20px progress knob on an 8px track. **This is exactly what "the arrows look terrible" means: there is no arrow, there are five arrows.** | W1 | fatal |
| all | site-wide | **Four different affordances for the identical action "go to chapter N"**: bordered outline chip (people), bare caps text + `→` (paintings), a card row with a numeral disc and **no arrow at all** (map), and a giant SVG-arrow CTA card (about). | W1/W2 | major |
| all | site-wide | **Nine corner radii in play**: 0 (context photos, full-bleed images, ghost panels, ferry archival engraving), ~8 (hero image), ~10 (audio play button), ~12 (map, paintings tiles), ~14 (sketch thumbs), ~16 (audio card, hamburger, people cards, map list rows), ~18–24 (home card), full-pill (buttons, credit chips, duration chip, map pins), 50% (numeral discs). | W5 | major |
| all | site-wide | The "filled" style is **a dark maroon roughly two value steps off the page background**, and it carries the same orange border as the outline style. Nothing on this site reads as filled. Primary/secondary hierarchy is therefore nonexistent on every button pair, every card, and every chip. The only exception is the `Continue` button on home, which is a light peach — a fill idiom that appears **exactly once on the entire site**. | W2 | fatal |
| all | site-wide | **Straight apostrophes mixed with curly quotation marks throughout** — "CITY'S" at 54px in the people H1, "Holeur's", "don't", "Charles's" — beside curly `" "` in every pull quote. Un-proofed typography, visible at headline size. | W5 | major |
| 390 | site-wide | Real content routinely set at **~10–12px**: the press-and-hold instruction, the "Stop N of 5" progress line, all footer navigation links, the "MARK PRIEST · NALLE SERIES" credit, "CHAPTER N — <NEXT STOP>", people chips (primary navigation), paintings credits and chapter links, every about eyebrow, and a full book citation. | W4 | fatal |
| — | — | **No 404 route was captured** and none appears to exist. | W5 | minor |

### W6 — the naming matrix (the single most damning artifact in this audit)

Every row is one physical place. Every column is a surface a visitor actually sees.

| Stop | Route slug | Chapter H1 | Map page list | Map pin | People chip | Paintings title | About page | Own body prose |
|---|---|---|---|---|---|---|---|---|
| 1 | `bakery` | HOLEUR'S FASHIONABLE BAKERY | HOLEUR'S FASHIONABLE BAKERY | **Bakery** | Ch. 1 · **Bakery** | Holeur's Fashionable Bakery | **George Holeur's** Fashionable Bakery | "the bakery", "his shop at 3rd and Division" |
| 2 | `commissioners-office` | **OFFICE OF THE COMMISSIONER** | OFFICE OF THE COMMISSIONER | **Commissioner's Office** | Ch. 2 · **Commissioner's Office** | Office of the Commissioner *(+ "— Part 2")* | **The Mutual Bank Building** | **"The Law Office"** ×3 |
| 3 | `mansion` | URI GILBERT MANSION | URI GILBERT MANSION | **Gilbert Mansion** | Ch. 3 · **Gilbert Mansion** | Uri Gilbert Mansion | **Uri Gilbert's Mansion** | "The Uri Gilbert Mansion", "the Gilbert mansion" |
| 4 | `ferry` | WASHINGTON STREET FERRY LANDING | WASHINGTON STREET FERRY LANDING | **Ferry Landing** | Ch. 4 · **Ferry Landing** | Washington Street Ferry Landing | **Washington St.** Ferry Landing | "The Ferry Landing **at** the Hudson River" **and** "…**on** the Hudson River" *(same page, adjacent columns)* |
| 5 | `barbershop` | PETER BALTIMORE'S BARBERSHOP | PETER BALTIMORE'S BARBERSHOP | **Barbershop** | Ch. 5 · **Barbershop** | Peter Baltimore's Barbershop | Peter Baltimore's Barbershop | "his high-class barbershop at **Troy House**" |

Worst single instances:

- **`map--1440--scroll3.png` / `map--1440.png` — one page, two naming systems, 600px apart.** The pins say *Bakery / Commissioner's Office / Gilbert Mansion / Ferry Landing / Barbershop*; the list directly below says *HOLEUR'S FASHIONABLE BAKERY / OFFICE OF THE COMMISSIONER / URI GILBERT MANSION / WASHINGTON STREET FERRY LANDING / PETER BALTIMORE'S BARBERSHOP*. A user scrolling one screen sees the same five places renamed. **W6, fatal.**
- **`barbershop--1440--scroll4.png` — three names for stop 1 in one viewport.** The label says "CHAPTER 1 — WHERE THE STORY BEGAN", the map pin says "1 Bakery", and the destination page is titled "HOLEUR'S FASHIONABLE BAKERY". **W6, fatal.**
- **Stop 2 is called "The Law Office" in its own body copy** and "The Mutual Bank Building" in the about page's itinerary — two names that share no words with the page's own H1. **W6, fatal.**
- Studio credit: **"Made by Notable"** in every chapter footer vs **"Notable Branding & Design"** on about. Two names for the party who built it.
- About credits **two different RPI departments** for the same project ("Design, Innovation, and Society Studio B" and "Science Technology and Society department") and contains a probable name typo, "Jame Lang", in a public credit line.
- About: "created in Spring of 2025" — a stale date string on a live 2026 site.

---

## 1. `home`

Three files, no scroll captures. A single full-viewport hero card.

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `home--1440.png` | **The H1 is right-aligned while everything else is centred.** "CHARLES" spans x545–895; "NALLE" spans x657–**895** — flush right to the same edge. The eyebrow, the dates, the button and the paragraph are all centred on x720. Two alignment axes inside one 6-element composition. It reads as a wrap bug, not a stagger. Repeats at 768 (x239–530 / x307–530) and 390. | W4 | major |
| 1440 | `home--1440.png` | The hero painting is pushed to ~25% opacity behind a dark scrim, so the subject is unreadable — you cannot tell what the image depicts. Overlaid on it is a branching pale "lightning/crack" texture that reads as **image damage or a rendering artifact**, not as a designed treatment. | W5/W7 | major |
| 1440 | `home--1440.png` | ~170px of undesigned void between the `Continue` button (ends y614) and the standfirst paragraph (starts y785), which is then jammed against the card's bottom edge. The middle of the page is empty and the bottom is crowded — the inverse of composed pacing. | W4 | major |
| 1440 | `home--1440.png` | `Continue` is a **light peach pill with orange text** — the only genuinely filled control on the entire site. Every other primary action (`Continue the walk`, `Take the walk`, chapter chips, the about CTA) uses a near-invisible maroon fill or an outline. The one button that looks like a button appears once and is never seen again. | W2 | major |
| all | `home--1440.png`, `home--768.png`, `home--390.png` | Card radius ~24px, hamburger radius ~12px, `Continue` full pill — three radii among four visible objects. | W5 | minor |
| 1440 | `home--1440.png` | The standfirst is ~15px, low-contrast grey, and breaks "…experience designed / to share the history…" leaving an unbalanced two-line rag. On a 1440 canvas it is the smallest and dimmest text on screen while carrying the site's only positioning statement. | W4 | minor |
| 1440 | `home--1440.png` | A hamburger-only navigation on a 1440 canvas, with no wordmark, no visible nav, no skip link. The desktop page has **no site identity of any kind**. | W5 | major |
| 390 | `home--390.png` | The date rule between "1821" and "1875" is ~30px at 390 and ~26px at 1440 — the rule gets *longer* as the viewport gets smaller. Non-responsive ornament. | W5 | minor |

**Glance test.** The H1 wins at all three viewports. This is the only page on the site where the intended element wins.

**Type hierarchy:** 5 levels (eyebrow ~15, H1 ~72, dates ~17, button ~24, standfirst ~15). Eyebrow and standfirst are the same size doing different jobs.
**Box census:** 3 (card, hamburger, button).
**Composition:** Half-composed. The card device is good; the interior pacing is not — one large arbitrary void plus one crowded edge.

---

## 2. Chapter pages — `bakery` (1), `commissioners-office` (2), `mansion` (3), `ferry` (4), `barbershop` (5)

**This is the flagship, and it is the worst-performing template on the site.** 75 screenshots. The defects below are structural — they occur on every chapter page unless a specific page is named.

### 2a. W7 — the hero is the wrong asset

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| all | `mansion--1440.png`, `commissioners-office--1440.png`, `barbershop--1440.png`, `ferry--1440.png`, `bakery--1440.png` (and all 768/390 equivalents) | **Every chapter hero is a black-and-white crosshatch pen SKETCH, not the finished painting.** It occupies 500–700px — the single largest element above the fold — and it is the unfinished asset. | W7 | fatal |
| 1440 | `ferry--1440.png` | The ferry sketch is a near-uniform mass of scribble with **no readable subject and no figure/ground separation**. At a glance it reads as a texture swatch or a corrupted image. This is the worst hero on the site. | W7 | fatal |
| 1440 | `commissioners-office--1440--scroll2.png`, `mansion--1440--scroll2.png` | The finished painting **does exist** and appears further down the same page — but at 1440 it is reduced to a ~105px full-bleed sliver (mansion) or an extreme crop with no readable composition. The best asset is used as wallpaper. | W7/W5 | fatal |
| 768/390 | `mansion--768--scroll2.png`, `mansion--390--scroll2.png` | The same painting is a full-bleed 670px band at 768 and 450px at 390 but a 105px sliver at 1440. **The same image has three different crops and three different scales across breakpoints.** | W5 | major |
| 1440 | `commissioners-office--1440--scroll1.png` vs `--scroll2.png` | The **same painting appears twice on one page in two incompatible treatments**: once inside a centred, double-bordered, rounded card at x461–979, and 700px later full-bleed edge-to-edge at x0–1440. | W5 | major |
| 1440 | `ferry--1440--scroll3.png`, `bakery--1440--scroll3.png` | A B&W **sketch** is floated bottom-right as a photo-style thumbnail, aligned to no column, uncaptioned. The sketch is used a second time as content. | W7 | major |
| 1440 | `ferry--1440--scroll2.png` | A near-**white** archival engraving at x96–1296, 0px radius, no border, no caption, dropped into the dark warm-brown page. It blows out the palette and wins the screen by brute luminance. Four incompatible image treatments now coexist on one page (sketch / oil painting / modern colour photograph / white engraving). | W5 | major |
| 1440 | `bakery--1440--scroll2.png` | The "HISTORICAL CONTEXT" image is a brick synagogue and a clapboard house — **no bakery, no storefront** — uncaptioned. Reads as stock filler. Left margin 96, right margin 144: the photo is not even centred in its own slot. | W5 | major |

### 2b. W5 — misregistration: the grid does not exist

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `mansion--1440*.png` | **Six left edges on one page:** 48 (hero image), 80 (eyebrow/CHAPTER/H1), 97 (H2 + body), 105 (Section N/4), 113 (pull quote), 216 (footer links + rule). | W5 | fatal |
| 1440 | `barbershop--1440*.png` | **Eleven left edges on one page:** 48, 81, 96, 97, 99, 105, 107, 113, 128, 216, 384. The 96/97/99/105/107 cluster is the most damaging — near-misses read as misregistration, not as a system. | W5 | fatal |
| 768 | `barbershop--768--scroll4.png`, `ferry--768--scroll4.png`, `bakery--768--scroll4.png`, `commissioners-office--768--scroll4.png` | **Five left edges inside 600px of vertical space:** H2 at 16, "Section 4/4" at 24, "MAKE A DIFFERENCE" + body at 32, map at 48, footer at 56. | W5 | fatal |
| all | every chapter page, every viewport | **An 8px stair-step between every H2 and its own "Section N/4" label** (1440: 97 vs 99–105; 768: 16 vs 24; 390: 16 vs 24). The label that belongs to the heading is indented from it by an amount that matches nothing. | W5 | major |
| 1440 | `mansion--1440--scroll4.png` | The footer sits in a **1008px centred shell** (x216–1224) while the body sits in a 1199px left-aligned shell (x97–1296). Two container widths on one page. | W5 | fatal |
| 1440 | `mansion--1440--scroll4.png`, `bakery--1440--scroll4.png` | The map is a **fixed 672px wide, centred**, inside a left-aligned grid — leaving 384px of empty gutter on each side. Third alignment axis on one screen. | W4 | major |
| all | `mansion--1440--scroll1.png`, `bakery--1440--scroll1.png` | **The two body columns do not share a first baseline** — right column starts y387, left column y394 (bakery); 6px offset on mansion. Two "equal" columns whose lines never align. On barbershop the measures also differ: 588px vs 610px. | W5 | major |
| 1440 | `barbershop--1440--scroll1.png`, `ferry--1440--scroll1.png` | **Double borders** on every inline painting: a 1px light frame at r≈12, a visible gap, then the image's own hard edge inside it. Also on `commissioners-office--1440--scroll1.png` (frame x461–979, image x478–962). | W5 | major |
| 390 | `mansion--390--scroll2.png` | "HISTORICAL CONTEXT" at x18, "Section 2/4" at x22, body at x16. **Three left edges within 6px** — worse than a large difference, because it reads unambiguously as an accident. | W5 | major |
| 1440 | `barbershop--1440--scroll3.png`, `ferry--1440--scroll3.png`, `bakery--1440--scroll3.png` | A ghosted sketch panel at ~8% opacity with a **hard horizontal rectangular top edge** across the full viewport width. It reads as a half-loaded image or a JPEG ghost. `bakery--768--scroll4.png` shows it has a hard *bottom* edge too — the crosshatch simply stops mid-page. | W5 | major |
| 390 | `barbershop--390.png` | The hero is full-bleed x0–390 but **a 1–2px light frame line survives at the far left and right edges** — a border pushed off-canvas rather than removed. | W5 | minor |

### 2c. W4 — multi-column text: the site's worst typesetting

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| **768** | **`commissioners-office--768--scroll3.png`** | **FIVE columns at a 768px viewport, at ~10–14 characters per line.** Sample: "many other / Black / leaders met / at Liberty / Street / Presbyterian / Church in / Troy for the / National / Convention / of Colored / People." Column 2 runs 26 lines. **Column 5 is clipped by the viewport** — "rescue Charl[es]" is cut off mid-word. This is the single worst element on the site. | W4/W5 | fatal |
| 1440 | `commissioners-office--1440--scroll3.png` | **Four columns at ~22–25 characters per line, with an empty third column** creating a visible hole in the middle of the grid. Reads as a broken layout. | W4 | fatal |
| 768 | `bakery--768--scroll3.png` | **Three columns with an EMPTY FIRST column** (x16–280 blank), then 21 and 18 chars/line. The reader's eye lands on nothing. The block then silently switches from 3 columns to 2 with no visual break. | W4 | fatal |
| 768 | `mansion--768--scroll3.png`, `barbershop--768--scroll3.png`, `ferry--768--scroll3.png` | Three columns at ~18–22 chars/line. Sample rag: "far / faster than the / more dangerous / overland routes." | W4 | fatal |
| 1440/768 | `mansion--1440--scroll1.png` | Two columns where the **left column is clipped by the fold while the right column has already ended** — the reader must scroll down to finish column 1, then scroll back up to read column 2. The reading order is genuinely broken. | W4 | fatal |
| 1440 | `barbershop--1440--scroll3.png`, `ferry--1440--scroll3.png`, `commissioners-office--1440--scroll3.png` | Column bottoms are ragged by 115–150px, followed by **285px (barbershop) and 313px (ferry) of empty left column** before the pull quote. Undesigned voids inside a text block. | W4 | major |
| all | `mansion--1440--scroll1.png`, `bakery--390--scroll1.png`, `barbershop--1440--scroll1.png` | **The fake drop cap.** The first word ("Each", "As", "Refusing", "Behind") is set ~28–36px inline against 17–19px body **on the same baseline**, same colour, no tracking, no sink, no multi-line wrap. It reads as a font-size rule that failed. Worse at 768/390 where the enlarged word eats 45% of line 1 and orphans the rest. Worse still semantically — "Behind" and "Refusing" parse as headings before you hit the lowercase continuation. | W4/W5 | major |
| 390/768 | `barbershop--390--scroll3.png`, `ferry--390--scroll3.png`, `bakery--768--scroll3.png` | **Four consecutive paragraphs restating the same fact**, all visible in one screen. On bakery: "…was the site where Charles Nalle was captured…", "…made Charles's public arrest highly visible", "…his capture there set off the dramatic events…", "…it was there that he was apprehended…". Reads as an unedited CMS dump. | W5 | major |
| 1440 | `commissioners-office--1440--scroll1.png` | **The Tubman quote appears verbatim twice within 300px** — once inside the right-column paragraph and again as the pull quote directly below it. Duplicated content visible simultaneously. | W5 | major |
| 1440 | `mansion--1440--scroll1.png` | An academic citation — "(Christianson, *Freeing Charles: The Struggle to Free a Slave on…*" — is set inline in narrative prose at the same size, weight and colour as the story. No citation treatment exists. | W4 | minor |

### 2d. W4 — pull quotes and headings are the same object

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `mansion--1440--scroll3.png`, `barbershop--1440--scroll3.png`, `ferry--1440--scroll3.png`, `bakery--1440--scroll3.png` | Pull quotes ("THE INVISIBLE MATTER AS MUCH AS THE VISIBLE", "WE ARE RESPONSIBLE FOR JUSTICE", "AUTHORITARIANISM IS PERSISTENT", "NOT ALL LAWS ARE MORAL") are **giant left-aligned white caps at ~48–58px with no quote marks, no attribution and no rule — visually identical to the section H2 "HISTORICAL CONTEXT" (~46–56px).** A quote and a heading are the same object. | W4 | fatal |
| 1440 | `commissioners-office--1440--scroll1.png` | On this page the pull quote is instead **centred, sentence-case, with curly quote marks and an orange caps attribution**. **Two entirely different pull-quote systems inside the same template.** And it is centred directly beneath a left-aligned "PART 2 — THE MOB" heading. | W4/W5 | fatal |
| 1440 | `about--1440--scroll4.png` | A **third** pull-quote system: 24px sentence case, curly quotes, left-aligned, orange caps citation. Three pull-quote treatments on one site. | W4 | major |
| 1440 | `commissioners-office--1440--scroll1.png` | The centred pull quote wraps to a one-word orphan: "…don't let them have / him!" | W4 | minor |
| 390 | `commissioners-office--390--scroll1.png` | "PART 2 —" / "THE MOB" — the em dash is stranded at the end of line 1. | W4 | minor |
| 768 | `bakery--768--scroll3.png`, `bakery--390--scroll3.png` | The pull quote is indented 15–16px from the body (x32 vs x16/x17), an indent shared with nothing else on the page — so it reads as misalignment, not emphasis. | W5 | minor |

### 2e. W1 / W2 — the audio player, the buttons, the glyphs

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 768 | `mansion--768--scroll1.png`, `barbershop--768--scroll1.png` | The audio card packs **four chrome idioms into a 468×130px box**: outlined rounded-square play button (r≈10) with a stroked triangle, filled orange duration pill, outlined card (r≈16), and a full-width track with a ~20px filled circle knob on an ~8px rail. | W1 | major |
| all | `bakery--1440--scroll1.png`, `mansion--768--scroll1.png` | The progress knob is parked at 0% with **no elapsed fill on the track**, so the player looks unloaded or broken at rest. | W1 | minor |
| 768/1440 | `mansion--768--scroll1.png`, `barbershop--768--scroll1.png` | The audio card is **centred** (x150–618) while the body beneath it is left-aligned at x24. It aligns to nothing. | W4 | major |
| all | `mansion--1440--scroll1.png`, `ferry--1440--scroll1.png` | "**Tap** any paragraph to hear it read aloud" — a touch verb on a 1440 desktop layout, centred while everything around it is left-aligned, floating in ~90px of dead space above and ~80px below. | W6/W4 | major |
| 1440 | `mansion--1440--scroll4.png`, `commissioners-office--1440--scroll4.png`, `barbershop--1440--scroll4.png`, `ferry--1440--scroll4.png`, `bakery--1440--scroll4.png` | **The button pair is unbalanced at every viewport.** 1440: `Continue the walk` 320×86–88 vs `Get Directions` 262×86–88. 768: 265×64–68 vs 220×64–68. Both hug their text, so a deliberate pair renders as two different sizes. | W2 | fatal |
| **390** | **`mansion--390--scroll4.png`, `barbershop--390--scroll4.png`, `ferry--390--scroll4.png`, `bakery--390--scroll4.png`, `commissioners-office--390--scroll4.png`** | **The two buttons stack, centre, and are still different widths — 212–214px above 176–180px.** A ragged centred stack with a jagged silhouette. This is the clearest single instance of the client's "the buttons are unbalanced". | W2 | fatal |
| all | as above | `Continue the walk` is sentence case; `Get Directions` is Title Case. **Two capitalisation schemes in an adjacent pair.** | W2 | major |
| all | as above | The maroon fill on `Continue the walk` is ~2 value steps off the page background and carries the same orange border as the outline button. **The primary does not read as primary.** Both read as outline buttons of different widths. | W2 | fatal |
| all | as above | The buttons are 86–88px tall at 1440 carrying 22–24px text — bloated and squat. | W2 | minor |
| 1440 | as above | "CHAPTER N — <NEXT STOP>" is set at ~15px, **smaller than body text and smaller than the 24px button label below it**, and it is centred over *both* buttons so it appears to label "Get Directions" too. The single most important wayfinding string on the page is the least emphasised. | W4 | major |
| all | as above | Footer links use a typographic `→` riding the baseline at ~1.5px stem weight against ALL-CAPS labels — the shaft sits at ~40% of cap height, visibly low. | W1 | major |
| 390 | `mansion--390--scroll4.png`, `bakery--390--scroll4.png`, `barbershop--390--scroll4.png` | Footer links wrap 2 + 1 with **"ABOUT THE MEMORIAL →" orphaned alone on row 2**, uneven gap on row 1, at ~11px. | W4 | major |
| all | `mansion--1440.png` etc. | The chapter number is stated **three times in three idioms in one viewport**: "Stop 3 of 5" (eyebrow), "CHAPTER" (label), and an orange numeral disc 1200px away at the far right. On `bakery--1440.png` the word "CHAPTER" and its numeral "1" are separated by 1267px — the label and its value are not perceivable as one unit. | W4/W6 | major |
| all | `mansion--768--scroll1.png` | The audio card says "CHAPTER 5"/"CHAPTER 3" as one string while the hero splits it into "CHAPTER" + disc. Same label, two renderings, one page. | W6 | minor |

### 2f. W5 — the credit chip and the interaction prompt

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `mansion--1440--scroll2.png`, `barbershop--1440--scroll2.png`, `ferry--1440--scroll2.png` | "MARK PRIEST · NALLE SERIES" is a **bordered pill** at 1440… | W5 | — |
| 768/390 | `barbershop--768--scroll2.png`, `ferry--768--scroll2.png`, `bakery--768--scroll2.png`, `commissioners-office--1440--scroll2.png` | …and **bare unbordered text** at 768/390 — and bare text at 1440 on commissioners-office. **The artist's credit has two treatments that vary by both page and viewport.** | W5 | major |
| 1440 | `bakery--1440*.png` | On bakery at 1440 the credit **does not render at all**, though it appears on the same painting at 768 and 390. | W5 | major |
| 1440 | `barbershop--1440--scroll2.png`, `ferry--1440--scroll2.png` | The credit pill's right edge sits at x1421 — 19px from the viewport edge, aligned to nothing (body is at 96–107, image right edge is 1296–1392). | W5 | major |
| 768 | `mansion--768--scroll2.png` | The credit pill's **right border is clipped by the viewport edge**. | W5 | major |
| 768 | `commissioners-office--768--scroll2.png` | The **hamburger covers the word "SERIES"** in the artist's credit. On a memorial site whose subject is an artist's paintings. | W5 | fatal |
| 1440 | all chapter heroes | "PRESS AND HOLD TO BRING THE PAINTING TO LIFE" is **bare letterspaced ~14–15px caps at ~40% opacity sitting directly on high-frequency crosshatch** — effectively unreadable — and it wraps to two lines with "LIFE" **sliced in half by the fold at y900**. | W4/W5 | fatal |
| 768/390 | all chapter heroes | The same string becomes a **dark rounded pill chip**. The same element has two entirely different treatments across breakpoints. At 390 it drops to ~10px and collides with the hamburger. | W5 | fatal |
| 1440 | `barbershop--1440--scroll2.png` vs `ferry--1440--scroll2.png` | The gap below "Section 2/4" is **≥165px on barbershop and 78px on ferry** — the same slot, two values, two pages. | W4 | major |

### 2g. W3 — the "WHERE TO NEXT?" map

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| **768** | **`barbershop--768--scroll4.png`, `ferry--768--scroll4.png`** | **No pin, no route, no street labels — a featureless grey grid that reads as a failed or still-loading tile layer.** Both pages render the *identical* basemap frame, so the map is not even centred on the destination. | W3 | fatal |
| 390 | `barbershop--390--scroll4.png`, `ferry--390--scroll4.png`, `bakery--390--scroll4.png` | Street labels present but **no pin at all and no route line**. The user cannot tell which building is the next stop. | W3 | fatal |
| 1440 | `mansion--1440--scroll4.png`, `bakery--1440--scroll4.png` | **No route line, no pins, no markers** — only a rotated grayscale basemap. On mansion at 1440 the street labels are absent too. | W3 | fatal |
| all | every chapter page | **There is no route line on any chapter map, at any viewport, ever.** A walking tour whose maps never show the walk. | W3 | fatal |
| 1440 | `barbershop--1440--scroll4.png` | The single pin's label pill top is at y198 against a map top of y195 — **3px from being clipped**. | W5 | major |
| 768/390 | `commissioners-office--768--scroll4.png`, `commissioners-office--390--scroll4.png` | The "3 Gilbert Mansion" pin pill **is clipped flat by the map's top edge**. | W5 | major |
| 1440 | `commissioners-office--1440--scroll4.png` | The pin's leader line and label pill sit **on top of the street label "Washington St"**, making both unreadable. | W5 | minor |
| all | all chapter maps | The Mapbox wordmark is a **light chip with its own radius and its own typeface** on a dark warm-brown page — an unstyled foreign brand mark. The map is static (no zoom, no pan controls), so the page pays the attribution cost with none of the benefit. `bakery--1440--scroll4.png` shows **no "© Mapbox © OpenStreetMap" attribution string at all** — a likely ToS problem on top of the visual one. | W1/W5 | major |

**Type hierarchy (chapter pages):** **13–15 distinct sizes.** Indistinguishable adjacent pairs: H2 ~56px vs pull quote ~58px (identical); body / eyebrow / "Section N/4" all ~17px separated only by weight; footer links 15 / next-stop label 15 / MARK PRIEST 14 / press-and-hold 14 — four different caps styles inside a 1px band but in three different colours.
**Box census:** 7 in one viewport (`barbershop--768--scroll1.png`: audio card, play button, duration pill, progress track, painting A, painting B, hamburger).
**Composition:** Dead, not composed. Specific voids: 384px empty gutter each side of the 1440 map; 285px and 313px of empty left column at scroll3; 165px vs 78px below the same "Section 2/4" label on two pages; 168px void below the 390 ferry image; ~170px of vertical space around a single centred 15px line at `ferry--768--scroll1.png`.
**Glance test:** The unfinished sketch wins every hero. Below the fold at 768 and 390 the **orange hamburger wins nearly every screen** — a menu button is the visual protagonist of a memorial. Nothing wins on any "WHERE TO NEXT?" screen.

### W8 verdict — is the chapter template flagship-worthy?

**No.** Three structural reasons:

1. **It leads with its worst asset and buries its best.** Every chapter opens with a 500–700px black-and-white pen study; the finished, saturated Mark Priest paintings appear only below the fold as double-bordered thumbnails, badly-cropped full-bleed slivers, or 105px bands. On ferry the hero is not legible as an image at all. A flagship leads with the painting.
2. **Nothing is registered to anything else.** Eleven left edges at 1440. An 8px stair-step between every H2 and its own label. A credit chip that is a pill at 1440 and bare text at 768. A fixed 672px map centred inside a left-aligned grid. Two "paired" buttons at 320 and 260px. Nine radii. Seven icon idioms. Individually small; together they are precisely "thrown together" — the page reads as components assembled by different hands on different days.
3. **The one interactive promise it makes, it breaks.** "PRESS AND HOLD TO BRING THE PAINTING TO LIFE" is the concept, and it is the least legible text on the page — clipped by the fold at 1440, ~10px and under a button at 390. Then "WHERE TO NEXT?" — the entire premise of a *walking* memorial — shows a map with no route, and on four of six screens no destination marker at all.

---

## 3. `map`

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| **1440** | **`map--1440--scroll1.png`** | **THE NAMED DEFECT.** The route between stops is a **thin dark-rust dotted line on a near-black basemap** — roughly 1.3:1 contrast, far below any accessibility threshold. On `map--1440.png` it is effectively invisible; it only becomes perceptible at scroll1 where the basemap happens to be lighter. **CONFIRMED, exactly as the client described.** | W3 | fatal |
| 1440/768 | `map--1440--scroll1.png`, `map--768--scroll1.png` | The route is drawn as **straight diagonals cutting across blocks and through buildings — it does not follow streets.** For a *walking* tour this is not just low-contrast, it is functionally wrong. There also appear to be **two parallel dashed tracks** running side by side, which reads as a doubled or overlapping path. | W3 | fatal |
| 768 | `map--768.png` | At the default scroll position **no route line is visible at all** — only five pins floating on a grey map with nothing connecting them. | W3 | fatal |
| **1440 / 390** | **`map--1440.png`, `map--390.png`** | **Pin labels collide and overlap each other.** "2 Commissioner's Office" (x655–860) and "1 Bakery" (x790–878) overlap; the Bakery pill sits on top of the Commissioner's Office pill and covers the end of the word "Office". Same collision at 390 (x158–300 vs x264–320). "5 Barbershop" overlaps the "River St" street label. | W5 | fatal |
| all | `map--1440.png` vs `map--1440--scroll3.png` | **Two naming systems for the same five stops, 600px apart on one page** — short pin names vs full list names, and "Commissioner's Office" vs "OFFICE OF THE COMMISSIONER" is a different grammatical construction, not just a shortening. | W6 | fatal |
| 1440 | `map--1440.png` | The floating stack is **three centred pills of three different widths**: "DRAG TO EXPLORE · TAP A STOP" (302px), then `Take the walk` (139px) and `See Troy in 1860` (151px). | W2 | major |
| 390 | `map--390.png` | The stack is **vertical, centred, and inverted-trapezoidal**: `Take the walk` 136px sits *above* `See Troy in 1860` 154px. The wider button is below the narrower one, so the stack visibly leans. | W2 | fatal |
| all | `map--1440.png` | `Take the walk` is 139×40 here but `Continue the walk` on chapter pages is 320×88. **The same action at 2.3× the size on a different page.** | W2 | major |
| 1440 | `map--1440.png` | "DRAG TO EXPLORE · **TAP** A STOP" — a touch instruction on a 1440 desktop view. | W6 | major |
| all | `map--1440.png`, `map--390.png` | **Four pieces of unstyled light third-party chrome on a dark page**: a white "500 ft" scale bar, a white circular locate-me button, the white Mapbox wordmark, and a white "© Mapbox © OpenStreetMap Improve this map" strip. None is themed; the attribution strip is the brightest object in the bottom-right corner. | W5 | major |
| 390 | `map--390.png` | The hamburger **covers the Mapbox attribution "i" control** (x360–378, y790–810 under a button at x306–378, y760–832). | W5 | major |
| 1440 | `map--1440--scroll1.png` | The map's bottom boundary is not a clean cut — there is a **visible lighter notch/artifact around x448–500** where the canvas ends. | W5 | minor |
| 1440 | `map--1440--scroll1.png` | "THE WALK" eyebrow at x161, "FIVE STOPS THROUGH TROY" at x163 — **the heading is 2px off its own eyebrow**. | W5 | minor |
| 1440 | `map--1440--scroll2.png` | The body measure is ~530px in a 1440 viewport — **750px of dead space to the right of every paragraph**, on every screen. | W4 | major |
| 1440 | `map--1440--scroll4.png` | The chapter list rows are 1120px wide but the content clusters at the left (ends x≈880) with a **19px numeral disc marooned at x1240 and ~350px of empty card between them**. | W4 | major |
| all | `map--1440--scroll4.png` | The list rows have **no arrow, no chevron, no link affordance of any kind** — while the paintings page, people page and chapter footers all use arrows for the identical action. | W1 | major |
| **390** | **`map--390--scroll4.png`** | **The row thumbnails have a different aspect ratio in every row.** Card heights vary with title/subtitle wrap (92 / 106 / 106 / 130 / 106px) and the 96px-wide thumbnail stretches to fill — so row 3's painting is cropped landscape and row 4's is cropped portrait. Five rows, four heights, four crops of five different paintings. | W5 | fatal |
| 390 | `map--390--scroll2.png` | Row 1's subtitle "3rd & Division Streets (vacant lot today)" **runs to the card's right border with zero padding**. | W5 | major |
| 390 | `map--390--scroll4.png` | The hamburger **cuts off row 5's subtitle**: "First Street (Athenaeum buildin[g)]". | W5 | major |
| all | `map--1440--scroll4.png` | The five row subtitles use **five different formats**: parenthetical, em-dash, bare, middot-plus-em-dash, parenthetical. And row 4 exposes an internal production note to the public — "no plaque — website only" — which the intro paragraph 400px above already states ("Four stops carry bronze plaques; the Ferry Landing is remembered here on the website"). | W5/W6 | major |
| all | `map--1440--scroll2.png` | H1 says "FIVE STOPS THROUGH TROY"; the paragraph directly beneath says "**Four** stops carry bronze plaques". Two counts, adjacent. | W6 | minor |
| all | `map--1440.png` | The page has **no header, no title, no wordmark outside the map canvas** — the only page identity is a chip floating inside the map at top-left. | W5 | major |

**Type hierarchy:** ~8 sizes. Pin labels, chip labels, and button labels all land within 2px of each other.
**Box census:** 1440 hero = 8 (title chip, 5 pin pills, instruction pill, 2 buttons, scale bar, locate button, attribution strip, hamburger — 13 counting map chrome).
**Composition:** The full-bleed map hero is the strongest compositional idea on the site. Everything layered on top of it is uncomposed — pins collide, the floating stack overlaps the Ferry Landing marker's leader line, and light third-party chrome punches holes in three corners.
**Glance test:** The pins win at 1440 — correct. But the eye then has nowhere to go, because the thing the pins are supposed to be strung on is invisible.
**Mobile (390):** Pin collision; inverted button stack; attribution under the hamburger; body text under the hamburger at scroll1; ragged card heights and stretched thumbnails; subtitle clipped by the hamburger; subtitle touching its own card border.

---

## 4. `people`

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| all | `people--1440--scroll1.png` | **Fourteen cast cards and not one image.** No portraits for Harriet Tubman, Charles Nalle, Uri Gilbert, Peter Baltimore or Martin Townsend — several of whom are depicted in this site's own Mark Priest paintings. A cast-of-characters page rendered as a wall of text boxes. | W8 | fatal |
| 1440 | `people--1440--scroll1.png` | **21 bordered elements in one viewport** — 6 card boxes, 14 chip pills, the hamburger. The page is a wall of boxes inside a box. | W4 | fatal |
| 1440 | `people--1440.png` | The H1 "ONE DAY. A WHOLE CITY'S CAST.", "THE RESCUERS" and "THE HUNTERS" are **all ~54px caps**. Three co-equal headings; the H1 does not win. | W4 | fatal |
| 1440 | `people--1440.png` | **One type style (~14px orange caps) does four different semantic jobs in a single viewport**: page eyebrow, quote attribution, card role kicker, CTA eyebrow. Adjacent levels are indistinguishable because they are literally identical. | W4 | fatal |
| 1440 | `people--1440--scroll1.png` | The **chip row inside every card is content-width, so it staircases**: "Ch. 1 · Bakery" ≈120px next to "Ch. 2 · Commissioner's Office" ≈214px, wrapping 2-then-3 with row 1 ending at x523 and row 2 at x686. A jagged staircase of pills inside an already-bordered box. This is "the buttons are unbalanced" in its purest form. | W2 | fatal |
| 768 | `people--768.png` | At 768 the Charles Nalle card's five chips **collapse into five separate stacked rows** ~140px tall, making that card ~150px taller than its row-mate. | W2 | fatal |
| 1440 | `people--1440--scroll1.png` | **~70–150px voids sealed inside bordered cards** (Harriet Tubman, Martin Townsend) caused by grid-equalised row heights against ragged copy. Inside a border, a void reads as missing content, not breathing room. | W4 | major |
| 1440 | `people--1440--scroll2.png`, `--scroll4.png` | **Two orphan half-rows**: George Holeur alone leaves a 550×255px hole; Thomas Parr alone leaves ~550×230px. | W4 | major |
| 1440 | `people--1440--scroll1.png` | Harriet Tubman's card body **is verbatim the same quote used as the hero pull quote ~500px above**, re-set as plain body text. Same words, two treatments, one page. | W5 | major |
| 1440 | `people--1440--scroll1.png` | Peter Baltimore's chips are **out of numeric order** — "Ch. 5 · Barbershop →" then "Ch. 2 · Commissioner's Office →" — while every other card ascends. | W5 | major |
| 1440 | `people--1440--scroll1.png` | "Ch. 2 · Commissioner's Office →" appears **5 times in one viewport**; "Ch." appears 14 times. Maximum visual noise, zero information gain. | W4 | major |
| 1440 | `people--1440--scroll4.png` | The page's **primary CTA ("WALK THE ROUTE") is outline-only — the same visual weight as a 28px tertiary chip.** The one action the page wants most has no more emphasis than 22 secondary links. | W2 | fatal |
| 1440 | `people--1440--scroll4.png` | The CTA's arrow is a **~52px, ~3.5px-stroke, solid-headed white SVG arrow**; the 22 chip arrows on the same page are ~10–12px thin text `→`. Two unrelated idioms, ~5× apart in size and ~3× in stroke weight, on one page. | W1 | fatal |
| **390** | **`people--390--scroll1.png`** | Chip labels render at **~11–12px and the `→` degrades to an unreadable "-›" smudge**. This is literally the client's "the arrows look terrible", carrying primary navigation. | W1 | fatal |
| 1440/768/390 | `people--1440.png`, `people--768.png`, `people--390.png` | Three left edges per viewport, because **two sibling boxes use different internal padding** (card 21px, CTA 33px at 1440; 20/32 at 768; 20/24 at 390). | W4 | major |
| 1440 | `people--1440.png` | ~615×370px of dead space right of the hero; the measure is capped at ~665px regardless of viewport, so **43% of a 1440 screen is empty**. | W4 | major |
| 1440 | `people--1440.png` | Section-break gap (63px) is barely larger than the intra-section gap (40px). Vertical rhythm carries no structural information. | W4 | major |
| 1440 | `people--1440.png` | The pull quote's opening curly `"` is **not hung** — the "D" of "Drag" starts ~11px right of the H1's left edge, so the quote block is visibly out of the page's only alignment. | W5 | minor |
| 768/390 | `people--768--scroll1.png` … `--scroll4.png`, `people--390--scroll1.png` … `--scroll4.png` | The hamburger sits on a card corner at **every scroll position at 768 and 390**, and because it shares the cards' orange border and ~16px radius it **reads as a control belonging to that card**. On `people--390--scroll1.png` it lands on "THE GENERAL / HARRIET TUBMAN". | W5 | fatal |
| 768 | `people--768--scroll4.png` | "DEPUTY U.S. MARSHAL / HOLMES" wraps to two lines while "HENRY 'JACK' WALE" is one, so side-by-side cards' body copy starts 29px apart. Cards out of register. | W5 | major |
| all | `people--1440--scroll1.png` | **Three incompatible kicker grammars** in one grid: epithets ("THE GENERAL", "THE BAKER", "THE BADGE"), bare occupations ("SLAVE HUNTER", "VIGILANCE COMMITTEE"), and dot-compounds ("BARBER · UNDERGROUND RAILROAD"). And rank is baked into the *name* field on two cards, so "THE BADGE / DEPUTY U.S. MARSHAL HOLMES" states the role twice and omits a first name. | W6 | major |
| all | `people--1440--scroll1.png` | **No dates on any person.** A historical cast page with zero chronological anchoring. | W6 | major |
| 390 | `people--390.png` | H1 breaks as "ONE DAY." / "A WHOLE" / "CITY'S CAST." — the break splits the noun phrase mid-clause. | W4 | minor |
| all | `people--1440--scroll4.png` | The page ends with **no footer, no nav, no wordmark, no back-to-top**, at any viewport — while chapter pages have a full footer. | W8 | major |

**Type hierarchy:** ~7 sizes, but effectively 3 usable levels because one 14px orange caps style does four jobs and three headings share 54px.
**Box census:** 21 at 1440, ~17 at 768.
**Composition:** Even, airless padding — not composed. The only large voids are the two orphan half-rows and the 615px empty right half, both of which read as unfinished.
**Glance test:** **Nothing wins** at any viewport. Six near-identical bordered boxes with identical internal structure and ~14 small orange chips pulling the eye in 14 directions. At 390 and 768 the highest-contrast object on screen is the hamburger.
**Mobile (390):** Chip arrows illegible at ~11px; hamburger on a card corner at every scroll and destroying "the Gil[bert]" mid-word; CTA still outline-only. No horizontal overflow — the layout survives structurally.

---

## 5. `paintings`

The strongest page on the site at 1440, and the one whose failures are asset-prep rather than layout.

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `paintings--1440--scroll1.png` | The only image for the Gilbert Mansion stop is **a loose, unresolved oil STUDY** — broad flat strokes, no faces, no architecture, no mansion — presented identically to nine finished works with nothing distinguishing it. | W7 | fatal |
| 1440 | `paintings--1440--scroll1.png` | That same asset contains **non-artwork material inside the frame**: a lighting-glare speck at top-centre and a bright vertical strip (studio wall / frame edge) down the right side. It is a snapshot of a canvas, not a flat scan. | W5 | fatal |
| 1440 | `paintings--1440.png` | The "Office of the Commissioner" tile carries a **burned-in watermark, "Mark Priest © 2008"** — the only one of ten that does — and the site prints "Mark Priest · Nalle Series" underneath it anyway, so the credit appears twice on one tile. | W5 | major |
| 1440 | `paintings--1440.png` | **No tone or exposure normalisation across the ten assets.** The yellow-dominant works blow out and the dark-green Ch.3 work sinks into the page, so reading order is set by whichever canvas is yellowest — a secondary tile beats both the H1 and the chapter-1 tile in the glance test. | W5 | fatal |
| 1440 | `paintings--1440--scroll2.png`, `--scroll4.png` | The fixed landscape tile **cover-crops vertical compositions**: "…Barbershop — Narrative I" has its vertical SHERIFF-door composition lopped top and bottom; "…Ferry Landing — Narrative I" and "…Barbershop — Narrative II" are reduced to hands and two prone figures with no landing, no water and no barbershop visible — sitting in the same grid as full compositions of the same subject. | W5 | major |
| 1440 | `paintings--1440.png` | The intro promises "**Select any work to view it closely**" — and there is **no expand affordance anywhere on the page**: no magnifier, no plus, no corner control, no icon. The primary stated interaction is invisible. | W1 | fatal |
| 1440 | `paintings--1440--scroll1.png`, `--scroll3.png` | **Half-implemented baseline alignment**, which is worse than none: the "CHAPTER N →" links stay aligned, but when a title wraps to two lines the credit line drops 34–53px, so the tiles' lower halves are out of register in 3 of 5 rows. | W5 | major |
| 1440 | `paintings--1440--scroll1.png` … `--scroll4.png` | The gap between a title and its own right-pinned "CHAPTER N →" varies from **≈35px to ≈175px**. The relationship between a title and its own link looks different in every single tile. | W4 | major |
| 390 | `paintings--390--scroll4.png` | The gap narrows to **≈19px** where elsewhere it is 32–33px. No minimum gutter is enforced; any longer title collides. | W4 | major |
| all | `paintings--1440.png` | **Zero buttons on the page.** The same action ("go to chapter N") is an outlined pill chip on people and a bare caps text link here. Same action, two components, two sibling pages. | W2 | major |
| 1440 | `paintings--1440--scroll2.png` | The `→` shaft sits at **~40% of cap height** against ALL-CAPS labels — visibly low. It is the same glyph as the people chips at a third size (14 / 11 / 52px across the two pages). | W1 | major |
| all | `paintings--1440--scroll4.png` | Six of the ten chapter links are duplicates (3× CHAPTER 4, 3× CHAPTER 5, 2× CHAPTER 2) with **no grouping, no dividers, no counts, no chapter headers** — ten unrelated tiles hiding a five-chapter structure. | W4 | major |
| all | `paintings--1440.png` | **Two incompatible sub-designation schemes**: Ch.2 uses "— Part 2" (Arabic), Ch.4 and Ch.5 use "— Narrative I / II" (Roman). Each set runs (unnumbered, I, II) rather than (I, II, III), so the first work in every set is unlabelled. | W6 | major |
| 1440 | `paintings--1440.png` | H1 "THE NALLE / SERIES" forces a two-line break leaving "SERIES" alone despite ~1120px of available width. Identical break at 768 and 390 — a hard break or an over-tight max-width. | W4 | major |
| 1440 | `paintings--1440.png` | ~700×120px void beside the intro; section gap (48px) and row gap (31px) are within 17px of each other, so there is no pacing. | W4 | major |
| 1440 | `paintings--1440.png` | "THE PAINTINGS" (page eyebrow) and "CHAPTER 1 →" (repeating tile link) are the **identical ~14px orange caps style** — page-level and item-level type are indistinguishable. | W4 | major |
| all | `paintings--1440.png` vs `people--1440--scroll1.png` | **Two entirely different card systems on two sibling pages**: paintings tiles have no border, no fill, no padding, r≈12; people cards have border + fill + 21px padding, r≈16. Clearest single evidence of a template rather than a design system. | W8 | fatal |
| 768/390 | `paintings--768--scroll3.png`, `paintings--390--scroll4.png` | The hamburger **destroys live navigation links**: "CHAPTE[R 3 →]" and "C[HAPTER 5 →]" (only the "C" survives). At every other scroll it sits directly on the artwork the memorial exists to present. | W5 | fatal |
| 390 | `paintings--390.png` | "Mark Priest · Nalle Series" and "CHAPTER N →" both render **≈12px** — real content and real navigation below the legibility floor, in mid-grey/orange on dark brown. | W4 | major |
| all | `paintings--1440--scroll4.png` | The page ends with **no CTA, no footer, no "return to the walk"** — while the sibling people page *does* end with a CTA. Two sibling pages, two page templates. | W8 | major |
| all | `paintings--1440.png` | Titles are the only sentence-case type on an otherwise all-caps page; "Uri Gilbert Mansion" here vs "URI GILBERT" on people renders the same proper noun in two cases across surfaces. | W6 | minor |

**Type hierarchy:** ~6 sizes. Page eyebrow and tile link are identical; titles and credits are the only clearly separated pair.
**Box census:** **1** at 1440 (the hamburger). This is the least boxy page on the site and it is not a coincidence that it is the best-looking one.
**Composition:** At 1440 this is the one page where whitespace is composed — consistent gutters, one alignment axis (x161 only), and the art carrying the page.
**Glance test:** The "Office of the Commissioner" tile wins on raw chroma — a secondary tile beating both the H1 and the chapter-1 tile. The right thing wins for the wrong reason.
**Mobile (390):** The single-column stack is clean and legible — the only responsive behaviour on the site that *improves* the design. Undermined by ~12px credits and the hamburger eating chapter links.

---

## 6. `about`

| viewport | screenshot file | defect | W# | severity |
|---|---|---|---|---|
| 1440 | `about--1440.png` … `--scroll4.png` | **The right 610px of the viewport — 42% of the screen — is empty on every single screen.** The measure is fixed at ~670px and simply sits in the left half. | W4 | fatal |
| 1440 vs 768 | `about--1440.png` vs `about--768.png` | The measure is **~670px at both 768 and 1440** — the page does not respond between those viewports at all; only the left margin moves (40 → 161). The portraits are 208–210px absolute at both. **This is the signature of a defaulted layout.** | W4 | fatal |
| 1440 | `about--1440.png` | "HOW THE TOUR WORKS" wraps to two lines at 1440 but fits on **one line at 768**. The heading breaks *worse* on the larger screen. | W4 | fatal |
| 1440 | `about--1440.png` | Body runs **~78 characters per line** — over the comfortable maximum — while 610px sits unused beside it. Both problems at once. | W4 | major |
| all | `about--1440.png` | About has **no hero, no image above the fold, no site eyebrow, no chapter badge, no scroll hint — and no footer at all.** It shares neither header nor footer with the chapter template it belongs to. | W8 | fatal |
| 1440 | `about--1440.png` | The entire project credit is a **run-on prose sentence with semicolons** — institution, studio, professor, six students, two artists, two researchers — with no list, no hierarchy, no rules, no grouping. The acknowledgements read as an afterthought. | W4 | major |
| 1440 | `about--1440.png` | Two different **RPI departments** credited for the same project, ~240px apart; "**Jame Lang**" is a near-certain typo in a public credit line; the studio is "Notable Branding & Design" here and "Made by Notable" in every chapter footer; "created in Spring of 2025" is stale on a 2026 site. | W6/W5 | major |
| 1440 | `about--1440--scroll1.png` | Sub-bullets sit at **x196 — exactly the left edge of the parent step text.** The child list is not indented from its parent, so the hierarchy visually collapses into one flat list. At 390 the bullet dot lands **one pixel** off the parent's text edge. | W4 | fatal |
| 1440 | `about--1440--scroll1.png` | Step 4 reads "**Use the map to begin the tour**" — there is no map anywhere on the about page. Step 3 says "scan the QR code on the plaque" — no QR affordance appears anywhere on the chapter template. Step 1 says "Start at the **Memorial Kiosk**" — not one of the five stops and not linked. **The instructions describe a different product than the one being shown.** | W8/W6 | fatal |
| 1440 | `about--1440--scroll1.png` | The Charles Nalle "portrait" is a **210×210px thumbnail in a 1440 viewport**, and it is a crop of a Mark Priest painting **with the subject's raised hand clipped by the frame**. Bad crop, absurd scale. | W5 | fatal |
| all | `about--1440--scroll1.png`, `about--768--scroll3.png` | **Double border on every portrait**: rounded 1px outer stroke, a gap, then the image inside with its own hard square-cornered edge visible at the corners. | W5 | major |
| 1440 | `about--1440--scroll3.png` | The Mark Priest "portrait" is a **casual outdoor snapshot** — white t-shirt, straw hat, canvas propped against a wall. Reads as a placeholder, not a commissioned portrait. | W5 | major |
| 1440 | `about--1440--scroll4.png` | The Scott Christianson image is a **low-resolution composite** with a black-and-white photo of a different man hanging on the wall behind the subject. Reads as scraped. | W5 | major |
| 1440 | `about--1440--scroll3.png` | Straight double quotes around a series title, and **curly** quotes in the pull quote 500px below. Mixed quote glyphs on one page. | W5 | minor |
| 1440 | `about--1440--scroll4.png` | The CTA card is **1120px wide — the only full-width element on a page where everything else is 670px** — and its right edge (1280) matches nothing else. At 768 the same CTA is 687px = exactly the measure. **The card's relationship to the grid changes between viewports.** | W4 | major |
| 1440 | `about--1440--scroll4.png` | The CTA arrow is a **heavy ~50px solid white SVG arrow with a filled triangular head, ~4px shaft** — a completely different arrow from the chapter footers' typographic `→` and the hero's 1px hairline chevron. | W1 | fatal |
| 768 | `about--768--scroll3.png` | Section rhythm is ragged: Charles Nalle = 3 paragraphs / ~24 lines, Mark Priest = 8 lines, Scott Christianson = 6 lines — same header, same 208px square, wildly different block heights, **with no device to absorb the difference**. Heading-to-image gaps are 29 / 33 / 35px — three near-identical but unequal values. | W4/W5 | major |
| all | `about--768.png` | About's gutter is 40px; the chapter template at the same viewport uses 16 / 17 / 24 / 32 / 72. **The two templates share no gutter.** | W5 | major |
| 390 | `about--390--scroll2.png`, `about--390--scroll4.png` | The hamburger (top-right here) **covers six lines of narrative prose across two scroll positions**, including "…resembled each ot[her]" and "Catherine 'Kitty' Simms, who lived [on the]". | W5 | fatal |
| 390 | `about--390--scroll4.png` | A full book citation — "— SCOTT CHRISTIANSON, FREEING CHARLES: THE STRUGGLE TO FREE A SLAVE ON THE EVE OF THE CIVIL WAR, P. 151" — set at **~10px orange caps over two lines**, with the second line orphaned. | W4 | major |
| 390 | `about--390--scroll1.png` | The deep bullet indent forces "The location's / historical significance" to wrap after two words in a 390px viewport. Portraits drop to 123px — too small to read a face — while still carrying the double border. | W4/W5 | major |
| 390 | `about--390--scroll4.png` | The page ends on a card followed by dead space, with **no footer links, no rule, no share row** — all of which the chapter template has at the same viewport. | W8 | major |

**Type hierarchy:** ~7 sizes, but every eyebrow on the page ("OVERVIEW", "FREEDOM SEEKER", "PAINTER & PROFESSOR", "AUTHOR", "THE STREETS ARE WAITING") is ~10–11px at 390 — below 12px.
**Box census:** Sparse, not dense — 4–5 bordered objects per viewport (2 portrait frames counting inner edges, CTA card, hamburger).
**Composition:** Neither composed nor airless — **abandoned**. A fixed 670px column parked in the left half of a 1440 canvas is not a design decision, it is an absent one.
**Glance test:** **Nothing wins.** The most visually salient object on the first screen is the orange hamburger — a utility control out-competing all content, sitting directly beside the H1.

**Does about look designed or defaulted? Defaulted**, and it is measurable: identical measure at 768 and 1440, absolute-sized portraits, a heading that wraps worse on the bigger screen, no hero, no footer, four identical stacks of eyebrow + H2 + tiny square + long paragraph, and instructions for a product with a kiosk, plaques, QR codes and a map — none of which appear on the page.

---

## 7. `404`

Not present. No 404 route was captured and none appears to exist. On a site whose deep links will be printed on physical plaques and QR codes, a missing 404 is a real gap.

---

# Summary — the top 20 defects site-wide

Ranked by how much each contributes to "sloppy and thrown together."

| # | Defect | Evidence file | W# | Severity |
|---|---|---|---|---|
| 1 | **Six to eleven different left edges on a single page** — 48 / 80 / 96 / 97 / 99 / 105 / 107 / 113 / 128 / 216 / 384 at 1440. The 96–107 near-miss cluster is the worst, because a 2px offset reads unambiguously as an accident, never as a system. Nothing on the page is registered to anything else. | `barbershop--1440*.png`, `mansion--1440*.png` | W5 | fatal |
| 2 | **Every chapter hero is an unfinished B&W pen sketch; the finished paintings are buried below the fold** as double-bordered thumbnails, 105px slivers, and unreadable extreme crops. The site leads with the study and hides the art. | `mansion--1440.png`, `ferry--1440.png`, `bakery--1440.png` | W7 | fatal |
| 3 | **The walking-tour route is a dark-rust dotted line on a near-black basemap (~1.3:1)** — invisible at default zoom, drawn as straight diagonals through buildings rather than along streets, and rendered as two overlapping parallel tracks. | `map--1440--scroll1.png`, `map--768--scroll1.png` | W3 | fatal |
| 4 | **The floating hamburger destroys live content on 10+ screens** — eating words mid-string, covering the artist's credit, occluding two navigation links entirely, and sitting on top of the press-and-hold instruction on all five chapter pages at 390. It also moves anchor (top-right on home/about, bottom-right everywhere else) and is the highest-contrast object on most screens. | `people--390--scroll2.png`, `paintings--390--scroll4.png`, `commissioners-office--768--scroll2.png` | W5/W1 | fatal |
| 5 | **Button pairs are unbalanced at every viewport, and at 390 they stack centred at different widths** — 212–214px above 176–180px, a jagged centred stack. Add mixed capitalisation and a "fill" two value steps off the page background, and neither button reads as primary. | `mansion--390--scroll4.png`, `barbershop--390--scroll4.png` | W2 | fatal |
| 6 | **Five columns of body text at a 768px viewport, ~10–14 characters per line, with column 5 clipped off-screen mid-word.** Plus 4-col with an empty column at 1440, and 3-col with an empty first column at 768. | `commissioners-office--768--scroll3.png` | W4/W5 | fatal |
| 7 | **Seven icon idioms and four stroke weights with no shared system** — 1px hairline chevron, ~1.5px text `→`, ~11px illegible `-›`, ~52px solid SVG arrow, stroked play triangle, three sizes of numeral disc, 3px hamburger. This is precisely "the arrows look terrible." | site-wide; `people--1440--scroll4.png`, `about--1440--scroll4.png` | W1 | fatal |
| 8 | **The same five places carry five or six different names each across surfaces** — including "OFFICE OF THE COMMISSIONER" vs "The Law Office" vs "The Mutual Bank Building", and three names for stop 1 inside a single viewport. | `map--1440.png` + `map--1440--scroll3.png`, `barbershop--1440--scroll4.png` | W6 | fatal |
| 9 | **The "WHERE TO NEXT?" map shows no route on any chapter page ever, and no destination marker at all on 4 of 6 screens** — at 768 both barbershop and ferry render the identical featureless grey grid. A walking memorial whose maps never show the walk. | `barbershop--768--scroll4.png`, `ferry--768--scroll4.png` | W3 | fatal |
| 10 | **Pull quotes and section headings are the same object** — both ~48–58px left-aligned white caps with no quote marks and no attribution — while a *second*, completely different pull-quote system (centred, curly quotes, attribution) appears on commissioners-office, and a *third* on about. | `barbershop--1440--scroll3.png` vs `commissioners-office--1440--scroll1.png` | W4 | fatal |
| 11 | **The site's own concept is its least legible text.** "PRESS AND HOLD TO BRING THE PAINTING TO LIFE" is ~14px at 40% opacity on high-frequency crosshatch, wraps to two lines, and is **sliced in half by the fold** at 1440 on all five chapter pages — then becomes a pill chip at 768/390 and drops to ~10px under a button. | `mansion--1440.png`, `barbershop--390.png` | W4/W5 | fatal |
| 12 | **A cast-of-characters page with fourteen people and zero portraits** — 21 bordered boxes in one viewport, three co-equal 54px headings, one 14px orange caps style doing four semantic jobs, and a primary CTA weighted identically to a tertiary chip. Nothing wins the glance test at any viewport. | `people--1440--scroll1.png` | W8/W4 | fatal |
| 13 | **The about page does not respond between 768 and 1440** — identical ~670px measure, absolute-sized 208px portraits, a heading that wraps *worse* on the larger screen, and 42% of the 1440 screen empty on every scroll. Its instructions describe a kiosk, plaques, QR codes and a map that the site does not show. | `about--1440.png`, `about--768.png` | W4/W8 | fatal |
| 14 | **Nine corner radii and four incompatible image treatments coexist** — sketch, oil painting, sharp modern photograph and a near-white archival engraving on one page, at radii of 0 / 8 / 10 / 12 / 14 / 16 / 24 / pill / circle. | `ferry--1440--scroll2.png`, `mansion--1440--scroll2.png` | W5 | major |
| 15 | **The artist's credit chip has no fixed identity** — bordered pill at 1440, bare text at 768/390, bare text at 1440 on commissioners-office, **absent entirely** on bakery at 1440, clipped by the viewport at 768 on mansion, and covered by the hamburger at 768 on commissioners-office. | `barbershop--1440--scroll2.png` vs `barbershop--768--scroll2.png` | W5 | major |
| 16 | **The fake drop cap** — first word set 28–36px inline against 17–19px body on a shared baseline, no sink, no tracking, no wrap. It reads as a font-size rule that failed, and at 768/390 it eats half of line 1. | `mansion--1440--scroll1.png`, `bakery--390--scroll1.png` | W4/W5 | major |
| 17 | **Content duplicated verbatim inside a single viewport** — the Tubman quote twice on commissioners-office, four consecutive paragraphs restating the same fact on bakery/barbershop/ferry, Tubman's card repeating the hero pull quote on people, and a plaque note stated twice on the map page. | `commissioners-office--1440--scroll1.png`, `bakery--768--scroll3.png` | W5 | major |
| 18 | **Double borders on nearly every framed image** — a 1px rounded outer stroke, a visible gap, then the image's own hard square-cornered edge inside it — on chapter paintings, about portraits, and the commissioners-office painting card. | `commissioners-office--1440--scroll1.png`, `about--768--scroll3.png` | W5 | major |
| 19 | **Centred elements sitting directly beside left-aligned ones, with no rule governing which is which** — the audio player, "Tap any paragraph", the map, the next-stop label, the button pair and the pull quote on commissioners-office are all centred inside otherwise left-aligned pages, and a 672px fixed map is centred inside a 1243px left-aligned grid leaving 384px gutters. | `mansion--1440--scroll4.png`, `bakery--768--scroll4.png` | W4 | major |
| 20 | **Asset preparation is inconsistent across the ten paintings** — one burned-in watermark, one photographed-not-scanned canvas with visible studio glare and wall edge, one unresolved oil study standing in as a finished work, no tone normalisation (so the yellowest canvas wins the page), and cover-cropping that guts vertical compositions. At 390 the map page's row thumbnails change aspect ratio row to row. | `paintings--1440--scroll1.png`, `map--390--scroll4.png` | W5/W7 | major |

---

# What is actually GOOD here and must not be lost

1. **The narrative copy.** Kathy Sheehan's prose is the best asset on the site — concrete, unsentimental, well-paced: "A dangerous and infamous slave catcher from Stevensburg, Virginia, hired to drag Charles back south." Do not touch it. Every layout fix should be in service of making this text easier to read, not shorter.

2. **The dark warm-brown palette.** It is correct for the subject and it makes the oil paintings glow. The problem is never the hue — it is the near-zero *value* separation between page background, card fill and border, which is what kills every button, card and route line. Keep the palette; open up the value range.

3. **The full-bleed map hero on `map`.** Landing on an interactive Troy at the walk's true scale is the strongest compositional idea on the site. It just needs a visible route, non-colliding pins, and themed map chrome.

4. **The RESCUERS / HUNTERS split on `people`.** Using moral structure as information architecture is a genuinely strong editorial idea. It is under-designed, not wrong.

5. **The paintings grid at 1440.** One alignment axis (x161 only), one bordered element on the whole page, generous consistent gutters, and the art carrying the page. **This is the only page on the site that demonstrates the design the rest of it should be measured against.** Every other page should be rebuilt toward this restraint.

6. **The 390 single-column paintings stack.** The only responsive behaviour on the site that *improves* the design rather than degrading it.

7. **The Tubman pull quote as the `people` page opener.** Right quote, right place, right scale. (Just stop repeating it verbatim in her own card 500px later.)

8. **Body line-height and measure in the single-column contexts** (390 chapter body, people card copy) — comfortable and correct. The typesetting is only broken where multi-column kicks in.

9. **The chapter "card" device on `home`** — inset rounded frame, image, one clear action. It is the one page where the intended element wins the glance test. The idea is sound; the interior pacing and the right-aligned H1 are what break it.

10. **The concept itself — press and hold to bring the painting to life.** It is a genuinely good idea for a memorial about paintings. It is currently announced in the least legible text on the page and demonstrated on the wrong asset. Fix the hero and the prompt and this becomes the reason people remember the site.
