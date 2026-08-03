/**
 * THE icon set — one geometry, no exceptions. v6: drawn to Caslon.
 *
 *   24×24 viewBox · 1.3px stroke · BUTT caps, miter joins (engraved, not
 *   geometric-round) · currentColor · no fill — except the two filled glyphs
 *   (play, arrow), which carry .icon-filled.
 *
 * v3 shipped three unrelated arrow idioms at stroke widths 1.2/2/2.5, one of
 * them a `preserveAspectRatio="none"` SVG stretched into a hairline and a
 * chevron with a `viewBox="0 87 13 9"` offset lifted from a legacy export.
 * There is now exactly ONE arrow: the Figma broadside arrow, rotated for
 * direction. Never scale an icon non-uniformly — set width AND height from
 * the same `.icon*` class.
 *
 * Astro:  <Icon name="arrow" rotate={-90} />
 * React:  <svg className="icon" viewBox="0 0 24 24">{ICONS.arrow.map(...)}</svg>
 *         — or use the <I> helper below.
 */
export const ICONS = {
  /** THE arrow — the Figma broadside arrow (node 2142-4066), transcribed from
   *  the legacy implementation (docs/v5/elements/figma-arrow/): a hairline
   *  shaft into a barbed printer's head. FILLED, not stroked — the barbs are
   *  drawn geometry. rotate={-90} = up, {90} = down, {180} = left. Never
   *  stretch it; the shaft length is fixed inside the box. */
  arrow: [
    "M16.42 11.35H3.3a0.65 0.65 0 000 1.3h13.12z",
    "M14.39 17.12c0.19 0.18 0.4 0.2 0.64 0.06l6.74-4.3c0.33-0.21 0.49-0.5 0.49-0.88 0-0.38-0.16-0.67-0.49-0.88l-6.74-4.3c-0.24-0.14-0.45-0.12-0.64 0.06-0.19 0.18-0.22 0.39-0.1 0.64l2.13 3.83v1.3l-2.13 3.82c-0.12 0.25-0.09 0.47 0.1 0.65z",
  ],
  chevron: ["M9.5 5.5l6.5 6.5-6.5 6.5"],
  close: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"],
  play: ["M8.5 5.6l10.4 6.4-10.4 6.4z"],
  pause: ["M9.5 5.5v13", "M14.5 5.5v13"],
  share: [
    "M12 15.5V4.5",
    "M8.4 8.1L12 4.5l3.6 3.6",
    "M6 12.5v6.2A1.3 1.3 0 007.3 20h9.4a1.3 1.3 0 001.3-1.3v-6.2",
  ],
  /** Typographic marker — a surveyor's stake: lozenge on a hairline stem,
   *  drawn to the serif's construction instead of the teardrop pin. */
  pin: ["M12 3.6l3.1 3.9-3.1 3.9-3.1-3.9z", "M12 11.4v8.4", "M9.2 19.8h5.6"],
  plus: ["M12 5.2v13.6", "M5.2 12h13.6"],
  minus: ["M5.2 12h13.6"],
  check: ["M5.5 12.5l4.2 4.2 8.8-9.4"],
  external: ["M14.5 5h4.5v4.5", "M19 5l-7.5 7.5", "M17 14v4.7A1.3 1.3 0 0115.7 20H5.3A1.3 1.3 0 014 18.7V8.3A1.3 1.3 0 015.3 7H10"],
  headphones: [
    "M4.5 15.5v-3.2a7.5 7.5 0 1115 0v3.2",
    "M4.5 14.2h1.6a1 1 0 011 1v3.3a1 1 0 01-1 1H6a1.5 1.5 0 01-1.5-1.5v-3.8z",
    "M19.5 14.2h-1.6a1 1 0 00-1 1v3.3a1 1 0 001 1h.1a1.5 1.5 0 001.5-1.5v-3.8z",
  ],
} as const;

export type IconName = keyof typeof ICONS;
