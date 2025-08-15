import { aboutData } from '../../data/aboutData';

const CharlesSection = () => {
  return (
    <div className="h-full">
      <div className="relative h-full">
        <div className=' text-text-primary space-y-6 relative z-10 m-4'>
          <div className="flex justify-center">
            <p className='text-[#F6F3EE] font-["Martel_Sans"] text-[42px] font-semibold leading-[34px] text-left my-5 tracking-[-1.5px] max-w-[300px]'>{aboutData.charles.header}</p>
          </div>
          <div className='flex justify-end w-full'>
            <div className="w-3/4 h-68 rounded-3xl border-1 border-primary-6 mr-5 mb-5" style={{
              backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.charles.img.horizontal}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <p className=' text-[12px] ml-4 text-[#f6f3ee]'>{aboutData.charles.section}</p>
          
          <div className='space-y-5'>
            {aboutData.charles.narrative.content.map((paragraph, index) => (
              <div key={index} className='m-4 mb-4'>
                <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharlesSection;
