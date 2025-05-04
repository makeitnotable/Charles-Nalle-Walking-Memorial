import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LOCATIONS, MAP_CONFIG } from './constants';
import { createMarkerElement, getFlyToParams } from './utils';
import LocationCard from './LocationCard';
import BackButton from './BackButton';

const MapBox = ({ initialLocationName = 'Bakery', interactive = false, showButtons = true }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isOverview, setIsOverview] = useState(true);
    // Fix token by removing % character at the end
    const mapboxAccessToken = 'pk.eyJ1Ijoid2JtZGVzaWduIiwiYSI6ImNtOWFjZm9tdzAzdGYycW92dmdhY290eTQifQ.0AfqOazVG3kKKepyDrTSuw';
    const navigate = useNavigate();
    console.log('mapboxAccessToken', mapboxAccessToken);

    // Map reference objects
    useEffect(() => {
        mapboxgl.accessToken = mapboxAccessToken;
        console.log('mapboxAccessToken', mapboxAccessToken);

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
        console.log('mapRef', mapRef.current);

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
                    setSelectedLocation(location.name);
                    setIsOverview(false);
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
                    setIsOverview(false);
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
        setIsOverview(false);
        mapRef.current.flyTo(getFlyToParams(loc.coordinates));
    };

    // Helper: return to overview/all locations view
    const handleBackToOverview = () => {
        if (!mapRef.current) return;
        setIsOverview(true);
        setSelectedLocation(null);

        mapRef.current.easeTo({
            center: MAP_CONFIG.initialCenter,
            zoom: MAP_CONFIG.defaultZoom,
            pitch: MAP_CONFIG.defaultPitch,
            bearing: MAP_CONFIG.defaultBearing,
            duration: 2000,
            essential: true,
        });
    };

    // Navigate to the location page
    const navigateToLocation = (location) => {
        const locationData = LOCATIONS.find(loc => loc.name === location);
        if (locationData && locationData.path) {
            navigate(locationData.path);
        }
    };

    return (
        <div className='w-full h-dvh bg-black'>
            <p className='text-white'>MapBox</p>
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
            {selectedLocation && !isOverview && (
                <div className="fixed top-16 right-4 z-10">
                    <LocationCard
                        location={LOCATIONS.find(loc => loc.name === selectedLocation)}
                        isSelected={true}
                        onSelect={flyToLocation}
                        onNavigate={() => navigateToLocation(selectedLocation)}
                    />
                </div>
            )}
            {!isOverview && <div onClick={handleBackToOverview}><BackButton /></div>}
        </div>
    );
};

export default MapBox;
