import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";
const browser = await launch();
const out = {};
const c = await ctx(browser, VPS.d1440); const page = await c.newPage(); const log = watch(page);
await page.goto(BASE + "/barbershop", { waitUntil: "networkidle" }); await sleep(1500);
out.barbershopOrder = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 figure, #scene-0 img, #scene-0 picture")].map((e) => e.tagName === "P" ? "T" : "I").join(""));
out.barbershopOrderDetail = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 figure")].map((e) => e.tagName === "P" ? "T:" + e.textContent.trim().slice(0, 25) : "IMG:" + (e.querySelector("img")?.getAttribute("alt") || "").slice(0, 25)));
await page.evaluate(() => document.getElementById("onward").scrollIntoView()); await sleep(2500);
out.embedAttribution = await page.evaluate(() => { const o = document.getElementById("onward"); return { attrib: !!o.querySelector(".mapboxgl-ctrl-attrib"), logo: !!o.querySelector(".mapboxgl-ctrl-logo"), text: o.querySelector(".mapboxgl-ctrl-attrib")?.textContent.slice(0, 80) }; });
await page.goto(BASE + "/mansion", { waitUntil: "networkidle" }); await sleep(1200);
out.mansionAudioSubtitle = await page.evaluate(() => [...document.querySelectorAll("#scene-0 *")].filter((e) => e.children.length === 0 && /Gilbert/.test(e.textContent)).map((e) => e.textContent.trim().slice(0, 60)).slice(0, 5));
out.mansionAudioLabel = await page.evaluate(() => document.querySelector('button[aria-label*="narration"]')?.getAttribute("aria-label"));
// footer wordmark one line at 390 + disclaimer lines
for (const k of ["p390", "t768", "d1440", "d1920"]) {
  const c2 = await ctx(browser, VPS[k]); const p2 = await c2.newPage();
  await p2.goto(BASE + "/about", { waitUntil: "networkidle" }); await sleep(800);
  await p2.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1000);
  out["footer-" + k] = await p2.evaluate(() => { const f = document.querySelector("footer"); const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size; }; const wm = [...f.querySelectorAll("p, span, div, a")].find((e) => /^Charles Nalle Walking Memorial$/.test(e.textContent.trim())) || f; const disc = [...f.querySelectorAll("p, div, span")].filter((e) => /Walking routes/.test(e.textContent)).pop(); const dr = document.createRange(); dr.selectNodeContents(disc); const rects = [...dr.getClientRects()]; const last = rects[rects.length - 1]; return { wordmarkLines: lines(wm), disclaimerLines: lines(disc), disclaimerLastLineWidth: Math.round(last.width), disclaimerWidth: Math.round(disc.getBoundingClientRect().width), disclaimerColor: getComputedStyle(disc).color, opacity: getComputedStyle(disc).opacity, links: [...f.querySelectorAll("a")].map((a) => a.textContent.trim()) }; });
  await shot(p2, `footer-about-${k}`);
  await c2.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
