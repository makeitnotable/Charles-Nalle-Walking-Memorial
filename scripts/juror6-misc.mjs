import { launch, ctx, VPS, goto, shot, watch, sleep, touchDrag } from "./juror6-lib.mjs";
// 1) map hint chip lifetime at 390
{
  const browser = await launch(); const c = await ctx(browser, VPS.p390); const page = await c.newPage(); watch(page);
  await goto(page, "/map");
  const chip = () => page.evaluate(() => { const e = [...document.querySelectorAll("*")].find(e => e.children.length === 0 && /drag to explore/i.test(e.innerText || "")); if (!e) return null; let op = 1, p = e; while (p && p !== document.body) { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; } const r = e.getBoundingClientRect(); return { op: Math.round(op * 100) / 100, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }; });
  for (const t of [3000, 8000, 14000]) { await sleep(t === 3000 ? 3000 : 5000); console.log(`hint chip @${t}ms:`, JSON.stringify(await chip())); }
  await touchDrag(page, { x: 200, y: 400 }, { x: 240, y: 300 }, 10, 16); await sleep(1500);
  console.log("hint chip after a map drag:", JSON.stringify(await chip()));
  await shot(page, "map-p390-hint-after-drag");
  await browser.close();
}
// 2) 1920 chapter hero + 360 chapter hero + 404 + about footer 768
for (const [vp, route, name] of [[VPS.d1920, "/mansion", "mansion-hero-1920"], [VPS.p360, "/ferry", "ferry-hero-360"], [VPS.p390, "/404", "404-390"], [VPS.d1440, "/404", "404-1440"]]) {
  const browser = await launch(); const c = await ctx(browser, vp); const page = await c.newPage(); const log = watch(page);
  await goto(page, route); await sleep(1800); await shot(page, name);
  if (route === "/404") { const links = await page.evaluate(() => [...document.querySelectorAll("main a, main button")].map(a => a.innerText.trim().replace(/\s+/g, " "))); console.log(name, "links:", links); }
  console.log(name, "errors", log.errors.filter(e => !/404/.test(e)));
  await browser.close();
}
{
  const browser = await launch(); const c = await ctx(browser, VPS.t768); const page = await c.newPage(); watch(page);
  await goto(page, "/about"); await sleep(1500); await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(800);
  await shot(page, "about-footer-768");
  await browser.close();
}
