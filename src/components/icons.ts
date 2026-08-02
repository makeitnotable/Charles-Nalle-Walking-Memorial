/**
 * THE icon set — one geometry, no exceptions.
 *
 *   24×24 viewBox · 1.5px stroke · round caps and joins · currentColor · no fill
 *
 * v3 shipped three unrelated arrow idioms at stroke widths 1.2/2/2.5, one of
 * them a `preserveAspectRatio="none"` SVG stretched into a hairline and a
 * chevron with a `viewBox="0 87 13 9"` offset lifted from a legacy export.
 * There is now exactly ONE arrow: `arrow`, rotated for direction. Never scale
 * an icon non-uniformly — set width AND height from the same `.icon*` class.
 *
 * Astro:  <Icon name="arrow" rotate={-90} />
 * React:  <svg className="icon" viewBox="0 0 24 24">{ICONS.arrow.map(...)}</svg>
 *         — or use the <I> helper below.
 */
export const ICONS = {
  /** The one arrow. rotate={-90} = up, {90} = down, {180} = left. */
  arrow: ["M4 12h15.5", "M13.5 6l6 6-6 6"],
  chevron: ["M9.5 5.5l6.5 6.5-6.5 6.5"],
  close: ["M6.5 6.5l11 11", "M17.5 6.5l-11 11"],
  play: ["M8.5 5.6l10.4 6.4-10.4 6.4z"],
  pause: ["M9.5 5.5v13", "M14.5 5.5v13"],
  share: [
    "M12 15.5V4.5",
    "M8.4 8.1L12 4.5l3.6 3.6",
    "M6 12.5v6.2A1.3 1.3 0 007.3 20h9.4a1.3 1.3 0 001.3-1.3v-6.2",
  ],
  pin: [
    "M12 20.8c4.5-4.2 6.8-7.7 6.8-10.8a6.8 6.8 0 10-13.6 0c0 3.1 2.3 6.6 6.8 10.8z",
    "M12 12.4a2.4 2.4 0 100-4.8 2.4 2.4 0 000 4.8z",
  ],
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
