import { launch, newPage, shot, goto, sleep, report } from "./juror3-lib.mjs";
const route = process.argv[2] || "/bakery";
const vp = process.argv[3] || "p390";
const browser = await launch();
const page = await newPage(browser, vp);
await goto(page, route);
await sleep(1200);
const info = await page.evaluate(() => {
  const ctrls = [...document.querySelectorAll("a,button,[role=button],input,select,textarea,[tabindex]")].map((el) => {
    const r = el.getBoundingClientRect();
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60)}" href=${el.getAttribute("href") || ""} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)} ${getComputedStyle(el).position}`;
  });
  const sections = [...document.querySelectorAll("section,[id]")].map((el) => `${el.tagName.toLowerCase()}#${el.id} top=${Math.round(el.getBoundingClientRect().top)} h=${Math.round(el.getBoundingClientRect().height)}`).slice(0, 60);
  const heads = [...document.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName} "${h.textContent.replace(/\s+/g, " ").trim().slice(0, 70)}"`);
  const audio = [...document.querySelectorAll("audio,video")].map((a) => `${a.tagName} src=${a.currentSrc || a.src}`);
  return { ctrls, sections, heads, audio, scrollH: document.documentElement.scrollHeight };
});
console.log(JSON.stringify(info, null, 1));
// no full shot
report(page, route);
await browser.close();
