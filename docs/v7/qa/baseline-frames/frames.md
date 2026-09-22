# Curtain frame capture — X1 acceptance

Base http://localhost:4321 · CPU throttle 4× · 2026-08-16T01:07:16.160Z
Criterion: no uncovered frame of page B before the hold, no wordmark reflow, one continuous reveal.
Times are ms relative to the click. "js" = rAF-tied page samples on page B before the panel covered it; "img" = screencast frames between the last covered page-A sample and the reveal onset whose thumbnail differs from a covered reference frame (mean |Δpx| > threshold, see frames.json).

| case | vp | click→covered ms | hold ms | reveal ms | uncovered page-B frames | text reflow | verdict |
|---|---|---|---|---|---|---|---|
| map-card | 390 | 657 | 438 | 567 | js 1 (957) · img 3 (958,975,1002) ≈73ms | 0px | DEFECT |
| continue | 390 | 601 | 428 | 567 | js 2 (851,915) · img 4 (854,874,906,920) ≈84ms | 0px | DEFECT |
| home-door | 390 | 630 | 508 | 482 | js 1 (869) · img 3 (832,843,873) ≈57ms | 0px | DEFECT |
| map-card | 1440 | 692 | 430 | 567 | js 2 (1056,1122) · img 4 (1079,1084,1114,1134) ≈68ms | 0px | DEFECT |
| continue | 1440 | 631 | 458 | 555 | js 1 (852) · img 3 (876,884,908) ≈39ms | 0px | DEFECT |
| home-door | 1440 | 634 | 602 | 477 | js 1 (862) · img 2 (834,871) ≈58ms | 0px | DEFECT |

Frames: `frames/<case>-<vp>/f<NNN>-<tMs>.jpg` (mNN = negative t). Full samples and per-frame luminance in frames.json.
