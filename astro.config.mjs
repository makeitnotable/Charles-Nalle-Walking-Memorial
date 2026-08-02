// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// GH Pages project site under the makeitnotable account until museum handoff.
// Override with SITE/BASE env vars when the repo transfers (see docs/PLAN.md M6).
const site = process.env.SITE ?? "https://makeitnotable.github.io";
const base = process.env.BASE ?? "/charles-nalle-memorial";

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
