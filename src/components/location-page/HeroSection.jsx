import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArrowDown from '../ArrowDown';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function HeroSection({ data }) {
    const imageRef = useRef(null);
    const textContentRef = useRef(null);

    // Use horizontal image for desktop, vertical for mobile
    const backgroundImage = isMobile
        ? data.backgroundImage.vertical
        : data.backgroundImage.horizontal;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: imageRef.current,
                    start: "top top",
                    end: "+=100%",
                    scrub: 0.5,
                    invalidateOnRefresh: false,
                }
            })
                .to(imageRef.current, { scale: 1.4, borderRadius: 0, marginTop: 0 }, 0)
                .to(textContentRef.current, { y: -200 }, 0);
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="h-screen flex flex-col relative overflow-hidden">
            <div ref={textContentRef} className="flex-none space-y-4 relative z-20">
                <div className="pt-2 px-6 ">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-poppins text-[12px] font-normal leading-[15px] text-[#ff9770]">CHAPTER</p>
                        <div className="h-5 w-5 rounded-full bg-primary-10 flex items-center justify-center">
                            <p className='text-[10px] font-medium font-poppins text-primary-12 leading-none mt-0.5'>{data.chapterNumber}</p>
                        </div>
                    </div>
                    <div className='flex items-start justify-between mt-6 -ml-1'>
                        <h1 className="font-['Martel_Sans'] text-[42px] font-semibold leading-[34px] tracking-[-1.5px] text-[#F6F3EE]">
                            {data.title.one}
                            <br />
                            {data.title.two}
                            <br />
                            {data.title.three}
                        </h1>
                        <div className="flex-col justify-evenly items-end mr-1 h-full">
                            <ArrowDown
                                className="text-primary-12 h-fit ml-1"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <img
                ref={imageRef}
                src={backgroundImage}
                alt={`${data.title.one} ${data.title.two} ${data.title.three}`}
                className="mt-5 w-full flex-1 max-h-screen bg-neutral-1 rounded-t-3xl border-[rgba(105,49,29,1)] border-t object-cover object-center"
            />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--color-primary-2)] to-transparent z-10" />
        </div>
    );
}

// linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8)