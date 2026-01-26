import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '../Button';
import ProgressIndicator from './ProgressIndicator';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function MoralMessageSection({ data, goToNextChapter, goToPrevChapter }) {
    const sectionRef = useRef(null);

    useEffect(() => {
        const scope = sectionRef.current;
        if (!scope) {
            return undefined;
        }

        // Title animation - fade in from below
        const titleElements = scope.querySelectorAll('[data-moral-title]');
        titleElements.forEach((titleElement) => {
            gsap.fromTo(titleElement,
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
                        trigger: titleElement,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Image container - subtle scale animation
        const imageElements = scope.querySelectorAll('[data-moral-image]');
        imageElements.forEach((imageElement) => {
            gsap.fromTo(imageElement,
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
                        trigger: imageElement,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Text content animations with stagger
        const layoutRoots = scope.querySelectorAll('[data-moral-layout]');
        layoutRoots.forEach((layoutRoot) => {
            const numberElement = layoutRoot.querySelector('[data-moral-number]');
            const messageElement = layoutRoot.querySelector('[data-moral-message]');
            const textElements = [numberElement, messageElement].filter(Boolean);

            if (textElements.length === 0) {
                return;
            }

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
                        trigger: numberElement || messageElement,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Call to action section
        const callToActionElements = scope.querySelectorAll('[data-moral-cta]');
        callToActionElements.forEach((callToActionElement) => {
            gsap.fromTo(callToActionElement,
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
                        trigger: callToActionElement,
                        start: "top 80%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Buttons animation - fade in from below
        const buttonElements = scope.querySelectorAll('[data-moral-buttons]');
        buttonElements.forEach((buttonsElement) => {
            gsap.fromTo(buttonsElement,
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
                        trigger: buttonsElement,
                        start: "top 85%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Cleanup function
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="h-full">
            <div ref={sectionRef} className="relative h-full">
                <div className='absolute inset-0 h-full'>
                    <div className='absolute inset-0' style={{ background: "linear-gradient(#1D1411, rgba(16, 10, 6, .95), #1D1411)" }} />
                    <div className='h-full py-0.5'>
                        <img src={data.backgroundImage.moral} alt="Moral Message" className='w-full h-full object-cover' />
                    </div>
                </div>
                <div id="MobileLayout" className="flex md:hidden">
                    <MobileLayout data={data} goToNextChapter={goToNextChapter} goToPrevChapter={goToPrevChapter} />
                </div>
                <div id="DesktopAndTabletLayout" className="hidden md:flex">
                    <DesktopAndTabletLayout data={data} goToNextChapter={goToNextChapter} goToPrevChapter={goToPrevChapter} />
                </div>
            </div>
        </div>
    );
}

function MobileLayout({ data, goToNextChapter, goToPrevChapter }) {
    return (
        <div
            data-moral-layout="mobile"
            className='flex flex-col text-text-primary gap-y-8 md:gap-y-12 relative z-10 pt-8 md:py-4 lg:py-8 max-w-7xl mx-auto px-8'
        >
            <div className="flex justify-start ml-3">
                {/* Extra padding added so header text fills container better. Without padding, overflows container due to larger custom leading / line-height */}
                <h3
                    data-moral-title
                    className='text-[#F6F3EE] text-[2.625rem] leading-[2.125rem] tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] lg:tracking-[-0.14063rem] font-["Martel_Sans"] font-semibold text-left pt-1 lg:pt-0.5 mt-8 md:mt-4 lg:mt-8'
                >
                    {data.moralMessage.title}
                </h3>
            </div>
            <div className='flex justify-end w-full overflow-none'>
                <div
                    data-moral-image
                    className="w-[250px] h-[250px] md:h-[281.25px] md:w-[281.25px] lg:w-[375px] lg:h-[375px] rounded-3xl border-1 border-primary-6 mr-5"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage.moral}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </div>
            <div className='w-full pt-4'>
                <ProgressIndicator data-moral-number className='text-[#F6F3EE] text-start'>
                    {data.moralMessage.number}
                </ProgressIndicator>
            </div>
            <div data-moral-cta className='w-full'>
                <p data-moral-message className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.message}</p>
            </div>
            <div data-moral-cta className='w-full flex flex-col gap-y-4'>
                <h4 className='text-primary-11 text-2xl font-[Poppins] m-0'>{data.moralMessage.callToAction.title}</h4>
                <p className=' text-primary-12 text-lg leading-relaxed m-0'>{data.moralMessage.callToAction.content}</p>
            </div>

            <div data-moral-buttons className='flex flex-row justify-center items-center my-8 md:my-12 gap-5'>
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
    );
}

function DesktopAndTabletLayout({ data, goToNextChapter, goToPrevChapter }) {
    return (
        <div
            data-moral-layout="desktop"
            className='flex flex-col text-text-primary gap-y-8 md:gap-y-12 relative z-10 max-w-7xl mx-auto px-4'
        >
            <div className="flex justify-start ml-3">
                {/* Extra padding added so text fills container better. Without padding, overflows container due to larger custom leading / line-height */}
                <h3
                    data-moral-title
                    className='text-[#F6F3EE] text-[2.625rem] leading-[2.125rem] tracking-[-0.09375rem] md:text-[3.28125rem] md:leading-[2.65625rem] md:tracking-[-0.11719rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] lg:tracking-[-0.14063rem] font-["Martel_Sans"] font-semibold text-left pt-1 lg:pt-0.5'
                >
                    {data.moralMessage.title}
                </h3>
            </div>
            <div className='flex justify-end sm:justify-center w-full overflow-none'>
                <div
                    data-moral-image
                    className="w-[250px] h-[250px] md:h-[281.25px] md:w-[281.25px] lg:w-[375px] lg:h-[375px] rounded-3xl border-1 border-primary-6 mr-5"
                    style={{
                        backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage.moral}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            </div>
            <div className='flex flex-col sm:flex-row w-full px-4'>
                <div className='sm:w-1/2 w-full'>
                    <ProgressIndicator data-moral-number className='text-[#F6F3EE] text-start'>
                        {data.moralMessage.number}
                    </ProgressIndicator>
                </div>
                <div data-moral-cta className='sm:w-1/2 w-full'>
                    <p data-moral-message className='text-primary-12 text-lg leading-relaxed m-0 mb-8'>{data.moralMessage.message}</p>
                    <h4 className='text-primary-11 text-2xl font-[Poppins] m-0 mb-4'>{data.moralMessage.callToAction.title}</h4>
                    <p className='text-primary-12 text-lg leading-relaxed m-0'>{data.moralMessage.callToAction.content}</p>
                </div>
            </div>

            <div data-moral-buttons className='flex flex-row justify-center items-center my-8 md:my-0 gap-5'>
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
            <span className='block h-0'></span>
        </div>
    );
}
