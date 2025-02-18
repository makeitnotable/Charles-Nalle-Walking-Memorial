import mapboxgl from 'mapbox-gl';
import { useRef, useEffect, useState } from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';

// Define your location array outside the effect 
const LOCATIONS = [
    {
        name: 'Bakery',
        coordinates: [-73.6916, 42.7261],
        description: 'A historic bakery known for feeding travelers...',
    },
    {
        name: 'Mutual Bank Building',
        coordinates: [-73.6920, 42.7289],
        description: 'The grand bank that served as a community hub...',
    },
    {
        name: 'Gilbert Mansion',
        coordinates: [-73.6932, 42.7295],
        description: 'Home to the illustrious Gilbert family...',
    },
    {
        name: 'Ferry Landing',
        coordinates: [-73.6988, 42.7193],
        description: 'Where travelers boarded ferries to cross the river...',
    },
    {
        name: 'Peter Baltimore\'s Barbershop',
        coordinates: [-73.6910, 42.7280],
        description: 'A communal gathering spot where news was shared...',
    },
];

// Fallback icon for locations without an explicit image
const DEFAULT_IMAGE = '/assets/default-marker.png';

const MapBox = () => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    // We'll store a reference to the currently open popup so we can close it when a new one is opened
    const currentPopupRef = useRef(null);
    // Dictionary to hold popup references keyed by location name
    const popupsRef = useRef({});

    useEffect(() => {
        mapboxgl.accessToken = mapboxAccessToken;

        // Initialize map
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/standard?optimize=true',
            // Starting camera position (note the slightly different Bakery latitude)
            center: [-73.6918, 42.7285],
            zoom: 15,
            pitch: 60,
            bearing: -17.6,
            maxBounds: [
                [-73.7300, 42.7000],
                [-73.6500, 42.7500],
            ],
            interactive: true, // Enable map interactions
        });

        mapRef.current.on('load', () => {
            // Create custom markers & popups without image references
            LOCATIONS.forEach((location) => {
                // Marker container
                const markerDiv = document.createElement('div');
                markerDiv.className = 'custom-marker';

                // Instead of using an image, we'll create a styled div marker.
                markerDiv.innerHTML = `<div style="
                    background: #BDB8AD;
                    border-radius: 10px;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #292621;
                    font-weight: bold;
                    cursor: pointer;
                ">${location.name}</div>`;

                // Create a popup for this marker
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="max-width: 200px;">
                        <h4>${location.name}</h4>
                        <p>${location.description}</p>
                    </div>
                `);

                // Store popup in dictionary for later reference
                popupsRef.current[location.name] = popup;

                // Create and add the marker
                new mapboxgl.Marker({ element: markerDiv })
                    .setLngLat(location.coordinates)
                    .addTo(mapRef.current);

                // When the marker is clicked, fly to the location and display the popup
                markerDiv.addEventListener('click', () => {
                    // Close any previously open popup
                    if (currentPopupRef.current) {
                        currentPopupRef.current.remove();
                    }
                    // Open the new popup
                    popup.addTo(mapRef.current);
                    currentPopupRef.current = popup;

                    mapRef.current.flyTo({
                        center: location.coordinates,
                        zoom: 20,
                        speed: 0.8,
                        curve: 1.4,
                        essential: true,
                    });
                });
            });

            // Auto zoom to the Bakery location after the map has loaded.
            const bakery = LOCATIONS.find((loc) => loc.name === 'Bakery');
            if (bakery) {
                // Delay the fly-to so the initial camera position is visible.
                setTimeout(() => {
                    // Close any previously open popup
                    if (currentPopupRef.current) {
                        currentPopupRef.current.remove();
                    }
                    // Retrieve and open the popup for Bakery
                    const bakeryPopup = popupsRef.current[bakery.name];
                    if (bakeryPopup) {
                        bakeryPopup.addTo(mapRef.current);
                        currentPopupRef.current = bakeryPopup;
                    }

                    mapRef.current.easeTo({
                        center: bakery.coordinates,
                        zoom: 20,
                        // speed: 0.2,
                        curve: 1.4,
                        duration: 5000,
                        essential: true,
                    });
                    setSelectedLocation(bakery.name);
                }, 250);
            }
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    // Helper: fly and open popup for a specific location when a button is clicked.
    const flyToLocation = (loc) => {
        if (!mapRef.current) return;
        setSelectedLocation(loc.name);

        // Close any previously open popup
        if (currentPopupRef.current) {
            currentPopupRef.current.remove();
        }
        // Retrieve the popup from our dictionary, then open it
        const popup = popupsRef.current[loc.name];
        if (popup) {
            popup.addTo(mapRef.current);
            currentPopupRef.current = popup;
        }

        mapRef.current.flyTo({
            center: loc.coordinates,
            zoom: 20,
            speed: 0.8,
            curve: 1.4,
            essential: true,
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            {/* Map container */}
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
            {/* Updated buttons container in the return statement of MapBox component: */}
            {/* <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    zIndex: 999, // higher than the map
                    backgroundColor: "blue",
                    overflowX: 'auto',    // enables horizontal scroll
                    whiteSpace: 'nowrap', // keeps buttons in one line
                    padding: '0 20px',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex', // ensures buttons are rendered side by side
                        gap: '8px',
                        flexWrap: 'nowrap',
                    }}
                >
                    {LOCATIONS.map((loc) => (
                        <div key={loc.name} style={{ minWidth: '120px', display: 'inline-block' }}>
                            <button
                                onClick={() => flyToLocation(loc)}
                                style={{
                                    background: '#ffffff',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    width: '100%', // let the button expand to contain text
                                }}
                            >
                                {loc.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div> */}
            <div className='fixed bottom-3 left-0 right-0 z-10'>
                <div className='flex flex-row gap-4 overflow-x-auto'>
                    {LOCATIONS.map((loc) => (
                        <div className='h-32 min-w-72'>
                            <button key={loc.name} className={`bg-white ${selectedLocation === loc.name ? "border-2 border-black" : ""} text-black px-4 py-2 rounded-md whitespace-nowrap w-full h-full`} onClick={() => flyToLocation(loc)}>{loc.name}</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MapBox;