import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Arrow from '../Arrow';
import { aboutData } from '../../data/aboutData';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function QuoteSection() {
    const backgroundRef = useRef(null);

    useEffect(() => {
        const element = backgroundRef.current;

        if (element) {
            // Create the scroll trigger animation
            gsap.fromTo(element,
                {
                    scale: 1,
                },
                {
                    scale: 1.2,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1, // Makes animation smooth and tied to scroll position
                    }
                }
            );
        }

        // Cleanup function
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="h-dvh">
            <div className="relative h-full p-4 text-left overflow-hidden">
                
                <div className="flex flex-col justify-center items-center h-full relative z-10">
                    <div className="max-w-md flex flex-col items-center">
                        <div className="h-[100px] bg-primary-12 w-[1px] mb-10" />
                        <div className="flex flex-col items-center w-[319px] p-0 gap-6">
                            <div className="border-l-2 border-primary-10 pl-2">
                                <h3 className="text-primary-12 font-regular text-[24px] leading-[36px] tracking-[0px]">{`"${aboutData.quote.text}"`}</h3>
                            </div>
                            <div className="w-full">
                                <div className="flex flex-col items-start text-primary-11 italic">
                                    <p className="mb-0 pl-2">{aboutData.quote.author}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Arrow
                                width={100}
                                height={17}
                                direction={90}
                                className="text-primary-12 mt-20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
