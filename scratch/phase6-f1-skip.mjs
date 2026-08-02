// Phase 6 FINAL live gate — F1: flight skip must CUT to destination (live GH Pages)
import { chromium } from "playwright";
import fs from "fs";
const OUT = "docs/qa/phase6-motion";
fs.mkdirSync(OUT, { recursive: true });
const LIVE = "https://makeitnotable.github.io/Charles-Nalle-Walking-Memorial";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

const errors = [];
const wire = (p, tag) => {
  p.on("pageerror", (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${tag}] console: ${m.text().slice(0, 200)}`);
  });
};

const scaleText = (p) =>
  p.evaluate(() => document.querySelector(".mapboxgl-ctrl-scale")?.textContent?.trim() ?? "(no scale ctrl)");

const handleProbe = (p) =>
  p.evaluate(() => ({
    mapboxglGlobal: typeof window.mapboxgl,
    cnwmHandles: Object.keys(window).filter((k) => /cnwm|troymap|__map/i.test(k)),
  }));

console.log("=== F1 live skip probes ===");

// ——— A. Prologue: control (no input), natural settle ———
{
  const p = await ctx.newPage();
  wire(p, "A-control");
  await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1850);
  console.log("A control @1.85s scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-control-1850ms.png` });
  await p.waitForTimeout(6150); // t=8s, fully settled
  console.log("A control @8s    scale:", await scaleText(p));
  console.log("A handle probe:", JSON.stringify(await handleProbe(p)));
  await p.screenshot({ path: `${OUT}/f1-prologue-control-8s.png` });
  await p.close();
}

// ——— B. Prologue: tap (mouse.down) at 1.5s → must be at overview within ~300ms ———
{
  const p = await ctx.newPage();
  wire(p, "B-tap");
  await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  await p.mouse.move(350, 620); // canvas, away from markers/pills/hint
  await p.mouse.down();
  await p.mouse.up();
  await p.waitForTimeout(280); // t ≈ 1.78s — inside the ~300ms window
  console.log("B tap    @+280ms scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-tap-plus280ms.png` });
  await p.waitForTimeout(2220); // t = 4s — route draw complete
  console.log("B tap    @4s     scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-tap-4s.png` });
  await p.waitForTimeout(4000); // t = 8s
  console.log("B tap    @8s     scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-tap-8s.png` });
  await p.close();
}

// ——— C. Prologue: small DRAG at 1.5s (the original stranding repro) ———
{
  const p = await ctx.newPage();
  wire(p, "C-drag");
  await p.goto(LIVE + "/map", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  await p.mouse.move(350, 620);
  await p.mouse.down();
  await p.mouse.move(370, 630, { steps: 4 });
  await p.mouse.up();
  await p.waitForTimeout(300);
  console.log("C drag   @+300ms scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-drag-plus300ms.png` });
  await p.waitForTimeout(5700); // t = 8s: must NOT be a stranded flat aerial
  console.log("C drag   @8s     scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-prologue-drag-8s.png` });
  await p.close();
}

// ——— D. Deep-link arrival /map?stop=mansion: tap at 2s → cut to street level ———
{
  const p = await ctx.newPage();
  wire(p, "D-arrival-control");
  await p.goto(LIVE + "/map?stop=mansion", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2300);
  console.log("D arrival control @2.3s scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-arrival-control-2300ms.png` });
  await p.waitForTimeout(6700); // t=9s, eased + nameplate gone
  console.log("D arrival control @9s   scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-arrival-control-9s.png` });
  await p.close();
}
{
  const p = await ctx.newPage();
  wire(p, "E-arrival-tap");
  await p.goto(LIVE + "/map?stop=mansion", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2000);
  await p.mouse.move(350, 300); // above carousel, away from pills
  await p.mouse.down();
  await p.mouse.up();
  await p.waitForTimeout(280);
  console.log("E arrival tap @+280ms scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-arrival-tap-plus280ms.png` });
  await p.waitForTimeout(6720); // t = 9s
  console.log("E arrival tap @9s     scale:", await scaleText(p));
  await p.screenshot({ path: `${OUT}/f1-arrival-tap-9s.png` });
  await p.close();
}

// ——— Pixel diff helper: tap frames vs their own settled frames ———
{
  const p = await ctx.newPage();
  const diff = async (fileA, fileB) => {
    const a = fs.readFileSync(fileA).toString("base64");
    const b = fs.readFileSync(fileB).toString("base64");
    return p.evaluate(
      async ([da, db]) => {
        const load = (d) =>
          new Promise((res) => {
            const i = new Image();
            i.onload = () => res(i);
            i.src = "data:image/png;base64," + d;
          });
        const [ia, ib] = await Promise.all([load(da), load(db)]);
        const c = document.createElement("canvas");
        c.width = ia.width;
        c.height = ia.height;
        const g = c.getContext("2d", { willReadFrequently: true });
        g.drawImage(ia, 0, 0);
        const pa = g.getImageData(0, 0, c.width, c.height).data;
        g.clearRect(0, 0, c.width, c.height);
        g.drawImage(ib, 0, 0);
        const pb = g.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 0; i < pa.length; i += 4) {
          if (
            Math.abs(pa[i] - pb[i]) > 24 ||
            Math.abs(pa[i + 1] - pb[i + 1]) > 24 ||
            Math.abs(pa[i + 2] - pb[i + 2]) > 24
          )
            n++;
        }
        return +((n / (pa.length / 4)) * 100).toFixed(2);
      },
      [a, b],
    );
  };
  console.log("\n=== pixel diffs (% pixels differing, tolerance 24/channel) ===");
  console.log("prologue tap +280ms vs tap 8s   :", await diff(`${OUT}/f1-prologue-tap-plus280ms.png`, `${OUT}/f1-prologue-tap-8s.png`), "%  (route still drawing at +280ms — small diff OK)");
  console.log("prologue tap 4s      vs tap 8s   :", await diff(`${OUT}/f1-prologue-tap-4s.png`, `${OUT}/f1-prologue-tap-8s.png`), "%  (must be ~0: camera parked)");
  console.log("prologue tap 8s      vs control 8s:", await diff(`${OUT}/f1-prologue-tap-8s.png`, `${OUT}/f1-prologue-control-8s.png`), "%  (hint card diff expected: tap dismisses it)");
  console.log("prologue control 1.85s vs control 8s:", await diff(`${OUT}/f1-prologue-control-1850ms.png`, `${OUT}/f1-prologue-control-8s.png`), "%  (mid-flight vs settled: must be LARGE)");
  console.log("arrival tap +280ms   vs tap 9s   :", await diff(`${OUT}/f1-arrival-tap-plus280ms.png`, `${OUT}/f1-arrival-tap-9s.png`), "%  (nameplate visible at +280ms — that region only)");
  console.log("arrival control 2.3s vs control 9s:", await diff(`${OUT}/f1-arrival-control-2300ms.png`, `${OUT}/f1-arrival-control-9s.png`), "%  (mid-ease vs landed: must be LARGE)");
  await p.close();
}

console.log("\nconsole/page errors:", errors.length ? errors : "none");
await browser.close();
console.log("F1 done");
