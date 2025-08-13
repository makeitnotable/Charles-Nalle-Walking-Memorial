import { useEffect } from 'react';
import AboutSection from './components/about-page/AboutSection';
import TourWorksSection from './components/about-page/TourWorksSection';
import CharlesSection from './components/about-page/CharlesSection';
import MarkSection from './components/about-page/MarkSection';
import QuoteSection from './components/about-page/QuoteSection';
import ScottSection from './components/about-page/ScottSection';

export default function AboutPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className=''>
            <AboutSection />
            <TourWorksSection />
            <CharlesSection />
            <QuoteSection />
            <MarkSection />
            <ScottSection />
        </div>
    );
}
