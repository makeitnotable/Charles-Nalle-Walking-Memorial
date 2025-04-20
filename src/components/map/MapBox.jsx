import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Menu from './Menu';
import { LOCATIONS, MAP_CONFIG } from './constants';
import { createMarkerElement, getFlyToParams } from './utils';
import LocationButtons from './LocationButtons';
import LocationCard from './LocationCard';
import BackButton from './BackButton';
const MapBox = ({ initialLocationName = 'Bakery', interactive = false, showButtons = true }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    // Map reference objects

    useEffect(() => {
        mapboxgl.accessToken = mapboxAccessToken;

        // Initialize map
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: MAP_CONFIG.mapStyle,
            center: MAP_CONFIG.initialCenter,
            zoom: MAP_CONFIG.defaultZoom,
            pitch: MAP_CONFIG.defaultPitch,
            bearing: MAP_CONFIG.defaultBearing,
            maxBounds: MAP_CONFIG.maxBounds,
            interactive: interactive,
        });

        mapRef.current.on('load', () => {
            // Create custom markers & popups without image references
            LOCATIONS.forEach((location, index) => {
                // Create marker element using utility function
                const markerDiv = createMarkerElement(location.name, index + 1);



                // Create and add the marker
                new mapboxgl.Marker({ element: markerDiv })
                    .setLngLat(location.coordinates)
                    .addTo(mapRef.current);

                // When the marker is clicked, fly to the location
                markerDiv.addEventListener('click', () => {

                    mapRef.current.flyTo(getFlyToParams(location.coordinates));
                });
            });

            // Auto zoom to the specified initial location after the map has loaded.
            const initialLocation = LOCATIONS.find((loc) => loc.name === initialLocationName);
            if (initialLocation) {
                // Delay the fly-to so the initial camera position is visible.
                setTimeout(() => {


                    mapRef.current.easeTo({
                        center: initialLocation.coordinates,
                        zoom: 20,
                        curve: 1.4,
                        duration: 5000,
                        essential: true,
                    });
                    setSelectedLocation(initialLocation.name);
                }, 250);
            }
        });

        return () => {
            mapRef.current.remove();
        };
    }, [initialLocationName, interactive, mapboxAccessToken]);

    // Helper: fly and open popup for a specific location when a button is clicked.
    const flyToLocation = (loc) => {
        if (!mapRef.current) return;
        setSelectedLocation(loc.name);



        mapRef.current.flyTo(getFlyToParams(loc.coordinates));
    };

    return (
        <div className='w-full h-dvh bg-black'>
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
            {/* {showButtons && <LocationButtons selectedLocation={selectedLocation} onLocationSelect={flyToLocation} />} */}
            {selectedLocation && (
                <div className="fixed top-16 right-4 z-10">
                    <LocationCard
                        location={LOCATIONS.find(loc => loc.name === selectedLocation)}
                        isSelected={true}
                        onSelect={flyToLocation}
                    />
                </div>
            )}
            <Menu />
            <BackButton />
        </div>
    );
};

export default MapBox;
