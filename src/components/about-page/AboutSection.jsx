import { aboutData } from '../../data/aboutData';

const AboutSection = () => {
  return (
    <div className='space-y-8 p-4'>
      <div className='space-y-4'>
        <p className="text-[#F6F3EE] uppercase text-5xl font-semibold font-['Martel_Sans']">{aboutData.about.header}</p>
        <p className="text-[#F6F3EE] text-start ml-1 text-xs font-medium font-['Poppins']">{aboutData.about.section}</p>
      </div>
      <div
        className='w-auto h-65 rounded-2xl mb-12 border-2 border-primary-6'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.about.img.horizontal}')`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className='space-y-5'>
        {aboutData.about.narrative.content.map((paragraph, index) => (
          <div key={index} className='m-4 mb-4'>
            <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutSection;
