import React from 'react';
import Arrow from '../Arrow';

export default function QuoteSection({ data }) {
    return (
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
    );
} 