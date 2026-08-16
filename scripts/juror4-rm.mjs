import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";
const out = {};
// reduced motion at 390 and 1440
for (const vpk of ["p390", "d1440"]) {
  const vp = VPS[vpk];
  for (const route of ["/", "/ferry", "/map", "/paintings"]) {
    const browser = await launch();
    const c = await ctx(browser, vp, { reducedMotion: "reduce" });
    const page = await c.newPage(); const log = watch(page);
    await goto(page, route); await sleep(2500);
    const slug = route.replace("/", "") || "home";
    await shot(page, `rm-${slug}-${vpk}-top`);
    const docH = await page.evaluate(() => document.documentElement.scrollHeight);
    // scroll through and check nothing stays invisible (opacity 0) among headings/paragraphs
    for (let y = 0; y < docH; y += Math.round(vp.height * 0.7)) { await page.evaluate((yy) => scrollTo(0, yy), y); await sleep(120); }
    await sleep(600);
    const invisible = await page.evaluate(() => [...document.querySelectorAll("main h1, main h2, main h3, main p, main img, main a")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && (cs.opacity === "0" || cs.visibility === "hidden"); }).map((e) => `${e.tagName} ${(e.innerText || e.getAttribute("alt") || "").replace(/\s+/g, " ").slice(0, 40)} op:${getComputedStyle(e).opacity}`).slice(0, 12));
    let extra = {};
    if (route === "/paintings") { extra = await page.evaluate(() => ({ canvas: !!document.querySelector("#museum-slot canvas"), slotH: document.querySelector("#museum-slot")?.offsetHeight, museumText: document.querySelector("#museum-slot")?.innerText.replace(/\s+/g, " ").slice(0, 200), gridTiles: document.querySelectorAll("button.painting-open").length })); await page.evaluate(() => scrollTo(0, document.querySelector("#museum-slot").offsetTop + 200)); await sleep(1200); await shot(page, `rm-${slug}-${vpk}-museum`); }
    if (route === "/ferry") { await page.evaluate(() => scrollTo(0, document.querySelector("#scene-0").offsetTop + 200)); await sleep(800); await shot(page, `rm-${slug}-${vpk}-story`); await page.evaluate(() => scrollTo(0, document.querySelector("#moral").offsetTop + 100)); await sleep(800); await shot(page, `rm-${slug}-${vpk}-moral`); }
    if (route === "/map") { const b = page.locator('button:has-text("Take the walk")').first(); if (await b.count()) { await b.click(); await sleep(2500); await shot(page, `rm-${slug}-${vpk}-walk`); extra.walkBtns = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.innerText.trim()).filter(Boolean)); } }
    out[`${route}@${vpk}`] = { invisible, log: log.filter((l) => !/mp3|pbf/.test(l)), ...extra };
    console.log(route, vpk, JSON.stringify(out[`${route}@${vpk}`]).slice(0, 500));
    await browser.close();
  }
}
// 200% zoom = 720x450 viewport
for (const route of ["/", "/bakery", "/map", "/paintings", "/people", "/about"]) {
  const browser = await launch();
  const c = await ctx(browser, VPS.z200); const page = await c.newPage(); const log = watch(page);
  await goto(page, route); await sleep(2000);
  const slug = route.replace("/", "") || "home";
  await shot(page, `z200-${slug}-top`);
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate((y) => scrollTo(0, y), Math.round(docH * 0.35)); await sleep(700); await shot(page, `z200-${slug}-mid`);
  const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if (route === "/bakery") { const p = page.locator('button[aria-label^="Play narration"]').first(); await p.scrollIntoViewIfNeeded(); await p.click(); await sleep(1500); await page.evaluate(() => scrollBy(0, 500)); await sleep(600); await shot(page, `z200-${slug}-mini`); }
  if (route === "/map") { const b = page.locator('button:has-text("Take the walk")').first(); await b.click(); await sleep(2500); await shot(page, `z200-${slug}-walk`); }
  out[`z200 ${route}`] = { hs, log: log.filter((l) => !/mp3|pbf/.test(l)), fl: await floating(page) };
  console.log("z200", route, JSON.stringify(out[`z200 ${route}`]).slice(0, 400));
  await browser.close();
}
save("rm-z200.json", out);
