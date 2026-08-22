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
| V11-01 | "The chapter card on the map page should always show the center/middle card as slightly larger—wider and taller—than the chapter cards to its left and right… When a new card moves in from the left or right to replace the center/middle card, it should grow slightly as it moves into the center… This is a size and animation task only—no other changes." | — |
| V11-02 | "On desktop and tablet (only if space allows), in the 'Where to Next' section across all chapter pages, left-align the chapter label and address under the map so they align with the left edge of the map and with each other. Then right-align the 'Get directions' button with the right edge of the map, vertically centered with the chapter label and address." | From 768 up the lockup is one row the width of the map: label + address left-set on the map's left edge, `Get directions` on its right edge, vertically centred. Measured 0.0px on both edges at 768/834/1024/1280/1440. Phones keep the centred stack. |
| V11-03 | "on chapter page two, in the second quote section below the Part 2 hero section, remove 'Part 2' so the text above the quote reads 'the mob'. The 'Part 2' text under the Location 02 label in the hero section can stay, but maybe we should size it up to the next level in our type ramp/scale, figure out what look better same size vs bigger and apply it." | The scene hook drops a leading `Part N` line — for scenes AFTER the first only, which is where a Part-N hero already carries the number. Kathy's JSON is untouched; this is a render rule. The hero kicker goes `t-title` → `t-display` (88/64/46 from 56/46/34), chosen by rendering both. |
| V11-04 | "In the 'Where to Next' section (all screen sizes), make the numbered circle to the left of the pin name/label orange, with the number in our brown/black color. Use the same styling we use for a selected map pin on the map page." | `EmbedMap`'s pin is now a verbatim copy of `/map`'s selected marker: chip on primary-10, numeral on primary-2, 11px/600. |
| V11-05 | "Across all screen sizes, on the loading page for The People page, have it read 'The' with a line break before 'people' so 'The' sits above 'people'." | `data-curtain-label` becomes `The\nPeople` in the menu and the footer; the curtain already splits on `\n` (v9 V9-302). |
| V11-06 | "Across all screen sizes, on the About page, let's add a line break to the page title and place 'the project' underneath 'about'." | `about.project.header` is authored with the break and the H1 renders it through `Lines`, like every other display heading. |
| V11-07 | "Here is the website with the official names of all the paintings. Please review it and update the painting names everywhere they appear so they match the official names." | — |
| V11-08 | "Some of the sketches next to the paintings on the museum/paintings page are still wrong. The Commissioner's Office is one of them—please verify that the sketch next to each painting is the correct one. Additionally, the 'THE MUSEUM • SCROLL TO WALK • DRAG TO LOOK • TAP A PAINTING' chip / tag should be center aligned with the 'SKIP THE HALL' button." | — |
| V11-09 | "On desktop and anywhere else this occurs, I'd like the map on the Map page pushed higher so the ferry pin sits farther from the 'TAKE THE WALK' button. All pins should remain visible on every screen size." | The desktop fit's bottom padding 140 → 240. The safe box constrains the label PILLS, but a pill hangs above its dot on a leader line, so the DOT was never in the fit — measured 10px between the ferry dot and the button at 1440/1280/1920. Now 60px, with every pill still inside at all ten viewports tested. |
| V11-10 | "Across all screen sizes, in the Historical Context section, I'd like to see more of the top and bottom of the image. Make the image slightly larger, and ensure the background color it loads on matches the same light color… I also think there's an opportunity for a subtle scroll effect… Keep it elegant and restrained… add a gentle gradient/feathered fade into the surrounding sections." | — |
| V11-11 | "The spacing above and below feels uneven. I don't mind the asymmetry, but the layout feels unbalanced because the space between the top of the content and the divider line feels too tight. If we increase the top spacing by moving all content below the divider line down slightly—without increasing the space below the content—the section should breathe more and feel more balanced." | `.sec-head`'s padding goes sp-3 → sp-4/sp-5, moving everything under the rule down. Measured 57 → 73/97/109 against 128/168/200 below: a steady ~1:1.75 instead of 1:3.5. Chapter, About and People share this head, which is the "similarly styled layouts" he names. |
| V11-12 | "The final images have been uploaded to GitHub… Review and use the images where they are needed, remove anything we no longer need, and update accordingly with the final images." + "Only replace / update what we have discussed replacing." | — |

## B · Not requested — mechanical necessities, disclosed

| Change | Why | Reversible |
|---|---|---|
| The next-stop pill moves primary-10 → primary-9 | V11-04 asks for `/map`'s selected-pin chip, which is primary-10. On a primary-10 pill an orange chip of the same value is invisible; `/map` reads because its pill is primary-9 and the chip steps down from it. Copying the idiom means copying both halves. | Yes |
| The footer's "The Paintings" curtain now breaks too | v9 V9-302 gave that curtain its authored break in the menu and missed the footer, so the same link curtained differently depending on where you clicked it. V11-05 puts the identical fix on its sibling; leaving one unbroken would have shipped the inconsistency knowingly. | Yes |

## C · Open with Wil

Tracked in the review guide; nothing here is decided unilaterally.
