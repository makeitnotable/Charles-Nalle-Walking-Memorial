import React from 'react';
import ArrowDown from '../ArrowDown';

export default function HeroSection({ data }) {
    return (
        <div className="">
            <div className="h-full space-y-4 flex flex-col justify-between">
                <div className="pt-6 px-6 space-y-4 flex-1">
                    <div className="flex flex-row justify-between items-center">
                        <p className="text-primary-10 text-sm">CHAPTER {data.chapterNumber}</p>
                        <div className="h-5 w-5 rounded-full bg-primary-10 flex items-center justify-center">
                            <p className="text-primary-12 text-sm">{data.chapterNumber}</p>
                        </div>
                    </div>
                    <div className='flex flex-row justify-between items-center'>
                        <h1 className="text-4xl text-primary-12 font-bold mb-4 max-w-md">{data.title}</h1>
                    </div>
                </div>
                <img
                    src={data.backgroundImage}
                    alt={data.title}
                    className="bg-neutral-1 rounded-t-3xl object-cover object-center"
                />
            </div>
        </div>
    );
} 