#!/usr/bin/env node
/**
 * GH-Pages-like static server for dist/ (v7): `/bakery` → bakery.html,
 * `/bakery/` and unknown paths → 404.html with status 404, everything else by
 * file. `astro preview` answers trailing slashes itself, so it cannot test the
 * 404 page's own behaviour. Usage: node scripts/serve-dist.mjs [--port 4323]
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 4323;
const root = "dist";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".woff": "font/woff" };
createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let p = decodeURIComponent(url.pathname);
  const send = (file, status = 200) => {
    res.writeHead(status, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  };
  if (p === "/") return send(join(root, "index.html"));
  let f = join(root, p);
  if (existsSync(f) && statSync(f).isFile()) return send(f);
  if (!p.endsWith("/") && existsSync(f + ".html")) return send(f + ".html");
  return send(join(root, "404.html"), 404);
}).listen(port, () => console.log(`serve-dist on http://localhost:${port}`));
