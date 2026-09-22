import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
// N1: close-X spin
for (const vpk of ["p390", "d1440"]) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/mansion", 2000);
  const sub = await page.evaluate(() => { const b = document.querySelector('button[aria-label^="Play narration"]'); const wrap = b && b.closest("div,section"); return wrap ? wrap.textContent.replace(/\s+/g, " ").trim().slice(0, 120) : "n/a"; });
  console.log(vpk, "mansion player text:", sub);
  await page.locator('button[aria-label="Open menu"]').click(); await sleep(900);
  const info = await page.evaluate(() => { const x = document.querySelector('button[aria-label="Close menu"]'); const icon = x.querySelector("svg, span, i") || x; const cs = getComputedStyle(x), ci = getComputedStyle(icon); return { btnTransition: cs.transition, iconTransition: ci.transition, btnTf: cs.transform, iconTf: ci.transform }; });
  console.log(vpk, "close btn styles:", JSON.stringify(info));
  const x = page.locator('button[aria-label="Close menu"]');
  const b = await x.boundingBox();
  const samples = [];
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  for (let i = 0; i < 12; i++) { samples.push(await page.evaluate(() => { const x = document.querySelector('button[aria-label="Close menu"]'); const icon = x.querySelector("svg, span, i") || x; return `${getComputedStyle(icon).transform.slice(0, 40)}|${getComputedStyle(x).transform.slice(0, 40)}|op=${getComputedStyle(x.closest('[class*=panel], [role=dialog], nav') || x).opacity}`; })); await sleep(30); }
  console.log(vpk, "close spin samples:", samples.join("\n   "));
  await c.close();
}
// About + 404 shots
for (const vpk of ["p390", "d1440"]) {
  const vp = VPS[vpk]; const c = await ctx(browser, vp); const page = await c.newPage();
  await go(page, "/about", 2000);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 150) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(50); }
  const secs = await page.evaluate(() => [...document.querySelectorAll("section, [id]")].filter((e) => e.id).map((e) => e.id + "@" + Math.round(e.getBoundingClientRect().top + scrollY)));
  console.log(vpk, "about ids:", secs.join(" "));
  const heads = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,.t-meta")].map((h) => h.textContent.trim().replace(/\s+/g, " ").slice(0, 60)).filter((t) => t));
  console.log(vpk, "about heads:", heads.join(" | "));
  // shots: quote/afterword + closer
  const q = await page.$("blockquote, .t-quote"); if (q) { await q.scrollIntoView?.(); await q.evaluate((e) => e.scrollIntoView({ block: "center" })); await sleep(900); await shot(page, `about-${vpk}-quote`); }
  const cta = page.locator("a", { hasText: "Walk the story" }).last(); await cta.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, 200)); await sleep(900); await shot(page, `about-${vpk}-closer`);
  await go(page, "/404", 1500); await shot(page, `p404-${vpk}`);
  await c.close();
}
await browser.close();
