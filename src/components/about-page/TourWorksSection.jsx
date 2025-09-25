import { aboutData } from '../../data/aboutData';
import MapBox from '../map/MapBox';
import { Button } from '../Button';
import { LOCATIONS } from '../map/constants';

const TourWorksSection = () => {
  return (
    <div className='space-y-8 p-4'>
      <div className='space-y-4'>
        <p className="text-[#F6F3EE] uppercase text-[42px]  font-semibold font-['Martel_Sans'] tracking-[-1.5px] leading-[34px]">
          How the<br />tour works
        </p>
        <p className="mt-2 mb-12 text-[#F6F3EE] text-start ml-1 text-xs font-medium font-['Poppins']">{aboutData.tourworks.section}</p>
      </div>
      <div className='space-y-5 -ml-3'>
        {aboutData.tourworks.numberedSection.points.map((point, index) => (
          <div key={index} className='flex flex-row items-start m-4 space-x-3 mb-4'>
              <div className='h-5 w-5 rounded-full bg-primary-10 weight-500 flex-shrink-0 flex items-center justify-center'>
                <p className='h-full text-primary-12 text-[10px] font-medium leading-none mt-3'>{index + 1}</p>
              </div> 
            <div className='space-y-2'>
              <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point.title}</p>
              {point.bullets && (
                <ul className='list-disc pl-6'>
                  {point.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className='text-primary-12 text-[16px] font-[300] leading-relaxed'>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      <MapBox
        initialLocationName={LOCATIONS[0].name}
        width="100%"
        className="rounded-3xl overflow-hidden mt-10 mb-5 border-1 border-primary-6"
        interactive={false}
        showButtons={false}
        useResponsiveHeight={true}
      />
      <div className='flex w-full flex-row justify-center items-center p-8 mt-10'>
        <Button variant='filled'>
          Get Directions
        </Button>
      </div>
    </div>
  );
};

export default TourWorksSection;
