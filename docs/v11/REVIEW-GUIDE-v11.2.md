# CNWM v11.2 — mobile chrome · review guide

Everything below is on `v2` and live.

Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/

---

## 0 · The one thing to know before the rest

**No web API makes a browser's address bar transparent in a tab.** Not iOS
Safari, not Android Chrome, not Firefox or Samsung Internet. There is no
declaration, no meta tag and no CSS that hands a normal browser tab the pixels
its chrome occupies. I would rather say that plainly than let you find it on
your phone.

Three things *are* real, and this round does all three:

1. **The bars can take the colour of the page** — so they read as the page
   continuing past the edge rather than as bars on top of it.
2. **The bars can retract** on scroll down and return on scroll up.
3. **Genuine transparency exists in exactly one place** — the site added to a
   home screen. That is now switched on.

---

## 1 · Changes you did not request

Five, all mechanical necessities of the two sentences you did write. Full
reasoning in `docs/v11/SCOPE.md` §B.

- **`color-scheme: dark`.** You turned this down once as "changing the colors."
  It is not one, and your own sentence — *make the bars the same colour as the
  home screen's background* — is what it is for. It was declared **nowhere** on
  the site, which left the browser guessing what appearance this page is and
  dimming the tint it was handed: that is why your iPhone measured `#100a05`
  against a declared `#1d1411`. Proof it moves nothing is in §3.
- **…and its one real side effect:** the desktop scrollbar goes from your OS's
  light track to a dark one. Invisible on a Mac (overlay scrollbars), visible on
  Windows and Linux. One line to revert if you dislike it.
- **`--ui-inset` now clears the safe area.** Making the page full-bleed and then
  leaving the corner menu under the status bar would be a worse bug than the one
  we started with.
- **`@property --ui-inset`.** Not decoration — see §4. Without it, four places in
  the map and the museum would have silently read a broken value.
- **`ScrollTrigger.config({ ignoreMobileResize: true })`.** When the bars leave,
  `dvh` grows, and the default response is a full refresh under a moving thumb.

---

## 2 · The bars now take the colour of the page

Your sentence was about the home page. The problem is not confined to it, and
the measurement says where it actually was.

A browser paints its chrome in **one** colour. This site has more than one
ground: the brown page (`#1d1411`), the cream reading register (`#f6f3ee`) that
carries the transcripts, About's long text and the historical plates, and the
hero's near-black. `theme-color` was a single static brown — so **every screen
the cream register filled came with a dark strip at both ends.** A cream page
with black bars top and bottom is your photograph.

Measured on the production build across 11 routes × 3 phone widths × 6 scroll
depths — 183 screens, two bar faces each:

| | before | after |
|---|---|---|
| seamless — the chrome IS the page | 278 | **335** |
| over artwork — no flat colour can match a painting | 13 | 14 |
| forced split — two grounds on one screen, other edge seamless | 18 | 17 |
| **a visible bar** | **57** | **0** |

The failures were cream against brown at **Δ382 of a possible 441**. Not subtle.

How it decides: both viewport edges are read, because that is where the bars
are — a colour matching the middle of the screen and neither edge is the worst
of the three. When the two edges agree, that is the answer. When they disagree,
an edge under a painting yields to the clear one (no flat colour can meet a
painting), and otherwise the ground owning more of the centre line wins, with
ties falling to the bottom, where iOS parks its address bar.

**No new colour anywhere.** Every value the chrome takes is a background this
stylesheet already paints. The curtain needed no special case either: while it
covers, it is the only hit-testable thing on the screen, so a page transition
tints itself.

Two honest limits. Where a painting owns an edge — a chapter hero, mostly — no
flat colour can match it; that is what retraction and the home-screen app are
for. And where two grounds split one screen, one colour cannot serve both ends;
17 screens are in that position and the tint takes the one that dominates.

---

## 3 · The bars retract — and item 3 was already true

I planned to move `overflow-x: clip` off `html, body`, on the theory that a
constrained root scroller was stopping browsers from sliding their chrome away.
**Measuring it killed the theory, so the edit was not made.** `clip` does not
force the other axis to `auto` the way `hidden` does, so the root's `overflow-y`
computes `visible`, the root IS the scroller, and every scrolling route has
runway and uses it:

```
/                     runway      0   one screen — chrome cannot retract here
/bakery               runway   7485   scrolls
/commissioners-office runway  13143   scrolls
/map                  runway   2236   scrolls
/paintings            runway  13320   scrolls
...                       0 of 11 routes blocked
```

So the retraction should already work everywhere except the front door — and the
front door is your instruction: *"It should remain unchanged and fill the entire
viewport above the browsers address and tool bars."* A page exactly one screen
tall has nothing to scroll, and a browser only retracts chrome on a scroll.
That is the cost of leaving it unchanged, and it is worth knowing you are paying
it. If you ever want the bars gone there too, the mechanism exists — say so and
I will show you it before it ships.

