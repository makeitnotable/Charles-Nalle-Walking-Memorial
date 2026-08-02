#!/usr/bin/env node
// Sample hexes from phase6-vd captures at solid-fill coordinates.
import sharp from "sharp";

const jobs = [
  ["docs/qa/phase6-vd/home--390.png", [
    ["page bg (outside frame, top)", 4, 8],
    ["hamburger bg", 343, 47],
    ["CTA Continue bg", 195, 508],
    ["frame bottom (gradient floor)", 195, 815],
  ]],
  ["docs/qa/phase6-vd/people--390.png", [
    ["page bg", 4, 420],
    ["page bg low", 195, 838],
    ["hamburger bg", 343, 47],
    ["hamburger border", 310, 47],
  ]],
  ["docs/qa/phase6-vd/map--1440.png", [
    ["pill bg (Gilbert Mansion)", 800, 409],
    ["pill chip (3)", 727, 409],
    ["title chip bg", 200, 43],
    ["Take the walk btn bg", 637, 847],
    ["map water", 520, 600],
  ]],
  ["docs/qa/phase6-vd/bakery--1440--scroll2.png", [
    ["page bg", 60, 300],
    ["Continue the walk bg", 580, 668],
    ["Get Directions bg", 888, 668],
    ["embed border row", 720, 196],
  ]],
];

for (const [file, pts] of jobs) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return "#" + [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("");
  };
  console.log("\n== " + file);
  for (const [name, x, y] of pts) console.log(`  ${name} @(${x},${y}): ${px(x, y)}`);
}
