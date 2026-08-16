import { launch, goto, shot, sleep, VIEWPORTS, log } from "./juror9-lib.mjs";
const key = process.argv[2] || "d1440";
const vp = VIEWPORTS[key];
const { browser, page, errors } = await launch(vp);
await goto(page, "/paintings", 6000);
log(await page.evaluate(() => {
  const m = window.__museum;
  if (!m) return "no __museum";
  const out = { keys: Object.keys(m) };
  try { out.state = JSON.parse(JSON.stringify(m.state)); } catch { out.state = String(m.state); }
  try { out.rect0 = m.paintingRect(0); } catch (e) { out.rect0 = String(e); }
  return out;
}));
log(await page.evaluate(() => [...document.querySelectorAll("button, a, [role=button]")].filter((b) => b.getBoundingClientRect().height > 0).map((b) => ({ t: (b.getAttribute("aria-label") || b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), r: (() => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })(), fixed: getComputedStyle(b).position }))));
await shot(page, `${key}-paintings-rest`);
log(errors);
await browser.close();
