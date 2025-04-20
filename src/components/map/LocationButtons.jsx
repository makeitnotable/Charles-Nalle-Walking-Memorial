import { LOCATIONS } from './constants';
import LocationCard from './LocationCard';

const LocationButtons = ({ onLocationSelect, selectedLocation }) => {
    return (
        <div className='fixed bottom-3 left-0 right-0 z-10 bg-blue-500'>
            <div className='flex flex-row gap-4 overflow-x-auto'>
                {LOCATIONS.map((loc) => (
                    <LocationCard
                        key={loc.name}
                        location={loc}
                        isSelected={selectedLocation === loc.name}
                        onSelect={onLocationSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default LocationButtons; 