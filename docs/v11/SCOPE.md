# v11 scope ledger

**The rule: every change below carries the verbatim sentence from Wil that
authorises it.** A change with no quote is not made — or, if it is a mechanical
necessity, it goes in §B with its reason and is reported to him. Nothing is
both unrequested and silent. (Established in v10 after v9 shipped changes he
did not ask for; see `docs/v10/SCOPE.md` §C for why that happened.)

Round: Wil's 8/22 list of twelve numbered items, plus a redlined screenshot and
a desktop map screenshot.

---

## A · Requested changes

| ID | Verbatim | Change |
|---|---|---|
| V11-01 | "The chapter card on the map page should always show the center/middle card as slightly larger—wider and taller—than the chapter cards to its left and right… When a new card moves in from the left or right to replace the center/middle card, it should grow slightly as it moves into the center… This is a size and animation task only—no other changes." | The mechanism existed; the arithmetic was wrong. keen's `slide.distance` is the slide's LEFT EDGE as a fraction of the container, not its distance from centre, so a centred card reported `(1-size)/2` — 0.321 at 1440, 0.080 at 390 — and never reached scale 1 or its centre origin. Focused card was 3% larger than its neighbour at desktop, not 8%. Now exactly 1.000 vs 0.920 at every width: 41×15px bigger at 1440, 26×10px at 390, with the grow/shrink measured continuous through a cycle. |
| V11-02 | "On desktop and tablet (only if space allows), in the 'Where to Next' section across all chapter pages, left-align the chapter label and address under the map so they align with the left edge of the map and with each other. Then right-align the 'Get directions' button with the right edge of the map, vertically centered with the chapter label and address." | From 768 up the lockup is one row the width of the map: label + address left-set on the map's left edge, `Get directions` on its right edge, vertically centred. Measured 0.0px on both edges at 768/834/1024/1280/1440. Phones keep the centred stack. |
| V11-03 | "on chapter page two, in the second quote section below the Part 2 hero section, remove 'Part 2' so the text above the quote reads 'the mob'. The 'Part 2' text under the Location 02 label in the hero section can stay, but maybe we should size it up to the next level in our type ramp/scale, figure out what look better same size vs bigger and apply it." | The scene hook drops a leading `Part N` line — for scenes AFTER the first only, which is where a Part-N hero already carries the number. Kathy's JSON is untouched; this is a render rule. The hero kicker goes `t-title` → `t-display` (88/64/46 from 56/46/34), chosen by rendering both. |
| V11-04 | "In the 'Where to Next' section (all screen sizes), make the numbered circle to the left of the pin name/label orange, with the number in our brown/black color. Use the same styling we use for a selected map pin on the map page." | `EmbedMap`'s pin is now a verbatim copy of `/map`'s selected marker: chip on primary-10, numeral on primary-2, 11px/600. |
| V11-05 | "Across all screen sizes, on the loading page for The People page, have it read 'The' with a line break before 'people' so 'The' sits above 'people'." | `data-curtain-label` becomes `The\nPeople` in the menu and the footer; the curtain already splits on `\n` (v9 V9-302). |
| V11-06 | "Across all screen sizes, on the About page, let's add a line break to the page title and place 'the project' underneath 'about'." | `about.project.header` is authored with the break and the H1 renders it through `Lines`, like every other display heading. |
| V11-07 | "Here is the website with the official names of all the paintings. Please review it and update the painting names everywhere they appear so they match the official names." | — |
| V11-08 | "Some of the sketches next to the paintings on the museum/paintings page are still wrong. The Commissioner's Office is one of them—please verify that the sketch next to each painting is the correct one. Additionally, the 'THE MUSEUM • SCROLL TO WALK • DRAG TO LOOK • TAP A PAINTING' chip / tag should be center aligned with the 'SKIP THE HALL' button." | **8b done**: the chip row takes `.btn-sm`'s height and centres in it from 1024 up — measured delta 0.0px at 1024/1280/1440/1920, was 4px. **8a**: see the review guide — the Part 1 study is a different work, identified from the PDF. |
| V11-09 | "On desktop and anywhere else this occurs, I'd like the map on the Map page pushed higher so the ferry pin sits farther from the 'TAKE THE WALK' button. All pins should remain visible on every screen size." | The desktop fit's bottom padding 140 → 240. The safe box constrains the label PILLS, but a pill hangs above its dot on a leader line, so the DOT was never in the fit — measured 10px between the ferry dot and the button at 1440/1280/1920. Now 60px, with every pill still inside at all ten viewports tested. |
| V11-10 | "Across all screen sizes, in the Historical Context section, I'd like to see more of the top and bottom of the image. Make the image slightly larger, and ensure the background color it loads on matches the same light color… I also think there's an opportunity for a subtle scroll effect… Keep it elegant and restrained… add a gentle gradient/feathered fade into the surrounding sections." | Plate 52/68vh → 62/80vh (612 → 752px at 1440). The section carries `--ground-light`, so nothing flashes the page's dark body while the image decodes. The 12% linear fade becomes an eased ramp over 18% at each end. A GSAP scrub grows the IMG 1.000 → 1.045 on the way in and reverses on the way back — on the image inside `overflow-hidden`, never the block, so `overflowX` stays 0; `transform: none` under reduced motion. |
| V11-11 | "The spacing above and below feels uneven. I don't mind the asymmetry, but the layout feels unbalanced because the space between the top of the content and the divider line feels too tight. If we increase the top spacing by moving all content below the divider line down slightly—without increasing the space below the content—the section should breathe more and feel more balanced." | `.sec-head`'s padding goes sp-3 → sp-4/sp-5, moving everything under the rule down. Measured 57 → 73/97/109 against 128/168/200 below: a steady ~1:1.75 instead of 1:3.5. Chapter, About and People share this head, which is the "similarly styled layouts" he names. |
| V11-12 | "The final images have been uploaded to GitHub… Review and use the images where they are needed, remove anything we no longer need, and update accordingly with the final images." + "Only replace / update what we have discussed replacing." | `scripts/refresh-from-masters.mjs` refreshes site assets from the in-repo masters, but only where the master's aspect matches what the site already serves — a resolution upgrade, never a re-crop. One key qualified: `ferry/historical` 1200×800 → 1440×960. Thirteen were skipped because the delivered art is 3:2 / 2:3 while the site serves 16:9 / 9:16; re-deriving those would re-frame every painting, which is his decision. Reported in the guide with the full list. |

