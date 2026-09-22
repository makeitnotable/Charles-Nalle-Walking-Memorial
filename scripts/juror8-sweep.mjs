// Sweep the five chapters at one viewport: hero, first story opening (drop cap), moral heading, onward embed, footer with mini latched
import { launch, ctx, VPS, watch, shot, sleep, go, save, floating } from "./juror8-lib.mjs";
const key = process.argv[2] || "t768";
const routes = (process.argv[3] || "/bakery,/commissioners-office,/mansion,/ferry,/barbershop").split(",");
const vp = VPS[key];
const out = {};
const browser = await launch();
for (const route of routes) {
  const tag = `${route.replace("/", "")}-${key}`;
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await go(page, route, 2500);
  await shot(page, `sw-${tag}-hero`);
  const o = { log };
  // opening drop cap
  const first = page.locator("#scene-0 p.t-prose").first();
  await first.scrollIntoViewIfNeeded(); await page.evaluate(() => scrollBy(0, -140)); await sleep(900);
  await shot(page, `sw-${tag}-open`);
  // moral heading(s)
  const heads = page.locator("h2[id^='moral'][id$='heading']");
  const hn = await heads.count();
  for (let i = 0; i < hn; i++) {
    const h = heads.nth(i);
    await h.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await sleep(1400);
    await shot(page, `sw-${tag}-moral${i}`);
    o[`moral${i}`] = await h.evaluate((el) => {
      const sec = el.closest("section");
      const body = sec.querySelector("p.t-prose");
      const cs = getComputedStyle(el), bs = getComputedStyle(body);
      const boxes = [...el.querySelectorAll(".line-box")].map((b) => getComputedStyle(b).overflow);
      return { text: el.textContent.trim(), hColor: cs.color, bColor: bs.color, bodySample: body.textContent.trim().slice(0, 40), lineBoxOverflow: boxes };
    });
  }
  // onward embed after some wait
  const onward = page.locator("#onward");
  await onward.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await sleep(4000);
  await shot(page, `sw-${tag}-onward`);
  o.embed = await page.evaluate(() => {
    const em = document.querySelector("#onward .mapboxgl-map, #onward canvas");
    const markers = [...document.querySelectorAll("#onward .mapboxgl-marker, #onward [class*=marker], #onward [class*=pill], #onward [class*=chip]")].map((m) => ({ cls: m.className.toString().slice(0, 50), txt: m.textContent.trim().slice(0, 30), r: m.getBoundingClientRect().toJSON() }));
    return { hasMap: !!em, markers };
  });
  // play audio (first player), then go to footer
  const play = page.locator("button[aria-label^='Play narration']").first();
  await play.scrollIntoViewIfNeeded(); await sleep(400);
  const pb = await play.boundingBox();
  await page.mouse.click(pb.x + pb.width / 2, pb.y + pb.height / 2);
  await sleep(1500);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await sleep(1500);
  await shot(page, `sw-${tag}-footer-mini`);
  o.footerFloating = await floating(page);
  o.audio = await page.evaluate(() => [...document.querySelectorAll("audio")].map((a) => ({ paused: a.paused, t: a.currentTime })));
  out[route] = o;
  await c.close();
}
await browser.close();
save(`sweep-${key}.json`, out);
console.log(JSON.stringify(out, null, 1));
