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
