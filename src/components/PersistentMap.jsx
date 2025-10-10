import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CONFIG } from './map/constants';

// ============================================================================
// Singleton Map Instance - Lives outside React, initialized exactly once
// ============================================================================

let mapInstance = null;
let mapReadyPromise = null;
let isInitializing = false;

/**
 * Get or create the singleton map instance.
 * @param {HTMLDivElement} container - The DOM element to mount the map
 * @returns {Promise<mapboxgl.Map>} Promise that resolves to the map instance
 */
function getMapInstance(container) {
    // If map exists, return it immediately
    if (mapInstance) {
        return Promise.resolve(mapInstance);
    }

    // If already initializing, return existing promise
    if (mapReadyPromise) {
        return mapReadyPromise;
    }

    // Prevent double initialization (React StrictMode guard)
    if (isInitializing) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (mapInstance) {
                    clearInterval(checkInterval);
                    resolve(mapInstance);
                }
            }, 50);
        });
    }

    isInitializing = true;

    // Initialize map exactly once
    mapReadyPromise = new Promise((resolve) => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN';

        mapInstance = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v12', // Replace with your style
            center: [-77.6088, 39.2904], // Replace with your center
            zoom: 12,
            attributionControl: true,
            preserveDrawingBuffer: true,
            // Keep defaults conservative; add fancy features later
        });

        // Wait for map to be fully loaded and idle before resolving
        mapInstance.once('idle', () => {
            isInitializing = false;
            console.log('🗺️ Persistent map instance initialized');
            resolve(mapInstance);
        });

        // Error handling
        mapInstance.on('error', (e) => {
            console.error('Mapbox error:', e);
        });
    });

    return mapReadyPromise;
}

/**
 * Get the existing map instance (assumes already initialized)
 * @returns {mapboxgl.Map|null}
 */
export function getMap() {
    return mapInstance;
}

/**
 * Show the map with proper resize handling
 */
export function showMap(center, zoom, options = {}) {
    const rootEl = document.getElementById('persistent-map-root');
    if (!rootEl) return;

    rootEl.style.visibility = 'visible';
    rootEl.style.opacity = '1';
    rootEl.style.pointerEvents = 'auto';

    // Ensure map resizes after CSS settles
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const performFly = (map) => {
                if (!map) return;
                map.resize();
                console.log('🗺️ Map shown and resized');

                const targetCenter = Array.isArray(center) ? center : (MAP_CONFIG?.initialCenter || map.getCenter());
                const targetZoom = typeof zoom === 'number' ? zoom : (MAP_CONFIG?.defaultZoom ?? map.getZoom());

                // Ensure style is ready before animating
                const startFly = () => {
                    try {
                        map.stop();

                        // First, jump to high altitude over Troy (simulate "from space" view)
                        const troyCenter = MAP_CONFIG?.initialCenter || [-73.6948, 42.7240];
                        map.jumpTo({
                            center: troyCenter,
                            zoom: 5, // Very high up - "space view"
                            pitch: 0,
                            bearing: 0,
                        });

                        // Then animate zooming down to the target location
                        // Small delay to ensure the jumpTo completes
                        setTimeout(() => {
                            map.flyTo({
                                center: targetCenter,
                                zoom: targetZoom,
                                pitch: MAP_CONFIG?.defaultPitch || 50,
                                bearing: MAP_CONFIG?.defaultBearing || 9,
                                duration: 5000, // ~5s for dramatic zoom-in effect
                                curve: 1.8, // Higher curve for more dramatic arc
                                essential: true,
                                ...options,
                            });
                        }, 100);
                    } catch (e) {
                        console.warn('FlyTo failed:', e);
                    }
                };

                if (map.isStyleLoaded()) {
                    startFly();
                } else {
                    map.once('idle', startFly);
                }
            };

            if (mapInstance) {
                performFly(mapInstance);
            } else {
                // Attempt initialization if the container exists
                const containerEl = document.getElementById('persistent-map-container');
                if (containerEl) {
                    getMapInstance(containerEl).then((map) => performFly(map));
                }
            }
        });
    });
}

/**
 * Hide the map (but keep it alive)
 */
export function hideMap() {
    const rootEl = document.getElementById('persistent-map-root');
    if (!rootEl) return;

    rootEl.style.opacity = '0';
    rootEl.style.pointerEvents = 'none';

    // Use visibility after opacity transition for better performance
    setTimeout(() => {
        if (rootEl.style.opacity === '0') {
            rootEl.style.visibility = 'hidden';
        }
    }, 300); // Match your CSS transition duration

    console.log('🗺️ Map hidden');
}

