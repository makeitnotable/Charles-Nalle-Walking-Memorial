// Helper functions for the Map component
import { MAP_CONFIG, LOCATIONS } from './constants';

/**
 * Creates a marker element for a location
 * @param {string} locationName - The name of the location
 * @param {number} index - The index of the location
 * @param {boolean} isActive - Whether the location is currently active/selected
 * @returns {HTMLDivElement} - The marker DOM element
 */
export const createMarkerElement = (locationName, index, isActive = false) => {
  const markerDiv = document.createElement('div');
  markerDiv.className = 'custom-marker';

  const config = MAP_CONFIG.markerConfig;
  const style = isActive ? config.active : config.inactive;

  // Find the location data to get pin position
  const location = LOCATIONS.find(loc => loc.name === locationName);
  const isPinAbove = location?.pinPosition === 'above';

  // Create the pin and label elements
  const pinElement = `
    <div class="flex flex-col items-center" style="height: ${config.lineHeight}px;">
      ${!isPinAbove ? `
        <div class="w-0.5" style="background: ${style.lineColor}; height: ${config.lineHeight}px;"></div>
        <div class="rounded-full" style="background: ${style.lineColor}; width: ${config.dotSize}px; height: ${config.dotSize}px;"></div>
      ` : `
        <div class="rounded-full" style="background: ${style.lineColor}; width: ${config.dotSize}px; height: ${config.dotSize}px;"></div>
        <div class="w-0.5" style="background: ${style.lineColor}; height: ${config.lineHeight}px;"></div>
      `}
    </div>
  `;

  const labelElement = `
    <div class="flex items-center justify-center font-medium cursor-pointer p-[8px] md:p-[10px] lg:p-3 rounded-[30px]" style="
      background: ${style.backgroundColor};
      color: ${style.textColor};
      border: 1px solid ${style.borderColor};
      font-family: 'Poppins', sans-serif;
    ">
      <div class="flex items-center justify-center rounded-full mr-1.5" style="
        background: ${style.indexBgColor};
        width: ${config.indexSize}px;
        height: ${config.indexSize}px;
      ">
        <p style="color: ${style.indexTextColor};">${index}</p>
      </div>
      <p class="text-[12px] md:text-[15px] lg:text-[18px] leading-[18px] md:leading-[22.5px] lg:leading-[27px]">${locationName}</p>
    </div>
  `;

  markerDiv.innerHTML = `
    <div class="flex flex-col items-center transition-transform duration-300 ease-in-out" style="transform: scale(${style.scale});">
      ${isPinAbove ? pinElement + labelElement : labelElement + pinElement}
    </div>
  `;

  return markerDiv;
};

/**
 * Calculates fly-to animation parameters
 * @param {Array} coordinates - [lng, lat] coordinates
 * @param {number} zoom - Target zoom level
 * @param {number} speed - Animation speed
 * @returns {Object} - Animation parameters object
 */
export const getFlyToParams = (coordinates, zoom = 20, speed = 0.6) => {
  return {
    center: coordinates,
    zoom,
    speed,
    curve: 1.4,
    essential: true
  };
};
