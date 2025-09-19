import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useCallback, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { SWIPEABLE_LOCATIONS } from './constants';
import LocationCard from './LocationCard';
import { useMapStore } from '../../stores/useMapStore';
import { memo } from 'react';
import Arrow from '../Arrow';


const MemoizedLocationCard = memo(LocationCard);

const LocationCardsSlider = ({ onLocationNavigate, currentLocation }) => {
  const { flyToLocation } = useMapStore();
  const timeoutRef = useRef(null);
  const [sliderInstance, setSliderInstance] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // console.log(currentLocation, "yoooo");

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

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (sliderInstance) {
      sliderInstance.prev();
    }
  }, [sliderInstance]);

  const goToNext = useCallback(() => {
    // console.log("goToNext");
    console.log(sliderInstance);
    if (sliderInstance) {
      // console.log("sliderInstance");
      sliderInstance.next();
    }
  }, [sliderInstance]);

  const [sliderRef] = useKeenSlider({
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
          perView: 3,
          spacing: 24,
          origin: 'auto',
        },
      },
    },
    mode: 'snap',
    initial: initialIndex >= 0 ? initialIndex : 0,
    drag: isMobile, // Only enable drag gestures on mobile devices
    rubberband: false,
    dragSpeed: 1,
    renderMode: 'performance', // Optimize rendering
    defaultAnimation: {
      duration: 400,
      easing: (t) => t,
    },
    created: (s) => {
      s.container.style.willChange = 'transform';
      setSliderInstance(s);
      setCurrentSlide(s.track.details.rel);
    },
    destroyed: (s) => {
      if (s.container) {
        s.container.style.willChange = 'auto';
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    animationEnded: (s) => {
      const currentIndex = s.track.details.rel;
      setCurrentSlide(currentIndex);
      const location = SWIPEABLE_LOCATIONS[currentIndex];
      if (location) {
        debouncedMapUpdate(location);
      }
    },
    slideChanged: (s) => {
      console.log("slideChanged");
      console.log("incoming ", s)
      console.log("current slide", s.track.details.rel);
      setCurrentSlide(s.track.details.rel);
    },
  });


  // Check if we're at the first or last slide for button states
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === SWIPEABLE_LOCATIONS.length - 1;
  // console.log(currentSlide);

  // console.log(SWIPEABLE_LOCATIONS)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      <div className="max-w-5xl mx-auto relative flex flex-row justify-between items-center">
        {/* Previous Button - Desktop Only */}
        <button
          onClick={goToPrevious}
          disabled={isFirstSlide}
          className={`
            hidden lg:flex
            w-12 h-12 rounded-full
            bg-white/90 hover:bg-white
            shadow-lg hover:shadow-xl
            items-center justify-center
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-white/90
          `}
          aria-label="Previous location"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-800"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Next Button - Desktop Only */}


        <div
          ref={sliderRef}
          className="keen-slider pb-6 location-cards-slider"
          style={{
            perspective: '1000px',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          role="region"
          aria-label="Location cards slider"
        >
          {SWIPEABLE_LOCATIONS.map((location, index) => (
            <div
              key={location.name}
              className="keen-slider__slide"
              style={{
                backfaceVisibility: 'hidden',
                border: currentSlide === index ? '1px solid red' : 'none',
              }}
            >
              <MemoizedLocationCard
                location={location}
                onNavigate={() => onLocationNavigate?.(location.name)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={goToNext}
          disabled={isLastSlide}
          className={`
            hidden lg:flex
            w-12 h-12 rounded-full
            bg-white/90 hover:bg-white
            shadow-lg hover:shadow-xl
            items-center justify-center
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-white/90
          `}
          aria-label="Next location"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-800"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LocationCardsSlider;