import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
for (const key of ["p390", "t768", "d1440"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, key);
  await goto(page, "/barbershop", 2500);
  await shot(page, `barber-${key}-01-arrival`);
  // story order: text/image sequence in scene-0
  const seq = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 figure, #scene-0 img, #scene-0 video")].map((e) => e.tagName === "P" ? "T" : (e.tagName === "FIGURE" ? "I" : (e.closest("figure") ? null : "I"))).filter(Boolean).join(""));
  log(key, "story sequence:", seq);
  // moral heading J
  await page.evaluate(() => document.querySelector("[id^=moral]")?.scrollIntoView({ behavior: "instant" }));
  await sleep(1500);
  await shot(page, `barber-${key}-02-moral`);
  // interlude credit
  const cred = await page.evaluate(() => {
    const figs = [...document.querySelectorAll("figure")];
    return figs.map((f) => { const c = f.querySelector("figcaption"); return c && { txt: c.textContent.trim().slice(0, 60), color: getComputedStyle(c).color, bg: getComputedStyle(c).backgroundColor }; }).filter(Boolean).slice(0, 4);
  });
  log(key, "captions:", JSON.stringify(cred));
  // scroll to interlude
  await page.evaluate(() => { const f = [...document.querySelectorAll("figure")].find((f) => /archiv|courtesy|hart|photo|library/i.test(f.textContent)); f?.scrollIntoView({ behavior: "instant", block: "center" }); });
  await sleep(1800);
  await shot(page, `barber-${key}-03-interlude`);
  const of = await overflowCheck(page);
  log(key, "overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean", "errs:", errs.length ? errs : "none");
  await c.close();
}
await browser.close();
