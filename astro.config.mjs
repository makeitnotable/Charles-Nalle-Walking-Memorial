// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// Deploys from the `main` branch of HartCluettMuseum/Charles-Nalle-Walking-Memorial.
// GitHub Pages is the ONLY deploy target (the workflow sets SITE and BASE);
// the old Vercel project that served a superseded 2024 prototype was deleted
// on 2026-09-23. This fallback only shapes canonical/og URLs in
// local QA builds, which are never published.
const site = process.env.SITE ?? "https://hartcluettmuseum.github.io";
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
