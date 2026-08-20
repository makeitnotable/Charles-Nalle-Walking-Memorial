# CNWM v8 — "The Final Five Percent" · Review guide for Wil

Run: 2026-08-19 → 2026-08-20, one autonomous session, from your recorded
review of 8/19 (desktop → tablet → mobile). The transcript was the authority:
where Gemini's bullet list and your spoken words disagreed, your words won,
and two requests you **rescinded mid-meeting** were recorded as deliberate
no-ops so nobody "fixes" them later (below, §5).

Constitution: `docs/PLAN.md`. Ledger of every commit: `docs/RUN-STATE.md`.
The audit that preceded every change — 40 items, each with file:line, the
measured current value, the planned fix and its instrument:
`docs/v8/AUDIT.md`. Live: https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/
— every push to `v2` deploys; each push was verified against its exact
commit sha in the deploy workflow.

Kathy's story prose is untouched. Four **client-directed copy changes** you
dictated (home sentence, map heading and body, People subtext, About "fifth
location") are logged verbatim — dictation vs. shipped — in
`docs/CONTENT-STATUS.md`.

---

## 1 · What you asked for, and what shipped

*In the order you walked the site. Item IDs are the audit's.*

### Global

| # | You said | Shipped |
|---|---|---|
| V8-001 | "Spot" should be "location" anywhere it appears | 24 template strings + 4 sentences of prose. Walk-card eyebrows, the map index, the where-to-next label, the museum plaque and the grid all read **Location NN**; the word "Next" is gone from the chapter label. |
| V8-002 | Buttons feel wide and scrunched — top/bottom padding should optically match left/right | `.btn` 52 px tall on a 22 px inset, `.btn-sm` 40/18, and icon-side trims so an arrow never leaves a fat gap at the end. Every button surface re-shot. |

### Home

| # | You said | Shipped |
|---|---|---|
| V8-101 | The splash reads low-res | Two causes. The one I can fix in-repo: the srcset was **advertising a 1440 w file that is 1080 px wide**, so the browser was upscaling on your desktop — it now tells the truth. The real fix needs source files from you (§4, first item). |
| V8-102 | "Five locations across the city mark where it happened." | Shipped, all three breakpoints. |
| V8-103 | Tablet: the lockup and Charles's head are clumped at the bottom | Portrait tablets fell through every media query to the base rule. They now have their own step: the head lifts (`object-position 50% 37%`), the lockup starts higher, and the block gaps open. |
| V8-104 | Mobile: "Walk the story" should hug its content; head and text up; the rag as a tight stack | The CTA hugs (233 px, centred) and the freed side margin became bottom air; the hero media scales about its bottom edge so the chin sits at 34.6 % instead of 40 %; the paragraph is an authored 7-line pyramid (18/29/36/38/31/30/23 ch) that only phones see. |

### The map

| # | You said | Shipped |
|---|---|---|
| V8-201 | Cards ride too high — bottom-align them (mobile "way too high") | The strip sits ON the inset at every width, and the three numbers that must agree (strip padding, the marker lift, the label-fade limit) are now derived from one measurement instead of three literals. |
| V8-202 | Card titles bigger and bolder | `.t-card` 20/25.5/30 px in the cream ink, authored line breaks intact. |
| V8-203 | Four corners: 1858 top-right with the date chip, "Take the walk" centred at the bottom on the ☰'s row | Done at every breakpoint; the 1858 door takes the secondary border on phones and the date chip centre-aligns to it (78/78 · 61/62 · 41/42 px). |
| V8-206 | Rotate the map a few degrees; keep the 3-D | Bearing 10 → 16, and the label-fit search still lands pitch 52 at every viewport. |
| V8-207 | Same pin style on mobile, with short names | Phones get the labelled pill and leader line: **Bakery · Commissioner · Mansion · Ferry · Barbershop** (a new `name.pin` in the content schema — a map shorthand only, never the bronze word). The phone camera search was still fitting v7's dot boxes, so a pill could sit 23 px off-screen; it now fits the real pill rectangles and all five are inside the frame. |
| V8-208 | "Five locations throughout Troy"; "four locations carry bronze plaques" | Shipped (CONTENT-STATUS). |
| V8-251 | Back / Walk again the same height | Equal, measured 40/40. |
| V8-252 | Hide the ☰ during the walk on every screen size | Hidden at all breakpoints while a stop is focused (and properly hidden from assistive tech, not just faded). |
| V8-261/262/263 | 1858 lens: delete the hint line, more air under the caption, open more zoomed on downtown | Hint gone, caption air 12 → 20 px, and the lens opens on downtown Troy with Green Island out of frame — verified by inspecting the corner of the opening shot at both 1440 and 390. |

### The chapters

| # | You said | Shipped |
|---|---|---|
| V8-271 | The archival chip should hug the image bottom; one line on mobile | Bottom gap now equals the right gap (20/20 phone · 40/20 tablet · 56/28 desktop). Ch2 phones read "Troy, New York · 1858" with the licence tail from 640 up. |
| V8-272 | Chapter H1 one step up on mobile, no hyphenation | 34.7 → 39.1 / 40.5 → 45.6 / 44.2 → 49.7 px at 390, still clearing the right edge (the type ramp's advance guard is now a variable a surface can tighten when it has *measured* its longest line). |
| V8-273 | The gap above the play button should match the gap below it | One token (`--player-rule-gap`), 27 px fine / 37 px coarse — every chapter, every breakpoint. |
| V8-274 | The artist study is tertiary — one step down | Study note → `t-meta-body`. |
| V8-275 | Moral backgrounds: position, a darker overlay, a slight blur | All three: per-moral focal points, scrim .86 → .90, and a 2 px blur (with a 1.04 scale so the blur never shows an edge). Reduced motion unaffected. |
| V8-276 | The ferry moral must show the same sketch as its study | It does — the ground was a different drawing entirely; regenerated from the study at the same file size. |
| V8-277 | Centre the hook headline + quote on mobile only | Centred on phones; the kicker and the audio block stay left. |
| V8-278 | Barbershop up — sills out of frame, the lady's face visible | Desktop is bottom-anchored (the 1440 frame had only 60 px of slack). Phones show the poster's **full height**, so no focal point could move it — a new `heroFocus.portraitScale` (1.18) lifts the image about its bottom edge. Sills gone; her face sits mid-frame. |
| V8-204 | Where-to-next: LOCATION NN up beside the heading, orange address chip, no Continue button, "Get directions" centred, the map itself is the link | All of it. The label bottom-aligns with the heading exactly (169/169 at 390 · 1304/1304 at 1440); the whole embed is one door to the next chapter; the pin pill is the solid-orange active idiom. |
| V8-205 | The dark fade over the map should be white/cream | Resolved by probe: what you saw was the **1858 plate's edge fade** between two cream sections on the commissioner's page. That fade is now cream; photo interludes keep the dark one. |

### The museum

| # | You said | Shipped |
|---|---|---|
| V8-320 | Plaque eyebrow → "Location 01"; attribution under the quote, same size, bold, not italic; barbershop pair renamed | Eyebrow is the location alone; the attribution takes the quote's own role in bold roman. The hall names the pair **Peter Baltimore's Barbershop 1 / 2**; the ferry keeps Narrative I/II and the stills grid keeps its narrative captions, per your 00:34:11. |
| V8-321 | The Skip arrow should point right | It does. |
| V8-322/323 | Face forward: desktop right-aligned with Skip; phones bottom-centre above the dots. Chip slightly above middle on tablet | Shipped per breakpoint. |
| V8-324 | Angle the camera down; the pan feels harsh | Rail pitch −0.10 → −0.15 (−0.12 portrait); yaw rein 0.0035 → 0.0022, pitch 0.0025 → 0.0018, and the coast decays faster. |
| V8-326 | Paintings should be alive by default; tapping stops them | The nearest works play by themselves (3 on desktop, 2 on phones/tablets) and tapping the focused one rests it. Nothing loads before your first scroll or touch, so the page's performance score is untouched; a software-GPU machine opens at rest instead. |
| V8-330 | On mobile the whole frame should be visible when a painting opens | It is — the fit is computed from whichever axis binds, and portrait may open the lens to 92°. |
| V8-331 | I should be able to click another painting and go straight to it | Done (this one was only in the transcript — Gemini's summary dropped it). |
| V8-328 | Drawer: no drag bar, an X to close, more room above it for the dots, and it should open by scrolling rather than dragging | The pill is gone; a 44 × 44 X closes it; the dots keep a constant 24 px above the sheet and now **ride it live** as it slides. The sheet is one continuous position driven by three inputs: the header drag, a vertical swipe anywhere on the stage (axis-locked so it never fights the look), and the wheel/trackpad — above the zoom floor the wheel zooms; at the floor, fingers-up opens the plaque and fingers-down closes it, with a short latch so one flick never tunnels through both. The painting recomposes while the drawer moves. |
| V8-329 | Put the artist study on the desktop card and the phone/tablet drawer, balanced, not competing with the painting | Under a hairline below the attribution: the graphite thumbnail, the label, and the chapter's own sentence about that drawing. The five main canvases take their chapter's study, the commissioner's Part 2 its own drawing; the narratives have none and omit the row. |
| V8-325 | "A big brown line at the side — they're not in their frames" | They are now. The canvas was floating 105 mm in front of the innermost moulding ring, so obliquely each painting read as a slab hovering off its frame. The profile steps in 15 mm — moulding, gilt lip, slip, then the painting 10 mm proud, which reads as a shadow line — and the in-plane steps widen with it, so the moulding is a touch more ornate from an angle. |
| V8-327 | The white rectangle at the end should be a Greek/Louvre archway you walk through and down the steps, with the dots gone during it | The end wall is one wall with a real arched opening (pilasters, archivolt, keystone), so the warm light beyond is shaped by the arch itself — an arch of light instead of the white rectangle. The last stretch of scroll carries you through it and down three steps (0.16 rise, 0.48 m in all), eyes dipping to the treads and levelling on the landing, with the chip, Skip and the dots clearing out as you go. The hand-off point is derived from the two distances so your walking speed never changes as the descent starts. |

### People and About

| # | You said | Shipped |
|---|---|---|
| V8-301 | The H1 should be three lines everywhere | It is; the v7 two-line desktop lockup is gone. |
| V8-302 | New subtext | "Every person below stood on the pavement that exists today. Their roles in the story are told in each chapter, location by location." — your dictation, grammar-normalized (§4). |
| V8-303 | Tablet: the second sentence on its own line | Authored break in the tablet band only. |
| V8-304 | The afterword attribution should break after the book's title | It does — and measured, the one-liner also overran at 1024–1440, so the break is authored at every width. |
| V8-305 | Mobile: names below the photographs, with breathing room | Phones read photo → NAME → prose (32 px above, 28 px below). The document order stays heading-first, so screen readers are unaffected. |
| V8-306 | The book title in Scott's bio should read nicely | Glued at phrase boundaries so it wraps as a title, never mid-phrase. |
| V8-307 | Centre the closer on mobile and tablet | Centred below 1024 (58/58 · 183/183 · 227/227 · 260/260); desktop unchanged; the People closer left alone, since you said "on the about page". |

### The footer

| # | You said | Shipped |
|---|---|---|
| V8-351 | Share under the wordmark, bottom-aligned with the nav; nav right | Exactly bottom-aligned (measured equal at 768/1024/1440); the nav column keeps its internal left alignment while sitting right. |
| V8-352 | Tighter link spacing, more air under "Made by Notable", the disclaimer as two lines | Shipped, with the disclaimer as two authored lines. |

---

## 2 · Instrument bars on the final build

Every number below was measured after the last change, not carried forward.

| Instrument | Result |
|---|---|
| `rag` — unauthored runts / ink clips / visible em dashes | **0 / 0 / 0** across 4,523 text blocks and 99 route × viewport passes |
| `contrast` (pixel mode) | **0 failures**, 0 unmeasured |
| `a11y` (axe, incl. reduced motion + 200 % zoom) | **0 serious/critical · 0 moderate · 0 minor** across 51 runs |
| `census` (type ladder) | one shared ladder across the five chapters; mansion and ferry carry one extra size each, which is the display fit-clamp shrinking their long names to fit — by design, not a new type role |
| `audio-check` | plays, highlights, only one player at a time, seek lands on the right paragraph, the mini-player collapses to a time pill at Onward |
| `frames` (curtain, 4× CPU) | **CLEAN** on all four runnable cases — 0 uncovered frames, 0 px shift. The two map cases cannot run here (Mapbox is blocked in this container), so the map→chapter curtain is the one transition still owed a look on the live site. |
| `museum-check` | draw calls **77 (79 landscape)** against the 80 budget; composition centred; no chrome findings |
| Lighthouse, production build | a11y **100 on every route**, CLS ≈ 0 everywhere. Performance: people 100 · about 100 · ferry 98 · bakery 97 · barbershop 97 · commissioners 96 · mansion 96 · map 95 · home 93 · paintings 64 |

**About those last numbers.** They are below the v7 bars (home 97, chapters
98–99, paintings 89), so I checked whether v8 caused it by building the
**pre-v8 commit** and running the same Lighthouse pass on the same machine
minutes apart. It scores the same: home 94 vs 93, commissioners 96 vs 96,
mansion 96 vs 96, paintings 64 vs 64 with blocking time within 0.4 %. The
gap is this QA container, which has no GPU — every 3-D frame is drawn in
software, so the museum's trace is dominated by rasterization that a real
device does on the graphics card. Two things are worth saying plainly:

1. **v8 costs essentially nothing.** The museum now plays films by default
   and has a new archway, and its score is unchanged against the baseline —
   the "nothing loads before you touch it" design did its job.
2. **The real numbers are the live ones.** Please check performance on the
   deployed site rather than from this table; the v7 measurements (89–90 on
   the museum) came from hardware with a GPU.

---

## 3 · Judgement calls I made

Places where your words left room, and I chose. Each is a one-line revert if
you disagree — the reasoning is in `docs/RUN-STATE.md`.

1. **The "dark gradient over the map" (V8-205).** You said it on the
   commissioner's page, and there is no gradient on the embed map. What is
   dark there is the **1858 plate's edge fade**, sitting between two cream
   sections. I made that fade cream and left the photo interludes dark.
2. **The afterword break (V8-304)** — you asked for tablet. Measured, the
   one-line version also overruns at 1024–1440, so I authored the break at
   every width rather than leave a mid-subtitle wrap on desktop.
3. **The People subtext (V8-302).** Your dictation was "Their role in the
   story are told each chapter location by location". I shipped it
   grammar-normalized: "Their roles in the story are told in each chapter,
   location by location." Your call on the exact wording.
4. **"Christianson", not "Christensen".** You said Christensen; every source
   in the project (and the book) spells it Christianson. I read that as
   speech-to-text and changed no spelling.
5. **The barbershop hero (V8-278).** Desktop had only 60 px of slack, so the
   lift is a bottom anchor. Phones show the poster's full height, where a
   focal point cannot move anything — so that hero is now scaled 1.18 about
   its bottom edge. Different mechanism per orientation, same intent.
6. **Painting names (V8-320).** You named the barbershop pair, so only that
   pair is renamed in the hall; the ferry keeps Narrative I/II and the stills
   grid keeps its narrative captions, per what you said at 00:34:11.
7. **The plaque eyebrow (V8-320).** "Location 01" replaced "Mark Priest ·
   Nalle Series · …", so the artist's name no longer appears on the inspect
   card. It still appears in the grid below and on the About page.
8. **Moral backgrounds (V8-275).** You suggested a mix; I used all three
   levers gently — per-image focal points, scrim .86 → .90, and a 2 px blur.
   Taste call, easily dialled either way.

---

## 4 · The human queue — things only you can decide

1. **The splash source (V8-101).** This is the one item I could not finish.
   The largest still in the repo is 1080 px wide but was being *advertised*
   as 1440, so your desktop was upscaling it — that lie is fixed, and the
   image is now honest rather than sharp. To actually fix it I need from you:
   `home-bg.png` at **≥ 2160 px wide**, and ideally a re-exported splash film
   at **≥ 1080 px wide** (the visible layer today is 480 × 720, stretched
   about 3× on a 1440 screen). `scripts/build-media.mjs` regenerates every
   tier once those land.
2. **The People subtext wording** — see §3.3.
3. **The museum's "alive" feel.** Films play on the nearest works only (three
   on desktop, two on phones) to protect battery and the performance score.
   If you want more of the hall moving at once, that is a number I can raise.
4. **The bakery moral's background drawing.** You caught the ferry using the
   wrong sketch and it now uses its own. While checking the other four I could
   not establish where the bakery's background drawing came from — it pairs
   acceptably, but it is worth your eye.
5. **The 1858 lens crop.** I matched your screenshot (Green Island out of
   frame, downtown filling it) and mirrored it on tablet and phone "so it
   feels similar" — parity by construction, not by your eye yet.
6. **Live performance and the map curtain.** Both need checking on the
   deployed site: the numbers in §2 for the reason given there, and the
   map → chapter transition because Mapbox cannot load in this container.
7. **The phone map's hint chip** can briefly overlap the Ferry pill while it
   fades. Minor, and I left it rather than move a pin you approved.

---

## 5 · Rescinded in the meeting — deliberately NOT done

You changed your mind on these mid-sentence; they are recorded here and in
`docs/v8/AUDIT.md` §0 so a future reader doesn't "fix" them:

1. **Secondary-button border colours** ("Back to map", "Back to today") —
   you asked, then said to leave them.
2. **The menu button's corner radius** — same.
3. **The orange-on-orange kickers** ("07 Onward / The streets are waiting",
   People's "03 Onward / Their story lives on") — you asked whether they
   should change colour and concluded they should stay.
