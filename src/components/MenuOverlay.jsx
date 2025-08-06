import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTransition } from '../stores/useTransitionStore';
import gsap from 'gsap';

export const OpenMenu = ({ locations = [], position = 'bottom-right', onClose }) => {
    const menuRef = useRef(null);

    // Map location names to their original labels in the UI
    const locationLabels = {
        'Bakery': '1. Bakery',
        'Bank': '2. Bank',
        'Commissioner Part 2': '3. Commissioner Part 2',
        'Mansion': '4. Mansion',
        'Ferry': '5. Ferry',
        "Barbershop": '6. Barbershop'
    };

    const navigate = useNavigate();
    const { play } = useTransition();

    // Animate in when component mounts
    useEffect(() => {
        if (menuRef.current) {
            gsap.fromTo(menuRef.current, {
                scale: 0.8,
                opacity: 0,
                transformOrigin: position === 'bottom-right' ? 'bottom right' : 'top right'
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: 'back.out(1.7)'
            });
        }
    }, [position]);

    // Handle close with animation
    const handleClose = () => {
        if (menuRef.current) {
            gsap.to(menuRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                transformOrigin: position === 'bottom-right' ? 'bottom right' : 'top right',
                onComplete: () => onClose()
            });
        } else {
            onClose();
        }
    };

    // Navigate to home with transition
    const goToHome = () => {
        handleClose();
        play(() => {
            navigate('/');
        });
    };

    // Handle navigation to location page with transition
    const navigateToLocation = (location) => {
        if (location && location.path) {
            handleClose();
            play(() => {
                navigate(location.path);
            });
        }
    };

    // Position classes
    const positionClasses = {
        'top-right': 'top-3 right-3',
        'bottom-right': 'bottom-3 right-3'
    };

    return (
        <div ref={menuRef} className={`fixed ${positionClasses[position] || 'top-3 right-3'} z-10`}>
            <div className="bg-[#341A11] border-2 border-[#69311D] rounded-xl">
                <button
                    onClick={handleClose}
                    className='bg-[#341A11] rounded-t-xl border-b-2 border-[#69311D] h-auto flex items-center justify-center py-6 w-full hover:bg-[#5A2B1A] transition-colors'
                >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 1L1 21M1 1L21 21" stroke="#F26835" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className='h-auto space-y-2 text-[#FF9770] flex flex-col items-start p-8'>
                    <div className='text-left gap-6 flex flex-col w-full ml-5'>
                        <button
                            className='text-lg hover:text-[#F26835] transition-colors text-left'
                            onClick={goToHome}
                        >
                            Home
                        </button>
                        <div className='flex flex-col gap-6 ml-3'>
                            {locations.map((location) => (
                                <div key={location.name} className="flex flex-col">
                                    <button
                                        className='text-lg text-left hover:text-[#F26835] transition-colors'
                                        onClick={() => navigateToLocation(location)}
                                    >
                                        {locationLabels[location.name] || `${location.name}`}
                                    </button>
                                </div>
                            ))}
                            <p className='text-lg -ml-3'>About</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuOverlay = ({ locations = [], position = 'top-right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hamburgerRef = useRef(null);
    const barsRef = useRef([]);

    // Position classes
    const positionClasses = {
        'top-right': 'top-3 right-3',
        'bottom-right': 'bottom-3 right-3'
    };

    // Animate hamburger button when it appears
    useEffect(() => {
        if (!isOpen && hamburgerRef.current) {
            gsap.fromTo(hamburgerRef.current, {
                scale: 0.8,
                opacity: 0,
                rotation: -180
            }, {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });

            // Animate the bars with stagger
            gsap.fromTo(barsRef.current, {
                scaleX: 0,
                opacity: 0
            }, {
                scaleX: 1,
                opacity: 1,
                duration: 0.3,
                stagger: 0.1,
                delay: 0.2,
                ease: 'back.out(2)'
            });
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Menu toggle button */}
            {!isOpen && (
                <button onClick={handleToggle}>
                    <div ref={hamburgerRef} className={`fixed ${positionClasses[position] || 'top-3 right-3'} z-[1000]`}>
                        <div className={`bg-primary-3 border-2 border-primary-6 rounded-tl-xl rounded-tr-xl h-[72px] w-[72px] flex items-center justify-center ${
                            position === 'bottom-right' ? 'rounded-br-4xl rounded-bl-xl' : 'rounded-bl-4xl rounded-br-xl'
                        }`}>
                            <div className='flex flex-col gap-2 w-full items-center'>
                                <div
                                    ref={el => barsRef.current[0] = el}
                                    className='bg-primary-10 h-0.5 w-8 rounded-full'
                                />
                                <div
                                    ref={el => barsRef.current[1] = el}
                                    className='bg-primary-10 h-0.5 w-8 rounded-full'
                                />
                                <div
                                    ref={el => barsRef.current[2] = el}
                                    className='bg-primary-10 h-0.5 w-6 rounded-full self-start ml-4.5'
                                />
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Open menu - rendered separately to avoid nested buttons */}
            {isOpen && (
                <div data-menu="open">
                    <OpenMenu
                        locations={locations}
                        position={position}
                        onClose={handleClose}
                    />
                </div>
            )}
        </>
    );
};

export default MenuOverlay; 