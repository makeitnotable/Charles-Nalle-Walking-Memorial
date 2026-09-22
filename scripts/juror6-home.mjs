// Home at 6 viewports + landscape phone; favicon fetches; interactive elements; head visibility check.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, BASE, FLOATING_JS } from "./juror6-lib.mjs";

const results = {};
const vps = { ...VPS, land844: { width: 844, height: 390, mobile: true } };
delete vps.z720;
for (const [name, vp] of Object.entries(vps)) {
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await goto(page, "/");
  await sleep(2600);
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const texts = [...document.querySelectorAll("p, a, button, h1, h2, span")].filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => ({ tag: e.tagName, t: e.innerText.trim().replace(/\s+/g, " ").slice(0, 90), ...rect(e), fs: getComputedStyle(e).fontSize, color: getComputedStyle(e).color, op: getComputedStyle(e).opacity })).filter(t => t.w > 0);
    const vid = q("video"); const img = q("picture img, img");
    return {
      title: document.title,
      video: vid ? { ...rect(vid), op: getComputedStyle(vid).objectPosition, src: vid.currentSrc.slice(-40), paused: vid.paused } : null,
      img: img ? { ...rect(img), op: getComputedStyle(img).objectPosition, src: img.currentSrc.slice(-40) } : null,
      texts,
      links: [...document.querySelectorAll("link[rel*=icon], link[rel=manifest]")].map(l => l.rel + " " + l.getAttribute("href")),
      floating: (function(){ return null; })(),
    };
  });
  await shot(page, `home-${name}`);
  results[name] = { ...r, log };
  await browser.close();
}
save("home.json", results);
for (const [k, v] of Object.entries(results)) {
  console.log("==", k, v.title);
  console.log(" video", JSON.stringify(v.video), " img", JSON.stringify(v.img));
  for (const t of v.texts) console.log("  ", t.tag, t.y, t.x, t.w + "x" + t.h, t.fs, t.color, t.op, "|", t.t);
  console.log("  links", v.links.join(" ; "));
  console.log("  errors", v.log.errors, "failed", v.log.failed);
}
