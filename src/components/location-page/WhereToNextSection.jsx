import { Button } from '../Button';
import MapBox from '../map/MapBox';
import { LOCATIONS } from '../map/constants';
import ProgressIndicator from './ProgressIndicator';

export default function WhereToNextSection({ currentChapter }) {
    
    const handleGetDirections = () => {
        if (!currentChapter?.nextLocationPin) return;
        const target = LOCATIONS.find(loc => loc.name === currentChapter.nextLocationPin);
        if (!target?.coordinates) return;
        const [lng, lat] = target.coordinates; // stored as [lng, lat]
        const destination = `${lat},${lng}`; // Google expects lat,lng
        console.log(destination);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
        window.open(url, '_blank');
    };
    return (
        <div className='space-y-8 md:space-y-12 md:space-y-16 px-4 pt-4 md:py-4 lg:py-8'>
            <div className='space-y-2'>
                <p className='text-[#F6F3EE] text-[2.625rem] leading-[2.125rem] tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] lg:tracking-[-0.14063rem] font-["Martel_Sans"] font-semibold'>
                    {currentChapter.whereToNext.title.split(' ')[0]}
                    <br />
                    {currentChapter.whereToNext.title.split(' ').slice(1).join(' ')}
                </p>
              {/* Show progress indicator above mapbox on mobile */}
              <div className="mt-4 hidden md:block">
                <ProgressIndicator className='text-[#F6F3EE] ml-2 my-4'>{currentChapter.whereToNext.number}</ProgressIndicator>
              </div>
            </div>

            <MapBox
                initialLocationName={currentChapter.nextLocationPin}
                width="100%"
                className="rounded-3xl overflow-hidden mt-10 mb-5 border-1 border-primary-6 md:border-none md:shadow-lg md:shadow-black/20 md:backdrop-blur-sm max-w-2xl mx-auto"
                interactive={false}
                showButtons={false}
            />

          {/* Show progress indicator below mapbox on tablet & up */}
          <div className="mt-12 sm:hidden">
            <ProgressIndicator className='text-[#F6F3EE] ml-2 my-4'>{currentChapter.whereToNext.number}</ProgressIndicator>
          </div>

          <div className='flex w-full flex-row justify-center items-center p-8 mt-10 md:mt-12'>
            <Button variant='outline' className='' onClick={handleGetDirections}>
              Get Directions
            </Button>
          </div>
    </div>
    );
} 
