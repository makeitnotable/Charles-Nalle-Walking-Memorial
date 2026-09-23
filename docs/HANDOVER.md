# Charles Nalle Walking Memorial — Handover Documentation

**For:** Rensselaer County Historical Society / Hart Cluett Museum, Troy NY
**From:** Notable / WBM Enterprises
**Version:** 1.4 · 22 September 2026

This is the museum's operating manual for the memorial website. It is written
for a non-technical reader. Nothing in it requires knowing how to code.

> **Contract note.** Documentation is a required deliverable under §1.2.4 of the
> project contract. This document satisfies it. Ownership of all work product
> transferred to the museum when the invoice was paid in full on 9 August 2024
> (§2.1); the transfer steps in §6 put that into practice.

---

## 1 · What exists

| Thing | Where it lives | Who owns it today |
|---|---|---|
| **The website** | `makeitnotable/Charles-Nalle-Walking-Memorial`, branch `main` — the only branch; every build round and the retired 2024 app remain in its history | Notable → **museum at handoff** |
| **Live address** | `makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` | GitHub Pages, free |
| **Plaque addresses** | `hartcluett.org/nalle/*` | **The museum, permanently** |
| **The map style** | Mapbox account `hartcluettmuseum` (style and public token) | **The museum** |
| **The four QR codes** | `Week 0 Deliverables/QR Codes/` (SVG + PNG) | Museum |
| **Source paintings, audio, photographs** | `public/media/`, `public/audio/` in the repository | Museum |

There is **no server, no database, no login, and no subscription.** The site is
a set of static files. This is deliberate: zero ongoing cost was a hard
requirement, and it is the reason the site can outlive any particular vendor.

---

## 2 · How the plaques reach the website

This is the most important thing in this document.

```
Visitor scans the bronze plaque
          ↓
hartcluett.org/nalle/bakery          ← museum-owned address, cast in bronze
          ↓
[ one redirect line in Squarespace ]  ← the museum controls this
          ↓
The story chapter for that location
```

The bronze **never** contains the website's own address. If it did, the plaques
would be permanently welded to whichever account hosts the site, and the day
that account moved or lapsed, every plaque in Troy would become a dead link
fixable only by recasting bronze.

Instead the museum owns the address in the middle. **The website can move, be
rebuilt, or change hands forever and the plaques never change** — the museum
edits one line of text.

### The four codes

| Plaque | Cast into the bronze | Goes to |
|---|---|---|
| Bakery | `hartcluett.org/nalle/bakery` | Chapter 1 |
| Commissioner's Office | `hartcluett.org/nalle/commissioners-office` | Chapter 2 |
| Uri Gilbert Home | `hartcluett.org/nalle/mansion` | Chapter 3 |
| Barbershop | `hartcluett.org/nalle/barbershop` | Chapter 5 |

The Ferry Landing has no plaque (the waterfront was judged unsafe to direct
visitors to) but `hartcluett.org/nalle/ferry` is mapped anyway so the chapter
has a permanent museum-owned address.

QR specification: **error correction level H** — readable with up to 30% of the
code damaged, chosen for cast relief and patina — with a quiet border. Vector
artwork for fabrication, high-resolution PNG for proofing.

### How to change where a plaque points

1. Log in to the Hart Cluett Squarespace account.
2. **Settings → Developer Tools → URL Mappings** (older versions: Settings →
   Advanced → URL Mappings).
3. Edit the destination on the right-hand side of the `->` arrow.
4. Save. The change is live immediately.
5. Scan a physical plaque to confirm — on cellular data, not office wi-fi.

The current lines are in §7. Keep the `302` on the end: it means "temporary,"
which is what lets the destination be changed again later.

---

## 3 · How to change what the website says

All story content lives in five plain-text files, one per chapter:

```
src/content/chapters/bakery.json
src/content/chapters/commissioners-office.json
src/content/chapters/mansion.json
src/content/chapters/ferry.json
src/content/chapters/barbershop.json
```

They can be edited directly in the GitHub website — no software to install.
Open the file, click the pencil icon, make the change, and commit. **The site
rebuilds and republishes itself within about two minutes.**

