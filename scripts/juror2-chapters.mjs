// Chapter read-through as a visitor: arrival, play, tap-to-seek, scroll, mini-player, onward, footer, Continue, menu.
import { launch, ctx, VPS, shot, go, sleep, watchConsole, BASE, OUT } from "./juror2-lib.mjs";
import fs from "node:fs";
import path from "node:path";

const errs = [];
const notes = [];
const N = (s) => { notes.push(s); console.log(s); };
const browser = await launch();

const which = (process.argv[2] || "p390,t768,d1440").split(",");
const routes = (process.argv[3] || "/bakery").split(",");

for (const vpk of which) {
  const vp = VPS[vpk];
  for (const route of routes) {
    const slug = route.replace("/", "");
    const c = await ctx(browser, vp);
    const page = await c.newPage();
    watchConsole(page, `${slug}-${vpk}`, errs);
    await go(page, route, 2500);
    await shot(page, `ch-${slug}-${vpk}-00-arrival`);
    // full page (reveals forced by scrolling through)
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(vp.height * 0.7)) { await page.evaluate((y) => scrollTo(0, y), y); await sleep(120); }
    await page.evaluate(() => scrollTo(0, 0)); await sleep(600);
    await shot(page, `ch-${slug}-${vpk}-01-full`, { fullPage: true, scale: "css" });

    // burger scroll-hide check
    const burgerVis = async () => page.evaluate(() => { const b = document.querySelector('button[aria-label="Open menu"]'); if (!b) return "none"; const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); return `${cs.opacity}/${cs.visibility}/${cs.transform.slice(0,40)}/y=${Math.round(r.y)}`; });
    N(`${slug}@${vpk} burger at top: ${await burgerVis()}`);
    await page.evaluate(() => scrollTo({ top: 900, behavior: "instant" })); await sleep(700);
    N(`${slug}@${vpk} burger after 900px down: ${await burgerVis()}`);
    await page.evaluate(() => scrollTo({ top: 840, behavior: "instant" })); await sleep(700);
    N(`${slug}@${vpk} burger after 60px up: ${await burgerVis()}`);

    // Play narration
    const play = page.locator('button[aria-label^="Play narration"]').first();
    await play.scrollIntoViewIfNeeded(); await sleep(400);
    await page.evaluate(() => scrollBy(0, -160)); await sleep(700);
    await shot(page, `ch-${slug}-${vpk}-02-player-rest`);
    await play.click(); await sleep(3500);
    const st1 = await page.evaluate(() => { const a = document.querySelector("audio"); const hl = document.querySelector(".narration-active, [data-active=true], .is-active"); return { t: a?.currentTime, paused: a?.paused, hl: hl?.textContent?.slice(0, 40) }; });
    N(`${slug}@${vpk} after play 3.5s: ${JSON.stringify(st1)}`);
    await shot(page, `ch-${slug}-${vpk}-03-playing`);
    // Tap the third paragraph in the story to seek
    const paras = page.locator("section[id^=scene] p.t-prose, section[id^=scene] .t-prose");
    const np = await paras.count();
    if (np >= 3) {
      const target = paras.nth(2);
      await target.scrollIntoViewIfNeeded(); await sleep(300);
      const box = await target.boundingBox();
      if (vp.mobile) await page.touchscreen.tap(box.x + 40, box.y + 20); else await page.mouse.click(box.x + 40, box.y + 20);
      await sleep(1200);
      const st2 = await page.evaluate(() => { const a = document.querySelector("audio"); return { t: a?.currentTime, paused: a?.paused }; });
      N(`${slug}@${vpk} after tapping para 3: ${JSON.stringify(st2)} (paras=${np})`);
      await shot(page, `ch-${slug}-${vpk}-04-tapped-para`);
    }
    // scroll on: mini-player latched
    await page.evaluate(() => scrollBy({ top: 900, behavior: "instant" })); await sleep(900);
    await shot(page, `ch-${slug}-${vpk}-05-mini`);
    const mini = await page.evaluate(() => { const els = [...document.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); return cs.position === "fixed" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0; }); return els.map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}.${e.className.toString().split(" ").slice(0,2).join(".")} ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute("aria-label")||e.textContent||"").trim().replace(/\s+/g," ").slice(0,30)}"`; }); });
    N(`${slug}@${vpk} fixed elements after scroll: ${mini.join(" | ")}`);
    // interlude/history/moral/onward viewport shots
    for (const id of ["history", "moral", "moral-0", "moral-1", "onward"]) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -20)); await sleep(1100);
      await shot(page, `ch-${slug}-${vpk}-06-${id}`);
    }
    // Onward: mini-player collapsed?
    const cta = page.locator("#onward a", { hasText: "Continue" }).first();
    await cta.scrollIntoViewIfNeeded(); await sleep(1200);
    await shot(page, `ch-${slug}-${vpk}-07-onward-cta`);
    const fixed2 = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.position === "fixed" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.width > 0 && r.height > 0; }).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute("aria-label")||e.textContent||"").trim().replace(/\s+/g," ").slice(0,30)}"`; }));
    N(`${slug}@${vpk} fixed at Onward: ${fixed2.join(" | ")}`);
    // footer with mini latched
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(1200);
    await shot(page, `ch-${slug}-${vpk}-08-footer`);
    const footInfo = await page.evaluate(() => { const f = document.querySelector("footer"); const r = f.getBoundingClientRect(); const fixed = [...document.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return cs.position === "fixed" && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && b.width > 0 && b.height > 0 && b.bottom > r.top; }).map((e) => { const b = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()} ${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}`; }); const links = [...f.querySelectorAll("a,button")].map((a) => { const b = a.getBoundingClientRect(); return `${a.textContent.trim().slice(0,22)}@${Math.round(b.x)},${Math.round(b.y)}`; }); return { footerTop: Math.round(r.top), h: Math.round(r.height), fixed, links }; });
    N(`${slug}@${vpk} footer: ${JSON.stringify(footInfo)}`);

    // Menu open/close
    await page.evaluate(() => scrollTo(0, 0)); await sleep(800);
    await page.locator('button[aria-label="Open menu"]').click(); await sleep(900);
    await shot(page, `ch-${slug}-${vpk}-09-menu-open`);
    await page.locator('button[aria-label="Close menu"]').click(); await sleep(700);
    await shot(page, `ch-${slug}-${vpk}-10-menu-closed`);

    // Continue → next chapter (curtain)
    await cta.scrollIntoViewIfNeeded(); await sleep(600);
    await cta.click({ noWaitAfter: true });
    await sleep(350); await shot(page, `ch-${slug}-${vpk}-11-continue-350ms`);
    await sleep(500); await shot(page, `ch-${slug}-${vpk}-12-continue-850ms`);
    await sleep(1500); await shot(page, `ch-${slug}-${vpk}-13-next-arrived`);
    N(`${slug}@${vpk} after Continue url=${page.url()}`);
    await c.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(OUT, `chapters-notes-${which.join("_")}-${routes.map((r) => r.slice(1)).join("_")}.txt`), notes.concat(["", "CONSOLE:", ...errs]).join("\n"));
console.log("console issues:", errs.length); console.log(errs.slice(0, 40).join("\n"));
