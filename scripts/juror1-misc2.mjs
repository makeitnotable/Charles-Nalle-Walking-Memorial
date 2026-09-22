import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const c = await ctx(browser, VPS.d1440); const page = await c.newPage();
await page.goto(BASE + "/barbershop", { waitUntil: "networkidle" }); await sleep(1500);
const r = await page.evaluate(() => {
  const s = document.getElementById("scene-0");
  const items = [...s.querySelectorAll("p.t-prose, figure, img, video, picture")];
  return items.map((e) => { const rc = e.getBoundingClientRect(); return `${e.tagName}${e.className ? "." + e.className.toString().slice(0, 30) : ""} y=${Math.round(rc.top + scrollY)} h=${Math.round(rc.height)} ${e.tagName === "P" ? '"' + e.textContent.trim().slice(0, 30) + '"' : "src=" + (e.currentSrc || e.src || "").split("/").pop().slice(0, 40)}`; });
});
console.log(r.join("\n"));
await browser.close();
