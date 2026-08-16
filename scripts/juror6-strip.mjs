// Full-page filmstrip at a viewport for a route (no audio), plus contact sheet.
import { launch, ctx, VPS, goto, shot, watch, sleep, OUT } from "./juror6-lib.mjs";
import { execSync } from "node:child_process";
const vpName = process.argv[2] || "d1440";
const route = process.argv[3] || "/bakery";
const vp = VPS[vpName];
const slug = route.replace(/\//g, "") || "home";
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
await goto(page, route);
await sleep(1800);
await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
let n = 0; const files = [];
for (let y = 0; y < docH; y += Math.round(vp.height * 0.9)) {
  await page.evaluate((y) => scrollTo(0, y), y); await sleep(650);
  files.push(await shot(page, `strip-${slug}-${vpName}-${String(n++).padStart(2, "0")}`));
}
console.log("docH", docH, "frames", n, "errors", log.errors, "failed", log.failed.filter(f => !/mp3|pbf/.test(f)));
await browser.close();
execSync(`python3 scripts/juror6-contact.py ${JSON.stringify(OUT + "/strip-" + slug + "-" + vpName + "-*.png")} ${JSON.stringify(OUT + "/contact-" + slug + "-" + vpName + ".png")} ${vp.width} ${vp.height}`, { stdio: "inherit" });
