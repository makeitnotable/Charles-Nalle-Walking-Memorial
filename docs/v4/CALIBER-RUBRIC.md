# CNWM v4 — THE CALIBER RUBRIC

The only visual acceptance bar. It replaces v3's spec-fidelity review, which
passed 27px buttons and ragged three-column layouts because they matched the
porting notes. **Fidelity is not craft.**

Run by a fresh reviewer given ONLY screenshots and this file — never the spec,
never the builder's reasoning.

| # | Test | Pass condition |
|---|---|---|
| a | **Side-by-side** | The page beside a same-purpose screenshot from pasqua / Google Arts & Culture / museos reads as parity. "Which studio shipped this?" must not be answerable. |
| b | **Hierarchy scan** | A 3-second glance at each viewport names exactly ONE winner. |
| c | **Squint test** | Blurred ~8px, the composition still reads as deliberate structure — not undifferentiated bands. |
| d | **Spacing** | Every gap between sections measures to one of four tokens (block 24 / beat 72–128 / section 128–200 / void 260–400). No gap reads as an accident; no dead space reads as unfinished. |
| e | **Type census** | ≤4 distinguishable sizes per viewport, excluding the display heading. No two sizes close enough to look like a mistake. No comprehension text below 14px. |
| f | **Box census** | ≤1 framed *container* per viewport. Controls (buttons, pills, the corner menu) are not containers. |
| g | **Craft defects** | Zero of: clipped or overflowing text, inconsistent left edges, floating UI over live content, mismatched button pairs, multiple icon or arrow idioms, double borders, orphans and widows. |
| h | **The stakeholder test** (live only) | A reviewer armed with the client's verbatim v3 complaints walks the live site; W1–W8 are each verifiably dead, with before/after evidence. |

**Any FAIL loops the phase. Two failed loops on the same item means redesign
that section — do not tweak it.**

## The eight named defects (W1–W8)

| # | The complaint | Dead when |
|---|---|---|
| W1 | "The icons, like the arrows, look terrible" | One 24/1.5 icon set; one arrow, rotated. |
| W2 | "The buttons are unbalanced" | Two sizes, two variants, no viewport ladder; a pair always matches. |
| W3 | "The path… is so low contrast that it is invisible — an accessibility issue" | The route reads plainly in a greyscale screenshot, pixel-measured ≥3:1. |
| W4 | "Spacing and layout… lacking a visual hierarchy" | Rubric b + c + d pass at every viewport. |
| W5 | "The site looks sloppy and thrown together" | Rubric g clean; one shell, one footer, one type system. |
| W6 | "The words, titles and names" | One `name` object per chapter; zero conflicting strings site-wide. |
| W7 | "The sketches have replaced the chapter hero image" | The hero is the finished animated painting; the sketch has its own section. |
| W8 | The chapter template must be the most beautiful thing on the site | The flagship passes a–g with no fix list above "minor". |
