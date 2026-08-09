import { useCallback, useEffect, useRef, useState } from "react";
/**
 * TYPES ONLY. The Mapbox runtime is 486 KB of script and ~14.5 seconds of CPU
 * on the throttled mobile profile — and as a static import it sat in this
 * island's eager bundle, so nothing on /map could paint until the whole thing
 * had downloaded and parsed. It is now loaded as its own chunk from the
 * lifecycle effect below. A `import type` is erased at build time and costs
 * nothing. The stylesheet stays static: it is small, and check-css.mjs guards
 * island CSS being present at first paint.
 */
import type * as MapboxGL from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { playCover } from "../lib/curtain";
import ROUTE from "../data/route.json";

/**
 * The Walk — approved map experience (signature #4), rebuilt to spec:
 * chrome-free tilted overview (15.25 / pitch 33 / bearing 10, fenced to
 * downtown Troy), stem-and-dot Poppins pill markers with exact state values,
 * bottom overlap-carousel (two-tap: focus, then navigate via curtain), camera
 * follows the carousel debounced 150ms, selection flyTo zoom 20 (speed .6,
 * curve 1.4), back button easeTo overview 2s.
 *
 * Elevation layers (docs/ELEVATION-PLAN.md M3–M8): cinematic overview
 * prologue (skippable by touch), self-drawing route, guided flythrough,
 * the 1860 painting lens, geolocate + dismissible hint, deep-linkable
 * ?stop= states. Reduced motion: every camera move is a cut, route draws
 * instantly, the tour steps.
 */

/** Applied to the Mapbox runtime once it lands (see the lifecycle effect). */
const TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE = "mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft";

const OVERVIEW = {
  center: [-73.6948, 42.7235] as [number, number],
  zoom: 15.25,
  pitch: 33,
  bearing: 10,
};
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-73.73, 42.7],
  [-73.65, 42.75],
];

/* Stem direction is now DATA (`pinPosition` in the chapter JSON), not a
 * hardcoded label match. The old `PIN_ABOVE = new Set(["Commissioner's
 * Office"])` broke silently the moment a name changed — and names changed. */

const MARKER = {
  active: {
    scale: 0.9,
    bg: "#F26835",
    text: "#1D1411", /* dark on orange — 5.0:1; the light ink measured 2.35:1 */
    border: "#F26835",
    line: "#F26835",
  },
  inactive: {
    scale: 0.8,
    bg: "#4A1B0A",
    text: "#FF9770",
    border: "#80412B",
    line: "#80412B",
  },
};

export interface Stop {
  /** Canonical name — cards, aria-labels, curtain. */
  canonical?: string;
  /** Pixel nudge at the overview camera so all five pills can keep names. */
  pinOffset?: [number, number];
  slug: string;
  order: number;
  label: string;
  cardTitle: string;
  address: string;
  coordinates: [number, number];
  plaque: boolean;
}

interface Props {
  stops: Stop[];
  baseUrl: string;
}

/** The pill ladder (approved): label 12→15→18, padding 8→10→12 at md/lg —
 * legacy markers carried real responsive classes; inline styles must ladder
 * by viewport and re-render on resize. */
/* The meta unit does not scale with the viewport — the pill adopts it. */
function pillSizes() {
  const w = typeof window === "undefined" ? 390 : window.innerWidth;
  return { font: w >= 1200 ? 13 : 12, lh: 18, pad: 9 };
}

/** Approved marker: Poppins pill + 20px numbered chip + 2×30px stem + 8px
 * dot, above/below per stop. Pure inline styles — utility scanning can never
 * break these. */
