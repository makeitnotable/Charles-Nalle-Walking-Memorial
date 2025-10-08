import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '../Button';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function MoralMessageSection({ data, goToNextChapter, goToPrevChapter }) {
    const titleRef = useRef(null);
    const imageRef = useRef(null);
    const numberRef = useRef(null);
    const messageRef = useRef(null);
    const callToActionRef = useRef(null);
    const buttonsRef = useRef(null);

    useEffect(() => {
        // Title animation - fade in from below
        gsap.fromTo(titleRef.current,
            {
                opacity: 0,
                y: 30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Image container - subtle scale animation
        gsap.fromTo(imageRef.current,
            {
                opacity: 0,
                scale: 0.95,
            },
            {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: imageRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Text content animations with stagger
        const textElements = [numberRef.current, messageRef.current];
        gsap.fromTo(textElements,
            {
                opacity: 0,
                y: 20,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.2,
                scrollTrigger: {
                    trigger: numberRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Call to action section
        gsap.fromTo(callToActionRef.current,
            {
                opacity: 0,
                y: 25,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: callToActionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Buttons animation - fade in from below
        gsap.fromTo(buttonsRef.current,
            {
                opacity: 0,
                y: 30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: buttonsRef.current,
                    start: "top 85%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Cleanup function
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="h-full">
            <div className="relative h-full">


                <div className='absolute inset-0 h-full'>
                    <div className='absolute inset-0' style={{ background: "linear-gradient(#1D1411, rgba(16, 10, 6, .9), #1D1411)" }} />
                    <div className='h-full py-0.5'>
                        <img src={data.backgroundImage.moral} alt="Moral Message" className='w-full h-full object-cover' />
                    </div>
                </div>
                <div className=' text-text-primary space-y-6 relative z-10 m-4'>
                    <div className="flex justify-start ml-3">
                        <p ref={titleRef} className='text-[#F6F3EE] font-["Martel_Sans"] text-[42px] font-semibold leading-[34px] text-left my-5 tracking-[-1.5px] max-w-[300px]'>{data.moralMessage.title}</p>
                    </div>
                    <div className='flex justify-end w-full'>
                        <div ref={imageRef} className="w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] rounded-3xl border-1 border-primary-6 mr-5 mb-5" style={{
                            backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage.moral}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }} />
                    </div>
                    <p ref={numberRef} className=' text-[12px] ml-4 text-[#f6f3ee]'>{data.moralMessage.number}</p>
                    <p ref={messageRef} className=' text-primary-12 ml-4 mr-4 text-lg leading-relaxed'>{data.moralMessage.message}</p>

                    <div ref={callToActionRef} className='space-y-4 m-4'>

                        <p className='text-primary-11 text-2xl font-[Poppins]'>{data.moralMessage.callToAction.title}</p>
                        <p className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.callToAction.content}</p>
                    </div>

                    <div ref={buttonsRef} className='flex flex-row justify-center items-center mt-20 mb-20 gap-5'>
                        {/* Show Back button only if not on first chapter */}
                        {data.chapterNumber > 1 && (
                            <Button onClick={goToPrevChapter} variant='outline'>
                                <div className='flex items-center gap-2'>
                                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.25 13.667L1.25 7.66699L7.25 1.66699" stroke="#FF9770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p>Back</p>
                                </div>
                            </Button>
                        )}
                        {/* Use goToNextChapter - but don't show on final chapter */}
                        {data.nextChapter && data.chapterNumber !== 5 && (
                            <Button onClick={goToNextChapter} variant='filled'>
                                <div className='flex items-center gap-2'>
                                    <p>Next</p>
                                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.5 13.667L7.5 7.66699L1.5 1.66699" stroke="#FF9770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}