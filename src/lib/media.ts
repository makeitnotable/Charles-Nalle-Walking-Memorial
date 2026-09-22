import { withBase } from "./url";

/**
 * Srcset for an optimized image key under public/media/<slug>/.
 *
 * `widths` defaults to the pair every full-width slot uses. Thumbnail slots
 * pass a smaller ladder: with only 800/1440 offered, a 112px index thumbnail
 * still had to take the 800 — five of them on /map was a quarter-megabyte of
 * image for slots the size of a postage stamp. Tiers below 800 are produced
 * by scripts/build-thumb-tier.mjs; only pass a width that exists.
 */
export function picture(slug: string, key: string, widths: number[] = [800, 1440]) {
  const stem = `media/${slug}/${key}`;
  const set = (ext: string) =>
    widths.map((w) => `${withBase(`${stem}-${w}.${ext}`)} ${w}w`).join(", ");
  return {
    avif: set("avif"),
    webp: set("webp"),
    fallback: withBase(`${stem}-1440.jpg`),
  };
}

export function video(slug: string, key: string) {
  return {
    src: withBase(`media/${slug}/${key}.mp4`),
    poster: withBase(`media/${slug}/${key}-poster.jpg`),
  };
}
