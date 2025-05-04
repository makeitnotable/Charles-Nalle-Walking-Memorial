// Location data for map markers
export const LOCATIONS = [
    {
        name: 'Bakery',
        coordinates: [-73.6916, 42.7261],
        description: 'A historic bakery known for feeding travelers...',
        path: '/bakery',
    },
    {
        name: 'Mutual Bank Building',
        coordinates: [-73.6920, 42.7289],
        description: 'The grand bank that served as a community hub...',
        path: '/bank',
    },
    {
        name: 'Gilbert Mansion',
        coordinates: [-73.6932, 42.7295],
        description: 'Home to the illustrious Gilbert family...',
        path: '/mansion',
    },
    {
        name: 'Ferry Landing',
        coordinates: [-73.6988, 42.7193],
        description: 'Where travelers boarded ferries to cross the river...',
        path: '/ferry',
    },
    {
        name: "Peter Baltimore's Barbershop",
        coordinates: [-73.6910, 42.7280],
        description: 'A communal gathering spot where news was shared...',
        path: '/barber',
    },
];

// Fallback icon for locations without an explicit image
export const DEFAULT_IMAGE = '/assets/default-marker.png';

// Map configuration
export const MAP_CONFIG = {
    initialCenter: [-73.6918, 42.7285],
    defaultZoom: 15,
    defaultPitch: 60,
    defaultBearing: -17.6,
    maxBounds: [
        [-73.7300, 42.7000],
        [-73.6500, 42.7500],
    ],
    mapStyle: 'mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft',
};
