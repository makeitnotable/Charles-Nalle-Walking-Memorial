import React, { useEffect } from 'react';
import ImageSquare from './components/ImageSquare';
import { useNavigate } from 'react-router';

export default function BakeryPage() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="h-full space-y-8 p-4">
            <div className="h-dvh">
                <div className="relative h-full space-y-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="text-text-primary text-sm">CHAPTER 1</p>
                        <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <p className="text-white text-sm">1</p>
                        </div>
                    </div>
                    <h1 className="text-4xl text-white font-bold mb-4">HOLEUR'S
                        FASHIONABLE BAKERY
                    </h1>
                    <div className="absolute bottom-0 left-0 right-0 bg-white h-3/4 rounded-t-3xl" style={{
                        backgroundImage: "url('/bakery.png')", backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />

                </div>
            </div>
            <div className="h-dvh" style={{
                backgroundImage: "linear-gradient(rgba(29, 20, 17, 0.9), rgba(29, 20, 17, 0.9)), url('/home-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="flex flex-col justify-center items-center h-full p-4 text-left space-y-8">
                    <div className=" h-32 bg-white w-0.5" />
                    <div className="space-y-4">

                        <div className="border-l-2 border-text-primary pl-2">
                            <h3 className="text-white  text-4xl">“Charles Nalle, I hereby arrest youin the name of the United States of America!”</h3>
                        </div>
                        <div className="w-full">
                            <p className="text-text-primary">- United States Deputy Marshal Holmes</p>
                        </div>
                    </div>

                    <div className=" h-32 bg-white w-0.5" />
                </div>
            </div>
            {/* audio player card */}
            <div>
                <div className='bg-[#4A1B0A] rounded-3xl space-y-4'>
                    <div className="w-full h-48 bg-blue-200 rounded-3xl" />
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-row justify-between items-start space-x-2">
                            <div className="w-20 h-20 bg-white rounded-3xl" />
                            <div className="space-y-2">
                                <p className="text-white text-lg uppercase">Chapter 1</p>
                                <p className="text-text-primary text-sm">Holeur's fashion bakery</p>
                            </div>
                        </div>
                        <div className='bg-text-primary rounded-3xl px-2 py-1'>
                            <p className='text-white text-sm'>00:00</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='text-white space-y-4'>
                <p className='text-white text-lg'>(1) Narrative</p>
                <p>
                    <span className='text-3xl'>As</span>  the sun rose on the morning of April 27, 1860, and light spilled across the cobblestone streets of Troy, New York, Charles Nalle, a humble coachman in his thirties, was walking to George Holeur's Fashionable Bakery to pick up bread for his employers, the Gilberts. Charles wasn't a man of grandeur or heroic postures—just a man who carried the scars of his past silently, a past he'd escaped years before in Virginia. He had built a life here in Troy, far from the lash of Blucher Hansbrough, the man who once owned him.
                </p>
                <p>
                    But freedom, as Charles would be reminded, is fragile.
                </p>
                <p>
                    The aroma of fresh-baked bread filled the air as Charles neared the bakery's entrance. Suddenly, seemingly out of nowhere, the hands of slave catcher Henry J. Wale, who hunted freedom like a sport, seized and shackled him. Standing smugly beside him, United States Deputy Marshal Holmes shouted, "Charles Nalle, I hereby arrest you in the name of the United States of America!" Back home in Virginia, Charles's half-brother, Blucher Hansbrough—who had hired the slave catchers under the Fugitive Slave Act of 1850—would have smiled with cruel satisfaction at the news of Charles's capture, relishing the thought of him being dragged back into slavery through streets he had walked as a free man.
                </p>
            </div>
            <div className='flex flex-row justify-center items-center'>
                <div className="bg-[#4A1B0A] px-6 py-4 rounded-full w-fit">
                    <p className='text-text-primary text-lg'>Chapter 2</p>
                </div>
            </div>
            <div className='space-y-4'>
                <div>
                    <p className='text-white text-4xl'>Historical Context</p>
                    <p>(2)</p>
                </div>
                <div className="w-full h-48 bg-blue-200 rounded-3xl" />
                <div className="flex flex-row items-start space-x-2">
                    <div className="h-5 w-5 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
                        <p className="text-white text-sm">1</p>
                    </div>
                    <p className='text-white'>George Holeur's Fashionable Bakery at 3rd and Division Streets is where Charles Nalle was arrested.</p>
                </div>
                <div className="flex flex-row items-start space-x-2">
                    <div className="h-5 w-5 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
                        <p className="text-white text-sm">2</p>
                    </div>
                    <p className='text-white'>At the time of Charles Nalle's capture, Troy, New York, was the richest city in the United States and a hub for abolitionist activity, with the town and its citizens playing pivotal roles in the Underground Railroad.</p>
                </div>
                <div className="flex flex-row items-start space-x-2">
                    <div className="h-5 w-5 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
                        <p className="text-white text-sm">3</p>
                    </div>
                    <p className='text-white'>The Fugitive Slave Act of 1850, which enabled Charles's capture, required all citizens—regardless of their beliefs—to assist in the recapture of slaves or face imprisonment up to six months and fines of $1,000 ($35,000 today).</p>
                </div>
            </div>
            <div className="h-dvh" style={{
                backgroundImage: "linear-gradient(rgba(29, 20, 17, 0.9), rgba(29, 20, 17, 0.9)), url('/home-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className='p-4 text-white space-y-4'>
                    <div>
                        <p className='text-white text-4xl'>NOT ALL LAWS ARE MORAL</p>
                        <p>(3)</p>
                    </div>
                    <p className='p-2'>
                        Laws like the Fugitive Slave Act demonstrate how the legal system can be used to target people—a pattern that persists today through racial profiling and unequal treatment in the justice system.
                    </p>
                    <div>
                        <p className='text-text-primary text-lg'>Make a Difference</p>
                        <p className='text-white p-2'>
                            Educate yourself on unjust laws, vote against them, and support organizations like the ACLU in fighting against injustice and reforming the legal system.
                        </p>
                    </div>
                </div>
                <div className='flex flex-row justify-center items-center pt-10'>
                    <div className="bg-[#4A1B0A] px-6 py-4 rounded-full w-fit">
                        <p className='text-text-primary text-lg'>Chapter 2</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 