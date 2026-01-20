import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LOCATIONS } from './constants';
import LocationCardsSlider from './LocationCardsSlider';
import BackButton from './BackButton';
import { useMapStore } from '../../stores/useMapStore';
import { useTransition } from '../../stores/useTransitionStore';

const MapBox = ({
    initialLocationName = 'Bakery',
    interactive = false,
    showButtons = true,
    fillScreen = false,
    height = '100vh',
    width = '100%',
    className = '',
}) => {
    const mapContainerRef = useRef(null);
    const navigate = useNavigate();
    const { play } = useTransition();
    const {
        selectedLocation,
        isOverview,
        initializeMap,
        destroyMap,
        handleBackToOverview
    } = useMapStore();

    useEffect(() => {
        if (mapContainerRef.current) {
            initializeMap(mapContainerRef, initialLocationName, interactive);
        }

        return () => {
            destroyMap();
        };
    }, [initializeMap, destroyMap, initialLocationName, interactive]);

    const navigateToLocation = (locationName) => {
        const locationData = LOCATIONS.find(loc => loc.name === locationName);
        if (locationData && locationData.path) {
            play(() => {
                navigate(locationData.path);
            }, locationData.name);
        }
    };

    const containerStyle = fillScreen ? { height: height, width: width } : undefined;

    const containerClasses = fillScreen
        ? `bg-black relative ${className}`
        : `bg-black relative w-[343px] h-[229px] md:w-[386px] md:h-[257px] lg:w-[514.5px] lg:h-[343px] ${className}`;

    return (
        <div className={containerClasses} style={containerStyle}>
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
            {!isOverview && showButtons && (
                <LocationCardsSlider
                    currentLocation={selectedLocation}
                    onLocationNavigate={navigateToLocation}
                />
            )}
            {!isOverview && showButtons && <div className="cursor-pointer" onClick={handleBackToOverview}><BackButton /></div>}
        </div>
    );
};

export default MapBox;
