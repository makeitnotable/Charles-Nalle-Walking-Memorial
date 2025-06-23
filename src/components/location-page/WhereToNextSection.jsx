import React from 'react';
import { Button } from '../Button';
import MapBox from '../map/MapBox';
import { LOCATIONS } from '../map/constants';

export default function WhereToNextSection({ data }) {
    return (
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <p className='text-primary-12 text-5xl'>{data.whereToNext.title}</p>
                <p className='text-primary-12'>{data.whereToNext.number}</p>
            </div>

            <MapBox
                initialLocationName={LOCATIONS[1].name}
                height="300px"
                width="100%"
                className="rounded-3xl overflow-hidden"
                interactive={false}
                showButtons={false}
            />
            <div className='flex flex-row justify-center items-center pt-10'>
                <Button variant='filled'>
                    Get Directions
                </Button>
            </div>
        </div>
    );
} 