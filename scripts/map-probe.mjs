// Diagnostic: why is the map canvas dark? Checks WebGL, canvas size, mapbox
// network traffic, and map error events on /map.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4321";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const mapboxReqs = [];
page.on("response", (r) => {
  const u = r.url();
  if (u.includes("mapbox")) mapboxReqs.push(`${r.status()} ${u.slice(0, 110)}`);
});
const errors = [];
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) errors.push(`${m.type()}: ${m.text().slice(0, 200)}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));

await page.goto(BASE + "/map", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(6000);

const probe = await page.evaluate(() => {
  const canvas = document.querySelector(".mapboxgl-canvas");
  const shell = document.querySelector(".map-shell");
  const gl = document.createElement("canvas").getContext("webgl2");
  return {
    canvasPresent: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height} css:${canvas.clientWidth}x${canvas.clientHeight}` : null,
    shellHeight: shell?.clientHeight,
    webgl2: !!gl,
    renderer: gl ? gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info")?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER) : null,
    markers: document.querySelectorAll(".troy-marker").length,
  };
});
console.log(JSON.stringify(probe, null, 2));
console.log("--- mapbox responses (first 15):");
console.log(mapboxReqs.slice(0, 15).join("\n") || "(none)");
console.log("--- console errors/warnings (first 10):");
console.log(errors.slice(0, 10).join("\n") || "(none)");
await browser.close();
