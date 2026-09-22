// Visitor-level discovery: what controls exist on a page (labels/roles), section ids in order.
import { launch, ctx, VPS, go } from "./juror2-lib.mjs";
const route = process.argv[2] || "/bakery";
const vpk = process.argv[3] || "p390";
const browser = await launch();
const c = await ctx(browser, VPS[vpk]);
const page = await c.newPage();
await go(page, route, 2500);
const info = await page.evaluate(() => {
  const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)].join(","); };
  const ctrls = [...document.querySelectorAll("a,button,[role=button],input,summary,dialog,video,audio")].map((e) => {
    const cs = getComputedStyle(e);
    return `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""} "${(e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60)}" href=${e.getAttribute("href") || ""} pos=${cs.position} vis=${cs.visibility}/${cs.display}/${cs.opacity} rect=${r(e)}`;
  });
  const secs = [...document.querySelectorAll("section[id],main > *[id],[id^=scene],[id^=hero],[id=history],[id^=moral],[id=onward],footer")].map((e) => `${e.tagName.toLowerCase()}#${e.id} y=${Math.round(e.getBoundingClientRect().y + scrollY)} h=${Math.round(e.getBoundingClientRect().height)}`);
  const heads = [...document.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName} ${h.className.split(" ").slice(0, 3).join(".")} "${h.textContent.trim().replace(/\s+/g, " ").slice(0, 70)}"`);
  return { title: document.title, docH: document.documentElement.scrollHeight, ctrls, secs, heads };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
