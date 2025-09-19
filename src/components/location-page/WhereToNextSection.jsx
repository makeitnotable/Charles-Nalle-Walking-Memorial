import { Button } from '../Button';
import MapBox from '../map/MapBox';
import { isMobile } from 'react-device-detect';
import { LOCATIONS } from '../map/constants';

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
        <div className='space-y-4 p-4'>
            <div className='space-y-2'>
                <p className='text-[#F6F3EE] text-5xl font-["Martel_Sans"] font-semibold leading-[38px] tracking-[-1.5px]'>
                    {currentChapter.whereToNext.title.split(' ')[0]}
                    <br />
                    {currentChapter.whereToNext.title.split(' ').slice(1).join(' ')}
                </p>
                <p className='text-[#F6F3EE] ml-2 my-4 text-xs font-["Poppins"] font-medium leading-[18px]'>{currentChapter.whereToNext.number}</p>
            </div>

            <MapBox
                initialLocationName={currentChapter.nextLocationPin}
                height={isMobile ? "300px" : "500px"}
                width="100%"
                className="rounded-3xl overflow-hidden mt-10 mb-5 border-2 border-primary-6"
                interactive={false}
                showButtons={false}
            />
            <div className='flex w-full flex-row justify-center items-center p-8 mt-10'>
                <Button variant='filled' className='' onClick={handleGetDirections}>
                    Get Directions
                </Button>
            </div>
        </div>
    );
} 