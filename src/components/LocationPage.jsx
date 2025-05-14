import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { locationData } from '../data/locationData';
import { useTransition } from '../stores/useTransitionStore';
import Arrow from '../components/Arrow';
import { Button } from '../components/Button';

export default function LocationPage() {
    const navigate = useNavigate();
    const { location } = useParams();
    const data = locationData[location];
    const { play } = useTransition();

    useEffect(() => {
        // window.scrollTo(0, 0);
    }, []);

    const handleNavigate = (path) => {
        play(() => {
            navigate(path);
        });
    };

    if (!data) {
        return <div className="p-4 text-text-primary text-center">Location not found</div>;
    }

    return (
        <div className="h-full space-y-8 p-4">
            <div className="h-dvh">
                <div className="relative h-full space-y-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="text-primary-10 text-sm">CHAPTER {data.chapterNumber}</p>
                        <div className="h-5 w-5 rounded-full bg-primary-10 flex items-center justify-center">
                            <p className="text-primary-12 text-sm">{data.chapterNumber}</p>
                        </div>
                    </div>
                    <h1 className="text-4xl text-primary-12 font-bold mb-4 max-w-md">{data.title}</h1>
                    <div className="absolute bottom-0 left-0 right-0 bg-neutral-1 h-4/5 rounded-t-3xl" style={{
                        backgroundImage: `url('${data.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />
                </div>
            </div>
            <div className="h-dvh">
                <div className="relative h-full p-4 text-left space-y-8">
                    <div className="absolute inset-0 z-0" style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8)), url('${data.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />
                    <div className="flex flex-col justify-center items-center h-full relative z-10">
                        <div className="max-w-md flex flex-col items-center space-y-8">
                            <div className="h-32 bg-primary-12 w-0.5" />
                            <div className="space-y-4">
                                <div className="border-l-2 border-primary-10 pl-2">
                                    <h3 className="text-primary-12 text-4xl">{`"${data.quote.text}"`}</h3>
                                </div>
                                <div className="w-full">
                                    <p className="text-primary-11">{data.quote.author}</p>
                                </div>
                            </div>
                            <div className="pt-14">
                                <Arrow
                                    length={140}
                                    direction={90}
                                    className="text-primary-12"
                                    strokeWidth={2}
                                    triangleSize={10}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio player card */}
            <div>
                <div className='bg-primary-3 border-2 border-primary-6 rounded-3xl space-y-4 p-4'>
                    <div className="w-full h-48 bg-tertiary-4 rounded-2xl border-primary-6 border-2" style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-row justify-between items-start space-x-2">
                            <div className="w-16 h-16 bg-primary-4 border-2 border-primary-6 rounded-2xl flex items-center justify-center">
                                <svg width="17" height="21" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 3.65626C1 2.6851 1 2.19951 1.20249 1.93184C1.37889 1.69865 1.64852 1.55435 1.9404 1.53693C2.27544 1.51692 2.67946 1.78627 3.48752 2.32498L14.0031 9.33535C14.6708 9.78048 15.0046 10.003 15.1209 10.2836C15.2227 10.5288 15.2227 10.8044 15.1209 11.0497C15.0046 11.3302 14.6708 11.5528 14.0031 11.9979L3.48752 19.0083C2.67946 19.547 2.27544 19.8163 1.9404 19.7963C1.64852 19.7789 1.37889 19.6346 1.20249 19.4014C1 19.1337 1 18.6482 1 17.677V3.65626Z" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-primary-12 text-xl uppercase">{data.audioPlayer.chapterName}</p>
                                <p className="text-primary-11">{data.audioPlayer.subtitle}</p>
                            </div>
                        </div>
                        <div className='bg-primary-10 rounded-3xl px-2 py-1'>
                            <p className='text-primary-12 text-sm'>00:00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Narrative */}
            <div className='text-text-primary space-y-4'>
                <p className='text-primary-12 text-sm'>{data.narrative.title}</p>
                {data.narrative.content.map((paragraph, index) => (
                    <p className='text-primary-12 text-2xl font-[300] leading-relaxed' key={index}>
                        {index === 0 ? <span className='text-3xl font-medium'>{paragraph.substring(0, 2)}</span> : null}
                        {index === 0 ? paragraph.substring(2) : paragraph}
                    </p>
                ))}
            </div>

            <div className='flex flex-row justify-center items-center'>
                <Button variant='filled'>
                    {data.nextChapter}
                </Button>
            </div>

            {/* Historical Context */}
            <div className='space-y-15'>
                <div className="space-y-4">
                    <p className='text-primary-12 text-5xl'>{data.historicalContext.title}</p>
                    <p className='text-primary-12'>{data.historicalContext.number}</p>
                </div>
                <div className="w-full h-72 rounded-3xl border-2 border-primary-6" style={{
                    backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.historicalContext.backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }} />
                <div className='space-y-5'>
                    {data.historicalContext.points.map((point, index) => (
                        <div key={index} className="flex flex-row items-start space-x-2">
                            <div className="h-5 w-5 rounded-full bg-primary-10 flex-shrink-0 flex items-center justify-center">
                                <p className="text-primary-12 text-sm">{index + 1}</p>
                            </div>
                            <p className='text-primary-12 text-xl font-[300] leading-relaxed'>{point}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moral Message */}
            <div className="h-full" >
                <div className="relative h-full">
                    <div className="absolute inset-0 z-0" style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0.9), rgba(16, 10, 6, 0.9)), url('${data.moralMessage.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />
                    <div className='p-4 text-text-primary space-y-6 relative z-10'>
                        <p className='text-primary-12 text-5xl'>{data.moralMessage.title}</p>
                        <div className='flex justify-end w-full'>
                            <div className="w-3/4 h-72 rounded-3xl border-2 border-primary-6" style={{
                                backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.moralMessage.backgroundImage}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }} />
                        </div>
                        <p className=' text-primary-12'>{data.moralMessage.number}</p>
                        <p className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.message}</p>

                        <div className='space-y-4'>
                            <p className='text-primary-11 text-2xl'>{data.moralMessage.callToAction.title}</p>
                            <p className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.callToAction.content}</p>
                        </div>
                        <div className='flex flex-row justify-center items-center mt-20 mb-20 gap-5'>
                            <Button variant='outline'>
                                <div className='flex items-center gap-2'>
                                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.25 13.667L1.25 7.66699L7.25 1.66699" stroke="#FF9770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>

                                    <p>
                                        Back
                                    </p>
                                </div>
                            </Button>
                            <Button variant='filled'>
                                <div className='flex items-center gap-2'>
                                    <p>
                                        Next
                                    </p>
                                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.5 13.667L7.5 7.66699L1.5 1.66699" stroke="#FF9770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Where to Next */}
            <div className='space-y-2'>
                <p className='text-primary-12 text-5xl'>{data.whereToNext.title}</p>
                <p className='text-primary-12'>{data.whereToNext.number}</p>
            </div>
            <div className="w-full h-48 bg-tertiary-7 rounded-3xl" />
            <div className='flex flex-row justify-center items-center'>
                <button className='bg-neutral-11 px-6 py-4 rounded-full w-fit text-text-secondary'>Get Directions</button>
            </div>

            {/* Example for a "back to map" button */}
            <div className='flex flex-row justify-center items-center mt-4'>
                <button
                    onClick={() => handleNavigate('/map')}
                    className='bg-neutral-11 px-6 py-4 rounded-full w-fit text-text-secondary'>
                    Back to Map
                </button>
            </div>
        </div >
    );
} 