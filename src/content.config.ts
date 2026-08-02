import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * One entry per chapter (5 locations; Commissioner's Office holds two scenes).
 * Media values are paths into the legacy asset library (old repo /public) —
 * the M1 pipeline rewrites them to optimized AVIF/WebP + compressed video.
 * Paragraph strings support **bold** and trailing (citation) per M2 renderer.
 * A paragraph equal to "@media:<key>" renders the media asset named <key>.
 */
const scene = z.object({
  label: z.string(), // "Part 1", shown when a chapter has >1 scene
  audio: z.object({
    label: z.string(),
    subtitle: z.string(),
    file: z.string(),
    /**
     * Per-paragraph narration spans for follow-along highlighting.
     * Word-proportional estimates from scripts/audio-timings.mjs; replace
     * with exact stamps (same shape) when re-recorded audio lands.
     */
    timings: z.array(z.object({ start: z.number(), end: z.number() })).nullable(),
    duration: z.number().optional(),
  }),
  quote: z.object({
    text: z.string(),
    attribution: z.string(),
    source: z.string().optional(),
  }),
  paragraphs: z.array(z.string()),
  /** Press-and-hold hero: media keys into public/media/<slug>/ */
  reveal: z
    .object({
      sketch: z.string(),
      video: z.string(),
      videoVertical: z.string(),
      painting: z.string(),
    })
    .nullable(),
});

const chapters = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/chapters" }),
  schema: z.object({
    order: z.number(),
    /**
     * THE naming canon — one object, three forms, and the only source for any
     * displayed place name. Rationale and the bronze-plaque evidence are in
     * docs/v4/DECISIONS.md D1.
     *   canonical — card titles, <title>, curtain labels, People chips
     *   display   — the hero H1; "\n" marks the authored line breaks
     *   short     — map pills, menu, aria-labels (the word cast in bronze)
     * Next-links are generated: `Chapter {order} — {canonical}`.
     */
    name: z.object({
      canonical: z.string(),
      display: z.string(),
      short: z.string(),
    }),
    /** Map pin label placement; stop 2 sits above so it cannot hide inside it. */
    pinPosition: z.enum(["above", "below"]).default("below"),
    /** Pixel nudge for the overview camera so five pills can all keep names. */
    pinOffset: z.tuple([z.number(), z.number()]).default([0, 0]),
    chapterLabel: z.string(),
    plaque: z.boolean(),
    map: z.object({
      // Brian's exact plaque pins (resolved from his 5/13/26 Google Maps links)
      coordinates: z.tuple([z.number(), z.number()]),
      address: z.string(),
    }),
    palette: z.object({
      // Per-chapter palettes derived from the design sprint's emotions
      surface: z.string(),
      ink: z.string(),
      accent: z.string(),
    }),
    emotions: z.array(z.string()),
    portal: z.object({
      hook: z.string().nullable(),
      history: z.array(z.string()),
    }),
    /** Available optimized asset keys under public/media/<slug>/ */
    media: z.object({
      images: z.array(z.string()),
      videos: z.array(z.string()),
    }),
    scenes: z.array(scene),
    historicalContext: z.array(z.string()),
    morals: z.array(
      z.object({
        title: z.string(),
        message: z.string(),
        callToAction: z.object({ title: z.string(), content: z.string() }),
      }),
    ),
    /** Only the slug: the link text is generated as `Chapter {order} — {canonical}`. */
    next: z.object({ slug: z.string() }),
  }),
});

export const collections = { chapters };