Making the edit anyway would have been churn on a hypothesis the numbers had
already killed. I would rather report the measurement.

---

## 4 · Full bleed, made safe

`viewport-fit=cover` has run the page under the notch and the home indicator
since v9, and **nothing accounted for it**: `env(safe-area-inset-*)` appeared in
exactly one file, on the museum's top chrome. (`Base.astro`'s own comment claims
it is "already used by --ui-inset consumers." It was not.)

It stays **one** token, which is that block's whole idea — five separate
opinions became one lane, and per-edge insets would break the alignment that
bought. The lane simply never gets thinner than the deepest inset on any edge.

Asserted at six widths: 20 / 20 / 40 / 40 / 56 / 56, every anchor unmoved, byte
for byte. Chromium reports no safe areas, so the growth half was proved by
standing a 47px inset — an iPhone's landscape notch — in `env()`'s place: the
lane widens to 47 and the menu follows it.

`@property` earns its line here. Four places in `TroyMap` and `Museum` read this
token with `parseFloat(getComputedStyle(…).getPropertyValue("--ui-inset"))`, and
an unregistered custom property computes to its **token stream** — they would
have read the literal string `"max(40px, 0px, …)"`, got `NaN`, and quietly
fallen back to 20px at every width, moving the map's card strip and the museum's
sheet on desktop. Registered as a `<length>`, they keep working.

---

## 5 · Add it to your home screen

This is the only place the word *transparent* is honest. `site.webmanifest` has
asked for `"display": "standalone"` all along with nothing telling iOS to honour
it. Three meta tags later, the memorial opened from a home screen runs **edge to
edge with no browser chrome at all** — the status bar's pixels belong to the
page. Zero effect in a normal tab.

Worth trying on your phone: Share → Add to Home Screen, then open it from the
icon. Given a QR at a bronze plaque, some visitors will end up here.

---

## 6 · Proof that `color-scheme` moves nothing

A screenshot diff cannot answer this on this site, and it is worth saying why:
**two runs of the same build differ in 60 of 155 captures.** `/paintings` is a
live three.js hall running on software GL here, and the reveal and lazy-media
pages settle differently run to run. A pixel diff cannot tell a code change from
a frame.

So the question was asked directly instead. Inside one page instance: snapshot
the computed paint of every element, flip the declaration, snapshot again. No
timing, no frames, no noise.

> **12 routes · 3880 elements × 16 paint properties · 0 rendered elements change**

Only `<html>` and its head children flip the UA's initial `color` from black to
white; nothing inherits it (`body` sets `color` explicitly) and none of them
paint. The scrollbar is the one real change, disclosed in §1.

---

## 7 · Instrument bars

| Gate | Result |
|---|---|
| `qa:bleed` (new) | 0 visible bars across 183 screens · 0 of 11 routes blocked · lane resolves and clears a 47px notch |
| `qa:rag` | 0 runts · 0 clips · 0 visible em dashes, full matrix |
| `qa:contrast` | 0 failures (0 style · 0 pixel), 0 unmeasured |
| `qa:a11y` | 0 serious/critical · 0 moderate · 0 minor across 51 runs |
| motion under retraction | museum railT drift **0.0000** · chapter scrub monotonic and unchanged |
| build | 12 pages, `astro check` 0 errors, all 6 island-CSS guards present |

`npm run qa:bleed` must run against `astro preview`, never `astro dev` — the dev
toolbar is a fixed element across the bottom of the viewport and every bottom
sample in dev is the toolbar. That cost me three passes; it is in
`docs/RUN-STATE.md` now.

---

## 8 · What only your phone can settle

Everything in §2–§5 is measured on structure. The chrome itself — its colour,
and whether it slides away — cannot be observed in this container at all;
headless Chromium has no address bar. Four things to check:

1. **Do the bars take the colour of the section you are on?** Dark on a chapter
   hero, cream in Historical Context and in About's long text. That is the fix
   for your photograph.
2. **Do they slide away scrolling down a chapter, and come back scrolling up?**
   Everywhere except the front door, which cannot by your instruction.
3. **On `/map`, is anything hidden** under the home indicator or the collapsed
   address pill?
4. **Add to Home Screen** — does it open with no chrome at all?

If (1) still fails on your phone after this, the cause is Safari's own tint
handling rather than what the page declares, and the next lever is the standalone
app in §5. Send me a screenshot with the strip visible and I will measure it
against the section it sits on.

---

## 9 · Still open, carried

- The two painting titles not on the series page (mansion and barbershop
  horizontals), and what should hang beside *1st & State Street*.
- Whether to re-frame all ten paintings from the masters' 3:2.
- The "Take the walk" pill over the Mapbox wordmark; landscape-phone map framing.
- The 1858 lens plate re-derived from the JP2 master (a 1:1 crop comparison
  comes to you before anything is committed).
