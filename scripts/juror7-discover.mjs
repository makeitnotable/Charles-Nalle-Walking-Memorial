// Discovery: dump interactive controls + landmarks per route at 390 & 1440 (as a visitor with devtools)
import { launch, ctx, goto, attachConsole, writeJson, sleep, BASE } from "./juror7-lib.mjs";

const routes = ["/", "/bakery", "/commissioners-office", "/map", "/paintings", "/people", "/about", "/404"];
const out = {};
const errs = [];
const browser = await launch();
for (const vp of ["390", "1440"]) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  attachConsole(page, vp, errs);
  for (const r of routes) {
    await goto(page, r);
    await sleep(1500);
    const info = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
      };
      const ctrls = [...document.querySelectorAll("a,button,[role=button],input,dialog,[tabindex]")].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
          cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80),
          id: el.id,
          href: el.getAttribute("href"),
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          vis: vis(el),
          fixed: getComputedStyle(el).position,
        };
      });
      const sections = [...document.querySelectorAll("section,header,footer,main,nav,[id]")].map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 60),
        top: Math.round(el.getBoundingClientRect().top + scrollY),
        h: Math.round(el.getBoundingClientRect().height),
      }));
      return { title: document.title, h: document.documentElement.scrollHeight, ctrls: ctrls.filter((c) => c.vis || c.tag === "dialog").slice(0, 80), sections: sections.slice(0, 60) };
    });
    out[`${vp}${r}`] = info;
  }
  await c.close();
}
await browser.close();
writeJson("discover", { out, errs });
console.log(JSON.stringify(errs, null, 1));
for (const k of Object.keys(out)) {
  console.log("\n### " + k + " — " + out[k].title + " h=" + out[k].h);
  for (const c of out[k].ctrls) console.log("  ", c.tag, JSON.stringify(c.text), c.rect.join(","), c.fixed, c.href || "", c.id ? "#" + c.id : "");
}
