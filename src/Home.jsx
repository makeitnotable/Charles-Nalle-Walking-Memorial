import { useNavigate } from "react-router";
import { useTransition } from "./stores/useTransitionStore";
import { Button } from "./components/Button";
export default function Home() {
  const { play } = useTransition();
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    play(() => {
      navigate("/map");
    });
  };

  return (
    <div className='p-4 h-dvh'>
      <div className='h-full flex flex-col justify-between items-center relative'>
        <div
          className='absolute inset-0 z-0'
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(16, 10, 6, 0.1), rgba(16,10, 5, .89)), linear-gradient(to bottom, rgba(101, 67, 33, 0.30), rgba(101, 30, 33, 0.30)), url('/homepage-overlay.png'), url('/home-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "grayscale(100%) brightness(0.7) contrast(1.0) sepia(0.1) opacity(0.9)",
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",
            borderBottomRightRadius: "32px",
            borderBottomLeftRadius: "32px",
          }}
        ></div>
        <div className='flex flex-col justify-between items-center h-full z-10'>
          <div className='flex flex-col justify-between items-center gap-8 pt-16'>
            <p className='text-primary-11 font-normal text-sm'>Troy, NY</p>
            <div className='flex flex-col'>
              <p className='text-[54px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none'>
                Charles
              </p>
              <p className='text-[54px] text-neutral-12 self-end font-semibold tracking-[-2.5px] uppercase leading-none -mt-3'>
                Nalle
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-primary-11 font-normal text-sm'>1821</p>
              <div className='w-[28px] h-[1px] bg-primary-10'></div>
              <p className='text-primary-11 font-normal text-sm'>1875</p>
            </div>
          </div>
          <div className='px-4 w-full flex justify-center'>
            <Button variant='filled-secondary' onClick={handleContinue}>
              Continue
            </Button>
          </div>
          <div className='flex flex-col justify-between items-center p-4'>
            <p className='text-gray-11 text-[12px] mx-4  mb-2 text-center font-normal'>
              The Charles Nalle Walking Memorial is a digital physical experience designed to share the history of Troy
              and the story of Charles Nalle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
