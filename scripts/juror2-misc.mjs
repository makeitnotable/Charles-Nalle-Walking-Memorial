// People / About / 404 / trailing slash / reduced motion / 200% zoom / console sweep / menu on every page.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, OUT, BASE } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const errs = []; const notes = []; const N = (s) => { notes.push(s); console.log(s); };
const browser = await launch();
const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404"];

// 1. Full-page shots of people/about/404 at phone/tablet/desktop + menu open on every page + console sweep
for (const vpk of ["p390", "t768", "d1440"]) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage(); watchConsole(page, `sweep-${vpk}`, errs);
  for (const r of routes) {
    await go(page, r, r === "/map" ? 5000 : 2000);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(100); }
    await page.evaluate(() => scrollTo(0, 0)); await sleep(700);
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    N(`${r}@${vpk} docH=${H} overflowX=${ox}`);
    if (["/people", "/about", "/404"].includes(r)) { await shot(page, `misc-${r.slice(1)}-${vpk}-full`, { fullPage: true, scale: "css" }); await shot(page, `misc-${r.slice(1)}-${vpk}-top`); }
    // menu on every page (from top)
    const burger = page.locator('button[aria-label="Open menu"]');
    if (await burger.count()) {
      const ok = await burger.click({ timeout: 5000 }).then(() => true).catch(() => false);
      await sleep(700);
      if (ok) { if (["/", "/people", "/about", "/404", "/map"].includes(r)) await shot(page, `menu-${r === "/" ? "home" : r.slice(1)}-${vpk}`); const closeBtn = page.locator('button[aria-label="Close menu"]'); await closeBtn.click({ timeout: 5000 }).catch(() => {}); await sleep(500); }
      N(`${r}@${vpk} menu open ok=${ok}`);
    } else N(`${r}@${vpk} NO burger`);
  }
  await c.close();
}

// 2. Trailing slash + unknown URL
{
  const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
  await page.goto(BASE + "/bakery/", { waitUntil: "load" }); await sleep(2500);
  N(`trailing slash /bakery/ → ${page.url()} title=${await page.title()}`);
  await page.goto(BASE + "/nope", { waitUntil: "load" }); await sleep(1500);
  N(`/nope → ${page.url()} title=${await page.title()} h1=${await page.evaluate(() => document.querySelector("h1")?.textContent.trim())}`);
  await shot(page, "misc-404-nope-d1440");
  await c.close();
}

// 3. Reduced motion on /, a chapter, /map, /paintings at phone + desktop
for (const vpk of ["p390", "d1440"]) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp, { reducedMotion: "reduce" }); const page = await c.newPage(); watchConsole(page, `rm-${vpk}`, errs);
  for (const r of ["/", "/ferry", "/map", "/paintings"]) {
    await go(page, r, r === "/map" ? 5000 : 2000);
    await shot(page, `rm-${r === "/" ? "home" : r.slice(1)}-${vpk}-top`);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(80); }
    // check hidden text (opacity 0 / not revealed)
    const hidden = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,p,li,figcaption")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden") && e.textContent.trim().length > 2 && !e.closest("dialog") && !e.closest("[aria-hidden=true]") && !e.closest(".cnwm-menu"); }).map((e) => e.tagName + ":" + e.textContent.trim().slice(0, 40)));
    N(`rm ${r}@${vpk} hidden text blocks: ${hidden.length} ${hidden.slice(0, 5).join(" | ")}`);
    if (r === "/paintings") { const slot = await page.evaluate(() => { const s = document.getElementById("museum-slot"); return s ? { top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height), canvas: !!s.querySelector("canvas") } : null; }); N(`rm /paintings@${vpk} museum slot: ${JSON.stringify(slot)}`); await page.evaluate(() => scrollTo(0, 400)); await sleep(1200); await shot(page, `rm-paintings-${vpk}-slot`); }
    if (r === "/ferry") { await page.evaluate(() => scrollTo(0, 1200)); await sleep(800); await shot(page, `rm-ferry-${vpk}-story`); const cta = page.locator("#onward a", { hasText: "Continue" }).first(); await cta.scrollIntoViewIfNeeded(); await sleep(500); await cta.click({ noWaitAfter: true }); await sleep(250); await shot(page, `rm-ferry-${vpk}-continue-250`); await sleep(1500); N(`rm continue → ${page.url()}`); }
    if (r === "/map") { await page.locator('button:visible:has-text("Take the walk")').click(); await sleep(3000); await shot(page, `rm-map-${vpk}-walk`); }
  }
  await c.close();
}

// 4. 200% zoom (720x450) on every route
{
  const c = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 }); const page = await c.newPage(); watchConsole(page, "zoom200", errs);
  for (const r of routes) {
    await go(page, r, r === "/map" ? 4000 : 1500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 300) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(60); }
    const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    N(`zoom200 ${r} overflowX=${ox} docH=${H}`);
    await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
    await shot(page, `zoom200-${r === "/" ? "home" : r.slice(1)}`);
    if (r === "/bakery") { await page.evaluate(() => scrollTo(0, 1500)); await sleep(500); await shot(page, `zoom200-bakery-story`); }
    if (r === "/map") { await page.locator('button:visible:has-text("Take the walk")').click(); await sleep(3500); await shot(page, `zoom200-map-walk`); }
  }
  await c.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `misc-notes.txt`), notes.concat(["", "CONSOLE:", ...errs.filter((e) => !/vector\.pbf|ERR_ABORTED/.test(e))]).join("\n"));
console.log("console:", errs.filter((e) => !/vector\.pbf|ERR_ABORTED/.test(e)).join("\n"));
