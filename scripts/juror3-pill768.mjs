import { launch, newPage, shot, goto, sleep } from "./juror3-lib.mjs";
const browser = await launch();
for (const vp of ["t768", "p390"]) {
  const page = await newPage(browser, vp);
  await goto(page, "/mansion"); await sleep(1000);
  const play = await page.$('button[aria-label^="Play narration"]');
  await play.scrollIntoViewIfNeeded(); await play.click(); await sleep(1200);
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const off of [900, 500, 250, 0]) {
    await page.evaluate((y) => window.scrollTo(0, y), H - off); await sleep(700);
    console.log(vp, await page.evaluate((off) => { const pill = [...document.querySelectorAll("*")].find((e) => getComputedStyle(e).position === "fixed" && /\d\d:\d\d/.test(e.textContent) && e.getBoundingClientRect().width < 300); const onward = document.querySelector("#onward")?.getBoundingClientRect(); const cta = [...document.querySelectorAll("#onward a")].map(a => { const r = a.getBoundingClientRect(); return `${a.textContent.trim().slice(0,14)}@${Math.round(r.x)},${Math.round(r.y)}`; }); return `bottom-${off}: pill op=${pill ? getComputedStyle(pill).opacity : "none"} @${pill ? Math.round(pill.getBoundingClientRect().x) + "," + Math.round(pill.getBoundingClientRect().y) : "-"} · onward top=${Math.round(onward?.top)} ctas=${cta.join(" ")} · paused=${document.querySelector("audio").paused}`; }, off));
    if (off === 250) await shot(page, `mansion-${vp}-onward-pill`);
  }
  await page.close();
}
await browser.close();
