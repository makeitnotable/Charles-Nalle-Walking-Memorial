# RUN-STATE — CNWM v8 "The Final Five Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-measure → commit → update this file as ONE atomic act. Push every ≤3
commits; verify live = HEAD after each push. Constitution: `docs/PLAN.md`
(v8). Item ledger: `docs/v8/AUDIT.md`. Previous run: `docs/PLAN-v7.md` +
`docs/RUN-STATE-v7.md`.*

## CURRENT PHASE
**P1 — global fabric: DONE, committing.** Implemented, awaiting one clean
verification run: V8-001 sweep (all templates + 4 prose edits +
CONTENT-STATUS v8 ledger; V8-102/V8-208/V8-302 copy done inside it) ·
V8-002 button padding (.btn 52/22, .btn-sm 40/18, icon-side trims via
:has(); TroyMap safe box 48→52) · V8-273 player gap (`.player-rule-gap`
27px / 37px coarse) · V8-351/352 footer (grid-areas: Share left under the
mark bottom-aligned to the nav, nav right; mobile gap 2.5rem, links
gap-2; disclaimer two authored lines).
Environment note: this container blocks cdn.playwright.dev — the
pre-installed Chromium at /opt/pw-browsers is shimmed as
chromium-1234/chromium_headless_shell-1234 (symlinks to the 1194 builds);
`npm run qa:setup` is NOT needed here. Dev server :4321 up
(self-daemonized).

## CURRENT ITEM
P2 — home: V8-102 (done in the sweep) · V8-104 mobile CTA/stack · V8-103
tablet layout · V8-101 srcset fix + queue.

## NEXT ACTION
Implement V8-104 (index.astro .home-cta hug + bottom margin + stack
nudges + phone rag pyramid), screenshot 360/390/430, then V8-103 tablet
step, then V8-101, commit per item.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| P1 V8-001 spot→location sweep (24 template strings, 4 prose edits incl. V8-102 home / V8-208 map / V8-302 people copy; CONTENT-STATUS v8 ledger) + V8-002 button optics (.btn 52/22, .btn-sm 40/18, icon-side trims as explicit btn-icon-start/end classes — :has(> .icon) failed on lone-icon buttons; TroyMap safe box 48→52) + V8-273 player gap (.player-rule-gap 27/37 coarse; measured 28 vs 27 at 1440) + V8-351/352 footer (grid-areas, Share bottom == nav bottom EXACT at 768/1024/1440 via 1fr/auto rows + row-gap 1rem; mobile gap 2.5rem, nav gap-2, disclaimer 2 authored lines) | (this commit) | rag 9vps×11 routes 0/0/0 (two mid-run HMR phantoms re-verified clean individually); a11y 0/0/0 ×14 runs (/,/map,/bakery,/people @390/1440); p1-probe numbers in scratchpad |

## DECISIONS (run-time)
- C3 "map gradient" resolved by probe (scratch c3-context-1200.png): the
  cream scene prose sits directly above the cream 1858 plate on
  /commissioners-office and the plate's edge fade is dark brown
  (`[chapter].astro:433-436`) → the fade becomes `--ground-light` for the
  `troy-1858` interlude only; photo interludes keep the dark fade
  (V8-205).
- Wil's "Christensen" = speech-to-text for the author's correct spelling
  "Christianson" (consistent across the repo + the book) — no spelling
  change (V8-304).
- Branch mirroring: every `v2` push is mirrored to
  `claude/nalle-memorial-polish-kc4uvm` (the session's designated
  branch); deploys only fire from `v2`.

## STANDING NOTES
- Dev :4321 (self-daemonized `astro dev`; `astro dev stop/status/logs`).
  Production preview :4322 for perf. One Playwright process at a time;
  background long instruments (v7 lesson — foreground timeouts SIGTERM
  Chromium).
- `scroll-behavior: smooth` is on — instruments scroll with
  `behavior: "instant"`.

## BLOCKED / NOTES
- V8-101 needs the high-res `home-bg.png` (≥2160w) + splash film ≥1080w
  from Wil — in-repo we fix the lying srcset descriptor only.
- ENV: this container's egress proxy 403-blocks api.mapbox.com — the GL
  map cannot fetch its style/tiles here (the a11y "console errors" on
  /map are exactly that fetch). Map geometry work (V8-206/207) will be
  verified with a Playwright route-stub style (site code untouched);
  tile visuals verified on the live site page-load markers + by Wil.
- NEVER edit src/ while an instrument runs — HMR reloads mid-measure
  produced phantom readings (barbershop@360 clips, people@land destroyed
  context); both re-verified clean individually.
