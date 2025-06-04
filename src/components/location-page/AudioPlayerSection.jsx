import React from 'react';

export default function AudioPlayerSection({ data }) {
    return (
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
    );
} 