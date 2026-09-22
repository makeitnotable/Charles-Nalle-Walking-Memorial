// juror9: first visit at "/", QR arrival on /bakery + /barbershop, read a whole chapter, /commissioners-office two players
import { launch, goto, shot, sleep, byText, floating, VIEWPORTS, log, saveJson, touchTap } from "./juror9-lib.mjs";

const key = process.argv[2] || "p390";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp);
const notes = {};
const N = (k, v) => { notes[k] = v; log(k, JSON.stringify(v)); };

try {
  // ---- HOME first visit
  await goto(page, "/", 2500);
  await shot(page, `${key}-home-first`);
  N("home.floating", await floating(page));
  const homeCta = await byText(page, "Walk the story");
  N("home.cta", homeCta ? await homeCta.boundingBox() : null);
  // eyebrow line position + hero image position/size
  N("home.eyebrow", await page.evaluate(() => {
    const els = [...document.querySelectorAll("p, span, div")].filter((e) => /Troy, New York/.test(e.textContent || "") && e.children.length === 0);
    const e = els[0];
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { text: e.textContent.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom) };
  }));
  await sleep(1500);
  await shot(page, `${key}-home-settled`);

  // ---- QR arrival /bakery
  await goto(page, "/bakery", 2500);
  await shot(page, `${key}-bakery-arrival`);
  N("bakery.floating", await floating(page));
  await sleep(1500);
  await shot(page, `${key}-bakery-arrival-2`);

  // scroll a bit: does the burger hide?
  await page.mouse.wheel(0, 600); await sleep(300);
  await page.mouse.wheel(0, 600); await sleep(600);
  N("bakery.burger-after-scrolldown", await floating(page));
  await shot(page, `${key}-bakery-scrolled-burger`);
  await page.mouse.wheel(0, -200); await sleep(700);
  N("bakery.burger-after-scrollup", await floating(page));
  await shot(page, `${key}-bakery-scrollup-burger`);

  // ---- read whole chapter: find the player
  const playBtn = page.locator("button", { hasText: /^(Play|Listen)/i }).first();
  const playAria = page.locator("button[aria-label*='Play' i], button[aria-label*='Listen' i]").first();
  let pb = (await playBtn.count()) ? playBtn : playAria;
  await pb.scrollIntoViewIfNeeded();
  await sleep(600);
  await shot(page, `${key}-bakery-player-inview`);
  N("bakery.playbtn", { text: await pb.textContent(), aria: await pb.getAttribute("aria-label"), box: await pb.boundingBox() });
  await pb.click();
  await sleep(2500);
  await shot(page, `${key}-bakery-playing`);
  N("bakery.audio", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime, src: (a.currentSrc || "").split("/").pop() }))));

  // tap a paragraph (3rd prose paragraph)
  const paras = page.locator("p.t-prose");
  const pc = await paras.count();
  N("bakery.paras", pc);
  if (pc > 3) {
    const p3 = paras.nth(3);
    await p3.scrollIntoViewIfNeeded();
    await sleep(400);
    const b = await p3.boundingBox();
    if (vp.mobile) await touchTap(page, b.x + b.width / 2, b.y + 10); else await page.mouse.click(b.x + b.width / 2, b.y + 10);
    await sleep(1200);
    N("bakery.audio-after-tap", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime }))));
    await shot(page, `${key}-bakery-tapped-para`);
  }
  // scroll DOWN away from player: pause control on screen?
  await page.mouse.wheel(0, 900); await sleep(400);
  await page.mouse.wheel(0, 900); await sleep(900);
  N("bakery.down-floating", await floating(page));
  await shot(page, `${key}-bakery-away-down`);
  // scroll UP away (to top)
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await sleep(300);
  await page.mouse.wheel(0, 100); await sleep(300); await page.mouse.wheel(0, -100); await sleep(900);
  N("bakery.up-floating", await floating(page));
  await shot(page, `${key}-bakery-away-up`);

  // moral section
  const moral = page.locator("[id^=moral]").first();
  if (await moral.count()) {
    await moral.scrollIntoViewIfNeeded();
    await sleep(1200);
    await shot(page, `${key}-bakery-moral`);
    N("bakery.moral-colors", await page.evaluate(() => {
      const sec = document.querySelector("[id^=moral]");
      const root = sec.closest("section") || sec;
      const h = root.querySelector("h2, h3");
      const p = root.querySelector("p.t-prose, p");
      const cap = root.querySelector("figcaption, .t-meta");
      const c = (e) => e && getComputedStyle(e).color;
      return { heading: c(h), body: c(p), caption: c(cap), headingText: h?.textContent.trim().slice(0, 60), bodyText: p?.textContent.trim().slice(0, 60) };
    }));
  }
  // onward
  const cont = await byText(page, /^Continue/);
  if (cont) {
    await cont.scrollIntoViewIfNeeded();
    await sleep(1200);
    N("bakery.onward-floating", await floating(page));
    await shot(page, `${key}-bakery-onward`);
    // footer
    await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await sleep(900);
    await shot(page, `${key}-bakery-footer-miniplayer`);
    N("bakery.footer-floating", await floating(page));
    await cont.scrollIntoViewIfNeeded();
    await sleep(500);
    const b = await cont.boundingBox();
    N("bakery.continue-btn", { text: (await cont.textContent()).trim(), b });
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await sleep(500);
    await shot(page, `${key}-bakery-continue-mid`);
    await sleep(2500);
    N("after-continue.url", page.url());
    await shot(page, `${key}-after-continue`);
  }

  // ---- QR arrival /barbershop
  await goto(page, "/barbershop", 2500);
  await shot(page, `${key}-barbershop-arrival`);
  N("barbershop.floating", await floating(page));
  const bm = page.locator("[id^=moral]").first();
  if (await bm.count()) { await bm.scrollIntoViewIfNeeded(); await sleep(1200); await shot(page, `${key}-barbershop-moral`); }
  // story order: text/image
  N("barbershop.story-order", await page.evaluate(() => {
    const sc = document.querySelector("[id^=scene]");
    if (!sc) return null;
    const out = [];
    for (const el of sc.querySelectorAll("p.t-prose, figure, img, video, picture")) {
      if (el.tagName === "P") out.push("T"); else if (el.tagName === "FIGURE") out.push("I");
    }
    return out.join("");
  }));

  // ---- commissioners-office two parts
  await goto(page, "/commissioners-office", 2500);
  await shot(page, `${key}-co-arrival`);
  N("co.sections", await page.evaluate(() => [...document.querySelectorAll("section[id], div[id^=hero], [id^=scene], [id^=moral], #history, #onward")].map((s) => s.id).filter(Boolean)));
  const plays = page.locator("button[aria-label*='Play' i], button[aria-label*='Listen' i], button:has-text('Play'), button:has-text('Listen')");
  const np = await plays.count();
  N("co.players", np);
  const visiblePlays = [];
  for (let i = 0; i < np; i++) { visiblePlays.push({ i, aria: await plays.nth(i).getAttribute("aria-label"), text: (await plays.nth(i).textContent()).trim().slice(0, 30) }); }
  N("co.playbtns", visiblePlays);
  // Part 2 player = last main play button
  const p2 = plays.nth(np - 1);
  await p2.scrollIntoViewIfNeeded(); await sleep(600);
  await shot(page, `${key}-co-part2-inview`);
  await p2.click(); await sleep(2000);
  await shot(page, `${key}-co-part2-playing`);
  N("co.audio-p2", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime }))));
  // scroll UP into part 1
  const scene0 = page.locator("[id^=scene]").first();
  await scene0.scrollIntoViewIfNeeded(); await sleep(400);
  await page.mouse.wheel(0, 300); await sleep(300); await page.mouse.wheel(0, -100); await sleep(900);
  await shot(page, `${key}-co-scrolled-up-into-part1`);
  N("co.floating-in-part1", await floating(page));
  N("co.audio-after-scroll", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime }))));
  // moral 1 and moral 2
  const morals = page.locator("[id^=moral]");
  const nm = await morals.count();
  for (let i = 0; i < nm; i++) { await morals.nth(i).scrollIntoViewIfNeeded(); await sleep(1200); await shot(page, `${key}-co-moral-${i}`); }
  // both players' mini
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" })); await sleep(900);
  await shot(page, `${key}-co-foot`);
  N("co.foot-floating", await floating(page));
} catch (e) {
  log("ERR", e);
  notes.error = String(e);
}
notes.consoleErrors = errors;
saveJson(`${key}-home-chapter-notes`, notes);
log("console errors:", JSON.stringify(errors, null, 1));
await browser.close();
