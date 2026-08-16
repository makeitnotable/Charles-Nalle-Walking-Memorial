// Menu on every page: open, screenshot, close (X spin?), scroll-hide / scroll-up return.
import { launch, ctx, VPS, goto, shot, watch, sleep, save } from "./juror6-lib.mjs";
const vpName = process.argv[2] || "p390";
const vp = VPS[vpName];
const routes = ["/", "/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop", "/map", "/people", "/paintings", "/about", "/404"];
const browser = await launch();
const results = {};
for (const route of routes) {
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await goto(page, route); await sleep(route === "/map" || route === "/paintings" ? 4000 : 1500);
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  const burger = page.locator("button[aria-label='Open menu']");
  const n = await burger.count();
  const r = { route, burgers: n };
  if (!n) { results[route] = { ...r, note: "no burger" }; await c.close(); continue; }
  const b0 = await burger.first().boundingBox();
  r.burgerBox = b0;
  const st = () => page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu']"); if (!b) return null; const cs = getComputedStyle(b); let e = b, op = 1; while (e && e !== document.body) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } const rr = b.getBoundingClientRect(); return { op: Math.round(op * 100) / 100, x: Math.round(rr.left), y: Math.round(rr.top), tf: cs.transform, vis: cs.visibility, pe: cs.pointerEvents, inView: rr.top >= 0 && rr.bottom <= innerHeight && rr.left >= 0 && rr.right <= innerWidth }; });
  // scroll-hide test
  const docH = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  if (docH > 400) {
    await page.evaluate(() => scrollTo(0, 0)); await sleep(300);
    r.atTop = await st();
    // scroll down 600 in steps
    for (let y = 0; y <= 600; y += 100) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(80); }
    await sleep(500);
    r.afterDown = await st();
    // scroll up 60
    for (let y = 600; y >= 500; y -= 20) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(60); }
    await sleep(500);
    r.afterUp = await st();
    await page.evaluate(() => scrollTo(0, 0)); await sleep(400);
  } else { r.scroll = "page not scrollable"; }
  // open the menu
  await burger.first().click({ force: true }); await sleep(900);
  await shot(page, `menu-${route.replace(/\//g, "") || "home"}-${vpName}-open`);
  const open = await page.evaluate(() => { const close = document.querySelector("button[aria-label='Close menu'], button[aria-label*='lose']"); const links = [...document.querySelectorAll("nav a, [role=dialog] a, [aria-modal] a")].filter(a => a.getBoundingClientRect().width > 0).map(a => a.innerText.trim().replace(/\s+/g, " ")); const rr = close && close.getBoundingClientRect(); return { close: close && { t: close.getAttribute("aria-label"), x: Math.round(rr.left), y: Math.round(rr.top), w: Math.round(rr.width), h: Math.round(rr.height) }, links: links.slice(0, 14), focus: document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.innerText || document.activeElement.tagName).slice(0, 30) }; });
  r.open = open;
  // close via X and sample its transform for spin
  if (open.close) {
    const closeBtn = page.locator(`button[aria-label='${open.close.t}']`).first();
    await page.evaluate(() => { window.__tf = []; });
    const p = closeBtn.click({ force: true });
    const tfs = await page.evaluate(async (label) => { const b = document.querySelector(`button[aria-label='${label}']`); const icon = b.querySelector("svg, span, i") || b; const out = []; for (let i = 0; i < 25; i++) { out.push(getComputedStyle(icon).transform + "|" + getComputedStyle(b).transform); await new Promise(r => requestAnimationFrame(r)); } return out; }, open.close.t);
    await p; await sleep(600);
    r.closeSpin = [...new Set(tfs)].slice(0, 6);
    r.afterClose = await page.evaluate(() => { const panel = document.querySelector("[role=dialog], [aria-modal='true'], nav[aria-hidden]"); return { focus: document.activeElement && (document.activeElement.getAttribute("aria-label") || document.activeElement.tagName), panelHidden: panel ? (getComputedStyle(panel).visibility === "hidden" || panel.getAttribute("aria-hidden") === "true" || getComputedStyle(panel).display === "none" || parseFloat(getComputedStyle(panel).opacity) === 0) : "no panel found" }; });
  }
  // Esc test
  await burger.first().click({ force: true }); await sleep(600);
  await page.keyboard.press("Escape"); await sleep(600);
  r.escClosed = await page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu']"); return b && b.getAttribute("aria-expanded"); });
  r.errors = log.errors; r.failed = log.failed.filter(f => !/mp3|pbf|ERR_ABORTED/.test(f));
  results[route] = r;
  await c.close();
}
await browser.close();
save(`menu-${vpName}.json`, results);
for (const [k, v] of Object.entries(results)) {
  console.log("==", k, "burgers", v.burgers, "box", JSON.stringify(v.burgerBox));
  console.log("   top", JSON.stringify(v.atTop), "\n   down", JSON.stringify(v.afterDown), "\n   up", JSON.stringify(v.afterUp), v.scroll || "");
  console.log("   open:", JSON.stringify(v.open));
  console.log("   closeSpin:", JSON.stringify(v.closeSpin), "afterClose:", JSON.stringify(v.afterClose), "esc aria-expanded:", v.escClosed);
  console.log("   errors:", v.errors, "failed:", v.failed);
}
