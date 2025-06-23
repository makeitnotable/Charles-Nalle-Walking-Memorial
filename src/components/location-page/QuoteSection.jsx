import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Arrow from '../Arrow';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function QuoteSection({ data }) {
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
            <div className="relative h-full p-4 text-left space-y-8 overflow-hidden">
                <div
                    ref={backgroundRef}
                    className="absolute inset-0 z-0 will-change-transform"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0.8), rgba(16, 10, 6, 0.8)), url('${data.backgroundImage}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
                <div className="flex flex-col justify-center items-center h-full relative z-10">
                    <div className="max-w-md flex flex-col items-center space-y-8">
                        <div className="h-32 bg-primary-12 w-0.5" />
                        <div className="space-y-4">
                            <div className="border-l-2 border-primary-10 pl-2">
                                <h3 className="text-primary-12 text-4xl">{`"${data.quote.text}"`}</h3>
                            </div>
                            <div className="w-full">
                                <p className="text-primary-11">{data.quote.author}</p>
                            </div>
                        </div>
                        <div className="pt-14">
                            <Arrow
                                length={140}
                                direction={90}
                                className="text-primary-12"
                                strokeWidth={2}
                                triangleSize={10}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 