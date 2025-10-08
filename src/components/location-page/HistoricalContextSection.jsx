import { isMobile } from 'react-device-detect';

export default function HistoricalContextSection({ data }) {
  return (
    <div className='space-y-8 pt-4 px-4 pb-0'>
      <div className='space-y-4'>
        <p className="text-[#F6F3EE] uppercase text-5xl font-semibold font-['Martel_Sans']">Historical <br /> Context</p>
      </div>
      <div
        className='mx-auto w-auto max-w-md h-65 lg:h-[450px] rounded-2xl mb-12 border-2 border-primary-6'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${isMobile ? data.backgroundImage.historical : data.backgroundImage.historicalHorizontal}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <p className="text-[#F6F3EE] text-start ml-1 text-xs font-medium font-['Poppins']">{data.historicalContext.number}</p>
      <div className='space-y-5 flex sm:flex-row flex-col'>
        {data.historicalContext.points.map((point, index) => (
          <div key={index} className='flex flex-row items-start m-4 space-x-2 mb-4 flex-1'>
            <div className='flex flex-row items-top space-x-2'>
              <div className='h-5 w-5 rounded-full bg-primary-10 weight-500 flex-shrink-0 flex items-center justify-center'>
                <p className='h-full text-primary-12 text-[10px] font-medium leading-none mt-3'>{index + 1}</p>
              </div>
              <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
