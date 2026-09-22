// Home first-visit at every class + landscape phone + reduced motion + 200% zoom
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";

const errs = [];
const res = {};
VIEWPORTS["844"] = { width: 844, height: 390, mobile: true };
const list = ["390", "360", "768", "1024", "1440", "1920", "844", "720z"];
for (const vp of list) {
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  attachConsole(page, "home-" + vp, errs);
  const t0 = Date.now();
  await goto(page, "/");
  // measure when the CTA becomes visible (opacity>0.9)
  let ctaMs = null;
  for (let i = 0; i < 40; i++) {
    const op = await page.evaluate(() => {
      const a = document.querySelector('a[href$="/map"]');
      if (!a) return 0;
      const cs = getComputedStyle(a);
      let el = a; let o = 1;
      while (el && el !== document.body) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; }
      return o;
    });
    if (op > 0.9) { ctaMs = Date.now() - t0; break; }
    await sleep(50);
  }
  await sleep(1800);
  await shot(page, `home-${vp}`);
  const info = await page.evaluate(() => {
    const a = document.querySelector('a[href$="/map"]');
    const r = a?.getBoundingClientRect();
    const eyebrow = [...document.querySelectorAll("p,span,div")].find((e) => /Troy, New York/.test(e.textContent || "") && e.children.length === 0);
    const er = eyebrow?.getBoundingClientRect();
    const desc = [...document.querySelectorAll("p")].find((p) => (p.textContent || "").length > 80);
    const dr = desc?.getBoundingClientRect();
    const dl = desc ? Math.round(dr.height / parseFloat(getComputedStyle(desc).lineHeight)) : null;
    const media = document.querySelector("video, picture img, img");
    const mcs = media ? getComputedStyle(media) : null;
    return {
      cta: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null,
      ctaText: a?.textContent?.trim(),
      eyebrowY: er ? Math.round(er.y) : null,
      eyebrowText: eyebrow?.textContent?.trim(),
      descLines: dl,
      descText: desc?.textContent?.trim().slice(0, 60),
      descColor: desc ? getComputedStyle(desc).color : null,
      mediaTag: media?.tagName,
      objPos: mcs?.objectPosition,
      vw: innerWidth, vh: innerHeight,
    };
  });
  res[vp] = { ...info, ctaMs };
  console.log(vp, JSON.stringify(res[vp]));
  await c.close();
  // reduced motion at 390 & 1440
  if (vp === "390" || vp === "1440") {
    const c2 = await ctx(browser, vp, { reducedMotion: "reduce" });
    const p2 = await c2.newPage();
    attachConsole(p2, "home-rm-" + vp, errs);
    await goto(p2, "/");
    await sleep(600);
    await shot(p2, `home-${vp}-rm`);
    await c2.close();
  }
  await browser.close();
}
writeJson("home", { res, errs });
console.log(JSON.stringify(errs, null, 1));
