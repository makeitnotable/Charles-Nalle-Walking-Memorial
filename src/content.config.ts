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
    /** Timestamped transcript JSON for synced highlighting; delivered before M2 */
    timings: z.string().nullable(),
  }),
  quote: z.object({
    text: z.string(),
    attribution: z.string(),
    source: z.string().optional(),
  }),
  paragraphs: z.array(z.string()),
});

const chapters = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/chapters" }),
  schema: z.object({
    order: z.number(),
    chapterLabel: z.string(),
    title: z.string(), // display title; "\n" marks designed line breaks
    cardTitle: z.string(),
    plaque: z.boolean(),
    map: z.object({
      label: z.string(),
      // Legacy coords — replace with Brian's 5/13/26 plaque pins in M3
      coordinates: z.tuple([z.number(), z.number()]),
      address: z.string(),
    }),
    palette: z.object({
      // Placeholder per-chapter palettes; design pass lands in M1
      surface: z.string(),
      ink: z.string(),
      accent: z.string(),
    }),
    emotions: z.array(z.string()),
    portal: z.object({
      hook: z.string().nullable(),
      history: z.array(z.string()),
    }),
    media: z.object({
      images: z.record(z.string(), z.string()),
      video: z.record(z.string(), z.string()),
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
    next: z.object({ slug: z.string(), label: z.string() }),
  }),
});

export const collections = { chapters };
