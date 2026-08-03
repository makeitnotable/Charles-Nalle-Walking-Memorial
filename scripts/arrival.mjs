#!/usr/bin/env node
/**
 * E7 instrument — the QR-arrival filmstrip.
 *
 * The bronze plaques make cold-cache phone arrival the design target: someone
 * standing on a Troy sidewalk on cellular. Per chapter route this opens a
 * FRESH context (cold cache), throttles to Slow-4G + 4× CPU via CDP, navigates
 * at 390×844, and captures frames at ~0.5 / 1 / 2 / 3 / 5s from navigation
 * start. It also logs every network request in the first 10s and flags any
 * .mp4/.webm — film bytes have no business on the thin pipe before the story
 * is readable.
 *
 * Pass bars (PLAN.md E7): t=1s kicker+name legible · hero painted ≤2.5s ·
 * no dark frame >0.5s · no layout shift between the 1s and 3s frames.
 * The frames are judged by eye/juror; this file only produces them.
 *
 * Usage: node scripts/arrival.mjs <outdir> [--base URL] [--routes /bakery,...]
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outdir = args[0] && !args[0].startsWith("--") ? args[0] : "docs/v5/elements/arrival";
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4321").replace(/\/$/, "");
const ROUTES = flag("routes", "/bakery,/commissioners-office,/mansion,/ferry,/barbershop").split(",");
const FRAMES_MS = [500, 1000, 2000, 3000, 5000];
const WATCH_MS = 10000;

// DevTools "Slow 4G" profile + 4× CPU
const NET = {
  offline: false,
  latency: 400,
  downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
  uploadThroughput: (750 * 1024) / 8,
  connectionType: "cellular3g",
};

mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch();
const report = [`# QR-arrival filmstrip — ${BASE}`, "", `Slow-4G (400ms RTT · 1.6Mbps) · 4× CPU · 390×844 · cold cache.`, ""];

for (const route of ROUTES) {
  const slug = route.replace(/\//g, "");
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  // CDP throttling is invisible to Chrome's network-quality estimator in
  // headless (navigator.connection keeps reporting 4g / 9.8Mbps / 0ms rtt),
  // so the site's connection-aware film gate can never see the emulation.
  // Shim the API to what a real phone on this profile reports — the transport
  // emulation covers the wire, this covers the app's view of it.
  await ctx.addInitScript(() => {
    const fake = {
      effectiveType: "3g",
      downlink: 1.6,
      rtt: 400,
      saveData: false,
      addEventListener() {},
      removeEventListener() {},
    };
    try {
      Object.defineProperty(Navigator.prototype, "connection", {
        get: () => fake,
        configurable: true,
      });
    } catch {}
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", NET);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const reqs = [];
  let t0 = Date.now();
  page.on("request", (r) =>
    reqs.push({ t: Date.now() - t0, url: r.url(), type: r.resourceType() }),
  );

  try {
    t0 = Date.now();
    const nav = page.goto(BASE + route, { waitUntil: "load", timeout: 60000 }).catch(() => {});
    for (const ms of FRAMES_MS) {
      const wait = ms - (Date.now() - t0);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      const at = Date.now() - t0;
      await page.screenshot({ path: join(outdir, `${slug}--${(ms / 1000).toFixed(1)}s.png`) });
      console.log(`✓ ${slug} frame @ ${at}ms (target ${ms})`);
    }
    const remaining = WATCH_MS - (Date.now() - t0);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    await nav;
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message.split("\n")[0]}`);
  }

  const media = reqs.filter((r) => /\.(mp4|webm)(\?|$)/.test(r.url));
  report.push(`## ${route}`);
  report.push("");
  report.push(
    media.length
      ? `**✗ ${media.length} film request(s) on the thin pipe:** ${media.map((m) => `\`${m.url.split("/").pop()}\` @ ${(m.t / 1000).toFixed(1)}s`).join(" · ")}`
      : `✓ no film bytes in the first ${WATCH_MS / 1000}s`,
  );
  report.push(`Requests in window: ${reqs.length} (${reqs.filter((r) => r.type === "image").length} images, ${reqs.filter((r) => r.type === "font").length} fonts, ${reqs.filter((r) => r.type === "media").length} media)`);
  report.push("");
  await ctx.close();
}
await browser.close();
writeFileSync(join(outdir, "arrival.md"), report.join("\n"));
console.log(`\nfilmstrips + arrival.md → ${outdir}`);
