import { useState } from 'react';
import { useNavigate } from 'react-router';

export const OpenMenu = ({ locations, onLocationSelect, onNavigateToLocation }) => {
    // Map location names to their original labels in the UI
    const locationLabels = {
        'Bakery': '1. Holeur\'s Fashionable Bakery',
        'Commissioner Part 1': '2. Part 1 Office of the Commissioner',
        'Commissioner Part 2': '3. Part 2 Office of the Commissioner',
        'Gilbert Mansion': '4. Uri Gilbert Mansion',
        'Ferry Landing': '5. Washington Street Ferry Landing',
        "Baltimore's Barbershop": '6. Peter Baltimore\'s Barbershop'
    };

    const navigate = useNavigate();

    // Navigate to home
    const goToHome = () => {
        navigate('/');
    };

    // Handle location selection with option to view details
    const handleLocationClick = (location, viewDetails = false) => {
        // If viewDetails is true, navigate to location page
        if (viewDetails && location.path) {
            navigate(location.path);
        } else {
            // Otherwise, select the location in the map
            onLocationSelect && onLocationSelect(location);
        }
    };

    return (
        <div className='fixed top-3 right-3 z-10'>
            <div className="bg-[#1D1411] border-2 border-[#69311D] rounded-xl">
                <div className='bg-[#4A1B0A] rounded-t-xl border-b-2 border-[#69311D] h-auto w-[225px] flex items-center justify-center py-6'>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 1L1 21M1 1L21 21" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className='h-auto space-y-2 text-[#FF9770] flex flex-col items-center p-8'>
                    <div className='text-left gap-6 flex flex-col'>
                        <button
                            className='text-lg hover:text-[#F26835] transition-colors'
                            onClick={goToHome}
                        >
                            Home
                        </button>
                        <div className='flex flex-col pl-3 gap-6'>
                            {locations.map((location) => (
                                <div key={location.name} className="flex flex-col">
                                    <button
                                        className='text-lg text-left hover:text-[#F26835] transition-colors'
                                        onClick={() => handleLocationClick(location)}
                                    >
                                        {locationLabels[location.name] || `${location.name}`}
                                    </button>
                                    <button
                                        className='text-sm text-left hover:text-[#F26835] transition-colors ml-4 mt-1'
                                        onClick={() => handleLocationClick(location, true)}
                                    >
                                        View Details →
                                    </button>
                                </div>
                            ))}
                            <p className='text-lg'>About</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Menu = ({ onLocationSelect, locations = [], onNavigateToLocation }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ?
                <OpenMenu
                    locations={locations}
                    onLocationSelect={onLocationSelect}
                    onNavigateToLocation={onNavigateToLocation}
                /> :
                (
                    <div className='fixed top-3 right-3 z-10'>
                        <div className='bg-[#4A1B0A] border-2 border-[#69311D] rounded-tl-xl rounded-br-xl rounded-tr-xl rounded-bl-3xl h-[72px] w-[72px] flex items-center justify-center'>
                            <div className='flex flex-col gap-2 w-full items-center'>
                                <div className='bg-[#F26835] h-0.5 w-10 rounded-full' />
                                <div className='bg-[#F26835] h-0.5 w-10 rounded-full' />
                                <div className='bg-[#F26835] h-0.5 w-10 rounded-full' />
                            </div>
                        </div>
                    </div>
                )}
        </button>
    );
};

export default Menu;