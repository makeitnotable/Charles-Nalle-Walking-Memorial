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
      <div className='h-32 w-full bg-primary-2 border-2 border-primary-3 text-white flex rounded-xl overflow-hidden'>
        <div className='w-1/3 h-full'>
          <div className='w-full h-full'>
            {backgroundImage && (
              <img
                src={backgroundImage.square}
                alt={title}
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
            <p className='uppercase text-[12px] font-normal font-poppins text-primary-11 leading-none'>Chapter</p>
            <div className='rounded-full w-[16px] h-[16px] flex justify-center items-center px-[6px] aspect-square bg-primary-10'>
              <p className='text-[10px] font-medium font-poppins text-primary-12 leading-none mt-0.5'>{chapterNumber}</p>
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='flex flex-col text-[18px] font-medium font-["Martel_Sans"] text-primary-12 text-left leading-tight ml-1' >
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
