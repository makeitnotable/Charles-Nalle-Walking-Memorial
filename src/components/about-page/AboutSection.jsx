import { aboutData } from '../../data/aboutData';

const AboutSection = () => {
  return (
    <div className='space-y-8 md:space-y-12 pt-8 pb-0 md:py-4 lg:py-8 px-4'>
      <div className=''>
        <p className="text-[#F6F3EE] uppercase text-[2.63rem] leading-[2.13rem] tracking-[-0.09rem] md:text-[3.28rem] md:leading-[2.66rem] md:tracking-[-0.12rem] lg:text-[3.94rem] lg:leading-[3.19rem] lg:tracking-[-0.14rem] md:w-[450px] font-semibold font-['Martel_Sans']">{aboutData.about.header}</p>
        <p className="mt-2 mb-12 text-[#F6F3EE] text-start ml-1 text-[.75rem] md:text-[0.94rem] lg:text-[1.13rem] md:hidden font-medium font-['Poppins']">{aboutData.about.section}</p>
      </div>
      <div
        className='mx-auto w-auto max-w-xl w-[21.43rem] h-[14.29rem] md:w-[22.5rem] md:h-[17rem] lg:w-[34rem] lg:h-[22.66rem] rounded-2xl mb-12 border-2 border-primary-6 overflow-x-none'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.about.img.horizontal }')`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className='flex flex-col md:flex-row md:gap-8 md:space-y-0'>
        <div className='mx-6 md:flex-1 md:flex md:flex-col md:justify-start'>
          <p className="hidden md:block mb-4 text-[#F6F3EE] text-start text-[.75rem] md:text-[0.94rem] lg:text-[1.13rem] font-medium font-['Poppins']">{aboutData.about.section}</p>
          <p className='text-primary-12 text-[18px] font-[400] leading-relaxed'>{aboutData.about.narrative.content[0]}</p>
        </div>
        <div className='md:flex-1 md:space-y-5'>
          {aboutData.about.narrative.content.slice(1).map((paragraph, index) => (
            <div key={index} className='m-6'>
              <p className='text-primary-12 text-[18px] font-[400] leading-relaxed'>{paragraph}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
