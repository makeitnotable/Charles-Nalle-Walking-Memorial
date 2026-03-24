import { Button } from '../Button';
import MapBox from '../map/MapBox';
import { LOCATIONS, MAP_CONFIG } from '../map/constants';
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
    <div className='flex flex-col gap-y-8 md:gap-y-12 md:gap-y-16 px-4 pt-4 md:py-4 lg:py-8 mt-8 md:mt-0'>
      <div className='flex flex-col gap-y-2'>
        <h3 className='text-[#F6F3EE] text-[2.625rem] leading-[2.125rem] tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] lg:tracking-[-0.14063rem] font-["Martel_Sans"] font-semibold pt-1 lg:pt-0.5 mb-0'>
          {currentChapter.whereToNext.title.split(' ')[0]}
          <br />
          {currentChapter.whereToNext.title.split(' ').slice(1).join(' ')}
        </h3>
        {/* Show progress indicator above mapbox on mobile */}
        <div className="block py-4 md:hidden">
          <ProgressIndicator className='text-[#F6F3EE] ml-2 my-0'>{currentChapter.whereToNext.number}</ProgressIndicator>
        </div>
      </div>

      <MapBox
        initialLocationName={currentChapter.nextLocationPin}
        width="100%"
        className="rounded-3xl overflow-hidden border-1 border-primary-6 md:border-none md:shadow-lg md:shadow-black/20 md:backdrop-blur-sm max-w-2xl mx-auto"
        interactive={false}
        showButtons={false}
        initialPitch={MAP_CONFIG.locationPage[currentChapter.chapterNumber]?.pitch || MAP_CONFIG.defaultPitch}
        initialBearing={MAP_CONFIG.locationPage[currentChapter.chapterNumber]?.bearing || MAP_CONFIG.defaultBearing}
        targetZoom={MAP_CONFIG.locationPage[currentChapter.chapterNumber]?.zoom || MAP_CONFIG.defaultZoom}
      />

      {/* Show progress indicator below mapbox on tablet & up */}
      <div className="hidden md:block">
        <ProgressIndicator className='text-[#F6F3EE] ml-2 my-0'>{currentChapter.whereToNext.number}</ProgressIndicator>
      </div>

      <div className='flex w-full flex-row justify-center items-center my-8 md:my-0'>
        <Button variant='outline' className='' onClick={handleGetDirections}>
          Get Directions
        </Button>
      </div>

      <span className='block h-0'></span>
    </div>
  );
} 
