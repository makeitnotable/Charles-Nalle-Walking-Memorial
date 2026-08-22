# Source masters — NOT web assets

Delivered art at full resolution: 2400×1600 / 1600×2400 PNG stills, `_animation`
MP4s, and the 23000×19267 JP2 of the 1858 Library of Congress plate.

**Nothing here is served.** The site serves derived assets from `public/media/`
(the `avif`/`webp`/`jpg` ladder at 400/800/1440). This folder sits outside
`public/`, so Astro never copies it into `dist/` — do not move it there.

To turn a master into site assets, use `scripts/build-media.mjs` (its MANIFEST
maps `slug → key → source path`; outputs are committed, CI never re-processes).

Naming, as delivered: `N. …-1.png` = landscape, `N. ….png` = portrait,
`N.1`/`N.2` = the narrative works, `2.2 … pt2` = Chapter 2's second part.
