# v5 REVIEW GUIDE — what changed, and where it actually stands

**Live:** https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

**Read this first: the run did not clear the bar you set.** An independent
adversarial juror — a fresh agent with no knowledge of the build, given only the
live URL and told to look for reasons to score low — scored the site **6.8/10**
and said it would not shortlist it. The bar was ≥8 on every axis with two clean
consecutive passes. That has not happened. What follows is what did change, what
the juror found, and exactly what is left.

---

## 1 · Your four defects, and the number that closes each

You named four. All four were real, all four turned out to be classes rather
than instances, and all four are now closed by measurement rather than opinion.

| You said | What it actually was | Proof it is closed |
|---|---|---|
| **Header type is way too big** | The display role *sized itself from string length*, so one role rendered at **six different sizes** across the site — and because longer names clamp harder, the Ferry Landing, the climax of the story, got the **smallest** moral headline. The chapter H1 ran 116px × 3 lines: 37% of a 900px screen. | Display now renders **one size per breakpoint** — 88px at 1440, 64px at 768 and 1024. The advance constant behind the clamp was a guess (0.64); measuring all 26 display strings gives 0.546–0.763em per character, so it is a *guard* now, not the size. |
| **The same painting three times on a chapter page** | Confirmed at every viewport: hero → press-reveal → full-bleed interlude, all the same canvas. Plus the moral painting **twice inside one section** (background + a 220px thumbnail, both on screen at once), and every map stop's crop twice. | `probe.md` repeated-imagery table is **empty**, every route, every viewport. The painting now appears exactly twice: the hero, and the resolution of the press-and-hold — which is the point of that interaction. |
| **The menu is broken: buttons overlap buttons** | Specifically the map. Opening the menu covered the map's own markers, sliced "GILBERT HOME" in half at 768, clipped its own "COMMISSIONER'S" label off the edge of the screen, and at 844×390 covered the entire stage. Three of five marker labels were already clipped before anything opened. | **110 interaction states captured · 0 collisions** — including menu open *while* narration is playing, and a map stop selected under an open menu. |
| **Layout is plain sloppy** | The burger sat 124px outside the content's right edge on every 1440 page. The footer reserved 112px for a menu that lives at the *top*. Mapbox's controls were on nobody's grid. | One `--ui-inset` for every floating element, on the same gutter the content uses. Declared lanes, one owner each. |

**The one that explains the most, which you felt but did not name:** every
chapter's section gaps measured `200, 200, 200, 200, 400, 200, 200`. Six
sections, one interval, five identical chapters. The spacing token had been
applied uniformly and *correctly*, and the correctness is what made it read
mechanical. It is composed now — `128, 200, 0, 0, 128, 400, 200`: the story
starts close after the hero, the painting lands hard against the sketch, the
cream register cuts in with no gap at all, the moral lands *on* the history
rather than after a pause.

---

## 2 · The other things worth knowing

**Your chapter hero was cut off by the fold on every screen but a portrait
phone** — by 87px at 768, 107 at 1024, 100 at 1440, and 256 on a phone held
sideways. The header declared itself one viewport tall while its contents summed
to about 112% of one. The painting — the reason the site exists — was being
introduced as a sliced strip. It fits everywhere now, and occupies 46–65% of the
first screen.

**A phone held sideways was being handed desktop type**, because the breakpoints
asked about width only and a landscape phone is 844px wide. That hero is now a
two-column reframe rather than a squeeze — the pasqua lesson that
`docs/INSPIRATION.md` had named and the build had never taken.

**The prose was saying everything twice.** In all five chapters, `portal.history`
ran four paragraphs where the fourth restated the first three in different words,
sitting directly under the numbered facts that already carried several of them.
It is two paragraphs now, 4,064 → 1,531 characters. **Every distinct fact
survives** and Kathy's corrected wording wins wherever two phrasings co-existed —
the Ferry said "helped onto a **boat**" in one paragraph and the approved
"boarded a waiting **skiff**" in another; only the skiff remains. Nothing was
added or invented. The whole pass is logged line by line in
`docs/CONTENT-STATUS.md` so you can read it against git.

