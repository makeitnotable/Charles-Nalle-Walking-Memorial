// Commissioner's Office end-to-end: order, both players, one mini at a time, spine labels; plus targeted element shots on all chapters.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, OUT } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";
const errs = []; const notes = []; const N = (s) => { notes.push(s); console.log(s); };
const browser = await launch();
const vps = (process.argv[2] || "p390,t768,d1440").split(",");

for (const vpk of vps) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage(); watchConsole(page, `co-${vpk}`, errs);
  await go(page, "/commissioners-office", 2500);
  const order = await page.evaluate(() => [...document.querySelectorAll("main [id], header[id], section[id]")].filter((e) => /^(hero|scene|interlude|history|moral|onward)/.test(e.id)).map((e) => e.id + "@" + Math.round(e.getBoundingClientRect().top + scrollY)));
  N(`co@${vpk} id order: ${order.join(" → ")}`);
  const spine = await page.evaluate(() => [...document.querySelectorAll("a[href^='#']")].map((a) => a.textContent.trim().replace(/\s+/g, " ")).filter((t, i, arr) => arr.indexOf(t) === i));
  N(`co@${vpk} spine: ${spine.join(" | ")}`);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(100); }
  await page.evaluate(() => scrollTo(0, 0)); await sleep(500);
  const plays = page.locator('button[aria-label^="Play narration"]');
  N(`co@${vpk} play buttons: ${await plays.count()} labels=${(await plays.evaluateAll((b) => b.map((x) => x.getAttribute("aria-label")))).join(" / ")}`);
  const play1 = page.locator('#scene-0 button[aria-label*="narration"]').first();
  const play2 = page.locator('#scene-1 button[aria-label*="narration"]').first();
  // Part 1
  await play1.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -200)); await sleep(500);
  await shot(page, `co-${vpk}-01-part1-player`);
  await play1.click(); await sleep(2500);
  await page.evaluate(() => scrollBy(0, 700)); await sleep(800);
  await shot(page, `co-${vpk}-02-part1-mini`);
  // Part-2 hero + player
  const hero2 = await page.$("#hero-2");
  if (hero2) { await hero2.scrollIntoViewIfNeeded(); await sleep(900); await shot(page, `co-${vpk}-03-hero2`); }
  await play2.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -200)); await sleep(700);
  await shot(page, `co-${vpk}-04-part2-player-before`);
  const audioState = async () => page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => `${a.src.split("/").pop()} t=${a.currentTime.toFixed(1)} paused=${a.paused}`));
  N(`co@${vpk} before part2 click: ${(await audioState()).join(" ; ")}`);
  await play2.click(); await sleep(2500);
  N(`co@${vpk} after part2 click: ${(await audioState()).join(" ; ")}`);
  await page.evaluate(() => scrollBy(0, 700)); await sleep(900);
  await shot(page, `co-${vpk}-05-part2-mini`);
  const fixed = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.position === "fixed" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.width > 0 && r.height > 0 && r.height < innerHeight; }).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute("aria-label")||e.textContent||"").trim().replace(/\s+/g," ").slice(0,30)}"`; }));
  N(`co@${vpk} fixed after part2 (should be ONE mini): ${fixed.join(" | ")}`);
  // Tap para in part 2 to seek
  const p2paras = page.locator("#scene-1 p.t-prose");
  if (await p2paras.count() >= 2) { const t = p2paras.nth(1); await t.scrollIntoViewIfNeeded(); await sleep(300); const b = await t.boundingBox(); if (vp.mobile) await page.touchscreen.tap(b.x + 30, b.y + 20); else await page.mouse.click(b.x + 30, b.y + 20); await sleep(1000); N(`co@${vpk} after tapping part2 para2: ${(await audioState()).join(" ; ")}`); await shot(page, `co-${vpk}-06-part2-tap`); }
  for (const id of ["moral-0", "moral-1", "onward"]) { const el = await page.$("#" + id); if (!el) continue; await el.scrollIntoViewIfNeeded(); await sleep(900); await shot(page, `co-${vpk}-07-${id}`); }
  await c.close();
}

// Targeted shots: moral headings + drop caps + interlude credits on all five chapters
const chapters = ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"];
for (const vpk of vps) {
  const vp = VPS[vpk];
  const c = await ctx(browser, vp); const page = await c.newPage(); watchConsole(page, `el-${vpk}`, errs);
  for (const ch of chapters) {
    await go(page, "/" + ch, 1500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(90); }
    // moral headings
    const heads = await page.$$("h2[id^=moral]");
    for (let i = 0; i < heads.length; i++) {
      await heads[i].evaluate((e) => e.scrollIntoView({ block: "center" })); await sleep(900);
      await shot(page, `el-${ch}-${vpk}-moral${i}-heading`);
    }
    // drop caps (first prose para of each scene)
    const firsts = await page.$$("section[id^=scene] p.t-prose:first-of-type");
    for (let i = 0; i < firsts.length; i++) { await firsts[i].evaluate((e) => e.scrollIntoView({ block: "center" })); await sleep(700); await shot(page, `el-${ch}-${vpk}-dropcap${i}`); }
    // interlude
    const cred = await page.$("figure figcaption, [class*=interlude] figcaption, .t-meta:has(+ img)");
    const inter = await page.evaluate(() => { const c = [...document.querySelectorAll("figcaption, .t-meta")].find((e) => /archival|record|courtesy|photo|collection|library/i.test(e.textContent)); return c ? { text: c.textContent.trim().slice(0, 80), y: c.getBoundingClientRect().top + scrollY } : null; });
    if (inter) { await page.evaluate((y) => scrollTo(0, y - innerHeight * 0.6), inter.y); await sleep(1200); await shot(page, `el-${ch}-${vpk}-interlude`); }
    // story order for barbershop
    if (ch === "barbershop") { const ord = await page.evaluate(() => [...document.querySelectorAll("#scene-0 p.t-prose, #scene-0 img, #scene-0 figure, #scene-0 picture")].map((e) => e.tagName)); N(`barbershop@${vpk} story order: ${ord.join(",")}`); }
  }
  await c.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `co-notes-${vps.join("_")}.txt`), notes.concat(["", "CONSOLE:", ...errs.filter((e) => !/mp3.*ABORTED|vector\.pbf/.test(e))]).join("\n"));
console.log("console:", errs.filter((e) => !/mp3.*ABORTED|vector\.pbf/.test(e)).join("\n"));
