import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArrowDown from '../ArrowDown';

// Helper function to extract text from React children for alt attributes
const getTextFromChildren = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children
      .map(child => {
        if (typeof child === 'string') return child;
        if (child?.props?.children) return getTextFromChildren(child.props.children);
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  if (children?.props?.children) return getTextFromChildren(children.props.children);
  return '';
};

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function HeroSection({ data }) {
    const mediaRef = useRef(null);
    const textContentRef = useRef(null);

    // Use horizontal image/video for desktop, vertical for mobile
    const backgroundImage = isMobile
        ? data.backgroundImage.vertical
        : data.backgroundImage.horizontal;

    // Check if animated video is available
    const animatedVideo = isMobile
        ? data.backgroundImage.animatedVertical
        : data.backgroundImage.animatedHorizontal;
    
    const hasAnimatedVideo = !!animatedVideo;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: mediaRef.current,
                    start: "top top",
                    end: "+=100%",
                    scrub: 0.5,
                    invalidateOnRefresh: false,
                }
            })
                .to(mediaRef.current, { scale: 1.4, borderRadius: 0, marginTop: 0 }, 0)
                .to(textContentRef.current, { y: -200 }, 0);
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="h-screen flex flex-col relative overflow-hidden">
            <div ref={textContentRef} className="flex-none relative z-20">
                <div className="px-8 space-y-6 py-6" id="header">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-poppins text-[.75rem] md:text-[0.9375rem] lg:text-[1.125rem] font-normal leading-[15px] md:leading-[18.75px] lg:leading-[22.5px] text-[#ff9770]">CHAPTER</p>
                        <div className="w-[1rem] h-[1rem] md:w-[1.25rem] md:h-[1.25rem] lg:w-[1.5rem] lg:h-[1.5rem] rounded-full bg-primary-10 flex items-center justify-center">
                            <p className='text-[.625rem] md:text-[0.78125rem] lg:text-[.9375rem] font-medium font-poppins text-primary-12 leading-none mt-0.5'>{data.chapterNumber}</p>
                        </div>
                    </div>
                    <div className='flex items-start justify-between -ml-1'>
                        <h1 className="font-['Martel_Sans'] text-[2.625rem] leading-[2.125rem] md:text-[3.28125rem] md:leading-[2.65625rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] font-semibold tracking-[-1.5px] text-[#F6F3EE]">
                            {data.title}
                        </h1>
                        <div className="flex-col justify-evenly items-end mr-1 h-full">
                            <ArrowDown
                                className="text-primary-12 h-fit ml-1"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {hasAnimatedVideo ? (
                <video
                    ref={mediaRef}
                    src={`/${animatedVideo}`}
                    poster={`/${backgroundImage}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="mt-0 md:mt-6 lg:mt-12 w-full flex-1 max-h-screen bg-neutral-1 rounded-3xl border border-[rgba(105,49,29,1)] object-cover object-center"
                />
            ) : (
                <img
                    ref={mediaRef}
                    src={backgroundImage}
                    alt={getTextFromChildren(data.title)}
                    className="mt-0 md:mt-6 lg:mt-12 w-full flex-1 max-h-screen bg-neutral-1 rounded-3xl border border-[rgba(105,49,29,1)] object-cover object-center"
                />
            )}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--color-primary-2)] to-transparent z-10" />
        </div>
    );
}

// linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8)
