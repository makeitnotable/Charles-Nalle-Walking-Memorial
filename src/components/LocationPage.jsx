import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { locationData } from '../data/locationData';
import { useTransition } from '../stores/useTransitionStore';

export default function LocationPage() {
    const navigate = useNavigate();
    const { location } = useParams();
    const data = locationData[location];
    const { play } = useTransition();

    useEffect(() => {
        window.scrollTo(0, 0);
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
                        <p className="text-text-primary text-sm">CHAPTER {data.chapterNumber}</p>
                        <div className="h-5 w-5 rounded-full bg-neutral-6 flex items-center justify-center">
                            <p className="text-text-primary text-sm">{data.chapterNumber}</p>
                        </div>
                    </div>
                    <h1 className="text-4xl text-text-primary font-bold mb-4">{data.title}</h1>
                    <div className="absolute bottom-0 left-0 right-0 bg-neutral-1 h-3/4 rounded-t-3xl" style={{
                        backgroundImage: `url('${data.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }} />
                </div>
            </div>
            <div className="h-dvh" style={{
                backgroundImage: "linear-gradient(rgba(16, 10, 6, 0.9), rgba(16, 10, 6, 0.9)), url('/home-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="flex flex-col justify-center items-center h-full p-4 text-left space-y-8">
                    <div className="h-32 bg-text-primary w-0.5" />
                    <div className="space-y-4">
                        <div className="border-l-2 border-text-primary pl-2">
                            <h3 className="text-text-primary text-4xl">{`"${data.quote.text}"`}</h3>
                        </div>
                        <div className="w-full">
                            <p className="text-text-secondary">{data.quote.author}</p>
                        </div>
                    </div>
                    <div className="h-32 bg-text-primary w-0.5" />
                </div>
            </div>

            {/* Audio player card */}
            <div>
                <div className='bg-neutral-11 rounded-3xl space-y-4'>
                    <div className="w-full h-48 bg-tertiary-4 rounded-3xl" />
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-row justify-between items-start space-x-2">
                            <div className="w-20 h-20 bg-neutral-1 rounded-3xl" />
                            <div className="space-y-2">
                                <p className="text-text-primary text-lg uppercase">{data.audioPlayer.chapterName}</p>
                                <p className="text-text-secondary text-sm">{data.audioPlayer.subtitle}</p>
                            </div>
                        </div>
                        <div className='bg-tertiary-9 rounded-3xl px-2 py-1'>
                            <p className='text-text-primary text-sm'>00:00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Narrative */}
            <div className='text-text-primary space-y-4'>
                <p className='text-text-primary text-lg'>{data.narrative.title}</p>
                {data.narrative.content.map((paragraph, index) => (
                    <p key={index}>
                        {index === 0 ? <span className='text-3xl'>{paragraph.substring(0, 2)}</span> : null}
                        {index === 0 ? paragraph.substring(2) : paragraph}
                    </p>
                ))}
            </div>

            {/* Next Chapter */}
            <div className='flex flex-row justify-center items-center'>
                <div className="bg-neutral-11 px-6 py-4 rounded-full w-fit">
                    <p className='text-text-secondary text-lg'>{data.nextChapter}</p>
                </div>
            </div>

            {/* Historical Context */}
            <div className='space-y-4'>
                <div>
                    <p className='text-text-primary text-4xl'>{data.historicalContext.title}</p>
                    <p className='text-text-secondary'>{data.historicalContext.number}</p>
                </div>
                <div className="w-full h-48 bg-tertiary-5 rounded-3xl" />
                {data.historicalContext.points.map((point, index) => (
                    <div key={index} className="flex flex-row items-start space-x-2">
                        <div className="h-5 w-5 rounded-full bg-neutral-6 flex-shrink-0 flex items-center justify-center">
                            <p className="text-text-primary text-sm">{index + 1}</p>
                        </div>
                        <p className='text-text-primary'>{point}</p>
                    </div>
                ))}
            </div>

            {/* Moral Message */}
            <div className="h-dvh" style={{
                backgroundImage: "linear-gradient(rgba(16, 10, 6, 0.9), rgba(16, 10, 6, 0.9)), url('/home-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className='p-4 text-text-primary space-y-4'>
                    <div>
                        <p className='text-text-primary text-4xl'>{data.moralMessage.title}</p>
                        <p className='text-text-secondary'>{data.moralMessage.number}</p>
                    </div>
                    <p className='p-2'>{data.moralMessage.message}</p>
                    <div>
                        <p className='text-text-secondary text-lg'>{data.moralMessage.callToAction.title}</p>
                        <p className='text-text-primary p-2'>{data.moralMessage.callToAction.content}</p>
                    </div>
                </div>
                <div className='flex flex-row justify-center items-center pt-10'>
                    <div className="bg-neutral-11 px-6 py-4 rounded-full w-fit">
                        <p className='text-text-secondary text-lg'>{data.nextChapter}</p>
                    </div>
                </div>
            </div>

            {/* Where to Next */}
            <div className='text-text-primary space-y-2'>
                <p className='text-4xl'>{data.whereToNext.title}</p>
                <p className='text-text-secondary'>{data.whereToNext.number}</p>
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
        </div>
    );
} 