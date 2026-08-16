// QR arrival on /bakery and /barbershop at phone; discover the chapter's controls.
import { launch, ctx, VPS, goto, shot, watch, sleep, save, FLOATING_JS } from "./juror6-lib.mjs";

const vpName = process.argv[2] || "p390";
const routes = (process.argv[3] || "/bakery,/barbershop").split(",");
const vp = VPS[vpName];
const out = {};
for (const route of routes) {
  const browser = await launch();
  const c = await ctx(browser, vp);
  const page = await c.newPage();
  const log = watch(page);
  await goto(page, route);
  await sleep(1800);
  const slug = route.replace("/", "");
  await shot(page, `arrive-${slug}-${vpName}-0`);
  const d = await page.evaluate(() => {
    const rect = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const btns = [...document.querySelectorAll("button, a, [role=button]")].map(e => ({ tag: e.tagName, t: (e.getAttribute("aria-label") || e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 60), ...rect(e), vis: getComputedStyle(e).visibility, disp: getComputedStyle(e).display, op: getComputedStyle(e).opacity })).filter(b => b.w > 0 && b.h > 0);
    const heads = [...document.querySelectorAll("h1,h2,h3")].map(e => ({ tag: e.tagName, id: e.id, t: e.innerText.trim().replace(/\s+/g, " ").slice(0, 60), ...rect(e) }));
    const ids = [...document.querySelectorAll("section[id], div[id], main [id]")].map(e => e.id).filter(Boolean);
    const audio = [...document.querySelectorAll("audio")].map(a => a.currentSrc.slice(-50));
    const vid = document.querySelector("video");
    return { title: document.title, btns, heads, ids: [...new Set(ids)], audio, docH: document.documentElement.scrollHeight, video: vid ? { pos: getComputedStyle(vid).objectPosition, ...rect(vid) } : null, imgs: [...document.querySelectorAll("img")].slice(0, 3).map(i => ({ src: i.currentSrc.slice(-40), pos: getComputedStyle(i).objectPosition, ...rect(i) })) };
  });
  out[route] = { ...d, log };
  await browser.close();
}
save(`arrive-${vpName}.json`, out);
for (const [r, d] of Object.entries(out)) {
  console.log("==", r, d.title, "docH", d.docH, "video", JSON.stringify(d.video), "imgs", JSON.stringify(d.imgs));
  console.log(" ids:", d.ids.join(" "));
  console.log(" heads:", d.heads.map(h => `${h.tag}#${h.id} y${h.y} "${h.t}"`).join(" | "));
  console.log(" btns:", d.btns.map(b => `${b.tag}[${b.t}]@${b.x},${b.y} ${b.w}x${b.h} ${b.vis}/${b.op}`).join("\n   "));
  console.log(" audio:", d.audio, "errors:", d.log.errors, "failed:", d.log.failed);
}
