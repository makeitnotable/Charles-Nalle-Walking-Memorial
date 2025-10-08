import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useCallback, useRef, useState } from 'react';
import { SWIPEABLE_LOCATIONS } from './constants';
import LocationCard from './LocationCard';
import { useMapStore } from '../../stores/useMapStore';
import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Memoize LocationCard to prevent unnecessary re-renders
const MemoizedLocationCard = memo(LocationCard);

const LocationCardsSlider = ({ onLocationNavigate, currentLocation }) => {
  const { flyToLocation } = useMapStore();
  const timeoutRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Simplified debounced map update
  const debouncedMapUpdate = useCallback(
    (location) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        flyToLocation(location);
      }, 150);
    },
    [flyToLocation]
  );


  const initialIndex = currentLocation
    ? SWIPEABLE_LOCATIONS.findIndex((loc) => loc.name === currentLocation)
    : 0;

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1.1, 
      spacing: 10,
      origin: 'center',
    },
    breakpoints: {
      '(min-width: 640px)': {
        slides: {
          perView: 1.2,
          spacing: 12,
          origin: 'center',
        },
      },
      '(min-width: 1024px)': {
        slides: {
          perView:2.0, 
          spacing: 20,
          origin: 'center', // Center the active card
        },
        drag: false, // Disable drag on desktop
      },
    },
    mode: 'snap',
    initial: initialIndex >= 0 ? initialIndex : 0,
    drag: true, // Enable drag on mobile
    rubberband: false, 
    dragSpeed: 1,
    renderMode: 'performance',
    defaultAnimation: {
      duration: 400, 
      easing: (t) => t, 
    },
    created: (s) => {
      s.container.style.willChange = 'transform';
      setActiveSlide(s.track.details.rel);
    },
    destroyed: (s) => {
      if (s.container) {
        s.container.style.willChange = 'auto';
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    slideChanged: (s) => {
      setActiveSlide(s.track.details.rel);
    },
    animationEnded: (s) => {
      const currentIndex = s.track.details.rel;
      setActiveSlide(currentIndex);
      const location = SWIPEABLE_LOCATIONS[currentIndex];
      if (location) {
        debouncedMapUpdate(location);
      }
    },
  });


  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 pb-6">
      <div className="flex items-center justify-center gap-4 max-w-5xl mx-auto">
        {/* Previous Arrow - Desktop only */}
        <button
          onClick={() => activeSlide > 0 && instanceRef.current?.prev()}
          className={`hidden lg:flex w-12 h-12 rounded-full bg-primary-2 border border-[#69311D] items-center justify-center transition-all duration-200 shadow-lg ${
            activeSlide === 0 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100 hover:scale-115 cursor-pointer hover:shadow-xl'
          }`}
          aria-label="Previous location"
          disabled={activeSlide === 0}
        >
          <ChevronLeft size={24} className="text-[#69311D]" />
        </button>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="keen-slider location-cards-slider max-w-4xl mx-auto"
          role="region"
          aria-label="Location cards slider"
        >
          {SWIPEABLE_LOCATIONS.map((location, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={location.name}
                className={`keen-slider__slide transition-opacity duration-300 ease-out ${
                  isActive 
                    ? 'opacity-100' 
                    : 'lg:opacity-60'
                }`}
              >
                <div className={`duration-300 ease-out ${
                  isActive ? 'scale-100' : 'lg:scale-85'
                }`}>
                  <MemoizedLocationCard
                    location={location}
                    onNavigate={() => onLocationNavigate?.(location.name)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Arrow - Desktop only */}
        <button
          onClick={() => activeSlide < SWIPEABLE_LOCATIONS.length - 1 && instanceRef.current?.next()}
          className={`hidden lg:flex w-12 h-12 rounded-full bg-primary-2 backdrop-blur-sm border border-[#69311D] items-center justify-center transition-all duration-200 shadow-lg ${
            activeSlide === SWIPEABLE_LOCATIONS.length - 1 
              ? 'opacity-0 pointer-events-none' 
              : 'opacity-100 hover:scale-115 cursor-pointer hover:shadow-xl'
          }`}
          aria-label="Next location"
          disabled={activeSlide === SWIPEABLE_LOCATIONS.length - 1}
        >
          <ChevronRight size={24} className="text-[#69311D]" />
        </button>
      </div>
    </div>
  );
};

export default LocationCardsSlider;