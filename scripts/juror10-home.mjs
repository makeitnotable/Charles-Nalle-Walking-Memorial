// First visit at "/" across all six viewports + favicon fetch + 404
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, overflow } from "./juror10-lib.mjs";

const errs = [];
const results = {};
// favicon
for (const p of ["/favicon.svg", "/favicon.ico", "/apple-touch-icon.png", "/site.webmanifest", "/favicon-32.png", "/icon-192.png", "/icon-512.png", "/og.png"]) {
  const r = await fetch(BASE + p);
  const ct = r.headers.get("content-type");
  const buf = await r.arrayBuffer();
  results[p] = { status: r.status, ct, bytes: buf.byteLength };
  if (p === "/site.webmanifest") results[p].body = Buffer.from(buf).toString().slice(0, 600);
  if (p === "/favicon.svg") results[p].head = Buffer.from(buf).toString().slice(0, 300);
}
console.log("ICONS", JSON.stringify(results, null, 1));

const browser = await launch();
for (const [k, vp] of Object.entries(VIEWPORTS)) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `home-${k}`, errs);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(1800);
  await shot(page, `home-${k}`);
  // measure: eyebrow line top, hero image object-position, and links
  const info = await page.evaluate(() => {
    const eyebrow = [...document.querySelectorAll("p, span, div")].find((e) => /Troy, New York/.test(e.textContent || "") && e.children.length === 0);
    const r = eyebrow?.getBoundingClientRect();
    const vid = document.querySelector("video");
    const img = document.querySelector("picture img, img");
    const cta = [...document.querySelectorAll("a, button")].find((e) => /Walk the story/i.test(e.textContent || ""));
    const cr = cta?.getBoundingClientRect();
    const head = document.querySelector('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]');
    const icons = [...document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]')].map((l) => l.rel + " " + l.getAttribute("href") + " " + (l.getAttribute("sizes") || ""));
    return {
      title: document.title,
      eyebrowTop: r ? Math.round(r.top) : null,
      eyebrowText: eyebrow?.textContent?.trim(),
      videoPos: vid ? getComputedStyle(vid).objectPosition : null,
      imgPos: img ? getComputedStyle(img).objectPosition : null,
      imgSrc: img?.currentSrc?.split("/").pop(),
      cta: cr ? { top: Math.round(cr.top), bottom: Math.round(cr.bottom), left: Math.round(cr.left), right: Math.round(cr.right), h: Math.round(cr.height), text: cta.textContent.trim() } : null,
      icons,
      desc: [...document.querySelectorAll("p")].map((p) => ({ t: p.textContent.trim().slice(0, 50), lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize })).filter((x) => x.t.length > 30),
    };
  });
  const ov = await overflow(page);
  console.log(k, JSON.stringify(info), "OVERFLOW", JSON.stringify(ov));
  await c.close();
}
// 404 + trailing slash
{
  const c = await ctx(browser, VIEWPORTS.d1440);
  const page = await c.newPage();
  watchConsole(page, "404", errs);
  await page.goto(BASE + "/nope-page", { waitUntil: "networkidle" });
  await sleep(800);
  await shot(page, "404-d1440");
  console.log("404 title", await page.title(), await page.evaluate(() => document.querySelector("h1")?.textContent));
  await page.goto(BASE + "/bakery/", { waitUntil: "networkidle" });
  await sleep(1500);
  console.log("trailing slash ->", page.url(), await page.title());
  await c.close();
}
await browser.close();
console.log("CONSOLE", JSON.stringify(errs, null, 1));
