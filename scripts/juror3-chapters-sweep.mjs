import { launch, newPage, shot, goto, sleep, report } from "./juror3-lib.mjs";
// Sweep the five chapters: interlude credit, story order, drop caps, moral heading, rhythm shots
const vps = process.argv.slice(2).length ? process.argv.slice(2) : ["p390", "d1440"];
const chapters = ["/bakery", "/commissioners-office", "/mansion", "/ferry", "/barbershop"];
for (const vp of vps) {
  const browser = await launch();
  for (const route of chapters) {
    const page = await newPage(browser, vp);
    const tag = `${route.replace(/\//g, "")}-${vp}`;
    await goto(page, route);
    await sleep(800);
    const info = await page.evaluate(() => {
      const scene = document.querySelector("#scene-0");
      const items = scene ? [...scene.querySelectorAll("p.t-prose, figure, picture, img, video")].filter((el) => !el.closest("figure") || el.tagName === "FIGURE").map((el) => el.tagName === "P" ? "T" : "I") : [];
      const first = scene?.querySelector("p.t-prose");
      const fl = first ? getComputedStyle(first, "::first-letter") : null;
      const sections = [...document.querySelectorAll("main section, main header")].map((s) => `${s.tagName.toLowerCase()}#${s.id || "-"}`);
      // interlude credit: t-meta inside the unnamed section
      const inter = [...document.querySelectorAll("main section")].find((s) => !s.id);
      const credit = inter?.querySelector(".t-meta, figcaption");
      const cs = credit ? getComputedStyle(credit) : null;
      const study = document.querySelector("[id^=moral] figure");
      return {
        order: items.join(""),
        firstLetter: fl && { size: fl.fontSize, float: fl.cssFloat, initialLetter: fl.initialLetter, family: fl.fontFamily.slice(0, 30) },
        sections,
        credit: credit && { text: credit.textContent.trim().slice(0, 60), color: cs.color, bg: cs.backgroundColor, pos: cs.position },
        interludeTop: inter?.getBoundingClientRect().top + scrollY,
        studyGrid: study && getComputedStyle(study).alignItems,
      };
    });
    console.log(tag, JSON.stringify(info));
    // shot the interlude
    await page.evaluate(() => { const inter = [...document.querySelectorAll("main section")].find((s) => !s.id); if (inter) window.scrollTo(0, inter.getBoundingClientRect().top + scrollY - 40); });
    await sleep(1500);
    await shot(page, `${tag}-interlude`);
    // shot the moral study (sketch + caption)
    await page.evaluate(() => { const f = document.querySelector("[id^=moral] figure"); if (f) window.scrollTo(0, f.getBoundingClientRect().top + scrollY - Math.round(innerHeight * 0.15)); });
    await sleep(1200);
    await shot(page, `${tag}-study`);
    // shot the part heading → quote (rhythm)
    await page.evaluate(() => { const s = document.querySelector("#scene-0"); if (s) window.scrollTo(0, s.getBoundingClientRect().top + scrollY); });
    await sleep(1000);
    await shot(page, `${tag}-scene-top`);
    // drop cap
    await page.evaluate(() => { const p = document.querySelector("#scene-0 p.t-prose"); if (p) window.scrollTo(0, p.getBoundingClientRect().top + scrollY - Math.round(innerHeight * 0.25)); });
    await sleep(1000);
    await shot(page, `${tag}-dropcap`);
    report(page, tag);
    await page.close();
  }
  await browser.close();
}
