import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ArrowDown from '../ArrowDown';
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
                <div className="flex flex-col justify-center items-center h-full relative z-10 min-h-0">
                    <div className="flex flex-col items-center justify-center flex-1 min-h-0 py-4 max-w-lg w-full">
                        <div className="h-[100px] bg-primary-12 w-[1px] mb-10" />
                        <div className="flex flex-col items-center p-0 gap-4">
                            <div className="border-l-2 border-primary-10 pl-2">
                                <h3 className="text-primary-12 font-regular text-[22px] leading-[32px] tracking-[0px]">{`"${aboutData.quote.text}"`}</h3>
                            </div>

                            <div className="w-full">
                                <div className="flex items-start text-primary-11 leading-[1] italic">
                                    <div className="-mr-1.5 my-6 w-[7px] h-[1px] bg-primary-11"></div>
                                    <p className="mb-0 pl-2 leading-[17.5px] text-[14px]">Scott Christianson<br />Freeing Charles: The Struggle to Free a<br /> Slave on the Eve of the Civil War, p.151</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <ArrowDown
                                className="text-primary-12 w-full h-'auto'"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
