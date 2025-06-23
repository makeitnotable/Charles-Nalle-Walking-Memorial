import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useTransition } from './stores/useTransitionStore';
import { Button } from './components/Button';
export default function Home() {
    const { play } = useTransition();
    const navigate = useNavigate();

    const handleContinue = (e) => {
        e.preventDefault();
        play(() => {
            navigate('/map');
        });
    };

    return (
        <div className="p-4 h-dvh">
            <div className="h-full flex flex-col justify-between items-center relative">
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/home-bg.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'grayscale(100%) brightness(0.7)',
                    borderTopLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    borderBottomRightRadius: '32px',
                    borderBottomLeftRadius: '32px'
                }}></div>
                <div className="flex flex-col justify-between items-center h-full z-10">
                    <div className="flex flex-col justify-between items-center gap-8 pt-16">
                        <p className="text-primary-11 font-thin">Troy, NY</p>
                        <div className='flex flex-col'>
                            <p className="text-6xl text-neutral-12 font-bold tracking-[-2.5px] uppercase">Charles</p>
                            <p className="text-6xl text-neutral-12 self-end font-bold tracking-[-2.5px] uppercase">Nalle</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-primary-11 font-thin">1821</p><div className="w-[28px] h-[1px] bg-primary-10"></div><p className="text-primary-11 font-thin">1875</p>
                        </div>
                    </div>
                    <div className="px-4 w-full flex justify-center">
                        <Button variant="filled-secondary" onClick={handleContinue}>Continue</Button>
                    </div>
                    <div className="flex flex-col justify-between items-center p-4">
                        <p className="text-gray-11 text-sm text-center">The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy and the story of Charles Nalle</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 