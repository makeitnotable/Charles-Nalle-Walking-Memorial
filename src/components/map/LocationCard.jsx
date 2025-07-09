import Arrow from "../Arrow";
import { locationData } from "../../data/locationData";

const LocationCard = ({ location, onNavigate }) => {
  const locationKey = location.path.slice(1); // Remove leading slash
  const { title, cardTitle, backgroundImage } = locationData[locationKey];

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
    <div className='fixed bottom-0 left-0 right-0 z-10 cursor-pointer' onClick={handleViewDetails}>
      <div className='p-6'>
        <div className='h-32 w-full bg-primary-2 border-2 border-primary-3 text-white flex rounded-xl'>
          <div className='w-1/3 h-full'>
            {/* Display location image */}
            <div className='w-full h-full'>
              {backgroundImage && (
                <img src={backgroundImage} alt={title} className="w-full h-full object-cover rounded-l-xl border-r-1 border-r-[rgba(105,49,29,1)]" />
              )}
            </div>
          </div>
          <div className='w-2/3 h-full p-3 flex flex-col justify-between'>
            <div className='flex flex-row justify-between items-center'>
              <p className='uppercase text-xs font-normal font-poppins text-primary-11 leading-none'>Chapter</p>
              <div className='rounded-full w-[16px] h-[16px] flex justify-center items-center px-[6px] aspect-square bg-primary-10'>
                <p className='text-[10px] font-medium font-poppins text-primary-12 leading-none mt-0.5'>1</p>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col text-[18px] font-semibold font-["Martel_Sans"] text-primary-12 text-left leading-tight'>
                <p>{firstLine}</p>
                {secondLine && <p>{secondLine}</p>}
              </div>
              <div className='flex flex-row items-center'>
                <Arrow length={300} direction={0} className='text-primary-12' strokeWidth={1} triangleSize={8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
