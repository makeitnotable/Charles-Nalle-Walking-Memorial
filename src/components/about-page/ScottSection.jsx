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
    <div className="h-full">
      <div className="relative h-full">
        <div className=' text-text-primary space-y-6 relative z-10 m-4'>
          <div className="flex justify-start">
            <p className='text-[#F6F3EE] font-["Martel_Sans"] text-[42px] font-semibold leading-[34px] text-left my-5 tracking-[-1.5px] max-w-[300px] ml-4'>{aboutData.scott.header}</p>
          </div>
          <div className='flex justify-end w-full'>
            <div className="w-3/4 h-68 rounded-3xl border-1 border-primary-6 mr-5 mb-5" style={{
              backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${aboutData.scott.img.horizontal}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
          <p className=' text-[12px] ml-4 text-[#ff9770]'>{aboutData.scott.section}</p>
          
          <div className='space-y-5'>
            {aboutData.scott.narrative.content.map((paragraph, index) => (
              <div key={index} className='m-4 mb-4'>
                <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{paragraph}</p>
              </div>
            ))}
          </div>

          <div className='flex flex-row justify-center items-center mt-20 mb-20 gap-5'>
            <Button onClick={goToChapter1} variant='filled'>
              <div className='flex items-center gap-2 text-[18px]'>
                <p>Chapter 1</p>
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 13.667L7.5 7.66699L1.5 1.66699" stroke="#FF9770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScottSection;