All six moral call-to-action headings read "Make a Difference"; they are one per
chapter now, in that chapter's voice. Body text untouched.

**The front door had no subject.** The photograph sat at 50% opacity under
grayscale, a 0.6 brightness filter and a scrim — you could not tell what you were
looking at. The copy described the deliverable ("a digital physical experience")
rather than the story, in the smallest type on the page, at the very bottom. The
CTA said "Continue". It now leads with April 27 1860, says what happened, and
the button says *Walk the five stops*.

---

## 3 · What the juror found that I had missed

This is the part worth your attention, because it is where my own audit was
wrong.

- **The walking route was not a walk.** It was drawn by interpolating between
  coordinates — four straight chords that crossed the Hudson twice, cut through
  city blocks and the rail yard, and followed no street. On a walking memorial
  that is a factual error, not a styling one. I looked straight at it in the
  audit, called it "honest cartography", and moved on. It is now real Mapbox
  Directions walking geometry, committed to `src/data/route.json` and
  regenerable with `node scripts/build-route.mjs` if a plaque ever moves. It
  also told us the walk is **2.5 miles and about 45 minutes**, which the map now
  says out loud.
- **The three About portraits are 250×251 files.** `-800` and `-1440` are the
  same bytes under different names, and the browser was painting them at 828px —
  a 3.3× upscale next to razor-sharp body type. They render at their real size
  now. **If you have higher-resolution originals, they belong here.**
- **The About closing quote** was 52px over 864px: thirteen centred lines,
  taller than the screen, attribution below the fold.
- **`/map` had no footer at all** — the destination of every call to action on
  the site was a dead end.
- **Hero paintings were cropped through the faces.** The band is 2.84:1, the
  canvases are exactly 3:2, so 47% of the height is discarded — and at the
  default centre that cut ran through the principal figures. Each chapter now
  carries a focal point read off its own canvas.

---

## 4 · What is still open

Full detail with screenshots: **`docs/v5/juror-pass1.md`**. Summary:

**Three P0s:**
1. The painting dialog's caption and Close button are clipped off-screen on a
   landscape phone.
2. Map stop labels are suppressed on phones — five anonymous numbered dots. My
   fix for the *clipped* labels traded clipping for anonymity, which the juror
   rightly called a usability failure. It needs a third answer.
3. The "See Troy in 1860" overlay is an ungeoreferenced rectangle floating on a
   live modern map, with modern street names showing round all four edges. This
   needs either real corner coordinates for the 1860 map, or re-presenting it as
   a "then" view instead of an overlay — **a design decision, and one I would
   rather you made.**

**26 P1s and 19 P2s**, itemised in the juror report. The heaviest cluster is the
map; the second is press-reveal detail.

---

## 5 · Only you can do these

- **Kathy Sheehan's read** on the two rewritten portal paragraphs per chapter
  and the five new sketch notes (all logged in `docs/CONTENT-STATUS.md`).
- **Higher-resolution About portraits**, if they exist.
- **A decision on the 1860 map overlay** (P0-6 above).
- Everything already queued in `docs/v4/REVIEW-GUIDE.md` §6 is unchanged: Brian's
  plaque typo before casting, Amanda's `hartcluett.org/nalle/*` redirects, the
  Ferry skiff narrative rewrite, the Ch2a/Ch4 audio re-records, the Athenaeum
  image, and the "painted by Mark Priest" attribution on the 1860 map.

---

## 6 · How to check any of this yourself

```bash
node scripts/probe.mjs docs/v5/qa/check --base http://localhost:4321
```

`probe.mjs` is a ruler, not a camera: rendered px per heading, every fixed
element's rect and each pair that overlaps, every painted image resolved through
`<picture>` so the same artwork under two filenames still counts as a repeat,
CLS, overflow, sub-24px targets, console noise. `states.mjs` photographs the 110
interaction states and re-measures collisions in each. `census.mjs` is the type
and rhythm ladder. `shots.mjs` is the plain screenshot matrix.
