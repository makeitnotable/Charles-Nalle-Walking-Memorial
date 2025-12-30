import { memo } from "react";
import Arrow from "../Arrow";
import { locationData } from "../../data/locationData";

const LocationCard = memo(({ location, onNavigate }) => {
  const locationKey = location.path.slice(1); // Remove leading slash
  const { title, cardTitle, backgroundImage, chapterNumber } = locationData[locationKey];

  const [firstLine, secondLine] = cardTitle === "Holeur's Fashionable Bakery"
    ? ["Holeur's", "Fashionable Bakery"]
    : [cardTitle, ''];

  const handleViewDetails = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div
      className='cursor-pointer transform-gpu'
      onClick={handleViewDetails}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className='md:h-40 lg:h-48 bg-primary-2 border-2 border-primary-3 text-white flex rounded-xl overflow-hidden mx-auto w-[343px] h-[128px] md:w-[428.75px] md:h-[160px] lg:w-[514.5px] lg:h-[192px]'>
        <div className='h-full'>
          <div className='w-[128px] h-[128px] md:w-[160px] md:h-[160px] lg:w-[192px] lg:h-[192px]'>
            {backgroundImage && (
              <img
                src={backgroundImage.square}
                alt={title.one + ' ' + title.two + ' ' + title.three + ' image'}
                className="w-full h-full object-cover border-r-1 border-r-[rgba(105,49,29,1)]"
                loading="lazy"
                decoding="async"
                style={{
                  willChange: 'auto', // Images don't need will-change
                  backfaceVisibility: 'hidden',
                }}
              />
            )}
          </div>
        </div>
        <div className='w-2/3 h-full p-3 flex flex-col justify-between'>
          <div className='flex flex-row justify-between items-center m-1'>
            <p className='uppercase text-[12px] md:text-[15px] lg:text-[18px] font-normal font-poppins text-primary-11 leading-none mt-1'>Chapter</p>
            <div className='rounded-full w-[1rem] h-[1rem] md:w-[1.25rem] md:h-[1.25rem] lg:w-[1.5rem] lg:h-[1.5rem] flex justify-center items-center px-[6px] aspect-square bg-primary-10'>
              <p className='text-[.625rem] md:text-[0.78125rem] lg:text-[.9375rem] font-medium font-poppins text-primary-12 leading-none mt-0.5'>{chapterNumber}</p>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='flex flex-col text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] font-medium font-["Martel_Sans"] text-primary-12 text-left leading-tight ml-1' >
              <p>{firstLine}</p>
              {secondLine && <p>{secondLine}</p>}
            </div>
            <div className='flex flex-row items-center ml-1 mr-3'>
              <Arrow
                className="w-full h-auto -mb-2"
                direction={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});



LocationCard.displayName = 'LocationCard';

export default LocationCard;
