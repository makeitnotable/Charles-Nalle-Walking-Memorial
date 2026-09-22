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
  /* v8 V8-206 (Wil, 00:11:23): a touch more rotation — 10 read straight-on
     at the overview pitch. The label-fit search re-validates every chip. */
  bearing: 16,
};
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-73.73, 42.7],
  [-73.65, 42.75],
];
/* v7 L1 — the 1858 plate is two panels; the seam sits at 50% of its height.
   The lower panel (downtown Troy, the Hudson, West Troy) is the initial and
   reset view, filled by height and centred on the river; the upper panel is
   reached by panning (Kathy: "do not crop, allow pan and zoom"). */
/* v7 M2 — pitch candidates, steepest first; the label-fit search picks the
   first at which every marker label sits inside the safe box. */
const PITCHES = [52, 48, 44, 40, 36, 33];
/* v12 item 1 (Wil, 8/26): "on desktop and possibly tablet the pitch of the map
   should be oriented in such a way that the 3Dness… shows tastefully, making
   the map page feel a bit more alive… The map page on mobile should stay
   exactly as it is."
   The pitch was never removed — the search has always taken the steepest angle
   that still fits every label, and 52 was simply the steepest it was offered.
   So offer it more, on the WIDE branch only: 60 is Mapbox's own default
   maximum, and the fit test decides. Phones and landscape phones run the
   narrow branch below and never see this list. */
const PITCHES_WIDE = [60, 58, 56, 54, ...PITCHES];
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
  /** v8 V8-207: the phone pill's extra-short name (Bakery · Commissioner ·
   *  Mansion · Ferry · Barbershop). Falls back to `label` (= name.short). */
  pin?: string;
  cardTitle: string;
  address: string;
  coordinates: [number, number];
  plaque: boolean;
}

interface Props {
  stops: Stop[];
  baseUrl: string;
}

/** v11 item 1: how much smaller a neighbour card is than the focused one.
 *  The focused card sits at scale 1; every other card at 1 - CARD_FOCUS. */
const CARD_FOCUS = 0.08;

/** v13 V13-01 item 3: the 1858 lens's close fade. Was 1600ms — a full-viewport
 *  layer blending over the live WebGL canvas for a second and a half. Recorded
 *  in docs/v4/MOTION.md; `prefers-reduced-motion` swaps at 0ms. */
