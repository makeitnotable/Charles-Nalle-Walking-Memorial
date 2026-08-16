// Reduced motion at 1440, menu open/close + scroll-hide on /map /paintings /about /people, close-X spin, chapter interlude credit shots
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole } from "./juror10-lib.mjs";
const errs = [];
const browser = await launch();
for (const k of ["d1440", "p390"]) {
  const vp = VIEWPORTS[k];
  // reduced motion
  {
    const c = await ctx(browser, vp, { reducedMotion: "reduce" });
    const p = await c.newPage(); watchConsole(p, `rm-${k}`, errs);
    for (const r of ["/", "/bakery", "/map", "/paintings"]) {
      await p.goto(BASE + r, { waitUntil: "networkidle" }); await sleep(2000);
      const info = await p.evaluate(() => ({ museum: !!window.__museum, canvas: !!document.querySelector("#museum-slot canvas"), hidden: [...document.querySelectorAll("main h1, main h2, main p, main a.btn")].filter((e) => { const cs = getComputedStyle(e); const rr = e.getBoundingClientRect(); return rr.width > 0 && (cs.opacity === "0" || cs.visibility === "hidden"); }).length }));
      console.log(`rm ${k} ${r}:`, JSON.stringify(info));
      await shot(p, `rm${r === "/" ? "-home" : r.replace("/", "-")}-${k}`);
    }
    await c.close();
  }
  // menu on other pages + scroll-hide
  {
    const c = await ctx(browser, vp);
    const p = await c.newPage(); watchConsole(p, `menu-${k}`, errs);
    for (const r of ["/map", "/paintings", "/about"]) {
      await p.goto(BASE + r, { waitUntil: "networkidle" }); await sleep(2500);
      const b0 = await p.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); const r = b.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), op: getComputedStyle(b.parentElement).opacity }; });
      await p.click(".cnwm-menu-burger"); await sleep(700);
      await shot(p, `menu${r.replace("/", "-")}-${k}`);
      const open = await p.evaluate(() => { const cl = document.querySelector(".cnwm-menu-close"); return cl.getBoundingClientRect().width > 0; });
      // watch the close X transform during close
      const spin = await p.evaluate(async () => { const cl = document.querySelector(".cnwm-menu-close"); const icon = cl.querySelector("svg, span, i") || cl; const out = []; cl.click(); const t0 = performance.now(); while (performance.now() - t0 < 500) { out.push(getComputedStyle(icon).transform.slice(0, 40)); await new Promise((r) => requestAnimationFrame(r)); } return [...new Set(out)].slice(0, 6); });
      await sleep(400);
      const closed = await p.evaluate(() => { const cl = document.querySelector(".cnwm-menu-close"); return cl.getBoundingClientRect().width === 0 || getComputedStyle(cl).visibility === "hidden"; });
      // scroll-hide (page scrolls under the map on /map)
      await p.mouse.move(vp.width / 2, vp.height - 30);
      await p.evaluate(() => scrollTo({ top: 600, behavior: "instant" })); await sleep(700);
      const b1 = await p.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); const r = b.getBoundingClientRect(); return { top: Math.round(r.top), op: getComputedStyle(b.parentElement).opacity, transform: getComputedStyle(b.parentElement).transform.slice(0, 30) }; });
      await p.evaluate(() => scrollTo({ top: 500, behavior: "instant" })); await sleep(700);
      const b2 = await p.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); return { op: getComputedStyle(b.parentElement).opacity, transform: getComputedStyle(b.parentElement).transform.slice(0, 30) }; });
      console.log(`menu ${k} ${r}: rest ${JSON.stringify(b0)} open ${open} closed ${closed} X-transforms ${JSON.stringify(spin)} after-down ${JSON.stringify(b1)} after-up ${JSON.stringify(b2)}`);
    }
    await c.close();
  }
  // interlude credit chips on all five chapters + ch2 hero-2 + drop caps
  {
    const c = await ctx(browser, vp);
    const p = await c.newPage(); watchConsole(p, `chap-${k}`, errs);
    for (const r of ["/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop"]) {
      await p.goto(BASE + r, { waitUntil: "networkidle" }); await sleep(1200);
      const fig = await p.evaluate(() => { const f = [...document.querySelectorAll("main figure")].find((f) => f.querySelector("img") && f.querySelector("figcaption, .t-meta") && !f.closest("#moral") && !f.closest("[id^=moral]") && !f.closest("#scene-0") && !f.closest("#scene-1")); if (!f) return null; const r = f.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, cap: f.querySelector("figcaption, .t-meta")?.textContent.trim().slice(0, 60) }; });
      if (fig) { await p.evaluate((t) => scrollTo({ top: t - 40, behavior: "instant" }), fig.top); await sleep(1800); await shot(p, `interlude${r}-${k}`.replace(/\//g, "-").replace("--", "-")); }
      console.log(`interlude ${k} ${r}:`, JSON.stringify(fig));
      if (r === "/commissioners-office") { await p.evaluate(() => scrollTo({ top: document.querySelector("#hero-2").getBoundingClientRect().top + scrollY, behavior: "instant" })); await sleep(1500); await shot(p, `co-hero2-${k}`); }
      if (r === "/ferry") { await p.evaluate(() => scrollTo({ top: document.querySelector("#scene-0 h2").getBoundingClientRect().top + scrollY - 120, behavior: "instant" })); await sleep(1200); await shot(p, `ferry-heading-quote-${k}`); }
      if (r === "/mansion") { await p.evaluate(() => scrollTo({ top: document.querySelector("#history").getBoundingClientRect().top + scrollY - 40, behavior: "instant" })); await sleep(1500); await shot(p, `mansion-history-${k}`); const dc = await p.evaluate(() => { const first = document.querySelector("#scene-0 p.t-prose"); const cs = getComputedStyle(first, "::first-letter"); return { fs: cs.fontSize, ff: cs.fontFamily.slice(0, 30), float: cs.float, il: cs.initialLetter }; }); console.log("mansion drop cap:", JSON.stringify(dc)); }
    }
    await c.close();
  }
}
await browser.close();
console.log("CONSOLE", JSON.stringify(errs, null, 1));
