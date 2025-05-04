import React from 'react';
import { Link } from 'react-router';
export default function Home() {

    return (
        <div className="p-4 h-dvh">
            <div className="h-full flex flex-col justify-between items-center relative">
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/home-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'grayscale(100%) brightness(0.7)',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '32px',
                    borderBottomLeftRadius: '32px'
                }}></div>
                <div className="flex flex-col justify-between items-center h-full z-10">
                    <div className="flex flex-col justify-between items-center gap-8 pt-16">
                        <p className="text-[#FF9770] font-thin">Troy, NY ooo</p>
                        <div className='flex flex-col'>
                            <p className="text-6xl text-white font-bold tracking-[-2.5px]">Charles</p>
                            <p className="text-6xl text-white self-end font-bold tracking-[-2.5px]">Nalle</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-text-secondary font-thin">1821</p><div className="w-[28px] h-[1px] bg-[#FF9770]"></div><p className="text-text-secondary font-thin">1875</p>
                        </div>
                    </div>
                    <div className="px-4 w-full flex justify-center">
                        <Link to="/map" className="w-full max-w-[200px]">
                            <button
                                className="bg-[#F7DCD3] hover:bg-amber-600 text-white font-bold p-4 w-full rounded-full"
                            >
                                <p className="text-[#BD3900]">Continue</p>
                            </button>
                        </Link>
                    </div>
                    <div className="flex flex-col justify-between items-center p-4">
                        <p className="text-[#B7B3AB] text-center">The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy and the story of Charles Nalle</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 