function markerHtml(stop: Stop, active: boolean): string {
  const s = active ? MARKER.active : MARKER.inactive;
  const z = pillSizes();
  const [dx, dy] = stop.pinOffset ?? [0, -46];

  /* On a 390px screen a named pill is up to 210px wide and hangs off its dot on
   * a leader line, so five of them a few blocks apart cannot all stay inside the
   * viewport — the audit found three of five clipped before anything was even
   * opened, and naming only the ACTIVE one still ran stop 1 off the right edge.
   * Below 640px every marker is a numbered chip, which cannot be clipped and
   * cannot collide. The names live where there is room for them: the arrival
   * plate when a stop is chosen, and the typographic index below the map. */
  const narrow =
    typeof window !== "undefined" &&
    (window.innerWidth < 640 || window.innerHeight < 560);
  if (narrow) {
    /* The chip sits ON the coordinate, with no leader line. pinOffset exists to
       move a NAME clear of its neighbours at the desktop camera — carried over
       to chips it did the opposite: stop 3's offset pushes down and stop 4's
       pushes up, so on a landscape phone the two chips met in the middle and
       overlapped by 18x11px. Dots blocks apart cannot collide; nudged labels
       can.

       Two chips DO sit close on a phone — the Commissioner's Office and the
       Barbershop are 22px apart at the overview camera, because they are one
       block apart in Troy. That is the map telling the truth, and it is why
       the chip is 24px with a dark ring rather than 28px: two rings touching
       read as two adjacent stops, which is what they are. Separating them
       would make the map less accurate, not more.

       P0-5 (juror pass 1): five anonymous dots was the price of that fix —
       so the ACTIVE chip carries its name on a pill above it. One name at a
       time cannot collide with anything; the other four are one tap from
       being named, and the full index sits directly below the map. */
    const name = active
      ? `<div style="position:absolute;left:0;top:-18px;transform:translate(-50%,-100%);padding:5px 10px;border-radius:20px;background:color-mix(in srgb, var(--color-primary-2) 88%, transparent);border:1px solid var(--color-primary-7);white-space:nowrap">
           <p style="margin:0;font-size:11px;line-height:1.2;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-primary-11);font-family:var(--font-chrome),serif">${stop.label}</p>
         </div>`
      : "";
    return `
    <div style="position:relative;width:0;height:0;cursor:pointer">
      ${name}
      <div aria-label="${stop.label}" style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:${s.bg};color:${s.text};border:1.5px solid ${s.border};box-shadow:0 0 0 2px var(--color-primary-2)">
        <p style="font-size:12px;margin:0;line-height:1;font-weight:700;font-family:var(--font-chrome),serif">${stop.order}</p>
      </div>
    </div>`;
  }

  /* Five labelled pills inside a few blocks collide at the overview camera.
   * The first fix nudged the whole marker sideways, which moved the DOT off
   * the real coordinate and left what read as an orphaned orange stub. The dot
   * now stays exactly on Brian's pin and the pill is offset on a leader line —
   * how a cartographer would do it. `pinOffset` is per-stop in the JSON. */
  return `
    <div style="position:relative;width:0;height:0;cursor:pointer">
      <svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="1" height="1" aria-hidden="true">
        <line x1="0" y1="0" x2="${dx}" y2="${dy}" stroke="${s.line}" stroke-width="1.5" stroke-linecap="round"></line>
      </svg>
      <div style="position:absolute;left:-4.5px;top:-4.5px;width:9px;height:9px;border-radius:9999px;background:${s.line};border:1.5px solid var(--color-primary-2)"></div>
      <div style="position:absolute;left:${dx}px;top:${dy}px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;padding:${z.pad}px;border-radius:30px;background:${s.bg};color:${s.text};border:1px solid ${s.border};font-family:var(--font-chrome),serif;font-weight:500;white-space:nowrap;transition:background var(--dur-fast) var(--ease)">
        <div style="display:flex;align-items:center;justify-content:center;border-radius:9999px;margin-right:7px;background:#E45B27;width:20px;height:20px;flex:none">
          <p style="color:#1D1411;font-size:11px;margin:0;line-height:1;font-weight:600">${stop.order}</p>
        </div>
        <p style="font-size:${z.font}px;line-height:${z.lh}px;margin:0;letter-spacing:0.06em;text-transform:uppercase">${stop.label}</p>
      </div>
    </div>`;
}

/**
 * THE ROUTE — real walking geometry, not a straight line.
 *
 * This used to interpolate 60 points between each pair of coordinates, which
 * drew the "walk" as four straight chords: it crossed the Hudson twice, cut
 * diagonally through city blocks and the rail yard, and followed no street. On
 * a site whose whole premise is *walk these five stops in Troy*, the line on
 * the map was factually wrong.
 *
 * `src/data/route.json` is Mapbox Directions walking geometry for the five
 * stops in plaque order — 125 points, 3,979m, about 47 minutes. Regenerate it
 * with `node scripts/build-route.mjs`.
 */
const routeLine = ROUTE.coordinates as [number, number][];

