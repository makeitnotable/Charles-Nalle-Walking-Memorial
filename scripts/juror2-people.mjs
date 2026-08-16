import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
for (const vpk of (process.argv[2] || "d1440,t768,p390").split(",")) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/people", 2000);
  const probe = () => page.evaluate(() => { const h = [...document.querySelectorAll("h3")].find((e) => /CHARLES NALLE/i.test(e.textContent)); if (!h) return "no h3"; let e = h, chain = []; while (e && e !== document.body) { const cs = getComputedStyle(e); if (parseFloat(cs.opacity) < 1 || cs.visibility === "hidden" || cs.transform !== "none") chain.push(`${e.tagName}.${e.className.toString().slice(0, 30)} op=${cs.opacity} vis=${cs.visibility} tf=${cs.transform.slice(0, 20)}`); e = e.parentElement; } const r = h.getBoundingClientRect(); return `y=${Math.round(r.top + scrollY)} vy=${Math.round(r.top)} chain=[${chain.join(" > ")}]`; });
  console.log(vpk, "at load:", await probe());
  // slow natural scroll
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 120) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(70); }
  console.log(vpk, "after slow scroll:", await probe());
  const y = await page.evaluate(() => { const h = [...document.querySelectorAll("h3")].find((e) => /CHARLES NALLE/i.test(e.textContent)); return h.getBoundingClientRect().top + scrollY; });
  await page.evaluate((y) => scrollTo(0, y - 200), y); await sleep(1500);
  console.log(vpk, "scrolled to card:", await probe());
  await shot(page, `people-${vpk}-rescuers`);
  const rescuers = await page.evaluate(() => [...document.querySelectorAll("h3")].slice(0, 8).map((h) => { const r = h.getBoundingClientRect(); return `${h.textContent.trim().slice(0, 18)}@y${Math.round(r.top + scrollY)} op=${getComputedStyle(h).opacity}`; }));
  console.log(vpk, rescuers.join(" | "));
  await c.close();
}
await browser.close();
