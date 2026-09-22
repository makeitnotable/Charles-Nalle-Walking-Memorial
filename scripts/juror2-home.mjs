// First visit at `/` across the matrix + favicon renders + a quick discovery of the home DOM.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, BASE, OUT } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";

const errs = [];
const browser = await launch();
for (const [k, vp] of Object.entries(VPS)) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `home-${k}`, errs);
  await go(page, "/", 2500);
  await shot(page, `home-${k}`);
  // Measure the position of the eyebrow line vs the video/picture and describe the head region visually later.
  const info = await page.evaluate(() => {
    const t = [...document.querySelectorAll("*")].find((e) => /Troy, New York/.test(e.textContent || "") && e.children.length === 0);
    const cta = [...document.querySelectorAll("a,button")].find((e) => /Walk the story/i.test(e.textContent || ""));
    const vid = document.querySelector("video");
    const img = document.querySelector("picture img, img");
    const r = (e) => (e ? (({ x, y, width, height }) => ({ x, y, w: width, h: height }))(e.getBoundingClientRect()) : null);
    return {
      eyebrow: t?.textContent?.trim(),
      eyebrowRect: r(t),
      ctaText: cta?.textContent?.trim(),
      ctaRect: r(cta),
      video: vid ? { pos: getComputedStyle(vid).objectPosition, rect: r(vid), src: vid.currentSrc } : null,
      img: img ? { pos: getComputedStyle(img).objectPosition, rect: r(img), src: img.currentSrc } : null,
      title: document.title,
      links: [...document.querySelectorAll("a")].map((a) => a.textContent.trim().replace(/\s+/g, " ") + " -> " + a.getAttribute("href")),
    };
  });
  console.log(k, JSON.stringify(info, null, 1));
  await c.close();
}

// favicon renders at 16 / 32 / 180 (nearest neighbour up-scaled by CSS)
{
  const c = await browser.newContext({ viewport: { width: 700, height: 300 }, deviceScaleFactor: 1 });
  const page = await c.newPage();
  const html = `<body style="margin:0;background:#fff;display:flex;gap:24px;align-items:center;padding:20px;font:12px sans-serif">
   <div style="background:#202124;padding:12px;display:flex;gap:16px;align-items:center;color:#ddd">
     <img src="${BASE}/favicon.svg" width=16 height=16 style="image-rendering:pixelated"> 16 svg
     <img src="${BASE}/favicon-16.png" width=16 height=16> 16 png
     <img src="${BASE}/favicon-32.png" width=32 height=32> 32 png
     <img src="${BASE}/favicon.svg" width=32 height=32> 32 svg
   </div>
   <div style="background:#f1f3f4;padding:12px;display:flex;gap:16px;align-items:center;color:#222">
     <img src="${BASE}/favicon-16.png" width=16 height=16> 16 png
     <img src="${BASE}/favicon-32.png" width=32 height=32> 32 png
     <img src="${BASE}/favicon-16.png" width=128 height=128 style="image-rendering:pixelated"> 16px @8x
     <img src="${BASE}/apple-touch-icon.png" width=90 height=90> apple 180
   </div></body>`;
  await page.setContent(html);
  await sleep(1500);
  await shot(page, "favicon-renders");
  await c.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, "home-console.txt"), errs.join("\n"));
console.log("console issues:", errs.length);
console.log(errs.join("\n"));
