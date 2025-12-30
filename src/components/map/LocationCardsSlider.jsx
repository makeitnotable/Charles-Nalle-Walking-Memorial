import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { useCallback, useRef, useState } from "react";
import { SWIPEABLE_LOCATIONS } from "./constants";
import LocationCard from "./LocationCard";
import { useMapStore } from "../../stores/useMapStore";
import { memo } from "react";

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
      origin: "center",
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: {
          perView: 1.5,
          spacing: 0,
          origin: "center",
        },
      },
      "(min-width: 1024px)": {
        slides: {
          perView: 2.0,
          spacing: 0,
          origin: "center", // Center the active card
        },
        drag: true, // Enable drag on desktop
      },
    },
    mode: "snap",
    initial: initialIndex >= 0 ? initialIndex : 0,
    drag: true, // Enable drag on mobile
    rubberband: false,
    dragSpeed: 1,
    renderMode: "performance",
    defaultAnimation: {
      duration: 400,
      easing: (t) => t,
    },
    created: (s) => {
      s.container.style.willChange = "transform";
      setActiveSlide(s.track.details.rel);
    },
    destroyed: (s) => {
      if (s.container) {
        s.container.style.willChange = "auto";
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
      <div className="flex items-center justify-center gap-4 w-full mx-auto">
        {/* Slider */}
        <div
          ref={sliderRef}
          className="keen-slider location-cards-slider mx-auto"
          role="region"
          aria-label="Location cards slider"
        >
          {SWIPEABLE_LOCATIONS.map((location, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={location.name}
                className={
                  "keen-slider__slide transition-opacity duration-300 ease-out"
                }
              >
                <div
                  className={`duration-300 ease-out origin-bottom ${
                    isActive ? "scale-100" : "scale-85"
                  }`}
                >
                  <MemoizedLocationCard
                    location={location}
                    onNavigate={() => {
                      if (isActive) {
                        onLocationNavigate?.(location.name);
                      } else {
                        instanceRef.current?.moveToIdx(index);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LocationCardsSlider;
