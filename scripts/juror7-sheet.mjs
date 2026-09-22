// contact sheet: node scripts/juror7-sheet.mjs out.png W a.png b.png ...
import sharp from "sharp";
import path from "node:path";
const [,, out, wStr, ...files] = process.argv;
const W = parseInt(wStr, 10);
const imgs = [];
for (const f of files) {
  const m = await sharp(f).metadata();
  const h = Math.round((m.height * W) / m.width);
  const buf = await sharp(f).resize(W, h).png().toBuffer();
  imgs.push({ buf, h, name: path.basename(f) });
}
const cols = Math.min(files.length, Math.max(1, Math.floor(1800 / W)));
const rows = Math.ceil(imgs.length / cols);
const rowH = [];
for (let r = 0; r < rows; r++) rowH.push(Math.max(...imgs.slice(r * cols, r * cols + cols).map((i) => i.h)));
const totalH = rowH.reduce((a, b) => a + b + 24, 0);
const comps = [];
let y = 0;
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const i = imgs[r * cols + c];
    if (!i) break;
    comps.push({ input: i.buf, left: c * (W + 8), top: y + 20 });
    const label = Buffer.from(`<svg width="${W}" height="20"><text x="2" y="15" font-size="13" font-family="sans-serif" fill="#000">${i.name}</text></svg>`);
    comps.push({ input: label, left: c * (W + 8), top: y });
  }
  y += rowH[r] + 24;
}
await sharp({ create: { width: cols * (W + 8), height: totalH, channels: 3, background: "#ddd" } }).composite(comps).png().toFile(out);
console.log("wrote", out);
