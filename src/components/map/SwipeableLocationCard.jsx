import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Arrow from "../Arrow";
import { locationData } from "../../data/locationData";
import { LOCATIONS } from './constants';
import { useMapStore } from '../../stores/useMapStore';

gsap.registerPlugin(Draggable);

const SwipeableLocationCard = ({ location, onNavigate }) => {
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const { flyToLocation } = useMapStore();
  
  // Get only locations with showPin: true for the carousel
  const swipeableLocations = LOCATIONS.filter(loc => loc.showPin !== false);
  const currentIndex = swipeableLocations.findIndex(loc => loc.name === location.name);
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    
    if (!container || !card) return;

    let startX = 0;
    let isDragging = false;
    const threshold = 50; // Minimum distance for swipe
    const cardWidth = card.offsetWidth;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      
      // Add some visual feedback
      gsap.to(card, {
        scale: 0.98,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Limit the drag distance
      const maxDrag = cardWidth * 0.8;
      const clampedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaX));
      
      gsap.set(card, {
        x: clampedDelta,
        rotation: clampedDelta * 0.09 // Slight rotation for effect
      });
    };

    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      
      // Reset scale
      gsap.to(card, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
      
      // Determine swipe direction and threshold
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          // Swipe right - go to previous location
          navigateToPrevious();
        } else {
          // Swipe left - go to next location
          navigateToNext();
        }
      } else {
        // Snap back to center
        gsap.to(card, {
          x: 0,
          rotation: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    };

    const navigateToNext = () => {
      const nextIndex = (activeIndex + 1) % swipeableLocations.length;
      animateToLocation(nextIndex, 'left');
    };

    const navigateToPrevious = () => {
      const prevIndex = activeIndex === 0 ? swipeableLocations.length - 1 : activeIndex - 1;
      animateToLocation(prevIndex, 'right');
    };

    const animateToLocation = (newIndex, direction) => {
      const newLocation = swipeableLocations[newIndex];
      const slideDistance = direction === 'left' ? -cardWidth : cardWidth;
      
      // Animate current card out
      gsap.to(card, {
        x: slideDistance,
        rotation: slideDistance * 0.02,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          // Update location
          setActiveIndex(newIndex);
          flyToLocation(newLocation);
          
          // Animate new card in from opposite direction
          gsap.set(card, {
            x: -slideDistance,
            rotation: -slideDistance * 0.02,
            opacity: 0
          });
          
          gsap.to(card, {
            x: 0,
            rotation: 0,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
          });
        }
      });
    };

    // Mouse events for desktop testing
    const handleMouseDown = (e) => {
      startX = e.clientX;
      isDragging = true;
      gsap.to(card, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      const deltaX = currentX - startX;
      
      const maxDrag = cardWidth * 0.3;
      const clampedDelta = Math.max(-maxDrag, Math.min(maxDrag, deltaX));
      
      gsap.set(card, {
        x: clampedDelta,
        rotation: clampedDelta * 0.02
      });
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.clientX;
      const deltaX = endX - startX;
      
      gsap.to(card, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          navigateToPrevious();
        } else {
          navigateToNext();
        }
      } else {
        gsap.to(card, {
          x: 0,
          rotation: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    };

    // Touch events
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
    
    // Mouse events for desktop
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeIndex, swipeableLocations, flyToLocation]);

  // Update activeIndex when location prop changes
  useEffect(() => {
    const newIndex = swipeableLocations.findIndex(loc => loc.name === location.name);
    if (newIndex !== -1 && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [location.name, swipeableLocations, activeIndex]);

  const currentLocation = swipeableLocations[activeIndex] || location;
  const locationKey = currentLocation.path.slice(1);
  const { title, cardTitle, backgroundImage } = locationData[locationKey] || {};

  const [firstLine, secondLine] = cardTitle === "Holeur's Fashionable Bakery" 
    ? ["Holeur's", "Fashionable Bakery"]
    : [cardTitle, ''];

  const handleViewDetails = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div ref={containerRef} className='fixed bottom-0 left-0 right-0 z-10 select-none'>
      <div className='p-6'>
        <div 
          ref={cardRef}
          className='h-32 w-full bg-primary-2 border-2 border-primary-3 text-white flex rounded-xl cursor-pointer'
          onClick={handleViewDetails}
        >
          <div className='w-1/3 h-full'>
            <div className='w-full h-full'>
              {backgroundImage && (
                <img 
                  src={backgroundImage} 
                  alt={title} 
                  className="w-full h-full object-cover rounded-l-xl border-r-1 border-r-[rgba(105,49,29,1)]" 
                />
              )}
            </div>
          </div>
          <div className='w-2/3 h-full p-3 flex flex-col justify-between'>
            <div className='flex flex-row justify-between items-center'>
              <p className='uppercase text-xs font-normal font-poppins text-primary-11 leading-none'>Chapter</p>
              <div className='rounded-full w-[16px] h-[16px] flex justify-center items-center px-[6px] aspect-square bg-primary-10'>
                <p className='text-[10px] font-medium font-poppins text-primary-12 leading-none mt-0.5'>
                  {activeIndex + 1}
                </p>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col text-[18px] font-semibold font-["Martel_Sans"] text-primary-12 text-left leading-tight'>
                <p>{firstLine}</p>
                {secondLine && <p>{secondLine}</p>}
              </div>
              <div className='flex flex-row items-center'>
                <Arrow length={200} direction={0} className='-mb-2 text-primary-12' strokeWidth={2} triangleSize={10} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress dots below the card */}
        <div className='flex justify-center mt-4'>
          <div className='flex gap-2'>
            {swipeableLocations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-primary-10' : 'bg-primary-6'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableLocationCard; 