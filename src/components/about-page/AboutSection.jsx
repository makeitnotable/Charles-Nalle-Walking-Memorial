import { aboutData } from '../../data/aboutData';

const AboutSection = () => {
  return (
    <div className='space-y-8 p-4'>
      <div className='space-y-4'>
        <p className="pt-12 text-[#F6F3EE] uppercase text-[42px] md:text-[62px] md:w-[450px] md:leading-[50px] leading-[34px] font-semibold font-['Martel_Sans']">{aboutData.about.header}</p>
        <p className="mt-2 mb-12 text-[#F6F3EE] text-start ml-1 text-xs md:hidden font-medium font-['Poppins']">{aboutData.about.section}</p>
      </div>
      <div
        className='mx-auto w-auto max-w-xl h-65 md:h-[450px] rounded-2xl mb-12 border-2 border-primary-6'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.about.img.horizontal }')`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className='space-y-5 md:flex md:gap-8 md:space-y-0'>
        <div className='m-6 md:flex-1 md:flex md:flex-col md:justify-start'>
          <p className="hidden md:block mb-4 text-[#F6F3EE] text-start text-[14px] font-medium font-['Poppins']">{aboutData.about.section}</p>
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
