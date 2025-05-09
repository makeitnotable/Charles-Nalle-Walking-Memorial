import { create } from 'zustand';
import mapboxgl from 'mapbox-gl';
import { LOCATIONS, MAP_CONFIG } from '../components/map/constants';
import { createMarkerElement, getFlyToParams } from '../components/map/utils';

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Hold the map instance outside the store's state
let mapInstance = null;

export const useMapStore = create((set, get) => ({
    selectedLocation: null,
    isOverview: true,
    mapboxAccessToken: mapboxAccessToken,

    // Action to initialize the map
    initializeMap: (mapContainerRef, initialLocationName, interactive) => {
        if (mapInstance) return; // Already initialized

        mapboxgl.accessToken = get().mapboxAccessToken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: MAP_CONFIG.mapStyle,
            center: MAP_CONFIG.initialCenter,
            zoom: MAP_CONFIG.defaultZoom,
            pitch: MAP_CONFIG.defaultPitch,
            bearing: MAP_CONFIG.defaultBearing,
            maxBounds: MAP_CONFIG.maxBounds,
            interactive: interactive,
        });

        map.on('load', () => {
            // Create custom markers
            LOCATIONS.forEach((location, index) => {
                const markerDiv = createMarkerElement(location.name, index + 1);

                new mapboxgl.Marker({ element: markerDiv })
                    .setLngLat(location.coordinates)
                    .addTo(map);

                markerDiv.addEventListener('click', () => {
                    get().flyToLocation(location);
                });
            });

            // Initial zoom
            const initialLocation = LOCATIONS.find((loc) => loc.name === initialLocationName);
            if (initialLocation) {
                map.easeTo({
                    center: initialLocation.coordinates,
                    zoom: 20,
                    curve: 1.4,
                    duration: 5000,
                    essential: true,
                });
                set({ selectedLocation: initialLocation.name, isOverview: false });
            }
        });

        // Store the instance in the module-scoped variable
        mapInstance = map;
        // No need to set it in the state anymore
        // set({ map });
    },

    // Action to destroy the map instance
    destroyMap: () => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null; // Clear the instance
            set({ selectedLocation: null, isOverview: true }); // Reset state
        }
    },

    // Action to fly to a specific location
    flyToLocation: (loc) => {
        if (!mapInstance) return;

        set({ selectedLocation: loc.name, isOverview: false });
        mapInstance.flyTo(getFlyToParams(loc.coordinates));
    },

    // Action to return to the overview state
    handleBackToOverview: () => {
        if (!mapInstance) return;

        set({ selectedLocation: null, isOverview: true });
        mapInstance.easeTo({
            center: MAP_CONFIG.initialCenter,
            zoom: MAP_CONFIG.defaultZoom,
            pitch: MAP_CONFIG.defaultPitch,
            bearing: MAP_CONFIG.defaultBearing,
            duration: 2000,
            essential: true,
        });
    },

    // You might want to keep navigation logic separate or pass navigate function if needed
})); 