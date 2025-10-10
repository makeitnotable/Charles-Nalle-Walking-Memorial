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
    height = '100vh',
    width = '100%',
    className = '',
    useResponsiveHeight = false
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

    const containerStyle = useResponsiveHeight
        ? { width: width }
        : { height: height, width: width };

    const containerClasses = useResponsiveHeight
        ? `bg-black relative h-[300px] md:h-[450px] ${className}`
        : `bg-black relative ${className}`;

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