## B · Not requested — mechanical necessities, disclosed

| Change | Why | Reversible |
|---|---|---|
| The next-stop pill moves primary-10 → primary-9 | V11-04 asks for `/map`'s selected-pin chip, which is primary-10. On a primary-10 pill an orange chip of the same value is invisible; `/map` reads because its pill is primary-9 and the chip steps down from it. Copying the idiom means copying both halves. | Yes |
| The footer's "The Paintings" curtain now breaks too | v9 V9-302 gave that curtain its authored break in the menu and missed the footer, so the same link curtained differently depending on where you clicked it. V11-05 puts the identical fix on its sibling; leaving one unbroken would have shipped the inconsistency knowingly. | Yes |

## C · Open with Wil

Tracked in the review guide; nothing here is decided unilaterally.

---

# v11.2 scope ledger — the mobile chrome round (Wil, 8/24)

Same rule. Round: two sentences, plus one answer to a question I asked.

## A · Requested changes

| ID | Verbatim | Change |
|---|---|---|
| V112-01 | "make sure that on mobile regardless of the browser that someone is using or the device they are on iOS or android at the website is always full screen and the browser tool bar, and address bar allow the website to be full bleed or transparent, so that the website and it's feel bleed." + "Every page on the site should be full bleed." + "the browsers address and tool bars should be made the same color as the home screens background" | `theme-color` follows the page. Both viewport edges are read on every scroll; agreement decides the tint, and on disagreement an edge under a painting yields to the clear one, else the ground owning more of the centre line wins. Measured on the production build, 183 screens × 2 bar faces: **57 visible bars → 0**. No new colour: every value is a background this stylesheet already paints. |
| V112-02 | same sentence — "full bleed **or transparent**" | The one context where a browser allows genuine transparency: `mobile-web-app-capable`, `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style=black-translucent`. The manifest already asked for `display: standalone` with nothing telling iOS to honour it. Zero effect in a normal tab. |
| V112-03 | "When scrolling the address bar and the toolbar should disappear when they scroll up they should reappear." | **Measured, and nothing needed changing.** The plan was to move `overflow-x: clip` off the root on the theory that a constrained root scroller was suppressing retraction. It is not: `clip` does not force the other axis to `auto` the way `hidden` does, so `html`'s `overflow-y` computes `visible`, the root IS the scroller, and all ten scrolling routes have runway (400–13320px) and scroll it. 0 of 11 blocked. The edit would have been churn on a hypothesis the numbers had already killed. |
| V112-04 | "It should remain unchanged and fill the entire viewport above the browsers address and tool bars." (the home page, answering my question) | **Untouched.** `h-dvh` already means exactly the viewport above the bars. It has no runway, so no browser can retract chrome there — that is the cost of the instruction, stated in the review guide rather than worked around. |

