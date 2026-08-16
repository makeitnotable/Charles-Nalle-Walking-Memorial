// Site-wide sweep: menu on every page, console errors, reduced motion, 200% zoom, people/about/404 shots, barbershop
import { launch, ctx, goto, attachConsole, shot, sleep, writeJson, VIEWPORTS } from "./juror7-lib.mjs";
const errs = []; const log = {};
const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404"];
const menuStates = {};
for (const vp of ["390", "768", "1440"]) {
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  attachConsole(page, "sweep-" + vp, errs);
  for (const r of routes) {
    const tag = (r === "/" ? "home" : r.slice(1)) + "-" + vp;
    await goto(page, r); await sleep(r === "/map" || r === "/paintings" ? 4000 : 1500);
    if (r === "/people" || r === "/about" || r === "/404" || r === "/barbershop" || r === "/ferry" || r === "/mansion") {
      await shot(page, `sweep-${tag}-top`);
      if (r !== "/barbershop") await shot(page, `sweep-${tag}-full`, { fullPage: true, scale: "css" }).catch((e) => (log["fullfail-" + tag] = String(e).slice(0, 80)));
    }
    if (r === "/") { menuStates[tag] = "no menu on home"; continue; }
    // scroll hide/show
    let hide = null, show = null;
    if (r !== "/map") {
      for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await sleep(90); }
      await sleep(600);
      hide = await page.evaluate(() => document.querySelector(".cnwm-menu")?.getAttribute("data-hidden"));
      for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -40); await sleep(90); }
      await sleep(600);
      show = await page.evaluate(() => document.querySelector(".cnwm-menu")?.getAttribute("data-hidden"));
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await sleep(700);
    const mb = await page.locator('button[aria-label="Open menu"]').boundingBox();
    let opened = null, closedByX = null, xRot = null, escClosed = null, focusBack = null;
    if (mb) {
      await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await sleep(800);
      opened = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); return b ? { rect: b.getBoundingClientRect().toJSON(), links: [...document.querySelectorAll(".cnwm-menu a")].filter((a) => a.getBoundingClientRect().height > 0).length } : null; });
      await shot(page, `sweep-${tag}-menu`);
      const xb = await page.locator('button[aria-label="Close menu"]').boundingBox();
      if (xb) {
        // watch the X's transform for the spin
        const rots = [];
        await page.mouse.click(xb.x + xb.width / 2, xb.y + xb.height / 2);
        for (let i = 0; i < 8; i++) { rots.push(await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); if (!b) return null; const ic = b.querySelector("svg, span, i") || b; return getComputedStyle(ic).transform + "|" + getComputedStyle(b).transform; })); await sleep(40); }
        xRot = rots;
        await sleep(600);
        closedByX = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); return !b || b.getBoundingClientRect().height === 0 || getComputedStyle(b).visibility === "hidden"; });
      }
      // reopen and Esc
      const mb2 = await page.locator('button[aria-label="Open menu"]').boundingBox();
      if (mb2) { await page.mouse.click(mb2.x + mb2.width / 2, mb2.y + mb2.height / 2); await sleep(700); await page.keyboard.press("Escape"); await sleep(600); escClosed = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Close menu"]'); return !b || b.getBoundingClientRect().height === 0 || getComputedStyle(b).visibility === "hidden"; }); focusBack = await page.evaluate(() => document.activeElement?.getAttribute("aria-label")); }
    }
    menuStates[tag] = { hide, show, opened: opened && { links: opened.links, x: Math.round(opened.rect.x), y: Math.round(opened.rect.y) }, closedByX, escClosed, focusBack, xRot: xRot && [...new Set(xRot)].slice(0, 6) };
  }
  await c.close();
  // reduced motion
  const c2 = await ctx(browser, vp, { reducedMotion: "reduce" });
  const p2 = await c2.newPage();
  attachConsole(p2, "rm-" + vp, errs);
  for (const r of ["/", "/bakery", "/map", "/paintings"]) {
    const tag = (r === "/" ? "home" : r.slice(1)) + "-" + vp;
    await goto(p2, r); await sleep(r === "/map" || r === "/paintings" ? 4000 : 1200);
    await shot(p2, `rm-${tag}`);
    log["rm-" + tag] = await p2.evaluate(() => { const hidden = [...document.querySelectorAll("h1,h2,p,a.btn")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.height > 0 && (parseFloat(cs.opacity) < 0.5 || cs.visibility === "hidden") && r.top < innerHeight; }).map((e) => e.textContent.trim().slice(0, 30)); return { hiddenTextInView: hidden.slice(0, 5), canvas: !!document.querySelector("canvas"), museumState: window.__museum ? window.__museum.state.mode : null, gridVisible: !!document.querySelector('button[aria-label^="View “"]') }; });
    if (r === "/bakery") { await p2.evaluate(() => document.querySelector("#moral")?.scrollIntoView({ block: "start", behavior: "instant" })); await sleep(800); await shot(p2, `rm-${tag}-moral`); await p2.evaluate(() => document.querySelector("#onward")?.scrollIntoView({ block: "start", behavior: "instant" })); await sleep(800); await shot(p2, `rm-${tag}-onward`); }
    if (r === "/paintings") { await p2.mouse.wheel(0, 800); await sleep(1500); await shot(p2, `rm-${tag}-scrolled`); }
  }
  await c2.close();
  await browser.close();
}
// 200% zoom (720x450) on all routes
{
  const browser = await launch();
  const c = await ctx(browser, "720z");
  const page = await c.newPage();
  attachConsole(page, "zoom720", errs);
  for (const r of routes) {
    const tag = (r === "/" ? "home" : r.slice(1));
    await goto(page, r); await sleep(r === "/map" || r === "/paintings" ? 3500 : 1200);
    log["z720-" + tag] = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth, h: document.documentElement.scrollHeight }));
    await shot(page, `z720-${tag}`);
    if (r === "/bakery") { await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight - 700, behavior: "instant" })); await sleep(700); await shot(page, `z720-${tag}-foot`); }
  }
  await c.close(); await browser.close();
}
writeJson("sweep", { menuStates, log, errs });
console.log(JSON.stringify(menuStates, null, 1));
console.log(JSON.stringify(log, null, 1));
console.log("ERRS", JSON.stringify(errs.filter((e) => !/ERR_ABORTED/.test(e.text)), null, 1));
