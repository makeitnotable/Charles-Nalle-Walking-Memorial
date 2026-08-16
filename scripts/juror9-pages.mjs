// juror9: /people /about /404 + menu open/close on every page + scroll-hide + footer with mini-player + full-page shots
import { launch, goto, shot, sleep, byText, floating, VIEWPORTS, log, saveJson } from "./juror9-lib.mjs";

const key = process.argv[2] || "p390";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp, { dpr: 1 });
const notes = {};
const N = (k, v) => { notes[k] = v; log(k, JSON.stringify(v)); };
const burgerState = () => page.evaluate(() => { const b = document.querySelector("button[aria-label='Open menu'], button[aria-label='Close menu']"); if (!b) return null; const w = b.closest(".cnwm-menu") || b; const r = w.getBoundingClientRect(); return { label: b.getAttribute("aria-label"), expanded: b.getAttribute("aria-expanded"), x: Math.round(r.left), y: Math.round(r.top), op: getComputedStyle(w).opacity, vis: getComputedStyle(w).visibility, ptr: getComputedStyle(w).pointerEvents }; });

try {
  for (const route of ["/", "/bakery", "/mansion", "/ferry", "/map", "/people", "/paintings", "/about", "/404-nope"]) {
    const slug = route === "/" ? "home" : route.replace(/\W/g, "");
    await goto(page, route, route === "/map" || route === "/paintings" ? 5000 : 2200);
    if (["/people", "/about", "/404-nope", "/mansion", "/ferry"].includes(route)) {
      await shot(page, `${key}-pg-${slug}-top`);
      // reveal-on-scroll: scroll through the page slowly to trigger reveals, then full-page
      await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
      await sleep(600);
      await shot(page, `${key}-pg-${slug}-full`, true);
      await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, 30); await sleep(200); await page.mouse.wheel(0, -30); await sleep(1200);
    }
    // menu open/close
    const b0 = await burgerState();
    N(`${slug}.burger`, b0);
    if (b0 && route !== "/") {
      const burger = page.locator("button[aria-label='Open menu']").first();
      const bs = await burgerState();
      if (bs && parseFloat(bs.op) > 0.9) {
        const bb = await burger.boundingBox();
        await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
        await sleep(900);
        await shot(page, `${key}-pg-${slug}-menu-open`);
        N(`${slug}.menuOpen`, await burgerState());
        N(`${slug}.menuFloating`, await floating(page));
        const close = page.locator("button[aria-label*='Close' i]").first();
        const cb = (await close.count()) ? await close.boundingBox() : null;
        if (cb) { await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(700); } else { await page.keyboard.press("Escape"); await sleep(700); }
        N(`${slug}.menuClosed`, await burgerState());
        // scroll-hide/show
        await page.mouse.move(vp.width / 2, vp.height / 2);
        await page.mouse.wheel(0, 400); await sleep(300); await page.mouse.wheel(0, 400); await sleep(900);
        N(`${slug}.burgerAfterDown`, await burgerState());
        await page.mouse.wheel(0, -100); await sleep(900);
        N(`${slug}.burgerAfterUp`, await burgerState());
      } else N(`${slug}.burgerNotVisible`, true);
    }
  }
  // 404 route: what does a real 404 look like + trailing slash redirect
  await goto(page, "/bakery/", 2500);
  N("trailingSlash.url", page.url());
  await shot(page, `${key}-pg-trailing-slash`);
  await goto(page, "/404", 2000);
  await shot(page, `${key}-pg-404-route`);

  // footer with mini-player latched on a chapter
  await goto(page, "/mansion", 2500);
  const play = page.locator("button[aria-label*='Play' i]").first();
  await play.scrollIntoViewIfNeeded(); await sleep(400); await play.click(); await sleep(1500);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" })); await sleep(1200);
  await shot(page, `${key}-pg-mansion-footer-mini`);
  N("mansion.footerFloating", await floating(page));
  N("mansion.footerCovered", await page.evaluate(() => {
    const fl = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 4 && e.getBoundingClientRect().height > 4 && getComputedStyle(e).visibility !== "hidden" && parseFloat(getComputedStyle(e).opacity) > 0.05 && e.getBoundingClientRect().top < innerHeight && !e.className.toString().includes("curtain"));
    const foot = document.querySelector("footer");
    if (!foot) return null;
    const items = [...foot.querySelectorAll("a, button, p, span")].filter((e) => e.children.length === 0 || e.tagName === "A" || e.tagName === "BUTTON");
    const hits = [];
    for (const f of fl) { const fr = f.getBoundingClientRect(); for (const it of items) { const r = it.getBoundingClientRect(); if (r.width && r.height && !(r.right < fr.left || r.left > fr.right || r.bottom < fr.top || r.top > fr.bottom)) hits.push({ fixed: (f.textContent || "").trim().slice(0, 20), item: (it.textContent || "").trim().slice(0, 40) }); } }
    return hits;
  }));
  // onward area with mini latched
  const cont = await byText(page, /^Continue/);
  if (cont) { await cont.scrollIntoViewIfNeeded(); await sleep(1000); await shot(page, `${key}-pg-mansion-onward-mini`); }
} catch (e) { log("ERR", e); notes.error = String(e); }
notes.consoleErrors = errors;
saveJson(`${key}-pages-notes`, notes);
log("console errors:", JSON.stringify(errors, null, 1));
await browser.close();
