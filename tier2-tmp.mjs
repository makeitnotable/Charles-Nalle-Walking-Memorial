import sharp from "sharp";
const SC = process.env.SC;
const SRC = SC + "/troy1858-r1.tif";
const w = await sharp(SRC, { limitInputPixels: false }).resize({ width: 6144 }).webp({ quality: 76 }).toFile(`${SC}/t-6144.webp`);
console.log("webp", `${w.width}x${w.height}`, (w.size / 1048576).toFixed(2) + " MB");
