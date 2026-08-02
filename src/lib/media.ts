import { withBase } from "./url";

/** Srcset triple for an optimized image key under public/media/<slug>/. */
export function picture(slug: string, key: string) {
  const stem = `media/${slug}/${key}`;
  return {
    avif: `${withBase(`${stem}-800.avif`)} 800w, ${withBase(`${stem}-1440.avif`)} 1440w`,
    webp: `${withBase(`${stem}-800.webp`)} 800w, ${withBase(`${stem}-1440.webp`)} 1440w`,
    fallback: withBase(`${stem}-1440.jpg`),
  };
}

export function video(slug: string, key: string) {
  return {
    src: withBase(`media/${slug}/${key}.mp4`),
    poster: withBase(`media/${slug}/${key}-poster.jpg`),
  };
}
