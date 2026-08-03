# Content status ledger

Tracks every known correction against what is actually in `src/content/`.
M5's word-for-word verification pass against Kathy's approved script closes this file.

## Kathy's corrections (7/1/26 list + Nov 2024 marked-up WebFlow doc)

| Correction | Status in v2 content |
|---|---|
| Church bells = **Second Street Presbyterian**, not Liberty St | ✅ Applied in `commissioners-office.json` (Part 1 narrative + first moral message). The 1847 National Convention fact still correctly cites Liberty Street Presbyterian — that event WAS there; only the bells were wrong. **Ch2 Pt1 AUDIO still says Liberty St — re-record pending.** |
| Mutual Bank portal history: landlord → **employer** | ✅ Applied in `commissioners-office.json` portal history ("until his employer and other local abolitionists…"). |
| Scene 5: Nalle boarded a waiting **skiff** — no leap into the river | ⚠️ **Partially applied.** Ferry portal history rewritten (no leap). The scene narrative in `ferry.json` still contains the leap passage ("Charles hurled himself into the cold embrace…") because rewriting narrative prose is Wil's deliverable and the Ch4 audio narrates the current text. **Blocked on Wil's corrected text + re-recorded Ch4 audio.** |
| Scene 2 quote: addressed to "Peter (Baltimore)" + word "them" | ⚠️ "them" is present in the ported quote ("don't let them have him"). The "addressed to Peter (Baltimore)" framing is NOT yet reflected — exact wording needs Wil/Kathy sign-off. Likely affects Ch2 Pt2 audio. |
| Barbershop portal gets **Athenaeum building image** | ⏳ Asset not yet delivered (Wil to get from Brian/Kathy; Kathy's note: "Athenaeum, 1st Street" stereo photo, plus a Peter Baltimore portrait). |
| Map label "Bank" → "Commissioner's Office" | ✅ Applied (`map.label` in `commissioners-office.json`). |
| Characters (Nov 2024 sheet): "Horatio" spelling; Uri Gilbert = "former mayor and business owner," not "richest man in town" | ✅ "Horatio Averill" spelled correctly. Narrative's "one of Troy's wealthiest men" retained (true and not struck); portal notes he was mayor. Character cards (M4 "The People") must use the corrected descriptions. |
| Kathy's image notes: Scene 3 painting "move to Scene 5"; one painting "should be in escape + river"; Scene 5 photo is "Pliny Moore grain elevator" | ⏳ Apply during M2 art direction when assigning artwork per scene. |

## Typos fixed during port (legacy → v2)

- "they through punches" → "they threw punches" (Ch2 Pt2)
- "a embezzlement scheme" → "an embezzlement scheme" (Ch2 historical)
- "helped freedom seeker wanting" → "helped freedom seekers wanting" (Ch5 historical)
- "Fire - Eaters" → "Fire-Eaters" (Ch5 historical)
- "AUTHORITARI-ANISM" display break removed → "AUTHORITARIANISM IS PERSISTENT"
- "Mutual bank building" → "Mutual Bank building" (Ch2 Pt2)
- About: "the the community" → "the community"; "Charle's/Charles'" → "Charles's"; "Christanson" → "Christianson"; "Houler's" → "Holeur's" (tour list); "before entering the George Holeur's" → "before entering George Holeur's"

## Open questions for Kathy/Wil

- About page credits list "Jame Lang" — is it "James Lang"? (Left as written.)
- Ferry portal fact: "briefly captured again upon landing" retained — consistent with skiff correction? Kathy to confirm.
- Old site's `nextChapter` order ran Bakery → Commissioner's → Mansion → Ferry → Barbershop (story order). v2 keeps this as the walking order; confirm it matches the final plaque route (Brian's route strip 1→5).

## Audio inventory (all still ORIGINAL recordings)

| File | Needs re-record? |
|---|---|
| `audio/ch1-bakery.mp3` (1:24) | No known issues |
| `audio/ch2-commissioners-office-pt1.mp3` (1:10) | **Yes — Liberty St bells** |
| `audio/ch2-commissioners-office-pt2.mp3` (1:48) | Likely — Tubman quote wording |
| `audio/ch3-mansion.mp3` (2:29) | No known issues |
| `audio/ch4-ferry.mp3` (2:15) | **Yes — skiff, no leap** |
| `audio/ch5-barbershop.mp3` (2:01) | No known issues |

Every scene's `audio.timings` is `null` until the timestamped transcript (or
auto-alignment permission) is delivered — that gates M2 synced highlighting only.

## 2026-08-02 v5 audit — deduplication pass (NO facts altered)

The v5 audit found the same shape in all five chapters: `portal.history` ran four
paragraphs where **P3 restated P0+P1+P2 in different words**, and the chapter page
renders `historicalContext` (the numbered facts) directly above it, so several
facts appeared a third time in the same section. Measured overlap:
`bakery hist(1)` ↔ `bakery portal.P0` = 0.33 Jaccard; `barbershop hist(2)` ↔
`portal.P0` = 0.30.

`portal.history` is now **two paragraphs per chapter, 4,064 → 1,531 characters
(−62%)**. The rule applied, and it is auditable line by line against the git
history of `src/content/chapters/*.json`:

1. **Every distinct fact survives.** Nothing was removed that was not also stated
   elsewhere in the same section.
2. **Kathy's corrected wording wins** wherever two phrasings co-existed. The
   ferry is the case that matters: P1 still said "helped onto a **boat**" while
   P3 carried the approved "boarded a waiting **skiff**". Only the skiff wording
   remains. (The scene *narrative* still contains the leap passage — that is
   still Wil's deliverable and still blocked on the Ch4 re-record. Unchanged.)
3. **Where a numbered fact already said it, the portal stops repeating it** —
   e.g. bakery hist(1) states the arrest and its address, so the portal now opens
   on the circumstance (the errand for Uri Gilbert) instead of restating it.
4. No fact was added, and no sentence was invented from outside the source text.

Also in this pass, all authored-label (not narrative) copy:

- **Moral call-to-action headings**: all six across the site read "Make a
  Difference". Now one per moral, in that moral's voice ("Know the law you are
  under", "Say something first", "What freedom costs to keep", "Look at who is
  not counted", "It comes back", "Your part of it"). The CTA **body text is
  untouched**.
- **New `sketchNote` field** per chapter (schema + JSON). Every chapter carried a
  byte-identical paragraph about graphite; each now describes the drawing
  actually on screen. This is copy about the artwork, written from the images —
  it makes no historical claim.

**Still for Kathy's read** alongside the chapters: the two rewritten portal
paragraphs per chapter, and the five sketch notes.

## 2026-08-02 overnight build (Phases 1–4)

- Narration timings: word-proportional estimates generated into every chapter
  JSON (`scripts/audio-timings.mjs`). **Re-run after audio re-records land.**
- Media: all art re-encoded to AVIF/WebP/H.264 in `public/media/` (committed).
  Sketch versions of every painting now power the press-and-hold reveal.
- The People page: cast notes summarized from the corrected character sheet
  and site-history docs — **needs Kathy's read** alongside the chapters.
- Still pending (unchanged): ferry "skiff, no leap" narrative rewrite; Ch2a +
  Ch4 audio re-records; Athenaeum image for Barbershop portal.

## v6 · Item 19 — 1860 map attribution removed (2026-08-02)
The `/map` 1860 lens captioned the historical map "painted by Mark Priest".
Wil's punch list item 19: the 1860 map is NOT a Priest work — only the
paintings and sketches are his. Caption now "Troy, New York · 1860"; alt text
likewise. If provenance for the map plate arrives (Hart Cluett?), it can be
credited accurately then.
