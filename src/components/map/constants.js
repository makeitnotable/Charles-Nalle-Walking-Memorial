// Location data for map markers
export const LOCATIONS = [
    {
        name: 'Bakery',
        coordinates: [-73.6916, 42.7261],
        description: 'A historic bakery known for feeding travelers...',
        path: '/bakery',
        showPin: true,
        pinPosition: 'below' // Pin below the label
    },
    {
        name: 'Bank',
        coordinates: [-73.6920, 42.7289],
        description: 'Part 1 of the commissioner\'s office',
        path: '/commissioner1',
        showPin: true,
        pinPosition: 'above' // Pin above the label
    },
    {
        name: 'Commissioner Part 2',
        coordinates: [-73.6920, 42.7289],
        description: 'The second part of the commissioner\'s office...',
        path: '/commissioner2',
        showPin: false,
        pinPosition: 'below'
    },
    {
        name: 'Mansion',
        coordinates: [-73.6932, 42.7295],
        description: 'Home to the illustrious Gilbert family...',
        path: '/mansion',
        showPin: true,
        pinPosition: 'below' // Pin above the label
    },
    {
        name: 'Ferry',
        coordinates: [-73.6988, 42.7193],
        description: 'Where travelers boarded ferries to cross the river...',
        path: '/ferry',
        showPin: true,
        pinPosition: 'below' // Pin below the label
    },
    {
        name: "Barbershop",
        coordinates: [-73.6910, 42.7280],
        description: 'A communal gathering spot where news was shared...',
        path: '/barber',
        showPin: true,
        pinPosition: 'above' // Pin above the label
    },
];

// Locations that should appear in the carousel (only those with showPin: true)
export const SWIPEABLE_LOCATIONS = LOCATIONS.filter(location => location.showPin === true);

// Fallback icon for locations without an explicit image
export const DEFAULT_IMAGE = '/assets/default-marker.png';

// Map configuration
export const MAP_CONFIG = {
    initialCenter: [-73.6948, 42.7240],
    defaultZoom: 15,
    defaultPitch: 40,
    defaultBearing: 9,
    maxBounds: [
        [-73.7300, 42.7000],
        [-73.6500, 42.7500],
    ],
    mapStyle: 'mapbox://styles/wbmdesign/cm9afam6s001b01spbrk5g0l6/draft',
    markerConfig: {
        padding: 10,
        fontSize: 12,
        indexSize: 20,
        lineHeight: 30,
        dotSize: 8,
        borderRadius: 30,
        active: {
            scale: 0.9, // Scale up active markers by 20%
            backgroundColor: '#F26835',
            textColor: '#FED9CC',
            borderColor: '#F26835',
            indexBgColor: '#E45B27',
            indexTextColor: '#FED9CC',
            lineColor: '#F26835'
        },
        inactive: {
            scale: 0.8,
            backgroundColor: '#4A1B0A',
            textColor: '#FF9770',
            borderColor: '#80412B',
            indexBgColor: '#E45B27',
            indexTextColor: '#FED9CC',
            lineColor: '#80412B'
        }
    }
};
