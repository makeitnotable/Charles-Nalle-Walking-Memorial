import { launch, ctx, VPS, shot, goto, watchConsole, overflowCheck, log, sleep } from "./juror11-lib.mjs";
const vpKey = process.argv[2] || "p390";
const vp = VPS[vpKey];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const errs = watchConsole(page, `ch2-${vpKey}`);
const tag = `ch2-${vpKey}`;
await goto(page, "/commissioners-office", 2000);
await shot(page, `${tag}-01-arrival`);
// section order
const order = await page.evaluate(() => [...document.querySelectorAll("section[id], div[id^=hero], [id^=scene], #history, [id^=moral], #onward")].map((s) => s.id).filter(Boolean));
log("id order:", order.join(" → "));
const spine = await page.evaluate(() => [...document.querySelectorAll("nav a, aside a, [class*=spine] a")].map((a) => a.textContent.trim().replace(/\s+/g, " ")).filter((t) => t).slice(0, 12));
log("spine:", spine.join(" | "));
const state = async () => page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], vis: r.width > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight, txt: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40) }; };
  const pauses = [...document.querySelectorAll("button")].filter((b) => /pause/i.test(b.getAttribute("aria-label") || "")).map(vis);
  const audios = [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: Math.round(a.currentTime), src: a.currentSrc.split("/").pop() }));
  const minis = [...document.querySelectorAll("div.fixed")].filter((e) => /bottom/.test(e.className)).map(vis);
  return { y: Math.round(scrollY), pauses, audios, minis };
});
// scroll through, capturing key sections
for (const id of ["scene-0", "interlude", "history", "moral-0", "hero-2", "scene-1", "moral-1", "onward"]) {
  const ok = await page.evaluate((id) => { const el = document.getElementById(id); if (!el) return false; el.scrollIntoView({ behavior: "instant" }); return true; }, id);
  if (!ok) { log("no #" + id); continue; }
  await sleep(1300);
  await shot(page, `${tag}-sec-${id}`);
}
// Play Part 2
const btns = await page.locator("[id^=scene] button[aria-label*='Play']").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label")));
log("play buttons:", btns);
const p2 = page.locator("#scene-1 button[aria-label*='Play']").first();
await p2.scrollIntoViewIfNeeded();
await sleep(400);
let b = await p2.boundingBox();
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
await sleep(2000);
log("part2 playing:", JSON.stringify(await state()));
await shot(page, `${tag}-p2-playing`);
// scroll up into Part 1
await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ behavior: "instant" }));
await sleep(1200);
const s1 = await state();
log("up into part 1:", JSON.stringify(s1));
await shot(page, `${tag}-p2-playing-up-in-part1`);
// scroll into part 1 paragraphs
await page.evaluate(() => { const p = document.querySelector("#scene-0 p.t-prose"); p?.scrollIntoView({ behavior: "instant", block: "center" }); });
await sleep(1200);
log("part1 paragraphs while p2 plays:", JSON.stringify(await state()));
await shot(page, `${tag}-p2-playing-part1-paras`);
// now play part 1 — only one mini visible?
const p1 = page.locator("#scene-0 button[aria-label*='Play'], #scene-0 button[aria-label*='Pause']").first();
await p1.scrollIntoViewIfNeeded();
await sleep(300);
b = await p1.boundingBox();
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
await sleep(1500);
log("after playing part1:", JSON.stringify(await state()));
await page.evaluate(() => document.getElementById("history")?.scrollIntoView({ behavior: "instant" }));
await sleep(1200);
log("at history:", JSON.stringify(await state()));
await shot(page, `${tag}-both-history`);
// tap-to-seek in part 2
await page.evaluate(() => { const p = document.querySelectorAll("#scene-1 p.t-prose")[1]; p?.scrollIntoView({ behavior: "instant", block: "center" }); });
await sleep(500);
const pp = await page.locator("#scene-1 p.t-prose").nth(1).boundingBox();
const before = (await state()).audios;
await page.mouse.click(pp.x + 30, pp.y + 8);
await sleep(1200);
log("tap p2 para:", JSON.stringify(before), "->", JSON.stringify((await state()).audios));
await shot(page, `${tag}-p2-tap`);
// moral 1 body colours
const morals = await page.evaluate(() => [...document.querySelectorAll("[id^=moral]")].map((s) => { const h = s.querySelector("h2"); const p = [...s.querySelectorAll("p")].find((p) => p.textContent.trim().length > 60); return { id: s.id, h: h?.textContent.trim().replace(/\s+/g, " "), hc: h && getComputedStyle(h).color, p: p?.textContent.trim().slice(0, 40), pc: p && getComputedStyle(p).color }; }));
log("morals:", JSON.stringify(morals));
const of = await overflowCheck(page);
log("overflow:", of.bodySW, of.iw, of.offenders.length ? JSON.stringify(of.offenders) : "clean");
log("console errors:", errs.length ? errs : "none");
await browser.close();
