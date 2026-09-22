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

## v6 · Spelling normalization (2026-08-03)
"organised" → "organized" in commissioners-office historical content — US
spelling used everywhere else on the site; mechanical correction, no fact
touched (flagged by v6 juror pass 1).

## v6 · Typographic quote normalization (2026-08-03)
Straight typewriter apostrophes and inch-mark quotes → typographic ’ “ ”
across all five chapter JSONs, people.ts, about.ts and page literals
(v6 juror pass 3, P1). Mechanical glyph substitution only — zero words
changed; every value re-verified as parseable JSON with no remaining
word-internal straight apostrophes.

## v6 · Flag for Kathy: the $1,000 conversion appears two ways
bakery.json says "($35,000 today)"; barbershop.json says "(almost
$40,000 today)" for the same 1860 sum. A fact question, so NOT edited —
needs one number chosen by Kathy/Wil (v6 juror pass 3, P2).

## 2026-08-07 · Ch2's second theme restored to the site
**"FREEDOM ISN'T FREE" had never rendered.** `[chapter].astro` read
`c.morals[0]`, and Chapter 2 is the only chapter authored with two morals — so
the second theme, its message and its call to action ("What freedom costs to
keep") were written, corrected and approved, and then never once appeared on a
page. Confirmed absent from the live HTML on 2026-08-04.

The template now renders every authored moral. Moral N pairs with scene N, so
Ch2 Pt 2 draws its own full-bleed ground (`moral-pt2`) and its own study
(`sketch-pt2`) — both assets have been sitting unused in `public/media` since
the media build. The editorial spine numbers accordingly: Ch2 now runs
01 Listen Pt 1 · 02 Listen Pt 2 · 03 History · 04 The moral Pt 1 ·
05 The moral Pt 2 · 06 Onward. One-moral chapters are byte-identical to before.

**No prose was written, rewritten or paraphrased** — the restored text is
exactly what `commissioners-office.json` has always held.

### ⏳ Open: Ch2 Pt 2 needs a `sketchNote`
Every chapter has one authored note describing its study. Ch2 now hangs two
studies but has one note, so **Pt 2's study currently shows the credit block
with no descriptive line**. Deliberately left blank rather than invented.
Drop a `sketchNote` on the second scene in `commissioners-office.json` (the
scene schema now accepts one) and it renders. Mark Priest should read it, as
he should the other five.

## 2026-08-07 · Two mechanical spelling corrections
`barbershop.json` `portal.history` kept British spellings the v6 US-spelling
pass missed: "centre" → "center", "organise" → "organize". Mechanical, no fact
touched — same class as the 2026-08-03 normalization.

## 2026-08-07 · Retired name string removed from Ch2
Two `scenes[].audio.subtitle` values still read "Office of the Commissioner", a
name the naming canon retired (D1). They render nowhere — the chapter template
passes `c.name.canonical` to `AudioStory` — but they were visible to anyone
reading the JSON and would have been a trap for the next editor. Now
"Commissioner's Office".

**Still open and untouched, needing Kathy:** the "richest man" ruling, the
exact Peter Baltimore quotation wording, the two arrow relocations, the Pliny
Moore caption, the Athenaeum and Peter Baltimore images, the $35,000/$40,000
figure, the Ferry skiff narrative rewrite, and her read of the condensed
`portal.history` prose. None of these were changed by this pass.

## ⏳ Open question: `mansion.json` carries a `portal.hook` that renders nowhere
Uri Gilbert Home is the **only** chapter with a non-null `portal.hook`
("People will ignore your efforts to steal your opportunities."). All four
other chapters have `null`, and no template reads the field.

Deliberately **not** rendered by the 2026-08-07 pass. Ch2's second moral was
restored because the design clearly intended it — a second ground and a second
study were already sitting in `public/media` waiting for it. A hook has no such
slot, and inventing a placement for the one chapter that has one would make
that chapter structurally different from the other four for no authored reason.

Three ways to close it, all needing a human: give every chapter a hook and
design a slot; drop the field from the schema; or leave it as an author's note.
Wil / Kathy to decide.

## 2026-08-07 · FINAL REVIEW CALL — the definitive correction round (Kathy live, page by page)
Source for every entry below: the recorded final review call, 7 Aug 2026 10:01 MDT
(transcript in the project folder). Kathy approved every page section-by-section
except the edits listed here. **This supersedes the 16-edit ledger above** — items
from the old list that Kathy walked past and approved today (Uri Gilbert
"wealthiest" phrasing, painting placements, Ch2 quotation, Athenaeum photo) are
considered closed by that approval.

**Narrated story text (audio must be regenerated to match — timings nulled where
structure changed):**
- HOME hero: "On April 27, 1860, the people of this city took Charles Nalle back… Harriet
  Tubman stood with them." — date per Kathy (00:10:35); citizens-led reframe per Kathy
  (00:05:13: "it's a group of Troy citizens… it was not her thing"). Exact sentence is
  ours → flagged for written confirmation. Same reframe in the meta description.
- CH2 Pt2 final line: deleted "torn free by the sweeping mob", added "and, with the
  crowd," before "broke into a sprint" — Kathy dictated placement (00:27). He is never
  depicted alone.
- CH2 Pt2: the ransom/fundraising paragraph MOVED IN from Ch5 (00:49–00:52 — "he only
  crossed the river once"; the fundraising happened at the commissioner's office).
  Inserted between the negotiation ¶ and the door-flings-open ¶. Duplicate
  name-introductions trimmed in the stitch (both men are introduced one ¶ earlier) —
  flagged in the copy doc.
- CH3 ¶1: "…between Charles, the freedom seekers, and the ferrymen waiting on the west
  bank of the Hudson River…" — read back to Kathy, "Perfect. Perfect." (00:31)
- CH3 ¶2: "By the time he reached Troy, New York… Here Charles found refuge" (00:34)
- CH4 ¶4: "the local Watervliet police" → "the local West Troy police" (00:42)
- CH5: opens on "Pushing their way through the gathering of another great crowd…";
  its last line now "…the Corporation Hall Building grew" (00:52); closing ¶ rebuilt on
  Kathy's dictation — Schenectady safe houses → Canada, St. Catharines, the safe house
  OWNED BY HARRIET TUBMAN, where word of the ransom reached him (00:53–00:54).
  "in vs near Schenectady" flagged.
- CH4 ¶2 (the river leap) — **UNTOUCHED, under Kathy's explicit asterisk** pending her
  check of Christianson. Both variants pre-written in `CNWM - Final Copy for Kathy.md`.

**Non-narrated:**
- CH1 historical context: "the richest city" → "one of the richest cities" (00:18);
  final history line ends at "…a community-led rescue." (Tubman clause cut, 00:19)
- CH3 historical context: "Rensselaer County Arts Council" → "Rensselaer County Council
  of the Arts" (00:36 — Kathy's final self-correction was OF; official form may be
  "Council FOR the Arts" → flagged)
- CH4 historical context: "into Watervliet" → "into West Troy" (00:43)
- CH5 historical context: cut the word "ultimately" before "triggering the Civil War" (00:56)
- PEOPLE: Peter Baltimore "at Troy House" → "next to the Troy House" — "two separate
  houses" (00:58). People page otherwise approved name-by-name.
- ABOUT: "Spring of 2025" removed (typo — real kickoff year pending Brian Clyne);
  Hart Cluett Museum added to the collaboration line; "in April 1860" → "on April 27,
  1860"; "Professor Brian Tolle" → "Professors Brian Tolle and Brian Clyne";
  "Memorial Kiosk" → "Memorial Plaque" (01:04). Samantha + possible Kathy/Amanda
  credits and the RPI department name are PENDING the confirmation email.
- FOOTER (site-wide): route disclaimer added per Brian (00:21) — wording ours, flagged.
- People/index meta descriptions: Tubman no longer leads the lists.

**Artist studies (full image↔caption review, all six):**
- bakery / commissioners-office pt1 / mansion / barbershop notes verified against
  their drawings — match, unchanged.
- ferry `sketchNote` REWRITTEN — the old note described a sparse "distance, not
  struggle" sheet; the actual study is a dense foreground scrum. New note describes
  the drawing on the page.
- commissioners-office Pt2 scene `sketchNote` AUTHORED (the restored second theme's
  study hung with credit only). Both new notes are in the copy doc for Kathy +
  Mark Priest.

**Held / pending:** jump verdict (Ch4 text+audio) · 1840s LOC map (replaces the 1819
plate mislabeled "1860" in BOTH the /map lens and the Ch2 Pt2 interlude, with honest
captions) · kickoff year · RPI dept name · Samantha spelling · credit consents ·
new narration for ch2pt1 (Liberty St audio error), ch2pt2, ch3, ch5 (+ch4 after
verdict) — timings regenerate via scripts/audio-timings.mjs when files land.

## 2026-08-07 (later) · Wil's answers to the open flags
- RPI department: **"Science and Technology Studies"** (Brian Clyne confirmed) — About
  partnerships line corrected.
- Ch5: "safe house to safe house **near** Schenectady" (was "in") — narrated; ch5
  re-record already queued, no extra audio work.
- "Rensselaer County **Council of the Arts**" CONFIRMED as printed — flag closed.
- Credits decision: **Kathy, Amanda and Samantha are NOT added individually** — the
  Hart Cluett Museum credit covers the museum team (Kathy's own suggestion on the
  call). Brian Clyne stays listed with Brian Tolle as professors. Samantha's spelling
  for the record: **Samantha Mahoski**. Note: Brian Clyne's call recap asked to "add
  me and Samantha" — Wil to mention the museum-credit approach in the team email.
- Speaker attribution confirmed: the two Brians are Brian Tolle (plaques/building
  dept) and Brian Clyne (RPI/About) — email attributions stand.
- Vercel: fallback URL removed from astro.config, vercel.json deleted; dashboard
  deletion is Wil's (instructions provided). Nothing live depends on it.
STILL PENDING: jump verdict · 1840s map · kickoff year · Kathy's copy-doc
confirmation · ElevenLabs audio · handoff sequence.

## 2026-08-07 (evening) · Email-thread corrections applied ("CNWM Website Handoff" thread)
Source: Brian Clyne's corrections email (Fri 2:05 PM MDT, sent from the Tolle
Studio address, signed Brian C.), Kathy's 2:58 PM map email, Amanda's 3:07 PM
reply, Wil's 3:32 PM map proposal + direction to implement.
- ABOUT ¶1: "kicked off in the fall of 2022" restored (Brian C.: "first kicked
  off back in the fall of 2022"). Kickoff-year dependency CLOSED.
- ABOUT credits: **Samantha Mahoski of the Hart Cluett Museum ADDED** (Brian
  C.'s written request — former curator, present at inception). **Amanda stays
  out at her own written request** ("No need to include me"). **Kathy stays
  out** (no confirmation; her call-time deferral stands) — one-line add if she
  asks. Dept name already corrected earlier today; Brian's email confirms, and
  gives the full chain (Design, Innovation and Society program ⊂ Science and
  Technology Studies dept ⊂ School of HASS: hass.rpi.edu link on file).
- FOOTER: disclaimer upgraded to Brian C.'s general no-responsibility form
  blended with the call's routes-are-suggestions intent. Two sentences,
  all 10 footer pages.
- **THE HISTORICAL MAP IS NOW THE 1858 LOC SURVEY (interim per Wil).** Kathy
  attached an 1845 map (email attachment "Troy map 1845170.jpg", 6.1 MB — not
  yet saved to the project folder); Wil counter-proposed LOC item 2016585052,
  "City of Troy, N.Y.: From actual surveys," 1858, and directed: use 1858 now,
  swap if Kathy says no. Downloaded from LOC's IIIF service, cropped to
  downtown Troy + the Hudson + West Troy (the exact rescue geography — both
  banks and the crossing), seam and margin text trimmed, 3:2. New assets
  `troy-1858-*` in media/site/ AND media/commissioners-office/ (old
  `troy-1860-*` files left in place, no longer referenced — the name lied
  anyway; the plate was 1819). Lens button now "See Troy in 1858"; captions
  "Troy, New York · 1858 · Library of Congress"; Ch2 interlude no longer
  mis-captioned "archival record". Crop master saved to
  `Design/Troy map 1858 (LOC 2016585052) - downtown crop master.jpg`.
- STILL PENDING: Kathy's jump verdict (she reads Scott's book TONIGHT per her
  email) · her blessing of 1858 vs her 1845 · copy-doc confirmation ·
  ElevenLabs audio · handoff sequence.

## 2026-08-09 · KATHY'S WRITTEN CONFIRMATION APPLIED — copy is LOCKED
Source: her annotated copy doc ("CNWM - Final Copy for Kathy (MD).md", edits in
red, "I made all the edits… its done" — 8/7 7:44 PM email) + her thread emails
("Charles did not jump in the water…" 6:40 PM; "The 1858 map is even better
than the 1845" 6:44 PM).
- CH1 historical: "one of the richest" → "one of the WEALTHIEST cities" (her pick).
- CH2 Pt2: confirmed exactly as implemented (titles-trim OK, keep "$40,000
  today", no money-detail expansion — "No change").
- CH3: keep "ready to help him cross to freedom"; "Council OF the Arts" →
  **"Council ON the Arts"** (her final written correction).
- CH4: **VERSION B — Charles did not jump.** Her own edited text used verbatim;
  mechanical hyphens added ("still-bound", "all-out") + "Loreman, with the help
  of willing hands," commas — flagged. "West Troy police" kept. timings → null
  (structure/text changed; audio regenerating).
- CH5: her revised Canada sentence — "near Schenectady AND BEYOND … into
  Canada, WHERE he found refuge in St. Catharines, ONTARIO, at a safe house…"
  (mechanical commas flagged). Pistol shots stay ("shots fired in West Troy as
  well" — her re-read of Christianson).
- PEOPLE: Tubman card → role "The voice in the crowd" + rally note ("Use your
  suggestion"). Baltimore card figures confirmed ($200 his gift — Martin $200,
  Peter $200, ~$200–250 crowd, $600 traditional bounty raised to $1,000 upstairs).
- HOME hero → her sentence: "the people of Troy, New York, took Charles Nalle
  back… Harriet Tubman stood with them." NOTE: she typed "Five SPOTS mark"
  twice; we kept "STOPS" — the site's entire vocabulary (Stop 01 of 5, Walk the
  five stops). FLAGGED to Wil; one-word swap if she meant it. Comma after
  "New York" added (mechanical).
- FOOTER → her confirmed sentences verbatim ("…Explore at your own pace,
  discretion, and risk.") followed by Brian C.'s no-responsibility sentence —
  both stakeholders' asks, merged; flagged.
- Study captions (Ch2 Pt2 + Ch4): confirmed as written.
- **MAP FINAL: 1858 confirmed** — "do not crop allow pan and zoom" → the /map
  lens is now a pan/zoom viewer of the FULL uncropped plate
  (`troy-1858-full-4096.{avif,webp}`, mounts on first open; drag/pinch/wheel/
  double-tap + buttons + arrow keys). The Ch2 interlude KEEPS the downtown
  crop — a full-bleed reading beat can't pan; interpretation flagged to Wil.
COPY IS LOCKED. All six narrations may now be generated from
`CNWM - Audio Scripts - FINAL.md` (project folder), which is produced directly
from these JSONs.

## 2026-08-09 (later) · Wil's final three rulings
1. **"Stops is now Spots"** — Kathy's "Five spots" was intentional. The walk
   vocabulary changed site-wide in every user-visible string: home hero + CTA,
   about/people CTAs, chapter "Spot NN of 5" / "· continued" / "Next — Spot",
   map heading "Five spots through Troy" + description + index + "Four spots
   carry bronze plaques", people cards "Spot N ·", paintings "Spot N",
   WalkProgress, TroyMap chip/arias/fallback. Code identifiers (`?stop=`,
   props, functions) unchanged. Narration contains neither word — audio
   scripts unaffected.
2. Grammar pass confirmed — the mechanical hyphens/commas on Kathy's raw
   edits stand.
3. **Footer FINAL (verbatim, replaces the merged version):** "Walking routes
   and directions are suggestions only. Explore at your own pace, discretion,
   and risk." Brian C.'s general-liability sentence removed per Wil.

## 2026-08-15 · NEW NARRATION LIVE — text and audio match on every chapter
All six narrations regenerated (ElevenLabs) from `CNWM - Audio Scripts - FINAL.md`
= the locked copy, one consistent voice. Files renamed from ElevenLabs' chapter
titles to the canonical `ch*.mp3` names the JSON references. Durations:
ch1 100.7s · ch2pt1 80.5s · ch2pt2 139.2s · ch3 171.8s · ch4 138.2s · ch5 114.1s
(~2.2 words/s throughout — nothing truncated). `scripts/audio-timings.mjs` run:
every scene has word-proportional timings again (the three nulled scenes
restored), `duration` updated. Closes the two long-standing audio/text
contradictions (Ch2 Pt1 "Liberty Street"; Ch4 river leap) and delivers
Version B + the reordered Ch2/Ch5 aloud for the first time.
Verified in-browser (390px, all six scenes): file loads with correct duration,
highlight lights ¶0 after the 1.2s lead-in, tracks to the final paragraph,
tap-a-paragraph seeks to its start and plays; console clean.

## v7 (2026-08-16) — em-dash removal inside locked prose: punctuation-only substitutions

Locked decision 2 (Wil, 2026-08-15): em dashes leave the site everywhere. Inside Kathy-locked prose the change is PUNCTUATION ONLY — commas for appositive pairs, a colon before an elaboration, parentheses around the embedded Tubman quote — with **zero word changes**, so every paragraph still matches its ElevenLabs narration word for word (audio timings NOT re-run; the words are identical). Kathy receives a courtesy note (REVIEW-GUIDE human queue). Ledger, before → after:

| chapter | field | before | after |
|---|---|---|---|
| bakery | `sketchNote` | …separable — a body… | …separable: a body… |
| bakery | `portal.history[0]` | …took him — April 27, 1860, under… | …took him: April 27, 1860, under… |
| bakery | `scenes[0].paragraphs[0]` | …heroic postures—just a man… | …heroic postures, just a man… |
| bakery | `scenes[0].paragraphs[2]` | …Blucher Hansbrough—who had hired the slave catchers under the Fugitive Slave Act of 1850—would… | …Blucher Hansbrough, who had hired the slave catchers under the Fugitive Slave Act of 1850, would… |
| bakery | `historicalContext[2]` | …all citizens—regardless of their beliefs—to assist… | …all citizens, regardless of their beliefs, to assist… |
| bakery | `morals[0].message` | …target people—a pattern… | …target people, a pattern… |
| barbershop | `scenes[0].paragraphs[4]` | …like a hero—a testament… | …like a hero, a testament… |
| commissioners-office | `scenes[0].paragraphs[0]` | …Mutual Bank Building—a grand… | …Mutual Bank Building, a grand… |
| commissioners-office | `scenes[0].paragraphs[1]` | …Horatio Averill—the lawyer… | …Horatio Averill, the lawyer… |
| commissioners-office | `scenes[0].paragraphs[3]` | …Harriet Tubman—who happened to be in Troy visiting her cousin—pushed… | …Harriet Tubman, who happened to be in Troy visiting her cousin, pushed… |
| commissioners-office | `scenes[1].sketchNote` | …struggle — every figure… | …struggle: every figure… |
| commissioners-office | `scenes[1].paragraphs[1]` | …freedom—or fight… | …freedom, or fight… |
| commissioners-office | `scenes[1].paragraphs[2]` | …Harriet Tubman—“Drag him to the river! Drown him! But don’t let them have him!”—erupted… | …Harriet Tubman (“Drag him to the river! Drown him! But don’t let them have him!”) erupted… |
| commissioners-office | `scenes[1].paragraphs[2]` | …in reverse—instead of… | …in reverse: instead of… |
| commissioners-office | `historicalContext[0]` | …James McCune Smith—the first Black doctor in the United States—and… | …James McCune Smith, the first Black doctor in the United States, and… |
| commissioners-office | `morals[0].message` | …Charles Nalle—much like… | …Charles Nalle, much like… |
| ferry | `sketchNote` | …one taut line — hauling Charles forward — and every hand… | …one taut line, hauling Charles forward, and every hand… |
| ferry | `portal.history[1]` | …West Troy — now Watervliet — and… | …West Troy, now Watervliet, and… |
| ferry | `scenes[0].paragraphs[0]` | …in its wake—another reminder… | …in its wake, another reminder… |
| ferry | `scenes[0].paragraphs[5]` | …just feet away—freedom that… | …just feet away: freedom that… |
| ferry | `historicalContext[0]` | …one week—far faster… | …one week, far faster… |
| ferry | `historicalContext[2]` | …Hudson Valley—the region along both sides of the Hudson River from Yonkers to Albany—the first… | …Hudson Valley, the region along both sides of the Hudson River from Yonkers to Albany, the first… |
| ferry | `morals[0].message` | …suppressing freedom—a challenge… | …suppressing freedom, a challenge… |
| mansion | `sketchNote` | …at the corner — the ordinary street… | …at the corner: the ordinary street… |
| mansion | `portal.history[0]` | …Uri Gilbert — mayor of Troy, and a manufacturer of coaches and railway cars — built… | …Uri Gilbert, mayor of Troy, and a manufacturer of coaches and railway cars, built… |

Also (UI, not locked prose): ch2 scene labels `Part 1 — Tubman Creates a Crowd` → `Part 1\nTubman Creates a Crowd` (two authored lines), `Part 2 — The Mob` → `Part 2\nThe Mob`; ch2 address `5 State Street — Mutual Bank Building` → `5 State Street · Mutual Bank Building`; barbershop story media order T→I→T→I→T (Wil); the mansion audio subtitle shown in the player is `Uri Gilbert Home` (canonical) — the JSON `audio.label` data field is not displayed.

### v7 P6 — People page notes (Kathy-confirmed cast notes, punctuation only)

| field | before | after |
|---|---|---|
| Charles Nalle · note | …while fetching bread — and freed the same day… | …while fetching bread, and freed the same day… |
| Uri Gilbert · note | …not his past — Charles lived above the stables… | …not his past. Charles lived above the stables… |
| George Holeur · note | …site of Charles’s capture — in front of the whole city. | …site of Charles’s capture, in front of the whole city. |
| Blucher Hansbrough · note | Charles’s half-brother — and the man who claimed… | Charles’s half-brother, and the man who claimed… |
| Horatio F. Averill · note | …his wife, Kitty — and sold it to Virginia… | …his wife, Kitty, and sold it to Virginia… |

UI copy on /people (not Kathy's): group blurbs lose their dashes (`unrecorded: the people…`, `in chains, lawfully,`), the spot links under each person are removed (Wil), closer = `Their story lives on` / `Stand where they stood` / `Walk the story`. /about: closing quote becomes section (06) Afterword at one section gap, attribution without the dash; section (07) closer copy = `Two and a half miles. One day in 1860.` + the informative sentence with distance/minutes computed from `route.json`; `On the sidewalk` kicker now rendered.

## 2026-08-20 v8 — Wil's 8/19 review round (client-directed copy edits)

Vocabulary decision (Wil, 00:14:13): **"spot" → "location" everywhere.**
UI labels swept (walk cards, map index, arrival plate, chapter eyebrows,
Where-to-next, museum plaques + grid captions, aria labels, styleguide
specimen). Sentence-level edits, verbatim ledger:

| page | before | after | Wil's words (timestamp) |
|---|---|---|---|
| Home hero | Five spots mark where it happened. | Five locations across the city mark where it happened. | "change the last sentence to read five locations across the city mark where it happened" (00:01:26) |
| /map heading | Five spots / through Troy | Five locations / throughout Troy | "reads five locations throughout Troy" (00:12:32) |
| /map body | Four spots carry bronze plaques; the Ferry Landing… | Four locations carry bronze plaques; the Ferry Landing… | "four locations carry bronze plaques" (00:13:14) |
| /map meta description | …five spots from the bakery… | …five locations from the bakery… | (follows the sweep) |
| /people subtext | Every name stood on pavement you can still walk. Their parts of the day are told in the chapters, spot by spot. | Every person below stood on the pavement that exists today. Their roles in the story are told in each chapter, location by location. | dictated "Every person below stood on the pavement that exists today. Their role in the story are told each chapter location by location" (00:25:07) — grammar normalized ("Their roles… are told in each chapter"); flagged for Wil in the v8 review guide |
| /about closer | …the fifth spot, the Ferry Landing… | …the fifth location, the Ferry Landing… | sweep (00:14:13) |

None of these touch Kathy's narrative prose or any audio-narrated text.
