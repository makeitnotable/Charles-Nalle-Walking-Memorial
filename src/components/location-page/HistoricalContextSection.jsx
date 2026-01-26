import { isMobile } from 'react-device-detect';
import ProgressIndicator from './ProgressIndicator';

export default function HistoricalContextSection({ data }) {
  const staticImage = isMobile ? data.backgroundImage.historical : data.backgroundImage.historicalHorizontal;
  const animatedHistorical = data.backgroundImage.animatedHistorical;
  const hasAnimatedVideo = !!animatedHistorical;

  return (
    <div className='space-y-8 md:space-y-12 py-0 md:py-4 lg:py-8 px-4' id="historical-context-section">
      <div className='space-y-4'>
        <p className="text-[#F6F3EE] uppercase text-[2.625rem] leading-[2.125rem] sm:tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] tracking-[-0.14063rem] font-semibold font-['Martel_Sans'] pt-0.5">Historical <br /> Context</p>
      </div>
      {hasAnimatedVideo ? (
        <video
          src={`/${animatedHistorical}`}
          poster={`/${staticImage}`}
          autoPlay
          loop
          muted
          playsInline
          className='mx-auto w-auto max-w-[100%] max-h-[363px] rounded-2xl mb-12 object-cover'
        />
      ) : (
        <div
          className='mx-auto w-auto max-w-md h-65 max-h-[363px] rounded-2xl mb-12 border-2 border-primary-6'
          style={{
            backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('/${staticImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      <ProgressIndicator className="text-[#F6F3EE] text-start md:ml-2">{data.historicalContext.number}</ProgressIndicator>
      <div className='flex flex-col md:flex-row gap-y-4 md:gap-x-4 lg:gap-x-12'>
        {data.historicalContext.points.map((point, index) => (
          <div key={index} className='flex flex-row items-start mb-4 flex-1'>
            <div className='flex flex-row items-top space-x-2'>
              <div className='h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 rounded-full bg-primary-10 weight-500 flex-shrink-0 flex items-center justify-center'>
                <p className='h-full text-primary-12 text-[10px] font-medium text-center text-[0.625rem] md:text-[0.78125rem] lg:text-[0.9375rem] mt-1'>{index + 1}</p>
              </div>
              <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
