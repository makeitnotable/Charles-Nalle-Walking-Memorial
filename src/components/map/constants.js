// Location data for map markers
export const LOCATIONS = [
    {
        name: 'Bakery',
        coordinates: [-73.6916, 42.7261],
        description: 'A historic bakery known for feeding travelers...',
        path: '/bakery',
        showPin: true
    },
    {
        name: 'Bank',
        coordinates: [-73.6920, 42.7289],
        description: 'Part 1 of the commissioner\'s office',
        path: '/commissioner1',
        showPin: true
    },
    {
        name: 'Commissioner Part 2',
        coordinates: [-73.6920, 42.7289],
        description: 'The second part of the commissioner\'s office...',
        path: '/commissioner2',
        showPin: false
    },
    {
        name: 'Mansion',
        coordinates: [-73.6932, 42.7295],
        description: 'Home to the illustrious Gilbert family...',
        path: '/mansion',
        showPin: true
    },
    {
        name: 'Ferry',
        coordinates: [-73.6988, 42.7193],
        description: 'Where travelers boarded ferries to cross the river...',
        path: '/ferry',
        showPin: true
    },
    {
        name: "Barbershop",
        coordinates: [-73.6910, 42.7280],
        description: 'A communal gathering spot where news was shared...',
        path: '/barber',
        showPin: true
    },
];

// Fallback icon for locations without an explicit image
export const DEFAULT_IMAGE = '/assets/default-marker.png';

// Map configuration
export const MAP_CONFIG = {
    initialCenter: [-73.6928, 42.7255],
    defaultZoom: 14,
    defaultPitch: 40,
    defaultBearing: 9,
    maxBounds: [
        [-73.7300, 42.7000],
        [-73.6500, 42.7500],
    ],
    mapStyle: 'mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft',
};
