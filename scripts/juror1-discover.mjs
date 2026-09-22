// Discover interactive elements on a route (visitor-level DOM: buttons/links/ids)
import { launch, ctx, watch, sleep, BASE, VPS } from "./juror1-lib.mjs";
const route = process.argv[2] || "/bakery";
const vpk = process.argv[3] || "d1440";
const browser = await launch();
const c = await ctx(browser, VPS[vpk]);
const page = await c.newPage();
const log = watch(page);
await page.goto(BASE + route, { waitUntil: "networkidle" });
await sleep(1500);
const info = await page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return {
    title: document.title,
    ids: [...document.querySelectorAll("[id]")].map((e) => `${e.tagName.toLowerCase()}#${e.id}`).slice(0, 80),
    buttons: [...document.querySelectorAll("button,a,[role=button],dialog,audio,video")].map((e) => {
      const r = e.getBoundingClientRect();
      return `${e.tagName.toLowerCase()} "${(e.getAttribute("aria-label") || e.textContent.trim().replace(/\s+/g, " ")).slice(0, 60)}" href=${e.getAttribute("href") || ""} class=${(e.className && e.className.baseVal === undefined ? e.className : "").toString().slice(0, 60)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} vis=${vis(e)}`;
    }),
    h: [...document.querySelectorAll("h1,h2,h3")].map((e) => `${e.tagName} ${e.textContent.trim().replace(/\s+/g, " ").slice(0, 60)}`),
    docH: document.documentElement.scrollHeight,
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("LOG", log);
await browser.close();
