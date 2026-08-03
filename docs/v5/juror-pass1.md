# Awwwards Jury — Pass 1

**Site:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
**Reviewed:** 2026-08-02 · Chromium via Playwright · 409 original screenshots at `/tmp/claude-501/juror1/`
**Breakpoints:** 390×844 · 844×390 · 768×1024 · 1024×768 · 1440×900 · 6 scroll depths per route · interaction states captured separately
**Axes:** Design 40% · Usability 30% · Creativity 20% · Content 10%

---

## 1. Scores

| Route | Design (40%) | Usability (30%) | Creativity (20%) | Content (10%) | Weighted |
|---|---|---|---|---|---|
| `/` | 7.5 | 7.0 | 6.0 | 8.5 | **7.15** |
| `/bakery` | 7.5 | 6.5 | 7.0 | 8.5 | **7.20** |
| `/commissioners-office` | 7.5 | 6.5 | 7.0 | 8.5 | **7.20** |
| `/mansion` | 7.5 | 6.5 | 7.0 | 8.5 | **7.20** |
| `/ferry` | 7.0 | 6.5 | 7.0 | 8.5 | **7.00** |
| `/barbershop` | 7.5 | 6.5 | 7.0 | 8.5 | **7.20** |
| `/map` | **5.5** | **5.0** | 7.0 | 7.5 | **5.85** |
| `/people` | 7.5 | 8.0 | **5.5** | 9.0 | **7.40** |
| `/paintings` | 7.0 | **6.0** | **5.5** | 8.0 | **6.50** |
| `/about` | **4.5** | 7.0 | **4.0** | 8.5 | **5.55** |
| `/404` | 6.5 | 8.0 | **5.0** | 8.0 | **6.80** |
| **Mean** | **6.86** | **6.68** | **6.18** | **8.36** | **6.82** |

### Overall: **6.8 / 10**

Bold = below 7 on an axis = a named failure. Six of them, across four routes.

### Per-breakpoint deltas (where a route scores differently by viewport)

| Route | 390×844 | 844×390 | 768×1024 | 1024×768 | 1440×900 |
|---|---|---|---|---|---|
| `/map` | Usability **4.5** — stop labels are suppressed; five anonymous numbered dots on a dark map. Hint pill sits on marker 4. | Usability **3.5** — worst view on the site. Labels suppressed; selected card covers the lower half of the map and hides the selected marker; second card clipped mid-word; marker 5 sliced by the top edge. | Design **5.0** — Mapbox attribution printed straight through the "SEE TROY IN 1860" button. | 5.5 / 5.0 | Design 5.5 — cards clipped at both edges during the guided walk; Mapbox wordmark collides with a street label. |
| `/about` | Design 6.0 — 250px portraits at 348px CSS; softness visible but survivable. Quote still 13 lines. | Design 5.5 | Design 5.0 | Design 4.5 | Design **4.0** — 250px portraits at 828px CSS (3.3×). Quote at 52px × 13 lines, taller than the viewport. |
| `/ferry` | Design **6.0** — archival caption flush to `x=0`, zero left inset, wraps to a two-word orphan line. | 7.0 | 7.0 | 7.0 | 7.5 |
| `/paintings` | Usability 6.5 | Usability **4.5** — dialog caption and Close button clipped below the viewport. | 6.0 | 6.0 | 6.5 |
| `/` and chapters | Burger overlaps the hero card corner at every breakpoint; worst at 844×390 where it sits directly on the painting. | | | | |

---

## 2. Verdict, plainly

**No. This is not award-winning, and I would not shortlist it.**

There is a real site here. The chapter pages are the work of someone who understands editorial typography: the rail-and-measure system, the dark-to-cream section rhythm, the restraint of the hero lockup. The writing is genuinely good — better than most of what crosses this jury. The press-and-hold reveal is a real idea. CLS is 0.0009–0.0043 and pages load in under 520ms, which is more than most nominees manage. Reduced-motion is properly wired: the hero swaps a video for a still, the press-reveal videos stop autoplaying. Focus rings exist and are visible. Those things are worth saying out loud, because they are the parts that were actually finished.

But an award is not given for the finished parts. It is given for a whole, and this whole has three holes I can see from across the room.

**The About page is not done.** Three portraits are served from files named `-800.webp` and `-1440.webp` that are byte-for-byte identical 250×251 thumbnails, and they are rendered at 828×831 on desktop. That is a 3.3× upscale. Set next to razor-sharp Martel body copy, the blur is not subtle — it is the first thing your eye lands on. On the same page a pull quote is set at 52px, centred, and runs thirteen lines. It does not fit in a 900px viewport. It is not a pull quote; it is a wall of display type with the attribution pushed off screen. Either of these alone would cost a nomination.

**The map is the centrepiece and it is the worst page.** Every other route funnels here — "Walk the five stops", "Open the walk", "Take the walk", "Continue the walk" — and the destination is a Mapbox canvas on which the walking route is drawn as straight chords between coordinates. It crosses the Hudson River twice and cuts diagonally through city blocks. On a site whose entire premise is *walk these five stops in Troy*, the line on the map is not a walk. Around it: the Mapbox wordmark printed on top of a street label; the attribution printed through the "SEE TROY IN 1860" button at tablet width; stop cards clipped at both viewport edges with no scroll affordance; a "see Troy in 1860" feature that pastes an ungeoreferenced rectangle over a live modern map with modern street names showing round all four edges; and, at 390 and 844 wide, the stop labels are suppressed entirely so the map reduces to five anonymous orange dots. Then, at the bottom of that page, there is no footer. The primary destination of every call to action on the site is a dead end.

**And the ambition is thin.** Compare the field. `pasqua.it` earns its award because every scroll beat is a composed frame. `artsandculture.google.com` earns it because the interaction *is* the archive. `museos.arteyeducacion.org` invents a spatial language for a collection. `rewildyourself.com` and `marseille.laphase5.com` build worlds you move through. This site, stripped of its subject matter, is: a hero card, five long-form article pages sharing one template, a list of people with no images at all, a gallery grid with a lightbox, an about page, and a map. Two invented interactions in eleven routes — the press-and-hold and the guided fly-through — and both are undercut in execution. The press-and-hold's mid-frame reads as a mis-registered print rather than a transformation, and the instruction pill stays fully opaque over the artwork you are being asked to look at. The fly-through jumps its own control 165px up the screen when you start it.

The subject deserves more than competence, and the writing already reaches higher than the design does. What is here is a good, careful, fast, well-written site with an unfinished About page and a broken map. That is a rejection.

---

## 3. Findings

### P0 — breaks the award case (8)

**P0-1 · About portraits are 250px thumbnails blown up 3.3×**
`/tmp/claude-501/juror1/CROP-about-img.png` · `about__1440x900__s2.png` · **1440×900**
`about-charles-800.webp` and `about-charles-1440.webp` are the same file (md5 `e9d7f5b7…`, 18716 bytes, **250×251**). Same for `about-mark-*` (`628a1cab…`) and `about-scott-*` (`fd3fc5f5…`). The `srcset` advertises `800w` and `1440w` and both entries resolve to a 250px asset. With `sizes="(min-width: 1024px) 52rem"` the browser renders it at **828×831 CSS px**. Brick texture, fabric folds and faces are smeared; there is visible mush in the yellow trousers. Directly beneath sits crisp 20px Martel body copy, which makes the blur unmissable.

**P0-2 · About pull quote is 52px × 13 lines, centred, taller than the viewport**
`about__1440x900__s5.png` · **1440×900**
`--fs-quote: clamp(26px, 3.6vw, 52px)` across `max-width: 54rem`. At 1440 that is 52px over 864px, producing thirteen centred lines that fill more than one 900px screen. The attribution ("— Scott Christianson, *Freeing Charles*, p. 151") is entirely below the fold, so the quote cannot be read as a unit. Centred setting removes the left anchor, so each of the thirteen lines starts at a different x. The quote also contains an inline editorial gloss — "his (Charles Nalle) liberation" — which at 52px reads as a typo.

**P0-3 · The walking route is not a walking route**
`CROP-map-markers.png` · `map__768x1024__s0.png` · `TW-7000.png` · **all breakpoints**
The route polyline is drawn as straight chords between stop coordinates. It crosses the Hudson River twice, cuts diagonally through city blocks and the rail yard, and follows no street. At 1440 it forms a narrow closed "W" of near-parallel tapered wedges that reads as a rendering artifact. The stroke colour (dark brown ≈ `#3A2419`) against the dark Mapbox style (≈ `#2B2B2B`) has almost no contrast — it reads as a shadow, not a path. On a site premised on walking five stops in Troy, the drawn route is factually wrong.

**P0-4 · Painting dialog is clipped below the viewport in landscape**
`STATE-painting-dialog__844x390.png` · **844×390**
`max-h-[94dvh]` (366px) with an inner image at `max-h-[85dvh]` (331px) plus a ~55px caption bar = 386px of content in a 366px box. The caption "Holeur's Fashionable Bakery — Mark Priest" is sliced through the middle and the **Close button is cut off** — only its top half renders. On touch there is no visible way out of the modal.

**P0-5 · Map stop labels are suppressed on phones — five anonymous dots**
`map__390x844__s0.png` · `map__844x390__s0.png` vs `map__768x1024__s0.png` · **390×844 and 844×390**
At 768 and above, markers render as labelled pills ("1 BAKERY", "2 COMMISSIONER'S OFFICE"). At 390×844 **and at 844×390** — which is *wider* than 768 — the labels are dropped and only bare numbered circles remain. The breakpoint logic is inverted against available width. On the phone, where this walking tour will actually be used, the map cannot be read at all.

**P0-6 · The 1860 overlay is an ungeoreferenced rectangle floating on a live modern map**
`STATE-map-1860__1440x900.png` · `CROP-1860-edge.png` · **1440×900**
The historical map is pasted as a hard-edged rounded rectangle over the live Mapbox canvas. Modern street labels — "Hillside Dr", "Bank St", "Madison Ave", "Westervelt Ave", "Broadway", "1st St" — remain visible against all four edges and show *through* the caption. The whole point of a then/now overlay is registration to the present; here there is none. The scale bar still reads "500 ft" while an 1860 survey map is on screen.

**P0-7 · `/map` has no footer — the site's primary destination is a dead end**
`STATE-map-bottom__1440x900.png` · `map__390x844__s5.png` · **all breakpoints**
Confirmed in source: `/people`, `/paintings`, `/404`, `/about` and all five chapters ship `<footer class="sec">`. `/map` ships none. Every CTA on the site points here ("Walk the five stops", "Open the walk", "Take the walk", "Open the map"). Scroll to the bottom of the stop list and the page simply stops — ~170px of empty dark, no onward link, no back-to-top, no credits. The only escape is the burger, which is hidden while scrolling down.

**P0-8 · Chapter hero paintings are cropped through the faces**
`bakery__1440x900__s0.png` vs `STATE-painting-dialog__1440x900.png` · **all breakpoints**
The hero uses `aspect-[3/2]` with `object-cover` on paintings that are not 3:2. On `/bakery` the frame cuts through the heads of both principal figures — the arresting officer's bearded face and Nalle's head are outside the frame. The dialog on `/paintings` shows the same painting whole, which proves the loss. A chapter about a man being seized shows torsos and hands only. Same crop failure on `/mansion` (1440×960 source) and `/barbershop` (1440×960).

---

### P1 — visibly unpolished (26)

**P1-1 · Chapter rail nav fails contrast badly, on both grounds**
`bakery__1440x900__s2.png` · `commish__1440x900__s3.png` · **all breakpoints**
Inactive rail links are 13px at `opacity: 0.42`. On the dark ground: `#FF9770` on `#1D1411` = **2.52:1**. On the cream ground: `#9C4520` on `#F6F3EE` = **1.92:1**. AA requires 4.5:1. These are the in-page navigation for a 9,000px article; on the cream sections they are effectively invisible.

**P1-2 · Mapbox attribution printed through the "SEE TROY IN 1860" button**
`CROP-attr-overlap.png` · `map__768x1024__s0.png` · **768×1024**
"© Mapbox © OpenStreetMap Improve this map" renders on top of the button pill. Both are illegible in the overlap, and the required attribution is partially obscured.

**P1-3 · Mapbox wordmark collides with a street label**
`CROP-map-bottomleft.png` · **1440×900**
The "mapbox" logo at bottom-left is printed directly over the "Parker Rd" label. Both words are unreadable.

**P1-4 · Stop-card strip clipped at both viewport edges with no scroll affordance**
`STATE-map-selected__1440x900.png` · `CROP-tw-cards.png` · `TW-7000.png` · **1440×900, 844×390**
In the selected state the second card runs off the right edge, cutting its arrow and slicing its chapter badge into a half-circle. During the guided walk, cards are clipped at the **left** edge *and* the right simultaneously. There are no dots, arrows, gradients or peek-cues to indicate the strip scrolls.

**P1-5 · Stop cards have mismatched tops and heights**
`CROP-cards-misalign.png` · **1440×900**
The active card is ~197px tall with its top at y=680; the neighbouring card is ~179px with its top at y=705. Their "CHAPTER" eyebrows sit at different y. Whatever the intent (an active-scale effect), at rest it reads as two cards that failed to align.

**P1-6 · Selecting a stop zooms to a 10-ft scale and destroys all context**
`STATE-map-selected__1440x900.png` · `STATE-map-selected__844x390.png` · **1440×900, 844×390**
The scale bar reads "10 ft". One intersection fills the screen; the other four stops are gone. For a walking tour the user needs to know where the stop sits relative to the rest of the route — this shows them a parking lot.

**P1-7 · In landscape the stop card covers half the map and hides the selected marker**
`STATE-map-selected__844x390.png` · **844×390**
The card is ~175px tall in a 390px viewport. The "1 BAKERY" pill is entirely behind it — only its anchor dot survives. The second card is clipped mid-word, leaving two orphan capitals at the frame edge. The Mapbox attribution peeks out between the two cards as a floating fragment reading "OpenStree".

**P1-8 · Adjacent CTAs share no design language**
`CROP-1860-ctas.png` · `map__1440x900__s0.png` · **all breakpoints**
"Take the walk" — solid orange, sentence case, ~46px tall, no icon. "SEE TROY IN 1860" / "BACK TO TODAY" — ghost, ALL CAPS, letterspaced, ~30–40px tall. Different case, tracking, weight, height and radius, sitting 30px apart. Both also break the site's own convention: every other primary button (`Walk the five stops`, `Open the walk`, `Continue the walk`, `Start at the beginning`) carries a trailing arrow icon. These carry none.

**P1-9 · "Stop the walk" jumps position and size, and overlaps the active card**
`TW-0-before.png` vs `TW-7000.png` · **1440×900**
Before: a large pill at (551–716, 820–867), bottom-centre. After activation: a small pill at (653–786, 655–690) floating mid-canvas, 165px higher and visually pinned to nothing, colliding with the top edge of the "Washington Street Ferry Landing" card. The primary control moves out from under the user's cursor the moment they use it.

**P1-10 · Burger button cuts the hero card's rounded corner**
`CROP-home-burger.png` · `bakery__844x390__s0.png` · **all breakpoints, worst at 844×390**
The 72px burger sits on the hero card's top-right corner. The card's border terminates abruptly at the button's left edge and re-emerges below it. The button's own radii (`rounded-tl-xl tr-xl br-xl bl-4xl`) do not relate to the card's corner arc. At 844×390 it sits directly on the painting.

**P1-11 · Burger overlaps the "1 BAKERY" map marker during the guided walk**
`TW-7000.png` · **1440×900**
The marker label is truncated to "1 BA…" where the burger begins at x=1313. Fixed chrome sitting on map content.

**P1-12 · Archival caption flush to `x=0` with no left inset**
`ferry__390x844__s3.png` · **390×844**
"WASHINGTON STREET FERRY LANDING · ARCHIVAL RECORD" begins at x=0, touching the viewport edge, while every other element on the page has a 20px gutter. It wraps to a two-word orphan line ("RECORD"). At 844×390 the same caption is bottom-**right** aligned with a proper inset (`barbershop__844x390__s3.png`) — so the component has two unrelated placements and a zero-margin bug at phone width.

**P1-13 · Archival caption sits on a white building at ~2:1 contrast**
`barbershop__844x390__s3.png` · **844×390, 1024×768**
Orange caption text over the light facade of the archival photograph, with no scrim. Roughly 2:1. Barely readable.

**P1-14 · A 220px unexplained void between the rail and the content column**
`bakery__1440x900__s2.png` · `people__1440x900__s1.png` · **1024×768, 1440×900**
The rail occupies x=136–255; the content column begins at x=477. The gap is 222px of nothing. Worse on `/people`, where two short lines ("(01)" / "THE RESCUERS") sit alone in a 340px column. The body column also fails to align to the h1 above it, which starts at x=136.

**P1-15 · "Press and hold" pill at an eyeballed height, opaque through the hold**
`bakery__1440x900__s2.png` · `STATE-hold-mid__1440x900.png` · **all breakpoints**
The pill sits at 91% of the frame height — not centred, not at a token inset, not aligned to anything. It stays at full opacity throughout the hold, covering the centre-bottom of the artwork the user is being told to look at, and it is the only saturated element on a black-and-white ink drawing.

**P1-16 · Sketch card sits 5px from the next section's edge**
`STATE-hold-mid__1440x900.png` · **1440×900**
The card's bottom border is at y=698; the next section's hard top edge is at y=703. Every other section transition on the site has 100px+ of breathing room.

**P1-17 · Space key activates the press-reveal *and* scrolls the page away from it**
`STATE-pressreveal-keyboard__1440x900.png` · **1440×900**
`.press-reveal` is `role="button" tabindex="0"`. Pressing Space starts the reveal but does not `preventDefault()`, so the page scrolls from y≈1600 to **y=3168**. A keyboard user loses the element the instant they activate it.

**P1-18 · Narration player is not persistent**
`STATE-narr-scrolled-away__390x844.png` · **390×844**
The transport is an inline block in document flow, not sticky. Scroll away and audio keeps playing (verified: `playing: true` at `currentTime` 4.8s) with no pause control anywhere on screen. On a walking tour, where the user scrolls to read while listening, this is the wrong call.

**P1-19 · Map list thumbnails mix monochrome and full colour**
`STATE-map-bottom__1440x900.png` · **all breakpoints**
Stops 01, 04, 05 are black-and-white archival photographs. Stops 02 and 03 are full-colour modern photographs. Five thumbnails in one list, two of which look unprocessed.

**P1-20 · Mid-hold frame reads as a mis-registered print**
`STATE-hold-mid__1440x900.png` · **1440×900**
At ~400ms the sketch and painting are at roughly 50/50 opacity. Because the two images share a composition but not a registration, the result is a muddy ghosted double-image in which neither is legible. The signature interaction's most-seen frame looks like an error.

**P1-21 · Portrait paintings hard-cropped to 3:2 in the gallery grid**
`paintings__1440x900__s4.png` vs `STATE-painting-dialog-last__1440x900.png` · **all breakpoints**
`barbershop/narrative2-800.avif` is 544×816 (2:3) forced into an `aspect-[3/2]` tile. The grid shows a middle slice; the figures are decapitated. The dialog shows the whole work, which confirms the loss.

**P1-22 · Uneven vertical rhythm in the gallery grid**
`paintings__1440x900__s4.png` · **1440×900**
"Washington Street Ferry Landing — Narrative II" runs to two lines; "Peter Baltimore's Barbershop" to one. Their credit lines land 35px apart, and the gap below the one-line card (110px) does not match the gap below the two-line card (75px).

**P1-23 · `/404` has a 130px unexplained gap between h1 and body copy**
`404__1440x900__s0.png` · **1440×900**
The heading ends at y=330; the paragraph begins at y=470. Nothing occupies the space. It reads as a component that failed to render. The page then leaves ~250px of empty ground and pushes the footer 136px below the fold.

**P1-24 · Dialog backdrop leaves underlying headings legible and clipped mid-word**
`STATE-painting-dialog__1440x900.png` · `STATE-painting-dialog-last__1440x900.png` · **1440×900**
At `backdrop:bg-black/88` the page beneath stays readable in the dialog's gutters, producing a column of orphaned single letters ("R", "T", "W") sliced by the dialog edge. In the last-painting dialog the *same painting* is simultaneously visible in the grid behind the modal.

**P1-25 · Clipped map-control icons at the viewport edges**
`CROP-map-rightedge.png` · `map__844x390__s0.png` · **844×390, 1440×900**
Small bordered square icons render half-cut at the right edge (≈x=1425, y=450 and y=478 at 1440), the left edge and the top. They read as broken chrome.

**P1-26 · Map chrome sits at five different insets along the bottom edge**
`map__1440x900__s0.png` · **1440×900**
Scale bar left edge x=62; geolocate button x=57; Mapbox wordmark x=50. Vertically: scale y=752, hint pill y=755, attribution y=834, buttons y=844, wordmark y=837. Nothing shares a baseline or a gutter; the 3px offset between the scale bar and the hint pill reads as a misalignment rather than a decision.

---

### P2 — detail (19)

**P2-1** · `<img id="painting-dialog-img" src="">` in the `/paintings` dialog — an empty `src` makes the browser re-request the page HTML on every load. `/paintings` source · all breakpoints.
**P2-2** · Ten identical "Mark Priest · Nalle Series" credit lines down `/paintings`. `paintings__1440x900__s1.png`.
**P2-3** · "STOP 2 · COMMISSIONER'S OFFICE →" appears three times in a single 1440×900 screen on `/people`. `people__1440x900__s1.png`.
**P2-4** · `/people` contains **zero images** — fourteen historical figures, no faces, no artefacts. `recon.json` confirms an empty `imgs` array. A missed opportunity on the page with the best writing on the site.
**P2-5** · The dialog plays a looping video and hides the still (`imgHidden: true`, `vidPaused: false`). The button's own label says "View '…' closely" and the intro copy says "Select any work to view it closely" — you cannot view the still painting at size anywhere on the site. `STATE-painting-dialog__1440x900.png`.
**P2-6** · On a `/paintings` tile the largest, most obvious target — the title — is dead text; the only navigation is a 60px "STOP n →" link above it. `paintings__1440x900__s1.png`.
**P2-7** · The menu panel's close control is a full-width bar across the top with a centred ×, in a lighter tone than the panel body — reads as a collapse handle, not a close. "HOME" is styled like the bottom link group but sits alone at the top and, unlike them, has no arrow. `STATE-menu-open__1440x900.png`.
**P2-8** · `/` is a single non-scrolling screen (`scrollHeight` = viewport height at every breakpoint) with one CTA, no scroll cue, no preview of what is inside.
**P2-9** · Console warnings on `/map`: four × `GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels`. `recon.json`.
**P2-10** · `net::ERR_ABORTED` on every chapter's narration `.mp3` during preload (audio does play on demand). `recon.json`.
**P2-11** · `/404` returns HTTP **200**.
**P2-12** · The top chapter progress bar is a 4px hairline flush to y=0 in a colour close to the page ground — at 1440 it reads as a rendering artifact rather than a progress indicator. `CROP-progressbar.png`.
**P2-13** · "CANAL AVE" renders twice in one view in two different type styles. `TW-7000.png`, 1440×900.
**P2-14** · Mapbox attribution links are 16px tall at 11px type — below the 24px minimum tap target. `audit.json`, all breakpoints.
**P2-15** · The three `/about` portraits are a painting, a colour photograph and a black-and-white photograph, presented in identical square frames with no unifying treatment. `about__390x844__s2/s4.png`.
**P2-16** · The `/about` Charles Nalle artwork is uncaptioned and uncredited, on a site where every other Priest painting carries "Mark Priest · Nalle Series".
**P2-17** · "DRAG TO EXPLORE · **TAP** A STOP" is served to desktop pointer users unchanged. `map__1440x900__s0.png`.
**P2-18** · Duplicate street labels at the selected-stop zoom ("Division" and "Division St" within 200px). `STATE-map-selected__844x390.png`.
**P2-19** · The burger is the site's only global navigation and it hides on scroll-down (`opacity: 0; pointer-events: none`, returning on scroll-up). The pattern itself is legitimate and correctly implemented — but combined with P0-7 it means the bottom of `/map` has no navigation of any kind in either the document or the chrome.

---

## 4. What was checked and found sound

Recorded so the next pass does not re-litigate it.

- **No horizontal overflow** at any of the five breakpoints on any of the eleven routes (`audit.json`).
- **Layout shift is excellent**: CLS 0.0009 (`/map`), 0.0013 (`/`), 0.0033 (`/paintings`), 0.0043 (`/bakery`).
- **Load is fast**: DOMContentLoaded 226–470ms, full load 251–512ms, 507KB–2.1MB transferred.
- **No JavaScript errors** on any route.
- **Reduced motion is properly handled**: the hero swaps `splash.mp4` for a still (`motion-reduce:block`), press-reveal videos do not autoplay, and the dialog serves the still image instead of the video.
- **Focus rings are present and visible** everywhere: `2px solid rgb(242,104,53)` at `3px` offset. A skip link is first in tab order on every route.
- **The press-and-hold is keyboard operable** — both Enter and Space start the reveal (see P1-17 for the Space-scroll bug).
- **The guided fly-through works.** "Take the walk" is a real feature: it flies the camera stop to stop, advances the card strip and relabels itself "Stop the walk". It is the most ambitious idea on the site and deserves to be fixed rather than removed.
- **Tap targets** are compliant everywhere except third-party Mapbox attribution links.
- `lang="en"`, unique `<title>` and `<meta name="description">` on all eleven routes.
