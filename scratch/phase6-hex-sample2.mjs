import sharp from "sharp";
const jobs = [
  ["docs/qa/phase6-vd/map--1440.png", [
    ["pill bg right-pad (Gilbert Mansion)", 852, 409],
    ["pill bg above text", 745, 398],
    ["chip solid", 722, 404],
    ["pill border top", 786, 392],
    ["title chip bg left-pad", 35, 43],
    ["Take walk btn bg corner", 582, 860],
    ["See Troy outline btn interior", 750, 860],
  ]],
  ["docs/qa/phase6-vd/bakery--1440--scroll2.png", [
    ["Continue btn bg low-left", 450, 700],
    ["Get Directions interior (outline)", 790, 700],
    ["embed border left", 385, 367],
    ["embed border left+1", 386, 367],
  ]],
  ["docs/qa/phase6-vd/map--390.png", [
    ["pill bg (Gilbert Mansion) right-pad", 300, 385],
    ["chip (3)", 210, 381],
  ]],
];
for (const [file, pts] of jobs) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * info.channels;
    return "#" + [data[i], data[i+1], data[i+2]].map(v => v.toString(16).padStart(2, "0")).join(""); };
  console.log("== " + file);
  for (const [name, x, y] of pts) console.log(`  ${name} @(${x},${y}): ${px(x, y)}`);
}
