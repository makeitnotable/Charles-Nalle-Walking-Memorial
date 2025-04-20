import React from 'react';
import bakeryImg from '../../assets/bakery.png';
import bankImg from '../../assets/bank.png';
import gilbertMansionImg from '../../assets/mansion.png';
import ferryLandingImg from '../../assets/ferry.png';
import barberImg from '../../assets/barber.png';

// Image mapping for locations
const locationImages = {
    'Bakery': bakeryImg,
    'Mutual Bank Building': bankImg,
    'Gilbert Mansion': gilbertMansionImg,
    'Ferry Landing': ferryLandingImg,
    "Peter Baltimore's Barbershop": barberImg,
};

const LocationCard = ({ location, isSelected, onSelect }) => {
    const locationImage = locationImages[location.name];

    return (
        <div className='fixed bottom-0 left-0 right-0 z-10'>
            <button
                className={`${isSelected ? "" : ""} px-4 py-2 whitespace-nowrap w-full h-full`}
                onClick={() => onSelect(location)}
            >
                <div className='p-6'>
                    <div className='h-32 w-full bg-[#1D1411] border-2 border-[#341A11] rounded-lg text-white flex'>
                        <div className='w-1/3 h-full'>
                            {/* Display location image */}
                            <div className='w-full h-full bg-[#2A1C18] overflow-hidden'>
                                {locationImage && (
                                    <img
                                        src={locationImage}
                                        alt={location.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className='w-2/3 h-full p-3 flex flex-col justify-between border-l-2 border-l-[#341A11]'>
                            <div className='flex flex-row justify-between items-center'>
                                <p className='text-md uppercase text-[#FF9770] leading-none'>Chapter</p>
                                <div className='rounded-full text-[#FED9CC] w-[24px] h-[24px] flex items-center justify-center bg-[#E45B27]'>
                                    <p className='text-sm leading-none'>1</p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <p className='text-2xl text-[#FED9CC] text-left'>{location.name}</p>
                                <div className='w-full h-[1px] bg-[#FED9CC]' />
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default LocationCard;
