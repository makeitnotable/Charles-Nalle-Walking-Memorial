import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VPS[vpKey];
const browser = await launch();
const routes = ["/", "/bakery", "/map", "/people", "/paintings", "/about", "/404"];
for (const route of routes) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const errs = watchConsole(page, `${route}-${vpKey}`);
  await goto(page, route, route === "/map" || route === "/paintings" ? 4000 : 1500);
  const burgerState = () => page.evaluate(() => { const m = document.querySelector(".cnwm-menu"); const b = m?.querySelector("button"); const cs = m && getComputedStyle(m); const r = m?.getBoundingClientRect(); return m ? { op: cs.opacity, vis: cs.visibility, pe: cs.pointerEvents, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], expanded: b?.getAttribute("aria-expanded"), y: Math.round(scrollY) } : null; });
  let s0 = await burgerState();
  if (!s0) { log(route, "no menu on this page"); await c.close(); continue; }
  // open
  const burger = page.locator(".cnwm-menu button, button[aria-label='Open menu']").first();
  const bb = await burger.boundingBox();
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await sleep(900);
  const open = await page.evaluate(() => { const panel = document.querySelector("[role=dialog], .cnwm-menu nav, .cnwm-menu [aria-modal], #menu-panel"); const links = [...document.querySelectorAll(".cnwm-menu a")].filter((a) => a.getBoundingClientRect().width > 0 && getComputedStyle(a).visibility !== "hidden").map((a) => a.textContent.trim().replace(/\s+/g, " ")); const closeBtn = [...document.querySelectorAll(".cnwm-menu button")].find((b) => /close/i.test(b.getAttribute("aria-label") || b.textContent)); return { links, close: closeBtn && closeBtn.getBoundingClientRect().toJSON(), focus: (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 30), sw: document.body.scrollWidth }; });
  await shot(page, `menu-${vpKey}${route.replace("/", "-") || "-home"}-open`);
  // close via X
  if (open.close) { await page.mouse.click(open.close.x + open.close.width / 2, open.close.y + open.close.height / 2); await sleep(700); }
  const closed = await burgerState();
  // scroll-hide (not on home which is single-screen)
  let hide = null, back = null;
  const sh = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  if (sh > 600) {
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 80); await sleep(60); }
    await sleep(700);
    hide = await burgerState();
    for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -40); await sleep(60); }
    await sleep(700);
    back = await burgerState();
  }
  log(route, "rest", JSON.stringify(s0), "| open links:", open.links.join(", "), "| focus:", open.focus, "| closed:", closed?.expanded, "| after scroll-down:", hide && `y=${hide.y} op=${hide.op}`, "| after scroll-up:", back && `y=${back.y} op=${back.op}`, "| errs:", errs.length ? errs : "none");
  await c.close();
}
await browser.close();
