// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// Deploys as the `v2` branch of makeitnotable/Charles-Nalle-Walking-Memorial.
// Vercel (project notableprojects/charles-nalle-walking-memorial) is the launch
// target and builds every push to `v2` as a preview from "/"; the GH Pages
// workflow overrides SITE and BASE for the zero-cost handoff build.
const site =
  process.env.SITE ?? "https://charles-nalle-walking-memorial.vercel.app";
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
