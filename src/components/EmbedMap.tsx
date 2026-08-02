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
}

/** Approved active-state marker: Poppins pill + numbered chip + stem + dot. */
function markerEl(label: string, order: number): HTMLDivElement {
  const div = document.createElement("div");
  div.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:scale(0.9)">
      <div style="display:flex;align-items:center;justify-content:center;padding:8px;border-radius:30px;background:#F26835;color:#FED9CC;border:1px solid #F26835;font-family:var(--font-poppins),sans-serif;font-weight:500">
        <div style="display:flex;align-items:center;justify-content:center;border-radius:9999px;margin-right:6px;background:#E45B27;width:20px;height:20px">
          <p style="color:#FED9CC;font-size:11px;margin:0">${order}</p>
        </div>
        <p style="font-size:12px;line-height:18px;margin:0">${label}</p>
      </div>
      <div style="width:2px;height:30px;background:#F26835"></div>
      <div style="width:8px;height:8px;border-radius:9999px;background:#F26835"></div>
    </div>`;
  return div;
}

export default function EmbedMap({ coordinates, label, order, pitch, bearing, zoom }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken || !container.current || mapRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = new mapboxgl.Map({
      container: container.current,
      style: STYLE,
      center: reduced ? coordinates : OVERVIEW.center,
      zoom: reduced ? zoom : OVERVIEW.zoom,
      pitch: reduced ? 0 : pitch,
      bearing: reduced ? 0 : bearing,
      interactive: false,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("load", () => map.resize());
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    new mapboxgl.Marker({ element: markerEl(label, order), anchor: "bottom" })
      .setLngLat(coordinates)
      .addTo(map);

    if (!reduced) {
      // The 5s cinematic arrival (legacy easeTo verbatim)
      map.on("load", () => {
        map.easeTo({
          center: coordinates,
          zoom,
          curve: 1.4,
          duration: 5000,
          essential: true,
        } as mapboxgl.EaseToOptions);
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
