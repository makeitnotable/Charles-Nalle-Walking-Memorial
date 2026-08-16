import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";

const results = {};
const browser = await launch();
for (const [key, vp] of Object.entries(VPS)) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const t0 = Date.now();
  await goto(page, "/");
  await sleep(1400);
  // where is the eyebrow line and the CTA?
  const info = await page.evaluate(() => {
    const txt = (s) => [...document.querySelectorAll("*")].find((e) => e.children.length === 0 && (e.textContent || "").includes(s));
    const eyebrow = txt("Troy, New York");
    const cta = [...document.querySelectorAll("a,button")].find((e) => /walk the story/i.test(e.textContent || ""));
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const vid = document.querySelector("video");
    const pic = document.querySelector("picture img, img");
    const desc = [...document.querySelectorAll("p")].map((p) => ({ t: p.innerText.slice(0, 40), lines: p.getClientRects().length, h: Math.round(p.getBoundingClientRect().height), fs: getComputedStyle(p).fontSize, lh: getComputedStyle(p).lineHeight, color: getComputedStyle(p).color, w: Math.round(p.getBoundingClientRect().width) }));
    return {
      eyebrow: r(eyebrow), eyebrowText: eyebrow?.textContent?.trim(),
      cta: r(cta), ctaText: cta?.textContent?.trim(), ctaHref: cta?.getAttribute("href"),
      video: vid ? { pos: getComputedStyle(vid).objectPosition, src: vid.currentSrc?.split("/").pop(), playing: !vid.paused } : null,
      img: pic ? { pos: getComputedStyle(pic).objectPosition, src: pic.currentSrc?.split("/").pop() } : null,
      desc, title: document.title,
      links: [...document.querySelectorAll("a")].map((a) => a.textContent.trim().slice(0, 30) + " -> " + a.getAttribute("href")),
      hScroll: document.documentElement.scrollWidth > innerWidth,
    };
  });
  results[key] = { info, log, loadMs: Date.now() - t0 };
  await shot(page, `home-${key}`);
  // Menu open/close on home
  const burger = page.locator('button[aria-label*="menu" i]').first();
  if (await burger.count()) {
    await burger.click();
    await sleep(700);
    await shot(page, `home-${key}-menu`);
    results[key].menuLinks = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] a, nav a, .cnwm-menu a')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.textContent.trim().replace(/\s+/g, " ").slice(0, 40)));
    results[key].menuFloating = await floating(page);
    await page.keyboard.press("Escape");
    await sleep(500);
    results[key].menuClosedByEsc = await page.evaluate(() => !document.querySelector('[aria-expanded="true"]'));
  } else results[key].burger = "NOT FOUND";
  await c.close();
}
// reduced motion + landscape home
{
  const c = await ctx(browser, VPS.p390, { reducedMotion: "reduce" });
  const page = await c.newPage(); const log = watch(page);
  await goto(page, "/"); await sleep(600);
  await shot(page, "home-p390-reduced");
  results.reduced = { log, visible: await page.evaluate(() => [...document.querySelectorAll("h1,p,a")].map((e) => ({ t: e.textContent.trim().slice(0, 30), op: getComputedStyle(e).opacity, vis: getComputedStyle(e).visibility }))) };
  await c.close();
}
await browser.close();
save("home.json", results);
console.log(JSON.stringify(results, null, 1).slice(0, 12000));
