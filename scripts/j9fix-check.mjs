import { chromium } from "playwright";
const B = "http://localhost:4321"; const out = {};
{
  const b = await chromium.launch();
  for (const w of [360, 390, 768, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto(B + "/people", { waitUntil: "networkidle" }); await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const roles = [...document.querySelectorAll("p.sep-list")].map(e => { const segs = [...e.children].map(s => ({ t: s.textContent, top: Math.round(s.getBoundingClientRect().top), left: Math.round(s.getBoundingClientRect().left) })); const pr = e.getBoundingClientRect(); return { t: e.textContent, w: Math.round(pr.width), lines: new Set(segs.map(s => s.top)).size, segs, colLeft: Math.round(pr.left) }; });
      return { bodySW: document.body.scrollWidth, docSW: document.documentElement.scrollWidth, iw: innerWidth, wrapped: roles.filter(r => r.lines > 1) };
    });
    out["people" + w] = r;
    // shoot the Uri Gilbert card
    const el = p.locator("p.sep-list", { hasText: /Industrialist/ }).first();
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    const bb = await el.boundingBox();
    await p.screenshot({ path: `docs/v7/qa/j9fix/people-${w}.png`, clip: { x: 0, y: Math.max(0, bb.y - 40), width: w, height: 160 } });
    await p.close();
  }
  await b.close();
}
{
  const b = await chromium.launch({ args: ["--use-gl=angle","--autoplay-policy=no-user-gesture-required"] });
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500, isMobile: w < 500 });
    const p = await ctx.newPage();
    await p.goto(B + "/paintings", { waitUntil: "networkidle" }); await p.waitForFunction(() => window.__museum, null, { timeout: 30000 }); await p.waitForTimeout(1000);
    await p.evaluate(() => window.__museum.approach(0)); await p.waitForTimeout(2200);
    const r = await p.evaluate(() => { const m = document.querySelector(".cnwm-menu"); const pr = window.__museum.paintingRect(0); const eyebrow = [...document.querySelectorAll("p.sep-list")].find(e => e.getBoundingClientRect().width > 0); const segs = eyebrow ? [...eyebrow.children].map(s => Math.round(s.getBoundingClientRect().top)) : []; return { menuHidden: m?.dataset.hidden, scrollY: Math.round(scrollY), paintLeft: Math.round(pr.left), paintRight: Math.round(innerWidth - pr.right), eyebrowLines: new Set(segs).size, eyebrowText: eyebrow?.textContent }; });
    await p.screenshot({ path: `docs/v7/qa/j9fix/museum-${w}.png` });
    out["museum" + w] = r;
    await ctx.close();
  }
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
