import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { LOCATIONS } from './constants';
import LocationCard from './LocationCard';

const LocationCardsSlider = ({ onLocationNavigate, currentLocation }) => {
  const [sliderRef ] = useKeenSlider({
    slides: {
      perView: 1.1,
      spacing: 12,
      origin: 'center',
    },
    breakpoints: {
      '(min-width: 400px)': {
        slides: {
          perView: 1.1,
          spacing: 10,
          origin: 'center',
        },
      },
    },
    mode: 'snap',
    initial: currentLocation ? LOCATIONS.findIndex(loc => loc.name === currentLocation) : 0,
    // Performance optimizations
    drag: true,
    rubberband: false,
    created: (s) => {
      s.container.style.willChange = 'transform';
    },
    destroyed: (s) => {
      if (s.container) {
        s.container.style.willChange = 'auto';
      }
    },
  });

  return (
    <div className='fixed bottom-0 left-0 right-0 z-10'>
      <div 
        ref={sliderRef} 
        className='keen-slider pb-6 location-cards-slider' 
        style={{ 
          perspective: '1000px',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)', 
        }}
      >
        {LOCATIONS.map((location) => (
          <div 
            key={location.name} 
            className='keen-slider__slide'
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            <LocationCard
              location={location}
              onNavigate={() => onLocationNavigate && onLocationNavigate(location.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationCardsSlider; 