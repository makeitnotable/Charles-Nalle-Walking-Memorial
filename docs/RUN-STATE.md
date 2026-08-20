# RUN-STATE — CNWM v8 "The Final Five Percent"

*Disk is truth; the conversation is disposable. One work item = implement →
re-measure → commit → update this file as ONE atomic act. Push every ≤3
commits; verify live = HEAD after each push. Constitution: `docs/PLAN.md`
(v8). Item ledger: `docs/v8/AUDIT.md`. Previous run: `docs/PLAN-v7.md` +
`docs/RUN-STATE-v7.md`.*

## CURRENT PHASE
**P0 — bootstrap.** Audit written (`docs/v8/AUDIT.md`, 40 items V8-001…
V8-352 + 3 rescinded REV-1..3), v7 docs archived, plan rewritten.
Environment note: this container blocks cdn.playwright.dev — the
pre-installed Chromium at /opt/pw-browsers is shimmed as
chromium-1234/chromium_headless_shell-1234 (symlinks to the 1194 builds);
`npm run qa:setup` is NOT needed here. Dev server :4321 up.

## CURRENT ITEM
P1 global fabric next: V8-001 spot→location sweep → V8-002 button optical
padding → V8-273 player divider gap → V8-351/352 footer.

## NEXT ACTION
Implement V8-001 (all template occurrences + 4 prose edits +
CONTENT-STATUS rows + styleguide specimen), re-run `qa:rag` at the pill
breakpoints (Location is 4ch longer than Spot), commit.

## DONE (item → commit → evidence)
| item | commit | evidence |
|---|---|---|

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
