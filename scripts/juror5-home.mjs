import { launch, ctx, watch, shot, sleep, save, goto, VPS, FLOATING_JS, rect } from "./juror5-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : Object.keys(VPS);
const results = {};
const browser = await launch();
for (const key of which) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const t0 = Date.now();
  await goto(page, "/");
  await sleep(1800);
  const info = await page.evaluate(() => {
    const leaf = (s) => [...document.querySelectorAll("*")].find((e) => e.children.length === 0 && (e.textContent || "").includes(s));
    const eyebrow = leaf("Troy, New York");
    const cta = [...document.querySelectorAll("a,button")].find((e) => /walk the story/i.test(e.textContent || ""));
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const vid = document.querySelector("video");
    const pic = document.querySelector("picture img, img");
    const ps = [...document.querySelectorAll("p")].map((p) => ({ t: p.innerText.slice(0, 50), lines: p.getClientRects().length, fs: getComputedStyle(p).fontSize, color: getComputedStyle(p).color, w: Math.round(p.getBoundingClientRect().width), y: Math.round(p.getBoundingClientRect().top) }));
    return {
      eyebrow: r(eyebrow), eyebrowText: eyebrow?.textContent?.trim(),
      cta: r(cta), ctaText: cta?.textContent?.trim(), ctaHref: cta?.getAttribute("href"),
      video: vid ? { pos: getComputedStyle(vid).objectPosition, src: vid.currentSrc?.split("/").pop(), playing: !vid.paused, w: vid.videoWidth, h: vid.videoHeight, r: r(vid) } : null,
      img: pic ? { pos: getComputedStyle(pic).objectPosition, src: pic.currentSrc?.split("/").pop(), r: r(pic) } : null,
      ps, title: document.title,
      hScroll: document.documentElement.scrollWidth > innerWidth,
      docH: document.documentElement.scrollHeight,
    };
  });
  results[key] = { info, loadMs: Date.now() - t0 };
  await shot(page, `home-${key}`);
  // menu open on home
  const burger = page.locator('button[aria-label*="menu" i]').first();
  results[key].burgerCount = await burger.count();
  results[key].links = await page.evaluate(() => [...document.querySelectorAll("a,button")].filter((a) => { const b = a.getBoundingClientRect(); return b.width > 0 && getComputedStyle(a).visibility !== "hidden"; }).map((a) => (a.textContent.trim().replace(/\s+/g, " ").slice(0, 40)) + " -> " + (a.getAttribute("href") || a.getAttribute("aria-label") || "")));
  results[key].log = log;

  // QR arrival: bakery and barbershop
  for (const ch of ["bakery", "barbershop"]) {
    const l2 = watch(page);
    const t1 = Date.now();
    await goto(page, `/${ch}`);
    await sleep(1600);
    await shot(page, `arrive-${ch}-${key}`);
    const a = await page.evaluate(() => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
      const h1 = document.querySelector("h1");
      const vid = document.querySelector("video");
      const img = document.querySelector("img");
      const burger = document.querySelector('button[aria-label*="menu" i]');
      return { h1: h1?.innerText, h1r: r(h1), video: vid ? { pos: getComputedStyle(vid).objectPosition, src: vid.currentSrc?.split("/").pop(), r: r(vid) } : null, img: img ? { pos: getComputedStyle(img).objectPosition, src: img.currentSrc?.split("/").pop(), r: r(img) } : null, burger: r(burger), title: document.title, hScroll: document.documentElement.scrollWidth > innerWidth };
    });
    results[key][`arrive_${ch}`] = { a, loadMs: Date.now() - t1, log: l2 };
  }
  await c.close();
}
await browser.close();
save(`home-${which.join("_")}.json`, results);
console.log(JSON.stringify(results, null, 1));
