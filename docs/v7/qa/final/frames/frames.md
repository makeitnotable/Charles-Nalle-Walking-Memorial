# Curtain frame capture — X1 acceptance

Base http://localhost:4321 · CPU throttle 4× · 2026-08-16T05:06:08.085Z
Criterion: no uncovered frame of page B before the hold, no wordmark reflow, one continuous reveal.
Times are ms relative to the click. "js" = rAF-tied page samples on page B before the panel covered it; "img" = screencast frames between the last covered page-A sample and the reveal onset whose thumbnail differs from a covered reference frame (mean |Δpx| > threshold, see frames.json).

| case | vp | click→covered ms | hold ms | reveal ms | uncovered page-B frames | text reflow | verdict |
|---|---|---|---|---|---|---|---|
| map-card | 390 | — | — | — | locator.waitFor: Timeout 8000ms exceeded. | — | ERROR |
| continue | 390 | 611 | 534 | 550 | js 0 () · img 0 () | 0px | CLEAN |
| home-door | 390 | 631 | 546 | 594 | js 0 () · img 0 () | 0px | CLEAN |
| map-card | 1440 | — | — | — | locator.waitFor: Timeout 8000ms exceeded. | — | ERROR |
| continue | 1440 | 608 | 559 | 591 | js 0 () · img 0 () | 0px | CLEAN |
| home-door | 1440 | 654 | 569 | 610 | js 0 () · img 0 () | 0px | CLEAN |

Frames: `frames/<case>-<vp>/f<NNN>-<tMs>.jpg` (mNN = negative t). Full samples and per-frame luminance in frames.json.
