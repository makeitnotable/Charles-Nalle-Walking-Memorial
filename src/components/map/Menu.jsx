import { useState } from 'react';

export const OpenMenu = ({ locations, onLocationSelect }) => {
    // Map location names to their original labels in the UI
    const locationLabels = {
        'Bakery': '1. Bakery',
        'Mutual Bank Building': '2. Bank',
        'Gilbert Mansion': '3. Mansion',
        'Ferry Landing': '4. Ferry',
        "Peter Baltimore's Barbershop": '5. Barbershop'
    };

    return (
        <div className='fixed top-3 right-3 z-10'>
            <div className="bg-[#1D1411] border-2 border-[#69311D] rounded-xl">
                <div className='bg-[#4A1B0A] rounded-t-xl border-b-2 border-[#69311D] h-auto w-[225px] flex items-center justify-center py-6'>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 1L1 21M1 1L21 21" stroke="#F26835" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div className='h-auto space-y-2 text-[#FF9770] flex flex-col items-center p-8'>
                    <div className=' text-left gap-6 flex flex-col'>
                        <p className='text-lg'>Home</p>
                        <div className='flex flex-col pl-3 gap-6'>
                            {locations.map((location) => (
                                <button
                                    key={location.name}
                                    className='text-lg text-left hover:text-[#F26835] transition-colors'
                                    onClick={() => onLocationSelect(location)}
                                >
                                    {locationLabels[location.name] || `${location.name}`}
                                </button>
                            ))}
                            <p className='text-lg'>About</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Menu = ({ onLocationSelect, locations = [] }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ?
                <OpenMenu locations={locations} onLocationSelect={onLocationSelect} /> :
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