import React from 'react';

export default function HistoricalContextSection({ data }) {
    return (
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
    );
} 