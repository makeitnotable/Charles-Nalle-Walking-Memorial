import { useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation'; // Corrected import path
import HeroSection from './HeroSection';
import QuoteSection from './QuoteSection';
import AudioPlayerSection from './AudioPlayerSection';
import NarrativeSection from './NarrativeSection';
import HistoricalContextSection from './HistoricalContextSection';
import MoralMessageSection from './MoralMessageSection';
import WhereToNextSection from './WhereToNextSection';
import FooterSection from './FooterSection';

export default function LocationPage() {

    const { currentChapter, goToNextChapter, goToPrevChapter } = useNavigation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentChapter]);

    if (!currentChapter) {
        return <div className="p-4 text-text-primary text-center">Location not found</div>;
    }

    return (
        <div className=''>
            <HeroSection data={currentChapter} />
            <QuoteSection data={currentChapter} />
            <AudioPlayerSection data={currentChapter} />
            <NarrativeSection
                data={currentChapter}
                goToNextChapter={goToNextChapter}
                goToPrevChapter={goToPrevChapter}
            />
            <HistoricalContextSection data={currentChapter} />
            <MoralMessageSection
                data={currentChapter}
                goToNextChapter={goToNextChapter}
                goToPrevChapter={goToPrevChapter}
            />
            <WhereToNextSection currentChapter={currentChapter} />
            <FooterSection />
        </div>
    );
}