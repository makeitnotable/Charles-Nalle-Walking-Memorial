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
      <div className='flex flex-col items-center m-5'>
      <MapBox
        initialLocationName={LOCATIONS[0].name}
        width="100%"
        className="rounded-3xl overflow-hidden mb-10 border-1 border-primary-6 mx-auto max-w-lg sm:max-h-xs"
        interactive={false}
        showButtons={false}
        useResponsiveHeight={true}
      />
      <div className='space-y-5 -ml-3 md:flex md:flex-wrap md:gap-6 md:space-y-0 md:ml-0 lg:flex-nowrap'>
        {aboutData.tourworks.numberedSection.points.map((point, index) => (
          <div key={index} className='flex flex-col m-4 mb-4 md:w-[48%] md:m-0 lg:flex-1 lg:w-auto'>
            <div className='flex flex-row items-start space-x-3 mb-4'>
              <div className='h-5 w-5 rounded-full bg-primary-10 weight-500 flex-shrink-0 flex items-center justify-center'>
                <p className='h-full text-primary-12 text-[10px] font-medium leading-none mt-3'>{index + 1}</p>
              </div> 
              <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point.title}</p>
            </div>
            {point.bullets && (
              <ul className='list-disc pl-6 space-y-1'>
                {point.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className='text-primary-12 text-[16px] ml-6 font-[300] leading-relaxed'>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
      <div className='flex w-full flex-row justify-center items-center p-8 mt-10'>
        <Button variant='filled'>
          Get Directions
        </Button>
      </div>
    </div>
  );
};

export default TourWorksSection;
