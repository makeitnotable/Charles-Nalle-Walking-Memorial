// Curtain transitions: CDP screencast at 4x CPU throttle; save frames + a contact strip.
import { launch, ctx, VPS, goto, shot, watch, sleep, OUT } from "./juror6-lib.mjs";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const vpName = process.argv[2] || "p390";
const which = process.argv[3] || "continue"; // continue | card | menu
const vp = VPS[vpName];
const browser = await launch();
const c = await ctx(browser, vp);
const page = await c.newPage();
const log = watch(page);
const cdp = await c.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(process.argv[4] || 4) });
const dir = path.join(OUT, `curtain-${which}-${vpName}`); fs.mkdirSync(dir, { recursive: true });
const frames = [];
let t0 = 0;
cdp.on("Page.screencastFrame", async (ev) => {
  const t = Date.now() - t0;
  frames.push({ t, url: ev.metadata && ev.metadata.pageScaleFactor, data: ev.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
});
if (which === "continue") {
  await goto(page, "/bakery"); await sleep(1500);
  await page.addStyleTag({ content: "html{scroll-behavior:auto !important}" });
  const cont = page.locator("a:has-text('Continue')").first();
  await cont.scrollIntoViewIfNeeded(); await sleep(400);
  await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find(a => /continue/i.test(a.innerText)); const r = a.getBoundingClientRect(); scrollBy(0, r.top - innerHeight * 0.45); }); await sleep(800);
  const bb = await cont.boundingBox();
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 1000, everyNthFrame: 1 });
  t0 = Date.now(); await sleep(150);
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
} else if (which === "card") {
  await goto(page, "/map"); await sleep(5000);
  const walk = page.locator("button:has-text('Take the walk'):visible").first();
  await walk.click(); await sleep(3500);
  const enter = page.locator("[aria-label^='Enter Spot']").first();
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 1000, everyNthFrame: 1 });
  t0 = Date.now(); await sleep(150);
  await enter.click({ force: true });
} else {
  await goto(page, "/about"); await sleep(1500);
  await page.locator("button[aria-label='Open menu']").click(); await sleep(800);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 480, maxHeight: 1000, everyNthFrame: 1 });
  t0 = Date.now(); await sleep(150);
  await page.locator("nav a:has-text('People'), a:has-text('THE PEOPLE')").first().click();
}
await sleep(4500);
await cdp.send("Page.stopScreencast").catch(() => {});
console.log("frames:", frames.length, "final url:", page.url().slice(-40));
frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, "0")}-${f.t}.jpg`), Buffer.from(f.data, "base64")));
// contact strip of every 2nd frame
const py = `
import glob, os
from PIL import Image
files = sorted(glob.glob(${JSON.stringify(dir + "/f*.jpg")}), key=lambda f: int(f.split("-")[-1].split(".")[0]))
sel = files[::max(1, len(files)//36)]
ims = [Image.open(f) for f in sel]
w, h = ims[0].size
tw = 120; th = round(h * tw / w)
cols = 12; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 3), rows * (th + 16)), (30, 30, 30))
from PIL import ImageDraw
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(sel, ims)):
    x = (i % cols) * (tw + 3); y = (i // cols) * (th + 16)
    sheet.paste(im.resize((tw, th)), (x, y + 14))
    d.text((x + 2, y + 1), os.path.basename(f).split('-')[1].replace('.jpg', 'ms'), fill=(255, 200, 150))
sheet.save(${JSON.stringify(path.join(OUT, `curtain-${which}-${vpName}-strip.png`))})
print(len(files), len(sel))
`;
fs.writeFileSync(path.join(dir, "strip.py"), py);
execSync(`python3 "${path.join(dir, "strip.py")}"`, { stdio: "inherit" });
console.log("errors:", log.errors);
await browser.close();