### What the fields mean

| Field | What it controls |
|---|---|
| `name.canonical` | The full place name — page titles, cards, the People page |
| `name.display` | The big name on the chapter's opening screen (`\n` = line break) |
| `name.short` | The word cast in bronze — map pills, menu |
| `scenes[].paragraphs` | The narrative read aloud and shown as the transcript |
| `scenes[].quote` | The pull-quote that opens the scene |
| `historicalContext` | The numbered facts in the cream section |
| `portal.history` | The prose paragraphs below those facts |
| `morals[]` | The theme section: title, message, and call to action |
| `sketchNote` | The line beside Mark Priest's study |
| `map.address` | The street address shown on the map index |

### Two rules

1. **Narrative text is the museum historian's domain.** No story prose changes
   without a documented correction from Kathy Sheehan. Corrections are logged in
   `docs/CONTENT-STATUS.md` — keep that habit; it is the only record of why any
   sentence reads the way it does.
2. **If you change words that are spoken aloud, the recording no longer
   matches.** The transcript highlights word-by-word against the audio. Changing
   narration text without re-recording leaves the words on screen contradicting
   the narrator — this has already happened twice on this project and both are
   still open (Chapter 2's "Liberty Street" bells, Chapter 4's river leap).

### Changing images

Images live in `public/media/<chapter>/`. Each one exists in several sizes and
formats, generated by `scripts/build-media.mjs` from a single source file. Do
not hand-edit the generated files — replace the source and re-run the script.

---

## 4 · What the site is made of

| Layer | Choice | Why |
|---|---|---|
| Site generator | Astro 7 | Produces plain HTML files; no server needed |
| Styling | Tailwind 4 | |
| Interactive parts | React 19 | Only the map, the audio player and the 3-D gallery |
| Animation | GSAP | |
| Map | Mapbox GL JS | The only third-party service the site depends on |
| Hosting | GitHub Pages | Free, permanent, no account renewals |
| Publishing | GitHub Actions | Every commit to `main` rebuilds and republishes |

**Mapbox is the one external dependency with an account attached.** Its free
tier is far above anything this site will use, but it is the one thing that
could bill if the site's traffic ever became enormous. Everything else is
static files served for free.

### Working on it locally

```bash
npm install
npm run dev      # preview at localhost:4321 (seeds .env from .env.production)
npm run build    # produce the publishable files
npm run check    # type-check
```

