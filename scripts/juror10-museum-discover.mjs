import { launch, ctx, VIEWPORTS, BASE, sleep, shot } from "./juror10-lib.mjs";
const browser = await launch();
const c = await ctx(browser, VIEWPORTS.d1440);
const page = await c.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE ERR", m.text().slice(0, 200)); });
await page.goto(BASE + "/paintings", { waitUntil: "networkidle" });
await sleep(4000);
const info = await page.evaluate(() => {
  const m = window.__museum;
  const keys = m ? Object.keys(m) : null;
  let state = null; try { state = JSON.stringify(m?.state, (k, v) => typeof v === "number" ? +v.toFixed(3) : v).slice(0, 800); } catch (e) { state = String(e); }
  let rect0 = null; try { rect0 = m?.paintingRect?.(0); } catch (e) { rect0 = String(e); }
  const floats = [...document.querySelectorAll("#museum-slot *")].filter((e) => { const cs = getComputedStyle(e); return (cs.position === "fixed" || cs.position === "absolute") && e.getBoundingClientRect().width > 8 && e.getBoundingClientRect().height > 8 && (e.textContent || "").trim() && e.children.length < 6; }).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName}.${(e.className || "").toString().slice(0, 40)} "${e.textContent.trim().slice(0, 50)}" @${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  return { keys, state, rect0, floats: floats.slice(0, 30), scrollY, docH: document.body.scrollHeight, slot: document.querySelector("#museum-slot")?.getBoundingClientRect().toJSON() };
});
console.log(JSON.stringify(info, null, 1));
await shot(page, "museum-discover-1440");
await browser.close();
