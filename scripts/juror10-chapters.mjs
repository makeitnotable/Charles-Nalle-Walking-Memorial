// Chapter read-through as a visitor: /bakery full, /barbershop arrival, /commissioners-office two players
import { launch, ctx, VIEWPORTS, BASE, shot, sleep, watchConsole, overflow } from "./juror10-lib.mjs";

const which = process.argv[2] ? process.argv[2].split(",") : Object.keys(VIEWPORTS);
const errs = [];

async function pauseControlVisible(page) {
  return page.evaluate(() => {
    const vh = innerHeight, vw = innerWidth;
    const btns = [...document.querySelectorAll("button")].filter((b) => /pause|play/i.test(b.getAttribute("aria-label") || b.textContent || ""));
    const vis = btns.map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      const inView = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && cs.visibility !== "hidden" && cs.opacity !== "0";
      // walk up for opacity 0 ancestors
      let a = b, hiddenAnc = false;
      while (a && a !== document.body) { const s = getComputedStyle(a); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none") { hiddenAnc = true; break; } a = a.parentElement; }
      return { label: b.getAttribute("aria-label"), text: b.textContent.trim().slice(0, 30), inView: inView && !hiddenAnc, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
    });
    return vis.filter((v) => v.inView);
  });
}

async function audioState(page) {
  return page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: +a.currentTime.toFixed(2), src: (a.currentSrc || "").split("/").pop() })));
}

