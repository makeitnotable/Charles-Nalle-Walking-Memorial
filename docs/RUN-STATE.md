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
P3 — chapters: V8-271 chip inset/labels → V8-272 H1 step → V8-274 study
tertiary → V8-275/276 moral legibility + ferry ground → V8-277 hook
centring → V8-278 barbershop focus → V8-204 where-to-next relayout →
V8-205 ch2 map fade.

## NEXT ACTION
V8-275/276: moral legibility mix (scrim .86→.90, ground blur, per-moral
object-position) + ferry moral ground regenerated from the study sketch;
then V8-277 hook centring, V8-278 barbershop focus, V8-204 where-to-next
relayout, V8-205 ch2 map fade.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|
| P3a V8-271 chip (md+ bottom = inset/2 — the bottom fade dissolves the plate's edge so the full inset read loose; the wipe's pre-reveal scale(1.04) was polluting measurements — settled gaps now 20/20 phone · 40/20 tablet · 56/28 desktop; ch2 phones read "Troy, New York · 1858", licence tail ≥640; mobile "archival record" kept per Wil 01:01:06) + V8-272 chapter H1 phones step up (global --fit-advance var, hero-scoped 0.64 + 52px phone cap: 34.7→39.1 / 40.5→45.6 / 44.2→49.7 at 390; tablet/desktop capped unchanged) + V8-274 study note → t-meta-body (tertiary) | (this commit) | chip-probe3 one-line ×5 chapters ×3 vps; h1-verify 4 vps ovf 0; rag chapters @360/390 0/0/0; eyeball shots |
| P2 V8-104 mobile home (CTA hugs 233px centred, pb 24; head lifted — media scale(1.09) origin bottom, chin 40%→34.6%; 7-line authored pyramid rag 18/29/36/38/31/30/23ch via display-gated `<br class=home-br>` + `{" "}` separators — Astro trims text↔element newlines) + V8-103 tablet (portrait ≥768 gets object-position 50% 37% + pt 36dvh + opened gaps — tablets CROP vertically, aspect 0.75 > source 0.5625, so object-position governs there) + V8-101 (srcset descriptor tells the truth: 1080w; high-res source queued for Wil) | (this commit) | home-shots probe: CTA 233px/gap 34, eyebrow 38% phones / 38% tablet / 34% desktop, 7/4/3 desc lines, 0 overflow at 360/390/430/768/834/1440; paragraph text+breaks verified rendered |
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
- ENV: makeitnotable.github.io is ALSO proxy-blocked — the live site
  cannot be curled from this container. Live = HEAD verification is
  substituted by the deploy.yml Actions run for the exact HEAD sha
  concluding success (build + deploy-pages publish that sha); checked
  after every push via the GitHub MCP.
- ENV: this container's egress proxy 403-blocks api.mapbox.com — the GL
  map cannot fetch its style/tiles here (the a11y "console errors" on
  /map are exactly that fetch). Map geometry work (V8-206/207) will be
  verified with a Playwright route-stub style (site code untouched);
  tile visuals verified on the live site page-load markers + by Wil.
- NEVER edit src/ while an instrument runs — HMR reloads mid-measure
  produced phantom readings (barbershop@360 clips, people@land destroyed
  context); both re-verified clean individually.
