import { launch, newPage, shot, goto, sleep, report, BASE, VIEWPORTS } from "./juror3-lib.mjs";

// people / about / 404 / trailing slash / reduced motion / 200% zoom / footers
const vps = process.argv.slice(2).length ? process.argv.slice(2) : ["p390", "t768", "d1440"];
for (const vp of vps) {
  const browser = await launch();
  const V = VIEWPORTS[vp];
  // trailing slash
  {
    const page = await newPage(browser, vp);
    await page.goto(BASE + "/bakery/", { waitUntil: "networkidle" }).catch(() => {});
    await sleep(2500);
    console.log(vp, "/bakery/ →", page.url(), "title:", await page.title());
    await page.close();
  }
  for (const route of ["/people", "/about", "/404"]) {
    const page = await newPage(browser, vp);
    await goto(page, route);
    await sleep(1500);
    const tag = `${route.replace("/", "")}-${vp}`;
    await shot(page, `${tag}-01-top`);
    const info = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const r = document.createRange(); r.selectNodeContents(h1);
      const lines = [...new Set([...r.getClientRects()].map((x) => Math.round(x.top)))];
      const lineTexts = []; // approximate: split by line boxes
      const eyebrows = [...document.querySelectorAll(".t-meta")].map((e) => e.textContent.trim()).filter((t) => t.length < 60).slice(0, 12);
      const ctas = [...document.querySelectorAll("a.btn, .btn")].map((b) => b.textContent.trim().replace(/\s+/g, " "));
      const spotLinks = [...document.querySelectorAll("a")].filter((a) => /^Spot \d/.test(a.textContent.trim())).length;
      const heads = [...document.querySelectorAll("h2")].map((h) => h.textContent.trim().replace(/\s+/g, " ")).slice(0, 12);
      const dashes = [...document.querySelectorAll("main *")].filter((el) => el.children.length === 0 && /—/.test(el.textContent)).map((el) => el.textContent.trim().slice(0, 50));
      return { h1: h1?.textContent.replace(/\s+/g, " ").trim(), h1lines: lines.length, eyebrows, ctas, spotLinks, heads, dashes };
    });
    console.log(tag, JSON.stringify(info));
    // scroll to the middle and the closer/footer
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4)); await sleep(1200);
    await shot(page, `${tag}-02-mid`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
    await shot(page, `${tag}-03-foot`);
    if (route === "/about") {
      // the sections rail
      const secs = await page.evaluate(() => [...document.querySelectorAll("main section")].map((s) => `${s.id || "-"}: ${(s.querySelector(".t-spine, .t-spine-sm")?.textContent.trim() || "")} ${(s.querySelector("h2")?.textContent.trim().replace(/\s+/g, " ").slice(0, 40) || "")}`));
      console.log("about sections:", secs);
      await page.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((x) => /Two and a half/i.test(x.textContent)); h?.scrollIntoView({ block: "center" }); }); await sleep(1000);
      await shot(page, `${tag}-04-closer`);
      await page.evaluate(() => { const q = document.querySelector("blockquote, .t-quote"); q?.scrollIntoView({ block: "center" }); }); await sleep(1000);
      await shot(page, `${tag}-05-quote`);
    }
    if (route === "/people") {
      await page.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((x) => /Stand where/i.test(x.textContent)); h?.scrollIntoView({ block: "center" }); }); await sleep(1000);
      await shot(page, `${tag}-04-closer`);
    }
    report(page, tag);
    await page.close();
  }
  await browser.close();
}

// reduced motion + 200% zoom
{
  const browser = await launch();
  for (const route of ["/", "/ferry", "/map", "/paintings"]) {
    const page = await newPage(browser, "p390", { reducedMotion: "reduce" });
    await goto(page, route);
    await sleep(2500);
    const tag = `rm-${route.replace("/", "") || "home"}`;
    await shot(page, `${tag}-390-top`);
    if (route === "/paintings") {
      const info = await page.evaluate(() => ({ canvas: !!document.querySelector("#museum-slot canvas"), slotH: document.querySelector("#museum-slot")?.getBoundingClientRect().height, tiles: document.querySelectorAll('button[aria-label^="View"]').length, museum: !!window.__museum }));
      console.log("reduced-motion /paintings:", info);
      await page.evaluate(() => window.scrollTo(0, 700)); await sleep(1000);
      await shot(page, `${tag}-390-scrolled`);
    }
    if (route === "/ferry") {
      // is everything visible without scroll-triggered reveals? scroll to moral and check opacity of texts
      await page.evaluate(() => document.querySelector("#moral")?.scrollIntoView()); await sleep(600);
      const hidden = await page.evaluate(() => [...document.querySelectorAll("main h2, main p")].filter((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && +getComputedStyle(el).opacity < 0.9; }).map((el) => el.textContent.trim().slice(0, 30)));
      console.log("reduced-motion /ferry hidden-in-view:", hidden);
      await shot(page, `${tag}-390-moral`);
      const play = await page.$('button[aria-label^="Play narration"]');
      await play.scrollIntoViewIfNeeded(); await play.click(); await sleep(1500);
      console.log("rm play:", await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => a.paused)));
    }
    if (route === "/map") {
      await (await page.$('button:has-text("Take the walk")')).click(); await sleep(2500);
      await shot(page, `${tag}-390-walk`);
      const rest = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((b) => /Stop the walk|Continue/.test(b.textContent)); return b?.textContent.trim(); });
      console.log("rm map walk button:", rest);
    }
    report(page, tag);
    await page.close();
  }
  for (const route of ["/", "/ferry", "/map", "/paintings", "/people", "/about"]) {
    const page = await newPage(browser, "zoom200");
    await goto(page, route); await sleep(2000);
    const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    const tag = `zoom200-${route.replace("/", "") || "home"}`;
    await shot(page, tag);
    await page.evaluate(() => window.scrollTo(0, 900)); await sleep(800);
    await shot(page, `${tag}-scrolled`);
    console.log("zoom200", route, ov, ov.sw > ov.iw ? "HORIZONTAL OVERFLOW" : "ok");
    await page.close();
  }
  await browser.close();
}
