import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useCallback, useRef } from 'react';
import { LOCATIONS } from './constants';
import LocationCard from './LocationCard';
import { useMapStore } from '../../stores/useMapStore';
import { memo } from 'react';

// Memoize LocationCard to prevent unnecessary re-renders
const MemoizedLocationCard = memo(LocationCard);

// Lazy loading plugin for images
const lazyLoadPlugin = (slider) => {
  slider.on('slideChanged', () => {
    const currentIndex = slider.track.details.rel;
    const preloadIndices = [currentIndex - 1, currentIndex, currentIndex + 1];
    preloadIndices.forEach((index) => {
      if (LOCATIONS[index]?.image) {
        const img = new Image();
        img.src = LOCATIONS[index].image; // Preload image
      }
    });
  });
};

const LocationCardsSlider = ({ onLocationNavigate, currentLocation }) => {
  const { flyToLocation } = useMapStore();
  const timeoutRef = useRef(null);

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
    ? LOCATIONS.findIndex((loc) => loc.name === currentLocation)
    : 0;

  const [sliderRef] = useKeenSlider(
    {
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
            origin: 'center',
          },
        },
      },
      mode: 'snap',
      initial: initialIndex >= 0 ? initialIndex : 0,
      drag: true,
      rubberband: false, 
      dragSpeed: 1,
      renderMode: 'performance', // Optimize rendering
      defaultAnimation: {
        duration: 400, 
        easing: (t) => t, 
      },
      created: (s) => {
        s.container.style.willChange = 'transform';
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
        const location = LOCATIONS[currentIndex];
        if (location) {
          debouncedMapUpdate(location);
        }
      },
    },
    [lazyLoadPlugin]
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
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
        {LOCATIONS.map((location) => (
          <div
            key={location.name}
            className="keen-slider__slide"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            <MemoizedLocationCard
              location={location}
              onNavigate={() => onLocationNavigate?.(location.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationCardsSlider;