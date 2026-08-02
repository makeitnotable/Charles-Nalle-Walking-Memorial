# Google Arts & Culture — Storytelling + Information Organization

Benchmark study for CNWM v3. Dimension: **storytelling + IA** (entry doors, story-scroll
pattern, wayfinding, related-content weaving, signposting).

Captured 2026-08-02 with `scripts/shots.mjs` at 390/768/1440:

- Home: `googleac/home--{vp}[--scrollN].png`
- Story ("Claude Monet's Grainstacks"): `googleac/story8QVBOPK2l5sdrg--*.png`
- Subject page (Harriet Tubman entity — she led the Nalle rescue, so this is the
  closest possible analogue): `googleac/entityharriet-tubmanm098yd--*.png`

Prior hypotheses held up: one-subject-many-doors, question-led entry, topical hooks
("Today in history — James Baldwin was born 102 years ago today" was live on capture
day). The predicted weakness also held: relentless organization, near-zero identity.

---

## Named techniques

### 1. Question-led front door

`home--1440.png`, `home--390.png`

The home opens with a plain-text question — "What do you want to discover?" with the
sub-line "Click for a surprise..." — above a fanned deck of category cards (PLACES,
MUSEUMS, ART, GAMES), each a full-bleed image with one giant word on it. The entry
point is phrased as the *visitor's* intent, not the site's inventory. Cards overlap
like a hand of cards, which signals "pick one" rather than "read all."

**CNWM steal:** open the home with a question in the site's voice — "Where did the
rescue happen?" / "Who saved Charles Nalle?" — with the five stops + People +
Paintings + Map as the answer-cards beneath it. Same many-doors shape, but the
question can carry CNWM's voice where GA&C's is generic.

### 2. Content-type eyebrow labels (a visible taxonomy)

`home--390--scroll1.png`, `entityharriet-tubmanm098yd--1440--scroll2.png`,
`story8QVBOPK2l5sdrg--1440--scroll4.png`, `home--1440--scroll4.png`

Every card wears a small caps eyebrow naming its *kind*: ONLINE EXHIBIT, STORY,
Theme, RELATED THEME. Under the title, a second gray line names the source
institution ("National Women's History Museum", "Smithsonian National Museum of
African American History and Culture"). You always know what kind of thing you're
about to open and who it comes from, before you commit a click.

**CNWM steal:** adopt a tiny fixed taxonomy — STOP 1–5 / PERSON / PAINTING / PLACE —
as card eyebrows everywhere (home, related rows, map popovers). With attribution
lines crediting Hart Cluett Museum / painting artist where relevant. Cheap to build,
does most of the wayfinding work on a small site.

### 3. Story-scroll = full-bleed image slides with breathing room

`story8QVBOPK2l5sdrg--1440.png` and `--scroll1/2/3.png`, `--390--scroll1.png`

The story page is a vertical stack of full-viewport painting crops. Three details:
(a) hero = full-bleed artwork + centered title + a *part* subtitle ("Part 1: The
Iconic Subject Considered") — explicit serialization; (b) each image slide carries
its own ⓘ attribution chip top-left, so credits never interrupt the flow; (c) slides
that don't fill the viewport get letterboxed against a blurred extension of the
painting's own edge colors, never plain black/white bars. On mobile the same slides
become image-on-top, caption-panel-below over a soft scrim — text never fights the
artwork.

**CNWM steal:** chapter pages as full-bleed painting-crop slides with Kathy's prose
in fixed caption panels; blur-extend the paintings for letterboxing; per-image ⓘ
credit chips instead of a credits dump. "Stop 2 of 5" as the hero subtitle is the
exact "Part 1" move.

### 4. The zoom-crop essay (one artwork, many crops)

`story8QVBOPK2l5sdrg--1440--scroll1.png` vs `--scroll2.png` vs `--scroll3.png`

The Grainstacks story is largely *the same seven paintings recropped*: wide shot,
then a crop tight enough to show impasto texture, then another painting at another
time of day. Scroll position = camera move. The mobile caption we caught says it
outright: "Organized chronologically, these seven Grainstacks depicting a variety of
atmospheric conditions, viewed together..." — the sequencing logic is *told to the
reader* in the copy.

**CNWM steal:** CNWM's commissioned paintings can each yield 3–4 crops (faces, hands,
the crowd, the wagon) so one painting narrates several beats of a stop. And say the
organizing logic out loud: "The five stops follow the route of April 27, 1860, in
order."

### 5. The related-content ladder (siblings → parent, never a dead end)

`story8QVBOPK2l5sdrg--1440--scroll4.png`

A story never just ends. The exit sequence is: three sibling cards (ONLINE EXHIBIT ×
3, each with institution credit) → an "Explore more" header → a full-width RELATED
THEME banner ("United States of Culture") with a one-line pitch and a single "View
theme" button. Two rungs: lateral (more like this) then upward (the collection this
belongs to).

**CNWM steal:** end every chapter with exactly this ladder — "Next stop" card +
1–2 lateral cards (the People in this scene, the Painting of this scene) → one
upward banner ("Walk the full route" → Map). Five pages, same exit pattern, and
nobody ever hits a bottom-of-page dead end.

### 6. Subject-page spine: portrait → bio → stories → collection → quote

`entityharriet-tubmanm098yd--1440.png`, `--scroll1/2/3/4.png`

The Tubman entity page is a clean template: full-bleed portrait hero → name + one
date fact → share row → 3-line bio truncated with "Read more" → "**2 stories**"
(counted section of narrative cards) → "**Discover this historical figure — 38
items**" masonry of artifacts → and then, after all the librarianship, a huge
centered pull-quote in her own words: "I had reasoned this out in my mind, there was
one of two things I had a right to, liberty or death..." The counts ("2 stories",
"38 items") set expectations honestly; the quote is the only moment the page has a
pulse — and it's the best thing on it.

**CNWM steal:** People page entries as mini-spines: portrait, one hard fact, short
bio, "appears in Stop 2 · Stop 4" chips — and lead or close each person with their
own recorded words where the record has any (Nalle's, Tubman's). Put the quote in,
but put it *first*, not after the inventory: that's where CNWM beats GA&C on soul.

### 7. "Organize by" toggle — two sort orders as storytelling choices

`entityharriet-tubmanm098yd--1440--scroll2.png` (right edge: "Organize by" 🔥/🕐)

The 38-item artifact strip offers exactly two organizations: popularity (flame) or
time (clock), as a one-tap toggle — not a filter panel, a *reframe*. Chronological
turns the same grid into a visual biography.

**CNWM steal:** one toggle, two orders, on Paintings or People: "By stop order" /
"By moment in the day" (the rescue happened over hours — time-of-day order is a
genuinely different story than route order). Skip anything resembling filters.

### 8. Topical hook + embedded story preview on the home

`home--1440--scroll1.png`, `home--1440--scroll2.png`

Two feed moves: (a) "Today in history" — a dated hook tying the collection to the
visitor's *today* (Baldwin's birthday on capture day), with a Learn more link; (b) an
inline story *player* embedded mid-feed ("Now an inspiring culinary story") with
Instagram-style segmented progress bars across the top — you can start the story
without leaving the home.

**CNWM steal:** a dated hook is free for CNWM — "On April 27, 1860..." is permanent,
and around the anniversary it becomes "165 years ago this week." An embedded
first-slide preview of Stop 1 on the home (with a 5-segment progress bar = 5 stops)
would let visitors start walking before they've clicked anything.

---

## Traps to avoid

1. **The nagging overlay.** A "Culture Weekly" signup toast sits over the lower-left
   of *every single capture* — home, story, entity, both viewports — covering
   artwork, captions, and cards, and it retargets by page topic ("Interested in
   Visual arts? / Science? / Sport?"). It photobombs Monet and Tubman alike. CNWM:
   no persistent overlays, period; the QR-arrival audience is one bad toast from
   closing the tab.
2. **Organization without identity.** Home, story, and entity pages are all the same
   white-gray card grammar; nothing looks like it belongs to *this* subject. The one
   humane moment (Tubman's quote) is buried below 38 thumbnails. CNWM must invert
   the ratio: voice first, inventory second — the site should feel like Troy, 1860,
   not like a CMS.
3. **Lazy-load gray/blank below the fold.** `home--1440--scroll4.png` shows the
   "Keep exploring" theme cards as solid gray boxes (images not yet loaded);
   `entityharriet-tubmanm098yd--390--scroll4.png` shows a viewport-tall blank gap
   mid-page on mobile. On a JS-heavy feed this reads as broken during fast scroll.
   CNWM is static Astro — ship real images with width/height set, and keep any
   lazy-loading below the first two viewports.
4. **Infinite doors, no floor plan.** GA&C's home is doors all the way down — no
   sense of how big the site is or where you are in it. Fine at Google scale; fatal
   for a 5-stop walk. CNWM should always show the whole shape ("Stop 2 of 5", all
   five stops visible in nav/map) — smallness is a feature, display it.

## What transfers to CNWM in one line

The shape matches (one subject, many doors: 5 chapters / People / Paintings / Map /
About). Steal the *grammar* — question-led home, typed eyebrow cards, part-numbered
full-bleed story slides with ⓘ credits, the siblings-then-parent exit ladder, counted
sections, one sort toggle — and reject the *tone*: no overlays, identity over
inventory, and put the human voice at the top of the page instead of the bottom.
