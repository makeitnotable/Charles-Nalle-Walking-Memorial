# NAMING CANON + CONTENT LEDGER CROSS-CHECK

**Phase:** v4 P0(c) · **Date:** 2026-08-02 · **Status:** audit only — **no source files were edited.**

Scope: every displayed name / title / label string in `cnwm-v2`, cross-checked against the
requested-changes ledger (`docs/CONTENT-STATUS.md`) and the client sources one directory above
the repo (`../Context/`).

**Sources cited by short code:**

| Code | Source |
|---|---|
| `WE p.N` | `../Context/Website Edits.pdf` (19 pp, image-only scan of the 2024 WebFlow storyboard **with Kathy Sheehan's handwritten marks**) |
| `KC p.N` | `../Context/Notable Mail - Fw_ CNWM corrections from Kathy.pdf` (3 pp) |
| `PL p.N` | `../Context/2026_0610_10x12plaquesNEWLAYOUT.pdf` (4 pp — **the bronze plaque art now in production**) |
| `QR p.1` | `../Context/CNWM- QR codes.pdf` (1 p) |
| `CS:N` | `docs/CONTENT-STATUS.md`, line N |

> **The single most important finding:** the four bronze plaques went into production in
> June 2026 (`PL`, confirmed by `../Context/Notable Mail - Fw_ ready to move into plaque
> production.pdf` p.1–2). Their headline names are **BAKERY · COMMISSIONER'S OFFICE ·
> URI GILBERT HOME · BARBERSHOP**. Bronze cannot be re-cast. Two of those four names do not
> match the website, and one of them — **URI GILBERT HOME** — appears nowhere in the codebase
> at all. Every naming decision below is downstream of that fact.

---

## A · Inventory of every displayed name / title / label string

### A.1 — Chapter content JSON (`src/content/chapters/*.json`)

| file:line | field | exact string | renders as |
|---|---|---|---|
| `bakery.json:2` | `order` | `1` | stop number chip (hero, cards, pill, "Stop N of 5") |
| `bakery.json:3` | `chapterLabel` | `Chapter 1` | paintings-page chapter link (`paintings.astro:97`) |
| `bakery.json:4` | `title` | `HOLEUR'S\nFASHIONABLE\nBAKERY` | **hero H1** (`[chapter].astro:70`, `whitespace-pre-line`) |
| `bakery.json:5` | `cardTitle` | `Holeur's Fashionable Bakery` | `<title>` (`:45`), meta description (`:46`), map card (`TroyMap.tsx:731`), map index card (`map.astro:84`), arrival plate (`TroyMap.tsx:583`), painting alts/captions, map a11y names |
| `bakery.json:8` | `map.label` | `Bakery` | **map pill** (`TroyMap.tsx:104`), embed pill (`EmbedMap.tsx:46`), curtain label (`map.astro:60`, `people.astro:78`, `paintings.astro:93`, `[chapter].astro:308`) |
| `bakery.json:13` | `map.address` | `3rd & Division Streets (vacant lot today)` | map index sub-line (`map.astro:87`) |
| `bakery.json:6` | `plaque` | `true` | suppresses "· no plaque — website only" (`map.astro:88`) |
| `bakery.json:52` | `scenes[0].label` | `Captured with Bread in Hand` | section `aria-label` only (`[chapter].astro:116`) — **not visible** (single-scene chapter) |
| `bakery.json:54` | `scenes[0].audio.label` | `Chapter 1` | player title (`AudioStory.tsx:300`, `:375`) |
| `bakery.json:55` | `scenes[0].audio.subtitle` | `Holeur's Fashionable Bakery` | player subtitle (`AudioStory.tsx:305`, `:380`) + player a11y names (`:221`, `:245`, `:292`) |
| `bakery.json:75` | `quote.attribution` | `United States Deputy Marshal Holmes` | quote figcaption (`[chapter].astro:125`) |
| `bakery.json:97` | `morals[0].title` | `NOT ALL LAWS\nARE MORAL` | full-bleed moral H2 (`[chapter].astro:253`) |
| `bakery.json:100` | `morals[0].callToAction.title` | `Make a Difference` | CTA H3 (`[chapter].astro:267`) |
| `bakery.json:107` | `next.label` | `Chapter 2 — Office of the Commissioner` | "Where to next?" line (`[chapter].astro:304`) |
| `commissioners-office.json:2` | `order` | `2` | chip |
| `commissioners-office.json:3` | `chapterLabel` | `Chapter 2` | paintings link |
| `commissioners-office.json:4` | `title` | `OFFICE OF THE\nCOMMISSIONER` | **hero H1** |
| `commissioners-office.json:5` | `cardTitle` | `Office of the Commissioner` | `<title>`, cards, arrival plate, alts, a11y |
| `commissioners-office.json:8` | `map.label` | `Commissioner's Office` | **map pill**, embed pill, curtain |
| `commissioners-office.json:13` | `map.address` | `5 State Street — Mutual Bank Building` | map index sub-line |
| `commissioners-office.json:61` | `scenes[0].label` | `Part 1 — Tubman Creates a Crowd` | **visible H2** (`[chapter].astro:118`; only chapter with >1 scene) |
| `commissioners-office.json:63` | `scenes[0].audio.label` | `Chapter 2 \| Pt. 1` | player title |
| `commissioners-office.json:64` | `scenes[0].audio.subtitle` | `Office of the Commissioner` | player subtitle |
| `commissioners-office.json:88` | `quote.attribution` | `Abolitionist Martin Townsend` | quote figcaption |
| `commissioners-office.json:104` | `scenes[1].label` | `Part 2 — The Mob` | **visible H2** |
| `commissioners-office.json:106` | `scenes[1].audio.label` | `Chapter 2 \| Pt. 2` | player title |
| `commissioners-office.json:107` | `scenes[1].audio.subtitle` | `Office of the Commissioner` | player subtitle |
| `commissioners-office.json:127` | `quote.attribution` | `Harriet Tubman` | quote figcaption |
| `commissioners-office.json:151` | `morals[0].title` | `WHEN NOT\nCHALLENGED\nINJUSTICE\nTHRIVES` | moral H2 (**only `morals[0]` renders** — `[chapter].astro:40`) |
| `commissioners-office.json:159` | `morals[1].title` | `FREEDOM\nISN'T FREE` | **dead string — never rendered** |
| `commissioners-office.json:169` | `next.label` | `Chapter 3 — Uri Gilbert Mansion` | "Where to next?" line |
| `mansion.json:2` | `order` | `3` | chip |
| `mansion.json:3` | `chapterLabel` | `Chapter 3` | paintings link |
| `mansion.json:4` | `title` | `URI GILBERT\nMANSION` | **hero H1** |
| `mansion.json:5` | `cardTitle` | `Uri Gilbert Mansion` | `<title>`, cards, arrival plate, alts, a11y |
| `mansion.json:8` | `map.label` | `Gilbert Mansion` | **map pill**, embed pill, curtain |
| `mansion.json:13` | `map.address` | `189 Second Street` | map index sub-line |
| `mansion.json:26` | `portal.hook` | `People will ignore your efforts to steal your opportunities.` | **dead string — no portal-hook surface exists in v2** (verbatim from `WE p.5`) |
| `mansion.json:51` | `scenes[0].label` | `How It Began` | aria-label only |
| `mansion.json:53` | `scenes[0].audio.label` | `Chapter 3` | player title |
| `mansion.json:54` | `scenes[0].audio.subtitle` | `Uri Gilbert Mansion` | player subtitle |
| `mansion.json:82` | `quote.attribution` | `Christianson` | quote figcaption |
| `mansion.json:107` | `morals[0].title` | `THE INVISIBLE\nMATTER AS MUCH\nAS THE VISIBLE` | moral H2 |
| `mansion.json:117` | `next.label` | `Chapter 4 — Washington Street Ferry Landing` | "Where to next?" line |
| `ferry.json:2` | `order` | `4` | chip |
| `ferry.json:3` | `chapterLabel` | `Chapter 4` | paintings link |
| `ferry.json:4` | `title` | `WASHINGTON\nSTREET FERRY\nLANDING` | **hero H1** |
| `ferry.json:5` | `cardTitle` | `Washington Street Ferry Landing` | `<title>`, cards, arrival plate, alts, a11y |
| `ferry.json:6` | `plaque` | `false` | prints "· no plaque — website only" (`map.astro:88`) + map a11y suffix (`TroyMap.tsx:292`) |
| `ferry.json:8` | `map.label` | `Ferry Landing` | **map pill**, embed pill, curtain |
| `ferry.json:13` | `map.address` | `Riverfront at the end of Madison Street` | map index sub-line |
| `ferry.json:56` | `scenes[0].label` | `River Escape` | aria-label only |
| `ferry.json:58` | `scenes[0].audio.label` | `Chapter 4` | player title |
| `ferry.json:59` | `scenes[0].audio.subtitle` | `Washington Street Ferry Landing` | player subtitle |
| `ferry.json:83` | `quote.attribution` | `Christianson` | quote figcaption |
| `ferry.json:109` | `morals[0].title` | `AUTHORITARIANISM\nIS PERSISTENT` | moral H2 |
| `ferry.json:119` | `next.label` | `Chapter 5 — Peter Baltimore's Barbershop` | "Where to next?" line |
| `barbershop.json:2` | `order` | `5` | chip |
| `barbershop.json:3` | `chapterLabel` | `Chapter 5` | paintings link |
| `barbershop.json:4` | `title` | `PETER\nBALTIMORE'S\nBARBERSHOP` | **hero H1** |
| `barbershop.json:5` | `cardTitle` | `Peter Baltimore's Barbershop` | `<title>`, cards, arrival plate, alts, a11y |
| `barbershop.json:8` | `map.label` | `Barbershop` | **map pill**, embed pill, curtain |
| `barbershop.json:13` | `map.address` | `First Street (Athenaeum building)` | map index sub-line |
| `barbershop.json:56` | `scenes[0].label` | `Freedom Is Bought` | aria-label only |
| `barbershop.json:58` | `scenes[0].audio.label` | `Chapter 5` | player title |
| `barbershop.json:59` | `scenes[0].audio.subtitle` | `Peter Baltimore's Barbershop` | player subtitle |
| `barbershop.json:83` | `quote.attribution` | `Christianson` | quote figcaption |
| `barbershop.json:109` | `morals[0].title` | `WE ARE\nRESPONSIBLE\nFOR JUSTICE` | moral H2 |
| `barbershop.json:119` | `next.label` | `Chapter 1 — Where the story began` | "Where to next?" line — **free text, breaks pattern** |

### A.2 — `src/components/Menu.astro` (hardcoded chapter list)

| file:line | field | exact string | renders as |
|---|---|---|---|
| `Menu.astro:16` | `label` / `name` | `1. Bakery` / `Bakery` | menu row / curtain label (`:71`) |
| `Menu.astro:17` | `label` / `name` | `2. Commissioner's Office` / `Commissioner's Office` | menu row / curtain label |
| `Menu.astro:18` | `label` / `name` | `3. Mansion` / `Mansion` | menu row / curtain label |
| `Menu.astro:19` | `label` / `name` | `4. Ferry` / `Ferry` | menu row / curtain label |
| `Menu.astro:20` | `label` / `name` | `5. Barbershop` / `Barbershop` | menu row / curtain label |
| `Menu.astro:65` | link text + curtain | `Home` | menu row |
| `Menu.astro:77` | link text + curtain | `The Walk` | menu row |
| `Menu.astro:78` | link text + curtain | `The People` | menu row |
| `Menu.astro:79` | link text + curtain | `The Paintings` | menu row |
| `Menu.astro:80` | link text + curtain | `About` | menu row |
| `Menu.astro:38` / `:56` / `:88` | `aria-label` | `Open menu` / `Close menu` | a11y |

### A.3 — `src/components/TroyMap.tsx`

| file:line | field/context | exact string | renders as |
|---|---|---|---|
| `TroyMap.tsx:39` | `PIN_ABOVE` const | `Commissioner's Office` | **not rendered** — hardcoded copy of `map.label` that drives stem direction (`:106`) and marker anchor (`:303`) |
| `TroyMap.tsx:104` | pill body | `{stop.label}` (= `map.label`) | **map pill** |
| `TroyMap.tsx:102` | pill chip | `{stop.order}` | pill number |
| `TroyMap.tsx:292` | marker `aria-label` | `Stop {order}: {cardTitle}` + ` (no plaque — website only)` | a11y name of the pill |
| `TroyMap.tsx:534` | fallback | `The interactive map is warming up` | no-token state |
| `TroyMap.tsx:536-538` | fallback body | `This build is missing its map key. Every stop on the walk is listed below with addresses and links to each chapter.` | no-token state |
| `TroyMap.tsx:559` | 1860 lens alt | `Map of Troy, New York in 1860 — painting by Mark Priest` | lens |
| `TroyMap.tsx:563` | lens caption | `Troy, New York · 1860 — painted by Mark Priest` | lens |
| `TroyMap.tsx:575` | place chip | `The Walk · Five stops · April 27, 1860` | map overlay |
| `TroyMap.tsx:582` | arrival plate | `Stop {order} of {n}` | QR deep-link arrival |
| `TroyMap.tsx:583` | arrival plate | `{cardTitle}` (uppercased by CSS) | QR deep-link arrival |
| `TroyMap.tsx:597` | hint | `Drag to explore · Tap a stop` | first-visit hint |
| `TroyMap.tsx:613` | button | `Overview` | back control |
| `TroyMap.tsx:626` | button | `Take the walk` | door |
| `TroyMap.tsx:638` | button | `See Troy in 1860` / `Back to today` | lens toggle |
| `TroyMap.tsx:652` | button | `Stop the walk` | tour control |
| `TroyMap.tsx:674` | region label | `Stop cards` | a11y |
| `TroyMap.tsx:697` | card `aria-label` | `Enter Chapter {order}: {cardTitle}` | a11y |
| `TroyMap.tsx:698` | card `aria-label` | `Focus stop {order}: {cardTitle}` | a11y |
| `TroyMap.tsx:719` | card eyebrow | `Chapter` | card |
| `TroyMap.tsx:731` | card title | `{cardTitle}` | **map card** |

### A.4 — `src/components/EmbedMap.tsx`

| file:line | field/context | exact string | renders as |
|---|---|---|---|
| `EmbedMap.tsx:19` | prop doc | `Marker pill text, e.g. "Bakery"` | comment (records the intent: pill = short name) |
| `EmbedMap.tsx:44` | chip | `{order}` | embed pill number |
| `EmbedMap.tsx:46` | pill body | `{label}` — fed `nextEntry.data.map.label` (`[chapter].astro:294`) | **embedded "where to next" pill** |

### A.5 — `src/pages/*.astro` + `src/layouts/Base.astro`

| file:line | field/context | exact string | renders as |
|---|---|---|---|
| `Base.astro:33` | `<title>` | `{title}` | browser tab |
| `Base.astro:41` | `og:site_name` | `Charles Nalle Walking Memorial` | social |
| `Base.astro:54` | skip link | `Skip to content` | a11y |
| `Base.astro:66-67` | curtain default | `Charles` / `Nalle` | curtain wordmark |
| `index.astro:12` | `<title>` | `Charles Nalle Walking Memorial — Troy, NY` | tab |
| `index.astro:13` | meta description | `Walk the streets of Troy, New York, where on April 27, 1860 the people of the city — led by Harriet Tubman — rose up to free Charles Nalle from the Fugitive Slave Act.` | social |
| `index.astro:54` | eyebrow | `Troy, NY` | home stack |
| `index.astro:55` | H1 `aria-label` | `Charles Nalle` | home H1 |
| `index.astro:56-57` | wordmark | `Charles` / `Nalle` | home H1 |
| `index.astro:60`, `:62` | date rule | `1821` / `1875` | home stack |
| `index.astro:72` | CTA | `Continue` | home |
| `index.astro:79-81` | mission (mobile) | `The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy and the story of Charles Nalle` | home |
| `index.astro:84-85` | mission (desktop) | same, break after "designed" | home |
| `map.astro:29` | `<title>` | `The Walk — Charles Nalle Walking Memorial` | tab |
| `map.astro:36` | loading | `The walk is loading…` | map shell |
| `map.astro:43` | section label | `The five stops` | a11y |
| `map.astro:44` | eyebrow | `The Walk` | index |
| `map.astro:45-47` | H1 | `Five stops<br />through Troy` | index |
| `map.astro:49-52` | body | `…Four stops carry bronze plaques; the Ferry Landing is remembered here on the website.` | index |
| `map.astro:60` | curtain label | `{map.label}` | curtain |
| `map.astro:73` | eyebrow | `Chapter` | index card |
| `map.astro:84` | card title | `{cardTitle}` | index card |
| `map.astro:87` | sub-line | `{map.address}` | index card |
| `map.astro:88` | sub-line | `· no plaque — website only` | index card (ferry only) |
| `[chapter].astro:41` | const `whereTitle` | `Where to next?` | section H2 (`:280-282`) |
| `[chapter].astro:45` | `<title>` | `{cardTitle} — Charles Nalle Walking Memorial` | tab |
| `[chapter].astro:46` | meta description | `{chapterLabel} of the Charles Nalle Walking Memorial: {cardTitle}, Troy, NY, April 27, 1860.` | social |
| `[chapter].astro:56` | orientation line | `Charles Nalle Walking Memorial · Troy, NY · Stop {order} of 5` | hero |
| `[chapter].astro:59` | eyebrow | `Chapter` | hero |
| `[chapter].astro:70` | H1 | `{title}` | **hero H1** |
| `[chapter].astro:100` | reveal alt | `"{cardTitle}" — painting by Mark Priest` | hero a11y |
| `[chapter].astro:118` | H2 | `{scene.label}` | multi-scene only (Ch 2) |
| `[chapter].astro:125` | figcaption | `— {quote.attribution}` | quote |
| `[chapter].astro:148` | section label | `Painting — {cardTitle}, by Mark Priest` | a11y |
| `[chapter].astro:155` | interlude alt | `"{cardTitle}" — painting by Mark Priest` | a11y |
| `[chapter].astro:167` | credit chip | `Mark Priest · Nalle Series` | interlude |
| `[chapter].astro:176` | H2 | `Historical <br /> Context` | section 2 |
| `[chapter].astro:178` | progress | `Section 2/4` | section 2 |
| `[chapter].astro:198` | historical alt | `Historical photograph — {cardTitle}` | section 2 |
| `[chapter].astro:253` | H2 | `{moral.title}` | section 3 |
| `[chapter].astro:261` | moral alt | `"{cardTitle}" — moral image, painting by Mark Priest` | section 3 |
| `[chapter].astro:264` | progress | `Section 3/4` | section 3 |
| `[chapter].astro:267` | H3 | `{moral.callToAction.title}` | section 3 |
| `[chapter].astro:276` | section label | `Continue the walk` | a11y |
| `[chapter].astro:284` | progress | `Section 4/4` | section 4 |
| `[chapter].astro:294` | embed pill | `{nextEntry.map.label}` | **embedded map pill** |
| `[chapter].astro:304` | next line | `{c.next.label}` | section 4 |
| `[chapter].astro:308` | curtain label | `{nextEntry.map.label}` | curtain |
| `[chapter].astro:313` | button | `Continue the walk` | section 4 |
| `[chapter].astro:324` | button | `Get Directions` | section 4 |
| `[chapter].astro:335` | footer link | `The People of this day →` | footer |
| `[chapter].astro:336` | footer link | `The Paintings →` | footer |
| `[chapter].astro:337` | footer link | `About the memorial →` | footer |
| `[chapter].astro:340` | footer | `Share` | footer |
| `[chapter].astro:347` | button | `Share this chapter` | footer |
| `[chapter].astro:350` | footer | `Made by Notable` | footer |
| `[chapter].astro:428` | button state | `Link copied` | footer |
| `people.astro:33` | `<title>` | `The People — Charles Nalle Walking Memorial` | tab |
| `people.astro:37` | eyebrow | `The People` | page |
| `people.astro:38-39` | H1 | `One day.<br />A whole city's&nbsp;cast.` | page |
| `people.astro:49` | figcaption | `— Harriet Tubman, outside the commissioner's office` | page |
| `people.astro:18` | group heading | `The Rescuers` | section H2 (`:61`) |
| `people.astro:25` | group heading | `The Hunters` | section H2 |
| `people.astro:66` | eyebrow | `{person.role}` | person card |
| `people.astro:67` | H3 | `{person.name}` | person card |
| `people.astro:78` | chip | `Ch. {order} · {map.label} →` | person card |
| `people.astro:96-97` | CTA | `Their streets are still here` / `Walk the route` | page foot |
| `paintings.astro:51` | `<title>` | `The Paintings — Charles Nalle Walking Memorial` | tab |
| `paintings.astro:14-19` | `KEY_TITLES` | `""` / `Part 2` / `Narrative I` / `Narrative II` | painting title suffixes |
| `paintings.astro:36` | work title | `{cardTitle} — {KEY_TITLES[key]}` (or bare `{cardTitle}`) | gallery caption (`:88`), dialog title (`:75`), alts (`:81`) |
| `paintings.astro:55` | eyebrow | `The Paintings` | page |
| `paintings.astro:56-57` | H1 | `The Nalle<br />Series` | page |
| `paintings.astro:89` | caption | `Mark Priest · Nalle Series` | gallery |
| `paintings.astro:97` | link | `{chapterLabel} →` | gallery |
| `paintings.astro:129` | button | `Close` | dialog |
| `about.astro:16` | `<title>` | `About — Charles Nalle Walking Memorial` | tab |
| `about.astro:65` | section label / alt | `{person.header}` | about |
| `404.astro:8` | `<title>` | `Page not found — Charles Nalle Walking Memorial` | tab |
| `404.astro:12` | eyebrow | `Off the route` | page |
| `404.astro:13-15` | H1 | `This page isn't<br />part of the memorial` | page |
| `404.astro:25`, `:33` | curtain labels | `Home` / `The Walk` | curtain |
| `404.astro:27`, `:35` | buttons | `Start at the beginning` / `Open the map` | page |
| `curtain.ts:20` | `DATE_LINE` | `April 27, 1860` | curtain sub-line (`:38`) |
| `curtain.ts:42-43` | fallback | `Charles` / `Nalle` | curtain wordmark |
| `PressReveal.tsx:205` | hint | `Press and hold to bring the painting to life` / `Tap to reveal the painting` | hero hint |
| `AudioStory.tsx:259` | tooltip | `Tap to hear this passage` | narration |
| `AudioStory.tsx:319` | slider a11y | `Narration position` | narration |

### A.6 — `src/data/people.ts`

| file:line | field | exact string | renders as |
|---|---|---|---|
| `people.ts:17` | `name` | `Charles Nalle` | person card H3 |
| `people.ts:18` | `role` | `The man at the center` | card eyebrow |
| `people.ts:23` | `name` | `Harriet Tubman` | card H3 |
| `people.ts:24` | `role` | `The general` | card eyebrow |
| `people.ts:29` | `name` | `Peter Baltimore` | card H3 |
| `people.ts:30` | `role` | `Barber · Underground Railroad` | card eyebrow |
| `people.ts:31` | `note` | `…high-class barbershop at Troy House…` | card body — **see B15** |
| `people.ts:35` | `name` | `Martin I. Townsend` | card H3 |
| `people.ts:36` | `role` | `Chief civil-rights attorney` | card eyebrow |
| `people.ts:41` | `name` | `Uri Gilbert` | card H3 |
| `people.ts:42` | `role` | `Industrialist · Charles's employer` | card eyebrow |
| `people.ts:43` | `note` | `Railcar magnate and later mayor of Troy.…` | card body — **see B21** |
| `people.ts:47` | `name` | `William Henry` | card H3 |
| `people.ts:48` | `role` | `Grocer · first alarm` | card eyebrow |
| `people.ts:53` | `name` | `Captain Hawk` | card H3 |
| `people.ts:54` | `role` | `Vigilance Committee` | card eyebrow |
| `people.ts:59` | `name` | `Billy Loreman` | card H3 |
| `people.ts:60` | `role` | `The waterman` | card eyebrow |
| `people.ts:65` | `name` | `George Holeur` | card H3 |
| `people.ts:66` | `role` | `The baker` | card eyebrow |
| `people.ts:74` | `name` | `Blucher Hansbrough` | card H3 |
| `people.ts:75` | `role` | `The claimant` | card eyebrow |
| `people.ts:80` | `name` | `Horatio F. Averill` | card H3 |
| `people.ts:81` | `role` | `The betrayer` | card eyebrow |
| `people.ts:86` | `name` | `Henry "Jack" Wale` | card H3 |
| `people.ts:87` | `role` | `Slave hunter` | card eyebrow |
| `people.ts:92` | `name` | `Deputy U.S. Marshal Holmes` | card H3 |
| `people.ts:93` | `role` | `The badge` | card eyebrow |
| `people.ts:98` | `name` | `Thomas Parr` | card H3 |
| `people.ts:99` | `role` | `The accomplice` | card eyebrow |

### A.7 — `src/data/about.ts`

| file:line | field | exact string | renders as |
|---|---|---|---|
| `about.ts:14` | `project.header` | `About the Project` | page H1 (`about.astro:23`) |
| `about.ts:15` | `project.kicker` | `Overview` | eyebrow (`about.astro:21`) |
| `about.ts:19` | credit list | `…Professor Brian Tolle; students Madeleine McNairn, Fiona Clarke, Susan Nguyen, Sara Bayne, Jame Lang, and Jalen Edmonds; artists Mark and Licia Priest; and researchers Scott Christianson and Tamar Gordon.` | body |
| `about.ts:24` | `howItWorks.header` | `How the Tour Works` | H2 (`about.astro:33`) |
| `about.ts:25` | `howItWorks.kicker` | `On the sidewalk` | **dead string — not rendered** |
| `about.ts:27` | step 1 | `Start at the Memorial Kiosk` | ordered list |
| `about.ts:29` | step 2 | `Follow the map to visit five historic locations from 1860:` | ordered list |
| `about.ts:31` | bullet | `Holeur's Fashionable Bakery` | **tour bullet** |
| `about.ts:32` | bullet | `The Mutual Bank Building` | **tour bullet** |
| `about.ts:33` | bullet | `Uri Gilbert's Mansion` | **tour bullet** |
| `about.ts:34` | bullet | `Washington St. Ferry Landing` | **tour bullet** |
| `about.ts:35` | bullet | `Peter Baltimore's Barbershop` | **tour bullet** |
| `about.ts:39` | step 3 | `At each stop, scan the QR code on the plaque to learn:` | ordered list |
| `about.ts:46` | step 4 | `Use the map to begin the tour.` | ordered list |
| `about.ts:51-52` | `charles.header/kicker` | `Charles Nalle` / `Freedom Seeker` | section H2 + eyebrow |
| `about.ts:63` | closing attribution | `Scott Christianson` | figcaption |
| `about.ts:68-69` | `mark.header/kicker` | `Mark Priest` / `Painter & Professor` | section H2 + eyebrow |
| `about.ts:77-78` | `scott.header/kicker` | `Scott Christianson` / `Author` | section H2 + eyebrow |

---

## B · Every conflict

**25 conflicts.** P0 = two names for one thing render on the *same screen*; P1 = two names for one
thing render on different screens; P2 = variant/voice drift.

| # | Pri | Thing | Variant A (file:line) | Variant B (file:line) | Further variants | Where it shows |
|---|---|---|---|---|---|---|
| B1 | **P0** | Chapter 2 place | `Commissioner's Office` — `commissioners-office.json:8` | `Office of the Commissioner` — `commissioners-office.json:5` + hero `:4` | `The Law Office` — `:30`, `:33`; `The Mutual Bank Building` — `about.ts:32` | `/map` shows the pill (A) and the card (B) **simultaneously**; `/bakery` shows the embed pill (A, `[chapter].astro:294`) directly above the next line (B, `:304`) |
| B2 | **P0** | Chapter 3 place | `Gilbert Mansion` — `mansion.json:8` | `Uri Gilbert Mansion` — `mansion.json:5` / hero `:4` | `Mansion` — `Menu.astro:18`; `Uri Gilbert's Mansion` — `about.ts:33`; **`URI GILBERT HOME` — `PL p.1` (bronze)** | `/map` pill + card together; menu; About; the physical plaque |
| B3 | **P0** | Chapter 4 place | `Ferry Landing` — `ferry.json:8` | `Washington Street Ferry Landing` — `ferry.json:5` / hero `:4` | `Ferry` — `Menu.astro:19`; `Washington St. Ferry Landing` — `about.ts:34` | `/map` pill + card together; menu; About |
| B4 | **P0** | Chapter 1 place | `Bakery` — `bakery.json:8` | `Holeur's Fashionable Bakery` — `bakery.json:5` / hero `:4` | `George Holeur's Bakery` — `PL p.3` body | `/map` pill + card together |
| B5 | **P0** | Chapter 5 place | `Barbershop` — `barbershop.json:8` | `Peter Baltimore's Barbershop` — `barbershop.json:5` / hero `:4` | — | `/map` pill + card together |
| B6 | **P0** | Next-chapter naming system | embed pill uses `map.label` — `[chapter].astro:294` | line beneath uses `next.label` long form — `[chapter].astro:304` | — | Every chapter's Section 4/4 shows both names, stacked |
| B7 | **P0** | Map a11y name ≠ visible name | pill text `map.label` — `TroyMap.tsx:104` | `aria-label` `cardTitle` — `TroyMap.tsx:292`, `:697`, `:698` | — | All 5 stops: sighted user sees "Commissioner's Office", screen reader says "Office of the Commissioner" |
| B8 | **P0** | Arrival plate vs pill | plate `cardTitle` — `TroyMap.tsx:583` | pill under the camera `map.label` — `:104` | — | QR deep-link arrival (`?stop=`) — **the sidewalk-scan first impression** |
| B9 | **P1** | `next.label` pattern | `Chapter {n} — {cardTitle}` — `bakery.json:107`, `commissioners-office.json:169`, `mansion.json:117`, `ferry.json:119` | `Chapter 1 — Where the story began` — `barbershop.json:119` | — | Chapter 5 Section 4/4 |
| B10 | **P1** | Curtain label source | menu uses hardcoded `name` — `Menu.astro:71` (`Mansion`, `Ferry`) | everything else uses `map.label` — `map.astro:60`, `people.astro:78`, `paintings.astro:93`, `[chapter].astro:308`, `TroyMap.tsx:525` | — | Same destination, two different full-screen curtain words depending on entry point |
| B11 | **P1** | Menu list is a hardcoded duplicate | `Menu.astro:16-20` (5 rows: order + short name) | `getCollection("chapters")` — `map.astro:11` | — | Already drifted for stops 3 & 4; will drift again on any rename |
| B12 | **P1** | `PIN_ABOVE` duplicates a label string | `TroyMap.tsx:39` `new Set(["Commissioner's Office"])` | `commissioners-office.json:8` | — | Not visible, but renaming stop 2 silently drops the pin below and collides stops 2 & 5 (~50 m apart) |
| B13 | **P1** | People chips vs chapter identity | `Ch. 3 · Gilbert Mansion` — `people.astro:78` via `:12` (`map.label`) | chapter `<title>` `Uri Gilbert Mansion` — `[chapter].astro:45` | hero `URI GILBERT MANSION` | Click-through from People lands on a differently-named page |
| B14 | **P1** | About tour list vs canon | `about.ts:31-35` (5 bullets) | chapter `cardTitle`s | `The Mutual Bank Building` is the name Brian explicitly asked to retire (`KC p.2`) | About page "How the Tour Works" |
| B15 | **P1** | Peter Baltimore's shop location | `barbershop at Troy House` — `people.ts:31` | `First Street (Athenaeum building)` — `barbershop.json:13` | Kathy's handwriting `Athenaeum 1st Street` — `WE p.15`; `find work at the Troy House` — `barbershop.json:104` | People card vs map index sub-line |
| B16 | **P1** | Henry Wale | `Henry "Jack" Wale` — `people.ts:86` | `Henry J. Wale` — `bakery.json:80`, `commissioners-office.json:132` | `Henry Jack Wale` — `WE p.2` | People card vs narrative |
| B17 | **P1** | Marshal Holmes | `Deputy U.S. Marshal Holmes` — `people.ts:92` | `United States Deputy Marshal Holmes` — `bakery.json:75` (quote attribution) | `Marshal Holmes` in prose; `US Marshall Holmes` — `WE p.11` | People card vs Chapter 1 quote figcaption |
| B18 | **P1** | Martin Townsend | `Martin I. Townsend` — `people.ts:35` | `Abolitionist Martin Townsend` — `commissioners-office.json:88` | `Martin Townsend` in prose; `Martin I. Townsend` — `WE p.2` | People card vs Chapter 2 quote figcaption |
| B19 | **P1** | Horatio Averill | `Horatio F. Averill` — `people.ts:80` | `Horatio Averill` — `commissioners-office.json:92` | `Horatio F. Averill` — `WE p.2` | People card vs narrative |
| B20 | **P1** | William Henry's chapter link | `chapters: ["commissioners-office"]` — `people.ts:50` | the only narrative mention is `Mr. Henry` in `mansion.json:101` (Chapter **3**) | `WE p.2` "Charles Nalle's Landlord" | His card links to a chapter that never names him |
| B21 | **P1** | Uri Gilbert's office | `later mayor of Troy` — `people.ts:43` | `FORMER MAYOR OF TROY` — `PL p.1` | `former mayor and business owner` — `WE p.2`; `Uri Gilbert was mayor of Troy` — `mansion.json:29` | People card vs bronze plaque |
| B22 | **P1** | Uri Gilbert's wealth | `one of Troy's wealthiest men` — `mansion.json:88`; `one of Troy's wealthiest individuals` — `about.ts:56` | Kathy struck **"Richest Man"** — `WE p.2` | plaque says only "FORMER MAYOR OF TROY" | Chapter 3 narrative + About |
| B23 | **P2** | Section link voice | `The People of this day` / `About the memorial` — `[chapter].astro:335`, `:337` | `The People` / `About` — `Menu.astro:78`, `:80` | — | Chapter footer vs menu |
| B24 | **P2** | Scene-label capitalization | `How It Began` — `mansion.json:51`; `Freedom Is Bought` — `barbershop.json:56` | `How it Began` — `WE p.10`, `p.15`; `Freedom is Bought` — `WE p.10`, `p.18` | — | `aria-label` only (not visible) |
| B25 | **P2** | A sixth, un-named location | `Start at the Memorial Kiosk` — `about.ts:27` | no kiosk exists in the 5 chapters, the map, or the 4-plaque set (`PL`) | — | About page step 1 |

---

## C · Cross-check against the requested-changes ledger

**36 ledger items: 12 NOT APPLIED (2 of them unverifiable without the marked artwork) · 9 PARTIAL ·
2 UNRESOLVED open questions · 13 APPLIED.** The 21 items that are not fully applied are the
substance of the client's complaint.

| # | Requested change (source) | Current code state | Verdict | file:line to fix |
|---|---|---|---|---|
| C1 | Map label `Bank` → the commissioner's office (`KC p.2`, Brian Tolle 6/4/26: *"the only label on the map that will need to change is the 'Bank' label… it was the commissioner's office. I think I labeled it 'Courthouse', which is incorrect"*; `CS:15`) | `map.label` = `Commissioner's Office` | **APPLIED** (pill) — but the same page's card still reads "Office of the Commissioner" | — / see C2 |
| C2 | Same, applied system-wide (implied by C1 + `PL p.4` headline `COMMISSIONER'S OFFICE`) | hero + card + `<title>` + next-label + audio subtitles all read "Office of the Commissioner" | **NOT APPLIED** | `commissioners-office.json:4,5,64,107`; `bakery.json:107` |
| C3 | Plaque headline canon `BAKERY` (`PL p.3`) | `map.label` = `Bakery` | **APPLIED** | — |
| C4 | Plaque headline canon `BARBERSHOP` (`PL p.2`) | `map.label` = `Barbershop` | **APPLIED** | — |
| C5 | Plaque headline canon `COMMISSIONER'S OFFICE` (`PL p.4`) | `map.label` matches; nothing else does | **PARTIAL** | `commissioners-office.json:4,5` |
| C6 | **Plaque headline canon `URI GILBERT HOME`** (`PL p.1`) | The string "Uri Gilbert Home" appears **nowhere in the repo**. Site uses Uri Gilbert Mansion / Gilbert Mansion / Mansion / Uri Gilbert's Mansion | **NOT APPLIED** | `mansion.json:4,5,8`; `Menu.astro:18`; `about.ts:33`; `commissioners-office.json:169` |
| C7 | Short-name system used by the plaque bodies — "…ESCORTED TO **THE COMMISSIONER'S OFFICE**" (`PL p.3`), "…HIS ESCAPE TO **THE FERRY LANDING**" (`PL p.4`) | `next.label` uses long `cardTitle` forms; the sidewalk visitor reads one name in bronze and a different one on the phone | **NOT APPLIED** | `bakery.json:107`; `commissioners-office.json:169`; `mansion.json:117` |
| C8 | Character sheet spelling **"Horatio"** (handwritten over "Hotratio", `WE p.2`; `CS:16`) | `Horatio F. Averill` | **APPLIED** | — |
| C9 | Character sheet **"Captain"** Hawk (handwritten over "Capitan", `WE p.2`) | `Captain Hawk` | **APPLIED** | — |
| C10 | Character sheet: Uri Gilbert = *former mayor and business owner*, **"Richest Man" struck through** (`WE p.2`; `CS:16`) | `people.ts:43` "later mayor"; `mansion.json:88` "one of Troy's wealthiest men"; `about.ts:56` "one of Troy's wealthiest individuals" | **NOT APPLIED** | `people.ts:43`; `mansion.json:88` (→ §E); `about.ts:56` |
| C11 | Character cards must use the corrected descriptions (`CS:16`) | Cards exist and mostly follow the sheet, but 3 of 14 diverge (C10, B16, B17) and 6 sheet characters are missing (C24) | **PARTIAL** | `src/data/people.ts` |
| C12 | Church bells = **Second Street Presbyterian**, not Liberty St (`CS:10`) | `commissioners-office.json:94` and `:152` both say Second Street Presbyterian; the 1847 convention fact correctly keeps Liberty Street (`:143`) | **APPLIED** (text) — **Ch2 Pt1 audio still says Liberty St** | `public/audio/ch2-commissioners-office-pt1.mp3` (re-record) |
| C13 | Portal history: landlord → **employer** (`CS:11`; original wording visible at `WE p.7` "until his landlord") | `commissioners-office.json:33` reads "until his employer" | **APPLIED** | — |
| C14 | Scene 5: Nalle boarded a waiting **skiff** — no leap into the river (`CS:12`; original at `WE p.9` + `WE p.17` quote "Hands bound, he leaped into the river") | Portal rewritten (`ferry.json:32`, no leap) but the scene narrative still reads "Charles hurled himself into the cold embrace of the dark and forbidding Hudson" | **PARTIAL** | `ferry.json:89` → **§E1, needs sign-off** |
| C15 | Ferry portal fact 2 still says "leaped into the river"? (`WE p.9`) | `ferry.json:30` now reads "Charles was helped onto a boat at the ferry landing" — leap removed | **APPLIED** | — |
| C16 | Scene 2 quote addressed to **"Peter (Baltimore)"** + the word **"them"** (`CS:13`) | "them" present (`commissioners-office.json:94`, `:126`, `:131`); the "addressed to Peter" framing is absent | **PARTIAL** | `commissioners-office.json:127` → **§E8** |
| C17 | Barbershop portal gets the **Athenaeum building image** (`CS:14`; Kathy's handwriting "Athenaeum 1st Street" under the stereo photo, `WE p.15`) | No `athenaeum*` asset anywhere in `public/media/` | **NOT APPLIED** — asset undelivered | `public/media/barbershop/` |
| C18 | **Peter Baltimore portrait** (Kathy's handwriting "Peter Baltimore" under the framed portrait, `WE p.15`) | No portrait asset; `people.astro` renders no images at all | **NOT APPLIED** — asset undelivered | `public/media/`, `people.astro:65-83` |
| C19 | Scene 3 painting **"move to Scene 5"** (Kathy's handwriting, `WE p.14`) | Cannot be verified from code — the marked painting is not identifiable by filename. Ferry's reveal set is `sketch`/`horizontal` (`ferry.json:94-99`) | **NOT APPLIED / UNVERIFIABLE** | needs the marked image identified before any move |
| C20 | One painting **"should be in escape + river"** (Kathy's handwriting, `WE p.14`) | Same as C19 | **NOT APPLIED / UNVERIFIABLE** | as above |
| C21 | Scene 5 photo is the **"Pliny Moore grain elevator"** (Kathy's handwriting, `WE p.17`) | The ferry historical image has no caption; its alt is the generic `Historical photograph — Washington Street Ferry Landing` | **NOT APPLIED** | `[chapter].astro:198` (needs a per-image caption field) |
| C22 | Scene 1 name **"Captured w/ Bread in Hand"** (`WE p.11`; the index at `WE p.10` mis-types "Bead") | `Captured with Bread in Hand` | **APPLIED** | — |
| C23 | Scene names 2 & 3 (`WE p.10`, `p.12`, `p.13`) | `Part 1 — Tubman Creates a Crowd` / `Part 2 — The Mob` | **APPLIED** (prefixed for the merged chapter) | — |
| C24 | Character sheet cast completeness (`WE p.2`) — Mrs. Gilbert, Orsamus Eaton, William A. Beach, George Gould, "Peter" (Nalle's original owner), The Hansbroughs | None have People cards. Beach and Gould are named only inside `commissioners-office.json:146` | **NOT APPLIED** | `src/data/people.ts` |
| C25 | Character sheet **"Martin I. Townsend"** (`WE p.2`) | Card has the initial; both quote attributions and prose omit it | **PARTIAL** | `commissioners-office.json:88` → **§E9** |
| C26 | Character sheet **"Henry Jack Wale"** (`WE p.2`) | Card `Henry "Jack" Wale`; prose `Henry J. Wale` | **PARTIAL** | `people.ts:86` |
| C27 | Character sheet **"William Henry — Charles Nalle's Landlord"** (`WE p.2`) | Card role is `Grocer · first alarm` (landlord dropped); `mansion.json:101` keeps "Charles's landlord" | **PARTIAL** | `people.ts:48-50` |
| C28 | Character sheet **"William A. Beach — Bank Director; bank is where the commissioner's office is and law firm"** (`WE p.2`) | `commissioners-office.json:146` calls him "Commissioner William A. Beach"; no card | **PARTIAL** | `people.ts` (add); `commissioners-office.json:146` → **§E** |
| C29 | Ferry plaque location = *"the river front at the end of Madison Street where there is a little park"* (`KC p.1`, Kathy via Brian Clyne 11/1/24) | `ferry.json:13` = `Riverfront at the end of Madison Street` | **APPLIED** | — |
| C30 | A ferry plaque was planned (`KC p.1`) | The June 2026 production set has **4** plaques, no ferry (`PL p.1-4`); `ferry.json:6` `plaque:false`; `map.astro:51` says "Four stops carry bronze plaques" | **APPLIED as built** — but **open question**: was the ferry plaque cancelled or deferred? | confirm with Brian/Kathy |
| C31 | Portal page names (`WE p.4`): Gilbert Mansion · Bakery · Mutual Bank Building · Barbershop · Ferry Landing | Bakery ✓, Barbershop ✓, Ferry Landing ✓, Gilbert Mansion ✓ (but superseded by `PL p.1`), Mutual Bank Building **retired everywhere except** `about.ts:32` | **PARTIAL** | `about.ts:32` |
| C32 | About tour list should carry the canon names | `Holeur's Fashionable Bakery` ✓; `The Mutual Bank Building` ✗; `Uri Gilbert's Mansion` ✗; `Washington St. Ferry Landing` ✗; `Peter Baltimore's Barbershop` ✓ | **NOT APPLIED** | `about.ts:32,33,34` |
| C33 | Open question: About credits "Jame Lang" — is it "James Lang"? (`CS:31`) | Still `Jame Lang` | **NOT APPLIED** — awaiting answer | `about.ts:19` |
| C34 | Open question: ferry fact "briefly captured again upon landing" consistent with the skiff correction? (`CS:32`) | Retained verbatim | **UNRESOLVED** | `ferry.json:31` |
| C35 | Open question: confirm the walking order matches the final plaque route 1→5 (`CS:33`) | Order 1–5 = Bakery, Commissioner's, Mansion, Ferry, Barbershop. `PL` carries no route numbers; the Gilbert plaque says "NALLE LEFT FOR THE BAKERY FROM THIS GRAND HOUSE" — i.e. the house precedes the bakery in real time | **UNRESOLVED** | `*.json:2` (`order`) — **§E12** |
| C36 | Typo pass "Houler's" → "Holeur's" (`CS:27`) | `Holeur's` everywhere; `George Holeur` on the People card; matches `WE p.2` + `PL p.3` | **APPLIED** | — |

**The five NOT-APPLIED items that matter most:**

1. **C6 — `URI GILBERT HOME` is missing from the entire codebase** while that exact name is being cast in bronze right now.
2. **C2 — "Office of the Commissioner" was never retired.** Brian's correction was applied to the map pill only, so both names ship side by side on `/map` and on every Chapter-1 "where to next" screen — this is the conflict the client can see in one glance.
3. **C10 — Kathy struck "Richest Man" in 2024 and it is still on the site twice**, and "former mayor" became "later mayor," contradicting the plaque.
4. **C17 + C18 — the Athenaeum photo and the Peter Baltimore portrait were requested in 2024 and have never been delivered**, so Chapter 5 and the entire People page run without their two most important historical images.
5. **C7 / C32 — the sidewalk-to-screen name handoff is broken.** The bronze says "THE COMMISSIONER'S OFFICE" and "THE FERRY LANDING"; the About page says "The Mutual Bank Building" and "Washington St. Ferry Landing."

---

## D · The canon

### D.1 — Chapters

Schema (`src/content.config.ts`): replace `title` / `cardTitle` / `map.label` with one object
`name: { canonical, display, short }`. Derivations: hero H1 ← `display`; cards / `<title>` /
People chips / arrival plate / map `aria-label` ← `canonical`; map + embed pills, menu, curtain
← `short`; `next.label` ← **generated** `"Chapter {order} — {canonical}"` (delete the stored field).

| # | order | canonical | display (`\n` = designed break) | short | address (as in JSON) | plaque | verdict vs the starting proposal |
|---|---|---|---|---|---|---|---|
| 1 | `1` (`bakery.json:2`) | **Holeur's Fashionable Bakery** | `HOLEUR'S\nFASHIONABLE\nBAKERY` | **Bakery** | `3rd & Division Streets (vacant lot today)` (`bakery.json:13`) | `true` | **CONFIRMED.** `WE p.6` uses the full name; `PL p.3` headline is `BAKERY`, body "GEORGE HOLEUR'S BAKERY". No change. |
| 2 | `2` (`commissioners-office.json:2`) | **The Commissioner's Office** | `COMMISSIONER'S\nOFFICE` | **Commissioner's Office** | `5 State Street — Mutual Bank Building` (`:13`) | `true` | **CHANGED from the proposal.** The proposal's canonical "Office of the Commissioner" has **no source** — it is an artefact of the v2 port. `PL p.4` casts the headline as `COMMISSIONER'S OFFICE` **broken across exactly those two lines**, its body says "THE COMMISSIONER'S OFFICE", `PL p.3` says "ESCORTED TO THE COMMISSIONER'S OFFICE", and Brian's 6/4/26 mail (`KC p.2`) names it "the commissioner's office". Canonical and short converge, so they can never disagree again. Keep "Mutual Bank Building" as the **address**, never as the name. |
| 3 | `3` (`mansion.json:2`) | **Uri Gilbert Mansion** ⚠️ *decision required* | `URI GILBERT\nMANSION` | **Gilbert Mansion** | `189 Second Street` (`mansion.json:13`) | `true` | **PROPOSAL HELD, BUT ESCALATED.** Two client sources disagree: `WE p.4`/`p.5` (2024) say "Gilbert Mansion" / "The Uri Gilbert Mansion"; **`PL p.1` (June 2026, in production) casts `URI GILBERT HOME`.** Bronze is permanent and is the newest instruction, so the safe default is the site follows the bronze. Do **not** change this on a subagent's authority — see §E13. |
| 4 | `4` (`ferry.json:2`) | **Washington Street Ferry Landing** | `WASHINGTON\nSTREET FERRY\nLANDING` | **Ferry Landing** | `Riverfront at the end of Madison Street` (`ferry.json:13`) | `false` | **CONFIRMED.** `WE p.4`/`p.9` say "Ferry Landing"; `PL p.4` body says "THE FERRY LANDING"; the "Washington Street" qualifier comes from the narrative (`ferry.json:87`) and nothing contradicts it. Address confirmed verbatim by `KC p.1`. `plaque:false` confirmed by the 4-plaque set. |
| 5 | `5` (`barbershop.json:2`) | **Peter Baltimore's Barbershop** | `PETER\nBALTIMORE'S\nBARBERSHOP` | **Barbershop** | `First Street (Athenaeum building)` (`barbershop.json:13`) | `true` | **CONFIRMED.** `WE p.8` uses the full name; `PL p.2` headline `BARBERSHOP`, body "PETER BALTIMORE'S BARBERSHOP". Address matches Kathy's handwritten "Athenaeum 1st Street" (`WE p.15`). |

**Downstream, once the canon lands:**

- `Menu.astro:16-20` — delete the hardcoded array; generate from `getCollection("chapters")` as
  `{order}. {short}`. Fixes B10, B11.
- `TroyMap.tsx:39` — replace `PIN_ABOVE` with a `pinPosition: "above" | "below"` field in JSON
  (stop 2 `above`, the rest `below`). Fixes B12.
- `TroyMap.tsx:292`, `:697`, `:698`, `:583` — use `canonical` (already do, via `cardTitle`); the pill
  at `:104` uses `short`. Once `short` is genuinely short *and* the card is genuinely canonical,
  B7/B8 become an intentional long/short pairing rather than a contradiction.
- `about.ts:31-35` — replace the five bullets with the five `canonical` values.
- `barbershop.json:119` — the free-text `next.label` dies with the generated rule (B9).

### D.2 — People

Canonical from the character sheet (`WE p.2`) **with Kathy's handwritten marks honoured**.

| current (`people.ts`) | proposed canonical | source / note |
|---|---|---|
| `Charles Nalle` (`:17`) | **Charles Nalle** | `WE p.2` "Main Character" — no change |
| `Harriet Tubman` (`:23`) | **Harriet Tubman** | `WE p.2` — no change |
| `Peter Baltimore` (`:29`) | **Peter Baltimore** | `WE p.2` "Black Barbershop Owner" — no change. **But fix the shop's location in the note** (`:31` says "at Troy House"; Kathy's mark says Athenaeum, 1st Street) → §E7 |
| `Martin I. Townsend` (`:35`) | **Martin I. Townsend** | `WE p.2` — keep the initial on the card; leave prose alone (§E9) |
| `Uri Gilbert` (`:41`) | **Uri Gilbert** | `WE p.2` — name fine; **role/note (`:42-43`) must read "former mayor of Troy and business owner"**, never "richest" (`PL p.1`, `WE p.2` strike-through) |
| `William Henry` (`:47`) | **William Henry** | `WE p.2` "Charles Nalle's Landlord" — restore the landlord fact (`:48-49`); re-point `chapters` (`:50`) to include `mansion` (B20) |
| `Captain Hawk` (`:53`) | **Captain Hawk** | `WE p.2` handwritten — no change |
| `Billy Loreman` (`:59`) | **Billy Loreman** | `WE p.2` — no change |
| `George Holeur` (`:65`) | **George Holeur** | `WE p.2`, `PL p.3` — no change |
| `Blucher Hansbrough` (`:74`) | **Blucher Hansbrough** | `WE p.2` "Blucher — Half brother to Charles Nalle" — no change |
| `Horatio F. Averill` (`:80`) | **Horatio F. Averill** | `WE p.2` handwritten "Horatio" — no change |
| `Henry "Jack" Wale` (`:86`) | **Henry J. "Jack" Wale** *(recommended)* | reconciles the card with the prose `Henry J. Wale` and the sheet's `Henry Jack Wale` — §E9 |
| `Deputy U.S. Marshal Holmes` (`:92`) | **United States Deputy Marshal Holmes** *(recommended)* | matches the Chapter 1 quote attribution (`bakery.json:75`); changing the *attribution* instead would be a §E9 edit |
| `Thomas Parr` (`:98`) | **Thomas Parr** | `WE p.2` — no change |
| — *(missing)* | **William A. Beach** — Commissioner / bank director | `WE p.2`; already named at `commissioners-office.json:146` |
| — *(missing)* | **George Gould** — State Supreme Court judge | `WE p.2`; already named at `commissioners-office.json:146` |
| — *(missing)* | **Mrs. Gilbert**, **Orsamus Eaton**, **Peter Hansbrough**, **The Hansbroughs** | `WE p.2` — cast completeness (C24); needs Kathy's read before publishing |

### D.3 — Site title, wordmark, tagline

| string | current (file:line) | verdict |
|---|---|---|
| Site name | `Charles Nalle Walking Memorial` — `Base.astro:41` | **CONFIRMED / LOCKED.** All four bronzes are headlined `CHARLES NALLE WALKING MEMORIAL` (`PL p.1-4`); Brian uses it verbatim (`QR p.1`). Never abbreviate. |
| `<title>` pattern | `{Page} — Charles Nalle Walking Memorial`; home inverts to `Charles Nalle Walking Memorial — Troy, NY` (`index.astro:12`) | **KEEP.** Change only the chapter case to feed from `canonical` (`[chapter].astro:45`). |
| Wordmark | stacked `Charles` / `Nalle` — `index.astro:56-57`, `Base.astro:66-67`, `curtain.ts:42-43` | **CONFIRMED** — consistent in all three places. |
| Place line | `Troy, NY` — `index.astro:54`; `Charles Nalle Walking Memorial · Troy, NY · Stop {n} of 5` — `[chapter].astro:56` | **CONFIRMED.** |
| Date line | `April 27, 1860` — `curtain.ts:20`, `TroyMap.tsx:575`, `[chapter].astro:46` | **CONFIRMED** by `WE p.6`. |
| Life dates | `1821` — `1875` — `index.astro:60`, `:62` | 1821 is corroborated (`about.ts:55`, "In 1821, Charles Nalle was born into slavery"). **1875 has no source in any Context PDF** → verify with Hart Cluett before launch. |
| Tagline / mission | `The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy and the story of Charles Nalle` — `index.astro:79-81`, `:84-85` | **NO LEDGER SOURCE.** "a digital physical experience" reads as a dropped conjunction; recommend "a digital and physical experience". Copy fix, not a canon change — get Wil's call. |
| Walk sub-line | `The Walk · Five stops · April 27, 1860` — `TroyMap.tsx:575` | **CONFIRMED** (five stops, four plaques — `map.astro:51` states the distinction correctly). |

---

## E · Flag, do not edit — needs human sign-off

Kathy Sheehan's prose is sacred. Every item below would change **narrative meaning, a historical
claim, or a quotation** — none may be touched by a naming pass. Items marked 🔊 also desynchronise
an existing audio recording (`docs/CONTENT-STATUS.md` audio inventory).

| # | Where | What | Why it needs sign-off |
|---|---|---|---|
| E1 🔊 | `ferry.json:89` | *"Charles hurled himself into the cold embrace of the dark and forbidding Hudson."* | Kathy's correction says he **boarded a waiting skiff — no leap** (`CS:12`). Removing the leap deletes the scene's dramatic centre and desyncs `ch4-ferry.mp3`. Needs Kathy's replacement text + a re-record. |
| E2 🔊 | `barbershop.json:89` | *"As the distance between Charles and the Commissioner's office grew…"* | The same paragraph places the action at the **justice's office in Corporation Hall, Watervliet** — not the Troy commissioner's office. Likely an error, but correcting it rewrites Kathy's sentence and desyncs `ch5-barbershop.mp3`. |
| E3 | `commissioners-office.json:30`, `:33` | Portal history calls the room **"The Law Office"** | A third name for Chapter 2's place, rendered on the same page as the pill and card. Renaming it to "the Commissioner's Office" would flatten a real distinction (a law firm inside the bank building). Kathy to rule. |
| E4 🔊 | `mansion.json:88` | *"one of Troy's wealthiest men"* | Kathy struck **"Richest Man"** on the character sheet (`WE p.2`). `CS:16` records the phrase as deliberately retained. Client-visible; desyncs `ch3-mansion.mp3`. Re-confirm. |
| E5 | `about.ts:56` | *"Uri Gilbert, one of Troy's wealthiest individuals"* | Same struck claim, on the About page. Not story prose, but a historical characterisation Kathy marked. |
| E6 | `people.ts:43` | *"Railcar magnate and **later** mayor of Troy"* | The bronze says **FORMER MAYOR OF TROY** (`PL p.1`) and the sheet says "former mayor" (`WE p.2`). "Later" reverses the chronology. Factual — Hart Cluett must rule. |
| E7 | `people.ts:31` | *"high-class barbershop **at Troy House**"* | `barbershop.json:13` and Kathy's handwriting (`WE p.15`) place the shop in the **Athenaeum, First Street**; `barbershop.json:104` uses Troy House only as where he found freedom-seekers work. Factual location claim. |
| E8 🔊 | `commissioners-office.json:94`, `:126-127`, `:131` | Tubman's quotation + attribution | `CS:13` still carries an unresolved correction: the line should be framed as addressed to **"Peter (Baltimore)"**. Quotation wording is Kathy's alone; affects `ch2…pt2.mp3`. |
| E9 | `bakery.json:75`; `commissioners-office.json:88` | Quote attributions `United States Deputy Marshal Holmes`, `Abolitionist Martin Townsend` | Attributions are part of the quotation apparatus, not labels. Reconcile them with the People cards **only** with Kathy's approval (see D.2). |
| E10 | `mansion.json:101` | *"Mr. Henry, a Black grocery store owner and Charles's landlord"* | Reconciling this with `people.ts:48-50` ("Grocer · first alarm") changes a historical relationship. |
| E11 | `commissioners-office.json:146` | *"Commissioner William A. Beach"* | The character sheet calls Beach a **bank director** whose bank housed the commissioner's office (`WE p.2`). Whether he *was* the commissioner is a factual question. |
| E12 | all five `*.json:2` (`order`) | Chapter order 1–5 = Bakery, Commissioner's, Mansion, Ferry, Barbershop | `CS:33` is still open. The Gilbert plaque says "NALLE **LEFT FOR THE BAKERY** FROM THIS GRAND HOUSE ON THE DAY OF HIS CAPTURE" (`PL p.1`) — the house precedes the bakery in real time, while the site places it third as a flashback. Reordering changes the story's structure and every plaque QR target. Brian + Kathy decision. |
| E13 | `mansion.json:4`, `:5`, `:8` (+ `Menu.astro:18`, `about.ts:33`, `commissioners-office.json:169`) | **Uri Gilbert Mansion → Uri Gilbert Home?** | This is a *label* change, but it puts the website in conflict with either the 2024 storyboard or the bronze now being cast. Because the plaque is permanent and is the newest instruction, the recommendation is to follow the bronze — **but only Wil/Brian/Kathy may authorise it.** Highest-risk naming decision in the project. |
| E14 | `mansion.json:26` | `portal.hook`: *"People will ignore your efforts to steal your opportunities."* | Verbatim author content from `WE p.5` that **renders nowhere in v2** — the only chapter with a hook, and it is dead data. Either build the surface or retire the field; do not silently delete authored words. |
| E15 | `commissioners-office.json:159-165` | The second moral, `FREEDOM ISN'T FREE` | `[chapter].astro:40` renders `morals[0]` only, so an entire authored moral + call to action is invisible. Content loss, not a naming bug — needs a decision, not a rename. |

---

## F · Media inventory per chapter (`public/media/<slug>/`)

Every image key ships as five files (`-800.avif`, `-800.webp`, `-1440.avif`, `-1440.webp`,
`-1440.jpg`); every video key ships as `<key>.mp4` + `<key>-poster.jpg`. **Verified file-by-file
against each chapter's declared `media` block — declaration and disk agree exactly in all five
chapters: zero missing, zero orphaned.**

| chapter (`order`) | image keys on disk | video keys on disk | `reveal-horizontal` | `reveal-vertical` | posters | sketch | horizontal | historical | moral | square | gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `bakery` (1) | historical, horizontal, moral, sketch, square, vertical | historical, reveal-horizontal, reveal-vertical | ✅ | ✅ | ✅ (3) | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `commissioners-office` (2) | historical, historical-pt2, horizontal, horizontal-pt2, moral, moral-pt2, sketch, sketch-pt2, square, vertical, vertical-pt2 | historical, historical-pt2, reveal-horizontal, reveal-horizontal-pt2, reveal-vertical, reveal-vertical-pt2 | ✅ (+`-pt2`) | ✅ (+`-pt2`) | ✅ (6) | ✅ (+`-pt2`) | ✅ (+`-pt2`) | ✅ (+`-pt2`) | ✅ (+`-pt2`) | ✅ | no `square-pt2` (correct — one card per chapter) |
| `mansion` (3) | historical, horizontal, moral, sketch, square, vertical | historical, reveal-horizontal, reveal-vertical | ✅ | ✅ | ✅ (3) | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `ferry` (4) | historical, horizontal, moral, narrative1, narrative2, sketch, square, vertical | historical, narrative1, narrative2, reveal-horizontal, reveal-vertical | ✅ | ✅ | ✅ (5) | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| `barbershop` (5) | historical, horizontal, moral, narrative1, narrative2, sketch, square, vertical | historical, narrative1, narrative2, reveal-horizontal, reveal-vertical | ✅ | ✅ | ✅ (5) | ✅ | ✅ | ✅ | ✅ | ✅ | — |

Site-level (`public/media/site/`): `about-charles`, `about-mark`, `about-scott`, `about-barbershop`,
`home-bg`, `home-bg-horizontal`, `homepage-overlay` (webp only), `troy-1860`, `splash.mp4` +
`splash-poster.jpg`. Audio: all six MP3s present (`public/audio/`).

**Assets that are genuinely MISSING (never delivered, not broken references):**

| # | Asset | For | Source of the request | Blocks |
|---|---|---|---|---|
| F1 | **Athenaeum building photograph** (the stereo view Kathy annotated "Athenaeum 1st Street") | Chapter 5 portal / historical slot | `CS:14`, `WE p.15` | C17 — Chapter 5's historical image is currently *not* the building Kathy specified |
| F2 | **Peter Baltimore portrait** (the framed portrait Kathy annotated) | People page + Chapter 5 | `WE p.15` | C18 — the People page has **no portraits at all**; every card is text-only (`people.astro:65-83`) |
| F3 | **Pliny Moore grain elevator** identification/caption for the ferry historical photo | Chapter 4 | `WE p.17` | C21 — the image may already be on disk as `ferry/historical`, but nothing names it |
| F4 | **Per-image captions/credits field** in the schema | all chapters | implied by F3 | there is no caption field in `content.config.ts` — only generated alt text (`[chapter].astro:198`) |
| F5 | **`og.png` naming check** — `public/og.png` exists (50 KB) but its baked-in title text was not verified in this audit | social share | — | verify it does not carry a retired place name |

**Orphaned asset:** `public/media/site/about-barbershop-*` is built by `scripts/build-media.mjs:129`
but referenced nowhere in `src/` — a leftover from the legacy About page. Harmless, but it is the
only barbershop building image in the repo and may be worth checking against F1 before commissioning
a new scan.

---

## Summary counts

- **Displayed name/title/label strings inventoried:** 190+ across 17 files.
- **Conflicts:** **25** (8 × P0 same-screen, 14 × P1 cross-screen, 3 × P2 voice drift).
- **Ledger items cross-checked:** 36 → **13 APPLIED · 9 PARTIAL · 12 NOT APPLIED · 2 UNRESOLVED**
  (21 items not fully applied).
- **Canon changes vs the starting proposal:** 1 changed (Chapter 2), 1 escalated for human decision
  (Chapter 3), 3 confirmed.
- **Needs human sign-off:** 15 items (§E) — 5 of which also require an audio re-record.
- **Missing media:** 3 undelivered assets + 1 missing schema field + 1 verification item (§F).
