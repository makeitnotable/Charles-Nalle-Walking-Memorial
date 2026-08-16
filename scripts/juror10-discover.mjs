// Discover interactive controls on a chapter + map + paintings (as a visitor would see them)
import { launch, ctx, VIEWPORTS, BASE, sleep } from "./juror10-lib.mjs";
const browser = await launch();
const c = await ctx(browser, VIEWPORTS.d1440);
const page = await c.newPage();
for (const route of ["/bakery", "/map", "/paintings", "/people"]) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await sleep(1500);
  const info = await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, a, [role=button], audio, video, section[id], [id]")].slice(0, 400);
    return els.map((e) => {
      const r = e.getBoundingClientRect();
      return `${e.tagName}#${e.id || ""}.${(typeof e.className === "string" ? e.className : "").split(" ").slice(0, 4).join(".")} [${e.getAttribute("aria-label") || ""}] "${(e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40)}" @${Math.round(r.left)},${Math.round(r.top + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}`;
    });
  });
  console.log("=====", route);
  console.log(info.join("\n"));
}
await browser.close();
