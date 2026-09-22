// contact sheet: node scripts/juror4-sheet.mjs out.png maxCellW file1.png file2.png ...
import sharp from "sharp";
import path from "node:path";
const [out, cellWArg, ...files] = process.argv.slice(2);
const cellW = Number(cellWArg) || 480;
const cols = Math.min(files.length, 3);
const metas = [];
for (const f of files) {
  const m = await sharp(f).metadata();
  const scale = Math.min(1, cellW / m.width);
  metas.push({ f, w: Math.round(m.width * scale), h: Math.round(m.height * scale) });
}
const cellH = Math.max(...metas.map((m) => m.h)) + 24;
const rows = Math.ceil(files.length / cols);
const comps = [];
for (let i = 0; i < metas.length; i++) {
  const m = metas[i];
  const buf = await sharp(m.f).resize(m.w, m.h).png().toBuffer();
  const x = (i % cols) * (cellW + 12), y = Math.floor(i / cols) * cellH;
  comps.push({ input: buf, left: x, top: y + 20 });
  const label = Buffer.from(`<svg width="${cellW}" height="20"><text x="2" y="15" font-size="13" font-family="sans-serif" fill="#fff">${path.basename(m.f)}</text></svg>`);
  comps.push({ input: label, left: x, top: y });
}
await sharp({ create: { width: cols * (cellW + 12), height: rows * cellH, channels: 3, background: "#444" } }).composite(comps).png().toFile(out);
console.log("wrote", out);
