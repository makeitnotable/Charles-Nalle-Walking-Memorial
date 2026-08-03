# Seven-element baselines — Phase 0, 2026-08-02 (pre-v6 work, local build)

Instruments: `npm run qa:moments|strip|arrival|contrast` (+ existing qa:shots/probe/states/census/perf).
Screenshots regenerable, gitignored; these findings are the artifact.

## E1 · Thesis — **PASSES at baseline**
3 fresh jurors, home shots (390/768/1440) + copy only, one sentence each
(`e1-baseline/`, `e1-home-copy.md`):
- 3/3: rescue + Tubman + Troy. 3/3: the single day (April 27, 1860). 0/3: "biography"/"gallery".
- The v5 home recomposition already carries the *one day, five stops* thesis.
  Phase 2+ must not regress this; re-run at the Phase 6 gate.

## E2 · Signature + restraint — baseline census in `moments-baseline.md`
- **26 off-token tuples** site-wide (of 60 distinct). Clusters: Mapbox GL
  chrome (its own easings — candidate documented exception), keen-slider,
  press-reveal progress, misc UA `ease` defaults on interactive bits.
- Phase 1/2 kill or token-ize these; MOTION.md gets the exception table.
- Juror "the ONE moment" question runs at the gate, post-museum.

## E4 · Typography strip — shots in `strip-baseline/` (390 + 1440, imagery off)
- Baseline = current Martel Sans/Martel/Poppins system, pre-audition.
  These are the BEFORE pictures for the Phase-1 serif audition.

## E7 · QR arrival — filmstrips + `arrival-baseline/arrival.md`
- Kicker + chapter name legible at ~1s frame; hero painting painted well
  before 2.5s on the bakery check frame — good bones.
- **FAIL: every chapter requests `reveal-vertical.mp4` at 2.6–4.2s on the
  thin pipe** (lazy-video fires after `load`, connection-blind). Phase 2:
  gate film loads on connection/save-data.

## Contrast sweep — `contrast-baseline.md` — **10 failures, all /map**
- The five numbered stop chips: cream `#fed9cc` on orange `#e45b27` = 2.75:1
  (bar 4.5). Folds into Phase 3 map overhaul alongside P0-5 label anonymity.
- Known limitation: text-over-media resolves to the page ground behind it
  (scrims judged by eye/juror, not by this instrument).