The build guards itself: `npm run build` runs `astro build` and then
`scripts/check-css.mjs`, six checks on the interactive islands' CSS that fail
the deploy if a rule is missing. The remaining scripts in `scripts/` regenerate
assets: `build-favicon.mjs` (the CN mark and icon set), `build-og.mjs` (the
social preview image), `build-media.mjs`, `build-posters.mjs`,
`build-studies.mjs`, `build-thumb-tier.mjs`, `build-1858-tier.mjs` and
`build-edge-colors.mjs` (paintings, stills and films from `masters/`),
`build-route.mjs` (the walking route from Mapbox Directions) and
`audio-timings.mjs` (the narration's paragraph timings). The QA instruments
used during the build (Lighthouse runs, screenshot matrices, phone-bar
probes) were retired from the repository at the handover clean-up on 23
September 2026; they remain in git history before that date.

---

## 5 · Accessibility and performance commitments

The site scores **100/100 for accessibility on every page**, with zero
colour-contrast failures. That is a standard to hold, not a trophy — anything
added later should be re-measured with Lighthouse (in Chrome: DevTools →
Lighthouse → Mobile) against the published site.

Specifically maintained:

- Every animation has a reduced-motion variant
- Keyboard reaches everything; focus is always visible
- Works at 375px wide; tap targets ≥ 24px
- Every chapter is available as audio with a synchronised transcript
- The 3-D gallery has a full screen-reader and no-JavaScript equivalent
- The map page has a complete typographic index that works with JavaScript off

**Performance budget:** Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility,
main content within 2.5 seconds. Four of five pages meet it comfortably. The
map page does not — see §8.

---

## 6 · Transferring ownership to the museum

Do these in order. None of them cost anything.

1. **Museum creates a free GitHub account** for the organisation.
2. **Notable transfers the repository** to that account
   (Settings → General → Transfer ownership).
3. **Museum enables GitHub Pages** from the `main` branch (Settings → Pages →
   Source: GitHub Actions). The site's public address
   changes to `<museum-account>.github.io/Charles-Nalle-Walking-Memorial/`.
4. **Museum creates a free Mapbox account.** Notable copies the custom map style
   across and the museum issues its own public token.
   - The style is currently an **unpublished draft** on the `wbmdesign` account.
     It must be published before it can be moved.
   - The token is referenced in two places: `src/components/TroyMap.tsx` and
     `src/components/EmbedMap.tsx`. Both need the new one.
   - Mapbox public tokens (`pk.…`) are safe to commit — they are designed to be
     visible in a web page. The existing one is committed deliberately.
5. **Notable sends the museum six replacement redirect lines** for the new
   address. The museum pastes them in Squarespace. *The bronze is not touched.*
6. **Re-scan all four physical plaque codes** on cellular data to confirm the
   whole chain still works end to end.
7. **Confirm in writing that ongoing cost is zero.**

---

## 7 · Current redirect lines

Verified returning 200 on 7 August 2026:

```
/nalle -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ 302
/nalle/bakery -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/bakery 302
/nalle/commissioners-office -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/commissioners-office 302
/nalle/mansion -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/mansion 302
/nalle/barbershop -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/barbershop 302
/nalle/ferry -> https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/ferry 302
```

The superseded 2024 prototype that used to be served at
`charles-nalle-walking-memorial.vercel.app` was deleted on 23 September 2026.
GitHub Pages is the site's only host.

⚠️ **Use these exact chapter names.** The older names `/commissioner1` and
`/barber` return "page not found" on the current host.

---

## 8 · Known open items at handover

Stated plainly so nobody inherits a surprise.

| Item | Detail |
|---|---|
| **The map page is slow** | 2.0 MB and several seconds to become interactive on a phone. The mapping engine alone is 486 KB and roughly 12 seconds of processing on a throttled mobile profile. Optimised on 7 Aug 2026 (see the changelog below); the remaining fix is a product decision — show a still image of the route and load the interactive map on tap. The four plaque chapters do not go through this page. |
| **Two recordings contradict the corrected text** | Chapter 2 Part 1 says "Liberty Street" (should be Second Street Presbyterian); Chapter 4 describes the river leap (should be the waiting skiff). Text and audio must be corrected together. |
| **Kathy Sheehan's corrections are incomplete** | 5 of 16 fully applied, 4 partial, 6 open. Tracked in `docs/CONTENT-STATUS.md`. She twice offered a further pass that never arrived — assume the list is not final. |
| **Two images were never delivered** | The Athenaeum building and a portrait of Peter Baltimore. Before commissioning scans, show Kathy the photographs already on Chapters 4 and 5 — they may already be the images she meant. |
| **Ch2 Part 2's study has no caption** | The second theme section now renders (7 Aug 2026); its drawing needs one authored line. See `docs/CONTENT-STATUS.md`. |
| **Condensed prose is unread by the historian** | The chapter summaries were shortened from four paragraphs to two during the rebuild. Every fact was preserved, but the sentences are newly written and Kathy has not read them. |
| **The plaque typo** | The Commissioner's Office proof reads "THIS BUILDING ONCE HOUSE THE" — must be "ONCE HOUSED THE". Confirm with Brian Tolle whether any bronze has already been cast. |
| **Trailing slashes 404** | `/bakery` works, `/bakery/` does not. The QR chain carries no trailing slash so no plaque is affected. |
| **`/styleguide` is publicly reachable** | An internal design proof sheet. Now marked "do not index" so it stays out of search results; it is not linked from anywhere. |
| **Phone behaviour was proven on two phones** | Every Safari behaviour in this document — the glass address bar and toolbar, the Paintings hall and its drawer, the map's lens — was verified on Wil's iPhone (iOS 26, Safari, the "Top" address-bar layout), and the margin the site keeps above Android's swipe-up gesture bar (22 September, the changelog below) on his Google Pixel 6 in Chrome. Other iPhones, Safari's compact layout, other Android phones and tablets with a gesture bar are expected to behave the same but were not measured; Android phones with three-button navigation and desktop browsers draw no bar over the page and take the plain layout, which the automated checks cover. If a reader reports something different on their phone, `docs/PLAYBOOK-MOBILE-CHROME.md` records what was measured and how. |

---

## 9 · Who to contact

| Role | Person |
|---|---|
| Historical authority — all story content | Kathy Sheehan, Hart Cluett |
| Museum administration, hosting, Squarespace | Amanda Irwin, Hart Cluett |
| Artist, plaque design and placement | Brian Tolle, Brian Tolle Studio |
| Plaque fabrication | Matt Crane, Silver Crane LLC |
| Website design and build | Wil Bayne, Notable / WBM Enterprises |
| Paintings and studies | Mark Priest (Nalle Series) |

---

## 10 · Changelog

*Entries below cite the per-round records (`docs/rounds/…`), the QA
instruments (`npm run qa:…`), earlier reports (`docs/v7/…`) and the `v2` and
`release/2026-09-22` branches. All of that was folded into `main` or retired at
the handover clean-up on 23 September 2026; it stays in the repository's git
history before that date.*

**23 September 2026 — the floating play/pause control; the repository reduced to essentials (client round 45)**

*Signed off 23 September 2026 by Wil Bayne after a review of the whole site on several devices and screen sizes: "As of right now I approve everything and feel like this project is done and ready to ship." The live site at this date is the shipped version.*

On phones and tablets the small play/pause pill that follows you down a
chapter now sits centred at the bottom of the screen, where the map page's
"Take the walk" button sits, and the whole pill responds to a tap — not only
the orange circle. On desktops it stays in the bottom-left corner as before.

The same day the repository was prepared for the transfer: `main` is now the
only branch (the `v2` working branch, the release marker and 47 build-round
and archive branches were folded into it), and the build rounds' records, QA
screenshots and instruments were removed from the working tree. Nothing on the
site changed.

**22 September 2026 — the chapter pages under Safari's bars (client rounds 23 and 38–44; signed off 22 Sep: "the way everything works on the bakery page is how it should work on every chapter page … this is done")**

The five chapter pages — Bakery, Commissioner, Mansion, Ferry, Barbershop —
were reviewed on Wil's iPhone under the new Safari, whose address bar and
toolbar are glass over the page. What he asked for, and what shipped:

- **The area behind the address bar is a solid colour, the colour of the
  section on screen, changing as you scroll.** Safari paints that area from
  the page's background, so the page keeps its background set to the colour
  of whatever section is at the top of the screen. On the phone the page
  scrolls a plain runway of that colour underneath the chapter, which is
  drawn on top of it and moved with your finger; that is what keeps the
  bar's fill solid and lets the toolbar behave normally.
- **The bottom toolbar hides as you scroll down and returns as you scroll
  up**, the way it does on any website. It returns over a solid fill in the
  same colour. The address bar shrinks and grows with it; that is Safari's
  own animation and cannot be separated from the toolbar hiding.
- **The corner menu holds its place** while the bars move, and the thin
  progress bar stays at the top edge.
- **On an iPad** the bars never move, so the chapter scrolls inside the
  page with the bars expanded and the same solid colour behind the address
  bar — the version approved on 19 September.

How it got here, for the record: the solution of 19 September (the chapter
scrolling inside the page, bars fixed) was approved, then a day of attempts
to make the toolbar hide broke the pages and was reverted to the approved
version (round 38); two flagged trials followed on the phone (rounds 40–43),
and the runway was the one approved. Every round has a written scope, a
revert point and a device pass; the rules are in
`docs/PLAYBOOK-MOBILE-CHROME.md` and the record in `docs/rounds/`.

What was verified without a phone, for every round: type-check and build,
36 screenshots across three widths at 0 drift, a permanent instrument for
the chapter pages (`npm run qa:still`: both defaults on all five chapters,
with the phone's bars and safe areas stood in), and the scope gate. What the
phone alone could verify, Wil verified.

**Shipped as:** the `v2` tip at this date, carried by `main` and marked by
the branch `release/2026-09-22`, both refreshed for this sign-off (round 44).

**22 September 2026 — Android phones: every screen keeps its margin above the gesture bar (client round 33; signed off 22 Sep: "As far as i can see these edits are done")**

Wil reviewed the site on his Google Pixel 6 in Chrome — the first review on an
Android phone — from four screenshots: the title page's button, the 1858 map's
"Back to today" button, a chapter's title and the Paintings hall's page dots
all crowded the thin bar Android draws at the foot of the screen for its
swipe-up gesture. The cause, measured from his screenshots: Chrome draws the
page right down to the screen's edge, under that bar, and tells the page how
tall the bar is (24 pixels on his phone); the site's spacing rule, written for
the iPhone, took that height as the whole margin, so every bottom control sat
exactly on the bar's top edge, ten pixels from the pill. The rule, recorded
with its revert point in `docs/rounds/2026-09-22-round-33-plan.md`:

- **Above a gesture bar, the site keeps its usual margin.** On any browser that
  draws such a bar over the page, every control at the bottom of a screen —
  the map's buttons and stop cards, the 1858 view's button, the hall's page
  dots and its plaque drawer, the narration's mini player — now sits its
  normal margin above the bar, and the title page's frame and each chapter's
  title stand clear of it. On his Pixel that is 44 pixels from the screen's
  edge instead of 24.
- **iPhones and desktop browsers are untouched, byte for byte.** The change
  exists only where a browser reports a bar drawn over the page; everywhere
  else the automated picture comparison shows no difference on any page.
- **A new automated check stands a 24-pixel bar in front of every page**
  (`npm run qa:gesture`) and reads every margin with and without it, so the
  rule cannot regress unnoticed. The method is recorded in
  `docs/PLAYBOOK-MOBILE-CHROME.md` §12.

**18–22 September 2026 — the Map page, client rounds 17–22, 27 and 29–30 (signed off 22 Sep: "As far as i can see map page is done")**

Wil reviewed `/map` on his iPhone against the new Safari, whose address bar
and toolbar are glass over the page — first inside the site-wide rounds, then
on 18 September "with fresh eyes" from five annotated screenshots. The rounds
that followed, each with a recorded revert point (`docs/rounds/2026-09-18-round-1[7-9]*`,
`-round-2[0-2]*`, `2026-09-22-round-27*`, `-round-29*`, `-round-30*`):

- **The map shows through both bars** (rounds 17–18). The page is made
  taller than the screen by the height of Safari's two bars and opens
  scrolled by exactly the top bar's height, so the map itself lies under the
  glass of both bars instead of a solid band. Approved on the phone on 18
  September ("the map page is perfect").
- **All five stops are in view on every open** (round 19). The camera that
  frames the route had been fitting the stops to the screen without allowing
  for the map now under the address bar, so the first stop could sit behind
  it. The fit accounts for that band now, at every phone size. The page also
  lands on that framing every time — on reload, on return from a chapter,
  after Safari's bars move — and no longer remembers a stop from a previous
  visit in its address.
- **"Take the walk" and the stop cards share one lane** (rounds 19–20). The
  button sits at the offset Wil chose on the phone; the cards that replace it
  in the walk view sit at the same height; and while a stop is open the page
  cannot be scrolled away underneath it.
- **Safari's bars take the colour of what is under them** (round 21).
  Scrolled into the brown section below the map, the minimized address bar
  is brown; over the map it is the map's grey. (Safari tints its bars from
  the page's background, so the background follows the section at the top
  edge.)
- **The 1858 map is one wash, edge to edge** (rounds 27 and 29). Opening the
  1858 map used to leave the live map undimmed in the strips behind the
  address bar and the toolbar; the wash now covers the whole screen, bars
  included, and stays see-through so the map reads behind it as before.
  Approved on the phone ("Looks perfect"); round 30 recorded it.
- **The method was written down** (round 22): `docs/PLAYBOOK-MOBILE-CHROME.md`
  records the phone measurements, the pattern and its traps so the same
  solutions transfer — the chapter pages (round 23) and the Paintings page
  (rounds 24–31, below) were built on it.

What was verified without a phone, for every round: type-check and build,
36 screenshots across three widths at 0 drift, the map's own instrument
(`npm run qa:framing`: the framing, the landing, the walk view and the lens,
with Safari's bars stood in), and the scope gate. What the phone alone can
show — the glass bars, their colour, the framing under the real address bar
— Wil verified on his iPhone.

**Shipped as:** the `v2` tip at this date, carried by `main` and marked by
the branch `release/2026-09-22`, both refreshed for this sign-off (round 34).
The map page as shipped is described in `docs/rounds/2026-09-22-round-34-plan.md`.

**21–22 September 2026 — the Paintings page, client rounds 24–31 and 36 (signed off 22 Sep: "As far as I can see paintings page is done" — after round 31, and again after round 36)**

Wil reviewed `/paintings` on his iPhone against the new Safari, whose
address bar and toolbar are glass, and nine rounds followed, each with a
recorded revert point (`docs/rounds/2026-09-2*-round-2*`, `-31*` and `-36*`):

- **The hall shows through Safari's bars** (round 24). The 3-D hall used to
  end in a solid band behind the bottom toolbar at rest and behind the
  address bar while walking. Two facts measured on the phone explain it and
  fix it: Safari fills a bar solid whenever a pinned element sits at that
  edge of the screen, and nothing pinned is ever drawn under a bar. The hall
  now sits inside a wrapper Safari's probe ignores, and two ordinary page
  strips carry the hall's own ceiling and floor rows into the bar regions
  every frame, so the bars are glass over the hall — as the map already was.
- **No painting flashes on load** (round 25). The page opens as the page
  brown and goes straight to the hall; the stand-in painting for phones that
  cannot run the hall appears only when the hall is not coming.
- **The plaque drawer runs under the toolbar** (round 26) instead of ending
  in a visible edge above it.
- **The drawer expands on scroll, and Back returns you to where you tapped**
  (round 28). With a painting open, iOS had started scrolling the hall
  silently under the drawer; the scroll now drives the drawer, the page
  cannot leave the hall while a painting is open, and closing the drawer
  lands you where you were.
- **The drawer's Close button unfolds with the drawer** (round 31) instead
  of arriving a second after it.
- **The Skip button holds still while you look around the hall** (round 36,
  after the first sign-off). It had shifted 14px whenever Safari's bars
  collapsed under a pan; it now keeps to its corner whatever the bars do, as
  the menu already did.
- Rounds 27, 29 and 30 (the map's 1858 lens) and further passes of round 23
  (the chapter pages) shipped from parallel sessions the same days; each has
  its own record in `docs/rounds/`.

What was verified without a phone, for every round: type-check and build,
36 screenshots across three widths at 0 drift, the page's own instruments
(`npm run qa:runway`, `qa:lead`, `qa:drawer`, `qa:skip`), and the scope gate. What the
phone alone could verify, Wil verified.

**Shipped as:** the `v2` tip at this date, marked by the branch
`release/2026-09-22` and carried by `main`; the retired 2024 app is on
`legacy-spa` (tag `legacy-spa-final`).

**15–18 September 2026 — site-wide client rounds 1–16 (Wil's review on his iPhone, iOS 26)**

The first rounds of Wil's phone review, across every page:

- **Under Safari's new bars** (rounds 1–2, 15 Sep): the pages' stages run
  under the browser's bottom bar, and the Paintings page's "Face forward"
  control gives way to the menu on phones.
- **Eight review items** (round 3, 16 Sep): more air above the first stop in
  the map's list; the museum drawer's radius, chevron and title spacing on
  portrait screens; "Uri Gilbert Mansion" on two lines on the map's cards;
  the chapter labels in the menu on phones and tablets; a mobile map
  regression from round 2 undone (the map's shell, camera fit, card strip
  and pins restored); mobile visual regressions; button text weight; the
  Paintings page's controls. With it, the rule every round since has run
  under: a written scope per round that a check enforces, and 36 reference
  screenshots that must not drift.
- **Buttons back to capitals at their original weight, "Face forward" ↔
  dots, the drawer's stroke colour** (round 5); **a chapter Share bug fixed**
  (round 6); **a first pass at Safari's bar colour** (round 7).
- **The glass lab** (rounds 8–15, 17–18 Sep): a measurement page and a series
  of device passes established, on the phone itself, how iOS 26 Safari
  colours its bars — from the page body's background, not from a colour the
  page declares, and never from anything parked off-screen — findings every
  later round is built on and that `docs/PLAYBOOK-MOBILE-CHROME.md` records.
- **The chapter pages take the hero's brown behind both bars** (round 16),
  the starting point for round 23's chapter work.

**15–16 August 2026 — v7 "The Last Ten Percent" (Wil's page-by-page review)**

- Layout craft: zero runts / clipped letterforms / visible em dashes at nine
  viewports (Kathy's prose changed by punctuation only — `docs/CONTENT-STATUS.md`);
  chapter rhythm unified; drop caps; moral sections re-lit; footer redesigned.
- Accessibility: WCAG AA contrast measured by pixel over imagery (0 failures);
  axe 0/0/0 across every route and state; keyboard paths for the map walk and
  the museum; the corner menu first in the tab order and marking the page.
- The page transition ("the Crossing") no longer flashes the next page before
  the curtain covers it (curtain markup first in `<body>` + an inline head script).
- Map: pitched, label-fitted overview at every viewport; the auto-walk pauses on
  any drag (`Continue` / `Walk again`); the 1858 plate opens on its lower panel
  in a near-full-bleed viewer; phone controls on one row; the page below the
  map is reachable by touch; Mapbox attribution added to the chapter embeds.
- The Museum: true painting aspects (the portrait Narrative II hangs tall), a
  shorter pitched hall with an entry wall and a threshold, 360° look, centred
  approach with the card left and the study right, tap/zoom brings a painting
  to life, phone peek-sheet, ≤ 80 draw calls at 60 fps.
- A real favicon (the CN mark in Libre Caslon Display, full icon set + manifest).
- Juror loop (Part E): fresh-eyed passes on the live build until two consecutive
  clean ones — the fixes they earned: the museum's inspect view brings its stage
  fully into frame first (from the page top it opened cropped), the desktop map
  scrolls the page on a plain wheel and zooms on ⌘/Ctrl + wheel (a full-viewport
  map had swallowed the wheel), walk-card neighbours peek ≥ 16 px, the phone
  peek-sheet answers touch, the mini-player is on screen whenever its main
  control is not. Reports: `docs/v7/juror-pass*.md`.

**7 August 2026 — content restoration and map optimisation**

- Chapter 2's second theme, **"FREEDOM ISN'T FREE"**, now renders. The template
  had been showing only the first theme per chapter, and Ch2 is the only chapter
  with two — the text had never once appeared on the site. It draws its own
  ground and its own study, both of which already existed.
- Two British spellings corrected in the Barbershop chapter; two retired
  "Office of the Commissioner" strings removed from Chapter 2's data.
- `/styleguide` marked "do not index".
- **Map page optimised** — the mapping engine no longer blocks the page from
  rendering, the 1860 map is no longer downloaded by everyone who never opens it,
  and both sets of thumbnails now load at the size they are actually displayed.
  Measured on the throttled mobile profile: page weight 2,410 KB → 2,028 KB,
  blocking time 1,433 ms → ~700 ms, first paint 9.8 s → 1.7 s, Lighthouse
  performance 37 → ~55 locally. The remaining gap needs the product decision
  named in §8.
- The redirect instructions for the museum were corrected: the previous draft
  pointed at the superseded Vercel deployment using retired chapter names.
