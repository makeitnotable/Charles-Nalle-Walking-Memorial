#!/usr/bin/env node
/**
 * Generates `src/data/route.json` — the real walking geometry between the five
 * stops, from the Mapbox Directions API (profile: walking), in plaque order.
 *
 * Why this exists: the map used to draw the route by interpolating 60 points
 * between each pair of coordinates. That is a straight chord, not a walk — the
 * line crossed the Hudson twice, cut diagonally through city blocks and the
 * rail yard, and followed no street. On a walking memorial that is not a
 * styling problem, it is a factual error.
 *
 * Run it again if a plaque coordinate ever moves:
 *   node scripts/build-route.mjs
 *
 * The output is committed so the site needs no Directions call at runtime and
 * no extra API quota.
 */
import { readFileSync, writeFileSync } from "node:fs";

const token = (process.env.PUBLIC_MAPBOX_TOKEN ??
  readFileSync(".env.production", "utf8")
    .split("\n")
    .find((l) => l.startsWith("PUBLIC_MAPBOX_TOKEN="))
    ?.split("=")
    .slice(1)
    .join("=")
    .trim() ??
  "").replace(/^["']|["']$/g, "");

if (!token.startsWith("pk.")) {
  console.error("No Mapbox token — set PUBLIC_MAPBOX_TOKEN or .env.production");
  process.exit(1);
}

const SLUGS = ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"];
const stops = SLUGS.map((slug) => {
  const j = JSON.parse(readFileSync(`src/content/chapters/${slug}.json`, "utf8"));
  return { slug, order: j.order, coordinates: j.map.coordinates };
}).sort((a, b) => a.order - b.order);

const path = stops.map((s) => s.coordinates.join(",")).join(";");
const url =
  `https://api.mapbox.com/directions/v5/mapbox/walking/${path}` +
  `?geometries=geojson&overview=full&steps=false&access_token=${token}`;

const res = await fetch(url).then((r) => r.json());
if (!res.routes?.[0]) {
  console.error("Directions failed:", JSON.stringify(res).slice(0, 300));
  process.exit(1);
}
const route = res.routes[0];

writeFileSync(
  "src/data/route.json",
  JSON.stringify(
    {
      note:
        "Real walking geometry from Mapbox Directions (profile: walking), five stops in plaque order. " +
        "Regenerate with scripts/build-route.mjs. The previous route was straight chords between " +
        "coordinates — it crossed the Hudson twice and cut through city blocks.",
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      legs: route.legs.map((l) => ({
        distanceMeters: Math.round(l.distance),
        durationSeconds: Math.round(l.duration),
      })),
      coordinates: route.geometry.coordinates.map((c) => [
        +c[0].toFixed(6),
        +c[1].toFixed(6),
      ]),
    },
    null,
    1,
  ),
);

console.log(
  `route → src/data/route.json — ${route.geometry.coordinates.length} points, ` +
    `${Math.round(route.distance)}m (${(route.distance / 1609.34).toFixed(2)} mi), ` +
    `${Math.round(route.duration / 60)} min walking`,
);
