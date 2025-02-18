import React from 'react';
import MapBox from './components/MapBox';

export default function BakeryPage() {
    return (
        <div className="h-full relative">
            <div className="absolute inset-0 z-0">
                <MapBox />
            </div>
            <div className="h-full relative z-10 bg-background bg-opacity-50">
                <h1 className="text-4xl font-bold mb-4 text-text-primary">Welcome to the Bakery</h1>
                <p className="text-lg mb-8 text-text-secondary">
                    We offer a delightful selection of freshly baked goods. Enjoy our artisan breads, flaky croissants, decadent cakes and more.
                </p>
                <button className="bg-button hover:bg-amber-600 text-white font-bold py-2 px-4 rounded">
                    View Menu
                </button>
            </div>
        </div>
    );
} 