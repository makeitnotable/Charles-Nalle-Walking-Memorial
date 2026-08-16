import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
for (const key of ["p390", "p360", "t768", "t1024", "d1440", "d1920"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, key);
  await goto(page, "/people", 2000);
  await shot(page, `people-${key}-01-top`);
  const h1 = await page.evaluate(() => { const h = document.querySelector("h1"); const lines = [...h.querySelectorAll(".line-box, .line")].filter((l) => l.getBoundingClientRect().height > 0).map((l) => l.textContent.trim()); return { txt: h.textContent.trim().replace(/\s+/g, " "), lines, rects: h.getClientRects().length }; });
  log(key, "H1:", JSON.stringify(h1));
  // cards: check note/role inside viewport & column
  const cards = await page.evaluate(() => {
    const iw = innerWidth;
    const arts = [...document.querySelectorAll("article, li")].filter((a) => a.querySelector("h3"));
    return arts.map((a) => {
      const ar = a.getBoundingClientRect();
      const role = a.querySelector("p.t-meta, .t-meta");
      const name = a.querySelector("h3");
      const note = a.querySelector("p.t-prose, .t-prose");
      const r = (e) => e && e.getBoundingClientRect();
      const roleR = r(role), noteR = r(note), nameR = r(name);
      const roleLines = role ? role.getClientRects().length : 0;
      const roleH = roleR ? Math.round(roleR.height / parseFloat(getComputedStyle(role).lineHeight)) : 0;
      return { name: name?.textContent.trim(), role: role?.textContent.trim(), roleLines: roleH, roleRight: roleR && Math.round(roleR.right), noteRight: noteR && Math.round(noteR.right), cardRight: Math.round(ar.right), cardW: Math.round(ar.width), overflow: (roleR && roleR.right > ar.right + 1) || (noteR && noteR.right > ar.right + 1) || (roleR && roleR.right > iw) || (noteR && noteR.right > iw), roleSW: role && role.scrollWidth > role.clientWidth + 1 };
    });
  });
  for (const cd of cards) log(key, JSON.stringify(cd));
  // scroll to cards and shoot
  await page.evaluate(() => document.querySelector("article, li h3")?.scrollIntoView({ behavior: "instant" }));
  await sleep(1200);
  await shot(page, `people-${key}-02-cards`);
  await page.evaluate(() => scrollBy(0, innerHeight * 0.9));
  await sleep(1000);
  await shot(page, `people-${key}-03-cards2`);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await sleep(1200);
  await shot(page, `people-${key}-04-closer`);
  const closer = await page.evaluate(() => { const s = [...document.querySelectorAll("section")].pop(); return s?.innerText.replace(/\s+/g, " ").slice(0, 200); });
  log(key, "closer:", closer);
  const of = await overflowCheck(page);
  log(key, "overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean", "errs:", errs.length ? errs : "none");
  await c.close();
}
await browser.close();