## B · Not requested — mechanical necessities, disclosed

| Change | Why | Reversible |
|---|---|---|
| `:root { color-scheme: dark }` | Declared nowhere on the site, so the browser was left guessing the page's appearance and dimming the tint it was handed — #100a05 in Wil's photograph against a declared #1d1411. Proved a no-op the strict way (a pixel diff cannot: two runs of the same build differ in 60 of 155 captures): inside one page instance, snapshot the computed paint of every element, flip the declaration, snapshot again. **12 routes · 3880 elements × 16 paint properties · 0 rendered elements change.** | Yes, one line |
| …and its one real side effect: the desktop scrollbar goes from the OS light track to a dark one | That is what `color-scheme` is for. It matches the page it sits on. Invisible on macOS overlay scrollbars, visible on Windows/Linux. | Yes, same line |
| `--ui-inset` takes `max(var(--gutter), env(safe-area-inset-*))` | V112-02 hands the page the status bar's pixels; without this the corner menu sits under it. More generally the page has run under the notch since v9 added `viewport-fit=cover` with **nothing** accounting for it — `env()` appeared in one file. Kept as ONE token because that block's whole idea is one lane; per-edge insets would break the alignment that bought. Where insets are 0 the max() **is** `var(--gutter)`, byte for byte — asserted at six widths. | Yes |
| `@property --ui-inset { syntax: "<length>" }` | Not decoration. TroyMap:485/652/856 and Museum:789 `parseFloat` this token, and an unregistered custom property computes to its token stream — they would have read `"max(40px, 0px, …)"`, got NaN and fallen back to 20px at every width, moving the map's card strip and the museum's sheet on desktop. | Yes, with the line above |
| `ScrollTrigger.config({ ignoreMobileResize: true })` | Retraction grows `dvh` mid-gesture, and ScrollTrigger's default answer is a full refresh — every start/end re-derived under a moving thumb. Measured across the growth (390×844 → 390×932 at a fixed offset): museum railT drift **0.0000**, chapter lockup scrub monotonic and identical after. | Yes |
| `scripts/bleed-check.mjs` + `npm run qa:bleed` | The three claims above are only claims without an instrument. It asserts the tint on every screen, the retraction preconditions on every route, and that the lane still resolves to a length and still clears a safe area. | Yes — it is additive, nothing depends on it |

## C · Open with Wil

Carried, plus what only a phone can settle — see the v11.2 review guide.
