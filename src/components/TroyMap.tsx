import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * The Walk: one map instance, created once. The route draws itself stop by
 * stop; a guided flythrough tours the five stops; the 1860 lens overlays
 * Mark Priest's map of Troy. Geolocation supports on-the-sidewalk visitors.
 *
 * Token: Mapbox *publishable* token (pk., client-side by design — same one
 * the legacy site shipped). Style is Wil's draft; publishing + migration to a
 * museum-owned account is a handoff step (docs/WIL-PLAYBOOK.md).
 */

mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE = "mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft";

export interface Stop {
  slug: string;
  order: number;
  label: string;
  cardTitle: string;
  address: string;
  coordinates: [number, number];
  accent: string;
  plaque: boolean;
}

interface Props {
  stops: Stop[];
  baseUrl: string;
}

const ROUTE_POINTS_PER_SEGMENT = 60;

function lerpRoute(stops: Stop[]): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const [ax, ay] = stops[i].coordinates;
    const [bx, by] = stops[i + 1].coordinates;
    for (let t = 0; t < ROUTE_POINTS_PER_SEGMENT; t++) {
      const f = t / ROUTE_POINTS_PER_SEGMENT;
      pts.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
    }
  }
  pts.push(stops[stops.length - 1].coordinates);
  return pts;
}

