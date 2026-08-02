import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { playCover } from "../lib/curtain";

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

mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_TOKEN ?? "";
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

/** Marker stem direction per stop label (stops 2 & 5 sit ~50m apart — the
 * above/below split keeps their pills from colliding). */
const PIN_ABOVE = new Set(["Commissioner's Office"]);

const MARKER = {
  active: {
    scale: 0.9,
    bg: "#F26835",
    text: "#FED9CC",
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
function pillSizes() {
  const w = typeof window === "undefined" ? 390 : window.innerWidth;
  if (w >= 1024) return { font: 18, lh: 27, pad: 12 };
  if (w >= 768) return { font: 15, lh: 22.5, pad: 10 };
  return { font: 12, lh: 18, pad: 8 };
}

/** Approved marker: Poppins pill + 20px numbered chip + 2×30px stem + 8px
 * dot, above/below per stop. Pure inline styles — utility scanning can never
 * break these. */
function markerHtml(stop: Stop, active: boolean): string {
  const s = active ? MARKER.active : MARKER.inactive;
  const z = pillSizes();
  const stem = `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:2px;height:30px;background:${s.line}"></div>
      <div style="width:8px;height:8px;border-radius:9999px;background:${s.line}"></div>
    </div>`;
  const stemUp = `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:8px;height:8px;border-radius:9999px;background:${s.line}"></div>
      <div style="width:2px;height:30px;background:${s.line}"></div>
    </div>`;
  const pill = `
    <div style="display:flex;align-items:center;justify-content:center;padding:${z.pad}px;border-radius:30px;background:${s.bg};color:${s.text};border:1px solid ${s.border};font-family:var(--font-poppins),sans-serif;font-weight:500">
      <div style="display:flex;align-items:center;justify-content:center;border-radius:9999px;margin-right:6px;background:#E45B27;width:20px;height:20px">
        <p style="color:#FED9CC;font-size:11px;margin:0">${stop.order}</p>
      </div>
      <p style="font-size:${z.font}px;line-height:${z.lh}px;margin:0;white-space:nowrap">${stop.label}</p>
    </div>`;
  const above = PIN_ABOVE.has(stop.label);
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:scale(${s.scale});transition:transform 300ms ease-in-out">
      ${above ? stemUp + pill : pill + stem}
    </div>`;
}

function lerpRoute(stops: Stop[], per = 60): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const [ax, ay] = stops[i].coordinates;
    const [bx, by] = stops[i + 1].coordinates;
    for (let t = 0; t < per; t++) {
      const f = t / per;
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
  const markersRef = useRef<{ marker: mapboxgl.Marker; stop: Stop }[]>([]);

  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lens, setLens] = useState(false);
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
  const setMarkers = useCallback((activeLabel: string | null) => {
    activeLabelRef.current = activeLabel;
    for (const { marker, stop } of markersRef.current) {
      marker.getElement().innerHTML = markerHtml(stop, stop.label === activeLabel);
    }
  }, []);

  // Pills re-render on breakpoint change so the ladder holds live
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setMarkers(activeLabelRef.current), 200);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setMarkers]);

  /** The approved overview on desktop; on narrow screens, the same tilt but
   * framed to fit all five pills (QA: fixed 15.25 clipped stops at 390). */
  const overviewCamera = useCallback(() => {
    const map = mapRef.current;
    if (!map || window.innerWidth >= 640) return OVERVIEW;
    const b = new mapboxgl.LngLatBounds();
    stops.forEach((s) => b.extend(s.coordinates));
    const cam = map.cameraForBounds(b, {
      padding: { top: 120, bottom: 200, left: 48, right: 48 },
      bearing: OVERVIEW.bearing,
    });
    return cam
      ? {
          center: cam.center as [number, number],
          zoom: cam.zoom as number,
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
      if (reduced) {
        map.jumpTo({ center: stop.coordinates, zoom: 18.5 });
      } else {
        map.flyTo({ center: stop.coordinates, zoom: 20, speed: 0.6, curve: 1.4, essential: true });
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
    });
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
    // On a walking tour, distance is content (blueprint M8)
    map.addControl(new mapboxgl.ScaleControl({ unit: "imperial" }), "bottom-left");

    map.on("load", () => {
      // Markers
      markersRef.current = stops.map((stop) => {
        const el = document.createElement("button");
        el.type = "button";
        el.style.background = "none";
        el.style.border = "0";
        el.style.padding = "0";
        el.innerHTML = markerHtml(stop, false);
        el.setAttribute(
          "aria-label",
          `Stop ${stop.order}: ${stop.cardTitle}${stop.plaque ? "" : " (no plaque — website only)"}`,
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
          anchor: PIN_ABOVE.has(stop.label) ? "top" : "bottom",
        })
          .setLngLat(stop.coordinates)
          .addTo(map);
        return { marker, stop };
      });

      // The route draws itself (M5); instant under reduced motion
      const route = lerpRoute(stops);
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: reduced ? route : [route[0]] },
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#F26835", "line-width": 3.5, "line-dasharray": [0.1, 2], "line-opacity": 0.85 },
      });
      if (!reduced) {
        let i = 1;
        const draw = () => {
          i += 3;
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData({
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: route.slice(0, i) },
          });
          if (i < route.length) requestAnimationFrame(draw);
        };
        setTimeout(() => requestAnimationFrame(draw), 1200);
      }

      if (arriving) {
        // QR / deep-link cinematic arrival (M3): 5s ease onto the stop.
        // Skippable like every flight — any touch cuts to the destination.
        setFocused(true);
        setActiveIdx(deepIdx);
        setMarkers(stops[deepIdx].label);
        setArrivalStop(stops[deepIdx]);
        setTimeout(() => setArrivalStop(null), 5200);
        if (reduced) map.jumpTo({ center: stops[deepIdx].coordinates, zoom: 18.5, pitch: OVERVIEW.pitch, bearing: OVERVIEW.bearing });
        else
          map.easeTo({
            center: stops[deepIdx].coordinates,
            zoom: 20,
            pitch: OVERVIEW.pitch,
            bearing: OVERVIEW.bearing,
            duration: 5000,
            curve: 1.4,
            essential: true,
          } as Parameters<mapboxgl.Map["easeTo"]>[0]);
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
      // One skip rule for every arrival flight: touch = cut (guardrail F1).
      // The same first touch also clears the hint — it must never eat a tap.
      const skip = () => {
        map.stop();
        setHintOpen(false);
      };
      map.once("pointerdown", skip);
      map.once("wheel", skip);

      // First visit hint (M8)
      if (!sessionStorage.getItem("cnwm-map-hint") && !arriving) {
        setHintOpen(true);
      }
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
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

  const [sliderRef, sliderInstance] = useKeenSlider({
    slides: { perView: "auto", spacing: -20, origin: "center" },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: "auto", spacing: 16, origin: "center" } },
    },
    mode: "snap",
    initial: activeIdx,
    rubberband: false,
    renderMode: "performance",
    defaultAnimation: { duration: 400, easing: (t: number) => t },
    slideChanged: (s) => setActiveIdx(s.track.details.rel),
    animationEnded: (s) => {
      const idx = s.track.details.rel;
      setActiveIdx(idx);
      if (!touringRef.current && focusedRef.current) debouncedFly(idx);
    },
  });

  // Keep slider in sync when focus/tour set the index programmatically
  useEffect(() => {
    const inst = sliderInstance.current;
    if (inst && focused && inst.track.details.rel !== activeIdx) {
      inst.moveToIdx(activeIdx);
    }
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

  const dismissHint = () => {
    setHintOpen(false);
    sessionStorage.setItem("cnwm-map-hint", "1");
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
          <p className="type-label">The interactive map is warming up</p>
          <p className="type-body mx-auto mt-3 max-w-md">
            This build is missing its map key. Every stop on the walk is listed
            below with addresses and links to each chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-shell relative h-[100dvh] w-full">
      <div ref={container} className="map-canvas absolute inset-0" />

      {/* 1860 lens (M7) — Mark Priest's map of Troy, in the approved frame */}
      <div
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/70 p-4 transition-opacity duration-700 sm:p-10"
        style={{ opacity: lens ? 1 : 0 }}
        aria-hidden={!lens}
      >
        <figure className="max-h-full">
          <img
            src={`${baseUrl}/media/site/troy-1860-1440.jpg`}
            srcSet={`${baseUrl}/media/site/troy-1860-800.webp 800w, ${baseUrl}/media/site/troy-1860-1440.webp 1440w`}
            sizes="100vw"
            alt="Map of Troy, New York in 1860 — painting by Mark Priest"
            className="frame max-h-[75dvh] w-auto"
          />
          <figcaption className="type-label mt-4 text-center">
            Troy, New York · 1860 — painted by Mark Priest
          </figcaption>
        </figure>
      </div>

      {/* Place label */}
      <div className="pointer-events-none absolute top-0 left-0 z-20 p-4 sm:p-6">
        <p
          className="type-label rounded-full px-4 py-2"
          style={{ background: "color-mix(in srgb, var(--color-primary-2) 75%, transparent)" }}
        >
          The Walk · Five stops · April 27, 1860
        </p>
      </div>

      {/* Arrival name plate (M10) — the flight lands on a spoken line */}
      {arrivalStop && (
        <div className="pointer-events-none absolute top-16 left-1/2 z-20 w-max max-w-[86vw] -translate-x-1/2 sm:top-20">
          <div className="frame bg-primary-3 px-5 py-3 text-center">
            <p className="type-label">Stop {arrivalStop.order} of {stops.length}</p>
            <p className="type-card-title mt-1 uppercase">{arrivalStop.cardTitle}</p>
          </div>
        </div>
      )}

      {/* Hint card (M8) — parked above the doors, never eats a map tap:
          the container passes pointers through; only the X is interactive */}
      {hintOpen && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 w-max max-w-[86vw] -translate-x-1/2 sm:bottom-28">
          <div className="frame pointer-events-auto flex items-center gap-3 bg-primary-3 py-2 pr-2 pl-4">
            <p className="type-label">Drag to explore · Tap a stop</p>
            <button
              type="button"
              onClick={dismissHint}
              aria-label="Dismiss hint"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 hover:bg-primary-5"
            >
              <svg width="12" height="12" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M21 1L1 21M1 1L21 21" stroke="#F26835" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Back to overview */}
      {focused && !touring && (
        <button
          type="button"
          onClick={backToOverview}
          className="absolute top-14 left-4 z-20 flex cursor-pointer items-center gap-2 rounded-full border border-primary-6 bg-primary-3 px-4 py-2.5 text-sm font-medium text-primary-11 transition-colors duration-300 hover:bg-primary-5 hover:text-primary-12 sm:top-16 sm:left-6"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#F26835" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Overview
        </button>
      )}

      {/* Experience doors (overview only) */}
      {!focused && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={touring ? stopTour : tour}
            className="cursor-pointer rounded-full border border-primary-6 bg-primary-4 px-5 py-2.5 text-sm font-medium text-primary-11 transition-all duration-300 hover:bg-primary-5 hover:text-primary-12"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Take the walk
          </button>
          <button
            type="button"
            onClick={() => setLens((v) => !v)}
            aria-pressed={lens}
            className="cursor-pointer rounded-full border border-primary-8 px-5 py-2.5 text-sm font-medium text-primary-11 transition-all duration-300 hover:text-primary-12"
            style={{
              fontFamily: "var(--font-poppins)",
              background: "color-mix(in srgb, var(--color-primary-2) 60%, transparent)",
            }}
          >
            {lens ? "Back to today" : "See Troy in 1860"}
          </button>
        </div>
      )}

      {/* Stop the tour */}
      {touring && (
        <div className="absolute bottom-44 left-1/2 z-30 -translate-x-1/2 sm:bottom-52">
          <button
            type="button"
            onClick={stopTour}
            className="cursor-pointer rounded-full border border-primary-6 bg-primary-4 px-5 py-2.5 text-sm font-medium text-primary-11 transition-colors duration-300 hover:bg-primary-5 hover:text-primary-12"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Stop the walk
          </button>
        </div>
      )}

      {/* ——— The overlap carousel (approved) ——— */}
      {focused && (
        <div className="fixed right-0 bottom-0 left-0 z-10 pb-24 sm:pb-6">
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
                    className={`origin-bottom transition-transform duration-300 ease-out ${isActive ? "scale-100" : "scale-85"}`}
                  >
                    {/* Two-tap: inactive card focuses; active card navigates */}
                    <div
                      className="mx-auto flex h-[128px] w-[343px] cursor-pointer overflow-hidden rounded-xl border-2 border-primary-3 bg-primary-2 sm:h-[160px] sm:w-[428.75px] lg:h-[192px] lg:w-[514.5px]"
                      onClick={() => {
                        if (isActive) navigateToStop(stop);
                        else sliderInstance.current?.moveToIdx(index);
                      }}
                      role="button"
                      tabIndex={isActive ? 0 : -1}
                      aria-label={
                        isActive
                          ? `Enter Chapter ${stop.order}: ${stop.cardTitle}`
                          : `Focus stop ${stop.order}: ${stop.cardTitle}`
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
                        <img
                          src={`${baseUrl}/media/${stop.slug}/square-800.webp`}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-[128px] w-[128px] border-r border-primary-6 object-cover sm:h-[160px] sm:w-[160px] lg:h-[192px] lg:w-[192px]"
                        />
                      </div>
                      <div className="flex h-full w-2/3 flex-col justify-between p-3">
                        <div className="m-1 flex flex-row items-center justify-between">
                          <p className="type-label leading-none">Chapter</p>
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-10 sm:h-5 sm:w-5 lg:h-6 lg:w-6">
                            <p
                              className="mt-0.5 text-[.625rem] leading-none font-medium text-primary-12 sm:text-[0.78125rem] lg:text-[.9375rem]"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {stop.order}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="ml-1 text-left text-[1.125rem] leading-tight font-normal text-primary-12 sm:text-[1.40625rem] lg:text-[1.6875rem]">
                            {stop.cardTitle}
                          </p>
                          <div className="mr-3 ml-1 flex flex-row items-center" aria-hidden="true">
                            <svg
                              className="-mb-1 h-auto w-full"
                              viewBox="0 0 120 10"
                              preserveAspectRatio="none"
                              fill="none"
                            >
                              <path d="M0 5H114" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M110 1L118 5L110 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
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
      )}
    </div>
  );
}
