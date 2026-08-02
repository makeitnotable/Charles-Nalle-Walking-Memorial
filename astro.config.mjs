// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// Deploys as the `v2` branch of makeitnotable/Charles-Nalle-Walking-Memorial
// until museum handoff (see docs/PLAN.md M6). The GH Pages workflow sets BASE
// to the repo path; local dev and Vercel branch previews serve from "/".
const site = process.env.SITE ?? "https://makeitnotable.github.io";
const base = process.env.BASE ?? "/";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: "never",
  // "file" format → dist/bakery.html, which GH Pages serves at /bakery with no
  // trailing-slash redirect — one less round-trip for every QR scan on cellular.
  build: { format: "file" },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
