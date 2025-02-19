import React, { useEffect } from 'react';
import MapBox from './components/MapBox';
import ImageSquare from './components/ImageSquare';
import { useNavigate } from 'react-router';

function MansionPage() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="space-y-16">
            <div className="relative">
                <div className="h-screen">
                    <MapBox initialLocationName="Gilbert Mansion" />
                    <div className="absolute inset-0 z-10 bg-background bg-opacity-70 pt-16">
                        <h1 className="text-4xl font-bold mb-4 text-text-primary">Charles Nalle Mansion</h1>
                        <p className="text-lg mb-8 text-text-secondary">
                            A historic landmark that played a crucial role in Troy's financial development and community gathering.
                        </p>
                        <button className="bg-button hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center">
                <ImageSquare src="/assets/bakery.jpg" alt="Bakery" />
            </div>
            <div className='p-4'>
                <h1 className='text-4xl font-bold'>1860</h1>
                <p className='text-lg'>"Charles Nalle, I hereby arrest you in the name of the United States of America!" - United States Deputy Marshal Holmes</p>
            </div>
            <div className='w-full h-0.5 bg-gray-200' />
            <div className="flex flex-col justify-center items-center">
                <ImageSquare src="/assets/bakery.jpg" alt="Bakery" />
            </div>
            <div className='p-4 space-y-4'>
                <h1 className='text-4xl font-bold'>Location History & Facts.</h1>
                <div className='space-y-4'>
                    <p className='text-lg'>George Holeur's Fashionable Bakery at 3rd and Division Streets where Charles Nalle was capture.
                    </p>
                    <p>
                        At the time of Charles Nalle's capture, Troy, New York, was the richest city in the United States and a hub for abolitionist activity, with the town and its citizens playing pivotal roles in the Underground Railroad.
                    </p>
                    <p>
                        The Fugitive Slave Act of 1850, which enabled Charles's capture, required all citizens—regardless of their beliefs—to assist in the recapture of slaves or face imprisonment up to six months and fines of $1,000 ($35,000 today).
                    </p>
                </div>
            </div>
            <div className='p-4 space-y-4'>
                <h1 className='text-4xl font-bold'>Not all laws are moral</h1>
                <div className='space-y-4'>
                    <p className='text-lg'>Laws like the Fugitive Slave Act demonstrate how the legal system can be weaponized to target and dehumanize people—a pattern that persists today in law enforcement through racial profiling and unequal treatment in the justice system.
                    </p>
                </div>
            </div>
            <div className='flex flex-row justify-center items-center'>
                <div className='h-16 w-16 rounded-full bg-gray-200' />
            </div>

            <div className='flex flex-col justify-center items-center bg-[#7D776C] space-y-4 p-4'>
                <ImageSquare src="/assets/bakery.jpg" alt="Bakery" />
                <p className="text-center">What you can do:</p>
                <p className="text-center">Educate yourself on unjust laws, vote against them, and support organizations like the ACLU in fighting against systemic injustices and reforming the legal system.</p>
                <div className='flex flex-row justify-center items-center gap-4 w-full'>
                    <button className='border border-white hover:bg-amber-600 text-white font-bold py-4 rounded w-full'>Share</button>
                    <button
                        onClick={() => navigate('/ferry')}
                        className='bg-button hover:bg-amber-600 font-bold py-4 text-background rounded w-full'
                    >
                        Next Scene
                    </button>
                </div>
            </div>
            <div className='h-64 w-full' />
        </div>
    )
}

export default MansionPage; 