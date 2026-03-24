import { aboutData } from '../../data/aboutData';

const ScottSection = () => {
  return (
    <div className="h-full mt-10">
      <div className="relative h-full">

        <div className='absolute inset-0 h-full'>
          <div className='absolute inset-0 left-1/2 -translate-x-1/2 w-screen h-full overflow-hidden' style={{ background: "linear-gradient(#1D1411, rgba(16, 10, 6, .8), #1D1411)" }} />
          <div className='absolute inset-0 left-1/2 -translate-x-1/2 w-screen h-full overflow-hidden opacity-15 py-0.5'>
            <img src={aboutData.scott.img.vertical} alt="Scott Background" className='w-full h-full object-cover' style={{ maskImage: "linear-gradient(to bottom,transparent 0%, black 30%, black 70%, transparent 100%)", filter: "grayscale(100%) brightness(0.7) contrast(1.0) sepia(0.1)"
            }}/>
          </div>
        </div>
        <div className='flex flex-col gap-y-8 md:gap-y-12 text-text-primary relative z-10 m-4'>
          <div className="flex justify-start">
            <p className='text-[#F6F3EE] font-["Martel_Sans"] text-[2.63rem] leading-[2.13rem] tracking-[-0.09rem] md:text-[3.28rem] md:leading-[2.66rem] md:tracking-[-0.12rem] lg:text-[3.94rem] lg:leading-[3.19rem] lg:tracking-[-0.14rem] font-semibold text-left max-w-[300px] ml-4 mb-2 md:mb-0'>{aboutData.scott.header}</p>
          </div>
          <div className='flex justify-end md:justify-center w-full'>
            <div className="w-[15.625rem] h-[15.625rem] md:w-[17.578rem] md:h-[17.578rem] lg:w-[23.437rem] lg:h-[23.437rem] rounded-3xl border-1 border-primary-6 mr-5" style={{
              backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.scott.img.horizontal}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <div className='flex flex-col md:flex-row md:items-start gap-y-8 md:gap-x-8'>
            <p className="md:w-1/2 ml-4 md:ml-8 my-4 md:my-0 text-[.75rem] md:text-[0.94rem] lg:text-[1.13rem] text-[#ff9770]">{aboutData.scott.section}</p>

            <div className='space-y-5 w-full md:w-1/2'>
              {aboutData.scott.narrative.content.map((paragraph, index) => (
                <div key={index} className='mx-4 md:mx-0'>
                  <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TODO: share */}
        </div>
      </div>
    </div>
  );
};

export default ScottSection;