export default function TroyMap({ stops, baseUrl }: Props) {
  const hasToken = Boolean(mapboxgl.accessToken);
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selected, setSelected] = useState<Stop | null>(null);
  const [lens1860, setLens1860] = useState(false);
  const [touring, setTouring] = useState(false);
  const tourAbort = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!hasToken || !container.current || mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    stops.forEach((s) => bounds.extend(s.coordinates));

    const map = new mapboxgl.Map({
      container: container.current,
      style: STYLE,
      bounds,
      fitBoundsOptions: { padding: 90 },
      pitch: reduced ? 0 : 38,
      bearing: reduced ? 0 : 12,
    });
    mapRef.current = map;

    // A map initialized in a container that later gains height keeps a 300px
    // canvas unless told to remeasure — resize on load and on any container
    // dimension change.
    map.on("load", () => map.resize());
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right",
    );

    map.on("load", () => {
      const route = lerpRoute(stops);

      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: reduced ? route : [route[0]] } },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#c2542b",
          "line-width": 3.5,
          "line-dasharray": [0.1, 2],
        },
      });

      // The route draws itself (reduced-motion users get it instantly)
      if (!reduced) {
        let i = 1;
        const draw = () => {
          i += 3;
          const src = map.getSource("route") as mapboxgl.GeoJSONSource;
          src.setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: route.slice(0, i) },
          });
          if (i < route.length) requestAnimationFrame(draw);
        };
        setTimeout(() => requestAnimationFrame(draw), 900);
      }

      // Numbered stop markers
      for (const stop of stops) {
        const el = document.createElement("button");
        el.className = "troy-marker";
        el.type = "button";
        el.innerHTML = `<span style="display:block;transform:rotate(45deg)">${stop.order}</span>`;
        el.setAttribute(
          "aria-label",
          `Stop ${stop.order}: ${stop.cardTitle}${stop.plaque ? "" : " (no plaque — website only)"}`,
        );
        el.style.setProperty("--marker-accent", stop.accent);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelected(stop);
          map.easeTo({ center: stop.coordinates, zoom: 16.5, duration: reduced ? 0 : 900 });
        });
        new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(stop.coordinates)
          .addTo(map);
      }
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const tour = async () => {
    const map = mapRef.current;
    if (!map || touring) return;
    setTouring(true);
    tourAbort.current = false;
    setSelected(null);
    for (const stop of stops) {
      if (tourAbort.current) break;
      setSelected(stop);
      map.flyTo({
        center: stop.coordinates,
        zoom: 16.8,
        pitch: reduced ? 0 : 48,
        bearing: reduced ? 0 : (stop.order * 25) % 60 - 30,
        duration: reduced ? 0 : 2600,
        essential: false,
      });
      await new Promise((r) => setTimeout(r, reduced ? 600 : 3400));
    }
    setTouring(false);
  };

  const stopTour = () => {
    tourAbort.current = true;
    setTouring(false);
  };

  if (!hasToken) {
    // No token in this build — the static stop list below the map island
    // remains the page's content. Plain-language state, no dead canvas.
    return (
      <div className="grid min-h-[50dvh] place-items-center px-6 text-center">
        <div>
          <p className="label-caps">The interactive map is warming up</p>
          <p className="mx-auto mt-3 max-w-md opacity-80">
            This build is missing its map key. Every stop on the walk is
            listed below with addresses and links to each chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-shell relative h-[100dvh] w-full">
      <div ref={container} className="map-canvas absolute inset-0" />

      {/* 1860 lens — Mark Priest's map of Troy as a crossfading overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/70 p-4 transition-opacity duration-700 sm:p-10"
        style={{ opacity: lens1860 ? 1 : 0 }}
        aria-hidden={!lens1860}
      >
        <figure className="max-h-full">
          <img
            src={`${baseUrl}/media/site/troy-1860-1440.jpg`}
            srcSet={`${baseUrl}/media/site/troy-1860-800.webp 800w, ${baseUrl}/media/site/troy-1860-1440.webp 1440w`}
            sizes="100vw"
            alt="Map of Troy, New York in 1860 — painting by Mark Priest"
            className="max-h-[78dvh] w-auto rounded-sm shadow-2xl"
          />
          <figcaption className="label-caps mt-3 text-center text-white/80">
            Troy, New York · 1860 — painted by Mark Priest
          </figcaption>
        </figure>
      </div>

      {/* Header strip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-6">
        <div>
          <p className="label-caps rounded bg-black/55 px-3 py-2 backdrop-blur-sm">
            The Walk · Five stops · Troy, NY
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 sm:bottom-8">
        <button
          type="button"
          onClick={touring ? stopTour : tour}
          className="rounded-full border border-white/25 bg-black/60 px-5 py-2.5 font-display text-sm backdrop-blur-md transition-colors hover:bg-black/80"
        >
          {touring ? "Stop the tour" : "Take the guided tour"}
        </button>
        <button
          type="button"
          onClick={() => setLens1860((v) => !v)}
          aria-pressed={lens1860}
          className="rounded-full border border-white/25 bg-black/60 px-5 py-2.5 font-display text-sm backdrop-blur-md transition-colors hover:bg-black/80"
        >
          {lens1860 ? "Back to today" : "See Troy in 1860"}
        </button>
      </div>

      {/* Stop card */}
      {selected && (
        <div
          className="absolute inset-x-3 bottom-3 z-30 overflow-hidden rounded-md border border-white/15 bg-[#14100c]/92 backdrop-blur-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
          role="dialog"
          aria-label={`Stop ${selected.order}: ${selected.cardTitle}`}
        >
          <img
            src={`${baseUrl}/media/${selected.slug}/square-800.webp`}
            alt=""
            className="h-36 w-full object-cover"
          />
          <div className="p-4">
            <p className="label-caps" style={{ color: selected.accent }}>
              Stop {selected.order} of {stops.length}
              {!selected.plaque && " · no plaque — website only"}
            </p>
            <h2 className="font-display mt-1 text-2xl">{selected.cardTitle}</h2>
            <p className="mt-1 text-sm opacity-70">{selected.address}</p>
            <div className="mt-4 flex gap-3">
              <a
                href={`${baseUrl}/${selected.slug}`}
                className="rounded border px-4 py-2 font-display text-sm"
                style={{ borderColor: selected.accent }}
              >
                Enter the chapter →
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded border border-white/20 px-4 py-2 text-sm opacity-80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
