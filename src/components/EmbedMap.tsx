import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * The embedded "Where to next" chapter map (approved signature #4, embed
 * variant): non-interactive, tilted per-chapter camera, a single approved
 * stem-and-dot marker on the next stop, 5s cinematic arrival ease
 * (legacy MapBox.jsx + useMapStore.js verbatim values).
 */

mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE = "mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft";
const OVERVIEW = { center: [-73.6948, 42.7235] as [number, number], zoom: 15.25 };

interface Props {
  /** Next stop coordinates (Brian's exact pin) */
  coordinates: [number, number];
  /** Marker pill text, e.g. "Bakery" */
  label: string;
  /** Stop number for the chip */
  order: number;
  /** Per-chapter embedded camera (legacy MAP_CONFIG.locationPage) */
  pitch: number;
  bearing: number;
  zoom: number;
  /** Item 20: the pin is a link to the next chapter; the map itself stays inert. */
  href?: string;
}

/** Approved active-state marker: chrome pill + numbered chip + stem + dot.
 * Item 20: the root is an <a> when href is given — the site-wide curtain
 * delegate picks the click up like any internal link. */
function markerEl(label: string, order: number, href?: string): HTMLElement {
  const font = typeof window !== "undefined" && window.innerWidth >= 1200 ? 13 : 12;
  const root = document.createElement(href ? "a" : "div");
  if (href && root instanceof HTMLAnchorElement) {
    root.href = href;
    root.setAttribute("data-curtain-label", label);
    root.setAttribute("data-curtain-date", "");
    root.setAttribute("aria-label", `Continue to ${label}`);
    root.style.cursor = "pointer";
    root.style.display = "block";
    root.style.textDecoration = "none";
  }
  /* v7 C5: a QUIET pill — dark ground, cream label, the numeral the only
     orange — so the section's one primary orange is the Continue button. */
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="display:flex;align-items:center;justify-content:center;padding:8px 12px 8px 8px;border-radius:30px;background:color-mix(in srgb, var(--color-primary-2) 88%, transparent);color:var(--color-neutral-12);border:1px solid var(--color-primary-7);backdrop-filter:blur(6px);font-family:var(--font-chrome),serif;font-weight:400;white-space:nowrap">
        <div style="display:flex;align-items:center;justify-content:center;border-radius:9999px;margin-right:8px;background:var(--color-primary-9);width:20px;height:20px">
          <p style="color:#1D1411;font-size:11px;margin:0;line-height:1;font-weight:700">${order}</p>
        </div>
        <p style="font-size:${font}px;line-height:18px;margin:0;letter-spacing:0.06em;text-transform:uppercase">${label}</p>
      </div>
      <div style="width:2px;height:26px;background:var(--color-primary-9)"></div>
      <div style="width:8px;height:8px;border-radius:9999px;background:var(--color-primary-9)"></div>
    </div>`;
  return root;
}

export default function EmbedMap({ coordinates, label, order, pitch, bearing, zoom, href }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken || !container.current || mapRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = new mapboxgl.Map({
      container: container.current,
      style: STYLE,
      center: reduced ? coordinates : OVERVIEW.center,
      // Reduced motion gets the framed destination immediately, not a flight.
      zoom: reduced ? zoom : OVERVIEW.zoom,
      pitch: reduced ? 0 : pitch,
      bearing: reduced ? 0 : bearing,
      interactive: false,
      /* v7 V7-045: Mapbox + OSM attribution is a licence requirement — the
         compact (i) control, bottom-right, styled by the same rules as /map. */
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    map.on("load", () => map.resize());
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    new mapboxgl.Marker({ element: markerEl(label, order, href), anchor: "bottom" })
      .setLngLat(coordinates)
      .addTo(map);

    if (!reduced) {
      // The 5s cinematic arrival (legacy easeTo verbatim)
      map.on("load", () => {
        // `offset` drops the destination into the lower third so the pill has
        // room above it — three of four chapter cards were clipping the label
        // or, on /mansion, framing no pin at all because the 5s flight had not
        // landed. 2.6s is inside the documented map-camera band (docs/v4/MOTION.md).
        map.easeTo({
          center: coordinates,
          zoom,
          offset: [0, 54],
          curve: 1.4,
          duration: 2600,
          essential: true,
        } as Parameters<mapboxgl.Map["easeTo"]>[0]);
      });
    }

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (!mapboxgl.accessToken) return null;

  return <div ref={container} className="map-canvas absolute inset-0" />;
}
