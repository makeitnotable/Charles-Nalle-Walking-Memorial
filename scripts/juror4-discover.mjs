import { launch, ctx, watch, shot, sleep, save, goto, VPS, floating } from "./juror4-lib.mjs";
const route = process.argv[2] || "/bakery";
const vpk = process.argv[3] || "p390";
const browser = await launch();
const c = await ctx(browser, VPS[vpk]);
const page = await c.newPage();
const log = watch(page);
await goto(page, route);
await sleep(1500);
const info = await page.evaluate(() => {
  const r = (e) => { const b = e.getBoundingClientRect(); return `${Math.round(b.left)},${Math.round(b.top + scrollY)} ${Math.round(b.width)}x${Math.round(b.height)}`; };
  return {
    title: document.title,
    sections: [...document.querySelectorAll("section, [id]")].filter((e) => e.id).map((e) => `${e.tagName.toLowerCase()}#${e.id} @${r(e)}`),
    buttons: [...document.querySelectorAll("button")].map((b) => `${(b.getAttribute("aria-label") || b.innerText || "").trim().replace(/\s+/g, " ").slice(0, 50)} [${b.className.toString().slice(0, 50)}] @${r(b)}`),
    links: [...document.querySelectorAll("a")].map((a) => `${a.innerText.trim().replace(/\s+/g, " ").slice(0, 40)} -> ${a.getAttribute("href")} @${r(a)}`),
    audios: [...document.querySelectorAll("audio")].map((a) => a.currentSrc?.split("/").pop()),
    headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName} ${h.innerText.trim().replace(/\s+/g, " ").slice(0, 60)} @${r(h)}`),
    docH: document.documentElement.scrollHeight,
    hScroll: document.documentElement.scrollWidth > innerWidth,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("LOG", log);
await browser.close();
