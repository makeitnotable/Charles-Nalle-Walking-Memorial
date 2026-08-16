// node juror5-crop.mjs <png> <top> <height> [out]
import sharp from "sharp";
import path from "node:path";
const [, , file, top, height, out] = process.argv;
const img = sharp(file);
const meta = await img.metadata();
const t = Math.max(0, Math.min(parseInt(top), meta.height - 1));
const h = Math.min(parseInt(height), meta.height - t);
const dest = out || file.replace(/\.png$/, `-crop${t}.png`);
await img.extract({ left: 0, top: t, width: meta.width, height: h }).toFile(dest);
console.log(dest, meta.width, meta.height);
