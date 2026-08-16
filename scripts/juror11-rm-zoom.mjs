import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const browser = await launch();
// Reduced motion on /, chapter, /map, /paintings at 390 and 1440
for (const key of ["p390", "d1440"]) {
  for (const route of ["/", "/ferry", "/map", "/paintings"]) {
    const vp = VPS[key];
    const c = await ctx(browser, vp, { reducedMotion: "reduce" });
    const page = await c.newPage();
    const errs = watchConsole(page, `rm-${route}-${key}`);
    await goto(page, route, route === "/map" || route === "/paintings" ? 4000 : 1500);
    const info = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll("h1, h2, p, a.btn, button")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && (parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden") && r.top < innerHeight * 3 && !e.closest("[aria-hidden=true], .cnwm-menu, dialog"); }).map((e) => `${e.tagName}:${(e.textContent || "").trim().slice(0, 30)} op=${getComputedStyle(e).opacity}`);
      const canvas = document.querySelector("canvas");
      const vids = [...document.querySelectorAll("video")].map((v) => ({ paused: v.paused, autoplay: v.autoplay }));
      return { hidden: hidden.slice(0, 10), canvas: !!canvas, vids, sh: document.documentElement.scrollHeight };
    });
    await shot(page, `rm-${route.slice(1) || "home"}-${key}`);
    // scroll a bit and screenshot mid page
    await page.evaluate(() => scrollTo({ top: innerHeight * 1.5, behavior: "instant" }));
    await sleep(1000);
    await shot(page, `rm-${route.slice(1) || "home"}-${key}-mid`);
    const info2 = await page.evaluate(() => [...document.querySelectorAll("h1, h2, h3, p")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.top >= 0 && r.top < innerHeight && parseFloat(cs.opacity) < 0.5; }).map((e) => `${e.tagName}:${(e.textContent || "").trim().slice(0, 30)} op=${getComputedStyle(e).opacity}`).slice(0, 8));
    log("RM", key, route, JSON.stringify(info), "mid-hidden:", JSON.stringify(info2), "errs:", errs.length ? errs : "none");
    await c.close();
  }
}
// 200% zoom = 720x450 all routes
for (const route of ["/", "/bakery", "/commissioners-office", "/map", "/people", "/paintings", "/about", "/404"]) {
  const vp = VPS.z720;
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, `z720-${route}`);
  await goto(page, route, route === "/map" || route === "/paintings" ? 4000 : 1500);
  const of = await overflowCheck(page);
  await shot(page, `z720-${route.slice(1) || "home"}`);
  await page.evaluate(() => scrollTo({ top: innerHeight * 2, behavior: "instant" }));
  await sleep(800);
  await shot(page, `z720-${route.slice(1) || "home"}-mid`);
  const of2 = await overflowCheck(page);
  log("Z720", route, "overflow:", of.bodySW, of.docSW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean", "| mid:", of2.bodySW, of2.offenders.length ? JSON.stringify(of2.offenders) : "clean", "errs:", errs.length ? errs : "none");
  await c.close();
}
await browser.close();
