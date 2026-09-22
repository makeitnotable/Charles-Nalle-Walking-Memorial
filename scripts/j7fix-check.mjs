import { chromium } from "playwright";
const B = "http://localhost:4321";
const out = {};
// 1) museum approach from the page top / past the end
for (const vp of [[1440,900],[1024,768],[768,1024],[1920,1080]]) {
  const b = await chromium.launch({ args: ["--use-gl=angle","--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await p.goto(B + "/paintings", { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__museum, null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const res = {};
  const probe = async (label) => {
    await p.waitForTimeout(1800);
    res[label] = await p.evaluate(() => {
      const stage = document.querySelector("canvas").closest(".sticky");
      const r = stage.getBoundingClientRect();
      const back = [...document.querySelectorAll("button")].find(b => /back to the hall/i.test(b.innerText));
      const br = back?.getBoundingClientRect();
      const pr = window.__museum.paintingRect ? window.__museum.paintingRect(window.__museum.state.approached) : null;
      return { scrollY: Math.round(scrollY), stageTop: Math.round(r.top), stageBottom: Math.round(r.bottom), H: innerHeight,
        backVisible: !!br && br.top >= 0 && br.bottom <= innerHeight, backTop: br && Math.round(br.top), paint: pr && Object.fromEntries(Object.entries(pr).map(([k,v])=>[k,Math.round(v)])) };
    });
  };
  // from the top
  await p.evaluate(() => window.__museum.approach(0));
  await probe("fromTop");
  await p.screenshot({ path: `docs/v7/qa/j7fix/museum-${vp[0]}-fromTop.png` });
  await p.evaluate(() => window.__museum.approach(null));
  await p.waitForTimeout(600);
  // past the end: scroll to the bottom of the rail + 300
  await p.evaluate(() => { const wrap = document.querySelector("canvas").closest(".sticky").parentElement; const r = wrap.getBoundingClientRect(); scrollTo({ top: scrollY + r.bottom - innerHeight + 300, behavior: "instant" }); });
  await p.waitForTimeout(800);
  await p.evaluate(() => window.__museum.approach(9));
  await probe("pastEnd");
  await p.screenshot({ path: `docs/v7/qa/j7fix/museum-${vp[0]}-pastEnd.png` });
  out["museum" + vp[0]] = res;
  await b.close();
}
console.log(JSON.stringify(out, null, 1));
