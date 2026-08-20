# CNWM v8 — "The Final Five Percent" (constitution)

Wil's 2026-08-19 page-by-page review (desktop → tablet → mobile) is the
whole scope. His words: the site is ~95% done and this round is the last
5% that makes it award-winning. The item ledger — every request with
file:line, severity, fix, and verification — is `docs/v8/AUDIT.md`
(V8-nnn). Three requests were rescinded mid-meeting and are recorded
there as REV-1..3 so they are never "fixed". Progress ledger:
`docs/RUN-STATE.md`.

## Part A — the contract

- Branch: `v2` only, plain `git push` (auto-deploys); the working branch
  `claude/nalle-memorial-polish-kc4uvm` is mirrored per push
  (`git push origin v2:claude/nalle-memorial-polish-kc4uvm`). `main` is
  the legacy SPA — never touched.
- One work item = implement → re-measure with the named `npm run qa:*`
  instrument → commit → update RUN-STATE, as one atomic act. Push every
  ≤3 commits; verify live = HEAD after each push (curl marker + Actions).
- Kathy's prose changes only as client-directed edits, each with a
  `docs/CONTENT-STATUS.md` row (v8 section).
- Perf on the PRODUCTION build only (`npm run build` → `astro preview
  --port 4322`); bars = v7 final (home 97 · chapters 98–99 · map 64 ·
  paintings 89–90 · people/about 99; /paintings hard floor 80).
- Instruments run ONE Playwright process at a time, backgrounded so no
  foreground call times out (v7 lesson: the timeout sweep kills
  Chromium).
- a11y and reduced-motion parity are non-negotiable: every touched
  surface re-passes `qa:a11y`; every new motion (museum descent, sheet
  transitions) has its RM variant.

## Part B — phases (details in AUDIT §8)

- P1 global fabric: spot→location sweep (V8-001) · button optical
  padding (V8-002) · player divider gap (V8-273) · footer regroup +
  mobile rhythm (V8-351/352).
- P2 home: copy (V8-102) · mobile CTA/stack (V8-104) · tablet layout
  (V8-103) · splash srcset + high-res queue (V8-101).
- P3 chapters: chip inset/labels (V8-271) · H1 step (V8-272) · study
  tertiary (V8-274) · moral legibility + ferry ground (V8-275/276) ·
  hook centring (V8-277) · barbershop focus (V8-278) · where-to-next
  relayout (V8-204) · ch2 map fade to cream (V8-205).
- P4 map: card titles (V8-202) · strip bottom-align (V8-201) · doors
  regroup (V8-203) · bearing (V8-206) · phone pins (V8-207) · walk
  buttons (V8-251) · ☰ during walk (V8-252) · lens copy/caption/crop
  (V8-261/262/263) · below-map copy (V8-208).
- P5 museum: plaque/naming/chrome (V8-320..323) · camera + pan
  (V8-324) · frames (V8-325) · mobile fit (V8-330) · alive-by-default
  windowed (V8-326) · painting-to-painting (V8-331) · drawer (V8-328) ·
  study in card/sheet (V8-329) · arch + stairs (V8-327). The engineering
  sub-plan (windowed video budget N=2/3, input-armed startup, arch
  geometry, piecewise railPose, wheel state machine, 92° portrait fov)
  is recorded in AUDIT §6 and the session plan.
- P6 people/about: V8-301..303 · V8-304..307.
- P7 gate: full instrument re-run (rag 0/0/0 · contrast 0 · a11y 0
  serious · states 0 · walk 8/8 · museum clean · audio · census ·
  frames · production perf ≥ bars) → `docs/v8/REVIEW-GUIDE.md` (Wil's
  meeting order, before/afters, judgment calls, HUMAN QUEUE) → final
  push + live verify.

## Part C — the human queue (accumulates; ships in REVIEW-GUIDE §Queue)

Seeded from the audit: the high-res splash source (V8-101); the People
subtext grammar normalization (V8-302); the alive-by-default window size
(V8-326); the barbershop-only naming scope (V8-320); the "Location 0N"
eyebrow dropping "Mark Priest · Nalle Series" from the plaque (V8-320);
moral-legibility taste (V8-275); the 1858 lens crop parity (V8-263).
