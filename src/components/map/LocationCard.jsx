import React from 'react';
import bakeryImg from '../../assets/bakery.png';
import bankImg from '../../assets/bank.png';
import gilbertMansionImg from '../../assets/mansion.png';
import ferryLandingImg from '../../assets/ferry.png';
import barberImg from '../../assets/barber.png';
import { Link } from 'react-router';
// Image mapping for locations
const locationImages = {
    'Bakery': bakeryImg,
    'Commissioner Part 1': bankImg,
    'Commissioner Part 2': bankImg,
    'Gilbert Mansion': gilbertMansionImg,
    'Ferry Landing': ferryLandingImg,
    "Baltimore's Barbershop": barberImg,
};

const LocationCard = ({ location, isSelected, onSelect, onNavigate }) => {
    const locationImage = locationImages[location.name];

    // Handle view details click, which navigates to the location page
    const handleViewDetails = (e) => {
        e.preventDefault(); // Prevent Link default behavior
        if (onNavigate) {
            onNavigate();
        }
    };

    return (
        <div className='fixed bottom-0 left-0 right-0 z-10 cursor-pointer' onClick={handleViewDetails}>
            <div className='p-6'>
                <div className='h-32 w-full bg-primary-2 border-2 border-primary-3 text-white flex rounded-xl'>
                    <div className='w-1/3 h-full'>
                        {/* Display location image */}
                        <div className='w-full h-full'>
                            {locationImage && (
                                <img
                                    src={locationImage}
                                    alt={location.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            )}
                        </div>
                    </div>
                    <div className='w-2/3 h-full p-3 flex flex-col justify-between'>
                        <div className='flex flex-row justify-between items-center'>
                            <p className='uppercase text-primary-11 leading-none'>Chapter</p>
                            <div className='rounded-full text-primary-11 w-[24px] h-[24px] flex items-center justify-center bg-primary-10'>
                                <p className='text-xs leading-none text-primary-12'>1</p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-2xl text-primary-12 text-left'>{location.name}</p>
                            {/* @todo: get proper arrow icon */}
                            <div className='flex flex-row items-center'>
                                <div className='w-full h-[1px] bg-primary-12' />
                                <p className='text-primary-12 mt-1 -ml-1'>→</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationCard;
