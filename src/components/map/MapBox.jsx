import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LOCATIONS } from './constants';
import LocationCard from './LocationCard';
import BackButton from './BackButton';
import { useMapStore } from '../../stores/useMapStore';

const MapBox = ({
    initialLocationName = 'Bakery',
    interactive = false,
    showButtons = true,
    height = '100vh',
    width = '100%',
    className = ''
}) => {
    const mapContainerRef = useRef(null);
    const navigate = useNavigate();

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
            navigate(locationData.path);
        }
    };

    return (
        <div className={`bg-black relative ${className}`} style={{ height: height, width: width }}>
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
            {selectedLocation && !isOverview && showButtons && (
                <LocationCard
                    location={LOCATIONS.find(loc => loc.name === selectedLocation)}
                    onNavigate={() => navigateToLocation(selectedLocation)}
                />
            )}
            {!isOverview && showButtons && <div className="cursor-pointer" onClick={handleBackToOverview}><BackButton /></div>}
        </div>
    );
};

export default MapBox;
