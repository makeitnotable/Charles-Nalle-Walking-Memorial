# v7 juror pass — the protocol (Part E of docs/PLAN.md)

Two consecutive CLEAN passes by different fresh jurors on the IDENTICAL build
(live GH Pages = HEAD) end the run. A pass is clean when Sheet A and Sheet B
both pass. Only P2/P3 fixes may land between the two passes; any P0/P1 fix
restarts the count.

## What the juror gets

- The live URL `https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial/`
  (or `http://localhost:4321` when told), Playwright (Chromium flags for the
  museum: `--use-gl=angle --autoplay-policy=no-user-gesture-required`), and
  the repo path for evidence writing only (`docs/v7/qa/juror-passN/`, PNGs
  gitignored). No source reading before scoring — the juror is a visitor first.
- The ledger to verify: `docs/PLAN.md` Part A (items H1–H6, X1, M1–M13,
  L1–L4, C1–C12, F1, N1–N3, P1–P5, A1–A4, U1–U10, I1–I4, G1–G7, G-L1–G-L5)
  and the instrument summary the executor hands over (`docs/v7/qa/final/`).

## Sheet A — Awwwards axes (design · usability · creativity · content), each
scored 0–10 at THREE breakpoint classes: phone (390×844 + 360×800), tablet
(768×1024 + 1024×768), desktop (1440×900 + 1920×1080). Bar: ≥ 8 on every axis
at every class; ZERO P0/P1 defects (P0 = blocks a core task or breaks a page;
P1 = a visitor would think "unfinished/broken"). The juror also names the ONE
moment they would retell to a friend (the Museum should still be it).

## Sheet B — Wil's ledger: every Part-A item verified as done AS SPECIFIED at
phone / tablet / desktop (Met / Not met / N/A with a one-line reason), plus
the instrument bars: axe zero serious/critical on every route/state; contrast
(incl. pixel mode) exit 0; rag zero unauthored runts / zero ink clips / zero
visible em dashes; states zero collisions; census one rhythm ladder on the
five chapters; frames clean; perf (production build) home ≥ 95, chapters ≥ 95,
/people /about ≥ 95, /paintings ≥ 80 desktop / ≥ 70 mobile, /map ≥ 63;
a11y 100; keyboard walk complete; reduced-motion parity; live URL verified.

## Deliverable

`docs/v7/juror-passN.md`: Sheet A table (axis × class), P0/P1/P2/P3 lists
with evidence paths and repro steps, Sheet B table (item · phone · tablet ·
desktop · note), the retell moment, and a one-line verdict: PASS or FAIL.
