// First visit at "/" at all six viewports + favicon set + 404 + console errors.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";

const browser = await launch();
const report = { favicon: {}, home: {}, notfound: {} };

// favicon / head assets
for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "site.webmanifest", "favicon-32.png", "icon-192.png", "icon-512.png", "og.png"]) {
  const r = await fetch(`${BASE}/${f}`);
  report.favicon[f] = { status: r.status, type: r.headers.get("content-type"), len: r.headers.get("content-length") };
  if (f === "site.webmanifest" && r.ok) report.favicon.manifest = await r.text();
}

for (const [k, vp] of Object.entries(VPS)) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const t0 = Date.now();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(1800);
  const head = await page.evaluate(() => ({
    title: document.title,
    icons: [...document.querySelectorAll('link[rel*="icon"],link[rel="manifest"]')].map((l) => `${l.rel} ${l.getAttribute("href")} ${l.getAttribute("sizes") || ""}`),
    cta: [...document.querySelectorAll("a,button")].map((a) => a.textContent.trim()).filter(Boolean),
    desc: (() => { const p = document.querySelector("p"); if (!p) return null; const r = p.getBoundingClientRect(); const rects = [...(() => { const rg = document.createRange(); rg.selectNodeContents(p); return rg.getClientRects(); })()]; const lines = new Set(rects.map((x) => Math.round(x.top))); return { text: p.textContent.trim(), lines: lines.size, w: Math.round(r.width) }; })(),
    ctaRect: (() => { const a = [...document.querySelectorAll("a")].find((x) => /walk/i.test(x.textContent)); if (!a) return null; const r = a.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vh: innerHeight }; })(),
    burger: !!document.querySelector('button[aria-label*="menu" i]'),
  }));
  await shot(page, `home-${k}`);
  report.home[k] = { ...head, ms: Date.now() - t0, log };
  await c.close();
}

// 404 at 390 and 1440
for (const k of ["p390", "d1440"]) {
  const c = await ctx(browser, VPS[k]);
  const page = await c.newPage();
  const log = watch(page);
  const r = await page.goto(BASE + "/nope-not-here", { waitUntil: "networkidle" });
  await sleep(1200);
  await shot(page, `404-${k}`);
  report.notfound[k] = { status: r.status(), title: await page.title(), text: (await page.evaluate(() => document.body.innerText)).slice(0, 400), log };
  // trailing slash redirect
  const r2 = await page.goto(BASE + "/bakery/", { waitUntil: "networkidle" });
  await sleep(1500);
  report.notfound[k + "_trailing"] = { status: r2.status(), url: page.url(), title: await page.title() };
  await c.close();
}

save("home.json", report);
console.log(JSON.stringify(report, null, 2));
await browser.close();
