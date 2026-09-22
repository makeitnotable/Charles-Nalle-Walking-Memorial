/**
 * Display-type helpers.
 *
 * `.t-display` guards against overflow with `--fit-chars`, the length of the
 * longest authored line. Four pages were carrying that number by hand and three
 * of them had drifted from the string they describe — `/people` declared 14 for
 * a 20-character line, so its headline rendered 43% larger than its own box
 * allowed and broke to three lines with a zigzag rag. Nobody should ever count
 * characters again.
 */

/** Longest line in a display string, splitting on "\n" or a literal <br>. */
export function longestLine(text: string): number {
  return Math.max(
    ...text
      .split(/\n|<br\s*\/?>/i)
      .map((l) => l.trim().length),
  );
}

/** `style` value for a display heading: `--fit-chars` derived from the text. */
export function fitChars(text: string): string {
  return `--fit-chars: ${longestLine(text)}`;
}

/** Authored lines of a display string — feeds the per-line mask reveal
 *  (`.lines > .line-box > .line-inner`, global.css). Split at build time so
 *  the runtime never measures or re-wraps anything. */
export function splitLines(text: string): string[] {
  return text
    .split(/\n|<br\s*\/?>/i)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Glue the last two words of a label/heading/caption with a no-break space so
 *  the final line can never be a single word (v7 G1). Strings of one word (or
 *  ending in a break/tag) return unchanged; authored "\n" lines are glued
 *  per line. */
export function nbsp(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const i = line.trimEnd().lastIndexOf(" ");
      if (i <= 0) return line;
      // never glue across a trailing tag or an already-glued pair
      return line.slice(0, i) + " " + line.slice(i + 1);
    })
    .join("\n");
}
