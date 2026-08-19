#!/usr/bin/env node
/**
 * A fresh clone has no `.env` (it is gitignored) and `astro dev` never reads
 * `.env.production` — so the dev server rendered the map with an EMPTY Mapbox
 * token: /map blank, chapter embeds blank, and every browser instrument that
 * touches the map measuring a dead canvas. `.env.production` is committed on
 * purpose (a publishable `pk.` token — docs/DEVIATIONS.md), so the dev copy is
 * simply seeded from it the first time. Never overwrites an existing `.env`.
 */
import { existsSync, copyFileSync } from "node:fs";

if (existsSync(".env")) process.exit(0);
if (!existsSync(".env.production")) {
  console.warn("ensure-env: no .env and no .env.production — the map will render without a token");
  process.exit(0);
}
copyFileSync(".env.production", ".env");
console.log("ensure-env: seeded .env from .env.production (dev needs its own copy)");
