# Charles Nalle Walking Memorial — Handover Documentation

**For:** Rensselaer County Historical Society / Hart Cluett Museum, Troy NY
**From:** Notable / WBM Enterprises
**Version:** 1.0 · 7 August 2026

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
| **The website** | `makeitnotable/Charles-Nalle-Walking-Memorial`, branch `v2` | Notable → **museum at handoff** |
| **Live address** | `makeitnotable.github.io/Charles-Nalle-Walking-Memorial/` | GitHub Pages, free |
| **Plaque addresses** | `hartcluett.org/nalle/*` | **The museum, permanently** |
| **The map style** | Mapbox account `wbmdesign` | Notable → **museum at handoff** |
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
| Publishing | GitHub Actions | Every commit to `v2` rebuilds and republishes |

**Mapbox is the one external dependency with an account attached.** Its free
tier is far above anything this site will use, but it is the one thing that
could bill if the site's traffic ever became enormous. Everything else is
static files served for free.

### Working on it locally

```bash
npm install
npm run dev      # preview at localhost:4321
npm run build    # produce the publishable files
npm run check    # type-check
```

Quality instruments live in `scripts/` and are documented in `docs/`
(`docs/PLAN.md` Part B, `docs/v7/REVIEW-GUIDE.md` §6). All take
`--base URL` and default to the dev server on :4321:
`perf.mjs` (Lighthouse — run against the PRODUCTION build: `npm run build`
→ `astro preview --port 4322` → `--base http://localhost:4322`),
`probe.mjs` (rendered-pixel measurements), `states.mjs` (interaction states
incl. the map's walk/lens and the museum's modes; collisions), `contrast.mjs`
(WCAG by computed style AND by pixel sampling for text over imagery),
`rag.mjs` (runts, glyph-ink clips, visible em dashes), `a11y.mjs` (axe +
keyboard walk + reduced motion + 200 % zoom), `frames.mjs` (curtain frame
capture), `walk-check.mjs` (map/walk behaviour via `window.__troyMap`),
`museum-check.mjs` (via `window.__museum`), `audio-check.mjs` (narration
players), `shots.mjs` / `census.mjs` / `arrival.mjs`,
`build-favicon.mjs` (the CN mark and icon set), `build-og.mjs`,
`serve-dist.mjs` (a GitHub-Pages-like static server for 404 checks),
`build-route.mjs` (regenerates the walking route from Mapbox Directions).
Run one instrument at a time (they each drive their own Chromium).

---

## 5 · Accessibility and performance commitments

The site scores **100/100 for accessibility on every page**, with zero
colour-contrast failures. That is a standard to hold, not a trophy — anything
added later should be re-measured with `npm run qa:perf`.

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
3. **Museum enables GitHub Pages** on the `v2` branch. The site's public address
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

⚠️ **Do not point these at `charles-nalle-walking-memorial.vercel.app`.** That
deployment still serves the superseded 2024 version of the site; its production
branch was never switched to `v2`. Either flip it or decommission it, but do not
send plaque visitors there.

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
