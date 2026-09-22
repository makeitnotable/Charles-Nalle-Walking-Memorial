import { launch, goto, shot, sleep, VIEWPORTS, log } from "./juror9-lib.mjs";
for (const key of ["p390", "t1024", "d1440"]) {
  const vp = VIEWPORTS[key];
  const { browser, page, errors } = await launch(vp, { dpr: 1 });
  await goto(page, "/people", 2500);
  log(key, "people", JSON.stringify(await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const lines = h1 ? [...h1.querySelectorAll(".line-box, .line, span")].filter((e) => e.getBoundingClientRect().height > 0 && e.children.length === 0).map((e) => e.textContent.trim()) : [];
    const closer = [...document.querySelectorAll("section")].pop();
    const texts = [...(closer?.querySelectorAll("p, h2, a, button") || [])].map((e) => e.textContent.trim().replace(/\s+/g, " ").slice(0, 60));
    const spot = [...document.querySelectorAll("a")].filter((a) => /^Spot \d/.test(a.textContent.trim())).length;
    return { h1lines: lines, closer: texts, spotLinks: spot };
  })));
  if (key === "p390") {
    await goto(page, "/barbershop", 2500);
    log(key, "barbershop order", JSON.stringify(await page.evaluate(() => { const sc = document.querySelector("#scene-0") || document.querySelector("[id^=scene]"); const seq = []; sc.querySelectorAll("p.t-prose, figure img, figure picture, figure video").forEach((el) => seq.push(el.tagName === "P" ? "T" : "I")); return seq.join(""); })));
    await goto(page, "/mansion", 2500);
    log(key, "mansion player subtitle", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("button[aria-label*='Play' i]")].map((b) => b.getAttribute("aria-label")))));
    // N1 close spin
    const burger = page.locator("button[aria-label='Open menu']").first(); const bb = await burger.boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(900);
    const close = page.locator("button[aria-label*='Close' i]").first(); const cb = await close.boundingBox();
    const iconSel = "button[aria-label*='Close' i] svg, button[aria-label*='Close' i] span, button[aria-label*='Close' i] i";
    const before = await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => getComputedStyle(e).transform), iconSel);
    await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
    const samples = []; for (let i = 0; i < 12; i++) { samples.push(await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => getComputedStyle(e).transform + "|" + getComputedStyle(e).opacity).join(";"), iconSel)); await sleep(30); }
    log(key, "close spin", JSON.stringify({ before, samples }));
  }
  await browser.close();
}