for (const k of which) {
  const vp = VIEWPORTS[k];
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  watchConsole(page, `bakery-${k}`, errs);
  console.log("\n########", k);
  // QR arrival
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle" });
  await sleep(1500);
  await shot(page, `bakery-arrive-${k}`);
  console.log("overflow", JSON.stringify(await overflow(page)));
  // scroll-hide of hamburger
  const burgerVis = async () => page.evaluate(() => { const b = document.querySelector(".cnwm-menu-burger"); const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); let a = b, hid = false; while (a && a !== document.body) { const s = getComputedStyle(a); if (s.opacity === "0" || s.visibility === "hidden" || s.display === "none" || (s.transform && s.transform !== "none" && r.top > innerHeight)) { hid = true; break; } a = a.parentElement; } return { top: Math.round(r.top), left: Math.round(r.left), hid: hid || r.top >= innerHeight || r.bottom <= 0 }; });
  await page.mouse.wheel(0, 700); await sleep(600);
  const b1 = await burgerVis();
  await page.mouse.wheel(0, -100); await sleep(600);
  const b2 = await burgerVis();
  console.log("burger after down:", JSON.stringify(b1), "after up:", JSON.stringify(b2));
  // menu open/close
  await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
  await page.click(".cnwm-menu-burger"); await sleep(700);
  await shot(page, `bakery-menu-${k}`);
  await page.click(".cnwm-menu-close"); await sleep(700);
  const menuClosed = await page.evaluate(() => { const cl = document.querySelector(".cnwm-menu-close"); const r = cl.getBoundingClientRect(); return r.width === 0 || getComputedStyle(cl).visibility === "hidden"; });
  console.log("menu closed after X:", menuClosed);
  // story
  const play = page.locator('button[aria-label^="Play narration"]').first();
  await play.scrollIntoViewIfNeeded(); await sleep(400);
  await page.evaluate(() => scrollBy(0, -160)); await sleep(500);
  await shot(page, `bakery-story-${k}`);
  await play.click(); await sleep(2500);
  console.log("audio after play:", JSON.stringify(await audioState(page)));
  await shot(page, `bakery-playing-${k}`);
  // tap 4th paragraph of the story
  const paras = page.locator("#scene-0 p.t-prose");
  const n = await paras.count();
  console.log("prose paragraphs:", n);
  const target = paras.nth(Math.min(3, n - 1));
  await target.scrollIntoViewIfNeeded(); await sleep(300);
  const before = await audioState(page);
  const box = await target.boundingBox();
  await page.mouse.click(box.x + 40, box.y + 12); await sleep(800);
  const after = await audioState(page);
  console.log("tap paragraph: before", JSON.stringify(before), "after", JSON.stringify(after));
  await shot(page, `bakery-tapped-${k}`);
  // scroll down away — pause control?
  await page.evaluate(() => scrollBy(0, innerHeight * 1.6)); await sleep(1200);
  console.log("pause ctrl (down away):", JSON.stringify(await pauseControlVisible(page)));
  await shot(page, `bakery-mini-down-${k}`);
  // scroll up to top — pause control?
  await page.evaluate(() => scrollTo(0, 0)); await sleep(1200);
  console.log("pause ctrl (top):", JSON.stringify(await pauseControlVisible(page)));
  await shot(page, `bakery-mini-top-${k}`);
  // moral
  await page.locator("#moral").scrollIntoViewIfNeeded(); await sleep(300);
  await page.evaluate(() => { const el = document.querySelector("#moral-heading"); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: "instant" }); }); await sleep(1500);
  const moral = await page.evaluate(() => {
    const h = document.querySelector("#moral-heading");
    const sec = document.querySelector("#moral");
    const ps = [...sec.querySelectorAll("p")].map((p) => ({ t: p.textContent.trim().slice(0, 40), color: getComputedStyle(p).color, fs: getComputedStyle(p).fontSize, op: getComputedStyle(p).opacity }));
    return { heading: getComputedStyle(h).color, ps };
  });
  console.log("moral colours:", JSON.stringify(moral));
  await shot(page, `bakery-moral-${k}`);
  console.log("pause ctrl (moral):", JSON.stringify(await pauseControlVisible(page)));
  // onward
  await page.evaluate(() => { const el = document.querySelector("#onward"); scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }); }); await sleep(2500);
  await shot(page, `bakery-onward-${k}`);
  console.log("pause ctrl (onward):", JSON.stringify(await pauseControlVisible(page)));
  const cont = page.locator("#onward a.btn-solid");
  await cont.scrollIntoViewIfNeeded(); await sleep(300);
  await page.evaluate(() => scrollBy(0, -200)); await sleep(800);
  await shot(page, `bakery-continue-${k}`);
  // footer (with mini-player latched — audio still playing?)
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await sleep(1200);
  console.log("audio at footer:", JSON.stringify(await audioState(page)), "pause ctrl:", JSON.stringify(await pauseControlVisible(page)));
  await shot(page, `bakery-footer-${k}`);
  const footerCover = await page.evaluate(() => {
    const links = [...document.querySelectorAll("footer a, footer button")];
    const fixed = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0 && !e.closest("footer") && !/curtain/.test(e.className.toString()) && getComputedStyle(e).pointerEvents !== "none");
    const hits = [];
    for (const l of links) { const r = l.getBoundingClientRect(); for (const f of fixed) { const fr = f.getBoundingClientRect(); if (fr.width === 0) continue; if (r.left < fr.right && r.right > fr.left && r.top < fr.bottom && r.bottom > fr.top) hits.push({ link: l.textContent.trim().slice(0, 30), over: (f.getAttribute("aria-label") || f.className.toString()).slice(0, 40) }); } }
    return hits;
  });
  console.log("footer covered:", JSON.stringify(footerCover));
  // click Continue (page transition)
  await cont.scrollIntoViewIfNeeded(); await sleep(400);
  const cb = await cont.boundingBox();
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await sleep(2500);
  console.log("after Continue ->", page.url());
  await shot(page, `bakery-after-continue-${k}`);
  await c.close();

  // barbershop arrival
  {
    const c2 = await ctx(browser, vp);
    const p2 = await c2.newPage();
    watchConsole(p2, `barbershop-${k}`, errs);
    await p2.goto(BASE + "/barbershop", { waitUntil: "networkidle" });
    await sleep(1500);
    await shot(p2, `barbershop-arrive-${k}`);
    console.log("barbershop overflow", JSON.stringify(await overflow(p2)));
    // moral heading (clipped J check) + interlude credit
    await p2.evaluate(() => { const el = document.querySelector("#moral-heading"); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: "instant" }); }); await sleep(1500);
    await shot(p2, `barbershop-moral-${k}`);
    // story order text/image
    const order = await p2.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 figure, #scene-0 img, #scene-0 video")].map((e) => e.tagName).join(" "));
    console.log("barbershop story order:", order);
    const inter = p2.locator("figure").filter({ has: p2.locator("figcaption") }).first();
    try { await inter.scrollIntoViewIfNeeded(); await sleep(1500); await shot(p2, `barbershop-interlude-${k}`); } catch (e) { console.log("no interlude figure found"); }
    await c2.close();
  }
  // commissioners-office two players
  {
    const c3 = await ctx(browser, vp);
    const p3 = await c3.newPage();
    watchConsole(p3, `co-${k}`, errs);
    await p3.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
    await sleep(1500);
    const order = await p3.evaluate(() => [...document.querySelectorAll("main section[id], main header[id], main [id^=hero]")].map((e) => e.id).join(" → "));
    console.log("CO section order:", order);
    const plays = p3.locator('button[aria-label^="Play narration"]');
    console.log("CO play buttons:", await plays.count());
    const p2btn = plays.nth(1);
    await p2btn.scrollIntoViewIfNeeded(); await sleep(400);
    await p3.evaluate(() => scrollBy(0, -160)); await sleep(500);
    await shot(p3, `co-part2-${k}`);
    await p2btn.click(); await sleep(2500);
    console.log("CO audio after Part 2 play:", JSON.stringify(await audioState(p3)));
    // scroll up into part 1
    await p3.evaluate(() => { const el = document.querySelector("#scene-0"); scrollTo({ top: el.getBoundingClientRect().top + scrollY + 300, behavior: "instant" }); }); await sleep(1500);
    console.log("CO pause ctrl in Part 1 while Part 2 plays:", JSON.stringify(await pauseControlVisible(p3)));
    await shot(p3, `co-part1-while-p2-${k}`);
    // now press play on part 1: does part 2 stop?
    await plays.nth(0).scrollIntoViewIfNeeded(); await sleep(300);
    await plays.nth(0).click(); await sleep(1500);
    console.log("CO audio after Part 1 play:", JSON.stringify(await audioState(p3)), "pause ctrls:", JSON.stringify(await pauseControlVisible(p3)));
    await p3.evaluate(() => scrollBy(0, innerHeight * 2)); await sleep(1200);
    console.log("CO pause ctrls after scroll away:", JSON.stringify(await pauseControlVisible(p3)));
    await shot(p3, `co-mini-${k}`);
    // moral 1 & 2 colours
    const morals = await p3.evaluate(() => [...document.querySelectorAll("section[id^=moral]")].map((s) => ({ id: s.id, h: getComputedStyle(s.querySelector("h2")).color, ps: [...s.querySelectorAll("p")].map((p) => getComputedStyle(p).color) })));
    console.log("CO morals:", JSON.stringify(morals));
    await p3.evaluate(() => { const el = document.querySelector("#moral-0-heading, #moral-heading"); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: "instant" }); }); await sleep(1500);
    await shot(p3, `co-moral1-${k}`);
    await c3.close();
  }
  await browser.close();
}
console.log("CONSOLE", JSON.stringify(errs, null, 1));
