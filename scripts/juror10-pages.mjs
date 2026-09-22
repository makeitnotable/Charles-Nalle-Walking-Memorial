// /people, /about, /404 at every class + menu open/close + overflow; 200% zoom check
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, overflow } from "./juror10-lib.mjs";
const ALL = { ...VIEWPORTS, z720: { width: 720, height: 450, mobile: false } };
const which = process.argv[2] ? process.argv[2].split(",") : Object.keys(ALL);
const errs = [];
for (const k of which) {
  const vp = ALL[k];
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `pages-${k}`, errs);
  console.log("\n########", k);
  // PEOPLE
  await page.goto(BASE + "/people", { waitUntil: "networkidle" }); await sleep(1500);
  await shot(page, `people-top-${k}`);
  console.log("people overflow", JSON.stringify(await overflow(page)));
  const people = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("main li, main article")].filter((el) => el.querySelector("h3"));
    return cards.map((card) => {
      const cr = card.getBoundingClientRect();
      const role = card.querySelector("p.t-meta"); const name = card.querySelector("h3"); const note = card.querySelector("p.t-prose");
      const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(e); const rects = [...range.getClientRects()]; const maxRight = Math.max(...rects.map((x) => x.right)); return { t: e.textContent.trim().slice(0, 44), lines: rects.length, right: Math.round(maxRight), cardRight: Math.round(cr.right), iw: innerWidth, over: maxRight > cr.right + 1 || maxRight > innerWidth }; };
      return { role: box(role), name: box(name), note: box(note) };
    });
  });
  for (const p of people) console.log(" person:", JSON.stringify(p));
  const h1 = await page.evaluate(() => { const h = document.querySelector("main h1"); const range = document.createRange(); range.selectNodeContents(h); const rects = [...range.getClientRects()].filter((r) => r.width > 2); const lines = [...new Set(rects.map((r) => Math.round(r.top)))].sort((a, b) => a - b); return { text: h.textContent.trim().replace(/\s+/g, " "), lines: lines.length, right: Math.max(...rects.map((r) => r.right)), iw: innerWidth }; });
  console.log("people H1:", JSON.stringify(h1));
  await page.evaluate(() => scrollTo({ top: document.querySelector("main h3").getBoundingClientRect().top + scrollY - 120, behavior: "instant" })); await sleep(1200);
  await shot(page, `people-cards-${k}`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight - innerHeight * 1.5, behavior: "instant" })); await sleep(1200);
  await shot(page, `people-closer-${k}`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" })); await sleep(1200);
  await shot(page, `people-foot-${k}`);
  // menu on people
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(300);
  await page.click(".cnwm-menu-burger"); await sleep(600);
  await shot(page, `people-menu-${k}`);
  await page.click(".cnwm-menu-close"); await sleep(600);
  // ABOUT
  await page.goto(BASE + "/about", { waitUntil: "networkidle" }); await sleep(1500);
  await shot(page, `about-top-${k}`);
  console.log("about overflow", JSON.stringify(await overflow(page)));
  const aboutSecs = await page.evaluate(() => [...document.querySelectorAll("main section")].map((s) => ({ id: s.id, top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height), label: s.querySelector(".t-spine, .t-spine-sm")?.textContent.trim().slice(0, 12), h2: s.querySelector("h2")?.textContent.trim().replace(/\s+/g, " ").slice(0, 40) })));
  console.log("about sections:", JSON.stringify(aboutSecs));
  const em = await page.evaluate(() => (document.body.innerText.match(/—/g) || []).length);
  console.log("about visible em dashes:", em);
  await page.evaluate(() => { const q = [...document.querySelectorAll("main blockquote, main .t-quote")].pop(); if (q) scrollTo({ top: q.getBoundingClientRect().top + scrollY - 200, behavior: "instant" }); }); await sleep(1200);
  await shot(page, `about-quote-${k}`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight - innerHeight * 1.6, behavior: "instant" })); await sleep(1200);
  await shot(page, `about-closer-${k}`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" })); await sleep(1000);
  await shot(page, `about-foot-${k}`);
  // em dashes on all routes (visible text)
  for (const r of ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings"]) {
    if (k !== "d1440") break;
    await page.goto(BASE + r, { waitUntil: "networkidle" }); await sleep(800);
    const n = await page.evaluate(() => (document.body.innerText.match(/—/g) || []).length);
    if (n) console.log(`EM DASH on ${r}:`, n);
  }
  // 404
  await page.goto(BASE + "/nope", { waitUntil: "networkidle" }); await sleep(800);
  await shot(page, `404-${k}`);
  await c.close(); await browser.close();
}
console.log("CONSOLE", JSON.stringify(errs.filter((e) => !/404/.test(e.text)), null, 1));
