import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTransitionStore } from '../stores/useTransitionStore';

export const TransitionOverlay = () => {
    const overlayRef = useRef(null);
    const textRef = useRef(null);
    const textContentRef = useRef(null);

    // Animation method: slides in from bottom, holds, then slides out to top
    // callback: function to execute during hold phase
    // customText: optional single line text to display (if null, shows "Charles\nNalle")
    const animate = (callback, customText = null) => {
        if (!overlayRef.current || !textRef.current || !textContentRef.current) return;

        const overlay = overlayRef.current;
        const text = textRef.current;
        const textContent = textContentRef.current;

        // Update text content if custom text provided
        if (customText) {
            textContent.innerHTML = `<p class="text-[54px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none text-center">${customText}</p>`;
        } else {
            // Reset to default "Charles Nalle" layout
            textContent.innerHTML = `
                <p class="text-[54px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none">Charles</p>
                <p class="text-[54px] text-neutral-12 self-end font-semibold tracking-[-2.5px] uppercase leading-none -mt-3">Nalle</p>
            `;
        }

        // Enable pointer events to block interactions
        overlay.style.pointerEvents = 'auto';

        // Initial states
        gsap.set(overlay, {
            y: '100%'
        });
        gsap.set(text, {
            opacity: 0
        });

        // Create animation timeline
        const tl = gsap.timeline();

        // 1. Slide UP from bottom to cover screen
        tl.to(overlay, {
            y: '0%',
            duration: 0.6,
            ease: 'circ.inOut'
        })
            // Fade in text as overlay reaches center
            .to(text, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            }, '-=0.3')
            // 2. Hold for 1 second (showing the text)
            .to(overlay, {
                y: '0%',
                duration: 1.0,
                onStart: () => {
                    // Execute navigation callback during the hold
                    if (callback) callback();
                }
            })
            // 3. Simultaneously: Fade out text AND slide overlay UP to reveal page
            .to(text, {
                opacity: 0,
                duration: 0.1,
                ease: 'power2.in'
            })
            .to(overlay, {
                y: '-100%',
                duration: 0.6,
                ease: 'circ.out',
                onComplete: () => {
                    // Reset and disable pointer events
                    overlay.style.pointerEvents = 'none';
                    gsap.set(overlay, { y: '100%' });
                }
            }, '<'); // '<' means start at the same time as previous animation
    };

    // Register the overlay and its animate method with the store
    useEffect(() => {
        const setOverlayRef = useTransitionStore.getState().setOverlayRef;
        setOverlayRef({ element: overlayRef.current, animate });
    }, []);

    return (
        <>
            {/* Background overlay that slides */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-[9999] pointer-events-none"
                style={{
                    transform: 'translateY(100%)',
                    backgroundColor: '#100A06', // Dark color matching your app theme
                }}
            />

            {/* Text that stays centered and fades in/out */}
            <div
                ref={textRef}
                className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center"
                style={{
                    opacity: 0
                }}
            >
                <div ref={textContentRef} className="flex flex-col">
                    <p className="text-[54px] text-neutral-12 font-semibold tracking-[-2.5px] uppercase leading-none">
                        Charles
                    </p>
                    <p className="text-[54px] text-neutral-12 self-end font-semibold tracking-[-2.5px] uppercase leading-none -mt-3">
                        Nalle
                    </p>
                </div>
            </div>
        </>
    );
};

