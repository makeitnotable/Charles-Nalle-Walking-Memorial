import { launch, ctx, VPS, shot, go, sleep } from "./juror2-lib.mjs";
const browser = await launch();
const chapters = ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"];
for (const vpk of (process.argv[2] || "p390,d1440").split(",")) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage();
  for (const ch of chapters) {
    await go(page, "/" + ch, 1200);
    const n = await page.evaluate(() => document.querySelectorAll("section[id^=scene]").length);
    for (let i = 0; i < n; i++) {
      const info = await page.evaluate((i) => {
        const sec = document.querySelectorAll("section[id^=scene]")[i];
        const p = sec.querySelector("p.t-prose");
        p.scrollIntoView({ block: "center" });
        const fl = getComputedStyle(p, "::first-letter");
        return { text: p.textContent.slice(0, 30), fl: `${fl.fontSize} ${fl.fontFamily.slice(0, 30)} float=${fl.cssFloat} il=${fl.initialLetter}` };
      }, i);
      await sleep(900);
      await shot(page, `dc-${ch}-${i}-${vpk}`, { clip: { x: 0, y: Math.max(0, vp.height / 2 - 160), width: Math.min(vp.width, 900), height: 320 } });
      console.log(ch, i, vpk, JSON.stringify(info));
    }
    // hero shot too
    await page.evaluate(() => scrollTo(0, 0)); await sleep(700);
    await shot(page, `hero-${ch}-${vpk}`);
  }
  await c.close();
}
await browser.close();