export default function TroyMap({ stops, baseUrl }: Props) {
  const hasToken = Boolean(TOKEN);
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxGL.Map | null>(null);
  const markersRef = useRef<{ marker: MapboxGL.Marker; stop: Stop }[]>([]);
  /** The Mapbox runtime, once its chunk has landed. Null until then. */
  const glRef = useRef<typeof MapboxGL.default | null>(null);

  useEffect(() => {
    // The server-rendered placeholder is a first-paint device; left in the DOM
    // it kept overlapping live markers after hydration.
    document.getElementById("map-placeholder")?.remove();
  }, []);

  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lens, setLens] = useState(false);
  /** Latches true the first time the 1858 lens opens — see the <figure> below. */
  const [lensSeen, setLensSeen] = useState(false);

  /* ——— The 1858 map viewer (Kathy, 8/7: "do not crop allow pan and zoom") ———
   * Pure ref state: the transform mutates the <img> node directly so a 60fps
   * drag never re-renders this (large) island. Scale 1 = the whole plate
   * fitted; 6 ≈ street-name legibility on the 4096px asset. */
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const lensImgRef = useRef<HTMLImageElement>(null);
  const lensView = useRef({ s: 1, tx: 0, ty: 0 });
  const lensPointers = useRef(new Map<number, { x: number; y: number }>());
  const lensPinch = useRef(0);

  const lensApply = useCallback(() => {
    const img = lensImgRef.current;
    const box = lensBoxRef.current;
    if (!img || !box) return;
    const v = lensView.current;
    const maxX = (box.clientWidth * (v.s - 1)) / 2;
    const maxY = (box.clientHeight * (v.s - 1)) / 2;
    v.tx = Math.max(-maxX, Math.min(maxX, v.tx));
    v.ty = Math.max(-maxY, Math.min(maxY, v.ty));
    img.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.s})`;
  }, []);

  /** Zoom keeping the container-relative point (px,py — offsets from center) fixed. */
  const lensZoomAt = useCallback(
    (factor: number, px = 0, py = 0) => {
      const v = lensView.current;
      const next = Math.max(1, Math.min(6, v.s * factor));
      const ratio = next / v.s;
      v.tx = px - (px - v.tx) * ratio;
      v.ty = py - (py - v.ty) * ratio;
      v.s = next;
      lensApply();
    },
    [lensApply],
  );
  const lensZoomBy = useCallback((f: number) => lensZoomAt(f), [lensZoomAt]);
  const lensReset = useCallback(() => {
    lensView.current = { s: 1, tx: 0, ty: 0 };
    lensApply();
  }, [lensApply]);

  const lensCenterOffset = (e: { clientX: number; clientY: number }) => {
    const r = lensBoxRef.current?.getBoundingClientRect();
    if (!r) return { px: 0, py: 0 };
    return { px: e.clientX - (r.left + r.width / 2), py: e.clientY - (r.top + r.height / 2) };
  };

  const lensPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    /* Capturing here would steal the subsequent click from the +/−/reset
       buttons (a captured pointerup retargets the click) — let them be. */
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lensPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (lensPointers.current.size === 2) {
      const [a, b] = [...lensPointers.current.values()];
      lensPinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
    e.currentTarget.style.cursor = "grabbing";
  }, []);

  const lensPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const pts = lensPointers.current;
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      if (pts.size === 1) {
        lensView.current.tx += cur.x - prev.x;
        lensView.current.ty += cur.y - prev.y;
        pts.set(e.pointerId, cur);
        lensApply();
        return;
      }
      pts.set(e.pointerId, cur);
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (lensPinch.current > 0) {
          const mid = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
          const { px, py } = lensCenterOffset(mid);
          lensZoomAt(dist / lensPinch.current, px, py);
        }
        lensPinch.current = dist;
      }
    },
    [lensApply, lensZoomAt],
  );

  const lensPointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    lensPointers.current.delete(e.pointerId);
    lensPinch.current = 0;
    if (lensPointers.current.size === 0) e.currentTarget.style.cursor = "grab";
  }, []);

  const lensDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { px, py } = lensCenterOffset(e);
      if (lensView.current.s > 1.05) lensReset();
      else lensZoomAt(2.5, px, py);
    },
    [lensReset, lensZoomAt],
  );

  const lensKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const v = lensView.current;
      const pan = 48;
      if (e.key === "+" || e.key === "=") lensZoomAt(1.5);
      else if (e.key === "-" || e.key === "_") lensZoomAt(1 / 1.5);
      else if (e.key === "0") lensReset();
      else if (e.key === "ArrowLeft") { v.tx += pan; lensApply(); }
      else if (e.key === "ArrowRight") { v.tx -= pan; lensApply(); }
      else if (e.key === "ArrowUp") { v.ty += pan; lensApply(); }
      else if (e.key === "ArrowDown") { v.ty -= pan; lensApply(); }
      else return;
      e.preventDefault();
    },
    [lensApply, lensReset, lensZoomAt],
  );

  /* Wheel must be non-passive to preventDefault (page zoom/scroll), and React
   * won't attach it that way — bind natively once the viewer mounts. */
  useEffect(() => {
    const box = lensBoxRef.current;
    if (!box || !lensSeen) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { px, py } = lensCenterOffset(e);
      lensZoomAt(Math.exp(-e.deltaY * 0.0018), px, py);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [lensSeen, lensZoomAt]);
  const [touring, setTouring] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [arrivalStop, setArrivalStop] = useState<Stop | null>(null);
  const tourAbort = useRef(false);
  const flyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedRef = useRef(false);
  focusedRef.current = focused;
  const touringRef = useRef(false);
  touringRef.current = touring;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const activeLabelRef = useRef<string | null>(null);
  const setMarkers = useCallback((activeLabel: string | null, force = false) => {
    /* Item 14: only the two markers whose state actually changed re-render —
       rewriting all five innerHTMLs on every carousel settle was layout work
       the camera animation had to share a frame with. `force` re-renders all
       (breakpoint changes re-ladder every pill). */
    const prev = activeLabelRef.current;
    activeLabelRef.current = activeLabel;
    for (const { marker, stop } of markersRef.current) {
      const isActive = stop.label === activeLabel;
      if (force || isActive || stop.label === prev) {
        marker.getElement().innerHTML = markerHtml(stop, isActive);
      }
      /* The active stop's name plate must ride ABOVE neighbouring chips —
         stop 5 sat on the Commissioner's Office label during the walk
         (juror pass 3 P1). Mapbox stacks markers by DOM order; z wins. */
      marker.getElement().style.zIndex = isActive ? "30" : "";
    }
  }, []);

  // Pills re-render on breakpoint change so the ladder holds live
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setMarkers(activeLabelRef.current, true), 200);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMarkers]);

  // The fixed carousel belongs to the map: when the map shell scrolls away
  // (reading the index below), the cards step aside.
  const [shellVisible, setShellVisible] = useState(true);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShellVisible(e.intersectionRatio > 0.25),
      { threshold: [0, 0.25, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** The approved tilt, framed so all five pills fit at any viewport: fit
   * bounds, capped at the approved zoom 15.25 (wide screens render the
   * approved overview exactly; narrow ones pull back just enough). */
  const overviewCamera = useCallback(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    /* `map` only exists once the runtime has landed, so `gl` is non-null
       wherever `map` is — the guard is belt-and-braces for the type. */
    if (!map || !gl) return OVERVIEW;
    const b = new gl.LngLatBounds();
    stops.forEach((s) => b.extend(s.coordinates));
    /* The padding has to clear the LABELS, not the dots. A named pill runs up
       to ~210px and hangs off its coordinate on a leader line, so 48px of side
       padding let three of five labels fall off the screen at 390. */
    const w = window.innerWidth;
    const h = window.innerHeight;
    /* "Tight" is the same test the markers use to drop to numbered chips: a
       narrow screen OR a short one. Both get the chip treatment and both need
       the camera floor, because a chip sits ON its coordinate and two
       coordinates only stay apart if the zoom keeps them apart. */
    const short = h < 560;
    const tight = w < 640 || short;
    const side = w < 640 ? 56 : short ? 80 : w < 1024 ? 120 : 190;
    const cam = map.cameraForBounds(b, {
      padding: short
        ? { top: 56, bottom: 132, left: side, right: side }
        : { top: 132, bottom: 200, left: side, right: side },
      bearing: OVERVIEW.bearing,
    });
    /* A phone held sideways gives the map 390px of height for five stops and a
       control bar. Fitting all five into it drives the zoom low enough that the
       markers themselves start touching — the two closest stops overlapped by
       24x23px. Below this floor the walk stops being legible as a walk, so the
       camera holds the floor and the visitor pans; the full list of five is
       directly below the map either way. */
    return cam
      ? {
          center: cam.center as [number, number],
          // A tight viewport simply holds the approved overview zoom rather
          // than pulling back below it. Fitting five stops into 390px of height
          // drove the zoom low enough that the two closest markers touched;
          // 15.25 is the widest camera at which the walk still reads as a walk,
          // and the full list of five sits directly below the map regardless.
          zoom: tight
            ? OVERVIEW.zoom
            : Math.min(cam.zoom as number, OVERVIEW.zoom),
          pitch: OVERVIEW.pitch,
          bearing: OVERVIEW.bearing,
        }
      : OVERVIEW;
  }, [stops]);

  const flyToStop = useCallback(
    (idx: number) => {
      const map = mapRef.current;
      const stop = stops[idx];
      if (!map || !stop) return;
      /* Juror P1-6: zoom 20 framed one intersection ("a parking lot") and
         erased every other stop. 17.75 keeps the neighbouring blocks — a
         walking tour needs to see where a stop sits in the walk. P1-7: on a
         short viewport the camera lifts the stop above the card strip. */
      const lift: [number, number] = window.innerHeight < 560 ? [0, -64] : [0, 0];
      if (reduced) {
        map.jumpTo({ center: stop.coordinates, zoom: 17.75 });
      } else {
        map.flyTo({
          center: stop.coordinates,
          zoom: 17.75,
          speed: 0.6,
          curve: 1.4,
          offset: lift,
          essential: true,
        });
      }
      setMarkers(stop.label);
    },
    [stops, reduced, setMarkers],
  );

  const focusStop = useCallback(
    (idx: number) => {
      setFocused(true);
      setActiveIdx(idx);
      setHintOpen(false);
      flyToStop(idx);
      const url = new URL(location.href);
      url.searchParams.set("stop", stops[idx].slug);
      history.replaceState(null, "", url);
    },
    [flyToStop, stops],
  );

  const backToOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    tourAbort.current = true;
    setTouring(false);
    setFocused(false);
    setMarkers(null);
    const target = overviewCamera();
    if (reduced) map.jumpTo(target);
    else map.easeTo({ ...target, duration: 2000, essential: true });
    const url = new URL(location.href);
    url.searchParams.delete("stop");
    history.replaceState(null, "", url);
  }, [reduced, setMarkers, overviewCamera]);

  // ——— Map lifecycle (single instance) ———
  useEffect(() => {
    if (!hasToken || !container.current || mapRef.current) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    /**
     * The Mapbox runtime arrives as its own chunk, after this island has
     * mounted. Nothing about the experience changes — the map still loads by
     * itself with no interaction required — but the carousel, the controls and
     * the typographic index below now paint without waiting behind half a
     * megabyte of mapping engine.
     */
    void (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !container.current || mapRef.current) return;
      glRef.current = mapboxgl;
      mapboxgl.accessToken = TOKEN;

    const deepSlug = new URL(location.href).searchParams.get("stop");
    const deepIdx = stops.findIndex((s) => s.slug === deepSlug);
    const arriving = deepIdx >= 0;

    const map = new mapboxgl.Map({
      container: container.current,
      style: STYLE,
      center: OVERVIEW.center,
      zoom: reduced ? OVERVIEW.zoom : 13.75,
      pitch: reduced ? OVERVIEW.pitch : 0,
      bearing: reduced ? OVERVIEW.bearing : 0,
      maxBounds: MAX_BOUNDS,
      /* Juror P1-2: the full attribution line ran under the experience doors
         at 768. Compact mode keeps the licence a tap away without sharing
         pixels with a button. */
      attributionControl: false,
    });
    /* Bottom-LEFT: the menu FAB owns bottom-right on /map (item 10), and a
       licence mark must never sit under chrome (juror pass 1 P2). */
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    mapRef.current = map;
    map.on("load", () => map.resize());
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-left",
    );
    // Item 7: the ScaleControl is gone — it read as an "elevation counter"
    // ticking through the flights. The walk's true size is stated in type
    // under the map ("2.5 miles · about 45 minutes on foot").

    map.on("load", () => {
      // Markers
      markersRef.current = stops.map((stop) => {
        const el = document.createElement("button");
        el.type = "button";
        el.style.background = "none";
        el.style.border = "0";
        el.style.padding = "0";
        /* No stop is "active" at the overview — pre-lighting stop 1 hung its
           name pill off the right edge of a phone before anything was chosen
           (juror pass 1 P2). Focus, tour and deep-links light markers. */
        el.innerHTML = markerHtml(stop, false);
        el.setAttribute(
          "aria-label",
          `Spot ${stop.order}: ${stop.cardTitle}${stop.plaque ? "" : " (no plaque — website only)"}`,
        );
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          focusStop(stops.indexOf(stop));
        });
        // Anchor by stem direction: the dot marks the exact coordinate, the
        // pill floats above (below-pin) or hangs beneath (above-pin) — this
        // also separates stops 2 and 5, which sit ~50m apart.
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat(stop.coordinates)
          .addTo(map);
        return { marker, stop };
      });

      // The route draws itself (M5); instant under reduced motion
      const route = routeLine;
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: reduced ? route : [route[0]] },
        },
      });
      const zoomWidth = (a: number, b: number) => [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        a,
        17,
        b,
      ];
      // Casing first: it is what makes the line legible in greyscale.
      // Item 8 (W3): both colors are ramp values — casing neutral-2, line
      // primary-11 — and the pair must read plainly with color removed
      // (proof: strip.mjs --keep-imagery on /map).
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#100A06",
          "line-width": zoomWidth(8, 13) as unknown as number,
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#FF9770",
          "line-width": zoomWidth(5, 9) as unknown as number,
          "line-opacity": 1,
        },
      });
      if (!reduced) {
        let i = 1;
        const draw = () => {
          i += 5;
          (map.getSource("route") as MapboxGL.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: route.slice(0, i) },
          });
          if (i < route.length) requestAnimationFrame(draw);
        };
        setTimeout(() => requestAnimationFrame(draw), 500);
      }

      if (arriving) {
        // QR / deep-link cinematic arrival (M3): 5s ease onto the stop.
        // Skippable like every flight — any touch cuts to the destination.
        setFocused(true);
        setActiveIdx(deepIdx);
        setMarkers(stops[deepIdx].label);
        setArrivalStop(stops[deepIdx]);
        setTimeout(() => setArrivalStop(null), 5200);
        if (reduced) map.jumpTo({ center: stops[deepIdx].coordinates, zoom: 17.75, pitch: OVERVIEW.pitch, bearing: OVERVIEW.bearing });
        else
          map.easeTo({
            center: stops[deepIdx].coordinates,
            zoom: 17.75,
            pitch: OVERVIEW.pitch,
            bearing: OVERVIEW.bearing,
            duration: 5000,
            curve: 1.4,
            essential: true,
          } as Parameters<MapboxGL.Map["easeTo"]>[0]);
      } else {
        const target = overviewCamera();
        if (reduced) {
          map.jumpTo(target);
        } else {
          // Overview prologue (H4/M3): the intro film IS the live map settling
          // into the tilted overview. Any touch skips it.
          map.easeTo({ ...target, duration: 3500, essential: true });
        }
      }
      // One skip rule for every arrival flight (guardrail F1): the first
      // touch CUTS to the destination — never strands the camera mid-air.
      // (Mapbox GL emits mousedown/touchstart, not pointerdown.)
      const flightTarget = arriving
        ? {
            center: stops[deepIdx].coordinates,
            zoom: 17.75,
            pitch: OVERVIEW.pitch,
            bearing: OVERVIEW.bearing,
          }
        : overviewCamera();
      let cutDone = false;
      const cut = () => {
        if (cutDone) return;
        cutDone = true;
        if (map.isEasing()) {
          map.stop();
          map.jumpTo(flightTarget);
        }
        setHintOpen(false);
      };
      map.once("mousedown", cut);
      map.once("touchstart", cut);
      map.once("wheel", cut);
      // Once the flight lands naturally, disarm the cut
      map.once("idle", () => {
        cutDone = true;
      });

      // First visit hint (M8): inert card, dismissed by the first real map
      // gesture (persistent handlers — the flight-skip `once` handlers must
      // not be its only exit) or after 7s.
      if (!sessionStorage.getItem("cnwm-map-hint") && !arriving) {
        setHintOpen(true);
        const bye = () => {
          setHintOpen(false);
          sessionStorage.setItem("cnwm-map-hint", "1");
          map.off("mousedown", bye);
          map.off("touchstart", bye);
          map.off("dragstart", bye);
          map.off("wheel", bye);
        };
        map.on("mousedown", bye);
        map.on("touchstart", bye);
        map.on("dragstart", bye);
        map.on("wheel", bye);
        setTimeout(bye, 7000);
      }
    });

    teardown = () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
    /* Unmounted while the chunk was in flight: tear the map straight back down. */
    if (cancelled) teardown();
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  // ——— Carousel (approved overlap slider) ———
  const debouncedFly = useCallback(
    (idx: number) => {
      if (flyTimeout.current) clearTimeout(flyTimeout.current);
      flyTimeout.current = setTimeout(() => flyToStop(idx), 150);
    },
    [flyToStop],
  );

  // The slider mounts fresh each time focus begins; keen's `initial` option
  // proved unreliable with perView:auto (it landed on the wrong card — QA
  // final, defect 2), so creation force-jumps to the chosen stop.
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;
  const [sliderRef, sliderInstance] = useKeenSlider({
    slides: { perView: "auto", spacing: -20, origin: "center" },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: "auto", spacing: 16, origin: "center" } },
    },
    mode: "snap",
    initial: activeIdx,
    /* Item 14: rubberband on, and the settle rides the house curve instead of
       a linear glide — the card lands, it doesn't stop. */
    rubberband: true,
    renderMode: "performance",
    defaultAnimation: { duration: 480, easing: (t: number) => 1 - Math.pow(1 - t, 3) },
    created: (s) => {
      const target = activeIdxRef.current;
      if (s.track.details.rel !== target) {
        s.moveToIdx(target, true, { duration: 0 });
      }
    },
    slideChanged: (s) => setActiveIdx(s.track.details.rel),
    animationEnded: (s) => {
      const idx = s.track.details.rel;
      setActiveIdx(idx);
      if (!touringRef.current && focusedRef.current) debouncedFly(idx);
    },
  });

  // Keep slider in sync when focus/tour set the index programmatically.
  // The settle retry covers keen measuring slides a frame after creation.
  useEffect(() => {
    const inst = sliderInstance.current;
    if (!inst || !focused) return;
    if (inst.track.details.rel !== activeIdx) {
      inst.moveToIdx(activeIdx);
    }
    const t = setTimeout(() => {
      const i = sliderInstance.current;
      if (i && i.track.details.rel !== activeIdxRef.current) {
        i.moveToIdx(activeIdxRef.current, true, { duration: 0 });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [activeIdx, focused, sliderInstance]);

  // ——— Guided flythrough (M6) ———
  const tour = async () => {
    const map = mapRef.current;
    if (!map || touring) return;
    setTouring(true);
    setFocused(true);
    setHintOpen(false);
    tourAbort.current = false;
    for (let i = 0; i < stops.length; i++) {
      if (tourAbort.current) break;
      setActiveIdx(i);
      setMarkers(stops[i].label);
      if (reduced) {
        map.jumpTo({ center: stops[i].coordinates, zoom: 17.5 });
        await new Promise((r) => setTimeout(r, 1200));
      } else {
        map.flyTo({
          center: stops[i].coordinates,
          zoom: 17.8,
          pitch: 48,
          bearing: ((stops[i].order * 25) % 60) - 30,
          duration: 2600,
          essential: false,
        });
        await new Promise((r) => setTimeout(r, 3400));
      }
    }
    setTouring(false);
    if (!tourAbort.current) flyToStop(stops.length - 1);
  };

  const stopTour = () => {
    tourAbort.current = true;
    mapRef.current?.stop();
    setTouring(false);
  };

  const navigateToStop = (stop: Stop) => {
    playCover(
      () => {
        location.href = `${baseUrl}/${stop.slug}`;
      },
      stop.label,
      true,
    );
  };

  if (!hasToken) {
    return (
      <div className="grid min-h-[50dvh] place-items-center px-6 text-center">
        <div>
          <p className="t-meta">The interactive map is warming up</p>
          <p className="t-prose mx-auto mt-3 max-w-md">
            This build is missing its map key. Every spot on the walk is listed
            below with addresses and links to each chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-primary-2">
      <div ref={container} className="map-canvas absolute inset-0" />

      {/* 1858 lens (M7): Barton's "City of Troy, N.Y.: From actual surveys" (1858, LOC
          2016585052) — the FULL plate, blessed by Kathy in writing 8/7 ("even
          better than the 1845") with one instruction: "do not crop allow pan
          and zoom." So the lens is a viewer now: drag to pan, pinch or scroll
          to zoom, double-tap to jump in, +/−/reset buttons and arrow keys for
          everyone else. The 4096px asset (≈1MB avif) still mounts only on
          first open. The transform lives in refs and is applied directly to
          the node — panning at 60fps must not re-render the map island. */}
      <div
        className="absolute inset-0 z-10 grid place-items-center bg-black/70 p-4 transition-opacity duration-[1600ms] sm:p-10"
        style={{ opacity: lens ? 1 : 0, pointerEvents: lens ? "auto" : "none" }}
        aria-hidden={!lens}
      >
        <figure className="max-h-full">
          {lensSeen && (
            <div
              ref={lensBoxRef}
              role="application"
              aria-label="Map of Troy in 1858 — drag to pan, pinch or scroll to zoom, arrow keys to pan, plus and minus to zoom"
              tabIndex={lens ? 0 : -1}
              className="artifact relative cursor-grab overflow-hidden"
              style={{
                width: "min(92vw, 88dvh)",
                aspectRatio: "4096 / 3431",
                touchAction: "none",
              }}
              onPointerDown={lensPointerDown}
              onPointerMove={lensPointerMove}
              onPointerUp={lensPointerEnd}
              onPointerCancel={lensPointerEnd}
              onDoubleClick={lensDoubleClick}
              onKeyDown={lensKeyDown}
            >
              <picture>
                <source type="image/avif" srcSet={`${baseUrl}/media/site/troy-1858-full-4096.avif`} />
                <img
                  ref={lensImgRef}
                  src={`${baseUrl}/media/site/troy-1858-full-4096.webp`}
                  alt="Map of Troy, New York in 1858 — the full city survey: Troy, the Hudson, West Troy and Green Island"
                  draggable={false}
                  decoding="async"
                  className="h-full w-full select-none"
                  style={{ transformOrigin: "center", willChange: "transform" }}
                />
              </picture>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {(
                  [
                    ["+", "Zoom in", () => lensZoomBy(1.5)],
                    ["−", "Zoom out", () => lensZoomBy(1 / 1.5)],
                    ["⟲", "Reset view", lensReset],
                  ] as const
                ).map(([glyph, label, fn]) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    onClick={fn}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)",
                      color: "var(--color-primary-11)",
                      border: "1px solid var(--color-primary-7)",
                    }}
                  >
                    {glyph}
                  </button>
                ))}
              </div>
            </div>
          )}
          <figcaption className="t-meta mt-4 text-center">
            Troy, New York · 1858 · Library of Congress
          </figcaption>
          <p className="t-meta-body mt-2 text-center opacity-70">
            Drag to explore · pinch or scroll to zoom
          </p>
        </figure>
      </div>

      {/* Place chip (items 10/13): accurate copy only, and NEVER on screen at
          the same time as the chapter cards — two name surfaces at once was
          the collision class v5 spent a phase killing. */}
      {!(focused && shellVisible) && (
        <div className="pointer-events-none absolute top-[var(--ui-inset)] left-[var(--ui-inset)] z-20 mr-[104px]">
          <p
            className="t-meta rounded-full px-4 py-2"
            style={{ background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)" }}
          >
            Five spots · April 27, 1860
          </p>
        </div>
      )}

      {/* Arrival name plate (M10) — the flight lands on a spoken line */}
      {arrivalStop && (
        <div className="pointer-events-none absolute top-[calc(var(--ui-inset)+72px)] left-1/2 z-20 w-max max-w-[min(86vw,420px)] -translate-x-1/2">
          <div
            className="rounded-full px-6 py-3 text-center"
            style={{ background: "color-mix(in srgb, var(--color-primary-2) 88%, transparent)" }}
          >
            <p className="t-meta">Stop {arrivalStop.order} of {stops.length}</p>
            <p className="t-title-sm mt-2">
              {arrivalStop.canonical ?? arrivalStop.cardTitle}
            </p>
          </div>
        </div>
      )}

      {/* Hint card (M8) — fully inert: it can never intercept a tap anywhere.
          It leaves on the first map gesture (the gesture it teaches) or on a
          timer, whichever comes first. */}
      {hintOpen && (
        <div
          className="pointer-events-none absolute bottom-44 left-1/2 z-20 w-max max-w-[86vw] -translate-x-1/2 sm:bottom-32 [@media(max-height:560px)]:bottom-20"
          aria-hidden="true"
        >
          <div
            className="rounded-full px-4 py-2"
            style={{ background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)" }}
          >
            <p className="t-meta">Drag to explore · Tap a stop</p>
          </div>
        </div>
      )}

      {/* Back to overview */}
      {focused && !touring && (
        <button
          type="button"
          onClick={backToOverview}
          className="btn-sm btn-ghost absolute top-[calc(var(--ui-inset)+48px)] left-[var(--ui-inset)] z-20"
          style={{ background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)" }}
        >
          <svg
            className="icon icon-sm icon-filled"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ transform: "rotate(180deg)" }}
          >
            <path d="M16.42 11.35H3.3a0.65 0.65 0 000 1.3h13.12z" />
            <path d="M14.39 17.12c0.19 0.18 0.4 0.2 0.64 0.06l6.74-4.3c0.33-0.21 0.49-0.5 0.49-0.88 0-0.38-0.16-0.67-0.49-0.88l-6.74-4.3c-0.24-0.14-0.45-0.12-0.64 0.06-0.19 0.18-0.22 0.39-0.1 0.64l2.13 3.83v1.3l-2.13 3.82c-0.12 0.25-0.09 0.47 0.1 0.65z" />
          </svg>
          Back to map
        </button>
      )}

      {/* Experience doors (overview only) */}
      {!focused && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={touring ? stopTour : tour}
            className="btn btn-solid"
          >
            Take the walk
          </button>
          <button
            type="button"
            onClick={() => {
              setLensSeen(true);
              setLens((v) => !v);
            }}
            aria-pressed={lens}
            className="link-meta t-meta rounded-full px-4 py-3"
            style={{ background: "color-mix(in srgb, var(--color-primary-2) 72%, transparent)" }}
          >
            {lens ? "Back to today" : "See Troy in 1858"}
          </button>
        </div>
      )}

      {/* Stop the tour */}
      {touring && (
        <div className="absolute bottom-44 left-1/2 z-30 -translate-x-1/2 sm:bottom-52">
          <button
            type="button"
            onClick={stopTour}
            className="btn-sm btn-solid"
          >
            Stop the walk
          </button>
        </div>
      )}

      {/* ——— The overlap carousel (approved) ———
          Always mounted: keen-slider re-initialization on remount landed on
          the wrong card (QA final defect 2); a live, measured instance obeys
          moveToIdx reliably. Visibility is opacity/pointer-events only. */}
      {
        <div
          className="fixed right-0 bottom-0 left-0 z-10 pb-24 transition-opacity duration-300 sm:pb-6"
          style={{
            opacity: focused && shellVisible ? 1 : 0,
            pointerEvents: focused && shellVisible ? "auto" : "none",
          }}
          aria-hidden={!focused}
        >
          <div
            ref={sliderRef}
            className="keen-slider location-cards-slider"
            role="region"
            aria-label="Stop cards"
          >
            {stops.map((stop, index) => {
              const isActive = index === activeIdx;
              return (
                <div
                  key={stop.slug}
                  className="keen-slider__slide !min-w-[343px] !max-w-[343px] sm:!min-w-[428.75px] sm:!max-w-[428.75px] lg:!min-w-[514.5px] lg:!max-w-[514.5px]"
                >
                  <div
                    className={`origin-bottom transition-transform duration-300 ${isActive ? "scale-100" : "scale-[.92]"}`}
                  >
                    {/* Two-tap: inactive card focuses; active card navigates */}
                    <div
                      className="mx-auto flex h-[128px] w-[343px] cursor-pointer overflow-hidden rounded-xl border-2 border-primary-3 bg-primary-2 sm:h-[160px] sm:w-[428.75px] lg:h-[192px] lg:w-[514.5px]"
                      onClick={() => {
                        if (isActive) navigateToStop(stop);
                        else sliderInstance.current?.moveToIdx(index);
                      }}
                      role="button"
                      tabIndex={focused && isActive ? 0 : -1}
                      aria-label={
                        isActive
                          ? `Enter Chapter ${stop.order}: ${stop.cardTitle}`
                          : `Focus spot ${stop.order}: ${stop.cardTitle}`
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (isActive) navigateToStop(stop);
                          else sliderInstance.current?.moveToIdx(index);
                        }
                      }}
                    >
                      <div className="h-full flex-shrink-0">
                        {/* 192 CSS px at the largest = 384 device px at DPR2.
                            This used to load `square-800.webp` — 592 KB across
                            the five cards, every byte of it fetched while the
                            map itself was still loading. The 400 tier is the
                            size actually rendered (scripts/build-carousel-tier.mjs). */}
                        <picture>
                          <source
                            type="image/avif"
                            srcSet={`${baseUrl}/media/${stop.slug}/square-400.avif`}
                          />
                          <img
                            src={`${baseUrl}/media/${stop.slug}/square-400.webp`}
                            alt=""
                            width={400}
                            height={400}
                            loading="lazy"
                            decoding="async"
                            className="h-[128px] w-[128px] border-r border-primary-6 object-cover sm:h-[160px] sm:w-[160px] lg:h-[192px] lg:w-[192px]"
                          />
                        </picture>
                      </div>
                      <div className="flex h-full w-2/3 flex-col justify-between p-3">
                        <div className="m-1 flex flex-row items-center justify-between">
                          <p className="t-meta leading-none">Chapter</p>
                          {/* Dark ink on the orange chip — the cream ink
                              measured 2.75:1 (contrast sweep, P0 baseline). */}
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-10 sm:h-5 sm:w-5 lg:h-6 lg:w-6">
                            <p
                              className="mt-0.5 text-[.625rem] leading-none font-bold sm:text-[0.78125rem] lg:text-[.9375rem]"
                              style={{ fontFamily: "var(--font-chrome)", color: "#1D1411" }}
                            >
                              {stop.order}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="ml-1 text-left text-[1.125rem] leading-tight font-normal text-primary-12 sm:text-[1.40625rem] lg:text-[1.6875rem]">
                            {stop.cardTitle}
                          </p>
                          {/* Item 11: the stretched-chevron idiom dies. Only a
                              RECT is stretched (the shaft); the broadside head
                              keeps its drawing. */}
                          <div className="mr-3 ml-1 mt-2 flex flex-row items-center text-primary-11" aria-hidden="true">
                            <svg className="h-[1.3px] min-w-0 flex-1" viewBox="0 0 2 2" preserveAspectRatio="none">
                              <rect width="2" height="2" fill="currentColor" />
                            </svg>
                            <svg
                              className="-ml-px h-[11px] w-[9px] shrink-0"
                              viewBox="14.1 6.6 8.3 10.8"
                              fill="currentColor"
                            >
                              <path d="M14.39 17.12c0.19 0.18 0.4 0.2 0.64 0.06l6.74-4.3c0.33-0.21 0.49-0.5 0.49-0.88 0-0.38-0.16-0.67-0.49-0.88l-6.74-4.3c-0.24-0.14-0.45-0.12-0.64 0.06-0.19 0.18-0.22 0.39-0.1 0.64l2.13 3.83v1.3l-2.13 3.82c-0.12 0.25-0.09 0.47 0.1 0.65z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    </div>
  );
}
