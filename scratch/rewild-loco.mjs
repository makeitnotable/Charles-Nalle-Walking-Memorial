import { chromium } from "playwright";
import fs from "fs";

const OUT = "docs/qa/inspiration/rewild";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://rewildyourself.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(6000);

const dom = await page.evaluate(() => {
  const container = document.querySelector("[data-scroll-container]");
  const attrs = {};
  // census of data-scroll* attributes
  document.querySelectorAll("*").forEach(el => {
    for (const a of el.attributes) {
      if (a.name.startsWith("data-scroll")) {
        const key = a.name + (a.value ? `=${a.value}` : "");
        attrs[key] = (attrs[key] || 0) + 1;
      }
    }
  });
  // sections list
  const sections = [...document.querySelectorAll("main section")].map(s => ({
    cls: s.className,
    h: Math.round(s.getBoundingClientRect().height),
    scrollAttrs: [...s.attributes].filter(a => a.name.startsWith("data-")).map(a => `${a.name}=${a.value}`),
  }));
  // sample interesting nodes with data-scroll-speed
  const speeds = [...document.querySelectorAll("[data-scroll-speed]")].slice(0, 25).map(el => ({
    tag: el.tagName, cls: String(el.className).slice(0, 60),
    speed: el.getAttribute("data-scroll-speed"),
    delay: el.getAttribute("data-scroll-delay"),
    pos: el.getAttribute("data-scroll-position"),
  }));
  return {
    containerCls: container ? container.className : null,
    containerTransform: container ? getComputedStyle(container).transform : null,
    attrCensus: attrs,
    sectionCount: sections.length,
    sections: sections.slice(0, 20),
    speedSamples: speeds,
  };
});
console.log(JSON.stringify(dom, null, 2));
await browser.close();
