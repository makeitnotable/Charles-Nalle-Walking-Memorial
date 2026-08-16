import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";
const vpk = process.argv[2] || "p390";
const vp = VPS[vpk];
const R = { vpk, pages: {} };
const browser = await launch();
for (const route of ["/people", "/about", "/404", "/bakery/", "/mansion", "/ferry"]) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  const slug = route.replace(/\//g, "") || "home";
  await goto(page, route); await sleep(1500);
  const info = await page.evaluate(() => ({ url: location.pathname, title: document.title, h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " / "), hScroll: document.documentElement.scrollWidth > innerWidth, docH: document.documentElement.scrollHeight, headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName} ${h.innerText.replace(/\s+/g, " ").slice(0, 60)}`), ctas: [...document.querySelectorAll("a.btn, a[class*=btn], button.btn")].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.innerText.trim().replace(/\s+/g, " ")), emdash: (document.body.innerText.match(/—/g) || []).length, spotLinks: [...document.querySelectorAll("a")].filter((a) => /Spot \d/i.test(a.innerText)).length }));
  R.pages[route] = { info, log };
  if (route === "/bakery/") { await sleep(1500); R.pages[route].after = { url: page.url(), h1: await page.evaluate(() => document.querySelector("h1")?.innerText.replace(/\s+/g, " ")) }; await shot(page, `${slug}-slash-${vpk}`); await c.close(); continue; }
  await shot(page, `${slug}-${vpk}-01-top`);
  // slow scroll through so reveals fire, then full page
  const docH = info.docH;
  for (let y = 0; y < docH; y += Math.round(vp.height * 0.6)) { await page.evaluate((yy) => scrollTo(0, yy), y); await sleep(220); }
  await sleep(500);
  await shot(page, `${slug}-${vpk}-02-bottom`);
  await page.evaluate(() => scrollTo(0, 0)); await sleep(700);
  await shot(page, `${slug}-${vpk}-03-full`, true);
  if (route === "/people" || route === "/about") {
    // mid shots
    await page.evaluate((h) => scrollTo(0, h * 1.0), vp.height); await sleep(600); await shot(page, `${slug}-${vpk}-04-mid1`);
    await page.evaluate((h) => scrollTo(0, h * 2.2), vp.height); await sleep(600); await shot(page, `${slug}-${vpk}-05-mid2`);
    // menu
    await page.evaluate(() => scrollBy(0, -100)); await sleep(500);
    await page.locator(".cnwm-menu-burger").click({ force: true }); await sleep(700);
    await shot(page, `${slug}-${vpk}-06-menu`);
    R.pages[route].menuFloat = await floating(page);
    await page.locator(".cnwm-menu-close").click(); await sleep(400);
  }
  await c.close();
}
await browser.close();
save(`misc-${vpk}.json`, R);
for (const [r, v] of Object.entries(R.pages)) console.log(r, JSON.stringify({ ...v.info, headings: v.info.headings.slice(0, 14) }).slice(0, 700), "\n   LOG", v.log, v.after || "");
