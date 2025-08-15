import { create } from 'zustand';
import mapboxgl from 'mapbox-gl';
import { LOCATIONS, MAP_CONFIG } from '../components/map/constants';
import { createMarkerElement, getFlyToParams } from '../components/map/utils';

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Hold the map instance outside the store's state
let mapInstance = null;
// Store markers to update them later
let markers = [];

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
            // Clear existing markers
            markers.forEach(marker => marker.remove());
            markers = [];

            // Create custom markers only for locations where showPin is true or not explicitly set to false
            LOCATIONS.filter(location => location.showPin !== false)
                .forEach((location, index) => {
                    const isActive = initialLocationName && location.name === initialLocationName;
                    const markerDiv = createMarkerElement(location.name, index + 1, isActive);

                    const marker = new mapboxgl.Marker({ element: markerDiv })
                        .setLngLat(location.coordinates)
                        .addTo(map);

                    markerDiv.addEventListener('click', () => {
                        get().flyToLocation(location);
                    });

                    // Store marker reference and location name for later updates
                    markers.push({
                        marker,
                        locationName: location.name,
                        index: index + 1
                    });
                });

            // Initial zoom - only if initialLocationName is provided
            if (initialLocationName) {
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
            } else {
                // Stay in overview mode
                set({ selectedLocation: null, isOverview: true });
            }
        });

        // Store the instance in the module-scoped variable
        mapInstance = map;
    },

    // Action to destroy the map instance
    destroyMap: () => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null; // Clear the instance
            markers = []; // Clear markers
            set({ selectedLocation: null, isOverview: true }); // Reset state
        }
    },

    // Helper to update marker styles
    updateMarkerStyles: (selectedLocationName) => {
        markers.forEach(({ marker, locationName, index }) => {
            const isActive = locationName === selectedLocationName;
            const markerDiv = createMarkerElement(locationName, index, isActive);
            marker.getElement().innerHTML = markerDiv.innerHTML;
        });
    },

    // Action to fly to a specific location
    flyToLocation: (loc) => {
        if (!mapInstance) return;

        const newSelectedLocation = loc.name;
        set({ selectedLocation: newSelectedLocation, isOverview: false });

        // Update marker styles
        get().updateMarkerStyles(newSelectedLocation);

        mapInstance.flyTo(getFlyToParams(loc.coordinates));
    },

    // Action to return to the overview state
    handleBackToOverview: () => {
        if (!mapInstance) return;

        set({ selectedLocation: null, isOverview: true });

        // Update marker styles (none active)
        get().updateMarkerStyles(null);

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