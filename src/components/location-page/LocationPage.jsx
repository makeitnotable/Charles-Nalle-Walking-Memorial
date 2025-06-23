import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { locationData } from '../../data/locationData';
import { useTransition } from '../../stores/useTransitionStore';
import HeroSection from './HeroSection';
import QuoteSection from './QuoteSection';
import AudioPlayerSection from './AudioPlayerSection';
import NarrativeSection from './NarrativeSection';
import HistoricalContextSection from './HistoricalContextSection';
import MoralMessageSection from './MoralMessageSection';
import WhereToNextSection from './WhereToNextSection';
import FooterSection from './FooterSection';

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
        <div className="space-y-8">
            <HeroSection data={data} />
            <QuoteSection data={data} />
            <AudioPlayerSection data={data} />
            <NarrativeSection data={data} />
            <HistoricalContextSection data={data} />
            <MoralMessageSection data={data} handleNavigate={handleNavigate} />
            <WhereToNextSection data={data} />
            <FooterSection />
        </div>
    );
} 