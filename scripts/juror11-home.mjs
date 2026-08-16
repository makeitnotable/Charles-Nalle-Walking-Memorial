import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, rect, sleep } from "./juror11-lib.mjs";

const browser = await launch();
const errsAll = [];
for (const key of ["p390", "p360", "land", "t768", "t1024", "d1440", "d1920"]) {
  const vp = VPS[key];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, `home-${key}`);
  await goto(page, "/", 2500);
  await shot(page, `home-${key}`);
  const info = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const r = (el) => (el ? el.getBoundingClientRect().toJSON() : null);
    const eyebrow = [...document.querySelectorAll("p,span,div")].find((e) => /Troy, New York/.test(e.textContent) && e.children.length === 0);
    const cta = [...document.querySelectorAll("a,button")].find((e) => /Walk the story/i.test(e.textContent));
    const desc = q(".home-desc") || [...document.querySelectorAll("p")].find((e) => e.textContent.length > 80);
    const img = q("picture img") || q("img");
    const vid = q("video");
    const descLines = desc ? Math.round(desc.getBoundingClientRect().height / parseFloat(getComputedStyle(desc).lineHeight)) : null;
    return {
      eyebrow: eyebrow?.textContent.trim(), eyebrowRect: r(eyebrow),
      cta: cta?.textContent.trim(), ctaRect: r(cta),
      descLines, descText: desc?.textContent.trim().slice(0, 60), descColor: desc && getComputedStyle(desc).color, descFs: desc && getComputedStyle(desc).fontSize,
      imgPos: img && getComputedStyle(img).objectPosition, vidPos: vid && getComputedStyle(vid).objectPosition,
      vidPlaying: vid ? !vid.paused : null, h1: q("h1")?.textContent.trim().replace(/\s+/g, " "),
      title: document.title,
    };
  });
  const of = await overflowCheck(page);
  log(key, JSON.stringify({ ...info, eyebrowRect: rect(info.eyebrowRect), ctaRect: rect(info.ctaRect) }));
  log(key, "overflow:", of.bodySW, of.docSW, of.iw, of.offenders.length ? of.offenders : "clean");
  errsAll.push(...errs);
  await c.close();
}
log("console errors:", errsAll.length ? errsAll : "none");
await browser.close();
