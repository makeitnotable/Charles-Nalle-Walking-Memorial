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
    const { currentChapter, goToNextChapter, goToPrevChapter } = useNavigation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentChapter]);

    if (!currentChapter) {
        return <div className="p-4 text-text-primary text-center">Location not found</div>;
    }

    return (
        <div className='w-full'>
            <div ref={heroRef} className="relative mx-auto mt-6 md:mt-6 lg:mt-12 px-0 md:px-10 lg:px-12">
                <HeroSection data={currentChapter} />
                <QuoteSection data={currentChapter} />
            </div>
            {currentChapter.narrative.contentDesktop ? (
                // Chapter 4: Split layout on desktop using CSS Grid
                <>
                    {/* Mobile: Single column grid */}
                    <div className='md:hidden w-full grid grid-cols-1 gap-y-8 lg:gap-y-12 p-4 py-0 max-w-7xl mx-auto'>
                        <div className="mt-4">
                            <AudioPlayerSection id="audioplayersection-mobile" data={currentChapter} />
                        </div>
                        <NarrativeSection data={currentChapter} />
                    </div>
                    {/*Tablet */}
                    <div className="hidden md:block w-fit mx-auto lg:hidden mt-16">
                        <AudioPlayerSection id="audioplayersection-desktop" data={currentChapter} />
                    </div>
                    {/* Tablet/Desktop: Two column grid */}
                    <div className='hidden md:grid md:grid-cols-2 md:items-center w-full mt-4 gap-10 px-8 md:px-6 py-0 md:py-4 lg:py-8 max-w-7xl mx-auto'>

                        <div className='grid grid-cols-1 gap-y-8 lg:gap-y-12'>
                            {/* Desktop */}
                            <div className="hidden lg:block">
                                <AudioPlayerSection id="audioplayersection-desktop" data={currentChapter} />
                            </div>
                            <NarrativeSection
                                data={currentChapter}
                                contentItems={currentChapter.narrative.contentDesktop.slice(0, 3)}
                            />
                        </div>
                        <div>
                            <NarrativeSection
                                data={currentChapter}
                                contentItems={currentChapter.narrative.contentDesktop.slice(3, 8)}
                                showTitle={false}
                            />
                        </div>
                    </div>
                </>
            ) : (
                // Other chapters: Standard layout using CSS Grid
                <>
                    <div className="w-fit mx-auto mt-16">
                        <AudioPlayerSection id="audioplayersection-standard" data={currentChapter} />
                    </div>
                    <div className='w-full grid grid-cols-1 md:grid-cols-1 mt-4 gap-y-8 md:gap-x-10 p-4 py-0 md:py-4 lg:py-8 max-w-7xl mx-auto'>
                        <div className='w-full'>
                            <NarrativeSection data={currentChapter} />
                        </div>
                    </div>
                </>
            )}
            <div className='flex flex-row justify-center items-center my-8 md:my-12'>
                {currentChapter.nextChapter && (
                    <Button variant='filled' onClick={goToNextChapter} id="chapter-next-button">
                        <span className="text-lg font-medium font-['Poppins'] leading-normal">
                            {currentChapter.nextChapter}
                        </span>
                    </Button>
                )}
            </div>
            <div className='max-w-7xl mx-auto mb-8 md:mb-12'>
                <HistoricalContextSection data={currentChapter} />
            </div>
            {/* TODO: spacing is wrong between these. */}
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
