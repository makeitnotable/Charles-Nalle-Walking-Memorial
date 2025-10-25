import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigation } from '../hooks/useNavigation';
import { Button } from '../Button';
import HeroSection from './HeroSection';
import QuoteSection from './QuoteSection';
import AudioPlayerSection from './AudioPlayerSection';
import NarrativeSection from './NarrativeSection';
import HistoricalContextSection from './HistoricalContextSection';
import MoralMessageSection from './MoralMessageSection';
import WhereToNextSection from './WhereToNextSection';
import FooterSection from './FooterSection';

gsap.registerPlugin(ScrollTrigger);

export default function LocationPage() {
    const heroRef = useRef(null);
    const quoteRef = useRef(null);
    const gradientRef = useRef(null);
    const { currentChapter, goToNextChapter, goToPrevChapter } = useNavigation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentChapter]);

    if (!currentChapter) {
        return <div className="p-4 text-text-primary text-center">Location not found</div>;
    }

    return (
        <div className='w-full'>
            <div ref={heroRef} className="relative max-w-7xl mx-auto">
                <HeroSection data={currentChapter} />
                <div
                    ref={gradientRef}
                    style={{
                        opacity: 0,
                        background: 'linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8))'
                    }}
                    className="absolute inset-0 pointer-events-none"
                />
                <div ref={quoteRef} style={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                    <QuoteSection data={currentChapter} />
                </div>
            </div>
            {currentChapter.narrative.contentDesktop ? (
                // Chapter 4: Split layout on desktop
                <>
                    <div className='md:hidden w-full flex flex-col space-y-10 p-4 max-w-7xl mx-auto'>
                        <AudioPlayerSection data={currentChapter} />
                        <NarrativeSection data={currentChapter} />
                    </div>
                    <div className='hidden md:flex w-full flex-row mt-10 space-x-10 p-4 max-w-7xl mx-auto'>
                        <div className='w-1/2 space-y-10'>
                            <AudioPlayerSection data={currentChapter} />
                            <NarrativeSection
                                data={currentChapter}
                                contentItems={currentChapter.narrative.contentDesktop.slice(0, 3)}
                            />
                        </div>
                        <div className='w-1/2'>
                            <NarrativeSection
                                data={currentChapter}
                                contentItems={currentChapter.narrative.contentDesktop.slice(3, 8)}
                                showTitle={false}
                            />
                        </div>
                    </div>
                </>
            ) : (
                // Other chapters: Standard layout
                <div className='w-full flex flex-col md:flex-row mt-10 md:space-x-10 p-4 space-y-10 md:space-y-0 max-w-7xl mx-auto'>
                    <div className='w-full md:w-1/3'>
                        <AudioPlayerSection data={currentChapter} />
                    </div>
                    <div className='flex-1 w-full'>
                        <NarrativeSection data={currentChapter} />
                    </div>
                </div>
            )}
            <div className='flex flex-row justify-center items-center mb-6'>
                {currentChapter.nextChapter && (
                    <Button variant='filled' onClick={goToNextChapter}>
                        <span className="text-lg font-medium font-['Poppins'] leading-normal">
                            {currentChapter.nextChapter}
                        </span>
                    </Button>
                )}
            </div>
            <div className='max-w-7xl mx-auto'>
                <HistoricalContextSection data={currentChapter} />
            </div>
            <MoralMessageSection
                data={currentChapter}
                goToNextChapter={goToNextChapter}
                goToPrevChapter={goToPrevChapter}
            />
            <div className='max-w-7xl mx-auto'>
                <WhereToNextSection currentChapter={currentChapter} />
                <FooterSection />
            </div>
        </div>
    );
}