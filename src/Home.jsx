import React from 'react';
import { Link } from 'react-router';
import MapBox from './components/MapBox';
import Drawer from './components/Drawer';
export default function Home() {

    return (
        <div className="bg-background">
            <div className="h-dvh flex flex-col justify-between items-center">
                <div className="flex flex-col justify-center items-center h-full">
                    <p className="text-text-secondary font-thin">Troy, New York</p>
                    <div>
                        <p className="text-6xl text-text-secondary">Charles</p>
                        <p className="text-6xl text-text-primary">Nalle</p>
                    </div>
                    <p className="text-text-secondary font-thin">1821 - 1875</p>
                    <div className="max-w-60 pt-8">
                        <p className="text-text-secondary">Charles Nalle Walking Memorial is a thing that happens when other things happen.</p>
                    </div>
                </div>
                <div className="pb-16 px-4 w-full">
                    <Link to="/bakery">
                        <button
                            className="bg-[#EFEDE9] hover:bg-amber-600 text-white font-bold py-5 px-4 rounded w-full"
                        >
                            <p className="text-[#7D776C]">Enter Experience</p>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 