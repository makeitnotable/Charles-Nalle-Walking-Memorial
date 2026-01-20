import { aboutData } from '../../data/aboutData';


const MarkSection = () => {
  return (
    <div className="h-full px-4 md:px-10 lg:px-20">
      <div className="relative h-full">
        <div className='absolute inset-0 h-full'>
          <div className='absolute inset-0 left-1/2 -translate-x-1/2 w-screen h-full overflow-hidden' style={{ background: "linear-gradient(#1D1411, rgba(16, 10, 6, .8), #1D1411)" }} />
          <div className='absolute inset-0 left-1/2 -translate-x-1/2 w-screen h-full overflow-hidden opacity-15 py-0.5'>
            <img src={aboutData.mark.img.vertical} alt="Mark Priest Background Picture" className='w-full h-full object-cover' style={{ maskImage: "linear-gradient(to bottom,transparent 0%, black 30%, black 70%, transparent 100%)" }}/>
          </div>
        </div>
        <div className=' text-text-primary space-y-6 relative z-10 m-4'>
          <div className="flex justify-start">
            <p className='text-[#F6F3EE] font-["Martel_Sans"] text-[2.63rem] leading-[2.13rem] tracking-[-0.09rem] md:text-[3.28rem] md:leading-[2.66rem] md:tracking-[-0.12rem] lg:text-[3.94rem] lg:leading-[3.19rem] lg:tracking-[-0.14rem] font-semibold text-left my-5 max-w-[300px] ml-4'>MARK<br /> PRIEST</p>
          </div>
          <div className='flex justify-end w-full'>
            <div className="w-3/4 h-68 lg:w-[500px] lg:h-[500px] rounded-3xl border-1 border-primary-6 mr-5 mb-5" style={{
              backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.mark.img.horizontal}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <p className='text-[.75rem] md:text-[0.94rem] lg:text-[1.13rem] ml-4 text-[#ff9770]'>{aboutData.mark.section}</p>

          <div className='space-y-5 w-full md:w-1/2 md:ml-auto'>
            {aboutData.mark.narrative.content.map((paragraph, index) => (
              <div key={index} className='m-4'>
                <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkSection;
