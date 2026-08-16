import { launch, newPage, shot, goto, sleep, report, VIEWPORTS } from "./juror3-lib.mjs";

const vps = ["p390", "p360", "land", "t768", "t1024", "d1440", "d1920"];
for (const vp of vps) {
  const browser = await launch();
  try {
    const page = await newPage(browser, vp);
    const t0 = Date.now();
    await goto(page, "/");
    // let the entry choreography land
    await sleep(1600);
    await shot(page, `home-${vp}`);
    // What is on the page (visitor's view of the DOM)
    const info = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const eyebrow = [...document.querySelectorAll("p,span,div")].find((el) => /Troy, New York/.test(el.textContent || "") && el.children.length === 0);
      const eb = eyebrow?.getBoundingClientRect();
      const cta = [...document.querySelectorAll("a,button")].find((el) => /walk/i.test(el.textContent || ""));
      const cb = cta?.getBoundingClientRect();
      const media = q("video") || q("picture img") || q("img");
      const mb = media?.getBoundingClientRect();
      const cs = media ? getComputedStyle(media) : null;
      return {
        title: document.title,
        eyebrowText: eyebrow?.textContent?.trim(),
        eyebrowTop: eb?.top,
        ctaText: cta?.textContent?.trim(),
        ctaRect: cb && { x: cb.x, y: cb.y, w: cb.width, h: cb.height, bottomGap: innerHeight - cb.bottom },
        media: media?.tagName,
        mediaSrc: media?.currentSrc || media?.src,
        objectPosition: cs?.objectPosition,
        mediaRect: mb && { x: mb.x, y: mb.y, w: mb.width, h: mb.height },
        h1: q("h1")?.textContent?.replace(/\s+/g, " ").trim(),
        desc: [...document.querySelectorAll("p")].map((p) => p.textContent.trim()).filter((t) => t.length > 60)[0],
        favicon: [...document.querySelectorAll('link[rel*="icon"], link[rel="manifest"]')].map((l) => `${l.rel} ${l.getAttribute("href")} ${l.sizes?.value || ""} ${l.type || ""}`),
        menuBtn: !!document.querySelector('button[aria-label*="menu" i]'),
      };
    });
    console.log(vp, JSON.stringify(info, null, 1));
    // description line count
    const lines = await page.evaluate(() => {
      const p = [...document.querySelectorAll("p")].find((p) => p.textContent.trim().length > 60);
      if (!p) return null;
      const r = document.createRange();
      r.selectNodeContents(p);
      const rects = [...r.getClientRects()];
      const tops = [...new Set(rects.map((x) => Math.round(x.top)))];
      return { lines: tops.length, width: p.getBoundingClientRect().width, text: p.textContent.trim().slice(0, 40) };
    });
    console.log(vp, "desc lines", lines);
    report(page, `home ${vp}`);
    await page.close();
  } finally {
    await browser.close();
  }
}

// reduced motion + 200% zoom
{
  const browser = await launch();
  const page = await newPage(browser, "p390", { reducedMotion: "reduce" });
  await goto(page, "/");
  await sleep(300);
  await shot(page, "home-p390-reduced");
  report(page, "home reduced");
  await page.close();
  const p2 = await newPage(browser, "zoom200");
  await goto(p2, "/");
  await sleep(1500);
  await shot(p2, "home-zoom200");
  const ov = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
  console.log("zoom200 overflow", ov);
  report(p2, "home zoom200");
  await browser.close();
}