const LENS_FADE_MS = 520;

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
 * break these. v14 E1 (client): the dot is a solid, borderless disc — the
 * 1.5px primary-2 ring is gone in both variants and both states. */
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
    /* v8 V8-207 (Wil, 00:58:43): phones carry the SAME pill idiom as
       desktop — leader line, numbered chip, name — but with the extra-short
       `name.pin` (Bakery · Commissioner · Mansion · Ferry · Barbershop) at a
       smaller scale, and the desktop `pinOffset` nudges scaled to the phone
       camera. The v7 numbered dots (kept 24px so one-block neighbours read
       as neighbours) are gone at his direction; the label-fit camera search
       and the chip nudge below both model the pill's real footprint. */
    const pinLabel = stop.pin ?? stop.label;
    const pdx = Math.round((stop.pinOffset?.[0] ?? 0) * 0.62);
    const pdy = Math.round((stop.pinOffset?.[1] ?? -46) * 0.62) || -34;
    return `
    <div style="position:relative;width:0;height:0;cursor:pointer">
      <svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="1" height="1" aria-hidden="true">
        <line x1="0" y1="0" x2="${pdx}" y2="${pdy}" stroke="${s.line}" stroke-width="1.5" stroke-linecap="round"></line>
      </svg>
      <div style="position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:9999px;background:${s.line}"></div>
      <div style="position:absolute;left:${pdx}px;top:${pdy}px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;padding:6px;border-radius:24px;background:${s.bg};color:${s.text};border:1px solid ${s.border};font-family:var(--font-chrome),serif;font-weight:500;white-space:nowrap;transition:background var(--dur-fast) var(--ease)">
        <div style="display:flex;align-items:center;justify-content:center;border-radius:9999px;margin-right:6px;background:#E45B27;width:16px;height:16px;flex:none">
          <p style="color:#1D1411;font-size:10px;margin:0;line-height:1;font-weight:600">${stop.order}</p>
        </div>
        <p style="font-size:10px;line-height:14px;margin:0;letter-spacing:0.06em;text-transform:uppercase">${pinLabel}</p>
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
      <div style="position:absolute;left:-4.5px;top:-4.5px;width:9px;height:9px;border-radius:9999px;background:${s.line}"></div>
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
  const lensRef = useRef(false);
  lensRef.current = lens;
  /** Latches true the first time the 1858 lens opens — see the <figure> below. */
  const [lensSeen, setLensSeen] = useState(false);
  /* v13 V13-01 (Wil's #1: "the 1858 lens → map close is jittery"). Measured
     cause, not guessed: `setLens(false)` unmounted the "Back to today" door in
     the SAME commit that started the fade, so the figure's `flex-1` box
     absorbed its 68px (670 → 738 measured) and the plate — anchored
     `top: 50%` of that box — jumped exactly 34.00px down on the first frame of
     the fade. `lensClosing` keeps every child of the shell mounted for the
     whole fade, so the close frame has zero layout change; they leave together
     when the fade ends (transitionend, with a timeout fallback). */
  const [lensClosing, setLensClosing] = useState(false);
  const lensVisible = lens || lensClosing;
  const lensShellRef = useRef<HTMLDivElement>(null);
  const lensDoorRef = useRef<HTMLButtonElement>(null);
  const lensCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lensReturnFocus = useRef(false);
  /** v14 E25: true while the pointer that is down first landed on the plate. */
  const lensDownInBox = useRef(false);

  /* ——— The 1858 map viewer (Kathy, 8/7: "do not crop allow pan and zoom") ———
   * Pure ref state: the transform mutates the <img> node directly so a 60fps
   * drag never re-renders this (large) island. Scale 1 = the whole plate
   * fitted; 6 ≈ street-name legibility on the 4096px asset. */
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const lensImgRef = useRef<HTMLImageElement>(null);
  const lensView = useRef({ s: 1, tx: 0, ty: 0 });
  const shellRef = useRef<HTMLElement | null>(null);
  /* v18 (round 19): the UI layer — the box the reader actually sees at rest.
     It is svh-sized (global.css), so it holds still while iOS shows and hides
     its bars; `window.innerHeight` does not (645 at rest, 753 minimized on
     Wil's phone), and a framing read from it depended on the bars' state at
     the moment of load. Every framing decision reads this instead. */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uiHeight = () => rootRef.current?.clientHeight || window.innerHeight;
  /* v19 (round 20): the lane the walk door and the card strip share — their
     bottom offset from the UI layer's edge (global.css `--map-lane`, a
     registered length: phones inset − 4, 640 and up inset + 12). The strip's
     height is the card plus this. */
  const mapLane = () => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--map-lane"));
    return Number.isFinite(v) ? v : 20;
  };
  const lensPointers = useRef(new Map<number, { x: number; y: number }>());
  const lensPinch = useRef(0);

  /* v7 L2 geometry: the box is the whole shell (any aspect); the plate is
     sized to the box WIDTH at scale 1 (natural aspect 4096/3431), centred,
     and must always cover the box — so the minimum scale is the cover scale
     and the whole plate stays reachable by panning. */
  /* v14.5 (round 8 §5.3): E — how far .map-shell now grows BELOW the layout
     viewport so the map continues under iOS 26's bottom toolbar. The value
     lives in global.css (`--map-e`, a min() of `100lvh - 100svh` and `20svh`
     behind the @supports gate) and is read from there, never duplicated here:
     it is 0 on every browser without bars, and it CHANGES ON ROTATION, so
     everything that depends on it recomputes on resize and orientationchange.
     The canvas is E taller than the UI layer, so the camera gets E of bottom
     padding back and the framing the reader sees is unchanged. */
  const mapE = () => {
    const el = shellRef.current;
    if (!el) return 0;
    const v = parseFloat(getComputedStyle(el).getPropertyValue("--map-e"));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };
  /* v16 item 1 (Wil, 2026-09-18): T — E's mirror at the top edge, behind the
     ?glass=1 flag. The shell grows by T above the reader's window and the page
     lands at scroll T (map.astro), so map continues under the address bar
     instead of the bar showing the empty region above document offset 0. The
     canvas is therefore T taller than the UI layer at the top, and the camera
     takes that T back as padding exactly as it already does for E — so the
     framing the reader sees is unchanged. 0 off the flag and wherever there
     are no bars, which makes every expression below a no-op there. */
  const mapT = () => {
    const el = shellRef.current;
    if (!el) return 0;
    const v = parseFloat(getComputedStyle(el).getPropertyValue("--map-t"));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const PLATE = 3431 / 4096;
  const lensMinScale = () => {
    const box = lensBoxRef.current;
    if (!box) return 1;
    return Math.max(1, box.clientHeight / (box.clientWidth * PLATE));
  };
  /* v13 V13-01 item 4 / V13-07a item 4: the plate is ~33M texels at the zoom
     ceiling on a DPR-3 phone. A PERMANENT `will-change: transform` keeps a
     layer that large promoted for the life of the page — it blended over the
     WebGL canvas for every frame of the close fade, and iOS Safari is lazy
     about re-rasterising a promoted layer of this size, which softens the
     plate independently of the source arithmetic. Promote only while a gesture
     is actually moving it; drop it 400ms after the last write. Every transform
     write goes through lensApply, so this is the one call site. */
  const lensPromoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lensPromote = useCallback(() => {
    const img = lensImgRef.current;
    if (!img) return;
    if (img.style.willChange !== "transform") img.style.willChange = "transform";
    if (lensPromoteTimer.current) clearTimeout(lensPromoteTimer.current);
    lensPromoteTimer.current = setTimeout(() => {
      lensPromoteTimer.current = null;
      const el = lensImgRef.current;
      if (el && lensPointers.current.size === 0) el.style.willChange = "auto";
    }, 400);
  }, []);
  useEffect(() => () => {
    if (lensPromoteTimer.current) clearTimeout(lensPromoteTimer.current);
  }, []);

  const lensApply = useCallback(() => {
    const img = lensImgRef.current;
    const box = lensBoxRef.current;
    if (!img || !box) return;
    const v = lensView.current;
    const W = box.clientWidth, H = box.clientHeight;
    const imgW = W * v.s, imgH = W * PLATE * v.s;
    const maxX = Math.max(0, (imgW - W) / 2);
    const maxY = Math.max(0, (imgH - H) / 2);
    v.tx = Math.max(-maxX, Math.min(maxX, v.tx));
    v.ty = Math.max(-maxY, Math.min(maxY, v.ty));
    img.style.transform = `translate(-50%, -50%) translate(${v.tx}px, ${v.ty}px) scale(${v.s})`;
    lensPromote();
  }, [lensPromote]);

  /* v13 V13-07a item 2 (belt and braces): the ceiling used to be a hard 6,
     which is a CSS-pixel number in a device-pixel problem — at DPR 3 a 350px
     box at s=6 asks for 6300 device pixels across. The ceiling is now the
     scale at which the served file runs out of its own pixels, floored at 4 so
     the lens is always a lens. Falls back to 6 until naturalWidth is known. */
  const LENS_MAX_SCALE = 6;
  const lensMaxScale = () => {
    const img = lensImgRef.current;
    const box = lensBoxRef.current;
    const nat = img?.naturalWidth ?? 0;
    const w = box?.clientWidth ?? 0;
    if (!nat || !w) return LENS_MAX_SCALE;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    return Math.max(4, Math.min(LENS_MAX_SCALE, nat / (w * dpr)));
  };
  /** Zoom keeping the container-relative point (px,py — offsets from center) fixed. */
  const lensZoomAt = useCallback(
    (factor: number, px = 0, py = 0) => {
      const v = lensView.current;
      const next = Math.max(lensMinScale(), Math.min(lensMaxScale(), v.s * factor));
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
    /* v12 item 6 (Wil, 8/26): "Make the default position and presentation of
       the image match the crop in the screenshot" — the plate at rest, full
       width, the river band across the middle.
       This replaces v7 L1's lower-panel fit and v8 V8-263's lean-in (x1.3 over
       that fit, biased toward downtown) and v9 V9-206's phone nudge: all three
       framed a DETAIL as the opening view, and he has now asked for the whole
       plate. The cover fit is exactly that — nothing scaled up, the plate
       filling the viewer, the view at the plate's own centre. The clamp in
       lensApply still keeps every corner reachable by drag and zoom. */
    const box = lensBoxRef.current;
    const w = box?.clientWidth ?? 0;
    const h = box?.clientHeight ?? 0;
    const imgH0 = w * PLATE;
    /* The plate is two rows of sheets: the sparse Brunswick row above, the CITY
       and the river below. Wil's screenshot fills the viewer with the lower
       row — sheet numerals along the top edge, HUDSON across the middle, the
       basin at the bottom — so the framing is "fill the city panel by height",
       which is v7 L1's original rule. What has to go is v8 V8-263's lean-in on
       top of it (x1.3 with a 1.8 floor), which is what made the opening view a
       detail rather than the map. */
    const panelFit = imgH0 ? h / (imgH0 * 0.5) : 1;
    /* …but only where the viewer is wide enough to hold that band. On a phone
       the box is tall and narrow, and filling the panel by height would zoom
       past everything; there the minimum scale — cover — shows the most plate
       there is to show, and the view sits at the plate's centre. */
    const wideBox = w >= h;
    const s0 = wideBox ? Math.max(lensMinScale(), panelFit) : lensMinScale();
    const startCx = 0.5;
    const startCy = wideBox ? 0.75 : 0.5; // the city panel's own centre
    lensView.current = { s: s0, tx: -(startCx - 0.5) * w * s0, ty: -(startCy - 0.5) * imgH0 * s0 };
    lensApply();
  }, [lensApply]);
  /* v13 V13-01 item 5: the box's height changes as the "Back to today" door
     mounts (open) and leaves (after the fade), so the resting pose and the pan
     clamp are recomputed once the box has SETTLED — two frames after the
     commit — instead of exactly once, ever. Never while the fade is running:
     re-posing mid-fade would be the very jump this item removes. Because it
     re-runs on the closing commit, a re-open never inherits the last pan/zoom. */
  useEffect(() => {
    if (!lensSeen || lensClosing) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => lensReset());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [lensSeen, lens, lensClosing, lensReset]);
  // Opening the lens hands keyboard focus to the viewer (arrows/+/−/0 work at once).
  useEffect(() => {
    if (!lens) return;
    const r = requestAnimationFrame(() => lensBoxRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(r);
  }, [lens]);
  /* v13 V13-01 item 6: closing RETURNS focus to the door that opened it. v12
     called `.blur()` on that door instead, which dropped a keyboard user back
     at the top of the document. The door only remounts once the fade is over
     (item 2), so the return waits for that commit — and only when focus was
     still inside the shell, so a click elsewhere is never overridden. */
  useEffect(() => {
    if (lens || lensClosing || !lensReturnFocus.current) return;
    lensReturnFocus.current = false;
    const r = requestAnimationFrame(() => lensDoorRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(r);
  }, [lens, lensClosing]);

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

  const lensPointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      lensPointers.current.delete(e.pointerId);
      lensPinch.current = 0;
      if (lensPointers.current.size === 0) {
        e.currentTarget.style.cursor = "grab";
        lensPromote(); // re-arms the 400ms demote now that no finger owns the plate
      }
    },
    [lensPromote],
  );

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
  /* v7 M4 — the walk is a state machine, not a boolean: idle · walking ·
     paused (a drag, tap or key took over) · done (stop 5 reached). `tourRun`
     is a run counter: every sleeping loop iteration re-checks it and stands
     down if a newer run (or a pause/stop) has superseded it — no double-drive,
     no yank. */
  type Walk = "idle" | "walking" | "paused" | "done";
  const [walk, setWalk] = useState<Walk>("idle");
  const walkRef = useRef<Walk>("idle");
  walkRef.current = walk;
  const tourRun = useRef(0);
  const [hintOpen, setHintOpen] = useState(false);
  const flyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** v7 X1: set once the curtain starts covering — every camera/route
   *  animation checks it and stands down so page A is still under the cover. */
  const leavingRef = useRef(false);
  const focusedRef = useRef(false);
  focusedRef.current = focused;
  /** keen: true between dragStarted and dragEnded. */
  const dragRef = useRef(false);
  const dragStartIdx = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* v13 V13-01 item 3: the close fade was 1600ms — long enough that a
     full-viewport layer kept blending over the live WebGL canvas for a second
     and a half, which is most of what "jittery" was. 520ms on the house
     `--ease` (recorded in docs/v4/MOTION.md); reduced motion swaps instantly. */
  const lensFadeMs = reduced ? 0 : LENS_FADE_MS;
  const closeLens = useCallback(() => {
    if (!lensRef.current) return;
    const shell = lensShellRef.current;
    lensReturnFocus.current = !!(shell && shell.contains(document.activeElement));
    setLensClosing(true);
    setLens(false);
  }, []);
  /* The shell's children (box, caption, door) and the map chrome they trade
     places with are held until the fade actually ends. transitionend is the
     signal; the timer is the fallback for the reduced-motion 0ms case and for
     any engine that drops the event. */
  useEffect(() => {
    if (!lensClosing) return;
    const shell = lensShellRef.current;
    const end = () => {
      if (lensCloseTimer.current) clearTimeout(lensCloseTimer.current);
      lensCloseTimer.current = null;
      setLensClosing(false);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === shell && e.propertyName === "opacity") end();
    };
    shell?.addEventListener("transitionend", onEnd);
    lensCloseTimer.current = setTimeout(end, lensFadeMs + 120);
    return () => {
      shell?.removeEventListener("transitionend", onEnd);
      if (lensCloseTimer.current) {
        clearTimeout(lensCloseTimer.current);
        lensCloseTimer.current = null;
      }
    };
  }, [lensClosing, lensFadeMs]);

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
  /* v18 (round 19, the reverse-scroll jitter): iOS fires `resize` every time
     its bars expand or collapse (innerHeight 645 ↔ 753 on Wil's phone), and
     each one used to rewrite all five pills' innerHTML 200 ms later although
     no pill had changed. Now only a change of the ladder itself — the phone /
     desktop variant, or the desktop font step — re-renders them. */
  const pillKeyRef = useRef("");
  useEffect(() => {
    const keyOf = () => `${window.innerWidth < 640 || window.innerHeight < 560}|${pillSizes().font}`;
    pillKeyRef.current = keyOf();
    let t: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        const k = keyOf();
        if (k === pillKeyRef.current) return;
        pillKeyRef.current = k;
        setMarkers(activeLabelRef.current, true);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMarkers]);

  // The fixed carousel belongs to the map: when the map shell scrolls away
  // (reading the index below), the cards step aside.
  const [shellVisible, setShellVisible] = useState(true);
  const shellVisibleRef = useRef(true);
  shellVisibleRef.current = shellVisible;
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

  /**
   * v7 M2 — the overview camera. `cameraForBounds` honours `pitch` in
   * mapbox-gl 3.27 but knows nothing about the DOM label pills, so for each
   * pitch candidate (steepest first) the fit is tried and every marker LABEL
   * rect (phone chips 24×24 with ≥ 22px centre separation; desktop pills on
   * their pinOffset leader) is checked against the safe box (inside
   * --ui-inset, below the chip row, above the door row) by a synchronous
   * jumpTo + project, restored in the same task (Mapbox paints on rAF, so no
   * frame ever shows the probe). Cached per viewport size.
   */
  const camCache = useRef<{ key: string; cam: typeof OVERVIEW } | null>(null);
  const overviewCamera = useCallback((): typeof OVERVIEW => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl) return OVERVIEW;
    const w = window.innerWidth;
    const h = uiHeight();
    const t = mapT();
    /* v14.5: E is part of the viewport identity — it changes on rotation and
       the fit's padding depends on it, so a cached camera from the other
       orientation must not be reused. */
    const key = `${w}x${h}x${Math.round(mapE())}x${Math.round(t)}`;
    if (camCache.current?.key === key) return camCache.current.cam;
    const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-inset")) || 20;
    const b = new gl.LngLatBounds();
    stops.forEach((st) => b.extend(st.coordinates));
    const short = h < 560;
    const narrow = w < 640 || short;
    // Safe box for LABELS: chip row on top, door/attribution row at the bottom.
    /* v18 (round 19, Wil's screenshot of the intended framing): this search
       works in CONTAINER pixels — map.project and map.unproject are relative
       to the canvas, and since v16 the canvas's top edge sits T above the UI
       layer — so the safe box and the re-centring target below are written in
       that same space. Written in window pixels, as they were, the box sat T
       too high: on a phone every re-centring pass moved the group by T
       instead of converging, no zoom satisfied the loop at any pitch, and the
       fit fell through to the blind OVERVIEW constant — zoom 15.25 on the raw
       centroid, pins 2 and 5 off the top (his screenshot 3). T is 0 wherever
       there are no bars, where this reduces to the old arithmetic exactly. */
    const safe = { x0: inset, y0: t + inset + 56, x1: w - inset, y1: t + h - (inset + 12 + 52 + 12) }; // 52 = .btn min-height (V8-002)
    const labelRect = (pt: { x: number; y: number }, st: Stop) => {
      if (narrow) {
        /* v8 V8-207: phones carry pills now — model the pill's real box
           (16px chip + 10px caps at +0.06em ≈ 7.2px/ch) at the scaled leader
           offset, so the camera search sees what the visitor sees. */
        const pdx = Math.round((st.pinOffset?.[0] ?? 0) * 0.62);
        const pdy = Math.round((st.pinOffset?.[1] ?? -46) * 0.62) || -34;
        const wpxN = 36 + 7.2 * (st.pin ?? st.label).length;
        const cxN = pt.x + pdx, cyN = pt.y + pdy;
        return { x0: cxN - wpxN / 2, y0: cyN - 14, x1: cxN + wpxN / 2, y1: cyN + 14, cx: cxN, cy: cyN };
      }
      const [dx, dy] = st.pinOffset ?? [0, -46];
      const wpx = 26 + 9.4 * st.label.length; // measured: "2 COMMISSIONER'S OFFICE" ≈ 241px
      const cx = pt.x + dx, cy = pt.y + dy;
      return { x0: cx - wpx / 2, y0: cy - 20, x1: cx + wpx / 2, y1: cy + 20, cx, cy };
    };
    const saved = { center: map.getCenter(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
    let chosen: typeof OVERVIEW | null = null;
    if (narrow) {
      /* Phones: cameraForBounds under pitch is far too conservative (zoom ~14.3
         for a walk that fits at ~15.0), so search directly — the highest zoom
         at which the projected chip box fits the safe box, re-centred through
         unproject.

         v10.2 V10-14 (Wil, 8/21, choosing "the map's framing" off his iPhone
         screenshot). Three defects, none of them a tuning value — and it was
         the third that produced what he photographed:

         1. The re-centring loop set `ok` on EVERY pass, so a camera that never
            converged was accepted anyway — and under pitch a single shift is
            non-linear and routinely overshoots, so three passes rarely
            converged. It now runs to convergence or gives up on that zoom.
         2. The acceptance test asked only whether the five pills FIT the safe
            box and missed each other, never whether the group was CENTRED — so
            the first zoom at which they merely fitted would win, however far
            off-axis. (Measured, 1 and 2 change no viewport's outcome today:
            wherever the search succeeds it already converges to within a pixel.
            They are the guard that keeps 3 honest as the geometry moves.)

         3. The zoom floor. The
            search stopped at 14.70, but a 390x673 phone — a 390x844 device once
            Safari's ~190px of chrome is taken — only fits the walk at 14.60,
            and a 375x667 one at 14.60 too. Those phones therefore fell off the
            search entirely and took the blind OVERVIEW constant (15.25 / 33
            degrees, centred on the stops' raw centroid), which is exactly the
            low-and-left composition in his screenshot. Only viewports 715px and
            taller ever found a real camera. The floor is now 14.2 — the value
            the desktop branch below has always used — so every phone finds one.
            The search still takes the HIGHEST zoom that fits, so a lower floor
            can only rescue a viewport, never loosen one that already worked.

         A camera that fits but will not centre is still better than the blind
         OVERVIEW constant, so the best such near-miss is kept as a floor: this
         can tighten the framing, never lose it. */
      const CENTRE_TOL = 8; // px — half a pill's leading, below the eye's notice
      const PASSES = 8;
      /* v12 item 16 (Wil, 8/26): "Landscape-phone map framing needs zoom 13.30.
         Fix it" — the last item of the round, so it accounts for everything
         above it.
         A landscape phone is 390px tall: after the top inset and the button
         lane the safe band is about 218px, and five pills have never fitted in
         it at 14.2. So this viewport fell off the search exactly the way the
         portrait phones did before v10.2 lowered the floor for them, and took
         the same blind OVERVIEW constant — 15.25 / 33 degrees, with three
         stops off-screen (measured: four of five pills outside the safe box).
         The floor drops only for SHORT viewports, so portrait phones keep the
         14.2 they were tuned to and measure byte-identical. As ever the search
         takes the highest zoom that fits, so a deeper floor can only rescue a
         viewport, never loosen one that already worked. */
      const ZOOM_FLOOR = short ? 12.9 : 14.2;
      const centroid: [number, number] = [
        stops.reduce((a, st) => a + st.coordinates[0], 0) / stops.length,
        stops.reduce((a, st) => a + st.coordinates[1], 0) / stops.length,
      ];
      let fitOnly: typeof OVERVIEW | null = null;
      outerN: for (const pitch of PITCHES) {
        for (let zoom = OVERVIEW.zoom; zoom >= ZOOM_FLOOR; zoom -= 0.05) {
          let center: [number, number] = centroid;
          let ok = false;
          for (let pass = 0; pass < PASSES; pass++) {
            map.jumpTo({ center, zoom, pitch, bearing: OVERVIEW.bearing });
            /* v8 V8-207: phones carry PILLS now — fit their real rects, not
               the old ±12 dot boxes. */
            const rs = stops.map((st) => labelRect(map.project(st.coordinates), st));
            const x0 = Math.min(...rs.map((r) => r.x0)), x1 = Math.max(...rs.map((r) => r.x1));
            const y0 = Math.min(...rs.map((r) => r.y0)), y1 = Math.max(...rs.map((r) => r.y1));
            if (x1 - x0 > safe.x1 - safe.x0 || y1 - y0 > safe.y1 - safe.y0) break;
            const shift = { x: (safe.x0 + safe.x1) / 2 - (x0 + x1) / 2, y: (safe.y0 + safe.y1) / 2 - (y0 + y1) / 2 };
            if (Math.abs(shift.x) < 1 && Math.abs(shift.y) < 1) { ok = true; break; }
            /* v18: the PADDED centre, (w/2, T + h/2) in container pixels, is
               the point jumpTo places `center` at — measure the shift from there. */
            const c = map.unproject([w / 2 - shift.x, t + h / 2 - shift.y]);
            center = [c.lng, c.lat];
          }
          if (!ok) continue;
          map.jumpTo({ center, zoom, pitch, bearing: OVERVIEW.bearing });
          const rs = stops.map((st) => labelRect(map.project(st.coordinates), st));
          const inside = rs.every((r) => r.x0 >= safe.x0 && r.y0 >= safe.y0 && r.x1 <= safe.x1 && r.y1 <= safe.y1);
          let apart = true;
          for (let i = 0; i < rs.length && apart; i++)
            for (let j = i + 1; j < rs.length; j++) {
              const a = rs[i], c = rs[j];
              if (Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0) > 0 && Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0) > 0) { apart = false; break; }
            }
          if (inside && apart) {
            const bx = (Math.min(...rs.map((r) => r.x0)) + Math.max(...rs.map((r) => r.x1))) / 2;
            const by = (Math.min(...rs.map((r) => r.y0)) + Math.max(...rs.map((r) => r.y1))) / 2;
            const centred =
              Math.abs(bx - (safe.x0 + safe.x1) / 2) <= CENTRE_TOL && Math.abs(by - (safe.y0 + safe.y1) / 2) <= CENTRE_TOL;
            const cam = { center, zoom: +zoom.toFixed(2), pitch, bearing: OVERVIEW.bearing };
            if (!fitOnly) fitOnly = cam;
            if (centred) {
              chosen = cam;
              break outerN;
            }
          }
        }
      }
      chosen = chosen ?? fitOnly;
    } else {
      outer: for (const pitch of PITCHES_WIDE) {
        /* v11 item 9 (Wil, 8/22): "I'd like the map on the Map page pushed
           higher so the ferry pin sits farther from the `TAKE THE WALK`
           button. All pins should remain visible on every screen size."

           Measured against a stubbed style: at 1440×900 the lowest DOT sat
           10px above the button (1280 and 1920 the same). The safe box below
           constrains the label PILLS, but a pill hangs above its dot on a
           leader line, so the dot itself was never in the fit — the pills were
           all comfortably inside while the ferry's dot was almost touching the
           CTA. Reserving more room at the bottom of the fit lifts dot and pill
           together, which is the whole marker. */
        const cam = map.cameraForBounds(b, {
          /* +E: an explicit padding REPLACES the map's own, so the strip under
             the toolbar has to be re-added here or the fit would frame into it. */
          padding: { top: 120 + mapT(), bottom: 240 + mapE(), left: 140, right: 140 },
          bearing: OVERVIEW.bearing,
          pitch,
        } as Parameters<MapboxGL.Map["cameraForBounds"]>[1]);
        if (!cam) continue;
        const baseZoom = Math.min(cam.zoom as number, 15.6);
        for (const dz of [0, 0.25, 0.5, 0.75, 1.0]) {
          const zoom = baseZoom - dz;
          if (zoom < 14.2) break;
          map.jumpTo({ center: cam.center as [number, number], zoom, pitch, bearing: OVERVIEW.bearing });
          const rects = stops.map((st) => labelRect(map.project(st.coordinates), st));
          const inside = rects.every((r) => r.x0 >= safe.x0 && r.y0 >= safe.y0 && r.x1 <= safe.x1 && r.y1 <= safe.y1);
          let apart = true;
          for (let i = 0; i < rects.length && apart; i++)
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i], c = rects[j];
              if (Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0) > 0 && Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0) > 0) { apart = false; break; }
            }
          if (inside && apart) {
            chosen = { center: cam.center as [number, number], zoom, pitch, bearing: OVERVIEW.bearing };
            break outer;
          }
        }
      }
    }
    /* v12 item 16: a SHORT viewport that still cannot seat five pills without
       them touching (a 375-tall landscape phone cannot at any zoom — recorded
       in docs/v10/REVIEW-GUIDE.md, and still true with the floor at 12.9) used
       to take the blind OVERVIEW constant, which put three of the five stops
       off the screen entirely. Fitting the bounds instead keeps every stop in
       frame; the labels may crowd, which walk-check has always accepted on
       landscape as a pan. Nothing else reaches this branch — every other
       viewport converges above. */
    let lastResort: typeof chosen = null;
    if (!chosen && short) {
      const fit = map.cameraForBounds(b, {
        /* +E, for the same reason as the fit above. */
        padding: { top: inset + 56 + mapT(), bottom: inset + 76 + mapE(), left: inset + 24, right: inset + 24 },
        bearing: OVERVIEW.bearing,
        pitch: PITCHES[PITCHES.length - 1],
      } as Parameters<MapboxGL.Map["cameraForBounds"]>[1]);
      if (fit)
        lastResort = {
          center: fit.center as [number, number],
          zoom: Math.min(fit.zoom as number, OVERVIEW.zoom),
          pitch: PITCHES[PITCHES.length - 1],
          bearing: OVERVIEW.bearing,
        };
    }
    map.jumpTo(saved);
    const cam = chosen ?? lastResort ?? { ...OVERVIEW, pitch: PITCHES[PITCHES.length - 1] };
    camCache.current = { key, cam };
    return cam;
  }, [stops]);
  useEffect(() => {
    const onResize = () => {
      camCache.current = null;
    };
    window.addEventListener("resize", onResize);
    /* v14.5: E changes on rotation, and iOS does not always fire resize for it. */
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  /** v7 (juror 2): in focused/walk mode the stop is lifted so it — and its
   *  label pill — sit above the card strip: half the strip's height (card +
   *  its bottom padding) at every viewport, phones and landscape included. */
  const cardLift = (): [number, number] => {
    const lane = mapLane();
    const w = window.innerWidth;
    const strip = w < 640 ? 128 + lane : w < 1024 ? 160 + lane : 192 + lane; /* v8 V8-201: the strip sits ON the inset; v19: on the lane */
    // never so far that the active name plate meets the top edge (landscape phones)
    return [0, -Math.round(Math.min(strip / 2, uiHeight() / 2 - 100))];
  };

  const flyToStop = useCallback(
    (idx: number) => {
      const map = mapRef.current;
      const stop = stops[idx];
      if (!map || !stop) return;
      /* Juror P1-6: zoom 20 framed one intersection ("a parking lot") and
         erased every other stop. 17.75 keeps the neighbouring blocks — a
         walking tour needs to see where a stop sits in the walk. P1-7: on a
         short viewport the camera lifts the stop above the card strip. */
      const lift = cardLift();
      if (reduced) {
        map.easeTo({ center: stop.coordinates, zoom: 17.75, offset: lift, duration: 0 });
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

  /** v7 M5: the short hop between neighbouring cards (a swipe/settle) —
   *  easeTo on the house curve; `flyTo` stays for marker taps from the
   *  overview. */
  const followCamera = useCallback(
    (idx: number) => {
      const map = mapRef.current;
      const stop = stops[idx];
      if (!map || !stop) return;
      const lift = cardLift();
      if (reduced) map.easeTo({ center: stop.coordinates, zoom: 17.75, offset: lift, duration: 0 });
      else map.easeTo({ center: stop.coordinates, zoom: 17.75, duration: 1100, easing: expoOut, offset: lift, essential: true });
      setMarkers(stop.label);
    },
    [stops, reduced, setMarkers],
  );

  /** v7 M4: a drag, tap or key takes the walk over — the loop stands down. */
  const pauseWalk = useCallback(() => {
    if (walkRef.current !== "walking") return;
    tourRun.current++;
    mapRef.current?.stop();
    setWalk("paused");
  }, []);

  /** v18 (round 19): the shell's resting scroll is T, not 0 — the top runway
   *  (v16) sits above it, and the scroll-to-0 that used to live here and in
   *  bringShellIntoView (pre-runway code) is what dropped the whole
   *  composition by T after every pin tap and every walk: the 1858 pill 110px
   *  low, the door under the toolbar, grey behind the address bar (Wil's
   *  screenshot 1). From a scrolled index this brings the shell back to the
   *  line; from above it (a flick to the very top parks the page at 0) it
   *  lands the same way, so a tap never waits on map.astro's settle timer. */
  const landShell = useCallback(() => {
    const t = mapT();
    if (Math.abs(window.scrollY - t) <= 4) return;
    window.scrollTo({ top: t, behavior: reduced ? "instant" : "smooth" });
  }, [reduced]);

  const focusStop = useCallback(
    (idx: number) => {
      pauseWalk();
      landShell();
      setFocused(true);
      setActiveIdx(idx);
      setHintOpen(false);
      flyToStop(idx);
      /* v18 (round 19, Wil): the URL no longer follows the stop — see settle(). */
    },
    [flyToStop, pauseWalk, landShell],
  );

  const backToOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    tourRun.current++;
    map.stop();
    setWalk("idle");
    setFocused(false);
    setMarkers(null);
    const target = overviewCamera();
    if (reduced) map.jumpTo(target);
    else map.easeTo({ ...target, duration: 2000, essential: true });
  }, [reduced, setMarkers, overviewCamera]);

  /* v18 (round 19, Wil): "every time the Map page is opened or refreshed, it
     should load exactly the same way it does on a first visit." A Back or
     Forward that restores this page from the browser's back-forward cache
     keeps the island alive exactly as it was left — the focused card, the
     walk's rotated camera, the lens, and the v7 X1 `leavingRef` latch that the
     curtain set on the way out and nothing ever cleared, which silently
     stopped the walk and the route draw from ever running again. A restore is
     treated as an open: every state goes back to idle, the route is whole, the
     camera cuts to the overview, and map.astro's own pageshow handler lands
     the scroll. */
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      leavingRef.current = false;
      tourRun.current++;
      if (flyTimeout.current) clearTimeout(flyTimeout.current);
      setWalk("idle");
      setFocused(false);
      setHintOpen(false);
      setLens(false);
      setLensClosing(false);
      setMarkers(null);
      const map = mapRef.current;
      if (!map) return;
      try {
        map.stop();
        const src = map.getSource("route") as MapboxGL.GeoJSONSource | undefined;
        if (src) {
          src.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeLine } });
        }
        map.jumpTo(overviewCamera());
      } catch {
        /* a style that never loaded has nothing to reset */
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [overviewCamera, setMarkers]);

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
    /* v18 (round 19, Wil): an inbound deep link is consumed here and taken out
       of the address bar at once, so a reload or a return lands on the
       first-visit overview instead of replaying the arrival flight. Nothing on
       the site writes the parameter any more (see settle()). */
    if (deepSlug !== null) {
      const clean = new URL(location.href);
      clean.searchParams.delete("stop");
      history.replaceState(null, "", clean);
    }

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
      /* Juror pass 7 P2: on desktops the full-viewport map ate every wheel —
         the copy, the spot index and the footer under it were unreachable by
         mouse (a scroll-jack by another name). Cooperative gestures on FINE
         pointers only: a plain wheel scrolls the page, ⌘/Ctrl + wheel zooms the
         map (drag, double-click and the walk are unchanged). Touch stays as it
         was — one finger explores, the bottom lane scrolls (M8/V7-023). */
      /* v18 (round 19, the reverse-scroll jitter): mapbox-gl 3.27 also listens
         to `window` resize and re-runs resize + render on every one. iOS fires
         that event each time its bars expand or collapse, while the canvas —
         svh-sized since v14.3 — has not changed by a pixel, so every bar
         transition bought a full map re-render for nothing. Real size changes
         (rotation, a desktop window) are caught by the ResizeObserver on the
         container and the orientationchange handler below, which call
         map.resize() themselves. */
      trackResize: false,
      cooperativeGestures: typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
      locale: {
        "ScrollZoomBlocker.CmdMessage": "Hold ⌘ and scroll to zoom the map",
        "ScrollZoomBlocker.CtrlMessage": "Hold Ctrl and scroll to zoom the map",
        "TouchPanBlocker.Message": "Use two fingers to move the map",
      },
    });
    /* Bottom-LEFT: the menu FAB owns bottom-right on /map (item 10), and a
       licence mark must never sit under chrome (juror pass 1 P2). */
    /* v8 V8-203: phones run four corners (chip / 1858 / walk door / ☰) —
       the (i) moves beside the ☰ in the bottom-right pocket there.
       v14 E2: the ☰ is top-right on /map as everywhere else; the phone (i)
       keeps this corner at the plain inset (the +84px pocket is gone). */
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      window.innerWidth < 640 || window.innerHeight < 560 ? "bottom-right" : "bottom-left",
    );
    mapRef.current = map;
    /* A pointer that changes kind (tablet + trackpad, hybrids) re-decides. */
    const finePointer = window.matchMedia("(pointer: fine)");
    const onPointerKind = () => map.setCooperativeGestures(finePointer.matches);
    finePointer.addEventListener("change", onPointerKind);
    /* v14.5 (round 8 §5.3): the canvas runs E below the UI layer, so the
       camera is told to treat that strip as padding — every centring,
       cameraForBounds and easeTo then frames the box the reader actually sees,
       and the map simply continues underneath it. E is 0 off iOS, where this
       is a no-op. It changes on rotation (lvh and svh both change), so it is
       re-applied on resize and orientationchange alongside map.resize(). */
    /* v16 item 1: and T above, for the same reason and by the same rule. */
    /* v18 (round 19): the runways and the UI layer's height, cached here for
       the per-frame reader (chipNudge) so it never asks getComputedStyle. */
    const pad = { t: 0, e: 0, h: 0 };
    const applyPadding = () => {
      const e = mapE();
      const t = mapT();
      pad.t = t;
      pad.e = e;
      pad.h = uiHeight();
      const p = map.getPadding?.();
      if (!p || p.bottom !== e || p.top !== t) map.setPadding({ top: t, right: 0, bottom: e, left: 0 });
    };
    map.on("load", () => {
      map.resize();
      applyPadding();
    });
    const onViewportChange = () => {
      map.resize();
      applyPadding();
    };
    window.addEventListener("orientationchange", onViewportChange);
    const ro = new ResizeObserver(onViewportChange);
    ro.observe(container.current);

    // v7 M1: the GeolocateControl is gone (Wil) — bottom-left is attribution alone.
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
          `Location ${stop.order}: ${stop.canonical ?? stop.cardTitle.replace("\n", " ")}${stop.plaque ? "" : " (no plaque, website only)"}`,
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
        /* v7 V7-009: Mapbox stamps role="img" on the marker element — ours is
           the <button> itself, whose aria-label is the accessible object. */
        el.removeAttribute("role");
        return { marker, stop };
      });
      /* v7 M2 (phones): two chips one block apart would overlap at the camera
         that shows all five; when two chip centres come within 24px they are
         eased apart along their joining line (≤ 6px each — a leader's worth,
         the dot stays on its block). Reset once the walk zooms in. */
      const chipNudge = () => {
        const msAll = markersRef.current;
        /* While a stop is focused the card strip owns the bottom of the map:
           any marker whose point falls under it fades (a label under a card is
           useless, and it read as a collision — juror pass 2). */
        if (focusedRef.current && shellVisibleRef.current) {
          const lane = mapLane();
          const w = window.innerWidth;
          const strip = w < 640 ? 128 + lane : w < 1024 ? 160 + lane : 192 + lane; /* v8 V8-201: the strip sits ON the inset; v19: on the lane */
          /* v18 (round 19): map.project is container pixels, and the container's
             top edge is T above the UI layer (v16), so the strip's line sits T
             further down in that space; the height is the UI layer's, not the
             window's, which the bars move. */
          const limit = pad.t + (pad.h || uiHeight()) - strip - 8;
          const narrowNow = w < 640 || window.innerHeight < 560;
          msAll.forEach(({ marker, stop }) => {
            const el = marker.getElement();
            const pt = map.project(stop.coordinates);
            // the LABEL's bottom edge: a chip's 12px radius, or the pill on its leader
            const [, dy] = stop.pinOffset ?? [0, -46];
            const labelBottom = pt.y + (narrowNow ? 12 : Math.max(12, dy + 20));
            const under = labelBottom > limit && stop.label !== activeLabelRef.current;
            el.style.opacity = under ? "0" : "";
            el.style.pointerEvents = under ? "none" : "";
            el.style.transition = "opacity var(--dur-fast) var(--ease)";
          });
        } else {
          msAll.forEach(({ marker }) => {
            const el = marker.getElement();
            el.style.opacity = "";
            el.style.pointerEvents = "";
          });
        }
        if (!(window.innerWidth < 640 || window.innerHeight < 560)) return;
        const ms = markersRef.current;
        const pts = ms.map(({ stop }) => map.project(stop.coordinates));
        const off = ms.map(() => ({ x: 0, y: 0 }));
        if (map.getZoom() < 16) {
          for (let i = 0; i < pts.length; i++)
            for (let j = i + 1; j < pts.length; j++) {
              const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
              const d = Math.hypot(dx, dy) || 1;
              if (d < 25) {
                const push = Math.min(6, (25 - d) / 2);
                off[i].x -= (dx / d) * push; off[i].y -= (dy / d) * push;
                off[j].x += (dx / d) * push; off[j].y += (dy / d) * push;
              }
            }
        }
        ms.forEach(({ marker }, i) => {
          const inner = marker.getElement().firstElementChild as HTMLElement | null;
          if (inner) inner.style.translate = off[i].x || off[i].y ? `${off[i].x.toFixed(1)}px ${off[i].y.toFixed(1)}px` : "";
        });
      };
      map.on("render", chipNudge);
      /* v7 V7-037: blank highway-shield glyphs render in the Studio style at
         these zooms; hide the shield layers at runtime (the style lives on
         Wil's account — noted for the guide). */
      for (const l of map.getStyle()?.layers ?? []) {
        if (/shield/i.test(l.id)) map.setLayoutProperty(l.id, "visibility", "none");
      }

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
          if (leavingRef.current) return;
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
        /* v14 E21 (client): the arrival name plate that used to ride this
           flight is gone; the 5s flight itself is unchanged. */
        const arrPitch = overviewCamera().pitch;
        if (reduced) map.jumpTo({ center: stops[deepIdx].coordinates, zoom: 17.75, pitch: arrPitch, bearing: OVERVIEW.bearing });
        else
          map.easeTo({
            center: stops[deepIdx].coordinates,
            zoom: 17.75,
            pitch: arrPitch,
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
            pitch: overviewCamera().pitch,
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
      window.removeEventListener("orientationchange", onViewportChange);
      finePointer.removeEventListener("change", onPointerKind);
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

  // The slider mounts fresh each time focus begins; keen's `initial` option
  // proved unreliable with perView:auto (it landed on the wrong card — QA
  // final, defect 2), so creation force-jumps to the chosen stop.
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;
  /* v7 M5 — root cause: keen-slider 6.8's snap mode hard-codes a 500ms
     quintic on ANY release velocity (a 5px nudge flung a whole card) and the
     reconciliation retry yanked live drags. Here `dragEnded` runs after keen's
     snap plugin, so the moveToIdx below REPLACES its animation: the target is
     the nearest snap point, or start ± 1 for a real flick, never more than one
     card, on the house curve. `slideChanged` only lights the marker; the map
     follows on `settle()` (animationEnded, or a fallback timer, or a
     zero-distance release which emits no animationEnded). */
  const settle = useCallback(
    (idx: number) => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = null;
      /* Juror pass 8 P2: a walk step's programmatic `moveToIdx` is still in
         flight (650 ms) when `Back` lands ~3.5 s after `Continue`; its
         animationEnded/slideChanged arrive AFTER the overview reset and relit
         the stop (whose pill then floated over the 1858 plate). The strip is
         hidden when not focused — its events mean nothing then. */
      if (!focusedRef.current) return;
      setActiveIdx(idx);
      if (focusedRef.current && walkRef.current !== "walking") followCamera(idx);
      else setMarkers(stops[idx]?.label ?? null);
      /* v18 (round 19, Wil): the URL no longer follows the card. v7 V7-095
         wrote `?stop=` here and in focusStop so Back from a chapter, or a
         reload, restored the stop; the brief now says every open and every
         reload is the first-visit overview, so nothing writes the parameter
         any more. An inbound `?stop=` (a shared deep link) is still honoured
         once, at arrival, and then taken out of the address bar. */
    },
    [followCamera, setMarkers, stops],
  );
  const [sliderRef, sliderInstance] = useKeenSlider({
    slides: { perView: "auto", spacing: 12, origin: "center" },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: "auto", spacing: 16, origin: "center" } },
    },
    mode: "snap",
    initial: activeIdx,
    rubberband: true,
    renderMode: "performance",
    dragSpeed: 1,
    defaultAnimation: { duration: reduced ? 0 : 650, easing: expoOut },
    created: (sl) => {
      const target = activeIdxRef.current;
      if (sl.track.details.rel !== target) sl.moveToIdx(target, true, { duration: 0 });
    },
    dragStarted: (sl) => {
      dragRef.current = true;
      dragStartIdx.current = sl.track.details.rel;
      pauseWalk();
    },
    dragEnded: (sl) => {
      dragRef.current = false;
      const d = sl.track.details;
      const v = sl.track.velocity();
      let target = d.rel;
      if (Math.abs(v) > 0.0008) target = dragStartIdx.current + (v > 0 ? 1 : -1);
      target = Math.max(0, Math.min(stops.length - 1, target));
      if (Math.abs(sl.track.idxToDist(target, true)) < 0.001) {
        settle(target);
        return;
      }
      sl.moveToIdx(target, true, { duration: reduced ? 0 : 650, easing: expoOut });
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => settle(sl.track.details.rel), 800);
    },
    slideChanged: (sl) => {
      if (!focusedRef.current) return; // see settle()
      const idx = sl.track.details.rel;
      setMarkers(stops[idx]?.label ?? null);
    },
    animationEnded: (sl) => settle(sl.track.details.rel),
    detailsChanged: (sl) => {
      /* v7 M9: neighbours scale continuously by distance (0.92 → 1), no
         allocations — transform writes only.

         v11 item 1 (Wil, 8/22): "The chapter card on the map page should always
         show the center/middle card as slightly larger — wider and taller —
         than the chapter cards to its left and right… When a new card moves in
         from the left or right to replace the center/middle card, it should
         grow slightly as it moves into the center, while the previous
         center/middle card shrinks down to match the size of the other cards
         as it moves out."

         The mechanism was here and the arithmetic was wrong. keen's
         `slide.distance` is the slide's LEFT EDGE as a fraction of the
         container, not its distance from the centre — so a perfectly centred
         card reports `(1 - size) / 2`, never 0, and never reached scale 1 or
         its centre origin. Measured settled: 0.321 at 1440 and 0.080 at 390,
         which left the focused card 3% larger than its neighbour on a desktop
         instead of the intended 8% — a gradient, not a focus.

         Subtracting the centred position and normalising by the slide's own
         size gives a true 0 at the centre and 1 at either neighbour, so the
         focused card is exactly CARD_FOCUS bigger, and the grow/shrink on
         cycling is the same continuous function read correctly. */
      const det = sl.track.details;
      if (!det) return;
      /* v12 item 2 (Wil, 8/26): "equally horizontal spacing between each
         chapter page card" — DESKTOP ONLY at his direction ("Chapter cards are
         perfect on tablet and mobile, do not change").

         The layout gap is already constant (keen `spacing`). What is not
         constant is what the eye sees, because the scale above shrinks each
         unfocused card about the edge NEAREST the centre: the focused card's
         neighbour keeps its near edge, so that gap stays 16px, but the
         neighbour's FAR edge recedes by 8% of a card — putting ~57px between
         the pairs further out. Measured at 1440 before this: 16 / 57 / 57.

         So each card is translated back toward the centre by exactly the width
         its inboard neighbours gave up. Reads first, writes second: mixing
         them forced a reflow per slide inside a per-frame loop. */
      const wide = window.innerWidth >= 1024;
      const contW = sl.size || 0;
      const rows = det.slides.map((sd, i) => {
        const slide = sl.slides[i] as HTMLElement | undefined;
        const inner = slide?.firstElementChild as HTMLElement | null;
        const off = sd.distance - (1 - sd.size) / 2;
        const t = Math.min(1, sd.size > 0 ? Math.abs(off) / sd.size : 1);
        const scale = 1 - CARD_FOCUS * t;
        return { slide, inner, off, scale, dist: sd.distance, w: inner ? inner.offsetWidth : 0 };
      });
      if (wide) {
        /* outward from the centre, each side accumulating its own shrink */
        for (const dir of [1, -1]) {
          const side = rows
            .filter((r) => (dir > 0 ? r.off > 0.01 : r.off < -0.01))
            .sort((a, b) => Math.abs(a.off) - Math.abs(b.off));
          let shed = 0;
          for (const r of side) {
            (r as { shift?: number }).shift = -dir * shed;
            shed += r.w * (1 - r.scale);
          }
        }
      }
      for (const r of rows) {
        if (!r.inner) continue;
        const shift = (r as { shift?: number }).shift ?? 0;
        /* v13 V13-02 (Wil's #2). The shift above is arithmetically right and
           v12 still measured 16 / 57.16 / 57.16, because keen's own
           `.keen-slider__slide { overflow: hidden }` clipped the translation
           straight back: every card from the second out on each side lost
           41.16px of its OWN painting off its inboard edge (measured at every
           width from 1024 up), which both re-opened the gap to 16 + 41.16 and
           left the hard vertical cut mid-artwork that reads as "ends cut off".
           The slide is a LAYOUT box, not a frame — the frame is the container,
           which still clips, plus its edge mask. Written inline, from the same
           `wide` flag as the shift, so the two can never disagree; cleared
           below 1024, where nothing is shifted and HEAD's clip is unchanged. */
        if (r.slide) r.slide.style.overflow = wide ? "visible" : "";
        r.inner.style.transform = shift
          ? `translateX(${shift.toFixed(2)}px) scale(${r.scale.toFixed(4)})`
          : `scale(${r.scale.toFixed(4)})`;
        /* Juror pass 7 (M9): scale about the edge NEAREST the active card, so
           the neighbour recedes away from the centre and the layout peek
           (16.8 px at 360, 19 px at 390) stays fully visible — about its own
           centre the near edge slid 12 px inward and the peek read as 5–7 px.
           Bottoms stay aligned (origin on the bottom edge). */
        r.inner.style.transformOrigin = r.off > 0.01 ? "left bottom" : r.off < -0.01 ? "right bottom" : "center bottom";
        /* v13 V13-02 item 3a — the anti-sliver rule. A card the strip comes to
           rest on showing a hairline of is not a peek, it is an accident: at
           2560 the fifth card can settle with 28px of itself inside the frame.
           The ramp is continuous, so a drag never pops it in or out. Geometry
           only — keen's own fractions, no layout reads inside the write pass.
           v14.3 (Wil, 9/16, item 4 — "not ghosted"): v13 faded anything under
           a quarter visible (0 at 6%, 1 at 25%), so a card leaving the frame
           went to mist while ~118px of it still showed, on top of the edge
           mask. The band is now 8.5% → 16.5% (0 below ~40px of a 473px card,
           whole above ~78px): every resting sliver this rule exists for reads
           exactly 0 — 2560 rests at 5.9% (28px), 1600 at 7.9% (37px), 1536 at
           1.1% (measured, pixel alpha 0) — and everything wider is a partial
           the 48px mask edge handles (1680's 77px rests at .98). Same slope as
           v13's ramp, so a 5px drag step still moves opacity by ≤ .13.
           Revert: `frac < 0.25` / `(frac - 0.06) / 0.19`. */
        let op = "";
        if (wide && contW > 0) {
          const L = r.dist * contW + shift;
          const pw = r.w * r.scale;
          const pl = r.off > 0.01 ? L : r.off < -0.01 ? L + r.w - pw : L + (r.w - pw) / 2;
          const visible = Math.max(0, Math.min(pl + pw, contW) - Math.max(pl, 0));
          const frac = pw > 0 ? visible / pw : 1;
          if (frac < 0.165) op = Math.max(0, (frac - 0.085) / 0.08).toFixed(3);
        }
        if (r.inner.style.opacity !== op) r.inner.style.opacity = op;
      }
    },
  });

  // Keep slider in sync when focus/tour set the index programmatically —
  // never while a finger or an animation owns the strip.
  useEffect(() => {
    const inst = sliderInstance.current;
    if (!inst || !focused) return;
    if (dragRef.current || inst.animator.active) return;
    if (inst.track.details.rel !== activeIdx) inst.moveToIdx(activeIdx);
    const t = setTimeout(() => {
      const i = sliderInstance.current;
      if (i && !dragRef.current && !i.animator.active && i.track.details.rel !== activeIdxRef.current) {
        i.moveToIdx(activeIdxRef.current, true, { duration: 0 });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [activeIdx, focused, sliderInstance]);

  // ——— The walk (v7 M4) — an abortable loop keyed on tourRun ———
  /** The map shell sits at the top of the page; entering the walk or a stop
   *  from a scrolled page would leave the fixed controls off-screen. v18: the
   *  line it returns to is the landing at T, never 0 (landShell). */
  const bringShellIntoView = () => landShell();
  const runTour = async (from: number) => {
    const map = mapRef.current;
    if (!map) return;
    bringShellIntoView();
    const run = ++tourRun.current;
    setWalk("walking");
    setFocused(true);
    setHintOpen(false);
    for (let i = from; i < stops.length; i++) {
      if (run !== tourRun.current || leavingRef.current) return;
      setActiveIdx(i);
      setMarkers(stops[i].label);
      if (reduced) {
        map.easeTo({ center: stops[i].coordinates, zoom: 17.5, offset: cardLift(), duration: 0 });
        await sleep(2500); // v7 V7-038: a gentler cadence for the cuts
      } else {
        map.flyTo({
          center: stops[i].coordinates,
          zoom: 17.8,
          pitch: 48,
          bearing: ((stops[i].order * 25) % 60) - 30,
          duration: 2600,
          offset: cardLift(),
          essential: false,
        });
        await sleep(3400);
      }
    }
    if (run !== tourRun.current || leavingRef.current) return;
    setWalk("done");
    followCamera(stops.length - 1);
  };
  const stopWalk = () => {
    tourRun.current++;
    mapRef.current?.stop();
    setWalk("idle");
    // never leave the camera frozen mid-arc
    followCamera(activeIdxRef.current);
  };
  const continueWalk = () => runTour(activeIdxRef.current);

  /* v7 V7-079: Escape closes the lens → pauses the walk → leaves focused. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lensRef.current) closeLens();
      else if (walkRef.current === "walking") pauseWalk();
      else if (focusedRef.current) backToOverview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pauseWalk, backToOverview, closeLens]);

  /* v14 E22 (client): "disable scrolling during 'Walk the Story' auto-advance"
     — touch, wheel, trackpad and keyboard — and give it back the moment the
     walk ends (`done`) or is cancelled (Stop, Escape, a card drag, a marker
     tap, the curtain): every exit leaves `walk === "walking"`, so that is the
     lock's whole lifetime. Event-level prevention, NOT `overflow: hidden` on
     <html> — hiding the desktop scrollbar resizes the 100dvh shell and shifts
     the camera mid-flight. Programmatic scrolls (bringShellIntoView) are not
     events and still run. The wheel is blocked over the map too: under
     cooperative gestures Mapbox lets a plain wheel through to the page (it
     only preventDefaults ⌘/Ctrl-zoom, on its own canvas listener, which runs
     before this one), so an exemption there would leave the map area
     scrolling the page. Typing and Space-on-a-button keep their defaults;
     Mapbox's own arrow-key pan already preventDefaults before this runs. The
     card strip also takes `touch-action: none` while walking (inline, below)
     so a vertical finger drag on the cards can never start a native scroll
     that Chrome would then refuse to cancel — keen's horizontal drag, which
     pauses the walk by design, is untouched. touchmove is captured, not
     bubbled: keen stopPropagation()s every touchmove on its container
     (measured 12/12), so a bubble listener here would never see a finger on
     the cards. Neither library reads the native defaultPrevented.

     v19 (round 20, Wil): "after they click this button and take the walk then
     the scrolling down into the next section of this screen should not be
     possible." The lock's lifetime is now the whole FOCUSED state — the view
     with the cards, whether the walk is running, paused or done — released by
     Back, Escape from a paused walk, or a navigation, exactly the exits that
     leave `focused`. The index below the map is reached from the overview. */
  useEffect(() => {
    if (!focused) return;
    const block = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
    const onKey = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key)) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      // Space on a button is activation, not scrolling
      if ((e.key === " " || e.key === "Spacebar") && t?.closest("button, [role='button'], summary")) return;
      e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [focused]);

  /* v7 M9: on phones the ☰ retreats while a stop is focused (a 360px top row
     cannot hold Back + Stop the walk + ☰); `Back` is the exit that brings it
     back. A separate attribute so Menu.astro's scroll handler can't fight it. */
  useEffect(() => {
    const menu = document.querySelector<HTMLElement>(".cnwm-menu");
    if (!menu) return;
    menu.dataset.walk = focused || lens ? "true" : "false";
    return () => {
      menu.dataset.walk = "false";
    };
  }, [focused, lens]);

  const navigateToStop = (stop: Stop) => {
    playCover(
      () => {
        location.href = `${baseUrl}/${stop.slug}`;
      },
      stop.label,
      true,
    );
  };

  /* ——— v7 X1: go quiet under the curtain ——— */
  useEffect(() => {
    const onCover = () => {
      leavingRef.current = true;
      tourRun.current++;
      if (flyTimeout.current) clearTimeout(flyTimeout.current);
      mapRef.current?.stop();
    };
    document.addEventListener("cnwm:curtain-cover", onCover);
    return () => document.removeEventListener("cnwm:curtain-cover", onCover);
  }, []);

  /* ——— v7 debug hook (`scripts/walk-check.mjs`) ———
   * A static site: exposing the map instance and a state snapshot on `window`
   * is harmless in production and lets the QA instruments assert camera,
   * carousel and walk state without poking at React internals. */
  useEffect(() => {
    const hook = {
      get map() {
        return mapRef.current;
      },
      slider: () => sliderInstance.current,
      get state() {
        return {
          focused: focusedRef.current,
          walk: walkRef.current,
          touring: walkRef.current === "walking",
          activeIdx: activeIdxRef.current,
          dragging: dragRef.current,
          leaving: leavingRef.current,
          lens: lensRef.current,
          hasToken,
        };
      },
      stops,
    };
    (window as unknown as { __troyMap?: typeof hook }).__troyMap = hook;
    return () => {
      delete (window as unknown as { __troyMap?: typeof hook }).__troyMap;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasToken) {
    return (
      <div className="grid min-h-[50dvh] place-items-center px-6 text-center">
        <div>
          <p className="t-meta">The interactive map is warming up</p>
          <p className="t-prose mx-auto mt-3 max-w-md">
            This build is missing its map key. Every location on the walk is listed
            below with addresses and links to each chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(el) => {
        /* v14.5: --map-e is declared on .map-shell (global.css). Read it from
           the shell itself rather than duplicating the expression here. */
        rootRef.current = el;
        shellRef.current = el?.closest<HTMLElement>(".map-shell") ?? el;
      }}
      /* v21 (round 27): `is-lens` while the lens is visible — the Mapbox
         controls fade under the fill (global.css), and Base.astro's edge
         sampler watches class changes, so <body> takes the fill's colour the
         moment the lens opens even where no transition ends (reduced motion). */
      className={`troymap-root relative h-full w-full bg-primary-2${lensVisible ? " is-lens" : ""}`}
      data-walk={focused && shellVisible ? "true" : "false"}
    >
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
        ref={lensShellRef}
        /* v21 (round 27, Wil): "fully immersive … one fill color only … edge to
           edge". The backdrop was `bg-black/70` over THIS layer's box; the
           canvas runs T above and E below it (the runways), and the bars are
           glass, so behind the address bar and the toolbar the live map showed
           undimmed while everything else was washed. The shell now covers the
           CANVAS's box with one opaque fill — geometry and colour in global.css
           (.map-shell .lens-shell) — and the runways come back as padding so
           the plate, caption and door keep exactly the geometry they had. */
        className="lens-shell absolute z-10 flex flex-col items-center justify-center"
        style={{
          opacity: lens ? 1 : 0,
          pointerEvents: lens ? "auto" : "none",
          padding: "var(--ui-inset)",
          paddingTop: "calc(var(--ui-inset) + 4px + var(--map-t))",
          paddingBottom: "calc(var(--ui-inset) + var(--map-e))",
          transition: `opacity ${lensFadeMs}ms var(--ease)`,
        }}
        /* Not raised until the fade is over: while it runs, focus is still on
           the (kept-mounted) "Back to today" door inside this subtree. */
        aria-hidden={!lensVisible}
        /* v21 (round 27): Base.astro's edge sampler prefers the NEAREST
           declared edge colour over an element's own paint (v14.2), and the
           map shell declares the canvas's grey — so the fill declares its own,
           the way the curtain panel does. Closed, the shell is
           pointer-events:none and the sampler never sees it. */
        data-edge-top="#1d1411"
        data-edge-bottom="#1d1411"
        /* v14 E25 (client): anything outside the plate closes the lens — the
           backdrop, the caption, the shell's own padding. A drag that starts
           ON the plate and ends outside must not: the box holds pointer
           capture, so its click retargets to the box, and the pointerdown
           record is the belt for an engine that retargets differently. The
           door and the +/−/reset buttons keep their own handlers. */
        onPointerDown={(e) => {
          lensDownInBox.current = !!lensBoxRef.current?.contains(e.target as Node);
        }}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (lensDownInBox.current || lensBoxRef.current?.contains(t) || t.closest("button")) return;
          closeLens();
        }}
      >
        <figure className="flex h-full max-h-full w-full flex-col items-center">
          {/* v7 L2: the viewer fills the shell (within --ui-inset), leaving one
              caption row and the Back-to-today door below it. */}
          {lensSeen && (
            <div
              ref={lensBoxRef}
              role="application"
              aria-label="Map of Troy in 1858: drag to pan, pinch or scroll to zoom, arrow keys to pan, plus and minus to zoom, 0 to reset"
              tabIndex={lens ? 0 : -1}
              className="artifact relative w-full min-h-0 flex-1 cursor-grab overflow-hidden"
              style={{ touchAction: "none" }}
              onPointerDown={lensPointerDown}
              onPointerMove={lensPointerMove}
              onPointerUp={lensPointerEnd}
              onPointerCancel={lensPointerEnd}
              onDoubleClick={lensDoubleClick}
              onKeyDown={lensKeyDown}
            >
              {/* v13 V13-07a (Wil's #4.3): the split used to be `min-width: 768px`
                  and nothing else, and the old note here ("~2 source pixels per
                  CSS pixel") was right about CSS pixels and exactly wrong about
                  devices — it never accounted for DPR. A 390px phone at DPR 3
                  with a 350px box was exhausting the 4096 file's own pixels at
                  s=3.9 and upscaling 1.54x the rest of the way to the ceiling.
                  Resolution, not width, now picks the tier: phones take 6144
                  (6144 / (350 x 6 x 3) = 0.975 source px per device px at the
                  ceiling), >=768 takes the new 8192 (tablet DPR 2:
                  8192 / (754 x 6 x 2) = 0.905). Above 6144 we ship AVIF only —
                  a non-AVIF browser keeps exactly the WebP it is served today.
                  Nothing mounts at all until the lens is first opened. */}
              <picture>
                <source media="(min-width: 768px)" type="image/avif" srcSet={`${baseUrl}/media/site/troy-1858-full-8192.avif`} />
                <source type="image/avif" srcSet={`${baseUrl}/media/site/troy-1858-full-6144.avif`} />
                <source media="(min-width: 768px)" type="image/webp" srcSet={`${baseUrl}/media/site/troy-1858-full-6144.webp`} />
                <img
                  ref={lensImgRef}
                  src={`${baseUrl}/media/site/troy-1858-full-4096.webp`}
                  alt="Map of Troy, New York in 1858: the full city survey, Troy, the Hudson, West Troy and Green Island"
                  draggable={false}
                  decoding="async"
                  className="absolute top-1/2 left-1/2 w-full max-w-none select-none"
                  /* v13 V13-01 item 4: `will-change` is written by lensPromote()
                     only while a gesture is moving the plate, never permanently. */
                  style={{ transformOrigin: "center", transform: "translate(-50%, -50%)" }}
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
                    tabIndex={lens ? 0 : -1}
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
          {/* v14 E25 (client): ONE line at every width, phones included (juror
              pass 8 had authored two there). `.lens-caption` (global.css) keeps
              it whole with nowrap and a phone-only size fit. */}
          <figcaption className="t-meta lens-caption mt-7 text-center">
            Troy, New&nbsp;York&nbsp;·&nbsp;1858&nbsp;·&nbsp;Library&nbsp;of&nbsp;Congress
          </figcaption>

          {/* v7 L3: the lens's ONE door — Back to today, centred.
              v13 V13-01 item 1: mounted for the whole CLOSE as well, so the
              68px it occupies never leaves the flex column on the frame the
              fade begins (that unmount was the measured 34px jump). It stops
              being a tab stop the instant the lens is no longer open. */}
          {lensVisible && (
            <button
              type="button"
              tabIndex={lens ? 0 : -1}
              onClick={closeLens}
              /* v12: "a bit more vertical spacing between the text… and the back to
                 today button" — plate→caption 20→28, caption→door 16→24. */
              className="btn-sm btn-ghost mt-6"
              style={{ background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)", minHeight: 44 }}
            >
              Back to today
            </button>
          )}
        </figure>
      </div>

      {/* v14 E2 (client): the "April 27, 1860" place chip (items 10/13) and the
          arrival name plate (M10) are gone. */}

      {/* Hint card (M8) — fully inert: it can never intercept a tap anywhere.
          It leaves on the first map gesture (the gesture it teaches) or on a
          timer, whichever comes first. */}
      {/* Juror pass 10 P2: from 1280 up the hint rides in the doors' row (left
          of the doors, right of the (i)) — BELOW the label-fit safe box, so no
          stop pill can sit under it; narrower screens keep it centred above. */}
      {hintOpen && (
        <div
          /* v13: the fourth raw safe-area offset on the site — below `xl:` the
             chip used raw Tailwind `bottom-*` while the `xl:` branch already
             routed through `--ui-inset` (20px at 360–640, 40px at 768–1024).
             Same position wherever the inset is 0; lifted clear of the home
             indicator where it is not. */
          className="pointer-events-none absolute bottom-[calc(var(--ui-inset)+156px)] left-1/2 z-20 w-max max-w-[86vw] -translate-x-1/2 sm:bottom-[calc(var(--ui-inset)+108px)] [@media(max-height:560px)]:bottom-[calc(var(--ui-inset)+60px)] xl:bottom-[calc(var(--ui-inset)+16px)] xl:left-[calc(var(--ui-inset)+36px)] xl:translate-x-0"
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

      {/* v7 M7: Back — top-left at the equal inset (the chip is hidden in
          focused mode). Phones read "Back", larger screens "Back to map". */}
      {focused && !lensVisible && (
        <button
          type="button"
          onClick={backToOverview}
          aria-label="Back to map"
          className="btn-sm btn-ghost btn-icon-start absolute top-[var(--ui-inset)] left-[var(--ui-inset)] z-30"
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
          <span>Back<span className="hidden sm:inline"> to map</span></span>
        </button>
      )}

      {/* v7 M3/M4: the walk control — top-right at the inset on every
          breakpoint, mirroring Back. Stop the walk ⇄ Continue; Walk again
          after stop 5. */}
      {focused && !lensVisible && (
        <button
          type="button"
          onClick={walk === "walking" ? stopWalk : walk === "done" ? () => runTour(0) : continueWalk}
          aria-label={
            walk === "walking" ? "Stop the walk" : walk === "done" ? "Walk again from the first location" : "Continue the walk"
          }
          className="btn-sm btn-solid absolute top-[var(--ui-inset)] right-[var(--ui-inset)] z-30"
        >
          {walk === "walking" ? "Stop the walk" : walk === "done" ? "Walk again" : "Continue"}
        </button>
      )}

      {/* Experience doors (overview only). v8 V8-203 (Wil, 00:10:19 +
          00:57:32): four corners on every breakpoint — the April-27 chip
          top-left, `See Troy in 1858` top-right (with the secondary border so
          it reads as a button), `Take the walk` centred at the bottom (phones:
          left-aligned with the chip's inset, centred on the ☰'s axis), ☰
          bottom-right; phones tuck the (i) beside the ☰. */}
      {/* v13 V13-01 item 2: `lensVisible`, not `lens` — the trio (chip, "Take
          the walk", the 1858 door) must not remount DURING the fade. The door
          carries `backdrop-filter: blur(6px)`, and remounting it under a live
          fading full-viewport layer forced a backdrop readback on every
          compositor frame of the close. */}
      {!focused && !lensVisible && (
        <>
          {/* v14 E2 (client): the corners are now — `See Troy in 1858` top-LEFT,
              ☰ top-right (the site-wide menu, as on every other page), `Take
              the walk` bottom-centre at EVERY width (phones included, by his
              allowance — the ☰ it used to align with has left the bottom row).
              Supersedes the v8 corner plan above. */}
          {/* v7 V7-023: the bottom band is a scroll handle on touch screens —
              a vertical drag here scrolls the page (the map swallows every
              other one); the buttons ride above it. */}
          <div
            className="map-scroll-handle absolute right-0 bottom-0 left-0 z-10 sm:hidden"
            style={{ height: "calc(var(--ui-inset) + 84px)", touchAction: "pan-y" }}
            aria-hidden="true"
          >
            {/* v14.3 (Wil, 9/16, item 5): the small orange down-arrow glyph
                that sat at the band's foot (12px, primary-11 at 60%, the
                broadside head rotated 90°) is gone — "remove this arrow here
                and anywhere else it exists in this form". The band itself
                stays: it is the touch scroll affordance, not the glyph.
                Revert: restore the `<svg className="absolute bottom-1
                left-1/2 h-3 w-3 …">` with the ICONS.arrow head path. */}
          </div>
          {/* v18 (round 19, Wil's screenshot 2): the door's bottom offset lives in
              global.css (.map-walk-door) — phones sit ON the inset, bottom-aligned
              with the (i) beside it; tablets and up keep inset + 12. */}
          <div className="map-walk-door absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
            <button type="button" onClick={() => runTour(0)} className="btn btn-solid">
              Take the walk
            </button>
          </div>
          <span className="absolute top-[var(--ui-inset)] left-[var(--ui-inset)] z-20 inline-flex">
            <button
              ref={lensDoorRef}
              type="button"
              onClick={() => {
                setLensSeen(true);
                setLens(true);
              }}
              className="link-meta t-meta rounded-full px-4 py-3 whitespace-nowrap"
              style={{
                background: "color-mix(in srgb, var(--color-primary-2) 82%, transparent)",
                backdropFilter: "blur(6px)",
                border: "1px solid var(--color-primary-7)",
                minHeight: 44,
              }}
            >
              See Troy in 1858
            </button>
          </span>
        </>
      )}

      {/* ——— The overlap carousel (approved) ———
          Always mounted: keen-slider re-initialization on remount landed on
          the wrong card (QA final defect 2); a live, measured instance obeys
          moveToIdx reliably. Visibility is opacity/pointer-events only.
          v19 (round 20): `.map-cards` — the strip's bottom padding is the
          door's lane (global.css `--map-lane`), so the cards sit where the
          walk door sat, at every width. */}
      {
        <div
          className="map-cards fixed right-0 bottom-0 left-0 z-10 transition-opacity duration-300"
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
            /* v14 E22: keen's own `touch-action: pan-y` returns the instant the
               strip is not in use. v19: for the whole focused state (the lock's
               lifetime), not only while the walk is running. */
            style={{ touchAction: focused ? "none" : undefined }}
          >
            {stops.map((stop, index) => {
              const isActive = index === activeIdx;
              return (
                <div
                  key={stop.slug}
                  className="keen-slider__slide walk-slide"
                >
                  {/* v7 M9: the scale is written by detailsChanged (continuous). */}
                  <div className="origin-bottom">
                    {/* Two-tap: inactive card focuses; active card navigates */}
                    <div
                      className="mx-auto flex h-[128px] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-primary-3 bg-primary-2 sm:h-[160px] lg:h-[192px]"
                      onClick={() => {
                        if (isActive) navigateToStop(stop);
                        else {
                          pauseWalk();
                          sliderInstance.current?.moveToIdx(index);
                        }
                      }}
                      role="button"
                      tabIndex={focused && isActive ? 0 : -1}
                      aria-label={
                        isActive
                          ? `Enter Location ${String(stop.order).padStart(2, "0")}: ${stop.canonical ?? stop.cardTitle.replace("\n", " ")}`
                          : `Focus Location ${String(stop.order).padStart(2, "0")}: ${stop.canonical ?? stop.cardTitle.replace("\n", " ")}`
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (isActive) navigateToStop(stop);
                          else {
                            pauseWalk();
                            sliderInstance.current?.moveToIdx(index);
                          }
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
                          <p className="t-meta leading-none">Location</p>
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
                          {/* v7 M6: `name.card` (authored two lines) as a type role. */}
                          <p className="t-card ml-1 text-left whitespace-pre-line">
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
