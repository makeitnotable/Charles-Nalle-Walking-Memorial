// QR arrival on /bakery + /barbershop at 6 viewports; full read of /bakery (audio, tap, scroll, Continue);
// /commissioners-office end-to-end (both parts). Menu open/close + scroll-hide on chapters.
import { launch, ctx, watch, shot, sleep, save, BASE, VPS } from "./juror1-lib.mjs";

const browser = await launch();
const R = { arrival: {}, read: {}, ch2: {} };

async function sectionShots(page, tag, sel = "section[id],header#hero,footer") {
  const ids = await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.id || e.tagName.toLowerCase()), sel);
  const out = [];
  for (const id of ids) {
    const ok = await page.evaluate((id) => { const e = document.getElementById(id) || document.querySelector(id); if (!e) return false; e.scrollIntoView({ block: "start", behavior: "instant" }); return true; }, id);
    if (!ok) continue;
    await sleep(900);
    out.push(await shot(page, `${tag}-${id}`));
  }
  return out;
}

// ---- Arrival at all six
for (const [k, vp] of Object.entries(process.env.SKIP_ARRIVAL ? {} : VPS)) {
  for (const route of ["/bakery", "/barbershop"]) {
    const c = await ctx(browser, vp);
    const page = await c.newPage();
    const log = watch(page);
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await sleep(1500);
    const info = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Open menu"]');
      const br = b?.getBoundingClientRect();
      const h1 = document.querySelector("h1");
      const r = h1?.getBoundingClientRect();
      return { burger: br && { x: Math.round(br.x), y: Math.round(br.y), w: Math.round(br.width) }, h1: h1?.textContent.trim(), h1y: r && Math.round(r.y), h1lines: (() => { const rg = document.createRange(); rg.selectNodeContents(h1); return new Set([...rg.getClientRects()].map((x) => Math.round(x.top))).size; })() };
    });
    await shot(page, `arrive${route.replace("/", "-")}-${k}`);
    R.arrival[`${route}-${k}`] = { ...info, log: log.filter((l) => !/ERR_ABORTED/.test(l)) };
    await c.close();
  }
}

// ---- Full read of /bakery at 390, 768, 1440
for (const k of (process.env.SKIP_READ ? [] : ["p390", "t768", "d1440"])) {
  const vp = VPS[k];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await page.goto(BASE + "/bakery", { waitUntil: "networkidle" });
  await sleep(1200);
  const rec = { steps: [] };
  // scroll to story, play
  await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ behavior: "instant" }));
  await sleep(1000);
  await shot(page, `read-bakery-${k}-01-scene`);
  const play = page.locator('button[aria-label^="Play narration"]').first();
  await play.click();
  await sleep(4000);
  const a1 = await page.evaluate(() => { const a = document.querySelector("audio"); return { t: a?.currentTime, paused: a?.paused, hl: document.querySelector(".narration-active, [data-active], .is-active")?.textContent?.slice(0, 60) }; });
  rec.steps.push({ afterPlay: a1 });
  await shot(page, `read-bakery-${k}-02-playing`);
  // tap the 3rd paragraph in the story
  const paras = page.locator("#scene-0 p.t-prose");
  const n = await paras.count();
  rec.paras = n;
  if (n > 2) {
    await paras.nth(2).scrollIntoViewIfNeeded();
    await sleep(500);
    await paras.nth(2).click();
    await sleep(1500);
    const a2 = await page.evaluate(() => { const a = document.querySelector("audio"); return { t: a?.currentTime, paused: a?.paused }; });
    rec.steps.push({ afterTap: a2 });
    await shot(page, `read-bakery-${k}-03-tapped`);
  }
  // scroll away — mini-player?
  await page.evaluate(() => window.scrollBy(0, innerHeight * 1.6));
  await sleep(1200);
  const mini = await page.evaluate(() => {
    const els = [...document.querySelectorAll("*")].filter((e) => { const cs = getComputedStyle(e); return cs.position === "fixed" && e.getBoundingClientRect().width > 0 && !e.id.startsWith("curtain"); });
    return els.map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName}.${(e.className || "").toString().slice(0, 50)} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${e.textContent.trim().slice(0, 40)}"`; });
  });
  rec.fixedAfterScroll = mini;
  await shot(page, `read-bakery-${k}-04-mini`);
  // section shots
  rec.sections = await sectionShots(page, `read-bakery-${k}`);
  // onward: mini collapsed?
  await page.evaluate(() => document.getElementById("onward")?.scrollIntoView({ behavior: "instant" }));
  await sleep(1500);
  rec.fixedAtOnward = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0 && !e.id.startsWith("curtain")).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${e.textContent.trim().slice(0, 40)}"`; }));
  await shot(page, `read-bakery-${k}-05-onward`);
  // footer
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(1200);
  await shot(page, `read-bakery-${k}-06-footer`);
  // Continue → next chapter; capture a few frames
  const cont = page.locator("a.btn-solid", { hasText: /continue/i }).first();
  await cont.scrollIntoViewIfNeeded();
  await sleep(600);
  const frames = [];
  await cont.click({ noWaitAfter: true });
  const t0 = Date.now();
  for (let i = 0; i < 14; i++) { await sleep(120); frames.push(await shot(page, `read-bakery-${k}-07-cont-f${String(i).padStart(2, "0")}`)); }
  await page.waitForLoadState("networkidle").catch(() => {});
  await sleep(1500);
  rec.afterContinue = { url: page.url(), title: await page.title(), ms: Date.now() - t0 };
  await shot(page, `read-bakery-${k}-08-next`);
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R.read[k] = rec;
  save("chapters-read.json", R.read);
  await c.close();
}

// ---- Ch2 end to end at 390 and 1440
for (const k of ["p390", "d1440"]) {
  const vp = VPS[k];
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await page.goto(BASE + "/commissioners-office", { waitUntil: "networkidle" });
  await sleep(1200);
  const rec = {};
  rec.order = await page.evaluate(() => [...document.querySelectorAll("main section[id], main header[id]")].map((e) => e.id));
  rec.spine = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].slice(0, 6).map((a) => a.textContent.trim().replace(/\s+/g, " ")));
  rec.sections = await sectionShots(page, `ch2-${k}`);
  // play part 1, scroll to part 2, play part 2 → only one mini visible
  const plays = page.locator('button[aria-label^="Play narration"], button[aria-label^="Pause narration"]');
  rec.players = await plays.count();
  await page.evaluate(() => document.getElementById("scene-0")?.scrollIntoView({ behavior: "instant" }));
  await sleep(600);
  await plays.nth(0).click();
  await sleep(2500);
  await page.evaluate(() => document.getElementById("scene-1")?.scrollIntoView({ behavior: "instant" }));
  await sleep(1200);
  await shot(page, `ch2-${k}-pt2-with-pt1-playing`);
  await plays.nth(1).click();
  await sleep(2500);
  rec.audio = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ t: a.currentTime, paused: a.paused })));
  await page.evaluate(() => window.scrollBy(0, innerHeight * 1.5));
  await sleep(1200);
  rec.fixed = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 0 && !e.id.startsWith("curtain")).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName} @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} "${e.textContent.trim().slice(0, 40)}"`; }));
  await shot(page, `ch2-${k}-mini-after-pt2`);
  rec.log = log.filter((l) => !/ERR_ABORTED/.test(l));
  R.ch2[k] = rec;
  await c.close();
}

save("chapters.json", R);
console.log(JSON.stringify(R, null, 1));
await browser.close();