/**
 * Check if map is currently visible
 */
export function isMapVisible() {
    const rootEl = document.getElementById('persistent-map-root');
    return rootEl ? rootEl.style.visibility !== 'hidden' && rootEl.style.opacity !== '0' : false;
}

/**
 * Fly to a location (convenience method)
 */
export function flyToLocation(center, zoom = 14, options = {}) {
    if (!mapInstance) {
        console.warn('Map not initialized yet');
        return;
    }

    mapInstance.flyTo({
        center,
        zoom,
        speed: 0.8,
        curve: 1.42,
        essential: true,
        ...options,
    });
}

/**
 * Update map visibility for a layer (avoid style replacement)
 */
export function setLayerVisibility(layerId, visible) {
    if (!mapInstance) return;

    try {
        mapInstance.setLayoutProperty(
            layerId,
            'visibility',
            visible ? 'visible' : 'none'
        );
    } catch (e) {
        console.warn(`Layer ${layerId} not found:`, e);
    }
}

// ============================================================================
// React Component - Mounts once, never unmounts
// ============================================================================

/**
 * PersistentMapCanvas - The map container component
 * This should be mounted at the root level and never unmounted
 */
export function PersistentMapCanvas() {
    const containerRef = useRef(null);
    const initAttemptedRef = useRef(false);

    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (initAttemptedRef.current) return;
        initAttemptedRef.current = true;

        let mounted = true;

        if (containerRef.current) {
            getMapInstance(containerRef.current)
                .then((map) => {
                    if (!mounted) return;
                    console.log('🗺️ Map canvas ready');

                    // showMap();

                    // Optional: Add any initial setup here
                    // Example: add navigation controls
                    // map.addControl(new mapboxgl.NavigationControl(), 'top-right');
                })
                .catch((err) => {
                    console.error('Failed to initialize map:', err);
                });
        }

        return () => {
            mounted = false;
            // DO NOT destroy the map here - it stays alive for the entire app lifecycle
        };
    }, []);

    return (
        <div
            ref={containerRef}
            id="persistent-map-container"
            className="w-full h-full absolute inset-0"
        />
    );
}

/**
 * PersistentMapRoot - The root wrapper component
 * This provides the fixed container that persists across route changes
 */
export default function PersistentMapRoot() {
    return (
        <div
            id="persistent-map-root"
            className="fixed inset-0 z-0 bg-black invisible opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out will-change-[opacity,visibility]"
        >
            <PersistentMapCanvas />
        </div>
    );
}

// ============================================================================
// Usage Instructions (in comments for reference)
// ============================================================================

/*
USAGE:

1. Mount PersistentMapRoot at your app's root level (in App.jsx or main layout):

   import PersistentMapRoot from './components/PersistentMap';
   
   function App() {
     return (
       <>
         <PersistentMapRoot />
         <div id="app-content" style={{ position: 'relative', zIndex: 1 }}>
           {your routes and content}
         </div>
       </>
     );
   }

2. Control visibility from anywhere in your app:

   import { showMap, hideMap, flyToLocation, getMap } from './components/PersistentMap';
   
   // Show the map
   showMap();
   
   // Hide the map
   hideMap();
   
   // Fly to a location
   flyToLocation([-122.4194, 37.7749], 13);
   
   // Access the map directly for advanced usage
   const map = getMap();
   if (map) {
     map.addLayer(...);
   }

3. Toggle layers instead of replacing style:

   import { setLayerVisibility } from './components/PersistentMap';
   
   setLayerVisibility('my-layer-id', true);  // show
   setLayerVisibility('my-layer-id', false); // hide

4. Add sources/layers once after initialization:

   import { getMap } from './components/PersistentMap';
   
   const map = getMap();
   if (map && !map.getSource('my-source')) {
     map.addSource('my-source', { ... });
     map.addLayer({ ... });
   }

IMPORTANT:
- Never unmount PersistentMapRoot
- Use showMap()/hideMap() instead of conditional rendering
- Call map.resize() after any layout changes (already handled in showMap())
- Keep one style and toggle layer visibility instead of calling setStyle()
- The map is initialized once and reused throughout the app lifecycle
*/

