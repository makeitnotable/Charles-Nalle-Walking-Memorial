import { useNavigate } from 'react-router';
import { useTransition } from '../../stores/useTransitionStore';
import { Button } from '../Button';
import { aboutData } from '../../data/aboutData';

const ScottSection = () => {
  const navigate = useNavigate();
  const { play } = useTransition();

  const goToChapter1 = () => {
    play(() => {
      navigate('/bakery');
    });
  };

  return (
    <div className="h-full mt-10">
      <div className="relative h-full">

        <div className='absolute inset-0 h-full'>
          <div className='absolute inset-0' style={{ background: "linear-gradient(#1D1411, rgba(16, 10, 6, .8), #1D1411)" }} />
          <div className='h-full py-0.5'>
            <img src={aboutData.scott.img.vertical} alt="Scott Background" className='w-full h-full object-cover' style={{ filter: "grayscale(100%) brightness(0.7) contrast(1.0) sepia(0.1) opacity(0.2)" }} />
          </div>
          <div className='absolute inset-0' style={{ background: "linear-gradient(to bottom, rgba(29, 20, 17, 1) 0%, transparent 50%, transparent 5%, rgba(29, 20, 17, 1) 100%)" }} />
        </div>
        <div className=' text-text-primary space-y-6 relative z-10 m-4'>
          <div className="flex justify-start">
            <p className='text-[#F6F3EE] font-["Martel_Sans"] text-[42px] font-semibold leading-[34px] text-left my-5 tracking-[-1.5px] max-w-[300px] ml-4'>{aboutData.scott.header}</p>
          </div>
          <div className='flex justify-end w-full'>
            <div className="w-3/4 h-68 lg:w-[500px] lg:h-[500px] rounded-3xl border-1 border-primary-6 mr-5 mb-5" style={{
              backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.scott.img.horizontal}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <p className=' text-[12px] ml-4 text-[#ff9770]'>{aboutData.scott.section}</p>

          <div className='space-y-5 w-full md:w-1/2 md:ml-auto'>
            {aboutData.scott.narrative.content.map((paragraph, index) => (
              <div key={index} className='m-4 mb-4'>
                <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
              </div>
            ))}
          </div>

          <div className='flex flex-row justify-center items-center mt-10 mb-10'>
            <Button onClick={goToChapter1} variant='filled'>
              <div className='flex items-center justify-center text-[18px]'>
                <p>Chapter 1</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScottSection;
